#!/usr/bin/env python3
"""Static regression harness for ji-hun-git.github.io.

Runs entirely on the files in the working tree. No browser, no network, no
third-party packages -- Python 3.8+ standard library only, because this repo
has no build step and should not grow one.

    python tools/harness/static_checks.py            # human-readable report
    python tools/harness/static_checks.py --json     # machine-readable
    python tools/harness/static_checks.py --strict   # warnings fail too
    python tools/harness/static_checks.py --update-stamps
                                                     # record current asset
                                                     # hashes as the baseline

Exit code is 0 when no ERROR-level findings remain, 1 otherwise. That makes it
usable as a pre-commit hook or a CI gate.

Each check exists because the class of defect it catches already happened once
in this repo, or because the owner asked for it explicitly. The docstring on
each check_* function says which.
"""

from __future__ import annotations

import argparse
import hashlib
import html
import importlib.util
import json
import os
import re
import subprocess
import sys
import xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
CONFIG_PATH = HERE / "harness.config.json"
STAMP_BASELINE = HERE / "asset-stamps.json"

# The console on the author's machine is cp949; box-drawing characters raise
# UnicodeEncodeError there. Force UTF-8 where we can and stay ASCII regardless.
try:  # pragma: no cover - depends on host console
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

ERROR, WARN, INFO = "ERROR", "WARN", "INFO"

TEXT_SUFFIXES = {".html", ".css", ".js", ".mjs", ".json", ".md", ".py", ".svg", ".txt"}
ASSET_SUFFIXES = {
    ".css", ".js", ".mjs", ".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif",
    ".ico", ".woff", ".woff2", ".ttf", ".otf", ".mp4", ".webm", ".pdf", ".json",
}


class Finding:
    __slots__ = ("level", "check", "path", "line", "message", "fix")

    def __init__(self, level, check, path, line, message, fix=""):
        self.level = level
        self.check = check
        self.path = str(path)
        self.line = line
        self.message = message
        self.fix = fix

    def as_dict(self):
        return {
            "level": self.level, "check": self.check, "path": self.path,
            "line": self.line, "message": self.message, "fix": self.fix,
        }


# --------------------------------------------------------------------------
# repo walking
# --------------------------------------------------------------------------

def load_config():
    with CONFIG_PATH.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def tracked_files(cfg):
    """Every file that ships, per .gitignore, with harness internals excluded."""
    ignore = tuple(cfg["ignore_paths"]["prefixes"])
    try:
        out = subprocess.run(
            ["git", "ls-files", "-co", "--exclude-standard"],
            cwd=str(ROOT), capture_output=True, text=True, check=True,
        ).stdout
        names = [n for n in out.splitlines() if n.strip()]
    except Exception:
        names = []
        for p in ROOT.rglob("*"):
            if p.is_file():
                names.append(p.relative_to(ROOT).as_posix())
    result = []
    for n in names:
        n = n.replace("\\", "/")
        if any(n.startswith(pref) for pref in ignore):
            continue
        if (ROOT / n).is_file():
            result.append(n)
    return sorted(result)


def read_text(rel):
    return (ROOT / rel).read_text(encoding="utf-8", errors="replace")


def line_of(text, index):
    return text.count("\n", 0, index) + 1


# --------------------------------------------------------------------------
# HTML parsing
# --------------------------------------------------------------------------

# <meta content="..."> only carries a URL for these few properties. Everything
# else -- og:image:width, og:image:alt, og:title -- is prose or a number, and
# feeding it to the reference resolver produces nonsense findings like
# "reference does not resolve: 1200".
URL_META_PROPS = {
    "og:image", "og:image:url", "og:image:secure_url", "og:url", "og:video",
    "og:audio", "twitter:image", "twitter:image:src", "twitter:player",
}

# A <link> only fetches something at page load for these rel values. rel=canonical
# and rel=alternate are declarations *about* a URL, not requests for it, so
# counting them as third-party asset loads is wrong.
ASSET_RELS = {
    "stylesheet", "preload", "modulepreload", "prefetch", "preconnect",
    "dns-prefetch", "icon", "shortcut", "apple-touch-icon", "manifest",
}


class Collector(HTMLParser):
    """Collects ids, references and aria wiring with source line numbers."""

    REF_ATTRS = ("src", "href", "poster", "data-src", "srcset", "content")

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.ids = []          # (id, line)
        self.refs = []         # (url, line, attr)
        self.aria = []         # (attr, target_id, line)
        self.labels = []       # (for_id, line)
        self.imgs = []         # (attrs dict, line)
        self.headings = []     # (level, line)
        self.stack = []
        self.unclosed = []
        self.void = {
            "area", "base", "br", "col", "embed", "hr", "img", "input", "link",
            "meta", "param", "source", "track", "wbr",
        }

    def handle_starttag(self, tag, attrs):
        line = self.getpos()[0]
        d = dict(attrs)
        if "id" in d and d["id"]:
            self.ids.append((d["id"], line))
        for a in self.REF_ATTRS:
            v = d.get(a)
            if not v:
                continue
            if a == "content":
                prop = (d.get("property") or d.get("name") or "").lower()
                if prop not in URL_META_PROPS:
                    continue
            if a == "srcset":
                for part in v.split(","):
                    u = part.strip().split(" ")[0]
                    if u:
                        self.refs.append((u, line, a))
                continue
            self.refs.append((v, line, a))
        for a in ("aria-labelledby", "aria-describedby", "aria-controls", "aria-owns"):
            if d.get(a):
                for t in d[a].split():
                    self.aria.append((a, t, line))
        if tag == "label" and d.get("for"):
            self.labels.append((d["for"], line))
        if tag == "img":
            self.imgs.append((d, line))
        if tag in ("h1", "h2", "h3", "h4", "h5", "h6"):
            self.headings.append((int(tag[1]), line))
        if tag not in self.void:
            self.stack.append((tag, line))

    def handle_endtag(self, tag):
        for i in range(len(self.stack) - 1, -1, -1):
            if self.stack[i][0] == tag:
                for orphan in self.stack[i + 1:]:
                    self.unclosed.append(orphan)
                del self.stack[i:]
                return


def parse_html(rel):
    c = Collector()
    c.feed(read_text(rel))
    return c


# --------------------------------------------------------------------------
# reference extraction
# --------------------------------------------------------------------------

CSS_URL = re.compile(r"""url\(\s*['"]?([^'")]+)['"]?\s*\)""")
JS_PATH = re.compile(
    r"""['"]((?:\.{1,2}/|/)?(?:[\w.\-/]+)\.(?:css|js|mjs|png|jpe?g|webp|svg|gif|ico|woff2?|ttf|otf|mp4|webm|json))(\?[^'"]*)?['"]"""
)

SKIP_REF = re.compile(r"^\s*(?:https?:|//|data:|mailto:|tel:|javascript:|#|blob:)", re.I)

# Inline <script> blocks can request assets too: index.html's head script adds
# the bookshelf's stylesheet and scripts only while the bookshelf is on. Their
# URLs must still resolve and still count towards the page's ?v= stamp.
INLINE_SCRIPT = re.compile(r"<script\b([^>]*)>(.*?)</script>", re.I | re.S)
DATA_SCRIPT_TYPE = re.compile(r"""type\s*=\s*['"][^'"]*json""", re.I)
LD_JSON_TYPE = re.compile(r"""type\s*=\s*['"]application/ld\+json['"]""", re.I)
SITE_URL_IN_JSON = re.compile(r'"(https?://[^"\s]+)"')

_SITE_HOSTS = []


def localise(url):
    """Rewrite an absolute URL on the site's own origin to a root-relative path.

    og:image and twitter:image must be absolute URLs to work in a link preview,
    so the profile images are only ever referenced as
    https://ji-hun-git.github.io/assets/... . Without this, those files look
    unreferenced and a typo in them is never caught.
    """
    m = re.match(r"^https?://([A-Za-z0-9.\-]+)(/.*)?$", url.strip(), re.I)
    if not m:
        return None
    if m.group(1).lower() not in _SITE_HOSTS:
        return None
    return (m.group(2) or "/")


def extract_refs(rel):
    """Return [(url, line, kind)] of *local* references made by this file."""
    suffix = Path(rel).suffix.lower()
    text = read_text(rel)
    out = []
    if suffix == ".html":
        c = parse_html(rel)
        out.extend((u, ln, a) for u, ln, a in c.refs)
        for m in CSS_URL.finditer(text):
            out.append((m.group(1), line_of(text, m.start()), "css-url"))
        for block in INLINE_SCRIPT.finditer(text):
            attrs = block.group(1)
            if LD_JSON_TYPE.search(attrs):
                # Structured data names the site's own files too (the Person
                # image); they must exist like any other reference.
                for m in SITE_URL_IN_JSON.finditer(block.group(2)):
                    out.append((m.group(1), line_of(text, block.start(2) + m.start()), "json-ld"))
                continue
            if re.search(r"\bsrc\s*=", attrs, re.I) or DATA_SCRIPT_TYPE.search(attrs):
                continue
            for m in JS_PATH.finditer(block.group(2)):
                out.append((m.group(1) + (m.group(2) or ""),
                            line_of(text, block.start(2) + m.start()), "inline-script"))
    elif suffix == ".css":
        for m in CSS_URL.finditer(text):
            out.append((m.group(1), line_of(text, m.start()), "css-url"))
    elif suffix in (".js", ".mjs"):
        for m in JS_PATH.finditer(text):
            # keep the ?v= query -- check_cache_stamps needs it to know which
            # files sit behind a stamp
            out.append((m.group(1) + (m.group(2) or ""), line_of(text, m.start()), "js-string"))
    kept = []
    for u, ln, k in out:
        if not u:
            continue
        if SKIP_REF.match(u):
            local = localise(u)
            if local is None:
                continue
            kept.append((local, ln, k + "/site-absolute"))
            continue
        kept.append((u, ln, k))
    return kept


def resolve_candidates(rel, url):
    """Every path a reference could plausibly mean, most likely first.

    A bare path like `lab/simulations/x.js` inside `lab/experiments.js` is
    ambiguous: relative to the file it means lab/lab/simulations/x.js, relative
    to the site root it means lab/simulations/x.js. Both readings are legal, so
    the reference is only broken when NEITHER exists.
    """
    clean = url.split("?")[0].split("#")[0]
    if not clean:
        return []
    if clean.startswith("/"):
        return [ROOT / clean.lstrip("/")]
    cands = [(ROOT / rel).parent / clean]
    if not clean.startswith("."):
        cands.append(ROOT / clean)
    return cands


def resolve(rel, url):
    """The single best existing path for a reference, else the first candidate."""
    cands = resolve_candidates(rel, url)
    for c in cands:
        if c.exists():
            return c
    return cands[0] if cands else None


# --------------------------------------------------------------------------
# checks
# --------------------------------------------------------------------------

def check_references(files, cfg):
    """Every local src/href/url() resolves to a file that exists.

    Why: README.md records that two logo files "shipped in this repo for months
    while rendering nothing at all". A dangling reference is silent in the
    browser -- no console error for a missing background-image, and a broken
    <img> only shows if you look at that exact spot.
    """
    findings = []
    for rel in files:
        if Path(rel).suffix.lower() not in (".html", ".css", ".js", ".mjs"):
            continue
        for url, line, kind in extract_refs(rel):
            cands = resolve_candidates(rel, url)
            if not cands:
                continue
            if not any(c.exists() for c in cands):
                findings.append(Finding(
                    ERROR, "references", rel, line,
                    "reference does not resolve: %s (via %s)" % (url, kind),
                    "create the file, or remove the reference",
                ))
    return findings


def check_unreferenced_assets(files, cfg):
    """Files under assets/ and lab/assets/ that nothing points at.

    Reported as WARN, never ERROR: project-library.js builds class names by
    interpolation, so a purely static reachability check has known false
    positives. See tools/prune-orphan-css.py for the incident this rule
    inherits its caution from.
    """
    referenced = set()
    for rel in files:
        if Path(rel).suffix.lower() not in (".html", ".css", ".js", ".mjs"):
            continue
        for url, _line, _kind in extract_refs(rel):
            for t in resolve_candidates(rel, url):
                try:
                    referenced.add(t.resolve().relative_to(ROOT).as_posix())
                except Exception:
                    pass
    expected = cfg.get("expected_unreferenced", {}).get("paths", {})
    findings = []
    for rel in files:
        p = Path(rel)
        if not (rel.startswith("assets/") or rel.startswith("lab/assets/")):
            continue
        if p.suffix.lower() not in ASSET_SUFFIXES:
            continue
        if rel in expected:
            continue
        if rel not in referenced:
            findings.append(Finding(
                WARN, "unreferenced-assets", rel, 0,
                "no HTML/CSS/JS in the tree references this file",
                "confirm it is genuinely dead before deleting -- names can be built at runtime",
            ))
    return findings


def check_ids_and_anchors(files, cfg):
    """No duplicate id, and every #anchor / aria target exists.

    Why: a duplicate id makes getElementById and every aria pointer resolve to
    whichever copy is first in the document, which is a bug that only shows up
    in one of the four view states this site has (library/cv x en/ko).
    """
    findings = []
    for rel in files:
        if Path(rel).suffix.lower() != ".html":
            continue
        c = parse_html(rel)
        seen = {}
        for ident, line in c.ids:
            if ident in seen:
                findings.append(Finding(
                    ERROR, "duplicate-id", rel, line,
                    "id '%s' already defined at line %d" % (ident, seen[ident]),
                    "rename one of them",
                ))
            else:
                seen[ident] = line
        for url, line, _attr in c.refs:
            if url.startswith("#") and len(url) > 1:
                if url[1:] not in seen:
                    findings.append(Finding(
                        ERROR, "dangling-anchor", rel, line,
                        "href='%s' has no matching id" % url,
                        "point it at a real id, or drop the link",
                    ))
        for attr, target, line in c.aria:
            if target not in seen:
                findings.append(Finding(
                    ERROR, "dangling-aria", rel, line,
                    "%s='%s' points at an id that does not exist" % (attr, target),
                    "assistive tech silently gets no name here -- fix the id",
                ))
        for target, line in c.labels:
            if target not in seen:
                findings.append(Finding(
                    ERROR, "dangling-label", rel, line,
                    "label for='%s' has no matching control" % target, "",
                ))
        for tag, line in c.unclosed:
            findings.append(Finding(
                WARN, "unclosed-tag", rel, line,
                "<%s> opened here is never closed" % tag,
                "browsers repair this differently from each other",
            ))
    return findings


def check_images(files, cfg):
    """Images carry alt text, and below-the-fold ones are lazy."""
    findings = []
    for rel in files:
        if Path(rel).suffix.lower() != ".html":
            continue
        c = parse_html(rel)
        for attrs, line in c.imgs:
            src = attrs.get("src", "(no src)")
            if "alt" not in attrs:
                findings.append(Finding(
                    ERROR, "img-alt", rel, line,
                    "<img src='%s'> has no alt attribute" % src,
                    "add alt='' if decorative, or real text if it carries meaning",
                ))
                continue
            alt = attrs["alt"].strip()
            stem = Path(src).stem.lower()
            base = stem.replace("-", " ").replace("_", " ")
            # Only complain when the filename is MACHINE-ish. A portrait named
            # jihun-chae.jpg with alt="Jihun Chae" is correct, not lazy -- the
            # subject's name is exactly what a screen reader should announce.
            machine_ish = bool(re.search(
                r"(?:^|[-_ ])(?:img|image|photo|pic|screenshot|shot|dsc|untitled|copy|final|\d{3,})(?:$|[-_ ])",
                stem))
            if alt and alt.lower().replace("-", " ").replace("_", " ") == base and machine_ish:
                findings.append(Finding(
                    WARN, "img-alt", rel, line,
                    "alt text '%s' just repeats a machine-generated filename" % alt,
                    "describe the image, or use alt='' if a text label sits next to it",
                ))
    return findings


def check_heading_order(files, cfg):
    """Heading levels do not skip (h1 -> h3), which breaks document outline."""
    findings = []
    for rel in files:
        if Path(rel).suffix.lower() != ".html":
            continue
        c = parse_html(rel)
        prev = 0
        for level, line in c.headings:
            if prev and level > prev + 1:
                findings.append(Finding(
                    WARN, "heading-order", rel, line,
                    "h%d follows h%d -- a level is skipped" % (level, prev),
                    "screen-reader users navigate by this outline",
                ))
            prev = level
    return findings


def check_external_origins(files, cfg):
    """Every external origin is on the allowlist, split by asset vs link.

    Why: the owner asked for "no real trackable data". An origin in the assets
    list receives every visitor's IP on every page load without the visitor
    doing anything. index.html removed Google Fonts in Aug 2026 for exactly
    this reason -- this check makes that decision permanent instead of a
    comment someone will paste over.
    """
    allowed_assets = set(cfg["external_origins"]["assets"])
    allowed_links = set(cfg["external_origins"]["links"])
    findings = []
    origin_re = re.compile(r"https?://([A-Za-z0-9.\-]+)")
    for rel in files:
        if Path(rel).suffix.lower() not in (".html", ".css", ".js", ".mjs"):
            continue
        text = read_text(rel)
        site_hosts = set(_SITE_HOSTS)

        # An ASSET origin is one the browser contacts during page load, with no
        # click: <script src>, <link rel=stylesheet|preload|preconnect|icon|...>,
        # @import, and url(). rel=canonical / rel=alternate / rel=me are
        # declarations ABOUT a URL and fetch nothing.
        asset_urls = []  # (url, offset)
        tag_re = re.compile(r"<(link|script)\b([^>]*)>", re.I)
        attr_re = re.compile(r"""([\w:-]+)\s*=\s*['"]([^'"]*)['"]""")
        for m in tag_re.finditer(text):
            tag = m.group(1).lower()
            attrs = {k.lower(): v for k, v in attr_re.findall(m.group(2))}
            url = attrs.get("href") if tag == "link" else attrs.get("src")
            if not url or not url.lower().startswith(("http://", "https://")):
                continue
            if tag == "link":
                rels = set((attrs.get("rel") or "").lower().split())
                if not (rels & ASSET_RELS):
                    continue
            asset_urls.append((url, m.start()))
        for m in re.finditer(r"""@import\s+(?:url\()?\s*['"](https?://[^'"]+)""", text, re.I):
            asset_urls.append((m.group(1), m.start()))
        for m in CSS_URL.finditer(text):
            if m.group(1).lower().startswith(("http://", "https://")):
                asset_urls.append((m.group(1), m.start()))

        flagged_assets = set()
        for url, offset in asset_urls:
            host = origin_re.match(url).group(1)
            if host in site_hosts:
                continue
            if host not in allowed_assets:
                flagged_assets.add(host)
                findings.append(Finding(
                    ERROR, "external-origin", rel, line_of(text, offset),
                    "loads an asset from '%s', which is not an allowed asset origin" % host,
                    "self-host it, move it to an already-used origin, or add it to "
                    "harness.config.json external_origins.assets and accept that this "
                    "origin sees every visitor's IP on every page load",
                ))
        for m in origin_re.finditer(text):
            host = m.group(1)
            if host in allowed_assets or host in allowed_links or host in site_hosts:
                continue
            if host in flagged_assets:
                continue  # already reported, at ERROR level, just above
            findings.append(Finding(
                WARN, "external-origin", rel, line_of(text, m.start()),
                "references unlisted external origin '%s'" % host,
                "add it to external_origins.links if it is a click destination",
            ))
    return findings


def check_trackers(files, cfg):
    """No analytics, telemetry or advertising beacon anywhere in the tree."""
    pats = cfg["tracker_signatures"]["patterns"]
    findings = []
    for rel in files:
        if Path(rel).suffix.lower() not in TEXT_SUFFIXES:
            continue
        text = read_text(rel)
        low = text.lower()
        for pat in pats:
            idx = low.find(pat.lower())
            if idx != -1:
                findings.append(Finding(
                    ERROR, "tracker", rel, line_of(text, idx),
                    "tracker signature '%s' present" % pat,
                    "this site does not analytics-track its visitors -- remove it",
                ))
    return findings


PII_PATTERNS = [
    ("korean-rrn", re.compile(r"\b\d{6}\s*-\s*[1-4]\d{6}\b"),
     "looks like a Korean resident registration number"),
    ("phone-kr", re.compile(r"\b(?:\+?82[-.\s]?)?01[016789][-.\s]\d{3,4}[-.\s]\d{4}\b"),
     "looks like a Korean mobile number"),
    ("phone-intl", re.compile(r"\+\d{1,3}[-.\s]\d{2,4}[-.\s]\d{3,4}[-.\s]\d{3,4}\b"),
     "looks like an international phone number"),
    ("local-path-win", re.compile(r"[A-Za-z]:\\\\?Users\\\\?[A-Za-z0-9._-]+"),
     "hardcodes a Windows user directory"),
    ("local-path-nix", re.compile(r"/(?:home|Users)/[a-z][a-z0-9._-]{2,}/"),
     "hardcodes a home directory"),
    ("secret-openai", re.compile(r"\bsk-[A-Za-z0-9]{20,}\b"), "looks like an OpenAI API key"),
    ("secret-github", re.compile(r"\bgh[pousr]_[A-Za-z0-9]{30,}\b"), "looks like a GitHub token"),
    ("secret-aws", re.compile(r"\bAKIA[0-9A-Z]{16}\b"), "looks like an AWS access key id"),
    ("secret-generic", re.compile(
        r"""(?i)\b(?:api[_-]?key|secret|passwd|password|access[_-]?token)\s*[:=]\s*['"][^'"\s]{12,}['"]"""),
     "looks like a hardcoded credential"),
]

EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}\b")


def check_pii(files, cfg):
    """No personal data beyond the professional contact points that belong here.

    Why: the owner's instruction was "this is a public website, remove any
    personal info except obviously the things needed". Name, title, affiliation,
    an institutional email and professional profile links are the "needed"
    set and live in harness.config.json. Everything else is reported.
    """
    allowed = {e.lower() for e in cfg["public_contacts"]["emails"]}
    findings = []
    for rel in files:
        if Path(rel).suffix.lower() not in TEXT_SUFFIXES:
            continue
        text = read_text(rel)
        for m in EMAIL_RE.finditer(text):
            addr = m.group(0)
            if addr.lower() in allowed:
                continue
            if addr.lower().endswith((".png", ".jpg", ".svg", ".webp", ".css", ".js")):
                continue
            findings.append(Finding(
                ERROR, "pii-email", rel, line_of(text, m.start()),
                "email address is not on the public-contact allowlist (value redacted)",
                "remove it, or add it to harness.config.json if it is meant to be public",
            ))
        for name, pat, why in PII_PATTERNS:
            for m in pat.finditer(text):
                findings.append(Finding(
                    ERROR, "pii-" + name, rel, line_of(text, m.start()),
                    "%s (value redacted)" % why,
                    "remove before this reaches a public repository",
                ))
    return findings


def check_image_metadata(files, cfg):
    """Shipped images carry no EXIF identity, GPS or authoring path.

    Why: a phone photo carries GPS coordinates and a camera serial; an export
    from a desktop app carries the author name and the full source path. Both
    survive into a public repo silently.
    """
    markers = [
        (b"GPS", "GPS tag"),
        (b"Artist", "Artist tag"),
        (b"Copyright", "Copyright tag"),
        (b"XMP", "XMP packet"),
        (b"photoshop", "Photoshop metadata"),
        (b"C:\\Users", "Windows user path"),
        (b"/Users/", "macOS user path"),
        (b"exif:", "EXIF block"),
    ]
    findings = []
    for rel in files:
        if Path(rel).suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp", ".gif"):
            continue
        blob = (ROOT / rel).read_bytes()
        head = blob[:200_000]
        for marker, label in markers:
            if marker in head:
                findings.append(Finding(
                    WARN, "image-metadata", rel, 0,
                    "image contains %s" % label,
                    "strip with: python tools/harness/static_checks.py --strip-image-metadata",
                ))
    return findings


TEXTUAL = {".css", ".js", ".mjs", ".json", ".html", ".svg", ".md", ".txt"}


def hashable_bytes(path):
    """File bytes with line endings normalised, for a stable content hash.

    This repo has core.autocrlf=true and a working tree that mixes CRLF and LF,
    so the same commit checks out with different bytes on different machines --
    and a baseline keyed on raw bytes then fails on every fresh clone while
    passing for whoever recorded it. Normalising means the stamp check tracks
    what actually changed, which is the content, not how git wrote the newlines.
    Binary assets are hashed as-is.
    """
    blob = path.read_bytes()
    if path.suffix.lower() in TEXTUAL:
        return blob.replace(b"\r\n", b"\n")
    return blob


def stamped_files(cfg):
    """The stamped files named in the config, with glob patterns expanded.

    Scripts count as well as pages: a module that imports a sibling under a
    ?v= query (every simulation imports ./_shared.js that way, site.js and
    library.js import the flyby) serves a stale copy of that sibling until its
    own stamp moves.
    """
    out = []
    for entry in cfg["stamped_files"]["files"]:
        if any(ch in entry for ch in "*?["):
            out += sorted(p.relative_to(ROOT).as_posix() for p in ROOT.glob(entry) if p.is_file())
        else:
            out.append(entry)
    return out


def check_cache_stamps(files, cfg):
    """One ?v= stamp per page, and the stamp moves when the bytes move.

    Why: README.md -- "After editing anything under assets/, bump the ?v= stamp
    in index.html or browsers will keep serving the cached copy." A returning
    visitor with a half-stale cache gets new CSS against old JS, which looks
    like a layout bug that nobody can reproduce.
    """
    findings = []
    stamp_re = re.compile(r"\?v=([A-Za-z0-9._\-]+)")
    baseline = {}
    if STAMP_BASELINE.exists():
        baseline = json.loads(STAMP_BASELINE.read_text(encoding="utf-8"))

    current = {}
    for rel in stamped_files(cfg):
        if not (ROOT / rel).is_file():
            continue
        text = read_text(rel)
        stamps = {}
        for m in stamp_re.finditer(text):
            stamps.setdefault(m.group(1), []).append(line_of(text, m.start()))
        if len(stamps) > 1:
            pretty = ", ".join(
                "%s (x%d, first at line %d)" % (s, len(ls), ls[0])
                for s, ls in sorted(stamps.items(), key=lambda kv: -len(kv[1]))
            )
            findings.append(Finding(
                WARN, "cache-stamp", rel, min(min(ls) for ls in stamps.values()),
                "page uses %d different ?v= stamps: %s" % (len(stamps), pretty),
                "use one stamp per page so a single bump invalidates everything together",
            ))
        if not stamps:
            continue
        # hash the bytes actually behind the stamped links
        h = hashlib.sha256()
        stamped_targets = []
        for url, _line, _kind in extract_refs(rel):
            if "?v=" not in url:
                continue
            t = resolve(rel, url)
            if t is not None and t.is_file():
                stamped_targets.append(t)
        for t in sorted(set(stamped_targets), key=lambda p: p.as_posix()):
            h.update(hashable_bytes(t))
        digest = h.hexdigest()[:16]
        dominant = max(stamps.items(), key=lambda kv: len(kv[1]))[0]
        current[rel] = {"stamp": dominant, "sha256": digest, "n_assets": len(set(stamped_targets))}
        prev = baseline.get(rel)
        if prev and prev.get("sha256") != digest and prev.get("stamp") == dominant:
            findings.append(Finding(
                ERROR, "cache-stamp", rel, 1,
                "assets behind ?v=%s changed but the stamp did not" % dominant,
                "bump the stamp in %s, then run --update-stamps" % rel,
            ))
    return findings, current


def check_lab_registry(files, cfg):
    """Every registered simulation has a file, and every file is registered."""
    findings = []
    lab_js = ROOT / "lab" / "lab.js"
    sims_dir = ROOT / "lab" / "simulations"
    if not lab_js.is_file() or not sims_dir.is_dir():
        return findings
    text = lab_js.read_text(encoding="utf-8", errors="replace")
    imported = set()
    for m in re.finditer(r"""(?:from\s+|import\(\s*)['"]\./simulations/([\w.\-]+\.js)""", text):
        imported.add(m.group(1))
    on_disk = {p.name for p in sims_dir.glob("*.js")}
    for name in sorted(imported - on_disk):
        findings.append(Finding(
            ERROR, "lab-registry", "lab/lab.js", 0,
            "imports ./simulations/%s which does not exist" % name,
            "the whole module graph fails to load, so the lab page renders empty",
        ))
    for name in sorted(on_disk - imported):
        if name.startswith("_"):
            continue  # _shared.js and friends are imported by siblings
        findings.append(Finding(
            WARN, "lab-registry", "lab/simulations/" + name, 0,
            "simulation file is never imported by lab/lab.js",
            "wire it up, or delete it",
        ))
    return findings


def check_publication_roles(files, cfg):
    """Every publication row states the author's position, or none do.

    Why: 16 of 21 rows carried a role label and 5 did not -- and the 5 gaps were
    exactly the 5 papers where the author is listed fourth. A partially applied
    label reads as concealment rather than omission, which is the opposite of
    what the rest of this page is scrupulous about.
    """
    findings = []
    index = ROOT / "index.html"
    if not index.is_file():
        return cannot_run("publication-roles", "index.html")
    text = index.read_text(encoding="utf-8", errors="replace")
    # Formatting may insert whitespace between or within text nodes.
    text = re.sub(r'\s+', ' ', text)
    # The citation paragraphs carry lang="en-US" (they are English on both pages).
    row_start = r'<p class="item-desc"(?: lang="[^"]*")?>'
    # "</span >": a formatter may break the closing tag before its ">".
    rows = [m for m in re.finditer(row_start + r'\s*<span class="pub-n">(\d+)</span\s*>', text)]
    publications = len(re.findall(r'class="pub-n"', text))
    if len(rows) != publications:
        findings.append(Finding(
            ERROR, "publication-roles", "index.html", 0,
            "found %d citation rows for %d numbered publications" % (len(rows), publications),
            "keep each citation as <p class=\"item-desc\" lang=\"en-US\"><span class=\"pub-n\">",
        ))
    for m in rows:
        end = text.find("</p>", m.end())
        row = text[m.start():end if end != -1 else m.end() + 2000]
        n = row.count('class="pub-role"')
        if n != 1:
            findings.append(Finding(
                ERROR, "publication-roles", "index.html", line_of(text, m.start()),
                "publication #%s carries %d author-role labels, expected exactly 1" % (m.group(1), n),
                "the other rows all state First/Second/Fourth/Sole author",
            ))

    corrected_roles = {
        "Prompting-based LLM framework for ethical decision-making":
            ("(Co-first author)", "(공동 제1저자)"),
        "GAIA: A game AI assistant service framework":
            ("(Co-first author)", "(공동 제1저자)"),
        "A technical literature review of distributed management structure":
            ("(Corresponding author)", "(교신저자)"),
    }
    for title, expected in corrected_roles.items():
        idx = text.find(title)
        if idx == -1:
            findings.append(Finding(
                ERROR, "publication-roles", "index.html", 0,
                "corrected publication is missing: %s" % title,
                "restore the CV row and its verified authorship role",
            ))
            continue
        starts = list(re.finditer(row_start, text[:idx]))
        begin = starts[-1].start() if starts else 0
        row_end = text.find("</p>", idx)
        row = text[begin:row_end if row_end != -1 else idx + 2000]
        if not all(role in row for role in expected):
            findings.append(Finding(
                ERROR, "publication-roles", "index.html", line_of(text, idx),
                "%s has the wrong role label" % title,
                "use %s / %s" % expected,
            ))
    return findings


WORK_JS = "assets/project-library/work.js"
JS_STRING = r'"(?:[^"\\]|\\.)*"'
EN_KO_PAIR = re.compile(r'\ben:\s*(%s),\s*ko:\s*(%s)' % (JS_STRING, JS_STRING), re.S)


def cannot_run(check, rel):
    """A check whose input is gone must fail, not pass having tested nothing."""
    return [Finding(ERROR, check, rel, 0, "check cannot run: %s is missing" % rel,
                    "restore the file, or retire the check together with it")]


def check_bilingual_pairs(files, cfg):
    """Every {en, ko} pair in the bookshelf's content has real text on both sides.

    Why: the whole site is two languages toggled by CSS `display`. An empty half
    is invisible in the language you author in and a blank gap in the other one,
    which is exactly the kind of defect nobody notices until a Korean reader
    does. The bookshelf's content lives in work.js as { en: "...", ko: "..." }
    objects (it once lived in work-content.js and work-designs.js as p() calls).
    """
    if not (ROOT / WORK_JS).is_file():
        return cannot_run("bilingual-pairs", WORK_JS)
    findings = []
    text = read_text(WORK_JS)
    pairs = list(EN_KO_PAIR.finditer(text))
    en_keys = len(re.findall(r'\ben:\s*"', text))
    ko_keys = len(re.findall(r'\bko:\s*"', text))
    if not pairs or not len(pairs) == en_keys == ko_keys:
        findings.append(Finding(
            ERROR, "bilingual-pairs", WORK_JS, 0,
            "%d English strings, %d Korean strings, %d en/ko pairs; every string needs its twin"
            % (en_keys, ko_keys, len(pairs)),
            "write each text as { en: \"...\", ko: \"...\" }",
        ))
    for m in pairs:
        en, ko = m.group(1)[1:-1].strip(), m.group(2)[1:-1].strip()
        if not en or not ko:
            findings.append(Finding(
                ERROR, "bilingual-pairs", WORK_JS, line_of(text, m.start()),
                "en/ko pair has an empty %s half" % ("English" if not en else "Korean"),
                "one language shows a gap here",
            ))
        elif en == ko and len(en) > 12 and not re.match(r"^[\x00-\x7f]+$", en):
            findings.append(Finding(
                WARN, "bilingual-pairs", WORK_JS, line_of(text, m.start()),
                "both halves of the en/ko pair are identical: %r" % en[:50],
                "probably an untranslated placeholder",
            ))
    return findings


AWARD_TIERS = {
    "grand prize": "대상", "top excellence award": "최우수상", "excellence award": "우수상", "encouragement prize": "장려상",
    "president's award": "총장상", "top 3": "상위 3", "finalist": "본선",
}


def check_award_consistency(files, cfg):
    """The CV and the library must not name different award tiers.

    Why: this repo shipped a state where the CV headlined a Grand Prize, a top-3
    finish and a President's Award while the library's own "Verified result"
    panel -- one click away, on the default landing view -- explicitly disclaimed
    each of them. The two surfaces are generated from different files, so only a
    cross-file check catches the drift.
    """
    findings = []
    for rel in ("index.html", WORK_JS):
        if not (ROOT / rel).is_file():
            return cannot_run("award-consistency", rel)
    # The library half is the bookshelf's own content, now all in work.js.
    wc = read_text(WORK_JS)
    index_text = read_text("index.html")

    # Public portfolio copy should state the person's role and result directly.
    # Source provenance belongs in private claim notes, not in visitor-facing
    # sentences such as "a professor's CV records the award".
    public_copy = {
        "index.html": index_text,
        WORK_JS: wc,
    }
    attribution_phrases = (
        "professor's cv", "professor cv", "professor young yim doh's",
        "교수 cv", "도영임 교수의",
    )
    for rel, text in public_copy.items():
        lowered = text.lower()
        for phrase in attribution_phrases:
            idx = lowered.find(phrase.lower())
            if idx != -1:
                findings.append(Finding(
                    ERROR, "award-consistency", rel, line_of(text, idx),
                    "public award copy cites an external CV: %r" % phrase,
                    "state the verified result and the owner's role directly; "
                    "keep source provenance outside public-facing copy",
                ))

    # Certificate EC-2026-0001 and the award holder confirm Top Excellence / 최우수상
    # and a first-place result. Guard the exact title against future copy drift.
    edu_window = "education4.0 q"
    if edu_window in index_text.lower():
        for phrase in ("Grand Prize – Education4.0 Q", "Grand Prize - Education4.0 Q",
                       "대상 – Education4.0 Q", "대상 - Education4.0 Q",
                       "Excellence Award – Education4.0 Q", "Excellence Award - Education4.0 Q",
                       "우수상 – Education4.0 Q", "우수상 - Education4.0 Q"):
            idx = index_text.find(phrase)
            if idx != -1:
                findings.append(Finding(
                    ERROR, "award-consistency", "index.html", line_of(index_text, idx),
                    "Education4.0 Q uses an incorrect award tier",
                    "use Top Excellence Award (1st Place) / 최우수상(1위) for certificate EC-2026-0001",
                ))
    # Any surviving language that denies a result outright is worth a look, since
    # the CV asserts one for every award it lists.
    deniers = [
        "does not claim a competition placement",
        "without claiming independently verified placement",
        "does not claim independently verified finalist",
        "no named result currently confirms an individual award",
        "does not claim a personal award result",
    ]
    for phrase in deniers:
        idx = wc.find(phrase)
        if idx != -1:
            findings.append(Finding(
                WARN, "award-consistency", WORK_JS,
                line_of(wc, idx),
                "library still disclaims a result: %r" % phrase,
                "check index.html does not assert that same award; the two "
                "surfaces contradicted each other before 2026-08-20",
            ))
    if "Encouragement Prize" in wc and "President's Award" in index_text:
        idx = wc.find("Encouragement Prize")
        findings.append(Finding(
            WARN, "award-consistency", WORK_JS,
            line_of(wc, idx),
            "library says Encouragement Prize while the CV says President's Award",
            "one of the two is stale",
        ))
    return findings


CV_SECTIONS = ("projects", "awards", "education", "publications", "patents")


def closing_div(text, start):
    """Index just past the </div> that closes the <div ...> opening at `start`."""
    depth = 0
    for m in re.finditer(r"<(/?)div\b[^>]*>", text[start:]):
        depth += -1 if m.group(1) else 1
        if depth == 0:
            return start + m.end()
    return None


def check_cv_sections(files, cfg):
    """The CV opens on its overview, and its five sections fold on the markup they need.

    Why: the owner asked (Oct 2026) for the CV to open on its title and its
    one-line introduction alone, and for the "6 R&D projects / 21
    Publications / 10 Awards and selections" strip to go ("it is not even
    big"). site.js folds each numbered section with the button in its
    heading. That needs, per section, one <button type="button"
    class="section-toggle" aria-controls="<id>-body"> as the content of its
    <h2 class="section-title">, and everything after the heading inside
    <div id="<id>-body">. The page ships every section open
    (aria-expanded="true", no hidden attribute), so readers without scripts,
    crawlers and a printout get the whole CV. (This replaces the check that
    tied the counters to their sections.)
    """
    findings = []
    for page in CV_PAGES:
        if not (ROOT / page).is_file():
            findings += cannot_run("cv-sections", page)
            continue
        text = read_text(page)

        def error(index, message, fix=""):
            findings.append(Finding(ERROR, "cv-sections", page,
                                    line_of(text, index) if index else 0, message, fix))

        strip = re.search(r'class="[^"]*\bcv-index\b', text)
        if strip:
            error(strip.start(), "the overview's counter strip (.cv-index) is back",
                  "the owner removed it: the overview is the title and one line")
        overview = re.search(r'<header class="cv-overview">(.*?)</header>', text, re.S)
        if not overview:
            error(0, 'cannot find the CV overview (<header class="cv-overview">)')
        elif re.search(r"<(?:nav|a|strong)\b", overview.group(1)):
            error(overview.start(), "the CV overview holds links or figures again",
                  "keep it to the eyebrow, the heading and the introduction")
        for sid in CV_SECTIONS:
            opening = re.search(r'<section\b[^>]*\bid="%s"[^>]*>' % sid, text)
            close = text.find("</section>", opening.end()) if opening else -1
            if close < 0:
                error(0, "cannot find section #%s" % sid)
                continue
            at, section = opening.start(), text[opening.start():close]
            toggles = [tag for tag in re.findall(r"<button\b[^>]*>", section)
                       if "section-toggle" in tag_attrs(tag).get("class", "").split()]
            if len(toggles) != 1:
                error(at, "#%s has %d heading buttons, expected one" % (sid, len(toggles)))
                continue
            attrs = tag_attrs(toggles[0])
            for name, want in (("type", "button"), ("aria-controls", sid + "-body"),
                               ("aria-expanded", "true")):
                if attrs.get(name) != want:
                    error(at, "#%s's heading button has %s=%r, expected %r"
                          % (sid, name, attrs.get(name), want),
                          "the page ships open; site.js folds it" if name == "aria-expanded" else "")
            if not re.search(r'<h2 class="section-title">\s*<button\b[^>]*>.*?</button>\s*</h2>',
                             section, re.S):
                error(at, '#%s: the button is not the whole content of its <h2 class="section-title">'
                      % sid, "keep the heading a real h2 around the button")
            body = re.search(r'<div\b[^>]*\bid="%s-body"[^>]*>' % sid, section)
            if not body:
                error(at, '#%s has no <div id="%s-body"> for its button to control' % (sid, sid))
                continue
            if "hidden" in tag_attrs(body.group(0)) or re.search(r"\shidden(?:[\s>=]|$)", body.group(0)):
                error(at + body.start(), "#%s ships folded (a hidden attribute in the HTML)" % sid,
                      "ship it open: readers without scripts and printouts need it; site.js folds it")
            if re.search(r'class="(?:item|items|two-col|filter|pub-summary)[" ]',
                         section[:body.start()]):
                error(at, "#%s has content before its body, where folding cannot reach it" % sid)
            end = closing_div(section, body.start())
            if end is None or section[end:].strip():
                error(at, "#%s has content after its body, where folding cannot reach it" % sid)
    return findings


CLASS_TOGGLE = re.compile(r'classList\.(?:add|toggle|remove)\(\s*["\']([A-Za-z][\w-]*)["\']')


def check_toggled_classes_are_styled(files, cfg):
    """Every class the JS toggles is selected by some stylesheet.

    Why: project-library.js toggles `.pub-group.hidden`, and no rule for it
    existed anywhere -- so filtering the publication list left four year
    headings standing over empty space. A class that nothing styles is a
    behaviour that silently does nothing.
    """
    css_blob = ""
    for rel in files:
        if Path(rel).suffix.lower() in (".css", ".html"):
            css_blob += read_text(rel)  # inline <style> blocks live in the HTML

    # A class can also be consumed by a JS selector rather than a stylesheet --
    # querySelectorAll(".is-local-extracting"), closest(), matches(). That is a
    # real consumer, so don't report it as dead.
    js_selectors = ""
    for rel in files:
        if Path(rel).suffix.lower() in (".js", ".mjs"):
            t = read_text(rel)
            for m in re.finditer(
                    r'(?:querySelectorAll|querySelector|closest|matches)\(\s*["\']([^"\']+)["\']', t):
                js_selectors += m.group(1) + " "

    findings = []
    seen = set()
    for rel in files:
        if Path(rel).suffix.lower() not in (".js", ".mjs"):
            continue
        text = read_text(rel)
        for m in CLASS_TOGGLE.finditer(text):
            cls = m.group(1)
            if cls in seen:
                continue
            seen.add(cls)
            token = "." + cls
            if token in css_blob or token in js_selectors:
                continue
            findings.append(Finding(
                WARN, "toggled-class-unstyled", rel, line_of(text, m.start()),
                "JS toggles class '%s', but no stylesheet or JS selector reads it" % cls,
                "the toggle has no observable effect -- either a rule was lost, "
                "or this is a leftover state flag",
            ))
    return findings


def check_git_identities(cfg):
    """Commit metadata does not publish a personal mailbox.

    Why: the owner asked for "no real trackable data from the git files". Once
    a commit is pushed to a public repo, GitHub serves its author email to
    anyone via <commit-url>.patch and the REST API -- forever, and independently
    of anything the site itself shows.
    """
    findings = []
    allowed = {e.lower() for e in cfg["git_identities"]["allowed_emails"]}
    try:
        out = subprocess.run(
            ["git", "log", "--all", "--format=%ae%n%ce"],
            cwd=str(ROOT), capture_output=True, text=True, check=True,
        ).stdout
    except Exception:
        return findings
    counts = {}
    for line in out.splitlines():
        e = line.strip().lower()
        if e:
            counts[e] = counts.get(e, 0) + 1
    for email, n in sorted(counts.items(), key=lambda kv: -kv[1]):
        if email in allowed:
            continue
        findings.append(Finding(
            WARN, "git-identity", "(git history)", 0,
            "%d commit identity records carry a non-allowlisted address (value redacted)" % n,
            "future commits: git config user.email "
            "'90397147+ji-hun-git@users.noreply.github.com'. Past commits can only "
            "be changed by rewriting history and force-pushing.",
        ))
    return findings


def robots_noindex(text):
    """True when a <meta name="robots"> asks for noindex, attributes in any order."""
    for m in re.finditer(r"<meta\b[^>]*>", text, re.I):
        attrs = {k.lower(): v for k, v in re.findall(r"""([\w:-]+)\s*=\s*["']([^"']*)["']""", m.group(0))}
        if attrs.get("name", "").lower() == "robots" and "noindex" in attrs.get("content", "").lower():
            return True
    return False


def check_meta(files, cfg):
    """Each page has the metadata a link preview and a search result need."""
    findings = []
    required = ["description", "og:title", "og:description", "og:image"]
    for rel in files:
        if Path(rel).suffix.lower() != ".html":
            continue
        text = read_text(rel)
        # A redirect stub has no audience of its own: it is noindex and bounces
        # in 0s, so social-preview metadata on it would never be read.
        if re.search(r"""http-equiv=['"]refresh['"]""", text, re.I) or robots_noindex(text):
            continue
        if "<title" not in text:
            findings.append(Finding(ERROR, "meta", rel, 1, "no <title>", ""))
        for key in required:
            if key.startswith("og:"):
                present = re.search(r"""property=['"]%s['"]""" % re.escape(key), text)
            else:
                present = re.search(r"""name=['"]%s['"]""" % re.escape(key), text)
            if not present:
                findings.append(Finding(
                    WARN, "meta", rel, 1,
                    "missing <meta %s>" % key,
                    "link previews fall back to whatever text is first on the page",
                ))
        if not re.search(r"""rel=['"]canonical['"]""", text):
            findings.append(Finding(
                WARN, "meta", rel, 1, "no rel=canonical",
                "duplicate URLs (?view=cv, trailing slash) compete in search results",
            ))
    return findings


BOOKSHELF_SWITCH = re.compile(r"\bconst BOOKSHELF_ENABLED = (true|false);")
# The CV in each language: index.html is authored, ko.html is generated from it.
CV_PAGES = ("index.html", "ko.html")


def bookshelf_enabled():
    """State of the single bookshelf switch in index.html; None if it is missing."""
    if not (ROOT / "index.html").is_file():
        return None
    found = BOOKSHELF_SWITCH.findall(read_text("index.html"))
    return found[0] == "true" if len(found) == 1 else None


def visible_text(html):
    """Rough reader-visible text of a page: no scripts, styles or tags."""
    html = re.sub(r"<(script|style)\b.*?</\1>", " ", html, flags=re.I | re.S)
    return " ".join(re.sub(r"<[^>]+>", " ", html).split())


def check_bookshelf_switch(files, cfg):
    """The bookshelf has one switch, and while it is off nothing advertises it.

    Why: the owner switched the bookshelf off "for now" (Sep 2026). It must come
    back by flipping BOOKSHELF_ENABLED alone, so its files may only be requested
    by the loader behind that switch: a plain <script src> or stylesheet link
    downloads them for every visitor whatever the switch says. While it is off,
    the site root is the CV, so the sitemap must not list ?view= duplicates of
    it, link previews must not show the bookshelf, and no page may send visitors
    to it.
    """
    findings = []
    if not (ROOT / "index.html").is_file():
        return findings
    index_text = read_text("index.html")
    switches = BOOKSHELF_SWITCH.findall(index_text)
    if len(switches) != 1:
        findings.append(Finding(
            ERROR, "bookshelf-switch", "index.html", 1,
            "expected one 'const BOOKSHELF_ENABLED = true|false;', found %d" % len(switches),
            "keep the bookshelf behind the single switch in the <head> script",
        ))
        return findings
    tag_re = re.compile(r"<(link|script)\b([^>]*)>", re.I)
    for rel in files:
        if Path(rel).suffix.lower() != ".html":
            continue
        text = read_text(rel)
        for m in tag_re.finditer(text):
            if "project-library/" in m.group(2):
                findings.append(Finding(
                    ERROR, "bookshelf-switch", rel, line_of(text, m.start()),
                    "<%s> requests a bookshelf file whatever BOOKSHELF_ENABLED says"
                    % m.group(1).lower(),
                    "let the head script in index.html add it only while the bookshelf is on",
                ))
    if switches[0] == "true":
        return findings

    off = "while BOOKSHELF_ENABLED is false"
    for page in CV_PAGES:
        if not (ROOT / page).is_file():
            continue
        page_text = read_text(page)
        for m in re.finditer(r"<meta\b[^>]*>", page_text, re.I):
            tag = m.group(0)
            if "project-library/" in tag or re.search(r"bookshelf|책장", tag, re.I):
                findings.append(Finding(
                    ERROR, "bookshelf-switch", page, line_of(page_text, m.start()),
                    "a meta tag still presents the bookshelf %s" % off,
                    "describe and preview the CV instead",
                ))
    canonical = re.search(
        r"""<link\b(?=[^>]*rel=['"]canonical['"])[^>]*href=['"]([^'"]+)['"]""", index_text, re.I)
    root_urls = ["https://%s/" % h for h in _SITE_HOSTS]
    if canonical and root_urls and canonical.group(1) not in root_urls:
        findings.append(Finding(
            ERROR, "bookshelf-switch", "index.html", line_of(index_text, canonical.start()),
            "canonical URL is %s; the CV is the site root %s" % (canonical.group(1), off),
            "use %s so ?view=cv and / count as one page" % root_urls[0],
        ))
    sitemap = ROOT / "sitemap.xml"
    if sitemap.is_file():
        text = read_text("sitemap.xml")
        for m in re.finditer(r"<loc>([^<]*)</loc>", text):
            if re.search(r"[?&](?:view|work)=", m.group(1)):
                findings.append(Finding(
                    ERROR, "bookshelf-switch", "sitemap.xml", line_of(text, m.start()),
                    "sitemap lists %s, a duplicate of the site root %s" % (m.group(1), off),
                    "list the root URL only; its canonical covers ?view=cv",
                ))
    for rel in files:
        if Path(rel).suffix.lower() != ".html":
            continue
        text = read_text(rel)
        for m in re.finditer(r"""href=['"]([^'"]*)['"]""", text, re.I):
            if re.search(r"[?&](?:view=library|work=)", m.group(1)):
                findings.append(Finding(
                    ERROR, "bookshelf-switch", rel, line_of(text, m.start()),
                    "links to the bookshelf (%s) %s" % (m.group(1), off),
                    "link to the CV instead",
                ))
        # index.html (and ko.html, generated from it) keeps the bookshelf's own
        # markup for the switch; the browser suite checks none of it is visible.
        if rel not in CV_PAGES and re.search(r"bookshelf|책장", visible_text(text), re.I):
            findings.append(Finding(
                ERROR, "bookshelf-switch", rel, 0,
                "page text still mentions the bookshelf %s" % off,
                "point visitors to the CV",
            ))
    return findings


SIMULATIONS_SWITCH = re.compile(r"\bconst SIMULATIONS_ENABLED = (true|false);")
LAB_PAGE = "laboratory.html"
LAB_LINK = re.compile(r"(?:^|/)laboratory(?:\.html)?(?:[?#]|$)", re.I)
# Any pointer to the Simulations page in a page's source, not only an href:
# JSON-LD (url, relatedLink, sameAs), a meta content (og:see_also), a prefetch
# link. The file name anywhere, a path ending in /laboratory, or a value that
# starts with it. The bare word in prose is not a pointer (a lab's name may
# appear in the CV).
LAB_POINTER = re.compile(
    r"laboratory\.html"
    r"|/laboratory(?=[?#\"'\s)<]|$)"
    r"|[\"'=]\s*(?:\./)?laboratory(?=[?#\"'])",
    re.I | re.M)


def check_simulations_switch(files, cfg):
    """The Simulations page has one switch, and while it is off nothing leads to it.

    Why: the owner asked (Oct 2026) to "remove Simulations tab (disable it for
    now)". Like the bookshelf, it must come back by flipping one switch, so the
    page and lab/ stay in the tree and keep working on a local server (the lab
    suite runs there). While SIMULATIONS_ENABLED is false: no public page or
    site script links to laboratory.html, the sitemap leaves it out, the page
    asks search engines not to index it, and its head script sends visitors on
    the public site to the CV.
    """
    findings = []
    if not (ROOT / LAB_PAGE).is_file():
        return cannot_run("simulations-switch", LAB_PAGE)
    lab = read_text(LAB_PAGE)

    def error(rel, line, message, fix=""):
        findings.append(Finding(ERROR, "simulations-switch", rel, line, message, fix))

    switches = SIMULATIONS_SWITCH.findall(lab)
    if len(switches) != 1:
        error(LAB_PAGE, 1, "expected one 'const SIMULATIONS_ENABLED = true|false;', found %d"
              % len(switches), "keep the page behind the single switch in its <head> script")
        return findings
    if switches[0] == "true":
        return findings
    off = "while SIMULATIONS_ENABLED is false"
    if not robots_noindex(lab):
        error(LAB_PAGE, 1, "the page is not noindex %s" % off,
              'add <meta content="noindex" name="robots" /> to its <head>')
    head = re.search(r"<head\b[^>]*>(.*?)</head>", lab, re.I | re.S)
    if not head or not re.search(r"SIMULATIONS_ENABLED.*?location\.replace\(", head.group(1), re.S):
        error(LAB_PAGE, 1, "the <head> script does not send public visitors to the CV %s" % off,
              "location.replace() the CV unless the host is local")
    pages = {f for f in files if f.endswith(".html")}
    pages |= {p for p in CV_PAGES + ("404.html",) if (ROOT / p).is_file()}
    for rel in sorted(pages - {LAB_PAGE}):
        text = read_text(rel)
        # Comments are blanked (newlines kept, so line numbers hold); every
        # other place in the source counts.
        bare = re.sub(r"<!--.*?-->", lambda c: re.sub(r"[^\n]", " ", c.group(0)), text, flags=re.S)
        for m in LAB_POINTER.finditer(bare):
            line = line_of(text, m.start())
            error(rel, line, "points at the Simulations page %s: %s"
                  % (off, text.splitlines()[line - 1].strip()[:120]),
                  "remove the link or reference; README.md says how to bring it back")
    scripts = {f for f in files if f.startswith("assets/") and f.endswith(".js")}
    scripts |= {"assets/site.js"} if (ROOT / "assets/site.js").is_file() else set()
    for rel in sorted(scripts):
        text = read_text(rel)
        m = LAB_POINTER.search(text)
        if m:
            error(rel, line_of(text, m.start()), "a script still points at laboratory.html %s" % off,
                  "remove it with the header link")
    sitemap = ROOT / "sitemap.xml"
    if sitemap.is_file():
        text = read_text("sitemap.xml")
        for m in re.finditer(r"<loc>([^<]*)</loc>", text):
            if LAB_LINK.search(m.group(1).split("://")[-1]):
                error("sitemap.xml", line_of(text, m.start()),
                      "the sitemap lists %s %s" % (m.group(1), off), "drop its <url> entry")
    return findings


# Type and space come from the tokens in site.css :root (static: here; in the
# browser: run_browser.check_type_and_space). Declarations of these
# properties in the CV's stylesheets may use only tokens, keywords and the
# hairline's 1px inside calc(); the exemptions are optical offsets and
# dimensions, each named in the stylesheet where it stands.
TOKEN_STYLESHEETS = ("assets/site.css", "assets/cv.css")
SPACING_PROPERTY = re.compile(
    r"^(?:(?:margin|padding)(?:-(?:top|right|bottom|left|block|inline)(?:-(?:start|end))?)?"
    r"|gap|row-gap|column-gap|scroll-(?:padding|margin)(?:-(?:top|bottom|block|inline))?)$")
SPACING_TOKEN = re.compile(r"var\(--(?:space-\d+|gutter|card-pad|entry-pad|section-gap)\)")
TYPE_TOKEN = {
    "font-size": re.compile(r"var\(--(?:fs-\d+|t-[a-z]+)\)"),
    "font-weight": re.compile(r"var\(--fw-[a-z]+\)"),
    "line-height": re.compile(r"var\(--(?:lh-[a-z]+|t-[a-z]+)\)"),
}
TOKEN_EXEMPT = {
    ("assets/site.css", "font-weight", "100 900"),  # @font-face: the variable font's range
    ("assets/cv.css", "margin", "15mm"),          # @page: the paper margin
    ("assets/site.css", "margin", "-1px"),        # .pl-sr-only, the visually hidden pattern
    ("assets/cv.css", "margin-top", "-7px"),      # chevron, optical centring
    ("assets/cv.css", "margin-top", "-1px"),      # chevron pointing up, optical
    ("assets/cv.css", "font-size", "6pt"),        # printed monogram in its 16px circle
}


def css_declarations(text):
    """[(property, value, index)] of every declaration outside comments."""
    text = re.sub(r"/\*.*?\*/", lambda m: " " * len(m.group(0)), text, flags=re.S)
    return [(m.group(1).lower(), " ".join(m.group(2).split()), m.start())
            for m in re.finditer(r"(?<![\w-])([a-z-]+)\s*:\s*([^;{}]+);", text)]


def check_css_tokens(files, cfg):
    """Every space, size, weight and leading in the CV's stylesheets is a token.

    Why: the owner asked why "everything look[s] so different" and for the
    "golden rules for spacings" (Oct 2026). The audit found 12 font sizes, 4
    weights, 11 line-heights and 26 spacing values, 16 of them off any 4/8
    scale, each picked one element at a time. One scale in site.css :root
    keeps the same relationship the same everywhere; a literal is how it
    drifts again.
    """
    findings = []
    for rel in TOKEN_STYLESHEETS:
        if not (ROOT / rel).is_file():
            findings += cannot_run("css-tokens", rel)
            continue
        text = read_text(rel)
        for prop, value, at in css_declarations(text):
            if prop.startswith("--") or (rel, prop, value) in TOKEN_EXEMPT:
                continue
            line = line_of(text, at)
            if SPACING_PROPERTY.match(prop):
                rest = SPACING_TOKEN.sub(" ", value)
                rest = re.sub(r"calc\(|[()*+/]|(?<![\w.])-(?=[\s(v]|$)|\s-\s", " ", rest)
                bad = [t for t in rest.split() if t not in ("0", "auto", "inherit", "1", "-1")
                       and not (t == "1px" and "calc(" in value)]
                if bad:
                    findings.append(Finding(
                        ERROR, "css-tokens", rel, line,
                        "%s: %s is off the spacing scale (%s)" % (prop, value, ", ".join(bad)),
                        "use var(--space-N) or a relationship token (--gutter, --card-pad, "
                        "--entry-pad, --section-gap) from site.css :root",
                    ))
            elif prop in TYPE_TOKEN:
                if value == "inherit":
                    continue
                if prop == "line-height" and re.fullmatch(
                        r"calc\(var\(--t-[a-z]+\) \* var\(--lh-[a-z]+\)\)", value):
                    continue
                if not TYPE_TOKEN[prop].fullmatch(value):
                    findings.append(Finding(
                        ERROR, "css-tokens", rel, line,
                        "%s: %s is not a type token" % (prop, value),
                        "use the role tokens in site.css :root (--fs-*, --t-*, --fw-*, --lh-*)",
                    ))
            elif prop == "font" and value != "inherit":
                if not re.fullmatch(r"var\(--fw-[a-z]+\) var\(--(?:fs-\d+|t-[a-z]+)\) / "
                                    r"var\(--lh-[a-z]+\) var\(--sans\)", value):
                    findings.append(Finding(
                        ERROR, "css-tokens", rel, line,
                        "font: %s does not use the type tokens" % value,
                        "write it as var(--fw-*) var(--fs-*|--t-*) / var(--lh-*) var(--sans)",
                    ))
    return findings


def check_cv_record_ids(files, cfg):
    """Every CV record the bookshelf maps carries the id library.js would give it.

    Why: shared links (?work=<slug> and ?view=cv#cv-work-<slug>) land on these
    ids. While the bookshelf is off no script assigns them, so they are written
    into index.html, and library.js keeps them when it is on. If they drift from
    work.js (slug and sourceIndex), a shared link opens the wrong CV entry.
    """
    findings = []
    work_p = ROOT / WORK_JS
    for rel in ("index.html", WORK_JS):
        if not (ROOT / rel).is_file():
            return cannot_run("cv-record-ids", rel)
    index_text = read_text("index.html")
    work = read_text("assets/project-library/work.js")
    starts = list(re.finditer(r"^  (projects|publications|awards): \[$", work, re.M))
    designs = {}
    for pos, m in enumerate(starts):
        end = starts[pos + 1].start() if pos + 1 < len(starts) else len(work)
        block = work[m.end():end]
        pairs = re.findall(r'^      slug: "([^"]+)",\n      sourceIndex: (\d+),$', block, re.M)
        designs[m.group(1)] = {int(i): slug for slug, i in pairs}
    bounds = {
        "projects": (r'id="projects"', r'id="awards"'),
        "awards": (r'id="awards"', r'id="education"'),
        "publications": (r'id="pubItems"', r'id="patents"'),
    }
    for collection, (start_pat, end_pat) in bounds.items():
        start = re.search(start_pat, index_text)
        end = re.search(end_pat, index_text[start.end():]) if start else None
        if not (start and end):
            findings.append(Finding(
                ERROR, "cv-record-ids", "index.html", 0,
                "cannot find the %s section" % collection, "",
            ))
            continue
        offset = start.end()
        segment = index_text[offset:offset + end.start()]
        items = []
        for tag in re.finditer(r"<div\b[^>]*>", segment):
            cls = re.search(r'class="([^"]*)"', tag.group(0))
            if cls and "item" in cls.group(1).split():
                ident = re.search(r'\bid="([^"]*)"', tag.group(0))
                items.append((ident.group(1) if ident else None,
                              line_of(index_text, offset + tag.start())))
        mapped = designs.get(collection, {})
        if len(mapped) != len(items):
            findings.append(Finding(
                ERROR, "cv-record-ids", "assets/project-library/work.js", 0,
                "%s: the CV has %d entries but work.js maps %d" % (collection, len(items), len(mapped)),
                "keep one library design per CV entry, in CV order",
            ))
        for index, (ident, line) in enumerate(items):
            expected = "cv-work-" + mapped[index] if index in mapped else None
            if expected and ident != expected:
                findings.append(Finding(
                    ERROR, "cv-record-ids", "index.html", line,
                    "%s entry %d has id %r; work.js maps it to %r" % (collection, index, ident, expected),
                    "set id=\"%s\" so shared links open this entry" % expected,
                ))
    return findings


def check_font_preload_drift(files, cfg):
    """A preloaded font URL still matches the @font-face that consumes it.

    Why: index.html carries a comment warning about precisely this -- if the
    preload URL and the @font-face src drift apart, the preload becomes a
    wasted 57 KB download instead of a head start, and nothing visibly breaks.
    """
    findings = []
    index = ROOT / "index.html"
    if not index.is_file():
        return findings
    text = index.read_text(encoding="utf-8", errors="replace")
    preloads = re.findall(
        r"""<link[^>]+rel=['"]preload['"][^>]+href=['"]([^'"]+)['"]""", text, re.I)
    preloads += re.findall(
        r"""<link[^>]+href=['"]([^'"]+)['"][^>]+rel=['"]preload['"]""", text, re.I)
    if not preloads:
        return findings
    css_blob = ""
    for rel in files:
        if Path(rel).suffix.lower() == ".css":
            css_blob += read_text(rel)
    for url in set(preloads):
        if url not in css_blob and url not in text.replace(
                '<link rel="preload"', "", 1):
            if url not in css_blob:
                findings.append(Finding(
                    WARN, "font-preload", "index.html", 1,
                    "preloaded '%s' is not requested by any @font-face in the CSS"
                    % url.rsplit("/", 1)[-1],
                    "the browser downloads it and then downloads the real one too",
                ))
    return findings


# --------------------------------------------------------------------------
# search engines: titles, descriptions, canonical/hreflang, JSON-LD, sitemap
# --------------------------------------------------------------------------

KO_BUILDER = ROOT / "tools" / "build_ko_page.py"
DESCRIPTION_MAX = {"en": 160}   # characters; longer is cut off in results
DESCRIPTION_MAX_KO = 100        # Hangul is about twice as wide: a warning only
DESCRIPTION_MIN = 50
TITLE_MAX_WIDTH = 60            # Latin characters; Hangul counts double


def load_ko_builder():
    """tools/build_ko_page.py as a module: the --check and the shared parsers."""
    if not KO_BUILDER.is_file():
        return None
    spec = importlib.util.spec_from_file_location("build_ko_page", KO_BUILDER)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def page_head(text):
    """The <head> of a page without its inline scripts."""
    m = re.search(r"<head\b[^>]*>(.*?)</head>", text, re.I | re.S)
    head = m.group(1) if m else ""
    return re.sub(r"<script\b.*?</script>", " ", head, flags=re.I | re.S)


def tag_attrs(tag):
    return {k.lower(): html.unescape(v) for k, v in re.findall(r'([\w:-]+)\s*=\s*"([^"]*)"', tag)}


def head_tags(head, name):
    return [tag_attrs(m.group(0)) for m in re.finditer(r"<%s\b[^>]*>" % name, head, re.I)]


def page_lang(text):
    m = re.search(r"<html\b[^>]*>", text, re.I)
    return (tag_attrs(m.group(0)).get("lang") or "") if m else ""


def is_indexable(text):
    return not (re.search(r"""http-equiv=['"]refresh['"]""", text, re.I)
                or robots_noindex(text))


def public_url(rel):
    """The URL a page is published at; index.html is the site root."""
    host = _SITE_HOSTS[0] if _SITE_HOSTS else "ji-hun-git.github.io"
    return "https://%s/%s" % (host, "" if rel == "index.html" else rel)


def local_page(url):
    """The file behind one of the site's own page URLs, or None."""
    path = localise(url)
    if path is None:
        return None
    path = path.split("#")[0].split("?")[0].lstrip("/")
    return path or "index.html"


def hreflang_links(head):
    links = {}
    for a in head_tags(head, "link"):
        if "alternate" in (a.get("rel") or "").lower().split() and a.get("hreflang"):
            links.setdefault(a["hreflang"], []).append(a.get("href", ""))
    return links


def text_width(value):
    return sum(2 if "ᄀ" <= ch <= "힣" or "　" <= ch <= "鿿" else 1 for ch in value)


def check_search_metadata(files, cfg):
    """One title and one description per page, sensible lengths.

    Why: the owner asked to be findable by name and topic. A search result shows
    the <title> and usually the meta description; a page with two of either
    shows whichever the engine picks, and a description over ~160 characters is
    cut mid-sentence (Korean at about 100, since Hangul is twice as wide).
    """
    findings = []
    for rel in files:
        if Path(rel).suffix.lower() != ".html":
            continue
        text = read_text(rel)
        head = page_head(text)
        titles = re.findall(r"<title\b[^>]*>(.*?)</title>", head, re.I | re.S)
        if len(titles) != 1:
            findings.append(Finding(
                ERROR, "search-metadata", rel, 1,
                "the <head> has %d <title> elements, expected exactly 1" % len(titles),
                "keep one <title> per page",
            ))
        descriptions = [a.get("content", "") for a in head_tags(head, "meta")
                        if (a.get("name") or "").lower() == "description"]
        indexable = is_indexable(text)
        if len(descriptions) > 1 or (indexable and len(descriptions) != 1):
            findings.append(Finding(
                ERROR, "search-metadata", rel, 1,
                "the <head> has %d meta descriptions, expected exactly 1" % len(descriptions),
                "search engines show one; keep exactly one per indexable page",
            ))
        if not indexable:
            continue
        lang = page_lang(text).split("-")[0].lower()
        for title in titles[:1]:
            title = " ".join(html.unescape(title).split())
            if text_width(title) > TITLE_MAX_WIDTH:
                findings.append(Finding(
                    WARN, "search-metadata", rel, 1,
                    "title is %d characters wide (Hangul counted double); results cut "
                    "it after about %d: %r" % (text_width(title), TITLE_MAX_WIDTH, title),
                    "put the name and the most important words first",
                ))
        for description in descriptions[:1]:
            description = " ".join(description.split())
            if lang == "ko":
                if len(description) > DESCRIPTION_MAX_KO:
                    findings.append(Finding(
                        WARN, "search-metadata", rel, 1,
                        "Korean description is %d characters; results show about %d"
                        % (len(description), DESCRIPTION_MAX_KO),
                        "shorten it in the ko-head block of index.html, then run "
                        "python tools/build_ko_page.py",
                    ))
            elif len(description) > DESCRIPTION_MAX.get(lang, 160):
                findings.append(Finding(
                    ERROR, "search-metadata", rel, 1,
                    "description is %d characters, more than %d"
                    % (len(description), DESCRIPTION_MAX.get(lang, 160)),
                    "search results cut it mid-sentence; shorten it",
                ))
            if len(description) < DESCRIPTION_MIN:
                findings.append(Finding(
                    WARN, "search-metadata", rel, 1,
                    "description is only %d characters" % len(description),
                    "say who, what and where in one or two sentences",
                ))
    return findings


def check_canonical_hreflang(files, cfg):
    """Each page names itself as canonical; language versions name each other.

    Why: / (English) and /ko.html (Korean) are one CV in two languages. Search
    engines ignore hreflang unless every version lists itself and every other
    version with identical links, and a canonical that points across languages
    would drop the Korean page from Korean results altogether.
    """
    findings = []
    pages = {}
    for rel in files:
        if Path(rel).suffix.lower() != ".html":
            continue
        text = read_text(rel)
        if not is_indexable(text):
            continue
        head = page_head(text)
        canonicals = [a.get("href", "") for a in head_tags(head, "link")
                      if "canonical" in (a.get("rel") or "").lower().split()]
        pages[rel] = {"text": text, "head": head, "canonicals": canonicals,
                      "hreflang": hreflang_links(head), "lang": page_lang(text)}
    for rel, page in pages.items():
        expected = public_url(rel)
        if len(page["canonicals"]) != 1:
            findings.append(Finding(
                ERROR, "canonical-hreflang", rel, 1,
                "%d rel=canonical links, expected exactly 1" % len(page["canonicals"]),
                "one canonical per page, pointing at the page itself",
            ))
        elif page["canonicals"][0] != expected:
            findings.append(Finding(
                ERROR, "canonical-hreflang", rel, 1,
                "canonical is %s; this page is published at %s" % (page["canonicals"][0], expected),
                "each language version is its own canonical page",
            ))
        og_url = [a.get("content", "") for a in head_tags(page["head"], "meta")
                  if (a.get("property") or "") == "og:url"]
        if og_url and og_url[0] != expected:
            findings.append(Finding(
                ERROR, "canonical-hreflang", rel, 1,
                "og:url is %s, not the canonical %s" % (og_url[0], expected), "",
            ))
        links = page["hreflang"]
        if not links:
            continue
        for code, hrefs in links.items():
            if len(hrefs) > 1:
                findings.append(Finding(
                    ERROR, "canonical-hreflang", rel, 1,
                    "hreflang=%s is declared %d times" % (code, len(hrefs)), "",
                ))
            if not hrefs[0].startswith("https://"):
                findings.append(Finding(
                    ERROR, "canonical-hreflang", rel, 1,
                    "hreflang=%s href %r is not an absolute https URL" % (code, hrefs[0]),
                    "hreflang URLs must be fully qualified",
                ))
        own = page["lang"].split("-")[0].lower()
        if links.get(own, [None])[0] != expected:
            findings.append(Finding(
                ERROR, "canonical-hreflang", rel, 1,
                "hreflang=%s should point at this page (%s)" % (own, expected),
                "every language version lists itself",
            ))
        if "x-default" not in links:
            findings.append(Finding(
                ERROR, "canonical-hreflang", rel, 1, "no hreflang=x-default",
                "point x-default at the English page, /",
            ))
        compared = set()
        for code, hrefs in links.items():
            if code == "x-default":
                continue
            target = local_page(hrefs[0])
            if target in compared:
                continue
            compared.add(target)
            if target is None or target not in pages:
                findings.append(Finding(
                    ERROR, "canonical-hreflang", rel, 1,
                    "hreflang=%s points at %s, which is not an indexable page here"
                    % (code, hrefs[0]), "",
                ))
                continue
            other = pages[target]
            if other["hreflang"] != links:
                findings.append(Finding(
                    ERROR, "canonical-hreflang", target, 1,
                    "hreflang links differ from %s's; both must list the same set" % rel,
                    "if %s is generated, run python tools/build_ko_page.py" % target
                    if target in CV_PAGES else "",
                ))
            if other["lang"].split("-")[0].lower() != code.split("-")[0].lower():
                findings.append(Finding(
                    ERROR, "canonical-hreflang", target, 1,
                    "listed as hreflang=%s but its <html lang> is %r" % (code, other["lang"]), "",
                ))
    if "ko.html" in pages and "index.html" in pages:
        if local_page(pages["index.html"]["hreflang"].get("ko", [""])[0]) != "ko.html":
            findings.append(Finding(
                ERROR, "canonical-hreflang", "index.html", 1,
                "index.html does not list ko.html as hreflang=ko",
                "keep the English and Korean pages linked both ways",
            ))
    return findings


def ld_nodes(text):
    """([(node, line)], [(error, line)]) for every JSON-LD block on a page."""
    nodes, errors = [], []
    for m in INLINE_SCRIPT.finditer(text):
        if not LD_JSON_TYPE.search(m.group(1)):
            continue
        line = line_of(text, m.start())
        try:
            data = json.loads(m.group(2))
        except ValueError as exc:
            errors.append((str(exc), line))
            continue
        items = data.get("@graph", [data]) if isinstance(data, dict) else data
        for node in items if isinstance(items, list) else []:
            if isinstance(node, dict):
                nodes.append((node, line))
    return nodes, errors


def as_list(value):
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def sitemap_entries():
    """{loc: {"lastmod": str, "alternates": {hreflang: href}}} from sitemap.xml."""
    path = ROOT / "sitemap.xml"
    if not path.is_file():
        return None
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9",
          "x": "http://www.w3.org/1999/xhtml"}
    root = ET.parse(str(path)).getroot()
    entries = []
    for url in root.findall("s:url", ns):
        alternates = {}
        for link in url.findall("x:link", ns):
            alternates.setdefault(link.get("hreflang"), []).append(link.get("href"))
        entries.append({
            "loc": (url.findtext("s:loc", default="", namespaces=ns) or "").strip(),
            "lastmod": (url.findtext("s:lastmod", default="", namespaces=ns) or "").strip(),
            "alternates": alternates,
        })
    return entries


def check_structured_data(files, cfg):
    """JSON-LD parses and says only what the visible page says.

    Why: the old Person data gave a job title ("... & Product Strategist") and a
    topic ("AI product strategy") that appear nowhere on the page. Search
    engines treat structured data that contradicts the page as spam, and it is
    the owner's name. Each fact is compared with the element that shows it.
    """
    findings = []
    builder = load_ko_builder()
    try:
        sitemap = {e["loc"]: e for e in (sitemap_entries() or [])}
    except ET.ParseError:
        sitemap = {}  # reported by check_sitemap
    for rel in files:
        if Path(rel).suffix.lower() != ".html":
            continue
        text = read_text(rel)
        nodes, errors = ld_nodes(text)
        for error, line in errors:
            findings.append(Finding(
                ERROR, "structured-data", rel, line,
                "JSON-LD does not parse: %s" % error,
                "search engines ignore the whole block",
            ))
        if rel not in CV_PAGES or builder is None:
            continue

        def fail(message, fix=""):
            findings.append(Finding(ERROR, "structured-data", rel, nodes[0][1] if nodes else 1,
                                    message, fix))

        by_type = {}
        for node, _line in nodes:
            by_type.setdefault(node.get("@type"), []).append(node)
        missing = [t for t in ("WebSite", "ProfilePage", "Person") if len(by_type.get(t, [])) != 1]
        if missing:
            fail("JSON-LD needs exactly one each of %s" % ", ".join(missing))
            continue
        person, profile = by_type["Person"][0], by_type["ProfilePage"][0]
        lang = page_lang(text).split("-")[0].lower()
        other = "en" if lang == "ko" else "ko"
        canonical = public_url(rel)
        # ko.html is Korean only; its English name is the one on index.html.
        source, source_rel = (text, rel) if rel == "index.html" else (read_text("index.html"), "index.html")
        try:
            name = builder.display_name(text, lang, rel)
            other_name = builder.display_name(source, other, source_rel)
            role = builder.role_lines(text, lang, rel)
        except builder.BuildError as exc:
            fail(str(exc))
            continue
        if person.get("name") != name:
            fail("Person name %r is not the name on the page (%r)" % (person.get("name"), name))
        if other_name not in as_list(person.get("alternateName")):
            fail("Person alternateName should include %r" % other_name)
        if [" ".join(str(t).split()) for t in as_list(person.get("jobTitle"))] != role:
            fail("jobTitle %r is not the sidebar role line %r" % (person.get("jobTitle"), role),
                 "copy the role line (one entry per line) into jobTitle")
        if profile.get("url") != canonical or profile.get("@id") != canonical:
            fail("ProfilePage url/@id should be the canonical URL %s" % canonical)
        if profile.get("inLanguage") != lang:
            fail("ProfilePage inLanguage is %r; the page is %r" % (profile.get("inLanguage"), lang))
        if (profile.get("mainEntity") or {}).get("@id") != person.get("@id"):
            fail("ProfilePage mainEntity does not point at the Person @id")
        modified = str(profile.get("dateModified", ""))
        if not re.match(r"^\d{4}-\d{2}-\d{2}", modified):
            fail("ProfilePage dateModified %r is not an ISO 8601 date" % modified)
        elif canonical in sitemap and sitemap[canonical]["lastmod"][:10] != modified[:10]:
            fail("dateModified %s differs from <lastmod> %s in sitemap.xml"
                 % (modified, sitemap[canonical]["lastmod"]),
                 "update both when the content changes")
        # The footer's "Updated 2026.09" / "2026.09 갱신" is the same date, shown.
        footer = re.search(r"<footer\b.*?</footer>", text, re.S)
        shown = re.findall(r"Updated (\d{4})\.(\d{2})|(\d{4})\.(\d{2}) 갱신",
                           visible_text(footer.group(0)) if footer else "")
        months = {"%s-%s" % ((a, b) if a else (c, d)) for a, b, c, d in shown}
        expected_langs = 2 if rel == "index.html" else 1
        if len(shown) != expected_langs or months != {modified[:7]}:
            fail("the footer's updated date %s does not match dateModified %s"
                 % (sorted(months) or "(none)", modified[:10]),
                 "set 'Updated YYYY.MM' / 'YYYY.MM 갱신' in the footer to the same month")
        page_text = visible_text(text).lower()
        for topic in as_list(person.get("knowsAbout")):
            if str(topic).lower() not in page_text:
                fail("knowsAbout %r is not a topic the page mentions" % topic,
                     "remove it from the JSON-LD, or keep the wording that supports it")
        education = re.search(r'<section\b[^>]*id="education"[^>]*>(.*?)</section>', text, re.S)
        education_text = " ".join(visible_text(education.group(1)).split()) if education else ""
        for school in as_list(person.get("alumniOf")):
            names = [school.get("name")] + as_list(school.get("alternateName")) \
                if isinstance(school, dict) else [school]
            for n in names:
                if not n or n not in education_text:
                    fail("alumniOf %r is not an institution listed under Education" % n)
        affiliation = person.get("affiliation") or {}
        if isinstance(affiliation, dict) and affiliation.get("name") \
                and affiliation["name"] not in " ".join(visible_text(text).split()):
            fail("affiliation %r does not appear on the page" % affiliation["name"])
        hrefs = {html.unescape(h) for h in re.findall(r'href="([^"]+)"', text)}
        for url in as_list(person.get("sameAs")):
            if not any(h.startswith(url) for h in hrefs):
                fail("sameAs %s is not a profile the page links to" % url)
        image = localise(str(person.get("image", "")))
        if image and not (ROOT / image.lstrip("/")).is_file():
            fail("Person image %s does not exist" % person.get("image"))
    return findings


def check_sitemap(files, cfg):
    """sitemap.xml lists exactly the canonical pages, with their language links.

    Why: a sitemap that lists a duplicate (?view=cv) or misses the Korean page
    tells search engines the wrong set of pages; its hreflang links must agree
    with the pages' own, or engines trust neither.
    """
    findings = []
    try:
        entries = sitemap_entries()
    except ET.ParseError as exc:
        return [Finding(ERROR, "sitemap", "sitemap.xml", 1, "does not parse: %s" % exc, "")]
    if entries is None:
        return [Finding(ERROR, "sitemap", "sitemap.xml", 0, "sitemap.xml is missing", "")]
    pages = {}
    for rel in files:
        if Path(rel).suffix.lower() == ".html":
            text = read_text(rel)
            if is_indexable(text):
                pages[public_url(rel)] = hreflang_links(page_head(text))
    locs = [e["loc"] for e in entries]
    for loc in sorted({l for l in locs if locs.count(l) > 1}):
        findings.append(Finding(ERROR, "sitemap", "sitemap.xml", 0, "lists %s twice" % loc, ""))
    for loc in sorted(set(pages) - set(locs)):
        findings.append(Finding(
            ERROR, "sitemap", "sitemap.xml", 0, "missing the canonical page %s" % loc,
            "list every indexable page by its canonical URL",
        ))
    for loc in sorted(set(locs) - set(pages)):
        findings.append(Finding(
            ERROR, "sitemap", "sitemap.xml", 0,
            "lists %s, which is not the canonical URL of an indexable page" % loc,
            "list canonical URLs only (no ?view=, no noindex pages)",
        ))
    for entry in entries:
        if not re.match(r"^\d{4}-\d{2}-\d{2}$", entry["lastmod"]):
            findings.append(Finding(
                ERROR, "sitemap", "sitemap.xml", 0,
                "%s has lastmod %r; use YYYY-MM-DD" % (entry["loc"], entry["lastmod"]), "",
            ))
        if entry["loc"] in pages and entry["alternates"] != pages[entry["loc"]]:
            findings.append(Finding(
                ERROR, "sitemap", "sitemap.xml", 0,
                "hreflang links for %s differ from the page's own" % entry["loc"],
                "keep sitemap.xml and the <head> links identical",
            ))
    robots = ROOT / "robots.txt"
    sitemap_url = "https://%s/sitemap.xml" % (_SITE_HOSTS[0] if _SITE_HOSTS else "ji-hun-git.github.io")
    if not robots.is_file():
        findings.append(Finding(ERROR, "sitemap", "robots.txt", 0, "robots.txt is missing", ""))
    else:
        lines = [l.strip() for l in read_text("robots.txt").splitlines()]
        if "Sitemap: %s" % sitemap_url not in lines:
            findings.append(Finding(
                ERROR, "sitemap", "robots.txt", 0, "does not point at %s" % sitemap_url, "",
            ))
        if any(re.match(r"(?i)^disallow:\s*/\s*$", l) for l in lines):
            findings.append(Finding(
                ERROR, "sitemap", "robots.txt", 0, "disallows the whole site", "",
            ))
    return findings


def check_ko_page(files, cfg):
    """ko.html is exactly what tools/build_ko_page.py makes from index.html.

    Why: ko.html is a generated copy of the CV. Edited by hand, or left behind
    after an index.html edit, the Korean page silently shows an older CV.
    """
    builder = load_ko_builder()
    if builder is None:
        return [Finding(ERROR, "ko-page", "tools/build_ko_page.py", 0,
                        "the Korean page generator is missing", "")]
    problem = builder.check()
    if problem:
        return [Finding(
            ERROR, "ko-page", "ko.html", 0, problem,
            "run: python tools/build_ko_page.py (then review and commit ko.html)",
        )]
    # The Korean page is Korean only: a crawler that reads the raw HTML without
    # CSS (Naver) must not index a copy of the English page.
    findings = []
    text = read_text("ko.html")
    body = re.search(r"<body\b", text)
    for m in re.finditer(r"""<[a-z][^>]*\slang=["']en["'][^>]*>""", text[body.start():] if body else ""):
        findings.append(Finding(
            ERROR, "ko-page", "ko.html", line_of(text, body.start() + m.start()),
            "English element in the Korean page's body: %s" % m.group(0)[:80],
            "give it a lang=\"ko\" twin in index.html, then run python tools/build_ko_page.py",
        ))
    return findings


def check_lab_page(files, cfg):
    """The Simulations page's static text agrees with the CV and with the lab.

    Why (audit FP-01, CC-18): the page shows its simulation count before the
    script runs, so a hard-coded number goes stale when a simulation is added
    or removed; and the page's author line drifted from the CV's role line
    ('KAIST GSCT') while the CV's wording was being revised.
    """
    rel = "laboratory.html"
    if not (ROOT / rel).is_file():
        return []
    findings = []
    text = read_text(rel)
    records = ROOT / "lab" / "experiments.js"
    if records.is_file():
        count = len(re.findall(r"^    id: ['\"]", records.read_text(encoding="utf-8"), re.M))
        m = re.search(r'id="metricProjects"[^>]*>\s*(\d+)\s*<', text)
        if not m:
            findings.append(Finding(
                ERROR, "lab-page", rel, 0,
                "#metricProjects does not show a number before the script runs",
                "write the number of simulations in it (the lab boot replaces it)",
            ))
        elif int(m.group(1)) != count:
            findings.append(Finding(
                ERROR, "lab-page", rel, line_of(text, m.start()),
                "#metricProjects says %s, lab/experiments.js has %d simulations" % (m.group(1), count),
                "change the number in laboratory.html",
            ))
    builder = load_ko_builder()
    if builder is not None and (ROOT / "index.html").is_file():
        try:
            role = builder.role_lines(read_text("index.html"), "en")[0]
        except builder.BuildError as exc:
            role = None
            findings.append(Finding(ERROR, "lab-page", "index.html", 0, str(exc), ""))
        aff = re.search(r'class="nav-aff"[^>]*>(.*?)</span>', text, re.S)
        aff_text = " ".join(html.unescape(re.sub(r"<[^>]+>", " ", aff.group(1))).split()) if aff else ""
        if role and role not in aff_text:
            findings.append(Finding(
                ERROR, "lab-page", rel, line_of(text, aff.start()) if aff else 0,
                "the author line (.nav-aff) does not repeat the CV's role line %r" % role,
                "use the CV's role line in laboratory.html",
            ))
    for m in re.finditer(r"\bGSCT\b", text):
        findings.append(Finding(
            ERROR, "lab-page", rel, line_of(text, m.start()),
            "'GSCT' is an abbreviation the CV never uses",
            "write 'KAIST Graduate School of Culture Technology' or the CV's role line",
        ))
    return findings


CSP_META = re.compile(r"""<meta\b[^>]*http-equiv=["']Content-Security-Policy["'][^>]*>""", re.I)


def inline_script_hashes(text):
    """[(sha256 source, line)] of the scripts the browser would run inline.

    The hash covers the script text as the browser sees it: the HTML parser
    turns CRLF into LF first, so a Windows checkout hashes like the server copy.
    """
    import base64
    out = []
    for block in INLINE_SCRIPT.finditer(text):
        attrs = block.group(1)
        if re.search(r"\bsrc\s*=", attrs, re.I) or DATA_SCRIPT_TYPE.search(attrs):
            continue
        body = block.group(2).replace("\r\n", "\n").replace("\r", "\n")
        digest = base64.b64encode(hashlib.sha256(body.encode("utf-8")).digest()).decode("ascii")
        out.append(("'sha256-%s'" % digest, line_of(text, block.start())))
    return out


def check_content_security_policy(files, cfg):
    """Every page that loads code or styles declares a Content-Security-Policy,
    and each inline script it runs is allowed by its hash.

    Why (audit PSD-04): a policy keeps an injected script or a swapped CDN
    file from running with the page's rights. A meta policy that forgets an
    inline script breaks the page silently for real visitors (the script just
    does not run), so the hashes are checked here, where editing the script
    shows up at once. frame-ancestors and report-uri cannot be set by a meta
    tag; GitHub Pages sends no CSP header.
    """
    findings = []
    for rel in sorted(f for f in files if f.endswith(".html")):
        text = read_text(rel)
        loads = re.search(r"<script\b|<link\b[^>]*rel=\"stylesheet\"", text, re.I)
        metas = list(CSP_META.finditer(text))
        if not metas:
            if loads:
                findings.append(Finding(
                    ERROR, "csp", rel, 0,
                    "page loads scripts or styles but declares no Content-Security-Policy",
                    "add <meta http-equiv=\"Content-Security-Policy\" ...> right after <meta charset>",
                ))
            continue
        meta = metas[0]
        first_load = re.search(r"<script\b|<link\b[^>]*rel=\"(?:stylesheet|preload|icon)\"", text, re.I)
        if first_load and first_load.start() < meta.start():
            findings.append(Finding(
                ERROR, "csp", rel, line_of(text, meta.start()),
                "the policy comes after the first script or stylesheet, which it then does not cover",
                "move the policy up, right after <meta charset>",
            ))
        policy = tag_attrs(meta.group(0)).get("content", "")
        directives = {}
        for part in policy.split(";"):
            bits = part.split()
            if bits:
                directives[bits[0].lower()] = bits[1:]
        scripts = directives.get("script-src", directives.get("default-src", []))
        for source, line in inline_script_hashes(text):
            if source not in scripts:
                findings.append(Finding(
                    ERROR, "csp", rel, line,
                    "inline script is not allowed by the policy (its hash is %s)" % source,
                    "put %s in script-src (and keep index.html and ko.html in step)" % source,
                ))
        for name in ("object-src", "base-uri"):
            if directives.get(name) != ["'none'"]:
                findings.append(Finding(
                    WARN, "csp", rel, line_of(text, meta.start()),
                    "%s is not 'none'" % name, "add %s 'none'" % name,
                ))
        if any("'unsafe-inline'" in v or "'unsafe-eval'" in v for v in directives.values()):
            findings.append(Finding(
                ERROR, "csp", rel, line_of(text, meta.start()),
                "the policy allows 'unsafe-inline' or 'unsafe-eval'",
                "allow inline scripts by hash instead",
            ))
    return findings


# --------------------------------------------------------------------------
# runner
# --------------------------------------------------------------------------

def run(update_stamps=False):
    cfg = load_config()
    global _SITE_HOSTS
    _SITE_HOSTS = [h.lower() for h in cfg.get("site_origin", {}).get("hosts", [])]
    files = tracked_files(cfg)
    findings = []
    findings += check_references(files, cfg)
    findings += check_ids_and_anchors(files, cfg)
    findings += check_images(files, cfg)
    findings += check_heading_order(files, cfg)
    findings += check_external_origins(files, cfg)
    findings += check_trackers(files, cfg)
    findings += check_pii(files, cfg)
    findings += check_image_metadata(files, cfg)
    stamp_findings, stamp_state = check_cache_stamps(files, cfg)
    findings += stamp_findings
    findings += check_lab_registry(files, cfg)
    findings += check_lab_page(files, cfg)
    findings += check_content_security_policy(files, cfg)
    findings += check_git_identities(cfg)
    findings += check_meta(files, cfg)
    findings += check_ko_page(files, cfg)
    findings += check_search_metadata(files, cfg)
    findings += check_canonical_hreflang(files, cfg)
    findings += check_structured_data(files, cfg)
    findings += check_sitemap(files, cfg)
    findings += check_bookshelf_switch(files, cfg)
    findings += check_simulations_switch(files, cfg)
    findings += check_css_tokens(files, cfg)
    findings += check_cv_record_ids(files, cfg)
    findings += check_font_preload_drift(files, cfg)
    findings += check_unreferenced_assets(files, cfg)
    findings += check_publication_roles(files, cfg)
    findings += check_bilingual_pairs(files, cfg)
    findings += check_award_consistency(files, cfg)
    findings += check_cv_sections(files, cfg)
    findings += check_toggled_classes_are_styled(files, cfg)

    if update_stamps:
        STAMP_BASELINE.write_text(
            json.dumps(stamp_state, indent=2, sort_keys=True) + "\n", encoding="utf-8")
        print("[ OK ] recorded asset baseline for %d page(s) -> %s"
              % (len(stamp_state), STAMP_BASELINE.relative_to(ROOT).as_posix()))
    return files, findings


def main():
    ap = argparse.ArgumentParser(description="Static harness for the portfolio site.")
    ap.add_argument("--json", action="store_true", help="emit JSON instead of a report")
    ap.add_argument("--strict", action="store_true", help="exit non-zero on warnings too")
    ap.add_argument("--update-stamps", action="store_true",
                    help="record current asset hashes as the cache-stamp baseline")
    ap.add_argument("--only", default="", help="comma-separated check names to keep")
    args = ap.parse_args()

    files, findings = run(update_stamps=args.update_stamps)
    if args.only:
        keep = {s.strip() for s in args.only.split(",") if s.strip()}
        findings = [f for f in findings if f.check in keep]

    errors = [f for f in findings if f.level == ERROR]
    warns = [f for f in findings if f.level == WARN]

    if args.json:
        print(json.dumps({
            "files_scanned": len(files),
            "errors": len(errors), "warnings": len(warns),
            "findings": [f.as_dict() for f in findings],
        }, indent=2, ensure_ascii=False))
    else:
        print("=" * 72)
        print("STATIC HARNESS  |  %d files scanned  |  %d error(s), %d warning(s)"
              % (len(files), len(errors), len(warns)))
        print("=" * 72)
        by_check = {}
        for f in findings:
            by_check.setdefault(f.check, []).append(f)
        for check in sorted(by_check, key=lambda c: (
                0 if any(x.level == ERROR for x in by_check[c]) else 1, c)):
            group = by_check[check]
            n_err = sum(1 for x in group if x.level == ERROR)
            print("\n-- %s  (%d finding(s), %d error(s))" % (check, len(group), n_err))
            for f in group[:40]:
                loc = "%s:%d" % (f.path, f.line) if f.line else f.path
                print("   [%-5s] %s" % (f.level, loc))
                print("           %s" % f.message)
                if f.fix:
                    print("           fix: %s" % f.fix)
            if len(group) > 40:
                print("   ... and %d more" % (len(group) - 40))
        if not findings:
            print("\n[ OK ] no findings.")
        print("\n" + "=" * 72)
        print("RESULT: %s" % ("FAIL" if errors or (args.strict and warns) else "PASS"))
        print("=" * 72)

    return 1 if (errors or (args.strict and warns)) else 0


if __name__ == "__main__":
    sys.exit(main())

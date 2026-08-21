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
import json
import os
import re
import subprocess
import sys
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
                "email address '%s' is not on the public-contact allowlist" % addr,
                "remove it, or add it to harness.config.json if it is meant to be public",
            ))
        for name, pat, why in PII_PATTERNS:
            for m in pat.finditer(text):
                findings.append(Finding(
                    ERROR, "pii-" + name, rel, line_of(text, m.start()),
                    "%s: %s" % (why, m.group(0)[:60]),
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
    for rel in cfg["stamped_files"]["files"]:
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
    for m in re.finditer(r"""from\s+['"]\./simulations/([\w.\-]+\.js)""", text):
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
        return findings
    text = index.read_text(encoding="utf-8", errors="replace")
    rows = [m for m in re.finditer(r'<p class="item-desc"><span class="pub-n">(\d+)</span>', text)]
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
    return findings


P_CALL = re.compile(r'\bp\(\s*("(?:[^"\\]|\\.)*")\s*,\s*("(?:[^"\\]|\\.)*")\s*\)', re.S)


def check_bilingual_pairs(files, cfg):
    """Every p(en, ko) call carries real text on both sides.

    Why: the whole site is two languages toggled by CSS `display`. An empty half
    is invisible in the language you author in and a blank gap in the other one,
    which is exactly the kind of defect nobody notices until a Korean reader
    does.
    """
    findings = []
    for rel in ("assets/project-library/work-content.js",
                "assets/project-library/work-designs.js"):
        if not (ROOT / rel).is_file():
            continue
        text = read_text(rel)
        for m in P_CALL.finditer(text):
            en, ko = m.group(1)[1:-1].strip(), m.group(2)[1:-1].strip()
            if not en or not ko:
                findings.append(Finding(
                    ERROR, "bilingual-pairs", rel, line_of(text, m.start()),
                    "p() call has an empty %s half" % ("English" if not en else "Korean"),
                    "one language shows a gap here",
                ))
            elif en == ko and len(en) > 12 and not re.match(r"^[\x00-\x7f]+$", en):
                findings.append(Finding(
                    WARN, "bilingual-pairs", rel, line_of(text, m.start()),
                    "both halves of p() are identical: %r" % en[:50],
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
    index_p, wc_p = ROOT / "index.html", ROOT / "assets/project-library/work-content.js"
    if not (index_p.is_file() and wc_p.is_file()):
        return findings
    wc = wc_p.read_text(encoding="utf-8", errors="replace")
    index_text = index_p.read_text(encoding="utf-8", errors="replace")

    # Public portfolio copy should state the person's role and result directly.
    # Source provenance belongs in private claim notes, not in visitor-facing
    # sentences such as "a professor's CV records the award".
    public_copy = {
        "index.html": index_text,
        "assets/project-library/work-content.js": wc,
    }
    designs_p = ROOT / "assets/project-library/work-designs.js"
    if designs_p.is_file():
        public_copy["assets/project-library/work-designs.js"] = designs_p.read_text(
            encoding="utf-8", errors="replace")
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
                WARN, "award-consistency", "assets/project-library/work-content.js",
                line_of(wc, idx),
                "library still disclaims a result: %r" % phrase,
                "check index.html does not assert that same award; the two "
                "surfaces contradicted each other before 2026-08-20",
            ))
    if "Encouragement Prize" in wc and "President's Award" in index_text:
        idx = wc.find("Encouragement Prize")
        findings.append(Finding(
            WARN, "award-consistency", "assets/project-library/work-content.js",
            line_of(wc, idx),
            "library says Encouragement Prize while the CV says President's Award",
            "one of the two is stale",
        ))
    return findings


def check_library_source_alignment(files, cfg):
    """Every library book must map one-to-one to a CV row and detail record.

    The reader inherits titles, dates, venues, and compact summaries from
    index.html through sourceIndex. A missing, duplicated, or stale index can
    therefore display the wrong CV record under an otherwise plausible cover.
    """
    findings = []
    index_p = ROOT / "index.html"
    designs_p = ROOT / "assets/project-library/work-designs.js"
    content_p = ROOT / "assets/project-library/work-content.js"
    if not (index_p.is_file() and designs_p.is_file() and content_p.is_file()):
        return findings

    index_text = index_p.read_text(encoding="utf-8", errors="replace")
    designs_text = designs_p.read_text(encoding="utf-8", errors="replace")
    content_text = content_p.read_text(encoding="utf-8", errors="replace")

    def section(text, start_pattern, end_pattern):
        start = re.search(start_pattern, text)
        if not start:
            return ""
        end = re.search(end_pattern, text[start.end():])
        return text[start.end():start.end() + end.start()] if end else text[start.end():]

    cv_counts = {
        "projects": len(re.findall(
            r'<div class="item reveal">',
            section(index_text, r'<section[^>]+id="projects"[^>]*>',
                    r'<section[^>]+id="awards"[^>]*>'))),
        "publications": len(re.findall(r'class="pub-n"', index_text)),
        "awards": len(re.findall(
            r'<div class="item reveal">',
            section(index_text, r'<section[^>]+id="awards"[^>]*>',
                    r'<section[^>]+id="education"[^>]*>'))),
    }

    design_starts = list(re.finditer(
        r'^  (projects|publications|awards): \[$', designs_text, re.M))
    design_records = {}
    for pos, match in enumerate(design_starts):
        end = design_starts[pos + 1].start() if pos + 1 < len(design_starts) else len(designs_text)
        block = designs_text[match.end():end]
        indices = [int(v) for v in re.findall(r'^      sourceIndex: (\d+),$', block, re.M)]
        slugs = re.findall(r'^      slug: "([^"]+)",$', block, re.M)
        design_records[match.group(1)] = (indices, slugs, match.start())

    content_starts = list(re.finditer(
        r'^    (projects|publications|awards): \{$', content_text, re.M))
    content_slugs = {}
    for pos, match in enumerate(content_starts):
        end = content_starts[pos + 1].start() if pos + 1 < len(content_starts) else len(content_text)
        block = content_text[match.end():end]
        content_slugs[match.group(1)] = set(re.findall(
            r'^      "([^"]+)": \{$', block, re.M))

    for collection, cv_count in cv_counts.items():
        indices, slugs, offset = design_records.get(collection, ([], [], 0))
        expected = list(range(cv_count))
        if indices != expected:
            findings.append(Finding(
                ERROR, "library-source-alignment", "assets/project-library/work-designs.js",
                line_of(designs_text, offset),
                "%s sourceIndex values are %r; CV requires %r" %
                (collection, indices, expected),
                "keep one ordered library design for every CV row",
            ))
        if len(slugs) != cv_count or len(set(slugs)) != len(slugs):
            findings.append(Finding(
                ERROR, "library-source-alignment", "assets/project-library/work-designs.js",
                line_of(designs_text, offset),
                "%s has %d CV rows but %d design slugs (%d unique)" %
                (collection, cv_count, len(slugs), len(set(slugs))),
                "add, remove, or deduplicate library records to match the CV",
            ))
        missing_detail = set(slugs) - content_slugs.get(collection, set())
        stale_detail = content_slugs.get(collection, set()) - set(slugs)
        if missing_detail or stale_detail:
            findings.append(Finding(
                ERROR, "library-source-alignment", "assets/project-library/work-content.js", 0,
                "%s detail mismatch; missing=%r stale=%r" %
                (collection, sorted(missing_detail), sorted(stale_detail)),
                "use the same slugs in work-designs.js and work-content.js",
            ))
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
            "%d commit records carry the address '%s'" % (n, email),
            "future commits: git config user.email "
            "'90397147+ji-hun-git@users.noreply.github.com'. Past commits can only "
            "be changed by rewriting history and force-pushing.",
        ))
    return findings


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
        if re.search(r"""http-equiv=['"]refresh['"]""", text, re.I) or \
                re.search(r"""name=['"]robots['"][^>]*noindex""", text, re.I):
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
    findings += check_git_identities(cfg)
    findings += check_meta(files, cfg)
    findings += check_font_preload_drift(files, cfg)
    findings += check_unreferenced_assets(files, cfg)
    findings += check_publication_roles(files, cfg)
    findings += check_bilingual_pairs(files, cfg)
    findings += check_award_consistency(files, cfg)
    findings += check_library_source_alignment(files, cfg)
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

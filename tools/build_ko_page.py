#!/usr/bin/env python3
"""Generate ko.html, the Korean page of the CV, from index.html.

index.html is the single source of the site. ko.html is the same page with a
Korean <head> (tab title, search description, link previews, canonical URL,
structured data) and a Korean-only <body>: every English element that has a
Korean twin (<span lang="en"> next to <span lang="ko">, and so on) is left
out, so visitors never see English first and search engines that do not run
JavaScript or CSS (Naver) index a Korean page, not a copy of the English one.
Structure, ids, links, the 43 CV entries and the citations (which are in the
language they were published in) stay as they are. The language control on
ko.html is a plain link to the English page.

    python tools/build_ko_page.py            # write ko.html
    python tools/build_ko_page.py --check    # exit 1 if ko.html is out of date

The Korean head strings are edited in ONE place: the
<script id="ko-head" type="application/json"> block in the <head> of
index.html. Everything else in ko.html comes from index.html unchanged, so run
this script after any edit to index.html. tools/harness/static_checks.py runs
the --check and fails while ko.html is stale.

Standard library only, like the rest of the site's tooling.
"""

from __future__ import annotations

import argparse
import html
import json
import re
import sys
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "index.html"
TARGET = ROOT / "ko.html"
ORIGIN = "https://ji-hun-git.github.io"
PAGE_URL = {"en": ORIGIN + "/", "ko": ORIGIN + "/ko.html"}
BANNER = (
    "<!-- Generated from index.html by tools/build_ko_page.py. Do not edit this"
    " file: edit index.html, then run the script. -->"
)
HEAD_KEYS = ("title", "description", "image_alt", "site_name")

# Must match what assets/site.js shows on the language link in Korean mode,
# so that the raw page and the running page agree (the browser suite checks).
BUTTON_IN_KOREAN = {"label": "English", "aria-label": "Read in English", "lang": "en-US",
                    "href": "./", "hreflang": "en"}
# The header's Simulations link on the Korean page (and in assets/site.js).
LAB_IN_KOREAN = "laboratory.html?from=ko"

# English attribute text in the body and its Korean form on ko.html. The
# aria-labels are the same pairs assets/site.js sets when the language changes;
# keep the two lists in step. Every entry must still be found in index.html.
KOREAN_ATTRIBUTES = (
    ("aria-label", "Profile", "프로필"),
    ("aria-label", "Jihun Chae home", "채지훈 홈"),
    ("aria-label", "Main navigation", "주 메뉴"),
    ("aria-label", "Sections", "이력서 항목"),
    ("aria-label", "Filter publications by year", "연도별 논문 필터"),
    ("aria-label", "Reader mode", "읽기 모드"),
    ("title", "Reader mode", "읽기 모드"),
)

# JSON-LD knowsAbout topics in Korean, as the Korean page says them (each must
# be visible on ko.html: tools/harness/static_checks.py compares them).
KNOWS_ABOUT_KO = {
    "Human-centered AI": "인간 중심 AI",
    "Game accessibility": "게임 접근성",
    "Accessibility research": "접근성 연구",
    "Game AI": "게임 AI",
    "Conversational AI": "대화형 AI",
    "AI agents": "AI 에이전트",
    "Retrieval-augmented generation": "검색 증강 생성",
    "Extended reality": "확장현실",
    "Data validation": "데이터 검증",
}

VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link",
             "meta", "param", "source", "track", "wbr"}
HANGUL = re.compile(r"[가-힣]")


class BuildError(Exception):
    """index.html no longer has the shape this generator relies on."""


def one(pattern, text, what, where="index.html"):
    matches = list(re.finditer(pattern, text, re.S))
    if len(matches) != 1:
        raise BuildError("expected exactly one %s in %s, found %d" % (what, where, len(matches)))
    return matches[0]


def clean(fragment):
    """Visible text of an HTML fragment, whitespace collapsed."""
    return " ".join(html.unescape(re.sub(r"<[^>]+>", " ", fragment)).split())


def attr_escape(value):
    return (value.replace("&", "&amp;").replace('"', "&quot;")
            .replace("<", "&lt;").replace(">", "&gt;"))


def text_escape(value):
    return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def get_attr(tag, name):
    m = re.search(r'\s%s="([^"]*)"' % re.escape(name), tag)
    return html.unescape(m.group(1)) if m else None


def set_attr(tag, name, value):
    pattern = r'(\s%s=")[^"]*(")' % re.escape(name)
    if re.search(pattern, tag):
        return re.sub(pattern, lambda m: m.group(1) + attr_escape(value) + m.group(2), tag, count=1)
    end = re.search(r"\s*/?>$", tag)
    return tag[:end.start()] + ' %s="%s"' % (name, attr_escape(value)) + tag[end.start():]


def meta_pattern(key):
    return r'<meta\b[^>]*?\s(?:name|property)="%s"[^>]*>' % re.escape(key)


def replace_tag(text, pattern, what, change, where="index.html"):
    m = one(pattern, text, what, where)
    return text[:m.start()] + change(m.group(0)) + text[m.end():]


# -- visible facts (shared with tools/harness/static_checks.py) ---------------

def role_lines(text, lang, where="index.html"):
    """The sidebar role line in one language, one entry per visual line."""
    role = one(r'<p class="role">(.*?)</p>', text, 'sidebar role (<p class="role">)', where)
    span = one(r'<span lang="%s"\s*>(.*?)</span\s*>' % lang, role.group(1),
               "%s role line" % lang, where)
    return [line for line in (clean(p) for p in re.split(r"<br\s*/?>", span.group(1))) if line]


def display_name(text, lang, where="index.html"):
    """The name in the sidebar <h1 class="name"> in one language."""
    name = one(r'<h1 class="name">(.*?)</h1>', text, '<h1 class="name">', where)
    span = one(r'<span lang="%s"\s*>(.*?)</span\s*>' % lang, name.group(1),
               "%s name" % lang, where)
    return clean(span.group(1))


def head_strings(text, block_id="ko-head", where="index.html"):
    """The JSON head-strings block and its parsed content."""
    m = one(r'(?:<!--(?:(?!-->).)*-->\s*)?<script id="%s" type="application/json">(.*?)</script>'
            % re.escape(block_id), text, '<script id="%s"> head-strings block' % block_id, where)
    try:
        data = json.loads(m.group(1))
    except ValueError as exc:
        raise BuildError("the %s block in %s is not valid JSON: %s" % (block_id, where, exc))
    missing = [k for k in HEAD_KEYS if not isinstance(data.get(k), str) or not data[k].strip()]
    if missing:
        raise BuildError("the %s block in %s needs non-empty %s" % (block_id, where, ", ".join(missing)))
    return m, data


def english_head(text):
    head = one(r"<head>(.*?)</head>", text, "<head>").group(1)
    return {
        "title": clean(one(r"<title>(.*?)</title>", head, "<title>").group(1)),
        "description": get_attr(one(meta_pattern("description"), head, "meta description").group(0), "content"),
        "image_alt": get_attr(one(meta_pattern("og:image:alt"), head, "og:image:alt").group(0), "content"),
        "site_name": get_attr(one(meta_pattern("og:site_name"), head, "og:site_name").group(0), "content"),
    }


def json_block(data, indent):
    body = json.dumps(data, ensure_ascii=False, indent=2).replace("</", "<\\/")
    pad = " " * (indent + 2)
    return "\n".join(pad + line for line in body.splitlines())


def line_indent(text, index):
    start = text.rfind("\n", 0, index) + 1
    return len(text[start:index]) - len(text[start:index].lstrip(" "))


# -- the Korean-only body -----------------------------------------------------

class _Elements(HTMLParser):
    """Every element of a document: tag, lang, source span and parent."""

    def __init__(self, text):
        super().__init__(convert_charrefs=False)
        self.text = text
        self.line_starts = [0] + [m.end() for m in re.finditer("\n", text)]
        self.elements = []   # dicts: tag, lang, start, end, parent
        self.stack = []      # indexes into self.elements
        self.feed(text)
        self.close()

    def position(self):
        line, col = self.getpos()
        return self.line_starts[line - 1] + col

    def _open(self, tag, attrs, void):
        start = self.position()
        element = {"tag": tag, "lang": dict(attrs).get("lang"), "start": start,
                   "end": start + len(self.get_starttag_text() or ""),
                   "parent": self.stack[-1] if self.stack else None}
        self.elements.append(element)
        if not void:
            self.stack.append(len(self.elements) - 1)

    def handle_starttag(self, tag, attrs):
        self._open(tag, attrs, tag in VOID_TAGS)

    def handle_startendtag(self, tag, attrs):
        self._open(tag, attrs, True)

    def handle_endtag(self, tag):
        for depth in range(len(self.stack) - 1, -1, -1):
            if self.elements[self.stack[depth]]["tag"] == tag:
                close = self.text.find(">", self.position())
                self.elements[self.stack[depth]]["end"] = close + 1
                del self.stack[depth:]
                return


def korean_only(text):
    """Leave out every English element of the <body> that has a Korean twin.

    A twin is a sibling element with the same tag and lang="ko": the pairs the
    CV is written in (span, p, div). Language-neutral text, such as names,
    citations and link labels, has no lang and stays. Exact lang values only:
    the language link's lang="en-US" is not a pair member.
    """
    body = one(r"<body\b[^>]*>", text, "<body>")
    parsed = _Elements(text)
    siblings = {}
    for index, element in enumerate(parsed.elements):
        if element["start"] > body.start() and element["lang"] in ("en", "ko"):
            siblings.setdefault(element["parent"], []).append(element)
    drop = []
    for group in siblings.values():
        korean = {e["tag"] for e in group if e["lang"] == "ko"}
        drop += [e for e in group if e["lang"] == "en" and e["tag"] in korean]
    orphans = [e for group in siblings.values() for e in group
               if e["lang"] == "en" and e not in drop]
    if orphans:
        first = orphans[0]
        raise BuildError("%d English element(s) in index.html have no Korean twin, first at "
                         "line %d: %s" % (len(orphans), text.count("\n", 0, first["start"]) + 1,
                                          clean(text[first["start"]:first["end"]])[:60]))
    for element in sorted(drop, key=lambda e: e["start"], reverse=True):
        text = text[:element["start"]] + text[element["end"]:]
    return text


def korean_attributes(text):
    """The body's English aria-labels and titles, in Korean."""
    body = one(r"<body\b[^>]*>", text, "<body>").end()
    head, rest = text[:body], text[body:]
    for name, english, korean in KOREAN_ATTRIBUTES:
        old = '%s="%s"' % (name, attr_escape(english))
        if old not in rest:
            raise BuildError("expected %s in the <body> of index.html" % old)
        rest = rest.replace(old, '%s="%s"' % (name, attr_escape(korean)))
    return head + rest


# -- the build ----------------------------------------------------------------

def korean_structured_data(raw, text, ko):
    try:
        data = json.loads(raw)
    except ValueError as exc:
        raise BuildError("the JSON-LD block in index.html is not valid JSON: %s" % exc)
    nodes = data.get("@graph") if isinstance(data, dict) else None
    if not isinstance(nodes, list):
        raise BuildError("the JSON-LD block in index.html needs an @graph list")
    types = {node.get("@type") for node in nodes if isinstance(node, dict)}
    if not {"ProfilePage", "Person"} <= types:
        raise BuildError("the JSON-LD @graph in index.html needs a ProfilePage and a Person")
    for node in nodes:
        if node.get("@type") == "ProfilePage":
            node["@id"] = PAGE_URL["ko"]
            node["url"] = PAGE_URL["ko"]
            node["inLanguage"] = "ko"
        elif node.get("@type") == "Person":
            node["name"] = display_name(text, "ko")
            node["alternateName"] = display_name(text, "en")
            lines = role_lines(text, "ko")
            node["jobTitle"] = lines if len(lines) > 1 else lines[0]
            if "description" in node:
                node["description"] = ko["description"]
            # ko.html has no English text, so its facts use the Korean names
            # the page shows: an organisation's Hangul name first, then any
            # other short name it also shows (KAIST).
            orgs = as_list(node.get("alumniOf")) + [node.get("affiliation")]
            for org in (o for o in orgs if isinstance(o, dict)):
                korean_name(org)
            topics = as_list(node.get("knowsAbout"))
            missing = [t for t in topics if t not in KNOWS_ABOUT_KO]
            if missing:
                raise BuildError("no Korean form for knowsAbout %s: add it to KNOWS_ABOUT_KO "
                                 "in tools/build_ko_page.py" % ", ".join(map(repr, missing)))
            if topics:
                node["knowsAbout"] = [KNOWS_ABOUT_KO[t] for t in topics]
    return data


def as_list(value):
    if value is None:
        return []
    return value if isinstance(value, list) else [value]


def korean_name(org):
    names = [n for n in as_list(org.get("alternateName")) if isinstance(n, str)]
    hangul = [n for n in names if HANGUL.search(n)]
    if not hangul:
        raise BuildError("organisation %r in the JSON-LD needs a Korean alternateName"
                         % org.get("name"))
    others = [n for n in names if n not in hangul[:1] and not HANGUL.search(n)]
    org["name"] = hangul[0]
    if others:
        org["alternateName"] = others if len(others) > 1 else others[0]
    else:
        org.pop("alternateName", None)


def build(text):
    """Return the text of ko.html for the given index.html text."""
    newline = "\r\n" if "\r\n" in text else "\n"
    text = text.replace("\r\n", "\n")
    ko_block, ko = head_strings(text)
    en = english_head(text)

    # The English head strings take the Korean block's place, for site.js.
    indent = line_indent(text, text.find('<script id="ko-head"', ko_block.start()))
    pad = " " * indent
    en_block = (
        "<!--\n%s  Generated: the English head strings of index.html. site.js reads\n"
        "%s  \"title\" from here for the tab title when a reader switches to English.\n"
        "%s-->\n%s<script id=\"en-head\" type=\"application/json\">\n%s\n%s</script>"
        % (pad, pad, pad, pad, json_block(en, indent), pad)
    )
    text = text[:ko_block.start()] + en_block + text[ko_block.end():]

    ld = one(r'(<script type="application/ld\+json">)(.*?)(</script>)', text, "JSON-LD block")
    indent = line_indent(text, ld.start())
    text = (text[:ld.start()] + ld.group(1) + "\n"
            + json_block(korean_structured_data(ld.group(2), text, ko), indent)
            + "\n" + " " * indent + ld.group(3) + text[ld.end():])

    text = replace_tag(text, r"<html\b[^>]*>", "<html>", lambda t: set_attr(t, "lang", "ko"))
    text = replace_tag(text, r"<title>.*?</title>", "<title>",
                       lambda t: "<title>%s</title>" % text_escape(ko["title"]))
    for key, value in (
        ("description", ko["description"]),
        ("og:title", ko["title"]),
        ("og:description", ko["description"]),
        ("og:url", PAGE_URL["ko"]),
        ("og:site_name", ko["site_name"]),
        ("og:locale", "ko_KR"),
        ("og:locale:alternate", "en_US"),
        ("og:image:alt", ko["image_alt"]),
        ("twitter:title", ko["title"]),
        ("twitter:description", ko["description"]),
    ):
        text = replace_tag(text, meta_pattern(key), "<meta %s>" % key,
                           lambda t, v=value: set_attr(t, "content", v))
    if re.search(meta_pattern("twitter:image:alt"), text):
        text = replace_tag(text, meta_pattern("twitter:image:alt"), "<meta twitter:image:alt>",
                           lambda t: set_attr(t, "content", ko["image_alt"]))
    text = replace_tag(text, r'<link\b[^>]*?\srel="canonical"[^>]*>', "canonical link",
                       lambda t: set_attr(t, "href", PAGE_URL["ko"]))

    # Korean before first paint: site.css shows [lang="ko"] text on body.ko.
    def korean_body(tag):
        classes = (get_attr(tag, "class") or "").split()
        return set_attr(tag, "class", " ".join(classes + ["ko"]) if "ko" not in classes else " ".join(classes))
    text = replace_tag(text, r"<body\b[^>]*>", "<body>", korean_body)

    # The language link leads to the English page; the home link stays here.
    def english_link(tag):
        for name in ("aria-label", "lang", "href", "hreflang"):
            tag = set_attr(tag, name, BUTTON_IN_KOREAN[name])
        return tag
    text = replace_tag(text, r'<a\b[^>]*?\sid="langToggle"[^>]*>', "language link", english_link)
    text = replace_tag(text, r'<span id="langLabel">[^<]*</span>', "language link label",
                       lambda t: '<span id="langLabel">%s</span>' % BUTTON_IN_KOREAN["label"])
    text = replace_tag(text, r'<a\b[^>]*?\sclass="site-brand"[^>]*>', "home link (.site-brand)",
                       lambda t: set_attr(t, "href", PAGE_URL["ko"].rsplit("/", 1)[1]))
    # The Simulations page is English only; ?from=ko sends its CV links back
    # to this page (lab/lab.js). site.js sets the same address on index.html
    # while it shows Korean.
    text = replace_tag(text, r'<a\b[^>]*?\sclass="lab-link"[^>]*>', "Simulations link (.lab-link)",
                       lambda t: set_attr(t, "href", LAB_IN_KOREAN))
    text = korean_attributes(text)
    text = korean_only(text)

    doctype = one(r"\A<!doctype html>\n", text, "leading <!doctype html>")
    text = text[:doctype.end()] + BANNER + "\n" + text[doctype.end():]
    return text.replace("\n", newline)


def check():
    """None when ko.html matches index.html, else a one-line reason."""
    try:
        expected = build(SOURCE.read_text(encoding="utf-8"))
    except (OSError, BuildError) as exc:
        return "cannot build ko.html: %s" % exc
    if not TARGET.is_file():
        return "ko.html does not exist"
    if TARGET.read_text(encoding="utf-8") != expected:
        return "ko.html is out of date with index.html"
    return None


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--check", action="store_true",
                        help="exit 1 if ko.html differs from what index.html generates")
    args = parser.parse_args(argv)
    if args.check:
        problem = check()
        if problem:
            print("[FAIL] %s. Run: python tools/build_ko_page.py" % problem)
            return 1
        print("[ OK ] ko.html is up to date with index.html")
        return 0
    try:
        with SOURCE.open(encoding="utf-8", newline="") as fh:
            output = build(fh.read())
    except BuildError as exc:
        print("[FAIL] %s" % exc)
        return 1
    with TARGET.open("w", encoding="utf-8", newline="") as fh:
        fh.write(output)
    print("[ OK ] wrote ko.html from index.html")
    return 0


if __name__ == "__main__":
    sys.exit(main())

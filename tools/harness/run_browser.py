#!/usr/bin/env python3
"""Headless browser harness for ji-hun-git.github.io.

Serves the working tree, drives a real Chromium over every view state, and runs
tools/harness/dom_audit.js in each one. Also covers three things a DOM audit
cannot see by itself: console errors, whether the page still prints, and whether
the interactive controls actually do anything when clicked.

    python tools/harness/run_browser.py              # full sweep, human report
    python tools/harness/run_browser.py --json       # machine-readable
    python tools/harness/run_browser.py --state cv/en@desktop
    python tools/harness/run_browser.py --headed     # watch it run

Exit code 0 when no ERROR-level findings remain, 1 otherwise.

Requires Playwright:
    pip install playwright && python -m playwright install chromium
Without it the script says so and exits 2, so CI can tell "not installed" apart
from "found problems". The static half (static_checks.py) needs nothing at all.
"""

from __future__ import annotations

import argparse
import functools
import html
import http.server
import json
import re
import socket
import socketserver
import sys
import threading
from pathlib import Path
from urllib.parse import urlsplit

from static_checks import bookshelf_enabled, load_ko_builder

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
AUDIT_JS = HERE / "dom_audit.js"

try:  # pragma: no cover - host console
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

# The bookshelf (library view) sits behind BOOKSHELF_ENABLED in index.html.
# While it is off, / is the CV and this URL opens the bookshelf on local hosts
# only, for the rest of that tab. With the switch on it opens it too, so every
# suite that exercises the bookshelf starts here.
BOOKSHELF = "/?view=library"
PUBLIC_ORIGIN = "https://ji-hun-git.github.io"
PUBLIC_TEST_HOST = "public-site.example"  # any non-local name; see check_bookshelf_off

# state -> (path, body class to force, viewport)
VIEWPORTS = {
    "desktop": {"width": 1280, "height": 800},
    "mobile": {"width": 375, "height": 812},
}

STATES = [
    ("home/en", "/", None),
    ("home/ko", "/ko.html", None),
    ("library/en", "/index.html?view=library", None),
    ("library/ko", "/index.html?view=library", "ko"),
    ("cv/en", "/index.html?view=cv", None),
    ("cv/ko", "/index.html?view=cv", "ko"),
    ("lab", "/laboratory.html", None),
]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass

    def copyfile(self, source, outputfile):
        try:
            super().copyfile(source, outputfile)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
            pass  # Browsers cancel lazy-image requests when navigating away.


def serve(directory):
    """Serve `directory` on a free port; returns (port, shutdown_callable)."""
    handler = functools.partial(QuietHandler, directory=str(directory))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    port = httpd.server_address[1]
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return port, httpd.shutdown


KOREAN_ONLY_PATHS = ("/ko.html",)


def switch_language(page):
    """Click the language link as a script would.

    index.html carries both languages and switches in place; ko.html is Korean
    only, so there the link loads the English page. Returns True when the
    language changed within 5 s.
    """
    before = page.evaluate("document.documentElement.lang")
    in_place = page.evaluate("Boolean(document.querySelector('#cv-start [lang=\"en\"]'))")
    click = "document.getElementById('langToggle').click()"
    try:
        if in_place:
            page.evaluate(click)
        else:
            with page.expect_navigation(wait_until="load", timeout=5000):
                page.evaluate(click)
        page.wait_for_function("(lang) => document.documentElement.lang !== lang",
                               arg=before, timeout=5000)
        return True
    except Exception:
        return False


def korean_only_findings(page, label):
    """ko.html replaces the pairing rule: it must carry no English element."""
    english = page.evaluate("""() => [...document.querySelectorAll('body [lang="en"]')]
      .map((el) => el.outerHTML.slice(0, 80))""")
    return [{"level": "ERROR", "check": "korean-only", "state": label,
             "message": "%d English element(s) on the Korean page" % len(english),
             "detail": " | ".join(english[:3])}] if english else []


CV_SECTIONS = ("projects", "awards", "education", "publications", "patents")

# Every CV section open, with its button saying so (FOLDS_OPEN) -- a function,
# not an expression string: see PAPERS_READY below.
FOLDS_OPEN = """() => [...document.querySelectorAll('#cv-content .section-toggle')].every((b) =>
  b.getAttribute('aria-expanded') === 'true' &&
  !document.getElementById(b.getAttribute('aria-controls')).hasAttribute('hidden'))"""


def open_all_sections(page, restore_scroll=True):
    """Open every folded CV section the way a reader does: click its heading.

    site.js folds the CV's five sections on load, so only the overview and the
    five headings are visible. A suite that needs the whole CV (the text and
    contrast audits, overflow at full length, the KF-21 entry, the year
    filter) opens them here with the real toggles, so a toggle that stops
    working fails those suites as well. Nothing happens where no CV is shown
    (the bookshelf, the lab). Returns the number of sections it opened.
    """
    if not page.evaluate("() => Boolean(document.getElementById('cv-content')?.checkVisibility())"):
        return 0
    y = page.evaluate("() => scrollY")
    opened = 0
    for toggle in page.locator("#cv-content .section-toggle").all():
        if toggle.get_attribute("aria-expanded") != "true":
            toggle.click()
            opened += 1
    page.wait_for_function(FOLDS_OPEN, timeout=5000)
    if restore_scroll:
        page.evaluate("(y) => scrollTo({ top: y, behavior: 'instant' })", y)
    return opened


def audit_page(page, state, audit_src):
    """Run dom_audit.js in the page and return its report."""
    page.evaluate("window.__domAuditOpts = { settle: false };")
    page.evaluate(audit_src)
    return page.evaluate(
        "(state) => window.__domAuditSettled({ state, settleStep: 45, settleFinal: 250 })",
        state,
    )


def check_print(page, findings, state):
    """The CV must still be on the page when the media type is print.

    Why: index.html:70 hides #cv-start whenever data-view is 'library', and
    project-library.css:4023 hides .work-library inside its own @media print.
    On the default landing URL that hid both halves at once and Ctrl+P produced
    a near-blank sheet -- on a CV site, for the URL people actually share.
    """
    page.emulate_media(media="print")
    try:
        info = page.evaluate(
            """() => {
              const vis = (el) => {
                if (!el) return false;
                let e = el;
                while (e && e.nodeType === 1) {
                  const cs = getComputedStyle(e);
                  if (cs.display === 'none' || cs.visibility === 'hidden') return false;
                  e = e.parentElement;
                }
                return true;
              };
              const heads = [...document.querySelectorAll('h1,h2,h3')].filter(vis);
              return {
                cvVisible: vis(document.getElementById('cv-start')),
                headings: heads.length,
                firstHeading: heads.length ? heads[0].textContent.trim().slice(0, 40) : '',
                printedChars: (document.body.innerText || '').trim().length,
              };
            }"""
        )
    finally:
        page.emulate_media(media="screen")

    if info["printedChars"] < 500 or info["headings"] < 3:
        findings.append({
            "level": "ERROR", "check": "print", "state": state,
            "message": "printing this URL yields %d characters and %d visible headings"
                       % (info["printedChars"], info["headings"]),
            "detail": "a CV that cannot be printed from its own share URL",
        })
    return info


def check_publication_filter(page, findings, state):
    """Clicking a year filter must actually hide the other years.

    Why: `.item.hidden { display: none }` sat at specificity (0,2,0) against
    project-library.css:13784's `display: grid !important` at (2,4,2). Clicking
    a year added .hidden to 16 of 21 rows and hid none of them -- the button lit
    up, the badge updated, and the list did not move. Nothing in the DOM looks
    wrong in that state, so only a click-then-measure check catches it.
    """
    buttons = page.query_selector_all("#pubFilter button, .filter button")
    if not buttons:
        return None
    total = len(page.query_selector_all("#pubItems .item"))
    results = {}
    for btn in buttons:
        year = btn.get_attribute("data-year") or btn.inner_text().strip()[:4]
        btn.click()
        page.wait_for_timeout(220)
        visible = page.evaluate(
            "() => [...document.querySelectorAll('#pubItems .item')]"
            ".filter(i => getComputedStyle(i).display !== 'none').length"
        )
        results[year] = visible
        if year not in ("all", "All") and visible == total and total > 1:
            findings.append({
                "level": "ERROR", "check": "filter-inert", "state": state,
                "message": "year filter '%s' hides nothing (%d/%d still shown)"
                           % (year, visible, total),
                "detail": "a control that highlights but does not filter",
            })
    if results.get("all") not in (None, total):
        findings.append({
            "level": "ERROR", "check": "filter-inert", "state": state,
            "message": "'All' shows %s of %d publications" % (results.get("all"), total),
            "detail": "",
        })
    return results


BOOKSHELF_TRACES = """() => {
  const shown = [...document.querySelectorAll('a[href], button, [role="link"]')]
    .filter((el) => el.checkVisibility());
  const pointsAtShelf = (el) =>
    /bookshelf|책장/i.test(el.textContent + ' ' + (el.getAttribute('aria-label') || '')) ||
    /[?&](?:view=library|work=)|#archive$/.test(el.getAttribute('href') || '');
  return {
    controls: shown.filter(pointsAtShelf).map((el) => el.outerHTML.slice(0, 120)),
    mentions: /bookshelf|책장/i.test(document.body.innerText),
  };
}"""

# Pages declare a Content-Security-Policy without 'unsafe-eval', so a
# wait_for_function predicate must be a function: a bare expression string is
# evaluated with eval() in the page, which the policy blocks.
PAPERS_READY = "() => document.querySelectorAll('.cv-paper-heading').length === 21"

# A #fragment link lands its target where the CSS puts it: the root's
# scroll-padding-top (32px) plus the target's own scroll-margin-top (cv.css
# gives entries one that evens out their own top padding). Subpixel layout
# leaves it a fraction either side of that line, so the check allows 2px
# instead of testing against the line itself. A target too close to the end
# of the page lands as far as the page scrolls: at the end, anywhere in view.
LANDED = """(id) => {
  const el = document.getElementById(id);
  if (!el) return false;
  const px = (value) => parseFloat(value) || 0;
  const land = px(getComputedStyle(document.documentElement).scrollPaddingTop) +
    px(getComputedStyle(el).scrollMarginTop);
  const top = el.getBoundingClientRect().top;
  const end = scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 2;
  return top > -2 && (top < land + 2 || (end && top < innerHeight - 44));
}"""

# The page is scrolled as far as it goes.
AT_END = "() => scrollY > 0 && scrollY + innerHeight >= document.documentElement.scrollHeight - 2"


# The top of the first line of text a reader sees in an element (the text's
# own box, not its line box), or null.
FIRST_TEXT_TOP = """(id) => {
  const el = document.getElementById(id);
  if (!el) return null;
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) =>
    n.textContent.trim() && n.parentElement.checkVisibility() &&
    !n.parentElement.closest('.pl-sr-only, [aria-hidden="true"]')
      ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP });
  const node = walker.nextNode();
  if (!node) return null;
  const range = document.createRange();
  range.selectNodeContents(node);
  return range.getClientRects()[0]?.top ?? null;
}"""

# Where a landed section's, entry's or paper's first line of text must sit:
# the same line for all of them, a comfortable distance from the top of the
# window (the header is not sticky; it scrolls away). Measured 49-54px.
LANDING_LINE = (44, 56)

# Resolves once the page has not scrolled for three frames: a smooth scroll
# (an in-page link) has come to rest.
SCROLL_SETTLED = """() => new Promise((done) => {
  let last = scrollY, still = 0, frames = 0;
  const tick = () => {
    if (scrollY === last) still++;
    else { still = 0; last = scrollY; }
    if (still >= 3 || ++frames > 600) done(still >= 3);
    else requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})"""


def landed_on(page, anchor):
    """Wait for the page and its web fonts, then check #anchor's final place.

    Returns None when it landed, or where its top edge (or its first line of
    text, off the landing line) ended up. Checked after the fonts because
    their late arrival rewraps the text above the target, and once the scroll
    has come to rest, so a smooth scroll that only passes the target does not
    count.
    """
    page.wait_for_load_state("load")
    page.evaluate("""() => (document.fonts ? document.fonts.ready : Promise.resolve())
      .then(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))""")
    try:
        page.wait_for_function(LANDED, arg=anchor, timeout=5000)
        page.evaluate(SCROLL_SETTLED)
        if page.evaluate(LANDED, anchor):
            text = page.evaluate(FIRST_TEXT_TOP, anchor)
            low, high = LANDING_LINE
            if isinstance(text, (int, float)) and low <= text <= high:
                return None
            # Near the end of the page the target cannot rise to the line.
            if (isinstance(text, (int, float)) and text > high and page.evaluate(AT_END)
                    and text < page.evaluate("() => innerHeight")):
                return None
            return "first line of text at %s px, off the %d-%d px landing line" % (
                round(text, 1) if isinstance(text, (int, float)) else text, low, high)
    except Exception:
        pass
    top = page.evaluate("(id) => document.getElementById(id)?.getBoundingClientRect().top ?? null",
                        anchor)
    return "top at %s px" % (round(top, 1) if isinstance(top, (int, float)) else top)


FOLD_SUMMARY = """(anchor) => {
  const target = anchor ? document.getElementById(anchor) : null;
  return [...document.querySelectorAll('#cv-content .section-toggle')].map((b) => {
    const section = b.closest('section');
    const body = document.getElementById(b.getAttribute('aria-controls'));
    return {
      id: section.id,
      expanded: b.getAttribute('aria-expanded') === 'true',
      hidden: body.getAttribute('hidden'),
      shown: body.getBoundingClientRect().height > 0,
      holdsTarget: Boolean(target && section.contains(target)),
    };
  });
}"""

# The CV card's insets around its content: the folded card hugs its content,
# so the space under the footer equals the space above the overview.
CARD_INSETS = """() => {
  const card = document.getElementById('cv-content');
  const cs = getComputedStyle(card);
  const box = card.getBoundingClientRect();
  const first = card.firstElementChild.getBoundingClientRect();
  const last = card.querySelector('.site-footer').getBoundingClientRect();
  return {
    top: first.top - box.top - parseFloat(cs.borderTopWidth),
    bottom: box.bottom - parseFloat(cs.borderBottomWidth) - last.bottom,
  };
}"""

# An in-page link to `hash`, put in the overview the way an author would.
IN_PAGE_LINK = """(hash) => {
  const link = document.createElement('a');
  link.id = 'link-probe-' + hash.slice(1);
  link.href = hash;
  link.textContent = hash;
  document.querySelector('.cv-overview').append(link);
  return link.id;
}"""

# The page's layout-shift sum (CLS without session windows), from the start.
LAYOUT_SHIFT_INIT = """window.__layoutShift = 0;
try {
  new PerformanceObserver((list) => {
    for (const entry of list.getEntries())
      if (!entry.hadRecentInput) window.__layoutShift += entry.value;
  }).observe({ type: 'layout-shift', buffered: true });
} catch (e) { window.__layoutShift = null; }"""

# What a reader sees in the CV's main column: each visible element with text
# of its own, by where it sits.
MAIN_COLUMN = """() => {
  const main = document.getElementById('cv-content');
  const own = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const placed = { overview: [], caps: [], headings: [], footer: [], other: [] };
  for (const el of main.querySelectorAll('*')) {
    if (!own(el) || !el.checkVisibility() || el.closest('.pl-sr-only')) continue;
    const where = el.closest('.cv-overview') ? 'overview'
      : el.closest('details.caps > summary') ? 'caps'
      : el.closest('.section-title, .section-head') ? 'headings'
      : el.closest('.site-footer') ? 'footer' : 'other';
    placed[where].push(el.textContent.replace(/\\s+/g, ' ').trim());
  }
  return {
    placed,
    rows: [...main.querySelectorAll('.section-toggle')].map((b) =>
      Math.round(b.getBoundingClientRect().height)),
    counters: document.querySelectorAll('.cv-index').length,
    capsOpen: document.querySelector('details.caps').open,
    items: [...main.querySelectorAll('.item')].filter((el) => el.checkVisibility()).length,
  };
}"""

# The copy the owner wants alone on the landing, and the five headings.
FOLDED_LANDING = {
    "en": {
        "overview": ["Curriculum vitae", "Human-centered AI",
                     "I build and research interactive systems around humans and AI."],
        "caps": ["Methods and tools"],
        "titles": ["Research and development", "Awards and selections", "Education",
                   "Publications", "Patents and certifications"],
    },
    "ko": {
        "overview": ["이력서", "인간 중심 AI", "사람과 AI를 중심으로 인터랙티브 시스템을 만들고 연구합니다."],
        "caps": ["방법과 도구"],
        "titles": ["연구개발", "수상 및 선정", "학력", "논문", "특허 및 자격증"],
    },
}


def check_section_folds(browser, base, findings):
    """The CV opens on its overview, with five folded sections that open.

    Why: the owner asked (Oct 2026) that the CV open on "Human-centered AI"
    and its one-line introduction alone, every section folded, and the
    overview's counter strip gone. Folding must not cost anything: each
    heading is a real button (mouse, Enter, Space) whose aria-expanded tracks
    its section; sections open independently; a shared link
    (?view=cv#publications, #cv-work-<slug>, ?work=<slug> in
    check_bookshelf_off), an in-page link, a #fragment change and find in
    page open what they point to and land on it; the printed CV is whole
    (rebuild_checks.py counts its pages); without scripts nothing is folded;
    ko.html behaves the same; and no width scrolls sideways.
    """
    def fail(where, message, detail=""):
        findings.append({"level": "ERROR", "check": "section-folds", "state": "section-folds",
                         "message": "%s: %s" % (where, message), "detail": detail})

    def expect_open(where, page, wanted, anchor=None):
        """Exactly the sections in `wanted` open, their buttons in step."""
        for fold in page.evaluate(FOLD_SUMMARY, anchor):
            want = fold["id"] in wanted
            if (fold["expanded"], fold["shown"], fold["hidden"]) != (
                    want, want, None if want else "until-found"):
                fail(where, "#%s should be %s" % (fold["id"], "open" if want else "folded"),
                     json.dumps(fold))

    def toggle(page, sid):
        return page.locator("#%s .section-toggle" % sid)

    count = 0
    errors = []

    def new_page(ctx):
        page = ctx.new_page()
        page.on("pageerror", lambda e: errors.append(str(e)))
        return page

    # The landing: overview, the toolkit's summary and five folded headings.
    for lang, path in (("en", "/"), ("ko", "/ko.html")):
        for viewport, mobile in ((VIEWPORTS["desktop"], False), ({"width": 390, "height": 844}, True)):
            where = "%s@%d" % (path, viewport["width"])
            ctx = browser.new_context(viewport=viewport, is_mobile=mobile, has_touch=mobile)
            page = new_page(ctx)
            page.goto(base + path, wait_until="load")
            expect_open(where, page, ())
            seen = page.evaluate(MAIN_COLUMN)
            want = FOLDED_LANDING[lang]
            if seen["counters"]:
                fail(where, "the overview's counter strip is back")
            if seen["placed"]["overview"] != want["overview"]:
                fail(where, "the overview shows %r" % seen["placed"]["overview"])
            if seen["placed"]["caps"] != want["caps"] or seen["capsOpen"]:
                fail(where, "Methods and tools is not one folded summary: %r"
                     % seen["placed"]["caps"])
            titles = [t for t in seen["placed"]["headings"] if t in want["titles"]]
            if titles != want["titles"]:
                fail(where, "the section headings read %r" % titles)
            if seen["placed"]["other"] or seen["items"]:
                fail(where, "%d entries and other text show before any section is opened"
                     % seen["items"], " | ".join(seen["placed"]["other"][:4]))
            if min(seen["rows"]) < 44:
                fail(where, "a heading row is %dpx tall, under the 44px target" % min(seen["rows"]))
            # The folded card hugs its content: no stretch to the sidebar's
            # height, so the space under the footer is the space above the
            # overview, whatever the language or the width.
            insets = page.evaluate(CARD_INSETS)
            if abs(insets["top"] - insets["bottom"]) > 1:
                fail(where, "the folded card's insets are %.1fpx above and %.1fpx below"
                     % (insets["top"], insets["bottom"]))
            if page.locator(".mobile-nav").count():
                fail(where, "the section bar is back")
            ctx.close()
            count += 1

    # Mouse, keyboard and the whole row; sections open independently.
    for lang, path in (("en", "/"), ("ko", "/ko.html")):
        ctx = browser.new_context(viewport=VIEWPORTS["desktop"])
        page = new_page(ctx)
        page.goto(base + path, wait_until="load")
        toggle(page, "projects").click()
        expect_open(path + " click R&D", page, ("projects",))
        if not page.locator("#cv-work-inclusive-game-ai").is_visible():
            fail(path, "the first R&D entry is not visible once R&D is open")
        toggle(page, "publications").click()
        expect_open(path + " click Publications", page, ("projects", "publications"))
        toggle(page, "projects").click()
        expect_open(path + " click R&D again", page, ("publications",))
        toggle(page, "awards").focus()
        page.keyboard.press("Enter")
        expect_open(path + " Enter on Awards", page, ("publications", "awards"))
        page.keyboard.press("Space")
        expect_open(path + " Space on Awards", page, ("publications",))
        if page.evaluate("() => document.activeElement?.closest('#awards .section-toggle') === null"):
            fail(path, "the Awards button lost focus while it toggled")
        # The far end of a row (the chevron) toggles too, and on the
        # Publications row the Google Scholar link stays its own target.
        heading = page.locator("#education .section-title")
        box = heading.bounding_box()
        heading.click(position={"x": box["width"] - 10, "y": box["height"] / 2})
        expect_open(path + " click the end of the Education row", page, ("publications", "education"))
        row = page.locator("#publications .section-head")
        box = row.bounding_box()
        row.click(position={"x": box["width"] - 10, "y": box["height"] / 2})
        expect_open(path + " click the end of the Publications row", page, ("education",))
        if not page.evaluate("""() => {
              const link = document.querySelector('#publications .title-aside');
              link.scrollIntoView({ block: 'center', behavior: 'instant' });
              const r = link.getBoundingClientRect();
              return document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2)?.closest('a') === link;
            }"""):
            fail(path, "the Google Scholar link is covered by the Publications button")
        ctx.close()
        count += 1

    # Links: on load, an in-page section link (twice), an in-page #cv-work-
    # link, a #fragment change, and a fragment into a folded section
    # (beforematch).
    ctx = browser.new_context(viewport=VIEWPORTS["desktop"])
    page = new_page(ctx)
    for path, anchor, section in (("/?view=cv#publications", "publications", "publications"),
                                  ("/ko.html?view=cv#publications", "publications", "publications"),
                                  ("/#cv-work-camouflage-effectiveness",
                                   "cv-work-camouflage-effectiveness", "projects"),
                                  ("/ko.html#cv-work-camouflage-effectiveness",
                                   "cv-work-camouflage-effectiveness", "projects")):
        page.goto(base + path, wait_until="load")
        expect_open(path, page, (section,))
        missed = landed_on(page, anchor)
        if missed:
            fail(path, "#%s was not scrolled into view" % anchor, missed)
        count += 1
    page.goto(base + "/", wait_until="load")
    link = page.locator("#" + page.evaluate(IN_PAGE_LINK, "#awards"))
    for attempt in ("a #awards link", "a #awards link again"):
        link.click()
        expect_open("/ " + attempt, page, ("awards",))
        missed = landed_on(page, "awards")
        if missed:
            fail("/ " + attempt, "#awards was not scrolled into view", missed)
    page.locator("#" + page.evaluate(IN_PAGE_LINK, "#cv-work-camouflage-effectiveness")).click()
    expect_open("/ a #cv-work- link", page, ("awards", "projects"))
    missed = landed_on(page, "cv-work-camouflage-effectiveness")
    if missed:
        fail("/ a #cv-work- link", "the KF-21 entry was not scrolled into view", missed)
    page.evaluate("() => { location.hash = '#education'; }")
    page.wait_for_function("() => document.querySelector('#education .section-toggle')"
                           ".getAttribute('aria-expanded') === 'true'", timeout=5000)
    expect_open("/ #education typed", page, ("awards", "projects", "education"))
    missed = landed_on(page, "education")
    if missed:
        fail("/ #education typed", "#education was not scrolled into view", missed)
    toggle(page, "awards").click()
    page.evaluate("""() => document.getElementById('awards-body')
      .addEventListener('beforematch', () => { window.__beforematch = true; })""")
    page.evaluate("() => { location.hash = '#cv-work-krafton-fde-challenge'; }")
    page.wait_for_function("() => document.querySelector('#awards .section-toggle')"
                           ".getAttribute('aria-expanded') === 'true'", timeout=5000)
    expect_open("/ a fragment into folded Awards", page, ("awards", "projects", "education"))
    if not page.evaluate("() => window.__beforematch === true"):
        fail("/ a fragment into folded Awards", "the browser did not reveal it through beforematch")
    missed = landed_on(page, "cv-work-krafton-fde-challenge")
    if missed:
        fail("/ a fragment into folded Awards", "the entry was not scrolled into view", missed)
    # Find in page: a text fragment is the browser's own search, with no
    # #id and no hashchange. It reveals the folded entry (beforematch), and
    # the button must follow.
    for path, words in (("/", "Top%203%20Finalist"), ("/ko.html", "%EC%B5%9C%EC%A2%85%203%EC%9D%B8")):
        page.close()  # a fresh load, not a same-page fragment change
        page = new_page(ctx)
        page.goto(base + path + "#:~:text=" + words, wait_until="load")
        try:
            page.wait_for_function("() => !document.getElementById('awards-body').hasAttribute('hidden')",
                                   timeout=5000)
        except Exception:
            fail(path + " find in page", "the browser's search did not reveal the folded entry")
        expect_open(path + " find in page", page, ("awards",))
    ctx.close()
    count += 7

    # Printing: every section on paper, then the reader's own state again.
    for path in ("/", "/ko.html"):
        ctx = browser.new_context(viewport=VIEWPORTS["desktop"])
        page = new_page(ctx)
        page.goto(base + path, wait_until="load")
        toggle(page, "publications").click()
        page.emulate_media(media="print")
        printed = page.evaluate("""() => ({
          bodies: [...document.querySelectorAll('.section-body')]
            .filter((b) => b.getBoundingClientRect().height > 0).length,
          items: [...document.querySelectorAll('#cv-content .item')]
            .filter((el) => el.checkVisibility()).length,
          headings: [...document.querySelectorAll('.section-toggle')]
            .filter((el) => el.checkVisibility()).length,
        })""")
        page.emulate_media(media="screen")
        if printed != {"bodies": 5, "items": 43, "headings": 5}:
            fail(path + " print", "folded sections do not print whole", json.dumps(printed))
        expect_open(path + " after print media", page, ("publications",))
        page.evaluate("() => dispatchEvent(new Event('beforeprint'))")
        expect_open(path + " beforeprint", page, CV_SECTIONS)
        page.evaluate("() => dispatchEvent(new Event('afterprint'))")
        expect_open(path + " afterprint", page, ("publications",))
        page.pdf(format="A4")
        expect_open(path + " after page.pdf()", page, ("publications",))
        ctx.close()
        count += 1

    # Without scripts nothing folds: every entry is there to read.
    ctx = browser.new_context(viewport=VIEWPORTS["desktop"], java_script_enabled=False)
    page = ctx.new_page()
    for path in ("/", "/ko.html"):
        page.goto(base + path, wait_until="load")
        expect_open(path + " without JavaScript", page, CV_SECTIONS)
        raw = page.evaluate("""() => ({
          items: [...document.querySelectorAll('#cv-content .item')]
            .filter((el) => el.checkVisibility()).length,
          marks: [...document.querySelectorAll('.section-toggle')]
            .filter((b) => !['none', 'normal'].includes(getComputedStyle(b, '::after').content)).length,
        })""")
        if raw != {"items": 43, "marks": 0}:
            fail(path + " without JavaScript", "not every entry shows, or a fold mark is drawn",
                 json.dumps(raw))
        count += 1
    ctx.close()

    # site.js blocked or broken while the <head> script ran: the page shows
    # every entry once it has loaded, and draws no control it cannot keep (no
    # chevron, no pointer on the headings).
    ctx = browser.new_context(viewport=VIEWPORTS["desktop"])
    page = new_page(ctx)
    page.route("**/assets/site.js*", lambda route: route.abort())
    for path in ("/", "/ko.html#publications"):
        page.goto(base + path, wait_until="load")
        raw = page.evaluate("""() => ({
          items: [...document.querySelectorAll('#cv-content .item')]
            .filter((el) => el.checkVisibility({ visibilityProperty: true })).length,
          marks: [...document.querySelectorAll('.section-toggle')]
            .filter((b) => !['none', 'normal'].includes(getComputedStyle(b, '::after').content)).length,
          pointer: [...document.querySelectorAll('.section-toggle')]
            .filter((b) => getComputedStyle(b).cursor === 'pointer').length,
        })""")
        if raw != {"items": 43, "marks": 0, "pointer": 0}:
            fail(path + " without site.js", "not every entry shows, or a dead fold control is drawn",
                 json.dumps(raw))
        count += 1
    ctx.close()

    # A shared deep link on a slow connection: until site.js has opened the
    # section, the folded list is not drawn only to be pushed out of view.
    # site.js is held back 1.2 s; the page must not shift, and must land.
    for path, anchor in (("/#awards", "awards"), ("/?view=cv#publications", "publications")):
        for viewport, mobile in ((VIEWPORTS["desktop"], False), ({"width": 390, "height": 844}, True)):
            where = "%s@%d with site.js late" % (path, viewport["width"])
            ctx = browser.new_context(viewport=viewport, is_mobile=mobile, has_touch=mobile)
            page = new_page(ctx)
            page.add_init_script(LAYOUT_SHIFT_INIT)
            held = []
            page.route("**/assets/site.js*", lambda route: held.append(route))
            page.goto(base + path, wait_until="commit")
            page.wait_for_timeout(1200)
            chevrons_up = page.evaluate("""() => [...document.querySelectorAll('.section-toggle')]
              .filter((b) => /^matrix\\(-0\\.7/.test(getComputedStyle(b, '::after').transform)).length""")
            if chevrons_up:
                fail(where, "%d heading(s) show an open chevron over a folded section" % chevrons_up)
            for route in held:
                route.continue_()
            page.unroute("**/assets/site.js*")
            missed = landed_on(page, anchor)
            if missed:
                fail(where, "#%s was not scrolled into view" % anchor, missed)
            shift = page.evaluate("() => window.__layoutShift")
            if shift is None or shift >= 0.01:
                fail(where, "the page shifted (layout-shift sum %s) while the section opened"
                     % (round(shift, 3) if isinstance(shift, (int, float)) else shift))
            ctx.close()
            count += 1

    # No sideways scroll, folded or open (Methods and tools too: its longest
    # items have no break opportunity); also with the text enlarged in the
    # browser (sizes are rem, so they follow the reader's default font size:
    # WCAG 1.4.4), where the header's controls take a row of their own rather
    # than overlap the brand. In two columns the enlarged address breaks
    # inside the sidebar instead of running into the card.
    for width, text in ((320, 100), (390, 100), (1440, 100), (320, 150), (360, 150),
                        (390, 150), (320, 200), (360, 200), (390, 200), (900, 150),
                        (900, 200), (1440, 200)):
        for path in ("/", "/ko.html"):
            mobile = width < 760
            ctx = browser.new_context(viewport={"width": width, "height": 844 if mobile else 900},
                                      is_mobile=mobile, has_touch=mobile)
            page = new_page(ctx)
            page.goto(base + path, wait_until="load")
            if text != 100:
                page.evaluate("(pct) => { document.documentElement.style.fontSize = pct + '%'; }", text)
            page.evaluate("() => document.fonts.ready")
            where = "%s@%d%s" % (path, width, "" if text == 100 else " text %d%%" % text)
            for state in ("folded", "open"):
                if state == "open":
                    open_all_sections(page)
                    page.evaluate("() => { document.querySelector('details.caps').open = true; }")
                wide = page.evaluate("() => document.documentElement.scrollWidth - innerWidth")
                if wide > 0:
                    fail("%s %s" % (where, state), "the page scrolls sideways by %dpx" % wide)
            if not mobile:
                spill = page.evaluate("""() => {
                  const column = document.querySelector('.sidebar').getBoundingClientRect();
                  return Math.max(...[...document.querySelectorAll('.sidebar a')]
                    .filter((a) => a.checkVisibility())
                    .map((a) => a.getBoundingClientRect().right - column.right));
                }""")
                if spill > 0.5:
                    fail(where, "a sidebar link runs %.1fpx out of its column" % spill)
            overlap = page.evaluate("""() => {
              const box = (s) => document.querySelector(s).getBoundingClientRect();
              const brand = box('.site-brand'), controls = box('.site-controls');
              const header = box('.site-header');
              const sameRow = brand.bottom > controls.top && controls.bottom > brand.top;
              return (sameRow && brand.right > controls.left) || controls.right > header.right + 0.5;
            }""")
            if overlap:
                fail(where, "the header's controls overlap the brand or leave the header")
            ctx.close()
            count += 1

    # A larger default text size in the browser's settings (not zoom, and not
    # the page's own font-size above: only this one reaches media queries)
    # makes the sticky card taller than some windows. With every section
    # open, "Get in touch" must come fully into view within the first
    # window-height of scroll, not only at the end of the page: the card
    # either sticks whole or scrolls with the page (cv.css). The last two
    # windows are just taller than a limit written in em alone would allow.
    for width, height, size in ((1440, 900, 20), (1440, 900, 24), (900, 900, 20),
                                (900, 900, 24), (1920, 1080, 20), (1920, 1200, 24),
                                (1440, 1500, 28)):
        for path in ("/", "/ko.html"):
            ctx = browser.new_context(viewport={"width": width, "height": height})
            page = new_page(ctx)
            cdp = ctx.new_cdp_session(page)
            cdp.send("Page.setFontSizes", {"fontSizes": {"standard": size, "fixed": 13}})
            page.goto(base + path, wait_until="load")
            page.evaluate("() => document.fonts.ready")
            open_all_sections(page)
            where = "%s@%dx%d default text %dpx" % (path, width, height, size)
            seen = page.evaluate("""async () => {
              const cta = document.getElementById('ctaButton');
              for (let y = 0; y <= innerHeight; y += 25) {
                scrollTo({ top: y, behavior: 'instant' });
                await new Promise(requestAnimationFrame);
                const r = cta.getBoundingClientRect();
                if (r.height > 0 && r.top >= 0 && r.bottom <= innerHeight) return y;
              }
              return null;
            }""")
            if seen is None:
                fail(where, "\"Get in touch\" stays out of view for the first window-height "
                     "of scroll (the sticky card is taller than the window)")
            ctx.close()
            count += 1
    for e in errors:
        fail("page error", e[:160])
    return count


def check_bookshelf_off(browser, base, public, findings):
    """With BOOKSHELF_ENABLED false, the site is the CV and only the CV.

    Why: the owner switched the bookshelf off "for now" and shares
    /?view=cv#publications. On any host but a local one the bookshelf must never
    render, its ~250 KB of scripts and styles must not be downloaded, nothing
    visible may lead to it, and an old ?work=<slug> link should still open its
    CV entry. `public` reaches the local server under a non-local host name,
    which is what the head script's host check reads.
    """
    def fail(where, message, detail=""):
        findings.append({"level": "ERROR", "check": "bookshelf-off", "state": "bookshelf-off",
                         "message": "%s: %s" % (where, message), "detail": detail})

    # (url, anchor to land on, language, canonical path). The canonical is the
    # static one in the <head> of the page that ends up loaded: an old ?lang=ko
    # link is sent on to /ko.html by the head script, so it is served, and is
    # canonical, as /ko.html.
    cases = [
        (base + "/", None, "en", "/"),
        (public + "/", None, "en", "/"),
        (public + "/ko.html", None, "ko", "/ko.html"),
        (public + "/?view=cv", None, "en", "/"),
        (public + "/?view=cv#publications", "publications", "en", "/"),
        (public + "/?view=library", None, "en", "/"),
        (public + "/ko.html?view=library", None, "ko", "/ko.html"),
        (public + "/?work=gaia-design-principles&lang=ko",
         "cv-work-gaia-design-principles", "ko", "/ko.html"),
        (public + "/?work=camouflage-effectiveness",
         "cv-work-camouflage-effectiveness", "en", "/"),
        (public + "/?work=no-such-record", None, "en", "/"),
    ]
    for url, anchor, lang, canonical in cases:
        state = url.replace(base, "(local)").replace(public, "(public)")
        ctx = browser.new_context(viewport=VIEWPORTS["desktop"])
        page = ctx.new_page()
        requested, errors = [], []
        page.on("request", lambda r: requested.append(r.url))
        page.on("pageerror", lambda e: errors.append(str(e)))
        page.goto(url, wait_until="load")
        page.wait_for_timeout(300)
        info = page.evaluate("""() => ({
          view: document.documentElement.dataset.view,
          bookshelf: document.documentElement.dataset.bookshelf,
          lang: document.documentElement.lang,
          cv: Boolean(document.getElementById('cv-start')?.checkVisibility()),
          shelf: Boolean(document.getElementById('work-library')?.checkVisibility()),
          papers: document.querySelectorAll('#pubItems .cv-paper-heading').length,
          books: document.querySelectorAll('[data-pl-book], .catalog-row').length,
          canonical: document.querySelector('link[rel="canonical"]')?.href,
          href: location.href,
        })""")
        if (info["view"], info["bookshelf"], info["cv"], info["shelf"], info["books"]) != \
                ("cv", "off", True, False, 0):
            fail(state, "the CV is not what renders", json.dumps(info))
        if info["papers"] != 21:
            fail(state, "CV citations were not laid out (%d of 21)" % info["papers"])
        if info["canonical"] != PUBLIC_ORIGIN + canonical:
            fail(state, "canonical URL is %s, not %s" % (info["canonical"], PUBLIC_ORIGIN + canonical))
        if info["lang"] != lang:
            fail(state, "page language is %s, expected %s" % (info["lang"], lang))
        shelf_files = [u for u in requested if "/assets/project-library/" in u]
        if shelf_files:
            fail(state, "downloads bookshelf files: %s" % ", ".join(
                urlsplit(u).path.rsplit("/", 1)[-1] for u in shelf_files))
        if "work=" in info["href"]:
            fail(state, "the ?work= link was not rewritten: %s" % info["href"])
        # The link opens the section it points into, and only that one.
        for fold in page.evaluate(FOLD_SUMMARY, anchor):
            if fold["expanded"] != fold["holdsTarget"] or fold["hidden"] != (
                    None if fold["expanded"] else "until-found"):
                fail(state, "section #%s is %s" % (fold["id"], "open" if fold["expanded"] else "folded"),
                     json.dumps(fold))
        if anchor:
            if not info["href"].endswith("#" + anchor):
                fail(state, "expected to land on #%s, URL is %s" % (anchor, info["href"]))
            missed = landed_on(page, anchor)
            if missed:
                fail(state, "#%s was not scrolled into view" % anchor, missed)
        seen = len(requested)
        for _ in range(2):  # both languages
            traces = page.evaluate(BOOKSHELF_TRACES)
            if traces["controls"]:
                fail(state, "visible controls lead to the bookshelf",
                     " | ".join(traces["controls"]))
            if traces["mentions"]:
                fail(state, "visible text mentions the bookshelf (%s)"
                     % page.evaluate("document.documentElement.lang"))
            # A script click: a stray modal must be reported, not time out.
            # From ko.html this loads the English page, still on this host.
            if not switch_language(page):
                fail(state, "the language link did not switch from %s"
                     % page.evaluate("document.documentElement.lang"))
            page.wait_for_timeout(150)
        shelf_files = [u for u in requested[seen:] if "/assets/project-library/" in u]
        if shelf_files:
            fail(state, "downloads bookshelf files after a language switch: %s" % ", ".join(
                urlsplit(u).path.rsplit("/", 1)[-1] for u in shelf_files))
        for e in errors:
            fail(state, "page error: " + e[:160])
        ctx.close()
    # A link to the KF-21 entry (or an old bookshelf link to that record) moves
    # focus to the entry while the page loads. That is no request for the
    # flyby: it must not start, nor load jet-flyby.js and Three.js.
    flyby_cases = [
        public + "/#cv-work-camouflage-effectiveness",
        public + "/?view=cv#cv-work-camouflage-effectiveness",
        public + "/?work=camouflage-effectiveness",
    ]
    for url in flyby_cases:
        state = url.replace(public, "(public)")
        ctx = browser.new_context(viewport=VIEWPORTS["desktop"])
        page = ctx.new_page()
        requested = []
        page.on("request", lambda r: requested.append(r.url))
        page.goto(url, wait_until="load")
        page.wait_for_timeout(1000)
        loaded = [u for u in requested if "jet-flyby" in u or "three" in u]
        if loaded or page.locator(".kf21-flyby").count():
            fail(state, "the KF-21 flyby started without any pointer or key",
                 ", ".join(urlsplit(u).path.rsplit("/", 1)[-1] for u in loaded))
        ctx.close()
    return len(cases) + len(flyby_cases)


def check_simulations_off(browser, public, findings):
    """With SIMULATIONS_ENABLED false, the Simulations page sends visitors to the CV.

    Why: the owner asked to "remove Simulations tab (disable it for now)". An
    old link or a search result can still reach /laboratory.html; on any host
    but a local one it goes straight on to the CV (from the Korean CV,
    ?from=ko, to the Korean page). On a local server it keeps working, which
    the "lab" state and lab_checks.py rely on.
    """
    def fail(where, message, detail=""):
        findings.append({"level": "ERROR", "check": "simulations-off", "state": "simulations-off",
                         "message": "%s: %s" % (where, message), "detail": detail})

    cases = (("/laboratory.html", "/", "en"), ("/laboratory.html?from=ko", "/ko.html", "ko"),
             ("/laboratory.html#plinko", "/", "en"))
    # A replaced page adds no history entry: as many entries as loading the
    # CV itself in a new tab.
    ctx = browser.new_context(viewport=VIEWPORTS["desktop"])
    page = ctx.new_page()
    page.goto(public + "/", wait_until="load")
    entries = page.evaluate("() => history.length")
    ctx.close()
    for path, want, lang in cases:
        ctx = browser.new_context(viewport=VIEWPORTS["desktop"])
        page = ctx.new_page()
        errors = []
        page.on("pageerror", lambda e: errors.append(str(e)))
        try:
            page.goto(public + path, wait_until="commit")
            page.wait_for_url(lambda url: "laboratory" not in url, timeout=10000)
            page.wait_for_load_state("load")
            page.wait_for_function(PAPERS_READY, timeout=10000)
        except Exception as exc:
            fail(path, "did not go on to the CV", str(exc)[:160])
            ctx.close()
            continue
        if urlsplit(page.url).path != want:
            fail(path, "went to %s, expected %s" % (urlsplit(page.url).path, want))
        if page.evaluate("document.documentElement.lang") != lang:
            fail(path, "the CV it went to is in %s, expected %s"
                 % (page.evaluate("document.documentElement.lang"), lang))
        if page.evaluate("() => history.length") != entries:
            fail(path, "the redirect left the Simulations page in the history (use location.replace)",
                 "%d entries, %d for the CV alone" % (page.evaluate("() => history.length"), entries))
        for e in errors:
            fail(path, "page error: " + e[:160])
        ctx.close()
    return len(cases)


# The site header: what it holds, and how its text is set.
HEADER_STATE = """() => {
  const header = document.querySelector('.site-header');
  const baseline = (el) => {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: (n) =>
      n.textContent.trim() && n.parentElement.checkVisibility()
        ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP });
    const node = walker.nextNode();
    if (!node) return null;
    const probe = document.createElement('span');
    probe.style.cssText = 'display:inline-block;width:0;height:0;vertical-align:baseline';
    node.before(probe);
    const y = probe.getBoundingClientRect().top;
    probe.remove();
    return Math.round(y * 10) / 10;
  };
  const items = [...header.querySelectorAll('a, button, input, select, [tabindex]')]
    .filter((el) => el.checkVisibility())
    .map((el) => {
      const cs = getComputedStyle(el);
      const box = el.getBoundingClientRect();
      return { name: el.id || el.className, text: el.innerText.trim(), top: Math.round(box.top),
               height: Math.round(box.height), width: box.width, baseline: baseline(el),
               size: cs.fontSize, family: cs.fontFamily, weight: cs.fontWeight,
               lineHeight: cs.lineHeight, color: cs.color, decoration: cs.textDecorationLine,
               background: cs.backgroundColor };
    });
  const reader = document.getElementById('ttsToggle');
  return {
    height: Math.round(header.getBoundingClientRect().height),
    items,
    removed: ['#printCV', '.mobile-nav', '.lab-link', 'a[href*="laboratory"]']
      .filter((s) => document.querySelector(s)),
    reader: { title: reader.getAttribute('title'), label: reader.getAttribute('aria-label') },
  };
}"""

# Every visible text in the header and the CV, against the type scale: six
# sizes, two weights, one family, five colour roles (site.css :root).
TYPE_SCALE = """() => {
  const root = getComputedStyle(document.documentElement);
  const rgb = (value) => {
    const probe = document.createElement('i');
    probe.style.color = value;
    document.body.append(probe);
    const out = getComputedStyle(probe).color;
    probe.remove();
    return out;
  };
  const colours = new Set(['--ink', '--ink-soft', '--meta', '--accent', '--on-ink']
    .map((name) => rgb(root.getPropertyValue(name).trim())));
  const sizes = new Set([13, 16, 18, 20, 24, 28]);
  const weights = new Set(['400', '600']);
  const family = getComputedStyle(document.body).fontFamily;
  const own = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const bad = [];
  let measured = 0;
  for (const el of document.querySelectorAll('.site-header *, #cv-start *')) {
    if (!own(el) || !el.checkVisibility() || el.closest('.pl-sr-only')) continue;
    measured++;
    const cs = getComputedStyle(el);
    const problems = [];
    if (!sizes.has(parseFloat(cs.fontSize))) problems.push('size ' + cs.fontSize);
    if (!weights.has(cs.fontWeight)) problems.push('weight ' + cs.fontWeight);
    if (cs.fontFamily !== family) problems.push('family ' + cs.fontFamily);
    if (!colours.has(cs.color)) problems.push('colour ' + cs.color);
    if (problems.length)
      bad.push(el.tagName.toLowerCase() + (el.className ? '.' + el.className : '') + ' "' +
        el.textContent.trim().slice(0, 24) + '": ' + problems.join(', '));
  }
  return { measured, bad };
}"""

# Every margin, padding and gap in the CV's two columns, against the 4-point
# scale (site.css :root). 13 is a 12px gap plus its 1px hairline (the meta
# row's separators); negative values give back a touch target's slack or
# reach into a clipped margin.
SPACE_SCALE = """() => {
  const scale = new Set([0, 4, 8, 12, 13, 16, 20, 24, 32, 40, 48, 64, 96]);
  const props = ['marginTop', 'marginRight', 'marginBottom', 'marginLeft', 'paddingTop',
                 'paddingRight', 'paddingBottom', 'paddingLeft', 'rowGap', 'columnGap'];
  const bad = [];
  let measured = 0;
  for (const el of document.querySelectorAll('#cv-start .layout, #cv-start .layout *')) {
    if (!el.checkVisibility() || el.closest('.pl-sr-only')) continue;
    measured++;
    const cs = getComputedStyle(el);
    for (const prop of props) {
      if (cs[prop] === 'normal') continue;
      const px = Math.round(Math.abs(parseFloat(cs[prop])) * 100) / 100;
      if (!scale.has(px))
        bad.push(el.tagName.toLowerCase() +
          (el.className ? '.' + String(el.className).split(' ')[0] : '') + ' ' + prop + ' ' + cs[prop]);
    }
  }
  return { measured, bad: [...new Set(bad)] };
}"""


# The sidebar's type, by tier (cv.css): the name at --fs-28; the role and the
# school at --fs-16; below the first hairline the Focus label and list, the
# contacts and "Get in touch" at --fs-13. The token values are read from the
# page, so the check follows the browser's text size.
SIDEBAR_TYPE = """() => {
  const size = (value) => {
    const probe = document.createElement('i');
    probe.style.fontSize = value;
    document.body.append(probe);
    const out = getComputedStyle(probe).fontSize;
    probe.remove();
    return out;
  };
  const tiers = {
    name: { size: size('var(--fs-28)'), parts: ['.name'] },
    identity: { size: size('var(--fs-16)'), parts: ['.role', '.org'] },
    'lists and actions': { size: size('var(--fs-13)'),
      parts: ['.side-label', '.side-list > div', '.contact-list a', '.button'] },
  };
  const own = (el) => [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const bad = [];
  let measured = 0;
  // Every visible text in the sidebar is in a tier, at the tier's size.
  for (const el of document.querySelectorAll('.sidebar *')) {
    if (!own(el) || !el.checkVisibility() || el.closest('.pl-sr-only')) continue;
    measured++;
    const text = el.tagName.toLowerCase() + ' "' + el.textContent.trim().slice(0, 20) + '"';
    const tier = Object.entries(tiers).find(([, { parts }]) =>
      parts.some((part) => el.closest('.sidebar ' + part)));
    if (!tier) {
      bad.push(text + ' is in no tier');
      continue;
    }
    const [name, { size: want }] = tier;
    const got = getComputedStyle(el).fontSize;
    if (got !== want) bad.push(text + ' is ' + got + ', its tier (' + name + ') is ' + want);
  }
  if (measured < 8) bad.push('only ' + measured + ' texts found in the sidebar');
  return bad;
}"""


def check_type_and_space(browser, base, findings):
    """The header, the type scale and the spacing scale hold in the browser.

    Why: the owner asked (Oct 2026) to remove Simulations, Print / PDF and the
    sticky section bar, to replace the reader-mode glyph with a word, and
    "why do everything look so different" / "check the golden rules for
    spacings". The header now holds the brand, the language link and the
    reader-mode button alone, the two controls set alike (size, family,
    weight, colour, box, baseline) in one 76px row. The reader-mode button is
    named by its visible words and shows its pressed state with an underline,
    not colour alone, without changing its box. Every visible text is on the
    six-size, two-weight, one-family, five-colour scale, also in Reader mode;
    every margin, padding and gap in the CV's columns is on the 4-point
    scale. At 1440, 900, 390 and 320px, in both languages, every section and
    the toolkit open. The owner then saw "the sidebar font sizes still look
    different" (Oct 2026): under the name the sidebar has two tiers, the role
    and the school at 16 and everything below the first hairline at 13, and
    no text outside them.
    """
    def fail(where, message, detail=""):
        findings.append({"level": "ERROR", "check": "type-and-space", "state": "type-and-space",
                         "message": "%s: %s" % (where, message), "detail": detail})

    names = {"en": "Reader mode", "ko": "읽기 모드"}
    count = 0
    for lang, path in (("en", "/"), ("ko", "/ko.html")):
        for width in (1440, 900, 390, 320):
            mobile = width < 760
            where = "%s@%d" % (path, width)
            ctx = browser.new_context(viewport={"width": width, "height": 844 if mobile else 900},
                                      is_mobile=mobile, has_touch=mobile)
            page = ctx.new_page()
            page.goto(base + path, wait_until="load")
            page.evaluate("() => document.fonts.ready")
            state = page.evaluate(HEADER_STATE)
            sidebar = page.evaluate(SIDEBAR_TYPE)
            if sidebar:
                fail(where, "the sidebar mixes sizes within a tier (28 name; 16 role and "
                     "school; 13 Focus, contacts and Get in touch)", " | ".join(sidebar[:5]))
            if state["removed"]:
                fail(where, "removed controls are back: %s" % ", ".join(state["removed"]))
            kinds = [item["name"] for item in state["items"]]
            if kinds != ["site-brand", "langToggle", "ttsToggle"]:
                fail(where, "the header holds %r, expected the brand, the language link "
                     "and the reader-mode button" % kinds)
            else:
                brand, *controls = state["items"]
                for key in ("size", "family", "weight", "lineHeight", "color", "height"):
                    if len({c[key] for c in controls}) != 1:
                        fail(where, "the header controls differ in %s: %s"
                             % (key, [c[key] for c in controls]))
                if brand["family"] != controls[0]["family"]:
                    fail(where, "the brand is set in %s, the controls in %s"
                         % (brand["family"], controls[0]["family"]))
                baselines = [c["baseline"] for c in controls]
                if None in baselines or max(baselines) - min(baselines) > 0.5:
                    fail(where, "the header controls' text sits on different baselines: %s"
                         % baselines)
                if len({item["top"] for item in state["items"]}) != 1 or state["height"] != 76:
                    fail(where, "the header is not one 76px row (%dpx; tops %s)"
                         % (state["height"], [i["top"] for i in state["items"]]))
            # The reader-mode button: its words are its name, and pressed it
            # shows the header's underline (no fill, the same box).
            if state["reader"]["title"] is not None or state["reader"]["label"] not in (None, names[lang]):
                fail(where, "the reader-mode button has a title or a label other than its words",
                     json.dumps(state["reader"], ensure_ascii=False))
            button = page.get_by_role("button", name=names[lang], exact=True)
            if button.count() != 1:
                fail(where, "no button is named %r" % names[lang])
            else:
                before = next(i for i in state["items"] if i["name"] == "ttsToggle")
                button.click()
                page.mouse.move(1, 1)
                after = next(i for i in page.evaluate(HEADER_STATE)["items"] if i["name"] == "ttsToggle")
                pressed = page.evaluate("() => document.getElementById('ttsToggle').getAttribute('aria-pressed')")
                if pressed != "true" or "underline" not in after["decoration"]:
                    fail(where, "pressed, the reader-mode button shows no underline (aria-pressed=%s, %s)"
                         % (pressed, after["decoration"]))
                if after["background"] not in ("rgba(0, 0, 0, 0)", "transparent"):
                    fail(where, "pressed, the reader-mode button is filled (%s)" % after["background"])
                if (round(after["width"], 1), after["height"]) != (round(before["width"], 1), before["height"]):
                    fail(where, "pressing the reader-mode button changed its box")
            # The CV whole: every section and the toolkit open.
            open_all_sections(page)
            page.evaluate("() => { document.querySelector('details.caps').open = true; }")
            page.mouse.move(1, 1)
            for mode in ("reader mode", "standard"):
                if mode == "standard" and button.count() == 1:
                    button.click()
                    page.mouse.move(1, 1)
                typed = page.evaluate(TYPE_SCALE)
                if typed["measured"] < 100 or typed["bad"]:
                    fail("%s %s" % (where, mode), "%d of %d texts are off the type scale"
                         % (len(typed["bad"]), typed["measured"]), " | ".join(typed["bad"][:5]))
            spaced = page.evaluate(SPACE_SCALE)
            if spaced["measured"] < 100 or spaced["bad"]:
                fail(where, "%d spacing values are off the 4-point scale" % len(spaced["bad"]),
                     " | ".join(spaced["bad"][:6]))
            ctx.close()
            count += 1
    return count


LANGUAGE_STATE = """() => {
  const button = document.getElementById('langToggle');
  const shown = (lang) => [...document.querySelectorAll('#cv-start [lang="' + lang + '"]')]
    .filter((el) => el.checkVisibility()).length;
  return {
    href: location.href,
    lang: document.documentElement.lang,
    bodyKo: document.body.classList.contains('ko'),
    title: document.title,
    name: document.querySelector('h1.name').innerText.trim(),
    label: document.getElementById('langLabel').textContent.trim(),
    buttonLang: button.lang,
    buttonName: button.getAttribute('aria-label'),
    buttonShown: button.checkVisibility(),
    // A real, crawlable link to the other page (not a script-only button).
    linkTag: button.tagName,
    linkTarget: button.href ? new URL(button.href).pathname.split('/').pop() : null,
    hreflang: button.getAttribute('hreflang'),
    shownEn: shown('en'),
    shownKo: shown('ko'),
    history: history.length,
  };
}"""

# What the language link says, and where it leads, while each language is
# shown (site.js; build_ko_page.py for the raw ko.html). "" is the site root.
BUTTON = {
    "en": {"label": "한국어", "buttonLang": "ko-KR", "buttonName": "한국어로 읽기",
           "linkTag": "A", "linkTarget": "ko.html", "hreflang": "ko"},
    "ko": {"label": "English", "buttonLang": "en-US", "buttonName": "Read in English",
           "linkTag": "A", "linkTarget": "", "hreflang": "en"},
}


def page_titles():
    """The authored <title> of the English and the Korean page."""
    titles = {}
    for lang, rel in (("en", "index.html"), ("ko", "ko.html")):
        m = re.search(r"<title>(.*?)</title>", (ROOT / rel).read_text(encoding="utf-8"), re.S)
        titles[lang] = " ".join(html.unescape(m.group(1)).split()) if m else None
    return titles


def check_language_pages(browser, base, findings):
    """One page per language, Korean at first paint, and the link in step.

    Why: / is English and /ko.html is Korean so that each can be found in its
    own language. Naver's crawler and a first paint see the page before
    site.js runs, so ko.html must be Korean (and only Korean) in its raw HTML,
    and the two pages must be joined by a real link a crawler can follow. On
    index.html the link still switches in place, but a reload or a shared link
    must open the language the reader chose: the address follows (keeping
    ?view=cv and #section), and the tab title is that page's own <title>. On
    ko.html it loads the English page at the same ?view=cv and #section. Old
    ?lang=ko links keep working.
    """
    def fail(where, message, detail=""):
        findings.append({"level": "ERROR", "check": "language-pages", "state": "language-pages",
                         "message": "%s: %s" % (where, message), "detail": detail})

    builder = load_ko_builder()
    index_text = (ROOT / "index.html").read_text(encoding="utf-8")
    names = {lang: builder.display_name(index_text, lang) for lang in ("en", "ko")}
    titles = page_titles()

    def expect_lang(where, state, lang, href=None):
        want = dict(BUTTON[lang], lang=lang, bodyKo=lang == "ko", title=titles[lang],
                    name=names[lang], buttonShown=True)
        for key, value in want.items():
            if state[key] != value:
                fail(where, "%s is %r, expected %r" % (key, state[key], value))
        other = "en" if lang == "ko" else "ko"
        if state["shown" + other.capitalize()] or not state["shown" + lang.capitalize()]:
            fail(where, "%d English and %d Korean texts are visible in %s"
                 % (state["shownEn"], state["shownKo"], lang))
        if href is not None and state["href"] != href:
            fail(where, "address is %s, expected %s" % (state["href"], href))

    count = 0
    # First paint: the raw HTML, before any script runs.
    ctx = browser.new_context(viewport=VIEWPORTS["desktop"], java_script_enabled=False)
    page = ctx.new_page()
    raw = {}
    for lang, path in (("en", "/"), ("ko", "/ko.html")):
        page.goto(base + path, wait_until="load")
        raw[lang] = page.evaluate(LANGUAGE_STATE)
        expect_lang("%s without JavaScript" % path, raw[lang], lang)
        count += 1
    ctx.close()

    ctx = browser.new_context(viewport=VIEWPORTS["desktop"])
    page = ctx.new_page()
    errors = []
    page.on("pageerror", lambda e: errors.append(str(e)))

    def load(path):
        page.goto(base + path, wait_until="load")
        page.wait_for_function(PAPERS_READY)
        return page.evaluate(LANGUAGE_STATE)

    def toggle():
        # A script click, so a hidden link is reported (buttonShown), not a timeout.
        before = page.evaluate("document.documentElement.lang")
        if not switch_language(page):
            fail("toggle", "clicking the language link did not switch from %s" % before)
        page.wait_for_function(PAPERS_READY)
        return page.evaluate(LANGUAGE_STATE)

    # With site.js running, both pages open exactly as their raw HTML painted.
    for lang, path in (("en", "/"), ("ko", "/ko.html")):
        state = load(path)
        expect_lang(path, state, lang, base + path)
        for key in ("title", "label", "buttonLang", "buttonName", "name", "lang",
                    "linkTag", "linkTarget", "hreflang"):
            if state[key] != raw[lang][key]:
                fail(path, "%s changed from %r to %r when site.js ran"
                     % (key, raw[lang][key], state[key]), "a flash of the other language")
        count += 1

    # From the Korean-only ko.html the link loads the English page at the same
    # place; on index.html it switches in place, rewrites the address and adds
    # no history entry.
    load("/ko.html?view=cv#publications")
    state = toggle()
    expect_lang("link from /ko.html", state, "en", base + "/?view=cv#publications")
    start = state
    state = toggle()
    expect_lang("toggle back on /", state, "ko", base + "/ko.html?view=cv#publications")
    if state["history"] != start["history"]:
        fail("toggle", "the in-place language switch added a history entry")
    page.reload(wait_until="load")
    expect_lang("reload after toggle", page.evaluate(LANGUAGE_STATE), "ko",
                base + "/ko.html?view=cv#publications")
    if page.evaluate("document.querySelectorAll('body [lang=\"en\"]').length"):
        fail("reload after toggle", "the reloaded Korean page is not Korean only")
    load("/index.html")
    expect_lang("toggle from /index.html", toggle(), "ko", base + "/ko.html")
    count += 4

    # Old and shared links.
    expect_lang("/?lang=ko", load("/?lang=ko"), "ko", base + "/ko.html")
    expect_lang("/?view=cv&lang=ko#awards", load("/?view=cv&lang=ko#awards"), "ko",
                base + "/ko.html?view=cv#awards")
    expect_lang("/?view=cv#publications", load("/?view=cv#publications"), "en",
                base + "/?view=cv#publications")
    missed = landed_on(page, "publications")
    if missed:
        fail("/?view=cv#publications", "#publications was not scrolled into view", missed)
    count += 3

    # The Simulations page is switched off (SIMULATIONS_ENABLED in
    # laboratory.html): no link leads there, in either language, before or
    # after a switch (check_simulations_off covers the page itself).
    lab_links = """() => [...document.querySelectorAll('a[href*="laboratory"]')]
      .map((a) => a.outerHTML.slice(0, 80))"""
    for path in ("/", "/ko.html"):
        load(path)
        for state in ("as loaded", "after the language link"):
            if state != "as loaded":
                toggle()
            found = page.evaluate(lab_links)
            if found:
                fail("%s %s" % (path, state), "links to the switched-off Simulations page",
                     " | ".join(found))
        count += 1

    # Markup details that belong to the same pages.
    details = page.evaluate("""() => ({
      decorative: [...document.querySelectorAll('.num, .sep')]
        .filter((el) => el.getAttribute('aria-hidden') !== 'true').length,
      paperHeadings: [...document.querySelectorAll('.cv-paper-heading')].map((el) => el.tagName),
      dates: [...document.querySelectorAll('.cv-date')].map((el) => el.textContent.trim())
        .filter((text) => !/^\\d{4}/.test(text)),
    })""")
    if details["decorative"]:
        fail("markup", "%d .num/.sep glyphs are not aria-hidden" % details["decorative"])
    if set(details["paperHeadings"]) != {"H4"}:
        fail("markup", "paper headings are %s, expected H4 under each year's h3"
             % sorted(set(details["paperHeadings"])))
    if details["dates"]:
        fail("markup", "meta parts styled as dates without a year: %r" % details["dates"][:3])
    for e in errors:
        fail("page error", e[:160])
    ctx.close()
    return count


def run(states, viewports, headed=False):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("[FAIL] Playwright is not installed.")
        print("       pip install playwright && python -m playwright install chromium")
        print("       (the static half needs nothing: python tools/harness/static_checks.py)")
        sys.exit(2)

    audit_src = AUDIT_JS.read_text(encoding="utf-8")
    shelf_on = bookshelf_enabled()
    if shelf_on is None:
        print("[FAIL] index.html must declare BOOKSHELF_ENABLED exactly once")
        sys.exit(1)
    port, shutdown = serve(ROOT)
    base = "http://127.0.0.1:%d" % port
    findings = []
    reports = {}

    try:
        with sync_playwright() as pw:
            try:
                browser = pw.chromium.launch(headless=not headed)
            except Exception as exc:
                print("[FAIL] could not launch Chromium: %s" % str(exc)[:200])
                print("       python -m playwright install chromium")
                sys.exit(2)

            for vp_name in viewports:
                for state_name, path, body_class in states:
                    label = "%s@%s" % (state_name, vp_name)
                    ctx = browser.new_context(viewport=VIEWPORTS[vp_name])
                    page = ctx.new_page()
                    console = []
                    page.on("console", lambda m: console.append((m.type, m.text))
                            if m.type in ("error", "warning") else None)
                    page.on("pageerror", lambda e: console.append(("pageerror", str(e))))
                    failed = []
                    page.on("requestfailed",
                            lambda r: failed.append("%s %s" % (r.url, r.failure)))

                    page.goto(base + path, wait_until="load")
                    page.wait_for_timeout(400)
                    if body_class:
                        page.locator('#langToggle').click()
                        page.wait_for_function("() => document.documentElement.lang === 'ko'")
                        page.wait_for_timeout(250)
                    # The CV opens folded (check_section_folds covers that);
                    # the audit measures all of it.
                    open_all_sections(page)

                    report = audit_page(page, label, audit_src)
                    reports[label] = report
                    korean_only = path in KOREAN_ONLY_PATHS
                    for f in report["findings"]:
                        # ko.html has no English twins by design; the stricter
                        # rule below stands in for the pairing check there.
                        if korean_only and f["check"] == "lang-pair":
                            if f["level"] == "ERROR" and report["counts"].get("errors"):
                                report["counts"]["errors"] -= 1
                            continue
                        if f["level"] in ("ERROR", "WARN"):
                            findings.append(dict(f, state=label))
                    if korean_only:
                        findings += korean_only_findings(page, label)

                    for kind, text in console:
                        if kind in ("error", "pageerror"):
                            findings.append({
                                "level": "ERROR", "check": "console", "state": label,
                                "message": text[:160], "detail": kind,
                            })
                    for f in failed:
                        findings.append({
                            "level": "ERROR", "check": "request-failed",
                            "state": label, "message": f[:160], "detail": "",
                        })

                    # While the bookshelf is off, the site root is the CV.
                    if "cv" in state_name or (state_name.startswith("home") and not shelf_on):
                        check_publication_filter(page, findings, label)
                    if vp_name == "desktop":
                        check_print(page, findings, label)

                    ctx.close()
            if any(s[0].startswith("home") for s in states):
                reports["language-pages"] = {"counts": {"cases": check_language_pages(
                    browser, base, findings)}}
                reports["section-folds"] = {"counts": {"cases": check_section_folds(
                    browser, base, findings)}}
                reports["type-and-space"] = {"counts": {"cases": check_type_and_space(
                    browser, base, findings)}}
            browser.close()
            if not shelf_on and any(s[0].startswith("home") for s in states):
                # A second browser resolves a non-local host name to the local
                # server, so the page runs exactly as it would on a real host.
                public = pw.chromium.launch(headless=not headed, args=[
                    "--host-resolver-rules=MAP %s 127.0.0.1" % PUBLIC_TEST_HOST])
                reports["bookshelf-off"] = {"counts": {"urls": check_bookshelf_off(
                    public, base, "http://%s:%d" % (PUBLIC_TEST_HOST, port), findings)}}
                reports["simulations-off"] = {"counts": {"urls": check_simulations_off(
                    public, "http://%s:%d" % (PUBLIC_TEST_HOST, port), findings)}}
                public.close()
    finally:
        shutdown()

    return findings, reports


def main():
    ap = argparse.ArgumentParser(description="Headless browser harness.")
    ap.add_argument("--json", action="store_true")
    ap.add_argument("--headed", action="store_true", help="show the browser")
    ap.add_argument("--state", default="", help="only this state, e.g. cv/en")
    ap.add_argument("--viewport", default="", help="only this viewport: desktop|mobile")
    ap.add_argument("--strict", action="store_true", help="warnings fail too")
    args = ap.parse_args()

    states = [s for s in STATES if not args.state or s[0] == args.state]
    viewports = [v for v in VIEWPORTS if not args.viewport or v == args.viewport]
    if not states or not viewports:
        print("[FAIL] no matching state/viewport")
        return 1

    findings, reports = run(states, viewports, headed=args.headed)
    errors = [f for f in findings if f["level"] == "ERROR"]
    warns = [f for f in findings if f["level"] == "WARN"]

    if args.json:
        print(json.dumps({"errors": len(errors), "warnings": len(warns),
                          "findings": findings,
                          "counts": {k: v["counts"] for k, v in reports.items()}},
                         indent=2, ensure_ascii=False))
    else:
        print("=" * 72)
        print("BROWSER HARNESS  |  %d state(s)  |  %d error(s), %d warning(s)"
              % (len(reports), len(errors), len(warns)))
        print("=" * 72)
        for label in sorted(reports):
            c = reports[label]["counts"]
            print("\n-- %s" % label)
            if "urls" in c:
                print("   public URLs checked: %s" % c["urls"])
            elif "cases" in c:
                print("   cases checked: %s" % c["cases"])
            else:
                print("   text measured: %-4s  h1: %-2s  main: %-2s  contrast+a11y errors: %s"
                      % (c.get("textNodesMeasured"), c.get("visibleH1"),
                         c.get("visibleMain"), c.get("errors")))
            mine = [f for f in findings if f.get("state") == label]
            for f in mine[:12]:
                print("   [%-5s] %-18s %s" % (f["level"], f["check"], f["message"][:90]))
            if len(mine) > 12:
                print("   ... and %d more" % (len(mine) - 12))
        print("\n" + "=" * 72)
        print("RESULT: %s" % ("FAIL" if errors or (args.strict and warns) else "PASS"))
        print("=" * 72)

    return 1 if (errors or (args.strict and warns)) else 0


if __name__ == "__main__":
    sys.exit(main())

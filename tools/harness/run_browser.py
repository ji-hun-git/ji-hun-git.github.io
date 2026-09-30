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
# scroll-padding-top plus the target's own scroll-margin-top (84px for a CV
# section). Subpixel layout leaves it a fraction either side of that line, so
# the check allows 2px instead of testing against the line itself.
LANDED = """(id) => {
  const el = document.getElementById(id);
  if (!el) return false;
  const px = (value) => parseFloat(value) || 0;
  const land = px(getComputedStyle(document.documentElement).scrollPaddingTop) +
    px(getComputedStyle(el).scrollMarginTop);
  const top = el.getBoundingClientRect().top;
  return top > -2 && top < land + 2;
}"""


def landed_on(page, anchor):
    """Wait for the page and its web fonts, then check #anchor's final place.

    Returns None when it landed, or where its top edge ended up. Checked after
    the fonts because their late arrival rewraps the text above the target.
    """
    page.wait_for_load_state("load")
    page.evaluate("""() => (document.fonts ? document.fonts.ready : Promise.resolve())
      .then(() => new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))))""")
    try:
        page.wait_for_function(LANDED, arg=anchor, timeout=5000)
        return None
    except Exception:
        top = page.evaluate("(id) => document.getElementById(id)?.getBoundingClientRect().top ?? null",
                            anchor)
        return "top at %s px" % (round(top, 1) if isinstance(top, (int, float)) else top)


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

    # The Simulations page is English only. From the Korean CV its link
    # carries ?from=ko, and the lab's CV link then leads back to the Korean
    # page, not to the English one.
    lab_href = "document.querySelector('.lab-link')?.getAttribute('href')"
    load("/ko.html")
    if page.evaluate(lab_href) != "laboratory.html?from=ko":
        fail("/ko.html", "the Simulations link is %r, expected 'laboratory.html?from=ko'"
             % page.evaluate(lab_href))
    load("/")
    if page.evaluate(lab_href) != "laboratory.html":
        fail("/", "the Simulations link is %r, expected 'laboratory.html'" % page.evaluate(lab_href))
    toggle()
    if page.evaluate(lab_href) != "laboratory.html?from=ko":
        fail("toggle on /", "in Korean the Simulations link is %r, expected "
             "'laboratory.html?from=ko'" % page.evaluate(lab_href))
    load("/ko.html")
    page.locator(".lab-link").click()
    page.wait_for_url("**/laboratory.html?from=ko")
    page.wait_for_function("() => document.querySelector('.lab-actions a')?.getAttribute('href')"
                           ".startsWith('ko.html')")
    page.locator(".lab-actions a").click()
    page.wait_for_url("**/ko.html*")
    page.wait_for_function(PAPERS_READY)
    expect_lang("the lab's CV link after /ko.html", page.evaluate(LANGUAGE_STATE), "ko",
                base + "/ko.html?view=cv")
    count += 4

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
            browser.close()
            if not shelf_on and any(s[0].startswith("home") for s in states):
                # A second browser resolves a non-local host name to the local
                # server, so the page runs exactly as it would on a real host.
                public = pw.chromium.launch(headless=not headed, args=[
                    "--host-resolver-rules=MAP %s 127.0.0.1" % PUBLIC_TEST_HOST])
                reports["bookshelf-off"] = {"counts": {"urls": check_bookshelf_off(
                    public, base, "http://%s:%d" % (PUBLIC_TEST_HOST, port), findings)}}
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
                print("   language page cases checked: %s" % c["cases"])
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

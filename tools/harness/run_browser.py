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
import http.server
import json
import socket
import socketserver
import sys
import threading
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
AUDIT_JS = HERE / "dom_audit.js"

try:  # pragma: no cover - host console
    sys.stdout.reconfigure(encoding="utf-8")
except Exception:
    pass

# state -> (path, body class to force, viewport)
VIEWPORTS = {
    "desktop": {"width": 1280, "height": 800},
    "mobile": {"width": 375, "height": 812},
}

STATES = [
    ("library/en", "/index.html", None),
    ("library/ko", "/index.html", "ko"),
    ("cv/en", "/index.html?view=cv", None),
    ("cv/ko", "/index.html?view=cv", "ko"),
    ("lab", "/laboratory.html", None),
]


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def serve(directory):
    """Serve `directory` on a free port; returns (port, shutdown_callable)."""
    handler = functools.partial(QuietHandler, directory=str(directory))
    with socket.socket() as probe:
        probe.bind(("127.0.0.1", 0))
        port = probe.getsockname()[1]
    httpd = socketserver.TCPServer(("127.0.0.1", port), handler)
    httpd.allow_reuse_address = True
    t = threading.Thread(target=httpd.serve_forever, daemon=True)
    t.start()
    return port, httpd.shutdown


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


def run(states, viewports, headed=False):
    try:
        from playwright.sync_api import sync_playwright
    except ImportError:
        print("[FAIL] Playwright is not installed.")
        print("       pip install playwright && python -m playwright install chromium")
        print("       (the static half needs nothing: python tools/harness/static_checks.py)")
        sys.exit(2)

    audit_src = AUDIT_JS.read_text(encoding="utf-8")
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
                        page.evaluate("(c) => document.body.classList.add(c)", body_class)
                        page.wait_for_timeout(250)

                    report = audit_page(page, label, audit_src)
                    reports[label] = report
                    for f in report["findings"]:
                        if f["level"] in ("ERROR", "WARN"):
                            findings.append(dict(f, state=label))

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

                    if "cv" in state_name:
                        check_publication_filter(page, findings, label)
                    if vp_name == "desktop":
                        check_print(page, findings, label)

                    ctx.close()
            browser.close()
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

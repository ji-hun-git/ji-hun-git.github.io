"""Render the Simulations page's link-preview image (og:image / twitter:image).

The image is a screenshot of laboratory.html as a visitor first sees it at
1200 x 630: the catalog, Figure 01 and its controls. Rebuild it whenever the
page's look or its first figure changes, so a shared link never shows a
layout or text that is no longer on the page.

    python tools/build_lab_og.py        # writes lab/assets/simulations-og.png

Requires Playwright (python -m playwright install chromium) and a network
connection for the page's web fonts and KaTeX.
"""

from __future__ import annotations

import functools
import http.server
import threading
from pathlib import Path

from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "lab" / "assets" / "simulations-og.png"
W, H = 1200, 630


class QuietHandler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def main() -> None:
    handler = functools.partial(QuietHandler, directory=str(ROOT))
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    base = "http://127.0.0.1:%d" % httpd.server_address[1]
    try:
        with sync_playwright() as pw:
            browser = pw.chromium.launch()
            page = browser.new_page(viewport={"width": W, "height": H})
            page.goto(base + "/laboratory.html#behavior-prompt-gridworld",
                      wait_until="networkidle")
            page.wait_for_function(
                "() => document.fonts.status === 'loaded'"
                " && document.querySelector('#simulationCanvas')")
            # A few seconds of motion, so the figure shows an agent under way.
            page.wait_for_timeout(3000)
            page.screenshot(path=str(OUT))
            browser.close()
    finally:
        httpd.shutdown()
    print("[ OK ] wrote %s" % OUT.relative_to(ROOT).as_posix())


if __name__ == "__main__":
    main()

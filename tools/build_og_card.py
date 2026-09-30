"""Render the link-preview card (og:image / twitter:image).

The card is set in the CV's own type and colours: the portrait on the left,
then "Jihun Chae · 채지훈", the role line and KAIST. It is rendered from a small
HTML template with Playwright and saved as a 1200 x 630 JPEG at the URL the
pages already reference, so no markup changes when the card is rebuilt.

    python tools/build_og_card.py            # writes assets/profile/jihun-chae-card.jpg
    python tools/build_og_card.py --html x   # also keeps the rendered template

Requires Pillow and Playwright (python -m playwright install chromium), and a
network connection for the site's web fonts (Geist and Pretendard, from the
same CDN URLs the pages use). The script stops if either font fails to load
instead of writing a card in a fallback face.
"""

from __future__ import annotations

import argparse
import base64
import io
import tempfile
from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "assets" / "profile" / "jihun-chae-master.jpg"
OUT = ROOT / "assets" / "profile" / "jihun-chae-card.jpg"

W, H = 1200, 630

# The portrait crop, in master pixels (the master is 1200 x 1543). It keeps
# head, neck and collar with room above the hair, and leaves out the
# photographer's marks in the top corners (x 106-261 and 953-1097, y 52-95)
# and the caption along the bottom.
CROP = (272, 36, 944, 900)

# The CV's tokens (assets/site.css, assets/cv.css).
PAGE = "#f0f2f3"
INK = "#272a29"
LEDE = "#4b585e"
INK_GREEN = "#233b32"
RULE = "#cbd3d6"
GEIST = "https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/Geist-Variable.woff2"
PRETENDARD = (
    "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/"
    "variable/pretendardvariable-dynamic-subset.min.css"
)

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<link rel="stylesheet" href="{pretendard}">
<style>
@font-face {{
  font-family: Geist;
  src: url("{geist}") format("woff2");
  font-weight: 100 900;
}}
* {{ box-sizing: border-box; margin: 0; letter-spacing: 0; }}
html, body {{ width: {w}px; height: {h}px; overflow: hidden; }}
body {{
  background: {page};
  color: {ink};
  font-family: Geist, "Pretendard Variable", sans-serif;
  display: flex;
  align-items: center;
  gap: 72px;
  padding: 0 96px 0 88px;
}}
.photo {{
  flex: none;
  width: 364px;
  height: 468px;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 2px 8px #26323a12;
}}
.photo img {{ display: block; width: 100%; height: 100%; object-fit: cover; }}
.text {{ min-width: 0; }}
h1 {{
  font-size: 52px;
  font-weight: 600;
  line-height: 1.15;
  white-space: nowrap;
}}
h1 span {{ font-family: "Pretendard Variable", sans-serif; }}
.dot {{ color: #99a196; }}
.role {{
  margin-top: 22px;
  font-size: 28px;
  line-height: 1.45;
  color: {lede};
  text-wrap: balance;
}}
.org {{
  margin-top: 30px;
  padding-top: 22px;
  border-top: 1px solid {rule};
  font-size: 24px;
  font-weight: 550;
  color: {ink_green};
}}
</style>
</head>
<body>
<div class="photo"><img alt="" src="data:image/jpeg;base64,{photo}"></div>
<div class="text">
  <h1>Jihun Chae <span class="dot">·</span> <span lang="ko">채지훈</span></h1>
  <p class="role">Human-centered AI researcher and developer</p>
  <p class="org">KAIST</p>
</div>
</body>
</html>
"""


def portrait() -> str:
    src = ImageOps.exif_transpose(Image.open(MASTER)).convert("RGB")
    crop = src.crop(CROP)
    # Twice the displayed size, so the browser downsamples a sharp source.
    crop = crop.resize((728, round(728 * crop.height / crop.width)), Image.LANCZOS)
    buf = io.BytesIO()
    crop.save(buf, format="JPEG", quality=92)
    return base64.b64encode(buf.getvalue()).decode("ascii")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--html", type=Path, help="also write the rendered template here")
    parser.add_argument("--out", type=Path, default=OUT)
    args = parser.parse_args()

    from playwright.sync_api import sync_playwright

    html = TEMPLATE.format(
        w=W, h=H, page=PAGE, ink=INK, lede=LEDE, ink_green=INK_GREEN, rule=RULE,
        geist=GEIST, pretendard=PRETENDARD, photo=portrait(),
    )
    if args.html:
        args.html.write_text(html, encoding="utf-8")

    with tempfile.TemporaryDirectory() as tmp:
        page_path = Path(tmp) / "card.html"
        page_path.write_text(html, encoding="utf-8")
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(viewport={"width": W, "height": H}, device_scale_factor=1)
            page.goto(page_path.as_uri(), wait_until="networkidle")
            page.evaluate("document.fonts.ready")
            loaded = page.evaluate(
                """() => [
                  document.fonts.check('600 52px Geist'),
                  document.fonts.check('600 52px "Pretendard Variable"', '채지훈'),
                ]"""
            )
            if not all(loaded):
                raise SystemExit(f"web fonts did not load (Geist, Pretendard) = {loaded}; not writing a card")
            overflow = page.evaluate(
                "() => document.documentElement.scrollWidth > innerWidth || "
                "document.querySelector('.text').getBoundingClientRect().right > innerWidth - 64"
            )
            if overflow:
                raise SystemExit("the text does not fit inside the card's margin")
            png = page.screenshot(type="png")
            browser.close()

    card = Image.open(io.BytesIO(png)).convert("RGB")
    assert card.size == (W, H), card.size
    card.save(args.out, format="JPEG", quality=86, optimize=True, progressive=True)
    print(f"{args.out}  {W} x {H}  {args.out.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    main()

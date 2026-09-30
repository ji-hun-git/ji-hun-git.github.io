#!/usr/bin/env python3
"""Build the site's icon files from the "JC" monogram.

Search results and home screens need real image files: Google shows a site's
favicon only from a crawlable ICO/PNG (not an SVG data URI), and iOS uses
apple-touch-icon.png. All three are drawn from the same design as the SVG icon
in the <head> of index.html: a dark rounded square (#17181b) with "JC" in
bold, light paper colour (#f6f5f3), set at 28/64 of the icon's size on a
baseline at 43/64.

    python tools/build_favicons.py

writes
    favicon.ico               16, 32 and 48 px (site root, where browsers look)
    assets/favicon-96.png     96 px (a multiple of 48, as Google asks)
    apple-touch-icon.png      180 px, full square: iOS rounds the corners itself

Needs Pillow (pip install pillow) and a bold sans-serif font: Arial Bold, as
the SVG's own fallback after Inter, or DejaVu Sans Bold / Liberation Sans Bold.
Pass --font PATH to use another file. The output is deterministic for a given
font file, so rerunning it without design changes leaves the files unchanged.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover - depends on the machine
    sys.exit("[FAIL] Pillow is not installed: pip install pillow")

ROOT = Path(__file__).resolve().parents[1]
INK = (0x17, 0x18, 0x1B, 255)
PAPER = (0xF6, 0xF5, 0xF3, 255)
FONT_CANDIDATES = (
    "C:/Windows/Fonts/arialbd.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/Library/Fonts/Arial Bold.ttf",
    "/usr/share/fonts/truetype/msttcorefonts/Arial_Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
)
SCALE = 16  # draw large, then reduce: smooth edges at every size


def find_font(explicit=None):
    for candidate in ([explicit] if explicit else []) + list(FONT_CANDIDATES):
        if candidate and Path(candidate).is_file():
            return candidate
    sys.exit("[FAIL] no bold sans-serif font found; pass --font PATH")


def monogram(size, font_path, rounded=True):
    """The icon at `size` px: the SVG's 64-unit design, scaled."""
    big = size * SCALE
    unit = big / 64
    image = Image.new("RGBA", (big, big), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    if rounded:
        draw.rounded_rectangle((0, 0, big - 1, big - 1), radius=round(14 * unit), fill=INK)
    else:
        draw.rectangle((0, 0, big - 1, big - 1), fill=INK)
    font = ImageFont.truetype(font_path, round(28 * unit))
    draw.text((32 * unit, 43 * unit), "JC", font=font, fill=PAPER, anchor="ms")
    return image.resize((size, size), Image.LANCZOS)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    parser.add_argument("--font", help="bold sans-serif .ttf to draw the letters with")
    args = parser.parse_args(argv)
    font = find_font(args.font)

    ico = ROOT / "favicon.ico"
    frames = {size: monogram(size, font) for size in (16, 32, 48)}
    frames[48].save(ico, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)],
                    append_images=[frames[16], frames[32]])
    png96 = ROOT / "assets" / "favicon-96.png"
    monogram(96, font).save(png96, format="PNG", optimize=True)
    touch = ROOT / "apple-touch-icon.png"
    monogram(180, font, rounded=False).convert("RGB").save(touch, format="PNG", optimize=True)
    for path in (ico, png96, touch):
        print("[ OK ] wrote %s (%d bytes)" % (path.relative_to(ROOT).as_posix(), path.stat().st_size))
    return 0


if __name__ == "__main__":
    sys.exit(main())

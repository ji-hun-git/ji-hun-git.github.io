"""Regenerate the profile image derivatives from the master photo.

The card renders at ~286x358 CSS px (aspect-ratio 4/5, object-fit: cover), so
572x735 covers a 2x display exactly. The master is kept only as the social-card
source: og:image is fetched by crawlers, never by the page, so it can stay large.

    python tools/build-profile-images.py

Requires Pillow. Idempotent - safe to re-run after replacing the master.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "assets" / "profile" / "jihun-chae-master.jpg"
OUT_DIR = ROOT / "assets" / "profile"

# (filename, width, height, quality) - height follows the master's aspect ratio
DISPLAY_W = 572


def main() -> None:
    if not MASTER.exists():
        raise SystemExit(f"master not found: {MASTER}")

    src = Image.open(MASTER)
    src = ImageOps.exif_transpose(src).convert("RGB")
    w, h = src.size
    display_h = round(DISPLAY_W * h / w)

    display = src.resize((DISPLAY_W, display_h), Image.LANCZOS)

    targets = [
        (OUT_DIR / "jihun-chae.webp", display, {"format": "WEBP", "quality": 82, "method": 6}),
        (OUT_DIR / "jihun-chae.jpg", display, {"format": "JPEG", "quality": 82, "optimize": True, "progressive": True}),
        # Social card: crawlers only, never loaded by the page.
        (OUT_DIR / "jihun-chae-og.jpg", src, {"format": "JPEG", "quality": 78, "optimize": True, "progressive": True}),
    ]

    for path, img, opts in targets:
        img.save(path, **opts)
        kb = path.stat().st_size / 1024
        print(f"{path.name:28} {img.width:>5} x {img.height:<5} {kb:>8.1f} KB")

    print(f"\ndisplay derivatives: {DISPLAY_W} x {display_h} (covers 286 x 358 at 2x DPR)")


if __name__ == "__main__":
    main()

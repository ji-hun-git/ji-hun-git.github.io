"""Regenerate the profile image derivatives from the master photo.

The master (assets/profile/jihun-chae-master.jpg, 1200 x 1543) is the
photographer's delivered file, kept unchanged. It carries the studio's marks:
its credit in the top left, a signature in the top right and a three-line
caption along the bottom. The derivatives are a crop of it that leaves all
three out (a crop only: nothing in the photograph is retouched).

The crop is a head-and-shoulders portrait in the CV photo box's aspect
(572:735, the width and height attributes in index.html), centred on the
face. Its left edge is just right of the credit, so its top can rise above
it and leave the hair room below the frame; its right edge stays inside the
signature's left edge, and its bottom far above the caption.

The CV shows the photo at 96px wide (100px on phones, 90px on paper). The
display derivatives (328px wide) cover that at 3x. The full-size crop is the
Person structured data's image (jihun-chae-og.jpg). The 1200 x 630
link-preview card (jihun-chae-card.jpg) is not made here:
tools/build_og_card.py renders it around a tighter crop of the same master,
checked against the same marks.

    python tools/build-profile-images.py

Requires Pillow. Idempotent - safe to re-run after replacing the master (then
measure the marks again).
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
MASTER = ROOT / "assets" / "profile" / "jihun-chae-master.jpg"
OUT_DIR = ROOT / "assets" / "profile"

# The photographer's marks, (left, top, right, bottom) in master pixels:
# every pixel more than 18 levels brighter than the backdrop around it.
MARKS = {
    "studio credit (top left)": (102, 49, 264, 98),
    "signature (top right)": (949, 55, 1103, 108),
    "caption (bottom)": (150, 1423, 1050, 1480),
}
# The CV photo box (cv.css .profile-image, index.html width/height).
ASPECT = 572 / 735
# Centred on the face (x 575); 1px right of the credit, 64px inside the
# signature, 556px above the caption; 36px of backdrop above the hair (the
# hair starts at y 106), 620 x 797.
CROP = (265, 70, 885, 867)

DISPLAY_W = 328


def clear_of_marks(box: tuple[int, int, int, int]) -> list[str]:
    """The marks that `box` would include (none, for a clean crop)."""
    left, top, right, bottom = box
    return [name for name, (l, t, r, b) in MARKS.items()
            if left < r and l < right and top < b and t < bottom]


def main() -> None:
    if not MASTER.exists():
        raise SystemExit(f"master not found: {MASTER}")
    inside = clear_of_marks(CROP)
    if inside:
        raise SystemExit(f"the crop {CROP} includes the photographer's {', '.join(inside)}")
    width, height = CROP[2] - CROP[0], CROP[3] - CROP[1]
    if abs(width / height - ASPECT) / ASPECT > 0.005:
        raise SystemExit(f"the crop is {width} x {height}, not the photo box's 572:735")

    src = Image.open(MASTER)
    src = ImageOps.exif_transpose(src).convert("RGB")
    portrait = src.crop(CROP)
    display_h = round(DISPLAY_W * height / width)
    display = portrait.resize((DISPLAY_W, display_h), Image.LANCZOS)

    targets = [
        (OUT_DIR / "jihun-chae.webp", display, {"format": "WEBP", "quality": 82, "method": 6}),
        (OUT_DIR / "jihun-chae.jpg", display, {"format": "JPEG", "quality": 82, "optimize": True, "progressive": True}),
        # The portrait URL referenced by the Person structured data.
        (OUT_DIR / "jihun-chae-og.jpg", portrait, {"format": "JPEG", "quality": 82, "optimize": True, "progressive": True}),
    ]

    for path, img, opts in targets:
        img.save(path, **opts)
        kb = path.stat().st_size / 1024
        print(f"{path.name:28} {img.width:>5} x {img.height:<5} {kb:>8.1f} KB")

    print(f"\ncrop {CROP} of the master; display derivatives {DISPLAY_W} x {display_h}")


if __name__ == "__main__":
    main()

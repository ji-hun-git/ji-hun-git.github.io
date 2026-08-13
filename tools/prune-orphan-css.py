"""Remove CSS rules for components whose markup no longer exists.

!!  DO NOT RUN THIS AS-IS. The ORPHAN list below is KNOWN BAD.  !!

Running it on 2026-08-13 dropped 335 rules (-69.7 KB) and broke the shelf:
pl-volume__page-block flipped display:none -> block, and book cover colours and
heights changed. It was reverted.

The cause is that project-library.js builds class names by interpolation, e.g.
`pl-palette-${work.palette}` at project-library.js:1876, plus pl-height-*,
pl-width-* and pl-pattern-*. Those literal strings appear nowhere in the source,
so a static "is this token referenced?" check reports them dead while they are
applied at runtime.

Before trusting this again the orphan list must be rebuilt from a RUNTIME class
census - instrument classList/create() while walking all 37 work records and
every interaction - and any change must be diffed against a computed-style
baseline across library/cv x en/ko. The file is kept for that follow-up work.


The 25 stacked `pl-library-v*` layers are all still applied to live elements, so
none of them can be dropped wholesale. What *is* dead is a set of components
from earlier design generations - `pl-taxonomy`, `pl-site-nav`,
`pl-landing-masthead`, `pl-palette-*` and friends - whose class names appear in
the stylesheet and nowhere in any served HTML or JS.

The orphan list below was derived by probing the live DOM across nine states
(library/cv x en/ko x reader x book-open) and then discarding anything whose
class tokens appear in project-library.js, work-content.js, work-designs.js,
ripple.js, index.html or laboratory.html - i.e. anything a script could apply at
runtime. Only names with no reference anywhere survived.

Selector lists are split: a rule is dropped only if *every* comma-part is
orphaned, otherwise just the orphaned parts are removed and the live parts stay.

    python tools/prune-orphan-css.py --dry-run
    python tools/prune-orphan-css.py
"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "assets" / "project-library" / "project-library.css"

ORPHANS = [
    "pl-brand-mark", "pl-brand-role", "pl-collection-count", "pl-collection-switch",
    "pl-corner-deck", "pl-corner-intro", "pl-corner-note", "pl-corner-title-row",
    "pl-cv-jump__arrow", "pl-cv-link", "pl-cv-transition", "pl-detail__award-label",
    "pl-detail__claims", "pl-detail__role", "pl-detail__story", "pl-detail__story-item",
    "pl-editorial__value", "pl-eyebrow", "pl-header", "pl-height-medium", "pl-height-xl",
    "pl-identity", "pl-intro", "pl-intro-copy", "pl-jc-mark", "pl-landing-masthead",
    "pl-landing-name", "pl-library-controls", "pl-library-counts", "pl-palette-coral",
    "pl-palette-forest", "pl-palette-jade", "pl-palette-marine", "pl-palette-ochre",
    "pl-palette-rust", "pl-palette-slate", "pl-palette-violet", "pl-pattern-axis",
    "pl-pattern-bands", "pl-pattern-field", "pl-pattern-window", "pl-rigid-edge--fore",
    "pl-scroll-button", "pl-shelf-hint", "pl-site-nav", "pl-skip-shelf", "pl-taxonomy",
    "pl-taxonomy__count", "pl-taxonomy__item", "pl-taxonomy__shape", "pl-toolbar",
    "pl-volume--award", "pl-volume--project", "pl-volume__leaf", "pl-volume__page-fan",
    "pl-volume__spine-title", "pl-width-thin", "pl-width-xwide", "pl-year-break",
]

# Exact class-token match: `.pl-taxonomy` must not match `.pl-taxonomy__item`,
# and `.pl-volume--project` must never take `.pl-volume` with it.
ORPHAN_RE = re.compile(r"\.(?:" + "|".join(re.escape(o) for o in ORPHANS) + r")(?![\w-])")


def split_top_level(selector: str) -> list[str]:
    """Split a selector list on commas that are not inside :is()/:where()/etc."""
    parts, depth, buf = [], 0, ""
    for ch in selector:
        if ch == "(":
            depth += 1
        elif ch == ")":
            depth -= 1
        if ch == "," and depth == 0:
            parts.append(buf)
            buf = ""
        else:
            buf += ch
    parts.append(buf)
    return parts


def prune(css: str) -> tuple[str, int, int]:
    out = []
    i = 0
    dropped = trimmed = 0
    n = len(css)

    while i < n:
        brace = css.find("{", i)
        if brace == -1:
            out.append(css[i:])
            break

        raw = css[i:brace]
        # Everything up to and including the last `}` in this span belongs to
        # enclosing blocks that already closed (e.g. the end of an @media). It
        # must always be emitted verbatim - folding it into the selector is how
        # a dropped rule used to take an at-rule's closing brace with it.
        last_close = raw.rfind("}")
        if last_close != -1:
            out.append(raw[: last_close + 1])
            prelude = raw[last_close + 1 :]
        else:
            prelude = raw

        # An at-rule prelude (@media, @supports) opens a nested block; walk into it.
        stripped = prelude.strip()
        if stripped.startswith("@") and not stripped.startswith("@font-face"):
            out.append(prelude + "{")
            i = brace + 1
            continue

        # Find the matching close brace for this declaration block.
        depth, j = 1, brace + 1
        while j < n and depth:
            if css[j] == "{":
                depth += 1
            elif css[j] == "}":
                depth -= 1
            j += 1
        block = css[brace : j]

        parts = split_top_level(prelude)
        kept = [p for p in parts if not ORPHAN_RE.search(p)]

        if not kept:
            dropped += 1
            # Drop the rule and any comment/whitespace immediately before it.
            while out and out[-1].strip() == "":
                out.pop()
        else:
            if len(kept) != len(parts):
                trimmed += 1
            out.append(",".join(kept) + block)
        i = j

    return "".join(out), dropped, trimmed


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    css = TARGET.read_text(encoding="utf-8")
    pruned, dropped, trimmed = prune(css)

    if css.count("{") != css.count("}"):
        raise SystemExit("source braces unbalanced - refusing to touch it")
    if pruned.count("{") != pruned.count("}"):
        raise SystemExit("result braces unbalanced - aborting, nothing written")

    before_kb = len(css.encode()) / 1024
    after_kb = len(pruned.encode()) / 1024
    print(f"rules dropped whole      : {dropped}")
    print(f"selector lists trimmed   : {trimmed}")
    print(f"size {before_kb:.1f} KB -> {after_kb:.1f} KB  ({before_kb - after_kb:.1f} KB, "
          f"{(1 - after_kb / before_kb) * 100:.1f}%)")
    print(f"lines {css.count(chr(10))} -> {pruned.count(chr(10))}")

    if args.dry_run:
        print("\ndry run - nothing written")
        return
    TARGET.write_text(pruned, encoding="utf-8")
    print(f"\nwrote {TARGET.relative_to(ROOT)}")


if __name__ == "__main__":
    main()

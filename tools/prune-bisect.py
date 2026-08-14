"""Prune CSS rules for a named group of classes, so the 3px shift can be bisected.

Usage:
    python tools/prune-bisect.py GROUP [--dry-run]
    python tools/prune-bisect.py restore

Groups are defined below. Every run first copies the stylesheet to
tools/.pl-original.css if that snapshot does not exist, and `restore` puts it
back, so a bad group is always one command from undone.
"""

from __future__ import annotations

import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TARGET = ROOT / "assets" / "project-library" / "project-library.css"
SNAPSHOT = Path(__file__).resolve().parent / ".pl-original.css"

# The 48 classes with no trace in any source (see CSS-CENSUS.md), split so the
# families suspected of carrying the 3px can be isolated from the rest.
GROUPS = {
    # Suspected: these set sizing custom properties the volume/stage geometry reads.
    "height": ["pl-height-medium", "pl-height-short", "pl-height-standard",
               "pl-height-tall", "pl-height-xl"],
    "width": ["pl-width-narrow", "pl-width-regular", "pl-width-thin",
              "pl-width-wide", "pl-width-xwide"],
    "pattern": ["pl-pattern-axis", "pl-pattern-bands", "pl-pattern-current",
                "pl-pattern-field", "pl-pattern-grid", "pl-pattern-orbit",
                "pl-pattern-rules", "pl-pattern-signal", "pl-pattern-terrain",
                "pl-pattern-type", "pl-pattern-window"],
    # Abandoned components, expected self-contained.
    "taxonomy": ["pl-taxonomy__count", "pl-taxonomy__item", "pl-taxonomy__shape"],
    "landing": ["pl-landing-masthead", "pl-landing-name", "pl-jc-mark", "pl-intro-copy"],
    "corner": ["pl-corner-deck", "pl-corner-intro", "pl-corner-note", "pl-corner-title-row"],
    "detail": ["pl-detail__award-label", "pl-detail__claims", "pl-detail__role",
               "pl-detail__story", "pl-detail__story-item", "pl-editorial__value"],
    "misc": ["bio", "is-closing-cover", "pl-collection-count", "pl-collection-switch",
             "pl-cv-jump__arrow", "pl-scroll-btn", "pl-scroll-button", "pl-skip-shelf",
             "pl-volume__leaf", "pl-year-break"],
}
GROUPS["suspect"] = GROUPS["height"] + GROUPS["width"] + GROUPS["pattern"]
GROUPS["safe"] = (GROUPS["taxonomy"] + GROUPS["landing"] + GROUPS["corner"]
                  + GROUPS["detail"] + GROUPS["misc"])
GROUPS["all"] = GROUPS["suspect"] + GROUPS["safe"]


def split_top(sel: str) -> list[str]:
    parts, depth, buf = [], 0, ""
    for ch in sel:
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


def prune(css: str, classes: list[str]) -> tuple[str, int, int]:
    rx = re.compile(r"\.(?:" + "|".join(re.escape(c) for c in classes) + r")(?![\w-])")
    out, i, n = [], 0, len(css)
    dropped = trimmed = 0
    while i < n:
        b = css.find("{", i)
        if b == -1:
            out.append(css[i:])
            break
        raw = css[i:b]
        lc = raw.rfind("}")
        if lc != -1:
            out.append(raw[: lc + 1])
            pre = raw[lc + 1 :]
        else:
            pre = raw
        st = pre.strip()
        if st.startswith("@") and not st.startswith("@font-face"):
            out.append(pre + "{")
            i = b + 1
            continue
        d, j = 1, b + 1
        while j < n and d:
            if css[j] == "{":
                d += 1
            elif css[j] == "}":
                d -= 1
            j += 1
        block = css[b:j]
        parts = split_top(pre)
        kept = [p for p in parts if not rx.search(p)]
        if not kept:
            dropped += 1
            while out and out[-1].strip() == "":
                out.pop()
        else:
            if len(kept) != len(parts):
                trimmed += 1
            out.append(",".join(kept) + block)
        i = j
    return "".join(out), dropped, trimmed


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(f"groups: {', '.join(sorted(GROUPS))}")
    group = sys.argv[1]

    if not SNAPSHOT.exists():
        shutil.copyfile(TARGET, SNAPSHOT)

    if group == "restore":
        shutil.copyfile(SNAPSHOT, TARGET)
        print("restored from snapshot")
        return

    if group not in GROUPS:
        raise SystemExit(f"unknown group {group!r}; have: {', '.join(sorted(GROUPS))}")

    css = SNAPSHOT.read_text(encoding="utf-8")   # always prune from the original
    res, dropped, trimmed = prune(css, GROUPS[group])
    if res.count("{") != res.count("}"):
        raise SystemExit("unbalanced braces - nothing written")

    kb0, kb1 = len(css.encode()) / 1024, len(res.encode()) / 1024
    print(f"group {group!r}: {len(GROUPS[group])} classes")
    print(f"  rules dropped {dropped}, lists trimmed {trimmed}")
    print(f"  {kb0:.1f} KB -> {kb1:.1f} KB  (-{kb0 - kb1:.1f} KB)")
    if "--dry-run" in sys.argv:
        print("  dry run, nothing written")
        return
    TARGET.write_text(res, encoding="utf-8")
    print("  written")


if __name__ == "__main__":
    main()

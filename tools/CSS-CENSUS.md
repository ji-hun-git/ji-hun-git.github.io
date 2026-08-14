# Runtime class census — findings

Dated 2026-08-13. Written because two attempts to shrink `project-library.css`
by static analysis produced wrong answers, the second of which broke the shelf
in a way that had to be reverted.

## Why static analysis fails on this codebase

`project-library.js:1876` builds class names by interpolation:

```js
const flight = create("div", `pl-flight-cover pl-palette-${work.palette || "ink"}`);
```

The string `pl-palette-coral` therefore exists nowhere in the source. Any
"is this class referenced?" grep reports it dead while it is applied at runtime.
The same holds for `pl-height-*`, `pl-width-*` and `pl-pattern-*`.

On 2026-08-13 a prune built from that grep dropped 335 rules (-69.7 KB) and
broke the shelf: `pl-volume__page-block` flipped `display:none` → `block`, and
book cover colours and heights changed. Reverted.

## Method

A `MutationObserver` on `class` attributes plus added nodes records every token
the DOM ever carries, then the UI is driven exhaustively:

- both views (`?view=cv` and the library), EN and KO, reader mode
- all 37 books opened and closed
- full open/close animations allowed to finish (no early Escape)
- book-to-book navigation while open
- real `pointerdown`/`pointerup` (not `.click()`) so ripple classes spawn
- keyboard activation, hover enter/leave, the language toggle, copy-to-clipboard
- 375px and 1440px

**Result: 201 live class tokens.** The vocabulary converged — after the first
19 books, 18 more plus a Korean pass plus a mobile pass added **zero** new
tokens.

## Result

| | count |
|---|---|
| Live class tokens observed | 201 |
| Classes referenced by CSS | 302 |
| Referenced but never applied | 103 |
| Rules whose every selector is unreachable | 312 of 2375 (13.1%) |

### The guard

The 103 candidates are **not** all safe. Cross-referencing each against the JS
and HTML source:

| | count | verdict |
|---|---|---|
| Appears literally in JS/HTML | 21 | **keep** |
| Prefix could be interpolated | 34 | **keep** |
| No trace in any source | 48 | safe candidate |

`pl-flight-cover`, `pl-palette-*` and the `is-extracting` / `is-arriving` /
`is-returning` transition states are all in the **keep** set. They never render
in the current build — the flight animation appears to have been superseded by
the `stable-hinge` motion model — but the code that applies them still exists,
so deleting their CSS would break the site the moment that path is re-enabled.

### The 48 with no trace anywhere

```
bio                       pl-height-medium          pl-pattern-signal
is-closing-cover          pl-height-short           pl-pattern-terrain
pl-collection-count       pl-height-standard        pl-pattern-type
pl-collection-switch      pl-height-tall            pl-pattern-window
pl-corner-deck            pl-height-xl              pl-scroll-btn
pl-corner-intro           pl-intro-copy             pl-scroll-button
pl-corner-note            pl-jc-mark                pl-skip-shelf
pl-corner-title-row       pl-landing-masthead       pl-taxonomy__count
pl-cv-jump__arrow         pl-landing-name           pl-taxonomy__item
pl-detail__award-label    pl-pattern-axis           pl-taxonomy__shape
pl-detail__claims         pl-pattern-bands          pl-volume__leaf
pl-detail__role           pl-pattern-current        pl-width-narrow
pl-detail__story          pl-pattern-field          pl-width-regular
pl-detail__story-item     pl-pattern-grid           pl-width-thin
pl-editorial__value       pl-pattern-orbit          pl-width-wide
                          pl-pattern-rules          pl-width-xwide
                                                    pl-year-break
```

Note `pl-cv-jump__arrow`: the markup uses the modifier `pl-cv-jump--arrow`, so
the `__arrow` child rules were never going to match. That one is a plain typo
between BEM element and modifier.

## Before deleting anything

The census narrows the target; it does not license a delete. `pl-height-*` and
`pl-width-*` sit in the 48 **and** resemble the families whose removal broke
heights last time, so treat that overlap as unresolved until proven otherwise.

1. Capture a computed-style baseline first. The harness used previously
   fingerprints every element (25 properties + bounding rect) across
   library/cv × en/ko and stores it in `sessionStorage`.
2. Delete in small batches — one component family at a time, not all 48.
3. Re-fingerprint and diff after each batch. The earlier revert was verified
   by that diff returning **0 changed elements** across 1930 elements.
4. Anything that moves, put back.

`prune-orphan-css.py` in this directory carries the old, known-bad list and a
DO-NOT-RUN header. Its selector-list splitting and brace-balance guard are
reusable; its `ORPHANS` constant is not.

---

## Attempt 2 (2026-08-13, same day): the guarded 48 also fail

The 48-class list above was executed against a computed-style baseline
(4 states × 1916 elements, 27 properties + bounding rect).

- 128 rules dropped, 97 selector lists trimmed, 462.4 KB → 434.4 KB (-6.1%)
- **Diff: 329 elements changed in both `library-en` and `library-ko`.**
- Every sampled change was a uniform **3px upward shift** (`y 134 → 131`) with
  all sizes unchanged — the same signature as the first, static-grep attempt.

Reverted; the diff returned to 0 changed elements.

**So the runtime census is necessary but not sufficient.** A class can be absent
from the DOM in every observed state and still be load-bearing, because these
rules do more than style the class they name: dropping the rule also drops
whatever padding, margin or custom property it contributed to an ancestor that
*is* live. The 3px is almost certainly one such contribution near the top of the
shelf stage.

### What to try next

Do **not** delete by class. Delete by rule, one family at a time, smallest
first, re-diffing after each:

1. Start with `pl-taxonomy__*`, `pl-landing-*`, `pl-corner-*` — abandoned
   components whose rules are self-contained.
2. Leave `pl-height-*`, `pl-width-*` and `pl-pattern-*` until last. They are the
   most likely source of the 3px: they set sizing custom properties that the
   volume/stage geometry reads.
3. Bisect the 3px directly: delete half the list, diff, halve again. Four or
   five rounds isolates the offending family, and that answer is worth more than
   the 28 KB.

Expected ceiling is modest either way: 6.1% of the file. The real reduction
needs the 27 stacked version layers collapsed, which is a rewrite, not a prune.

---

## Attempt 3: bisecting the 3px

`prune-bisect.py` splits the 48 classes into families and prunes one group at a
time from a pristine snapshot, so any group can be tested and undone in one
command.

Baseline: library view, EN + KO, 1916 elements, 22 properties + bounding rect.

| group | classes | rules dropped | size | diff (EN / KO) |
|---|---|---|---|---|
| `safe` (taxonomy+landing+corner+detail+misc) | 27 | 128 | -25.7 KB | **329 / 331** |
| `landing` (masthead, name, jc-mark, intro-copy) | 4 | 9 | -1.2 KB | **0 / 3** |

**The prediction in Attempt 2 was wrong.** `pl-height-*`, `pl-width-*` and
`pl-pattern-*` were the suspects; the shift is actually inside the 27 classes
that were assumed self-contained.

`landing` is effectively clean: 0 changed elements in English, and the 3 in
Korean are a 2px width change on the skip link at `y = -54`, i.e. parked
off-screen and never seen. That group is safe to drop for 1.2 KB.

The culprit is therefore in **taxonomy, corner, detail or misc**. Next: run
each of those four alone against the same baseline. The header shift
(`y 87 → 84`) says it is something contributing padding or margin near the top
of the shelf stage.

Bear in mind the whole 48-class set is only worth ~26 KB of 462 KB. The
remaining families are worth testing to close the question, but the real
reduction is still the 27-layer collapse, which is a rewrite.

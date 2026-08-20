# Harness

A regression net for a site with no build step, no tests, and 463 KB of
stylesheet whose cascade decides what you actually see.

Two halves, both runnable on their own:

```bash
python tools/harness/static_checks.py     # files only: no browser, no network, stdlib only
python tools/harness/run_browser.py       # a real Chromium over all 10 view states
```

Both exit `0` on pass and `1` on failure, so either works as a pre-commit hook
or a CI gate. `run_browser.py` exits `2` if Playwright is missing, so "not
installed" is distinguishable from "found problems".

```bash
python tools/harness/static_checks.py --json      # machine-readable
python tools/harness/static_checks.py --strict    # warnings fail too
python tools/harness/static_checks.py --only cache-stamp
python tools/harness/run_browser.py --state cv/en --viewport mobile
python tools/harness/run_browser.py --headed      # watch it drive
```

## Why a harness at all

This site has three properties that defeat ordinary review:

1. **Nothing is where it looks.** The CV and the work library are two states of
   one document, the bilingual copy is 317 span pairs toggled by `display`, and
   almost everything visible is built at runtime from `work-content.js`. Reading
   `index.html` tells you very little about what renders.
2. **The cascade is the bug surface.** `project-library.css` is ~463 KB with
   ~2,700 `!important` declarations across 27 simultaneously live
   `pl-library-v*` layers. Most defects found here were not wrong values; they
   were correct values losing a specificity contest. The publication year filter
   was completely inert for exactly this reason, and it looked fine in the DOM.
3. **Failures are silent.** A missing background image logs nothing. A stale
   `?v=` stamp only breaks for returning visitors. A blank print sheet only
   appears when someone presses Ctrl+P.

So the checks are mostly *measurements against a live render*, not lint.

## What it checks, and why each one exists

Every check corresponds to a defect this repo actually shipped.

### `static_checks.py`

| Check | Catches |
| --- | --- |
| `references` | Any `src`/`href`/`url()`/import that resolves to no file. Two logos shipped for months rendering nothing. |
| `duplicate-id`, `dangling-anchor`, `dangling-aria`, `dangling-label` | Broken wiring that only shows in one of the four view states. |
| `cache-stamp` | Assets changed but `?v=` did not — returning visitors get new CSS against old JS. Hashes the bytes behind each stamp against `asset-stamps.json`. Also flags a page using more than one stamp. |
| `pii-*`, `tracker`, `external-origin`, `image-metadata` | A public repo publishing something personal: a non-institutional address, a phone number, EXIF/GPS in a photo, an analytics beacon, or a new third-party origin that sees every visitor's IP. |
| `git-identity` | A personal mailbox in commit metadata. No file edit fixes this — see `rewrite-git-identity.sh`. |
| `publication-roles` | 16 of 21 publication rows stated the author position and 5 did not; the 5 gaps were exactly the 5 fourth-author papers. |
| `bilingual-pairs` | A `p(en, ko)` call with an empty half — invisible in the language you write in. |
| `award-consistency` | The CV asserting an award the library's own "Verified result" panel disclaims. The two surfaces come from different files, so only a cross-file check sees it. |
| `toggled-class-unstyled` | A class the JS toggles that no stylesheet or JS selector reads, so the toggle does nothing. This is how `.pub-group.hidden` was found. |
| `lab-registry`, `meta`, `font-preload`, `img-alt`, `heading-order`, `unreferenced-assets` | Smaller drift: a simulation imported but absent, a page with no canonical, a preload URL that no longer matches its `@font-face`. |

### `dom_audit.js` (used by `run_browser.py`; also paste-able into DevTools)

Contrast (WCAG 2.2 AA), focus-ring contrast (1.4.11), horizontal overflow,
heading order, landmarks, accessible names, target size (2.5.8), tiny text,
bilingual pairing at runtime, `target=_blank` hygiene, oversized raster images,
and the third-party origins actually contacted.

### `run_browser.py` only

- **console** — errors and failed requests during load.
- **print** — renders with `media: print` and asserts the CV is still there.
  Printing `/` used to yield a near-blank sheet, on a CV site, for the URL
  people share.
- **filter-inert** — clicks each year filter and asserts the list actually
  changes. Nothing in the DOM looks wrong when this breaks.

## Three things that are easy to get wrong

Written down because each one silently produced a *clean* report:

- **Parse `color(srgb …)`.** Chrome returns some composited colours in that
  notation. A naive `/\d+/` scan reads `color(srgb 1 1 1 / .94)` as
  `rgb(1,1,1)` — near black — and invents contrast failures. Alpha must also be
  composited down to an opaque colour before measuring. Getting this wrong
  reported 8 failures where there were 0.
- **Let the page settle, deterministically.** Most of this page starts at
  `opacity: 0` and fades in on scroll, and a tab that is not compositing frames
  (headless, backgrounded, hidden preview) never advances CSS animations at all.
  Auditing a fresh load measures ~25 of ~1030 text elements and calls the rest
  invisible. `dom_audit.js` scrolls with `scroll-behavior` forced to `auto`,
  calls `.finish()` on every finite animation, and then runs the page's own
  reduced-motion reveal path (`index.html`, the `.reveal` fallback). Coverage
  goes from 4 elements to 330.
- **`CSSStyleRule.cssRules` exists and is usually empty.** Chrome gives every
  style rule a nested-rules list for CSS nesting, so `if (rule.cssRules)
  { recurse; continue; }` skips all 1,512 style rules on this page and reports
  zero of everything. Dispatch on `selectorText` instead.

## Maintaining it

- **`harness.config.json`** holds the allowlists: which email addresses are
  meant to be public, which external origins may serve assets versus be linked,
  and which files are deliberately unreferenced (each with a reason).
  Edit this, not the script, when the site legitimately gains one.
- **`asset-stamps.json`** is the cache-stamp baseline. After bumping a `?v=`
  stamp, run `python tools/harness/static_checks.py --update-stamps` and commit
  the result. Skip that and the next run fails with a stale-stamp error, which
  is the point.
- **A check that cries wolf is worse than no check.** Several here were wrong on
  the first pass — `rel=canonical` counted as a third-party asset load, an SVG
  flagged as "oversized" for its slot, `alt="Jihun Chae"` on a portrait called
  lazy filename reuse. If a finding is noise, fix the check or add it to the
  config with a reason. Do not learn to skim past it.

## Requirements

- `static_checks.py` — Python 3.8+, standard library only. No dependencies, by
  design: this repo has no build step and should not grow one.
- `run_browser.py` — adds Playwright:
  ```bash
  pip install playwright && python -m playwright install chromium
  ```

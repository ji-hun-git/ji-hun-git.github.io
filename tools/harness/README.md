# Regression checks

Static checks use the Python standard library. Browser checks require Playwright:

```sh
python -m pip install -r tools/harness/requirements.txt
python -m playwright install chromium
python -m unittest discover -s tools/harness -p "test_*.py"
python tools/build_ko_page.py --check
python tools/harness/static_checks.py
python tools/harness/run_browser.py
python tools/harness/library_interactions.py
python tools/harness/rebuild_checks.py
python tools/harness/lab_checks.py
python tools/harness/book_motion_checks.py
python tools/harness/jet_copy_checks.py
```

The tests cover references, cache versions, public metadata, responsive layouts,
keyboard focus, both languages, search, filtering, record history, and print.

The bookshelf is switched off (`BOOKSHELF_ENABLED` in the `<head>` of
`index.html`). The suites that exercise it open `/?view=library`
(`run_browser.BOOKSHELF`), which opens it on the local test server whether the
switch is on or off. While it is off, `run_browser.py` also loads the site under
a non-local host name and checks that `/`, `?view=cv` and `?view=library` render
the CV, that no bookshelf file is requested, that nothing visible leads to the
bookshelf, and that old `?work=<slug>` links land on their CV entry.
Before the switch goes back on, bring `assets/project-library/work.js` in line
with the CV: its records still carry facts the CV has since corrected against
the owner's CV (DQM dates and role, award names, the Cofathon track and
Education).
`static_checks.py` checks the switch itself, the sitemap, metadata and links
while it is off, and that the CV entry ids match `work.js`. Asset URLs in inline
scripts count towards a page's `?v=` stamp like any other reference.
The CV has one page per language: `/` (`index.html`) and `/ko.html`, which
`tools/build_ko_page.py` generates from `index.html`. `static_checks.py` fails
while `ko.html` is stale (run the generator), and checks each page's single
title and description (English descriptions at most 160 characters), that the
two pages name themselves as canonical and list each other with `hreflang`,
that the JSON-LD parses and matches the visible page (name, role line, topics,
education, profile links, `dateModified` against the sitemap), and that
`sitemap.xml` lists exactly the canonical pages with the same language links.
`static_checks.py` also fails on any English element left in the body of
`ko.html`: every English element in `index.html` needs a Korean twin, and the
generator leaves the English one out of the Korean page.
`run_browser.py` checks that `/ko.html` is Korean before any script runs
(JavaScript disabled) and unchanged once `site.js` runs, that the language
button rewrites the address between `/` and `/ko.html` while keeping the query
and `#section`, that `/?lang=ko` and `/?view=cv#publications` still work, and
that the Korean page's Simulations link (`laboratory.html?from=ko`) leads to a
lab whose CV link returns to `/ko.html`.
The CV opens on its overview: `site.js` folds the five numbered sections to
their headings, each a button (`aria-expanded`, `aria-controls` its
`<section>-body`) that hides the body with `hidden="until-found"`. The HTML
ships them open, and `static_checks.py` checks that markup and that the
overview's counter strip stays gone. `run_browser.py` checks the folded landing
on both pages (only the overview, Methods and tools and the five headings, rows
at least 44px tall), mouse, Enter and Space, sections opening independently,
the far end of a row and the Google Scholar link beside the Publications
heading, links that open their section and land on it (on load, the section
nav, an in-page `#cv-work-` link, a typed `#fragment`, a fragment into a folded
section through `beforematch`, and `?work=<slug>` on a public host), printing
(every section on paper, then the reader's own state again), the page without
JavaScript (nothing folded), the page with `site.js` blocked (every entry
shown, no chevron or pointer on the headings), a deep link while `site.js`
arrives late (no layout shift, and it still lands), no folded section marked
current in the section nav, and sideways scroll at 320, 390 and 1440px, folded
and open. Suites that need the whole CV visible (the audits, the year filter,
the KF-21 entry) open the sections with `run_browser.open_all_sections`, which
clicks the real headings. A folded section is out of the accessibility tree,
and browser reader views (Firefox Reader View, Chrome's Reading mode) show
only the sections that are open (the site's own reader mode keeps the folds
too); printing and the page without JavaScript show every section.
The jet suite also covers the KF-21 flyby on the CV at `/` (hover, keyboard
focus, cooldown, reduced motion, no WebGL, one jet when the bookshelf is on, and
no flyby when the page scrolls the entry under a resting pointer).
`rebuild_checks.py` prints the CV to A4 in both languages and checks, with
`pypdf`, that the paper copy spells out the email address and profile URLs,
carries all five sections and all 43 entries although the page was folded when
printing started, and stays within 11 pages. With `--screenshots <directory>` it also writes viewport
screenshots and an A4 CV PDF. Keep those review artifacts outside the published
repository.

`python -m unittest discover` runs `test_integrity_guards.py`, which breaks the
CV on purpose (a wrong award tier, an empty Korean half in the bookshelf data,
the overview's counter strip put back, a section shipped folded, a heading
button that controls nothing, an entry outside its section's body, a
publication without an author role, a missing input file) and checks that `static_checks.py` fails, and
`test_diagnostic_privacy.py`, which keeps personal addresses out of reports.

Every page that loads code or styles must declare a Content-Security-Policy,
and `static_checks.py` checks that each inline script's SHA-256 hash is in it.
The policies have no `'unsafe-eval'`, so in the browser suites a
`wait_for_function` predicate must be a function (`"() => ..."`): a bare
expression string is evaluated with `eval()` in the page and is blocked.

When releasing asset changes, update the version strings and run
`static_checks.py --update-stamps`. Commit the resulting baseline with the assets.
Scripts that import a sibling under a `?v=` query are stamped files too (every
simulation imports `./_shared.js?v=...`; `site.js` and `library.js` import the
flyby): bump those strings when the sibling changes.
Do not suppress a failing check without understanding the underlying behavior.

The book-motion suite covers the Three.js pull, turn, opening, and page bends;
seven viewports; touch and rotation; actual WebGL pixels and framing; skip,
Escape, history, context loss, and reduced-motion/module/WebGL fallbacks. It also
compares the final opaque 3D pages against the HTML reader, checking both overall
pixel difference and missing or misplaced text. The reader uses measured DOM text
for its final textures, so content and wrapping are shared rather than duplicated.
Pass `--screenshots <directory>` to capture deterministic animation frames.

The jet suite checks moving WebGL pixels, small-phone toolbar fit, keyboard and
touch replay, hover cancellation, cooldown, and reduced-motion/WebGL fallbacks.
It also compares published citations and credentials with the preserved
`2654b89` reference commit. Use a full clone; for a shallow clone, run
`git fetch --unshallow` first. The CI workflow checks out full history.

The pinned Python 3.11 test environment is shared with GitHub Actions. On Linux,
use `python -m playwright install --with-deps chromium` to install browser system
dependencies. CI runs all checks without publishing review screenshots or PDFs.

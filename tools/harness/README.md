# Regression checks

Static checks use the Python standard library. Browser checks require Playwright:

```sh
python -m pip install -r tools/harness/requirements.txt
python -m playwright install chromium
python -m unittest discover -s tools/harness -p "test_*.py"
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
`rebuild_checks.py --screenshots <directory>` also writes viewport screenshots and
an A4 CV PDF. Keep those review artifacts outside the published repository.

When releasing asset changes, update the version strings and run
`static_checks.py --update-stamps`. Commit the resulting baseline with the assets.
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

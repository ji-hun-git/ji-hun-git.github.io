# Regression checks

Static checks use the Python standard library. Browser checks require Playwright:

```sh
pip install playwright pillow
python -m playwright install chromium
python tools/harness/static_checks.py
python tools/harness/run_browser.py
python tools/harness/library_interactions.py
python tools/harness/rebuild_checks.py
python tools/harness/lab_checks.py
python tools/harness/book_motion_checks.py
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

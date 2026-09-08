# Regression checks

Static checks use the Python standard library. Browser checks require Playwright:

```sh
pip install playwright
python -m playwright install chromium
python tools/harness/static_checks.py
python tools/harness/run_browser.py
python tools/harness/library_interactions.py
python tools/harness/rebuild_checks.py
python tools/harness/lab_checks.py
```

The tests cover references, cache versions, public metadata, responsive layouts,
keyboard focus, both languages, search, filtering, record history, and print.
`rebuild_checks.py --screenshots <directory>` also writes viewport screenshots and
an A4 CV PDF. Keep those review artifacts outside the published repository.

When releasing asset changes, update the version strings and run
`static_checks.py --update-stamps`. Commit the resulting baseline with the assets.
Do not suppress a failing check without understanding the underlying behavior.

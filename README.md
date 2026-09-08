# Jihun Chae

A bilingual bookshelf of projects, publications, and awards, with a full
professional CV and an interactive simulations lab.

## Run

Static HTML, CSS, and JavaScript. No application dependencies or build step.
Serve locally with `python -m http.server 8000`, then open `http://localhost:8000`.
The bookshelf and CV also work by opening `index.html` directly; simulations
require HTTP because they use JavaScript modules.

## Structure

- `index.html`: bookshelf shell and authored bilingual CV.
- `assets/site.*`, `assets/cv.css`: shared controls and CV presentation.
- `assets/project-library/`: bookshelf, record content, and project pictograms.
- `laboratory.html`, `lab/`: simulations and their on-demand renderers.
- `tools/`: image generation and regression checks.

Run `python tools/harness/static_checks.py` for source checks. Browser tests are
documented in `tools/harness/README.md`. Update asset URL versions when releasing
changed assets. `main` is the production branch; feature branches are temporary.

## License

CC0 1.0 Universal. See `LICENSE` and `assets/NOTICE.md` for asset and trademark notes.

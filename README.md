# Jihun Chae

A bilingual bookshelf of projects, publications, and awards, with a full
professional CV and an interactive simulations lab.

## Run

Static HTML, CSS, and JavaScript. No build step. A pinned local copy of Three.js
loads on book interaction for the 3D opening sequence.
Serve locally with `python -m http.server 8000`, then open `http://localhost:8000`.
The bookshelf and CV also work by opening `index.html` directly; 3D book motion
and simulations require HTTP because they use JavaScript modules. Reduced motion,
Reader mode, or unavailable WebGL use the standard reader directly.

## Structure

- `index.html`: bookshelf shell and authored bilingual CV.
- `assets/site.*`, `assets/cv.css`: shared controls and CV presentation.
- `assets/project-library/`: bookshelf, record content, and project pictograms.
- `assets/vendor/three/`: Three.js 0.185.1 and its MIT license.
- `laboratory.html`, `lab/`: simulations and their on-demand renderers.
- `tools/`: image generation and regression checks.

Run `python tools/harness/static_checks.py` for source checks. Browser tests are
documented in `tools/harness/README.md`. Update asset URL versions when releasing
changed assets. `main` is the production branch; feature branches are temporary.

## License

CC0 1.0 Universal. See `LICENSE` and `assets/NOTICE.md` for asset and trademark notes.

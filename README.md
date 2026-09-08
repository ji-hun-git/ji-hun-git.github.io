# Jihun Chae

[Website](https://ji-hun-git.github.io/) ·
[Full CV](https://ji-hun-git.github.io/?view=cv) ·
[Site checks](https://github.com/ji-hun-git/ji-hun-git.github.io/actions/workflows/site-checks.yml)

A bilingual bookshelf of projects, publications, and awards, with a full
professional CV and an interactive simulations lab.

## Run

Static HTML, CSS, and JavaScript. No build step. A pinned local copy of Three.js
loads on book interaction for the 3D opening sequence and KF-21 flyby.
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

## Publishing

GitHub Pages publishes the repository root from `main`, with HTTPS enabled.
Pushes and pull requests to `main` run the regression workflow. Pages deployment
is managed by GitHub's separate Pages workflow, so run checks before releasing.

1. Review changes and run the checks in `tools/harness/README.md`.
2. For changed site assets, bump their cache versions and update the stamp baseline.
3. Commit the changes, fast-forward `main`, and push `main` to `origin`.
4. Confirm both Site checks and Pages deployment succeed, then verify the live site.

Keep screenshots, PDFs, backups, and private research evidence outside this repo.
Use a GitHub noreply identity for new commits. Historical identity warnings are
reported without repeating personal addresses; rewriting published history is a
separate operation, not part of a normal site release.

## License

CC0 1.0 Universal. See `LICENSE` and `assets/NOTICE.md` for asset and trademark notes.

# ji-hun-git.github.io

Personal site of Jihun Chae — an interactive work library (projects, publications,
awards) plus a CV view and a simulations lab.

- `index.html` — the site. `?view=cv` switches from the library to the CV.
- `laboratory.html` + `lab/` — the simulations hub.
- `assets/project-library/` — the bookshelf UI (CSS/JS) and its content data.
- `assets/interior/` — the Ripple interaction, ported to vanilla JS.
- `tools/` — image build scripts. Re-run after replacing a master image.

No build step: this is static HTML, CSS and JS served directly by GitHub Pages.
After editing anything under `assets/`, bump the `?v=` stamp in `index.html` or
browsers will keep serving the cached copy.

## Licence

Released under **CC0 1.0 Universal** (see `LICENSE`) — copyright waived, no
permission needed, attribution welcome but not required.

Note that the organisation logos in `assets/logos/` are the trademarks of their
respective owners. `krafton.svg` is from Wikimedia Commons (KRAFTON Logo New,
CC BY-SA 4.0, credited to KRAFTON, Inc.). They appear here to identify partners, funders and hosts of
the work described, and are not covered by the CC0 dedication above.

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
respective owners. They appear here to identify partners, funders and hosts of
the work described, and are not covered by the CC0 dedication above. Marks with
a documented source:

| File | Source | Terms |
| --- | --- | --- |
| `krafton.svg` | Wikimedia Commons, "KRAFTON Logo New" | CC BY-SA 4.0, credited to KRAFTON, Inc. |
| `skaiworldwide.png` | Official site `skaiworldwide.com` — the header mark, inlined in its `/static/js/main.36e1f395.js` bundle as a base64 PNG. Retrieved 14 Aug 2026, cropped to the mark; colours untouched. | No published brand terms. Trademark of SKAI WORLDWIDE Co., Ltd. (formerly Bitnine), used nominatively to identify the client. |
| `pohang-city.svg` | Pohang City symbol mark | Trademark of Pohang City. The city's CI page reserves commercial use and use that would damage the mark; identification of a co-host is neither. |
| `pohang-cultural-foundation.svg` | Pohang Cultural Foundation, `www.phcf.or.kr` footer lockup | **Unused — do not wire it up as-is.** It is the reversed (white) version, invisible on this light-only page. The foundation publishes no positive version; the chip shows a monogram until one is obtained. |

Getting a logo wrong is usually not a missing file. Two marks shipped in this
repo for months while rendering nothing at all — see the comment above the
partner chips in `index.html`. A mark belongs in the markup as
`<img class="p-logo">`, never as a `::before` background painted through a
positional selector.

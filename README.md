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

## Funding and programme attribution

Funding marks identify documented project-level support or programme context;
they do not imply endorsement of this portfolio or personal sponsorship. The
marks remain the property of their respective owners and are excluded from the
CC0 dedication below.

| File | Source | Treatment |
| --- | --- | --- |
| `mss.jpg` | [Ministry of SMEs and Startups](https://www.mss.go.kr/site/eng/main.do) | Official artwork, displayed unmodified beside the broader R&D-project context. |
| `nrf.svg` | [National Research Foundation of Korea](https://eng.nrf.re.kr/) | Official English SVG, displayed unmodified beside the funded accessibility-AI project. |

The Leverhulme acknowledgement is rendered as ordinary text instead of
distributing an unaudited logo file: “Project supported by The Leverhulme Trust
through its International Fellowship scheme.”

## Licence

Released under **CC0 1.0 Universal** (see `LICENSE`) — copyright waived, no
permission needed, attribution welcome but not required.

Other organisation logos in `assets/logos/` identify partners and hosts of the
work described and are not covered by the CC0 dedication above. Marks with a
documented source:

| File | Source | Terms |
| --- | --- | --- |
| `krafton.svg` | Wikimedia Commons, "KRAFTON Logo New" | CC BY-SA 4.0, credited to KRAFTON, Inc. |
| `skaiworldwide.png` | Official site `skaiworldwide.com` — the header mark, inlined in its `/static/js/main.36e1f395.js` bundle as a base64 PNG. Retrieved 14 Aug 2026, cropped to the mark; colours untouched. | No published brand terms. Trademark of SKAI WORLDWIDE Co., Ltd. (formerly Bitnine), used nominatively to identify the client. |
| `pohang-city.svg` | Pohang City symbol mark | Trademark of Pohang City. The city's CI page reserves commercial use and use that would damage the mark; identification of a co-host is neither. |
| `pohang-cultural-foundation.svg` | Pohang Cultural Foundation, `www.phcf.or.kr` footer lockup | **Unused — do not wire it up as-is.** It is the reversed (white) version, invisible on this light-only page. The foundation publishes no positive version; the chip shows a monogram until one is obtained. |

The technology marks in the CV's Code and Tools rows are a separate case: **no
file was downloaded for any of them.** Every glyph is original path data drawn
for this repo in `assets/interior/tech-icons.css`'s markup, and C++, C# and R
are set as type in the page's own mono face. None reproduces a vendor logo —
deliberately, because the row's constraint is 20px monochrome inheriting
`currentColor`, and recolouring a two-tone mark like Python's to a single ink
is exactly what those guidelines prohibit. The names identify skills
nominatively; the drawings are category marks, not brand marks. Same reasoning
as the `.p-brand-wordmark` device KRAFTON, NYU and bHaptics use — see the
header of `assets/interior/tech-icons.css`.

Getting a logo wrong is usually not a missing file. Two marks shipped in this
repo for months while rendering nothing at all — see the comment above the
partner chips in `index.html`. A mark belongs in the markup as
`<img class="p-logo">`, never as a `::before` background painted through a
positional selector.

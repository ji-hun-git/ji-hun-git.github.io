# Work library refinement

## Diagnosis

The live site and its reading state were inspected at desktop and mobile sizes.
The 37 narrow spines made titles difficult to compare; on mobile, the bookshelf
dominated the viewport. The reader devoted substantial space to a decorative
cover and squeezed the actual research into a narrow scrolling column.
Multiple generations of CSS and animation scripts controlled the same surfaces.

The revision keeps the light-only, bilingual library identity and existing
project illustrations. Three readable covers introduce selected projects; the
complete, searchable archive follows as rows. No authored research claims,
publication records, award evidence, or CV sections have been replaced with
invented marketing copy. Project dates use the start year, not the future end
year. Existing source links and stable CV targets remain available in details.

## References inspected

These six references were opened and visually inspected before implementation.
The application is selective, not a reproduction of their screens.

| Reference | Relevant observation | Application |
| --- | --- | --- |
| [Beautiful UI](https://www.beautifului.dev/) | Scannable title and metadata hierarchy, restrained actions | Archive rows with year, full title, category, and one primary action |
| [UI Skills](https://www.ui-skills.com/) | Accessibility, responsive layout, and motion checks belong in implementation | Real keyboard, language, history, reduced-motion, and viewport regression tests |
| [Amicro](https://amicro.vercel.app/) | Small, brief hover and press responses | Cover lift, arrow offset, button press feedback; no continuous motion |
| [Efferd](https://efferd.com/) | Consistent gutters and familiar navigation across layouts | Shared header/content width and responsive grid tracks |
| [Movin](https://movin.design/) | Motion provides spatial continuity between deliberate states | Short dialog entrance/dismissal and directional record navigation |
| [Aesthetic Cards](https://aesthetic-cards.vercel.app/) | A clear visual/title/metadata hierarchy within a repeated item | Book covers as selected-work items, not floating containers around whole sections |

## Interaction contract

- All 37 records are available without a filter: 6 projects, 21 publications,
  and 10 awards. Search matches both languages, titles, metadata, topics, and years.
- One native modal holds readable research sections and original source links.
  Escape, close, backdrop dismissal, keyboard focus wrapping, and focus return
  are supported. Background content is inert while the modal is open.
- Back/Forward restore the library/detail state. Direct links also work on a
  fresh load. Language is represented in the URL and preserved in CV navigation.
- Transitions use 160ms filtering, 180ms record navigation, 220ms opening,
  140ms dismissal, and 240ms cover feedback. Pending transitions are cancelled
  before a replacement starts. Reduced motion and Reader mode bypass them.
- Existing CV presentation, publication filters, print output, and simulations
  remain separate from the new library screen styles.

## Verification

`library_interactions.py` covers 320, 390, 768, 1440, and 1920px widths, both
languages, empty search, category counts, keyboard focus, modal language changes,
all 37 record details, Reader mode, reduced motion, direct links, browser history,
and CV links. Screenshots are captured only after transitions settle.

`run_browser.py` audits all 10 existing library/CV/lab states and checks print
and CV publication filters. Korean states now use the actual language control,
so the audit tests document language and translated UI together.

`static_checks.py` validates source references and the refreshed asset stamps.
The existing historical commit-identity warning is not repaired by rewriting
history. New commits use the repository owner's GitHub noreply address.

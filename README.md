# Jihun Chae

[Website](https://ji-hun-git.github.io/) ·
[Site checks](https://github.com/ji-hun-git/ji-hun-git.github.io/actions/workflows/site-checks.yml)

A bilingual (English and Korean) CV of research and development projects,
publications, and awards. An interactive simulations page is in the
repository, switched off for now.

## Run

Static HTML, CSS, and JavaScript. No build step.
Serve locally with `python -m http.server 8000`, then open `http://localhost:8000`.
The CV also works by opening `index.html` directly; simulations require HTTP
because they use JavaScript modules.

## Bookshelf (switched off)

The bookshelf, a browsable library view of the same records, is switched off for
now. While it is off, every URL shows the CV (`/?view=cv` keeps working), an old
`?work=<slug>` link opens the matching CV entry, and nothing under
`assets/project-library/` is downloaded except the KF-21 flyby: `assets/site.js`
loads `jet-flyby.js` (and Three.js) the first time a mouse pointer moves onto
that CV entry (not when the page scrolls the entry under a resting pointer),
never under reduced motion or in Reader mode. (The entry has no Tab
stop of its own, so keyboard users do not trigger it; a decoration does not get
one.) Its code stays in the repository.

- To switch it back on, set `BOOKSHELF_ENABLED = true` in the inline script in
  the `<head>` of `index.html`, then run `python tools/build_ko_page.py` so
  `ko.html` gets the same switch. The bookshelf returns at `/` and `/ko.html`,
  the CV at `?view=cv`, and the Bookshelf and Full CV header links reappear. You
  may also want to restore the `?view=cv` sitemap entries and the bookshelf
  link-preview image (`assets/project-library/bookshelf-og.png`).
- To work on it while it is off, serve the site locally and open
  `http://localhost:8000/?view=library` (or `?work=<slug>`). On `localhost`,
  `127.0.0.1` and `[::1]` only, that browser tab then behaves as if the
  bookshelf were on until the tab is closed. The browser suites use this URL.

With the bookshelf on, a pinned local copy of Three.js loads on book interaction
for the 3D opening sequence and the KF-21 flyby. Reduced motion, Reader mode, or
unavailable WebGL use the standard reader directly.

## Simulations (switched off)

The Simulations page (`laboratory.html` and `lab/`) is switched off for now,
the same way as the bookshelf. While it is off, no page links to it (the CV
header holds the brand, the language link and Reader mode only), `sitemap.xml`
leaves it out, the page carries `<meta name="robots" content="noindex">`, and
on the public site its `<head>` script sends any visit straight on to the CV
(`?from=ko`, the old link from the Korean CV, to `/ko.html`) with
`location.replace()`. Its code stays in the repository.

- To switch it back on, set `SIMULATIONS_ENABLED = true` in the inline script
  in the `<head>` of `laboratory.html` (then put that script's new hash in the
  page's Content-Security-Policy; `static_checks.py` prints it), remove its
  robots `noindex`, add its `<url>` back to `sitemap.xml`, and put a header
  link back in `index.html` (and the 404 page) before running
  `python tools/build_ko_page.py`. On the Korean page the link should carry
  `?from=ko` so the lab's CV links return to `/ko.html` (`lab/lab.js` reads it).
- To work on it while it is off, serve the site locally and open
  `http://localhost:8000/laboratory.html`. On `localhost`, `127.0.0.1` and
  `[::1]` the page keeps working; `tools/harness/lab_checks.py` runs there.
- `static_checks.py` fails while the switch is off if any page or site script
  points at `laboratory.html` (a link, structured data or a meta tag; comments
  do not count), if the sitemap lists it, or if it lost its `noindex` or its
  redirect; `run_browser.py` loads it under a non-local host
  name and checks that it lands on the CV in the right language.

## Type and spacing

Every size, weight, leading, text colour and space in `assets/site.css` and
`assets/cv.css` comes from the tokens in `site.css` `:root`:

- Type: one stack for both languages (`--sans`: Geist, then Pretendard for
  Hangul), six sizes (`--fs-13`, `16`, `18`, `20`, `24`, `28`), two weights
  (`--fw-regular` 400, `--fw-strong` 600) and named roles (`--t-section`,
  `--t-entry`, `--t-citation`, `--t-lead`, `--t-body`) that step down one size
  at 760px and below. Korean uses the same sizes with more leading
  (`body.ko`); Reader mode sets body text one step up (`body.reader`); print
  sets the same roles in points.
- Colour roles for text: `--ink`, `--ink-soft`, `--meta`, `--accent`,
  `--on-ink`.
- Space: one 4-point scale (`--space-1` 4px to `--space-24` 96px) and four
  relationship tokens redefined per breakpoint: `--gutter` (page margin =
  column gutter), `--card-pad`, `--entry-pad` (entry to entry) and
  `--section-gap`. The same relationship gets the same space everywhere: 8px
  from a title to its meta line or a label to its list, 16px between the steps
  of an entry, `--entry-pad` on both sides of the hairline between entries.

`static_checks.py` fails on a literal size, weight, leading or space in either
stylesheet (the few dimensions and optical offsets it allows are listed in its
`TOKEN_EXEMPT`), and `run_browser.py` checks the rendered page against the
same scales.

## Search engines

The CV is published as two pages, one per language, so each can be found on its
own: `/` (English, `index.html`) and `/ko.html` (Korean). `index.html` holds the
bilingual CV; `ko.html` is the same CV with a Korean `<head>` and a Korean-only
`<body>` (every English element that has a Korean twin is left out), so a
crawler that reads the raw HTML without JavaScript or CSS, as Naver mostly does,
indexes a Korean page rather than a copy of the English one. The language
control is a real link between the two pages (`<a id="langToggle">`, with
`hreflang`). On `/` it switches in place, then updates the address to
`/ko.html`, keeping the query and the `#section`; on `/ko.html` it loads the
English page at the same query and `#section`. Old `?lang=ko` links are sent on
to `/ko.html` by the `<head>` script.

- `index.html` is the only source. `ko.html` is generated from it: after any
  edit to `index.html`, run `python tools/build_ko_page.py`.
  `static_checks.py` fails while `ko.html` is out of date, or if an English
  element is left in its body (`python tools/build_ko_page.py --check` runs the
  first check alone). Every English element needs a Korean twin: the generator
  stops with the line number if one has none.
- The Korean tab title, search description and link-preview text are edited in
  one place: the `<script id="ko-head">` block in the `<head>` of `index.html`.
  The Korean forms of the few English attribute texts (aria-labels, titles) and
  of the structured-data topics are in `tools/build_ko_page.py`, next to the
  same list in `assets/site.js`.
- Icons: `favicon.ico` (16, 32, 48 px), `assets/favicon-96.png` and
  `apple-touch-icon.png` (180 px) are drawn from the "JC" monogram by
  `python tools/build_favicons.py` (Pillow). Search results show a favicon only
  from a real image file, not from the SVG data URI the pages also carry.
- Each page names itself as canonical and both list each other with `hreflang`
  (`x-default` is `/`). `sitemap.xml` lists the two public pages (`/` and
  `/ko.html`; the Simulations page is switched off) and repeats the same
  language links.
- The structured data (JSON-LD: WebSite, ProfilePage, Person) must say only what
  the page shows. `static_checks.py` compares the name, role line, topics,
  education and profile links with the page, and `dateModified` with
  `<lastmod>` in `sitemap.xml` and with the footer's "Updated YYYY.MM" /
  "YYYY.MM 갱신". When the content changes, update all three. The CV opens on
  its overview (no counters): its five sections ship open in the HTML, for
  crawlers and readers without scripts, and `site.js` folds them on load.
  Publications are not repeated as structured data: they are already on the
  page, and a second copy could drift from the pinned citations.

One-time steps for the owner (they need your accounts, so nothing is automated):

1. Google Search Console: add a URL-prefix property for
   `https://ji-hun-git.github.io/` (a Domain property is not possible on
   `github.io`). Verify it with the HTML tag method: paste the
   `<meta name="google-site-verification" ...>` it gives you into the `<head>`
   of `index.html`, run `python tools/build_ko_page.py`, and publish. (The
   HTML-file method also works, but `.gitignore` lists every published file, so
   the file must be added there, and the page checks would flag it as a page
   without a title.)
2. In Search Console, submit `sitemap.xml` under Sitemaps, then use URL
   Inspection and Request indexing for `https://ji-hun-git.github.io/` and
   `https://ji-hun-git.github.io/ko.html`.
3. Naver Search Advisor (searchadvisor.naver.com): register
   `https://ji-hun-git.github.io`, verify it the same way (its HTML tag,
   `<meta name="naver-site-verification" ...>`), submit the sitemap under
   요청 > 사이트맵 제출, and request `https://ji-hun-git.github.io/ko.html` under
   요청 > 웹 페이지 수집.
4. Optional: Bing Webmaster Tools can import the Search Console property and
   the sitemap in one step.
5. Link this site from your public profiles: Google Scholar (Homepage), ORCID
   (Websites & social links), LinkedIn (Contact info, Website) and GitHub
   (Website), the four the structured data names as the same person. On GitHub,
   setting the profile name to "Jihun Chae (채지훈)" also helps name search, and
   the site repository's description still mentions the bookshelf.

## Structure

- `index.html`: authored bilingual CV and the bookshelf switch and shell.
- `ko.html`: the Korean page, generated from `index.html`
  (`tools/build_ko_page.py`); do not edit it by hand.
- `assets/site.*`, `assets/cv.css`: shared controls and CV presentation.
- `assets/project-library/`: bookshelf, record content, and project pictograms
  (loaded only while the bookshelf is on, apart from the KF-21 flyby).
- `assets/vendor/three/`: Three.js 0.185.1 and its MIT license.
- `laboratory.html`, `lab/`: simulations and their on-demand renderers
  (switched off: see Simulations above).
- `favicon.ico`, `apple-touch-icon.png`, `assets/favicon-96.png`: site icons
  (`tools/build_favicons.py`).
- `tools/`: image generation, the Korean page generator and regression checks.

Run `python tools/harness/static_checks.py` for source checks. Browser tests are
documented in `tools/harness/README.md`. Update asset URL versions when releasing
changed assets. `main` is the production branch; feature branches are temporary.

## Content-Security-Policy

Every page that loads code or styles declares a policy in a
`<meta http-equiv="Content-Security-Policy">` tag right after `<meta charset>`:
code only from this site, styles and fonts also from the jsDelivr CDN (and, on
the Simulations page, KaTeX from the same CDN). The inline `<head>` scripts of
`index.html` and `laboratory.html` are allowed by their SHA-256 hashes, so
editing one, including a `?v=` stamp bump inside it, changes its hash:
`static_checks.py` fails and prints the new value to put in that page's policy
(for `index.html`, then run `python tools/build_ko_page.py`).
GitHub Pages cannot send response headers, so `frame-ancestors` (framing) and
`report-uri` (violation reports) are not available; a meta policy cannot set them.

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

"""The content guards in static_checks.py must fail on a broken CV, not pass on nothing.

Each test copies the real index.html, ko.html and work.js to a temporary root,
breaks one fact the way a careless edit would, and expects the guard that owns
that fact to report an ERROR. A guard whose input file is gone must report that
it cannot run instead of passing silently.
"""
import shutil
import tempfile
import unittest
from pathlib import Path

import static_checks as checks

FILES = ("index.html", "ko.html", checks.WORK_JS, "laboratory.html", "404.html", "sitemap.xml",
         *checks.TOKEN_STYLESHEETS)


class IntegrityGuardTests(unittest.TestCase):
    def setUp(self):
        self.tmp = Path(tempfile.mkdtemp())
        for rel in FILES:
            (self.tmp / rel).parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(checks.ROOT / rel, self.tmp / rel)
        self.real_root = checks.ROOT
        checks.ROOT = self.tmp

    def tearDown(self):
        checks.ROOT = self.real_root
        shutil.rmtree(self.tmp, ignore_errors=True)

    def edit(self, rel, old, new):
        path = self.tmp / rel
        text = path.read_text(encoding="utf-8")
        self.assertIn(old, text, "the fixture no longer contains %r" % old)
        path.write_text(text.replace(old, new, 1), encoding="utf-8")

    def errors(self, check):
        return [f for f in check([], {}) if f.level == checks.ERROR]

    def test_the_unbroken_cv_passes(self):
        for check in (checks.check_award_consistency, checks.check_bilingual_pairs,
                      checks.check_cv_record_ids, checks.check_cv_sections,
                      checks.check_publication_roles, checks.check_simulations_switch,
                      checks.check_css_tokens):
            self.assertEqual(self.errors(check), [], check.__name__)

    def test_wrong_education40_award_tier(self):
        self.edit("index.html", "Top Excellence Award (1st Place) – Education4.0 Q TA",
                  "Grand Prize – Education4.0 Q TA")
        self.assertTrue(self.errors(checks.check_award_consistency))

    def test_empty_korean_half_in_the_bookshelf(self):
        self.edit(checks.WORK_JS, 'ko: "접근 가능한 게임 AI"', 'ko: ""')
        self.assertTrue(self.errors(checks.check_bilingual_pairs))

    def test_counter_strip_that_comes_back(self):
        self.edit("index.html", '          </header>\n          <details class="caps">',
                  '            <nav class="cv-index" aria-label="CV overview"><a href="#projects">'
                  '<strong>6</strong>R&amp;D projects</a></nav>\n'
                  '          </header>\n          <details class="caps">')
        self.assertTrue(self.errors(checks.check_cv_sections))

    def test_section_shipped_folded(self):
        self.edit("ko.html", 'class="section-body" id="awards-body"',
                  'class="section-body" hidden="until-found" id="awards-body"')
        self.assertTrue(self.errors(checks.check_cv_sections))

    def test_section_button_that_controls_nothing(self):
        self.edit("index.html", 'aria-controls="patents-body"', 'aria-controls="patents"')
        self.assertTrue(self.errors(checks.check_cv_sections))

    def test_entry_outside_its_section_body(self):
        self.edit("index.html", '            <div class="section-body" id="education-body">\n'
                  '              <div class="items">',
                  '            <div class="items"></div>\n'
                  '            <div class="section-body" id="education-body">\n'
                  '              <div class="items">')
        self.assertTrue(self.errors(checks.check_cv_sections))

    def test_publication_without_an_author_role(self):
        self.edit("index.html", '<span class="pub-role"', '<span class="pub-rolex"')
        self.assertTrue(self.errors(checks.check_publication_roles))

    def test_simulations_link_put_back_while_switched_off(self):
        self.edit("index.html", '<div class="site-controls">',
                  '<a href="laboratory.html">Simulations</a><div class="site-controls">')
        self.assertTrue(self.errors(checks.check_simulations_switch))

    def test_simulations_page_named_in_structured_data(self):
        # Not a link, but a pointer all the same: search engines follow it.
        self.edit("index.html", '"@type": "ProfilePage",',
                  '"@type": "ProfilePage",\n      "relatedLink": '
                  '"https://ji-hun-git.github.io/laboratory.html",')
        self.assertTrue(self.errors(checks.check_simulations_switch))

    def test_simulations_page_named_in_a_meta_tag(self):
        self.edit("ko.html", "</head>",
                  '<meta content="https://ji-hun-git.github.io/laboratory" '
                  'property="og:see_also" />\n  </head>')
        self.assertTrue(self.errors(checks.check_simulations_switch))

    def test_simulations_page_back_in_the_sitemap(self):
        self.edit("sitemap.xml", "</urlset>",
                  "  <url><loc>https://ji-hun-git.github.io/laboratory.html</loc>"
                  "<lastmod>2026-10-01</lastmod></url>\n</urlset>")
        self.assertTrue(self.errors(checks.check_simulations_switch))

    def test_simulations_page_indexable_while_switched_off(self):
        self.edit("laboratory.html", '<meta content="noindex" name="robots" />', "")
        self.assertTrue(self.errors(checks.check_simulations_switch))

    def test_off_scale_space_and_type(self):
        self.edit("assets/cv.css", "margin-bottom: var(--space-3);", "margin-bottom: 14px;")
        self.assertTrue(self.errors(checks.check_css_tokens))
        self.edit("assets/cv.css", "margin-bottom: 14px;", "margin-bottom: var(--space-3);")
        self.edit("assets/cv.css", "font-size: var(--fs-16);", "font-size: 15px;")
        self.assertTrue(self.errors(checks.check_css_tokens))

    def test_missing_input_is_an_error_not_a_pass(self):
        (self.tmp / checks.WORK_JS).unlink()
        for check in (checks.check_award_consistency, checks.check_bilingual_pairs,
                      checks.check_cv_record_ids):
            found = self.errors(check)
            self.assertTrue(found and "cannot run" in found[0].message, check.__name__)


if __name__ == "__main__":
    unittest.main()

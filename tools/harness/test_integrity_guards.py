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

FILES = ("index.html", "ko.html", checks.WORK_JS)


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
                      checks.check_cv_record_ids, checks.check_cv_counters,
                      checks.check_publication_roles):
            self.assertEqual(self.errors(check), [], check.__name__)

    def test_wrong_education40_award_tier(self):
        self.edit("index.html", "Top Excellence Award (1st Place) – Education4.0 Q TA",
                  "Grand Prize – Education4.0 Q TA")
        self.assertTrue(self.errors(checks.check_award_consistency))

    def test_empty_korean_half_in_the_bookshelf(self):
        self.edit(checks.WORK_JS, 'ko: "접근 가능한 게임 AI"', 'ko: ""')
        self.assertTrue(self.errors(checks.check_bilingual_pairs))

    def test_counter_that_no_longer_matches_its_section(self):
        self.edit("index.html", "<strong>6</strong>", "<strong>7</strong>")
        self.assertTrue(self.errors(checks.check_cv_counters))

    def test_publication_without_an_author_role(self):
        self.edit("index.html", '<span class="pub-role"', '<span class="pub-rolex"')
        self.assertTrue(self.errors(checks.check_publication_roles))

    def test_missing_input_is_an_error_not_a_pass(self):
        (self.tmp / checks.WORK_JS).unlink()
        for check in (checks.check_award_consistency, checks.check_bilingual_pairs,
                      checks.check_cv_record_ids):
            found = self.errors(check)
            self.assertTrue(found and "cannot run" in found[0].message, check.__name__)


if __name__ == "__main__":
    unittest.main()

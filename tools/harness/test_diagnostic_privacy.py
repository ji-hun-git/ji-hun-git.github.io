"""Public CI logs must report sensitive findings without repeating their values."""
import json
import unittest
from types import SimpleNamespace
from unittest.mock import patch

import static_checks as checks


class DiagnosticPrivacyTests(unittest.TestCase):
    def test_pii_findings_redact_values(self):
        address = 'private@example.test'
        token = 'ghp_' + 'a' * 36
        source = f'<p>{address}</p><script>const token="{token}";</script>'
        with patch.object(checks, 'read_text', return_value=source):
            findings = checks.check_pii(['index.html'], {'public_contacts': {'emails': []}})
        self.assertTrue(any(f.check == 'pii-email' for f in findings))
        self.assertTrue(any(f.check == 'pii-secret-github' for f in findings))
        serialized = json.dumps([f.as_dict() for f in findings])
        self.assertNotIn(address, serialized)
        self.assertNotIn(token, serialized)

    def test_historical_identity_is_reported_without_address(self):
        address = 'private@example.test'
        with patch.object(checks.subprocess, 'run', return_value=SimpleNamespace(stdout=f'{address}\n{address}\n')):
            findings = checks.check_git_identities({'git_identities': {'allowed_emails': []}})
        self.assertEqual(len(findings), 1)
        self.assertIn('2 commit identity records', findings[0].message)
        self.assertNotIn(address, json.dumps(findings[0].as_dict()))


if __name__ == '__main__':
    unittest.main()

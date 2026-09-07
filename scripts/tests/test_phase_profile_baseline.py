"""Real Git regression for empty packaging commits and full secret coverage."""
import json
from pathlib import Path
import subprocess
import tempfile
import unittest

from scripts.gitops.generated_output_closure import ClosureError, _generate_secret_scan_fixtures
from scripts.gitops.run_delivery_profile import DeliveryProfileError, classify_risk, phase_changed_paths
from scripts.gitops.secret_scan import SCANNER_POLICY_VERSION, identify_synthetic_candidates, scan_repository


class PhaseProfileBaselineTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.git('init', '-q', '-b', 'development')
        self.git('config', 'user.name', 'Regression')
        self.git('config', 'user.email', 'test@example.invalid')
        self.git('commit', '--allow-empty', '-qm', 'baseline')
        self.baseline = self.git('rev-parse', 'HEAD')
        self.git('remote', 'add', 'origin', str(self.root))
        self.git('fetch', 'origin', 'development')
        self.git('checkout', '-qb', 'issue/1-repair')

    def git(self, *args):
        return subprocess.run(['git', *args], cwd=self.root, text=True,
                              capture_output=True, check=True).stdout.strip()

    def write(self, path, text):
        target = self.root / path
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text)
        self.git('add', path)

    def test_packaging_noop_retains_entire_protected_delta(self):
        self.write('scripts/gitops/change.py', '# governance\n')
        self.write('app.txt', 'application\n')
        self.git('commit', '-qm', 'candidate')
        self.git('commit', '--allow-empty', '-qm', 'package')
        self.assertEqual(self.git('diff', '--name-only', 'HEAD^', 'HEAD'), '')
        paths = phase_changed_paths(self.root, self.baseline)
        self.assertEqual(paths, ['app.txt', 'scripts/gitops/change.py'])
        self.assertEqual(classify_risk(paths)['level'], 'high')

    def test_missing_stale_and_nonancestor_baselines_fail_closed(self):
        with self.assertRaises(DeliveryProfileError):
            phase_changed_paths(self.root, None)
        self.git('commit', '--allow-empty', '-qm', 'candidate')
        head = self.git('rev-parse', 'HEAD')
        with self.assertRaises(ClosureError):
            phase_changed_paths(self.root, head)
        self.git('checkout', '-q', 'development')
        self.git('commit', '--allow-empty', '-qm', 'diverged target')
        target = self.git('rev-parse', 'HEAD')
        self.git('fetch', 'origin', 'development')
        self.git('checkout', '-q', 'issue/1-repair')
        for invalid in (self.baseline, target):
            with self.assertRaises(ClosureError):
                phase_changed_paths(self.root, invalid)

    def test_rename_and_delete_do_not_hide_source_paths(self):
        self.write('old.txt', 'old\n')
        self.git('commit', '-qm', 'baseline files')
        base = self.git('rev-parse', 'HEAD')
        self.git('update-ref', 'refs/remotes/origin/development', base)
        self.git('mv', 'old.txt', 'new.txt')
        self.git('commit', '-qm', 'rename')
        self.assertEqual(phase_changed_paths(self.root, base), ['new.txt', 'old.txt'])
        self.git('rm', 'new.txt')
        self.git('commit', '-qm', 'delete')
        self.assertEqual(phase_changed_paths(self.root, base), ['old.txt'])

    def test_refresh_preserves_approvals_and_rejects_undeclared_secrets(self):
        self.write('fixture.sh', 'API_TOKEN="' + 'ltfx.' + 'phase-regression-value"\n')
        detections = identify_synthetic_candidates(self.root)
        self.assertEqual(len(detections), 1)
        fixtures = [dict(detections[0], id='regression', purpose='Synthetic test only', production=False)]
        declaration = dict(schemaVersion=1, kind='secret-scan-fixtures',
                           scannerPolicyVersion=SCANNER_POLICY_VERSION,
                           candidateTree='0' * 40, fixtures=fixtures)
        self.write('.github/linktrend-secret-scan-fixtures.json', json.dumps(declaration))
        self.assertFalse(scan_repository(self.root)['ok'])
        _generate_secret_scan_fixtures(self.root)
        self.git('add', '.github/linktrend-secret-scan-fixtures.json')
        self.assertTrue(scan_repository(self.root)['ok'])
        self.assertEqual(json.loads((self.root / '.github/linktrend-secret-scan-fixtures.json').read_text())['fixtures'], fixtures)
        self.write('new.sh', 'API_TOKEN="' + 'ltfx.' + 'undeclared-other-value"\n')
        _generate_secret_scan_fixtures(self.root)
        self.git('add', '.github/linktrend-secret-scan-fixtures.json')
        self.assertFalse(scan_repository(self.root)['ok'])
        self.write('fixture.sh', 'API_TOKEN="' + 'ghp_' + 'A' * 36 + '"\n')
        _generate_secret_scan_fixtures(self.root)
        self.git('add', '.github/linktrend-secret-scan-fixtures.json')
        result = scan_repository(self.root)
        self.assertFalse(result['ok'])
        self.assertTrue(any(row['rule'] == 'format.github' for row in result['findings']))


if __name__ == '__main__':
    unittest.main()

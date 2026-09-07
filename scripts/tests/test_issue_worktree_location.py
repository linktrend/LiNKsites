"""Exercise real Git worktree creation without GitHub or credentials."""
import importlib.util
from pathlib import Path
import subprocess
import tempfile
import unittest
from unittest.mock import patch


HELPER = Path(__file__).resolve().parents[1] / 'gitops/create_issue_branch.py'
spec = importlib.util.spec_from_file_location('issue_branch', HELPER)
helper = importlib.util.module_from_spec(spec)
spec.loader.exec_module(helper)


class WorktreeLocationTest(unittest.TestCase):
    def test_primary_and_linked_checkouts_share_external_worktree_root(self):
        with tempfile.TemporaryDirectory() as tmp:
            repo = Path(tmp).resolve() / 'consumer'
            repo.mkdir()

            def git(*args):
                return subprocess.run(['git', '-C', str(repo), *args], check=True,
                                      capture_output=True, text=True)

            git('init', '-b', 'development')
            git('-c', 'user.name=Test', '-c', 'user.email=test@example.invalid',
                'commit', '--allow-empty', '-m', 'baseline')
            git('remote', 'add', 'origin', str(repo))
            git('fetch', 'origin', 'development')
            with patch.object(helper, 'remote_branch_exists', return_value=False):
                first = Path(helper.ensure_branch(repo, 'issue/1-first', prefer_worktree=True))
                self.assertNotIn('.git', first.parts, 'Vite denies browser transforms inside .git')
                self.assertEqual(first.parent, repo.parent / 'consumer-worktrees')
                second = Path(helper.ensure_branch(first, 'issue/2-second', prefer_worktree=True))
                self.assertEqual(first.parent, second.parent)
                self.assertEqual(Path(helper.ensure_branch(repo, 'issue/1-first', prefer_worktree=True)), first)
            self.assertEqual(git('branch', '--show-current').stdout.strip(), 'development')
            self.assertTrue((first / '.git').is_file())


if __name__ == '__main__':
    unittest.main()

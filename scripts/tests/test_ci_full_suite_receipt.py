import unittest

from scripts.ci_full_suite_receipt import validate_receipt


class FullSuiteReceiptTests(unittest.TestCase):
    def setUp(self):
        self.sha = "a" * 40
        self.tree = "b" * 40
        self.lock = "sha256:" + "c" * 64
        self.receipt = {
            "schemaVersion": 1,
            "status": "passed",
            "repository": "linktrend/LiNKsites",
            "workflowRunId": 42,
            "sourceSha": self.sha,
            "testedCheckoutSha": "d" * 40,
            "treeSha": self.tree,
            "lockfileSha256": self.lock,
        }

    def test_accepts_exact_identity(self):
        validate_receipt(
            self.receipt,
            repo="linktrend/LiNKsites",
            run_id=42,
            run_head_sha=self.sha,
            candidate_tree_sha=self.tree,
            lockfile_sha256=self.lock,
        )

    def test_rejects_different_tree(self):
        with self.assertRaises(SystemExit):
            validate_receipt(
                self.receipt,
                repo="linktrend/LiNKsites",
                run_id=42,
                run_head_sha=self.sha,
                candidate_tree_sha="e" * 40,
                lockfile_sha256=self.lock,
            )

    def test_rejects_different_lockfile(self):
        with self.assertRaises(SystemExit):
            validate_receipt(
                self.receipt,
                repo="linktrend/LiNKsites",
                run_id=42,
                run_head_sha=self.sha,
                candidate_tree_sha=self.tree,
                lockfile_sha256="sha256:" + "f" * 64,
            )


if __name__ == "__main__":
    unittest.main()

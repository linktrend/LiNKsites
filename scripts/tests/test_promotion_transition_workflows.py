from __future__ import annotations

import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
CI = (ROOT / ".github" / "workflows" / "ci.yml").read_text(encoding="utf-8")
DOCS = (ROOT / "docs" / "contracts" / "CI-SUITE.md").read_text(encoding="utf-8")
MANAGED_PROMOTION = (
    ("linktrend-development-to-staging.yml", "development", "staging"),
    ("linktrend-staging-to-main.yml", "staging", "main"),
)
TRUSTED_PROMOTION_CONTEXTS = (
    "Linktrend Branch Source Policy",
    "Linktrend Receipt Gate",
)


class PromotionTransitionWorkflowTests(unittest.TestCase):
    def test_protected_promotion_workflows_require_transition_receipts(self) -> None:
        for name, branch, _target in MANAGED_PROMOTION:
            text = (ROOT / ".github" / "workflows" / name).read_text(encoding="utf-8")
            self.assertIn('marker.get("transitionReceipt")', text)
            self.assertIn('transition.get("receiptDigest") != transition_digest', text)
            self.assertIn("validate_reusable_full_run.py", text)
            self.assertIn("--transition-receipt transition-receipt.json", text)
            self.assertIn(f"--source-branch {branch}", text)
            self.assertIn("receipt_gate_digest_mismatch", text)
            self.assertIn("receipt_gate_protected_base_missing", text)
            self.assertIn("--expected-base-commit", text)
            self.assertIn("promotion_receipt_gate.py", text)
            self.assertIn("write-live-facts", text)
            self.assertIn("authorize", text)
            self.assertIn("from scripts.gitops.coordinator.receipts import compute_receipt_digest", text)

    def test_repository_ci_cannot_publish_or_duplicate_promotion_authority(self) -> None:
        self.assertNotIn("name: LiNKsites Promotion Receipt", CI)
        self.assertNotIn("promotion-receipt:", CI)
        self.assertNotIn("LiNKsites Promotion Receipt", CI)
        self.assertIn("branches: [development]", CI)
        self.assertNotIn("branches: [main, staging, development]", CI)
        for context in TRUSTED_PROMOTION_CONTEXTS:
            self.assertNotIn(f"name: {context}", CI)
        self.assertNotIn("compute_transition_digest", CI)
        self.assertNotIn("transition-receipt.json", CI)
        self.assertNotIn("ci_full_suite_receipt.py verify", CI)
        self.assertNotIn("checks: write", CI)
        self.assertNotIn("checks: read", CI)

    def test_managed_promotion_authorities_are_independently_produced(self) -> None:
        for name, _source, target in MANAGED_PROMOTION:
            text = (ROOT / ".github" / "workflows" / name).read_text(encoding="utf-8")
            self.assertIn("pull_request_target:", text)
            self.assertIn("ref: ${{ github.event.repository.default_branch }}", text)
            self.assertIn("Fetch exact promotion candidate without executing it", text)
            self.assertIn("HEAD_SHA: ${{ github.event.pull_request.head.sha }}", text)
            self.assertIn(f"branches: [{target}]", text)
            self.assertIn("name: Linktrend Branch Source Policy", text)
            self.assertIn("name: Linktrend Receipt Gate", text)
            self.assertIn("validate_reusable_full_run.py", text)
            self.assertIn("linktrend-full-suite-receipt-", text)
            self.assertIn("--workflow-run-id", text)
            self.assertIn("--workflow-run-attempt", text)
            self.assertIn("actions/download-artifact@", text)
            self.assertIn('gh api "repos/${GITHUB_REPOSITORY}/actions/runs/${run_id}"', text)
            self.assertTrue(
                "candidate code is never executed" in text or "candidate is data only" in text
            )

    def test_managed_path_reads_live_protected_event_and_github_api_state(self) -> None:
        for name, _source, target in MANAGED_PROMOTION:
            text = (ROOT / ".github" / "workflows" / name).read_text(encoding="utf-8")
            self.assertIn("github.event.pull_request.head.sha", text)
            self.assertIn("github.event.pull_request.number", text)
            self.assertIn("github.event.pull_request.base.sha", text)
            self.assertIn(f"target_branch: {target}", text)
            self.assertIn('gh api "repos/${GITHUB_REPOSITORY}/pulls/${PR_NUMBER}"', text)
            self.assertIn("actions/runs/${run_id}/artifacts", text)
            self.assertIn("persist-credentials: false", text)
            self.assertIn("/reviews", text)
            self.assertIn("check-runs", text)

    def test_documentation_names_only_produced_trusted_promotion_contexts(self) -> None:
        self.assertNotIn("LiNKsites Promotion Receipt", DOCS)
        required = """| `staging` | `Linktrend Branch Source Policy`, `Linktrend Receipt Gate` |
| `main` | `Linktrend Branch Source Policy`, `Linktrend Receipt Gate` |"""
        self.assertIn(required, DOCS)
        self.assertIn("Candidate `pull_request` workflow content cannot mint or rename a promotion check.", DOCS)
        self.assertIn("one-time consumption", DOCS)
        self.assertIn("never manufactures", DOCS)


if __name__ == "__main__":
    unittest.main()

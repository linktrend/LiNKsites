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


def test_protected_promotion_workflows_require_transition_receipts() -> None:
    for name, branch, _target in MANAGED_PROMOTION:
        text = (ROOT / ".github" / "workflows" / name).read_text(encoding="utf-8")
        assert 'marker.get("transitionReceipt")' in text
        assert 'transition.get("receiptDigest") != transition_digest' in text
        assert "validate_reusable_full_run.py" in text
        assert "--transition-receipt transition-receipt.json" in text
        assert f"--source-branch {branch}" in text
        assert "receipt_gate_digest_mismatch" in text


def test_repository_ci_cannot_publish_or_duplicate_promotion_authority() -> None:
    assert "name: LiNKsites Promotion Receipt" not in CI
    assert "promotion-receipt:" not in CI
    assert "LiNKsites Promotion Receipt" not in CI
    assert "branches: [development]" in CI
    assert "branches: [main, staging, development]" not in CI
    for context in TRUSTED_PROMOTION_CONTEXTS:
        assert f"name: {context}" not in CI
    assert "compute_transition_digest" not in CI
    assert "transition-receipt.json" not in CI
    assert "ci_full_suite_receipt.py verify" not in CI


def test_managed_promotion_authorities_are_independently_produced() -> None:
    for name, _source, target in MANAGED_PROMOTION:
        text = (ROOT / ".github" / "workflows" / name).read_text(encoding="utf-8")
        assert "pull_request_target:" in text
        assert "ref: ${{ github.event.repository.default_branch }}" in text
        assert "Fetch exact promotion candidate without executing it" in text
        assert "HEAD_SHA: ${{ github.event.pull_request.head.sha }}" in text
        assert f"branches: [{target}]" in text
        assert 'name: Linktrend Branch Source Policy' in text
        assert 'name: Linktrend Receipt Gate' in text
        assert "validate_reusable_full_run.py" in text
        assert "linktrend-full-suite-receipt-" in text
        assert "--workflow-run-id" in text
        assert "--workflow-run-attempt" in text
        assert "actions/download-artifact@" in text
        assert "gh api \"repos/${GITHUB_REPOSITORY}/actions/runs/${run_id}\"" in text
        assert "candidate code is never executed" in text or "candidate is data only" in text


def test_managed_path_reads_live_protected_event_and_github_api_state() -> None:
    for name, _source, target in MANAGED_PROMOTION:
        text = (ROOT / ".github" / "workflows" / name).read_text(encoding="utf-8")
        assert "github.event.pull_request.head.sha" in text
        assert "github.event.pull_request.number" in text
        assert f"target_branch: {target}" in text
        assert "gh api \"repos/${GITHUB_REPOSITORY}/pulls/${PR_NUMBER}\"" in text
        assert "actions/runs/${run_id}/artifacts" in text
        assert "persist-credentials: false" in text


def test_documentation_names_only_produced_trusted_promotion_contexts() -> None:
    assert "LiNKsites Promotion Receipt" not in DOCS
    required = """| `staging` | `Linktrend Branch Source Policy`, `Linktrend Receipt Gate` |
| `main` | `Linktrend Branch Source Policy`, `Linktrend Receipt Gate` |"""
    assert required in DOCS
    assert "Candidate `pull_request` workflow content cannot mint or rename a promotion check." in DOCS

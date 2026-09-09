from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]


def test_protected_promotion_workflows_require_transition_receipts() -> None:
    for name, branch in (
        ("linktrend-development-to-staging.yml", "development"),
        ("linktrend-staging-to-main.yml", "staging"),
    ):
        text = (ROOT / ".github" / "workflows" / name).read_text(encoding="utf-8")
        assert 'marker.get("transitionReceipt")' in text
        assert 'transition.get("receiptDigest") != transition_digest' in text
        assert "validate_reusable_full_run.py" in text
        assert "--transition-receipt transition-receipt.json" in text
        assert f"--source-branch {branch}" in text
        assert "receipt_gate_digest_mismatch" in text


def test_repository_promotion_receipt_reuses_authenticated_transition() -> None:
    text = (ROOT / ".github" / "workflows" / "ci.yml").read_text(encoding="utf-8")
    assert "linktrend-integrator-merge.yml" in text
    assert "actions/download-artifact" in text
    assert "validate_reusable_full_run.py" in text
    assert 'workflow-name "Linktrend Branch Source Policy"' in text
    assert 'workflow-name "Linktrend Receipt Gate"' in text
    assert "--transition-receipt transition-receipt.json" in text
    assert "--workflow-run-attempt" in text
    assert "compute_transition_digest" in text
    assert "promotion_receipt_transition_digest_mismatch" in text
    assert "promotion_receipt_source_branch_mismatch" in text
    assert "promotion_receipt_candidate_head_mismatch" in text
    assert "steps.receipt.outputs.source_branch" in text
    assert "ci_full_suite_receipt.py verify" not in text

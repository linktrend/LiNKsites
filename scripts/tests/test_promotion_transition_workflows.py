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

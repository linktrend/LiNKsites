from __future__ import annotations

import json
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

from scripts.gitops import gate_receipt


def test_verify_passes_protected_branch_and_transition_receipt(tmp_path: Path) -> None:
    receipt_path = tmp_path / "receipt.json"
    transition_path = tmp_path / "transition.json"
    receipt_path.write_text(json.dumps({"kind": "receipt"}), encoding="utf-8")
    transition_path.write_text(json.dumps({"kind": "transition-receipt"}), encoding="utf-8")

    verdict = SimpleNamespace(
        accepted=True,
        code="accepted",
        message="authenticated same-tree transition matches",
        source_commit="1" * 40,
        promotion_commit="2" * 40,
    )
    with (
        mock.patch.object(gate_receipt, "compute_candidate_identity", return_value={"identity": True}) as identity,
        mock.patch.object(gate_receipt, "verify_receipt", return_value=verdict) as verify,
    ):
        assert gate_receipt.main(
            [
                "verify",
                "--receipt", str(receipt_path),
                "--repo", str(tmp_path),
                "--source-branch", "development",
                "--profile-file", "receipt.json",
                "--transition-receipt", str(transition_path),
                "--gate", "full-gate",
            ]
        ) == 0

    assert identity.call_args.kwargs["source_branch"] == "development"
    assert verify.call_args.kwargs["transition_receipt"] == {"kind": "transition-receipt"}

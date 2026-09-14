from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest import mock

from scripts.gitops import gate_receipt


class GateReceiptTransitionTests(unittest.TestCase):
    def test_verify_passes_protected_branch_and_transition_receipt(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp_path = Path(raw)
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
                self.assertEqual(
                    gate_receipt.main(
                        [
                            "verify",
                            "--receipt", str(receipt_path),
                            "--repo", str(tmp_path),
                            "--source-branch", "development",
                            "--profile-file", "receipt.json",
                            "--transition-receipt", str(transition_path),
                            "--gate", "full-gate",
                        ]
                    ),
                    0,
                )

            self.assertEqual(identity.call_args.kwargs["source_branch"], "development")
            self.assertEqual(verify.call_args.kwargs["transition_receipt"], {"kind": "transition-receipt"})

    def test_verify_rejects_stale_expected_base_commit(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            tmp_path = Path(raw)
            receipt_path = tmp_path / "receipt.json"
            transition_path = tmp_path / "transition.json"
            receipt_path.write_text(json.dumps({"kind": "receipt"}), encoding="utf-8")
            transition_path.write_text(
                json.dumps({"kind": "transition-receipt", "protectedBaseCommit": "a" * 40}),
                encoding="utf-8",
            )
            verdict = SimpleNamespace(
                accepted=True,
                code="accepted",
                message="ok",
                source_commit="1" * 40,
                promotion_commit="2" * 40,
            )
            with (
                mock.patch.object(gate_receipt, "compute_candidate_identity", return_value={"identity": True}),
                mock.patch.object(gate_receipt, "verify_receipt", return_value=verdict),
            ):
                self.assertEqual(
                    gate_receipt.main(
                        [
                            "verify",
                            "--receipt", str(receipt_path),
                            "--repo", str(tmp_path),
                            "--source-branch", "development",
                            "--profile-file", "receipt.json",
                            "--transition-receipt", str(transition_path),
                            "--expected-base-commit", "b" * 40,
                            "--gate", "full-gate",
                        ]
                    ),
                    1,
                )


if __name__ == "__main__":
    unittest.main()

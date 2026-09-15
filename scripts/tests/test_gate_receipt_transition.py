from __future__ import annotations

import json
import tempfile
import unittest
from pathlib import Path

from scripts.gitops import gate_receipt
from scripts.gitops.coordinator.receipts import (
    CandidateIdentity,
    create_full_suite_receipt,
    create_transition_receipt,
)


REPOSITORY = "linktrend/LiNKsites"
SOURCE_HEAD = "1" * 40
TARGET_HEAD = "2" * 40
TREE = "3" * 40
BASE_COMMIT = "4" * 40
BASE_TREE = "5" * 40
DIGESTS = ["sha256:" + char * 64 for char in "abcde"]


def _identity(branch: str, head: str) -> CandidateIdentity:
    return CandidateIdentity(REPOSITORY, branch, head, TREE, DIGESTS[0], DIGESTS[1], DIGESTS[2])


def _write_chain(directory: Path) -> tuple[Path, Path, Path]:
    source = _identity("phase/release", SOURCE_HEAD)
    target = _identity("development", TARGET_HEAD)
    receipt = create_full_suite_receipt(
        {
            "schemaVersion": 2,
            "candidateIdentity": source.to_dict(),
            "workflowRunId": 123,
            "workflowRunAttempt": 1,
            "runnerLabel": "ubuntu-24.04-arm",
            "startedAt": "2026-09-15T01:00:00Z",
            "completedAt": "2026-09-15T01:01:00Z",
            "conclusion": "success",
            "commandDigest": DIGESTS[3],
            "evidenceDigests": {"full.log": DIGESTS[4]},
        }
    )
    transition = create_transition_receipt(
        receipt,
        target_branch="development",
        target_commit=TARGET_HEAD,
        target_tree=TREE,
        protected_base_commit=BASE_COMMIT,
        protected_base_tree=BASE_TREE,
    )
    receipt_path = directory / "receipt.json"
    transition_path = directory / "transition.json"
    identity_path = directory / "identity.json"
    receipt_path.write_text(json.dumps(receipt.to_dict()), encoding="utf-8")
    transition_path.write_text(json.dumps(transition.to_dict()), encoding="utf-8")
    identity_path.write_text(json.dumps(target.to_dict()), encoding="utf-8")
    return receipt_path, transition_path, identity_path


def _args(receipt: Path, transition: Path, identity: Path) -> list[str]:
    return [
        "verify",
        "--receipt", str(receipt),
        "--identity", str(identity),
        "--transition-receipt", str(transition),
        "--expected-base-commit", BASE_COMMIT,
        "--expected-base-tree", BASE_TREE,
        "--gate", "full-gate",
    ]


class GateReceiptTransitionTests(unittest.TestCase):
    def test_verify_accepts_canonical_transition_with_exact_base_identity(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            paths = _write_chain(Path(raw))
            self.assertEqual(gate_receipt.main(_args(*paths)), 0)

    def test_verify_rejects_stale_expected_base_commit(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            receipt, transition, identity = _write_chain(Path(raw))
            args = _args(receipt, transition, identity)
            args[args.index(BASE_COMMIT)] = "6" * 40
            self.assertEqual(gate_receipt.main(args), 1)

    def test_verify_rejects_stale_expected_base_tree(self) -> None:
        with tempfile.TemporaryDirectory() as raw:
            receipt, transition, identity = _write_chain(Path(raw))
            args = _args(receipt, transition, identity)
            args[args.index(BASE_TREE)] = "7" * 40
            self.assertEqual(gate_receipt.main(args), 1)


if __name__ == "__main__":
    unittest.main()

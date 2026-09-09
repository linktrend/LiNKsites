from __future__ import annotations

import pytest

from scripts.gitops.coordinator.receipts import (
    CandidateIdentity,
    compute_transition_digest,
    create_full_suite_receipt,
    create_transition_receipt,
    verify_receipt,
    verify_transition_receipt,
)


REPOSITORY = "linktrend/LiNKsites"
DEPENDENCY_DIGEST = "sha256:" + "1" * 64
PROFILE_DIGEST = "sha256:" + "2" * 64
WORKFLOW_DIGEST = "sha256:" + "3" * 64
COMMAND_DIGEST = "sha256:" + "4" * 64
EVIDENCE_DIGEST = "sha256:" + "5" * 64


def identity(branch: str, head: str, tree: str) -> CandidateIdentity:
    return CandidateIdentity(
        REPOSITORY,
        branch,
        head,
        tree,
        DEPENDENCY_DIGEST,
        PROFILE_DIGEST,
        WORKFLOW_DIGEST,
    )


def chain(source_branch: str, target_branch: str) -> tuple[dict, dict, dict, str, str, str]:
    source_head = "a" * 40
    target_head = "b" * 40
    tree = "c" * 40
    protected_base = "d" * 40
    source = identity(source_branch, source_head, tree)
    target = identity(target_branch, target_head, tree)
    receipt = create_full_suite_receipt(
        {
            "schemaVersion": 2,
            "candidateIdentity": source.to_dict(),
            "workflowRunId": 34165549526,
            "workflowRunAttempt": 1,
            "runnerLabel": "ubuntu-24.04-arm",
            "startedAt": "2026-09-08T01:00:00Z",
            "completedAt": "2026-09-08T01:30:00Z",
            "conclusion": "success",
            "commandDigest": COMMAND_DIGEST,
            "evidenceDigests": {"full-suite-summary.txt": EVIDENCE_DIGEST},
        }
    ).to_dict()
    transition = create_transition_receipt(
        receipt,
        target_branch=target_branch,
        target_commit=target_head,
        target_tree=tree,
        protected_base_commit=protected_base,
    ).to_dict()
    return receipt, target.to_dict(), transition, source_head, target_head, protected_base


@pytest.mark.parametrize(
    ("source_branch", "target_branch"),
    (("development", "staging"), ("staging", "main")),
)
def test_valid_same_tree_transition_chains_are_accepted(source_branch: str, target_branch: str) -> None:
    receipt, target, transition, source_head, _target_head, _base = chain(source_branch, target_branch)

    verdict = verify_receipt(
        receipt,
        target,
        "full-gate",
        workflow_run_id=34165549526,
        workflow_run_attempt=1,
        workflow_head_commit=source_head,
        transition_receipt=transition,
    )

    assert verdict.accepted, verdict.message
    assert verdict.source_commit == source_head
    assert verdict.promotion_commit == target["headCommit"]


@pytest.mark.parametrize(
    ("name", "mutate"),
    (
        ("forged", lambda transition: replace_transition(transition, authenticatedBy="attacker")),
        ("wrong-branch", lambda transition: replace_transition(transition, targetBranch="main")),
        ("wrong-tree", lambda transition: replace_transition(transition, targetTree="e" * 40)),
        ("wrong-source", lambda transition: replace_transition(transition, sourceIdentity=identity("development", "f" * 40, "c" * 40).to_dict())),
        ("digest-mismatched", lambda transition: {**transition, "receiptDigest": "sha256:" + "9" * 64}),
    ),
)
def test_adversarial_transition_bytes_are_rejected(name: str, mutate) -> None:
    receipt, target, transition, source_head, _target_head, _base = chain("development", "staging")
    forged = mutate(transition)
    if name not in {"digest-mismatched", "forged"}:
        forged["receiptDigest"] = compute_transition_digest({**forged, "receiptDigest": ""})

    verdict = verify_receipt(
        receipt,
        target,
        "full-gate",
        workflow_run_id=34165549526,
        workflow_run_attempt=1,
        workflow_head_commit=source_head,
        transition_receipt=forged,
    )

    assert not verdict.accepted, name
    assert verdict.code in {
        "transition_invalid",
        "transition_digest_mismatch",
        "transition_identity_mismatch",
        "transition_target_mismatch",
    }


def replace_transition(transition: dict, **changes) -> dict:
    return {**transition, **changes}


def test_missing_stale_and_wrong_target_transitions_fail_closed() -> None:
    receipt, target, transition, source_head, target_head, _base = chain("development", "staging")

    missing = verify_receipt(
        receipt,
        target,
        "full-gate",
        workflow_run_id=34165549526,
        workflow_run_attempt=1,
        workflow_head_commit=source_head,
    )
    assert not missing.accepted
    assert missing.code == "head_mismatch"

    stale_transition = create_transition_receipt(
        receipt,
        target_branch="staging",
        target_commit="6" * 40,
        target_tree=target["gitTree"],
    ).to_dict()
    stale = verify_receipt(
        receipt,
        target,
        "full-gate",
        workflow_run_id=34165549526,
        workflow_run_attempt=1,
        workflow_head_commit=source_head,
        transition_receipt=stale_transition,
    )
    assert not stale.accepted
    assert stale.code == "transition_target_mismatch"

    wrong_target = {**target, "headCommit": "7" * 40}
    wrong_target_verdict = verify_receipt(
        receipt,
        wrong_target,
        "full-gate",
        workflow_run_id=34165549526,
        workflow_run_attempt=1,
        workflow_head_commit=source_head,
        transition_receipt=transition,
    )
    assert not wrong_target_verdict.accepted
    assert wrong_target_verdict.code == "transition_target_mismatch"
    assert target_head != wrong_target["headCommit"]


def test_workflow_run_and_attempt_are_bound() -> None:
    receipt, target, transition, source_head, _target_head, _base = chain("development", "staging")

    wrong_run = verify_receipt(
        receipt,
        target,
        "full-gate",
        workflow_run_id=34165549527,
        workflow_run_attempt=1,
        workflow_head_commit=source_head,
        transition_receipt=transition,
    )
    assert not wrong_run.accepted
    assert wrong_run.code == "run_mismatch"

    wrong_attempt = verify_receipt(
        receipt,
        target,
        "full-gate",
        workflow_run_id=34165549526,
        workflow_run_attempt=2,
        workflow_head_commit=source_head,
        transition_receipt=transition,
    )
    assert not wrong_attempt.accepted
    assert wrong_attempt.code == "attempt_mismatch"


def test_protected_base_commit_is_exact_when_supplied() -> None:
    receipt, target, transition, source_head, _target_head, protected_base = chain("development", "staging")

    accepted = verify_transition_receipt(
        transition,
        receipt,
        target,
        expected_workflow_run_id=34165549526,
        expected_workflow_run_attempt=1,
        expected_base_commit=protected_base,
    )
    assert accepted.accepted

    stale_base = verify_transition_receipt(
        transition,
        receipt,
        target,
        expected_workflow_run_id=34165549526,
        expected_workflow_run_attempt=1,
        expected_base_commit="8" * 40,
    )
    assert not stale_base.accepted
    assert stale_base.code == "transition_target_mismatch"


def test_exact_head_receipts_still_work_without_transitions() -> None:
    receipt, target, _transition, source_head, _target_head, _base = chain("development", "staging")
    exact_candidate = {**target, "headCommit": source_head, "sourceBranch": "development"}

    accepted = verify_receipt(receipt, exact_candidate, "full-gate")
    assert accepted.accepted

    stale = verify_receipt(receipt, target, "full-gate")
    assert not stale.accepted
    assert stale.code == "head_mismatch"

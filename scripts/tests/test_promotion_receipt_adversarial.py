from __future__ import annotations

import unittest
from pathlib import Path

from scripts.gitops.coordinator.receipts import (
    CandidateIdentity,
    compute_transition_digest,
    create_full_suite_receipt,
    create_transition_receipt,
    verify_receipt,
    verify_transition_receipt,
)
from scripts.gitops.promotion_receipt_gate import (
    assemble_live_facts,
    canonical_consumption_id,
    evaluate_authoritative_promotion,
)
from scripts.gitops.receipt_seal import SealError, admit_founder_authorized_transition


REPOSITORY = "linktrend/LiNKsites"
DEPENDENCY_DIGEST = "sha256:" + "1" * 64
PROFILE_DIGEST = "sha256:" + "2" * 64
WORKFLOW_DIGEST = "sha256:" + "3" * 64
COMMAND_DIGEST = "sha256:" + "4" * 64
EVIDENCE_DIGEST = "sha256:" + "5" * 64
SOURCE_HEAD = "a" * 40
TARGET_HEAD = "b" * 40
TREE = "c" * 40
PROTECTED_BASE = "d" * 40
PROTECTED_BASE_TREE = "e" * 40


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
    source = identity(source_branch, SOURCE_HEAD, TREE)
    target = identity(target_branch, TARGET_HEAD, TREE)
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
        target_commit=TARGET_HEAD,
        target_tree=TREE,
        protected_base_commit=PROTECTED_BASE,
    ).to_dict()
    return receipt, target.to_dict(), transition, SOURCE_HEAD, TARGET_HEAD, PROTECTED_BASE


def replace_transition(transition: dict, **changes) -> dict:
    return {**transition, **changes}


def valid_live(receipt: dict, transition: dict, *, transition_name: str = "development-to-staging") -> dict:
    workflow = (
        ".github/workflows/linktrend-development-to-staging.yml"
        if transition_name == "development-to-staging"
        else ".github/workflows/linktrend-staging-to-main.yml"
    )
    return assemble_live_facts(
        repository=REPOSITORY,
        transition=transition_name,
        protected_base_commit=PROTECTED_BASE,
        protected_base_tree=PROTECTED_BASE_TREE,
        candidate_head_commit=TARGET_HEAD,
        candidate_head_tree=TREE,
        workflow_file=workflow,
        check_name="Linktrend Receipt Gate",
        required_test={
            "gate": "full-gate",
            "conclusion": "success",
            "workflowPath": ".github/workflows/linktrend-integrator-merge.yml",
            "runId": 34165549526,
            "runAttempt": 1,
            "headCommit": SOURCE_HEAD,
            "tree": TREE,
        },
        reviewer={"identity": "independent-reviewer", "result": "PASS", "candidateAuthor": "candidate-author"},
        issued_at="2026-09-08T01:30:00Z",
        expires_at="2026-09-22T01:30:00Z",
        now="2026-09-11T12:00:00Z",
        producer="linktrend-receipt-gate",
        event_name="pull_request_target",
        source_receipt=receipt,
        transition_receipt=transition,
        observed_checks=[
            {"name": "Linktrend Receipt Gate", "producer": workflow},
            {"name": "Linktrend Branch Source Policy", "producer": workflow},
        ],
    )


class PromotionReceiptAdversarialTests(unittest.TestCase):
    def test_valid_same_tree_transition_chains_are_accepted(self) -> None:
        for source_branch, target_branch in (("development", "staging"), ("staging", "main")):
            with self.subTest(source_branch=source_branch, target_branch=target_branch):
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
                self.assertTrue(verdict.accepted, verdict.message)
                self.assertEqual(verdict.source_commit, source_head)
                self.assertEqual(verdict.promotion_commit, target["headCommit"])
                transition_name = f"{source_branch}-to-{target_branch}"
                live = valid_live(receipt, transition, transition_name=transition_name)
                authorized = evaluate_authoritative_promotion(
                    live=live, source_receipt=receipt, transition_receipt=transition
                )
                self.assertTrue(authorized.accepted, authorized.detail)

    def test_adversarial_transition_bytes_are_rejected(self) -> None:
        cases = (
            ("forged", lambda transition: replace_transition(transition, authenticatedBy="attacker")),
            ("wrong-branch", lambda transition: replace_transition(transition, targetBranch="main")),
            ("wrong-tree", lambda transition: replace_transition(transition, targetTree="e" * 40)),
            (
                "wrong-source",
                lambda transition: replace_transition(
                    transition, sourceIdentity=identity("development", "f" * 40, "c" * 40).to_dict()
                ),
            ),
            ("digest-mismatched", lambda transition: {**transition, "receiptDigest": "sha256:" + "9" * 64}),
        )
        receipt, target, transition, source_head, _target_head, _base = chain("development", "staging")
        for name, mutate in cases:
            with self.subTest(name=name):
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
                self.assertFalse(verdict.accepted, name)
                self.assertIn(
                    verdict.code,
                    {
                        "transition_invalid",
                        "transition_digest_mismatch",
                        "transition_identity_mismatch",
                        "transition_target_mismatch",
                    },
                )

    def test_missing_stale_and_wrong_target_transitions_fail_closed(self) -> None:
        receipt, target, transition, source_head, target_head, _base = chain("development", "staging")
        missing = verify_receipt(
            receipt,
            target,
            "full-gate",
            workflow_run_id=34165549526,
            workflow_run_attempt=1,
            workflow_head_commit=source_head,
        )
        self.assertFalse(missing.accepted)
        self.assertEqual(missing.code, "head_mismatch")

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
        self.assertFalse(stale.accepted)
        self.assertEqual(stale.code, "transition_target_mismatch")

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
        self.assertFalse(wrong_target_verdict.accepted)
        self.assertEqual(wrong_target_verdict.code, "transition_target_mismatch")
        self.assertNotEqual(target_head, wrong_target["headCommit"])

    def test_workflow_run_and_attempt_are_bound(self) -> None:
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
        self.assertFalse(wrong_run.accepted)
        self.assertEqual(wrong_run.code, "run_mismatch")
        wrong_attempt = verify_receipt(
            receipt,
            target,
            "full-gate",
            workflow_run_id=34165549526,
            workflow_run_attempt=2,
            workflow_head_commit=source_head,
            transition_receipt=transition,
        )
        self.assertFalse(wrong_attempt.accepted)
        self.assertEqual(wrong_attempt.code, "attempt_mismatch")

    def test_protected_base_commit_is_exact_when_supplied(self) -> None:
        receipt, target, transition, source_head, _target_head, protected_base = chain("development", "staging")
        accepted = verify_transition_receipt(
            transition,
            receipt,
            target,
            expected_workflow_run_id=34165549526,
            expected_workflow_run_attempt=1,
            expected_base_commit=protected_base,
        )
        self.assertTrue(accepted.accepted)
        stale_base = verify_transition_receipt(
            transition,
            receipt,
            target,
            expected_workflow_run_id=34165549526,
            expected_workflow_run_attempt=1,
            expected_base_commit="8" * 40,
        )
        self.assertFalse(stale_base.accepted)
        self.assertEqual(stale_base.code, "transition_target_mismatch")

    def test_exact_head_receipts_still_work_without_transitions(self) -> None:
        receipt, target, _transition, source_head, _target_head, _base = chain("development", "staging")
        exact_candidate = {**target, "headCommit": source_head, "sourceBranch": "development"}
        accepted = verify_receipt(receipt, exact_candidate, "full-gate")
        self.assertTrue(accepted.accepted)
        stale = verify_receipt(receipt, target, "full-gate")
        self.assertFalse(stale.accepted)
        self.assertEqual(stale.code, "head_mismatch")

    def test_self_created_transition_digest_is_not_a_promotion_authority(self) -> None:
        receipt, target, _transition, source_head, _target_head, protected_base = chain("development", "staging")
        self_created = create_transition_receipt(
            receipt,
            target_branch="staging",
            target_commit=target["headCommit"],
            target_tree=target["gitTree"],
            protected_base_commit=protected_base,
        ).to_dict()
        self.assertEqual(self_created["authenticatedBy"], "delivery-controller")
        self.assertEqual(self_created["receiptDigest"], compute_transition_digest(self_created))
        self.assertTrue(source_head)
        ci = (Path(__file__).resolve().parents[2] / ".github" / "workflows" / "ci.yml").read_text(encoding="utf-8")
        docs = (Path(__file__).resolve().parents[2] / "docs" / "contracts" / "CI-SUITE.md").read_text(encoding="utf-8")
        self.assertNotIn("transition-receipt.json", ci)
        self.assertNotIn("compute_transition_digest", ci)
        self.assertNotIn("authenticatedBy", ci)
        self.assertNotIn("LiNKsites Promotion Receipt", ci)
        self.assertNotIn("LiNKsites Promotion Receipt", docs)
        self.assertIn("Linktrend Receipt Gate", docs)
        self.assertIn("Linktrend Branch Source Policy", docs)
        live = valid_live(receipt, self_created)
        live["producer"] = "candidate"
        live["eventName"] = "pull_request"
        live["candidateAuthored"] = True
        denied = evaluate_authoritative_promotion(
            live=live, source_receipt=receipt, transition_receipt=self_created
        )
        self.assertFalse(denied.accepted)
        self.assertEqual(denied.code, "candidate_authored")

    def test_candidate_cannot_create_duplicate_successful_promotion_checks(self) -> None:
        ci = (Path(__file__).resolve().parents[2] / ".github" / "workflows" / "ci.yml").read_text(encoding="utf-8")
        for forbidden in (
            "LiNKsites Promotion Receipt",
            "Linktrend Receipt Gate",
            "Linktrend Branch Source Policy",
            "promotion-receipt:",
        ):
            self.assertNotIn(forbidden, ci)
        self.assertIn("pull_request:", ci)
        self.assertIn("branches: [development]", ci)

    def test_authoritative_path_fails_closed_for_named_adversaries(self) -> None:
        receipt, _target, transition, _source_head, _target_head, _base = chain("development", "staging")
        live = valid_live(receipt, transition)
        cases = {
            "missing_field": dict(live, repository=""),
            "candidate_authored": dict(live, eventName="pull_request"),
            "synthetic_evidence": dict(live, requiredTest={**live["requiredTest"], "manufactured": True}),
            "repository_mismatch": dict(live, repository="linktrend/other"),
            "transition_mismatch": dict(live, transition="staging-to-main"),
            "protected_base_mismatch": dict(live, protectedBaseCommit="8" * 40),
            "copied_receipt": dict(live, consumptionId="sha256:" + "9" * 64),
            "stale_or_expired": dict(live, now="2026-09-30T00:00:00Z"),
            "self_review": dict(live, reviewer={**live["reviewer"], "identity": "candidate-author"}),
            "untrusted_check_collision": dict(
                live,
                observedChecks=[{"name": "Linktrend Receipt Gate", "producer": ".github/workflows/ci.yml"}],
            ),
            "duplicate_check_name": dict(
                live,
                observedChecks=[
                    {"name": "Linktrend Receipt Gate", "producer": ".github/workflows/linktrend-development-to-staging.yml"},
                    {"name": "Linktrend Receipt Gate", "producer": ".github/workflows/linktrend-staging-to-main.yml"},
                ],
            ),
        }
        expected = {
            "missing_field": "missing_field",
            "candidate_authored": "candidate_authored",
            "synthetic_evidence": "synthetic_evidence",
            "repository_mismatch": "repository_mismatch",
            "transition_mismatch": "transition_mismatch",
            "protected_base_mismatch": "protected_base_mismatch",
            "copied_receipt": "copied_receipt",
            "stale_or_expired": "stale_or_expired",
            "self_review": "self_review",
            "untrusted_check_collision": "untrusted_check_collision",
            "duplicate_check_name": "duplicate_check_name",
        }
        for name, payload in cases.items():
            with self.subTest(name=name):
                if name == "copied_receipt":
                    payload = dict(payload)
                    payload["consumptionId"] = "sha256:" + "9" * 64
                verdict = evaluate_authoritative_promotion(
                    live=payload, source_receipt=receipt, transition_receipt=transition
                )
                self.assertFalse(verdict.accepted, name)
                self.assertEqual(verdict.code, expected[name], name)

        replay = evaluate_authoritative_promotion(
            live=live,
            source_receipt=receipt,
            transition_receipt=transition,
            consumed_ids=[live["consumptionId"]],
        )
        self.assertFalse(replay.accepted)
        self.assertEqual(replay.code, "replay_or_reuse")
        copied = evaluate_authoritative_promotion(
            live=live,
            source_receipt=receipt,
            transition_receipt=transition,
            consumed_receipt_digests=[receipt["receiptDigest"]],
        )
        self.assertFalse(copied.accepted)
        self.assertEqual(copied.code, "copied_receipt")

    def test_founder_bootstrap_requires_truthful_evidence_and_never_manufactures(self) -> None:
        receipt, _target, transition, _source_head, _target_head, _base = chain("development", "staging")
        live = valid_live(receipt, transition)
        admitted = admit_founder_authorized_transition(
            live=live, source_receipt=receipt, transition_receipt=transition
        )
        self.assertTrue(admitted["accepted"])
        with self.assertRaises(SealError) as manufactured:
            admit_founder_authorized_transition(
                live=dict(live, inventedCheck=True),
                source_receipt=receipt,
                transition_receipt=transition,
            )
        self.assertEqual(manufactured.exception.code, "founder_bootstrap_manufactured")
        with self.assertRaises(SealError) as missing:
            admit_founder_authorized_transition(
                live={k: v for k, v in live.items() if k != "reviewer"},
                source_receipt=receipt,
                transition_receipt=transition,
            )
        self.assertEqual(missing.exception.code, "founder_bootstrap_missing_evidence")

    def test_consumption_id_binds_the_exact_live_identities(self) -> None:
        receipt, _target, transition, _source_head, _target_head, _base = chain("development", "staging")
        live = valid_live(receipt, transition)
        self.assertEqual(
            live["consumptionId"],
            canonical_consumption_id(
                {
                    "repository": REPOSITORY,
                    "transition": "development-to-staging",
                    "protectedBaseCommit": PROTECTED_BASE,
                    "protectedBaseTree": PROTECTED_BASE_TREE,
                    "candidateHeadCommit": TARGET_HEAD,
                    "candidateHeadTree": TREE,
                    "sourceReceiptDigest": receipt["receiptDigest"],
                    "transitionDigest": transition["receiptDigest"],
                    "workflowFile": ".github/workflows/linktrend-development-to-staging.yml",
                    "checkName": "Linktrend Receipt Gate",
                }
            ),
        )


if __name__ == "__main__":
    unittest.main()

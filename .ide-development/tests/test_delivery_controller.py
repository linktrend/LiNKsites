"""WP-U02 delivery controller unit, negative, and contract tests."""

from __future__ import annotations

import hashlib
import json
import os
import re
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from scripts.gitops import delivery_controller as controller
from scripts.gitops.coordinator import receipts
from scripts.ide_development.constants import RC_REQUIRED_SCHEMA_RELS


ROOT = Path(__file__).resolve().parents[2]
DIGEST = "sha256:" + ("b" * 64)
COMMAND_DIGEST = "sha256:" + ("c" * 64)
DEP_DIGEST = "sha256:" + ("d" * 64)
PROFILE_DIGEST = "sha256:" + ("e" * 64)
WORKFLOW_DIGEST = "sha256:" + ("f" * 64)


def _sha(n: int = 1) -> str:
    return f"{n:040x}"


def _identity(*, head: str, tree: str, repository: str = "owner/name", branch: str = "phase/next") -> dict[str, str]:
    return {
        "repository": repository,
        "sourceBranch": branch,
        "headCommit": head,
        "gitTree": tree,
        "dependencyDigest": DEP_DIGEST,
        "profileDigest": PROFILE_DIGEST,
        "workflowDigest": WORKFLOW_DIGEST,
    }


def _receipt(identity: dict[str, str]) -> dict[str, object]:
    raw = {
        "schemaVersion": 2,
        "candidateIdentity": identity,
        "workflowRunId": 501,
        "workflowRunAttempt": 1,
        "runnerLabel": "ubuntu-24.04-arm",
        "startedAt": "2026-08-18T01:00:00Z",
        "completedAt": "2026-08-18T01:01:00Z",
        "conclusion": "success",
        "commandDigest": COMMAND_DIGEST,
        "evidenceDigests": {"evidence/full.log": DIGEST},
    }
    return receipts.create_full_suite_receipt(raw).to_dict()


def _handoff(*, head: str, tree: str, base: str | None = None) -> dict[str, object]:
    return {
        "schemaVersion": 1,
        "kind": "phase-handoff",
        "repository": "owner/name",
        "phaseBranch": "phase/next",
        "phasePr": {"number": 11, "url": "https://github.com/owner/name/pull/11", "isDraft": True},
        "headCommit": head,
        "gitTree": tree,
        "baseCommit": base or _sha(9),
        "candidateRevision": "rev-1",
        "acceptedCommits": [{"branch": "issue/1-alpha", "sha": head, "order": 1}],
        "evidenceLocations": {
            "phaseRecord": ".linktrend/phase-delivery-record.json",
            "handoff": ".linktrend/phase-handoff.json",
        },
        "valid": True,
        "component": "phase_packager_coordinator",
    }


def _named_checks(head: str) -> dict[str, dict[str, str]]:
    return {
        name: {"status": "success", "sha": head}
        for name in controller.REQUIRED_CHECK_NAMES
    }


def _repository_ci(head: str, *, name: str = "Verify IDE Development") -> dict[str, object]:
    return {
        "required": [name],
        "results": {name: {"status": "success", "sha": head}},
    }


def _gates(head: str) -> dict[str, dict[str, str]]:
    return {
        "seal": {"status": "passed", "sha": head},
        "fast": {"status": "passed", "sha": head},
        "bugbot": {"status": "passed", "sha": head},
        "full": {"status": "passed", "sha": head},
    }


class DeliveryControllerTests(unittest.TestCase):
    def setUp(self) -> None:
        self.head = _sha(1)
        self.tree = _sha(2)
        self.identity = _identity(head=self.head, tree=self.tree)
        self.receipt = _receipt(self.identity)
        self.handoff = _handoff(head=self.head, tree=self.tree)
        self.pr = {
            "number": 11,
            "isDraft": False,
            "state": "open",
            "head": "phase/next",
            "base": "development",
            "headSha": self.head,
            "mergeableState": "MERGEABLE",
        }
        self.github = controller.MemoryGitHub(repository="owner/name")
        self.github.prs[11] = dict(self.pr)
        self.github.refs["development"] = _sha(9)
        self.github.refs["staging"] = _sha(7)
        self.github.refs["main"] = _sha(6)
        self.github.commit_trees[self.head] = self.tree
        self.github.ref_trees["development"] = _sha(10)
        self.github.ref_trees["staging"] = _sha(70)
        self.github.ref_trees["main"] = _sha(60)

    def _deliver(self, **kwargs):
        defaults = dict(
            github=self.github,
            repository="owner/name",
            handoff=self.handoff,
            pr=self.pr,
            live_head=self.head,
            live_tree=self.tree,
            gate_payload=_gates(self.head),
            named_checks=_named_checks(self.head),
            repository_ci=_repository_ci(self.head),
            receipt=self.receipt,
            candidate_identity=self.identity,
            role="operator",
            protected_base_tree=_sha(10),
        )
        defaults.update(kwargs)
        return controller.deliver_phase_to_development(**defaults)

    def _verify(self, **kwargs):
        defaults = dict(
            handoff=self.handoff,
            pr=self.pr,
            repository="owner/name",
            live_head=self.head,
            live_tree=self.tree,
            gate_payload=_gates(self.head),
            named_checks=_named_checks(self.head),
            repository_ci=_repository_ci(self.head),
            receipt=self.receipt,
            candidate_identity=self.identity,
        )
        defaults.update(kwargs)
        return controller.verify_development_eligibility(**defaults)

    def test_component_replaces_nonexistent_integrator_handoff(self) -> None:
        self.assertTrue(controller.IS_DELIVERY_CONTROLLER)
        self.assertEqual(controller.COMPONENT_KIND, "delivery_controller")
        self.assertIn("Replaces the nonexistent Integrator", controller.__doc__)

    def test_valid_phase_pr_reaches_development_without_external_integrator(self) -> None:
        result = self._deliver()
        self.assertEqual(result["status"], "merged")
        self.assertEqual(result["stage"], "development")
        self.assertFalse(result["directPush"])
        self.assertEqual(result["component"], "delivery_controller")
        self.assertEqual(result["transitionReceipt"]["protectedBaseCommit"], _sha(9))
        self.assertEqual(result["transitionReceipt"]["protectedBaseTree"], _sha(10))
        self.assertEqual(len(self.github.merges), 1)
        self.assertEqual(self.github.protected_push_attempts[0]["branch"], "development")

    def test_worker_cannot_invoke_self_merge_path(self) -> None:
        with self.assertRaisesRegex(controller.ControllerError, "worker_self_merge_forbidden"):
            controller.merge_to_development(
                github=self.github,
                repository="owner/name",
                pr_number=11,
                expected_head=self.head,
                role="worker",
                receipt=self.receipt,
                candidate_identity=self.identity,
                candidate_tree=self.tree,
                protected_base_commit=_sha(9),
                protected_base_tree=_sha(10),
            )
        with self.assertRaisesRegex(controller.ControllerError, "worker_self_merge_forbidden"):
            controller.require_controller_role("implementer")

    def test_missing_base_tree_stops_before_merge(self) -> None:
        with self.assertRaisesRegex(controller.ControllerError, "transition_receipt_failed"):
            controller.merge_to_development(
                github=self.github,
                repository="owner/name",
                pr_number=11,
                expected_head=self.head,
                role="operator",
                receipt=self.receipt,
                candidate_identity=self.identity,
                candidate_tree=self.tree,
                protected_base_commit=_sha(9),
                protected_base_tree="",
            )
        self.assertEqual(self.github.merges, [])

    def test_development_merge_omission_is_rejected_before_adapter_calls(self) -> None:
        with self.assertRaises(TypeError):
            controller.merge_to_development(
                github=self.github,
                repository="owner/name",
                pr_number=11,
                expected_head=self.head,
                role="operator",
            )
        self.assertEqual(self.github.merges, [])
        self.assertEqual(self.github.protected_push_attempts, [])

    def test_administrator_recovery_requires_base_identity_before_any_operation(self) -> None:
        calls: list[str] = []

        class RecoveryGitHub:
            def push_protected(self, **kwargs):
                calls.append("push")

            def merge_pull_request(self, **kwargs):
                calls.append("merge")
                return {}

        class RecoveryProtections:
            def snapshot(self, **kwargs):
                calls.append("snapshot")
                return {}

        with self.assertRaisesRegex(ValueError, "protected_base_identity_required"):
            controller.recover_phase_merge(
                github=RecoveryGitHub(),
                protections=RecoveryProtections(),
                repository="owner/name",
                pr_number=11,
                phase_branch="phase/next",
                expected_head=self.head,
                expected_tree=self.tree,
                protected_base_commit="",
                protected_base_tree="",
                live_head=self.head,
                live_tree=self.tree,
                named_exception="exact test recovery",
                replacement_proof=True,
            )
        self.assertEqual(calls, [])

    def test_administrator_recovery_rejects_empty_target_before_any_operation(self) -> None:
        calls: list[str] = []

        class RecoveryGitHub:
            def push_protected(self, **kwargs):
                calls.append("push")

            def merge_pull_request(self, **kwargs):
                calls.append("merge")
                return {}

        class RecoveryProtections:
            def snapshot(self, **kwargs):
                calls.append("snapshot")
                return {}

        with self.assertRaisesRegex(ValueError, "ungoverned_target"):
            controller.recover_phase_merge(
                github=RecoveryGitHub(),
                protections=RecoveryProtections(),
                repository="owner/name",
                pr_number=11,
                phase_branch="phase/next",
                expected_head=self.head,
                expected_tree=self.tree,
                protected_base_commit=_sha(9),
                protected_base_tree=_sha(10),
                live_head=self.head,
                live_tree=self.tree,
                named_exception="exact test recovery",
                replacement_proof=True,
                target_branch="",
            )
        self.assertEqual(calls, [])

    def test_administrator_recovery_rejects_wrong_merge_readback_and_restores(self) -> None:
        for field_name, readback, code in (
            (
                "parent",
                {"parents": [{"sha": _sha(8)}], "tree": {"sha": self.tree}},
                "protected_base_moved_during_merge",
            ),
            (
                "tree",
                {"parents": [{"sha": _sha(9)}], "tree": {"sha": _sha(8)}},
                "protected_merge_tree_mismatch",
            ),
        ):
            with self.subTest(field=field_name):
                github = controller.MemoryGitHub(repository="owner/name")
                github.prs[11] = dict(self.pr)
                github.refs["development"] = _sha(9)
                github.ref_trees["development"] = _sha(10)
                github.commit_trees[self.head] = self.tree
                merge_sha = hashlib.sha1(f"merge:11:{self.head}".encode("utf-8")).hexdigest()
                github.merge_commit_readbacks[merge_sha] = readback
                protections = controller.MemoryProtection(repository="owner/name")
                protections.current["development"] = {"required": True}

                with self.assertRaisesRegex(ValueError, "admin_match_head_commit_failed") as raised:
                    controller.recover_phase_merge(
                        github=github,
                        protections=protections,
                        repository="owner/name",
                        pr_number=11,
                        phase_branch="phase/next",
                        expected_head=self.head,
                        expected_tree=self.tree,
                        protected_base_commit=_sha(9),
                        protected_base_tree=_sha(10),
                        live_head=self.head,
                        live_tree=self.tree,
                        named_exception="exact test recovery",
                        replacement_proof=True,
                    )
                self.assertIn(code, str(raised.exception))
                self.assertEqual(github.refs["development"], _sha(9))
                self.assertEqual(github.ref_trees["development"], _sha(10))
                self.assertEqual(github.merges, [])
                self.assertEqual(len(protections.restores), 1)
                self.assertEqual(len(protections.readbacks), 1)

    def test_mismatched_audited_tree_stops_before_merge(self) -> None:
        with self.assertRaisesRegex(controller.ControllerError, "transition_receipt_failed"):
            controller.merge_to_development(
                github=self.github,
                repository="owner/name",
                pr_number=11,
                expected_head=self.head,
                role="operator",
                receipt=self.receipt,
                candidate_identity=self.identity,
                candidate_tree=_sha(11),
                protected_base_commit=_sha(9),
                protected_base_tree=_sha(10),
            )
        self.assertEqual(self.github.merges, [])

    def test_forged_receipt_stops_before_merge(self) -> None:
        forged = dict(self.receipt, receiptDigest="sha256:" + ("0" * 64))
        with self.assertRaisesRegex(controller.ControllerError, "transition_receipt_failed"):
            controller.merge_to_development(
                github=self.github,
                repository="owner/name",
                pr_number=11,
                expected_head=self.head,
                role="operator",
                receipt=forged,
                candidate_identity=self.identity,
                candidate_tree=self.tree,
                protected_base_commit=_sha(9),
                protected_base_tree=_sha(10),
            )
        self.assertEqual(self.github.merges, [])

    def test_stale_or_changed_pr_is_rejected(self) -> None:
        with self.assertRaisesRegex(controller.ControllerError, "stale_pr_head"):
            controller.accept_phase_pr(
                {**self.pr, "headSha": _sha(99)},
                self.handoff,
                repository="owner/name",
                live_head=self.head,
                live_tree=self.tree,
            )
        stale_handoff = dict(self.handoff, headCommit=_sha(3), valid=True)
        with self.assertRaisesRegex(controller.ControllerError, "handoff_stale_head"):
            controller.accept_phase_pr(
                self.pr,
                stale_handoff,
                repository="owner/name",
                live_head=self.head,
                live_tree=self.tree,
            )

    def test_failed_missing_or_skipped_gates_are_rejected(self) -> None:
        missing = dict(_named_checks(self.head))
        del missing["Linktrend Full Suite"]
        with self.assertRaisesRegex(controller.ControllerError, "required_gate_missing"):
            controller.verify_development_eligibility(
                handoff=self.handoff,
                pr=self.pr,
                repository="owner/name",
                live_head=self.head,
                live_tree=self.tree,
                gate_payload=_gates(self.head),
                named_checks=missing,
                repository_ci=_repository_ci(self.head),
                receipt=self.receipt,
                candidate_identity=self.identity,
            )
        skipped = dict(_named_checks(self.head))
        skipped["Linktrend Fast Checks"] = {"status": "skipped", "sha": self.head}
        with self.assertRaisesRegex(controller.ControllerError, "required_gate_skipped"):
            controller.verify_development_eligibility(
                handoff=self.handoff,
                pr=self.pr,
                repository="owner/name",
                live_head=self.head,
                live_tree=self.tree,
                gate_payload=_gates(self.head),
                named_checks=skipped,
                repository_ci=_repository_ci(self.head),
                receipt=self.receipt,
                candidate_identity=self.identity,
            )
        failed_gates = dict(_gates(self.head), fast={"status": "failed", "sha": self.head})
        with self.assertRaisesRegex(controller.ControllerError, "fast_not_passed"):
            controller.verify_development_eligibility(
                handoff=self.handoff,
                pr=self.pr,
                repository="owner/name",
                live_head=self.head,
                live_tree=self.tree,
                gate_payload=failed_gates,
                named_checks=_named_checks(self.head),
                repository_ci=_repository_ci(self.head),
                receipt=self.receipt,
                candidate_identity=self.identity,
            )

    def test_receipt_mismatch_or_forgery_is_rejected(self) -> None:
        forged = dict(self.receipt, receiptDigest="sha256:" + ("a" * 64))
        with self.assertRaisesRegex(controller.ControllerError, "receipt_rejected"):
            controller.verify_development_eligibility(
                handoff=self.handoff,
                pr=self.pr,
                repository="owner/name",
                live_head=self.head,
                live_tree=self.tree,
                gate_payload=_gates(self.head),
                named_checks=_named_checks(self.head),
                repository_ci=_repository_ci(self.head),
                receipt=forged,
                candidate_identity=self.identity,
            )

    def test_staging_reuses_exact_receipt_without_full_rerun(self) -> None:
        result = controller.promote_to_staging(
            github=self.github,
            repository="owner/name",
            development_sha=self.head,
            staging_sha=_sha(7),
            staging_tree=_sha(70),
            candidate_sha=self.head,
            candidate_tree=self.tree,
            receipt=self.receipt,
            candidate_identity=self.identity,
            release_gate={"status": "passed", "testProfile": "release", "fullSuiteInvoked": False},
            role="operator",
        )
        self.assertEqual(result["status"], "merged")
        self.assertEqual(result["stage"], "staging")
        self.assertTrue(result["receiptReused"])
        self.assertFalse(result["fullSuiteRerun"])
        self.assertEqual(result["transitionReceipt"]["protectedBaseCommit"], _sha(7))
        self.assertEqual(result["transitionReceipt"]["protectedBaseTree"], _sha(70))
        marker = json.loads(
            re.search(r"<!-- linktrend-promote:\s*(\{.*?\})\s*-->", self.github.prs[1]["body"]).group(1)
        )
        self.assertEqual(marker["fullRunId"], self.receipt["workflowRunId"])
        with self.assertRaisesRegex(controller.ControllerError, "full_suite_reentered"):
            controller.promote_to_staging(
                github=self.github,
                repository="owner/name",
                development_sha=self.head,
                staging_sha=_sha(7),
                staging_tree=_sha(70),
                candidate_sha=self.head,
                candidate_tree=self.tree,
                receipt=self.receipt,
                candidate_identity=self.identity,
                release_gate={"status": "passed", "testProfile": "release"},
                role="operator",
                full_suite_invoked=True,
            )

    def test_promotion_marker_carries_digest_bound_transition_receipt(self) -> None:
        development_head = _sha(12)
        development_identity = _identity(
            head=development_head,
            tree=self.tree,
            branch="development",
        )
        self.github.commit_trees[development_head] = self.tree
        transition = receipts.create_transition_receipt(
            self.receipt,
            target_branch="development",
            target_commit=development_head,
            target_tree=self.tree,
            protected_base_commit=_sha(9),
            protected_base_tree=_sha(10),
        ).to_dict()
        self.assertEqual(transition["protectedBaseTree"], _sha(10))
        controller.promote_to_staging(
            github=self.github,
            repository="owner/name",
            development_sha=development_head,
            staging_sha=_sha(7),
            staging_tree=_sha(70),
            candidate_sha=development_head,
            candidate_tree=self.tree,
            receipt=self.receipt,
            candidate_identity=development_identity,
            transition_receipt=transition,
            release_gate={"status": "passed", "testProfile": "release"},
            role="operator",
        )
        marker = json.loads(
            re.search(r"<!-- linktrend-promote:\s*(\{.*?\})\s*-->", self.github.prs[1]["body"]).group(1)
        )
        self.assertEqual(marker["transitionReceipt"]["protectedBaseCommit"], _sha(7))
        self.assertEqual(marker["transitionReceipt"]["protectedBaseTree"], _sha(70))
        self.assertEqual(
            marker["transitionReceiptDigest"],
            receipts.compute_transition_digest(marker["transitionReceipt"]),
        )

    def test_staged_rollout_uses_configured_stage_names_on_critical_path(self) -> None:
        rollout = controller.StagedRolloutConfig.from_mapping(
            {
                "phaseBranchPrefix": "candidate/",
                "developmentBranch": "integrated",
                "stagingBranch": "canary",
                "mainBranch": "production",
                "requiredChecks": ["System Fast", "System Full"],
            }
        )
        self.github.refs["canary"] = _sha(7)
        self.github.ref_trees["canary"] = _sha(70)
        result = controller.promote_to_staging(
            github=self.github,
            repository="owner/name",
            development_sha=self.head,
            staging_sha=_sha(7),
            staging_tree=_sha(70),
            candidate_sha=self.head,
            candidate_tree=self.tree,
            receipt=self.receipt,
            candidate_identity=self.identity,
            release_gate={"status": "passed", "testProfile": "release", "fullSuiteInvoked": False},
            role="operator",
            rollout=rollout,
        )
        self.assertEqual(result["stage"], "canary")
        self.assertEqual(result["promoteBranch"], f"promote/canary/{self.head[:12]}")
        self.assertEqual(self.github.prs[1]["base"], "canary")

    def test_staged_rollout_rejects_duplicate_stage_identity(self) -> None:
        with self.assertRaisesRegex(ValueError, "duplicate_rollout_branch"):
            controller.StagedRolloutConfig.from_mapping(
                {"developmentBranch": "same", "stagingBranch": "same"}
            )

    def test_changed_staging_content_is_rejected(self) -> None:
        with self.assertRaisesRegex(controller.ControllerError, "changed_staging_content"):
            controller.promote_to_staging(
                github=self.github,
                repository="owner/name",
                development_sha=self.head,
                staging_sha=_sha(7),
                staging_tree=_sha(70),
                candidate_sha=self.head,
                candidate_tree=_sha(99),
                receipt=self.receipt,
                candidate_identity=self.identity,
                release_gate={"status": "passed", "testProfile": "release"},
                role="operator",
            )

    def test_missing_staging_base_tree_stops_before_promotion_pr(self) -> None:
        with self.assertRaisesRegex(controller.ControllerError, "transition_receipt_failed"):
            controller.promote_to_staging(
                github=self.github,
                repository="owner/name",
                development_sha=self.head,
                staging_sha=_sha(7),
                staging_tree="",
                candidate_sha=self.head,
                candidate_tree=self.tree,
                receipt=self.receipt,
                candidate_identity=self.identity,
                release_gate={"status": "passed", "testProfile": "release"},
                role="operator",
            )
        self.assertNotIn(1, self.github.prs)

    def test_staging_base_movement_stops_before_merge(self) -> None:
        original_create = self.github.create_pull_request

        def create_then_move(**kwargs):
            pr = original_create(**kwargs)
            self.github.refs["staging"] = _sha(71)
            self.github.ref_trees["staging"] = _sha(72)
            return pr

        with (
            mock.patch.object(self.github, "create_pull_request", side_effect=create_then_move),
            self.assertRaisesRegex(controller.ControllerError, "protected_base_moved"),
        ):
            controller.promote_to_staging(
                github=self.github,
                repository="owner/name",
                development_sha=self.head,
                staging_sha=_sha(7),
                staging_tree=_sha(70),
                candidate_sha=self.head,
                candidate_tree=self.tree,
                receipt=self.receipt,
                candidate_identity=self.identity,
                release_gate={"status": "passed", "testProfile": "release"},
                role="operator",
            )
        self.assertEqual(self.github.merges, [])

    def test_staging_base_movement_at_merge_boundary_stops_without_merge(self) -> None:
        class MoveAtMerge(controller.MemoryGitHub):
            def merge_pull_request(self, **kwargs):
                self.refs["staging"] = _sha(71)
                self.ref_trees["staging"] = _sha(72)
                return super().merge_pull_request(**kwargs)

        github = MoveAtMerge(repository="owner/name")
        github.refs.update(self.github.refs)
        github.ref_trees.update(self.github.ref_trees)
        with self.assertRaisesRegex(controller.ControllerError, "protected_base_moved"):
            controller.promote_to_staging(
                github=github,
                repository="owner/name",
                development_sha=self.head,
                staging_sha=_sha(7),
                staging_tree=_sha(70),
                candidate_sha=self.head,
                candidate_tree=self.tree,
                receipt=self.receipt,
                candidate_identity=self.identity,
                release_gate={"status": "passed", "testProfile": "release"},
                role="operator",
            )
        self.assertEqual(github.merges, [])

    def test_main_waits_for_explicit_founder_approval(self) -> None:
        prepared = controller.prepare_main_promotion(
            github=self.github,
            repository="owner/name",
            staging_sha=self.head,
            main_sha=_sha(6),
            main_tree=_sha(60),
            candidate_sha=self.head,
            receipt=self.receipt,
            candidate_identity=self.identity,
            release_gate={"status": "passed", "testProfile": "release"},
            role="operator",
        )
        self.assertEqual(prepared["status"], "waiting_founder_approval")
        self.assertFalse(prepared["founderApprovalInferred"])
        marker = json.loads(
            re.search(r"<!-- linktrend-promote:\s*(\{.*?\})\s*-->", self.github.prs[1]["body"]).group(1)
        )
        self.assertEqual(marker["fullRunId"], self.receipt["workflowRunId"])
        self.assertEqual(marker["transitionReceipt"]["protectedBaseCommit"], _sha(6))
        self.assertEqual(marker["transitionReceipt"]["protectedBaseTree"], _sha(60))
        with self.assertRaisesRegex(controller.ControllerError, "founder_approval_missing"):
            controller.complete_main_promotion(
                github=self.github,
                repository="owner/name",
                pr_number=int(prepared["pr"]),
                expected_head=self.head,
                source_sha=self.head,
                base_sha=_sha(6),
                base_tree=_sha(60),
                approval={},
                receipt=self.receipt,
                role="operator",
            )

    def test_promotion_rejects_missing_or_invalid_full_run_id(self) -> None:
        for invalid in (None, 0, True, "not-a-run"):
            bad_receipt = dict(self.receipt)
            if invalid is None:
                bad_receipt.pop("workflowRunId", None)
            else:
                bad_receipt["workflowRunId"] = invalid
            with self.subTest(invalid=invalid), self.assertRaisesRegex(
                controller.ControllerError, "receipt_workflow_run_invalid"
            ):
                controller._receipt_workflow_run_id(bad_receipt)

    def test_ambiguous_or_stale_main_approval_is_rejected(self) -> None:
        prepared = controller.prepare_main_promotion(
            github=self.github,
            repository="owner/name",
            staging_sha=self.head,
            main_sha=_sha(6),
            main_tree=_sha(60),
            candidate_sha=self.head,
            receipt=self.receipt,
            candidate_identity=self.identity,
            release_gate={"status": "passed", "testProfile": "release"},
            role="operator",
        )
        with self.assertRaisesRegex(controller.ControllerError, "founder_approval_ambiguous"):
            controller.complete_main_promotion(
                github=self.github,
                repository="owner/name",
                pr_number=int(prepared["pr"]),
                expected_head=self.head,
                source_sha=self.head,
                base_sha=_sha(6),
                base_tree=_sha(60),
                approval={
                    "decision": "approve",
                    "inferredFromGreenCi": True,
                    "sourceSha": self.head,
                    "baseSha": _sha(6),
                    "baseTree": _sha(60),
                    "prHeadSha": self.head,
                    "receiptDigest": receipts.compute_receipt_digest(self.receipt),
                },
                receipt=self.receipt,
                role="operator",
            )
        with self.assertRaisesRegex(controller.ControllerError, "stale_"):
            controller.complete_main_promotion(
                github=self.github,
                repository="owner/name",
                pr_number=int(prepared["pr"]),
                expected_head=self.head,
                source_sha=self.head,
                base_sha=_sha(6),
                base_tree=_sha(60),
                approval={
                    "decision": "approve",
                    "sourceSha": _sha(55),
                    "baseSha": _sha(6),
                    "baseTree": _sha(60),
                    "prHeadSha": self.head,
                    "receiptDigest": receipts.compute_receipt_digest(self.receipt),
                },
                receipt=self.receipt,
                role="operator",
            )

    def test_protected_merge_rejection_stops_without_direct_push(self) -> None:
        self.github.merge_rejections[11] = "branch protection prevented merge"
        stopped = controller.deliver_phase_to_development(
            github=self.github,
            repository="owner/name",
            handoff=self.handoff,
            pr=self.pr,
            live_head=self.head,
            live_tree=self.tree,
            gate_payload=_gates(self.head),
            named_checks=_named_checks(self.head),
            repository_ci=_repository_ci(self.head),
            receipt=self.receipt,
            candidate_identity=self.identity,
            role="operator",
            protected_base_tree=_sha(10),
        )
        self.assertEqual(stopped["status"], "stopped")
        self.assertEqual(stopped["code"], "protected_merge_rejected")
        self.assertFalse(stopped["directPushAttempted"])
        self.assertFalse(stopped["bypassAttempted"])

    def test_temporary_branches_deleted_only_after_successful_merges(self) -> None:
        with self.assertRaisesRegex(controller.ControllerError, "cleanup_before_success"):
            controller.cleanup_temporary_branches(
                github=self.github,
                repository="owner/name",
                branches=["promote/staging/aaaaaaaaaaaa"],
                merge_succeeded=False,
                controller_owned={"promote/staging/aaaaaaaaaaaa": True},
            )
        self.github.refs["promote/staging/aaaaaaaaaaaa"] = self.head
        self.github.refs["issue/1-unique"] = self.head
        cleaned = controller.cleanup_temporary_branches(
            github=self.github,
            repository="owner/name",
            branches=["promote/staging/aaaaaaaaaaaa", "issue/1-unique"],
            merge_succeeded=True,
            controller_owned={"promote/staging/aaaaaaaaaaaa": True},
        )
        self.assertEqual(cleaned["deleted"], ["promote/staging/aaaaaaaaaaaa"])
        self.assertEqual(cleaned["preserved"], ["issue/1-unique"])

    def test_controller_identical_across_supported_agents(self) -> None:
        result = controller.run_identical_under_agents(
            "merge-development",
            {"head": self.head, "tree": self.tree},
            [
                {},
                {"CURSOR_AGENT": "cursor"},
                {"CODEX_HOME": "/tmp/codex"},
                {"TERRA_AGENT": "terra"},
            ],
        )
        self.assertEqual(result["status"], "identical")
        self.assertEqual(len({row["payloadDigest"] for row in result["results"]}), 1)

    def test_draft_cross_repo_and_conflict_rejected(self) -> None:
        with self.assertRaisesRegex(controller.ControllerError, "draft_pr"):
            controller.accept_phase_pr(
                {**self.pr, "isDraft": True},
                self.handoff,
                repository="owner/name",
                live_head=self.head,
                live_tree=self.tree,
            )
        with self.assertRaisesRegex(controller.ControllerError, "cross_repository"):
            controller.accept_phase_pr(
                {**self.pr, "crossRepository": True},
                self.handoff,
                repository="owner/name",
                live_head=self.head,
                live_tree=self.tree,
            )
        with self.assertRaisesRegex(controller.ControllerError, "merge_conflict"):
            controller.verify_development_eligibility(
                handoff=self.handoff,
                pr=self.pr,
                repository="owner/name",
                live_head=self.head,
                live_tree=self.tree,
                gate_payload=_gates(self.head),
                named_checks=_named_checks(self.head),
                repository_ci=_repository_ci(self.head),
                receipt=self.receipt,
                candidate_identity=self.identity,
                conflict=True,
            )

    def test_complete_main_success_path(self) -> None:
        prepared = controller.prepare_main_promotion(
            github=self.github,
            repository="owner/name",
            staging_sha=self.head,
            main_sha=_sha(6),
            main_tree=_sha(60),
            candidate_sha=self.head,
            receipt=self.receipt,
            candidate_identity=self.identity,
            release_gate={"status": "passed", "testProfile": "release"},
            role="founder",
        )
        completed = controller.complete_main_promotion(
            github=self.github,
            repository="owner/name",
            pr_number=int(prepared["pr"]),
            expected_head=self.head,
            source_sha=self.head,
            base_sha=_sha(6),
            base_tree=_sha(60),
            approval={
                "decision": "approve",
                "sourceSha": self.head,
                "baseSha": _sha(6),
                "baseTree": _sha(60),
                "prHeadSha": self.head,
                "receiptDigest": receipts.compute_receipt_digest(self.receipt),
            },
            receipt=self.receipt,
            role="founder",
        )
        self.assertEqual(completed["status"], "merged")
        self.assertTrue(completed["founderApproval"])

    def test_production_live_github_adapter_is_executable(self) -> None:
        self.assertTrue(hasattr(controller, "LiveGitHub"))
        self.assertTrue(callable(controller.resolve_production_github))
        with self.assertRaisesRegex(controller.ControllerError, "missing_github_credentials"):
            controller.resolve_production_github("owner/name")
        calls: list[tuple[str, str]] = []

        def transport(method: str, url: str, token: str, body):
            calls.append((method, url))
            self.assertEqual(token, "tok")
            if method == "GET" and url.endswith("/pulls/11"):
                return {
                    "number": 11,
                    "html_url": "https://github.com/owner/name/pull/11",
                    "draft": False,
                    "state": "open",
                    "head": {"ref": "phase/next", "sha": self.head, "repo": {"full_name": "owner/name"}},
                    "base": {"ref": "development"},
                    "mergeable_state": "clean",
                }
            if method == "GET" and url.endswith("/git/ref/heads/development"):
                return {"object": {"sha": _sha(9)}}
            if method == "GET" and url.endswith(f"/git/commits/{_sha(9)}"):
                return {"tree": {"sha": _sha(10)}}
            if method == "GET" and url.endswith("/rules/branches/development"):
                return [
                    {
                        "type": "required_status_checks",
                        "parameters": {"strict_required_status_checks_policy": True},
                    }
                ]
            if method == "GET" and url.endswith("/git/ref/heads/staging"):
                return {"object": {"sha": _sha(7)}}
            if method == "GET" and url.endswith(f"/git/commits/{_sha(7)}"):
                return {"tree": {"sha": _sha(70)}}
            if method == "PUT" and url.endswith("/merge"):
                return {"merged": True, "sha": _sha(4)}
            if method == "GET" and url.endswith(f"/git/commits/{_sha(4)}"):
                return {"parents": [{"sha": _sha(9)}], "tree": {"sha": self.tree}}
            raise AssertionError((method, url))

        live = controller.LiveGitHub(repository="owner/name", automation_token="tok", transport=transport)
        merged = live.merge_pull_request(
            repository="owner/name",
            number=11,
            expected_head=self.head,
            expected_base_branch="development",
            expected_base=_sha(9),
            expected_base_tree=_sha(10),
            expected_result_tree=self.tree,
        )
        self.assertEqual(merged["mergeCommitSha"], _sha(4))
        self.assertFalse(merged["directPush"])
        self.assertEqual(calls[0][0], "GET")
        self.assertEqual([method for method, _ in calls].count("PUT"), 1)
        self.assertEqual(
            live.get_ref_identity(repository="owner/name", branch="staging"),
            {"commit": _sha(7), "tree": _sha(70)},
        )
        with self.assertRaisesRegex(controller.ControllerError, "direct_push_forbidden"):
            live.push_protected(repository="owner/name", branch="development", sha=self.head)

    def test_live_merge_binds_base_at_adapter_boundary_and_verifies_result(self) -> None:
        base, base_tree, merge, result_tree = _sha(7), _sha(70), _sha(4), self.tree
        calls: list[tuple[str, str]] = []

        def transport(method: str, url: str, token: str, body):
            calls.append((method, url))
            if method == "GET" and url.endswith("/pulls/12"):
                return {
                    "number": 12,
                    "draft": False,
                    "state": "open",
                    "head": {"ref": "promote/staging/one", "sha": self.head, "repo": {"full_name": "owner/name"}},
                    "base": {"ref": "staging", "sha": base},
                }
            if method == "GET" and url.endswith("/git/ref/heads/staging"):
                return {"object": {"sha": base}}
            if method == "GET" and url.endswith(f"/git/commits/{base}"):
                return {"tree": {"sha": base_tree}}
            if method == "GET" and url.endswith("/rules/branches/staging"):
                return [
                    {
                        "type": "required_status_checks",
                        "parameters": {"strict_required_status_checks_policy": True},
                    }
                ]
            if method == "PUT" and url.endswith("/pulls/12/merge"):
                return {"merged": True, "sha": merge}
            if method == "GET" and url.endswith(f"/git/commits/{merge}"):
                return {"parents": [{"sha": base}], "tree": {"sha": result_tree}}
            raise AssertionError((method, url, body))

        live = controller.LiveGitHub(repository="owner/name", automation_token="tok", transport=transport)
        merged = live.merge_pull_request(
            repository="owner/name",
            number=12,
            expected_head=self.head,
            expected_base_branch="staging",
            expected_base=base,
            expected_base_tree=base_tree,
            expected_result_tree=result_tree,
        )
        self.assertEqual(merged["mergeCommitSha"], merge)
        self.assertEqual([method for method, _ in calls].count("PUT"), 1)

        moved_calls: list[str] = []

        def moved_transport(method: str, url: str, token: str, body):
            moved_calls.append(method)
            if method == "GET" and url.endswith("/pulls/12"):
                return {
                    "number": 12,
                    "draft": False,
                    "state": "open",
                    "head": {"ref": "promote/staging/one", "sha": self.head, "repo": {"full_name": "owner/name"}},
                    "base": {"ref": "staging", "sha": _sha(71)},
                }
            if method == "GET" and url.endswith("/git/ref/heads/staging"):
                return {"object": {"sha": _sha(71)}}
            if method == "GET" and url.endswith(f"/git/commits/{_sha(71)}"):
                return {"tree": {"sha": _sha(72)}}
            raise AssertionError((method, url, body))

        moved_live = controller.LiveGitHub(
            repository="owner/name", automation_token="tok", transport=moved_transport
        )
        with self.assertRaisesRegex(controller.ControllerError, "protected_base_moved"):
            moved_live.merge_pull_request(
                repository="owner/name",
                number=12,
                expected_head=self.head,
                expected_base_branch="staging",
                expected_base=base,
                expected_base_tree=base_tree,
                expected_result_tree=result_tree,
            )
        self.assertNotIn("PUT", moved_calls)

    def test_live_and_memory_merge_omissions_fail_before_transport_or_mutation(self) -> None:
        calls: list[str] = []

        def transport(method: str, url: str, token: str, body):
            calls.append(method)
            raise AssertionError((method, url, body))

        live = controller.LiveGitHub(repository="owner/name", automation_token="tok", transport=transport)
        with self.assertRaises(TypeError):
            live.merge_pull_request(
                repository="owner/name",
                number=11,
                expected_head=self.head,
                expected_base_branch="development",
                expected_base=_sha(9),
                expected_base_tree=_sha(10),
            )
        with self.assertRaises(TypeError):
            self.github.merge_pull_request(
                repository="owner/name",
                number=11,
                expected_head=self.head,
                expected_base_branch="development",
                expected_base=_sha(9),
                expected_base_tree=_sha(10),
            )
        for adapter in (live, self.github):
            with self.assertRaisesRegex(controller.ControllerError, "protected_merge_identity_required"):
                adapter.merge_pull_request(
                    repository="owner/name",
                    number=11,
                    expected_head=self.head,
                    expected_base_branch="",
                    expected_base=_sha(9),
                    expected_base_tree=_sha(10),
                    expected_result_tree=self.tree,
                )
            with self.assertRaisesRegex(controller.ControllerError, "protected_merge_identity_required"):
                adapter.merge_pull_request(
                    repository="owner/name",
                    number=11,
                    expected_head=self.head,
                    expected_base_branch="development",
                    expected_base=_sha(9),
                    expected_base_tree=_sha(10),
                    expected_result_tree="",
                )
        self.assertEqual(calls, [])
        self.assertEqual(self.github.merges, [])

    def test_memory_merge_rejects_wrong_post_merge_parent_or_tree_without_protected_mutation(self) -> None:
        merge_sha = hashlib.sha1(f"merge:11:{self.head}".encode("utf-8")).hexdigest()
        for field_name, readback, code in (
            (
                "parent",
                {"parents": [{"sha": _sha(8)}], "tree": {"sha": self.tree}},
                "protected_base_moved_during_merge",
            ),
            (
                "tree",
                {"parents": [{"sha": _sha(9)}], "tree": {"sha": _sha(8)}},
                "protected_merge_tree_mismatch",
            ),
        ):
            with self.subTest(field=field_name):
                github = controller.MemoryGitHub(repository="owner/name")
                github.prs[11] = dict(self.pr)
                github.refs["development"] = _sha(9)
                github.ref_trees["development"] = _sha(10)
                github.commit_trees[self.head] = self.tree
                github.merge_commit_readbacks[merge_sha] = readback
                with self.assertRaisesRegex(controller.ControllerError, code):
                    github.merge_pull_request(
                        repository="owner/name",
                        number=11,
                        expected_head=self.head,
                        expected_base_branch="development",
                        expected_base=_sha(9),
                        expected_base_tree=_sha(10),
                        expected_result_tree=self.tree,
                    )
                self.assertEqual(github.refs["development"], _sha(9))
                self.assertEqual(github.ref_trees["development"], _sha(10))
                self.assertEqual(github.merges, [])

    def test_invalid_expected_branch_matrix_fails_before_transport_or_mutation(self) -> None:
        calls: list[str] = []

        def transport(method: str, url: str, token: str, body):
            calls.append(method)
            raise AssertionError((method, url, body))

        live = controller.LiveGitHub(repository="owner/name", automation_token="tok", transport=transport)
        invalid = (
            "",
            " ",
            " development",
            "development ",
            "/development",
            "development/",
            "development//shadow",
            "development/../main",
            "development\\main",
            "development^shadow",
            "development/.shadow",
            "development/shadow.lock",
        )
        for branch in invalid:
            for adapter in (live, self.github):
                with self.subTest(branch=branch, adapter=type(adapter).__name__), self.assertRaisesRegex(
                    controller.ControllerError, "protected_merge_identity_required"
                ):
                    adapter.merge_pull_request(
                        repository="owner/name",
                        number=11,
                        expected_head=self.head,
                        expected_base_branch=branch,
                        expected_base=_sha(9),
                        expected_base_tree=_sha(10),
                        expected_result_tree=self.tree,
                    )
        self.assertEqual(calls, [])
        self.assertEqual(self.github.merges, [])

    def test_live_strict_protection_rejects_move_after_final_read_before_put(self) -> None:
        base, base_tree = _sha(7), _sha(70)
        state = {"base": base, "protectedMutation": False}

        def transport(method: str, url: str, token: str, body):
            if method == "GET" and url.endswith("/pulls/13"):
                return {
                    "number": 13,
                    "draft": False,
                    "state": "open",
                    "head": {"ref": "promote/staging/two", "sha": self.head, "repo": {"full_name": "owner/name"}},
                    "base": {"ref": "staging", "sha": state["base"]},
                }
            if method == "GET" and url.endswith("/git/ref/heads/staging"):
                return {"object": {"sha": state["base"]}}
            if method == "GET" and url.endswith(f"/git/commits/{base}"):
                return {"tree": {"sha": base_tree}}
            if method == "GET" and url.endswith("/rules/branches/staging"):
                return [
                    {
                        "type": "required_status_checks",
                        "parameters": {"strict_required_status_checks_policy": True},
                    }
                ]
            if method == "PUT" and url.endswith("/pulls/13/merge"):
                state["base"] = _sha(71)
                raise controller.ControllerError(
                    "protected_merge_rejected",
                    "strict status checks rejected a base move at merge transaction time",
                )
            raise AssertionError((method, url, body))

        live = controller.LiveGitHub(repository="owner/name", automation_token="tok", transport=transport)
        with self.assertRaisesRegex(controller.ControllerError, "protected_merge_rejected"):
            live.merge_pull_request(
                repository="owner/name",
                number=13,
                expected_head=self.head,
                expected_base_branch="staging",
                expected_base=base,
                expected_base_tree=base_tree,
                expected_result_tree=self.tree,
            )
        self.assertFalse(state["protectedMutation"])

    def test_live_merge_rejects_missing_strict_atomic_base_protection(self) -> None:
        base, base_tree = _sha(7), _sha(70)
        calls: list[str] = []

        def transport(method: str, url: str, token: str, body):
            calls.append(method)
            if method == "GET" and url.endswith("/pulls/14"):
                return {
                    "number": 14,
                    "draft": False,
                    "state": "open",
                    "head": {"ref": "promote/staging/three", "sha": self.head, "repo": {"full_name": "owner/name"}},
                    "base": {"ref": "staging", "sha": base},
                }
            if method == "GET" and url.endswith("/git/ref/heads/staging"):
                return {"object": {"sha": base}}
            if method == "GET" and url.endswith(f"/git/commits/{base}"):
                return {"tree": {"sha": base_tree}}
            if method == "GET" and url.endswith("/rules/branches/staging"):
                return []
            raise AssertionError((method, url, body))

        live = controller.LiveGitHub(repository="owner/name", automation_token="tok", transport=transport)
        with self.assertRaisesRegex(controller.ControllerError, "atomic_base_protection_missing"):
            live.merge_pull_request(
                repository="owner/name",
                number=14,
                expected_head=self.head,
                expected_base_branch="staging",
                expected_base=base,
                expected_base_tree=base_tree,
                expected_result_tree=self.tree,
            )
        self.assertNotIn("PUT", calls)

    def test_live_merge_rejects_retarget_to_lookalike_unprotected_branch_before_reads(self) -> None:
        calls: list[tuple[str, str]] = []

        def transport(method: str, url: str, token: str, body):
            calls.append((method, url))
            if method == "GET" and url.endswith("/pulls/15"):
                return {
                    "number": 15,
                    "draft": False,
                    "state": "open",
                    "head": {"ref": "phase/next", "sha": self.head, "repo": {"full_name": "owner/name"}},
                    "base": {"ref": "development-lookalike", "sha": _sha(7)},
                }
            raise AssertionError((method, url, body))

        live = controller.LiveGitHub(repository="owner/name", automation_token="tok", transport=transport)
        with self.assertRaisesRegex(controller.ControllerError, "unexpected_pr_base_branch"):
            live.merge_pull_request(
                repository="owner/name",
                number=15,
                expected_head=self.head,
                expected_base_branch="development",
                expected_base=_sha(7),
                expected_base_tree=_sha(70),
                expected_result_tree=self.tree,
            )
        self.assertEqual(calls, [("GET", "https://api.github.com/repos/owner/name/pulls/15")])

    def test_live_merge_rejects_retarget_to_lookalike_strict_branch_before_reads(self) -> None:
        calls: list[tuple[str, str]] = []

        def transport(method: str, url: str, token: str, body):
            calls.append((method, url))
            if method == "GET" and url.endswith("/pulls/16"):
                return {
                    "number": 16,
                    "draft": False,
                    "state": "open",
                    "head": {"ref": "phase/next", "sha": self.head, "repo": {"full_name": "owner/name"}},
                    "base": {"ref": "release-shadow", "sha": _sha(7)},
                }
            raise AssertionError((method, url, body))

        live = controller.LiveGitHub(repository="owner/name", automation_token="tok", transport=transport)
        with self.assertRaisesRegex(controller.ControllerError, "unexpected_pr_base_branch"):
            live.merge_pull_request(
                repository="owner/name",
                number=16,
                expected_head=self.head,
                expected_base_branch="development",
                expected_base=_sha(7),
                expected_base_tree=_sha(70),
                expected_result_tree=self.tree,
            )
        self.assertEqual(calls, [("GET", "https://api.github.com/repos/owner/name/pulls/16")])

    def test_memory_merge_rejects_retarget_before_mutation(self) -> None:
        self.github.prs[11]["base"] = "release-shadow"
        self.github.refs["release-shadow"] = self.github.refs["development"]
        self.github.ref_trees["release-shadow"] = self.github.ref_trees["development"]

        with self.assertRaisesRegex(controller.ControllerError, "unexpected_pr_base_branch"):
            self.github.merge_pull_request(
                repository="owner/name",
                number=11,
                expected_head=self.head,
                expected_base_branch="development",
                expected_base=self.github.refs["development"],
                expected_base_tree=self.github.ref_trees["development"],
                expected_result_tree=self.tree,
            )
        self.assertEqual(self.github.merges, [])
        self.assertEqual(self.github.refs["release-shadow"], self.github.refs["development"])

    def test_staging_and_main_require_exact_source_sha_equality(self) -> None:
        with self.assertRaisesRegex(controller.ControllerError, "promotion_source_mismatch"):
            controller.promote_to_staging(
                github=self.github,
                repository="owner/name",
                development_sha=self.head,
                staging_sha=_sha(7),
                staging_tree=_sha(70),
                candidate_sha=_sha(99),
                candidate_tree=self.tree,
                receipt=self.receipt,
                candidate_identity=self.identity,
                release_gate={"status": "passed", "testProfile": "release"},
                role="operator",
            )
        with self.assertRaisesRegex(controller.ControllerError, "promotion_source_mismatch"):
            controller.prepare_main_promotion(
                github=self.github,
                repository="owner/name",
                staging_sha=self.head,
                main_sha=_sha(6),
                main_tree=_sha(60),
                candidate_sha=_sha(88),
                receipt=self.receipt,
                candidate_identity=self.identity,
                release_gate={"status": "passed", "testProfile": "release"},
                role="operator",
            )
        with self.assertRaisesRegex(controller.ControllerError, "promotion_source_mismatch"):
            controller.complete_main_promotion(
                github=self.github,
                repository="owner/name",
                pr_number=11,
                expected_head=self.head,
                source_sha=_sha(55),
                base_sha=_sha(6),
                base_tree=_sha(60),
                approval={
                    "decision": "approve",
                    "sourceSha": _sha(55),
                    "baseSha": _sha(6),
                    "baseTree": _sha(60),
                    "prHeadSha": self.head,
                    "receiptDigest": receipts.compute_receipt_digest(self.receipt),
                },
                receipt=self.receipt,
                role="founder",
            )

    def test_infrastructure_retry_bound_is_enforced(self) -> None:
        attempts = {"n": 0}

        def flaky() -> str:
            attempts["n"] += 1
            raise controller.ControllerError("github_unavailable", f"attempt-{attempts['n']}")

        with self.assertRaisesRegex(controller.ControllerError, "infrastructure_retries_exhausted"):
            controller.call_with_infrastructure_retry(flaky)
        self.assertEqual(attempts["n"], controller.INFRA_RETRY_LIMIT)

        attempts["n"] = 0

        def recover() -> str:
            attempts["n"] += 1
            if attempts["n"] < 2:
                raise controller.ControllerError("network_error", "transient")
            return "ok"

        self.assertEqual(controller.call_with_infrastructure_retry(recover), "ok")
        self.assertEqual(attempts["n"], 2)

        with self.assertRaisesRegex(controller.ControllerError, "stale_pr_head"):
            controller.call_with_infrastructure_retry(
                lambda: (_ for _ in ()).throw(controller.ControllerError("stale_pr_head", "no-retry"))
            )

    def test_repository_owned_ci_is_distinct_eligibility_gate(self) -> None:
        ok = self._verify()
        self.assertEqual(ok["repositoryCi"], "passed")
        with self.assertRaisesRegex(controller.ControllerError, "repository_ci_missing"):
            self._verify(repository_ci={"required": [], "results": {}})
        with self.assertRaisesRegex(controller.ControllerError, "repository_ci_failed"):
            self._verify(
                repository_ci={
                    "required": ["Verify IDE Development"],
                    "results": {"Verify IDE Development": {"status": "failure", "sha": self.head}},
                }
            )
        with self.assertRaisesRegex(controller.ControllerError, "repository_ci_stale"):
            self._verify(
                repository_ci={
                    "required": ["Verify IDE Development"],
                    "results": {"Verify IDE Development": {"status": "success", "sha": _sha(99)}},
                }
            )
        with self.assertRaisesRegex(controller.ControllerError, "repository_ci_collides_with_system"):
            self._verify(
                repository_ci={
                    "required": ["Linktrend Fast Checks"],
                    "results": {"Linktrend Fast Checks": {"status": "success", "sha": self.head}},
                }
            )

    def test_live_github_promote_ref_exact_binding_and_wrong_tip(self) -> None:
        branch = f"promote/staging/{self.head[:12]}"
        refs: dict[str, str] = {branch: _sha(99)}
        calls: list[tuple[str, str]] = []

        def transport(method: str, url: str, token: str, body):
            calls.append((method, url))
            self.assertEqual(token, "tok")
            if method == "GET" and "/git/refs/heads/" in url:
                name = url.rsplit("/git/refs/heads/", 1)[-1]
                if name not in refs:
                    raise controller.ControllerError("github_api_failed", f"GET {url} -> 404: not found")
                return {"ref": f"refs/heads/{name}", "object": {"sha": refs[name]}}
            if method == "PATCH" and "/git/refs/heads/" in url:
                name = url.rsplit("/git/refs/heads/", 1)[-1]
                refs[name] = str(body["sha"])
                return {"ref": f"refs/heads/{name}", "object": {"sha": refs[name]}}
            if method == "POST" and url.endswith("/git/refs"):
                name = str(body["ref"]).removeprefix("refs/heads/")
                refs[name] = str(body["sha"])
                return {"ref": body["ref"], "object": {"sha": body["sha"]}}
            if method == "POST" and url.endswith("/pulls"):
                return {
                    "number": 42,
                    "html_url": "https://github.com/owner/name/pull/42",
                    "draft": False,
                    "state": "open",
                    "head": {"ref": branch, "sha": self.head, "repo": {"full_name": "owner/name"}},
                    "base": {"ref": "staging"},
                }
            if method == "GET" and url.endswith("/pulls/42"):
                return {
                    "number": 42,
                    "html_url": "https://github.com/owner/name/pull/42",
                    "draft": False,
                    "state": "open",
                    "head": {"ref": branch, "sha": refs[branch], "repo": {"full_name": "owner/name"}},
                    "base": {"ref": "staging"},
                    "mergeable_state": "clean",
                }
            raise AssertionError((method, url, body))

        live = controller.LiveGitHub(repository="owner/name", automation_token="tok", transport=transport)
        # Existing wrong tip must be rewritten to exact head_sha before PR open.
        pr = live.create_pull_request(
            repository="owner/name",
            head=branch,
            base="staging",
            title="promote",
            body="body",
            head_sha=self.head,
        )
        self.assertEqual(refs[branch], self.head)
        self.assertEqual(pr["headSha"], self.head)
        self.assertTrue(any(method == "PATCH" for method, _ in calls))

        # Adversarial: remote remains wrong after write → fail closed.
        def bad_transport(method: str, url: str, token: str, body):
            if method == "GET" and "/git/refs/heads/" in url:
                return {"object": {"sha": _sha(77)}}
            if method in {"PATCH", "POST"} and "git/refs" in url:
                return {"object": {"sha": _sha(77)}}
            raise AssertionError((method, url))

        bad = controller.LiveGitHub(repository="owner/name", automation_token="tok", transport=bad_transport)
        with self.assertRaisesRegex(controller.ControllerError, "promote_ref_mismatch"):
            bad.ensure_promote_ref(repository="owner/name", branch=branch, head_sha=self.head)

        # Successful create path when ref is absent.
        fresh_branch = f"promote/main/{self.head[:12]}"
        fresh_refs: dict[str, str] = {}

        def create_transport(method: str, url: str, token: str, body):
            if method == "GET" and "/git/refs/heads/" in url:
                name = url.rsplit("/git/refs/heads/", 1)[-1]
                if name not in fresh_refs:
                    raise controller.ControllerError("github_api_failed", f"GET {url} -> 404: missing")
                return {"object": {"sha": fresh_refs[name]}}
            if method == "POST" and url.endswith("/git/refs"):
                name = str(body["ref"]).removeprefix("refs/heads/")
                fresh_refs[name] = str(body["sha"])
                return {"object": {"sha": body["sha"]}}
            if method == "POST" and url.endswith("/pulls"):
                return {"number": 7}
            if method == "GET" and url.endswith("/pulls/7"):
                return {
                    "number": 7,
                    "html_url": "https://github.com/owner/name/pull/7",
                    "draft": False,
                    "state": "open",
                    "head": {"ref": fresh_branch, "sha": self.head, "repo": {"full_name": "owner/name"}},
                    "base": {"ref": "main"},
                }
            raise AssertionError((method, url))

        creator = controller.LiveGitHub(repository="owner/name", automation_token="tok", transport=create_transport)
        created = creator.create_pull_request(
            repository="owner/name",
            head=fresh_branch,
            base="main",
            title="main",
            body="body",
            head_sha=self.head,
        )
        self.assertEqual(fresh_refs[fresh_branch], self.head)
        self.assertEqual(created["headSha"], self.head)

    def test_cleanup_cli_requires_truthful_merge_evidence(self) -> None:
        branch = f"promote/staging/{self.head[:12]}"
        with self.assertRaisesRegex(controller.ControllerError, "cleanup_before_success"):
            controller.authorize_cleanup_from_evidence({}, [branch])
        with self.assertRaisesRegex(controller.ControllerError, "cleanup_before_success"):
            controller.authorize_cleanup_from_evidence({"status": "waiting"}, [branch])
        with self.assertRaisesRegex(controller.ControllerError, "cleanup_before_success"):
            controller.authorize_cleanup_from_evidence(
                {"status": "merged", "promoteBranch": "promote/staging/deadbeefcafe"},
                [branch],
            )
        owned = controller.authorize_cleanup_from_evidence(
            {"status": "merged", "promoteBranch": branch},
            [branch],
        )
        self.assertEqual(owned, {branch: True})

        evidence_path = Path(tempfile.mkdtemp()) / "merge.json"
        evidence_path.write_text(json.dumps({"status": "merged", "promoteBranch": branch}), encoding="utf-8")
        self.github.refs[branch] = self.head
        with mock.patch.dict(
            os.environ,
            {"AUTOMATION_TOKEN": "tok", "AUTOMATION_TOKEN_SOURCE": "github_token"},
            clear=False,
        ):
            with mock.patch.object(controller, "resolve_production_github", return_value=self.github):
                rc = controller.main(
                    [
                        "cleanup",
                        "--repository",
                        "owner/name",
                        "--role",
                        "operator",
                        "--branches",
                        branch,
                        "--merge-evidence-json",
                        str(evidence_path),
                    ]
                )
                self.assertEqual(rc, 0)
                self.assertIn(branch, self.github.deleted_refs)
                rc_fail = controller.main(
                    [
                        "cleanup",
                        "--repository",
                        "owner/name",
                        "--role",
                        "operator",
                        "--branches",
                        branch,
                    ]
                )
                self.assertEqual(rc_fail, 2)

    def test_production_github_accepts_gh_token_without_automation_token(self) -> None:
        saved = {
            key: os.environ.pop(key, None)
            for key in ("AUTOMATION_TOKEN", "AUTOMATION_TOKEN_SOURCE", "GH_TOKEN", "GITHUB_TOKEN")
        }
        try:
            os.environ["GH_TOKEN"] = "ghs_phase_api"
            live = controller.resolve_production_github("owner/name")
            self.assertEqual(live.automation_token, "ghs_phase_api")
            os.environ.pop("GH_TOKEN", None)
            os.environ["AUTOMATION_TOKEN"] = "ghs_publisher"
            os.environ["AUTOMATION_TOKEN_SOURCE"] = "github_token"
            with self.assertRaisesRegex(controller.ControllerError, "legacy_publisher_token_not_canonical"):
                controller.resolve_production_github("owner/name")
        finally:
            for key, value in saved.items():
                if value is None:
                    os.environ.pop(key, None)
                else:
                    os.environ[key] = value

    def test_index_manifest_schema_and_hosted_fast_cover_controller(self) -> None:
        provider_root = ROOT / "core/managed-core"
        if not (provider_root / "INDEX.yaml").is_file():
            self.skipTest("provider-source contract files are not installed in the consumer repository")
        index = (provider_root / "INDEX.yaml").read_text(encoding="utf-8")
        self.assertIn("schemas/delivery-operation.schema.json", index)
        self.assertIn("core/managed-core/schemas/delivery-operation.schema.json", RC_REQUIRED_SCHEMA_RELS)
        manifest = json.loads((provider_root / "MANIFEST.json").read_text(encoding="utf-8"))
        sources = {row["source"] for row in manifest["files"]}
        self.assertIn("core/managed-core/schemas/delivery-operation.schema.json", sources)
        self.assertIn("scripts/gitops/delivery_controller.py", sources)
        self.assertIn("scripts/tests/test_delivery_controller.py", sources)
        runtime = json.loads((ROOT / "core/github/managed-runtime/MANIFEST.json").read_text(encoding="utf-8"))
        self.assertIn("scripts/gitops/delivery_controller.py", runtime["files"])
        fast = json.loads((ROOT / ".github/linktrend-delivery-mode.json").read_text(encoding="utf-8"))
        blob = json.dumps(fast["profiles"]["fast"]["commands"])
        self.assertIn("delivery_controller.py", blob)
        self.assertIn("test_delivery_controller", blob)
        doctrine = (ROOT / "docs/AUTONOMOUS-GIT-OPERATIONS.md").read_text(encoding="utf-8")
        self.assertIn("delivery controller", doctrine.lower())
        self.assertNotIn("waits indefinitely for an undefined merge actor", doctrine.lower())
        agents = (ROOT / "core/managed-core/platforms/codex/AGENTS.managed-section.md").read_text(encoding="utf-8")
        self.assertIn("delivery controller", agents.lower())
        self.assertNotIn("Integrator merges to `development`", agents)
        bootstrap = (ROOT / "core/managed-core/platforms/cursor/rules/cursor-gitops-bootstrap.mdc").read_text(
            encoding="utf-8"
        )
        self.assertIn("delivery controller", bootstrap.lower())
        self.assertNotIn("Integrator merges only when", bootstrap)
        branching = (ROOT / "core/managed-core/platforms/cursor/rules/linktrend-git-branching.mdc").read_text(
            encoding="utf-8"
        )
        self.assertIn("delivery controller", branching.lower())
        self.assertNotIn("→ Integrator", branching)
        local_branching = (ROOT / ".cursor/rules/01-git-branching.mdc").read_text(encoding="utf-8")
        self.assertIn("delivery controller", local_branching.lower())
        self.assertNotIn("Integrator merges", local_branching)
        self.assertNotIn("Integrator only", local_branching)
        runtime_branching = (
            ROOT / "core/github/managed-runtime/entrypoints/rules/linktrend-git-branching.mdc"
        ).read_text(encoding="utf-8")
        self.assertIn("delivery controller", runtime_branching.lower())
        self.assertNotIn("→ Integrator", runtime_branching)
        prd = (ROOT / "docs/IDE-DEVELOPMENT-TECHNICAL-PRD.md").read_text(encoding="utf-8")
        self.assertIn("delivery controller merges into `development`", prd)
        self.assertNotIn("Integrator merges into `development`", prd)
        pipeline = (ROOT / "core/execution/APPLICATION-PIPELINE.md").read_text(encoding="utf-8")
        self.assertIn("delivery controller into `development`", pipeline)
        self.assertNotIn("Integrator into `development`", pipeline)
        module3 = (ROOT / "core/runtime/skills/linktrend/module3-execution/SKILL.md").read_text(encoding="utf-8")
        self.assertIn("delivery controller merges into `development`", module3)
        protection = (ROOT / "docs/contracts/REPOSITORY-PROTECTION.md").read_text(encoding="utf-8")
        self.assertIn("delivery controller may auto-merge", protection)
        self.assertNotIn("so the Integrator may auto-merge", protection)
        packaged_protection = (
            ROOT / "core/managed-core/content/doctrine/REPOSITORY-PROTECTION.md"
        ).read_text(encoding="utf-8")
        self.assertIn("delivery controller may auto-merge", packaged_protection)
        schema = json.loads(
            (ROOT / "core/managed-core/schemas/delivery-operation.schema.json").read_text(encoding="utf-8")
        )
        record = controller.write_operation_record(
            Path(tempfile.mkdtemp()) / "delivery-operation.json",
            {
                "status": "merged",
                "stage": "development",
                "pr": 11,
                "testedHead": self.head,
                "mergeCommitSha": _sha(3),
                "directPush": False,
            },
        )
        for key in schema["required"]:
            self.assertIn(key, record)


if __name__ == "__main__":
    unittest.main()

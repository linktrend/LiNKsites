#!/usr/bin/env python3
"""Fail-closed receipt and promotion decisions for the thin GitHub fallback.

This module is deliberately side-effect free for receipt, gate, approval, and
duplicate-candidate decisions.  The only mutating helper is ``cancel_obsolete``;
it sends non-blocking GitHub run-cancel requests and never waits for completion.
No command in this file creates a PR, merges, promotes, or applies a ruleset.
Receipt verification itself requires no credential.  A later trusted workflow
boundary may use GitHub's built-in ``GITHUB_TOKEN`` only with explicit
least-privilege read permissions; it must not mint or consume the former
custom-App token here.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import subprocess
import sys
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Mapping, Sequence

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from coordinator.receipts import (  # noqa: E402
    CandidateIdentity,
    ReceiptError,
    canonical_digest as receipt_canonical_digest,
    compute_candidate_identity,
    compute_receipt_digest,
    load_json,
    receipt_lookup_key,
    verify_receipt,
    verify_transition_receipt,
)


SHA40 = set("0123456789abcdef")
PROMOTION_STATES = {"queued", "in_progress", "waiting", "requested"}
TRUSTED_PRODUCERS = frozenset({"delivery-controller", "linktrend-receipt-gate"})
TRUSTED_EVENTS = frozenset({"pull_request_target"})
TRUSTED_CHECK_NAMES = frozenset({"Linktrend Receipt Gate", "Linktrend Branch Source Policy"})
TRUSTED_WORKFLOW_FILES = frozenset(
    {
        ".github/workflows/linktrend-development-to-staging.yml",
        ".github/workflows/linktrend-staging-to-main.yml",
    }
)
UNTRUSTED_WORKFLOW_FILES = frozenset({".github/workflows/ci.yml", ".github/workflows/linktrend-review-packager.yml"})
ALLOWED_TRANSITIONS = {
    "development-to-staging": ("development", "staging"),
    "staging-to-main": ("staging", "main"),
}
AUTHORITATIVE_LIVE_FIELDS = (
    "repository",
    "transition",
    "protectedBaseCommit",
    "protectedBaseTree",
    "candidateHeadCommit",
    "candidateHeadTree",
    "workflowFile",
    "checkName",
    "requiredTest",
    "reviewer",
    "issuedAt",
    "expiresAt",
    "now",
    "consumptionId",
    "producer",
    "eventName",
)
REQUIRED_TEST_FIELDS = ("gate", "conclusion", "workflowPath", "runId", "runAttempt", "headCommit", "tree")
REVIEWER_FIELDS = ("identity", "result", "candidateAuthor")


@dataclass(frozen=True)
class Decision:
    accepted: bool
    code: str
    detail: str
    source_commit: str | None = None
    promotion_commit: str | None = None
    receipt_lookup_key: str | None = None

    def to_dict(self) -> dict[str, Any]:
        result = {
            "accepted": self.accepted,
            "status": "PASS" if self.accepted else "HOLD",
            "code": self.code,
            "detail": self.detail,
        }
        if self.source_commit is not None:
            result["sourceCommit"] = self.source_commit
        if self.promotion_commit is not None:
            result["promotionCommit"] = self.promotion_commit
        if self.receipt_lookup_key is not None:
            result["receiptLookupKey"] = self.receipt_lookup_key
        return result


def _sha(value: Any) -> str:
    value = str(value or "").strip().lower()
    return value if len(value) == 40 and set(value) <= SHA40 else ""


def _field(payload: Mapping[str, Any], *names: str) -> Any:
    for name in names:
        if name in payload:
            return payload[name]
    return None


def canonical_digest(payload: Mapping[str, Any]) -> str:
    """Return the receipt-compatible canonical SHA-256 binding.

    Receipt and promotion code must hash identical canonical bytes.  Keeping
    this compatibility export avoids changing callers while preventing the
    old promotion-only JSON encoding from producing a different digest.
    """

    return receipt_canonical_digest(payload)


def verify_receipt_payload(
    receipt: Mapping[str, Any],
    candidate_identity: Mapping[str, Any] | CandidateIdentity,
    required_gate: str,
    transition_receipt: Mapping[str, Any] | None = None,
    **verification: Any,
) -> Decision:
    verdict = verify_receipt(
        receipt,
        candidate_identity,
        required_gate,
        transition_receipt=transition_receipt,
        **verification,
    )
    detail = verdict.message or verdict.code
    if verdict.accepted and verdict.source_commit and verdict.promotion_commit:
        detail = f"{detail}; sourceCommit={verdict.source_commit}; promotionCommit={verdict.promotion_commit}"
    lookup_key = None
    if verdict.accepted:
        lookup_key = receipt_lookup_key(receipt)
    return Decision(
        bool(verdict),
        verdict.code,
        detail,
        source_commit=verdict.source_commit,
        promotion_commit=verdict.promotion_commit,
        receipt_lookup_key=lookup_key,
    )


def verify_receipt_file(
    receipt_path: str | Path,
    *,
    identity_path: str | Path | None = None,
    repo_path: str | Path | None = None,
    dependencies: Sequence[str] = (),
    profile: str = "full",
    required_gate: str = "full-gate",
    profile_files: Sequence[str] = (),
    workflow_files: Sequence[str] | None = None,
    workflow_run_id: int | None = None,
    workflow_run_attempt: int | None = None,
    workflow_head_commit: str | None = None,
    runner_label: str | None = None,
    expected_command_digest: str | None = None,
    expected_workflow_digest: str | None = None,
    expected_evidence_digests: Mapping[str, str] | None = None,
    transition_receipt_path: str | Path | None = None,
) -> Decision:
    try:
        receipt = load_json(receipt_path)
        if identity_path is not None:
            identity = load_json(identity_path)
        elif repo_path is not None:
            identity = compute_candidate_identity(
                repo_path,
                dependencies,
                profile,
                profile_files=profile_files,
                workflow_files=workflow_files,
            )
        else:
            return Decision(False, "identity_missing", "candidate identity or checkout is required")
        return verify_receipt_payload(
            receipt,
            identity,
            required_gate,
            transition_receipt=load_json(transition_receipt_path) if transition_receipt_path is not None else None,
            workflow_run_id=workflow_run_id,
            workflow_run_attempt=workflow_run_attempt,
            workflow_head_commit=workflow_head_commit,
            runner_label=runner_label,
            expected_command_digest=expected_command_digest,
            expected_workflow_digest=expected_workflow_digest,
            expected_evidence_digests=expected_evidence_digests,
        )
    except (ReceiptError, OSError, ValueError) as exc:
        code = getattr(exc, "code", "invalid_receipt")
        return Decision(False, str(code), str(exc))


def evaluate_development_gates(payload: Mapping[str, Any], expected_head_sha: str) -> Decision:
    """Require exact seal, fast, and full/not-required on one head."""
    head = _sha(expected_head_sha)
    if not head:
        return Decision(False, "invalid_head", "expected development head SHA is invalid")
    aliases = {
        "seal": ("seal", "sealed", "phaseReady"),
        "fast": ("fast", "fastGate", "fast-gate"),
        "full": ("full", "fullSuite", "full-gate"),
    }
    for name, keys in aliases.items():
        row = next((payload[key] for key in keys if key in payload), None)
        if not isinstance(row, Mapping):
            return Decision(False, f"{name}_missing", f"{name} result is missing")
        status = str(_field(row, "status", "state", "conclusion") or "").strip().lower()
        if name == "full" and status in {"not-required", "not_required", "not required"}:
            continue
        if status not in {"passed", "success", "successful", "green"}:
            return Decision(False, f"{name}_not_passed", f"{name} result is {status or 'missing'}")
        observed = _sha(_field(row, "sha", "headSha", "sourceSha"))
        if not observed or observed != head:
            return Decision(False, f"{name}_stale", f"{name} is not bound to the exact sealed head")
    return Decision(True, "accepted", "exact seal, fast, and full/not-required gates passed")


def evaluate_main_approval(
    approval: Mapping[str, Any],
    *,
    source_sha: str,
    base_sha: str,
    pr_head_sha: str,
    receipt: Mapping[str, Any] | None = None,
) -> Decision:
    """Bind principal approval to source, base, PR head, and exact receipt."""
    expected = {
        "sourceSha": _sha(source_sha),
        "baseSha": _sha(base_sha),
        "prHeadSha": _sha(pr_head_sha),
    }
    if not all(expected.values()):
        return Decision(False, "invalid_binding", "approval binding SHA is malformed")
    for key, names in {
        "sourceSha": ("sourceSha", "stagingSha", "expectedStagingSha"),
        "baseSha": ("baseSha", "mainSha", "expectedMainSha"),
        "prHeadSha": ("prHeadSha", "promotionHeadSha", "expectedPromoteHead"),
    }.items():
        if _sha(_field(approval, *names)) != expected[key]:
            return Decision(False, f"stale_{key}", f"approval is not bound to current {key}")

    if receipt is None:
        return Decision(False, "receipt_missing", "main approval must include a receipt binding")
    try:
        receipt_digest = compute_receipt_digest(receipt)
        lookup_key = receipt_lookup_key(receipt)
    except ReceiptError as exc:
        return Decision(False, "receipt_mismatch", str(exc))
    bound_digest = str(_field(approval, "receiptDigest", "receiptSha256") or "").strip()
    if bound_digest and bound_digest != receipt_digest:
        return Decision(False, "receipt_mismatch", "approval receipt digest does not match")
    bound_identity = _field(approval, "receiptIdentity")
    if bound_identity is not None and bound_identity != receipt.get("candidateIdentity"):
        return Decision(False, "receipt_mismatch", "approval receipt identity does not match")
    if not bound_digest and bound_identity is None:
        return Decision(False, "receipt_unbound", "approval has no exact receipt digest or identity binding")
    return Decision(True, "accepted", f"approval is bound to source, base, PR head, and receipt {lookup_key}")


def evaluate_release_path(payload: Mapping[str, Any]) -> Decision:
    """Require a short release gate and explicitly prohibit a full-suite rerun."""
    if bool(payload.get("fullSuiteInvoked")):
        return Decision(False, "full_suite_reentered", "staging/main promotion must reuse the matching receipt")
    status = str(_field(payload, "status", "state", "conclusion") or "").strip().lower()
    if status not in {"passed", "success", "successful", "green"}:
        return Decision(False, "release_gate_not_passed", "short release checks did not pass")
    profile = str(payload.get("testProfile") or "release").strip().lower()
    if profile != "release":
        return Decision(False, "release_profile_required", "promotion release checks must use the release profile")
    return Decision(True, "accepted", "short release checks passed without a full-suite rerun")


def evaluate_automatic_main(
    *,
    release: Mapping[str, Any],
    required_receipt: Mapping[str, Any],
    candidate_identity: Mapping[str, Any] | CandidateIdentity,
    workflow_run_id: int | None = None,
    workflow_run_attempt: int | None = None,
    workflow_head_commit: str | None = None,
    runner_label: str | None = None,
    transition_receipt: Mapping[str, Any] | None = None,
) -> Decision:
    """Automatic main is still gate- and receipt-bound; mode changes no gates."""
    release_decision = evaluate_release_path(release)
    if not release_decision.accepted:
        return release_decision
    receipt_decision = verify_receipt_payload(
        required_receipt,
        candidate_identity,
        "full-gate",
        workflow_run_id=workflow_run_id,
        workflow_run_attempt=workflow_run_attempt,
        workflow_head_commit=workflow_head_commit,
        runner_label=runner_label,
        transition_receipt=transition_receipt,
    )
    if not receipt_decision.accepted:
        return receipt_decision
    return Decision(
        True,
        "accepted",
        f"automatic main passed release gate and exact receipt verification; {receipt_decision.detail}",
        source_commit=receipt_decision.source_commit,
        promotion_commit=receipt_decision.promotion_commit,
        receipt_lookup_key=receipt_decision.receipt_lookup_key,
    )


def select_promotion_candidate(
    candidates: Sequence[Mapping[str, Any]], *, source_sha: str, target_sha: str, branch: str
) -> dict[str, Any]:
    """Select one exact open candidate; duplicates are an explicit block."""
    source = _sha(source_sha)
    target = _sha(target_sha)
    matches = []
    for candidate in candidates:
        if (
            _sha(_field(candidate, "sourceSha")) == source
            and _sha(_field(candidate, "targetSha")) == target
            and str(_field(candidate, "promoteBranch", "headRefName") or "") == branch
            and str(_field(candidate, "state") or "OPEN").upper() == "OPEN"
        ):
            matches.append(candidate)
    matches.sort(key=lambda item: int(item.get("number") or 0))
    if len(matches) > 1:
        return {"action": "blocked", "reason": "duplicate_promotion_candidates", "prs": [m.get("number") for m in matches]}
    if len(matches) == 1:
        return {"action": "reuse", "pr": matches[0].get("number")}
    return {"action": "create"}


def cancel_obsolete(repository: str, branch: str, live_sha: str) -> list[str]:
    """Cancel obsolete queued/running runs without polling or waiting."""
    live = _sha(live_sha)
    if not live:
        raise ValueError("live SHA is invalid")
    result = subprocess.run(
        ["gh", "run", "list", "--repo", repository, "--branch", branch,
         "--limit", "100", "--json", "databaseId,headSha,status"],
        capture_output=True, text=True, check=False,
    )
    if result.returncode != 0:
        raise RuntimeError("unable to list GitHub runs")
    rows = json.loads(result.stdout or "[]")
    cancelled: list[str] = []
    for row in rows:
        if not isinstance(row, Mapping) or _sha(row.get("headSha")) in {"", live}:
            continue
        if str(row.get("status") or "").lower() not in PROMOTION_STATES:
            continue
        run_id = str(row.get("databaseId") or "")
        if not run_id:
            continue
        # Do not wait for the cancellation result; the API request is the only
        # supported mutation and the next observer reconciles eventual state.
        subprocess.run(["gh", "run", "cancel", run_id, "--repo", repository], check=False, capture_output=True, text=True)
        cancelled.append(run_id)
    return cancelled


def _parse_utc(value: Any) -> datetime | None:
    text = str(value or "").strip()
    if not text:
        return None
    if text.endswith("Z"):
        text = text[:-1] + "+00:00"
    try:
        parsed = datetime.fromisoformat(text)
    except ValueError:
        return None
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def canonical_consumption_id(payload: Mapping[str, Any]) -> str:
    identity = {
        "repository": payload.get("repository"),
        "transition": payload.get("transition"),
        "protectedBaseCommit": payload.get("protectedBaseCommit"),
        "protectedBaseTree": payload.get("protectedBaseTree"),
        "candidateHeadCommit": payload.get("candidateHeadCommit"),
        "candidateHeadTree": payload.get("candidateHeadTree"),
        "sourceReceiptDigest": payload.get("sourceReceiptDigest"),
        "transitionDigest": payload.get("transitionDigest"),
        "workflowFile": payload.get("workflowFile"),
        "checkName": payload.get("checkName"),
    }
    digest = hashlib.sha256(
        json.dumps(identity, sort_keys=True, separators=(",", ":")).encode("utf-8")
    ).hexdigest()
    return f"sha256:{digest}"


def assemble_live_facts(
    *,
    repository: str,
    transition: str,
    protected_base_commit: str,
    protected_base_tree: str,
    candidate_head_commit: str,
    candidate_head_tree: str,
    workflow_file: str,
    check_name: str,
    required_test: Mapping[str, Any],
    reviewer: Mapping[str, Any],
    issued_at: str,
    expires_at: str,
    now: str,
    producer: str,
    event_name: str,
    source_receipt: Mapping[str, Any],
    transition_receipt: Mapping[str, Any],
    observed_checks: Sequence[Mapping[str, Any]] = (),
    founder_authorized: bool = False,
    extra: Mapping[str, Any] | None = None,
) -> dict[str, Any]:
    """Build trusted-producer live facts.  Does not invent success or identities."""

    facts: dict[str, Any] = {
        "repository": repository,
        "transition": transition,
        "protectedBaseCommit": protected_base_commit,
        "protectedBaseTree": protected_base_tree,
        "candidateHeadCommit": candidate_head_commit,
        "candidateHeadTree": candidate_head_tree,
        "workflowFile": workflow_file,
        "checkName": check_name,
        "requiredTest": dict(required_test),
        "reviewer": dict(reviewer),
        "issuedAt": issued_at,
        "expiresAt": expires_at,
        "now": now,
        "producer": producer,
        "eventName": event_name,
        "producerCredentialsAvailableToCandidate": False,
        "candidateAuthored": False,
        "observedChecks": [dict(row) for row in observed_checks],
        "founderAuthorized": bool(founder_authorized),
        "consumptionId": canonical_consumption_id(
            {
                "repository": repository,
                "transition": transition,
                "protectedBaseCommit": protected_base_commit,
                "protectedBaseTree": protected_base_tree,
                "candidateHeadCommit": candidate_head_commit,
                "candidateHeadTree": candidate_head_tree,
                "sourceReceiptDigest": source_receipt.get("receiptDigest"),
                "transitionDigest": transition_receipt.get("receiptDigest"),
                "workflowFile": workflow_file,
                "checkName": check_name,
            }
        ),
    }
    if extra:
        for key, value in extra.items():
            if key in facts and key != "founderAuthorized":
                continue
            facts[key] = value
    return facts


def write_live_facts_from_workspace(
    *,
    repository: str,
    transition: str,
    protected_base_commit: str,
    protected_base_tree: str,
    candidate_head_commit: str,
    candidate_head_tree: str,
    workflow_file: str,
    event_name: str,
    current_pr: str,
    receipt_path: str | Path,
    transition_path: str | Path,
    source_pr_path: str | Path,
    run_path: str | Path,
    reviews_path: str | Path,
    checks_path: str | Path,
    merged_path: str | Path,
    output_path: str | Path,
    consumed_ids_path: str | Path,
    consumed_receipts_path: str | Path,
    now: str | None = None,
) -> dict[str, Any]:
    """Assemble live facts from independently observed GitHub payloads."""

    receipt = load_json(receipt_path)
    transition_receipt = load_json(transition_path)
    source_pr = load_json(source_pr_path)
    run = load_json(run_path)
    reviews = load_json(reviews_path)
    checks = load_json(checks_path)
    merged = load_json(merged_path)
    author = str(((source_pr.get("user") or {}) if isinstance(source_pr, Mapping) else {}).get("login") or "")
    independent = None
    for row in reviews if isinstance(reviews, list) else []:
        if not isinstance(row, Mapping):
            continue
        login = str(((row.get("user") or {}) if isinstance(row.get("user"), Mapping) else {}).get("login") or "")
        state = str(row.get("state") or "").upper()
        body = str(row.get("body") or "").strip().upper()
        if login and login != author and (state == "APPROVED" or body.startswith("PASS")):
            independent = {"identity": login, "result": "PASS" if body.startswith("PASS") else "APPROVED", "candidateAuthor": author}
            break
    if independent is None:
        raise ReceiptError("independent_review_missing", "no independent reviewer result is present")
    clock = _parse_utc(now) or datetime.now(timezone.utc)
    issued = str(run.get("updated_at") or run.get("created_at") or clock.strftime("%Y-%m-%dT%H:%M:%SZ"))
    expires = (clock + timedelta(days=14)).strftime("%Y-%m-%dT%H:%M:%SZ")
    observed = [
        {"name": "Linktrend Receipt Gate", "producer": workflow_file},
        {"name": "Linktrend Branch Source Policy", "producer": workflow_file},
    ]
    for row in (checks.get("check_runs") or []) if isinstance(checks, Mapping) else []:
        if not isinstance(row, Mapping):
            continue
        name = str(row.get("name") or "")
        path = str(row.get("path") or row.get("details_url") or "")
        if ".github/workflows/ci.yml" in path or str(((row.get("app") or {}) if isinstance(row.get("app"), Mapping) else {}).get("name") or "") == "GitHub Actions":
            if name in TRUSTED_CHECK_NAMES or str(row.get("name") or "") in {"LiNKsites CI", "full-production-suite"}:
                path = ".github/workflows/ci.yml"
        if name in TRUSTED_CHECK_NAMES:
            if path in UNTRUSTED_WORKFLOW_FILES:
                observed.append({"name": name, "producer": path})
            continue
        observed.append({"name": name, "producer": path})
    consumed_receipts = []
    receipt_digest = str(receipt.get("receiptDigest") or "")
    for item in (merged.get("items") or []) if isinstance(merged, Mapping) else []:
        if not isinstance(item, Mapping):
            continue
        number = str(item.get("number") or "")
        if number and number != str(current_pr or "") and receipt_digest:
            consumed_receipts.append(receipt_digest)
    facts = assemble_live_facts(
        repository=repository,
        transition=transition,
        protected_base_commit=protected_base_commit,
        protected_base_tree=protected_base_tree,
        candidate_head_commit=candidate_head_commit,
        candidate_head_tree=candidate_head_tree,
        workflow_file=workflow_file,
        check_name="Linktrend Receipt Gate",
        required_test={
            "gate": "full-gate",
            "conclusion": "success" if str(run.get("conclusion") or "") == "success" else str(run.get("conclusion") or ""),
            "workflowPath": str(run.get("path") or ""),
            "runId": run.get("id"),
            "runAttempt": run.get("run_attempt"),
            "headCommit": str(((receipt.get("candidateIdentity") or {}) if isinstance(receipt.get("candidateIdentity"), Mapping) else {}).get("headCommit") or ""),
            "tree": candidate_head_tree,
        },
        reviewer=independent,
        issued_at=issued,
        expires_at=expires,
        now=clock.strftime("%Y-%m-%dT%H:%M:%SZ"),
        producer="linktrend-receipt-gate",
        event_name=event_name,
        source_receipt=receipt,
        transition_receipt=transition_receipt,
        observed_checks=observed,
    )
    Path(output_path).write_text(json.dumps(facts, sort_keys=True), encoding="utf-8")
    Path(consumed_ids_path).write_text("[]", encoding="utf-8")
    Path(consumed_receipts_path).write_text(json.dumps(consumed_receipts), encoding="utf-8")
    return facts


def evaluate_authoritative_promotion(
    *,
    live: Mapping[str, Any],
    source_receipt: Mapping[str, Any],
    transition_receipt: Mapping[str, Any],
    consumed_ids: Sequence[str] = (),
    consumed_receipt_digests: Sequence[str] = (),
) -> Decision:
    """Accept only independently produced, once-consumed promotion evidence.

    Candidate code cannot mint this decision.  Founder bootstrap is admitted
    only when every identity and test/review result is already truthful.
    """

    missing = [name for name in AUTHORITATIVE_LIVE_FIELDS if name not in live or live.get(name) in (None, "")]
    if missing:
        return Decision(False, "missing_field", f"authoritative live fields missing: {','.join(missing)}")

    required_test = live.get("requiredTest")
    reviewer = live.get("reviewer")
    if not isinstance(required_test, Mapping):
        return Decision(False, "missing_field", "requiredTest is missing")
    if not isinstance(reviewer, Mapping):
        return Decision(False, "missing_field", "reviewer is missing")
    missing_test = [name for name in REQUIRED_TEST_FIELDS if name not in required_test or required_test.get(name) in (None, "")]
    missing_review = [name for name in REVIEWER_FIELDS if name not in reviewer or reviewer.get(name) in (None, "")]
    if missing_test or missing_review:
        return Decision(False, "missing_field", "required test or reviewer fields missing")

    if bool(live.get("candidateAuthored")) or bool(live.get("producerCredentialsAvailableToCandidate")):
        return Decision(False, "candidate_authored", "candidate-authored evidence cannot authorize promotion")
    if str(live.get("eventName") or "") not in TRUSTED_EVENTS:
        return Decision(False, "candidate_authored", "authoritative evidence must come from pull_request_target")
    producer = str(live.get("producer") or "")
    workflow_file = str(live.get("workflowFile") or "")
    check_name = str(live.get("checkName") or "")
    if producer not in TRUSTED_PRODUCERS or workflow_file not in TRUSTED_WORKFLOW_FILES:
        return Decision(False, "producer_untrusted", "approval producer is not the trusted receipt-gate workflow")
    if check_name not in TRUSTED_CHECK_NAMES:
        return Decision(False, "producer_untrusted", "check identity is not a trusted promotion context")

    if any(bool(required_test.get(flag)) for flag in ("manufactured", "synthetic", "invented")):
        return Decision(False, "synthetic_evidence", "required test result was manufactured")
    if any(bool(reviewer.get(flag)) for flag in ("manufactured", "synthetic", "invented")):
        return Decision(False, "synthetic_evidence", "review evidence was manufactured")
    if any(bool(live.get(flag)) for flag in ("manufacturedCheck", "syntheticReceipt", "inventedIdentity")):
        return Decision(False, "synthetic_evidence", "synthetic promotion evidence is rejected")
    if bool(live.get("founderAuthorized")) and any(
        bool(live.get(flag)) for flag in ("manufactureSuccess", "inventedCheck", "inventedReview", "inventedTest")
    ):
        return Decision(False, "founder_bootstrap_manufactured", "founder bootstrap cannot manufacture evidence")

    repository = str(live.get("repository") or "")
    transition_name = str(live.get("transition") or "")
    if transition_name not in ALLOWED_TRANSITIONS:
        return Decision(False, "transition_mismatch", "transition is not a protected promotion")
    source_branch, target_branch = ALLOWED_TRANSITIONS[transition_name]
    if repository != str(transition_receipt.get("repository") or "") or repository != str(
        (source_receipt.get("candidateIdentity") or {}).get("repository") or ""
    ):
        return Decision(False, "repository_mismatch", "live repository does not match receipt identities")
    if str(transition_receipt.get("targetBranch") or "") != target_branch:
        return Decision(False, "transition_mismatch", "transition receipt target is not the live protected ref")
    if str((source_receipt.get("candidateIdentity") or {}).get("sourceBranch") or "") != source_branch:
        return Decision(False, "transition_mismatch", "source receipt branch does not match the named transition")

    live_base = _sha(live.get("protectedBaseCommit"))
    live_base_tree = _sha(live.get("protectedBaseTree"))
    live_head = _sha(live.get("candidateHeadCommit"))
    live_tree = _sha(live.get("candidateHeadTree"))
    if not all((live_base, live_base_tree, live_head, live_tree)):
        return Decision(False, "missing_field", "protected base or candidate identity is malformed")
    if _sha(transition_receipt.get("protectedBaseCommit")) != live_base:
        return Decision(False, "protected_base_mismatch", "transition protected base is not the current protected commit")
    if _sha(transition_receipt.get("targetCommit")) != live_head or _sha(transition_receipt.get("targetTree")) != live_tree:
        return Decision(False, "transition_target_mismatch", "transition target is not the live candidate head/tree")
    source_identity = source_receipt.get("candidateIdentity") if isinstance(source_receipt.get("candidateIdentity"), Mapping) else {}
    if _sha(source_identity.get("gitTree")) != live_tree:
        return Decision(False, "tree_mismatch", "audited tree is not the live candidate tree")
    if _sha(required_test.get("headCommit")) != _sha(source_identity.get("headCommit")):
        return Decision(False, "head_mismatch", "required test is not bound to the audited source head")
    if _sha(required_test.get("tree")) != live_tree:
        return Decision(False, "tree_mismatch", "required test is not bound to the live candidate tree")

    if str(required_test.get("gate") or "") != "full-gate":
        return Decision(False, "required_test_not_passed", "required test gate is not full-gate")
    conclusion = str(required_test.get("conclusion") or "").strip().lower()
    if conclusion not in {"success", "passed"}:
        return Decision(False, "required_test_not_passed", "required test did not pass")
    if str(required_test.get("workflowPath") or "") != ".github/workflows/linktrend-integrator-merge.yml":
        return Decision(False, "workflow_mismatch", "required test workflow identity is not the trusted Full producer")
    if required_test.get("runId") != source_receipt.get("workflowRunId") or required_test.get("runAttempt") != source_receipt.get(
        "workflowRunAttempt"
    ):
        return Decision(False, "run_mismatch", "required test run is not the retained Full receipt run")

    reviewer_identity = str(reviewer.get("identity") or "").strip()
    candidate_author = str(reviewer.get("candidateAuthor") or "").strip()
    review_result = str(reviewer.get("result") or "").strip().upper()
    if not reviewer_identity or not candidate_author:
        return Decision(False, "independent_review_missing", "reviewer or candidate author identity is missing")
    if reviewer_identity == candidate_author:
        return Decision(False, "self_review", "candidate author cannot supply the independent review")
    if review_result not in {"PASS", "APPROVED"}:
        return Decision(False, "independent_review_missing", "independent reviewer result is not PASS")

    issued = _parse_utc(live.get("issuedAt"))
    expires = _parse_utc(live.get("expiresAt"))
    now = _parse_utc(live.get("now"))
    if issued is None or expires is None or now is None:
        return Decision(False, "missing_field", "issuance or expiry timestamp is invalid")
    if issued > now or now >= expires or issued >= expires:
        return Decision(False, "stale_or_expired", "approval evidence is stale, expired, or not yet issued")

    source_digest = str(source_receipt.get("receiptDigest") or "")
    transition_digest = str(transition_receipt.get("receiptDigest") or "")
    expected_consumption = canonical_consumption_id(
        {
            "repository": repository,
            "transition": transition_name,
            "protectedBaseCommit": live_base,
            "protectedBaseTree": live_base_tree,
            "candidateHeadCommit": live_head,
            "candidateHeadTree": live_tree,
            "sourceReceiptDigest": source_digest,
            "transitionDigest": transition_digest,
            "workflowFile": workflow_file,
            "checkName": check_name,
        }
    )
    offered_consumption = str(live.get("consumptionId") or "")
    if offered_consumption != expected_consumption:
        return Decision(False, "copied_receipt", "consumption identity does not match the exact live binding")
    if offered_consumption in {str(item) for item in consumed_ids}:
        return Decision(False, "replay_or_reuse", "approval evidence was already consumed")
    if source_digest and source_digest in {str(item) for item in consumed_receipt_digests}:
        return Decision(False, "copied_receipt", "source receipt was copied from a prior consumed promotion")
    if bool(live.get("replay")):
        return Decision(False, "replay_or_reuse", "replayed promotion evidence is rejected")

    observed_checks = live.get("observedChecks") or []
    if not isinstance(observed_checks, list):
        return Decision(False, "missing_field", "observedChecks must be an array")
    seen_names: dict[str, str] = {}
    for row in observed_checks:
        if not isinstance(row, Mapping):
            return Decision(False, "synthetic_evidence", "observed check row is not an object")
        name = str(row.get("name") or "")
        producer_path = str(row.get("producer") or row.get("workflow") or "")
        if name in TRUSTED_CHECK_NAMES and producer_path in UNTRUSTED_WORKFLOW_FILES:
            return Decision(
                False,
                "untrusted_check_collision",
                f"untrusted producer {producer_path} published trusted check name {name}",
            )
        if name in TRUSTED_CHECK_NAMES and producer_path and producer_path not in TRUSTED_WORKFLOW_FILES:
            return Decision(False, "untrusted_check_collision", f"check-name collision from untrusted producer {producer_path}")
        if name and name in seen_names and seen_names[name] != producer_path:
            return Decision(False, "duplicate_check_name", f"duplicate check name {name} from multiple producers")
        if name in seen_names and name in TRUSTED_CHECK_NAMES:
            return Decision(False, "duplicate_check_name", f"duplicate trusted check name {name}")
        if name:
            seen_names[name] = producer_path

    transition_verdict = verify_transition_receipt(
        transition_receipt,
        source_receipt,
        {
            "repository": repository,
            "sourceBranch": target_branch,
            "headCommit": live_head,
            "gitTree": live_tree,
            "dependencyDigest": source_identity.get("dependencyDigest"),
            "profileDigest": source_identity.get("profileDigest"),
            "workflowDigest": source_identity.get("workflowDigest"),
        },
        expected_workflow_run_id=required_test.get("runId"),
        expected_workflow_run_attempt=required_test.get("runAttempt"),
        expected_base_commit=live_base,
    )
    if not transition_verdict.accepted:
        return Decision(False, transition_verdict.code, transition_verdict.message or transition_verdict.code)

    return Decision(
        True,
        "accepted",
        "trusted producer authorized the exact bound one-time promotion",
        source_commit=_sha(source_identity.get("headCommit")),
        promotion_commit=live_head,
        receipt_lookup_key=receipt_lookup_key(source_receipt),
    )


def authorize_promotion_files(
    *,
    receipt_path: str | Path,
    transition_path: str | Path,
    live_path: str | Path,
    consumed_ids_path: str | Path | None = None,
    consumed_receipts_path: str | Path | None = None,
) -> Decision:
    try:
        live = load_json(live_path)
        consumed_ids = load_json(consumed_ids_path) if consumed_ids_path is not None else []
        consumed_receipts = load_json(consumed_receipts_path) if consumed_receipts_path is not None else []
        if not isinstance(consumed_ids, list) or not isinstance(consumed_receipts, list):
            return Decision(False, "invalid_receipt", "consumed identity lists must be arrays")
        return evaluate_authoritative_promotion(
            live=live,
            source_receipt=load_json(receipt_path),
            transition_receipt=load_json(transition_path),
            consumed_ids=[str(item) for item in consumed_ids],
            consumed_receipt_digests=[str(item) for item in consumed_receipts],
        )
    except (ReceiptError, OSError, ValueError) as exc:
        code = getattr(exc, "code", "invalid_receipt")
        return Decision(False, str(code), str(exc))


def _print(value: Any) -> None:
    print(json.dumps(value, sort_keys=True, separators=(",", ":")))


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    verify = commands.add_parser("verify")
    verify.add_argument("--receipt", required=True, type=Path)
    verify.add_argument("--identity", type=Path)
    verify.add_argument("--repo", type=Path)
    verify.add_argument("--dependency", action="append", default=[])
    verify.add_argument("--profile", choices=("fast", "full", "release"), default="full")
    verify.add_argument("--profile-file", action="append", default=[])
    verify.add_argument("--workflow-file", action="append", default=[])
    verify.add_argument("--workflow-run-id", type=int)
    verify.add_argument("--workflow-run-attempt", type=int)
    verify.add_argument("--workflow-head-commit")
    verify.add_argument("--runner-label")
    verify.add_argument("--command-digest")
    verify.add_argument("--expected-workflow-digest")
    verify.add_argument("--transition-receipt", type=Path)
    verify.add_argument("--gate", required=True)

    authorize = commands.add_parser("authorize")
    authorize.add_argument("--receipt", required=True, type=Path)
    authorize.add_argument("--transition-receipt", required=True, type=Path)
    authorize.add_argument("--live-facts", required=True, type=Path)
    authorize.add_argument("--consumed-ids", type=Path)
    authorize.add_argument("--consumed-receipts", type=Path)

    assemble = commands.add_parser("write-live-facts")
    assemble.add_argument("--repository", required=True)
    assemble.add_argument("--transition", required=True)
    assemble.add_argument("--protected-base-commit", required=True)
    assemble.add_argument("--protected-base-tree", required=True)
    assemble.add_argument("--candidate-head-commit", required=True)
    assemble.add_argument("--candidate-head-tree", required=True)
    assemble.add_argument("--workflow-file", required=True)
    assemble.add_argument("--event-name", required=True)
    assemble.add_argument("--current-pr", default="")
    assemble.add_argument("--receipt", required=True, type=Path)
    assemble.add_argument("--transition-receipt", required=True, type=Path)
    assemble.add_argument("--source-pr-json", required=True, type=Path)
    assemble.add_argument("--run-json", required=True, type=Path)
    assemble.add_argument("--reviews-json", required=True, type=Path)
    assemble.add_argument("--checks-json", required=True, type=Path)
    assemble.add_argument("--merged-json", required=True, type=Path)
    assemble.add_argument("--output", required=True, type=Path)
    assemble.add_argument("--consumed-ids", required=True, type=Path)
    assemble.add_argument("--consumed-receipts", required=True, type=Path)

    development = commands.add_parser("development")
    development.add_argument("--input", required=True, type=Path)
    development.add_argument("--head-sha", required=True)

    approval = commands.add_parser("main-approval")
    approval.add_argument("--input", required=True, type=Path)
    approval.add_argument("--source-sha", required=True)
    approval.add_argument("--base-sha", required=True)
    approval.add_argument("--pr-head-sha", required=True)
    approval.add_argument("--receipt", type=Path)

    cancel = commands.add_parser("cancel-obsolete")
    cancel.add_argument("--repository", required=True)
    cancel.add_argument("--branch", required=True)
    cancel.add_argument("--live-sha", required=True)

    args = parser.parse_args(argv)
    try:
        if args.command == "verify":
            decision = verify_receipt_file(
                args.receipt, identity_path=args.identity, repo_path=args.repo,
                dependencies=args.dependency,
                profile=args.profile,
                required_gate=args.gate,
                profile_files=args.profile_file,
                workflow_files=args.workflow_file or None,
                workflow_run_id=args.workflow_run_id,
                workflow_run_attempt=args.workflow_run_attempt,
                workflow_head_commit=args.workflow_head_commit,
                runner_label=args.runner_label,
                expected_command_digest=args.command_digest,
                expected_workflow_digest=args.expected_workflow_digest,
                transition_receipt_path=args.transition_receipt,
            )
        elif args.command == "authorize":
            decision = authorize_promotion_files(
                receipt_path=args.receipt,
                transition_path=args.transition_receipt,
                live_path=args.live_facts,
                consumed_ids_path=args.consumed_ids,
                consumed_receipts_path=args.consumed_receipts,
            )
        elif args.command == "write-live-facts":
            facts = write_live_facts_from_workspace(
                repository=args.repository,
                transition=args.transition,
                protected_base_commit=args.protected_base_commit,
                protected_base_tree=args.protected_base_tree,
                candidate_head_commit=args.candidate_head_commit,
                candidate_head_tree=args.candidate_head_tree,
                workflow_file=args.workflow_file,
                event_name=args.event_name,
                current_pr=args.current_pr,
                receipt_path=args.receipt,
                transition_path=args.transition_receipt,
                source_pr_path=args.source_pr_json,
                run_path=args.run_json,
                reviews_path=args.reviews_json,
                checks_path=args.checks_json,
                merged_path=args.merged_path,
                output_path=args.output,
                consumed_ids_path=args.consumed_ids,
                consumed_receipts_path=args.consumed_receipts,
            )
            _print({"accepted": True, "code": "live_facts_written", "consumptionId": facts.get("consumptionId")})
            return 0
        elif args.command == "development":
            decision = evaluate_development_gates(load_json(args.input), args.head_sha)
        elif args.command == "main-approval":
            approval_payload = load_json(args.input)
            receipt_payload = load_json(args.receipt) if args.receipt else None
            decision = evaluate_main_approval(
                approval_payload, source_sha=args.source_sha, base_sha=args.base_sha,
                pr_head_sha=args.pr_head_sha, receipt=receipt_payload,
            )
        else:
            cancelled = cancel_obsolete(args.repository, args.branch, args.live_sha)
            _print({"accepted": True, "code": "cancel_requested", "cancelled": cancelled})
            return 0
    except (OSError, ValueError, RuntimeError, json.JSONDecodeError, ReceiptError) as exc:
        decision = Decision(False, getattr(exc, "code", "blocked"), str(exc))
    _print(decision.to_dict())
    return 0 if decision.accepted else 1


if __name__ == "__main__":
    raise SystemExit(main())

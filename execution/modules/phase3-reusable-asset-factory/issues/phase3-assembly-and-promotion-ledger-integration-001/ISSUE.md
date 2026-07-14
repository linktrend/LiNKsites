---
issue_id: "phase3-assembly-and-promotion-ledger-integration-001"
title: "Wire Site Assembly Manifest and Promotion Service into the Program Ledger via two real executors"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase3-reusable-asset-factory"
parent_phase: ""
depends_on:
  - "phase3-site-assembly-manifest-001"
  - "phase3-promotion-service-001"
  - "phase3-ledger-executor-integration-001"
objective: "Extend the Program Ledger <-> factory-catalog integration pattern established by SiteSpecificationExecutor to the two objects built in parallel this session: a SiteAssemblyExecutor connecting the Ledger to assembleSiteManifest(), and a PromotionExecutor connecting the Ledger to PromotionService.promote(). This gives GAP-04 (Promotion Service / Site Assembly Engine) a real, ledger-driven, end-to-end execution path -- not just standalone unit-tested functions."
scope:
  - "packages/factory-catalog/src/executors/siteAssemblyExecutor.ts: SiteAssemblyExecutor, SiteAssemblyExecutorDeps, SITE_ASSEMBLY_ISSUE_TYPE"
  - "packages/factory-catalog/src/executors/promotionExecutor.ts: PromotionExecutor, PromotionExecutorDeps, PROMOTE_WORKING_PACKAGE_ISSUE_TYPE"
out_of_scope:
  - "A real PayloadDraftTarget implementation backed by live Payload/Postgres -- still requires live infrastructure not available in this environment (GAP-50); tests use a controllable in-memory test double"
  - "Chaining these executors automatically (Site Specification -> Site Assembly -> Promotion as one pipeline) -- each remains an independently dispatchable Issue type for now; a real orchestration layer that creates the next Issue from the prior one's output is future work"
  - "Gate decision logic for either executor -- gate acceptance remains a distinct authority the executor cannot self-declare, consistent with the existing SiteSpecificationExecutor Issue's own scope note"
inputs:
  - "packages/factory-catalog/src/siteAssemblyManifest.ts (built in parallel this session by a subagent)"
  - "packages/factory-catalog/src/promotionService.ts (built in parallel this session by a subagent)"
  - "packages/factory-catalog/src/executors/siteSpecificationExecutor.ts (established pattern to follow)"
expected_outputs:
  - "Two new ExecutorAdapters, tested end-to-end through the Program Ledger"
acceptance_criteria:
  - "SiteAssemblyExecutor: a valid Issue resolves a manifest matching a direct assembleSiteManifest() call and reaches awaiting_gate; unregistered Site Specification, mismatched Adaptation, and malformed input each fail cleanly with invalid_input/failed_terminal"
  - "PromotionExecutor: a valid Issue succeeds when every item promotes and passes readback; a readback failure is classified transient_infrastructure (safe to retry, since Promotion Service is idempotent) rather than invalid_input or an unhandled throw; malformed input fails cleanly with invalid_input"
  - "PromotionExecutor's shared PromotionService instance correctly avoids re-promoting on a repeated invocation with the same idempotencyKey, proving the executor does not break the underlying service's own idempotency guarantee"
proof_requirements:
  - "Test run showing 8 new tests passing (4 + 4), 114/114 total in packages/factory-catalog; program-ledger's own 36 tests unaffected"
review_requirements:
  - "Independent reviewer confirms PromotionExecutor's failureClass choice (transient_infrastructure for a non-succeeded promotion, rather than invalid_input) is consistent with the manual's own framing of promotion as safely retryable"
integration_requirements:
  - "Merge via the existing consolidated branch/PR for this GAP-04 batch"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/executors/siteAssemblyExecutor.ts"
  - "packages/factory-catalog/src/executors/promotionExecutor.ts"
read_forbidden: []
blocking_questions: []
optional_fields:
  priority: "high"
  risk_level: "low -- additive; no live infrastructure dependency introduced"
---

# Issue

## Objective

See front matter.

## Scope / Out Of Scope / Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md`.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.

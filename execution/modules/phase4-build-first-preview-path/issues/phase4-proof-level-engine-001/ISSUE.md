---
issue_id: "phase4-proof-level-engine-001"
title: "Proof Level engine: Proof Specification schema + budget-check gate + escalation with preserved history"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase4-build-first-preview-path"
parent_phase: ""
depends_on: []
objective: "Model the manual's Proof Level dimension (manual §10, 'Preview Inventory and Build-First Sell-Later Production Model'; manual §09) as a real, versioned schema (Proof Specification), a budget-check gate returning a disposition (never a bare boolean, mirroring tierSpecification.ts's checkEntitlement() pattern), and a ProofBlock lifecycle (create + escalate) that preserves prior-level history rather than overwriting it, per manual §10.30."
scope:
  - "packages/factory-catalog/src/proofLevel.ts: ProofLevel, PrebuildProofLevel, ProofSpecification, ProofLevelError, assertProofSpecificationIsProductionReady(), InvestmentAuthorization, BudgetCheckDisposition, checkInvestmentAgainstBudget(), ProofBlock (with proofBlockId), createProofBlock(), escalateProofBlock()"
  - "packages/factory-catalog/src/index.ts: export the new module"
out_of_scope:
  - "Real numeric budgets/page-counts per level -- manual §10.48 explicitly leaves exact dollar budgets and per-level feature allowlists as open policy; all numeric values in this Issue's code/tests are structural PROVISIONAL placeholders, not commercial commitments"
  - "Per-level integration allowlists, Gate profiles, or Sales-handoff content requirements the manual also describes for each level -- only the level/specification/authority/escalation mechanics are built here"
  - "Real Sales-authority validation -- `authorityRef` is an opaque string reference only; no organizational authority-verification system exists to check against, this module validates budget arithmetic, not who actually granted the authority"
  - "Wiring this module into Site Specification's own `proof.level` field or into a real Preview Production Request object -- ProofBlock deliberately references a Site Specification only via an opaque `siteSpecId` string to stay decoupled, per this Issue's own interface contract"
inputs:
  - "docs/specs/linksites-program-manual/10_preview_inventory_and_build_first_sell_later_production_model.md"
  - "docs/specs/linksites-program-manual/09_execution_definition_of_done_and_agent_autonomy_boundaries.md"
  - "packages/factory-catalog/src/tierSpecification.ts (pattern mirrored: versioned lifecycle-status'd spec object + disposition-returning check function)"
expected_outputs:
  - "packages/factory-catalog/src/proofLevel.ts with a tested Proof Specification schema, budget-check gate, and ProofBlock create/escalate lifecycle"
acceptance_criteria:
  - "assertProofSpecificationIsProductionReady() throws ProofLevelError for any non-active specification and does not throw for an active one"
  - "checkInvestmentAgainstBudget() returns 'allowed' when the requested cost clears both the authorization's ceiling and the specification's ceiling; 'exceeds_authorized_budget' when it clears the specification's ceiling but not the authorization's; 'exceeds_specification_ceiling' when it clears the authorization's ceiling but not the specification's (tested with an authorization ceiling deliberately higher than the specification ceiling, so this path is distinct and reachable); and throws if the specification is not active"
  - "createProofBlock() returns a correctly-populated ProofBlock (including a generated proofBlockId and supersededBy: null) on the happy path; throws ProofLevelError when the budget check fails; throws ProofLevelError for a Level-0 specification, since Level 0 has no prebuild ProofBlock per manual §10.8"
  - "escalateProofBlock() returns { previous, next } where previous.supersededBy equals next.proofBlockId and next.level is the new higher level; throws ProofLevelError when escalating to the same or a lower level; throws ProofLevelError when the new investment fails its own budget check, by delegating to createProofBlock() rather than duplicating validation"
proof_requirements:
  - "Test run showing all 13 new tests passing, plus the 147 prior factory-catalog tests unaffected (160 total)"
review_requirements:
  - "Independent reviewer confirms the provisional numeric values (maxAuthorizedInvestmentUsd, maximumCostUsd in tests) are clearly marked as structural placeholders, not real commercial commitments, and that proof level is never conflated with paid tier in the doc comments or code"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/tierSpecification.ts"
  - "packages/factory-catalog/src/proofLevel.ts"
read_forbidden:
  - "unrelated modules"
blocking_questions:
  - "Real per-level dollar budgets, page counts, and feature allowlists remain Carlos's/Sales's decision -- not blocking this Issue (which only builds the mechanism), but blocking any real commercial use of it."
optional_fields:
  priority: "high"
  risk_level: "low -- new, additive, isolated module; no existing file's exported behavior is changed"
---

# Issue

## Objective

See front matter.

## Scope / Out Of Scope / Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Dependency Notes

No dependencies -- this Issue is buildable independently of the rest of Phase 4's module scope (Foundation Matching, Preview Inventory tracking, conversion-lock). It does not modify `foundationMatching.ts`, `pipelineChaining.ts`, or this module's `MODULE.md`.

## Why This Models the Manual's Proof Level, Not Paid Tier

The manual is explicit (manual §10) that proof level and paid tier are two SEPARATE dimensions: a Level 1 preview can demonstrate Premium-tier value without prebuilding full Premium entitlement. This Issue's `ProofSpecification` and `ProofBlock` objects are deliberately independent of `tierSpecification.ts`'s `TierSpecification`/`TierId` -- nothing in this file imports from or couples to the tier module, matching the manual's insistence that the two dimensions never collapse into one.

## Interface Gap Filled

The originating task's exact interface contract for `ProofBlock` specified a `supersededBy: string | null` field but did not specify what stable identity field a prior block's `supersededBy` should reference. This Issue adds `proofBlockId: string` to `ProofBlock`, generated via `crypto.randomUUID()` in `createProofBlock()` (matching the existing `crypto.randomUUID()` pattern already used in `promotionService.ts`), and has `escalateProofBlock()` set the prior block's `supersededBy` to the new block's own `proofBlockId`.

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md` in this directory.

## Blocking Questions

See front matter -- non-blocking for this Issue's own scope.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.

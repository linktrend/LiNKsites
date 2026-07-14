---
issue_id: "phase3-promotion-service-001"
title: "Promotion Service (Supabase working layer -> Payload draft) with idempotency/checksum-conflict detection and readback verification"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase3-reusable-asset-factory"
parent_phase: ""
depends_on: []
objective: "Implement the Promotion Service (manual §12) as the only trusted path by which approved working content becomes a Payload draft, enforcing the manual's specific, real invariants: draft-only scope (no publish path), idempotency with checksum-conflict detection (§12.23), readback verification before an item may be marked succeeded (§12.21 step 10 / §12.51 item 11), and a per-item + per-package result ledger (§12.22)."
scope:
  - "packages/factory-catalog/src/promotionService.ts: PromotionRequest/WorkingPackage/WorkingPackageItem types, PromotionReceipt/PromotionItemResult types, PayloadDraftTarget interface, PromotionService class"
  - "packages/factory-catalog/src/index.ts: export the new module"
out_of_scope:
  - "A real Payload-backed PayloadDraftTarget implementation -- this is an interface only, consumed by the service; a real implementation needs a live Payload instance/Local API connection not available in this environment (GAP-50)"
  - "Validating requiredGateReceiptIds against a real Gate-receipt registry -- none exists yet; this service only records the asserted IDs on the receipt for audit"
  - "Publication (draft -> published) -- explicitly out of scope per the manual's own boundary; this module only ever writes drafts"
  - "Persistence of the idempotency-key -> receipt map across process restarts -- this is an in-memory map only, matching the pattern already used for FoundationReservationManager before any Postgres-backed store existed"
inputs:
  - "docs/specs/linksites-program-manual (Section 12, Supabase Working Layer / Payload Draft-Published Layers / Content Promotion doctrine, extracted this session)"
  - "packages/factory-catalog/src/reusableFoundation.ts, prospectAdaptation.ts (prior Issues, for state-machine and doc-comment style conventions)"
expected_outputs:
  - "promotionService.ts with a tested PromotionService class implementing draft-only promotion, idempotency+checksum-conflict detection, readback verification, and a correctly-derived per-item/overall result ledger"
acceptance_criteria:
  - "All items succeed and pass readback -> receipt status 'succeeded', correct itemResults, non-null draftReleaseId"
  - "One item's upsertDraft throws -> that item is 'failed' with a failureReason, other items still 'succeeded', overall status 'partial'"
  - "upsertDraft succeeds but readback returns null for that item -> that item is 'failed' (not 'succeeded') despite the write itself succeeding, and overall status reflects the failure"
  - "Every item fails -> overall status 'failed', draftReleaseId is null"
  - "Calling promote() twice with the identical idempotencyKey and identical packageChecksum returns the same receipt content the second time, and upsertDraft is not called again"
  - "Calling promote() twice with the identical idempotencyKey but a different packageChecksum throws PromotionServiceError on the second call"
  - "Empty items array -> status 'succeeded', empty itemResults"
proof_requirements:
  - "Test run showing all new promotionService tests passing, plus all prior factory-catalog tests unaffected"
review_requirements:
  - "Independent reviewer confirms the readback-failure test would actually catch a naive 'write succeeded = done' regression (i.e. it fails against an implementation that skips readback), not just pass trivially"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/promotionService.ts"
read_forbidden:
  - "unrelated modules"
blocking_questions: []
optional_fields:
  priority: "high"
  risk_level: "low -- additive, in-memory only, no persistence claims made, no real Payload/Supabase connection attempted"
---

# Issue

## Objective

See front matter.

## Scope / Out Of Scope / Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Dependency Notes

No dependencies on other Issues -- this module only depends on `@linksites/types`'s `SchemaVersion`, which already exists.

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md` in this directory.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.

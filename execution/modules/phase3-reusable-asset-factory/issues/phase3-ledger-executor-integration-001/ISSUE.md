---
issue_id: "phase3-ledger-executor-integration-001"
title: "Connect the Program Ledger to real LiNKsites factory work: SiteSpecificationExecutor"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase3-reusable-asset-factory"
parent_phase: ""
depends_on:
  - "phase2-executor-registry-001"
  - "phase3-site-specification-001"
objective: "Close the gap explicitly recorded in audit/14_implementation_roadmap.md's Phase 2 status -- 'the ledger core is proven correct in isolation; it has not yet been connected to anything that does real work' -- by building a real ExecutorAdapter that, when dispatched through the Program Ledger, actually calls resolveSiteSpecification() against real Phase 3 catalog data and returns its result as the Run's output. This is the first connection between Phase 2 (Program Ledger) and Phase 3 (reusable-asset factory)."
scope:
  - "packages/factory-catalog/src/executors/siteSpecificationExecutor.ts: SiteSpecificationExecutor, SiteSpecificationExecutorDeps, SITE_SPECIFICATION_ISSUE_TYPE"
  - "packages/factory-catalog now depends on @linksites/program-ledger (the ExecutorAdapter contract)"
out_of_scope:
  - "Real persistence-backed lookups for Kit/Tier/Foundation/Design Profile/Component Registry -- this executor's injected deps are in-memory, standing in for what would be Supabase-backed lookups once live infrastructure exists (GAP-50)"
  - "Gate decision logic -- per the Executor Registry Issue's own scope, gate acceptance remains a distinct authority the executor cannot self-declare; ledger.decideGate() is still a separate, explicit call"
  - "A real worker runtime/scheduler that polls for ready Issues -- runIssueOnce() remains a deterministic test/synthetic-workflow driver, not a production scheduler"
inputs:
  - "packages/program-ledger/src/executor.ts (ExecutorAdapter contract, prior Issue)"
  - "packages/factory-catalog/src/siteSpecification.ts (resolveSiteSpecification(), prior Issue)"
expected_outputs:
  - "siteSpecificationExecutor.ts with a tested end-to-end ledger integration"
acceptance_criteria:
  - "A valid Site Specification Issue, driven through runIssueOnce(), succeeds and the Run's output matches what resolveSiteSpecification() would produce directly; the Issue reaches awaiting_gate"
  - "An Issue referencing an unregistered Foundation, Kit, or Tier fails the Run with failureClass invalid_input (and therefore failed_terminal per the ledger's own retry policy for that failure class), without throwing an unhandled error"
  - "An Issue with a Kit/tier/Foundation combination that resolveSiteSpecification() itself would reject fails the same way, proving the executor delegates to the existing validation rather than re-implementing it"
  - "An Issue with missing/malformed input fields fails cleanly with invalid_input rather than crashing the driver"
  - "The resulting Ledger event trail includes issue.created, run.dispatched, run.claimed, and run.succeeded for the happy path (manual §98.4's traceability requirement)"
proof_requirements:
  - "Test run showing 5 new tests passing, 90/90 total in packages/factory-catalog; program-ledger's own 36 tests unaffected"
review_requirements:
  - "Independent reviewer confirms Issue.input only carries serializable business identifiers, never live object references, consistent with the ledger's own idempotency-digest contract"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/factory-catalog/src/executors/siteSpecificationExecutor.ts"
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

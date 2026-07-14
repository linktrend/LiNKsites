---
proof_id: "proof-phase3-ledger-executor-integration-001"
subject_type: "issue"
subject_id: "phase3-ledger-executor-integration-001"
status: "draft"
criteria_evidence:
  - criterion: "A valid Site Specification Issue succeeds end to end and reaches awaiting_gate"
    evidence: "tests/siteSpecificationExecutor.spec.ts, first test in the describe block -- passing"
  - criterion: "Unregistered Foundation/Kit/Tier fails cleanly with invalid_input / failed_terminal"
    evidence: "tests/siteSpecificationExecutor.spec.ts, 'fails ... when the requested Foundation does not exist' test -- passing"
  - criterion: "A resolveSiteSpecification()-rejected combination fails the same way, proving delegation not duplication"
    evidence: "tests/siteSpecificationExecutor.spec.ts, 'fails ... when a mismatched Foundation/Kit combination is requested' test -- passing"
  - criterion: "Malformed input fails cleanly without crashing the driver"
    evidence: "tests/siteSpecificationExecutor.spec.ts, 'fails ... when Issue input is missing required fields' test -- passing"
  - criterion: "Full event trail present for the happy path"
    evidence: "tests/siteSpecificationExecutor.spec.ts, 'produces a real event trail' test -- passing"
artifacts:
  - "packages/factory-catalog/src/executors/siteSpecificationExecutor.ts"
  - "packages/factory-catalog/tests/siteSpecificationExecutor.spec.ts"
  - "packages/factory-catalog/package.json (new @linksites/program-ledger dependency)"
verification_summary:
  - "packages/factory-catalog test run: 90/90 passing (85 prior + 5 new)"
  - "packages/program-ledger test run: 36/36 passing, unaffected by this change"
  - "Workspace-wide typecheck (6 packages): clean"
optional_fields:
  commands_run:
    - "pnpm install (to record the new workspace dependency in pnpm-lock.yaml)"
    - "pnpm exec vitest run (packages/factory-catalog)"
    - "pnpm --filter @linksites/program-ledger run test"
    - "pnpm run typecheck (workspace-wide)"
  open_gaps:
    - "Executor dependencies (Kit/Tier/Foundation/Design Profile/Component Registry lookups) are in-memory only -- a real, persistence-backed version is future work once live Postgres/Supabase infrastructure is verified (GAP-50)."
    - "No real worker runtime/scheduler exists to actually poll and dispatch Issues in production; runIssueOnce() remains a deterministic driver for tests and synthetic workflows."
  notes:
    - "This closes the specific gap named in audit/14_implementation_roadmap.md's Phase 2 status update: a real executor now actually calls the ledger to do real LiNKsites work, not just a synthetic echo. It is also the first Issue in this session connecting Phase 2 and Phase 3 code together."
---

# Proof

## Subject

`phase3-ledger-executor-integration-001` -- Program Ledger to factory-catalog integration via a real executor.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`.

## Gate Guidance

Non-vacuous: the happy-path test compares the Run's actual output against the direct resolveSiteSpecification() result, and negative-path tests cover distinct failure origins (missing Foundation, invalid Kit/Foundation match, malformed input) rather than one generic failure case.

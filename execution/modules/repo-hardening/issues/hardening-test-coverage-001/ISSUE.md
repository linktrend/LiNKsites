---
issue_id: "hardening-test-coverage-001"
title: "Measure and improve test coverage of packages/factory-catalog and packages/program-ledger; fix one real bug found in the process"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "repo-hardening"
parent_phase: ""
depends_on: []
objective: "Install @vitest/coverage-v8 in both packages, measure real statement/branch coverage (not just test-count growth), and close the specific gaps found -- both to raise confidence in this session's own work and because the process itself found one genuine, previously-undetected bug in PostgresLedgerStore."
scope:
  - "packages/factory-catalog: 12 new tests closing coverage gaps in tierSpecification.ts, promotionService.ts, previewDeployment.ts, reusableFoundation.ts, and 3 executors"
  - "packages/program-ledger: heartbeat() was entirely untested -- added to the shared ledgerContract.shared.ts suite (runs against both in-memory and pglite-backed stores) plus 2 Postgres-specific malformed-ID tests"
  - "packages/program-ledger/src/postgresStore.ts: fixed a real bug -- getIssue()/getRun()/getGateResult() previously let a raw Postgres 'invalid input syntax for type uuid' error (SQLSTATE 22P02) propagate for a malformed/non-UUID id, instead of returning the clean `null` every other not-found case produces"
  - "Both packages' package.json: added a test:coverage script for future use"
out_of_scope:
  - "Chasing 100% coverage on every remaining branch -- the residual gaps (executors' generic re-throw-on-unexpected-error paths, non-Error-thrown edge cases) were judged low-value relative to effort and are left as documented residual gaps, not silently ignored"
  - "Fixing the same malformed-ID class of issue in list-returning methods (listRunsForIssue, listEvents, listExpiredLeaseRuns) -- these return arrays, where the current throw-on-malformed-input behavior is a less clear-cut bug (arguably reasonable to reject a malformed filter outright); deferred as a smaller, separate follow-up if it matters in practice"
inputs:
  - "@vitest/coverage-v8@3.2.6 (matching this repo's existing vitest@3.2.6)"
expected_outputs:
  - "Coverage reports for both packages, with the found postgresStore.ts bug fixed"
acceptance_criteria:
  - "packages/factory-catalog: statement coverage >= 97%, branch coverage >= 95%"
  - "packages/program-ledger: statement coverage >= 93%, branch coverage >= 84%"
  - "heartbeat() has real test coverage (previously zero) across both LedgerStore implementations"
  - "The postgresStore.ts malformed-ID bug is fixed and covered by a dedicated regression test, plus a companion test proving the fix does not change the correct-not-found behavior for a well-formed-but-unknown UUID"
proof_requirements:
  - "Coverage report output (before/after) for both packages; full test suite green"
review_requirements:
  - "Independent reviewer confirms the postgresStore.ts fix is scoped to the specific SQLSTATE for malformed input, not a broad try/catch that could silently swallow other real errors"
integration_requirements:
  - "Merge via the existing consolidated branch/PR for this batch"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/program-ledger/src/postgresStore.ts (queryOneOrNull helper and its doc comment)"
  - "packages/program-ledger/tests/ledgerContract.shared.ts (heartbeat describe block)"
read_forbidden: []
blocking_questions: []
optional_fields:
  priority: "high"
  risk_level: "low for the coverage-only additions; the postgresStore.ts fix is scoped to one specific, well-understood SQLSTATE code and covered by 2 new dedicated tests plus the full existing 44-test suite"
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

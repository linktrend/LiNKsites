---
proof_id: "proof-hardening-test-coverage-001"
subject_type: "issue"
subject_id: "hardening-test-coverage-001"
status: "draft"
criteria_evidence:
  - criterion: "factory-catalog coverage >= 97% stmts / >= 95% branch"
    evidence: "Coverage report: 97.77% statements, 95.17% branches, 98.86% functions, 230/230 tests passing (up from 219/219 at 95.55%/92.33% before this Issue)"
  - criterion: "program-ledger coverage >= 93% stmts / >= 84% branch"
    evidence: "Coverage report: 93.57% statements, 84.81% branches, 94.73% functions, 44/44 tests passing (up from 36/36 at 92.22%/82.87% before this Issue)"
  - criterion: "heartbeat() has real coverage across both store implementations"
    evidence: "3 new tests added to tests/ledgerContract.shared.ts's new 'heartbeat (lease extension / crash-liveness signal)' describe block, run against both InMemoryLedgerStore (via exit-gate.spec.ts) and PostgresLedgerStore/pglite (via postgres-store.spec.ts)"
  - criterion: "postgresStore.ts malformed-ID bug fixed and regression-tested"
    evidence: "tests/postgres-store.spec.ts's 'PostgresLedgerStore: malformed-ID robustness' describe block, 2 tests -- one proving the fix (malformed id -> null, not a crash), one proving the fix does not change correct not-found behavior for a well-formed-but-unknown UUID"
artifacts:
  - "packages/factory-catalog/tests/{tierSpecification,promotionService,previewDeployment,reusableFoundation,promotionExecutor,siteAssemblyExecutor,siteSpecificationExecutor}.spec.ts"
  - "packages/program-ledger/src/postgresStore.ts (queryOneOrNull fix)"
  - "packages/program-ledger/tests/ledgerContract.shared.ts (heartbeat describe block)"
  - "packages/program-ledger/tests/postgres-store.spec.ts (malformed-ID describe block)"
  - "Both packages' package.json (test:coverage script, @vitest/coverage-v8 devDependency)"
verification_summary:
  - "packages/factory-catalog: 230/230 tests passing, 97.77% stmt / 95.17% branch coverage"
  - "packages/program-ledger: 44/44 tests passing, 93.57% stmt / 84.81% branch coverage"
  - "Full workspace verification (typecheck, CMS tests, both builds, lint) unaffected and green"
optional_fields:
  commands_run:
    - "pnpm add -D @vitest/coverage-v8@3.2.6 (both packages)"
    - "pnpm exec vitest run --coverage (both packages, before and after each round of new tests)"
    - "pnpm run typecheck (workspace-wide)"
  open_gaps:
    - "Residual factory-catalog gaps: 3 executors' generic 'unexpected error, re-throw' paths (lines ~91-92/116-117/130-131 in each) and 2 non-Error-thrown edge cases in promotionService.ts -- judged low-value relative to effort (would require injecting synthetic non-validation errors or throwing non-Error values, unusual in real usage) and left undone, not hidden."
    - "Residual program-ledger gaps: ledger.ts lines ~236-237/465-466, postgresStore.ts lines ~281-283/303-305 (idempotency-record edge paths), store.ts lines 81-82/100-101 -- not individually chased down in this pass; index.ts's 0% is just re-export lines, not a real gap."
    - "The same malformed-ID class of issue was NOT fixed in list-returning methods (listRunsForIssue, listEvents, listExpiredLeaseRuns) -- deferred, see ISSUE.md out_of_scope."
  notes:
    - "The postgresStore.ts fix is a genuine bug this hardening pass discovered, not merely a coverage-number exercise -- the new heartbeat() test for an unknown Run initially FAILED against a raw Postgres driver error before the fix, proving the test was real and the fix necessary, not decorative."
---

# Proof

## Subject

`hardening-test-coverage-001` -- test coverage measurement, gap-filling, and one real bug fix.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`.

## Gate Guidance

Non-vacuous: the postgresStore.ts fix is proven by a test that failed BEFORE the fix (documented in this session's own transcript) and passes after -- not a test written to match already-correct behavior.

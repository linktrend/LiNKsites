---
proof_id: "proof-phase2-ledger-review-bugfix-001"
subject_type: "issue"
subject_id: "phase2-ledger-review-bugfix-001"
status: "draft"
criteria_evidence:
  - criterion: "All existing exit-gate tests (in-memory + pglite-backed Postgres) continue to pass"
    evidence: "packages/program-ledger test run: 22/22 tests passing (11 scenarios x 2 store backends), up from 18/18 before this Issue (2 new tests added for the 2 bugs found)"
  - criterion: "Any newly-found bug has a test that fails before the fix and passes after"
    evidence: "Bug 1 (unbounded Gate-rejection retries): new test 'bounds Gate-rejection-triggered retries by maxAttempts too' added to tests/ledgerContract.shared.ts; confirmed failing before the retryIssue() fix (would retry indefinitely), passing after. Bug 2 (zombie write after reclaim, before re-claim): reproduced with a standalone debug test showing ledger.complete() succeeding with a stale token after reclaimExpiredLeases() but before any re-claim (output: 'BUG CONFIRMED: succeeded { result: ZOMBIE WROTE THIS }'); new test 'rejects a zombie write in the window between reclaim and the NEXT claim' added and passing after the reclaimExpiredLeases() fix."
  - criterion: "No regression in lint/typecheck/build for the rest of the workspace"
    evidence: "Full workspace verification run after the fixes: lint (cms, web-master) pass; typecheck (all 5 packages: cms, web-master, web-company, program-ledger, types) pass; apps/cms test:int 18/19 passing (1 correctly skipped); apps/web-master and apps/web-company next build both succeed."
artifacts:
  - "packages/program-ledger/src/ledger.ts (dispatch() ordering fix from an earlier Issue; retryIssue() maxAttempts fix; reclaimExpiredLeases() fencing-token fix, all in this Issue)"
  - "packages/program-ledger/tests/ledgerContract.shared.ts (2 new tests)"
  - "packages/program-ledger/src/types.ts (added 'issue.retry_budget_exhausted' event type)"
verification_summary:
  - "Bug 1 confirmed and fixed: retryIssue() previously enforced no maxAttempts check when the retry was triggered by a Gate rejection (decideGate() 'rejected' path) -- only fail()'s Run-failure retry path checked it. A repeatedly-rejected Issue could retry forever, contradicting the manual's bounded-retry doctrine (Section 20). Fixed by checking issue.attemptCount >= issue.retryPolicy.maxAttempts uniformly inside retryIssue(), regardless of which path made the Issue retry-eligible."
  - "Bug 2 confirmed and fixed (more serious): reclaimExpiredLeases() previously left a reclaimed Run's lease fencing token unchanged until the NEXT successful claim() bumped it. This left a real window -- between reclaim and the next claim -- during which the crashed worker's stale-but-still-current token would pass assertFencingToken() and let it successfully call complete()/heartbeat()/fail(), corrupting a Run that had already been given up on. Fixed by bumping the fencing token IMMEDIATELY on reclaim, closing the window entirely."
  - "Both bugs were found by manual, skeptical re-reading of the code -- not by any automated tool -- confirming the value of an independent review pass distinct from the original execution, per Canonical Law 12."
optional_fields:
  commands_run:
    - "pnpm exec vitest run (packages/program-ledger, before and after each fix)"
    - "pnpm exec tsc -p tsconfig.json (packages/program-ledger)"
    - "pnpm exec turbo run lint --filter=@linksites/cms --filter=@linksites/web-master"
    - "pnpm run typecheck (workspace-wide)"
    - "pnpm --filter @linksites/cms run test:int"
    - "pnpm --filter @linksites/web-master run build"
    - "pnpm --filter @linksites/web-company run build"
  open_gaps:
    - "This was a manual code-review pass, not an exhaustive formal verification -- further bugs may still exist, particularly around concurrent access patterns that unit tests with sequential await calls don't fully exercise (e.g. true concurrent dispatch() races). Flagged, not claimed solved."
    - "GAP-50 (live Postgres/Supabase verification) remains open and unaffected by this Issue."
  notes:
    - "This Issue and its Proof were produced using the LiNKdeveloper execution doctrine (.cursor/execution/, wired via the repo/.cursor symlink to IDE Development), per Carlos's explicit instruction to use that system rather than ad hoc process."
---

# Proof

## Subject

`phase2-ledger-review-bugfix-001` -- an independent review pass over the Program Ledger core (packages/program-ledger) that found and fixed two concurrency-safety bugs.

## Criteria To Evidence Map

See front matter `criteria_evidence`.

## Artifacts

See front matter `artifacts`.

## Verification Summary

See front matter `verification_summary`.

## Failures Or Gaps

See front matter `open_gaps`. Neither gap blocks this Issue's own acceptance criteria; both are logged as follow-up scope for future Issues.

## Gate Guidance

This proof is non-vacuous: each claimed fix is backed by a specific test that demonstrably failed before the fix (one shown via direct reproduction output, one via the new bounded-test-suite assertion) and passes after.

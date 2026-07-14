---
proof_id: "proof-phase2-executor-registry-001"
subject_type: "issue"
subject_id: "phase2-executor-registry-001"
status: "draft"
criteria_evidence:
  - criterion: "A synthetic Issue is created, dispatched, claimed, executed, and completed via runIssueOnce(), then reaches `completed` only after an explicit, separate Gate decision"
    evidence: "tests/executor.spec.ts: 'runs a real Issue from creation through Gate acceptance using a registered executor' -- asserts Issue state is `awaiting_gate` (not `completed`) immediately after runIssueOnce(), and only becomes `completed` after a separate decideGate() call. Passing."
  - criterion: "A synthetic always-failing executor drives an Issue to failed_terminal/failed correctly"
    evidence: "tests/executor.spec.ts: 'runs a failing synthetic executor through to a terminal failure end to end' -- passing"
  - criterion: "Requesting execution for an issueType with no registered executor throws a clear, typed error"
    evidence: "tests/executor.spec.ts: 'throws NoExecutorAvailableError when no registered executor can handle the Issue type' -- passing"
artifacts:
  - "packages/program-ledger/src/executor.ts"
  - "packages/program-ledger/tests/executor.spec.ts"
  - "packages/program-ledger/src/ledger.ts (added public getIssue()/getRun())"
verification_summary:
  - "packages/program-ledger full test run: 36/36 tests passing (11 hierarchy + 11 in-memory exit-gate + 3 executor + 11 pglite-backed Postgres exit-gate)"
  - "packages/program-ledger typecheck: clean"
  - "Workspace-wide lint and typecheck: clean"
optional_fields:
  commands_run:
    - "pnpm exec vitest run (packages/program-ledger)"
    - "pnpm exec tsc -p tsconfig.json (packages/program-ledger)"
  open_gaps:
    - "Only synthetic executors exist. No real executor connecting to apps/cms, Supabase, or an AI model has been built or tested -- that requires live infrastructure this session doesn't have, and is the natural next Issue once available."
  notes:
    - "runIssueOnce() is intentionally synchronous/single-shot -- a production scheduler (polling, event-driven, or queue-based) is separate future scope."
---

# Proof

## Subject

`phase2-executor-registry-001` -- Executor Registry and synthetic end-to-end proof.

## Criteria To Evidence Map / Artifacts / Verification Summary

See front matter.

## Failures Or Gaps

See front matter `open_gaps`.

## Gate Guidance

Non-vacuous: every criterion maps to a specific named, passing test that exercises the real ledger, not a mock of it.

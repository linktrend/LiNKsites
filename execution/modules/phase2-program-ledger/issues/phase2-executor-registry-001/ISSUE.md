---
issue_id: "phase2-executor-registry-001"
title: "Executor Registry + synthetic executor proving one full end-to-end Issue lifecycle"
status: "review_ready"
parent_program: "linksites-manual-alignment"
parent_module: "phase2-program-ledger"
parent_phase: ""
depends_on:
  - "phase2-ledger-core (PR #47)"
  - "phase2-program-hierarchy-001"
objective: "Build a minimal Executor Registry and a deterministic runIssueOnce() driver, and prove with a synthetic executor that a real Issue can be driven end to end (dispatch -> claim -> execute -> complete -> Gate decision -> done) -- the concrete form of manual §62's 'a synthetic workflow' exit-gate language."
scope:
  - "packages/program-ledger/src/executor.ts: ExecutorAdapter interface, ExecutorRegistry, runIssueOnce() driver"
  - "SyntheticEchoExecutor and SyntheticAlwaysFailExecutor for testing success and failure paths"
  - "ProgramLedger.getIssue()/getRun() public accessors (needed by the driver, previously internal-only)"
out_of_scope:
  - "The full 8-level model-routing ladder (manual §20 §46) -- this is a single-adapter lookup, not routing/fallback logic"
  - "Executor security envelopes (manual §18.70-73) -- not modeled yet"
  - "Any real (non-synthetic) executor calling out to apps/cms, Supabase, or an AI model -- that requires live infrastructure and is a separate future Issue"
inputs:
  - "packages/program-ledger/src/ledger.ts, hierarchy.ts (this session's prior Issues)"
expected_outputs:
  - "executor.ts with the registry, driver, and 2 synthetic executors"
  - "An end-to-end test proving success and failure paths both work through the real ledger"
acceptance_criteria:
  - "A synthetic Issue is created, dispatched, claimed, executed, and completed via runIssueOnce(), then reaches `completed` only after an explicit, separate Gate decision"
  - "A synthetic always-failing executor drives an Issue to `failed_terminal`/`failed` correctly"
  - "Requesting execution for an issueType with no registered executor throws a clear, typed error rather than hanging or silently no-op-ing"
proof_requirements:
  - "Test run showing the full lifecycle assertions passing"
review_requirements:
  - "Independent reviewer confirms the driver does not let the executor self-declare Gate acceptance (manual §20 §32 authority separation)"
integration_requirements:
  - "Merge via the existing draft-PR stack once reviewed"
suggested_role_types:
  - "backend-developer"
read_first:
  - "packages/program-ledger/src/executor.ts"
  - "packages/program-ledger/tests/executor.spec.ts"
read_forbidden:
  - "unrelated modules"
blocking_questions: []
optional_fields:
  priority: "high"
  risk_level: "low -- new, additive, isolated module; no existing code path depends on it yet"
  notes:
    - "This is the first proof that ANY executor pattern can drive this ledger end to end, not just individual method calls in isolation -- a meaningfully stronger form of evidence than the exit-gate suite alone provided."
---

# Issue

## Objective

See front matter.

## Scope

### Allowed

- Executor registry, driver, and synthetic executors only.

### Out Of Scope

- See front matter.

## Inputs / Expected Outputs / Acceptance Criteria

See front matter.

## Dependency Notes

Depends on the Program Ledger core and (for one of its two tests) the Program/Module hierarchy Issue.

## Proof Requirements / Review Requirements / Integration Requirements

See front matter and `PROOF.md` in this directory.

## Blocking Questions

None.

## State Semantics

`review_ready`.

## Progressive Disclosure

Read next: `PROOF.md` in this same directory.

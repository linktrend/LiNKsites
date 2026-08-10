# W1-03 — Continuous Intake and Orchestrator Foundation

**Status:** Planned — pending approval and W1-01 contract freeze
**Wave:** 1
**Executor:** one Codex Luna High implementation agent
**Safe lane:** new runtime/orchestrator application

## Outcome

Create the continuously running application shell that pulls work, validates and atomically claims it, creates a Program run, schedules dependency-ready Issues, survives restart, and reports completion through ports. Wave 1 proves the engine with fakes; Wave 2 connects real website executors.

## Owned paths

- a dedicated orchestrator/runtime application under `apps/`
- its unit/integration tests and fixtures
- minimal workspace configuration required to build it

Do not implement real CMS, CRM, LiNKautowork, content, or deployment side effects.

## Required ports

Define narrow interfaces consuming W1-01 contracts:

- `WorkIntakePort`: pull ready items and acknowledge claim state.
- `CompletionSink`: write completion or safe failure outcome.
- `ProgramLedgerPort`: create graph, claim Issue, append Run/evidence/gate results, query readiness.
- `ExecutorRegistry`: resolve an approved executor implementation by Issue kind/version.
- `Clock`, `IdGenerator`, and `BackoffPolicy`: injected for deterministic tests.
- `HealthReporter`: readiness/liveness and stalled-work summary without secrets.

## Required implementation

1. Build a long-running loop with configurable poll interval, bounded batch size, graceful shutdown, and backpressure.
2. Validate every pulled envelope before claim or side effects.
3. Use stable lead ID plus idempotency key to prevent duplicate Program creation.
4. Delegate atomic ownership to the durable ledger/claim boundary; do not rely on in-memory locks.
5. Schedule all dependency-ready Issues with a configured concurrency ceiling. Never run a blocked Issue.
6. Convert executor outputs into structured evidence and evaluate the associated gate before unlocking dependents.
7. Distinguish validation, retryable dependency/service, executor, gate, terminal business, and unknown failures.
8. Apply bounded exponential backoff with jitter and a dead-letter/manual-attention state after configured limits.
9. On restart, query durable state and resume safely without replaying completed side effects.
10. Emit one final completion record only after the Program gate passes; failures emit a safe structured status and diagnostic evidence reference.
11. Provide a manual/file-backed intake and completion adapter for local tests using the canonical envelopes. It is a port adapter, not a separate workflow.
12. Add liveness/readiness behavior. Readiness must be false when mandatory durable dependencies are unavailable.

## Required tests

- invalid input rejected without claim
- no work is a normal idle result
- duplicate pull/restart creates one Program
- two ready independent Issues run in parallel within the limit
- dependency-blocked Issue never runs
- retryable failure backs off and succeeds
- terminal failure does not loop forever
- shutdown stops new claims and lets bounded in-flight work settle
- restart resumes a claimed/expired Issue safely
- completion is emitted exactly once and only after Program PASS
- logs and completion payloads contain no supplied secret values

## Acceptance gates

- The runtime can run for repeated polling cycles using fakes/manual fixtures.
- Its orchestration decisions are derived from ledger dependencies/gates, not a hard-coded linear script.
- All time, IDs, ports, and retry behavior are deterministic under test.
- No code imports raw n8n, Payload, Supabase client, or CRM implementation directly into orchestration domain logic.
- Root build/typecheck and runtime tests pass.

## Evidence and handoff

Supply an architecture note showing ports/adapters, sample lifecycle trace, failure matrix, concurrency/restart test proof, exact SHA, and the executor-registration contract W2-02 must consume.


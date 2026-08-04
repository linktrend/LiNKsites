# LiNKsites intake orchestrator (W1-03)

This package is the Wave 1 continuous pull/claim/completion foundation. It
continuously polls a `WorkIntakePort`, validates the W1-01
`LeadResearchPackage`, claims through the source adapter, creates or resumes a
program through `ProgramLedgerPort`, schedules only ledger-reported
dependency-ready Issues, and writes a completion envelope only after the
ledger reports the Program gate as passed.

## Boundaries

The runtime contains no CRM, Payload, Supabase, LiNKautowork, deployment, or
content implementation. Those systems are future adapters. The durable ledger
port owns atomic Issue claims, leases/recovery, idempotent Program graph
creation, Run/evidence/gate records, retry/dead-letter state, and completion
reservation. The orchestrator does not use process-local locks as an ownership
authority; its local execution map only enforces the worker's concurrency and
backpressure ceiling.

`FileWorkIntakePort` and `FileCompletionSink` are local manual-test adapters.
The input is newline-delimited canonical JSON; claim state is stored in a safe
sidecar and completion envelopes are appended as newline-delimited JSON.

## Lifecycle trace

```text
pull -> validate LeadResearchPackage -> atomic source claim
  -> createOrResumeProgram (idempotent stable lead + key)
  -> query ledger dependency-ready Issues
  -> atomic Issue claim -> resolve (kind, version) executor
  -> append Run output + EvidenceReceipt(s) -> evaluate/append Gate
  -> unlocks are observed on the next readiness query
  -> Program PASS -> reserve/write/mark one DemoCompletionEnvelope
```

An invalid envelope is rejected without a source claim. A blocked Issue is
never returned to the runtime as ready and therefore is never claimed. A
retryable dependency/service or executor/gate failure uses injected bounded
exponential backoff with jitter; an exhausted retry becomes dead-letter/manual
attention through the ledger port. Terminal business and validation failures
are recorded without an unbounded loop. Unknown failures are converted to safe
codes and diagnostic references; raw exception text and input payloads are not
logged or copied into completion output.

## W2-02 executor registration contract

W2-02 supplies an `ExecutorRegistry` whose `resolve(issueKind, version)`
returns an `IssueExecutor` with a stable `executorId`, matching `issueKind` and
version, and an `execute(issue, signal)` method. The executor returns either a
structured output plus one or more valid W1-01 `EvidenceReceipt` objects, or a
classified safe failure plus optional evidence. It must honor the abort signal
for shutdown/timeout and must not self-claim a Program completion; the ledger
gate remains the separate authority.

## Validation

```bash
pnpm --filter @linksites/intake-orchestrator typecheck
pnpm --filter @linksites/intake-orchestrator test
pnpm build
pnpm typecheck
pnpm test
```

This packet proves local structural/runtime behavior with fakes and file
adapters. It does not claim live CRM, website executor, database, hosting, or
production readiness.

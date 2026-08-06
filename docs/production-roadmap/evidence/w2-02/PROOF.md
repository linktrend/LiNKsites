# W2-02 — End-to-end Program orchestration handoff receipt

**Implementation status:** local first-site vertical slice implemented

**Scope:** One manual/file LeadResearchPackage enters the production composition
root and completes a private, noindex local preview plus one CRM-shaped
completion record. Sold-site public activation is excluded.

## Exact checkpoints

- Immutable starting checkpoint: `909e3188304b20bd7a19a8e0127eea863426267f` (W2-04).
- Passed dependency W2-01: `6356c0e8f2bd762027a61e2a47f39aaf7190a847`.
- Passed dependency W2-03: `b70f030e8af8780afe7e320d14c26538af2922d2`.
- Passed dependency W2-04: `909e3188304b20bd7a19a8e0127eea863426267f`.
- Passed dependency W2-05: `580aef87a79bbab54abdd4835a231e79b92c356e`.
- W2-02 implementation commit: recorded in the final commit handoff.

## Composition and graph

`apps/program-orchestrator/src/composition.ts` is the runnable composition
root. It validates local configuration, creates the durable ledger, named
local Factory Catalog/working-content/library/CMS/frontend/event ports, an
exact name/version/capability-approved executor registry, and builds
`ProgramRuntime`. The graph is persisted before execution and exported
in [GRAPH.json](./GRAPH.json). It uses the canonical `Module > Phase > Issue >
Run` hierarchy and contains 16 Issues. Foundation reservation/library
resolution and copy/media production are the independent parallel branches.

Every successful Issue has a versioned executor name, evidence receipt, durable
Run and accepted gate event. Receipts are content-addressed and adapter effects
are persisted before a crash-after-receipt fault is surfaced.

## Redacted trace

```text
program.created -> run.claimed lead-pull-validate -> gate.accepted
run.claimed foundation-reserve || run.claimed library-resolve -> gate.accepted
run.claimed information-architecture-copy || run.claimed media-provenance
-> working-content-assemble -> content-quality-gates -> payload-draft-promote
-> payload-readback-parity -> private-preview-create -> private-preview-render
-> preview-evidence-capture -> crm-completion-emit
-> completion.reserved -> completion.emitted
```

No lead research payload, credential, token, or raw exception is included in
the receipt. The local completion is CRM-shaped and uses the canonical shared
contract fields.

## Commands and results

| Command | Result |
| --- | --- |
| `pnpm install` | PASS; workspace dependencies installed for validation |
| `pnpm --filter @linksites/program-orchestrator typecheck` | PASS |
| `pnpm --filter @linksites/program-orchestrator test` | PASS; 10 tests |
| `git diff --check` | Run again at final handoff |
| Root typecheck/test/lint/build | Run again at final handoff; unrelated baseline failures, if any, are reported honestly |

## Remaining environment requirements

Before VPS/Phase 2 use, LiNKsites still needs an approved hosted durable ledger
and backup/restore process, real Payload service/credential configuration,
hosted private preview deployment and browser proof, LiNKautowork signed
gateway delivery and observability, approved content/media providers and
policies, and independent audit/release certification. This receipt makes no
live-infrastructure or public-activation claim.

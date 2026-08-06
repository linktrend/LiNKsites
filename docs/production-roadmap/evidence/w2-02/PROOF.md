# W2-02 — End-to-end Program orchestration evidence

**Scope:** Local first-site private preview composition only. No VPS, cloud,
live credentials, public activation, Stripe, Odoo, or raw n8n path is included.
This document is correction evidence, not a W2-02 PASS declaration.

## Source and composition

- Audited correction base: `fb22bb0ce6e7925baba4a0889179d432c8ca7737`.
- Resulting proof commit: recorded only after the bounded correction is committed.
- Composition root: `apps/program-orchestrator/src/composition.ts`.
- Canonical graph source: `@linksites/program-ledger` `LINKSITES_PROGRAM`,
  persisted as the complete Program graph exactly. W2-02 schedules M06–M12;
  M01–M05 and M13–M20 remain explicitly excluded and cannot become complete by
  empty-module/vacuous truth.
- Shared boundaries: `WorkIntakePort`/`FileWorkIntakePort` and
  `CompletionSink`/durable local sink.
- W2-01 path: `WorkingContentRepository` over a durable PostgreSQL-compatible
  local database, immutable version creation, `ready_for_gate` → `accepted`
  lifecycle, checksum validation, and persisted gate evidence.
- LiNKlibraries path: `indexes/catalog.json` is read at immutable commit
  `a7193d40152747db2a03e094fa263f324a971a0b`/tree
  `d35f81d84971df3b58da23443393f71ec1332462`, checked against SHA-256
  `02d6d962d9b1e82fb898442d3de0833ded60be7f4eb177c84c176f0233ad6c0c`,
  and requires `marketing-smb-v1` to be approved. `sourceCommitSha` is
  catalog-generation provenance, not the authority ref; development and main
  authority are recorded separately.
- W2-03 path: `promotePreparedWorkingContent` with the accepted repository
  version, `PayloadRestDraftTarget`, service read-back, field parity, and a
  persisted promotion receipt. The configured `W2_02_PAYLOAD_BASE_URL` path is
  the real Payload REST boundary; local production proof uses the separately
  started disposable authenticated Payload app, not an inline emulator.
- W2-04 path: protected token-required web-master HTTP render with noindex and
  no-store checks. Local production proof uses the optimized `apps/web-master`
  server; a hosted web-master render remains unverified.

## Redacted trace

```text
program.created -> lead-research -> program-claim -> vertical-qualification
-> foundation-reservation -> library-verification -> site-specification
-> information-architecture -> media-provenance -> working-content-assembly
-> content-gates -> payload-draft -> payload-parity -> private-publication
-> site-render-validation -> final-evidence -> completion-record
-> completion.reserved -> completion.emitted
```

Every completed run has a versioned executor, accepted gate event, evidence
receipt, checked-out Git revision, and executable source checkpoint. Working
content, Payload parity, private preview, protected render, and final evidence
artifacts are written and read-back checksum-verified. Claims carry leases and
fencing tokens. Completion uses a durable outbox with attempts, backlog,
failures, dead-letter state, and acknowledgement timing; delivery is one
logical event under replay.

## Validation

| Command | Result |
| --- | --- |
| `pnpm install --lockfile-only` / `pnpm install --offline` | Completed; added the embedded PostgreSQL dependency and lockfile entry |
| `pnpm --filter @linksites/program-orchestrator typecheck` | PASS |
| `pnpm --filter @linksites/program-orchestrator test` | PASS; 14 focused tests, including lease fencing, process termination/recreation, outbox replay, and post-mutation compensation |
| `pnpm --filter @linksites/program-orchestrator build` | PASS |
| `pnpm --filter @linksites/program-ledger typecheck && pnpm --filter @linksites/program-ledger test` | PASS; 126 passed, 1 skipped |
| `pnpm --filter @linksites/factory-catalog typecheck && pnpm --filter @linksites/factory-catalog test` | PASS; 265 passed, 4 skipped live-Payload integration cases |
| `pnpm typecheck` | PASS; 7 workspace packages |
| `pnpm lint` | PASS; configured CMS and web-master lint lanes |
| `git diff --check` | PASS |

The local embedded service is not substituted for live infrastructure in the
claim boundary: the real Payload integration suite still requires a running
Payload process, database, and authorized test credential. No cloud or live
credential path was used here.

## Current correction harness

`pnpm --filter @linksites/program-orchestrator proof:real-services` is the
required disposable local vertical slice. It creates a temporary local
database, starts the actual Payload app with its authenticated REST API, builds
and starts the optimized `apps/web-master`, then runs all 16 Issues and a real
Chromium token-gate check. It writes only the sanitized
`real-service-vertical-slice.json` receipt; temporary credentials, URLs, state,
database, and processes are removed in the shell trap. This receipt is not a
PASS declaration.

`pnpm --filter @linksites/program-orchestrator validate:graph` fails if the
committed `program-graph.json` is not the canonical exporter output. The stale
hand-maintained `GRAPH.json` has been removed.

## Recovery coverage

The focused suite covers boundary retry, restart after a Payload receipt,
completion crash-after-receipt recovery with one delivery, duplicate
lead/delivery, gate rejection, post-mutation render failure/manual attention,
completion outbox retry/ack state, explicit executor allowlists, persisted
working/Payload/protected-render evidence read-back, lease fencing after child
process termination, and private-preview exclusion of public activation. This
is local embedded proof, not hosted production certification.

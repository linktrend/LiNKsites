# W2-02 — End-to-end Program orchestration evidence

**Scope:** Local first-site private preview composition only. No VPS, cloud,
live credentials, public activation, Stripe, Odoo, or raw n8n path is included.

## Source and composition

- Original requested base: `a3cea534308fce30509997e07908a4fcc55797b8`.
- Composition root: `apps/program-orchestrator/src/composition.ts`.
- Canonical graph source: `@linksites/program-ledger` `LINKSITES_PROGRAM`,
  persisted as the Program graph exactly; W2-02 schedules its populated M07–M12
  private-preview execution subset and excludes the empty/future modules.
- Shared boundaries: `WorkIntakePort`/`FileWorkIntakePort` and
  `CompletionSink`/durable local sink.
- W2-01 path: `produceWorkingContent`, immutable checksum validation, media
  provenance, and persisted working/gate artifacts.
- W2-03 path: `PromotionService`, exact prepared working-content input, Payload
  draft upsert/read-back parity, and draft-only state.

## Redacted trace

```text
program.created -> lead-research -> program-claim -> vertical-qualification
-> foundation-reservation -> library-verification -> site-specification
-> information-architecture -> media-provenance -> working-content-assembly
-> content-gates -> payload-draft -> payload-parity -> private-publication
-> site-render-validation -> final-evidence -> completion-record
-> completion.reserved -> completion.emitted
```

Every successful run has a versioned executor, accepted gate event, evidence
receipt, and execution revision. Working-content, Payload parity, private
preview, render, and final evidence artifacts are written locally and
read-back checksum-verified. External adapter effects and delivery receipts
are persisted before crash-after-receipt faults are surfaced.

## Validation

| Command | Result |
| --- | --- |
| `pnpm install --no-frozen-lockfile` | PASS; lockfile updated for W2-02 workspace dependencies/test runner |
| `pnpm --filter @linksites/program-orchestrator typecheck` | PASS |
| `pnpm --filter @linksites/program-orchestrator build` | PASS |
| `pnpm --filter @linksites/factory-catalog typecheck` | PASS |
| `pnpm --filter @linksites/program-orchestrator test` | PASS; 11 tests |
| `pnpm --filter @linksites/factory-catalog test` | PASS; 265 passed, 4 skipped live-Payload integration cases |
| `pnpm typecheck` | PASS; 7 workspace packages |
| `pnpm lint` | PASS; configured CMS/web-master lint lanes |
| `pnpm test` | BLOCKED outside W2-02; CMS E2E requires `DATABASE_URI` |
| `git diff --check` | PASS |

The skipped factory-catalog cases require a real Payload process and are not
claimed as live CMS proof. The root test command reached the CMS integration
tests successfully but its browser lane could not start without `DATABASE_URI`;
no cloud or live credential path was used.

## Recovery coverage

The focused suite covers boundary retry, restart after Payload receipt,
completion crash-after-receipt recovery with one delivery, duplicate
lead/delivery, gate rejection, manual attention after partial mutation,
completion reservation retry, explicit executor allowlists, persisted
working/Payload/frontend evidence read-back, and private-preview exclusion of
public activation. This is local-equivalent proof, not hosted production
certification.

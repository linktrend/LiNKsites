# LS-10 ISS-31 migration evidence

Issue: GitHub `#368`
Branch: `issue/368-ls-10-iss-31-evidence-rebind-for-successor-ident`
Packet: `LS-10` / `ISS-31`

This issue owns copied existing-site migration engineering in
`packages/program-ledger/**` and this evidence directory. It does not
replace the generic Ledger/orchestrator/execution runtime, does not edit
Harness or provider bytes, and does **not** accept LS-10.

## Protected development base

- Commit `7542cb3b1fa1d76cec40f59a522514a86e083038`
- Tree `284814fd2296b2825d8c92f10d9f7dc78ae08e38`

## Scope

Owned:

- `packages/program-ledger/**`
- `docs/evidence/profile-v2-cutover/migration/**`

Not touched:

- `apps/program-orchestrator/**`
- `execution/**`
- `deploy/**`
- `docs/releases/**`
- provider / Harness packages

## Behavior proven

- Plan/apply/verify on copied existing-site snapshots
- Default pin changes do not move existing copies
- Compatible upgrades replay configuration/content and change before/after digests
- Incompatible upgrades preserve active state (`afterDigest == beforeDigest`)
- Invalid legacy pins require a deliberate plan
- Rollback readback matches the before digest
- Historic retrieval remains after new-selection retirement
- Plan → apply → verify uses ledger `dependsOn` so apply cannot dispatch first
- `evaluateLs10Acceptance` stays `HOLD` because H-09 consumer conformance is not accepted

Receipts: `rollback-readback.json`. Hold: `h09-hold.json`.

## Validation

```text
pnpm --filter @linksites/program-ledger exec vitest run tests/existing-site-migration.spec.ts
pnpm --filter @linksites/program-ledger typecheck
git diff --check origin/development...HEAD
python3 scripts/gitops/secret_scan.py
```

LS-10 packet acceptance is not claimed.

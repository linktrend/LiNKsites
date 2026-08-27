# LS-10 ISS-33 configuration evidence (dependency-safe engineering)

GitHub issue `#370`. Branch `issue/370-ls-10-iss-33-evidence-rebind-for-successor-ident`.

This packet is an evidence-only identity rebind of the accepted ISS-33
configuration slice. Functional templates, isolated migrate/rollback, and
drift checks are unchanged from checkpoint
`fccd012e405ceb3168b3635f975ee4fd9a5a560d` /
tree `287bd48d7085e5a1064315f88e90186debb9316c`.

This packet implements only the **configuration** slice of ISS-33:
templates, redacted readback, isolated migrate/rollback, and permanent
drift checks for CMS, web-master, provider, hosting, database, queue,
secrets, monitoring and deployment.

It does not claim ISS-32 Ledger/orchestrator/execution replacement, does
not copy provider or Harness bytes, and does not run a customer or VPS
canary. Production, VPS and live canary remains external and fail closed.

## Protected base

- Repository: `linktrend/LiNKsites`
- Commit: `7542cb3b1fa1d76cec40f59a522514a86e083038`
- Tree: `284814fd2296b2825d8c92f10d9f7dc78ae08e38`

## Owned paths

- `deploy/**`
- `docs/evidence/profile-v2-cutover/config/**`
- `.github/linktrend-secret-scan-fixtures.json`

## Out of scope

- `packages/program-ledger/**`
- `apps/program-orchestrator/**`
- `execution/**`
- `docs/releases/**`
- provider catalogue bytes
- live/VPS/production canary

## Validation

Recorded by the focused validators and offline rehearsal in this directory's
`receipts/offline-rehearsal.json`. Secret values are never persisted.

# LS-10 ISS-33 configuration evidence (dependency-safe engineering)

GitHub issue `#359`. Branch `issue/359-ls-10-iss-33-dependency-safe-configuration-cutov`.

This packet implements only the **configuration** slice of ISS-33:
templates, redacted readback, isolated migrate/rollback, and permanent
drift checks for CMS, web-master, provider, hosting, database, queue,
secrets, monitoring and deployment.

It does not claim ISS-32 Ledger/orchestrator/execution replacement, does
not copy provider or Harness bytes, and does not run a customer or VPS
canary. Production, VPS and live canary remains external and fail closed.

## Protected base

- Repository: `linktrend/LiNKsites`
- Commit: `02ebf5d8710c50c1f2c390989239f0baf916ba97`
- Tree: `fb427d30ea7c3e7060fc9cc1a63a1110266dd755`

## Owned paths

- `deploy/**`
- `docs/evidence/profile-v2-cutover/config/**`

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

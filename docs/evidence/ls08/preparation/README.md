# LS-08 receipt / paired-proof validator (preparation)

Packet `LS-08` preparation only. GitHub issue `291`.

This directory owns the **dependency-independent** schema for server and
browser A/B/C/L receipt bundles. It does not run paired proof, does not
materialize provider A1 bytes, and does not return a consumer receipt to
LiNKlibraries.

## Owned paths

- `docs/evidence/ls08/preparation/**`
- `scripts/profile-v2-quality/ls08/**`

Full LS-08 proof later owns `tests/master-template-v2/a1/**` and
`docs/evidence/master-v2/a1/**`. Those paths are out of scope here.

## What this validator does

- Requires exact provider identity (`repository`, `commit`, `tree`,
  `releaseEntryVersion`, `releaseArtifactTree`).
- Requires exact consumer identity (`repository`, `commit`, `tree`).
- Requires the 2×4 matrix: surfaces `server`/`browser` × plans `a`/`b`/`c`/`l`.
- Requires rollback and tamper verdict fields on every cell.
- Rejects missing/blank/unknown identities and `packetCompletion: true` on
  schema-only evidence.

## What this validator does not do

- It does not fetch or copy LiNKlibraries A1 artifacts.
- It does not treat a schema-valid fixture as consumer proof.
- It does not unlock LS-09 or provider admission.

## Command

```bash
node scripts/profile-v2-quality/ls08/validate-receipt-bundle.mjs \
  --dir docs/evidence/ls08/preparation
node --test scripts/profile-v2-quality/ls08/validate-receipt-bundle.test.mjs
```

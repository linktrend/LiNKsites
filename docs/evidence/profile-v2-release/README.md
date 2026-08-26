# Profile v2 release evidence (LS-11 scaffolding)

Packet `LS-11` / Issues `ISS-34`, `ISS-35`, `ISS-36`. GitHub issue `361`.

This directory is **dependency-safe scaffolding only**. It records fail-closed
templates, checklists and validators for a future exact-tree review, Full and
rollback rehearsal, receipt binding, admission/release/handoff, and
founder-reserved main/publish/deploy decisions.

It does **not** complete LS-11. It does **not** bind LS-10 or Harness
conformance receipts. It does **not** admit, release, hand off, promote,
publish or deploy.

## Owned paths

- `docs/evidence/profile-v2-release/**`
- `docs/releases/**`

No product, runtime, config, provider or Harness path is owned here.

## Protected development binding

- repository `linktrend/LiNKsites`
- ref `development`
- commit `02ebf5d8710c50c1f2c390989239f0baf916ba97`
- tree `fb427d30ea7c3e7060fc9cc1a63a1110266dd755`

LS-10 cutover and Harness H-09 conformance identities are reserved as
`FUTURE_LS10_CUTOVER_IDENTITY` and `FUTURE_HARNESS_H09_CONFORMANCE_IDENTITY`.
Those slots stay unbound (`commit`/`tree` null, `satisfied` false) until a
later exact packet supplies them.

## Fail-closed validator

```bash
node docs/evidence/profile-v2-release/validators/validate-ls11-release-evidence.mjs \
  --dir docs/evidence/profile-v2-release \
  --releases-dir docs/releases
node --test docs/evidence/profile-v2-release/validators/validate-ls11-release-evidence.test.mjs
```

A validator `SCAFFOLDING_OK` result means only that this scaffolding is
internally coherent. It is not LS-11 completion, production proof, or a
founder authorization.

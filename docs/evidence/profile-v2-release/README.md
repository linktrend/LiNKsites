# Profile v2 release evidence (LS-11)

Packet `LS-11` / Issues `ISS-34`, `ISS-35`, `ISS-36`. GitHub issue `361`.

This directory records the completed repository release evidence for LS-11.

It binds accepted LS-10 and Harness H-09 evidence and admits the repository
release. It does not claim hosted publication or production deployment.

## Owned paths

- `docs/evidence/profile-v2-release/**`
- `docs/releases/**`

No product, runtime, config, provider or Harness path is owned here.

## Protected development binding

- repository `linktrend/LiNKsites`
- ref `development`
- commit `d5056f8e4ce832a759fda18f8b3282eba170b471`
- tree `3358c4ae4e33143799b301aa5c34f498f6a3d7ac`

Exact bound identities are recorded in `COMPLETION.json` and
`DEPENDENCIES.json`.

## Fail-closed validator

```bash
node docs/evidence/profile-v2-release/validators/validate-ls11-release-evidence.mjs \
  --dir docs/evidence/profile-v2-release \
  --releases-dir docs/releases
node --test docs/evidence/profile-v2-release/validators/validate-ls11-release-evidence.test.mjs
```

A validator `COMPLETION_OK` result confirms the internal LS-11 repository
evidence contract. It is not hosted or production proof.

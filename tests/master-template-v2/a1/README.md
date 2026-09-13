# LS-08 A1 paired consumer proof — ISS-25..27

Packet **LS-08** runs A1 paired consumer proof on protected `development`.

It binds the exact protected LiNKlibraries A1 pin and the EXT-LS-01 receipt
digest. It does **not** copy provider bytes, claim provider conformance,
production selectability, or MWT-08.

## Owned paths

- `tests/master-template-v2/a1/**`
- `docs/evidence/master-v2/a1/**`
- bounded fixture scripts under `tests/master-template-v2/a1/scripts/**`

## Issues

- **ISS-25** — A1 × A/B/C/L × product/service/hybrid/local/resources/trust/
  failure/lifecycle × server/browser (64 fixtures).
- **ISS-26** — independent visual/accessibility/privacy/tenant review plus
  cache-restart / tamper / rollback proof on consumer-owned cache bytes.
- **ISS-27** — exact consumer receipt/verdicts; freeze accepted A1 semantics
  while the provider remains `draft` / `non_selectable`.

## Bound identities

- Protected LiNKsites development `e89cfd49fafe7f1dc7b137f77c2ab481140a6cca` /
  tree `27c5578ab1416b7a37ddf79168b91be1547eb127`
- LiNKlibraries protected development `998c02c29fae5acc429804d7e03dcc74df7e7a52` /
  tree `63c7f6f8811b93f90a1dcc101cdeea94bdc6d4b3`
- Entry `master-template-type-1@2.0.0-a1.1` artifact tree `6aadb2dff52efe30f512ddb2a5510a881fc027e2`, lifecycle `draft` / `non_selectable`, catalogue.bound=false
- EXT-LS-01 receipt is out-of-tree at `.git/linktrend-evidence/ext-ls-01-issue551/consumer-proof-receipt.json`
  (bytes are generated/verified by `scripts/profile-v2-quality/ext-ls-01/generate-consumer-proof.mjs`; missing bytes fail closed)

## Commands

```bash
node scripts/profile-v2-quality/ext-ls-01/generate-consumer-proof.mjs --clean
node scripts/profile-v2-quality/ext-ls-01/generate-consumer-proof.mjs --verify
node --test tests/master-template-v2/a1/*.test.mjs
node tests/master-template-v2/a1/scripts/validate.mjs
node tests/master-template-v2/a1/scripts/run.mjs --evidence docs/evidence/master-v2/a1
node tests/master-template-v2/a1/scripts/run.mjs --emit-receipt
node tests/master-template-v2/a1/scripts/serve-fixtures.mjs --listen
```

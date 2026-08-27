# LS-08 A1 paired consumer proof — ISS-25..27

Packet **LS-08** runs A1 paired consumer proof on protected `development`.

It binds the exact LiNKlibraries MWT-07 pin and the accepted EXT-LS-01 receipt
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
- LiNKlibraries MWT-07 `f28fd53d454cbc33d97951d8e62826dae5a83e40` /
  tree `34dc7467f4eb382ab7fbe258c5adc0f857d8ab5b`
- Entry `master-template-type-1@2.0.0-a1.1` lifecycle `draft` / `non_selectable`
- EXT-LS-01 receipt SHA-256 `5422616a2db650af44d3c87253066dfc5acd80054b4a6dcd35bd83ce6ca978e3`
  at `.git/linktrend-evidence/execution-2026-08-25/ext-ls-01-issue321-966a4b0/consumer-proof-receipt.json`
  (bytes are not fabricated; digest is bound)

## Commands

```bash
node tests/master-template-v2/a1/scripts/generate.mjs
node --test tests/master-template-v2/a1/*.test.mjs
node tests/master-template-v2/a1/scripts/validate.mjs
node tests/master-template-v2/a1/scripts/run.mjs --evidence docs/evidence/master-v2/a1
node tests/master-template-v2/a1/scripts/run.mjs --emit-receipt
node tests/master-template-v2/a1/scripts/serve-fixtures.mjs --listen
```

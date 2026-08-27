# LS-08 ISS-25..27 A1 paired consumer proof (issue #350)

## Scope

Owned paths only: `tests/master-template-v2/a1/**`, `docs/evidence/master-v2/a1/**`.

- ISS-25 ran the 64-slot A1 × A/B/C/L × product/service/hybrid/local/resources/trust/failure/lifecycle × server/browser matrix.
- ISS-26 ran independent visual/accessibility/privacy/tenant review and consumer-owned cache restart/tamper/rollback.
- ISS-27 emitted exact consumer verdicts and froze accepted A1 semantics.

## Bound identities

- Protected development `e89cfd49fafe7f1dc7b137f77c2ab481140a6cca` / tree `27c5578ab1416b7a37ddf79168b91be1547eb127`
- LiNKlibraries MWT-07 `f28fd53d454cbc33d97951d8e62826dae5a83e40` / tree `34dc7467f4eb382ab7fbe258c5adc0f857d8ab5b`
- Entry `master-template-type-1@2.0.0-a1.1` lifecycle `draft` / selectability `non_selectable`
- EXT-LS-01 receipt SHA-256 `5422616a2db650af44d3c87253066dfc5acd80054b4a6dcd35bd83ce6ca978e3`
- EXT-LS-01 consumer checkpoint `966a4b08c5fdb0fc9a9bb429a5916600b459cee9` / tree `fa6f3fcbd737c9954214d79b733fe9b8f5d4f68f`

Provider bytes were not copied. Provider conformance, production selectability, and MWT-08 are not claimed.

## Validation

See `FOCUSED-TESTS.txt`. HTTP proof of all 64 fixtures is `fixtures/http-proof.json`.

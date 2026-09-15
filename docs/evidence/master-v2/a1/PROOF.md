# LS-08 ISS-25..27 A1 paired consumer proof (issue #350)

## Scope

Owned paths only: `tests/master-template-v2/a1/**`, `docs/evidence/master-v2/a1/**`.

- ISS-25 ran the 64-slot A1 × A/B/C/L × product/service/hybrid/local/resources/trust/failure/lifecycle × server/browser matrix.
- ISS-26 ran independent visual/accessibility/privacy/tenant review and consumer-owned cache restart/tamper/rollback.
- ISS-27 emitted exact consumer verdicts and froze accepted A1 semantics.

## Bound identities

- Protected development `e89cfd49fafe7f1dc7b137f77c2ab481140a6cca` / tree `27c5578ab1416b7a37ddf79168b91be1547eb127`
- LiNKlibraries protected development `998c02c29fae5acc429804d7e03dcc74df7e7a52` / tree `63c7f6f8811b93f90a1dcc101cdeea94bdc6d4b3`
- Entry `master-template-type-1@2.0.0-a1.1` lifecycle `draft` / selectability `non_selectable`
- EXT-LS-01 out-of-tree receipt SHA-256 `94fc8b3e9a5739aa7419f3ece03c660e8a8c696940c119f7cdb17b4cdcf3296f`
- EXT-LS-01 admitted consumer candidate `25033a0cb6979c06aeedea5b9d94090e15372e14` / tree `355c23879d8360fe344a11d09cab441a4fb3a450`
- EXT-LS-01 consumer cache tree `8cc18abd172cc075e5615457b8b2711d67f7ff04`

Provider bytes were not copied. Provider conformance, production selectability, and MWT-08 are not claimed.

## Validation

See `FOCUSED-TESTS.txt`. HTTP proof of all 64 fixtures is `fixtures/http-proof.json`.

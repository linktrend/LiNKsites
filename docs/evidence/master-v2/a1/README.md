# LS-08 / master-v2 A1 evidence (ISS-25..27 paired consumer proof)

GitHub issue `350`. Packet `LS-08`.

This directory stores **bound identities, the 64-slot A1 matrix, independent
ISS-26 review, lifecycle proof, and the ISS-27 consumer receipt**. It does not
embed LiNKlibraries provider bytes and does not claim selectability or MWT-08.

## Files

- `SCOPE.json` / `STATUS.json` / `DEPENDENCIES.json` / `CHECKSUMS.json`
- `bindings/provider-pin.json` — exact MWT-07 pin
- `bindings/ext-ls-01-receipt.json` — accepted EXT-LS-01 digest binding
- `fixtures/iss-25-matrix.json` — 64 run slots
- `fixtures/slots/*.html` — consumer-owned server/browser HTML
- `fixtures/iss-26-review.json` — independent review + lifecycle
- `fixtures/iss-27-receipt.json` — frozen A1 semantics receipt
- `fixtures/injected-lifecycle.json` — digest-bound injected cache bytes (not A1)

Validators live in `tests/master-template-v2/a1/**`.

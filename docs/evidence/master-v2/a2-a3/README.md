# LS-09 / master-v2 A2-A3 evidence (ISS-28..30 complete consumer proof)

GitHub issue `353`. Packet `LS-09`.

This directory stores **bound identities, additive A2/A3 layout mappings, the
80-slot A2/A3 matrix, ISS-29 review, all-layout verdicts, and gated admission
evidence**. It does not embed LiNKlibraries provider bytes and does not claim
production selectability, VPS/live proof, or MWT outputs.

## Files

- `SCOPE.json` / `STATUS.json` / `DEPENDENCIES.json` / `CHECKSUMS.json`
- `bindings/provider-pin.json` — exact 2.0.0 pin
- `bindings/post-a1-amendment.json` — amendment ancestor
- `bindings/provider-handoff.json` — immutable handoff digest
- `bindings/additive-layout-adapter-declaration.json` — ISS-28 modules
- `fixtures/iss-29-matrix.json` — 80 run slots
- `fixtures/slots/*.html` — consumer-owned server/browser HTML
- `fixtures/iss-29-review.json` — independent review + lifecycle
- `fixtures/iss-30-all-layout-verdicts.json`
- `fixtures/iss-30-admission-evidence.json`
- `fixtures/iss-30-receipt.json`

Validators live in `tests/master-template-v2/a2-a3/**`.

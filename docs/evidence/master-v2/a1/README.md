# LS-08 / master-v2 A1 evidence (ISS-25..27 preparation)

GitHub issue `334`. Packet `LS-08`. Preparation only.

This directory stores **schemas, unbound fixture matrices, and fail-closed
dependency records**. It is not an accepted consumer receipt and is not A1
paired-proof evidence.

## Files

- `SCOPE.json` / `STATUS.json` / `DEPENDENCIES.json`
- `schemas/**` — matrix, review, receipt, status schemas
- `fixtures/iss-25-matrix.json` — 64 unbound slots
- `fixtures/iss-26-review.json` — review + lifecycle declarations
- `fixtures/iss-27-receipt-hold.json` — `NOT_EMITTED` hold receipt
- `fixtures/injected-lifecycle.json` — digest-bound injected bytes (not A1)

Validators live in `tests/master-template-v2/a1/**`.

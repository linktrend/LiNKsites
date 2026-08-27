# Profile v2 cutover — configuration evidence

LS-10 ISS-33 dependency-safe engineering portion only.

- `SCOPE.json` — owned versus prohibited paths and the nine surfaces
- `ATTESTATION.json` — fail-closed live-mutation declaration
- `PROOF.md` — human-readable bound
- `receipts/offline-rehearsal.json` — isolated migrate/rollback/drift receipt
- `schemas/offline-rehearsal.schema.json` — receipt shape

Live canary remains external. Do not interpret a passing offline rehearsal as
production, VPS, or hosted proof.

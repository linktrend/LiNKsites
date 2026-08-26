# LS-08 A1 paired consumer proof — ISS-25..27 preparation

Packet **LS-08 is not complete**. This tree is **dependency-independent
preparation** for ISS-25, ISS-26 and ISS-27.

It does **not** run A1 paired proof, copy provider bytes, invent an LS-07
protected checkpoint, freeze A1 semantics, or return an accepted consumer
receipt to LiNKlibraries.

## Owned paths

- `tests/master-template-v2/a1/**`
- `docs/evidence/master-v2/a1/**`
- bounded fixture scripts under `tests/master-template-v2/a1/scripts/**`

## Issues prepared (not executed as paired proof)

- **ISS-25** — required A1 × A/B/C/L × product/service/hybrid/local/resources/
  trust/failure/lifecycle × server/browser fixture slots (64), all `NOT_RUN`.
- **ISS-26** — visual/accessibility/privacy/tenant review slots plus injected
  cache-restart / tamper / rollback / migration fixtures.
- **ISS-27** — hold receipt emitter that always returns `overallVerdict=NOT_EMITTED`.

## Pending dependencies (explicit, unsatisfied)

1. LS-07 protected-integrated on exact `origin/development` readback.
2. Exact LiNKlibraries provider A1 identity bound (no invented bytes).

## Commands

```bash
node --test tests/master-template-v2/a1/*.test.mjs
node tests/master-template-v2/a1/scripts/validate.mjs
node tests/master-template-v2/a1/scripts/run.mjs --evidence docs/evidence/master-v2/a1
node tests/master-template-v2/a1/scripts/run.mjs --emit-hold-receipt
```

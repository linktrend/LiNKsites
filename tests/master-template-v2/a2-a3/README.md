# LS-09 A2/A3 complete consumer proof — ISS-28..30

Packet **LS-09** runs additive A2/A3 layout mappings and paired complete
consumer proof on protected `development`.

It binds the exact LiNKlibraries `main` 2.0.0 pin, post-A1 amendment ancestor,
and immutable LS-09 provider handoff digest. It does **not** copy provider
bytes, claim production selectability, VPS/live proof, or MWT outputs.

## Owned paths

- `tests/master-template-v2/a2-a3/**`
- `docs/evidence/master-v2/a2-a3/**`
- additive layout adapter modules declared after the post-A1 amendment:
  - `tests/master-template-v2/a2-a3/layout-adapters/a1-frozen.mjs`
  - `tests/master-template-v2/a2-a3/layout-adapters/a2-additive.mjs`
  - `tests/master-template-v2/a2-a3/layout-adapters/a3-additive.mjs`
  - `tests/master-template-v2/a2-a3/layout-adapters/index.mjs`

## Issues

- **ISS-28** — additive A2/A3 layout mappings; accepted A1 and plan A/B/C/L
  semantics remain frozen.
- **ISS-29** — A2/A3 × A/B/C/L × semantic/functional/visual/accessibility/
  performance × server/browser (80 fixtures).
- **ISS-30** — all-layout adapter/browser verdicts and coordinated final
  provider admission evidence; production selection remains gated.

## Bound identities

- Protected LiNKsites development `fd36e3084ddbd26356e3c12883c8754003d671ce` /
  tree `b0772be140486124362ee9bba4eb7d4447ecd227`
- LiNKlibraries `main` `9764638f0a17eeb65be8dd5880ed241a8d3b3fa3` /
  tree `57600ebd7362f107c421c61026ab0bf4c9b1c51c`
- Post-A1 amendment ancestor `e71598781266199cd4fde0c14e6501102a3147a2` /
  tree `076bc0bebdce20af6bb92e7a608eae7e2d93492e`
- Entry `master-template-type-1@2.0.0` lifecycle `draft` / `non_selectable`
- Handoff SHA-256 `0b5ffe70f47fea9cec24cf0dc86ef33720bed2edad350623b2e418cc8da5a0a6`

## Commands

```bash
node tests/master-template-v2/a2-a3/scripts/generate.mjs
node --test tests/master-template-v2/a2-a3/*.test.mjs
node tests/master-template-v2/a2-a3/scripts/validate.mjs
node tests/master-template-v2/a2-a3/scripts/run.mjs --evidence docs/evidence/master-v2/a2-a3
node tests/master-template-v2/a2-a3/scripts/run.mjs --emit-receipt
node tests/master-template-v2/a2-a3/scripts/serve-fixtures.mjs --listen
```

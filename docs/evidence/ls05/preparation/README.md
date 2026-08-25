# LS-05 preparation evidence (not packet completion)

This directory records **ISS-16 scaffolding only**: a dependency-independent
materialization / cache / rollback / offline-restart harness that consumes an
**injected provider adapter interface**.

It does **not** complete packet LS-05. It does **not** assert immutable A1
bytes, pin `2.0.0-a1.1`, copy provider artifacts, or edit `packages/` / `apps/`.

## Owned paths

- `scripts/profile-v2-quality/ls05/**`
- `docs/evidence/ls05/preparation/**`

## Prohibited in this preparation

- `packages/**`
- `apps/**`
- provider checkouts and LiNKlibraries source/bytes
- claims of `packetComplete` or immutable A1 candidate identity

## How to run focused tests

```bash
node scripts/profile-v2-quality/ls05/tests/harness.test.mjs
```

Absent identity, incomplete adapters, traversal, tamper, partial installs,
missing cache, and missing rollback pointers fail closed.

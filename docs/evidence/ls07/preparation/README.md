# LS-07 preparation — quality harness scaffolding

Packet **LS-07 is not complete**. This directory records **dependency-independent
preparation** only: a fixture harness that evaluates **injected renderer outputs**.

LS-06 layout-aware web runtime is **not claimed complete**. Runtime identities
must be injected; missing provider or runtime SHAs fail closed.

## Owned paths

- `scripts/profile-v2-quality/ls07/**`
- `docs/evidence/ls07/preparation/**`

## Out of scope

- `apps/web-master/**` and other runtime product components
- Provider template/media bytes from LiNKlibraries
- ISS-22 / ISS-23 / ISS-24 product implementation
- Packet-complete attestation

## How to run

```bash
node --test scripts/profile-v2-quality/ls07/tests/test_ls07_quality_harness.mjs
node --check scripts/profile-v2-quality/ls07/harness.mjs
node scripts/profile-v2-quality/ls07/run.mjs --input scripts/profile-v2-quality/ls07/fixtures/injected-renderer.valid.json
```

Missing identities:

```bash
node scripts/profile-v2-quality/ls07/run.mjs --input scripts/profile-v2-quality/ls07/fixtures/injected-renderer.missing-identities.json
```

That command must exit non-zero.

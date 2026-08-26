# ISS-33 configuration cutover (dependency-safe engineering)

This directory is the executable, name-only configuration contract for the
LS-10 / ISS-33 **config** portion. It covers CMS, web-master, provider,
hosting, database, queue, secrets, monitoring and deployment.

It does **not**:

- contact a VPS, DNS, Traefik control plane, secret manager, or provider catalogue
- copy Harness, Ledger, orchestrator, execution, or provider bytes
- run a production or customer canary

Live canary remains an external fail-closed gate. `iss33-config-cutover.mjs canary --live` exits 78.

## Commands

```bash
node deploy/scripts/iss33-config-cutover.mjs templates
node deploy/scripts/iss33-config-cutover.mjs rehearse --receipt docs/evidence/profile-v2-cutover/config/receipts/offline-rehearsal.json
node deploy/scripts/iss33-config-cutover.mjs committed-drift
node deploy/scripts/iss33-config-cutover.mjs scope-check
node --test deploy/tests/iss33-config-cutover.test.mjs
```

Isolated migrate / readback / rollback / drift operate on a disposable store
created from these templates. Secret values are never written; readback emits
`[REDACTED]` for every secret name.

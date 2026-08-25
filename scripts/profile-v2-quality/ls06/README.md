# LS-06 preparation harness

Dependency-independent **layout/renderer contract**, offline configuration,
and rollback harness for Profile v2 packet LS-06.

This directory is **not** LS-06 packet completion. It does not implement
`apps/web-master` PageRenderer, routes, or shell components. It does not read
`packages/**` or provider bytes. Callers must **inject** LS-04, LS-05,
provider, and layout identities. Missing identities fail closed.

## Scope

Allowed:

- Injected LS-04 working-content / promotion identities
- Injected LS-05 adapter / materialization identities
- Injected provider and layout-pack identities
- A1 vs architecture-ready A2/A3 structural composition contract
- Resolved header/footer/mobile/locale/action declarations
- Type L isolation declaration
- Offline renderer configuration bound to those identities
- Offline rollback plan with previous identities and configuration digest readback

Not evaluated / not claimed:

- Live React rendering or public routes
- Provider checkout or artifact bytes
- LS-04 / LS-05 product implementation
- LS-06 ISS-19 / ISS-20 / ISS-21 completion

## Run

```bash
node scripts/profile-v2-quality/ls06/run.mjs --packet path/to/packet-dir
node --test scripts/profile-v2-quality/ls06/tests/*.test.mjs
```

Stdout is machine-readable JSON with `status` `PASS` or `FAIL`,
`preparationOnly: true`, and `ls06Complete: false`. Exit code `0` is PASS;
`1` is FAIL.

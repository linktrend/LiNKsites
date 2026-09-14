# FROZEN: platform.auth-claims/1.1.0

| Field | Value |
|---|---|
| Contract ID | `platform.auth-claims` |
| Semantic version | `1.1.0` |
| Contract version string | `platform.auth-claims/1.1.0` |
| Schema version | `2026.07.28-w4` |
| Package | `@linktrend/platform-contracts` `0.2.2` |
| Freeze date | `2026-07-28` |
| Status | `frozen_for_integration` |
| Supersedes | `platform.auth-claims/1.0.0` |

## Correction wave 4 delta vs 1.0.0

- `orgId` may be `null` **only** when `actorKind` is `service` (JSON Schema `allOf` + runtime `assertAuthClaimsShape`).
- Non-service actors with `orgId: null` are shape-invalid (fail closed).

## Artifacts

| Artifact | Path |
|---|---|
| JSON Schema | `packages/contracts/schemas/platform-auth-claims.v1.1.0.json` |
| TypeScript | `packages/contracts/src/claims.ts` |
| Semantics doc | `docs/contracts/platform-auth-claims-v1.md` |
| Fixtures | `packages/contracts/fixtures/claims/` |
| Consumer repin packet | `docs/contracts/CONSUMER-REPIN-PACKET-auth-claims-1.1.0.md` |

## Hashes (SHA-256 hex)

### Schema

| Kind | SHA-256 |
|---|---|
| Schema file bytes | `c2e8bc68b3feb9a3dacc497f5a5d497b466c400804fb4f9e41734c10772ddfa1` |
| Canonical content hash (`contentHash` / canonicalizeJson + sha256) | `fb518834be897c32574df5f7235704fdb0de708bd3da1b48fc448246e3eca567` |

### TypeScript

| Kind | SHA-256 |
|---|---|
| `packages/contracts/src/claims.ts` file bytes | `cc382008d1e0a15112ad03d2ad83cbdf55ec24b67807a6af595999b84d943ca8` |

### Fixtures (`packages/contracts/fixtures/claims/`)

| File | SHA-256 |
|---|---|
| `accept-valid.json` | `cf9b420e090f03e09672ba12b1501417d38b8f75551c9ead1961d014caa8cdc3` |
| `reject-expired.json` | `d8146547b3a613875bc5bf16ed9bca106cf2cf085a1dc369a05aeeee05636f3a` |
| `reject-revoked.json` | `0452cca5d565b3b937f3debb39e0020b737f4d1c4632cfdbe3738e9d19b3cf5c` |
| `reject-rotated.json` | `e694ca5e15bf2672957ffc7a20ec3cdbee3bb6af2a7022d3cbc55645f08f6566` |
| `reject-wrong-audience.json` | `64fbc63cdb14d04c583fb2a3be3974199f6b5a0e09e1204e1d5d213a44dce36d` |
| `reject-wrong-org.json` | `da2eeeb9d51a5091a235b3120201b4fd91611801f24c3dc06f2c8073a744fa5b` |
| `reject-wrong-service.json` | `0b0fb18bffead1cb2993342c037aac16fc990114af31921e57fc85e36db4ee34` |

## Integration notes

- Consumers must require `claimContractVersion === "platform.auth-claims/1.1.0"`.
- Structural check: `assertAuthClaimsShape` / `isAuthClaimsShape`.
- Lifecycle policy: `validateAuthClaims` (rotated credentials reject as `revoked`).
- `additionalProperties: false` — camelCase only; competing envelopes (`payload`, `claims`, snake_case ids) are rejected.
- Do not mutate the schema file or fixtures without bumping the contract semver and re-freezing.
- Historical freeze for 1.0.0 remains at `docs/contracts/frozen/platform-auth-claims-v1.0.0.FROZEN.md` (superseded).

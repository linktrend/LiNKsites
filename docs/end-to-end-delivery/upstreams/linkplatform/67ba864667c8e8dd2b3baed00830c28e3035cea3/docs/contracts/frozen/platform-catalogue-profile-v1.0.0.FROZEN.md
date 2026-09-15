# FROZEN: platform.catalogue-profile/1.0.0

| Field | Value |
|---|---|
| Contract ID | `platform.catalogue-profile` |
| Semantic version | `1.0.0` |
| Contract version string | `platform.catalogue-profile/1.0.0` |
| Schema version | `2026.08.31-lcl-wp-002` |
| Package | `@linktrend/platform-contracts` `0.3.0` |
| Freeze date | `2026-08-31` |
| Status | `frozen_for_local_consumer_pin` |
| Protected development | local-publication ancestry `d7921dcb424f44eae760303b576197377904e264`; accepted provider `acd86e1d264f9b7ee34ae4bae3c3114cc5d4a062` tree `8027697bc681085a2a1a4af029028bc76426c06a` (no tag) |
| External request | `EXT-LCL-PLATFORM-CATALOGUE-CONTRACT` / LiNKclient `LCL-WP-002` |
| Publication class | protected-provider (not production; no consumer/live proof) |

This freeze is **only** the catalogue/Profile contract. It does not re-freeze WP-P0, AuthClaims, the token envelope, or provider-trust.

## Artifacts

| Artifact | Path |
|---|---|
| JSON Schema | `packages/contracts/schemas/platform-catalogue-profile.v1.0.0.json` |
| TypeScript | `packages/contracts/src/catalogue-profile.ts` |
| Fixtures | `packages/contracts/fixtures/catalogue-profile/` |
| Digest | `packages/contracts/fixtures/catalogue-profile/DIGEST.json` |
| Semantics | `docs/contracts/platform-catalogue-profile-v1.md` |
| Consumer pin packet | `docs/contracts/CONSUMER-PIN-PACKET-catalogue-profile-1.0.0.md` |
| Local release receipt | `docs/evidence/phase-1/PLATFORM-CATALOGUE-PROFILE-RELEASE-RECEIPT-2026-08-31.json` |
| Provider handoff | `docs/contracts/frozen/EXT-LCL-PLATFORM-CATALOGUE-CONTRACT.provider-handoff.json` |
| Provider handoff schema | `packages/contracts/schemas/platform-catalogue-profile.provider-handoff.v1.0.0.json` |
| Validator | `scripts/verify-platform-catalogue-profile-contract.py` |

File-byte SHA-256 values and the aggregate `digestSha256` live in the digest file. Do not mutate schema, TypeScript, or fixtures without bumping the contract semver and publishing a new digest.

## Integration notes

- Require `contractVersion === "platform.catalogue-profile/1.0.0"`.
- Structural check: `assertCatalogueProfileDocument` / `isCatalogueProfileDocument`.
- `additionalProperties: false` — grants, entitlement, PACI capability strings, and unknown fields fail closed.
- Pin commit + tree + null tag + digest from the provider handoff. Do not treat HEAD of a later checkpoint as the pin. Do not claim consumer or live proof from this freeze.

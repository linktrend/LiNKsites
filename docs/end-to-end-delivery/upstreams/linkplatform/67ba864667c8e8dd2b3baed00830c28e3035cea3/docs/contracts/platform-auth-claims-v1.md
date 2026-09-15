# Platform auth claims v1.1.0

Canonical authentication claim contract for LiNKplatform.

| Field | Value |
|---|---|
| Contract ID | `platform.auth-claims` |
| Semantic version | `1.1.0` |
| Contract version string | `platform.auth-claims/1.1.0` |
| Schema version | `2026.07.28-w4` |
| Schema file | `packages/contracts/schemas/platform-auth-claims.v1.1.0.json` |
| TypeScript | `packages/contracts/src/claims.ts` (`AuthClaims`) |
| Package | `@linktrend/platform-contracts` ≥ `0.2.2` |
| Previous | `platform.auth-claims/1.0.0` (superseded; freeze retained for history) |

Authority: plan §11.5, ADR 0004, freeze record `docs/contracts/frozen/platform-auth-claims-v1.1.0.FROZEN.md`.

## Casing

All claim field names are **camelCase**. Snake_case and other casings are rejected (`additionalProperties: false` on the JSON Schema; `assertAuthClaimsShape` rejects unknown keys).

## Field semantics

| Field | Required | Semantics |
|---|---|---|
| `claimContractVersion` | yes | Exact string `platform.auth-claims/1.1.0`. Identifies this frozen shape. |
| `actorId` | yes | Non-empty canonical durable actor ID. |
| `actorKind` | yes | One of: `human`, `persona`, `service`, `adapter`, `program_executor`. Transient sessions are not actors. |
| `runtimeBindingId` | yes | Non-empty ID of the runtime/installation binding presenting the claims. |
| `credentialId` | yes | Non-empty credential *metadata* ID. Never a secret, token, or private key. |
| `orgId` | yes | Organisation association. Non-empty string for org-scoped actors. **`null` only when `actorKind` is `service`** (Platform-global service principals). Non-service kinds with `orgId: null` are shape-invalid. |
| `internal` | yes | `true` when the actor is an internal Platform/service principal. |
| `serviceScopes` | yes | Non-empty array of service scope strings (e.g. `lbrain`, `lskills`, `linkplatform`). Acceptance requires the requested service to appear here. |
| `permittedOperations` | yes | Array of operation names permitted within the granted scopes (may be empty). Domain checks may require a specific operation. |
| `issuedAt` | yes | ISO-8601 date-time. Claims evaluated before this instant are `not_yet_valid`. |
| `expiresAt` | yes | ISO-8601 date-time. Claims evaluated at or after this instant are `expired`. |
| `issuer` | yes | Non-empty Platform issuer identity that minted the claims. |
| `audience` | yes | Non-empty array of intended API/service audience names. Acceptance requires the expected audience to appear here. |
| `programRestrictions` | no | Optional Program ID allow-list, or `null` / omitted when unrestricted at the claim layer. Does not grant Program permission by itself. |
| `repositoryRestrictions` | no | Optional repository allow-list, or `null` / omitted when unrestricted at the claim layer. |
| `correlationId` | yes | Opaque request/correlation ID. Must not carry domain payloads, private evidence, or secrets. |

## Actor kinds

| Kind | Typical use |
|---|---|
| `human` | Principal / human operator identity |
| `persona` | Named agent persona (e.g. Lisa) |
| `service` | Service principal |
| `adapter` | IDE/runtime adapter binding |
| `program_executor` | Program-scoped executor identity |

## Org semantics (correction wave 4)

- Org-scoped actors (`human`, `persona`, `adapter`, `program_executor`) **must** carry a non-empty `orgId`.
- `orgId: null` is allowed **only** when `actorKind === "service"`.
- Service actors may still carry a non-null `orgId` when org-scoped.
- JSON Schema encodes this via `allOf` conditionals; runtime via `assertAuthClaimsShape`.
- When a consumer supplies `expectedOrgId` in the validation context, a mismatch yields `wrong_org`.

## Runtime binding and credential

- `runtimeBindingId` ties claims to a specific actor↔installation/adapter binding. Inactive/retired/suspended bindings reject as `inactive_binding`.
- `credentialId` references credential metadata only. Secret material lives exclusively in the approved secret mechanism (GSM).
- Credential lifecycle status is supplied by the validation context (`credentialStatus`), not embedded in the claim object.
- Issuance must pass `issueCredentialUnderBindingPolicy` / SQL `enforce_credential_issuance_policy` (binding ownership, org match, service subset).

## Service scopes and permitted operations

- `serviceScopes` gates which Platform/domain services may accept the claims (`wrong_service` on miss).
- `permittedOperations` gates named operations when the consumer requires one (`operation_not_permitted` on miss).
- Platform access never implies Program permission to act.

## Issuer and audience

- `issuer` is the minting authority string (Platform-owned).
- `audience` lists intended consumers; miss → `wrong_audience`.

## Timestamps, expiry, and correlation

- `issuedAt` / `expiresAt` are ISO-8601 date-time strings (UTC `Z` recommended; fixtures use millisecond precision).
- Evaluation time is the context `now` value.
- `correlationId` is opaque; see also `correlation.ts` for multi-field correlation bags.

## Rejected shapes

- Competing envelopes (`claims`, `payload`, snake_case ids, secret-shaped keys)
- Wrong / missing `claimContractVersion`
- Unknown properties
- `orgId: null` with non-`service` `actorKind`

## Consumer adapters

Thin mappers in `consumer-adapters.ts` rematerialize AuthClaims fields only (Brain / Skills / OpenClaw). They do not accept competing schemas. See `docs/contracts/consumer-conformance.md` and the wave-4 repin packet.

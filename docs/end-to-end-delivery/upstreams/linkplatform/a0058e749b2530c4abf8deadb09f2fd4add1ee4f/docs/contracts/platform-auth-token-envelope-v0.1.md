# platform.auth-token-envelope/0.1.0 (FROZEN)

| Field | Value |
|---|---|
| Contract ID | `platform.auth-token-envelope` |
| Semantic version | `0.1.0` |
| Contract version string | `platform.auth-token-envelope/0.1.0` |
| Schema version | `2026.07.30-f1` |
| Status | **`frozen_for_integration`** |
| Freeze date | `2026-07-30` |
| Package | `@linktrend/platform-contracts` **`0.3.0`** |
| Depends on | `platform.auth-claims/1.1.0` (**unchanged**; still frozen) |
| Authority | ADR 0013 **Accepted** (Principal D1–D15 locked) |
| Supersedes | `docs/contracts/platform-auth-token-envelope-v0.1.DRAFT.md` (wave 3 draft) |
| Freeze record | `docs/contracts/frozen/platform-auth-token-envelope-v0.1.0.FROZEN.md` |
| OpenClaw evidence | HEAD `bf10d35847c20c5077335070e3599fe91a81a0de`; handoff SHA-256 `c950ef577b7543f0632e2a6d0386ae8a3209d002527320e04c03c3b666c2b549` |

This document freezes the cryptographic **envelope** and PACI authorization-server behaviour around frozen AuthClaims. It does **not** change AuthClaims 1.1.0.

## Freeze notes — `jose` (panva)

Signing and verification **must** use the maintained [`jose`](https://github.com/panva/jose) library (panva). **No custom JWS/JWT crypto.** Lane 1 (this freeze) does **not** add `jose` to `@linktrend/platform-contracts` — the contracts package stays pure shape/helpers only. **Lane 2** adds `jose` to the PACI issuer and verifier/runtime packages that mint or verify compact JWS.

## Principal locks applied (D1–D15)

| # | Lock |
|---|---|
| D1 | Platform-owned PACI (Option A) |
| D2 | Production `alg` **ES256** only |
| D3 | Access-token TTL **15 minutes** |
| D4 | AuthClaims skew **0** + whole-second mint normalization |
| D5 | **No** refresh tokens in Phase-1 |
| D6 | High-risk writes require introspection |
| D7 | OpenClaw owns public `client_credentials` seam |
| D8 | Stage issuer `https://auth.stage.linkplatform.linktrend.dev` (no trailing slash) |
| D9 | Prod issuer `https://auth.linkplatform.linktrend.dev` (no trailing slash) |
| D10 | No new paid hosting without separate cost approval |
| D11 | Existing approved secret infra only |
| D12 | Full local/fake authorized now; stage after safe env recovery; prod after verified stage |
| D13 | KMS/HSM preferred; new charges Principal-gated |
| D14 | OpenClaw owner authorized for seam (Platform does not edit OpenClaw) |
| D15 | Shared-secret client auth **forbid** in every environment |

## 1. Supabase-native vs LiNKplatform

| Concern | Supabase-native | LiNKplatform PACI |
|---|---|---|
| Purpose | User/session + Data API / RLS | Machine auth to Gateways / control plane |
| Discovery | Project Auth JWKS | RFC 8414 `/.well-known/oauth-authorization-server` |
| Authorization | Postgres `role` + RLS | AuthClaims scopes/operations + gateway policy |
| Consumer holds | Never `service_role` in clients | Never DB secret / `service_role` / signing private key |

## 2. Token type, algorithms, RFC 8725 hardening

| Requirement | Value |
|---|---|
| Serialization | JWS compact — RFC 7515 / 7519 |
| Production `alg` | **`ES256` only** — RFC 7518 |
| Forbidden algs | `none`, HS*, unlisted algs — reject fail-closed (RFC 8725) |
| Header `typ` | **`paci+jwt`** (explicit typing per RFC 8725). Phase-1 verifiers **require** `paci+jwt` |
| Header `kid` | Required; UUID string; must uniquely match exactly one JWKS key |
| Forbidden header params for key selection | **`jwk`, `jku`, `x5u`**, and untrusted **`x5c`** |
| `crit` | If present, every listed header must be understood; unknown ⇒ reject |
| Duplicate/ambiguous headers | Reject |
| Key selection | **Only** from pinned issuer JWKS (see §5.2); no redirects/SSRF |

JWKS key validation: `kty === "EC"`, `crv === "P-256"`, `alg === "ES256"` (or absent-but-constrained by allow-list), `use` is `sig` or absent, `key_ops` if present includes `verify` and excludes `sign` for published public keys. Reject **kid collisions**.

## 3. Registered JWT claims

NumericDate = seconds since epoch (RFC 7519).

| Claim | Required | Semantics |
|---|---|---|
| `iss` | yes | Absolute URI of PACI issuer for the environment (stage ≠ prod); Phase-1 root issuers **must not** end with `/` (see §5.1) |
| `aud` | yes | JSON array; set-equal to AuthClaims `audience` |
| `sub` | yes | Equal to AuthClaims `actorId` |
| `iat` | yes | Seconds of normalized `issuedAt` (see §4.2) |
| `exp` | yes | Seconds of normalized `expiresAt` |
| `nbf` | yes | Phase-1 = `iat` |
| `jti` | yes | UUID identifying this access token (correlation/audit; **not** a single-use ticket) |

No Supabase `role` / `user_metadata` / `app_metadata` authorization.

**Access-token reuse:** A valid bearer access token **may authorize multiple requests** during its validity period. PACI **must not** reject a second presentation solely because the access-token `jti` was seen before. Request idempotency remains a **separate domain control**.

## 4. Namespaced AuthClaims embedding

| Field | Value |
|---|---|
| Claim key | `https://linktrend.dev/claims/auth` |
| Value | Exactly one frozen AuthClaims 1.1.0 object |
| Extra payload properties | Forbidden |

Schema resolution: envelope schema **bundles** AuthClaims via local path `packages/contracts/schemas/platform-auth-claims.v1.1.0.json` (contentHash `fb518834be897c32574df5f7235704fdb0de708bd3da1b48fc448246e3eca567`). No network `$ref` at runtime.

### 4.1 Cross-field equality

| Check | Rule |
|---|---|
| Shape | AuthClaims 1.1.0 schema / `assertAuthClaimsShape` |
| Contract | `claimContractVersion === "platform.auth-claims/1.1.0"` |
| `iss` | `payload.iss === claims.issuer` (exact URI string) |
| `sub` | `payload.sub === claims.actorId` |
| `aud` | set equality with `claims.audience` |
| Times | After mint normalization (§4.2), `iat`/`nbf`/`exp` NumericDate values and AuthClaims `issuedAt`/`expiresAt` share identical second boundaries |

### 4.2 Clock semantics (whole-second normalization + zero skew)

Frozen `validateAuthClaims` (AuthClaims 1.1.0): reject if `now < issuedAt`; reject if `now >= expiresAt`; **no skew expansion**.

**Mint requirement:** PACI **must** normalize AuthClaims `issuedAt` and `expiresAt` to **whole-second UTC** instants before signing (truncate/floor fractional seconds so the ISO-8601 form ends at an exact second, e.g. `…:05.000Z`). Then set:

| JWT | AuthClaims |
|---|---|
| `iat` = `nbf` = unix seconds of `issuedAt` | `issuedAt` = that same instant |
| `exp` = unix seconds of `expiresAt` | `expiresAt` = that same instant |

Therefore JWT NumericDate validation and AuthClaims validation have **identical** boundaries. Effective AuthClaims skew default = **0**. Any ±N second AuthClaims skew requires a separately reviewed AuthClaims contract bump.

Fractional input to mint (e.g. `issuedAt` with milliseconds) is accepted only as **input** and must be normalized before embed/sign.

### 4.3 `correlationId` (mint) vs per-request correlation

Frozen AuthClaims field `correlationId` remains required by `platform.auth-claims/1.1.0`. For PACI:

| Identifier | Scope | Rule |
|---|---|---|
| AuthClaims `correlationId` | **Token mint / issuance** | Opaque id assigned **once at mint** for that access token; stable for the token’s lifetime; used for issuance audit/trace of the credential mint event |
| Gateway **request correlation** | **Single HTTP/MCP request** | Each Gateway request **must** carry or generate its own approved request-correlation field/header (Phase-1 proposed name: `X-Request-Id`, UUID). Independent of the reusable access token |

**Must not:** treat `claims.correlationId` as the per-request correlation id; copy token `correlationId` into the request-correlation slot; overwrite or replace a caller-supplied request-correlation value with the token’s mint `correlationId` when the same bearer is reused across requests.

Token reuse (same bearer, multiple requests) **requires** distinct per-request correlation values (or freshly generated ones when the client omits the header, per Gateway policy) while `claims.correlationId` stays constant.

## 5. Authorization-server metadata (RFC 8414)

### 5.1 Issuer identifier and discovery URL construction

Phase-1 **root issuer identifiers have no path component and no trailing slash**:

| Environment | Issuer (Principal D8/D9) |
|---|---|
| Stage | `https://auth.stage.linkplatform.linktrend.dev` |
| Prod | `https://auth.linkplatform.linktrend.dev` |

**Exact discovery construction:**

1. Let `issuer` be the configured issuer identifier string.
2. **Require** `issuer` does **not** end with `/`.
3. Discovery URL = `issuer + "/.well-known/oauth-authorization-server"`

Path-component issuers are out of Phase-1 scope. Phase-1 implementations must reject configured issuers that end with `/` or that contain a non-empty path.

```http
GET https://auth.stage.linkplatform.linktrend.dev/.well-known/oauth-authorization-server
```

Metadata example (placeholders — not live). **`authorization_endpoint` is omitted entirely** — do **not** emit `authorization_endpoint: null`. The `issuer` metadata value **must equal** the configured issuer identifier (no trailing slash).

```json
{
  "issuer": "https://auth.stage.linkplatform.linktrend.dev",
  "token_endpoint": "https://auth.stage.linkplatform.linktrend.dev/oauth/token",
  "jwks_uri": "https://auth.stage.linkplatform.linktrend.dev/.well-known/jwks.json",
  "introspection_endpoint": "https://auth.stage.linkplatform.linktrend.dev/oauth/introspect",
  "grant_types_supported": ["client_credentials"],
  "token_endpoint_auth_methods_supported": ["private_key_jwt"],
  "token_endpoint_auth_signing_alg_values_supported": ["ES256"],
  "introspection_endpoint_auth_methods_supported": ["private_key_jwt"],
  "response_types_supported": [],
  "scopes_supported": ["lbrain", "lskills", "linkplatform"],
  "service_documentation": "https://github.com/linktrend/LiNKplatform/blob/development/docs/contracts/platform-auth-token-envelope-v0.1.md"
}
```

**`response_types_supported`:** Phase-1 PACI is **machine-only**. Advertise an **empty array** `[]`. Clients must use `client_credentials` at `token_endpoint` only.

**Not advertised:** `client_secret_post`, `client_secret_basic`, `id_token_signing_alg_values_supported`, interactive response types. Shared-secret client auth is **forbidden in every environment** (D15).

### 5.2 JWKS pinning, cache, and outage

| Rule | Value |
|---|---|
| `jwks_uri` origin | Must be the **same origin** as `issuer` (scheme + host + port); path may differ |
| Redirects | JWKS HTTP client: **no redirects** |
| Cache bound | ≤ **5 minutes** from successful fetch |
| Outage | If JWKS fetch fails, verifiers **may** continue using a **still-valid pinned cache** until its bounded expiry. Once **no usable cached key** remains for the required `kid`, verification **fails closed** |
| Invalidation | Revocation / admin invalidation signals **purge** affected cached keys (by `kid` or entire set) immediately |
| Private keys | Never in JWKS |

## 6. Credential identity and token acquisition

### 6.1 Identity model

```text
domain-specific client registration (client_id)
  -> credential metadata row (credentialId, runtimeBindingId, status, org, scopes, audiences, …)
       -> minted PACI access token (jti; AuthClaims.correlationId = mint correlation)
```

| Rule | Detail |
|---|---|
| `client_id` | One domain-specific credential/client registration |
| `runtimeBindingId` | Field on the credential record; derived/stored there (not equal to `client_id`); embedded in AuthClaims at mint |
| Brain vs Skills | Separate `client_id`, `credentialId`, audiences, scopes, revocation, audit |

### 6.2 Client authentication — `private_key_jwt` (preferred)

| Assertion claim | Rule |
|---|---|
| `iss` / `sub` | `client_id` |
| `aud` | Exact **token_endpoint** URI (Phase-1 pin) |
| `iat` | now |
| `exp` | now + ≤ **5 minutes** |
| `jti` | UUID; server **stores and rejects replay** for ≥ assertion lifetime (**mandatory**) |

Token request: `grant_type=client_credentials` + `client_assertion_type=urn:ietf:params:oauth:client-assertion-type:jwt-bearer` + `client_assertion` + optional `scope`.

### 6.3 Shared-secret client auth

**Forbidden in every environment** under Principal D15 = `forbid`. Do **not** list `client_secret_post` / `client_secret_basic` in metadata.

### 6.4 Mint result

`access_token` + `token_type=Bearer` + `expires_in`. Phase-1: **no refresh_token**. Reissue via client_credentials when remaining TTL &lt; 20%. Mint applies §4.2 whole-second normalization before sign. Access-token TTL = **15 minutes** (D3).

## 7. Introspection (RFC 7662)

### 7.1 Request

```http
POST /oauth/introspect
Content-Type: application/x-www-form-urlencoded

token=ltfx.doc-token-placeholder.v1
```

Caller authenticates as a registered introspection client via `private_key_jwt` (`aud` = introspection endpoint URI).

### 7.2 Status splitting (precise)

| Condition | HTTP | Body |
|---|---|---|
| Invalid introspection-client authentication (bad/missing assertion, replayed assertion `jti`, unknown client, wrong `aud`) | **401** | Error response per AS policy; **not** an `active` JSON object |
| Valid, authorized introspection client; token inactive, unknown, expired, revoked, or **caller-ineligible** | **200** | Exactly `{"active":false}` — no extra fields (RFC 7662 privacy) |
| Valid, authorized client; token active and eligible | **200** | `active: true` plus fields below |

### 7.3 Active response fields

When `active: true`: `iss`, `aud`, `sub`, `exp`, `iat`, `jti`, `client_id`, `scope`, `credential_id`, `runtime_binding_id`, `token_type=Bearer`.

### 7.4 Caching / high-risk writes / fail-closed

Introspection cache ≤ 30s keyed by `jti` + resource client; purge on revoke. High-risk write classes unchanged. High-risk writes require introspection (D6); introspect down ⇒ **deny**.

### 7.5 Revocation (not access-token jti single-use)

| Object | Behaviour |
|---|---|
| Access-token `jti` | Correlation/audit; **multi-request allowed** while token valid |
| Client-assertion `jti` | **Replay rejected** (mandatory) |
| Credential / binding | Revoked/inactive ⇒ mint denied; introspect `active: false` (200) for authorized callers |
| Signing key | Remove kid from JWKS; purge caches; tokens with that kid fail once no usable cached key remains |

## 8. Authorization enforcement order (resource servers)

1. Extract Bearer; reject malformed compact JWS.
2. Header: require `typ=paci+jwt`, `alg=ES256`, `kid`; reject forbidden key headers / bad `crit`.
3. Resolve key from pinned JWKS (cache/outage rules §5.2); verify signature via **`jose`** (Lane 2+).
4. Validate registered claims + clock (§4.2).
5. Extract AuthClaims; shape + cross-field equality.
6. If high-risk write: introspect; require HTTP 200 + `active: true` (+ matching ids).
7. `validateAuthClaims` with request context.
8. Enforce route scopes/operations.
9. Never treat Platform auth as Program permission.

## 9. Key custody (signing)

| Mode | Description | Exportable? |
|---|---|---|
| **A — Cloud KMS/HSM asymmetric signing** | Non-exportable; PACI calls KMS Sign | Preferred production (D13) |
| **B — GSM-injected private key** | Exportable into issuer memory | Higher process-compromise risk |

Client auth keys are separate per-`client_id` refs.

## 10. Evidence classes

| Class | Meaning |
|---|---|
| `fake_local` | Ephemeral test keys; fixtures (D12 authorized) |
| `live_stage` / `live_prod` | Real JWKS + KMS/GSM — stage/prod gated per D12 |

## 11. Schema path

`packages/contracts/schemas/platform-auth-token-envelope.v0.1.0.json`

Package export: `@linktrend/platform-contracts/schemas/platform-auth-token-envelope.v0.1.0.json`

TypeScript: `packages/contracts/src/auth-token-envelope.ts` (`AuthTokenEnvelopePayload`, shape helpers).

Fixtures (unsigned payloads + expectations only): `packages/contracts/fixtures/auth-token-envelope/`

## Related

ADR 0013 · OpenClaw committed handoff (pins above) · consumer matrix · conformance fixtures · freeze record under `docs/contracts/frozen/`

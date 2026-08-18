# W2-04 — Master Template and Private Demo Proof

**Implementation gate:** Local proof recorded; independent certification required

**Verified:** 2026-08-05 (Asia/Taipei)

**Scope:** Pre-VPS local production-mode proof; no VPS, DNS, cloud, or live customer mutation.

## Outcome proved

`web-master` renders real published records from a disposable Payload database through
the admitted `marketing-smb-v1` template boundary. Public requests cannot enumerate or
fetch the private-preview page. The private route rejects a missing or incorrect token,
accepts the correct token, and returns `noindex, nofollow` plus `private, no-store` on the
final optimized-server response.

The production-mode browser gate covers home, about, services, contact, privacy policy,
terms of use, cookie policy, the controlled not-found boundary, and the private demo.
It checks the main landmark, named links, desktop and mobile rendering, and horizontal
overflow. The resulting screenshots are copied from the disposable
optimized-server browser run into `browser/`; they prove the W2-04 public
render, not W2-02 promoted private drafts.

## Corrections included

- Payload API-key requests use Payload's required `users API-Key <key>` authentication
  scheme instead of treating an API key as a Bearer token.
- Exact hostname and site-ID lookups remain available to the authenticated rendering
  service while unrestricted site/domain listing remains admin-only.
- Anonymous Payload page reads exclude `private-preview` records, including direct-ID
  retrieval through the collection access predicate.
- The preview middleware rejects both missing and incorrect tokens.
- Preview privacy headers are applied at the final route-response boundary.
- The responsive root boundary prevents horizontal mobile overflow.
- The proof harness starts a disposable database, Payload CMS, an optimized web-master
  build, and a real Chromium session, then terminates its processes and removes its
  temporary database/files.

## Validation

| Command | Result | Evidence |
| --- | --- | --- |
| `pnpm test:w2-04` | Local proof command | Contract, behavioral/adversarial, real Payload, optimized server, and browser gates run; command output is the authoritative current count. |
| `pnpm --filter @linksites/web-master lint` | PASS | Frontend lint passed. |
| `pnpm --filter @linksites/web-master typecheck` | PASS | Frontend TypeScript validation passed. |
| `pnpm --filter @linksites/cms typecheck` | PASS | CMS TypeScript validation passed. |
| `git diff --check` | PASS | No whitespace errors. |

The W2-04 command itself performs a clean optimized `web-master` build before the browser
checks. The local Supabase/Payload services and ports are absent after completion.

## Route and privacy matrix

| Surface | Expected result | Verified |
| --- | --- | --- |
| `/en` | Published Payload homepage | PASS |
| `/en/about` | Published Payload page | PASS |
| `/en/services` | Published Payload page | PASS |
| `/en/contact` | Published Payload page/non-submitting affordance | PASS |
| `/en/legal/privacy-policy` | Published Payload legal page | PASS |
| `/en/legal/terms-of-use` | Published Payload legal page | PASS |
| `/en/legal/cookie-policy` | Published Payload legal page | PASS |
| Unknown public page | Controlled Page Not Found boundary; no private data | PASS |
| `/en/demo` | 404 denial | PASS |
| `/en/demo/<wrong-token>` | 404, noindex, private/no-store | PASS |
| `/en/demo/<valid-token>` | Private Payload preview, noindex, private/no-store | PASS |
| Anonymous CMS list/direct-ID | Private-preview content absent or denied | PASS |

## Dependency receipts

- W2-01 checkpoint: `6356c0e8f2bd762027a61e2a47f39aaf7190a847`.
- W2-03 checkpoint: `b70f030e8af8780afe7e320d14c26538af2922d2`.
- Approved LiNKlibraries development/staging SHA:
  `a7193d40152747db2a03e094fa263f324a971a0b`.
- Approved LiNKlibraries main SHA (identical promoted tree):
  `39d16d37c976a2fed81eb4f22864ade44689b01f`.
- Approved `marketing-smb-v1` entry tree SHA-1:
  `892115946d3566eeb99d8baa32b8a10e1792b610`.
- Approved entry JSON SHA-256:
  `2ea7b6f004451c9f82b74892add71ae42164f5a03c25a8f0d5afdb310107417c`.

The harness uses a deterministic offline materialization of the same factory-consumer
contract so the proof is repeatable without network or cloud credentials. The Wave 2
integration checkpoint binds the independently passed W2-01, W2-03, W2-04, and W2-05
branches together before W2-02 is executed.

## Evidence files

- `browser/public-desktop.svg` — 1280 × 900 production-render screenshot.
- `browser/public-mobile.svg` — 464 × 844 production-render screenshot. The configured test viewport was 390 × 844.
- `apps/cms/scripts/w2-04-seed.ts` — disposable real Payload data seed.
- `apps/cms/scripts/w2-04-browser-proof.mjs` — REST/privacy/browser assertions.
- `scripts/w2-04-local-proof.sh` — fail-closed local production proof harness.

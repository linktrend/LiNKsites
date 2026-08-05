# W2-04 implementation handoff

**Candidate status:** HOLD — local implementation checks are recorded below; this is not
a W2-04 acceptance verdict.

This worktree contains the W2-04 frontend implementation only. The local fixture at
`apps/web-master/data/w2-04-published-fixture.json` is an explicit published-content
contract fixture, not evidence of a live Payload instance or W2-03 promotion.

## Scope

- `marketing-smb-v1` remains the reusable web-master entry point.
- Public pages read published, site-scoped Payload content and controlled-fail on missing, malformed, unpublished, or unknown-tenant content.
- Canonical legal routes and the AI markdown surface read the same published `pages` contract; they do not bypass it through legacy legal collections or an external legal API.
- `/[lang]/demo/[token]/[[...slug]]` is a private preview wall. It requires `PREVIEW_ACCESS_TOKEN`, emits `noindex,nofollow`, and uses private no-store caching.
- `/api/healthz` is a liveness endpoint; `/api/readyz` fails when CMS configuration is invalid.
- No CMS promotion, publication, deployment, DNS, or external live mutation was performed.

## Required route matrix

| Route | Source | Status |
| --- | --- | --- |
| home, about, services | `pages` published content | fixture-covered |
| contact | `pages` published content | fixture-covered; submission remains non-submitting |
| privacy / terms | `pages` published content | fixture-covered through the canonical page contract |
| not-found / error | Next.js boundaries | source-covered |
| private demo | same published page query behind token wall | source-covered |

## W2-03 integration handoff

W2-03 must provide the real local Payload URL/configuration, published document IDs,
revision/checksum receipts, anonymous published-read proof, and promotion/publication
separation evidence. Replace the fixture environment with that exact published contract
and rerun the frontend/browser gates before claiming live W2-03 proof.

## Local adversarial coverage

The focused contract test also checks that shared Payload tenant resolution has no
`DEFAULT_SITE_ID` fallback, unpublished pages are rejected, Payload `layout` content
is normalized only when the document is explicitly published, legal routes cannot use
the legacy legal API, the fixture adapter cannot synthesize tenant/locale or hostname
mapping data, and reusable template components contain no hard-coded demo
signup/pricing/background fallbacks.

## Validation recorded for this candidate

- `pnpm test:w2-04` — focused contract checks passed.
- `pnpm --filter @linksites/web-master typecheck` — passed.
- `pnpm --filter @linksites/web-master lint` — passed.
- `pnpm --filter @linksites/web-master build` — production build completed; Next reported
  only its existing middleware-to-proxy deprecation warning.

These are local candidate checks, not a W2-04 PASS. W2-01 and W2-03 dependency holds,
the missing linked-library receipt, and absent live Payload/deployment/browser evidence
remain open.

## Library boundary

No LiNKlibraries files were changed in this implementation. The repository still has the
W1 migration-source boundary and no approved external `marketing-smb-v1` artifact SHA was
available to pin. A separate exact linked-library worktree/branch is required before the
W2-04 library acceptance gate can pass.

# W2-04 implementation handoff

**Candidate status:** HOLD — local implementation checks are recorded below; this is not
a W2-04 acceptance verdict.

This worktree contains the W2-04 frontend implementation only. The local fixture at
`apps/web-master/data/w2-04-published-fixture.json` is an explicit published-content
contract fixture, not evidence of a live Payload instance or W2-03 promotion.

## Scope

- `marketing-smb-v1` remains the reusable web-master entry point.
- Public pages read published, site-scoped Payload content and controlled-fail on missing, malformed, unpublished, or unknown-tenant content. Hostname resolution additionally requires an explicit CMS site with `status: published` and at least one published page; a configured `SITE_ID` is subject to the same proof.
- Canonical legal routes and the AI markdown surface read the same published `pages` contract; they do not bypass it through legacy legal collections or an external legal API.
- `/[lang]/demo/[token]/[[...slug]]` is a private preview wall. It requires `PREVIEW_ACCESS_TOKEN`, selects only `previewEnvironment: private-preview` pages, emits `noindex,nofollow`, and uses private no-store caching.
- `/api/healthz` is a liveness endpoint; `/api/readyz` fails when CMS configuration is invalid.
- No CMS promotion, publication, deployment, DNS, or external live mutation was performed.

## Required route matrix

| Route | Source | Status |
| --- | --- | --- |
| home, about, services | `pages` published content | fixture-covered |
| contact | `pages` published content | fixture-covered; submission remains non-submitting |
| privacy / terms | `pages` published content | fixture-covered through the canonical page contract |
| not-found / error | Next.js boundaries | source-covered |
| private demo | private-preview page query behind token wall | source-covered |

## W2-03 integration handoff

W2-03 must provide the real local Payload URL/configuration, published document IDs,
revision/checksum receipts, anonymous published-read proof, and promotion/publication
separation evidence. Replace the fixture environment with that exact published contract
and rerun the frontend/browser gates before claiming live W2-03 proof.

## Local adversarial coverage

The focused contract and behavioral tests also check that tenant resolution has no
default-site fallback, unmapped/draft/archived/unpublished sites fail closed, published
content is required before serving a tenant, unpublished pages are rejected, Payload
`layout` content is normalized only when the document is explicitly published, legal
routes cannot use the legacy legal API, fixture mode requires explicit published site
and hostname mapping records, and reusable template components contain no hard-coded
demo signup/pricing/background fallbacks. Public audience selection rejects private
preview and unknown environment markers; the token-gated route selects only private
preview content.

## Validation recorded for this candidate

- `pnpm test:w2-04` — focused contract and behavioral adversarial checks passed.
- `pnpm --filter @linksites/web-master typecheck` — passed.
- `pnpm --filter @linksites/web-master lint` — passed.
- `pnpm --filter @linksites/web-master build` — production build completed; Next reported
  only its existing middleware-to-proxy deprecation warning.

These are local candidate checks, not a W2-04 PASS. W2-01 and W2-03 dependency holds,
the missing linked-library receipt, and absent live Payload/deployment/browser evidence
remain open.

## Terra re-audit local execution receipt — 2026-08-05 (Asia/Taipei)

**Tested candidate source SHA:** `c93e84181075af0129211161c56a70af13f95386`
(`fix(w2-04): close public surface and admission holds`). This receipt binds only the
source candidate named above; it is not a hosted, VPS, DNS, credential, or deployment
attestation.

Executed locally from this worktree:

| Command | Result | What it proves locally |
| --- | --- | --- |
| `pnpm test:w2-04` | PASS | Contract and adversarial route checks for the required route set, published-only admission, fail-closed tenant/audience selection, and the private token wall/noindex/nofollow/no-store policy. The script ran Node test files; it did not start Payload or a browser. |
| `pnpm --filter @linksites/web-master typecheck` | PASS | TypeScript type checking for the web-master source. |
| `pnpm --filter @linksites/web-master lint` | PASS | ESLint checks for `apps/web-master/src`. |
| `pnpm --filter @linksites/web-master build` | PASS | A local optimized Next.js production build. Next.js emitted its existing middleware-to-proxy deprecation warning; no build failure occurred. |

No existing W2-04 package-script entrypoint executed a real local Payload instance,
opened a browser, or produced browser screenshots, accessibility scan results,
responsive-viewport results, or deterministic visual-regression artifacts. Therefore
this receipt does **not** claim local browser, accessibility, responsive, visual, or
real-Payload proof. The private-access result above is source/contract-test coverage
only; it is not an interactive browser authorization proof.

**HOLD — implementation/integration gap:** W2-04 still needs a runnable real local
Payload fixture supplied through the W2-03 handoff and a browser entrypoint that records
the required protected-access, accessibility, responsive, and visual evidence against
that published content. W2-01/W2-03 are upstream receipt references only; their proof
is neither copied nor reasserted here.

## Library boundary

No LiNKlibraries files were changed in this implementation. The repository still has the
W1 migration-source boundary and no approved external `marketing-smb-v1` artifact SHA was
available to pin. A separate exact linked-library worktree/branch is required before the
W2-04 library acceptance gate can pass.

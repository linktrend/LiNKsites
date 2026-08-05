# W2-04 implementation handoff

This worktree contains the W2-04 frontend implementation only. The local fixture at
`apps/web-master/data/w2-04-published-fixture.json` is an explicit published-content
contract fixture, not evidence of a live Payload instance or W2-03 promotion.

## Scope

- `marketing-smb-v1` remains the reusable web-master entry point.
- Public pages read published, site-scoped Payload content and controlled-fail on missing or malformed content.
- `/[lang]/demo/[token]/[[...slug]]` is a private preview wall. It requires `PREVIEW_ACCESS_TOKEN`, emits `noindex,nofollow`, and uses private no-store caching.
- `/api/healthz` is a liveness endpoint; `/api/readyz` fails when CMS configuration is invalid.
- No CMS promotion, publication, deployment, DNS, or external live mutation was performed.

## Required route matrix

| Route | Source | Status |
| --- | --- | --- |
| home, about, services | `pages` published content | fixture-covered |
| contact | `pages` published content | fixture-covered; submission remains non-submitting |
| privacy / terms | Payload policy collections | fixture-covered through published page contract |
| not-found / error | Next.js boundaries | source-covered |
| private demo | same published page query behind token wall | source-covered |

## W2-03 integration handoff

W2-03 must provide the real local Payload URL/configuration, published document IDs,
revision/checksum receipts, anonymous published-read proof, and promotion/publication
separation evidence. Replace the fixture environment with that exact published contract
and rerun the frontend/browser gates before claiming live W2-03 proof.

## Library boundary

No LiNKlibraries files were changed in this implementation. The repository still has the
W1 migration-source boundary and no approved external `marketing-smb-v1` artifact SHA was
available to pin. A separate exact linked-library worktree/branch is required before the
W2-04 library acceptance gate can pass.

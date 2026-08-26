# LS-07 ISS-22..24 implementation evidence (issue #333)

## Scope

Implemented the owned LS-07 surfaces for ISS-22, ISS-23 and ISS-24:

- pre-hydration semantic HTML contract
- visible-fact JSON-LD
- one published authority for canonical/hreflang, sitemap, robots, `llms.txt` and AI projections
- real contact/newsletter hooks with consent, abuse and failure handling; booking/ecommerce remain inactive unless a real hook exists; no fake success
- accessibility matrix, lab performance budgets and responsive/visual regression fixtures

Manual keyboard/contrast/motion checks and WCAG legal certification are labeled `lab/manual` / `not-claimed`.

## Validation

- `node --test scripts/profile-v2-quality/ls07/tests/test_ls07_quality_harness.mjs` — 15 passed
- `npx tsx --test tests/ls07-iss-22-24.test.ts` (apps/web-master) — 10 passed
- `npx tsx --test tests/ls06-iss-19-21.test.ts` — 8 passed (no LS-06 regression)
- `git diff --check` — pass

## Rollback

Discoverability rollback is readback-bound (`ls07-discoverability-rollback/v1`), restores without a provider checkout, and does not mutate runtime.

## Non-claims

Field Web Vitals, live A1 paired browser proof (LS-08), and legal accessibility certification are out of this packet.

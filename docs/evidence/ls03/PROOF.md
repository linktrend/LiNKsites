# LS-03 evidence (ISS-10, ISS-11, ISS-12)

Idempotency: `cursor-cloud-dispatch-v1:linksites-ls03-274-base9da7197e`

## Attested base

- Repository: `https://github.com/linktrend/LiNKsites`
- Branch: `issue/274-ls-03-payload-semantic-models-and-migrations`
- Isolated worktree from exact `origin/development`
- Commit: `9da7197ef8b0f953508c2361c609fae5a643c746`
- Tree: `1f9eb7cb8d569c78dd50a482d6b7ce985c2cff90`

## Dependency evidence (pins only; no copied provider/Harness source)

- MWT-02 provider `candidateTree`: `0178894d6ce718bb7dff3c141892f82144e2d18c`
- H-09 protected tree: `6cab53da19ba390d392157dbcc38979f1a6c86b5`
- LS-02 factory-catalog APIs were not modified.

## Implementation

- ISS-10: immutable `template-adoptions` and `entitlement-snapshots` collections/records. Free-text template IDs remain deprecated projections. Offers and Cases remain compatibility projections.
- ISS-11: tenant/locale/lifecycle/provenance-safe Products, Services, Results/Work, Articles, Videos, FAQ/Help, Team, Locations, Service Areas, Policies, and typed `core-settings`. Products and Services stay distinct.
- ISS-12: additive one-owner Payload migration `20260824_000001_ls03_semantic_models` and Supabase `lsites_sites` migration `20260824_000001_ls03_payload_semantic_models`. Applied Payload migrations were not rewritten. Generated Payload types were regenerated. Fresh, production-shaped upgrade, failed SHA-1, Offer/Case compatibility, and rollback fixtures ship under `supabase/tests/fixtures/`.

## Runtime attestation (provenance only)

- Named environment: `IDE Development 2.5.1` (`1937ddb1-9d3e-11f1-a7d1-d6b4613131ce`)
- Environment version: `cac43460-9d4b-11f1-a7d1-d6b4613131ce`
- Cloud run: `bc-34e6ad01-bbf9-4681-bba2-7305af2e93f4`
- Selector / originalModelName: `cursor-grok-4.6-medium`
- Semantic model: grok-4.6, effort=medium, Fast not asserted true (`fast=false`)
- Environment build `bld-20260824-e5da20dc-4098-4bc1-b0fe-c3423523113d` is provenance-only and is not product validation.

## Validation

- Focused CMS contract tests: 14 passed (`ls03-semantic-models`, `ls03-migrations`)
- Broader contracts file run: 24 passed; `site-scoping` and `publish-permissions` collect-fail on the scanner-safe `DATABASE_URI` placeholder (pre-existing Payload config guard; not LS-03 schema assertions)
- Typecheck: `pnpm --filter @linksites/cms typecheck` passed
- Generated types: `tsx scripts/generate-ls03-types.ts` and `LINKSITES_BUILD_NO_DATABASE=1 pnpm generate:types`
- `git diff --check` passed
- `python3 scripts/gitops/secret_scan.py` ok
- Live PostgreSQL upgrade/failure apply was not available in this environment; fixtures and Payload `down()` rollback were proven by contract tests

## Implementation checkpoint

Filled in the follow-up evidence commit after the implementation SHA exists.

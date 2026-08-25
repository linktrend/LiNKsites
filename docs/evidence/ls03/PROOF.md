# LS-03 repair evidence (issue #275)

Idempotency: `cursor-cloud-dispatch-v1:linksites-ls03-275-repair-base9da7197e`

This is a governed repair of rejected LS-03 / ISS-10..12 checkpoint
`906f5b0d913acfdc59b7147103224dbefad8bc92` / tree
`143daf3dd1663c124cf857393685f585cb74e20c` (issue #274). Product scope was not
expanded.

## Attested base (before mutation)

- Repository: `https://github.com/linktrend/LiNKsites`
- Origin: `github.com/linktrend/LiNKsites`
- Branch: `issue/275-ls-03-repair-add-rls-policies-complete-additive`
- Isolated worktree from exact `origin/development`
- Commit: `9da7197ef8b0f953508c2361c609fae5a643c746`
- Tree: `1f9eb7cb8d569c78dd50a482d6b7ce985c2cff90`

## Repair defects closed

1. Tenant-safe `CREATE POLICY` for every new `lsites_sites` LS-03 table
   (`entitlement_snapshots`, `template_adoptions`,
   `legacy_template_id_projections`, `offer_case_compatibility`) using
   `platform.has_org_access(org_id, 'client_viewer')` for
   `svc_linksites_runtime`. Grants were not weakened.
2. Additive Payload SQL now includes draft/version tables and all five
   provenance columns required by collection hooks. Applied migrations were
   not rewritten.
3. Failed SHA-1 and rollback fixtures are executable; the runner `\i`s both
   and asserts fail-closed / rollback rows plus RLS policy presence.
4. Exact-tip ATTESTATION/PROOF and secret-scan `candidateTree` refresh for
   this repair candidate only.

## Dependency evidence (pins only; no copied provider/Harness source)

- MWT-02 provider `candidateTree`: `0178894d6ce718bb7dff3c141892f82144e2d18c`
- H-09 protected tree: `6cab53da19ba390d392157dbcc38979f1a6c86b5`
- LS-02 factory-catalog APIs were not modified.

## Runtime attestation (provenance only)

- Named environment: `IDE Development 2.5.1` (`1937ddb1-9d3e-11f1-a7d1-d6b4613131ce`)
- Environment version: `cac43460-9d4b-11f1-a7d1-d6b4613131ce`
- Cloud run: `bc-c4033f99-d6e0-4e3f-9f2c-f863eaca5752`
- Selector / originalModelName: `cursor-grok-4.6-medium`
- Semantic model: grok-4.6, effort=medium, Fast not asserted true (`fast=false`)
- Environment build `bld-20260824-7a62ac81-e0fc-4b0c-bd5d-6229f93a21de` is provenance-only and is not product validation.

## Validation

- Focused CMS contract tests: 17 passed (`ls03-semantic-models`, `ls03-migrations`)
- Typecheck: `pnpm --filter @linksites/cms typecheck` passed
- `git diff --check origin/development...HEAD` passed
- `python3 scripts/gitops/secret_scan.py` ok on the evidence-tip tree
- Live PostgreSQL was unavailable: `psql` and `pg_isready` not present;
  `DATABASE_URL` / `DATABASE_URI` unset; TCP `127.0.0.1:5432` connection
  refused. Fixtures and Payload `down()` rollback were proven by contract
  tests. Additive SQL was not applied to a live database in this environment.

## Repair implementation checkpoint (not the successor HEAD)

- SHA: `1d3323e1319c8ccd95a64aa71e1a31c0fd7407e5`
- Tree: `964b8e0d20fb2e3ee52278cacab71686866132d7`

## Successor HEAD bound by this packet

- SHA: `bd0bbabaff413d90ebc6abe492790cca8e77b5d4`
- Tree: `30d8f3c09e0c339e454affc0c49943893628a560`
- This identity correction keeps that successor as the bound repair HEAD
  and updates LS-03 dispatch idempotency from issue 274 to issue 275.

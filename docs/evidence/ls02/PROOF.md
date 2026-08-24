# LS-02 evidence (ISS-07, ISS-08, ISS-09)

Idempotency: `cursor-cloud-dispatch-v1:linksites-ls02-272-base627d6d2`

## Attested base

- Repository: `https://github.com/linktrend/LiNKsites`
- Branch: `issue/272-ls-02-adoption-entitlement-and-deterministic-assembly`
- Isolated worktree from exact `origin/development`
- Commit: `627d6d2ae46dadcf3f8c51d2c8681cba01efc754`
- Tree: `a2601a98bd63fff5e358d8f585ff459969a2cbce`

## Dependency evidence (pins only; no copied provider/Harness source)

- MWT-02 provider `candidateTree`: `0178894d6ce718bb7dff3c141892f82144e2d18c`
- H-09 protected commit: `ad8560b242da0d15c0d65a6c8d4d17a0171e2d2b`
- H-09 protected tree: `6cab53da19ba390d392157dbcc38979f1a6c86b5`

## Implementation

- ISS-07: exact provider/layout/plan/overlay/config/content/adapter/effective identities on Site Specification.
- ISS-08: A/B/C/L credits `A=30 B=15 C=6 L=0`, immutable snapshots, activation/navigation, zero-cost core/legal/system pages.
- ISS-09: deterministic assembly shell/route/schema plans, credit dispositions, stable digests, rejection/rollback proofs.

Existing `resolveSiteSpecification` / `assembleSiteManifest` callers without LS-02 fields keep the prior contract.

## Runtime attestation (provenance only)

- Named environment: `IDE Development 2.5.1` (`1937ddb1-9d3e-11f1-a7d1-d6b4613131ce`)
- Environment version: `cac43460-9d4b-11f1-a7d1-d6b4613131ce`
- Cloud run: `bc-41c19bb8-35df-40af-ad0d-3ad732783692`
- Selector / originalModelName: `cursor-grok-4.6-medium`
- Semantic model: grok-4.6, effort=medium, Fast not asserted true (`fast=false`)
- Environment build is provenance-only and is not product validation.

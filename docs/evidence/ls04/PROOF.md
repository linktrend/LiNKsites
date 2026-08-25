# LS-04 evidence (issue #285)

Idempotency: `cursor-cloud-dispatch-v1:linksites-ls04-285-base6169548`

This packet implements LS-04 only (ISS-13, ISS-14, ISS-15). It does not
claim H-09, H-10, or EXT-LS-01 proof. Provider bytes were not copied.

## Attested base (before mutation)

- Repository: `https://github.com/linktrend/LiNKsites`
- Origin: `github.com/linktrend/LiNKsites`
- Branch: `issue/285-implement-ls-04-working-content-and-typed-promot`
- Commit: `6169548ddbf6bff99a3eb8de3716e9fd3a843b11`
- Tree: `24e5b46566a45a58de3df243b45e7918d419cb2c`
- Working tree: clean

## Implemented

1. **ISS-13 / LS-FR-11:** `produceWorkingContent` accepts optional LS-04
   context (`product` | `service` | `hybrid` | `neither`). Default without
   `ls04` remains the W2-01 service adapter so LS-02/LS-03 callers stay valid.
   Retention lives in `section.content.ls04` (semantic ID, claims/evidence,
   catalog, layered identities) so the working-content DB contract (exactly
   three page/section keys) is preserved.
2. **ISS-14 / LS-FR-12:** `workingContentPayloadPromotion` maps working
   component IDs through the provider semantic map to distinct Payload block
   types (`hero`, `cta`, `offerShowcase`, `articles`) plus `products`,
   `services`, and `core-settings` items. Receipts bind working package,
   assembly, entitlement, adoption, Payload IDs, and readback checksums.
   Primary recorded collection remains `pages`.
3. **ISS-15:** Production rejects fake reviews/credentials, unverifiable
   quantified claims, placeholders, unlicensed media (`none`/`unknown`/empty
   or not in policy), missing required facts, and tenant-isolated identities.
   Promotion rejects a target site/org that does not match retained identities.

## Out of scope (unchanged)

- LS-02 modules (`siteSpecification`, `adoptionIdentities`, `capabilityCredits`,
  `siteAssemblyManifest`) consumed read-only for identity pins.
- LS-03 CMS collections/migrations/`semanticContract.ts`.
- LiNKlibraries provider bytes.
- Applied Supabase working-content migration bytes.

## Dependency evidence (pins only)

- MWT-02 provider `candidateTree`: `0178894d6ce718bb7dff3c141892f82144e2d18c`
- H-09 protected tree: `6cab53da19ba390d392157dbcc38979f1a6c86b5`

## Validation

- Focused factory-catalog tests: 62 passed
  (`ls04WorkingContentPromotion`, `workingContent`, `promotionService`,
  `promotionExecutor`, `ls02AdoptionAssembly`)
- Typecheck: `pnpm --filter @linksites/factory-catalog typecheck` passed
- `git diff --check` passed against the implementation tree
- `python3 scripts/gitops/secret_scan.py` reports pre-existing
  `stale_fixture_declaration` findings on unmanaged fixtures; LS-04 did not
  refresh that catalog (owned by issue #283 / secret-fixture work)

## Implementation checkpoint

- SHA: `400f735d3782fb6532a8400098e8a1ad36f0f283`
- Tree: `d12656ebaddf5d04439be87b05be4b5c47f4e2c8`

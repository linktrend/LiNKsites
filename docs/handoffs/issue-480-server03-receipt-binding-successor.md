# Issue 480 successor handoff — Server03 native Revision 2 receipt binding

This is an implementation handoff for a fresh independent review. It does not
authorize a Phase PR, merge, VPS operation, provider admission, staging/main
promotion, or production release.

## Exact identity

- Repository: `linktrend/LiNKsites`
- Branch: `issue/480-repair-server03-deployment-template-release-stat`
- Review base commit: `2a1ebc93d39dd77a444eee19cf6decc48872b90e`
- Review base tree: `b0cd77e4eef780123a90beed8b6819ee84a82226`
- Prior implementation checkpoint: `3ec1693dc35408701fade9191709f8675eff1c3d`
- Successor implementation checkpoint: `5f4d26292862463b36f5138973bbe5b30a48eec8`
- Successor implementation tree: `e6b8c19582c6da89dfb8b9546142d4ea80e3d70e`
- Successor parent: `8b7eb4a49f4bd7ca6f332477c8a74b4573211d01`
- Verification successor: `db22982c29d43fc04d8e362fa49800cb95fbc3f9`
- Verification successor tree: `9496e65b63f475733c86ab301d8ab0214af74e86`
- Verification successor parent: `5f4d26292862463b36f5138973bbe5b30a48eec8`
- Exact-base ancestry: `2a1ebc9` → `3ec1693` → `8b7eb4a` → `5f4d262` → `db22982`

The implementation checkpoint is pushed to `origin` at the branch named above.

## Implemented boundary

Ready mode now fails closed unless the mounted native Revision 2 receipt:

1. is a confined, regular file and its bytes exactly equal the configured
   receipt JSON;
2. are present as the exact receipt blob in the configured provider commit;
3. pass native v2 consumption or verified-cache shape checks;
4. match the mounted release manifest's entry, version, release source,
   manifest digest, and artifact tree; and
5. match the mounted dependency-lock file, its configured file digest, and its
   canonical dependency projection, while the mounted provider Git HEAD/tree
   match the configured provider identity.

Manifest generation and deployment preflight use the same verifier. Legacy v1
receipts remain rejected. Deferred mode remains receipt-free and continues to
permit infrastructure/service-health acceptance while marking template-
dependent rendering, publishing, intake, and pilot capabilities blocked.

The successor extends the same boundary into the web runtime: production
readiness reads the mounted receipt at `LINKSITES_LINKLIBRARIES_RECEIPT_PATH`,
requires byte-for-byte and SHA-256 equality with the supplied receipt evidence,
passes the explicit receipt through native `validateExactRelease()` over the
complete provider bundle, verifies the mounted provider checkout commit/tree,
and binds entry/version, source-release, artifact-tree, and dependency-lock
identities. An explicit receipt path can no longer fall through to a legacy or
alternate receipt after a read or parse failure.

## Focused proof

Command:

```text
node --test deploy/tests/runtime-contract.test.mjs deploy/tests/deployment-manifest.test.mjs deploy/tests/deployment-surface.test.mjs
```

Result: the deployment/runtime suite passed 32/32; the focused factory-catalog
suite passed 11/11; and the web-master candidate plus readiness suites passed
13/13, including deferred behavior, exact mounted-byte and digest binding,
forged environment bytes, stale mounted receipt bytes, dependency-lock drift,
provider checkout identity drift, native materializer regressions, and legacy
v1 rejection. Affected typechecks passed.

Additional checks passed:

```text
node --check deploy/config/runtime-contract.mjs
node --check deploy/scripts/generate-deployment-manifest.mjs
bash -n deploy/scripts/preflight.sh
git diff --check
```

## Review scope

Review the exact implementation checkpoint against the exact base above. The
checkpoint changes only:

- `deploy/config/runtime-contract.mjs`
- `deploy/scripts/generate-deployment-manifest.mjs`
- `deploy/scripts/preflight.sh`
- `deploy/tests/deployment-manifest.test.mjs`
- `deploy/tests/runtime-contract.test.mjs`

The successor delta adds only:

- `apps/web-master/src/lib/template-admission.ts`
- `packages/factory-catalog/src/revision2Materialization.ts`
- `apps/web-master/tests/production-template-release-readiness.test.ts`

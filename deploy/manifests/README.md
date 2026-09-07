# Release manifests

This directory receives an immutable JSON manifest for each built release; a
manifest is a release artifact, not a hand-maintained environment file. Create
one only after all five deployable images have their registry digests:

```bash
LINKLIBRARIES_CATALOG_SHA=<approved-catalog-sha> \
LINKLIBRARIES_ENTRY_SHA=<approved-entry-sha> \
LINKLIBRARIES_ARTIFACT_PATH=/absolute/path/to/approved-linklibraries-git-checkout \
LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA=<verified-platform-sha> \
LINKSITES_CMS_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_WEB_MASTER_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_ORCHESTRATOR_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_WORKER_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_MIGRATIONS_IMAGE_DIGEST=sha256:<digest> \
node deploy/scripts/generate-deployment-manifest.mjs --output deploy/manifests/<release-sha>.json
```

While `master-template-type-1` is not selectable, generate the infrastructure
manifest without inventing provider identity:

```bash
LINKSITES_CMS_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_WEB_MASTER_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_ORCHESTRATOR_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_WORKER_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_MIGRATIONS_IMAGE_DIGEST=sha256:<digest> \
node deploy/scripts/generate-deployment-manifest.mjs \
  --provider-state pending \
  --platform-state pending \
  --output deploy/manifests/<release-sha>-server03-foundation.json
```

That manifest records the exact blocked provider-dependent capabilities and,
when Platform authority is also pending, the production data-plane HOLD. It is
valid only for artifact installation plus disposable rehearsal until an exact
Platform application receipt exists. It cannot be used by the full-pilot
preflight.

The generator always reads the Payload migration index and records every
imported migration with its checksum. In ready mode it also reads the exact
LiNKlibraries Git commit, records catalog/entry content checksums, and fails
unless the selected catalog entry is approved. Full preflight repeats those
checks against the VPS-mounted checkout; a directory that is not a Git
repository is not a valid ready artifact. Commit the generated release
manifest with its release evidence; never place secrets in it.

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

While `master-template-type-1` is unfinished, use the exact admitted
`marketing-smb-v1` identity in the command above. The manifest records the
replacement in `deferredTemplates` without blocking the active provider.
For artifact inventory only, an unavailable active-provider or production
Platform identity can be recorded explicitly:

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

That pending manifest cannot earn Server03 operational acceptance or pass either
production preflight. Pending active-provider identity is distinct from a deferred
replacement. Use the existing admitted provider for setup and private-site proof;
exact Platform migration authority remains independently required for startup.

The generator always reads the Payload migration index and records every
imported migration with its checksum. In ready mode it also reads the exact
LiNKlibraries Git commit, records catalog/entry content checksums, and fails
unless the selected catalog entry is approved. Full preflight repeats those
checks against the VPS-mounted checkout; a directory that is not a Git
repository is not a valid ready artifact. Commit the generated release
manifest with its release evidence in the immutable release store; do not add a
post-build manifest to the source commit whose identity it records, because
that would change the release SHA. Never place secrets in it.

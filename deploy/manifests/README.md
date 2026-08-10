# Release manifests

This directory receives an immutable JSON manifest for each built release; a
manifest is a release artifact, not a hand-maintained environment file. Create
one only after all five deployable images have their registry digests:

```bash
LINKLIBRARIES_CATALOG_SHA=<approved-catalog-sha> \
LINKLIBRARIES_ENTRY_SHA=<approved-entry-sha> \
LINKLIBRARIES_ARTIFACT_PATH=/absolute/path/to/approved-linklibraries-git-checkout \
LINKSITES_CMS_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_WEB_MASTER_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_ORCHESTRATOR_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_WORKER_IMAGE_DIGEST=sha256:<digest> \
node deploy/scripts/generate-deployment-manifest.mjs --output deploy/manifests/<release-sha>.json
```

The generator reads the Payload migration index and records every imported
migration with its checksum. It also reads the exact LiNKlibraries Git commit,
records catalog/entry content checksums, and fails unless the selected catalog
entry is approved. Preflight repeats those checks against the VPS-mounted
checkout; a directory that is not a Git repository is not a valid artifact.
Commit the generated release manifest with its release evidence; never place
secrets in it.

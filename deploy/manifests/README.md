# Release manifests

This directory receives an immutable JSON manifest for each built release; a
manifest is a release artifact, not a hand-maintained environment file. Create
one only after all four images have their registry digests:

```bash
LINKLIBRARIES_CATALOG_SHA=<approved-catalog-sha> \
LINKLIBRARIES_ENTRY_SHA=<approved-entry-sha> \
LINKSITES_CMS_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_WEB_MASTER_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_ORCHESTRATOR_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_WORKER_IMAGE_DIGEST=sha256:<digest> \
node deploy/scripts/generate-deployment-manifest.mjs --output deploy/manifests/<release-sha>.json
```

The generator fails if an identity is absent, mutable, or placeholder-shaped.
Commit the generated release manifest with its release evidence; never place
secrets in it.

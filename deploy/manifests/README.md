# Release manifests

This directory receives an immutable JSON manifest for each built release; a
manifest is a release artifact, not a hand-maintained environment file. Create
one only after all five deployable images have their registry digests:

```bash
LINKLIBRARIES_ARTIFACT_PATH=/absolute/path/to/linklibraries-git-checkout \
LINKSITES_TEMPLATE_ID=master-template-type-1 \
LINKSITES_TEMPLATE_VERSION=2.0.0-a1.1 \
LINKSITES_TEMPLATE_FORMAT=revision2 \
LINKSITES_LINKLIBRARIES_ROOT=/opt/linksites/linklibraries \
LINKSITES_LINKLIBRARIES_COMMIT_SHA=<native-v2-provider-commit-sha> \
LINKSITES_LINKLIBRARIES_TREE_SHA=<native-v2-provider-tree-sha> \
LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256=<native-v2-dependency-lock-sha-256> \
LINKSITES_LINKLIBRARIES_RECEIPT_PATH=/opt/linksites/linklibraries/receipt.json \
LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA=<verified-platform-sha> \
LINKSITES_CMS_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_WEB_MASTER_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_ORCHESTRATOR_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_WORKER_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_MIGRATIONS_IMAGE_DIGEST=sha256:<digest> \
node deploy/scripts/generate-deployment-manifest.mjs --provider-state deferred --output deploy/manifests/<release-sha>.json
```

While `master-template-type-1` is unfinished, use `--provider-state deferred`.
This permits infrastructure/application runtime acceptance while explicitly
blocking template-dependent publishing. No v1 catalog row is admitted or used.
For an inventory-only manifest when the production Platform identity is absent:

```bash
LINKLIBRARIES_ARTIFACT_PATH=/absolute/path/to/linklibraries-git-checkout \
LINKSITES_TEMPLATE_ID=master-template-type-1 \
LINKSITES_TEMPLATE_VERSION=2.0.0-a1.1 \
LINKSITES_TEMPLATE_FORMAT=revision2 \
LINKSITES_LINKLIBRARIES_ROOT=/opt/linksites/linklibraries \
LINKSITES_LINKLIBRARIES_COMMIT_SHA=<native-v2-provider-commit-sha> \
LINKSITES_LINKLIBRARIES_TREE_SHA=<native-v2-provider-tree-sha> \
LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256=<native-v2-dependency-lock-sha-256> \
LINKSITES_LINKLIBRARIES_RECEIPT_PATH=/opt/linksites/linklibraries/receipt.json \
LINKSITES_CMS_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_WEB_MASTER_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_ORCHESTRATOR_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_WORKER_IMAGE_DIGEST=sha256:<digest> \
LINKSITES_MIGRATIONS_IMAGE_DIGEST=sha256:<digest> \
node deploy/scripts/generate-deployment-manifest.mjs \
  --provider-state deferred \
  --platform-state pending \
  --output deploy/manifests/<release-sha>-server03-foundation.json
```

That deferred manifest can pass the infrastructure preflight only after the exact
Platform authority is supplied; it cannot activate template-dependent publishing.
`pending`, unknown, quarantined, and missing template states are rejected by the
runtime contract.

The generator always reads the Payload migration index and records every
imported migration with its checksum. In ready mode it records the exact native
v2 provider commit/tree and passing consumption or verified-cache receipt. Full
preflight repeats those identity checks against the VPS-mounted checkout; a
directory that is not a Git repository is not a valid ready artifact. Commit the generated release
manifest with its release evidence in the immutable release store; do not add a
post-build manifest to the source commit whose identity it records, because
that would change the release SHA. Never place secrets in it.

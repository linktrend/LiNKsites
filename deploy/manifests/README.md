# Release manifests

This directory receives an immutable JSON manifest for each built release; a
manifest is a release artifact, not a hand-maintained environment file. Create
one only after all five deployable images have their registry digests:

```bash
LINKSITES_TEMPLATE_ID=master-template-type-1 \
LINKSITES_TEMPLATE_VERSION=2.0.0-a1.1 \
LINKSITES_TEMPLATE_FORMAT=revision2 \
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
For a ready manifest, supply the provider checkout, exact provider identity,
receipt, and complete native Revision 2 catalogue/inventory inputs. For an
inventory-only deferred manifest when the production Platform identity is absent:

```bash
LINKSITES_TEMPLATE_ID=master-template-type-1 \
LINKSITES_TEMPLATE_VERSION=2.0.0-a1.1 \
LINKSITES_TEMPLATE_FORMAT=revision2 \
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

That deferred manifest is an inventory-only artifact: it records the immutable
images and explicitly remains deployment-ineligible until an exact Platform
migration admission is available. It cannot pass operational preflight or start
production services. Regenerate a separate manifest with
`--platform-state ready` and the admitted Platform migration SHA before running
preflight. `pending`, unknown, quarantined, and missing template states are
rejected by the runtime contract.

The generator always reads the Payload migration index and records every
imported migration with its checksum. In ready mode it records the exact native
v2 provider commit/tree and passing consumption or verified-cache receipt. Full
preflight repeats those identity checks against the VPS-mounted checkout; a
directory that is not a Git repository is not a valid ready artifact. Commit the generated release
manifest with its release evidence in the immutable release store; do not add a
post-build manifest to the source commit whose identity it records, because
that would change the release SHA. Never place secrets in it.

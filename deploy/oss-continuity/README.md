# LiNKsites OSS continuity manifest contract

This directory holds the Issue 542 contract for **external** open-source
material required to rebuild and operate a five-image LiNKsites release.

It is a fail-closed generator and verifier. It does **not** vendor
dependencies, create an active fork, download artifacts, publish images, or
claim that the LiNKtrend archive or the five-image release is complete.

## Evidence classes

- `planning` — source identities taken from the lockfile, production
  Dockerfiles and the five-image publication workflow. Archive locations,
  licence bundles, readback and rollback remain unproven.
- `archive-proof` — every required component has a LiNKtrend-controlled
  read-only archive URI, checksum, licence, provenance, compatibility and a
  tested rollback target. Publication may set `continuityClaimed` only after
  the verifier accepts this class.

`PLANNING_NOT_A_CONTINUITY_CLAIM` is the publication-workflow sentinel that
keeps image publication from claiming OSS continuity.

## Commands

```
node deploy/scripts/generate-oss-continuity-manifest.mjs --output <path> [--receipts <file-or-PLANNING_NOT_A_CONTINUITY_CLAIM>]
node deploy/scripts/verify-oss-continuity-manifest.mjs --manifest <path> [--allow-planning|--require-archive-proof]
```

Floating tags (`latest`, `@v4`, undigested image names) are never production
identities. A passing synthetic fixture is not a live archive.

# Profile authoring

A Program Profile is a schema-validated JSON record plus ports. LiNKdeveloper
and LiNKsites remain separate Programs. They pin an exact Harness release;
they do not copy Harness source.

## Record shape

`ProfileRecord` (`packages/contracts/src/types.ts`) requires:

- `identity` (`identityType: "profile"`, `id`, `version`)
- `compatibleHarnessRange` (closed range `>=x.y.z <x.y.z`)
- `program`, `modules`, `phases`, `issues`
- `adapters[]` with `adapterId` and `contractVersion`
- `redaction.deniedPaths`
- `compatibility` (`contractName`, `contractVersion`, `compatibleRange`,
  `migrations[]`)

Every mutable record includes Program identity, version, timestamps, and
actor. Unknown fields fail validation.

Example: `packages/profile-sdk/fixtures/minimal-profile.json`.

## Loader, plan, inspect

```bash
pnpm --filter @linktrend/linkharness-cli run linkharness -- validate path/to/profile.json
pnpm --filter @linktrend/linkharness-cli run linkharness -- plan path/to/profile.json
pnpm --filter @linktrend/linkharness-cli run linkharness -- inspect path/to/profile.json
pnpm --filter @linktrend/linkharness-cli run linkharness -- conformance path/to/profile.json
```

`loadProfile` validates then SHA-256-canonical-digests the record.
`planProfile` topological-sorts modules, walks phase issue lists, and
rejects dangling ids, ownership mismatch, and module cycles. Plan digest
must be deterministic across loads.

`profilePortFromRecord` exposes `identity`, `compatibleHarnessRange`,
`definition`, `enabledAdapters`, `redaction`, and `compatibility`.

## What a Profile may not do

- access DBOS internals or mutate Harness tables
- bypass the executor broker
- invent lifecycle states
- replace the evidence/approval store
- copy domain code into LiNKharness
- treat unavailable credentials as PASS

Domain workflow, executor policy, permissions, budgets, gates, evidence
meaning, compensation hooks, and operator language belong in the Profile.

## Version and migration handlers

`negotiateVersion` accepts `^major.minor.patch` or `>=min <max`.
`negotiateMigration` allows same-major upgrades without a handler. Crossing
a major requires `compatibility.migrations[]` with `from`, `to`, `breaking`,
and `handlerId`. Missing declarations return `missing_migration`.

Profile-declared migration/rollback handlers run in the Profile package, not
in `db/migrations`. SQL Ledger upgrades are [operations/migration.md](../operations/migration.md).

## Conformance consumers

H-09 receipts for LiNKdeveloper and LiNKsites live under
`docs/evidence/consumer-conformance/**` and bind exact Harness/Profile digest
pairs. A later core change invalidates those receipts until they are rebound.

`runConformance` uses deterministic fake adapters, clock, ids, and storage.
It does not prove hosted executors.

## Rollback

1. Keep the previous Profile JSON and its digest.
2. Point the Program pin at that digest (compatibility checks must still
   pass against the Harness range).
3. If the Profile handler was breaking, restore Program data from the backup
   taken before the handler ran.
4. Re-run `validate` / `plan` / `conformance` on the restored Profile file.
5. Do not silently accept a newer major.
6. Guide-only rollback: revert the ISS-31 documentation commit
   ([guides README](README.md#rollback-of-these-guides)).

LiNKsites Master Template adoption/rollback and LiNKdeveloper generated-app
lifecycle remain Profile-owned; Harness only supplies the universal
cancel/resume/evidence machinery.

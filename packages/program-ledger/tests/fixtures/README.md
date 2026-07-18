# Test fixtures

## `20260714_000001_platform_foundation.sql`

A **verbatim, vendored copy** of the shared platform foundation migration whose
canonical source lives in the sibling **LiNKplatform** repository at
`supabase/migrations/20260714_000001_platform_foundation.sql`.

### Why it is here

`supabase/migrations/20260715_000001_lsites_sites_core.sql` (this repo) cannot be
evaluated in isolation: its row-level-security policies call
`platform.has_org_access()` and its `sites.org_id` FK references
`platform.organizations`, both defined by that platform migration (see ADR 0003
and the lsites migration's own header). The tenant-isolation negative test matrix
(`../tenant-isolation.spec.ts`) therefore applies **both** migrations to an
embedded Postgres engine.

This vendored copy keeps that suite runnable in CI, where only the LiNKsites repo
is checked out and the sibling LiNKplatform repo is not present.

### Keeping it in sync (do not edit by hand)

`tenantIsolation.harness.ts` prefers the live sibling-repo file when it is
reachable (local dev / this repo's operator environments) and only falls back to
this copy otherwise. When the sibling is reachable, `tenant-isolation.spec.ts`
asserts this file is **byte-identical** to the source, so any drift fails the
test locally before it can be committed.

If the platform foundation migration changes upstream, refresh this copy:

```bash
cp ../../../../../LiNKplatform/supabase/migrations/20260714_000001_platform_foundation.sql .
```

(or point `LINKPLATFORM_MIGRATIONS_DIR` at the sibling repo's migrations dir).

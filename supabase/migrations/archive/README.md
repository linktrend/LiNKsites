# Archived migrations

`20260331_000001_lsites_init.sql` — the original mirror-pattern schema
(`lsites_core`), superseded by `20260715_000001_lsites_sites_core.sql`
(`lsites_sites`, org-aware, sync_ingress/sync_jobs removed). See
`docs/adr/0003-retire-mirror-pattern-and-adopt-shared-platform-org-model.md`.

Never apply this file to `linkplatform-stage`/`linkplatform-prod` — it was
never applied to any live database and is kept only as a historical record
of the original design.

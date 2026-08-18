# Supabase Setup (Payload CMS Database)

You can run the CMS app on your VPS, while using Supabase for the PostgreSQL database (no database server on the VPS).

## What Supabase Is Doing Here

- Supabase = managed Postgres database (plus dashboard/tools)
- Your VPS = runs the CMS + shared frontend
- The CMS connects to Supabase using `DATABASE_URI`

## Steps

1. Create a Supabase project
1. In Supabase Dashboard, find the Postgres connection string
   - Use the “direct” connection (usually port `5432`) for a VPS app.
   - If you later run into connection limits, switch to the pooler string.
1. Put the connection string in:
   - `/Users/linktrend/Projects/LiNKsites/apps/cms/.env` as `DATABASE_URI=...`
1. Set a strong `PAYLOAD_SECRET` (32+ characters).
1. Start the CMS. On first run, Payload will create tables (it runs in “push” mode in dev).

## Example `DATABASE_URI`

```text
ltfx.db.uri.postgresql.8bb6dd3256.v1
```

Notes:
- TLS: the CMS config enables SSL automatically when it detects `supabase.com` in the DB host.
- If you use the pooler connection string, it will usually be port `6543`.

## LiNKsites Schema + Search Path (Required)

- LiNKsites owns the `lsites_core` schema only.
- Every LiNKsites connection string must set `search_path=lsites_core,public`.
- No LiNKsites tables should ever be created in `public`.

Example (appended to `DATABASE_URI`):

```text
ltfx.db.uri.postgresql.7f2d9a9e3a.v1
```

## Migration Naming + Governance (LiNKsites)

- Naming: `YYYYMMDD_HHMMSS_lsites_<change>.sql`
- Required sections: `-- migrate:up`, `-- migrate:down`, grants/revokes, RLS policies, verification queries
- Migrations must be executed by `svc_migrator` only

## Common Gotchas

- Wrong string: make sure it starts with `postgres:" + "//` or `postgresql:" + "//`.
- “No DB on VPS”: that’s expected. The DB lives in Supabase.
- Media uploads: Payload `media` is stored on the CMS filesystem by default (upload dir `media/`). On VPS, ensure the CMS has persistent storage (volume) or switch to object storage later.

import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { PGlite } from '@electric-sql/pglite'

export type SqlQueryExecutor = {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>
}

export type SqlDatabase = PGlite & SqlQueryExecutor & {
  transaction?: <T>(callback: (tx: { query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }> }) => Promise<T>) => Promise<T>
}

const DATABASE_SCHEMA = `
create schema if not exists platform;
create schema if not exists lsites_sites;
create table if not exists platform.organizations (id uuid primary key);
create table if not exists lsites_sites.sites (id uuid primary key, org_id uuid not null references platform.organizations(id));
do $$ begin
  if not exists (select 1 from pg_type where typname = 'working_content_state' and typnamespace = 'lsites_sites'::regnamespace) then
    create type lsites_sites.working_content_state as enum ('working','ready_for_gate','accepted','promoted','superseded','rejected');
  end if;
  if not exists (select 1 from pg_type where typname = 'working_gate_outcome' and typnamespace = 'lsites_sites'::regnamespace) then
    create type lsites_sites.working_gate_outcome as enum ('pending','accepted','rejected');
  end if;
end $$;
create table if not exists lsites_sites.working_packages (
  working_package_id text primary key, template_id text not null default 'master-template-type-1' check (template_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'), org_id uuid not null references platform.organizations(id),
  lead_id text not null, site_id uuid not null references lsites_sites.sites(id), current_version integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (org_id, lead_id, site_id)
);
create table if not exists lsites_sites.working_content_versions (
  working_package_id text not null references lsites_sites.working_packages(working_package_id), version_number integer not null,
  schema_version_major smallint not null, schema_version_minor smallint not null, template_id text not null default 'master-template-type-1' check (template_id ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'),
  org_id uuid not null references platform.organizations(id), lead_id text not null, site_id uuid not null references lsites_sites.sites(id),
  program_ref text not null, run_id text, parent_version_number integer, author_id text not null, executor_id text not null,
  content_payload jsonb not null, asset_refs jsonb not null, library_refs jsonb not null, provenance jsonb not null,
  content_checksum text not null, lifecycle_state lsites_sites.working_content_state not null default 'working',
  gate_outcome lsites_sites.working_gate_outcome not null default 'pending', gate_reference text, gate_evidence_refs jsonb not null default '[]'::jsonb,
  promotion_idempotency_key text, payload_target_collection text, payload_document_id text, payload_draft_revision text,
  promotion_receipt_id text, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  primary key (working_package_id, version_number), unique (org_id, promotion_idempotency_key)
);
create table if not exists lsites_sites.working_content_promotion_receipts (
  promotion_receipt_id text primary key, schema_version_major smallint not null default 1, schema_version_minor smallint not null default 0,
  org_id uuid not null references platform.organizations(id), working_package_id text not null, version_number integer not null,
  promotion_idempotency_key text not null, content_checksum text not null, payload_target_collection text not null,
  payload_document_id text, payload_draft_revision text, receipt jsonb not null, created_at timestamptz not null default now(),
  unique (org_id, promotion_idempotency_key), foreign key (working_package_id, version_number)
    references lsites_sites.working_content_versions(working_package_id, version_number)
);
create table if not exists lsites_sites.payload_drafts (
  id text primary key, collection text not null, external_key text not null, data jsonb not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (collection, external_key)
);
`

const databases = new Map<string, { promise: Promise<SqlDatabase>; refs: number }>()

export async function openLocalDatabase(path: string, orgUuid: string, siteUuid: string): Promise<SqlDatabase> {
  let entry = databases.get(path)
  if (entry) {
    entry.refs += 1
    const db = await entry.promise
    await ensureTenantRows(db, orgUuid, siteUuid)
    return db
  }
  const opening = (async () => {
    await mkdir(dirname(path), { recursive: true })
    const db = new PGlite(path) as unknown as SqlDatabase
    await db.exec(DATABASE_SCHEMA)
    await ensureTenantRows(db, orgUuid, siteUuid)
    return db
  })()
  entry = { promise: opening, refs: 1 }
  databases.set(path, entry)
  try {
    return await opening
  } catch (error) {
    databases.delete(path)
    throw error
  }
}

export async function closeLocalDatabase(path: string, db: SqlDatabase): Promise<void> {
  const entry = databases.get(path)
  if (!entry) return
  const current = await entry.promise
  if (current !== db) return
  entry.refs -= 1
  if (entry.refs > 0) return
  databases.delete(path)
  await db.close()
}

export async function ensureTenantRows(db: SqlDatabase, orgUuid: string, siteUuid: string): Promise<void> {
  await db.query('insert into platform.organizations (id) values ($1) on conflict do nothing', [orgUuid])
  await db.query('insert into lsites_sites.sites (id, org_id) values ($1, $2) on conflict do nothing', [siteUuid, orgUuid])
}

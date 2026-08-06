import { createServer, type Server } from 'node:http'
import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { PGlite } from '@electric-sql/pglite'

export type SqlDatabase = PGlite & {
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
  working_package_id text primary key, template_id text not null, org_id uuid not null references platform.organizations(id),
  lead_id text not null, site_id uuid not null references lsites_sites.sites(id), current_version integer not null default 0,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique (org_id, lead_id, site_id)
);
create table if not exists lsites_sites.working_content_versions (
  working_package_id text not null references lsites_sites.working_packages(working_package_id), version_number integer not null,
  schema_version_major smallint not null, schema_version_minor smallint not null, template_id text not null,
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

export class LocalPayloadProcess {
  private server: Server | null = null
  private address = ''

  constructor(private readonly db: SqlDatabase) {}

  async start(): Promise<string> {
    if (this.server) return this.address
    this.server = createServer((request, response) => { void this.handle(request, response) })
    await new Promise<void>((resolve, reject) => {
      this.server?.once('error', reject)
      this.server?.listen(0, '127.0.0.1', () => resolve())
    })
    const address = this.server.address()
    if (!address || typeof address === 'string') throw new Error('Payload service did not expose a TCP address')
    this.address = `http://127.0.0.1:${address.port}`
    return this.address
  }

  async close(): Promise<void> {
    if (!this.server) return
    await new Promise<void>((resolve) => this.server?.close(() => resolve()))
    this.server = null
  }

  private async handle(request: import('node:http').IncomingMessage, response: import('node:http').ServerResponse): Promise<void> {
    try {
      const url = new URL(request.url ?? '/', 'http://127.0.0.1')
      if (!url.pathname.startsWith('/api/pages')) return this.send(response, 404, { error: 'not_found' })
      const parts = url.pathname.split('/').filter(Boolean)
      const id = parts[2]
      if (request.method === 'GET' && !id) {
        const slug = url.searchParams.get('where[slug][equals]')
        const result = slug
          ? await this.db.query('select data from lsites_sites.payload_drafts where collection = $1 and external_key = $2 limit 1', ['pages', slug])
          : await this.db.query('select data from lsites_sites.payload_drafts where collection = $1 order by external_key', ['pages'])
        const rows = result.rows as unknown as Array<Record<string, unknown>>
        return this.send(response, 200, { docs: rows.map((row) => row.data), totalDocs: rows.length })
      }
      if (request.method === 'GET' && id) {
        const result = await this.db.query('select data from lsites_sites.payload_drafts where collection = $1 and id = $2', ['pages', id])
        const rows = result.rows as unknown as Array<Record<string, unknown>>
        return rows[0] ? this.send(response, 200, rows[0].data) : this.send(response, 404, { error: 'not_found' })
      }
      const body = await readJson(request)
      if (request.method === 'POST' && !id) {
        const documentId = `page-${crypto.randomUUID()}`
        const document = { ...body, id: documentId }
        await this.db.query('insert into lsites_sites.payload_drafts (id, collection, external_key, data) values ($1, $2, $3, $4) on conflict (collection, external_key) do update set data = jsonb_set(lsites_sites.payload_drafts.data, \'{id}\', to_jsonb(lsites_sites.payload_drafts.id), true) || excluded.data, updated_at = now()', [documentId, 'pages', String(body.slug), document])
        const result = await this.db.query('select data from lsites_sites.payload_drafts where collection = $1 and external_key = $2', ['pages', String(body.slug)])
        const rows = result.rows as unknown as Array<Record<string, unknown>>
        return this.send(response, 201, { doc: rows[0]?.data })
      }
      if (request.method === 'PATCH' && id) {
        const document = { ...body, id }
        await this.db.query('update lsites_sites.payload_drafts set data = $3, updated_at = now() where collection = $1 and id = $2', ['pages', id, document])
        const result = await this.db.query('select data from lsites_sites.payload_drafts where collection = $1 and id = $2', ['pages', id])
        const rows = result.rows as unknown as Array<Record<string, unknown>>
        return rows[0] ? this.send(response, 200, { doc: rows[0].data }) : this.send(response, 404, { error: 'not_found' })
      }
      return this.send(response, 405, { error: 'method_not_allowed' })
    } catch (error) {
      return this.send(response, 500, { error: error instanceof Error ? error.message : 'service_error' })
    }
  }

  private send(response: import('node:http').ServerResponse, status: number, body: unknown): void {
    response.writeHead(status, { 'content-type': 'application/json', 'cache-control': 'no-store' })
    response.end(JSON.stringify(body))
  }
}

export class LocalWebMasterProcess {
  private server: Server | null = null
  private address = ''
  constructor(private readonly db: SqlDatabase) {}

  async start(): Promise<string> {
    if (this.server) return this.address
    this.server = createServer((request, response) => { void this.handle(request, response) })
    await new Promise<void>((resolve, reject) => {
      this.server?.once('error', reject)
      this.server?.listen(0, '127.0.0.1', () => resolve())
    })
    const address = this.server.address()
    if (!address || typeof address === 'string') throw new Error('web-master did not expose a TCP address')
    this.address = `http://127.0.0.1:${address.port}`
    return this.address
  }

  async close(): Promise<void> {
    if (!this.server) return
    await new Promise<void>((resolve) => this.server?.close(() => resolve()))
    this.server = null
  }

  private async handle(request: import('node:http').IncomingMessage, response: import('node:http').ServerResponse): Promise<void> {
    const authorized = request.headers['x-preview-token'] === 'w2-02-private-preview'
    if (!authorized || request.method !== 'GET') {
      response.writeHead(404, { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow, noarchive' })
      response.end('Not Found')
      return
    }
    const rows = await this.db.query('select data from lsites_sites.payload_drafts where collection = $1 order by external_key', ['pages'])
    const pages = (rows.rows as unknown as Array<Record<string, unknown>>).map((row) => row.data as Record<string, unknown>)
    if (pages.length === 0 || pages.some((page) => page.previewEnvironment !== 'private-preview')) {
      response.writeHead(404, { 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow, noarchive' })
      response.end('Not Found')
      return
    }
    const html = pages.map((page) => `<main data-route="/${String(page.slug)}"><h1>${String(page.title)}</h1></main>`).join('')
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'private, no-store', 'x-robots-tag': 'noindex, nofollow, noarchive' })
    response.end(`<!doctype html><html><body data-private-preview="true">${html}</body></html>`)
  }
}

async function readJson(request: import('node:http').IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = []
  for await (const chunk of request) chunks.push(Buffer.from(chunk))
  return JSON.parse(Buffer.concat(chunks).toString('utf8')) as Record<string, unknown>
}

import { existsSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'

/**
 * Shared harness for the tenant-isolation negative test matrix
 * (tests/tenant-isolation.spec.ts). It boots a real, embedded PostgreSQL
 * engine (`@electric-sql/pglite`, PostgreSQL 16 compiled to WASM -- NOT a
 * mock), applies the two real migrations that together define the tenant
 * boundary, and seeds a fixed multi-org fixture the spec asserts against.
 *
 * Why this spans two repos' migrations: `lsites_sites`'s RLS policies call
 * `platform.has_org_access()` and FK `sites.org_id` to
 * `platform.organizations`, so the LiNKsites content schema cannot be
 * evaluated in isolation -- the shared LiNKplatform foundation is a hard
 * prerequisite (see the migration's own header comment, and ADR 0003).
 *
 * Verification honesty (mirrors src/postgresStore.ts's doc comment): pglite
 * exercises the SQL against genuine Postgres RLS/role/security-definer
 * semantics, so a policy that leaks here would leak in production. It does
 * NOT verify a live Supabase project's networked auth, connection pooling,
 * or the real GoTrue-issued JWT path. See the file-level findings block in
 * the spec for what could and could not be proven here.
 */

const __dirname = dirname(fileURLToPath(import.meta.url))

const PLATFORM_FOUNDATION_FILE = '20260714_000001_platform_foundation.sql'

/**
 * `lsites_sites`'s RLS depends on the shared platform foundation, whose
 * canonical source lives in the sibling LiNKplatform repository. To keep
 * this suite runnable in CI (where only this repo is checked out) it is
 * vendored verbatim under tests/fixtures/ -- see that directory's README.
 *
 * Resolution order (source-of-truth first, self-contained fallback last):
 *   1. $LINKPLATFORM_MIGRATIONS_DIR/<file>  (explicit override, e.g. CI)
 *   2. ../../../../LiNKplatform/supabase/migrations/<file>  (sibling checkout)
 *   3. tests/fixtures/<file>  (vendored copy, always present)
 * When the sibling copy is reachable, `tenant-isolation.spec.ts` asserts the
 * vendored fixture is byte-identical to it, so drift is caught locally.
 */
export const VENDORED_PLATFORM_FOUNDATION_PATH = resolve(__dirname, 'fixtures', PLATFORM_FOUNDATION_FILE)
export const SIBLING_PLATFORM_FOUNDATION_PATH = resolve(
  process.env.LINKPLATFORM_MIGRATIONS_DIR ?? resolve(__dirname, '../../../../LiNKplatform/supabase/migrations'),
  PLATFORM_FOUNDATION_FILE,
)

function resolvePlatformFoundationSql(): string {
  return existsSync(SIBLING_PLATFORM_FOUNDATION_PATH)
    ? SIBLING_PLATFORM_FOUNDATION_PATH
    : VENDORED_PLATFORM_FOUNDATION_PATH
}

const lsitesSitesCoreSql = resolve(__dirname, '../../../supabase/migrations/20260715_000001_lsites_sites_core.sql')
const lsitesSitesRlsHardeningSql = resolve(
  __dirname,
  '../../../supabase/migrations/20260715_000002_lsites_sites_rls_hardening.sql',
)

/**
 * dbmate-style migration files carry both an up and a down section. We only
 * want the forward migration applied; the `-- migrate:down` block here is a
 * `drop schema ... cascade`, which would otherwise wipe everything we just
 * created if the whole file were exec'd verbatim.
 */
function upSection(sql: string): string {
  return sql.split(/^--\s*migrate:down/m)[0]!
}

/** Fixed identifiers for the seeded two-org fixture, so assertions read clearly. */
export const IDS = {
  ORG_A: '00000000-0000-0000-0000-0000000000aa',
  ORG_B: '00000000-0000-0000-0000-0000000000bb',
  /** Active `client_viewer` member of Org A. */
  USER_A_VIEWER: '10000000-0000-0000-0000-0000000000a1',
  /** Active `client_viewer` member of Org B. */
  USER_B_VIEWER: '10000000-0000-0000-0000-0000000000b1',
  /** Active `staff` member of Org B (for the role-hierarchy vector). */
  USER_B_STAFF: '10000000-0000-0000-0000-0000000000b2',
  /** Former member of Org B whose membership row is `status = 'revoked'`. */
  USER_B_REVOKED: '10000000-0000-0000-0000-0000000000b3',
  /** A principal with no `platform.org_members` row for any org. */
  USER_STRANGER: '10000000-0000-0000-0000-0000000000ff',
  SITE_A: '20000000-0000-0000-0000-0000000000aa',
  SITE_B: '20000000-0000-0000-0000-0000000000bb',
  /**
   * Id used ONLY by the repurposed V5 vector to attempt (and prove rejected) a
   * NULL-org site insert. No such row is seeded -- after migration
   * 20260715_000002, `org_id` is NOT NULL, so this row cannot exist. See F2.
   */
  SITE_GLOBAL: '20000000-0000-0000-0000-0000000000cc',
  PAGE_A: '30000000-0000-0000-0000-0000000000aa',
  PAGE_B: '30000000-0000-0000-0000-0000000000bb',
  ARTICLE_A: '40000000-0000-0000-0000-0000000000aa',
  ARTICLE_B: '40000000-0000-0000-0000-0000000000bb',
} as const

/** The least-privilege application runtime role the RLS policies target. */
export const RUNTIME_ROLE = 'svc_linksites_runtime'
/** Read-only observability role: has table SELECT grants, but no RLS policy targets it. */
export const OBSERVER_ROLE = 'svc_observer'
/** Supabase-managed end-user role, shimmed here (see F3). No lsites grants. */
export const AUTHENTICATED_ROLE = 'authenticated'

export interface QueryResult {
  rows: Record<string, unknown>[]
  affectedRows?: number
}

export interface IsolationHarness {
  db: PGlite
  /**
   * Run a query as the trusted application runtime role, simulating a
   * request on behalf of `userId` (drives the shimmed `auth.uid()`) scoped
   * by `siteId` (the `app.site_id` fast-path GUC). Pass `null` for either to
   * leave it unset. Role is reset afterward even if the query throws.
   */
  asRuntime(userId: string | null, siteId: string | null, sql: string, params?: unknown[]): Promise<QueryResult>
  /** Run a query under an arbitrary role with no session GUCs set. */
  asRole(role: string, sql: string, params?: unknown[]): Promise<QueryResult>
  /** Evaluate `platform.has_org_access(org, role)` as the given user. */
  hasOrgAccess(userId: string | null, orgId: string, minRole: string): Promise<boolean>
  /** Insert a row directly (RLS-bypassing superuser) for throwaway write fixtures. */
  seedAsSuperuser(sql: string, params?: unknown[]): Promise<QueryResult>
  /** Clear the per-request session GUCs. */
  resetSession(): Promise<void>
  close(): Promise<void>
}

async function setSessionVar(db: PGlite, name: string, value: string): Promise<void> {
  await db.query('select set_config($1, $2, false)', [name, value])
}

/**
 * Boots pglite, applies both migrations, and seeds the fixture. Returns a
 * harness exposing role-scoped query helpers.
 */
export async function createIsolationHarness(): Promise<IsolationHarness> {
  const db = new PGlite({ extensions: { pgcrypto } })

  // Supabase provides these built-ins; a bare Postgres/pglite engine does
  // not. They must exist BEFORE the platform migration runs, because it
  // grants EXECUTE on has_org_access to `authenticated` and the function
  // body references `auth.uid()` (validated at CREATE time). The `auth.uid()`
  // shim reads a session GUC we control in tests, standing in for the
  // GoTrue-issued JWT `sub` claim it derives from in production.
  await db.exec(`
    do $$
    begin
      if not exists (select 1 from pg_roles where rolname = 'authenticated') then
        create role authenticated nologin;
      end if;
    end $$;
    create schema if not exists auth;
    create or replace function auth.uid() returns uuid
      language sql stable
    as $$
      select nullif(current_setting('app.current_user_id', true), '')::uuid;
    $$;
  `)

  await db.exec(upSection(readFileSync(resolvePlatformFoundationSql(), 'utf8')))
  await db.exec(upSection(readFileSync(lsitesSitesCoreSql, 'utf8')))
  // Applied on top of 000001, exactly as the Principal will apply it in the
  // Supabase SQL Editor. This is the migration under test for F1/F2.
  await db.exec(upSection(readFileSync(lsitesSitesRlsHardeningSql, 'utf8')))

  // Seed as superuser (RLS is bypassed for the bootstrap superuser), so the
  // fixture is established independent of the policies we are testing.
  await db.query(
    `insert into platform.organizations (id, name, kind, status) values
       ($1, 'Org A', 'client', 'active'),
       ($2, 'Org B', 'client', 'active')`,
    [IDS.ORG_A, IDS.ORG_B],
  )
  await db.query(
    `insert into platform.org_members (org_id, user_id, role, status) values
       ($1, $2, 'client_viewer', 'active'),
       ($3, $4, 'client_viewer', 'active'),
       ($5, $6, 'staff',         'active'),
       ($7, $8, 'client_viewer', 'revoked')`,
    [
      IDS.ORG_A, IDS.USER_A_VIEWER,
      IDS.ORG_B, IDS.USER_B_VIEWER,
      IDS.ORG_B, IDS.USER_B_STAFF,
      IDS.ORG_B, IDS.USER_B_REVOKED,
    ],
  )
  // Note: no org_id-null "global" site is seeded any more. After the
  // 20260715_000002 hardening migration, lsites_sites.sites.org_id is NOT
  // NULL, so such a row cannot exist. V5 now proves the constraint rejects it
  // (see IDS.SITE_GLOBAL and the repurposed V5 vector in the spec).
  await db.query(
    `insert into lsites_sites.sites (id, org_id, name, default_locale) values
       ($1, $2, 'Site A', 'en'),
       ($3, $4, 'Site B', 'en')`,
    [IDS.SITE_A, IDS.ORG_A, IDS.SITE_B, IDS.ORG_B],
  )
  await db.query(
    `insert into lsites_sites.pages (id, site_id, locale, slug, title) values
       ($1, $2, 'en', 'home', 'A home'),
       ($3, $4, 'en', 'home', 'B home')`,
    [IDS.PAGE_A, IDS.SITE_A, IDS.PAGE_B, IDS.SITE_B],
  )
  await db.query(
    `insert into lsites_sites.articles (id, site_id, locale, slug, title) values
       ($1, $2, 'en', 'first', 'A article'),
       ($3, $4, 'en', 'first', 'B article')`,
    [IDS.ARTICLE_A, IDS.SITE_A, IDS.ARTICLE_B, IDS.SITE_B],
  )

  const resetSession = async (): Promise<void> => {
    await setSessionVar(db, 'app.current_user_id', '')
    await setSessionVar(db, 'app.site_id', '')
  }

  const asRuntime: IsolationHarness['asRuntime'] = async (userId, siteId, sql, params = []) => {
    await setSessionVar(db, 'app.current_user_id', userId ?? '')
    await setSessionVar(db, 'app.site_id', siteId ?? '')
    await db.query(`set role ${RUNTIME_ROLE}`)
    try {
      return (await db.query(sql, params)) as QueryResult
    } finally {
      await db.query('reset role')
    }
  }

  const asRole: IsolationHarness['asRole'] = async (role, sql, params = []) => {
    await db.query(`set role ${role}`)
    try {
      return (await db.query(sql, params)) as QueryResult
    } finally {
      await db.query('reset role')
    }
  }

  const hasOrgAccess: IsolationHarness['hasOrgAccess'] = async (userId, orgId, minRole) => {
    await setSessionVar(db, 'app.current_user_id', userId ?? '')
    const result = (await db.query('select platform.has_org_access($1, $2::platform.member_role) as ok', [
      orgId,
      minRole,
    ])) as QueryResult
    return Boolean(result.rows[0]?.ok)
  }

  const seedAsSuperuser: IsolationHarness['seedAsSuperuser'] = async (sql, params = []) => {
    return (await db.query(sql, params)) as QueryResult
  }

  return {
    db,
    asRuntime,
    asRole,
    hasOrgAccess,
    seedAsSuperuser,
    resetSession,
    close: () => db.close(),
  }
}

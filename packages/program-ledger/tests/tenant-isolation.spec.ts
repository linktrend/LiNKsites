import { existsSync, readFileSync } from 'node:fs'
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest'
import {
  AUTHENTICATED_ROLE,
  createIsolationHarness,
  IDS,
  OBSERVER_ROLE,
  SIBLING_PLATFORM_FOUNDATION_PATH,
  VENDORED_PLATFORM_FOUNDATION_PATH,
  type IsolationHarness,
} from './tenantIsolation.harness.js'

/**
 * Tenant-isolation NEGATIVE test matrix -- closes GAP-06 (severity: critical)
 * from audit/09_gap_and_risk_register.yaml, per manual §18.84-85, which
 * requires a >=10-vector cross-tenant isolation matrix and treats a suite of
 * only positive/successful paths as explicitly incomplete evidence.
 *
 * These tests run the two REAL migrations that define the tenant boundary
 * against an embedded PostgreSQL 16 engine (@electric-sql/pglite -- not a
 * mock), so RLS, role, and SECURITY DEFINER semantics are genuinely
 * exercised (see tenantIsolation.harness.ts). Each vector asserts BOTH:
 *   - the NEGATIVE case: a cross-tenant / cross-org / under-privileged
 *     operation is denied (0 rows, 0 rows affected, or a hard error), AND
 *   - the paired POSITIVE case: the equivalent same-org, correctly-scoped
 *     operation still succeeds.
 * The pairing is deliberate: it proves ISOLATION holds, not merely that
 * "everything fails".
 *
 * The tenant boundary under test (from
 * supabase/migrations/20260715_000001_lsites_sites_core.sql) is, for every
 * table, an OR of three independent checks:
 *   1. id/site_id::text = current_setting('app.site_id')   -- fast-path GUC
 *   2. (sites.)org_id IS NULL                              -- "global" escape
 *   3. platform.has_org_access(org_id, 'client_viewer')    -- real membership
 * Any one passing grants access. Checks 1 and 2 are the source of findings
 * F1 and F2 below.
 *
 * FINDINGS surfaced by this matrix (documented, not papered over):
 *   F1 (V3): The `app.site_id` fast-path is an UNCONDITIONAL grant keyed only
 *       on a session variable. A principal who can set `app.site_id` to a
 *       victim site's id reads/writes that site's data regardless of org
 *       membership (proven by V3's `forged app.site_id` case). This is
 *       by-design as a "trusted server-set scoping convenience", but it means
 *       cross-tenant isolation depends ENTIRELY on `app.site_id` being set by
 *       trusted server code from the resolved hostname and NEVER influenced by
 *       client input. RLS provides no defense-in-depth against a forged
 *       `app.site_id`.
 *   F2 (V5): A `sites` row with `org_id IS NULL` is visible (and writable per
 *       WITH CHECK) to EVERY principal, including one with no membership at
 *       all. `org_id` is nullable "until backfilled" per the migration; any
 *       production row left null is exposed cross-tenant. Backfill + a NOT
 *       NULL constraint are required before real customer data is loaded.
 *   F3 (V10): These policies target the service role `svc_linksites_runtime`
 *       exclusively. There is no Supabase `authenticated`/`anon` role wired
 *       into any lsites_sites policy, so there is no DIRECT end-user path to
 *       these tables today -- the app runtime impersonates the user's identity
 *       by setting `auth.uid()` on the runtime connection. The harness had to
 *       CREATE a shim `authenticated` role + `auth.uid()` because they are
 *       Supabase-managed built-ins absent from a bare engine; a realistic
 *       end-user-JWT path therefore cannot be tested here because it does not
 *       exist in this schema yet. V10 proves a bare `authenticated` role gets
 *       nothing (permission denied), which is safe-by-omission.
 *   F4 (V11): `svc_observer` holds table SELECT grants but NO RLS policy
 *       targets it, so it reads zero rows. If an observability/backup consumer
 *       is meant to actually read these tables, it currently cannot.
 */

let h: IsolationHarness

beforeAll(async () => {
  h = await createIsolationHarness()
})

afterEach(async () => {
  await h.resetSession()
})

afterAll(async () => {
  await h.close()
})

describe('Tenant isolation negative matrix (lsites_sites + platform RLS)', () => {
  // V1 -----------------------------------------------------------------
  describe('V1: direct cross-org read of a `sites` row by id', () => {
    it('DENIES Org A principal reading Org B\'s site row (0 rows)', async () => {
      const res = await h.asRuntime(IDS.USER_A_VIEWER, null, 'select id from lsites_sites.sites where id = $1', [
        IDS.SITE_B,
      ])
      expect(res.rows).toHaveLength(0)
    })
    it('ALLOWS Org A principal reading its own site row (1 row)', async () => {
      const res = await h.asRuntime(IDS.USER_A_VIEWER, null, 'select id from lsites_sites.sites where id = $1', [
        IDS.SITE_A,
      ])
      expect(res.rows).toHaveLength(1)
    })
  })

  // V2 -----------------------------------------------------------------
  describe('V2: cross-org read of a child (`pages`) row via join-based RLS', () => {
    it('DENIES Org A principal reading a page belonging to Org B\'s site (0 rows)', async () => {
      const res = await h.asRuntime(IDS.USER_A_VIEWER, null, 'select id from lsites_sites.pages where id = $1', [
        IDS.PAGE_B,
      ])
      expect(res.rows).toHaveLength(0)
    })
    it('ALLOWS Org A principal reading a page belonging to its own site (1 row)', async () => {
      const res = await h.asRuntime(IDS.USER_A_VIEWER, null, 'select id from lsites_sites.pages where id = $1', [
        IDS.PAGE_A,
      ])
      expect(res.rows).toHaveLength(1)
    })
  })

  // V3 -----------------------------------------------------------------
  describe('V3: mismatched vs forged `app.site_id` session variable', () => {
    it('DENIES cross-org read even when app.site_id is set to the principal\'s OWN site (mismatch gives no leak, 0 rows)', async () => {
      const res = await h.asRuntime(IDS.USER_A_VIEWER, IDS.SITE_A, 'select id from lsites_sites.sites where id = $1', [
        IDS.SITE_B,
      ])
      expect(res.rows).toHaveLength(0)
    })
    it('ALLOWS the matching same-org read with a correct app.site_id (1 row)', async () => {
      const res = await h.asRuntime(IDS.USER_A_VIEWER, IDS.SITE_A, 'select id from lsites_sites.sites where id = $1', [
        IDS.SITE_A,
      ])
      expect(res.rows).toHaveLength(1)
    })
    it('FINDING F1: a FORGED app.site_id equal to a victim site id BYPASSES membership (fast-path is an unconditional grant)', async () => {
      // A principal with NO membership in Org B, forging app.site_id = Site B,
      // reads Site B and its child rows. This documents that isolation depends
      // entirely on app.site_id being server-controlled, never client-settable.
      const site = await h.asRuntime(IDS.USER_STRANGER, IDS.SITE_B, 'select id from lsites_sites.sites where id = $1', [
        IDS.SITE_B,
      ])
      expect(site.rows).toHaveLength(1)
      const page = await h.asRuntime(IDS.USER_STRANGER, IDS.SITE_B, 'select id from lsites_sites.pages where id = $1', [
        IDS.PAGE_B,
      ])
      expect(page.rows).toHaveLength(1)
    })
  })

  // V4 -----------------------------------------------------------------
  describe('V4: revoked member (platform.org_members.status = revoked)', () => {
    it('DENIES a revoked Org B member reading Org B\'s site (0 rows)', async () => {
      const res = await h.asRuntime(IDS.USER_B_REVOKED, null, 'select id from lsites_sites.sites where id = $1', [
        IDS.SITE_B,
      ])
      expect(res.rows).toHaveLength(0)
    })
    it('ALLOWS an ACTIVE Org B member reading the same site (proves it is revocation, not the site, 1 row)', async () => {
      const res = await h.asRuntime(IDS.USER_B_VIEWER, null, 'select id from lsites_sites.sites where id = $1', [
        IDS.SITE_B,
      ])
      expect(res.rows).toHaveLength(1)
    })
    it('has_org_access() returns false for the revoked member and true for the active member', async () => {
      expect(await h.hasOrgAccess(IDS.USER_B_REVOKED, IDS.ORG_B, 'client_viewer')).toBe(false)
      expect(await h.hasOrgAccess(IDS.USER_B_VIEWER, IDS.ORG_B, 'client_viewer')).toBe(true)
    })
  })

  // V5 -----------------------------------------------------------------
  describe('V5: NULL org_id (global-looking) row visibility', () => {
    it('DENIES a stranger reading a POPULATED (non-null org) site (isolation holds, 0 rows)', async () => {
      const res = await h.asRuntime(IDS.USER_STRANGER, null, 'select id from lsites_sites.sites where id = $1', [
        IDS.SITE_B,
      ])
      expect(res.rows).toHaveLength(0)
    })
    it('FINDING F2: a stranger with NO membership CAN read a site whose org_id IS NULL (global cross-tenant visibility)', async () => {
      const res = await h.asRuntime(IDS.USER_STRANGER, null, 'select id, org_id from lsites_sites.sites where id = $1', [
        IDS.SITE_GLOBAL,
      ])
      expect(res.rows).toHaveLength(1)
      expect(res.rows[0]?.org_id).toBeNull()
    })
  })

  // V6 -----------------------------------------------------------------
  describe('V6: cross-boundary WRITES (INSERT / UPDATE / DELETE)', () => {
    it('DENIES UPDATE of another org\'s site (0 rows affected, row unchanged)', async () => {
      const res = await h.asRuntime(
        IDS.USER_A_VIEWER,
        null,
        "update lsites_sites.sites set name = 'hijacked' where id = $1",
        [IDS.SITE_B],
      )
      expect(res.affectedRows).toBe(0)
      const check = await h.seedAsSuperuser('select name from lsites_sites.sites where id = $1', [IDS.SITE_B])
      expect(check.rows[0]?.name).toBe('Site B')
    })
    it('DENIES DELETE of another org\'s site (0 rows affected, row still exists)', async () => {
      const res = await h.asRuntime(IDS.USER_A_VIEWER, null, 'delete from lsites_sites.sites where id = $1', [
        IDS.SITE_B,
      ])
      expect(res.affectedRows).toBe(0)
      const check = await h.seedAsSuperuser('select 1 from lsites_sites.sites where id = $1', [IDS.SITE_B])
      expect(check.rows).toHaveLength(1)
    })
    it('DENIES INSERT of a child row into another org\'s site (WITH CHECK raises RLS violation)', async () => {
      await expect(
        h.asRuntime(
          IDS.USER_A_VIEWER,
          null,
          "insert into lsites_sites.pages (site_id, locale, slug, title) values ($1, 'en', 'injected', 'x')",
          [IDS.SITE_B],
        ),
      ).rejects.toThrow(/row-level security/i)
    })
    it('ALLOWS same-org UPDATE and INSERT (positive path still works)', async () => {
      const writableSite = '20000000-0000-0000-0000-0000000000a9'
      await h.seedAsSuperuser(
        "insert into lsites_sites.sites (id, org_id, name, default_locale) values ($1, $2, 'Writable', 'en')",
        [writableSite, IDS.ORG_A],
      )
      const upd = await h.asRuntime(
        IDS.USER_A_VIEWER,
        null,
        "update lsites_sites.sites set name = 'renamed' where id = $1",
        [writableSite],
      )
      expect(upd.affectedRows).toBe(1)
      const ins = await h.asRuntime(
        IDS.USER_A_VIEWER,
        null,
        "insert into lsites_sites.pages (site_id, locale, slug, title) values ($1, 'en', 'legit', 'ok')",
        [IDS.SITE_A],
      )
      expect(ins.affectedRows).toBe(1)
    })
  })

  // V7 -----------------------------------------------------------------
  describe('V7: role escalation via platform.has_org_access() hierarchy', () => {
    it('DENIES a client_viewer the privileges of higher roles (client_admin / staff / admin / owner all false)', async () => {
      expect(await h.hasOrgAccess(IDS.USER_B_VIEWER, IDS.ORG_B, 'client_admin')).toBe(false)
      expect(await h.hasOrgAccess(IDS.USER_B_VIEWER, IDS.ORG_B, 'staff')).toBe(false)
      expect(await h.hasOrgAccess(IDS.USER_B_VIEWER, IDS.ORG_B, 'admin')).toBe(false)
      expect(await h.hasOrgAccess(IDS.USER_B_VIEWER, IDS.ORG_B, 'owner')).toBe(false)
    })
    it('ALLOWS each role its own level and below (client_viewer@viewer true; staff@staff/client_admin/viewer true, staff@admin/owner false)', async () => {
      expect(await h.hasOrgAccess(IDS.USER_B_VIEWER, IDS.ORG_B, 'client_viewer')).toBe(true)
      expect(await h.hasOrgAccess(IDS.USER_B_STAFF, IDS.ORG_B, 'client_viewer')).toBe(true)
      expect(await h.hasOrgAccess(IDS.USER_B_STAFF, IDS.ORG_B, 'client_admin')).toBe(true)
      expect(await h.hasOrgAccess(IDS.USER_B_STAFF, IDS.ORG_B, 'staff')).toBe(true)
      expect(await h.hasOrgAccess(IDS.USER_B_STAFF, IDS.ORG_B, 'admin')).toBe(false)
      expect(await h.hasOrgAccess(IDS.USER_B_STAFF, IDS.ORG_B, 'owner')).toBe(false)
    })
  })

  // V8 -----------------------------------------------------------------
  describe('V8: cross-table leakage via crafted join / subquery', () => {
    it('DENIES a join from pages to sites filtered on the other org (0 rows)', async () => {
      const res = await h.asRuntime(
        IDS.USER_A_VIEWER,
        null,
        `select p.id from lsites_sites.pages p
           join lsites_sites.sites s on s.id = p.site_id
          where s.org_id = $1`,
        [IDS.ORG_B],
      )
      expect(res.rows).toHaveLength(0)
    })
    it('DENIES a subquery selecting pages of the other org\'s sites (0 rows)', async () => {
      const res = await h.asRuntime(
        IDS.USER_A_VIEWER,
        null,
        `select id from lsites_sites.pages
          where site_id in (select id from lsites_sites.sites where org_id = $1)`,
        [IDS.ORG_B],
      )
      expect(res.rows).toHaveLength(0)
    })
    it('DENIES reading a different child table (`articles`) belonging to the other org (0 rows)', async () => {
      const res = await h.asRuntime(IDS.USER_A_VIEWER, null, 'select id from lsites_sites.articles where id = $1', [
        IDS.ARTICLE_B,
      ])
      expect(res.rows).toHaveLength(0)
    })
    it('ALLOWS the same join for the principal\'s own org (returns own page)', async () => {
      const res = await h.asRuntime(
        IDS.USER_A_VIEWER,
        null,
        `select p.id from lsites_sites.pages p
           join lsites_sites.sites s on s.id = p.site_id
          where s.org_id = $1`,
        [IDS.ORG_A],
      )
      expect(res.rows.map((r) => r.id)).toContain(IDS.PAGE_A)
    })
  })

  // V9 -----------------------------------------------------------------
  describe('V9: principal with no membership row for the target org', () => {
    it('DENIES a stranger reading another org\'s site and child rows (0 rows each)', async () => {
      const site = await h.asRuntime(IDS.USER_STRANGER, null, 'select id from lsites_sites.sites where id = $1', [
        IDS.SITE_A,
      ])
      const page = await h.asRuntime(IDS.USER_STRANGER, null, 'select id from lsites_sites.pages where id = $1', [
        IDS.PAGE_A,
      ])
      expect(site.rows).toHaveLength(0)
      expect(page.rows).toHaveLength(0)
    })
    it('ALLOWS a genuine member to read the SAME target site (proves membership is the deciding factor, 1 row)', async () => {
      const res = await h.asRuntime(IDS.USER_A_VIEWER, null, 'select id from lsites_sites.sites where id = $1', [
        IDS.SITE_A,
      ])
      expect(res.rows).toHaveLength(1)
    })
  })

  // V10 ----------------------------------------------------------------
  describe('V10: bare `authenticated` role with no runtime grants (F3)', () => {
    it('DENIES a bare authenticated role any access to lsites_sites (permission denied for schema)', async () => {
      await expect(h.asRole(AUTHENTICATED_ROLE, 'select id from lsites_sites.sites')).rejects.toThrow(
        /permission denied for schema lsites_sites/i,
      )
    })
    it('ALLOWS the runtime role a correctly-scoped read (positive path still works, 1 row)', async () => {
      const res = await h.asRuntime(IDS.USER_A_VIEWER, null, 'select id from lsites_sites.sites where id = $1', [
        IDS.SITE_A,
      ])
      expect(res.rows).toHaveLength(1)
    })
  })

  // V11 ----------------------------------------------------------------
  describe('V11: read-only `svc_observer` role -- SELECT grant but no RLS policy (F4)', () => {
    it('DENIES svc_observer any rows: it has table SELECT but no policy targets it, so RLS default-denies (0 rows)', async () => {
      const res = await h.asRole(OBSERVER_ROLE, 'select id from lsites_sites.sites')
      expect(res.rows).toHaveLength(0)
    })
    it('ALLOWS a runtime member session to see rows the observer cannot (proves it is the role/policy, not empty data)', async () => {
      const res = await h.asRuntime(IDS.USER_A_VIEWER, null, 'select id from lsites_sites.sites where id = $1', [
        IDS.SITE_A,
      ])
      expect(res.rows).toHaveLength(1)
    })
  })

  // V12 ----------------------------------------------------------------
  describe('V12: unauthenticated principal (auth.uid() null) with no app.site_id', () => {
    it('DENIES an unauthenticated, unscoped session any populated-org rows (0 rows)', async () => {
      const a = await h.asRuntime(null, null, 'select id from lsites_sites.sites where id = $1', [IDS.SITE_A])
      const b = await h.asRuntime(null, null, 'select id from lsites_sites.sites where id = $1', [IDS.SITE_B])
      expect(a.rows).toHaveLength(0)
      expect(b.rows).toHaveLength(0)
    })
    it('ALLOWS the legitimate public-render path: no user, but a trusted server-set app.site_id scopes to exactly that one site (1 row)', async () => {
      const own = await h.asRuntime(null, IDS.SITE_A, 'select id from lsites_sites.sites where id = $1', [IDS.SITE_A])
      const other = await h.asRuntime(null, IDS.SITE_A, 'select id from lsites_sites.sites where id = $1', [IDS.SITE_B])
      expect(own.rows).toHaveLength(1)
      expect(other.rows).toHaveLength(0)
    })
  })
})

describe('Fixture provenance: vendored platform_foundation.sql matches its source', () => {
  const siblingExists = existsSync(SIBLING_PLATFORM_FOUNDATION_PATH)
  it.runIf(siblingExists)(
    'the vendored tests/fixtures copy is byte-identical to the LiNKplatform source (drift guard)',
    () => {
      const vendored = readFileSync(VENDORED_PLATFORM_FOUNDATION_PATH, 'utf8')
      const source = readFileSync(SIBLING_PLATFORM_FOUNDATION_PATH, 'utf8')
      expect(vendored).toBe(source)
    },
  )
  it.skipIf(siblingExists)(
    'sibling LiNKplatform repo not checked out here (e.g. CI); relying on the vendored fixture',
    () => {
      expect(existsSync(VENDORED_PLATFORM_FOUNDATION_PATH)).toBe(true)
    },
  )
})

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PGlite } from '@electric-sql/pglite'
import { pgcrypto } from '@electric-sql/pglite/contrib/pgcrypto'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import {
  WorkingContentError,
  WorkingContentRepository,
  computeWorkingContentChecksum,
  validateWorkingContentPackage,
} from '../src/workingContent.js'
import { revisedWorkingContentFixture, workingContentFixture } from './fixtures/working-content-fixtures.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const platformFoundation = resolve(__dirname, '../../program-ledger/tests/fixtures/20260714_000001_platform_foundation.sql')
const siteCoreMigration = resolve(__dirname, '../../../supabase/migrations/20260715_000001_lsites_sites_core.sql')
const siteRlsMigration = resolve(__dirname, '../../../supabase/migrations/20260715_000002_lsites_sites_rls_hardening.sql')
const workingContentMigration = resolve(__dirname, '../../../supabase/migrations/20260804_000001_lsites_working_content_plane.sql')
const workingContentPrivilegeMigration = resolve(__dirname, '../../../supabase/migrations/20260805_000001_lsites_working_content_runtime_privileges.sql')

const ORG_A = '10000000-0000-0000-0000-000000000001'
const ORG_B = '10000000-0000-0000-0000-000000000002'
const USER_A = '20000000-0000-0000-0000-000000000001'
const USER_B = '20000000-0000-0000-0000-000000000002'
const SITE_A = '30000000-0000-0000-0000-000000000001'
const SITE_B = '30000000-0000-0000-0000-000000000002'

function upSql(path: string): string {
  return readFileSync(path, 'utf8').split('-- migrate:down')[0].replace('-- migrate:up', '')
}

function fullSql(path: string): string {
  return readFileSync(path, 'utf8')
}

let db: PGlite
let repository: WorkingContentRepository

async function setSessionUser(userId: string): Promise<void> {
  await db.query("select set_config('app.current_user_id', $1, false)", [userId])
}

async function asRuntime<T>(userId: string, work: () => Promise<T>): Promise<T> {
  await setSessionUser(userId)
  await db.query('set role svc_linksites_runtime')
  try {
    return await work()
  } finally {
    await db.query('reset role')
  }
}

async function createVersion(
  packageId: string,
  expectedCurrentVersion: number | null,
  contentPackage = workingContentFixture,
  orgId = ORG_A,
  siteId = SITE_A,
) {
  return asRuntime(USER_A, () => repository.createVersion({
    workingPackageId: packageId,
    orgId,
    leadId: `lead-${packageId}`,
    siteId,
    programRef: 'links-program',
    runId: 'run-001',
    expectedCurrentVersion,
    authorId: 'agent-author',
    executorId: 'codex-luna-high',
    contentPackage,
  }))
}

async function acceptVersion(packageId: string, versionNumber: number, checksum: string) {
  return asRuntime(USER_A, async () => {
    await repository.markReadyForGate(packageId, versionNumber, checksum)
    return repository.markGateOutcome({
      workingPackageId: packageId,
      versionNumber,
      expectedChecksum: checksum,
      outcome: 'accepted',
      gateReference: 'gate://w1-04/content-quality',
      evidenceReferences: ['evidence://w1-04/content-quality'],
    })
  })
}

beforeAll(async () => {
  db = new PGlite({ extensions: { pgcrypto } })
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
    as $$ select nullif(current_setting('app.current_user_id', true), '')::uuid; $$;
  `)
  await db.exec(upSql(platformFoundation))
  await db.exec(upSql(siteCoreMigration))
  await db.exec(upSql(siteRlsMigration))
  await db.exec(fullSql(workingContentMigration))
  await db.exec(fullSql(workingContentPrivilegeMigration))
  await db.query(
    `insert into platform.organizations (id, name, kind, status) values
      ($1, 'W1-04 Org A', 'client', 'active'), ($2, 'W1-04 Org B', 'client', 'active')`,
    [ORG_A, ORG_B],
  )
  await db.query(
    `insert into platform.org_members (org_id, user_id, role, status) values
      ($1, $2, 'client_viewer', 'active'), ($3, $4, 'client_viewer', 'active')`,
    [ORG_A, USER_A, ORG_B, USER_B],
  )
  await db.query(
    `insert into lsites_sites.sites (id, org_id, name, default_locale) values
      ($1, $2, 'W1-04 Site A', 'en'), ($3, $4, 'W1-04 Site B', 'en')`,
    [SITE_A, ORG_A, SITE_B, ORG_B],
  )
  repository = new WorkingContentRepository(db)
})

beforeEach(async () => {
  await db.query('truncate table lsites_sites.working_content_promotion_receipts, lsites_sites.working_content_versions, lsites_sites.working_packages cascade')
})

afterAll(async () => {
  await db.close()
})

describe('working-content contract and checksum', () => {
  it('accepts the structured template/content package and rejects incompatible shapes', () => {
    expect(validateWorkingContentPackage(workingContentFixture)).toBe(true)
    expect(validateWorkingContentPackage({ ...workingContentFixture, content: { pages: [] } })).toBe(false)
    expect(validateWorkingContentPackage({ ...workingContentFixture, libraryRefs: [{ libraryId: 'x', sha: '' }] })).toBe(false)
    expect(validateWorkingContentPackage({ ...workingContentFixture, templateId: 'unknown-template' as never })).toBe(false)
    expect(validateWorkingContentPackage({
      ...workingContentFixture,
      content: { pages: [{ ...workingContentFixture.content.pages[0], sections: [{ ...workingContentFixture.content.pages[0].sections[0], componentId: 'UnknownComponent' }] }] },
    })).toBe(false)
    expect(validateWorkingContentPackage({
      ...workingContentFixture,
      content: { pages: [{ ...workingContentFixture.content.pages[0], sections: [{ ...workingContentFixture.content.pages[0].sections[0], content: { lang: 7 } }] }] },
    })).toBe(false)
    expect(validateWorkingContentPackage({ ...workingContentFixture, libraryRefs: [{ libraryId: 'x', sha: '0123456789abcdef0123456789abcdef0123456' }] })).toBe(false)
    expect(validateWorkingContentPackage({ ...workingContentFixture, libraryRefs: [{ libraryId: 'x', sha: '0123456789ABCDEF0123456789abcdef01234567' }] })).toBe(false)
    expect(computeWorkingContentChecksum(workingContentFixture)).toMatch(/^[a-f0-9]{64}$/)
  })

  it('produces the same checksum for equivalent object-key insertion order', () => {
    const reordered = JSON.parse(JSON.stringify(workingContentFixture)) as typeof workingContentFixture
    reordered.content.pages[0].sections[0].content = { copy: 'A clear home page', lang: 'en' }
    expect(computeWorkingContentChecksum(reordered)).toBe(computeWorkingContentChecksum(workingContentFixture))
  })
})

describe('working-content persistence and lineage', () => {
  it('creates, reads, compares, and traces immutable versions', async () => {
    const first = await createVersion('wp-lineage', null)
    expect(first.versionNumber).toBe(1)
    expect(first.parentVersionNumber).toBeNull()
    await acceptVersion('wp-lineage', 1, first.contentChecksum)
    const second = await createVersion('wp-lineage', 1, revisedWorkingContentFixture())
    const comparison = await asRuntime(USER_A, () => repository.compareVersions('wp-lineage', 1, 2))
    expect(comparison.sameChecksum).toBe(false)
    expect(comparison.changedFields).toContain('content')
    expect((await asRuntime(USER_A, () => repository.traceLineage('wp-lineage', 2))).map((version) => version.versionNumber)).toEqual([1, 2])
    expect(second.contentChecksum).toBe(computeWorkingContentChecksum(revisedWorkingContentFixture()))
  })

  it('fails closed on a stale compare-and-swap parent', async () => {
    const first = await createVersion('wp-cas', null)
    await expect(createVersion('wp-cas', null)).rejects.toMatchObject({ code: 'conflict' })
    await expect(createVersion('wp-cas', 0)).rejects.toMatchObject({ code: 'conflict' })
    await expect(createVersion('wp-cas', 1, revisedWorkingContentFixture())).resolves.toMatchObject({ versionNumber: 2 })
    expect(first.versionNumber).toBe(1)
  })

  it('allows only one winner when two first-version CAS writes race', async () => {
    const attempts = [1, 2].map((index) => repository.createVersion({
      workingPackageId: 'wp-concurrent-cas',
      orgId: ORG_A,
      leadId: 'lead-wp-concurrent-cas',
      siteId: SITE_A,
      programRef: 'links-program',
      runId: 'run-001',
      expectedCurrentVersion: null,
      authorId: `author-${index}`,
      executorId: 'codex-luna-high',
      contentPackage: workingContentFixture,
    }))
    const results = await Promise.allSettled(attempts)
    expect(results.filter((result) => result.status === 'fulfilled')).toHaveLength(1)
    expect(results.filter((result) => result.status === 'rejected')).toHaveLength(1)
    const rejected = results.find((result) => result.status === 'rejected')
    expect(rejected).toMatchObject({ reason: expect.objectContaining({ code: 'conflict' }) })
    await expect(asRuntime(USER_A, () => repository.readVersion('wp-concurrent-cas', 1))).resolves.toMatchObject({ versionNumber: 1 })
  })

  it('does not allow accepted content to be overwritten in place', async () => {
    const first = await createVersion('wp-immutable', null)
    await acceptVersion('wp-immutable', 1, first.contentChecksum)
    await asRuntime(USER_A, async () => {
      await expect(db.query(
        `update lsites_sites.working_content_versions
            set content_payload = $3
          where working_package_id = $1 and version_number = $2`,
        ['wp-immutable', 1, { pages: [] }],
      )).rejects.toThrow(/immutable/)
    })
  })

  it('rejects a stored checksum mismatch when a version is read', async () => {
    await db.query(
      `insert into lsites_sites.working_packages (working_package_id, org_id, lead_id, site_id, current_version)
       values ('wp-corrupt', $1, 'lead-corrupt', $2, 1)`,
      [ORG_A, SITE_A],
    )
    await db.query(
      `insert into lsites_sites.working_content_versions
        (working_package_id, version_number, org_id, lead_id, site_id, program_ref,
         author_id, executor_id, content_payload, asset_refs, library_refs, provenance,
         content_checksum)
       values ('wp-corrupt', 1, $1, 'lead-corrupt', $2, 'program', 'author', 'executor', $3, '[]'::jsonb, '[]'::jsonb, '[]'::jsonb, $4)`,
      [ORG_A, SITE_A, workingContentFixture.content, '0000000000000000000000000000000000000000000000000000000000000000'],
    )
    await expect(asRuntime(USER_A, () => repository.readVersion('wp-corrupt', 1))).rejects.toMatchObject({ code: 'checksum_mismatch' })
  })

  it('rejects working-content contract type and key bypasses at the database boundary', async () => {
    const checksum = '0000000000000000000000000000000000000000000000000000000000000000'
    const insertPackage = async (packageId: string, templateId = 'marketing-smb-v1') => {
      await db.query(
        `insert into lsites_sites.working_packages (working_package_id, template_id, org_id, lead_id, site_id)
         values ($1, $2, $3, $4, $5)`,
        [packageId, templateId, ORG_A, `lead-${packageId}`, SITE_A],
      )
    }
    const expectRejectedVersion = async (packageId: string, contentPayload: unknown, libraryRefs: unknown = workingContentFixture.libraryRefs) => {
      await insertPackage(packageId)
      await expect(db.query(
        `insert into lsites_sites.working_content_versions
          (working_package_id, version_number, org_id, lead_id, site_id, program_ref,
           author_id, executor_id, content_payload, asset_refs, library_refs, provenance,
           content_checksum)
         values ($1, 1, $2, $3, $4, 'program', 'author', 'executor', $5, '[]'::jsonb, $6, '[]'::jsonb, $7)`,
        [packageId, ORG_A, `lead-${packageId}`, SITE_A, contentPayload, libraryRefs, checksum],
      )).rejects.toThrow()
    }

    await expect(insertPackage('wp-db-contract-template', 'unknown-template')).rejects.toThrow()

    const page = workingContentFixture.content.pages[0]
    const section = page.sections[0]
    await expectRejectedVersion('wp-db-contract-page-id-number', {
      pages: [{ ...page, pageId: 7 }],
    })
    await expectRejectedVersion('wp-db-contract-route-number', {
      pages: [{ ...page, route: 7 }],
    })
    await expectRejectedVersion('wp-db-contract-section-id-number', {
      pages: [{ ...page, sections: [{ ...section, sectionId: 7 }] }],
    })
    await expectRejectedVersion('wp-db-contract-component-id-number', {
      pages: [{ ...page, sections: [{ ...section, componentId: 7 }] }],
    })
    await expectRejectedVersion('wp-db-contract-lang-number', {
      pages: [{ ...page, sections: [{ ...section, content: { ...section.content, lang: 7 } }] }],
    })
    await expectRejectedVersion('wp-db-contract-library-id-number', workingContentFixture.content, [
      { libraryId: 7, sha: workingContentFixture.libraryRefs[0].sha },
    ])
    await expectRejectedVersion('wp-db-contract-sha-number', workingContentFixture.content, [
      { libraryId: 'component.hero', sha: 7 },
    ])

    await expectRejectedVersion('wp-db-contract-page-extra-key', {
      pages: [{ ...page, unexpected: true }],
    })
    await expectRejectedVersion('wp-db-contract-section-extra-key', {
      pages: [{ ...page, sections: [{ ...section, unexpected: true }] }],
    })
    await expectRejectedVersion('wp-db-contract-library-extra-key', workingContentFixture.content, [
      { ...workingContentFixture.libraryRefs[0], unexpected: true },
    ])
    await expectRejectedVersion('wp-db-contract-unknown-component', {
      pages: [{ ...page, sections: [{ ...section, componentId: 'UnknownComponent' }] }],
    })
    await expectRejectedVersion('wp-db-contract-uppercase-sha', workingContentFixture.content, [
      { libraryId: 'component.hero', sha: '0123456789ABCDEF0123456789abcdef01234567' },
    ])
    await expectRejectedVersion('wp-db-contract-short-sha', workingContentFixture.content, [
      { libraryId: 'component.hero', sha: '0123456789abcdef0123456789abcdef0123456' },
    ])
  })
})

describe('working-content gates and promotion boundary', () => {
  it('requires gate evidence, selects the exact accepted checksum, and records an idempotent receipt', async () => {
    const first = await createVersion('wp-promotion', null)
    await expect(asRuntime(USER_A, () => repository.markGateOutcome({
      workingPackageId: 'wp-promotion', versionNumber: 1, expectedChecksum: first.contentChecksum,
      outcome: 'accepted', gateReference: 'gate://missing-evidence', evidenceReferences: [],
    }))).rejects.toMatchObject({ code: 'invalid_input' })
    await acceptVersion('wp-promotion', 1, first.contentChecksum)
    const prepared = await asRuntime(USER_A, () => repository.preparePromotion({
      orgId: ORG_A, workingPackageId: 'wp-promotion', versionNumber: 1,
      contentChecksum: first.contentChecksum, promotionIdempotencyKey: 'promote:wp-promotion:1',
    }))
    const retried = await asRuntime(USER_A, () => repository.preparePromotion({
      orgId: ORG_A, workingPackageId: 'wp-promotion', versionNumber: 1,
      contentChecksum: first.contentChecksum, promotionIdempotencyKey: 'promote:wp-promotion:1',
    }))
    expect(retried).toEqual(prepared)
    await expect(asRuntime(USER_A, () => repository.preparePromotion({
      orgId: ORG_A, workingPackageId: 'wp-promotion', versionNumber: 1,
      contentChecksum: first.contentChecksum, promotionIdempotencyKey: 'promote:wp-promotion:different-key',
    }))).rejects.toMatchObject({ code: 'conflict' })
    const receiptInput = {
      orgId: ORG_A, workingPackageId: 'wp-promotion', versionNumber: 1,
      promotionIdempotencyKey: 'promote:wp-promotion:1', contentChecksum: first.contentChecksum,
      promotionReceiptId: 'receipt-1', payloadTargetCollection: 'pages', payloadDocumentId: 'pages::home',
      payloadDraftRevision: 'draft-revision-1', receipt: { status: 'succeeded', evidence: 'evidence://promotion/1' },
    }
    const receipt = await asRuntime(USER_A, () => repository.recordPromotionReceipt(receiptInput))
    const receiptRetry = await asRuntime(USER_A, () => repository.recordPromotionReceipt({ ...receiptInput, promotionReceiptId: 'different-receipt-on-retry' }))
    expect(receiptRetry).toEqual(receipt)
    await expect(asRuntime(USER_A, () => repository.selectExactAcceptedVersion({ workingPackageId: 'wp-promotion', versionNumber: 1, contentChecksum: first.contentChecksum }))).resolves.toMatchObject({ lifecycleState: 'promoted' })
    await asRuntime(USER_A, async () => {
      await expect(db.query(
        `update lsites_sites.working_content_versions
            set payload_document_id = 'tampered'
          where working_package_id = 'wp-promotion' and version_number = 1`,
      )).rejects.toThrow(/promoted working content is immutable/)
    })
    await expect(asRuntime(USER_A, () => repository.preparePromotion({
      orgId: ORG_A, workingPackageId: 'wp-promotion', versionNumber: 1,
      contentChecksum: computeWorkingContentChecksum(revisedWorkingContentFixture()), promotionIdempotencyKey: 'promote:wp-promotion:1',
    }))).rejects.toMatchObject({ code: 'conflict' })
  })
})

describe('forward-only migration boundary', () => {
  it('applies the exact migration file on a clean database and contains no rollback block', async () => {
    const migration = fullSql(workingContentMigration)
    expect(migration).not.toContain('-- migrate:down')
    expect(fullSql(workingContentPrivilegeMigration)).not.toContain('-- migrate:down')
    await expect(db.query(
      `select table_name from information_schema.tables
        where table_schema = 'lsites_sites'
          and table_name in ('working_packages', 'working_content_versions', 'working_content_promotion_receipts')
        order by table_name`,
    )).resolves.toMatchObject({ rows: [
      { table_name: 'working_content_promotion_receipts' },
      { table_name: 'working_content_versions' },
      { table_name: 'working_packages' },
    ] })
  })
})

describe('working-content RLS and credential boundary', () => {
  it('removes inherited destructive privileges while preserving same-org working-content operations', async () => {
    const privileges = await db.query(`
      select
        has_table_privilege('svc_linksites_runtime', 'lsites_sites.working_packages', 'select') as packages_select,
        has_table_privilege('svc_linksites_runtime', 'lsites_sites.working_packages', 'insert') as packages_insert,
        has_table_privilege('svc_linksites_runtime', 'lsites_sites.working_packages', 'update') as packages_update,
        has_table_privilege('svc_linksites_runtime', 'lsites_sites.working_packages', 'delete') as packages_delete,
        has_table_privilege('svc_linksites_runtime', 'lsites_sites.working_content_versions', 'select') as versions_select,
        has_table_privilege('svc_linksites_runtime', 'lsites_sites.working_content_versions', 'insert') as versions_insert,
        has_table_privilege('svc_linksites_runtime', 'lsites_sites.working_content_versions', 'update') as versions_update,
        has_table_privilege('svc_linksites_runtime', 'lsites_sites.working_content_versions', 'delete') as versions_delete,
        has_table_privilege('svc_linksites_runtime', 'lsites_sites.working_content_promotion_receipts', 'select') as receipts_select,
        has_table_privilege('svc_linksites_runtime', 'lsites_sites.working_content_promotion_receipts', 'insert') as receipts_insert,
        has_table_privilege('svc_linksites_runtime', 'lsites_sites.working_content_promotion_receipts', 'update') as receipts_update,
        has_table_privilege('svc_linksites_runtime', 'lsites_sites.working_content_promotion_receipts', 'delete') as receipts_delete
    `)
    expect(privileges.rows[0]).toEqual({
      packages_select: true,
      packages_insert: true,
      packages_update: true,
      packages_delete: false,
      versions_select: true,
      versions_insert: true,
      versions_update: true,
      versions_delete: false,
      receipts_select: true,
      receipts_insert: true,
      receipts_update: false,
      receipts_delete: false,
    })

    const version = await createVersion('wp-runtime-privileges', null)
    await acceptVersion('wp-runtime-privileges', version.versionNumber, version.contentChecksum)
    await asRuntime(USER_A, async () => {
      await expect(db.query(
        `delete from lsites_sites.working_content_versions
          where working_package_id = 'wp-runtime-privileges' and version_number = 1`,
      )).rejects.toThrow(/permission denied/i)
    })

    await asRuntime(USER_A, () => repository.preparePromotion({
      orgId: ORG_A,
      workingPackageId: 'wp-runtime-privileges',
      versionNumber: version.versionNumber,
      contentChecksum: version.contentChecksum,
      promotionIdempotencyKey: 'promote:wp-runtime-privileges:1',
    }))
    await asRuntime(USER_A, () => repository.recordPromotionReceipt({
      orgId: ORG_A,
      workingPackageId: 'wp-runtime-privileges',
      versionNumber: version.versionNumber,
      promotionIdempotencyKey: 'promote:wp-runtime-privileges:1',
      contentChecksum: version.contentChecksum,
      promotionReceiptId: 'receipt-runtime-privileges',
      payloadTargetCollection: 'pages',
      payloadDocumentId: 'pages::home',
      payloadDraftRevision: 'draft-revision-runtime-privileges',
      receipt: { status: 'succeeded' },
    }))

    await asRuntime(USER_A, async () => {
      await expect(db.query(
        `delete from lsites_sites.working_content_versions
          where working_package_id = 'wp-runtime-privileges' and version_number = 1`,
      )).rejects.toThrow(/permission denied/i)
      await expect(db.query(
        `delete from lsites_sites.working_content_promotion_receipts
          where promotion_receipt_id = 'receipt-runtime-privileges'`,
      )).rejects.toThrow(/permission denied/i)
      await expect(db.query(
        `update lsites_sites.working_content_promotion_receipts
            set receipt = '{"status":"tampered"}'::jsonb
          where promotion_receipt_id = 'receipt-runtime-privileges'`,
      )).rejects.toThrow(/permission denied/i)
      await expect(db.query(
        `select lifecycle_state from lsites_sites.working_content_versions
          where working_package_id = 'wp-runtime-privileges' and version_number = 1`,
      )).resolves.toMatchObject({ rows: [{ lifecycle_state: 'promoted' }] })
      await expect(db.query(
        `select receipt from lsites_sites.working_content_promotion_receipts
          where promotion_receipt_id = 'receipt-runtime-privileges'`,
      )).resolves.toMatchObject({ rows: [{ receipt: { status: 'succeeded' } }] })
    })
  })

  it('allows same-org service access and denies cross-org repository reads/writes', async () => {
    const own = await createVersion('wp-org-a', null)
    await expect(asRuntime(USER_B, () => repository.readVersion('wp-org-a', own.versionNumber))).resolves.toBeNull()
    await expect(asRuntime(USER_B, () => repository.createVersion({
      workingPackageId: 'wp-org-b-attempt', orgId: ORG_A, leadId: 'lead-cross-org', siteId: SITE_A,
      programRef: 'program', expectedCurrentVersion: null, authorId: 'author', executorId: 'executor', contentPackage: workingContentFixture,
    }))).rejects.toThrow(/row-level security|permission denied|working package/i)
    await expect(asRuntime(USER_B, () => repository.createVersion('bad' as never))).rejects.toBeDefined()
  })

  it('does not grant browser/public roles mutation access', async () => {
    await db.query("select set_config('app.current_user_id', $1, false)", [USER_A])
    await db.query('set role authenticated')
    try {
      await expect(db.query(
        `insert into lsites_sites.working_packages (working_package_id, org_id, lead_id, site_id)
         values ('wp-browser', $1, 'lead-browser', $2)`,
        [ORG_A, SITE_A],
      )).rejects.toThrow(/permission denied|row-level security/i)
    } finally {
      await db.query('reset role')
    }
  })
})

describe('legacy mirror boundary', () => {
  it('has no active factory-catalog package script invoking the retired mirror path', async () => {
    const packageJson = JSON.parse(readFileSync(resolve(__dirname, '../package.json'), 'utf8')) as { scripts?: Record<string, string> }
    expect(Object.values(packageJson.scripts ?? {}).join('\n')).not.toMatch(/lsites_core|sync_ingress|sync_jobs|mirror/i)
  })
})

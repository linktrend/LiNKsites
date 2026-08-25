import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { migrations } from '../../src/migrations'
import { LS03_PAYLOAD_MIGRATION } from '../../src/payload/ls03/semanticContract'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..')

function sha256(relativePath: string): string {
  return createHash('sha256').update(readFileSync(join(repoRoot, relativePath))).digest('hex')
}

describe('LS-03 ISS-12 additive migrations and rollback proof', () => {
  it('registers one new additive Payload migration after applied history', () => {
    const names = migrations.map((migration) => migration.name)
    expect(names).toEqual([
      '20251212_000000_payload_initial_baseline',
      '20251213_locked_docs',
      '20260810_000003_pages_public_activation',
      LS03_PAYLOAD_MIGRATION,
    ])
  })

  it('does not rewrite applied Payload migration bytes', () => {
    const applied = [
      'apps/cms/src/migrations/20251212_000000_payload_initial_baseline.ts',
      'apps/cms/src/migrations/20251213_locked_docs.ts',
      'apps/cms/src/migrations/20260810_000003_pages_public_activation.ts',
    ]
    for (const relativePath of applied) {
      const head = execFileSync('git', ['show', `origin/development:${relativePath}`], {
        cwd: repoRoot,
        encoding: 'utf8',
      })
      expect(readFileSync(join(repoRoot, relativePath), 'utf8')).toBe(head)
      expect(sha256(relativePath)).toHaveLength(64)
    }
  })

  it('keeps down() as the rollback path for the additive LS-03 migration', async () => {
    const ls03 = migrations.find((migration) => migration.name === LS03_PAYLOAD_MIGRATION)
    expect(ls03).toBeDefined()
    const executed: string[] = []
    await expect(
      ls03!.down({
        db: {
          execute: async (statement: { queryChunks?: unknown }) => {
            executed.push(String(statement))
          },
        },
        payload: { logger: { info() {} } },
      } as never),
    ).resolves.toBeUndefined()
    expect(executed.length).toBeGreaterThan(0)
  })

  it('ships fresh, production-upgrade, failed, Offer/Case, and rollback fixtures', () => {
    const fixtures = {
      'supabase/tests/fixtures/ls03_fresh.sql': 'adopt:fresh-site',
      'supabase/tests/fixtures/ls03_production_upgrade.sql': 'deprecated_template_id_projection',
      'supabase/tests/fixtures/ls03_failed_migration.sql': 'not-a-sha1',
      'supabase/tests/fixtures/ls03_offer_case_compat.sql': 'results-work',
      'supabase/tests/fixtures/ls03_rollback.sql': 'rolled_back',
    }
    for (const [fixture, needle] of Object.entries(fixtures)) {
      const sql = readFileSync(join(repoRoot, fixture), 'utf8')
      expect(sql).toContain(needle)
    }
  })

  it('keeps Payload as owner of public CMS tables and lsites_sites as owner of LS-03 records', () => {
    const sql = readFileSync(
      join(repoRoot, 'supabase/migrations/20260824_000001_ls03_payload_semantic_models.sql'),
      'utf8',
    )
    expect(sql.toLowerCase()).toContain('create table if not exists lsites_sites.entitlement_snapshots')
    expect(sql.toLowerCase()).toContain('create table if not exists lsites_sites.template_adoptions')
    expect(sql).not.toMatch(/create table if not exists public\.(products|services|articles)/i)
  })

  it('adds tenant-safe runtime RLS policies for every new lsites_sites LS-03 table', () => {
    const sql = readFileSync(
      join(repoRoot, 'supabase/migrations/20260824_000001_ls03_payload_semantic_models.sql'),
      'utf8',
    )
    const tables = [
      'entitlement_snapshots',
      'template_adoptions',
      'legacy_template_id_projections',
      'offer_case_compatibility',
    ]
    for (const table of tables) {
      expect(sql).toContain(`create policy ${table}_runtime_org_access`)
      expect(sql).toContain(`on lsites_sites.${table} for all to svc_linksites_runtime`)
    }
    expect(sql).toContain("using (platform.has_org_access(org_id, 'client_viewer'))")
    expect(sql).toContain("with check (platform.has_org_access(org_id, 'client_viewer'))")
    expect(sql).not.toMatch(/create policy[\s\S]*to (public|authenticated|anon)/i)
  })

  it('structurally matches new Payload collections with draft version tables and five provenance columns', () => {
    const sql = readFileSync(
      join(repoRoot, 'apps/cms/src/migrations/20260824_000001_ls03_semantic_models.ts'),
      'utf8',
    )
    const versionTables = [
      '_products_v',
      '_products_v_locales',
      '_services_v',
      '_services_v_locales',
      '_results_work_v',
      '_results_work_v_locales',
      '_service_areas_v',
      '_service_areas_v_locales',
      '_policies_v',
      '_policies_v_locales',
      '_core_settings_v',
      '_core_settings_v_locales',
    ]
    for (const table of versionTables) {
      expect(sql).toContain(`CREATE TABLE IF NOT EXISTS "${table}"`)
    }

    const provenanceColumns = [
      'provenance_source_identity',
      'provenance_evidence_digest',
      'provenance_actor_id',
      'provenance_recorded_at',
      'provenance_locale_bound',
    ]
    const existingCollections = ['articles', 'videos', 'faq_pages', 'help_articles', 'team_members', 'locations']
    for (const collection of existingCollections) {
      for (const column of provenanceColumns) {
        expect(sql).toContain(`ALTER TABLE "${collection}" ADD COLUMN IF NOT EXISTS "${column}"`)
        expect(sql).toContain(
          `ALTER TABLE "_${collection}_v" ADD COLUMN IF NOT EXISTS "version_${column}"`,
        )
      }
    }
    expect(sql).toContain('DROP TABLE IF EXISTS "_products_v"')
  })

  it('makes failed SHA-1 and rollback fixtures executable with fail-closed assertions', () => {
    const failed = readFileSync(join(repoRoot, 'supabase/tests/fixtures/ls03_failed_migration.sql'), 'utf8')
    const rollback = readFileSync(join(repoRoot, 'supabase/tests/fixtures/ls03_rollback.sql'), 'utf8')
    const runner = readFileSync(join(repoRoot, 'supabase/tests/ls03_semantic_models.sql'), 'utf8')
    expect(failed).toContain('not-a-sha1')
    expect(failed).toContain('when check_violation')
    expect(failed).toContain("adoption_id = 'adopt:fail-site'")
    expect(rollback).toContain("'rolled_back'")
    expect(rollback).toMatch(/insert into lsites_sites\.template_adoptions/i)
    expect(runner).toContain('\\i supabase/tests/fixtures/ls03_rollback.sql')
    expect(runner).toContain('\\i supabase/tests/fixtures/ls03_failed_migration.sql')
    expect(runner).toContain('failed SHA-1 adoption leaked')
    expect(runner).toContain('rollback template adoption fixture missing')
  })
})

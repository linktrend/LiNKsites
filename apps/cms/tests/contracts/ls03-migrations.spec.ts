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
})

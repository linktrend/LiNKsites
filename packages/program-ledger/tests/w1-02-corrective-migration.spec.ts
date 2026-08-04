import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { describe, expect, it } from 'vitest'

const here = dirname(fileURLToPath(import.meta.url))
const sql = (name: string) => readFileSync(resolve(here, '../../../supabase/migrations', name), 'utf8')
const fixtureSql = (name: string) => readFileSync(resolve(here, 'fixtures', name), 'utf8')
const integritySql = sql('20260804200000_ledger_w1_02_integrity.sql')

describe('W1-02 corrective migration forward data proof', () => {
  it('materializes legacy Stage rows into a quarantined tenant-scoped Module/Phase without deleting the legacy value', async () => {
    const db = new PGlite()
    await db.exec(`create schema if not exists auth; create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.current_user_id', true), '')::uuid $$; do $$ begin if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if; end $$;`)
    await db.exec(fixtureSql('20260714_000001_platform_foundation.sql'))
    await db.exec(sql('20260714_000001_program_ledger_core.sql'))
    await db.exec(sql('20260715_000003_lsites_ledger_dependencies.sql'))
    await db.exec(sql('20260718_000002_capability_grant_columns.sql'))
    await db.exec(sql('20260804113354_ledger_program_module_phase_gates.sql'))
    const issueId = '11111111-1111-1111-1111-111111111111'
    await db.query(`insert into lsites_ledger.programs (program_id, org_id, title, state) values ('legacy-program', 'a0000000-a000-a000-a000-a00000000001', 'Legacy', 'ready') on conflict do nothing`)
    await db.query(`insert into lsites_ledger.issues (issue_id, issue_type, program_ref, stage_ref, state, input, input_digest) values ($1, 'legacy.test', 'legacy-program', 'legacy-phase', 'ready', '{}'::jsonb, 'legacy')`, [issueId])
    await db.query(`insert into lsites_ledger.issues (issue_id, issue_type, program_ref, stage_ref, state, input, input_digest) values ('22222222-2222-2222-2222-222222222222', 'orphan.test', 'orphan-program', 'orphan-phase', 'ready', '{}'::jsonb, 'orphan')`)
    await db.exec(sql('20260804120000_ledger_tenant_leases_backfill.sql'))
    await db.exec(integritySql)
    const result = await db.query('select stage_ref, phase_ref, org_id from lsites_ledger.issues where issue_id = $1', [issueId])
    expect(result.rows[0]).toMatchObject({ stage_ref: 'legacy-phase', phase_ref: 'legacy-phase', org_id: 'a0000000-a000-a000-a000-a00000000001' })
    const hierarchy = await db.query(`select i.module_ref, i.phase_ref, m.org_id as module_org_id, p.org_id as phase_org_id, m.state as module_state, p.state as phase_state
      from lsites_ledger.issues i
      join lsites_ledger.modules m on m.program_id = i.program_ref and m.module_id = i.module_ref and m.org_id = i.org_id
      join lsites_ledger.phases p on p.program_id = i.program_ref and p.module_id = i.module_ref and p.phase_id = i.phase_ref and p.org_id = i.org_id
      where i.issue_id = $1`, [issueId])
    expect(hierarchy.rows[0]).toMatchObject({ module_ref: '__legacy_stage__', phase_ref: 'legacy-phase', module_org_id: 'a0000000-a000-a000-a000-a00000000001', phase_org_id: 'a0000000-a000-a000-a000-a00000000001', module_state: 'blocked', phase_state: 'blocked' })
    const orphanProgram = await db.query(`select 1 from lsites_ledger.programs where program_id = 'orphan-program' and org_id = 'a0000000-a000-a000-a000-a00000000001'`)
    expect(orphanProgram.rows).toHaveLength(1)
    await db.close()
  }, 15_000)
})

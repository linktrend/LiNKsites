import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest'
import { PostgresLedgerStore } from '../src/postgresStore.js'
import { ProgramLedger } from '../src/ledger.js'
import { runLedgerContractTests } from './ledgerContract.shared.js'
import { canonicalEvidence } from './evidence.js'

/**
 * Runs the SAME ledger contract test suite as tests/exit-gate.spec.ts,
 * but backed by `PostgresLedgerStore` against `@electric-sql/pglite` --
 * a real, embedded PostgreSQL engine (not a mock), which genuinely
 * exercises the SQL in supabase/migrations/20260714_000001_program_ledger_core.sql.
 *
 * This is how this package proves the Postgres adapter without a live
 * database connection (none is available while working remotely -- see
 * src/postgresStore.ts's class doc comment for exactly what this does
 * and does NOT verify).
 */

const __dirname = dirname(fileURLToPath(import.meta.url))
const coreMigrationPath = resolve(__dirname, '../../../supabase/migrations/20260714_000001_program_ledger_core.sql')
const depsMigrationPath = resolve(__dirname, '../../../supabase/migrations/20260715_000003_lsites_ledger_dependencies.sql')
const capabilityColumnsPath = resolve(
  __dirname,
  '../../../supabase/migrations/20260718_000002_capability_grant_columns.sql',
)
const hierarchyMigrationPath = resolve(__dirname, '../../../supabase/migrations/20260804113354_ledger_program_module_phase_gates.sql')
const correctiveMigrationPath = resolve(__dirname, '../../../supabase/migrations/20260804120000_ledger_tenant_leases_backfill.sql')
const integrityMigrationPath = resolve(__dirname, '../../../supabase/migrations/20260804200000_ledger_w1_02_integrity.sql')

let db: PGlite

beforeAll(async () => {
  db = new PGlite()
  await db.exec(`create schema if not exists auth; create or replace function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('app.current_user_id', true), '')::uuid $$; do $$ begin if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if; end $$;`)
  await db.exec(readFileSync(resolve(__dirname, 'fixtures/20260714_000001_platform_foundation.sql'), 'utf8'))
  await db.exec(readFileSync(coreMigrationPath, 'utf8'))
  await db.exec(readFileSync(depsMigrationPath, 'utf8'))
  await db.exec(readFileSync(capabilityColumnsPath, 'utf8'))
  await db.exec(readFileSync(hierarchyMigrationPath, 'utf8'))
  await db.exec(readFileSync(correctiveMigrationPath, 'utf8'))
  await db.exec(readFileSync(integrityMigrationPath, 'utf8'))
})

beforeEach(async () => {
  await db.exec(`
    truncate table
      lsites_ledger.issue_dependencies,
      lsites_ledger.ledger_events,
      lsites_ledger.idempotency_records,
      lsites_ledger.gate_results,
      lsites_ledger.runs,
      lsites_ledger.issues
    cascade;
  `)
})

afterAll(async () => {
  await db.close()
})

runLedgerContractTests('postgres (pglite)', () => new PostgresLedgerStore(db))

describe('PostgresLedgerStore: malformed-ID robustness (hardening pass, 2026-07-14)', () => {
  it('getIssue/getRun/getGateResult return null for a non-UUID-shaped id, instead of letting a raw Postgres error propagate', async () => {
    const store = new PostgresLedgerStore(db)

    // Found by the shared heartbeat() contract test: querying a uuid-typed column with a
    // malformed string previously threw a raw "invalid input syntax for type uuid" pg error
    // (SQLSTATE 22P02) instead of the clean `null` every other "not found" case produces.
    await expect(store.getIssue('not-a-real-uuid')).resolves.toBeNull()
    await expect(store.getRun('not-a-real-uuid')).resolves.toBeNull()
    await expect(store.getGateResult('not-a-real-uuid')).resolves.toBeNull()
  })

  it('still returns null (not an error) for a well-formed but non-existent UUID -- the normal not-found path is unaffected by this fix', async () => {
    const store = new PostgresLedgerStore(db)
    const wellFormedButUnknownUuid = '00000000-0000-0000-0000-000000000000'

    await expect(store.getIssue(wellFormedButUnknownUuid)).resolves.toBeNull()
    await expect(store.getRun(wellFormedButUnknownUuid)).resolves.toBeNull()
    await expect(store.getGateResult(wellFormedButUnknownUuid)).resolves.toBeNull()
  })
})

describe('PostgresLedgerStore: fresh-instance replay and recovery proof', () => {
  it('reclaims an interrupted Run and completes the same Issue through a fresh store instance', async () => {
    const firstLedger = new ProgramLedger(new PostgresLedgerStore(db))
    const issue = await firstLedger.createIssue({ issueType: 'recovery.fresh-instance', programRef: 'recovery-program', input: { step: 'durable' } })
    const firstRun = await firstLedger.dispatch(issue.issueId)
    const firstClaim = await firstLedger.claim(firstRun.runId, 'crashed-worker', 1)
    await new Promise((resolve) => setTimeout(resolve, 5))

    const recoveredLedger = new ProgramLedger(new PostgresLedgerStore(db))
    await recoveredLedger.reclaimExpiredLeases()
    const recoveredRun = await recoveredLedger.claim(firstRun.runId, 'recovery-worker')
    const completed = await recoveredLedger.complete(firstRun.runId, recoveredRun.lease!.fencingToken, { recovered: true })
    await recoveredLedger.decideGate(issue.issueId, completed.runId, 'accepted', await canonicalEvidence(recoveredLedger, 'issue', issue.issueId, issue.orgId!), 'recovery-reviewer')

    expect((await recoveredLedger.listAttempts(issue.issueId)).map((run) => run.runId)).toEqual([firstRun.runId])
    expect((await recoveredLedger.getIssue(issue.issueId))?.state).toBe('completed')
    expect(firstClaim.lease!.fencingToken).toBeLessThan(recoveredRun.lease!.fencingToken)
  })
})

describe('PostgresLedgerStore: ledger tenant RLS negative probe', () => {
  it('does not expose Org B hierarchy rows under an Org A runtime context', async () => {
    const orgA = '00000000-0000-0000-0000-0000000000aa'
    const orgB = '00000000-0000-0000-0000-0000000000bb'
    await db.query(`insert into platform.organizations (id, name, kind, status) values ($1, 'Ledger A', 'client', 'active'), ($2, 'Ledger B', 'client', 'active') on conflict (id) do nothing`, [orgA, orgB])
    const ledger = new ProgramLedger(new PostgresLedgerStore(db))
    const a = await ledger.createIssue({ issueType: 'tenant.probe', issueKey: 'tenant-a', programRef: 'tenant-program-a', orgId: orgA, input: {} })
    const b = await ledger.createIssue({ issueType: 'tenant.probe', issueKey: 'tenant-b', programRef: 'tenant-program-b', orgId: orgB, input: {} })
    await db.query('select set_config($1, $2, false)', ['app.org_id', orgA])
    await db.query('set role svc_linksites_ledger')
    try {
      const rows = await db.query('select issue_id from lsites_ledger.issues where issue_id in ($1, $2)', [a.issueId, b.issueId])
      expect(rows.rows.map((row) => (row as { issue_id: string }).issue_id)).toEqual([a.issueId])
    } finally {
      await db.query('reset role')
      await db.query('select set_config($1, $2, false)', ['app.org_id', ''])
    }
  })
})

describe('PostgresLedgerStore: direct SQL composite-FK negative probes', () => {
  it('rejects cross-tenant hierarchy, dependency, gate, event, and idempotency links', async () => {
    const orgA = '00000000-0000-0000-0000-0000000000ca'
    const orgB = '00000000-0000-0000-0000-0000000000cb'
    await db.query(`insert into platform.organizations (id, name, kind, status) values ($1, 'FK A', 'client', 'active'), ($2, 'FK B', 'client', 'active') on conflict (id) do nothing`, [orgA, orgB])
    await db.query(`insert into lsites_ledger.programs (program_id, org_id, title, state) values ('fk-program', $1, 'FK A', 'ready'), ('fk-program', $2, 'FK B', 'ready') on conflict do nothing`, [orgA, orgB])
    await db.query(`insert into lsites_ledger.modules (program_id, module_id, org_id, title, purpose, state) values ('fk-program', 'M1', $1, 'M1', 'test', 'ready') on conflict do nothing`, [orgA])
    await db.query(`insert into lsites_ledger.phases (program_id, module_id, phase_id, org_id, title, objective, state) values ('fk-program', 'M1', 'P1', $1, 'P1', 'test', 'ready') on conflict do nothing`, [orgA])

    const invalidIssueSql = `insert into lsites_ledger.issues (issue_id, issue_type, program_ref, module_ref, phase_ref, issue_key, state, input, input_digest, intended_effect, org_id) values ($1, 'fk.test', 'fk-program', 'M1', $3, $2, 'ready', '{}'::jsonb, 'digest', 'test', $4)`
    await expect(db.query(invalidIssueSql, ['51000000-0000-0000-0000-000000000001', 'wrong-org-hierarchy', 'P1', orgB])).rejects.toThrow()
    await expect(db.query(invalidIssueSql, ['51000000-0000-0000-0000-000000000002', 'wrong-phase', 'P2', orgA])).rejects.toThrow()

    const ledger = new ProgramLedger(new PostgresLedgerStore(db))
    const issueA = await ledger.createIssue({ issueType: 'fk.owner', programRef: 'fk-program', orgId: orgA, issueKey: 'owner-a', input: {} })
    const issueB = await ledger.createIssue({ issueType: 'fk.target', programRef: 'fk-program', orgId: orgB, issueKey: 'target-b', input: {} })
    const runA = await ledger.dispatch(issueA.issueId)

    await expect(db.query(`insert into lsites_ledger.issue_dependencies (issue_id, depends_on_issue_id, org_id) values ($1, $2, $3)`, [issueA.issueId, issueB.issueId, orgA])).rejects.toThrow()
    await expect(db.query(`insert into lsites_ledger.gate_results (gate_id, issue_id, run_id, org_id, subject_type, subject_id, subject_revision, evaluator, evaluator_version, inputs, reasons, evidence_receipts, decision, evidence) values ($1, $2, $3, $4, 'issue', $2, 'revision', 'test', '1', '{}'::jsonb, '[]'::jsonb, '[]'::jsonb, 'accepted', '{}'::jsonb)`, ['52000000-0000-0000-0000-000000000001', issueA.issueId, runA.runId, orgB])).rejects.toThrow()
    await expect(db.query(`insert into lsites_ledger.ledger_events (event_id, issue_id, org_id, event_type, payload) values ($1, $2, $3, 'probe', '{}'::jsonb)`, ['53000000-0000-0000-0000-000000000001', issueA.issueId, orgB])).rejects.toThrow()
    await expect(db.query(`insert into lsites_ledger.idempotency_records (idempotency_key, issue_id, org_id, state) values ('fk-probe', $1, $2, 'reserved')`, [issueA.issueId, orgB])).rejects.toThrow()
  })
})

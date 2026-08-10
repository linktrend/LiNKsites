import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, beforeEach } from 'vitest'
import { InMemoryLedgerStore } from '../src/store.js'
import { PostgresLedgerStore } from '../src/postgresStore.js'
import { runDependencyTests } from './dependencies.shared.js'

// -------------------------------------------------------------------------
// In-memory store — fast, no setup
// -------------------------------------------------------------------------
runDependencyTests('in-memory', () => new InMemoryLedgerStore())

// -------------------------------------------------------------------------
// Postgres store (pglite) — applies BOTH migrations so the dependency
// table exists on top of the core ledger schema.
// -------------------------------------------------------------------------
const __dirname = dirname(fileURLToPath(import.meta.url))

const platformFoundationPath = resolve(__dirname, 'fixtures/20260714_000001_platform_foundation.sql')

const coreMigrationPath = resolve(
  __dirname,
  '../../../supabase/migrations/20260714_000001_program_ledger_core.sql',
)
const depsMigrationPath = resolve(
  __dirname,
  '../../../supabase/migrations/20260715_000003_lsites_ledger_dependencies.sql',
)
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
  await db.exec(readFileSync(platformFoundationPath, 'utf8'))
  await db.exec(readFileSync(coreMigrationPath, 'utf8'))
  await db.exec(readFileSync(depsMigrationPath, 'utf8'))
  await db.exec(readFileSync(capabilityColumnsPath, 'utf8'))
  await db.exec(readFileSync(hierarchyMigrationPath, 'utf8'))
  await db.exec(readFileSync(correctiveMigrationPath, 'utf8'))
  await db.exec(readFileSync(integrityMigrationPath, 'utf8'))
})

beforeEach(async () => {
  // Truncate in dependency order: issue_dependencies first (FK to issues),
  // then the rest (cascade handles child tables of issues).
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

runDependencyTests('postgres (pglite)', () => new PostgresLedgerStore(db))

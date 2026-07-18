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

let db: PGlite

beforeAll(async () => {
  db = new PGlite()
  await db.exec(readFileSync(coreMigrationPath, 'utf8'))
  await db.exec(readFileSync(depsMigrationPath, 'utf8'))
  await db.exec(readFileSync(capabilityColumnsPath, 'utf8'))
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

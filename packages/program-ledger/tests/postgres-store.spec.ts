import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { PGlite } from '@electric-sql/pglite'
import { afterAll, beforeAll, beforeEach } from 'vitest'
import { PostgresLedgerStore } from '../src/postgresStore.js'
import { runLedgerContractTests } from './ledgerContract.shared.js'

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
const migrationPath = resolve(__dirname, '../../../supabase/migrations/20260714_000001_program_ledger_core.sql')

let db: PGlite

beforeAll(async () => {
  db = new PGlite()
  const migrationSql = readFileSync(migrationPath, 'utf8')
  await db.exec(migrationSql)
})

beforeEach(async () => {
  await db.exec(`
    truncate table lsites_ledger.ledger_events, lsites_ledger.idempotency_records,
      lsites_ledger.gate_results, lsites_ledger.runs, lsites_ledger.issues cascade;
  `)
})

afterAll(async () => {
  await db.close()
})

runLedgerContractTests('postgres (pglite)', () => new PostgresLedgerStore(db))

import assert from 'node:assert/strict'
import test from 'node:test'
import type { LedgerState } from '../src/contracts.ts'
import { PostgresRuntimeStateStore, type PostgresExecutor } from '../src/postgres-runtime.ts'

const reorderObjectKeys = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(reorderObjectKeys)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).reverse().map(([key, item]) => [key, reorderObjectKeys(item)]))
}

test('Postgres runtime state checksum survives jsonb object-key reordering', async () => {
  const state = {
    schemaVersion: 1,
    program: { programId: 'program-1', orgId: 'org-1', leadId: 'lead-1', idempotencyKey: 'program-1', state: 'running', createdAt: '2026-09-07T00:00:00.000Z', updatedAt: '2026-09-07T00:00:00.000Z', graph: { modules: [] } },
    modules: [], phases: [], issues: [], runs: [], receipts: [],
    events: [{ type: 'created', at: '2026-09-07T00:00:00.000Z', data: { z: 1, a: 2 } }],
    completion: { state: 'pending', envelope: null }, outbox: [],
  } as unknown as LedgerState
  let storedState: unknown
  let storedChecksum: unknown
  const db: PostgresExecutor = {
    async query(sql, params = []) {
      if (sql.includes('insert into lsites_ledger.program_runtime_states')) {
        storedState = JSON.parse(String(params[2]))
        storedChecksum = params[3]
        return { rows: [] }
      }
      if (sql.includes('select state, state_checksum')) return { rows: [{ state: reorderObjectKeys(storedState), state_checksum: storedChecksum }] }
      return { rows: [] }
    },
  }

  const store = new PostgresRuntimeStateStore(db)
  await store.write('org-1', 'program-1', state)
  assert.deepEqual(await store.read('org-1', 'program-1'), reorderObjectKeys(state))
})

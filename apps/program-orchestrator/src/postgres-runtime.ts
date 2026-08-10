import { createHash, randomUUID } from 'node:crypto'
import type { DemoCompletionEnvelope, LeadResearchPackage } from '@linksites/types'
import type { CompletionSink, IntakeAcknowledgement, IntakeClaim, PulledWorkItem, WorkIntakePort } from '@linksites/intake-orchestrator'
import { isLeadResearchPackage } from '../../../packages/types/src/runtime-contracts.ts'
import type { DurableStateStore, LedgerState } from './contracts.ts'

/** The deployment-contract lane supplies a real pg PoolClient/Client adapter. */
export interface PostgresExecutor {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>
  end?: () => Promise<void>
}

const safeHash = (value: unknown): string => createHash('sha256').update(JSON.stringify(value)).digest('hex')

/**
 * Production state boundary. The table is intentionally migration-owned: this
 * class never creates schema at runtime and therefore cannot silently fall back
 * to a local database or an ungoverned shape.
 */
export class PostgresRuntimeStateStore implements DurableStateStore {
  constructor(private readonly db: PostgresExecutor) {}

  async read(orgId: string, programId: string): Promise<LedgerState | null> {
    const result = await this.db.query(
      `select state, state_checksum from lsites_ledger.program_runtime_states where org_id = $1 and program_id = $2`,
      [orgId, programId],
    )
    const row = result.rows[0]
    if (!row?.state) return null
    const state = row.state as LedgerState
    if (typeof row.state_checksum !== 'string' || safeHash(state) !== row.state_checksum) throw new Error('W2-02 runtime state checksum mismatch')
    return state
  }

  async write(orgId: string, programId: string, state: LedgerState): Promise<void> {
    await this.db.query(
      `insert into lsites_ledger.program_runtime_states
        (org_id, program_id, state, state_checksum, revision, updated_at)
       values ($1,$2,$3,$4,1,now())
       on conflict (org_id, program_id) do update set state = excluded.state,
         state_checksum = excluded.state_checksum, revision = program_runtime_states.revision + 1,
         updated_at = now()`,
      [orgId, programId, JSON.stringify(state), safeHash(state)],
    )
    for (const run of state.runs) {
      for (const evidence of run.evidence) {
        await this.db.query(
          `insert into lsites_ledger.evidence_receipts
            (org_id, receipt_id, program_id, issue_id, run_id, idempotency_key,
             revision_sha, checksum, storage_location, gate_association, receipt)
           values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
           on conflict (org_id, receipt_id) do nothing`,
          [orgId, evidence.receipt_id, state.program.programId, run.issueId, run.runId,
            evidence.idempotency_key, evidence.revision_sha, evidence.checksum.value,
            evidence.storage_location, evidence.gate_association, JSON.stringify(evidence)],
        )
      }
    }
  }

  async isAvailable(): Promise<boolean> {
    await this.db.query('select 1 from lsites_ledger.program_runtime_states limit 1')
    return true
  }

  async withLock<T>(orgId: string, programId: string, operation: () => Promise<T>): Promise<T> {
    await this.db.query('begin')
    try {
      await this.db.query(`select pg_advisory_xact_lock(hashtextextended($1, 0))`, [`${orgId}:${programId}`])
      const result = await operation()
      await this.db.query('commit')
      return result
    } catch (error) {
      await this.db.query('rollback').catch(() => undefined)
      throw error
    }
  }
}

/** Supabase/Postgres intake with row-level claim ownership and tenant binding. */
export class PostgresWorkIntakePort implements WorkIntakePort {
  constructor(private readonly db: PostgresExecutor, private readonly orgId: string, private readonly claimLeaseMs: number) {}

  async pullReady(limit: number, nowIso: string): Promise<readonly PulledWorkItem[]> {
    const result = await this.db.query(
      `select item_id, envelope, attempt_number from lsites_ledger.program_intake
        where org_id = $1 and (state = 'ready' or (state = 'program_retry_scheduled' and (next_attempt_at is null or next_attempt_at <= $2))
          or (state = 'claimed' and claim_expires_at <= $2))
        order by created_at limit $3`, [this.orgId, nowIso, limit])
    return result.rows.map((row) => ({ itemId: String(row.item_id), envelope: row.envelope, attemptNumber: Number(row.attempt_number ?? 0) }))
  }

  async claim(itemId: string, leadId: string, idempotencyKey: string, nowIso: string): Promise<IntakeClaim | null> {
    const claimId = `claim:${randomUUID()}`
    const result = await this.db.query(
      `update lsites_ledger.program_intake
          set state = 'claimed', claim_id = $5, claim_expires_at = $6, attempt_number = attempt_number + 1, updated_at = now()
        where org_id = $1 and item_id = $2 and lead_id = $3 and idempotency_key = $4
          and (state = 'ready' or (state = 'program_retry_scheduled' and (next_attempt_at is null or next_attempt_at <= $7))
               or (state = 'claimed' and claim_expires_at <= $7))
        returning item_id`, [this.orgId, itemId, leadId, idempotencyKey, claimId, new Date(Date.parse(nowIso) + this.claimLeaseMs).toISOString(), nowIso])
    return result.rows[0] ? { itemId, claimId } : null
  }

  async acknowledge(itemId: string, acknowledgement: IntakeAcknowledgement): Promise<void> {
    if (!acknowledgement.claimId) return
    await this.db.query(
      `update lsites_ledger.program_intake set state = $3, reason_code = $4, next_attempt_at = $5, claim_id = null, claim_expires_at = null, updated_at = now()
        where org_id = $1 and item_id = $2 and claim_id = $6`, [this.orgId, itemId, acknowledgement.state, acknowledgement.reasonCode ?? null, acknowledgement.nextAttemptAt ?? null, acknowledgement.claimId])
  }

  async reject(itemId: string, reasonCode: string): Promise<void> {
    if (!reasonCode.trim()) throw new Error('intake rejection reason is required')
    await this.db.query(
      `update lsites_ledger.program_intake set state = 'rejected', reason_code = $3, updated_at = now()
        where org_id = $1 and item_id = $2 and state in ('ready', 'program_retry_scheduled')`,
      [this.orgId, itemId, reasonCode],
    )
  }

  /**
   * The only manual/CRM-shaped write path for the production intake table.
   * Invalid packages are rejected before they can enter the ready queue; the
   * unique idempotency key makes a retry of the same accepted package safe.
   */
  async submit(envelope: LeadResearchPackage): Promise<{ itemId: string; accepted: boolean }> {
    if (!isLeadResearchPackage(envelope)) throw new Error('W2-02 intake submission failed canonical LeadResearchPackage validation')
    if (envelope.org_id !== this.orgId) throw new Error('W2-02 intake submission org does not match the runtime tenant')
    const itemId = `intake:${createHash('sha256').update(`${envelope.org_id}:${envelope.idempotency_key}`).digest('hex')}`
    const result = await this.db.query(
      `insert into lsites_ledger.program_intake (org_id, item_id, lead_id, idempotency_key, envelope, state)
       values ($1,$2,$3,$4,$5,'ready')
       on conflict (org_id, idempotency_key) do nothing
       returning item_id`,
      [this.orgId, itemId, envelope.lead_id, envelope.idempotency_key, JSON.stringify(envelope)],
    )
    return { itemId, accepted: result.rows.length === 1 }
  }
}

export class PostgresCompletionSink implements CompletionSink {
  constructor(private readonly db: PostgresExecutor, private readonly orgId: string) {}

  async write(envelope: DemoCompletionEnvelope): Promise<void> {
    await this.db.query(
      `insert into lsites_ledger.program_completion_deliveries
        (org_id, idempotency_key, envelope, envelope_checksum, delivered_at)
       values ($1,$2,$3,$4,now()) on conflict (org_id, idempotency_key) do nothing`,
      [this.orgId, envelope.idempotency_key, JSON.stringify(envelope), safeHash(envelope)],
    )
  }
}

export interface PostgresRuntimeDependencies {
  db: PostgresExecutor
  close?: () => Promise<void>
}

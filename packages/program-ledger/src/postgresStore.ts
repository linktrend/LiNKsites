import type {
  GateResult,
  IdempotencyRecord,
  IdempotencyState,
  Issue,
  IssueDependency,
  IssueState,
  LedgerEvent,
  LedgerEventType,
  Run,
  RunState,
  SchemaVersion,
} from './types.js'
import type { LedgerStore } from './store.js'

/**
 * Minimal shape both `pg`'s `Client`/`PoolClient` and `@electric-sql/pglite`'s
 * `PGlite` satisfy, so this store works against either without a hard
 * dependency on one driver.
 *
 * IMPORTANT: pass a single dedicated connection (a `pg.PoolClient` from
 * `pool.connect()`, or a `pg.Client`), not a raw `pg.Pool`. This store
 * issues explicit `BEGIN`/`COMMIT` for `reserveIdempotencyKey`'s
 * SELECT-FOR-UPDATE-then-INSERT-or-UPDATE sequence, which requires all
 * statements to run on the same connection. A `Pool` hands out a
 * different connection per query and would break that guarantee.
 */
export interface SqlExecutor {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>
}

/**
 * Postgres SQLSTATE for "invalid input syntax" (e.g. a non-UUID string
 * passed where a `uuid`-typed column is compared). A malformed ID can
 * never match any real row, so this is semantically equivalent to "not
 * found" -- callers of `getIssue`/`getRun`/`getGateResult` expect a
 * clean `null`, not a raw driver exception, for an unknown ID. Found by
 * this hardening pass's `heartbeat()` contract test (an unknown, non-
 * UUID-shaped runId previously crashed with a raw pg error instead of
 * producing the expected `LedgerError('not_found')`).
 */
const INVALID_INPUT_SYNTAX_SQLSTATE = '22P02'

function isInvalidInputSyntaxError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error && (error as { code?: unknown }).code === INVALID_INPUT_SYNTAX_SQLSTATE
}

/**
 * Runs a single-row-lookup-by-id query, translating a malformed-ID
 * "invalid input syntax" error into a clean `null` (not found) instead
 * of letting the raw driver error propagate.
 */
async function queryOneOrNull<T>(
  db: SqlExecutor,
  sql: string,
  params: unknown[],
  mapRow: (row: Record<string, unknown>) => T,
): Promise<T | null> {
  try {
    const { rows } = await db.query(sql, params)
    return rows[0] ? mapRow(rows[0]) : null
  } catch (error) {
    if (isInvalidInputSyntaxError(error)) return null
    throw error
  }
}

const schemaVersion = (row: Record<string, unknown>): SchemaVersion => ({
  major: Number(row.schema_version_major),
  minor: Number(row.schema_version_minor),
})

function toIssue(row: Record<string, unknown>): Issue {
  return {
    schemaVersion: schemaVersion(row),
    issueId: String(row.issue_id),
    issueType: String(row.issue_type),
    programRef: String(row.program_ref),
    moduleRef: (row.module_ref as string | null) ?? undefined,
    stageRef: (row.stage_ref as string | null) ?? undefined,
    state: row.state as IssueState,
    input: row.input as Record<string, unknown>,
    inputDigest: String(row.input_digest),
    sideEffectClass: row.side_effect_class as Issue['sideEffectClass'],
    retryPolicy: {
      maxAttempts: Number(row.retry_max_attempts),
      backoffBaseMs: Number(row.retry_backoff_base_ms),
      backoffMaxMs: Number(row.retry_backoff_max_ms),
    },
    timeoutMs: Number(row.timeout_ms),
    attemptCount: Number(row.attempt_count),
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
    cancelRequested: Boolean(row.cancel_requested),
  }
}

function toRun(row: Record<string, unknown>): Run {
  const hasLease = row.lease_id !== null && row.lease_id !== undefined
  return {
    schemaVersion: schemaVersion(row),
    runId: String(row.run_id),
    issueId: String(row.issue_id),
    attemptNumber: Number(row.attempt_number),
    state: row.state as RunState,
    inputSnapshot: row.input_snapshot as Record<string, unknown>,
    lease: hasLease
      ? {
          leaseId: String(row.lease_id),
          fencingToken: Number(row.lease_fencing_token),
          executorId: String(row.lease_executor_id),
          expiresAt: new Date(row.lease_expires_at as string).toISOString(),
        }
      : null,
    output: row.output ?? null,
    failure:
      row.failure_class != null
        ? { failureClass: row.failure_class as NonNullable<Run['failure']>['failureClass'], message: String(row.failure_message) }
        : null,
    createdAt: new Date(row.created_at as string).toISOString(),
    claimedAt: row.claimed_at ? new Date(row.claimed_at as string).toISOString() : null,
    lastHeartbeatAt: row.last_heartbeat_at ? new Date(row.last_heartbeat_at as string).toISOString() : null,
    completedAt: row.completed_at ? new Date(row.completed_at as string).toISOString() : null,
  }
}

function toGate(row: Record<string, unknown>): GateResult {
  return {
    schemaVersion: schemaVersion(row),
    gateId: String(row.gate_id),
    issueId: String(row.issue_id),
    runId: String(row.run_id),
    decision: row.decision as GateResult['decision'],
    evidence: row.evidence as Record<string, unknown>,
    decidedBy: (row.decided_by as string | null) ?? null,
    decidedAt: row.decided_at ? new Date(row.decided_at as string).toISOString() : null,
  }
}

function toEvent(row: Record<string, unknown>): LedgerEvent {
  return {
    schemaVersion: schemaVersion(row),
    eventId: String(row.event_id),
    issueId: String(row.issue_id),
    runId: (row.run_id as string | null) ?? null,
    type: row.event_type as LedgerEventType,
    payload: row.payload as Record<string, unknown>,
    occurredAt: new Date(row.occurred_at as string).toISOString(),
  }
}

function toIdempotency(row: Record<string, unknown>): IdempotencyRecord {
  return {
    schemaVersion: schemaVersion(row),
    idempotencyKey: String(row.idempotency_key),
    issueId: String(row.issue_id),
    runId: (row.run_id as string | null) ?? null,
    state: row.state as IdempotencyState,
    createdAt: new Date(row.created_at as string).toISOString(),
  }
}

/**
 * Postgres-backed implementation of `LedgerStore`, targeting the schema
 * in supabase/migrations/20260714_000001_program_ledger_core.sql.
 *
 * Verification status (be precise, not optimistic): this implementation
 * has been run against `@electric-sql/pglite` (a real, embedded
 * PostgreSQL engine, not a mock) in this package's test suite -- so the
 * SQL is genuinely exercised against real Postgres semantics, RLS
 * included. It has NOT been run against a live Supabase project or any
 * networked Postgres instance; connection pooling, RLS policy
 * interaction with a real `svc_linksites_ledger` role's actual grants
 * under concurrent load, and migration-apply behavior against an
 * existing populated database all remain to be verified live before
 * this is trusted in production. Do not treat the pglite test coverage
 * as equivalent to a live-environment verification.
 */
export class PostgresLedgerStore implements LedgerStore {
  constructor(private readonly db: SqlExecutor) {}

  async getIssue(issueId: string): Promise<Issue | null> {
    return queryOneOrNull(this.db, 'select * from lsites_ledger.issues where issue_id = $1', [issueId], toIssue)
  }

  async putIssue(issue: Issue): Promise<void> {
    await this.db.query(
      `insert into lsites_ledger.issues (
         issue_id, schema_version_major, schema_version_minor, issue_type, program_ref, module_ref, stage_ref,
         state, input, input_digest, side_effect_class, retry_max_attempts, retry_backoff_base_ms,
         retry_backoff_max_ms, timeout_ms, attempt_count, cancel_requested, created_at, updated_at
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       on conflict (issue_id) do update set
         state = excluded.state, input = excluded.input, input_digest = excluded.input_digest,
         side_effect_class = excluded.side_effect_class, attempt_count = excluded.attempt_count,
         cancel_requested = excluded.cancel_requested, updated_at = excluded.updated_at`,
      [
        issue.issueId,
        issue.schemaVersion.major,
        issue.schemaVersion.minor,
        issue.issueType,
        issue.programRef,
        issue.moduleRef ?? null,
        issue.stageRef ?? null,
        issue.state,
        JSON.stringify(issue.input),
        issue.inputDigest,
        issue.sideEffectClass,
        issue.retryPolicy.maxAttempts,
        issue.retryPolicy.backoffBaseMs,
        issue.retryPolicy.backoffMaxMs,
        issue.timeoutMs,
        issue.attemptCount,
        issue.cancelRequested,
        issue.createdAt,
        issue.updatedAt,
      ],
    )
  }

  async getRun(runId: string): Promise<Run | null> {
    return queryOneOrNull(this.db, 'select * from lsites_ledger.runs where run_id = $1', [runId], toRun)
  }

  async putRun(run: Run): Promise<void> {
    await this.db.query(
      `insert into lsites_ledger.runs (
         run_id, schema_version_major, schema_version_minor, issue_id, attempt_number, state, input_snapshot,
         lease_id, lease_fencing_token, lease_executor_id, lease_expires_at, output, failure_class,
         failure_message, created_at, claimed_at, last_heartbeat_at, completed_at
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
       on conflict (run_id) do update set
         state = excluded.state, lease_id = excluded.lease_id, lease_fencing_token = excluded.lease_fencing_token,
         lease_executor_id = excluded.lease_executor_id, lease_expires_at = excluded.lease_expires_at,
         output = excluded.output, failure_class = excluded.failure_class, failure_message = excluded.failure_message,
         claimed_at = excluded.claimed_at, last_heartbeat_at = excluded.last_heartbeat_at, completed_at = excluded.completed_at`,
      [
        run.runId,
        run.schemaVersion.major,
        run.schemaVersion.minor,
        run.issueId,
        run.attemptNumber,
        run.state,
        JSON.stringify(run.inputSnapshot),
        run.lease?.leaseId ?? null,
        run.lease?.fencingToken ?? null,
        run.lease?.executorId ?? null,
        run.lease?.expiresAt ?? null,
        run.output != null ? JSON.stringify(run.output) : null,
        run.failure?.failureClass ?? null,
        run.failure?.message ?? null,
        run.createdAt,
        run.claimedAt,
        run.lastHeartbeatAt,
        run.completedAt,
      ],
    )
  }

  async listRunsForIssue(issueId: string): Promise<Run[]> {
    const { rows } = await this.db.query('select * from lsites_ledger.runs where issue_id = $1 order by attempt_number', [
      issueId,
    ])
    return rows.map(toRun)
  }

  async reserveIdempotencyKey(
    record: IdempotencyRecord,
  ): Promise<{ record: IdempotencyRecord; created: boolean }> {
    // See the class-level SqlExecutor doc comment: this relies on all
    // statements below running on the SAME connection (a Client/
    // PoolClient, not a raw Pool) for the lock to be meaningful.
    await this.db.query('begin')
    try {
      const existing = await this.db.query(
        'select * from lsites_ledger.idempotency_records where idempotency_key = $1 for update',
        [record.idempotencyKey],
      )
      const existingRow = existing.rows[0]

      if (existingRow && existingRow.state !== 'failed_safe_to_retry') {
        await this.db.query('commit')
        return { record: toIdempotency(existingRow), created: false }
      }

      await this.db.query(
        `insert into lsites_ledger.idempotency_records (idempotency_key, schema_version_major, schema_version_minor, issue_id, run_id, state, created_at)
         values ($1,$2,$3,$4,$5,$6,$7)
         on conflict (idempotency_key) do update set
           issue_id = excluded.issue_id, run_id = excluded.run_id, state = excluded.state, created_at = excluded.created_at`,
        [
          record.idempotencyKey,
          record.schemaVersion.major,
          record.schemaVersion.minor,
          record.issueId,
          record.runId,
          record.state,
          record.createdAt,
        ],
      )
      await this.db.query('commit')
      return { record, created: true }
    } catch (error) {
      await this.db.query('rollback')
      throw error
    }
  }

  async getIdempotencyRecord(key: string): Promise<IdempotencyRecord | null> {
    const { rows } = await this.db.query('select * from lsites_ledger.idempotency_records where idempotency_key = $1', [
      key,
    ])
    return rows[0] ? toIdempotency(rows[0]) : null
  }

  async updateIdempotencyRecord(record: IdempotencyRecord): Promise<void> {
    await this.db.query(
      `insert into lsites_ledger.idempotency_records (idempotency_key, schema_version_major, schema_version_minor, issue_id, run_id, state, created_at)
       values ($1,$2,$3,$4,$5,$6,$7)
       on conflict (idempotency_key) do update set
         issue_id = excluded.issue_id, run_id = excluded.run_id, state = excluded.state`,
      [
        record.idempotencyKey,
        record.schemaVersion.major,
        record.schemaVersion.minor,
        record.issueId,
        record.runId,
        record.state,
        record.createdAt,
      ],
    )
  }

  async putGateResult(gate: GateResult): Promise<void> {
    await this.db.query(
      `insert into lsites_ledger.gate_results (gate_id, schema_version_major, schema_version_minor, issue_id, run_id, decision, evidence, decided_by, decided_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (gate_id) do update set decision = excluded.decision, evidence = excluded.evidence, decided_by = excluded.decided_by, decided_at = excluded.decided_at`,
      [
        gate.gateId,
        gate.schemaVersion.major,
        gate.schemaVersion.minor,
        gate.issueId,
        gate.runId,
        gate.decision,
        JSON.stringify(gate.evidence),
        gate.decidedBy,
        gate.decidedAt,
      ],
    )
  }

  async getGateResult(gateId: string): Promise<GateResult | null> {
    return queryOneOrNull(this.db, 'select * from lsites_ledger.gate_results where gate_id = $1', [gateId], toGate)
  }

  async appendEvent(event: LedgerEvent): Promise<void> {
    await this.db.query(
      `insert into lsites_ledger.ledger_events (event_id, schema_version_major, schema_version_minor, issue_id, run_id, event_type, payload, occurred_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        event.eventId,
        event.schemaVersion.major,
        event.schemaVersion.minor,
        event.issueId,
        event.runId,
        event.type,
        JSON.stringify(event.payload),
        event.occurredAt,
      ],
    )
  }

  async listEvents(issueId: string): Promise<LedgerEvent[]> {
    const { rows } = await this.db.query(
      'select * from lsites_ledger.ledger_events where issue_id = $1 order by occurred_at asc',
      [issueId],
    )
    return rows.map(toEvent)
  }

  async listExpiredLeaseRuns(nowIso: string): Promise<Run[]> {
    const { rows } = await this.db.query(
      `select * from lsites_ledger.runs
       where state in ('claimed', 'executing') and lease_expires_at is not null and lease_expires_at < $1`,
      [nowIso],
    )
    return rows.map(toRun)
  }

  async addIssueDependency(dep: IssueDependency): Promise<void> {
    await this.db.query(
      `insert into lsites_ledger.issue_dependencies (issue_id, depends_on_issue_id, created_at)
       values ($1, $2, $3)
       on conflict (issue_id, depends_on_issue_id) do nothing`,
      [dep.issueId, dep.dependsOnIssueId, dep.createdAt],
    )
  }

  async getIssueDependencies(issueId: string): Promise<IssueDependency[]> {
    try {
      const { rows } = await this.db.query(
        'select issue_id, depends_on_issue_id, created_at from lsites_ledger.issue_dependencies where issue_id = $1',
        [issueId],
      )
      return rows.map((row) => ({
        issueId: String(row.issue_id),
        dependsOnIssueId: String(row.depends_on_issue_id),
        createdAt: new Date(row.created_at as string).toISOString(),
      }))
    } catch (error) {
      if (isInvalidInputSyntaxError(error)) return []
      throw error
    }
  }
}

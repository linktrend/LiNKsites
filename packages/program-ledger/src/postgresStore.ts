import type {
  GateResult,
  GateSubjectType,
  HierarchySubjectRef,
  IdempotencyRecord,
  IdempotencyState,
  Issue,
  IssueDependency,
  IssueState,
  LedgerEvent,
  LedgerEventType,
  LedgerSnapshot,
  Module,
  Phase,
  Program,
  Run,
  RunState,
  SchemaVersion,
  UnresolvedDependency,
  WorkState,
} from './types.js'
import { DEFAULT_ORG_ID } from './types.js'
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
    phaseRef: (row.phase_ref as string | null) ?? undefined,
    issueKey: (row.issue_key as string | null) ?? undefined,
    target: (row.target as string | null) ?? null,
    intendedEffect: String(row.intended_effect ?? row.issue_type),
    correlationId: (row.correlation_id as string | null) ?? null,
    state: row.state as IssueState,
    input: row.input as Record<string, unknown>,
    inputDigest: String(row.input_digest),
    sideEffectClass: row.side_effect_class as Issue['sideEffectClass'],
    requiredCapabilityId: (row.required_capability_id as string | null) ?? null,
    orgId: (row.org_id as string | null) ?? DEFAULT_ORG_ID,
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
    retryAt: row.retry_at ? new Date(row.retry_at as string).toISOString() : null,
  }
}

function toRun(row: Record<string, unknown>): Run {
  const hasLease = row.lease_id !== null && row.lease_id !== undefined
  return {
    schemaVersion: schemaVersion(row),
    runId: String(row.run_id),
    issueId: String(row.issue_id),
    orgId: String(row.org_id ?? DEFAULT_ORG_ID),
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
    executorType: (row.executor_type as string | null) ?? null,
    executorVersion: (row.executor_version as string | null) ?? null,
    correlationId: (row.correlation_id as string | null) ?? null,
    idempotencyKey: String(row.idempotency_key ?? ''),
    output: row.output ?? null,
    failure:
      row.failure_class != null
        ? { failureClass: row.failure_class as NonNullable<Run['failure']>['failureClass'], message: String(row.failure_message) }
        : null,
    createdAt: new Date(row.created_at as string).toISOString(),
    claimedAt: row.claimed_at ? new Date(row.claimed_at as string).toISOString() : null,
    startedAt: row.started_at ? new Date(row.started_at as string).toISOString() : null,
    lastHeartbeatAt: row.last_heartbeat_at ? new Date(row.last_heartbeat_at as string).toISOString() : null,
    completedAt: row.completed_at ? new Date(row.completed_at as string).toISOString() : null,
    terminalState: (row.terminal_state as Run['terminalState']) ?? null,
  }
}

function toGate(row: Record<string, unknown>): GateResult {
  return {
    schemaVersion: schemaVersion(row),
    gateId: String(row.gate_id),
    subjectType: (row.subject_type as GateSubjectType) ?? 'issue',
    subjectId: String(row.subject_id ?? row.issue_id),
    orgId: String(row.org_id ?? DEFAULT_ORG_ID),
    subjectProgramId: String(row.subject_program_id ?? row.program_ref ?? ''),
    subjectModuleId: (row.subject_module_id as string | null) ?? null,
    subjectPhaseId: (row.subject_phase_id as string | null) ?? null,
    subjectRevision: String(row.subject_revision ?? row.decided_at ?? ''),
    attempt: Number(row.attempt ?? 1),
    evaluator: String(row.evaluator ?? row.decided_by ?? 'legacy'),
    evaluatorVersion: String(row.evaluator_version ?? '1'),
    inputs: (row.inputs ?? row.evidence) as Record<string, unknown>,
    reasons: (row.reasons ?? []) as string[],
    evidenceReceipts: (row.evidence_receipts ?? []) as GateResult['evidenceReceipts'],
    issueId: (row.issue_id as string | null) ?? null,
    runId: (row.run_id as string | null) ?? null,
    decision: row.decision as GateResult['decision'],
    evidence: row.evidence as Record<string, unknown>,
    decidedBy: (row.decided_by as string | null) ?? null,
    decidedAt: row.decided_at ? new Date(row.decided_at as string).toISOString() : null,
  }
}

const GATE_INSERT_SQL = `insert into lsites_ledger.gate_results (
  gate_id, schema_version_major, schema_version_minor, issue_id, run_id, org_id,
  subject_type, subject_id, subject_program_id, subject_module_id, subject_phase_id,
  subject_revision, attempt, evaluator, evaluator_version, inputs, reasons,
  evidence_receipts, decision, evidence, decided_by, decided_at
) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22)`

function gateParams(gate: GateResult): unknown[] {
  return [gate.gateId, gate.schemaVersion.major, gate.schemaVersion.minor, gate.issueId, gate.runId, gate.orgId, gate.subjectType, gate.subjectId, gate.subjectProgramId, gate.subjectModuleId, gate.subjectPhaseId, gate.subjectRevision, gate.attempt, gate.evaluator, gate.evaluatorVersion, JSON.stringify(gate.inputs), JSON.stringify(gate.reasons), JSON.stringify(gate.evidenceReceipts), gate.decision, JSON.stringify(gate.evidence), gate.decidedBy, gate.decidedAt]
}

function toEvent(row: Record<string, unknown>): LedgerEvent {
  return {
    schemaVersion: schemaVersion(row),
    eventId: String(row.event_id),
    issueId: row.issue_id == null ? null : String(row.issue_id),
    orgId: String(row.org_id ?? DEFAULT_ORG_ID),
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
    orgId: String(row.org_id ?? DEFAULT_ORG_ID),
    runId: (row.run_id as string | null) ?? null,
    state: row.state as IdempotencyState,
    createdAt: new Date(row.created_at as string).toISOString(),
  }
}

function toProgram(row: Record<string, unknown>): Program {
  return { schemaVersion: schemaVersion(row), programId: String(row.program_id), orgId: (row.org_id as string | null) ?? null, title: String(row.title), state: row.state as Program['state'], revision: Number(row.revision), createdAt: new Date(row.created_at as string).toISOString(), updatedAt: new Date(row.updated_at as string).toISOString() }
}

function toModule(row: Record<string, unknown>): Module {
  return { schemaVersion: schemaVersion(row), moduleId: String(row.module_id), programId: String(row.program_id), orgId: (row.org_id as string | null) ?? null, title: String(row.title), purpose: String(row.purpose), state: row.state as Module['state'], revision: Number(row.revision), createdAt: new Date(row.created_at as string).toISOString(), updatedAt: new Date(row.updated_at as string).toISOString() }
}

function toPhase(row: Record<string, unknown>): Phase {
  return { schemaVersion: schemaVersion(row), phaseId: String(row.phase_id), moduleId: String(row.module_id), programId: String(row.program_id), orgId: (row.org_id as string | null) ?? null, title: String(row.title), objective: String(row.objective), state: row.state as Phase['state'], revision: Number(row.revision), createdAt: new Date(row.created_at as string).toISOString(), updatedAt: new Date(row.updated_at as string).toISOString() }
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

  async getProgram(programId: string, orgId?: string): Promise<Program | null> {
    return queryOneOrNull(this.db, 'select * from lsites_ledger.programs where program_id = $1 and org_id = $2', [programId, orgId ?? DEFAULT_ORG_ID], toProgram)
  }

  async putProgram(program: Program): Promise<void> {
    await this.db.query(`insert into lsites_ledger.programs (program_id, schema_version_major, schema_version_minor, org_id, title, state, revision, created_at, updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict (program_id, org_id) do update set title=excluded.title,state=excluded.state,revision=excluded.revision,updated_at=excluded.updated_at`, [program.programId, program.schemaVersion.major, program.schemaVersion.minor, program.orgId, program.title, program.state, program.revision, program.createdAt, program.updatedAt])
  }

  async listPrograms(orgId?: string): Promise<Program[]> {
    const { rows } = await this.db.query('select * from lsites_ledger.programs where org_id = $1 order by program_id', [orgId ?? DEFAULT_ORG_ID])
    return rows.map(toProgram)
  }

  async getModule(programId: string, moduleId: string, orgId?: string): Promise<Module | null> {
    return queryOneOrNull(this.db, 'select * from lsites_ledger.modules where program_id = $1 and module_id = $2 and org_id = $3', [programId, moduleId, orgId ?? DEFAULT_ORG_ID], toModule)
  }

  async putModule(module: Module): Promise<void> {
    await this.db.query(`insert into lsites_ledger.modules (program_id,module_id,schema_version_major,schema_version_minor,org_id,title,purpose,state,revision,created_at,updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) on conflict (program_id,module_id,org_id) do update set title=excluded.title,purpose=excluded.purpose,state=excluded.state,revision=excluded.revision,updated_at=excluded.updated_at`, [module.programId, module.moduleId, module.schemaVersion.major, module.schemaVersion.minor, module.orgId, module.title, module.purpose, module.state, module.revision, module.createdAt, module.updatedAt])
  }

  async listModules(programId: string, orgId?: string): Promise<Module[]> {
    const { rows } = await this.db.query('select * from lsites_ledger.modules where program_id = $1 and org_id = $2 order by module_id', [programId, orgId ?? DEFAULT_ORG_ID])
    return rows.map(toModule)
  }

  async getPhase(programId: string, moduleId: string, phaseId: string, orgId?: string): Promise<Phase | null> {
    return queryOneOrNull(this.db, 'select * from lsites_ledger.phases where program_id = $1 and module_id = $2 and phase_id = $3 and org_id = $4', [programId, moduleId, phaseId, orgId ?? DEFAULT_ORG_ID], toPhase)
  }

  async putPhase(phase: Phase): Promise<void> {
    await this.db.query(`insert into lsites_ledger.phases (program_id,module_id,phase_id,schema_version_major,schema_version_minor,org_id,title,objective,state,revision,created_at,updated_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) on conflict (program_id,module_id,phase_id,org_id) do update set title=excluded.title,objective=excluded.objective,state=excluded.state,revision=excluded.revision,updated_at=excluded.updated_at`, [phase.programId, phase.moduleId, phase.phaseId, phase.schemaVersion.major, phase.schemaVersion.minor, phase.orgId, phase.title, phase.objective, phase.state, phase.revision, phase.createdAt, phase.updatedAt])
  }

  async listPhases(programId: string, moduleId: string, orgId?: string): Promise<Phase[]> {
    const { rows } = await this.db.query('select * from lsites_ledger.phases where program_id = $1 and module_id = $2 and org_id = $3 order by phase_id', [programId, moduleId, orgId ?? DEFAULT_ORG_ID])
    return rows.map(toPhase)
  }

  async getIssue(issueId: string): Promise<Issue | null> {
    return queryOneOrNull(this.db, 'select * from lsites_ledger.issues where issue_id = $1', [issueId], toIssue)
  }

  async getIssueByKey(issueKey: string, orgId?: string): Promise<Issue | null> {
    return queryOneOrNull(this.db, 'select * from lsites_ledger.issues where issue_key = $1 and org_id = $2', [issueKey, orgId ?? DEFAULT_ORG_ID], toIssue)
  }

  async putIssue(issue: Issue): Promise<void> {
    await this.db.query(
      `insert into lsites_ledger.issues (
         issue_id, schema_version_major, schema_version_minor, issue_type, program_ref, module_ref, phase_ref, issue_key, target, intended_effect, correlation_id,
         state, input, input_digest, side_effect_class, org_id, required_capability_id,
         retry_max_attempts, retry_backoff_base_ms,
         retry_backoff_max_ms, timeout_ms, attempt_count, cancel_requested, retry_at, created_at, updated_at
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)
       on conflict (issue_id) do update set
         state = excluded.state, input = excluded.input, input_digest = excluded.input_digest,
         side_effect_class = excluded.side_effect_class,
         org_id = excluded.org_id, required_capability_id = excluded.required_capability_id,
         phase_ref = excluded.phase_ref, issue_key = excluded.issue_key, target = excluded.target, intended_effect = excluded.intended_effect, correlation_id = excluded.correlation_id,
         attempt_count = excluded.attempt_count, retry_at = excluded.retry_at,
         cancel_requested = excluded.cancel_requested, updated_at = excluded.updated_at`,
      [
        issue.issueId,
        issue.schemaVersion.major,
        issue.schemaVersion.minor,
        issue.issueType,
        issue.programRef,
        issue.moduleRef ?? null,
        issue.phaseRef ?? null,
        issue.issueKey ?? null,
        issue.target ?? null,
        issue.intendedEffect,
        issue.correlationId ?? null,
        issue.state,
        JSON.stringify(issue.input),
        issue.inputDigest,
        issue.sideEffectClass,
        issue.orgId ?? null,
        issue.requiredCapabilityId ?? null,
        issue.retryPolicy.maxAttempts,
        issue.retryPolicy.backoffBaseMs,
        issue.retryPolicy.backoffMaxMs,
        issue.timeoutMs,
        issue.attemptCount,
        issue.cancelRequested,
        issue.retryAt,
        issue.createdAt,
        issue.updatedAt,
      ],
    )
  }

  async listIssues(filter: { orgId?: string; programId?: string; moduleId?: string; phaseId?: string } = {}): Promise<Issue[]> {
    const { rows } = await this.db.query(
      `select * from lsites_ledger.issues
       where ($1::uuid is null or org_id = $1)
         and ($2::text is null or program_ref = $2)
         and ($3::text is null or module_ref = $3)
         and ($4::text is null or phase_ref = $4)
       order by created_at, issue_id`,
      [filter.orgId ?? DEFAULT_ORG_ID, filter.programId ?? null, filter.moduleId ?? null, filter.phaseId ?? null],
    )
    return rows.map(toIssue)
  }

  async getRun(runId: string): Promise<Run | null> {
    return queryOneOrNull(this.db, 'select * from lsites_ledger.runs where run_id = $1', [runId], toRun)
  }

  async putRun(run: Run): Promise<void> {
    await this.db.query(
      `insert into lsites_ledger.runs (
         run_id, schema_version_major, schema_version_minor, issue_id, org_id, attempt_number, state, input_snapshot,
         lease_id, lease_fencing_token, lease_executor_id, lease_expires_at, output, failure_class,
         failure_message, executor_type, executor_version, correlation_id, idempotency_key, created_at, claimed_at, started_at, last_heartbeat_at, completed_at, terminal_state
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
       on conflict (run_id) do update set
         state = excluded.state, lease_id = excluded.lease_id, lease_fencing_token = excluded.lease_fencing_token,
         lease_executor_id = excluded.lease_executor_id, lease_expires_at = excluded.lease_expires_at,
         output = excluded.output, failure_class = excluded.failure_class, failure_message = excluded.failure_message,
         executor_type = excluded.executor_type, executor_version = excluded.executor_version, correlation_id = excluded.correlation_id,
         idempotency_key = excluded.idempotency_key, claimed_at = excluded.claimed_at, started_at = excluded.started_at,
         last_heartbeat_at = excluded.last_heartbeat_at, completed_at = excluded.completed_at, terminal_state = excluded.terminal_state`,
      [
        run.runId,
        run.schemaVersion.major,
        run.schemaVersion.minor,
        run.issueId,
        run.orgId,
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
        run.executorType,
        run.executorVersion,
        run.correlationId,
        run.idempotencyKey,
        run.createdAt,
        run.claimedAt,
        run.startedAt,
        run.lastHeartbeatAt,
        run.completedAt,
        run.terminalState,
      ],
    )
  }

  async listRunsForIssue(issueId: string): Promise<Run[]> {
    const { rows } = await this.db.query('select * from lsites_ledger.runs where issue_id = $1 order by attempt_number', [
      issueId,
    ])
    return rows.map(toRun)
  }

  async claimRun(runId: string, executorId: string, leaseDurationMs: number, executorType: string, executorVersion: string): Promise<Run | null> {
    const { rows } = await this.db.query(
      `update lsites_ledger.runs
       set state = 'claimed', lease_id = gen_random_uuid(),
           lease_fencing_token = coalesce(lease_fencing_token, 0) + 1,
           lease_executor_id = $2, lease_expires_at = now() + ($3 * interval '1 millisecond'),
           executor_type = $4, executor_version = $5, claimed_at = now(), started_at = now(), last_heartbeat_at = now()
       where run_id = $1 and state = 'queued'
       returning *`,
      [runId, executorId, leaseDurationMs, executorType, executorVersion],
    )
    return rows[0] ? toRun(rows[0]) : null
  }

  async dispatchRun(issue: Issue, run: Run): Promise<{ run: Run; created: boolean }> {
    await this.db.query('begin')
    try {
      const existing = await this.db.query('select * from lsites_ledger.idempotency_records where idempotency_key = $1 for update', [run.idempotencyKey])
      if (existing.rows[0] && existing.rows[0].state !== 'failed_safe_to_retry') {
        const existingRunId = existing.rows[0].run_id
        const existingRun = existingRunId ? await this.db.query('select * from lsites_ledger.runs where run_id = $1', [existingRunId]) : { rows: [] }
        if (!existingRun.rows[0]) throw new Error(`idempotency record ${run.idempotencyKey} has no resolvable Run`)
        await this.db.query('commit')
        return { run: toRun(existingRun.rows[0]), created: false }
      }
      const issueUpdate = await this.db.query(`update lsites_ledger.issues set state = 'dispatched', attempt_count = $2, updated_at = $3 where issue_id = $1 and state in ('ready', 'retry_scheduled') returning *`, [issue.issueId, run.attemptNumber, run.createdAt])
      if (!issueUpdate.rows[0]) throw new Error(`Issue ${issue.issueId} is no longer dispatchable`)
      await this.db.query(`insert into lsites_ledger.runs (run_id, schema_version_major, schema_version_minor, issue_id, org_id, attempt_number, state, input_snapshot, correlation_id, idempotency_key, created_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`, [run.runId, run.schemaVersion.major, run.schemaVersion.minor, run.issueId, run.orgId, run.attemptNumber, run.state, JSON.stringify(run.inputSnapshot), run.correlationId, run.idempotencyKey, run.createdAt])
      await this.db.query(`insert into lsites_ledger.idempotency_records (idempotency_key, schema_version_major, schema_version_minor, issue_id, org_id, run_id, state, created_at) values ($1,$2,$3,$4,$5,$6,'executing',$7) on conflict (idempotency_key) do update set issue_id = excluded.issue_id, org_id = excluded.org_id, run_id = excluded.run_id, state = excluded.state, created_at = excluded.created_at`, [run.idempotencyKey, run.schemaVersion.major, run.schemaVersion.minor, run.issueId, run.orgId, run.runId, run.createdAt])
      await this.db.query('commit')
      return { run, created: true }
    } catch (error) {
      await this.db.query('rollback')
      throw error
    }
  }

  async mutateLeasedRun(input: { runId: string; fencingToken: number; kind: 'heartbeat' | 'complete' | 'fail' | 'cancel'; leaseDurationMs?: number; output?: unknown; failureClass?: string; message?: string }): Promise<Run | null> {
    const params: unknown[] = [input.runId, input.fencingToken]
    let sql: string
    if (input.kind === 'heartbeat') { params.push(input.leaseDurationMs ?? 30_000); sql = `update lsites_ledger.runs set lease_expires_at = now() + ($3 * interval '1 millisecond'), last_heartbeat_at = now() where run_id = $1 and lease_fencing_token = $2 and state in ('claimed','executing') and lease_expires_at > now() returning *` }
    else if (input.kind === 'complete') { params.push(JSON.stringify(input.output ?? null)); sql = `update lsites_ledger.runs set state = 'succeeded', terminal_state = 'succeeded', output = $3, completed_at = now() where run_id = $1 and lease_fencing_token = $2 and state in ('claimed','executing') and lease_expires_at > now() returning *` }
    else if (input.kind === 'cancel') { sql = `update lsites_ledger.runs set state = 'cancelled', terminal_state = 'cancelled', completed_at = now() where run_id = $1 and lease_fencing_token = $2 and state in ('claimed','executing','cancel_requested') and lease_expires_at > now() returning *` }
    else { params.push(input.failureClass ?? 'unknown', input.message ?? ''); sql = `update lsites_ledger.runs set state = 'failed_retryable', terminal_state = 'failed_retryable', failure_class = $3, failure_message = $4, completed_at = now() where run_id = $1 and lease_fencing_token = $2 and state in ('claimed','executing') and lease_expires_at > now() returning *` }
    const { rows } = await this.db.query(sql, params)
    return rows[0] ? toRun(rows[0]) : null
  }

  async transitionTerminalRun(input: {
    runId: string
    fencingToken: number
    kind: 'complete' | 'fail' | 'cancel'
    runState: Run['state']
    issueState: Issue['state']
    issueUpdatedAt: string
    retryAt: string | null
    output?: unknown
    failureClass?: string
    message?: string
    idempotency: IdempotencyRecord | null
    events: LedgerEvent[]
  }): Promise<Run | null> {
    await this.db.query('begin')
    try {
      const params: unknown[] = [input.runId, input.fencingToken]
      let sql: string
      if (input.kind === 'complete') {
        params.push(JSON.stringify(input.output ?? null), input.runState)
        sql = `update lsites_ledger.runs
                set state = $4::lsites_ledger.run_state, terminal_state = $4::text, output = $3, completed_at = $5
                where run_id = $1 and lease_fencing_token = $2
                  and state in ('claimed','executing') and lease_expires_at > now()
                returning *`
        params.push(input.issueUpdatedAt)
      } else if (input.kind === 'fail') {
        params.push(input.failureClass ?? 'unknown', input.message ?? '', input.runState, input.issueUpdatedAt)
        sql = `update lsites_ledger.runs
                  set state = $5::lsites_ledger.run_state, terminal_state = $5::text, failure_class = $3, failure_message = $4, completed_at = $6
                where run_id = $1 and lease_fencing_token = $2
                  and state in ('claimed','executing') and lease_expires_at > now()
                returning *`
      } else {
        params.push(input.runState, input.issueUpdatedAt)
        sql = `update lsites_ledger.runs
                  set state = $3::lsites_ledger.run_state, terminal_state = $3::text, completed_at = $4
                where run_id = $1 and lease_fencing_token = $2
                  and state in ('claimed','executing','cancel_requested') and lease_expires_at > now()
                returning *`
      }
      const runResult = await this.db.query(sql, params)
      if (!runResult.rows[0]) {
        await this.db.query('rollback')
        return null
      }
      const run = toRun(runResult.rows[0])
      const issueResult = await this.db.query(
        `update lsites_ledger.issues set state = $2, retry_at = $3, updated_at = $4 where issue_id = $1 returning issue_id`,
        [run.issueId, input.issueState, input.retryAt, input.issueUpdatedAt],
      )
      if (!issueResult.rows[0]) throw new Error(`Issue ${run.issueId} not found for terminal Run ${run.runId}`)
      if (input.idempotency) await this.writeIdempotency(input.idempotency)
      for (const event of input.events) await this.writeEvent(event)
      await this.db.query('commit')
      return run
    } catch (error) {
      await this.db.query('rollback')
      throw error
    }
  }

  async reclaimExpiredLeases(nowIso: string): Promise<Run[]> {
    const { rows } = await this.db.query(`update lsites_ledger.runs set state = 'queued', lease_fencing_token = coalesce(lease_fencing_token, 0) + 1, lease_executor_id = '', lease_expires_at = $1 where state in ('claimed','executing') and lease_expires_at < $1 returning *`, [nowIso])
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
        `insert into lsites_ledger.idempotency_records (idempotency_key, schema_version_major, schema_version_minor, issue_id, org_id, run_id, state, created_at)
         values ($1,$2,$3,$4,$5,$6,$7,$8)
         on conflict (idempotency_key) do update set
           issue_id = excluded.issue_id, run_id = excluded.run_id, state = excluded.state, created_at = excluded.created_at`,
        [
          record.idempotencyKey,
          record.schemaVersion.major,
          record.schemaVersion.minor,
          record.issueId,
          record.orgId,
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

  async getIdempotencyRecord(idempotencyKey: string): Promise<IdempotencyRecord | null> {
    const { rows } = await this.db.query('select * from lsites_ledger.idempotency_records where idempotency_key = $1', [
      idempotencyKey,
    ])
    return rows[0] ? toIdempotency(rows[0]) : null
  }

  async updateIdempotencyRecord(record: IdempotencyRecord): Promise<void> {
    await this.db.query(
      `insert into lsites_ledger.idempotency_records (idempotency_key, schema_version_major, schema_version_minor, issue_id, org_id, run_id, state, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       on conflict (idempotency_key) do update set
         issue_id = excluded.issue_id, run_id = excluded.run_id, state = excluded.state`,
      [
        record.idempotencyKey,
        record.schemaVersion.major,
        record.schemaVersion.minor,
        record.issueId,
        record.orgId,
        record.runId,
        record.state,
        record.createdAt,
      ],
    )
  }

  async putGateResult(gate: GateResult): Promise<void> {
    await this.db.query(GATE_INSERT_SQL, gateParams(gate))
  }

  async recordIssueGateDecision(input: {
    gate: GateResult
    issueState: Issue['state']
    issueUpdatedAt: string
    idempotency: IdempotencyRecord | null
    events: LedgerEvent[]
  }): Promise<void> {
    await this.db.query('begin')
    try {
      await this.db.query(GATE_INSERT_SQL, gateParams(input.gate))
      const issueResult = await this.db.query(
        `update lsites_ledger.issues set state = $2, updated_at = $3 where issue_id = $1 and state = 'awaiting_gate' returning issue_id`,
        [input.gate.subjectId, input.issueState, input.issueUpdatedAt],
      )
      if (!issueResult.rows[0]) throw new Error(`Issue ${input.gate.subjectId} is no longer awaiting a Gate decision`)
      if (input.idempotency) await this.writeIdempotency(input.idempotency)
      for (const event of input.events) await this.writeEvent(event)
      await this.db.query('commit')
    } catch (error) {
      await this.db.query('rollback')
      throw error
    }
  }

  async recordHierarchyGateDecision(input: {
    subject: HierarchySubjectRef
    gate: GateResult
    subjectState: WorkState
    expectedRevision: number
    subjectUpdatedAt: string
    events: LedgerEvent[]
  }): Promise<void> {
    await this.db.query('begin')
    try {
      await this.db.query(GATE_INSERT_SQL, gateParams(input.gate))
      let result: { rows: Record<string, unknown>[] }
      if (input.subject.subjectType === 'program') {
        result = await this.db.query(`update lsites_ledger.programs set state = $1, revision = revision + 1, updated_at = $2 where program_id = $3 and org_id = $4 and revision = $5 returning program_id`, [input.subjectState, input.subjectUpdatedAt, input.subject.programId, input.subject.orgId, input.expectedRevision])
      } else if (input.subject.subjectType === 'module') {
        result = await this.db.query(`update lsites_ledger.modules set state = $1, revision = revision + 1, updated_at = $2 where program_id = $3 and module_id = $4 and org_id = $5 and revision = $6 returning module_id`, [input.subjectState, input.subjectUpdatedAt, input.subject.programId, input.subject.moduleId, input.subject.orgId, input.expectedRevision])
      } else {
        result = await this.db.query(`update lsites_ledger.phases set state = $1, revision = revision + 1, updated_at = $2 where program_id = $3 and module_id = $4 and phase_id = $5 and org_id = $6 and revision = $7 returning phase_id`, [input.subjectState, input.subjectUpdatedAt, input.subject.programId, input.subject.moduleId, input.subject.phaseId, input.subject.orgId, input.expectedRevision])
      }
      if (!result.rows[0]) throw new Error(`${input.subject.subjectType} ${input.subject.subjectId} is no longer present in its tenant-scoped hierarchy`)
      for (const event of input.events) await this.writeEvent(event)
      await this.db.query('commit')
    } catch (error) {
      await this.db.query('rollback')
      throw error
    }
  }

  private async writeIdempotency(record: IdempotencyRecord): Promise<void> {
    await this.db.query(
      `insert into lsites_ledger.idempotency_records (idempotency_key, schema_version_major, schema_version_minor, issue_id, org_id, run_id, state, created_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8)
       on conflict (idempotency_key) do update set issue_id = excluded.issue_id, org_id = excluded.org_id, run_id = excluded.run_id, state = excluded.state`,
      [record.idempotencyKey, record.schemaVersion.major, record.schemaVersion.minor, record.issueId, record.orgId, record.runId, record.state, record.createdAt],
    )
  }

  private async writeEvent(event: LedgerEvent): Promise<void> {
    await this.db.query(
      `insert into lsites_ledger.ledger_events (event_id, schema_version_major, schema_version_minor, issue_id, org_id, run_id, event_type, payload, occurred_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [event.eventId, event.schemaVersion.major, event.schemaVersion.minor, event.issueId, event.orgId, event.runId, event.type, JSON.stringify(event.payload), event.occurredAt],
    )
  }

  async getGateResult(gateId: string, orgId: string): Promise<GateResult | null> {
    return queryOneOrNull(this.db, 'select * from lsites_ledger.gate_results where gate_id = $1 and org_id = $2', [gateId, orgId], toGate)
  }

  async getCurrentGate(subject: HierarchySubjectRef): Promise<GateResult | null> {
    return queryOneOrNull(this.db, `select * from lsites_ledger.gate_results where subject_type = $1 and subject_id = $2 and org_id = $3 and subject_program_id = $4 and subject_module_id is not distinct from $5 and subject_phase_id is not distinct from $6 order by decided_at desc nulls last, gate_id desc limit 1`, [subject.subjectType, subject.subjectId, subject.orgId, subject.programId, subject.moduleId ?? null, subject.phaseId ?? null], toGate)
  }

  async listGateResults(subject: HierarchySubjectRef): Promise<GateResult[]> {
    const { rows } = await this.db.query('select * from lsites_ledger.gate_results where subject_type = $1 and subject_id = $2 and org_id = $3 and subject_program_id = $4 and subject_module_id is not distinct from $5 and subject_phase_id is not distinct from $6 order by decided_at asc nulls first, gate_id asc', [subject.subjectType, subject.subjectId, subject.orgId, subject.programId, subject.moduleId ?? null, subject.phaseId ?? null])
    return rows.map(toGate)
  }

  async appendEvent(event: LedgerEvent): Promise<void> {
    await this.db.query(
      `insert into lsites_ledger.ledger_events (event_id, schema_version_major, schema_version_minor, issue_id, org_id, run_id, event_type, payload, occurred_at)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [
        event.eventId,
        event.schemaVersion.major,
        event.schemaVersion.minor,
        event.issueId,
        event.orgId,
        event.runId,
        event.type,
        JSON.stringify(event.payload),
        event.occurredAt,
      ],
    )
  }

  async listEvents(issueId: string, orgId: string): Promise<LedgerEvent[]> {
    const { rows } = await this.db.query(
      'select * from lsites_ledger.ledger_events where issue_id = $1 and org_id = $2 order by occurred_at asc',
      [issueId, orgId],
    )
    return rows.map(toEvent)
  }

  async addIssueDependency(dep: IssueDependency): Promise<void> {
    await this.db.query(
        `insert into lsites_ledger.issue_dependencies (issue_id, depends_on_issue_id, org_id, created_at)
       values ($1, $2, $3, $4)
       on conflict (issue_id, depends_on_issue_id) do nothing`,
      [dep.issueId, dep.dependsOnIssueId, dep.orgId, dep.createdAt],
    )
  }

  async getIssueDependencies(issueId: string): Promise<IssueDependency[]> {
    try {
      const { rows } = await this.db.query(
        'select issue_id, depends_on_issue_id, org_id, created_at from lsites_ledger.issue_dependencies where issue_id = $1',
        [issueId],
      )
      return rows.map((row) => ({
        issueId: String(row.issue_id),
        dependsOnIssueId: String(row.depends_on_issue_id),
        orgId: String(row.org_id ?? DEFAULT_ORG_ID),
        createdAt: new Date(row.created_at as string).toISOString(),
      }))
    } catch (error) {
      if (isInvalidInputSyntaxError(error)) return []
      throw error
    }
  }

  async getUnresolvedDependencies(issueId: string, orgId?: string): Promise<UnresolvedDependency[]> {
    try {
      const { rows } = await this.db.query(
        `select d.issue_id, d.depends_on_issue_id, d.org_id, d.created_at, i.state, i.org_id as target_org_id,
                case when i.issue_id is null then 'missing'
                     when $2::uuid is not null and owner.org_id is distinct from $2 then 'wrong_org'
                     when i.org_id is distinct from owner.org_id then 'wrong_org'
                     when i.state = 'repair_required' then 'rejected_gate'
                     else 'not_completed' end as reason
           from lsites_ledger.issue_dependencies d
           join lsites_ledger.issues owner on owner.issue_id = d.issue_id
           left join lsites_ledger.issues i on i.issue_id = d.depends_on_issue_id
          where d.issue_id = $1 and (i.issue_id is null or i.state <> 'completed' or i.org_id is distinct from owner.org_id or ($2::uuid is not null and owner.org_id is distinct from $2))`,
        [issueId, orgId ?? DEFAULT_ORG_ID],
      )
      return rows.map((row) => ({ dependency: { issueId: String(row.issue_id), dependsOnIssueId: String(row.depends_on_issue_id), orgId: String(row.org_id ?? DEFAULT_ORG_ID), createdAt: new Date(row.created_at as string).toISOString() }, state: (row.state as Issue['state'] | null) ?? null, reason: row.reason as 'missing' | 'not_completed' | 'rejected_gate' | 'wrong_org' }))
    } catch (error) {
      if (isInvalidInputSyntaxError(error)) return []
      throw error
    }
  }

  async exportSnapshot(orgId: string): Promise<LedgerSnapshot> {
    const programs = await this.listPrograms(orgId)
    const modules = (await Promise.all(programs.map((program) => this.listModules(program.programId, orgId)))).flat()
    const phases = (await Promise.all(modules.map((module) => this.listPhases(module.programId, module.moduleId, orgId)))).flat()
    const issues = await this.listIssues({ orgId })
    const runs = (await Promise.all(issues.map((issue) => this.listRunsForIssue(issue.issueId)))).flat()
    const idempotencyRows = await this.db.query('select * from lsites_ledger.idempotency_records where org_id = $1 order by idempotency_key', [orgId])
    const gateRows = await this.db.query('select * from lsites_ledger.gate_results where org_id = $1 order by decided_at nulls first, gate_id', [orgId])
    const eventRows = await this.db.query('select * from lsites_ledger.ledger_events where org_id = $1 order by occurred_at, event_id', [orgId])
    const idempotency = idempotencyRows.rows.map(toIdempotency)
    const gates = gateRows.rows.map(toGate)
    const events = eventRows.rows.map(toEvent)
    const dependencies = (await Promise.all(issues.map((issue) => this.getIssueDependencies(issue.issueId)))).flat()
    return { schemaVersion: { major: 1, minor: 0 }, programs, modules, phases, issues, runs, idempotency, gates, events, dependencies }
  }
}

import { randomUUID } from 'node:crypto'
import { createHash } from 'node:crypto'
import type { LedgerStore } from './store.js'
import {
  SCHEMA_VERSION,
  deriveIdempotencyKey,
  type FailureClass,
  type GateDecision,
  type GateResult,
  type Issue,
  type LedgerEvent,
  type LedgerEventType,
  type Run,
  type SideEffectClass,
} from './types.js'

export class LedgerError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'not_found'
      | 'invalid_state'
      | 'stale_fencing_token'
      | 'lease_expired'
      | 'not_delegated',
  ) {
    super(message)
    this.name = 'LedgerError'
  }
}

export interface CreateIssueInput {
  issueType: string
  programRef: string
  moduleRef?: string
  stageRef?: string
  input: Record<string, unknown>
  sideEffectClass?: SideEffectClass
  maxAttempts?: number
  backoffBaseMs?: number
  backoffMaxMs?: number
  timeoutMs?: number
}

function nowIso(): string {
  return new Date().toISOString()
}

function digestInput(input: Record<string, unknown>): string {
  return createHash('sha256').update(JSON.stringify(input)).digest('hex')
}

/**
 * Program Ledger core (Phase 2 foundation). See types.ts for scope notes
 * and manual §20 references. This class is storage-agnostic (takes a
 * `LedgerStore`) so the same logic runs against the in-memory store in
 * tests and the Postgres-backed store in production.
 */
export class ProgramLedger {
  constructor(private readonly store: LedgerStore) {}

  private async emit(
    issueId: string,
    runId: string | null,
    type: LedgerEventType,
    payload: Record<string, unknown> = {},
  ): Promise<void> {
    const event: LedgerEvent = {
      schemaVersion: SCHEMA_VERSION,
      eventId: randomUUID(),
      issueId,
      runId,
      type,
      payload,
      occurredAt: nowIso(),
    }
    await this.store.appendEvent(event)
  }

  async createIssue(input: CreateIssueInput): Promise<Issue> {
    const inputDigest = digestInput(input.input)
    const issue: Issue = {
      schemaVersion: SCHEMA_VERSION,
      issueId: randomUUID(),
      issueType: input.issueType,
      programRef: input.programRef,
      moduleRef: input.moduleRef,
      stageRef: input.stageRef,
      state: 'ready',
      input: input.input,
      inputDigest,
      sideEffectClass: input.sideEffectClass ?? 'none',
      retryPolicy: {
        maxAttempts: input.maxAttempts ?? 3,
        backoffBaseMs: input.backoffBaseMs ?? 1000,
        backoffMaxMs: input.backoffMaxMs ?? 30_000,
      },
      timeoutMs: input.timeoutMs ?? 60_000,
      attemptCount: 0,
      createdAt: nowIso(),
      updatedAt: nowIso(),
      cancelRequested: false,
    }
    await this.store.putIssue(issue)
    await this.emit(issue.issueId, null, 'issue.created', { issueType: issue.issueType })
    return issue
  }

  /**
   * Dispatches a Run for an Issue. Idempotent: dispatching the same
   * Issue (same intent -> same idempotency key) more than once returns
   * the SAME Run rather than creating a duplicate (manual §20 §57-63,
   * §98.4's "duplicate dispatch" exit-gate scenario).
   */
  async dispatch(issueId: string): Promise<Run> {
    const issue = await this.store.getIssue(issueId)
    if (!issue) throw new LedgerError(`Issue ${issueId} not found`, 'not_found')

    const idempotencyKey = deriveIdempotencyKey(issue)

    // Check idempotency BEFORE validating Issue state: a duplicate dispatch
    // call (e.g. a redelivered message, manual §20 §23's at-least-once
    // assumption) can legitimately arrive after the Issue has already
    // moved past `ready` -- the duplicate check, not the state machine,
    // is what must decide whether this creates a new Run.
    const existingRecord = await this.store.getIdempotencyRecord(idempotencyKey)
    if (existingRecord && existingRecord.state !== 'failed_safe_to_retry') {
      if (existingRecord.runId) {
        const existingRun = await this.store.getRun(existingRecord.runId)
        if (existingRun) return existingRun
      }
      throw new LedgerError(
        `Duplicate dispatch for idempotency key ${idempotencyKey}, but no Run is resolvable yet`,
        'invalid_state',
      )
    }

    if (!['ready', 'retry_scheduled'].includes(issue.state)) {
      throw new LedgerError(`Issue ${issueId} is not dispatchable from state ${issue.state}`, 'invalid_state')
    }

    const attemptNumber = issue.attemptCount + 1
    const runId = randomUUID()

    // Reserve the idempotency key BEFORE the Run row exists (runId: null),
    // and only link it to the Run afterward. This ordering matters for a
    // real foreign-key-enforcing store (Postgres): inserting an
    // idempotency_records row that already points at a run_id which
    // doesn't exist yet violates its FK constraint. The in-memory store
    // doesn't enforce FKs, so this bug was invisible until this class was
    // tested against real Postgres (via pglite) -- see
    // tests/postgres-store.spec.ts.
    const { record, created } = await this.store.reserveIdempotencyKey({
      schemaVersion: SCHEMA_VERSION,
      idempotencyKey,
      issueId,
      runId: null,
      state: 'reserved',
      createdAt: nowIso(),
    })

    if (!created) {
      // Lost a race with a concurrent dispatch call between the check
      // above and this reservation -- same duplicate handling applies.
      if (record.runId) {
        const existingRun = await this.store.getRun(record.runId)
        if (existingRun) return existingRun
      }
      throw new LedgerError(
        `Duplicate dispatch for idempotency key ${idempotencyKey}, but no Run is resolvable yet`,
        'invalid_state',
      )
    }

    const run: Run = {
      schemaVersion: SCHEMA_VERSION,
      runId,
      issueId,
      attemptNumber,
      state: 'queued',
      inputSnapshot: { ...issue.input },
      lease: null,
      output: null,
      failure: null,
      createdAt: nowIso(),
      claimedAt: null,
      lastHeartbeatAt: null,
      completedAt: null,
    }
    await this.store.putRun(run)

    issue.state = 'dispatched'
    issue.attemptCount = attemptNumber
    issue.updatedAt = nowIso()
    await this.store.putIssue(issue)

    await this.store.updateIdempotencyRecord({ ...record, runId, state: 'executing' })
    await this.emit(issueId, runId, 'run.dispatched', { attemptNumber })
    return run
  }

  /**
   * Claims a queued Run for execution, issuing a lease with a fencing
   * token. Concurrent claim attempts for the same Run are safe: only one
   * succeeds (manual §20 §24-25).
   */
  async claim(runId: string, executorId: string, leaseDurationMs = 30_000): Promise<Run> {
    const run = await this.store.getRun(runId)
    if (!run) throw new LedgerError(`Run ${runId} not found`, 'not_found')
    if (run.state !== 'queued') {
      throw new LedgerError(`Run ${runId} is not claimable from state ${run.state}`, 'invalid_state')
    }

    const nextFencingToken = (run.lease?.fencingToken ?? 0) + 1
    run.state = 'claimed'
    run.lease = {
      leaseId: randomUUID(),
      fencingToken: nextFencingToken,
      executorId,
      expiresAt: new Date(Date.now() + leaseDurationMs).toISOString(),
    }
    run.claimedAt = nowIso()
    run.lastHeartbeatAt = nowIso()
    await this.store.putRun(run)

    const issue = await this.store.getIssue(run.issueId)
    if (issue) {
      issue.state = 'running'
      issue.updatedAt = nowIso()
      await this.store.putIssue(issue)
    }

    await this.emit(run.issueId, runId, 'run.claimed', { executorId, fencingToken: nextFencingToken })
    return run
  }

  /** Extends a lease. Rejects a stale fencing token (the executor was reclaimed from). */
  async heartbeat(runId: string, fencingToken: number, leaseDurationMs = 30_000): Promise<Run> {
    const run = await this.store.getRun(runId)
    if (!run) throw new LedgerError(`Run ${runId} not found`, 'not_found')
    this.assertFencingToken(run, fencingToken)

    run.lease = { ...run.lease!, expiresAt: new Date(Date.now() + leaseDurationMs).toISOString() }
    run.lastHeartbeatAt = nowIso()
    await this.store.putRun(run)
    await this.emit(run.issueId, runId, 'run.heartbeat', { fencingToken })
    return run
  }

  private assertFencingToken(run: Run, fencingToken: number): void {
    if (!run.lease) throw new LedgerError(`Run ${run.runId} has no active lease`, 'lease_expired')
    if (run.lease.fencingToken !== fencingToken) {
      throw new LedgerError(
        `Stale fencing token for Run ${run.runId}: supplied ${fencingToken}, current is ${run.lease.fencingToken}`,
        'stale_fencing_token',
      )
    }
  }

  /**
   * Reclaims Runs whose lease has expired (the crashed-worker scenario,
   * manual §20 §98.4: "a synthetic workflow survives ... worker crash").
   * Returns the Run to `queued` so it can be claimed again.
   *
   * BUG FIX (found on review, 2026-07-14): this previously left the old
   * lease's fencing token unchanged until the NEXT successful `claim()`
   * bumped it. That left a real window -- between reclaim and the next
   * claim -- during which the crashed worker's stale-but-still-current
   * token would pass `assertFencingToken` and let it successfully call
   * `heartbeat()`/`complete()`/`fail()`, corrupting a Run that had
   * already been given up on. Confirmed reproducible with a targeted
   * test before this fix. Fixed by bumping the fencing token
   * IMMEDIATELY on reclaim (not waiting for the next claim), so the
   * crashed worker's token becomes permanently stale the instant it is
   * reclaimed from, with no gap.
   */
  async reclaimExpiredLeases(): Promise<Run[]> {
    const expired = await this.store.listExpiredLeaseRuns(nowIso())
    const reclaimed: Run[] = []
    for (const run of expired) {
      const previousFencingToken = run.lease?.fencingToken ?? 0
      run.state = 'queued'
      run.lease = {
        leaseId: run.lease?.leaseId ?? randomUUID(),
        fencingToken: previousFencingToken + 1,
        executorId: '',
        expiresAt: nowIso(),
      }
      await this.store.putRun(run)
      await this.emit(run.issueId, run.runId, 'run.reclaimed', { previousFencingToken })
      reclaimed.push(run)
    }
    return reclaimed
  }

  /** Marks a Run's outcome as succeeded. This does NOT complete the Issue -- Gate acceptance does (manual §20 §32, §98.3). */
  async complete(runId: string, fencingToken: number, output: unknown): Promise<Run> {
    const run = await this.store.getRun(runId)
    if (!run) throw new LedgerError(`Run ${runId} not found`, 'not_found')
    this.assertFencingToken(run, fencingToken)

    run.state = 'succeeded'
    run.output = output
    run.completedAt = nowIso()
    await this.store.putRun(run)

    const issue = await this.store.getIssue(run.issueId)
    if (!issue) throw new LedgerError(`Issue ${run.issueId} not found for Run ${runId}`, 'not_found')

    issue.state = 'awaiting_gate'
    issue.updatedAt = nowIso()
    await this.store.putIssue(issue)

    await this.store.updateIdempotencyRecord({
      schemaVersion: SCHEMA_VERSION,
      idempotencyKey: deriveIdempotencyKey({
        issueType: issue.issueType,
        programRef: issue.programRef,
        inputDigest: issue.inputDigest,
      }),
      issueId: run.issueId,
      runId: run.runId,
      state: 'completed',
      createdAt: nowIso(),
    })

    await this.emit(run.issueId, runId, 'run.succeeded', {})
    return run
  }

  /**
   * Marks a Run as failed. Retryable failures schedule a new attempt
   * (bounded by retryPolicy.maxAttempts); terminal failures do not.
   */
  async fail(runId: string, fencingToken: number, failureClass: FailureClass, message: string): Promise<Run> {
    const run = await this.store.getRun(runId)
    if (!run) throw new LedgerError(`Run ${runId} not found`, 'not_found')
    this.assertFencingToken(run, fencingToken)

    const doNotRetry: FailureClass[] = ['invalid_input', 'code_defect', 'cancelled']
    const retryable = !doNotRetry.includes(failureClass)

    run.state = retryable ? 'failed_retryable' : 'failed_terminal'
    run.failure = { failureClass, message }
    run.completedAt = nowIso()
    await this.store.putRun(run)

    const issue = await this.store.getIssue(run.issueId)
    if (issue) {
      issue.updatedAt = nowIso()
      if (retryable && issue.attemptCount < issue.retryPolicy.maxAttempts) {
        issue.state = 'retry_scheduled'
        await this.store.putIssue(issue)
        await this.store.updateIdempotencyRecord({
          schemaVersion: SCHEMA_VERSION,
          idempotencyKey: deriveIdempotencyKey({
            issueType: issue.issueType,
            programRef: issue.programRef,
            inputDigest: issue.inputDigest,
          }),
          issueId: issue.issueId,
          runId: null,
          state: 'failed_safe_to_retry',
          createdAt: nowIso(),
        })
        await this.emit(issue.issueId, runId, 'issue.retry_scheduled', { failureClass })
      } else {
        issue.state = retryable ? 'exception' : 'failed'
        await this.store.putIssue(issue)
      }
    }

    await this.emit(run.issueId, runId, 'run.failed', { failureClass, message })
    return run
  }

  /**
   * Requests cancellation of an Issue. Cooperative (manual §20 §29): if a
   * Run is actively executing, it is marked `cancel_requested` for the
   * executor to observe at its next safe point; if nothing is running
   * yet, the Issue is cancelled immediately.
   */
  async cancelRequest(issueId: string): Promise<Issue> {
    const issue = await this.store.getIssue(issueId)
    if (!issue) throw new LedgerError(`Issue ${issueId} not found`, 'not_found')

    issue.cancelRequested = true
    const runs = await this.store.listRunsForIssue(issueId)
    const activeRun = runs.find((r) => r.state === 'claimed' || r.state === 'executing')

    if (activeRun) {
      activeRun.state = 'cancel_requested'
      await this.store.putRun(activeRun)
      await this.emit(issueId, activeRun.runId, 'run.cancel_requested', {})
    } else {
      issue.state = 'cancelled'
    }
    issue.updatedAt = nowIso()
    await this.store.putIssue(issue)
    return issue
  }

  /** Executor observes cancellation and confirms it (completes the cooperative sequence). */
  async confirmCancelled(runId: string, fencingToken: number): Promise<Run> {
    const run = await this.store.getRun(runId)
    if (!run) throw new LedgerError(`Run ${runId} not found`, 'not_found')
    this.assertFencingToken(run, fencingToken)

    run.state = 'cancelled'
    run.completedAt = nowIso()
    await this.store.putRun(run)

    const issue = await this.store.getIssue(run.issueId)
    if (issue) {
      issue.state = 'cancelled'
      issue.updatedAt = nowIso()
      await this.store.putIssue(issue)
    }

    await this.emit(run.issueId, runId, 'run.cancelled', {})
    return run
  }

  /**
   * Records a Gate decision. Per manual §20 §32: an executor cannot
   * self-declare Gate acceptance -- this is a distinct authority from
   * completing a Run. Only an `accepted` Gate decision completes the
   * Issue; `rejected` returns it to `repair_required`.
   */
  async decideGate(
    issueId: string,
    runId: string,
    decision: GateDecision,
    evidence: Record<string, unknown>,
    decidedBy: string,
  ): Promise<GateResult> {
    const issue = await this.store.getIssue(issueId)
    if (!issue) throw new LedgerError(`Issue ${issueId} not found`, 'not_found')
    if (issue.state !== 'awaiting_gate') {
      throw new LedgerError(`Issue ${issueId} is not awaiting a Gate decision (state ${issue.state})`, 'invalid_state')
    }

    const gate: GateResult = {
      schemaVersion: SCHEMA_VERSION,
      gateId: randomUUID(),
      issueId,
      runId,
      decision,
      evidence,
      decidedBy,
      decidedAt: nowIso(),
    }
    await this.store.putGateResult(gate)

    issue.state = decision === 'accepted' ? 'completed' : 'repair_required'
    issue.updatedAt = nowIso()
    await this.store.putIssue(issue)

    if (decision === 'rejected') {
      // A rejected Gate makes the underlying dispatch intent retry-eligible
      // again, even though the Run itself technically "succeeded" --
      // Gate acceptance, not Run success, is what finalizes an attempt
      // (manual §20 §32, §98.3).
      const idempotencyKey = deriveIdempotencyKey(issue)
      const existing = await this.store.getIdempotencyRecord(idempotencyKey)
      if (existing) {
        await this.store.updateIdempotencyRecord({ ...existing, state: 'failed_safe_to_retry', runId: null })
      }
    }

    await this.emit(issueId, runId, 'gate.decided', { decision, gateId: gate.gateId })
    if (decision === 'accepted') {
      await this.emit(issueId, runId, 'issue.completed', {})
    } else {
      await this.emit(issueId, runId, 'issue.repair_required', {})
    }
    return gate
  }

  /**
   * Retries (replays) an Issue that is in `retry_scheduled` or
   * `repair_required`. This ALWAYS produces a new Run with a new runId
   * and incremented attemptNumber -- it never mutates or resurrects a
   * prior Run's history (manual §20 §3.3, §98.2: "every attempt is a
   * unique, immutable Run; history is never collapsed").
   */
  async retryIssue(issueId: string): Promise<Run> {
    const issue = await this.store.getIssue(issueId)
    if (!issue) throw new LedgerError(`Issue ${issueId} not found`, 'not_found')
    if (!['retry_scheduled', 'repair_required'].includes(issue.state)) {
      throw new LedgerError(`Issue ${issueId} is not retryable from state ${issue.state}`, 'invalid_state')
    }
    // BUG FIX (found on review, 2026-07-14): `fail()` checks
    // retryPolicy.maxAttempts before scheduling a retry, but a Gate
    // REJECTION (decideGate() -> `repair_required`) previously made the
    // Issue retry-eligible again unconditionally, with no maxAttempts
    // check anywhere in the retryIssue()/dispatch() path. That let a
    // repeatedly-rejected Issue retry forever, bypassing the bounded-
    // retry policy the manual requires (§20's retry policy doctrine).
    // Enforced here, uniformly, regardless of which path triggered the
    // retry-eligible state.
    if (issue.attemptCount >= issue.retryPolicy.maxAttempts) {
      issue.state = 'exception'
      issue.updatedAt = nowIso()
      await this.store.putIssue(issue)
      await this.emit(issueId, null, 'issue.retry_budget_exhausted', {})
      throw new LedgerError(
        `Issue ${issueId} has exhausted its retry budget (${issue.attemptCount}/${issue.retryPolicy.maxAttempts} attempts)`,
        'invalid_state',
      )
    }
    issue.state = 'ready'
    await this.store.putIssue(issue)
    return this.dispatch(issueId)
  }
}

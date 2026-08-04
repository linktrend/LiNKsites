import { randomUUID } from 'node:crypto'
import { createHash } from 'node:crypto'
import type { CapabilityGrantLookup } from './capability-lookup.js'
import type { LedgerStore } from './store.js'
import type { HierarchyRegistry } from './hierarchy.js'
import { assertDispatchCapabilityGrant, CapabilityGateError } from './capability-gate.js'
import {
  SCHEMA_VERSION,
  deriveIdempotencyKey,
  type FailureClass,
  type GateDecision,
  type GateResult,
  type GateSubjectType,
  type EvidenceReceipt,
  type Issue,
  type IssueDependency,
  type LedgerEvent,
  type LedgerEventType,
  type Module,
  type Phase,
  type Program,
  type ProgramCompletion,
  type Run,
  type SideEffectClass,
  type WorkState,
} from './types.js'
import { LINKSITES_PROGRAM, type ProgramDefinition } from './hierarchy.js'

export class LedgerError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'not_found'
      | 'invalid_state'
      | 'stale_fencing_token'
      | 'lease_expired'
      | 'not_delegated'
      | 'dependency_not_satisfied'
      | 'capability_required'
      | 'capability_grant_denied'
      | 'org_required',
  ) {
    super(message)
    this.name = 'LedgerError'
  }
}

export interface CreateIssueInput {
  issueType: string
  programRef: string
  moduleRef?: string
  phaseRef?: string
  issueKey?: string
  correlationId?: string
  input: Record<string, unknown>
  sideEffectClass?: SideEffectClass
  /** platform.organizations id — required with requiredCapabilityId / external side effects. */
  orgId?: string
  /** platform.capabilities id — gated via platform.has_capability_grant at dispatch. */
  requiredCapabilityId?: string
  maxAttempts?: number
  backoffBaseMs?: number
  backoffMaxMs?: number
  timeoutMs?: number
  /**
   * Zero or more Issue IDs that this Issue depends on. The Issue cannot
   * be dispatched until ALL listed dependencies have reached `completed`
   * state (i.e. their Gate was accepted). An empty or omitted list means
   * no dependencies — the Issue is immediately dispatchable once created.
   */
  dependsOn?: string[]
}

export interface ClaimOptions {
  executorType?: string
  executorVersion?: string
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
  /**
   * `hierarchy` is optional and opt-in (Issue phase2-program-hierarchy-001):
   * when provided, `createIssue()` validates `programRef`/`moduleRef`/
   * `phaseRef` against a real, known Program/Module/Phase registry
   * (see hierarchy.ts) instead of accepting any opaque string. Omitting
   * it preserves the original behavior for callers/tests that don't yet
   * need hierarchy validation.
   *
   * `capabilityGrants` is optional but required at dispatch time whenever an
   * Issue declares `requiredCapabilityId` or an external side-effect class
   * (LiNKplatform shared-foundation-spec §5).
   */
  constructor(
    private readonly store: LedgerStore,
    private readonly hierarchy?: HierarchyRegistry,
    private readonly capabilityGrants?: CapabilityGrantLookup,
  ) {}

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

  /** Public read access to an Issue's current state -- used by executor drivers (executor.ts) and callers that need to inspect state without mutating it. */
  async getIssue(issueId: string): Promise<Issue | null> {
    return this.store.getIssue(issueId)
  }

  /** Public read access to a Run's current state, mirroring getIssue(). */
  async getRun(runId: string): Promise<Run | null> {
    return this.store.getRun(runId)
  }

  async createIssue(input: CreateIssueInput): Promise<Issue> {
    if (this.hierarchy) {
      this.hierarchy.assertValidRefs(input.programRef, input.moduleRef, input.phaseRef)
    }
    const inputDigest = digestInput(input.input)
    const issue: Issue = {
      schemaVersion: SCHEMA_VERSION,
      issueId: randomUUID(),
      issueType: input.issueType,
      programRef: input.programRef,
      moduleRef: input.moduleRef,
      phaseRef: input.phaseRef,
      issueKey: input.issueKey,
      correlationId: input.correlationId ?? null,
      state: 'ready',
      input: input.input,
      inputDigest,
      sideEffectClass: input.sideEffectClass ?? 'none',
      requiredCapabilityId: input.requiredCapabilityId ?? null,
      orgId: input.orgId ?? null,
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
      retryAt: null,
    }
    await this.store.putIssue(issue)

    for (const dependsOnIssueId of input.dependsOn ?? []) {
      const dep: IssueDependency = {
        issueId: issue.issueId,
        dependsOnIssueId,
        createdAt: nowIso(),
      }
      await this.store.addIssueDependency(dep)
    }

    await this.emit(issue.issueId, null, 'issue.created', { issueType: issue.issueType })
    return issue
  }

  /**
   * Throws `LedgerError('dependency_not_satisfied')` if any declared
   * dependency of `issueId` has not yet reached `completed` state.
   * "Completed" is the authoritative ledger state set exclusively by an
   * accepted Gate decision (ProgramLedger.decideGate), so this check is
   * equivalent to "all dependency Gates have been accepted". If a
   * dependency Issue does not exist at all, that is also treated as not
   * satisfied — a dependency on a non-existent Issue cannot be complete.
   */
  private async assertDependenciesSatisfied(issue: Issue): Promise<void> {
    const deps = await this.store.getIssueDependencies(issue.issueId)
    for (const dep of deps) {
      const depIssue = await this.store.getIssue(dep.dependsOnIssueId)
      if (!depIssue || depIssue.state !== 'completed') {
        const reason = !depIssue
          ? `dependency Issue ${dep.dependsOnIssueId} does not exist`
          : `dependency Issue ${dep.dependsOnIssueId} is in state "${depIssue.state}", not "completed"`
        throw new LedgerError(
          `Issue ${issue.issueId} cannot be dispatched: ${reason}. All dependencies must have an accepted Gate before dispatch.`,
          'dependency_not_satisfied',
        )
      }
      if (depIssue.orgId !== issue.orgId) {
        throw new LedgerError(
          `Issue ${issue.issueId} cannot be dispatched: dependency ${dep.dependsOnIssueId} belongs to a different organization.`,
          'dependency_not_satisfied',
        )
      }
    }
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

    // Dependency gate: every declared dependency must have reached `completed`
    // state (the only state the Program Ledger sets via an accepted Gate) before
    // this Issue may be dispatched. This check runs AFTER the state guard so
    // that a non-ready Issue still fails on the state check first. It runs
    // BEFORE Run creation and idempotency reservation so that a blocked Issue
    // never produces a Run record, idempotency reservation, or event.
    await this.assertDependenciesSatisfied(issue)

    // Capability-grant gate (LiNKplatform §5): external side effects and any
    // explicit requiredCapabilityId must pass platform.has_capability_grant
    // before a Run is created.
    try {
      await assertDispatchCapabilityGrant(this.capabilityGrants, {
        sideEffectClass: issue.sideEffectClass,
        requiredCapabilityId: issue.requiredCapabilityId,
        orgId: issue.orgId,
      })
    } catch (err) {
      if (err instanceof CapabilityGateError) {
        throw new LedgerError(err.message, err.code)
      }
      throw err
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
      executorType: null,
      executorVersion: null,
      correlationId: issue.correlationId ?? null,
      idempotencyKey,
      output: null,
      failure: null,
      createdAt: nowIso(),
      claimedAt: null,
      startedAt: null,
      lastHeartbeatAt: null,
      completedAt: null,
      terminalState: null,
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
  async claim(runId: string, executorId: string, leaseDurationMs = 30_000, options: ClaimOptions = {}): Promise<Run> {
    const existing = await this.store.getRun(runId)
    if (!existing) throw new LedgerError(`Run ${runId} not found`, 'not_found')
    const run = await this.store.claimRun(
      runId,
      executorId,
      leaseDurationMs,
      options.executorType ?? 'executor',
      options.executorVersion ?? '1',
    )
    if (!run) throw new LedgerError(`Run ${runId} is not claimable from state ${existing.state}`, 'invalid_state')
    const nextFencingToken = run.lease!.fencingToken

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
    run.terminalState = 'succeeded'
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
        orgId: issue.orgId,
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
    run.terminalState = run.state
    run.failure = { failureClass, message }
    run.completedAt = nowIso()
    await this.store.putRun(run)

    const issue = await this.store.getIssue(run.issueId)
    if (issue) {
      issue.updatedAt = nowIso()
      if (retryable && issue.attemptCount < issue.retryPolicy.maxAttempts) {
        issue.state = 'retry_scheduled'
        issue.retryAt = new Date(Date.now() + issue.retryPolicy.backoffBaseMs).toISOString()
        await this.store.putIssue(issue)
        await this.store.updateIdempotencyRecord({
          schemaVersion: SCHEMA_VERSION,
          idempotencyKey: deriveIdempotencyKey({
            issueType: issue.issueType,
            programRef: issue.programRef,
            inputDigest: issue.inputDigest,
            orgId: issue.orgId,
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
    run.terminalState = 'cancelled'
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
    let gateEvidence = evidence
    if (decision === 'accepted' && Object.keys(evidence).length === 0) {
      const run = await this.store.getRun(runId)
      if (run?.output === null || run?.output === undefined) throw new LedgerError(`Issue ${issueId} cannot pass its Gate without evidence`, 'invalid_state')
      const outputChecksum = createHash('sha256').update(JSON.stringify(run.output)).digest('hex')
      gateEvidence = { derivedRunOutputReceipt: { runId, sha256: outputChecksum, source: 'durable_run_output' } }
    }
    if (decision === 'accepted' && this.receiptsFromEvidence(gateEvidence).length === 0) {
      throw new LedgerError(`Issue ${issueId} cannot pass its Gate without evidence receipts`, 'invalid_state')
    }

    const gate: GateResult = {
      schemaVersion: SCHEMA_VERSION,
      gateId: randomUUID(),
      subjectType: 'issue',
      subjectId: issueId,
      subjectRevision: issue.updatedAt,
      attempt: issue.attemptCount,
      evaluator: decidedBy,
      evaluatorVersion: '1',
      inputs: gateEvidence,
      reasons: decision === 'rejected' ? [typeof gateEvidence.reason === 'string' ? gateEvidence.reason : 'evidence rejected'] : [],
      evidenceReceipts: this.receiptsFromEvidence(gateEvidence),
      issueId,
      runId,
      decision,
      evidence: gateEvidence,
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

  private receiptsFromEvidence(evidence: Record<string, unknown>): EvidenceReceipt[] {
    if (Array.isArray(evidence.evidenceReceipts)) return evidence.evidenceReceipts as EvidenceReceipt[]
    const derived = evidence.derivedRunOutputReceipt
    if (typeof derived === 'object' && derived !== null && 'runId' in derived && 'sha256' in derived) {
      const receipt = derived as { runId: string; sha256: string }
      return [{ receiptId: `run-output:${receipt.runId}`, producer: 'program-ledger', subjectId: receipt.runId, checksum: receipt.sha256, revision: receipt.sha256, location: `ledger://runs/${receipt.runId}/output`, recordedAt: nowIso() }]
    }
    if (Object.keys(evidence).length > 0) {
      const checksum = createHash('sha256').update(JSON.stringify(evidence)).digest('hex')
      return [{ receiptId: `gate-evidence:${checksum}`, producer: 'program-ledger', subjectId: 'gate-input', checksum, revision: checksum, location: 'ledger://gate/evidence', recordedAt: nowIso() }]
    }
    return []
  }

  /** Persist the complete canonical hierarchy and its first private-demo Issues. */
  async seedProgramGraph(definition: ProgramDefinition = LINKSITES_PROGRAM, orgId: string | null = null): Promise<{ program: Program; modules: Module[]; phases: Phase[]; issues: Issue[] }> {
    const timestamp = nowIso()
    const program: Program = { schemaVersion: SCHEMA_VERSION, programId: definition.programId, orgId, title: definition.title, state: 'ready', revision: 1, createdAt: timestamp, updatedAt: timestamp }
    await this.store.putProgram(program)
    const modules: Module[] = []
    const phases: Phase[] = []
    const issues: Issue[] = []
    const issueIds = new Map<string, string>()
    for (const moduleDefinition of definition.modules) {
      const module: Module = { schemaVersion: SCHEMA_VERSION, moduleId: moduleDefinition.moduleId, programId: definition.programId, orgId, title: moduleDefinition.title, purpose: moduleDefinition.purpose, state: 'ready', revision: 1, createdAt: timestamp, updatedAt: timestamp }
      await this.store.putModule(module)
      modules.push(module)
      for (const phaseDefinition of moduleDefinition.phases) {
        const phase: Phase = { schemaVersion: SCHEMA_VERSION, phaseId: phaseDefinition.phaseId, moduleId: module.moduleId, programId: program.programId, orgId, title: phaseDefinition.title, objective: phaseDefinition.objective, state: 'ready', revision: 1, createdAt: timestamp, updatedAt: timestamp }
        await this.store.putPhase(phase)
        phases.push(phase)
        for (const issueDefinition of phaseDefinition.issues) {
          const existing = await this.store.getIssueByKey(issueDefinition.issueKey, orgId ?? undefined)
          const created = existing ?? await this.createIssue({ issueKey: issueDefinition.issueKey, issueType: issueDefinition.issueType, programRef: program.programId, moduleRef: module.moduleId, phaseRef: phase.phaseId, orgId: orgId ?? undefined, input: { title: issueDefinition.title, objective: issueDefinition.objective }, dependsOn: issueDefinition.dependsOnIssueKeys.map((key) => issueIds.get(key)).filter((id): id is string => id !== undefined) })
          issueIds.set(issueDefinition.issueKey, created.issueId)
          issues.push(created)
        }
      }
    }
    return { program, modules, phases, issues }
  }

  async getRunnableIssues(filter: { orgId?: string; programId?: string; moduleId?: string; phaseId?: string } = {}): Promise<Issue[]> {
    const candidates = await this.store.listIssues(filter)
    const runnable: Issue[] = []
    for (const issue of candidates) {
      if (!['ready', 'retry_scheduled'].includes(issue.state)) continue
      if ((await this.store.getUnresolvedDependencies(issue.issueId, filter.orgId)).length > 0) continue
      runnable.push(issue)
    }
    return runnable
  }

  async getUnresolvedDependencies(issueId: string, orgId?: string) {
    return this.store.getUnresolvedDependencies(issueId, orgId)
  }

  async getCurrentGate(subjectType: GateSubjectType, subjectId: string) {
    return this.store.getCurrentGate(subjectType, subjectId)
  }

  async listAttempts(issueId: string) {
    return this.store.listRunsForIssue(issueId)
  }

  async getTerminalFailures(filter: { orgId?: string; programId?: string } = {}) {
    const issues = await this.store.listIssues(filter)
    const failures: Run[] = []
    for (const issue of issues) {
      for (const run of await this.store.listRunsForIssue(issue.issueId)) {
        if (run.state === 'failed_terminal' || (run.state === 'failed_retryable' && issue.state === 'exception')) failures.push(run)
      }
    }
    return failures
  }

  async getProgramCompletion(programId: string, orgId?: string): Promise<ProgramCompletion> {
    const program = await this.store.getProgram(programId, orgId)
    if (!program) throw new LedgerError(`Program ${programId} not found`, 'not_found')
    const modules = await this.store.listModules(programId, orgId)
    const issues = await this.store.listIssues({ orgId, programId })
    const terminalFailures = (await this.getTerminalFailures({ orgId, programId })).length
    return { programId, state: program.state, totalModules: modules.length, completedModules: modules.filter((module) => module.state === 'completed').length, totalIssues: issues.length, completedIssues: issues.filter((issue) => issue.state === 'completed').length, terminalFailures }
  }

  async evaluateGate(input: { subjectType: GateSubjectType; subjectId: string; decision: GateDecision; evidence: Record<string, unknown>; evaluator: string; evaluatorVersion?: string; reasons?: string[]; subjectRevision?: string; issueId?: string; runId?: string }): Promise<GateResult> {
    const currentRevision = await this.currentSubjectRevision(input.subjectType, input.subjectId)
    if (currentRevision === null) throw new LedgerError(`${input.subjectType} ${input.subjectId} not found`, 'not_found')
    if (input.subjectType === 'issue' && (await this.store.getIssue(input.subjectId))?.state !== 'awaiting_gate') {
      throw new LedgerError(`Issue ${input.subjectId} is not awaiting a Gate decision`, 'invalid_state')
    }
    const receipts = this.receiptsFromEvidence(input.evidence)
    if (input.decision === 'accepted' && (Object.keys(input.evidence).length === 0 || receipts.length === 0)) throw new LedgerError(`${input.subjectType} ${input.subjectId} cannot pass its Gate without evidence`, 'invalid_state')
    if (input.decision === 'accepted' && !(await this.subjectChildrenComplete(input.subjectType, input.subjectId))) {
      throw new LedgerError(`${input.subjectType} ${input.subjectId} cannot pass its Gate before all required children complete`, 'invalid_state')
    }
    const prior = await this.store.getCurrentGate(input.subjectType, input.subjectId)
    const gate: GateResult = { schemaVersion: SCHEMA_VERSION, gateId: randomUUID(), subjectType: input.subjectType, subjectId: input.subjectId, subjectRevision: input.subjectRevision ?? currentRevision, attempt: (prior?.attempt ?? 0) + 1, evaluator: input.evaluator, evaluatorVersion: input.evaluatorVersion ?? '1', inputs: input.evidence, reasons: input.reasons ?? [], evidenceReceipts: receipts, issueId: input.issueId ?? (input.subjectType === 'issue' ? input.subjectId : null), runId: input.runId ?? null, decision: input.decision, evidence: input.evidence, decidedBy: input.evaluator, decidedAt: nowIso() }
    await this.store.putGateResult(gate)
    await this.applyHierarchyDecision(input.subjectType, input.subjectId, input.decision)
    if (input.subjectType === 'issue') {
      await this.emit(input.subjectId, input.runId ?? null, 'gate.decided', { decision: input.decision, gateId: gate.gateId })
      await this.emit(input.subjectId, input.runId ?? null, input.decision === 'accepted' ? 'issue.completed' : 'issue.repair_required', {})
    }
    return gate
  }

  private async currentSubjectRevision(subjectType: GateSubjectType, subjectId: string): Promise<string | null> {
    if (subjectType === 'issue') return (await this.store.getIssue(subjectId))?.updatedAt ?? null
    if (subjectType === 'phase') {
      const phase = await this.findPhase(subjectId)
      return phase ? `${phase.revision}:${phase.updatedAt}` : null
    }
    if (subjectType === 'module') {
      const module = await this.findModule(subjectId)
      return module ? `${module.revision}:${module.updatedAt}` : null
    }
    const program = await this.store.getProgram(subjectId)
    return program ? `${program.revision}:${program.updatedAt}` : null
  }

  private async subjectChildrenComplete(subjectType: GateSubjectType, subjectId: string): Promise<boolean> {
    if (subjectType === 'issue') {
      const issue = await this.store.getIssue(subjectId)
      return issue?.state === 'awaiting_gate'
    }
    if (subjectType === 'phase') {
      const phase = await this.findPhase(subjectId)
      if (!phase) return false
      const issues = await this.store.listIssues({ programId: phase.programId, moduleId: phase.moduleId, phaseId: phase.phaseId })
      return issues.length > 0 && issues.every((issue) => issue.state === 'completed')
    }
    if (subjectType === 'module') {
      const module = await this.findModule(subjectId)
      if (!module) return false
      const phases = await this.store.listPhases(module.programId, module.moduleId)
      return phases.length > 0 && phases.every((phase) => phase.state === 'completed')
    }
    const program = await this.store.getProgram(subjectId)
    if (!program) return false
    const modules = await this.store.listModules(program.programId)
    return modules.length > 0 && modules.every((module) => module.state === 'completed')
  }

  private async findPhase(phaseId: string): Promise<Phase | null> {
    for (const program of await this.store.listPrograms()) for (const module of await this.store.listModules(program.programId)) {
      const phase = await this.store.getPhase(program.programId, module.moduleId, phaseId)
      if (phase) return phase
    }
    return null
  }

  private async findModule(moduleId: string): Promise<Module | null> {
    for (const program of await this.store.listPrograms()) {
      const module = await this.store.getModule(program.programId, moduleId)
      if (module) return module
    }
    return null
  }

  private async applyHierarchyDecision(subjectType: GateSubjectType, subjectId: string, decision: GateDecision): Promise<void> {
    const state: WorkState = decision === 'accepted' ? 'completed' : decision === 'rejected' ? 'blocked' : 'awaiting_gate'
    if (subjectType === 'issue') {
      const issue = await this.store.getIssue(subjectId)
      if (issue) {
        issue.state = decision === 'accepted' ? 'completed' : decision === 'rejected' ? 'repair_required' : 'awaiting_gate'
        issue.updatedAt = nowIso()
        await this.store.putIssue(issue)
        if (decision === 'rejected') {
          const idempotencyKey = deriveIdempotencyKey(issue)
          const existing = await this.store.getIdempotencyRecord(idempotencyKey)
          if (existing) await this.store.updateIdempotencyRecord({ ...existing, state: 'failed_safe_to_retry', runId: null })
        }
      }
    } else if (subjectType === 'phase') {
      const phase = await this.findPhase(subjectId)
      if (phase) { phase.state = state; phase.revision += 1; phase.updatedAt = nowIso(); await this.store.putPhase(phase) }
    } else if (subjectType === 'module') {
      const module = await this.findModule(subjectId)
      if (module) { module.state = state; module.revision += 1; module.updatedAt = nowIso(); await this.store.putModule(module) }
    } else if (subjectType === 'program') {
      const program = await this.store.getProgram(subjectId)
      if (program) { program.state = state; program.revision += 1; program.updatedAt = nowIso(); await this.store.putProgram(program) }
    }
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
    issue.retryAt = null
    await this.store.putIssue(issue)
    return this.dispatch(issueId)
  }
}

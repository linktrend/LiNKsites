import { randomUUID } from 'node:crypto'
import { createHash } from 'node:crypto'
import type { CapabilityGrantLookup } from './capability-lookup.js'
import type { LedgerStore } from './store.js'
import type { HierarchyRegistry } from './hierarchy.js'
import { assertDispatchCapabilityGrant, CapabilityGateError } from './capability-gate.js'
import {
  SCHEMA_VERSION,
  DEFAULT_ORG_ID,
  canonicalSerialize,
  deriveIdempotencyKey,
  type FailureClass,
  type GateDecision,
  type GateResult,
  type GateSubjectType,
  type HierarchySubjectRef,
  type IdempotencyRecord,
  type LedgerEvidenceReceipt,
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
import type { PlatformBaseline } from '@linksites/types'

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
  target?: string
  intendedEffect?: string
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
  return createHash('sha256').update(canonicalSerialize(input)).digest('hex')
}

function subjectRevision(subjectType: GateSubjectType, subject: { id: string; state: string; revision?: number; updatedAt: string; inputDigest?: string; attemptCount?: number }): string {
  return createHash('sha1').update(canonicalSerialize({ subjectType, id: subject.id, state: subject.state, revision: subject.revision ?? null, updatedAt: subject.updatedAt, inputDigest: subject.inputDigest ?? null, attemptCount: subject.attemptCount ?? null })).digest('hex')
}

function intendedGateAssociation(subject: HierarchySubjectRef, runId?: string): string {
  const base = subject.subjectType === 'issue'
    ? `gate:${subject.subjectType}:${subject.subjectId}`
    : `gate:${subject.subjectType}:${subject.subjectId}:program:${subject.programId}:module:${subject.moduleId ?? ''}:phase:${subject.phaseId ?? ''}`
  return runId ? `${base}:run:${runId}` : base
}

function isLedgerEvidenceReceipt(value: unknown): value is LedgerEvidenceReceipt {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false
  const receipt = value as Record<string, unknown>
  const expectedKeys = ['schema_version', 'org_id', 'correlation_id', 'idempotency_key', 'receipt_id', 'producer', 'subject', 'checksum', 'revision_sha', 'storage_location', 'gate_association', 'timestamp']
  if (Object.keys(receipt).sort().join('|') !== expectedKeys.sort().join('|')) return false
  const schema = receipt.schema_version
  const subject = receipt.subject
  const checksum = receipt.checksum
  if (typeof schema !== 'object' || schema === null || Array.isArray(schema) || typeof subject !== 'object' || subject === null || Array.isArray(subject) || typeof checksum !== 'object' || checksum === null || Array.isArray(checksum)) return false
  const subjectRecord = subject as Record<string, unknown>
  const checksumRecord = checksum as Record<string, unknown>
  const reference = (candidate: unknown): candidate is string => typeof candidate === 'string' && candidate.length > 0 && !/[\u0000\n\r]/.test(candidate)
  return (schema as Record<string, unknown>).major === 1 && (schema as Record<string, unknown>).minor === 0 &&
    reference(receipt.org_id) && reference(receipt.correlation_id) && reference(receipt.idempotency_key) &&
    reference(receipt.receipt_id) && reference(receipt.producer) &&
    Object.keys(subjectRecord).sort().join('|') === 'id|type' &&
    (subjectRecord.type === 'issue' || subjectRecord.type === 'phase' || subjectRecord.type === 'module' || subjectRecord.type === 'program' || subjectRecord.type === 'run') && reference(subjectRecord.id) &&
    Object.keys(checksumRecord).sort().join('|') === 'algorithm|value' && checksumRecord.algorithm === 'sha256' && typeof checksumRecord.value === 'string' && /^[a-f0-9]{64}$/.test(checksumRecord.value) &&
    typeof receipt.revision_sha === 'string' && /^[a-f0-9]{40}$/.test(receipt.revision_sha) &&
    reference(receipt.storage_location) && reference(receipt.gate_association) && typeof receipt.timestamp === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(receipt.timestamp)
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
    private readonly platformBaseline?: PlatformBaseline,
  ) {}

  private async emit(
    issueId: string | null,
    runId: string | null,
    type: LedgerEventType,
    payload: Record<string, unknown> = {},
    orgIdOverride?: string,
  ): Promise<void> {
    const issue = issueId ? await this.store.getIssue(issueId) : null
    const event: LedgerEvent = {
      schemaVersion: SCHEMA_VERSION,
      eventId: randomUUID(),
      issueId,
      orgId: issue?.orgId ?? orgIdOverride ?? DEFAULT_ORG_ID,
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
    const orgId = input.orgId ?? DEFAULT_ORG_ID
    if (!(await this.store.getProgram(input.programRef, orgId))) {
      const timestamp = nowIso()
      await this.store.putProgram({ schemaVersion: SCHEMA_VERSION, programId: input.programRef, orgId, title: input.programRef, state: 'ready', revision: 1, createdAt: timestamp, updatedAt: timestamp })
    }
    const issue: Issue = {
      schemaVersion: SCHEMA_VERSION,
      issueId: randomUUID(),
      issueType: input.issueType,
      programRef: input.programRef,
      moduleRef: input.moduleRef,
      phaseRef: input.phaseRef,
      issueKey: input.issueKey,
      target: input.target ?? null,
      intendedEffect: input.intendedEffect ?? (typeof input.input.intendedEffect === 'string' ? input.input.intendedEffect : input.issueType),
      correlationId: input.correlationId ?? null,
      state: 'ready',
      input: input.input,
      inputDigest,
      sideEffectClass: input.sideEffectClass ?? 'none',
      requiredCapabilityId: input.requiredCapabilityId ?? null,
      orgId,
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
    if (issue.moduleRef !== undefined || issue.phaseRef !== undefined) await this.assertIssueHierarchyTenant(issue)

    const dependencies = input.dependsOn ?? []
    for (const dependsOnIssueId of dependencies) {
      const dependencyTarget = await this.store.getIssue(dependsOnIssueId)
      if (!dependencyTarget) throw new LedgerError(`Issue ${issue.issueId} dependency ${dependsOnIssueId} does not exist`, 'dependency_not_satisfied')
      if ((dependencyTarget.orgId ?? DEFAULT_ORG_ID) !== orgId) throw new LedgerError(`Issue ${issue.issueId} dependency ${dependsOnIssueId} belongs to a different organization`, 'dependency_not_satisfied')
    }
    await this.store.putIssue(issue)

    for (const dependsOnIssueId of dependencies) {
      const dep: IssueDependency = {
        issueId: issue.issueId,
        dependsOnIssueId,
        orgId,
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
        providerBaseline: this.platformBaseline,
      })
    } catch (err) {
      if (err instanceof CapabilityGateError) {
        throw new LedgerError(err.message, err.code)
      }
      throw err
    }

    const attemptNumber = issue.attemptCount + 1
    const runId = randomUUID()

    const run: Run = {
      schemaVersion: SCHEMA_VERSION,
      runId,
      issueId,
      orgId: issue.orgId ?? DEFAULT_ORG_ID,
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
    const dispatched = await this.store.dispatchRun({ ...issue, attemptCount: attemptNumber }, run)
    if (!dispatched.created) return dispatched.run
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
    const updated = await this.store.mutateLeasedRun({ runId, fencingToken, kind: 'heartbeat', leaseDurationMs })
    if (!updated) { if (run.lease && run.lease.fencingToken !== fencingToken) this.assertFencingToken(run, fencingToken); throw new LedgerError(`Run ${runId} lease is expired or not active`, 'lease_expired') }
    await this.emit(updated.issueId, runId, 'run.heartbeat', { fencingToken })
    return updated
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
    const reclaimed = await this.store.reclaimExpiredLeases(nowIso())
    for (const run of reclaimed) await this.emit(run.issueId, run.runId, 'run.reclaimed', { fencingToken: run.lease?.fencingToken })
    return reclaimed
  }

  /** Marks a Run's outcome as succeeded. This does NOT complete the Issue -- Gate acceptance does (manual §20 §32, §98.3). */
  async complete(runId: string, fencingToken: number, output: unknown): Promise<Run> {
    const run = await this.store.getRun(runId)
    if (!run) throw new LedgerError(`Run ${runId} not found`, 'not_found')
    const issue = await this.store.getIssue(run.issueId)
    if (!issue) throw new LedgerError(`Issue ${run.issueId} not found for Run ${runId}`, 'not_found')
    const transitionedAt = nowIso()
    const idempotency: IdempotencyRecord = {
      schemaVersion: SCHEMA_VERSION,
      idempotencyKey: deriveIdempotencyKey(issue),
      issueId: issue.issueId,
      orgId: issue.orgId ?? DEFAULT_ORG_ID,
      runId: run.runId,
      state: 'completed',
      createdAt: transitionedAt,
    }
    const updated = await this.store.transitionTerminalRun({
      runId,
      fencingToken,
      kind: 'complete',
      runState: 'succeeded',
      issueState: 'awaiting_gate',
      issueUpdatedAt: transitionedAt,
      retryAt: issue.retryAt,
      output,
      idempotency,
      events: [{
        schemaVersion: SCHEMA_VERSION,
        eventId: randomUUID(),
        issueId: issue.issueId,
        orgId: issue.orgId ?? DEFAULT_ORG_ID,
        runId,
        type: 'run.succeeded',
        payload: {},
        occurredAt: transitionedAt,
      }],
    })
    if (!updated) { if (run.lease && run.lease.fencingToken !== fencingToken) this.assertFencingToken(run, fencingToken); throw new LedgerError(`Run ${runId} lease is expired or not active`, 'lease_expired') }
    return updated
  }

  /**
   * Marks a Run as failed. Retryable failures schedule a new attempt
   * (bounded by retryPolicy.maxAttempts); terminal failures do not.
   */
  async fail(runId: string, fencingToken: number, failureClass: FailureClass, message: string): Promise<Run> {
    const run = await this.store.getRun(runId)
    if (!run) throw new LedgerError(`Run ${runId} not found`, 'not_found')

    const doNotRetry: FailureClass[] = ['invalid_input', 'code_defect', 'cancelled']
    const retryable = !doNotRetry.includes(failureClass)
    const issue = await this.store.getIssue(run.issueId)
    if (!issue) throw new LedgerError(`Issue ${run.issueId} not found for Run ${runId}`, 'not_found')
    const transitionedAt = nowIso()
    const canRetry = retryable && issue.attemptCount < issue.retryPolicy.maxAttempts
    const issueState = canRetry ? 'retry_scheduled' : retryable ? 'exception' : 'failed'
    const retryAt = canRetry ? new Date(Date.now() + issue.retryPolicy.backoffBaseMs).toISOString() : null
    const idempotency: IdempotencyRecord = {
      schemaVersion: SCHEMA_VERSION,
      idempotencyKey: deriveIdempotencyKey(issue),
      issueId: issue.issueId,
      orgId: issue.orgId ?? DEFAULT_ORG_ID,
      runId: null,
      state: canRetry ? 'failed_safe_to_retry' : 'completed',
      createdAt: transitionedAt,
    }
    const updated = await this.store.transitionTerminalRun({
      runId,
      fencingToken,
      kind: 'fail',
      runState: retryable ? 'failed_retryable' : 'failed_terminal',
      issueState,
      issueUpdatedAt: transitionedAt,
      retryAt,
      failureClass,
      message,
      idempotency,
      events: [
        ...(canRetry ? [{
          schemaVersion: SCHEMA_VERSION,
          eventId: randomUUID(),
          issueId: issue.issueId,
          orgId: issue.orgId ?? DEFAULT_ORG_ID,
          runId,
          type: 'issue.retry_scheduled' as const,
          payload: { failureClass },
          occurredAt: transitionedAt,
        }] : []),
        {
          schemaVersion: SCHEMA_VERSION,
          eventId: randomUUID(),
          issueId: issue.issueId,
          orgId: issue.orgId ?? DEFAULT_ORG_ID,
          runId,
          type: 'run.failed',
          payload: { failureClass, message },
          occurredAt: transitionedAt,
        },
      ],
    })
    if (!updated) { if (run.lease && run.lease.fencingToken !== fencingToken) this.assertFencingToken(run, fencingToken); throw new LedgerError(`Run ${runId} lease is expired or not active`, 'lease_expired') }
    return updated
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
    const issue = await this.store.getIssue(run.issueId)
    if (!issue) throw new LedgerError(`Issue ${run.issueId} not found for Run ${runId}`, 'not_found')
    const transitionedAt = nowIso()
    const updated = await this.store.transitionTerminalRun({
      runId,
      fencingToken,
      kind: 'cancel',
      runState: 'cancelled',
      issueState: 'cancelled',
      issueUpdatedAt: transitionedAt,
      retryAt: null,
      idempotency: null,
      events: [{ schemaVersion: SCHEMA_VERSION, eventId: randomUUID(), issueId: issue.issueId, orgId: issue.orgId ?? DEFAULT_ORG_ID, runId, type: 'run.cancelled', payload: {}, occurredAt: transitionedAt }],
    })
    if (!updated) { if (run.lease && run.lease.fencingToken !== fencingToken) this.assertFencingToken(run, fencingToken); throw new LedgerError(`Run ${runId} lease is expired or not active`, 'lease_expired') }
    return updated
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
    const run = await this.store.getRun(runId)
    await this.assertIssueHierarchyTenant(issue)
    if (!run || run.issueId !== issueId || run.orgId !== (issue.orgId ?? DEFAULT_ORG_ID) || run.attemptNumber !== issue.attemptCount || run.state !== 'succeeded') throw new LedgerError(`Issue ${issueId} Gate must reference its exact succeeded Run`, 'invalid_state')
    const currentRevision = subjectRevision('issue', { id: issue.issueId, state: issue.state, updatedAt: issue.updatedAt, inputDigest: issue.inputDigest, attemptCount: issue.attemptCount })
    const receipts = this.receiptsFromEvidence(evidence)
    if (decision === 'accepted' && receipts.length === 0) {
      throw new LedgerError(`Issue ${issueId} cannot pass its Gate without evidence receipts`, 'invalid_state')
    }
    const subject: HierarchySubjectRef = { subjectType: 'issue', subjectId: issueId, orgId: issue.orgId ?? DEFAULT_ORG_ID, programId: issue.programRef, moduleId: issue.moduleRef, phaseId: issue.phaseRef }
    this.assertReceiptsForSubject(receipts, subject, currentRevision, runId)
    const decidedAt = nowIso()

    const gate: GateResult = {
      schemaVersion: SCHEMA_VERSION,
      gateId: randomUUID(),
      subjectType: 'issue',
      subjectId: issueId,
      subjectProgramId: issue.programRef,
      subjectModuleId: issue.moduleRef ?? null,
      subjectPhaseId: issue.phaseRef ?? null,
      subjectRevision: currentRevision,
      attempt: issue.attemptCount,
      evaluator: decidedBy,
      evaluatorVersion: '1',
      orgId: issue.orgId ?? DEFAULT_ORG_ID,
      inputs: evidence,
      reasons: decision === 'rejected' ? [typeof evidence.reason === 'string' ? evidence.reason : 'evidence rejected'] : [],
      evidenceReceipts: receipts,
      issueId,
      runId,
      decision,
      evidence,
      decidedBy,
      decidedAt,
    }
    let idempotency: IdempotencyRecord | null = null
    if (decision === 'rejected') {
      // A rejected Gate makes the underlying dispatch intent retry-eligible
      // again, even though the Run itself technically "succeeded" --
      // Gate acceptance, not Run success, is what finalizes an attempt
      // (manual §20 §32, §98.3).
      const idempotencyKey = deriveIdempotencyKey(issue)
      const existing = await this.store.getIdempotencyRecord(idempotencyKey)
      if (existing) {
        idempotency = { ...existing, state: 'failed_safe_to_retry', runId: null }
      }
    }
    await this.store.recordIssueGateDecision({
      gate,
      issueState: decision === 'accepted' ? 'completed' : 'repair_required',
      issueUpdatedAt: decidedAt,
      idempotency,
      events: [
        { schemaVersion: SCHEMA_VERSION, eventId: randomUUID(), issueId, orgId: issue.orgId ?? DEFAULT_ORG_ID, runId, type: 'gate.decided', payload: { decision, gateId: gate.gateId }, occurredAt: decidedAt },
        { schemaVersion: SCHEMA_VERSION, eventId: randomUUID(), issueId, orgId: issue.orgId ?? DEFAULT_ORG_ID, runId, type: decision === 'accepted' ? 'issue.completed' : 'issue.repair_required', payload: {}, occurredAt: decidedAt },
      ],
    })
    return gate
  }

  private receiptsFromEvidence(evidence: Record<string, unknown>): LedgerEvidenceReceipt[] {
    if (!Array.isArray(evidence.evidenceReceipts)) return []
    if (!evidence.evidenceReceipts.every(isLedgerEvidenceReceipt)) throw new LedgerError('EvidenceReceipt has an invalid canonical envelope', 'invalid_state')
    return evidence.evidenceReceipts as LedgerEvidenceReceipt[]
  }

  private assertReceiptsForSubject(receipts: LedgerEvidenceReceipt[], subject: HierarchySubjectRef, revision: string, runId?: string): void {
    const expectedAssociation = intendedGateAssociation(subject, runId)
    if (receipts.some((receipt) => receipt.org_id !== subject.orgId || receipt.revision_sha !== revision || receipt.subject.type !== subject.subjectType || receipt.subject.id !== subject.subjectId || receipt.gate_association !== expectedAssociation)) {
      throw new LedgerError('EvidenceReceipt is not bound to the exact gate subject, tenant, revision, and intended gate association', 'invalid_state')
    }
  }

  /** Persist the complete canonical hierarchy and its first private-demo Issues. */
  async seedProgramGraph(definition: ProgramDefinition = LINKSITES_PROGRAM, orgId: string | null = null): Promise<{ program: Program; modules: Module[]; phases: Phase[]; issues: Issue[] }> {
    const timestamp = nowIso()
    const tenant = orgId ?? DEFAULT_ORG_ID
    const program: Program = { schemaVersion: SCHEMA_VERSION, programId: definition.programId, orgId: tenant, title: definition.title, state: 'ready', revision: 1, createdAt: timestamp, updatedAt: timestamp }
    await this.store.putProgram(program)
    const modules: Module[] = []
    const phases: Phase[] = []
    const issues: Issue[] = []
    const issueIds = new Map<string, string>()
    for (const moduleDefinition of definition.modules) {
      const module: Module = { schemaVersion: SCHEMA_VERSION, moduleId: moduleDefinition.moduleId, programId: definition.programId, orgId: tenant, title: moduleDefinition.title, purpose: moduleDefinition.purpose, state: 'ready', revision: 1, createdAt: timestamp, updatedAt: timestamp }
      await this.store.putModule(module)
      modules.push(module)
      for (const phaseDefinition of moduleDefinition.phases) {
        const phase: Phase = { schemaVersion: SCHEMA_VERSION, phaseId: phaseDefinition.phaseId, moduleId: module.moduleId, programId: program.programId, orgId: tenant, title: phaseDefinition.title, objective: phaseDefinition.objective, state: 'ready', revision: 1, createdAt: timestamp, updatedAt: timestamp }
        await this.store.putPhase(phase)
        phases.push(phase)
        for (const issueDefinition of phaseDefinition.issues) {
          const existing = await this.store.getIssueByKey(issueDefinition.issueKey, tenant)
          const created = existing ?? await this.createIssue({ issueKey: issueDefinition.issueKey, issueType: issueDefinition.issueType, programRef: program.programId, moduleRef: module.moduleId, phaseRef: phase.phaseId, orgId: tenant, input: { title: issueDefinition.title, objective: issueDefinition.objective }, dependsOn: issueDefinition.dependsOnIssueKeys.map((key) => issueIds.get(key)).filter((id): id is string => id !== undefined) })
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

  async getCurrentGate(subject: HierarchySubjectRef) {
    return this.store.getCurrentGate(subject)
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

  async evaluateGate(input: { subjectType: GateSubjectType; subjectId: string; decision: GateDecision; evidence: Record<string, unknown>; evaluator: string; evaluatorVersion?: string; reasons?: string[]; subjectRevision?: string; issueId?: string; runId?: string; orgId?: string; programId?: string; moduleId?: string; phaseId?: string }): Promise<GateResult> {
    const knownIssue = input.subjectType === 'issue' ? await this.store.getIssue(input.subjectId) : null
    const subject = await this.resolveHierarchySubject(input, knownIssue)
    const orgId = subject.orgId
    const currentRevision = await this.currentSubjectRevision(subject)
    if (currentRevision === null) throw new LedgerError(`${input.subjectType} ${input.subjectId} not found`, 'not_found')
    if (input.subjectRevision !== undefined && input.subjectRevision !== currentRevision) throw new LedgerError(`${input.subjectType} ${input.subjectId} Gate carries a stale subject revision`, 'invalid_state')
    if (input.subjectType === 'issue' && knownIssue?.state !== 'awaiting_gate') {
      throw new LedgerError(`Issue ${input.subjectId} is not awaiting a Gate decision`, 'invalid_state')
    }
    if (input.subjectType === 'issue') {
      await this.assertIssueHierarchyTenant(knownIssue!)
      if (!input.runId) throw new LedgerError(`Issue ${input.subjectId} Gate must reference its exact succeeded Run`, 'invalid_state')
      const run = await this.store.getRun(input.runId)
      if (!run || run.issueId !== input.subjectId || run.orgId !== (knownIssue!.orgId ?? DEFAULT_ORG_ID) || run.attemptNumber !== knownIssue!.attemptCount || run.state !== 'succeeded') throw new LedgerError(`Issue ${input.subjectId} Gate must reference its exact succeeded Run`, 'invalid_state')
    }
    const receipts = this.receiptsFromEvidence(input.evidence)
    if (input.decision === 'accepted' && (Object.keys(input.evidence).length === 0 || receipts.length === 0)) throw new LedgerError(`${input.subjectType} ${input.subjectId} cannot pass its Gate without evidence`, 'invalid_state')
    if (!orgId) throw new LedgerError(`${input.subjectType} ${input.subjectId} has no tenant`, 'org_required')
    this.assertReceiptsForSubject(receipts, subject, currentRevision, input.subjectType === 'issue' ? input.runId : undefined)
    if (input.decision === 'accepted' && !(await this.subjectChildrenComplete(subject))) {
      throw new LedgerError(`${input.subjectType} ${input.subjectId} cannot pass its Gate before all required children complete`, 'invalid_state')
    }
    const current = await this.getHierarchySubject(subject)
    if (!current) throw new LedgerError(`${input.subjectType} ${input.subjectId} not found`, 'not_found')
    if (input.subjectType !== 'issue') {
      this.assertLegalHierarchyTransition(current.state as WorkState, input.decision === 'accepted' ? 'completed' : 'blocked')
    }
    const prior = await this.store.getCurrentGate(subject)
    const decidedAt = nowIso()
    const gate: GateResult = { schemaVersion: SCHEMA_VERSION, gateId: randomUUID(), subjectType: input.subjectType, subjectId: input.subjectId, orgId, subjectProgramId: subject.programId, subjectModuleId: subject.moduleId ?? null, subjectPhaseId: subject.phaseId ?? null, subjectRevision: currentRevision, attempt: (prior?.attempt ?? 0) + 1, evaluator: input.evaluator, evaluatorVersion: input.evaluatorVersion ?? '1', inputs: input.evidence, reasons: input.reasons ?? [], evidenceReceipts: receipts, issueId: input.issueId ?? (input.subjectType === 'issue' ? input.subjectId : null), runId: input.runId ?? null, decision: input.decision, evidence: input.evidence, decidedBy: input.evaluator, decidedAt }
    if (gate.issueId) {
      const linkedIssue = await this.store.getIssue(gate.issueId)
      if (!linkedIssue || linkedIssue.orgId !== orgId) throw new LedgerError('Gate issue association is outside the subject tenant', 'invalid_state')
    }
    if (input.subjectType === 'issue') {
      let idempotency: IdempotencyRecord | null = null
      if (input.decision === 'rejected') {
        const existing = await this.store.getIdempotencyRecord(deriveIdempotencyKey(knownIssue!))
        if (existing) idempotency = { ...existing, state: 'failed_safe_to_retry', runId: null }
      }
      await this.store.recordIssueGateDecision({
        gate,
        issueState: input.decision === 'accepted' ? 'completed' : 'repair_required',
        issueUpdatedAt: decidedAt,
        idempotency,
        events: [
          { schemaVersion: SCHEMA_VERSION, eventId: randomUUID(), issueId: input.subjectId, orgId, runId: input.runId ?? null, type: 'gate.decided', payload: { decision: input.decision, gateId: gate.gateId }, occurredAt: decidedAt },
          { schemaVersion: SCHEMA_VERSION, eventId: randomUUID(), issueId: input.subjectId, orgId, runId: input.runId ?? null, type: input.decision === 'accepted' ? 'issue.completed' : 'issue.repair_required', payload: {}, occurredAt: decidedAt },
        ],
      })
    } else {
      const nextState: WorkState = input.decision === 'accepted' ? 'completed' : input.decision === 'rejected' ? 'blocked' : 'awaiting_gate'
      const events: LedgerEvent[] = [
        { schemaVersion: SCHEMA_VERSION, eventId: randomUUID(), issueId: gate.issueId, orgId, runId: gate.runId, type: 'gate.decided', payload: { decision: input.decision, gateId: gate.gateId, subjectType: subject.subjectType, subjectId: subject.subjectId, programId: subject.programId, moduleId: subject.moduleId ?? null, phaseId: subject.phaseId ?? null }, occurredAt: decidedAt },
        { schemaVersion: SCHEMA_VERSION, eventId: randomUUID(), issueId: gate.issueId, orgId, runId: gate.runId, type: 'hierarchy.transitioned', payload: { subjectType: subject.subjectType, subjectId: subject.subjectId, programId: subject.programId, moduleId: subject.moduleId ?? null, phaseId: subject.phaseId ?? null, from: current.state, to: nextState }, occurredAt: decidedAt },
      ]
      if (!('revision' in current)) throw new LedgerError(`${input.subjectType} ${input.subjectId} has no hierarchy revision`, 'invalid_state')
      await this.store.recordHierarchyGateDecision({ subject, gate, subjectState: nextState, expectedRevision: current.revision, subjectUpdatedAt: decidedAt, events })
    }
    return gate
  }

  private async assertIssueHierarchyTenant(issue: Issue): Promise<void> {
    const orgId = issue.orgId ?? DEFAULT_ORG_ID
    const program = await this.store.getProgram(issue.programRef, orgId)
    if (!program) throw new LedgerError(`Issue ${issue.issueId} hierarchy Program is outside tenant ${orgId}`, 'invalid_state')
    if (issue.moduleRef === undefined && issue.phaseRef !== undefined) throw new LedgerError(`Issue ${issue.issueId} cannot reference a Phase without a Module`, 'invalid_state')
    if (issue.moduleRef !== undefined) {
      const module = await this.store.getModule(issue.programRef, issue.moduleRef, orgId)
      if (!module) throw new LedgerError(`Issue ${issue.issueId} hierarchy Module is outside tenant ${orgId}`, 'invalid_state')
      if (issue.phaseRef !== undefined) {
        const phase = await this.store.getPhase(issue.programRef, issue.moduleRef, issue.phaseRef, orgId)
        if (!phase) throw new LedgerError(`Issue ${issue.issueId} hierarchy Phase is outside tenant ${orgId}`, 'invalid_state')
      }
    }
  }

  private async resolveHierarchySubject(input: { subjectType: GateSubjectType; subjectId: string; orgId?: string; programId?: string; moduleId?: string; phaseId?: string }, knownIssue: Issue | null): Promise<HierarchySubjectRef> {
    if (input.subjectType === 'issue') {
      if (!knownIssue) throw new LedgerError(`Issue ${input.subjectId} not found`, 'not_found')
      const orgId = knownIssue.orgId ?? DEFAULT_ORG_ID
      if (input.orgId !== undefined && input.orgId !== orgId) throw new LedgerError(`Issue ${input.subjectId} is outside tenant ${input.orgId}`, 'invalid_state')
      return { subjectType: 'issue', subjectId: knownIssue.issueId, orgId, programId: knownIssue.programRef, moduleId: knownIssue.moduleRef, phaseId: knownIssue.phaseRef }
    }
    if (!input.orgId) throw new LedgerError(`${input.subjectType} ${input.subjectId} requires an explicit tenant-scoped hierarchy lookup`, 'org_required')
    const programId = input.programId ?? (input.subjectType === 'program' ? input.subjectId : undefined)
    if (!programId) throw new LedgerError(`${input.subjectType} ${input.subjectId} requires its complete Program identity`, 'invalid_state')
    if (input.subjectType === 'program') {
      if (input.subjectId !== programId || input.moduleId !== undefined || input.phaseId !== undefined) throw new LedgerError(`Program Gate identity is incomplete or ambiguous`, 'invalid_state')
      return { subjectType: 'program', subjectId: input.subjectId, orgId: input.orgId, programId }
    }
    if (input.subjectType === 'module') {
      if (!input.moduleId || input.subjectId !== input.moduleId || input.phaseId !== undefined) throw new LedgerError(`Module Gate identity requires Program and exact Module IDs`, 'invalid_state')
      return { subjectType: 'module', subjectId: input.subjectId, orgId: input.orgId, programId, moduleId: input.moduleId }
    }
    if (!input.moduleId || !input.phaseId || input.subjectId !== input.phaseId) throw new LedgerError(`Phase Gate identity requires Program, Module, and exact Phase IDs`, 'invalid_state')
    return { subjectType: 'phase', subjectId: input.subjectId, orgId: input.orgId, programId, moduleId: input.moduleId, phaseId: input.phaseId }
  }

  private async getHierarchySubject(subject: HierarchySubjectRef): Promise<Issue | Program | Module | Phase | null> {
    if (subject.subjectType === 'issue') return this.store.getIssue(subject.subjectId)
    if (subject.subjectType === 'program') return this.store.getProgram(subject.programId, subject.orgId)
    if (subject.subjectType === 'module') return this.store.getModule(subject.programId, subject.moduleId!, subject.orgId)
    return this.store.getPhase(subject.programId, subject.moduleId!, subject.phaseId!, subject.orgId)
  }

  private async currentSubjectRevision(subject: HierarchySubjectRef): Promise<string | null> {
    const current = await this.getHierarchySubject(subject)
    if (!current) return null
    return subjectRevision(subject.subjectType, { id: subject.subjectId, state: current.state, revision: 'revision' in current ? current.revision : undefined, updatedAt: current.updatedAt, inputDigest: 'inputDigest' in current ? current.inputDigest : undefined, attemptCount: 'attemptCount' in current ? current.attemptCount : undefined })
  }

  async getSubjectRevision(subject: HierarchySubjectRef): Promise<string> {
    const revision = await this.currentSubjectRevision(subject)
    if (!revision) throw new LedgerError(`${subject.subjectType} ${subject.subjectId} not found`, 'not_found')
    return revision
  }

  private async subjectChildrenComplete(subject: HierarchySubjectRef): Promise<boolean> {
    if (subject.subjectType === 'issue') {
      const issue = await this.store.getIssue(subject.subjectId)
      return issue?.state === 'awaiting_gate'
    }
    if (subject.subjectType === 'phase') {
      const phase = await this.store.getPhase(subject.programId, subject.moduleId!, subject.phaseId!, subject.orgId)
      if (!phase) return false
      const issues = await this.store.listIssues({ orgId: subject.orgId, programId: phase.programId, moduleId: phase.moduleId, phaseId: phase.phaseId })
      return issues.length > 0 && issues.every((issue) => issue.state === 'completed')
    }
    if (subject.subjectType === 'module') {
      const module = await this.store.getModule(subject.programId, subject.moduleId!, subject.orgId)
      if (!module) return false
      const phases = await this.store.listPhases(module.programId, module.moduleId, subject.orgId)
      return phases.length > 0 && phases.every((phase) => phase.state === 'completed')
    }
    const program = await this.store.getProgram(subject.programId, subject.orgId)
    if (!program) return false
    const modules = await this.store.listModules(program.programId, subject.orgId)
    return modules.length > 0 && modules.every((module) => module.state === 'completed')
  }

  private assertLegalHierarchyTransition(from: WorkState, to: WorkState): void {
    const allowed: Record<WorkState, WorkState[]> = { planned: ['ready', 'blocked'], ready: ['in_progress', 'awaiting_gate', 'completed', 'blocked'], in_progress: ['awaiting_gate', 'failed', 'blocked'], awaiting_gate: ['completed', 'blocked'], completed: [], failed: ['ready'], blocked: ['ready'] }
    if (from !== to && !allowed[from].includes(to)) throw new LedgerError(`Illegal hierarchy transition ${from} -> ${to}`, 'invalid_state')
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

import { randomUUID } from 'node:crypto'
import { SCHEMA_VERSION } from './types.js'
import { DEFAULT_ORG_ID } from './types.js'
import type {
  GateResult,
  FailureClass,
  IdempotencyRecord,
  Issue,
  IssueDependency,
  LedgerEvent,
  LedgerSnapshot,
  Module,
  Phase,
  Program,
  Run,
  UnresolvedDependency,
} from './types.js'

/**
 * Storage abstraction. Ledger business logic (ledger.ts) depends only on
 * this interface, never on a specific database — per
 * docs/archive/policies/CONTRACT_AND_SCHEMA_VERSIONING_POLICY.md's "generated
 * types / single source of truth" preference and manual §20's requirement
 * that the Program Ledger be the authoritative state store regardless of
 * which runtime (n8n, CrewAI, Agent Zero, Cursor, ...) executes a Run.
 *
 * `InMemoryLedgerStore` (this file) backs deterministic unit tests.
 * A Postgres-backed implementation lives in ./postgresStore.ts for real
 * persistence, following the same interface.
 */
export interface LedgerStore {
  getProgram(programId: string, orgId?: string): Promise<Program | null>
  putProgram(program: Program): Promise<void>
  listPrograms(orgId?: string): Promise<Program[]>
  getModule(programId: string, moduleId: string, orgId?: string): Promise<Module | null>
  putModule(module: Module): Promise<void>
  listModules(programId: string, orgId?: string): Promise<Module[]>
  getPhase(programId: string, moduleId: string, phaseId: string, orgId?: string): Promise<Phase | null>
  putPhase(phase: Phase): Promise<void>
  listPhases(programId: string, moduleId: string, orgId?: string): Promise<Phase[]>

  getIssue(issueId: string): Promise<Issue | null>
  getIssueByKey(issueKey: string, orgId?: string): Promise<Issue | null>
  putIssue(issue: Issue): Promise<void>
  listIssues(filter?: { orgId?: string; programId?: string; moduleId?: string; phaseId?: string }): Promise<Issue[]>

  getRun(runId: string): Promise<Run | null>
  putRun(run: Run): Promise<void>
  listRunsForIssue(issueId: string): Promise<Run[]>
  /** Atomically claims a queued Run and assigns its lease/fencing token. */
  claimRun(runId: string, executorId: string, leaseDurationMs: number, executorType: string, executorVersion: string): Promise<Run | null>
  dispatchRun(issue: Issue, run: Run): Promise<{ run: Run; created: boolean }>
  mutateLeasedRun(input: { runId: string; fencingToken: number; kind: 'heartbeat' | 'complete' | 'fail' | 'cancel'; leaseDurationMs?: number; output?: unknown; failureClass?: FailureClass; message?: string }): Promise<Run | null>
  /** Atomically applies a terminal Run transition, its Issue state, idempotency state, and audit events. */
  transitionTerminalRun(input: {
    runId: string
    fencingToken: number
    kind: 'complete' | 'fail' | 'cancel'
    runState: Run['state']
    issueState: Issue['state']
    issueUpdatedAt: string
    retryAt: string | null
    output?: unknown
    failureClass?: FailureClass
    message?: string
    idempotency: IdempotencyRecord | null
    events: LedgerEvent[]
  }): Promise<Run | null>
  reclaimExpiredLeases(nowIso: string): Promise<Run[]>

  /**
   * Atomically reserves an idempotency key for a NEW dispatch attempt.
   *
   * - If no record exists for this key, or the existing record is in
   *   `failed_safe_to_retry` (a prior attempt failed retryably and this
   *   is a legitimate retry, not a duplicate), the key is (re-)reserved
   *   for the new attempt and `created: true` is returned.
   * - Otherwise (an existing `reserved`/`executing`/`completed` record),
   *   this IS the duplicate-dispatch case manual §20 §57-63 requires
   *   protection against: the existing record is returned unchanged with
   *   `created: false`, and the caller must NOT create a new Run.
   */
  reserveIdempotencyKey(record: IdempotencyRecord): Promise<{ record: IdempotencyRecord; created: boolean }>
  getIdempotencyRecord(key: string): Promise<IdempotencyRecord | null>
  updateIdempotencyRecord(record: IdempotencyRecord): Promise<void>

  putGateResult(gate: GateResult): Promise<void>
  /** Atomically records an Issue Gate and applies its authoritative Issue state. */
  recordIssueGateDecision(input: {
    gate: GateResult
    issueState: Issue['state']
    issueUpdatedAt: string
    idempotency: IdempotencyRecord | null
    events: LedgerEvent[]
  }): Promise<void>
  getGateResult(gateId: string): Promise<GateResult | null>
  getCurrentGate(subjectType: GateResult['subjectType'], subjectId: string): Promise<GateResult | null>
  listGateResults(subjectType: GateResult['subjectType'], subjectId: string): Promise<GateResult[]>

  appendEvent(event: LedgerEvent): Promise<void>
  listEvents(issueId: string): Promise<LedgerEvent[]>

  /** Returns all Runs currently in `claimed`/`executing` state whose lease has expired. */

  /**
   * Records a dependency: `dep.issueId` cannot be dispatched until
   * `dep.dependsOnIssueId` reaches `completed` state. Idempotent: storing
   * the same pair twice is a no-op (not an error).
   */
  addIssueDependency(dep: IssueDependency): Promise<void>

  /**
   * Returns all dependencies declared for `issueId` — i.e. every Issue
   * that `issueId` must wait for before it is dispatchable.
   */
  getIssueDependencies(issueId: string): Promise<IssueDependency[]>
  getUnresolvedDependencies(issueId: string, orgId?: string): Promise<UnresolvedDependency[]>
  exportSnapshot(): Promise<LedgerSnapshot>
}

export class InMemoryLedgerStore implements LedgerStore {
  private programs = new Map<string, Program>()
  private modules = new Map<string, Module>()
  private phases = new Map<string, Phase>()
  private issues = new Map<string, Issue>()
  private runs = new Map<string, Run>()
  private idempotency = new Map<string, IdempotencyRecord>()
  private gates = new Map<string, GateResult>()
  private events: LedgerEvent[] = []
  private dependencies: IssueDependency[] = []

  static fromSnapshot(snapshot: LedgerSnapshot): InMemoryLedgerStore {
    const store = new InMemoryLedgerStore()
    for (const program of snapshot.programs) store.programs.set(`${program.programId}:${program.orgId}`, { ...program })
    for (const module of snapshot.modules) store.modules.set(`${module.programId}:${module.moduleId}:${module.orgId}`, { ...module })
    for (const phase of snapshot.phases) store.phases.set(`${phase.programId}:${phase.moduleId}:${phase.phaseId}:${phase.orgId}`, { ...phase })
    for (const issue of snapshot.issues) store.issues.set(issue.issueId, { ...issue })
    for (const run of snapshot.runs) store.runs.set(run.runId, { ...run })
    for (const record of snapshot.idempotency) store.idempotency.set(record.idempotencyKey, { ...record })
    for (const gate of snapshot.gates) store.gates.set(gate.gateId, { ...gate })
    store.events = snapshot.events.map((event) => ({ ...event }))
    store.dependencies = snapshot.dependencies.map((dependency) => ({ ...dependency }))
    return store
  }

  async getProgram(programId: string, orgId?: string): Promise<Program | null> {
    const program = [...this.programs.values()].find((candidate) => candidate.programId === programId && candidate.orgId === (orgId ?? DEFAULT_ORG_ID))
    return program && program.orgId === (orgId ?? DEFAULT_ORG_ID) ? { ...program } : null
  }

  async putProgram(program: Program): Promise<void> { this.programs.set(`${program.programId}:${program.orgId}`, { ...program }) }

  async listPrograms(orgId?: string): Promise<Program[]> {
    return [...this.programs.values()].filter((program) => program.orgId === (orgId ?? DEFAULT_ORG_ID)).map((program) => ({ ...program }))
  }

  async getModule(programId: string, moduleId: string, orgId?: string): Promise<Module | null> {
    const module = [...this.modules.values()].find((candidate) => candidate.programId === programId && candidate.moduleId === moduleId && candidate.orgId === (orgId ?? DEFAULT_ORG_ID))
    return module && module.orgId === (orgId ?? DEFAULT_ORG_ID) ? { ...module } : null
  }

  async putModule(module: Module): Promise<void> { this.modules.set(`${module.programId}:${module.moduleId}:${module.orgId}`, { ...module }) }

  async listModules(programId: string, orgId?: string): Promise<Module[]> {
    return [...this.modules.values()].filter((module) => module.programId === programId && module.orgId === (orgId ?? DEFAULT_ORG_ID)).map((module) => ({ ...module }))
  }

  async getPhase(programId: string, moduleId: string, phaseId: string, orgId?: string): Promise<Phase | null> {
    const phase = [...this.phases.values()].find((candidate) => candidate.programId === programId && candidate.moduleId === moduleId && candidate.phaseId === phaseId && candidate.orgId === (orgId ?? DEFAULT_ORG_ID))
    return phase && phase.orgId === (orgId ?? DEFAULT_ORG_ID) ? { ...phase } : null
  }

  async putPhase(phase: Phase): Promise<void> { this.phases.set(`${phase.programId}:${phase.moduleId}:${phase.phaseId}:${phase.orgId}`, { ...phase }) }

  async listPhases(programId: string, moduleId: string, orgId?: string): Promise<Phase[]> {
    return [...this.phases.values()].filter((phase) => phase.programId === programId && phase.moduleId === moduleId && phase.orgId === (orgId ?? DEFAULT_ORG_ID)).map((phase) => ({ ...phase }))
  }

  async getIssue(issueId: string): Promise<Issue | null> {
    return this.issues.get(issueId) ?? null
  }

  async getIssueByKey(issueKey: string, orgId?: string): Promise<Issue | null> {
    for (const issue of this.issues.values()) if (issue.issueKey === issueKey && issue.orgId === (orgId ?? DEFAULT_ORG_ID)) return { ...issue }
    return null
  }

  async putIssue(issue: Issue): Promise<void> {
    this.issues.set(issue.issueId, { ...issue })
  }

  async listIssues(filter: { orgId?: string; programId?: string; moduleId?: string; phaseId?: string } = {}): Promise<Issue[]> {
    return [...this.issues.values()].filter((issue) =>
      issue.orgId === (filter.orgId ?? DEFAULT_ORG_ID) &&
      (filter.programId === undefined || issue.programRef === filter.programId) &&
      (filter.moduleId === undefined || issue.moduleRef === filter.moduleId) &&
      (filter.phaseId === undefined || issue.phaseRef === filter.phaseId),
    ).map((issue) => ({ ...issue }))
  }

  async getRun(runId: string): Promise<Run | null> {
    return this.runs.get(runId) ?? null
  }

  async putRun(run: Run): Promise<void> {
    this.runs.set(run.runId, { ...run })
  }

  async listRunsForIssue(issueId: string): Promise<Run[]> {
    return Array.from(this.runs.values()).filter((r) => r.issueId === issueId).map((run) => ({ ...run }))
  }

  async claimRun(runId: string, executorId: string, leaseDurationMs: number, executorType: string, executorVersion: string): Promise<Run | null> {
    const run = this.runs.get(runId)
    if (!run || run.state !== 'queued') return null
    const nextFencingToken = (run.lease?.fencingToken ?? 0) + 1
    const now = new Date().toISOString()
    const claimed: Run = {
      ...run,
      state: 'claimed',
      lease: { leaseId: randomUUID(), fencingToken: nextFencingToken, executorId, expiresAt: new Date(Date.now() + leaseDurationMs).toISOString() },
      executorType,
      executorVersion,
      claimedAt: now,
      startedAt: now,
    }
    this.runs.set(runId, claimed)
    return { ...claimed }
  }

  async dispatchRun(issue: Issue, run: Run): Promise<{ run: Run; created: boolean }> {
    const existing = this.idempotency.get(run.idempotencyKey)
    if (existing && existing.state !== 'failed_safe_to_retry') {
      const existingRun = existing.runId ? this.runs.get(existing.runId) : undefined
      if (existingRun) return { run: { ...existingRun }, created: false }
      throw new Error(`idempotency record ${run.idempotencyKey} has no resolvable Run`)
    }
    if (!['ready', 'retry_scheduled'].includes(issue.state)) throw new Error(`Issue ${issue.issueId} is no longer dispatchable`)
    this.runs.set(run.runId, { ...run })
    this.idempotency.set(run.idempotencyKey, { schemaVersion: SCHEMA_VERSION, idempotencyKey: run.idempotencyKey, issueId: issue.issueId, orgId: issue.orgId ?? DEFAULT_ORG_ID, runId: run.runId, state: 'executing', createdAt: run.createdAt })
    this.issues.set(issue.issueId, { ...issue, state: 'dispatched', attemptCount: run.attemptNumber, updatedAt: run.createdAt })
    return { run: { ...run }, created: true }
  }

  async mutateLeasedRun(input: { runId: string; fencingToken: number; kind: 'heartbeat' | 'complete' | 'fail' | 'cancel'; leaseDurationMs?: number; output?: unknown; failureClass?: FailureClass; message?: string }): Promise<Run | null> {
    const run = this.runs.get(input.runId)
    const allowedStates = input.kind === 'cancel' ? ['claimed', 'executing', 'cancel_requested'] : ['claimed', 'executing']
    if (!run || !run.lease || run.lease.fencingToken !== input.fencingToken || !allowedStates.includes(run.state) || new Date(run.lease.expiresAt).getTime() <= Date.now()) return null
    const next = { ...run }
    if (input.kind === 'heartbeat') { next.lease = { ...run.lease, expiresAt: new Date(Date.now() + (input.leaseDurationMs ?? 30_000)).toISOString() }; next.lastHeartbeatAt = new Date().toISOString() }
    if (input.kind === 'complete') { next.state = 'succeeded'; next.terminalState = 'succeeded'; next.output = input.output ?? null; next.completedAt = new Date().toISOString() }
    if (input.kind === 'fail') { next.state = 'failed_retryable'; next.terminalState = 'failed_retryable'; next.failure = { failureClass: input.failureClass as NonNullable<Run['failure']>['failureClass'], message: input.message ?? '' }; next.completedAt = new Date().toISOString() }
    if (input.kind === 'cancel') { next.state = 'cancelled'; next.terminalState = 'cancelled'; next.completedAt = new Date().toISOString() }
    this.runs.set(input.runId, next)
    return { ...next }
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
    failureClass?: FailureClass
    message?: string
    idempotency: IdempotencyRecord | null
    events: LedgerEvent[]
  }): Promise<Run | null> {
    const run = this.runs.get(input.runId)
    const allowedStates = input.kind === 'cancel' ? ['claimed', 'executing', 'cancel_requested'] : ['claimed', 'executing']
    if (!run || !run.lease || run.lease.fencingToken !== input.fencingToken || !allowedStates.includes(run.state) || new Date(run.lease.expiresAt).getTime() <= Date.now()) return null
    const next: Run = {
      ...run,
      state: input.runState,
      terminalState: input.runState,
      output: input.kind === 'complete' ? input.output ?? null : run.output,
      failure: input.kind === 'fail' ? { failureClass: input.failureClass ?? 'unknown', message: input.message ?? '' } : run.failure,
      completedAt: input.issueUpdatedAt,
    }
    const issue = this.issues.get(run.issueId)
    if (!issue) throw new Error(`Issue ${run.issueId} not found for terminal Run ${run.runId}`)
    this.runs.set(run.runId, next)
    this.issues.set(issue.issueId, { ...issue, state: input.issueState, retryAt: input.retryAt, updatedAt: input.issueUpdatedAt })
    if (input.idempotency) this.idempotency.set(input.idempotency.idempotencyKey, { ...input.idempotency })
    this.events.push(...input.events.map((event) => ({ ...event })))
    return { ...next }
  }

  async reserveIdempotencyKey(
    record: IdempotencyRecord,
  ): Promise<{ record: IdempotencyRecord; created: boolean }> {
    const existing = this.idempotency.get(record.idempotencyKey)
    if (existing && existing.state !== 'failed_safe_to_retry') {
      return { record: existing, created: false }
    }
    this.idempotency.set(record.idempotencyKey, { ...record })
    return { record, created: true }
  }

  async getIdempotencyRecord(key: string): Promise<IdempotencyRecord | null> {
    return this.idempotency.get(key) ?? null
  }

  async updateIdempotencyRecord(record: IdempotencyRecord): Promise<void> {
    this.idempotency.set(record.idempotencyKey, { ...record })
  }

  async putGateResult(gate: GateResult): Promise<void> {
    if (this.gates.has(gate.gateId)) throw new Error(`Gate ${gate.gateId} is immutable`)
    this.gates.set(gate.gateId, { ...gate })
  }

  async recordIssueGateDecision(input: {
    gate: GateResult
    issueState: Issue['state']
    issueUpdatedAt: string
    idempotency: IdempotencyRecord | null
    events: LedgerEvent[]
  }): Promise<void> {
    if (this.gates.has(input.gate.gateId)) throw new Error(`Gate ${input.gate.gateId} is immutable`)
    const issue = this.issues.get(input.gate.subjectId)
    if (!issue) throw new Error(`Issue ${input.gate.subjectId} not found for Gate`)
    this.gates.set(input.gate.gateId, { ...input.gate })
    this.issues.set(issue.issueId, { ...issue, state: input.issueState, updatedAt: input.issueUpdatedAt })
    if (input.idempotency) this.idempotency.set(input.idempotency.idempotencyKey, { ...input.idempotency })
    this.events.push(...input.events.map((event) => ({ ...event })))
  }

  async getGateResult(gateId: string): Promise<GateResult | null> {
    return this.gates.get(gateId) ?? null
  }

  async getCurrentGate(subjectType: GateResult['subjectType'], subjectId: string): Promise<GateResult | null> {
    const results = await this.listGateResults(subjectType, subjectId)
    return results.at(-1) ?? null
  }

  async listGateResults(subjectType: GateResult['subjectType'], subjectId: string): Promise<GateResult[]> {
    return [...this.gates.values()].filter((gate) => gate.subjectType === subjectType && gate.subjectId === subjectId).map((gate) => ({ ...gate }))
  }

  async appendEvent(event: LedgerEvent): Promise<void> {
    this.events.push({ ...event })
  }

  async listEvents(issueId: string): Promise<LedgerEvent[]> {
    return this.events.filter((e) => e.issueId === issueId)
  }

  async reclaimExpiredLeases(nowIso: string): Promise<Run[]> {
    const now = new Date(nowIso).getTime()
    const expired = Array.from(this.runs.values()).filter(
      (r) =>
        (r.state === 'claimed' || r.state === 'executing') &&
        r.lease !== null &&
        new Date(r.lease.expiresAt).getTime() < now,
    )
    const reclaimed: Run[] = []
    for (const run of expired) {
      const next = { ...run, state: 'queued' as const, lease: { ...(run.lease as NonNullable<Run['lease']>), fencingToken: (run.lease?.fencingToken ?? 0) + 1, executorId: '', expiresAt: nowIso } }
      this.runs.set(run.runId, next)
      reclaimed.push({ ...next })
    }
    return reclaimed
  }

  async addIssueDependency(dep: IssueDependency): Promise<void> {
    const alreadyExists = this.dependencies.some(
      (d) => d.issueId === dep.issueId && d.dependsOnIssueId === dep.dependsOnIssueId,
    )
    if (!alreadyExists) {
      this.dependencies.push({ ...dep })
    }
  }

  async getIssueDependencies(issueId: string): Promise<IssueDependency[]> {
    return this.dependencies.filter((d) => d.issueId === issueId).map((d) => ({ ...d }))
  }

  async getUnresolvedDependencies(issueId: string, orgId?: string): Promise<UnresolvedDependency[]> {
    const dependencies = await this.getIssueDependencies(issueId)
    const owner = this.issues.get(issueId)
    const expectedOrgId = orgId ?? owner?.orgId ?? null
    const unresolved: UnresolvedDependency[] = []
    for (const dependency of dependencies) {
      const target = this.issues.get(dependency.dependsOnIssueId)
      if (!target) unresolved.push({ dependency, state: null, reason: 'missing' })
      else if (target.orgId !== expectedOrgId) unresolved.push({ dependency, state: target.state, reason: 'wrong_org' })
      else if (target.state !== 'completed') unresolved.push({ dependency, state: target.state, reason: target.state === 'repair_required' ? 'rejected_gate' : 'not_completed' })
    }
    return unresolved
  }

  async exportSnapshot(): Promise<LedgerSnapshot> {
    return {
      schemaVersion: { ...SCHEMA_VERSION },
      programs: [...this.programs.values()].map((value) => ({ ...value })),
      modules: [...this.modules.values()].map((value) => ({ ...value })),
      phases: [...this.phases.values()].map((value) => ({ ...value })),
      issues: [...this.issues.values()].map((value) => ({ ...value })),
      runs: [...this.runs.values()].map((value) => ({ ...value })),
      idempotency: [...this.idempotency.values()].map((value) => ({ ...value })),
      gates: [...this.gates.values()].map((value) => ({ ...value })),
      events: this.events.map((value) => ({ ...value })),
      dependencies: this.dependencies.map((value) => ({ ...value })),
    }
  }
}

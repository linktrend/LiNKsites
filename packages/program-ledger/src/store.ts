import { randomUUID } from 'node:crypto'
import { SCHEMA_VERSION } from './types.js'
import type {
  GateResult,
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
  getGateResult(gateId: string): Promise<GateResult | null>
  getCurrentGate(subjectType: GateResult['subjectType'], subjectId: string): Promise<GateResult | null>
  listGateResults(subjectType: GateResult['subjectType'], subjectId: string): Promise<GateResult[]>

  appendEvent(event: LedgerEvent): Promise<void>
  listEvents(issueId: string): Promise<LedgerEvent[]>

  /** Returns all Runs currently in `claimed`/`executing` state whose lease has expired. */
  listExpiredLeaseRuns(nowIso: string): Promise<Run[]>

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
    for (const program of snapshot.programs) store.programs.set(program.programId, { ...program })
    for (const module of snapshot.modules) store.modules.set(`${module.programId}:${module.moduleId}`, { ...module })
    for (const phase of snapshot.phases) store.phases.set(`${phase.programId}:${phase.moduleId}:${phase.phaseId}`, { ...phase })
    for (const issue of snapshot.issues) store.issues.set(issue.issueId, { ...issue })
    for (const run of snapshot.runs) store.runs.set(run.runId, { ...run })
    for (const record of snapshot.idempotency) store.idempotency.set(record.idempotencyKey, { ...record })
    for (const gate of snapshot.gates) store.gates.set(gate.gateId, { ...gate })
    store.events = snapshot.events.map((event) => ({ ...event }))
    store.dependencies = snapshot.dependencies.map((dependency) => ({ ...dependency }))
    return store
  }

  async getProgram(programId: string, orgId?: string): Promise<Program | null> {
    const program = this.programs.get(programId)
    return program && (orgId === undefined || program.orgId === orgId) ? { ...program } : null
  }

  async putProgram(program: Program): Promise<void> { this.programs.set(program.programId, { ...program }) }

  async listPrograms(orgId?: string): Promise<Program[]> {
    return [...this.programs.values()].filter((program) => orgId === undefined || program.orgId === orgId).map((program) => ({ ...program }))
  }

  async getModule(programId: string, moduleId: string, orgId?: string): Promise<Module | null> {
    const module = this.modules.get(`${programId}:${moduleId}`)
    return module && (orgId === undefined || module.orgId === orgId) ? { ...module } : null
  }

  async putModule(module: Module): Promise<void> { this.modules.set(`${module.programId}:${module.moduleId}`, { ...module }) }

  async listModules(programId: string, orgId?: string): Promise<Module[]> {
    return [...this.modules.values()].filter((module) => module.programId === programId && (orgId === undefined || module.orgId === orgId)).map((module) => ({ ...module }))
  }

  async getPhase(programId: string, moduleId: string, phaseId: string, orgId?: string): Promise<Phase | null> {
    const phase = this.phases.get(`${programId}:${moduleId}:${phaseId}`)
    return phase && (orgId === undefined || phase.orgId === orgId) ? { ...phase } : null
  }

  async putPhase(phase: Phase): Promise<void> { this.phases.set(`${phase.programId}:${phase.moduleId}:${phase.phaseId}`, { ...phase }) }

  async listPhases(programId: string, moduleId: string, orgId?: string): Promise<Phase[]> {
    return [...this.phases.values()].filter((phase) => phase.programId === programId && phase.moduleId === moduleId && (orgId === undefined || phase.orgId === orgId)).map((phase) => ({ ...phase }))
  }

  async getIssue(issueId: string): Promise<Issue | null> {
    return this.issues.get(issueId) ?? null
  }

  async getIssueByKey(issueKey: string, orgId?: string): Promise<Issue | null> {
    for (const issue of this.issues.values()) if (issue.issueKey === issueKey && (orgId === undefined || issue.orgId === orgId)) return { ...issue }
    return null
  }

  async putIssue(issue: Issue): Promise<void> {
    this.issues.set(issue.issueId, { ...issue })
  }

  async listIssues(filter: { orgId?: string; programId?: string; moduleId?: string; phaseId?: string } = {}): Promise<Issue[]> {
    return [...this.issues.values()].filter((issue) =>
      (filter.orgId === undefined || issue.orgId === filter.orgId) &&
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
    this.gates.set(gate.gateId, { ...gate })
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

  async listExpiredLeaseRuns(nowIso: string): Promise<Run[]> {
    const now = new Date(nowIso).getTime()
    return Array.from(this.runs.values()).filter(
      (r) =>
        (r.state === 'claimed' || r.state === 'executing') &&
        r.lease !== null &&
        new Date(r.lease.expiresAt).getTime() < now,
    )
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

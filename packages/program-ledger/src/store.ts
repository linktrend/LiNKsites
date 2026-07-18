import type { GateResult, IdempotencyRecord, Issue, IssueDependency, LedgerEvent, Run } from './types.js'

/**
 * Storage abstraction. Ledger business logic (ledger.ts) depends only on
 * this interface, never on a specific database — per
 * docs/policies/CONTRACT_AND_SCHEMA_VERSIONING_POLICY.md's "generated
 * types / single source of truth" preference and manual §20's requirement
 * that the Program Ledger be the authoritative state store regardless of
 * which runtime (n8n, CrewAI, Agent Zero, Cursor, ...) executes a Run.
 *
 * `InMemoryLedgerStore` (this file) backs deterministic unit tests.
 * A Postgres-backed implementation lives in ./postgresStore.ts for real
 * persistence, following the same interface.
 */
export interface LedgerStore {
  getIssue(issueId: string): Promise<Issue | null>
  putIssue(issue: Issue): Promise<void>

  getRun(runId: string): Promise<Run | null>
  putRun(run: Run): Promise<void>
  listRunsForIssue(issueId: string): Promise<Run[]>

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
}

export class InMemoryLedgerStore implements LedgerStore {
  private issues = new Map<string, Issue>()
  private runs = new Map<string, Run>()
  private idempotency = new Map<string, IdempotencyRecord>()
  private gates = new Map<string, GateResult>()
  private events: LedgerEvent[] = []
  private dependencies: IssueDependency[] = []

  async getIssue(issueId: string): Promise<Issue | null> {
    return this.issues.get(issueId) ?? null
  }

  async putIssue(issue: Issue): Promise<void> {
    this.issues.set(issue.issueId, { ...issue })
  }

  async getRun(runId: string): Promise<Run | null> {
    return this.runs.get(runId) ?? null
  }

  async putRun(run: Run): Promise<void> {
    this.runs.set(run.runId, { ...run })
  }

  async listRunsForIssue(issueId: string): Promise<Run[]> {
    return Array.from(this.runs.values()).filter((r) => r.issueId === issueId)
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
}

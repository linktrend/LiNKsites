import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { createHash, randomUUID } from 'node:crypto'
import type { DemoCompletionEnvelope, EvidenceReceipt } from '@linksites/types'
import { LINKSITES_PROGRAM, PERSISTED_PROGRAM_GRAPH, W2_02_GRAPH } from './graph.ts'
import type { IssueRecord, LedgerState, Receipt, RunRecord, RuntimeConfig } from './contracts.ts'

const blankState = (orgId: string, lead: { lead_id: string; idempotency_key: string }, now: string): LedgerState => ({
  schemaVersion: 1,
  program: { programId: PERSISTED_PROGRAM_GRAPH.programId, orgId, leadId: lead.lead_id, idempotencyKey: lead.idempotency_key, state: 'running', createdAt: now, updatedAt: now, graph: structuredClone(PERSISTED_PROGRAM_GRAPH) },
  modules: LINKSITES_PROGRAM.modules.map((module) => ({ moduleId: module.moduleId, title: module.title, state: 'running' as const })),
  phases: LINKSITES_PROGRAM.modules.flatMap((module) => module.phases.map((phase) => ({ phaseId: phase.phaseId, moduleId: module.moduleId, title: phase.title, state: 'running' as const }))),
  issues: W2_02_GRAPH.map((issue): IssueRecord => ({ ...issue, state: issue.dependsOn.length === 0 ? 'ready' : 'ready', attempt: 0, nextAttemptAt: null, output: null, gate: 'pending', runIds: [] })),
  runs: [],
  receipts: [],
  events: [{ type: 'program.created', at: now, data: { programId: PERSISTED_PROGRAM_GRAPH.programId, moduleIds: LINKSITES_PROGRAM.modules.map((module) => module.moduleId) } }],
  completion: { state: 'pending', envelope: null },
  outbox: [],
  deadLetters: [],
  manualAttention: [],
  metrics: { attempts: 0, retries: 0, completedIssues: 0, failedIssues: 0, completionEmits: 0 },
})

const clone = <T>(value: T): T => structuredClone(value)

export class DurableLedger {
  private operation: Promise<void> = Promise.resolve()
  private cached: LedgerState | null = null
  private readonly config: RuntimeConfig

  constructor(config: RuntimeConfig) { this.config = config }

  async isAvailable(): Promise<boolean> {
    try {
      await mkdir(dirname(this.config.statePath), { recursive: true })
      return true
    } catch {
      return false
    }
  }

  private async read(): Promise<LedgerState | null> {
    if (this.cached) return clone(this.cached)
    const raw = await readFile(this.config.statePath, 'utf8').catch((error: unknown) => {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') return null
      throw error
    })
    if (!raw) return null
    const parsed = JSON.parse(raw) as LedgerState
    if (parsed.schemaVersion !== 1 || !parsed.program || !Array.isArray(parsed.issues)) throw new Error('ledger state schema is unsupported')
    this.cached = parsed
    return clone(parsed)
  }

  private async write(state: LedgerState): Promise<void> {
    await mkdir(dirname(this.config.statePath), { recursive: true })
    const temp = `${this.config.statePath}.${process.pid}.${randomUUID()}.tmp`
    await writeFile(temp, `${JSON.stringify(state, null, 2)}\n`, 'utf8')
    await rename(temp, this.config.statePath)
    this.cached = clone(state)
  }

  private async mutate<T>(operation: (state: LedgerState | null) => Promise<{ state: LedgerState | null; result: T }> | { state: LedgerState | null; result: T }): Promise<T> {
    let result!: T
    const currentOperation = this.operation.catch(() => undefined).then(async () => {
      const current = await this.read()
      const next = await operation(current)
      if (next.state) await this.write(next.state)
      result = next.result
    })
    this.operation = currentOperation.then(() => undefined, () => undefined)
    await currentOperation
    return result
  }

  async createOrResume(lead: { lead_id: string; idempotency_key: string; org_id: string }): Promise<LedgerState['program']> {
    return this.mutate(async (current) => {
      if (current) {
        if (current.program.leadId !== lead.lead_id || current.program.idempotencyKey !== lead.idempotency_key) throw new Error('existing local ledger belongs to a different lead')
        return { state: current, result: clone(current.program) }
      }
      const state = blankState(lead.org_id, lead, new Date().toISOString())
      return { state, result: clone(state.program) }
    })
  }

  async snapshot(): Promise<LedgerState> {
    const state = await this.read()
    if (!state) throw new Error('program has not been created')
    return state
  }

  async readyIssues(now = new Date().toISOString()): Promise<IssueRecord[]> {
    const state = await this.snapshot()
    const byId = new Map(state.issues.map((issue) => [issue.issueId, issue]))
    return state.issues.filter((issue) => {
      if (issue.state !== 'ready' && !(issue.state === 'retry_scheduled' && (!issue.nextAttemptAt || issue.nextAttemptAt <= now))) return false
      return issue.dependsOn.every((dependency) => byId.get(dependency)?.state === 'completed')
    }).map(clone)
  }

  async claim(issueId: string): Promise<{ issue: IssueRecord; run: RunRecord } | null> {
    return this.mutate(async (current) => {
      if (!current) return { state: null, result: null }
      const issue = current.issues.find((candidate) => candidate.issueId === issueId)
      if (!issue || !['ready', 'retry_scheduled'].includes(issue.state)) return { state: current, result: null }
      if (!issue.dependsOn.every((dependency) => current.issues.find((candidate) => candidate.issueId === dependency)?.state === 'completed')) return { state: current, result: null }
      issue.state = 'running'
      issue.attempt += 1
      issue.nextAttemptAt = null
      const run: RunRecord = { runId: `run:${issue.issueId}:${issue.attempt}:${randomUUID()}`, issueId, attempt: issue.attempt, state: 'running', startedAt: new Date().toISOString(), completedAt: null, output: null, failure: null, evidence: [], lease: null }
      issue.runIds.push(run.runId)
      current.runs.push(run)
      current.metrics.attempts += 1
      current.program.updatedAt = run.startedAt
      current.events.push({ type: 'run.claimed', at: run.startedAt, issueId, runId: run.runId, data: { attempt: issue.attempt } })
      return { state: current, result: { issue: clone(issue), run: clone(run) } }
    })
  }

  async receipt(issueId: string, operation: string): Promise<Receipt | null> {
    const state = await this.snapshot()
    return clone(state.receipts.find((receipt) => receipt.issueId === issueId && receipt.operation === operation) ?? null)
  }

  async saveReceipt(issueId: string, operation: string, value: unknown): Promise<Receipt> {
    return this.mutate(async (current) => {
      if (!current) throw new Error('program has not been created')
      const prior = current.receipts.find((receipt) => receipt.issueId === issueId && receipt.operation === operation)
      if (prior) return { state: current, result: clone(prior) }
      const issue = current.issues.find((candidate) => candidate.issueId === issueId)
      if (!issue) throw new Error(`issue ${issueId} not found`)
      const valueChecksum = createHash('sha256').update(JSON.stringify(value)).digest('hex')
      const receipt: Receipt = { receiptId: `receipt:${issueId}:${randomUUID()}`, issueId, operation, idempotencyKey: `${current.program.programId}:${issueId}`, revision: this.config.executingRevision, valueChecksum, executorKind: issue.executorKind, executorVersion: issue.executorVersion, createdAt: new Date().toISOString(), value: clone(value) }
      current.receipts.push(receipt)
      current.events.push({ type: 'irreversible.receipt', at: receipt.createdAt, issueId, data: { operation, revision: receipt.revision } })
      return { state: current, result: clone(receipt) }
    })
  }

  async succeed(runId: string, output: unknown, evidence: EvidenceReceipt[]): Promise<void> {
    await this.mutate(async (current) => {
      if (!current) throw new Error('program has not been created')
      const run = current.runs.find((candidate) => candidate.runId === runId)
      if (!run) throw new Error(`run ${runId} not found`)
      if (run.state === 'succeeded') return { state: current, result: undefined }
      const issue = current.issues.find((candidate) => candidate.issueId === run.issueId)
      if (!issue) throw new Error(`issue ${run.issueId} not found`)
      run.state = 'succeeded'; run.completedAt = new Date().toISOString(); run.output = clone(output); run.evidence = clone(evidence)
      if (evidence.length === 0) throw new Error('successful run requires evidence')
      issue.output = clone(output); issue.gate = 'accepted'; issue.state = 'completed'
      current.metrics.completedIssues += 1
      for (const phase of current.phases) {
        const phaseIssues = current.issues.filter((candidate) => candidate.phaseId === phase.phaseId)
        if (phaseIssues.every((candidate) => candidate.state === 'completed')) phase.state = 'completed'
      }
      current.events.push({ type: 'gate.accepted', at: run.completedAt, issueId: issue.issueId, runId, data: { evidence: evidence.map((item) => item.receipt_id) } })
      for (const module of current.modules) {
        const moduleIssues = current.issues.filter((candidate) => candidate.moduleId === module.moduleId)
        if (moduleIssues.every((candidate) => candidate.state === 'completed')) module.state = 'completed'
      }
      if (current.issues.every((candidate) => candidate.state === 'completed')) { current.program.state = 'completed'; current.events.push({ type: 'program.completed', at: run.completedAt }) }
      current.program.updatedAt = run.completedAt
      return { state: current, result: undefined }
    })
  }

  async fail(runId: string, failure: { class: import('./contracts.ts').FailureClass; safeCode: string }, retryable: boolean): Promise<'retry' | 'dead_letter' | 'manual_attention'> {
    return this.mutate(async (current) => {
      if (!current) throw new Error('program has not been created')
      const run = current.runs.find((candidate) => candidate.runId === runId)
      if (!run) throw new Error(`run ${runId} not found`)
      const issue = current.issues.find((candidate) => candidate.issueId === run.issueId)
      if (!issue) throw new Error(`issue ${run.issueId} not found`)
      run.failure = failure
      run.completedAt = new Date().toISOString()
      if (retryable && issue.attempt < this.config.maxAttempts) {
        run.state = 'retry_scheduled'; issue.state = 'retry_scheduled'; issue.nextAttemptAt = new Date().toISOString(); current.metrics.retries += 1
        current.events.push({ type: 'issue.retry_scheduled', at: run.completedAt, issueId: issue.issueId, runId, data: { safeCode: failure.safeCode } })
        return { state: current, result: 'retry' as const }
      }
      const manual = failure.class === 'partial_mutation'
      run.state = manual ? 'manual_attention' : 'dead_lettered'; issue.state = manual ? 'manual_attention' : 'failed'; issue.gate = 'rejected'
      current.metrics.failedIssues += 1
      if (manual) current.manualAttention.push({ issueId: issue.issueId, reason: failure.safeCode, at: run.completedAt })
      else current.deadLetters.push({ issueId: issue.issueId, runId, safeCode: failure.safeCode, at: run.completedAt })
      current.program.state = manual ? 'manual_attention' : 'failed'
      for (const phase of current.phases.filter((candidate) => current.issues.some((item) => item.phaseId === candidate.phaseId && (item.state === 'failed' || item.state === 'manual_attention')))) phase.state = manual ? 'manual_attention' : 'failed'
      for (const module of current.modules.filter((candidate) => current.issues.some((item) => item.moduleId === candidate.moduleId && (item.state === 'failed' || item.state === 'manual_attention')))) module.state = manual ? 'manual_attention' : 'failed'
      current.events.push({ type: manual ? 'manual_attention.created' : 'run.dead_lettered', at: run.completedAt, issueId: issue.issueId, runId, data: { safeCode: failure.safeCode } })
      return { state: current, result: manual ? 'manual_attention' as const : 'dead_letter' as const }
    })
  }

  async reserveCompletion(): Promise<DemoCompletionEnvelope | null> {
    return this.mutate(async (current) => {
      if (!current || current.completion.state === 'emitted' || current.program.state !== 'completed') return { state: current, result: null }
      if (current.completion.envelope) return { state: current, result: clone(current.completion.envelope) }
      const now = new Date().toISOString()
      const envelope: DemoCompletionEnvelope = {
        schema_version: { major: 1, minor: 0 }, org_id: current.program.orgId, correlation_id: `program:${current.program.programId}`, idempotency_key: `completion:${current.program.idempotencyKey}`, lead_id: current.program.leadId, site_id: `site:${current.program.leadId}`, private_preview_url: `http://127.0.0.1/private/${current.program.leadId}`, status: 'completed', artifact_revision: this.config.executingRevision, library_revision: this.libraryRevision(current), content_revision: this.contentRevision(current), evidence_references: current.runs.flatMap((run) => run.evidence.map((item) => item.receipt_id)), started_at: current.program.createdAt, completed_at: now,
      }
      current.completion = { state: 'reserved', envelope }
      current.metrics.completionEmits += 1
      current.events.push({ type: 'completion.reserved', at: now })
      return { state: current, result: clone(envelope) }
    })
  }

  async markCompletionEmitted(): Promise<void> {
    await this.mutate(async (current) => {
      if (!current) throw new Error('program has not been created')
      current.completion.state = 'emitted'
      current.events.push({ type: 'completion.emitted', at: new Date().toISOString() })
      return { state: current, result: undefined }
    })
  }

  private libraryRevision(state: LedgerState): string {
    const output = state.issues.find((issue) => issue.issueId === 'library-verification')?.output
    const revision = output && typeof output === 'object' && 'revision' in output ? (output as { revision?: unknown }).revision : null
    return typeof revision === 'string' && /^[a-f0-9]{40}$/.test(revision) ? revision : this.config.executingRevision
  }

  private contentRevision(state: LedgerState): string {
    const output = state.issues.find((issue) => issue.issueId === 'working-content-assembly')?.output
    const checksum = output && typeof output === 'object' && 'checksum' in output ? (output as { checksum?: unknown }).checksum : null
    return typeof checksum === 'string' && /^[a-f0-9]{64}$/.test(checksum) ? checksum : createHash('sha256').update(JSON.stringify(state.receipts)).digest('hex')
  }
}

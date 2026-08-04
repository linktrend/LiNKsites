import assert from 'node:assert/strict'
import test from 'node:test'
import {
  manualFirstTestLead,
  validDemoCompletion,
  validEvidenceReceipt,
} from '../../../packages/types/fixtures/w1-01-contract-fixtures.ts'
import type {
  BackoffPolicy,
  ClaimedIssue,
  CompletionReservation,
  ExecutorRegistry,
  GateEvaluation,
  HealthReporter,
  IssueExecutor,
  ProgramLedgerPort,
  ProgramRun,
  ProgramStatus,
  ReadyIssue,
  RunFailure,
  WorkIntakePort,
  PulledWorkItem,
  IntakeAcknowledgement,
  IntakeClaim,
  ExecutorResult,
} from '../src/contracts.ts'
import {
  ExponentialBackoffPolicy,
  IntakeOrchestrator,
  type OrchestratorDependencies,
} from '../src/index.ts'
import type { DemoCompletionEnvelope, EvidenceReceipt, LeadResearchPackage } from '@linksites/types'

class TestClock {
  private milliseconds = Date.parse('2026-08-04T00:00:00.000Z')

  now(): string {
    return new Date(this.milliseconds).toISOString()
  }

  advance(milliseconds: number): void {
    this.milliseconds += milliseconds
  }

  async sleep(milliseconds: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, milliseconds))
  }
}

class TestIds {
  private sequence = 0

  next(namespace: string): string {
    this.sequence += 1
    return `${namespace}:${this.sequence}`
  }
}

class TestBackoff implements BackoffPolicy {
  readonly calls: Array<{ attempt: number; failureClass: RunFailure['failureClass'] }> = []

  delayMs(attempt: number, failureClass: RunFailure['failureClass']): number {
    this.calls.push({ attempt, failureClass })
    return 7
  }
}

class TestHealth implements HealthReporter {
  readonly snapshots: Array<{ readiness: boolean; activeExecutions: number; stalledWork: number }> = []

  report(snapshot: { readiness: boolean; activeExecutions: number; stalledWork: number }): void {
    this.snapshots.push(snapshot)
  }
}

class TestIntake implements WorkIntakePort {
  readonly items: Array<{ itemId: string; envelope: unknown }> = []
  readonly claims: IntakeClaim[] = []
  readonly acknowledgements: Array<{ itemId: string; acknowledgement: IntakeAcknowledgement }> = []
  private readonly states = new Map<string, string>()

  add(itemId: string, envelope: unknown): void {
    this.items.push({ itemId, envelope })
  }

  async pullReady(limit: number): Promise<readonly PulledWorkItem[]> {
    return this.items
      .filter((item) => !this.states.has(item.itemId))
      .slice(0, limit)
  }

  async claim(itemId: string, leadId: string, idempotencyKey: string): Promise<IntakeClaim | null> {
    if (this.states.has(itemId)) return null
    const claim = { itemId, claimId: `claim:${leadId}:${idempotencyKey}` }
    this.states.set(itemId, 'claimed')
    this.claims.push(claim)
    return claim
  }

  async acknowledge(itemId: string, acknowledgement: IntakeAcknowledgement): Promise<void> {
    this.states.set(itemId, acknowledgement.state)
    this.acknowledgements.push({ itemId, acknowledgement })
  }
}

type FakeIssue = {
  issueId: string
  issueKind: string
  executorVersion: string
  dependencies: string[]
  status: 'ready' | 'claimed' | 'complete' | 'failed'
  attempt: number
  retryAt: string | null
  expired: boolean
  runId: string | null
  evidence: EvidenceReceipt[]
  outcome: 'success' | 'failure' | null
}

type FakeProgram = {
  run: ProgramRun
  issues: FakeIssue[]
  completionReserved: CompletionReservation | null
  completionEmitted: boolean
}

class TestLedger implements ProgramLedgerPort {
  private readonly graph: (lead: LeadResearchPackage) => Array<Omit<FakeIssue, 'status' | 'attempt' | 'retryAt' | 'expired' | 'runId' | 'evidence' | 'outcome'>>
  readonly programs = new Map<string, FakeProgram>()
  readonly createdLeadIds: string[] = []
  readonly claimedIssues: string[] = []
  readonly gateResults: GateEvaluation[] = []
  readonly retrySchedules: Array<{ runId: string; nextAttemptAt: string }> = []
  private readonly forcedGates: Array<'accepted' | 'rejected'> = []
  private available = true
  private now = () => '2026-08-04T00:00:00.000Z'

  constructor(graph: (lead: LeadResearchPackage) => Array<Omit<FakeIssue, 'status' | 'attempt' | 'retryAt' | 'expired' | 'runId' | 'evidence' | 'outcome'>>) {
    this.graph = graph
  }

  setNow(now: () => string): void {
    this.now = now
  }

  setAvailable(available: boolean): void {
    this.available = available
  }

  rejectNextGate(): void {
    this.forcedGates.push('rejected')
  }

  expireFirstClaim(): void {
    const issue = [...this.programs.values()][0]?.issues[0]
    if (issue) issue.expired = true
  }

  async isAvailable(): Promise<boolean> {
    return this.available
  }

  async createOrResumeProgram(lead: LeadResearchPackage): Promise<ProgramRun> {
    const existing = this.programs.get(lead.lead_id)
    if (existing) return existing.run
    const run: ProgramRun = {
      programRunId: `program:${lead.lead_id}`,
      leadId: lead.lead_id,
      orgId: lead.org_id,
    }
    this.programs.set(lead.lead_id, {
      run,
      issues: this.graph(lead).map((issue) => ({
        ...issue,
        status: 'ready',
        attempt: 0,
        retryAt: null,
        expired: false,
        runId: null,
        evidence: [],
        outcome: null,
      })),
      completionReserved: null,
      completionEmitted: false,
    })
    this.createdLeadIds.push(lead.lead_id)
    return run
  }

  async listActivePrograms(): Promise<readonly ProgramRun[]> {
    return [...this.programs.values()].map((program) => program.run)
  }

  async reclaimExpiredWork(): Promise<void> {
    for (const program of this.programs.values()) {
      for (const issue of program.issues) {
        if (issue.expired) {
          issue.status = 'ready'
          issue.expired = false
        }
      }
    }
  }

  async listDependencyReadyIssues(programRunId: string): Promise<readonly ReadyIssue[]> {
    const program = [...this.programs.values()].find((candidate) => candidate.run.programRunId === programRunId)
    if (!program) return []
    return program.issues
      .filter((issue) =>
        issue.status === 'ready' &&
        (!issue.retryAt || issue.retryAt <= this.now()) &&
        issue.dependencies.every((dependencyId) =>
          program.issues.some((dependency) => dependency.issueId === dependencyId && dependency.status === 'complete'),
        ),
      )
      .map(({ issueId, issueKind, executorVersion }) => ({ issueId, issueKind, executorVersion }))
  }

  async claimIssue(programRunId: string, issueId: string, _workerId: string, _nowIso: string): Promise<ClaimedIssue | null> {
    const program = [...this.programs.values()].find((candidate) => candidate.run.programRunId === programRunId)
    const issue = program?.issues.find((candidate) => candidate.issueId === issueId)
    if (!program || !issue || issue.status !== 'ready') return null
    issue.status = 'claimed'
    issue.attempt += 1
    issue.runId = `run:${issue.issueId}:${issue.attempt}`
    this.claimedIssues.push(issue.issueId)
    return {
      issueId: issue.issueId,
      issueKind: issue.issueKind,
      executorVersion: issue.executorVersion,
      programRunId,
      runId: issue.runId,
      attemptNumber: issue.attempt,
      input: { issue_id: issue.issueId },
      claimId: `ledger-claim:${issue.runId}`,
    }
  }

  private issueForRun(runId: string): FakeIssue {
    for (const program of this.programs.values()) {
      const issue = program.issues.find((candidate) => candidate.runId === runId)
      if (issue) return issue
    }
    throw new Error(`missing run ${runId}`)
  }

  async appendRunEvidence(runId: string, evidence: readonly EvidenceReceipt[]): Promise<void> {
    this.issueForRun(runId).evidence.push(...evidence)
  }

  async appendRunOutcome(runId: string, outcome: { kind: 'success'; output: unknown } | { kind: 'failure'; failure: RunFailure }): Promise<void> {
    this.issueForRun(runId).outcome = outcome.kind
  }

  async evaluateGate(runId: string): Promise<GateEvaluation> {
    const decision = this.forcedGates.shift() ?? 'accepted'
    const issue = this.issueForRun(runId)
    return {
      decision,
      evidenceReferences: issue.evidence.map((receipt) => receipt.storage_location),
      retryable: decision === 'rejected',
      safeCode: decision === 'rejected' ? 'gate:quality-rejected' : undefined,
      diagnosticReference: decision === 'rejected' ? 'evidence://gate/rejected' : undefined,
    }
  }

  async appendGateResult(_runId: string, evaluation: GateEvaluation): Promise<void> {
    this.gateResults.push(evaluation)
    if (evaluation.decision !== 'accepted') return
    const issue = this.issueForRun(_runId)
    issue.status = 'complete'
  }

  async scheduleRetry(runId: string, failure: RunFailure, nextAttemptAt: string): Promise<{ nextAttemptAt: string; deadLettered: boolean }> {
    const issue = this.issueForRun(runId)
    this.retrySchedules.push({ runId, nextAttemptAt })
    if (issue.attempt >= 2) {
      issue.status = 'failed'
      return { nextAttemptAt, deadLettered: true }
    }
    issue.status = 'ready'
    issue.retryAt = nextAttemptAt
    void failure
    return { nextAttemptAt, deadLettered: false }
  }

  async recordTerminalFailure(runId: string, _failure: RunFailure): Promise<void> {
    this.issueForRun(runId).status = 'failed'
  }

  async getProgramStatus(programRunId: string): Promise<ProgramStatus> {
    const program = [...this.programs.values()].find((candidate) => candidate.run.programRunId === programRunId)
    if (!program) throw new Error(`missing program ${programRunId}`)
    if (program.issues.some((issue) => issue.status === 'failed')) {
      return { gate: 'failed', stalledWork: 0 }
    }
    if (program.issues.every((issue) => issue.status === 'complete')) {
      return { gate: 'passed', stalledWork: 0 }
    }
    return {
      gate: 'pending',
      stalledWork: program.issues.filter((issue) => issue.status === 'ready' || issue.status === 'claimed').length,
    }
  }

  async reserveCompletion(programRunId: string, kind: 'completed' | 'failed'): Promise<CompletionReservation | null> {
    const program = [...this.programs.values()].find((candidate) => candidate.run.programRunId === programRunId)
    if (!program || program.completionEmitted || program.completionReserved) return null
    const reservation = { reservationId: `completion:${programRunId}:${kind}`, programRunId, kind }
    program.completionReserved = reservation
    return reservation
  }

  async buildCompletion(reservation: CompletionReservation): Promise<DemoCompletionEnvelope> {
    if (reservation.kind === 'completed') return validDemoCompletion
    return {
      ...validDemoCompletion,
      status: 'failed',
      evidence_references: ['evidence://failure/diagnostic'],
      error: {
        code: 'program:failed',
        message: 'Program stopped safely; inspect the referenced diagnostic evidence.',
        retryable: false,
      },
    }
  }

  async markCompletionEmitted(reservation: CompletionReservation): Promise<void> {
    const program = [...this.programs.values()].find((candidate) => candidate.run.programRunId === reservation.programRunId)
    if (program) {
      program.completionEmitted = true
      program.completionReserved = null
    }
  }

  async releaseCompletionReservation(reservation: CompletionReservation): Promise<void> {
    const program = [...this.programs.values()].find((candidate) => candidate.run.programRunId === reservation.programRunId)
    if (program?.completionReserved?.reservationId === reservation.reservationId) program.completionReserved = null
  }
}

class TestExecutors implements ExecutorRegistry {
  private readonly adapters = new Map<string, IssueExecutor>()

  register(executor: IssueExecutor): void {
    this.adapters.set(`${executor.issueKind}:${executor.version}`, executor)
  }

  resolve(issueKind: string, version: string): IssueExecutor | null {
    return this.adapters.get(`${issueKind}:${version}`) ?? null
  }
}

class TestSink {
  readonly envelopes: DemoCompletionEnvelope[] = []

  async write(envelope: DemoCompletionEnvelope): Promise<void> {
    this.envelopes.push(envelope)
  }
}

const receipt = (issueId: string): EvidenceReceipt => ({
  ...validEvidenceReceipt,
  receipt_id: `receipt:${issueId}`,
  subject: { type: 'issue', id: issueId },
  storage_location: `evidence://issue/${issueId}`,
})

const issue = (issueId: string, dependencies: string[] = []) => ({
  issueId,
  issueKind: 'test.issue',
  executorVersion: '1.0',
  dependencies,
})

const makeDependencies = (options: Partial<OrchestratorDependencies> = {}) => {
  const clock = new TestClock()
  const intake = new TestIntake()
  const ledger = new TestLedger(() => [issue('issue-1')])
  ledger.setNow(() => clock.now())
  const executors = new TestExecutors()
  const sink = new TestSink()
  const health = new TestHealth()
  const ids = new TestIds()
  const backoff = new TestBackoff()
  const dependencies: OrchestratorDependencies = {
    intake,
    ledger,
    executors,
    completionSink: sink,
    clock,
    ids,
    backoff,
    health,
    options: { pollIntervalMs: 1, shutdownTimeoutMs: 100, executionTimeoutMs: 1_000 },
    ...options,
  }
  return { dependencies, clock, intake, ledger, executors, sink, health, backoff }
}

const successExecutor = (active?: { current: number; maximum: number; wait?: Promise<void>; release?: () => void }) => ({
  executorId: 'test-executor',
  issueKind: 'test.issue',
  version: '1.0',
  async execute(claimed: ClaimedIssue): Promise<{ kind: 'success'; output: unknown; evidence: readonly EvidenceReceipt[] }> {
    if (active) {
      active.current += 1
      active.maximum = Math.max(active.maximum, active.current)
      if (active.current === 2) active.release?.()
      if (active.wait) await active.wait
      active.current -= 1
    }
    return { kind: 'success', output: { issue_id: claimed.issueId }, evidence: [receipt(claimed.issueId)] }
  },
}) satisfies IssueExecutor

const addLead = (intake: TestIntake): void => intake.add('item-1', manualFirstTestLead)

test('invalid input is rejected before source claim', async () => {
  const setup = makeDependencies()
  setup.intake.add('invalid', { ...manualFirstTestLead, org_id: '' })
  const orchestrator = new IntakeOrchestrator(setup.dependencies)
  const result = await orchestrator.runCycle()
  assert.equal(result.invalid, 1)
  assert.equal(setup.intake.claims.length, 0)
  assert.equal(setup.intake.acknowledgements[0]?.acknowledgement.state, 'rejected')
})

test('no work is a normal idle result and unavailable durable state is not ready', async () => {
  const setup = makeDependencies()
  const orchestrator = new IntakeOrchestrator(setup.dependencies)
  assert.equal((await orchestrator.runCycle()).idle, true)
  setup.ledger.setAvailable(false)
  assert.equal((await orchestrator.runCycle()).idle, true)
  assert.equal(orchestrator.getHealth().readiness, false)
})

test('duplicate pull/restart creates one idempotent Program', async () => {
  const setup = makeDependencies()
  addLead(setup.intake)
  setup.executors.register(successExecutor())
  const orchestrator = new IntakeOrchestrator(setup.dependencies)
  await orchestrator.runCycle()
  await orchestrator.runCycle()
  assert.deepEqual(setup.ledger.createdLeadIds, [manualFirstTestLead.lead_id])
})

test('two ready independent Issues run in parallel within the configured ceiling', async () => {
  const setup = makeDependencies({ options: { concurrency: 2, pollIntervalMs: 1 } })
  let release!: () => void
  const wait = new Promise<void>((resolve) => { release = resolve })
  const active = { current: 0, maximum: 0, wait, release }
  const ledger = new TestLedger(() => [issue('issue-1'), issue('issue-2')])
  ledger.setNow(() => setup.clock.now())
  setup.dependencies = { ...setup.dependencies, ledger }
  addLead(setup.intake)
  setup.executors.register(successExecutor(active))
  const orchestrator = new IntakeOrchestrator(setup.dependencies)
  const result = await orchestrator.runCycle()
  assert.equal(result.claimedIssues, 2)
  assert.equal(active.maximum, 2)
})

test('dependency-blocked Issue is never claimed until its Gate is accepted', async () => {
  const setup = makeDependencies()
  const ledger = new TestLedger(() => [issue('issue-1'), issue('issue-2', ['issue-1'])])
  ledger.setNow(() => setup.clock.now())
  setup.dependencies = { ...setup.dependencies, ledger }
  addLead(setup.intake)
  setup.executors.register(successExecutor())
  const orchestrator = new IntakeOrchestrator(setup.dependencies)
  await orchestrator.runCycle()
  assert.deepEqual(ledger.claimedIssues, ['issue-1'])
  await orchestrator.runCycle()
  assert.deepEqual(ledger.claimedIssues, ['issue-1', 'issue-2'])
})

test('retryable failure uses injected backoff and succeeds without unbounded looping', async () => {
  const setup = makeDependencies()
  addLead(setup.intake)
  let attempts = 0
  setup.executors.register({
    executorId: 'retry-executor',
    issueKind: 'test.issue',
    version: '1.0',
    async execute(claimed): Promise<ExecutorResult> {
      attempts += 1
      if (attempts === 1) {
        return {
          kind: 'failure',
          failure: { failureClass: 'retryable_dependency_service', retryable: true, safeCode: 'service:temporary', diagnosticReference: 'evidence://service/temporary' },
          evidence: [],
        }
      }
      return { kind: 'success', output: {}, evidence: [receipt(claimed.issueId)] }
    },
  })
  const orchestrator = new IntakeOrchestrator(setup.dependencies)
  await orchestrator.runCycle()
  assert.equal(setup.backoff.calls.length, 1)
  assert.equal(setup.sink.envelopes.length, 0)
  setup.clock.advance(7)
  await orchestrator.runCycle()
  assert.equal(attempts, 2)
  assert.equal(setup.sink.envelopes.length, 1)
})

test('terminal failure becomes a safe failure completion and does not loop forever', async () => {
  const setup = makeDependencies()
  addLead(setup.intake)
  let attempts = 0
  setup.executors.register({
    executorId: 'business-executor',
    issueKind: 'test.issue',
    version: '1.0',
    async execute(): Promise<ExecutorResult> {
      attempts += 1
      return {
        kind: 'failure',
        failure: { failureClass: 'terminal_business', retryable: false, safeCode: 'business:terminal', diagnosticReference: 'evidence://business/terminal' },
        evidence: [],
      }
    },
  })
  const orchestrator = new IntakeOrchestrator(setup.dependencies)
  await orchestrator.runCycle()
  await orchestrator.runCycle()
  assert.equal(attempts, 1)
  assert.equal(setup.sink.envelopes.length, 1)
  assert.equal(setup.sink.envelopes[0]?.status, 'failed')
})

test('shutdown stops new claims and lets bounded in-flight work settle', async () => {
  const setup = makeDependencies({ options: { pollIntervalMs: 1, shutdownTimeoutMs: 200 } })
  addLead(setup.intake)
  let started = false
  setup.executors.register({
    executorId: 'blocking-executor',
    issueKind: 'test.issue',
    version: '1.0',
    async execute(_issue, signal): Promise<ExecutorResult> {
      started = true
      await new Promise<void>((resolve, reject) => {
        signal.addEventListener('abort', () => reject(new Error('aborted')), { once: true })
      })
      return { kind: 'success', output: {}, evidence: [receipt('issue-1')] }
    },
  })
  const orchestrator = new IntakeOrchestrator(setup.dependencies)
  const running = orchestrator.start()
  for (let attempts = 0; !started && attempts < 50; attempts += 1) await new Promise((resolve) => setTimeout(resolve, 1))
  await orchestrator.stop()
  await running
  assert.equal(setup.intake.claims.length, 1)
  assert.equal(orchestrator.getHealth().liveness, false)
})

test('restart reclaims an expired Issue and resumes it through the same Program', async () => {
  const setup = makeDependencies()
  const ledger = new TestLedger(() => [issue('issue-1')])
  ledger.setNow(() => setup.clock.now())
  setup.dependencies = { ...setup.dependencies, ledger }
  await ledger.createOrResumeProgram(manualFirstTestLead)
  const firstReady = await ledger.listDependencyReadyIssues('program:lead_demo_example')
  await ledger.claimIssue('program:lead_demo_example', firstReady[0]!.issueId, 'crashed-worker', setup.clock.now())
  ledger.expireFirstClaim()
  setup.executors.register(successExecutor())
  const orchestrator = new IntakeOrchestrator(setup.dependencies)
  await orchestrator.runCycle()
  assert.deepEqual(ledger.claimedIssues, ['issue-1', 'issue-1'])
  assert.equal(setup.sink.envelopes.length, 1)
})

test('completion is emitted once and only after Program PASS', async () => {
  const setup = makeDependencies()
  addLead(setup.intake)
  setup.ledger.rejectNextGate()
  setup.executors.register(successExecutor())
  const orchestrator = new IntakeOrchestrator(setup.dependencies)
  await orchestrator.runCycle()
  assert.equal(setup.sink.envelopes.length, 0)
  setup.clock.advance(7)
  await orchestrator.runCycle()
  await orchestrator.runCycle()
  assert.equal(setup.sink.envelopes.length, 1)
  assert.equal(setup.sink.envelopes[0]?.status, 'completed')
  assert.equal(setup.sink.envelopes[0]?.error, undefined)
})

test('executor errors do not leak supplied secret values into health or completion output', async () => {
  const setup = makeDependencies()
  addLead(setup.intake)
  setup.executors.register({
    executorId: 'secret-error-executor',
    issueKind: 'test.issue',
    version: '1.0',
    async execute(): Promise<ExecutorResult> {
      return {
        kind: 'failure',
        failure: {
          failureClass: 'terminal_business',
          retryable: false,
          safeCode: 'secret=supplied-secret-value',
          diagnosticReference: 'Bearer supplied-secret-value',
        },
        evidence: [],
      }
    },
  })
  const orchestrator = new IntakeOrchestrator(setup.dependencies)
  await orchestrator.runCycle()
  const serialized = JSON.stringify({ health: setup.health.snapshots, completion: setup.sink.envelopes })
  assert.equal(serialized.includes('supplied-secret-value'), false)
  assert.equal(serialized.includes('Bearer'), false)
})

test('backoff policy is bounded and deterministic when jitter is injected', () => {
  const policy = new ExponentialBackoffPolicy(100, 250, 0.2, () => 0.5)
  assert.equal(policy.delayMs(1, 'executor'), 100)
  assert.equal(policy.delayMs(2, 'executor'), 200)
  assert.equal(policy.delayMs(3, 'executor'), 250)
})

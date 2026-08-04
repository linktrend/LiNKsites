import { randomUUID } from 'node:crypto'
import {
  isDemoCompletionEnvelope,
  isEvidenceReceipt,
  isLeadResearchPackage,
} from '../../../packages/types/src/runtime-contracts.ts'
import type {
  BackoffPolicy,
  ClaimedIssue,
  Clock,
  CompletionKind,
  CompletionSink,
  CycleResult,
  ExecutorRegistry,
  HealthReporter,
  HealthSnapshot,
  IdGenerator,
  IssueExecutor,
  ProgramLedgerPort,
  ProgramRun,
  RunFailure,
  WorkIntakePort,
  OrchestratorOptions,
} from './contracts.ts'

const DEFAULT_OPTIONS: OrchestratorOptions = {
  pollIntervalMs: 1_000,
  batchSize: 10,
  concurrency: 4,
  shutdownTimeoutMs: 5_000,
  executionTimeoutMs: 60_000,
}

const SAFE_REFERENCE = /^(?:[A-Za-z0-9]+)(?:[._:/-][A-Za-z0-9]+)*$/

const isSafeReference = (value: string): boolean =>
  value.length <= 128 && SAFE_REFERENCE.test(value)

const safeFailure = (
  idGenerator: IdGenerator,
  failureClass: RunFailure['failureClass'],
  safeCode: string,
  retryable: boolean,
  diagnosticReference?: string,
): RunFailure => ({
  failureClass,
  retryable,
  safeCode: isSafeReference(safeCode) ? safeCode : 'orchestrator:unsafe-failure-code',
  diagnosticReference:
    diagnosticReference && isSafeReference(diagnosticReference)
      ? diagnosticReference
      : idGenerator.next('diagnostic'),
})

export class ExponentialBackoffPolicy implements BackoffPolicy {
  private readonly baseMs: number
  private readonly maxMs: number
  private readonly jitterRatio: number
  private readonly random: () => number

  constructor(
    baseMs = 100,
    maxMs = 30_000,
    jitterRatio = 0.2,
    random: () => number = Math.random,
  ) {
    this.baseMs = baseMs
    this.maxMs = maxMs
    this.jitterRatio = jitterRatio
    this.random = random
  }

  delayMs(attemptNumber: number, _failureClass: RunFailure['failureClass']): number {
    const exponential = Math.min(
      this.maxMs,
      this.baseMs * 2 ** Math.max(0, attemptNumber - 1),
    )
    const jitter = 1 + (this.random() * 2 - 1) * this.jitterRatio
    return Math.max(0, Math.min(this.maxMs, Math.round(exponential * jitter)))
  }
}

export class SystemClock implements Clock {
  now(): string {
    return new Date().toISOString()
  }

  sleep(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
  }
}

export class RandomIdGenerator implements IdGenerator {
  next(namespace: string): string {
    return `${namespace}:${randomUUID()}`
  }
}

export interface OrchestratorDependencies {
  readonly intake: WorkIntakePort
  readonly ledger: ProgramLedgerPort
  readonly executors: ExecutorRegistry
  readonly completionSink: CompletionSink
  readonly clock: Clock
  readonly ids: IdGenerator
  readonly backoff: BackoffPolicy
  readonly health: HealthReporter
  readonly options?: Partial<OrchestratorOptions>
}

/**
 * Continuous W1-03 runtime. All durable ownership and state transitions are
 * delegated to ports; this class only coordinates pull, validation, dispatch,
 * evidence, gates, retry, and completion decisions.
 */
export class IntakeOrchestrator {
  private readonly dependencies: OrchestratorDependencies
  private readonly options: OrchestratorOptions
  private readonly activeExecutions = new Map<string, AbortController>()
  private stopRequested = false
  private loopPromise: Promise<void> | null = null
  private wakeLoop: (() => void) | null = null
  private lastPollAt: string | null = null
  private lastFailureClass: RunFailure['failureClass'] | null = null
  private readiness = false
  private liveness = false
  private stalledWork = 0

  constructor(dependencies: OrchestratorDependencies) {
    this.dependencies = dependencies
    this.options = { ...DEFAULT_OPTIONS, ...dependencies.options }
    if (this.options.batchSize < 1 || this.options.concurrency < 1) {
      throw new Error('batchSize and concurrency must be positive')
    }
  }

  getHealth(): HealthSnapshot {
    return {
      liveness: this.liveness,
      readiness: this.readiness,
      activeExecutions: this.activeExecutions.size,
      stalledWork: this.stalledWork,
      lastPollAt: this.lastPollAt,
      lastFailureClass: this.lastFailureClass,
    }
  }

  async runCycle(): Promise<CycleResult> {
    if (this.stopRequested) {
      return { pulled: 0, invalid: 0, claimedIntake: 0, claimedIssues: 0, executedIssues: 0, idle: true }
    }

    this.lastPollAt = this.dependencies.clock.now()
    this.readiness = await this.dependencies.ledger.isAvailable()
    if (!this.readiness) {
      this.stalledWork = 0
      await this.reportHealth()
      return { pulled: 0, invalid: 0, claimedIntake: 0, claimedIssues: 0, executedIssues: 0, idle: true }
    }

    await this.dependencies.ledger.reclaimExpiredWork(this.dependencies.clock.now())
    const pulled = await this.dependencies.intake.pullReady(this.options.batchSize)
    let invalid = 0
    let claimedIntake = 0

    for (const item of pulled) {
      if (this.stopRequested) break
      if (!isLeadResearchPackage(item.envelope)) {
        invalid += 1
        await this.dependencies.intake.acknowledge(item.itemId, {
          state: 'rejected',
          reasonCode: 'validation:invalid-lead-research-package',
        })
        continue
      }

      const claim = await this.dependencies.intake.claim(
        item.itemId,
        item.envelope.lead_id,
        item.envelope.idempotency_key,
      )
      if (!claim) continue
      claimedIntake += 1

      try {
        await this.dependencies.ledger.createOrResumeProgram(item.envelope)
        await this.dependencies.intake.acknowledge(item.itemId, { state: 'program_started' })
      } catch {
        this.lastFailureClass = 'unknown'
        await this.dependencies.intake.acknowledge(item.itemId, {
          state: 'program_failed',
          reasonCode: 'orchestrator:program-creation-failed',
        })
      }
    }

    const programs = await this.dependencies.ledger.listActivePrograms()
    let claimedIssues = 0
    let executedIssues = 0
    for (const program of programs) {
      if (this.stopRequested) break
      const result = await this.scheduleReadyIssues(program)
      claimedIssues += result.claimedIssues
      executedIssues += result.executedIssues
      await this.maybeEmitCompletion(program)
    }

    this.stalledWork = (await Promise.all(
      programs.map(async (program) => (await this.dependencies.ledger.getProgramStatus(program.programRunId)).stalledWork),
    )).reduce((total, stalled) => total + stalled, 0)
    await this.reportHealth()

    return {
      pulled: pulled.length,
      invalid,
      claimedIntake,
      claimedIssues,
      executedIssues,
      idle: pulled.length === 0 && claimedIssues === 0 && executedIssues === 0,
    }
  }

  start(): Promise<void> {
    if (this.loopPromise) return this.loopPromise
    this.stopRequested = false
    this.liveness = true
    this.loopPromise = this.loop().finally(() => {
      this.liveness = false
      this.readiness = false
      this.loopPromise = null
      void this.reportHealth()
    })
    return this.loopPromise
  }

  async stop(): Promise<void> {
    this.stopRequested = true
    this.wakeLoop?.()
    for (const controller of this.activeExecutions.values()) controller.abort()
    const loop = this.loopPromise
    if (!loop) {
      this.liveness = false
      await this.reportHealth()
      return
    }
    await Promise.race([loop, this.dependencies.clock.sleep(this.options.shutdownTimeoutMs)])
  }

  private async loop(): Promise<void> {
    while (!this.stopRequested) {
      try {
        await this.runCycle()
      } catch {
        this.lastFailureClass = 'unknown'
        await this.reportHealth()
      }
      if (this.stopRequested) break
      await new Promise<void>((resolve) => {
        this.wakeLoop = resolve
        const timeout = setTimeout(resolve, this.options.pollIntervalMs)
        if (this.stopRequested) {
          clearTimeout(timeout)
          resolve()
        }
      })
      this.wakeLoop = null
    }
  }

  private async scheduleReadyIssues(program: ProgramRun): Promise<CycleResult> {
    const capacity = this.options.concurrency - this.activeExecutions.size
    if (capacity <= 0) {
      return { pulled: 0, invalid: 0, claimedIntake: 0, claimedIssues: 0, executedIssues: 0, idle: true }
    }

    const readyIssues = await this.dependencies.ledger.listDependencyReadyIssues(program.programRunId)
    const candidates = readyIssues.slice(0, capacity)
    const claimed: ClaimedIssue[] = []
    for (const issue of candidates) {
      if (this.stopRequested || this.activeExecutions.size >= this.options.concurrency) break
      const claim = await this.dependencies.ledger.claimIssue(
        program.programRunId,
        issue.issueId,
        this.dependencies.ids.next('worker'),
        this.dependencies.clock.now(),
      )
      if (claim) claimed.push(claim)
    }

    await Promise.all(claimed.map((issue) => this.executeClaimedIssue(issue)))
    return {
      pulled: 0,
      invalid: 0,
      claimedIntake: 0,
      claimedIssues: claimed.length,
      executedIssues: claimed.length,
      idle: claimed.length === 0,
    }
  }

  private async executeClaimedIssue(issue: ClaimedIssue): Promise<void> {
    const executor = this.dependencies.executors.resolve(issue.issueKind, issue.executorVersion)
    if (!executor) {
      await this.handleFailure(
        issue,
        {
          kind: 'failure',
          failure: safeFailure(this.dependencies.ids, 'executor', 'executor:not-registered', false),
          evidence: [],
        },
      )
      return
    }

    const controller = new AbortController()
    this.activeExecutions.set(issue.runId, controller)
    try {
      const result = await this.executeWithTimeout(executor, issue, controller)
      if (result.kind === 'failure') {
        await this.handleFailure(issue, result)
        return
      }

      if (result.evidence.length === 0 || result.evidence.some((receipt) => !isEvidenceReceipt(receipt))) {
        await this.handleFailure(issue, {
          kind: 'failure',
          failure: safeFailure(this.dependencies.ids, 'validation', 'validation:missing-or-invalid-evidence', false),
          evidence: [],
        })
        return
      }

      await this.dependencies.ledger.appendRunEvidence(issue.runId, result.evidence)
      await this.dependencies.ledger.appendRunOutcome(issue.runId, { kind: 'success', output: result.output })
      const gate = await this.dependencies.ledger.evaluateGate(issue.runId)
      await this.dependencies.ledger.appendGateResult(issue.runId, gate)
      if (gate.decision === 'rejected') {
        await this.handleFailure(issue, {
          kind: 'failure',
          failure: safeFailure(
            this.dependencies.ids,
            'gate',
            gate.safeCode ?? 'gate:rejected',
            gate.retryable,
            gate.diagnosticReference,
          ),
          evidence: result.evidence,
        })
      }
    } catch (error) {
      const aborted = controller.signal.aborted
      await this.handleFailure(issue, {
        kind: 'failure',
        failure: safeFailure(
          this.dependencies.ids,
          aborted ? 'retryable_dependency_service' : 'unknown',
          aborted ? 'executor:aborted' : 'executor:unexpected-failure',
          true,
        ),
        evidence: [],
      })
      this.lastFailureClass = aborted ? 'retryable_dependency_service' : 'unknown'
      void error
    } finally {
      this.activeExecutions.delete(issue.runId)
    }
  }

  private async executeWithTimeout(
    executor: IssueExecutor,
    issue: ClaimedIssue,
    controller: AbortController,
  ) {
    let timeout: ReturnType<typeof setTimeout> | undefined
    const timedOut = new Promise<never>((_, reject) => {
      timeout = setTimeout(() => {
        controller.abort()
        reject(new Error('execution timeout'))
      }, this.options.executionTimeoutMs)
    })
    try {
      return await Promise.race([executor.execute(issue, controller.signal), timedOut])
    } finally {
      if (timeout) clearTimeout(timeout)
    }
  }

  private async handleFailure(issue: ClaimedIssue, result: Extract<import('./contracts.ts').ExecutorResult, { kind: 'failure' }>): Promise<void> {
    const failure = safeFailure(
      this.dependencies.ids,
      result.failure.failureClass,
      result.failure.safeCode,
      result.failure.retryable,
      result.failure.diagnosticReference,
    )
    this.lastFailureClass = failure.failureClass
    if (result.evidence.length > 0 && result.evidence.every((receipt) => isEvidenceReceipt(receipt))) {
      await this.dependencies.ledger.appendRunEvidence(issue.runId, result.evidence)
    }
    await this.dependencies.ledger.appendRunOutcome(issue.runId, { kind: 'failure', failure })

    if (failure.retryable) {
      const delay = this.dependencies.backoff.delayMs(issue.attemptNumber, failure.failureClass)
      const nextAttemptAt = new Date(
        new Date(this.dependencies.clock.now()).getTime() + delay,
      ).toISOString()
      const retry = await this.dependencies.ledger.scheduleRetry(
        issue.runId,
        failure,
        nextAttemptAt,
      )
      if (retry.deadLettered) {
        await this.emitFailureCompletion(issue.programRunId)
      }
      return
    }

    await this.dependencies.ledger.recordTerminalFailure(issue.runId, failure)
    await this.emitFailureCompletion(issue.programRunId)
  }

  private async maybeEmitCompletion(program: ProgramRun): Promise<void> {
    const status = await this.dependencies.ledger.getProgramStatus(program.programRunId)
    if (status.gate !== 'passed') return
    await this.emitCompletion(program.programRunId, 'completed')
  }

  private async emitFailureCompletion(programRunId: string): Promise<void> {
    const status = await this.dependencies.ledger.getProgramStatus(programRunId)
    if (status.gate !== 'failed') return
    await this.emitCompletion(programRunId, 'failed')
  }

  private async emitCompletion(programRunId: string, kind: CompletionKind): Promise<void> {
    const reservation = await this.dependencies.ledger.reserveCompletion(programRunId, kind)
    if (!reservation) return
    try {
      const envelope = await this.dependencies.ledger.buildCompletion(reservation)
      if (!isDemoCompletionEnvelope(envelope)) {
        await this.dependencies.ledger.releaseCompletionReservation(reservation)
        this.lastFailureClass = 'validation'
        return
      }
      await this.dependencies.completionSink.write(envelope)
      await this.dependencies.ledger.markCompletionEmitted(reservation)
    } catch {
      await this.dependencies.ledger.releaseCompletionReservation(reservation)
      this.lastFailureClass = 'unknown'
    }
  }

  private async reportHealth(): Promise<void> {
    await this.dependencies.health.report(this.getHealth())
  }
}

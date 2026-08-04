import type {
  DemoCompletionEnvelope,
  EvidenceReceipt,
  LeadResearchPackage,
} from '@linksites/types'

export type IntakeEnvelope = unknown

export interface PulledWorkItem {
  readonly itemId: string
  readonly envelope: IntakeEnvelope
  /** Durable source-attempt number, used to bound Program-creation retries. */
  readonly attemptNumber?: number
}

export type IntakeAcknowledgementState =
  | 'rejected'
  | 'program_started'
  | 'program_retry_scheduled'
  | 'program_manual_attention'

export interface IntakeAcknowledgement {
  readonly state: IntakeAcknowledgementState
  readonly reasonCode?: string
  readonly nextAttemptAt?: string
  readonly attemptNumber?: number
}

export interface IntakeClaim {
  readonly itemId: string
  readonly claimId: string
}

/**
 * The intake adapter is deliberately smaller than a CRM client. It returns
 * canonical envelopes and owns only the source's pull/claim acknowledgement.
 */
export interface WorkIntakePort {
  pullReady(limit: number, nowIso: string): Promise<readonly PulledWorkItem[]>
  claim(
    itemId: string,
    leadId: LeadResearchPackage['lead_id'],
    idempotencyKey: LeadResearchPackage['idempotency_key'],
    nowIso: string,
  ): Promise<IntakeClaim | null>
  acknowledge(itemId: string, acknowledgement: IntakeAcknowledgement): Promise<void>
}

export interface ProgramRun {
  readonly programRunId: string
  readonly leadId: LeadResearchPackage['lead_id']
  readonly orgId: LeadResearchPackage['org_id']
}

export interface ReadyIssue {
  readonly issueId: string
  readonly issueKind: string
  readonly executorVersion: string
}

export interface ClaimedIssue extends ReadyIssue {
  readonly programRunId: string
  readonly runId: string
  readonly attemptNumber: number
  readonly input: unknown
  readonly claimId: string
}

export type RunFailureClass =
  | 'validation'
  | 'retryable_dependency_service'
  | 'executor'
  | 'gate'
  | 'terminal_business'
  | 'unknown'

export interface RunFailure {
  readonly failureClass: RunFailureClass
  readonly retryable: boolean
  /** Never include raw exception text or supplied payload values here. */
  readonly safeCode: string
  readonly diagnosticReference: string
}

export interface SuccessfulExecution {
  readonly kind: 'success'
  readonly output: unknown
  readonly evidence: readonly EvidenceReceipt[]
}

export interface FailedExecution {
  readonly kind: 'failure'
  readonly failure: RunFailure
  readonly evidence: readonly EvidenceReceipt[]
}

export type ExecutorResult = SuccessfulExecution | FailedExecution

export interface IssueExecutor {
  readonly executorId: string
  readonly issueKind: string
  readonly version: string
  execute(issue: ClaimedIssue, signal: AbortSignal): Promise<ExecutorResult>
}

export interface ExecutorRegistry {
  resolve(issueKind: string, version: string): IssueExecutor | null
}

export interface GateEvaluation {
  readonly decision: 'accepted' | 'rejected'
  readonly evidenceReferences: readonly string[]
  readonly retryable: boolean
  readonly safeCode?: string
  readonly diagnosticReference?: string
}

export interface RetrySchedule {
  readonly nextAttemptAt: string
  readonly deadLettered: boolean
}

export interface ProgramStatus {
  readonly gate: 'pending' | 'passed' | 'failed'
  readonly terminalFailure?: RunFailure
  readonly stalledWork: number
}

export type CompletionKind = 'completed' | 'failed'

/**
 * Reservations are durable delivery ownership. Once a sink write starts, the
 * orchestrator retains the reservation until markCompletionEmitted succeeds;
 * this prevents a restart from replaying an ambiguous non-idempotent write.
 */
export interface CompletionReservation {
  readonly reservationId: string
  readonly programRunId: string
  readonly kind: CompletionKind
}

/**
 * This is the only durable-state boundary the runtime uses. Implementations
 * may be backed by the Program Ledger store; the orchestrator never assumes
 * that a process-local lock is authoritative.
 */
export interface ProgramLedgerPort {
  isAvailable(): Promise<boolean>
  createOrResumeProgram(envelope: LeadResearchPackage): Promise<ProgramRun>
  listActivePrograms(): Promise<readonly ProgramRun[]>
  reclaimExpiredWork(nowIso: string): Promise<void>
  listDependencyReadyIssues(programRunId: string): Promise<readonly ReadyIssue[]>
  claimIssue(
    programRunId: string,
    issueId: string,
    workerId: string,
    nowIso: string,
  ): Promise<ClaimedIssue | null>
  appendRunEvidence(runId: string, evidence: readonly EvidenceReceipt[]): Promise<void>
  /** Must be durable and idempotent before an accepted Gate may unlock dependents. */
  appendRunOutcome(
    runId: string,
    outcome: { readonly kind: 'success'; readonly output: unknown } | { readonly kind: 'failure'; readonly failure: RunFailure },
  ): Promise<void>
  evaluateGate(runId: string): Promise<GateEvaluation>
  /** Accepted results must fail closed unless a durable successful outcome exists. */
  appendGateResult(runId: string, evaluation: GateEvaluation): Promise<void>
  scheduleRetry(runId: string, failure: RunFailure, nextAttemptAt: string): Promise<RetrySchedule>
  recordTerminalFailure(runId: string, failure: RunFailure): Promise<void>
  getProgramStatus(programRunId: string): Promise<ProgramStatus>
  reserveCompletion(programRunId: string, kind: CompletionKind): Promise<CompletionReservation | null>
  buildCompletion(
    reservation: CompletionReservation,
  ): Promise<DemoCompletionEnvelope>
  markCompletionEmitted(reservation: CompletionReservation): Promise<void>
  releaseCompletionReservation(reservation: CompletionReservation): Promise<void>
}

export interface CompletionSink {
  /** The call may be non-idempotent; the durable ledger reservation is the replay guard. */
  write(envelope: DemoCompletionEnvelope): Promise<void>
}

export interface Clock {
  now(): string
  sleep(milliseconds: number): Promise<void>
  setTimeout(callback: () => void, milliseconds: number): CancellableTimer
}

/** Timer ownership is injected so polling and execution deadlines are testable. */
export interface CancellableTimer {
  cancel(): void
}

export interface IdGenerator {
  next(namespace: string): string
}

export interface BackoffPolicy {
  delayMs(attemptNumber: number, failureClass: RunFailureClass): number
}

export interface HealthSnapshot {
  readonly liveness: boolean
  readonly readiness: boolean
  readonly activeExecutions: number
  readonly stalledWork: number
  readonly lastPollAt: string | null
  readonly lastFailureClass: RunFailureClass | null
}

export interface HealthReporter {
  report(snapshot: HealthSnapshot): void | Promise<void>
}

export interface OrchestratorOptions {
  readonly pollIntervalMs: number
  readonly batchSize: number
  readonly concurrency: number
  readonly shutdownTimeoutMs: number
  readonly executionTimeoutMs: number
  readonly programCreationMaxAttempts: number
}

export interface CycleResult {
  readonly pulled: number
  readonly invalid: number
  readonly claimedIntake: number
  readonly claimedIssues: number
  readonly executedIssues: number
  readonly idle: boolean
}

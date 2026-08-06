import type { DemoCompletionEnvelope, EvidenceReceipt, LeadResearchPackage } from '@linksites/types'
import type { CompletionSink, WorkIntakePort } from '@linksites/intake-orchestrator'
import type { ProgramDefinition } from '@linksites/program-ledger'

export type IssueState = 'ready' | 'running' | 'retry_scheduled' | 'completed' | 'failed' | 'manual_attention'
export type RunState = 'running' | 'succeeded' | 'retry_scheduled' | 'dead_lettered' | 'manual_attention'
export type ModuleState = 'excluded' | 'running' | 'completed' | 'failed' | 'manual_attention'
export type FailureClass = 'invalid_input' | 'transient_boundary' | 'gate_rejected' | 'partial_mutation' | 'configuration' | 'unknown'

export type IssueDefinition = {
  issueId: string
  moduleId: string
  phaseId: string
  title: string
  objective: string
  issueType: string
  executorKind: string
  executorVersion: string
  capabilities: string[]
  dependsOn: string[]
  externalBoundary?: string
  irreversible?: boolean
}

export type IssueRecord = IssueDefinition & {
  state: IssueState
  attempt: number
  nextAttemptAt: string | null
  output: unknown | null
  gate: 'pending' | 'accepted' | 'rejected'
  runIds: string[]
}

export type RunRecord = {
  runId: string
  issueId: string
  attempt: number
  state: RunState
  startedAt: string
  completedAt: string | null
  output: unknown | null
  failure: { class: FailureClass; safeCode: string } | null
  evidence: EvidenceReceipt[]
  lease: { owner: string; expiresAt: string; fencingToken: number } | null
}

export type Receipt = {
  receiptId: string
  issueId: string
  operation: string
  idempotencyKey: string
  revision: string
  valueChecksum: string
  executorKind: string
  executorVersion: string
  createdAt: string
  value: unknown
}

export type LedgerState = {
  schemaVersion: 1
  program: {
    programId: string
    orgId: string
    leadId: string
    idempotencyKey: string
    state: 'running' | 'completed' | 'failed' | 'manual_attention'
    createdAt: string
    updatedAt: string
    graph: ProgramDefinition
  }
  modules: Array<{ moduleId: string; title: string; state: ModuleState; scheduled: boolean }>
  phases: Array<{ phaseId: string; moduleId: string; title: string; state: ModuleState; scheduled: boolean }>
  issues: IssueRecord[]
  runs: RunRecord[]
  receipts: Receipt[]
  events: Array<{ type: string; at: string; issueId?: string; runId?: string; data?: Record<string, unknown> }>
  completion: { state: 'pending' | 'reserved' | 'emitted'; envelope: DemoCompletionEnvelope | null }
  outbox: Array<{
    eventId: string
    idempotencyKey: string
    eventName: string
    payload: Record<string, unknown>
    status: 'pending' | 'delivered' | 'dead_lettered'
    attempts: number
    nextAttemptAt: string | null
    lastAttemptAt: string | null
    lastError: string | null
    deadLetteredAt: string | null
    ackAt: string | null
  }>
  deadLetters: Array<{ issueId: string; runId: string; safeCode: string; at: string }>
  manualAttention: Array<{ issueId: string; reason: string; at: string }>
  metrics: { attempts: number; retries: number; completedIssues: number; failedIssues: number; completionEmits: number; outboxAttempts: number; outboxBacklog: number; outboxFailures: number; outboxDeadLetters: number; outboxAcks: number }
}

export type LeadInput = LeadResearchPackage

export type AdapterFault = { operation: string; remaining: number; kind: 'transient' | 'permanent' | 'crash_after_receipt' }

export interface LocalBoundaryAdapters {
  validateLead(lead: LeadInput): Promise<{ valid: boolean; reason?: string }>
  qualify(lead: LeadInput): Promise<{ vertical: string; tier: 'standard' }>
  reserveFoundation(siteId: string, vertical: string): Promise<Record<string, unknown>>
  resolveLibrary(siteId: string): Promise<Record<string, unknown>>
  buildSiteSpecification(siteId: string, dependencies: Record<string, unknown>): Promise<Record<string, unknown>>
  produceInformationArchitecture(siteId: string, lead: LeadInput): Promise<Record<string, unknown>>
  processMedia(siteId: string, lead: LeadInput): Promise<Record<string, unknown>>
  assembleWorkingContent(siteId: string, dependencies: Record<string, unknown>): Promise<Record<string, unknown>>
  runGates(siteId: string, workingContent: Record<string, unknown>): Promise<{ accepted: boolean; evidence: string[]; reason?: string; artifactPath?: string; artifactChecksum?: string }>
  promoteDraft(siteId: string, workingContent: Record<string, unknown>): Promise<Record<string, unknown>>
  readbackDraft(siteId: string, promotion: Record<string, unknown>): Promise<Record<string, unknown>>
  createPrivatePreview(siteId: string, promotion: Record<string, unknown>): Promise<Record<string, unknown>>
  renderPrivatePreview(siteId: string, preview: Record<string, unknown>): Promise<Record<string, unknown>>
  captureEvidence(siteId: string, render: Record<string, unknown>): Promise<Record<string, unknown>>
  emitCompletion(envelope: DemoCompletionEnvelope): Promise<void>
  compensate(issueId: string, reason: string): Promise<'compensated' | 'manual_attention'>
  /** Reachability is a real request, never configuration-presence shorthand. */
  health(): Promise<{ cms: boolean; frontend: boolean; eventBoundary: boolean }>
}

export type RuntimeConfig = {
  mode: 'local'
  orgId: string
  statePath: string
  intakePath: string
  completionPath: string
  approvedFactsPath: string
  maxAttempts: number
  concurrency: number
  leaseDurationMs: number
  executingRevision: string
  executableCheckpoint: string
  workerId: string
  payloadBaseUrl: string
  payloadApiKey: string
  payloadSiteId: string
  webMasterBaseUrl: string
  previewAccessToken: string
  /** Read-only local clone/cache used to read the immutable LiNKlibraries pin. */
  libraryRepositoryPath: string
  approvedExecutors: Record<string, string>
  approvedCapabilities: Record<string, string[]>
}

export type SharedPorts = {
  intake: WorkIntakePort
  completionSink: CompletionSink
}

import type { DemoCompletionEnvelope, EvidenceReceipt, LeadResearchPackage } from '@linksites/types'

export type IssueState = 'ready' | 'running' | 'retry_scheduled' | 'completed' | 'failed' | 'manual_attention'
export type RunState = 'running' | 'succeeded' | 'retry_scheduled' | 'dead_lettered' | 'manual_attention'
export type FailureClass = 'invalid_input' | 'transient_boundary' | 'gate_rejected' | 'partial_mutation' | 'configuration' | 'unknown'

export type IssueDefinition = {
  issueId: string
  moduleId: string
  phaseId: string
  title: string
  executorKind: string
  executorVersion: string
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
}

export type Receipt = {
  receiptId: string
  issueId: string
  operation: string
  idempotencyKey: string
  revision: string
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
  }
  modules: Array<{ moduleId: string; title: string; state: 'running' | 'completed' | 'failed' | 'manual_attention' }>
  phases: Array<{ phaseId: string; moduleId: string; title: string; state: 'running' | 'completed' | 'failed' | 'manual_attention' }>
  issues: IssueRecord[]
  runs: RunRecord[]
  receipts: Receipt[]
  events: Array<{ type: string; at: string; issueId?: string; runId?: string; data?: Record<string, unknown> }>
  completion: { state: 'pending' | 'reserved' | 'emitted'; envelope: DemoCompletionEnvelope | null }
  outbox: Array<{ eventId: string; idempotencyKey: string; eventName: string; payload: Record<string, unknown>; delivered: boolean }>
  deadLetters: Array<{ issueId: string; runId: string; safeCode: string; at: string }>
  manualAttention: Array<{ issueId: string; reason: string; at: string }>
  metrics: { attempts: number; retries: number; completedIssues: number; failedIssues: number; completionEmits: number }
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
  runGates(siteId: string, workingContent: Record<string, unknown>): Promise<{ accepted: boolean; evidence: string[]; reason?: string }>
  promoteDraft(siteId: string, workingContent: Record<string, unknown>): Promise<Record<string, unknown>>
  readbackDraft(siteId: string, promotion: Record<string, unknown>): Promise<Record<string, unknown>>
  createPrivatePreview(siteId: string, promotion: Record<string, unknown>): Promise<Record<string, unknown>>
  renderPrivatePreview(siteId: string, preview: Record<string, unknown>): Promise<Record<string, unknown>>
  captureEvidence(siteId: string, render: Record<string, unknown>): Promise<Record<string, unknown>>
  emitCompletion(envelope: DemoCompletionEnvelope): Promise<void>
  compensate(issueId: string, reason: string): Promise<'compensated' | 'manual_attention'>
  health(): { cms: boolean; frontend: boolean; eventBoundary: boolean }
}

export type RuntimeConfig = {
  mode: 'local'
  orgId: string
  statePath: string
  intakePath: string
  completionPath: string
  maxAttempts: number
  concurrency: number
  approvedExecutors: Record<string, string>
}

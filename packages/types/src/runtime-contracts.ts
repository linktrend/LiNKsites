import type { SchemaVersion } from './index'

export const CANONICAL_CONTRACT_VERSION = {
  major: 1,
  minor: 0,
} as const satisfies SchemaVersion

export type ContractSchemaVersion = typeof CANONICAL_CONTRACT_VERSION

export type ContractMetadata = {
  schema_version: ContractSchemaVersion
  org_id: string
  correlation_id: string
  idempotency_key: string
}

export type LeadResearchPackage = ContractMetadata & {
  lead_id: string
  research: {
    summary: string
    sources: string[]
  }
  requested_vertical: string
  source: string
}

export type CompletionStatus = 'completed' | 'blocked' | 'failed'

export type SafeErrorState = {
  code: string
  message: string
  retryable: boolean
}

export type DemoCompletionEnvelope = ContractMetadata & {
  lead_id: string
  site_id: string
  private_preview_url: string
  status: CompletionStatus
  artifact_revision: string
  library_revision: string
  content_revision: string
  evidence_references: string[]
  started_at: string
  completed_at: string
  error?: SafeErrorState
}

export type CommercialOutcome = 'sold' | 'no_sale' | 'deferred' | 'abandoned'

export type CommercialOutcomeEnvelope = ContractMetadata & {
  lead_id: string
  site_id: string
  outcome: CommercialOutcome
  reach_authorization_reference: string
  replay_protection: {
    event_id: string
    nonce: string
  }
  recorded_at: string
}

export type ActivationRequest = ContractMetadata & {
  lead_id: string
  site_id: string
  reach_authorization_reference: string
  publication: {
    domain: string
    environment: 'production'
    requested_at: string
  }
}

export type RecyclingRequest = ContractMetadata & {
  lead_id: string
  site_id: string
  template_inventory_id: string
  reason: 'no_sale'
  requested_at: string
}

export type LiNKautoworkEventName =
  | 'lead.research.ready'
  | 'demo.completed'
  | 'commercial.outcome.recorded'
  | 'activation.requested'
  | 'recycling.requested'

export type EventAcknowledgement = {
  status: 'pending' | 'accepted' | 'rejected'
  acknowledged_at?: string
  reason?: string
}

export type LiNKautoworkEventEnvelope = ContractMetadata & {
  event_id: string
  event_name: LiNKautoworkEventName
  payload: Record<string, unknown>
  signature: {
    algorithm: 'hmac-sha256'
    key_id: string
    signature: string
  }
  delivery_attempt: number
  acknowledgement: EventAcknowledgement
}

export type EvidenceReceipt = ContractMetadata & {
  receipt_id: string
  producer: string
  subject: {
    type: 'lead' | 'site' | 'run' | 'issue'
    id: string
  }
  checksum: {
    algorithm: 'sha256'
    value: string
  }
  revision_sha: string
  storage_location: string
  gate_association: string
  timestamp: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(isNonEmptyString)

const isIsoTimestamp = (value: unknown): value is string =>
  isNonEmptyString(value) && !Number.isNaN(Date.parse(value))

const isSchemaVersion = (value: unknown): value is ContractSchemaVersion =>
  isRecord(value) &&
  value.major === CANONICAL_CONTRACT_VERSION.major &&
  value.minor === CANONICAL_CONTRACT_VERSION.minor

const containsForbiddenSecretKey = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(containsForbiddenSecretKey)
  if (!isRecord(value)) return false

  return Object.entries(value).some(([key, nestedValue]) =>
    /(password|secret|credential|token|api[_-]?key|private[_-]?key|card[_-]?number|cvv)/i.test(
      key,
    ) || containsForbiddenSecretKey(nestedValue),
  )
}

const isMetadata = (
  value: unknown,
): value is ContractMetadata & Record<string, unknown> =>
  isRecord(value) &&
  isSchemaVersion(value.schema_version) &&
  isNonEmptyString(value.org_id) &&
  isNonEmptyString(value.correlation_id) &&
  isNonEmptyString(value.idempotency_key) &&
  !containsForbiddenSecretKey(value)

const isSafeErrorState = (value: unknown): value is SafeErrorState =>
  isRecord(value) &&
  isNonEmptyString(value.code) &&
  isNonEmptyString(value.message) &&
  typeof value.retryable === 'boolean'

export const isLeadResearchPackage = (
  value: unknown,
): value is LeadResearchPackage =>
  isMetadata(value) &&
  isNonEmptyString(value.lead_id) &&
  isRecord(value.research) &&
  isNonEmptyString(value.research.summary) &&
  isStringArray(value.research.sources) &&
  isNonEmptyString(value.requested_vertical) &&
  isNonEmptyString(value.source)

export const isDemoCompletionEnvelope = (
  value: unknown,
): value is DemoCompletionEnvelope => {
  if (
    !isMetadata(value) ||
    !isNonEmptyString(value.lead_id) ||
    !isNonEmptyString(value.site_id) ||
    !isNonEmptyString(value.private_preview_url) ||
    !/^https?:\/\//.test(value.private_preview_url) ||
    !['completed', 'blocked', 'failed'].includes(value.status as string) ||
    !isNonEmptyString(value.artifact_revision) ||
    !isNonEmptyString(value.library_revision) ||
    !isNonEmptyString(value.content_revision) ||
    !isStringArray(value.evidence_references) ||
    !isIsoTimestamp(value.started_at) ||
    !isIsoTimestamp(value.completed_at)
  ) {
    return false
  }

  if (value.status === 'completed' && value.evidence_references.length === 0) {
    return false
  }

  if (value.status === 'completed' && value.error !== undefined) return false
  if (value.status !== 'completed' && !isSafeErrorState(value.error)) return false
  return value.error === undefined || isSafeErrorState(value.error)
}

export const isCommercialOutcomeEnvelope = (
  value: unknown,
): value is CommercialOutcomeEnvelope =>
  isMetadata(value) &&
  isNonEmptyString(value.lead_id) &&
  isNonEmptyString(value.site_id) &&
  ['sold', 'no_sale', 'deferred', 'abandoned'].includes(value.outcome as string) &&
  isNonEmptyString(value.reach_authorization_reference) &&
  isRecord(value.replay_protection) &&
  isNonEmptyString(value.replay_protection.event_id) &&
  isNonEmptyString(value.replay_protection.nonce) &&
  isIsoTimestamp(value.recorded_at)

const containsPaymentProcessingKey = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(containsPaymentProcessingKey)
  if (!isRecord(value)) return false

  return Object.entries(value).some(([key, nestedValue]) =>
    /(payment|stripe|charge|invoice|billing|card)/i.test(key) ||
    containsPaymentProcessingKey(nestedValue),
  )
}

export const isActivationRequest = (value: unknown): value is ActivationRequest =>
  isMetadata(value) &&
  !containsPaymentProcessingKey(value) &&
  isNonEmptyString(value.lead_id) &&
  isNonEmptyString(value.site_id) &&
  isNonEmptyString(value.reach_authorization_reference) &&
  isRecord(value.publication) &&
  isNonEmptyString(value.publication.domain) &&
  value.publication.environment === 'production' &&
  isIsoTimestamp(value.publication.requested_at)

export const isRecyclingRequest = (value: unknown): value is RecyclingRequest =>
  isMetadata(value) &&
  isNonEmptyString(value.lead_id) &&
  isNonEmptyString(value.site_id) &&
  isNonEmptyString(value.template_inventory_id) &&
  value.reason === 'no_sale' &&
  isIsoTimestamp(value.requested_at)

export const isLiNKautoworkEventEnvelope = (
  value: unknown,
): value is LiNKautoworkEventEnvelope =>
  isMetadata(value) &&
  isNonEmptyString(value.event_id) &&
  [
    'lead.research.ready',
    'demo.completed',
    'commercial.outcome.recorded',
    'activation.requested',
    'recycling.requested',
  ].includes(value.event_name as string) &&
  isRecord(value.payload) &&
  isRecord(value.signature) &&
  value.signature.algorithm === 'hmac-sha256' &&
  isNonEmptyString(value.signature.key_id) &&
  isNonEmptyString(value.signature.signature) &&
  Number.isInteger(value.delivery_attempt) &&
  value.delivery_attempt > 0 &&
  isEventAcknowledgement(value.acknowledgement)

const isEventAcknowledgement = (
  value: unknown,
): value is EventAcknowledgement =>
  isRecord(value) &&
  ['pending', 'accepted', 'rejected'].includes(value.status as string) &&
  (value.acknowledged_at === undefined || isIsoTimestamp(value.acknowledged_at)) &&
  (value.reason === undefined || isNonEmptyString(value.reason))

export const isEvidenceReceipt = (value: unknown): value is EvidenceReceipt =>
  isMetadata(value) &&
  isNonEmptyString(value.receipt_id) &&
  isNonEmptyString(value.producer) &&
  isRecord(value.subject) &&
  ['lead', 'site', 'run', 'issue'].includes(value.subject.type as string) &&
  isNonEmptyString(value.subject.id) &&
  isRecord(value.checksum) &&
  value.checksum.algorithm === 'sha256' &&
  isNonEmptyString(value.checksum.value) &&
  /^[a-f0-9]{64}$/i.test(value.checksum.value) &&
  isNonEmptyString(value.revision_sha) &&
  isNonEmptyString(value.storage_location) &&
  isNonEmptyString(value.gate_association) &&
  isIsoTimestamp(value.timestamp)

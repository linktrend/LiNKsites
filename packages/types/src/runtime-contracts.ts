import type { SchemaVersion } from './index'

export const CANONICAL_CONTRACT_VERSION = {
  major: 1,
  minor: 0,
} as const satisfies SchemaVersion

export type ContractSchemaVersion = typeof CANONICAL_CONTRACT_VERSION

export type GitSha = string

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
  artifact_revision: GitSha
  library_revision: GitSha
  content_revision: GitSha
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

export type LiNKautoworkEventPayload = {
  lead_id: string
  site_id: string
}

export type EventAcknowledgement = {
  status: 'pending' | 'accepted' | 'rejected'
  acknowledged_at?: string
  reason?: string
}

export type LiNKautoworkEventEnvelope = ContractMetadata & {
  event_id: string
  event_name: LiNKautoworkEventName
  payload: LiNKautoworkEventPayload
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
  revision_sha: GitSha
  storage_location: string
  gate_association: string
  timestamp: string
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  !/^Bearer\s+\S+/i.test(value)

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  Object.keys(value).length === value.length &&
  value.every(isNonEmptyString)

const isIsoTimestamp = (value: unknown): value is string =>
  isNonEmptyString(value) && !Number.isNaN(Date.parse(value))

const isSchemaVersion = (value: unknown): value is ContractSchemaVersion =>
  isRecord(value) &&
  hasExactKeys(value, ['major', 'minor']) &&
  value.major === CANONICAL_CONTRACT_VERSION.major &&
  value.minor === CANONICAL_CONTRACT_VERSION.minor

const hasRequiredKeys = (value: unknown, requiredKeys: readonly string[]): boolean =>
  isRecord(value) &&
  requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(value, key))

const hasExactKeys = (
  value: unknown,
  requiredKeys: readonly string[],
  optionalKeys: readonly string[] = [],
): boolean => {
  if (!isRecord(value)) return false

  const allowedKeys = new Set([...requiredKeys, ...optionalKeys])
  return (
    requiredKeys.every((key) => Object.prototype.hasOwnProperty.call(value, key)) &&
    Object.keys(value).every((key) => allowedKeys.has(key))
  )
}

const isGitSha = (value: unknown): value is GitSha =>
  typeof value === 'string' && /^[a-f0-9]{40}$/.test(value)

const METADATA_KEYS = ['schema_version', 'org_id', 'correlation_id', 'idempotency_key'] as const

const isMetadata = (
  value: unknown,
): value is ContractMetadata & Record<string, unknown> =>
  isRecord(value) &&
  hasRequiredKeys(value, METADATA_KEYS) &&
  isSchemaVersion(value.schema_version) &&
  isNonEmptyString(value.org_id) &&
  isNonEmptyString(value.correlation_id) &&
  isNonEmptyString(value.idempotency_key)

const isSafeErrorState = (value: unknown): value is SafeErrorState =>
  isRecord(value) &&
  hasExactKeys(value, ['code', 'message', 'retryable']) &&
  isNonEmptyString(value.code) &&
  isNonEmptyString(value.message) &&
  typeof value.retryable === 'boolean'

const isCompletionStatus = (value: unknown): value is CompletionStatus =>
  value === 'completed' || value === 'blocked' || value === 'failed'

const isCommercialOutcome = (value: unknown): value is CommercialOutcome =>
  value === 'sold' ||
  value === 'no_sale' ||
  value === 'deferred' ||
  value === 'abandoned'

const isEventAcknowledgement = (
  value: unknown,
): value is EventAcknowledgement =>
  isRecord(value) &&
  hasExactKeys(value, ['status'], ['acknowledged_at', 'reason']) &&
  (value.status === 'pending' ||
    value.status === 'accepted' ||
    value.status === 'rejected') &&
  (value.acknowledged_at === undefined || isIsoTimestamp(value.acknowledged_at)) &&
  (value.reason === undefined || isNonEmptyString(value.reason))

const isEventPayload = (
  value: unknown,
): value is LiNKautoworkEventPayload =>
  isRecord(value) &&
  hasExactKeys(value, ['lead_id', 'site_id']) &&
  isNonEmptyString(value.lead_id) &&
  isNonEmptyString(value.site_id)

const isEventName = (value: unknown): value is LiNKautoworkEventName =>
  value === 'lead.research.ready' ||
  value === 'demo.completed' ||
  value === 'commercial.outcome.recorded' ||
  value === 'activation.requested' ||
  value === 'recycling.requested'

export const isLeadResearchPackage = (
  value: unknown,
): value is LeadResearchPackage =>
  isMetadata(value) &&
  hasExactKeys(value, [...METADATA_KEYS, 'lead_id', 'research', 'requested_vertical', 'source']) &&
  isNonEmptyString(value.lead_id) &&
  isRecord(value.research) &&
  hasExactKeys(value.research, ['summary', 'sources']) &&
  isNonEmptyString(value.research.summary) &&
  isStringArray(value.research.sources) &&
  isNonEmptyString(value.requested_vertical) &&
  isNonEmptyString(value.source)

export const isDemoCompletionEnvelope = (
  value: unknown,
): value is DemoCompletionEnvelope => {
  if (
    !isMetadata(value) ||
    !hasExactKeys(
      value,
      [
        ...METADATA_KEYS,
        'lead_id',
        'site_id',
        'private_preview_url',
        'status',
        'artifact_revision',
        'library_revision',
        'content_revision',
        'evidence_references',
        'started_at',
        'completed_at',
      ],
      ['error'],
    ) ||
    !isNonEmptyString(value.lead_id) ||
    !isNonEmptyString(value.site_id) ||
    !isNonEmptyString(value.private_preview_url) ||
    !/^https?:\/\//.test(value.private_preview_url) ||
    !isCompletionStatus(value.status) ||
    !isGitSha(value.artifact_revision) ||
    !isGitSha(value.library_revision) ||
    !isGitSha(value.content_revision) ||
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
  hasExactKeys(
    value,
    [...METADATA_KEYS, 'lead_id', 'site_id', 'outcome', 'reach_authorization_reference', 'replay_protection', 'recorded_at'],
  ) &&
  isNonEmptyString(value.lead_id) &&
  isNonEmptyString(value.site_id) &&
  isCommercialOutcome(value.outcome) &&
  isNonEmptyString(value.reach_authorization_reference) &&
  isRecord(value.replay_protection) &&
  hasExactKeys(value.replay_protection, ['event_id', 'nonce']) &&
  isNonEmptyString(value.replay_protection.event_id) &&
  isNonEmptyString(value.replay_protection.nonce) &&
  isIsoTimestamp(value.recorded_at)

export const isActivationRequest = (value: unknown): value is ActivationRequest =>
  isMetadata(value) &&
  hasExactKeys(
    value,
    [...METADATA_KEYS, 'lead_id', 'site_id', 'reach_authorization_reference', 'publication'],
  ) &&
  isNonEmptyString(value.lead_id) &&
  isNonEmptyString(value.site_id) &&
  isNonEmptyString(value.reach_authorization_reference) &&
  isRecord(value.publication) &&
  hasExactKeys(value.publication, ['domain', 'environment', 'requested_at']) &&
  isNonEmptyString(value.publication.domain) &&
  value.publication.environment === 'production' &&
  isIsoTimestamp(value.publication.requested_at)

export const isRecyclingRequest = (value: unknown): value is RecyclingRequest =>
  isMetadata(value) &&
  hasExactKeys(value, [...METADATA_KEYS, 'lead_id', 'site_id', 'template_inventory_id', 'reason', 'requested_at']) &&
  isNonEmptyString(value.lead_id) &&
  isNonEmptyString(value.site_id) &&
  isNonEmptyString(value.template_inventory_id) &&
  value.reason === 'no_sale' &&
  isIsoTimestamp(value.requested_at)

export const isLiNKautoworkEventEnvelope = (
  value: unknown,
): value is LiNKautoworkEventEnvelope =>
  isMetadata(value) &&
  hasExactKeys(
    value,
    [...METADATA_KEYS, 'event_id', 'event_name', 'payload', 'signature', 'delivery_attempt', 'acknowledgement'],
  ) &&
  isNonEmptyString(value.event_id) &&
  isEventName(value.event_name) &&
  isEventPayload(value.payload) &&
  isRecord(value.signature) &&
  hasExactKeys(value.signature, ['algorithm', 'key_id', 'signature']) &&
  value.signature.algorithm === 'hmac-sha256' &&
  isNonEmptyString(value.signature.key_id) &&
  isNonEmptyString(value.signature.signature) &&
  typeof value.delivery_attempt === 'number' &&
  Number.isInteger(value.delivery_attempt) &&
  value.delivery_attempt > 0 &&
  isEventAcknowledgement(value.acknowledgement)

export const isEvidenceReceipt = (value: unknown): value is EvidenceReceipt =>
  isMetadata(value) &&
  hasExactKeys(
    value,
    [...METADATA_KEYS, 'receipt_id', 'producer', 'subject', 'checksum', 'revision_sha', 'storage_location', 'gate_association', 'timestamp'],
  ) &&
  isNonEmptyString(value.receipt_id) &&
  isNonEmptyString(value.producer) &&
  isRecord(value.subject) &&
  hasExactKeys(value.subject, ['type', 'id']) &&
  (value.subject.type === 'lead' ||
    value.subject.type === 'site' ||
    value.subject.type === 'run' ||
    value.subject.type === 'issue') &&
  isNonEmptyString(value.subject.id) &&
  isRecord(value.checksum) &&
  hasExactKeys(value.checksum, ['algorithm', 'value']) &&
  value.checksum.algorithm === 'sha256' &&
  isNonEmptyString(value.checksum.value) &&
  /^[a-f0-9]{64}$/.test(value.checksum.value) &&
  isGitSha(value.revision_sha) &&
  isNonEmptyString(value.storage_location) &&
  isNonEmptyString(value.gate_association) &&
  isIsoTimestamp(value.timestamp)

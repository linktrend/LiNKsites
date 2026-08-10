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
    domain?: string
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
  | 'contact.submitted'
  | 'lead.research.ready'
  | 'demo.completed'
  | 'commercial.outcome.recorded'
  | 'activation.requested'
  | 'recycling.requested'

export type LiNKautoworkEventPayload = {
  lead_id: string
  site_id: string
  submission?: Record<string, string | number | boolean>
  /**
   * Present only on the signed `lead.research.ready` intake event.  Keeping
   * the canonical package inside the signed envelope prevents an HTTP caller
   * from attaching an unverified research object beside a valid gateway event.
   */
  lead_research?: LeadResearchPackage
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

const SENSITIVE_ASSIGNMENT_PATTERN =
  /(?:^|[^a-z0-9])(?:auth(?:entication|orization)?(?:[_-](?:token|key|secret|credential))?|api[_-]?key|access[_-]?(?:key|token)|refresh[_-]?token|id[_-]?token|session[_-]?token|token|secret|credential|password|passwd|pwd|private[_ -]?key|client[_-]?secret|account(?:[_ -]?(?:number|no|id))?|card(?:[_ -]?(?:number|no|id|cvc|cvv|expiry))?|payment(?:[_ -]?(?:intent|token|method|id|number|account))?|routing[_ -]?number|iban|bic|sort[_ -]?code|ssn|tax[_ -]?id)\s*(?:=|:|%3d|%3a)\s*[^\s&#;,]+/i

const AUTHORIZATION_HEADER_PATTERN = /\b(?:bearer|basic)\s+[^\s]+/i

const PRIVATE_KEY_PATTERN = /-----BEGIN(?: [A-Z0-9]+)? PRIVATE KEY-----/i

const URL_CREDENTIAL_PATTERN = /\bhttps?:\/\/[^/\s:@]+:[^/\s@]+@/i

const STRIPE_PAYMENT_IDENTIFIER_PATTERN =
  /(?:whsec_[a-z0-9]{8,}|pi_[a-z0-9]{8,}(?:_secret_[a-z0-9]+)?)/i

const KNOWN_TOKEN_PATTERN =
  /(?:^|[^a-z0-9])(?:sk-(?:proj|ant|live|test)-[a-z0-9_-]+|sk_(?:live|test)_[a-z0-9]+|rk_(?:live|test)_[a-z0-9]+|gh[pousr]_[a-z0-9]+|github_pat_[a-z0-9_]+|glpat-[a-z0-9_-]+|xox[baprs]-[a-z0-9-]+|npm_[a-z0-9]+|akia[0-9a-z]{16}|asia[0-9a-z]{16}|AIza[0-9a-z_-]{20,})(?:$|[^a-z0-9])/i

const JWT_PATTERN =
  /(?:^|[^a-z0-9])eyJ[a-z0-9_-]+\.[a-z0-9_-]+\.[a-z0-9_-]+(?:$|[^a-z0-9])/i

const TOKEN_PREFIX_PATTERN = /(?:^|[^a-z0-9])(?:token|secret|password)[_-][a-z0-9]{8,}(?:$|[^a-z0-9])/i

const PAYMENT_LABEL_PATTERN =
  /\b(?:account(?:[_-]?(?:number|no|id))?|card(?:[_-]?(?:number|no|id|cvc|cvv|expiry))?|payment(?:[_-]?(?:intent|token|method|id|number|account))?|routing[_-]?number|iban|bic|sort[_-]?code|ssn|tax[_-]?id)\b[^a-z0-9]{0,4}\d{4,}/i

const hasValidLuhnChecksum = (digits: string): boolean => {
  let sum = 0
  let shouldDouble = false

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index])
    if (shouldDouble) {
      digit *= 2
      if (digit > 9) digit -= 9
    }
    sum += digit
    shouldDouble = !shouldDouble
  }

  return sum % 10 === 0
}

const hasCardNumber = (value: string): boolean => {
  const candidates = value.match(/(?:^|[^0-9])((?:\d[ -]?){13,19})(?=$|[^0-9])/g) ?? []
  return candidates.some((candidate) => {
    const digits = candidate.replace(/[^0-9]/g, '')
    return digits.length >= 13 && digits.length <= 19 && hasValidLuhnChecksum(digits)
  })
}

const isSensitiveString = (value: string): boolean =>
  SENSITIVE_ASSIGNMENT_PATTERN.test(value) ||
  AUTHORIZATION_HEADER_PATTERN.test(value) ||
  PRIVATE_KEY_PATTERN.test(value) ||
  URL_CREDENTIAL_PATTERN.test(value) ||
  STRIPE_PAYMENT_IDENTIFIER_PATTERN.test(value) ||
  KNOWN_TOKEN_PATTERN.test(value) ||
  JWT_PATTERN.test(value) ||
  TOKEN_PREFIX_PATTERN.test(value) ||
  PAYMENT_LABEL_PATTERN.test(value) ||
  hasCardNumber(value)

const containsSensitiveMaterial = (value: unknown, ancestors = new Set<object>()): boolean => {
  if (typeof value === 'string') return isSensitiveString(value)
  if (!Array.isArray(value) && !isRecord(value)) return false
  if (ancestors.has(value)) return true

  ancestors.add(value)
  const nestedValues = Reflect.ownKeys(value)
    .filter((key) => !(Array.isArray(value) && key === 'length'))
    .map((key) => Reflect.get(value, key))
  const found = nestedValues.some((nestedValue) => containsSensitiveMaterial(nestedValue, ancestors))
  ancestors.delete(value)
  return found
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  !isSensitiveString(value)

const MAX_CANONICAL_REFERENCE_LENGTH = 128

// Stable contract references are ASCII tokens separated by one of `-`, `_`, `.`, `:`, or `/`.
// URI-like references may use one `scheme://` prefix, as in the existing evidence fixtures.
const CANONICAL_REFERENCE_PATTERN =
  /^(?:[A-Za-z0-9]+:\/\/[A-Za-z0-9]+|[A-Za-z0-9]+)(?:[._:/-][A-Za-z0-9]+)*$/

const isCanonicalReference = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length <= MAX_CANONICAL_REFERENCE_LENGTH &&
  CANONICAL_REFERENCE_PATTERN.test(value) &&
  !isSensitiveString(value)

const hasOnlyIndexedOwnKeys = (value: readonly unknown[]): boolean => {
  const keys = Reflect.ownKeys(value).filter((key) => key !== 'length')
  return (
    keys.length === value.length &&
    keys.every(
      (key) => typeof key === 'string' && /^(0|[1-9]\d*)$/.test(key),
    )
  )
}

const isStringArray = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  hasOnlyIndexedOwnKeys(value) &&
  value.every(isNonEmptyString)

const isReferenceArray = (value: unknown): value is string[] =>
  Array.isArray(value) &&
  hasOnlyIndexedOwnKeys(value) &&
  value.every(isCanonicalReference)

const CANONICAL_UTC_TIMESTAMP_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/

const isIsoTimestamp = (value: unknown): value is string => {
  if (typeof value !== 'string' || !CANONICAL_UTC_TIMESTAMP_PATTERN.test(value)) {
    return false
  }

  const parsed = new Date(value)
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString() === value
}

const HOSTNAME_LABEL_PATTERN =
  /^[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?$/

const isHostname = (value: unknown): value is string => {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.length > 253 ||
    isSensitiveString(value)
  ) {
    return false
  }

  const labels = value.split('.')
  return labels.length >= 2 && labels.every((label) => HOSTNAME_LABEL_PATTERN.test(label))
}

const isStrictHttpPreviewUrl = (value: unknown): value is string => {
  if (
    !isNonEmptyString(value) ||
    !(value.startsWith('http://') || value.startsWith('https://')) ||
    value.includes('\\') ||
    /[\s\u0000-\u001f\u007f]/.test(value) ||
    value.includes('#')
  ) {
    return false
  }

  try {
    const parsed = new URL(value)

    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      parsed.username === '' &&
      parsed.password === '' &&
      isHostname(parsed.hostname)
    )
  } catch {
    return false
  }
}

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
    Reflect.ownKeys(value).every(
      (key) => typeof key === 'string' && allowedKeys.has(key),
    )
  )
}

const isGitSha = (value: unknown): value is GitSha =>
  typeof value === 'string' && /^[a-f0-9]{40}$/.test(value)

const METADATA_KEYS = ['schema_version', 'org_id', 'correlation_id', 'idempotency_key'] as const

const isMetadata = (
  value: unknown,
): value is ContractMetadata & Record<string, unknown> =>
  isRecord(value) &&
  !containsSensitiveMaterial(value) &&
  hasRequiredKeys(value, METADATA_KEYS) &&
  isSchemaVersion(value.schema_version) &&
  isCanonicalReference(value.org_id) &&
  isCanonicalReference(value.correlation_id) &&
  isCanonicalReference(value.idempotency_key)

const isSafeErrorState = (value: unknown): value is SafeErrorState =>
  isRecord(value) &&
  hasExactKeys(value, ['code', 'message', 'retryable']) &&
  isCanonicalReference(value.code) &&
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
  hasExactKeys(value, ['lead_id', 'site_id'], ['submission', 'lead_research']) &&
  isCanonicalReference(value.lead_id) &&
  isCanonicalReference(value.site_id) &&
  (value.submission === undefined || (
    isRecord(value.submission) &&
    Object.values(value.submission).every((entry) =>
      (typeof entry === 'string' && !isSensitiveString(entry)) ||
      typeof entry === 'number' ||
      typeof entry === 'boolean',
    )
  )) &&
  (value.lead_research === undefined || isLeadResearchPackage(value.lead_research))

const isEventName = (value: unknown): value is LiNKautoworkEventName =>
  value === 'contact.submitted' ||
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
  isCanonicalReference(value.lead_id) &&
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
    !isCanonicalReference(value.lead_id) ||
    !isCanonicalReference(value.site_id) ||
    !isStrictHttpPreviewUrl(value.private_preview_url) ||
    !isCompletionStatus(value.status) ||
    !isGitSha(value.artifact_revision) ||
    !isGitSha(value.library_revision) ||
    !isGitSha(value.content_revision) ||
    !isReferenceArray(value.evidence_references) ||
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
  isCanonicalReference(value.lead_id) &&
  isCanonicalReference(value.site_id) &&
  isCommercialOutcome(value.outcome) &&
  isCanonicalReference(value.reach_authorization_reference) &&
  isRecord(value.replay_protection) &&
  hasExactKeys(value.replay_protection, ['event_id', 'nonce']) &&
  isCanonicalReference(value.replay_protection.event_id) &&
  isCanonicalReference(value.replay_protection.nonce) &&
  isIsoTimestamp(value.recorded_at)

export const isActivationRequest = (value: unknown): value is ActivationRequest =>
  isMetadata(value) &&
  hasExactKeys(
    value,
    [...METADATA_KEYS, 'lead_id', 'site_id', 'reach_authorization_reference', 'publication'],
  ) &&
  isCanonicalReference(value.lead_id) &&
  isCanonicalReference(value.site_id) &&
  isCanonicalReference(value.reach_authorization_reference) &&
  isRecord(value.publication) &&
  hasExactKeys(value.publication, ['environment', 'requested_at'], ['domain']) &&
  (value.publication.domain === undefined || isHostname(value.publication.domain)) &&
  value.publication.environment === 'production' &&
  isIsoTimestamp(value.publication.requested_at)

export const isRecyclingRequest = (value: unknown): value is RecyclingRequest =>
  isMetadata(value) &&
  hasExactKeys(value, [...METADATA_KEYS, 'lead_id', 'site_id', 'template_inventory_id', 'reason', 'requested_at']) &&
  isCanonicalReference(value.lead_id) &&
  isCanonicalReference(value.site_id) &&
  isCanonicalReference(value.template_inventory_id) &&
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
  isCanonicalReference(value.event_id) &&
  isEventName(value.event_name) &&
  isEventPayload(value.payload) &&
  isRecord(value.signature) &&
  hasExactKeys(value.signature, ['algorithm', 'key_id', 'signature']) &&
  value.signature.algorithm === 'hmac-sha256' &&
  isCanonicalReference(value.signature.key_id) &&
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
  isCanonicalReference(value.receipt_id) &&
  isCanonicalReference(value.producer) &&
  isRecord(value.subject) &&
  hasExactKeys(value.subject, ['type', 'id']) &&
  (value.subject.type === 'lead' ||
    value.subject.type === 'site' ||
    value.subject.type === 'run' ||
    value.subject.type === 'issue') &&
  isCanonicalReference(value.subject.id) &&
  isRecord(value.checksum) &&
  hasExactKeys(value.checksum, ['algorithm', 'value']) &&
  value.checksum.algorithm === 'sha256' &&
  isNonEmptyString(value.checksum.value) &&
  /^[a-f0-9]{64}$/.test(value.checksum.value) &&
  isGitSha(value.revision_sha) &&
  isCanonicalReference(value.storage_location) &&
  isCanonicalReference(value.gate_association) &&
  isIsoTimestamp(value.timestamp)

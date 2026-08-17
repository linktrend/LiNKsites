import { createHash } from 'node:crypto'
import { bindProviderBaseline, type AutoworkBaseline } from '@linksites/types'

/** The provider contract version is an immutable wire-level binding. */
export const AUTOWORK_CONTRACT_VERSION = '2026-08-13.v1' as const

export type AutoworkCapabilityState = 'available' | 'degraded' | 'offline' | 'unauthorized' | 'forbidden' | 'stale' | 'incompatible' | 'disabled' | 'unavailable' | 'hold'
export type AutoworkRunState = 'accepted' | 'queued' | 'running' | 'succeeded' | 'failed' | 'expired' | 'cancelled' | 'timed_out' | 'rejected' | 'blocked' | 'quarantined' | 'unavailable' | 'contract_incompatible'
export type AutoworkOperationKind = 'status_collection' | 'precheck' | 'evidence_collection' | 'notification_delivery' | 'external_assistance' | 'artifact_transform' | 'media_package' | 'outreach_adapter'
export type AutoworkAuthority = 'linksites' | 'linkautowork'

export type ExactAutomation = {
  automationId: string
  version: string
  definitionDigest: `sha256:${string}`
  configurationRef: string
  configurationDigest: `sha256:${string}`
}
export type AutoworkPin = {
  providerBaseline: AutoworkBaseline
  contractVersion: typeof AUTOWORK_CONTRACT_VERSION
  automation: ExactAutomation
}

export type AutoworkScope = {
  orgId: string
  capability: string
  operationKind: AutoworkOperationKind
  scopes: readonly string[]
}

export type AutoworkRequest = AutoworkPin & {
  requestId: string
  platform: { orgId: string; actorId: string; capability: string; expiresAt: string; revocationRef: string }
  scope: AutoworkScope
  inputRef: { ref: string; digest: `sha256:${string}`; observedAt: string }
  correlationRefs: readonly { ref: string; digest: `sha256:${string}`; observedAt: string }[]
  resultDestinationRef: string
  idempotencyKey: string
  expiresAt: string
  exactHandoffId?: string
  policy: { sideEffectClass: 'read_only' | 'reversible_external_write' | 'irreversible_external_write'; approvalRequirement: 'none' | 'explicit' | 'dual_human'; dataClassification: 'public' | 'internal' | 'confidential_metadata' | 'restricted_metadata' }
}

export type AutoworkCallback = {
  providerBaseline: AutoworkBaseline
  contractVersion: typeof AUTOWORK_CONTRACT_VERSION
  requestId: string
  receiptId: string
  callbackId: string
  nonce: string
  timestamp: string
  environment: 'development' | 'staging' | 'production'
  signatureRef: string
  exactHandoffId: string
  requestFingerprint: `sha256:${string}`
}

export type AutoworkCallbackAcknowledgement = {
  callbackId: string
  requestId: string
  receiptId: string
  acknowledgedAt: string
  exactHandoffId: string
  terminal: true
}

export type AutoworkReceipt = {
  providerBaseline: AutoworkBaseline
  contractVersion: typeof AUTOWORK_CONTRACT_VERSION
  requestId: string
  receiptId: string
  state: AutoworkRunState
  acceptedAt: string
  updatedAt: string
  attemptCount: number
  requestFingerprint: `sha256:${string}`
  automation: { automationId: string; version: string; definitionDigest: `sha256:${string}` }
  resultRefs: readonly { ref: string; digest: `sha256:${string}`; classification: 'public' | 'internal' | 'confidential_metadata' | 'restricted_metadata' }[]
  evidenceRefs: readonly { ref: string; digest: `sha256:${string}`; classification: 'public' | 'internal' | 'confidential_metadata' | 'restricted_metadata' }[]
  error?: { category: string; code: string; retryable: boolean }
  uncertainOutcome: boolean
}

export type AutoworkCapabilityStatus = {
  capability: string
  state: AutoworkCapabilityState
  observedAt: string
  freshnessAt?: string
  detailRef?: string
  doesNotProve: readonly ['automation_run', 'consumer_outcome', 'consumer_gate', 'external_side_effect', 'e2e_readiness', 'production_readiness']
}

export type AutoworkSummary = AutoworkPin & {
  automationId: string
  owner: string
  purpose: string
  operationKinds: readonly AutoworkOperationKind[]
  capabilityRequirement: string
  lifecycle: 'available' | 'deprecated' | 'disabled' | 'revoked'
  contractRef: string
}

export type AutoworkDetails = AutoworkSummary & {
  inputSchemaRef: string
  outputSchemaRef: string
  retryPolicyRef: string
  cancellationPolicyRef: string
  runbookRef: string
  evidenceGuideRef: string
}

export type AutoworkObservation<T> = {
  authority: AutoworkAuthority
  value: T
  localAuthorityUnchanged: true
  conflict: 'provider_observation_only'
}

export interface AutoworkTransport {
  summary(request: AutoworkPin & { automationId: string }): Promise<AutoworkSummary>
  details(request: AutoworkPin & { automationId: string }): Promise<AutoworkDetails>
  status(request: { capability: string }): Promise<AutoworkCapabilityStatus>
  request(request: AutoworkRequest): Promise<AutoworkReceipt>
  callback?(callback: AutoworkCallback): Promise<AutoworkCallbackAcknowledgement>
}

export class AutoworkPolicyError extends Error {
  readonly code = 'autowork_policy_rejected' as const
  constructor(readonly reason: string) { super(`LiNKautowork response rejected: ${reason}`); this.name = 'AutoworkPolicyError' }
}

const digestPattern = /^sha256:[a-f0-9]{64}$/u
const forbiddenPattern = /^(?:.*\.)?(?:body|binary|bytes|content|credential|file|filePath|fullContent|log|narrative|password|payload|personal|prompt|raw|secret|token|transcript|private|customer|case|ledger|gate|publication|hosting|deployment)$/iu
const forbiddenAuthorityPattern = /^(?:program|module|issue|run|ledger|gate|payload|publication|hosting|deployment)(?:Id|Ref|State)?$/u

function rejectSensitive(value: unknown, path = 'value'): void {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) { value.forEach((item, index) => rejectSensitive(item, `${path}[${index}]`)); return }
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenPattern.test(key) || forbiddenAuthorityPattern.test(key)) throw new AutoworkPolicyError(`forbiddenField:${path}.${key}`)
    rejectSensitive(child, `${path}.${key}`)
  }
}

function requireExactDigest(value: unknown, field: string): asserts value is `sha256:${string}` {
  if (typeof value !== 'string' || !digestPattern.test(value)) throw new AutoworkPolicyError(`invalidDigest:${field}`)
}
function requireDate(value: string, field: string, now: Date): void {
  const time = Date.parse(value)
  if (!Number.isFinite(time)) throw new AutoworkPolicyError(`invalidTimestamp:${field}`)
  if (field === 'expiresAt' && time <= now.getTime()) throw new AutoworkPolicyError('expired')
}
function canonical(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonical)
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, canonical(child)]))
  return value
}
function fingerprint(request: AutoworkRequest): `sha256:${string}` {
  return `sha256:${createHash('sha256').update(JSON.stringify(canonical(request))).digest('hex')}`
}
function validatePin(pin: AutoworkPin): void {
  bindProviderBaseline('autowork', pin.providerBaseline)
  if (pin.contractVersion !== AUTOWORK_CONTRACT_VERSION) throw new AutoworkPolicyError('contractVersionMismatch')
  if (!pin.automation.automationId || !pin.automation.version || !pin.automation.configurationRef) throw new AutoworkPolicyError('missingExactAutomation')
  requireExactDigest(pin.automation.definitionDigest, 'automation.definitionDigest')
  requireExactDigest(pin.automation.configurationDigest, 'automation.configurationDigest')
}
function validateSummary(value: AutoworkSummary, pin: AutoworkPin & { automationId: string }): AutoworkSummary {
  rejectSensitive(value); validatePin(value)
  if (value.automationId !== pin.automationId || value.automation.version !== pin.automation.version || value.automation.definitionDigest !== pin.automation.definitionDigest || value.automation.configurationDigest !== pin.automation.configurationDigest) throw new AutoworkPolicyError('exactReleaseMismatch')
  if (value.lifecycle !== 'available') throw new AutoworkPolicyError(`lifecycle:${value.lifecycle}`)
  return value
}
function validateReceipt(receipt: AutoworkReceipt, request: AutoworkRequest, now: Date): AutoworkReceipt {
  rejectSensitive(receipt)
  bindProviderBaseline('autowork', receipt.providerBaseline)
  if (receipt.contractVersion !== AUTOWORK_CONTRACT_VERSION || receipt.requestId !== request.requestId || receipt.automation.automationId !== request.automation.automationId || receipt.automation.version !== request.automation.version || receipt.automation.definitionDigest !== request.automation.definitionDigest) throw new AutoworkPolicyError('receiptBindingMismatch')
  requireExactDigest(receipt.requestFingerprint, 'receipt.requestFingerprint')
  if (receipt.requestFingerprint !== fingerprint(request)) throw new AutoworkPolicyError('requestFingerprintMismatch')
  requireDate(receipt.acceptedAt, 'acceptedAt', now); requireDate(receipt.updatedAt, 'updatedAt', now)
  return receipt
}
function validateStatus(status: AutoworkCapabilityStatus, requestedCapability: string): AutoworkCapabilityStatus {
  rejectSensitive(status)
  if (status.capability !== requestedCapability || status.doesNotProve.join('|') !== 'automation_run|consumer_outcome|consumer_gate|external_side_effect|e2e_readiness|production_readiness') throw new AutoworkPolicyError('statusBindingMismatch')
  return status
}

/** Thin, injected LiNKsites consumer. It retrieves and coordinates only; it never executes provider work. */
export class AutoworkClient {
  private readonly baseline: AutoworkBaseline
  private readonly now: () => Date
  private readonly seenCallbackNonces = new Set<string>()
  constructor(private readonly transport: AutoworkTransport, now: (() => Date) | undefined = undefined, baseline: unknown) {
    this.now = now ?? (() => new Date())
    this.baseline = bindProviderBaseline('autowork', baseline)
  }

  async summary(pin: AutoworkPin & { automationId: string }): Promise<AutoworkObservation<AutoworkSummary>> {
    validatePin(pin); const value = await this.transport.summary(pin); return { authority: 'linkautowork', value: validateSummary(value, pin), localAuthorityUnchanged: true, conflict: 'provider_observation_only' }
  }
  async details(pin: AutoworkPin & { automationId: string }): Promise<AutoworkObservation<AutoworkDetails>> {
    const value = await this.summary(pin); const details = await this.transport.details(pin); validateSummary(details, pin)
    return { authority: 'linkautowork', value: details, localAuthorityUnchanged: true, conflict: value.conflict }
  }
  async status(capability: string): Promise<AutoworkObservation<AutoworkCapabilityStatus>> {
    if (!capability) throw new AutoworkPolicyError('missingCapability'); const value = await this.transport.status({ capability }); bindProviderBaseline('autowork', this.baseline); return { authority: 'linkautowork', value: validateStatus(value, capability), localAuthorityUnchanged: true, conflict: 'provider_observation_only' }
  }
  async request(request: AutoworkRequest): Promise<AutoworkObservation<AutoworkReceipt>> {
    validatePin(request); rejectSensitive(request)
    if (request.platform.orgId !== request.scope.orgId || request.platform.capability !== request.scope.capability || request.scope.orgId !== request.platform.orgId) throw new AutoworkPolicyError('scopeBindingMismatch')
    if (!request.scope.scopes.includes(request.scope.operationKind)) throw new AutoworkPolicyError('unauthorizedScope')
    if (request.scope.operationKind === 'external_assistance' && !request.exactHandoffId) throw new AutoworkPolicyError('missingExactHandoff')
    requireDate(request.expiresAt, 'expiresAt', this.now()); requireDate(request.platform.expiresAt, 'expiresAt', this.now())
    if (request.platform.revocationRef.endsWith('/revoked')) throw new AutoworkPolicyError('revoked')
    const receipt = await this.transport.request(request)
    return { authority: 'linkautowork', value: validateReceipt(receipt, request, this.now()), localAuthorityUnchanged: true, conflict: 'provider_observation_only' }
  }

  async acknowledgeCallback(callback: AutoworkCallback, request: AutoworkRequest, receipt: AutoworkReceipt, expectedEnvironment: AutoworkCallback['environment']): Promise<AutoworkObservation<AutoworkCallbackAcknowledgement>> {
    rejectSensitive(callback)
    bindProviderBaseline('autowork', callback.providerBaseline)
    if (callback.contractVersion !== AUTOWORK_CONTRACT_VERSION) throw new AutoworkPolicyError('callbackBindingMismatch')
    if (callback.requestId !== request.requestId || callback.receiptId !== receipt.receiptId) throw new AutoworkPolicyError('callbackBindingMismatch')
    if (callback.exactHandoffId !== (request.exactHandoffId ?? '')) throw new AutoworkPolicyError('exactHandoffMismatch')
    if (!callback.nonce || !callback.signatureRef || !callback.callbackId) throw new AutoworkPolicyError('callbackSignatureMismatch')
    if (callback.environment !== expectedEnvironment) throw new AutoworkPolicyError('environmentMismatch')
    requireDate(callback.timestamp, 'timestamp', this.now())
    const ageMs = Math.abs(this.now().getTime() - Date.parse(callback.timestamp))
    if (ageMs > 300_000) throw new AutoworkPolicyError('staleCallback')
    if (this.seenCallbackNonces.has(callback.nonce)) throw new AutoworkPolicyError('callbackReplay')
    requireExactDigest(callback.requestFingerprint, 'callback.requestFingerprint')
    if (callback.requestFingerprint !== fingerprint(request) || callback.requestFingerprint !== receipt.requestFingerprint) throw new AutoworkPolicyError('requestFingerprintMismatch')
    if (!this.transport.callback) throw new AutoworkPolicyError('callbackUnavailable')
    this.seenCallbackNonces.add(callback.nonce)
    const acknowledgement = await this.transport.callback(callback)
    if (acknowledgement.callbackId !== callback.callbackId || acknowledgement.requestId !== request.requestId || acknowledgement.receiptId !== receipt.receiptId || acknowledgement.exactHandoffId !== callback.exactHandoffId || acknowledgement.terminal !== true) {
      throw new AutoworkPolicyError('callbackReceiptMismatch')
    }
    return { authority: 'linkautowork', value: acknowledgement, localAuthorityUnchanged: true, conflict: 'provider_observation_only' }
  }
}

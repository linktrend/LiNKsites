import { createHash } from 'node:crypto'
import { bindProviderBaseline, type SkillsBaseline } from '@linksites/types'

export type SkillResourceKind = 'guide' | 'catalogue' | 'summary' | 'fragment' | 'release'

export interface SkillPin {
  skillId: string
  releaseId: string
  version: string
  digest: `sha256:${string}`
}

export interface SkillsCompatibilityReceipt {
  compatible: boolean
  consumer: 'linksites'
  runtimeProfile: string
  contractVersion: string
}

export interface SkillsAttestationReceipt {
  valid: boolean
  audience: 'linksites'
  releaseId: string
  version: string
  digest: string
  issuer: string
  issuedAt: string
}

export interface SkillsFreshnessReceipt {
  checkedAt: string
  expiresAt: string
}

export interface SkillsVerificationReceipt {
  providerBaseline: SkillsBaseline
  releaseId: string
  skillId: string
  version: string
  digest: `sha256:${string}`
  qualification: 'qualified'
  lifecycle: 'usable' | 'published' | 'draft' | 'eval_pending' | 'deprecated' | 'retired' | 'revoked' | 'quarantined'
  compatibility: SkillsCompatibilityReceipt
  attestation: SkillsAttestationReceipt
  freshness: SkillsFreshnessReceipt
}

export interface SkillPayload {
  kind: SkillResourceKind
  pin: SkillPin
  receipt: SkillsVerificationReceipt
  content?: string
  contentHash?: `sha256:${string}`
  value: unknown
}

export class SkillsPolicyError extends Error {
  readonly code = 'skills_policy_rejected' as const

  constructor(readonly reason: string) {
    super(`Skills content rejected: ${reason}`)
    this.name = 'SkillsPolicyError'
  }
}

const sha256 = (value: string): `sha256:${string}` => `sha256:${createHash('sha256').update(value).digest('hex')}`

const nonEmpty = (value: unknown): value is string => typeof value === 'string' && value.length > 0

/**
 * Verifies the provider's complete receipt before a resource crosses into
 * local use. This policy intentionally has no selection or execution path.
 */
export function verifySkillsReceipt(
  kind: SkillResourceKind,
  pin: SkillPin,
  resource: SkillPayload,
  now: Date = new Date(),
  baseline?: unknown,
): SkillPayload {
  const skillsBaseline = bindProviderBaseline('skills', baseline)
  if (!pin.skillId || !pin.releaseId || !pin.version || ['latest', 'native'].includes(pin.releaseId.toLowerCase()) || ['latest', 'native'].includes(pin.version.toLowerCase()) || !/^sha256:[a-f0-9]{64}$/u.test(pin.digest)) throw new SkillsPolicyError('unPinnedExactRelease')
  if (resource.kind !== kind) throw new SkillsPolicyError('resourceKindMismatch')
  const receipt = resource.receipt
  bindProviderBaseline('skills', receipt.providerBaseline)
  if (receipt.skillId !== pin.skillId || receipt.releaseId !== pin.releaseId || receipt.version !== pin.version || receipt.digest !== pin.digest) throw new SkillsPolicyError('exactReleaseMismatch')
  if (receipt.qualification !== 'qualified') throw new SkillsPolicyError('notQualified')
  if (receipt.lifecycle !== 'usable' && receipt.lifecycle !== 'published') throw new SkillsPolicyError('lifecycleNotUsable')
  if (!receipt.compatibility.compatible || receipt.compatibility.consumer !== 'linksites' || !nonEmpty(receipt.compatibility.runtimeProfile) || receipt.compatibility.contractVersion !== skillsBaseline.contractVersion) throw new SkillsPolicyError('incompatible')
  const attestation = receipt.attestation
  if (!attestation.valid || attestation.audience !== 'linksites' || attestation.releaseId !== pin.releaseId || attestation.version !== pin.version || attestation.digest !== pin.digest || !nonEmpty(attestation.issuer) || Number.isNaN(Date.parse(attestation.issuedAt))) throw new SkillsPolicyError('invalidAttestation')
  const freshness = receipt.freshness
  const checkedAt = Date.parse(freshness.checkedAt)
  const expiresAt = Date.parse(freshness.expiresAt)
  if (!Number.isFinite(checkedAt) || !Number.isFinite(expiresAt) || expiresAt <= checkedAt || now.getTime() < checkedAt || now.getTime() >= expiresAt) throw new SkillsPolicyError('stale')
  if (resource.content !== undefined) {
    const actual = sha256(resource.content)
    if (resource.contentHash !== undefined && actual !== resource.contentHash) throw new SkillsPolicyError('corruptContent')
  }
  if (kind === 'catalogue') {
    const catalogue = resource.value
    if (!catalogue || typeof catalogue !== 'object' || Array.isArray(catalogue)) throw new SkillsPolicyError('oversizedOrAmbiguousCatalogue')
    const records = (catalogue as { records?: unknown }).records
    if (Array.isArray(records) && records.length > 32) throw new SkillsPolicyError('oversizedOrAmbiguousCatalogue')
  }
  return resource
}

export interface MinimalSkillsUseReport {
  reportKind: 'completed_use' | 'non_use'
  skillId: string
  releaseId: string
  version: string
  digest: `sha256:${string}`
  outcome: 'use_succeeded' | 'use_failed' | 'not_used'
  reason?: 'unavailable' | 'incompatible' | 'expired' | 'revoked' | 'cancelled'
}

export interface MinimalSkillsFeedback {
  skillId: string
  releaseId: string
  version: string
  digest: `sha256:${string}`
  outcome: 'use_succeeded' | 'use_failed' | 'use_partial'
  issue?: 'incorrect' | 'incomplete' | 'ambiguous' | 'unsafe' | 'incompatible' | 'unavailable' | 'latency' | 'other'
}

export function validateMinimalSkillsReport(report: MinimalSkillsUseReport | MinimalSkillsFeedback): void {
  if (!report.skillId || !report.releaseId || !report.version || !/^sha256:[a-f0-9]{64}$/u.test(report.digest)) throw new SkillsPolicyError('reportNotExactReleaseBound')
  if (Object.keys(report).some((key) => /secret|token|credential|prompt|transcript|conversation|raw|customer|lead|case|portfolio|order|narrative|notes|content|fragment/i.test(key))) throw new SkillsPolicyError('reportContainsPrivateData')
}

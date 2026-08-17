import { createHash } from 'node:crypto'
import { bindProviderBaseline, type BrainBaseline } from '@linksites/types'

export const LINKsites_OVERSIGHT_PROFILE = 'linksites.oversight' as const
export const LINKSITES_OVERSIGHT_PROFILE = LINKsites_OVERSIGHT_PROFILE
export const LINKsites_OVERSIGHT_PROFILE_VERSION = '1.0.0' as const
export const BRAIN_V2_CONTRACT_VERSION = '2.0.0' as const

export type ProjectionClassification = 'verified' | 'stale' | 'conflicted' | 'incomplete' | 'unavailable' | 'inferred'
export type ProjectionFreshness = 'fresh' | 'stale' | 'expired' | 'unknown'
export type ProjectionStatus = 'pending' | 'approved' | 'rejected' | 'blocked' | 'stale' | 'unknown'
export type EntityStatus = 'planned' | 'active' | 'blocked' | 'completed' | 'failed' | 'stale' | 'unknown'

export type StatusReference = { reference: string; status: ProjectionStatus }
export type SiteEntity = { id: string; status: EntityStatus }

export type LinksitesOversightProjection = {
  providerBaseline: BrainBaseline
  contractVersion: typeof BRAIN_V2_CONTRACT_VERSION
  projectionId: string
  profile: typeof LINKsites_OVERSIGHT_PROFILE
  projectionKind: 'projection'
  metadata: {
    tenantId: string; domain: 'linksites'; domainToken: 'linksites'; contextKind: 'site' | 'program' | 'project'
    contextReference: string; ownerReference: string; confidence: number; retentionClass: 'operational' | 'governed' | 'archival'
    purpose: string; region: string; shareabilityState: 'private' | 'tenant_only' | 'cross_tenant_approved' | 'public'
    sourcePrivacy: 'tenant_internal' | 'confidential' | 'redacted'; destinationPrivacy: 'tenant_internal' | 'confidential' | 'redacted'
    authority: 'advisory'; verticalAuthority: 'none'
  }
  privacy: { privacyClassification: 'tenant_internal' | 'confidential' | 'redacted'; noExistenceDisclosure: false; existenceDisclosure: 'tenant_only' | 'allowed' }
  title: string; summary: string; tags: string[]; externalArtifactReferences: []
  createdAt: string; updatedAt: string; schemaVersion: typeof BRAIN_V2_CONTRACT_VERSION; profileVersion: typeof LINKsites_OVERSIGHT_PROFILE_VERSION
  sourceFingerprint: string; producerSequence: number; expectedCurrentFingerprint: string | null; provenanceDigest: string
  producerTimestamp: string; observationTimestamp: string; ingestionTimestamp: string; freshness: ProjectionFreshness; staleness: 'current' | 'stale' | 'unknown'
  classification: ProjectionClassification; classifications: ProjectionClassification[]
  programs: SiteEntity[]; modules: SiteEntity[]; issues: Array<{ issueId: string; status: 'open' | 'blocked' | 'failed' | 'resolved' | 'unknown'; reference?: string }>; runs: SiteEntity[]
  owner: { availability: 'available' | 'unavailable' | 'incomplete'; actorId?: string; role?: 'owner' }
  executor: { availability: 'available' | 'unavailable' | 'incomplete'; actorId?: string; role?: 'executor' }
  checkpoint: { checkpointId: string; status: 'current' | 'stale' | 'conflicted' | 'incomplete' | 'unavailable'; reference: string }
  immutableSourceReferences: { repo: string; release: string; commitSha: string }
  gates: StatusReference[]; reviews: StatusReference[]; handoffs: StatusReference[]; principalDecisions: StatusReference[]
  blockers: Array<{ code: string; status: 'open' | 'resolved' | 'stale' | 'unknown'; reference?: string }>
  failures: Array<{ code: string; status: 'open' | 'resolved' | 'stale' | 'unknown'; reference?: string }>
  remediation: Array<{ reference: string; status: 'pending' | 'active' | 'completed' | 'blocked' | 'stale' }>
  staleLeases: Array<{ leaseReference: string; status: 'stale' | 'active' | 'released' | 'unknown' }>
  overlapWarnings: Array<{ overlapReference: string; status: 'open' | 'resolved' | 'dismissed' | 'unknown' }>
  preview: { status: 'not_requested' | 'ready' | 'failed' | 'stale' | 'unavailable'; reference?: string }
  publication: { status: 'not_requested' | 'pending' | 'published' | 'failed' | 'retracted' | 'unavailable'; reference?: string }
  hosting: { status: 'not_configured' | 'ready' | 'active' | 'failed' | 'stale' | 'unavailable'; reference?: string }
  autoworkReferences: StatusReference[]; brainReferences: StatusReference[]
  authoritativeLinksitesEvidence: { authority: 'linksites'; status: ProjectionClassification | 'unavailable'; evidenceReferences: StatusReference[]; observedAt: string }
}

export type LinksitesOversightInput = {
  providerBaseline: unknown
  tenantId: string; projectionId: string; contextReference: string; ownerReference: string
  program: SiteEntity; module: SiteEntity; issue: LinksitesOversightProjection['issues'][number]; run: SiteEntity
  repo: string; release: string; commitSha: string; owner?: string; executor?: string; checkpoint?: LinksitesOversightProjection['checkpoint']
  title: string; summary: string; observationTimestamp: string; producerTimestamp?: string; ingestionTimestamp?: string
  producerSequence?: number; expectedCurrentFingerprint?: string | null; confidence?: number; region?: string
  gates?: StatusReference[]; reviews?: StatusReference[]; handoffs?: StatusReference[]; principalDecisions?: StatusReference[]
  blockers?: LinksitesOversightProjection['blockers']; failures?: LinksitesOversightProjection['failures']; remediation?: LinksitesOversightProjection['remediation']
  staleLeases?: LinksitesOversightProjection['staleLeases']; overlapWarnings?: LinksitesOversightProjection['overlapWarnings']
  preview?: LinksitesOversightProjection['preview']; publication?: LinksitesOversightProjection['publication']; hosting?: LinksitesOversightProjection['hosting']
  autoworkReferences?: StatusReference[]; brainReferences?: StatusReference[]; evidenceReferences?: StatusReference[]
  evidenceStatus?: ProjectionClassification | 'unavailable'; freshness?: ProjectionFreshness; staleness?: 'current' | 'stale' | 'unknown'
  classification?: ProjectionClassification; classifications?: ProjectionClassification[]; now?: string
}

export class ProjectionInputError extends Error { constructor(public readonly code: string, message: string) { super(message); this.name = 'ProjectionInputError' } }

const forbiddenKeys = new Set(['body', 'binary', 'bytes', 'caseVault', 'content', 'contentHash', 'digest', 'evidence', 'file', 'filePath', 'fullContent', 'hash', 'narrative', 'payload', 'prompt', 'rawCapture', 'recording', 'secret', 'token', 'workProduct'])
const tokenPattern = /^[A-Za-z0-9][A-Za-z0-9._~:-]*$/
const shaPattern = /^[a-f0-9]{40,64}$/i
const digestPattern = /^[a-f0-9]{64}$/i

function rejectForbidden(value: unknown, path = 'input'): void {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) { for (const item of value) rejectForbidden(item, path); return }
  for (const [key, child] of Object.entries(value)) {
    if (forbiddenKeys.has(key)) throw new ProjectionInputError('untrusted_narrative', `${path}.${key} is not admissible in an oversight projection`)
    rejectForbidden(child, `${path}.${key}`)
  }
}

function text(value: unknown, field: string, max: number): string {
  if (typeof value !== 'string' || !value.trim() || value.length > max || /[\u0000-\u001f<>]|\{\{|\}\}/.test(value)) throw new ProjectionInputError('invalid_text', `${field} must be bounded metadata text`)
  return value.trim()
}
function ref(value: unknown, field: string): string { const result = text(value, field, 240); if (!tokenPattern.test(result)) throw new ProjectionInputError('invalid_reference', `${field} must be opaque`); return result }
function iso(value: unknown, field: string): string { const result = text(value, field, 40); if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(result) || Number.isNaN(Date.parse(result))) throw new ProjectionInputError('invalid_timestamp', `${field} must be an ISO UTC timestamp`); return result }
function digest(value: unknown): string { return createHash('sha256').update(JSON.stringify(value)).digest('hex') }

type RecordValue = Record<string, unknown>
function record(value: unknown, field: string): RecordValue {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new ProjectionInputError('invalid_shape', `${field} must be an object`)
  return value as RecordValue
}
function allow(value: unknown, field: string, keys: readonly string[]): RecordValue {
  const result = record(value, field)
  const allowed = new Set(keys)
  for (const key of Object.keys(result)) if (!allowed.has(key)) throw new ProjectionInputError('unknown_field', `${field}.${key} is not admissible`)
  return result
}
function optionalArray(value: unknown, field: string): unknown[] {
  if (value === undefined) return []
  if (!Array.isArray(value)) throw new ProjectionInputError('invalid_shape', `${field} must be an array`)
  return value
}
function oneOf<T extends string>(value: unknown, field: string, values: readonly T[]): T {
  if (typeof value !== 'string' || !values.includes(value as T)) throw new ProjectionInputError('invalid_status', `${field} has an invalid declared value`)
  return value as T
}
function statusRef(value: unknown, field = 'statusReference'): StatusReference {
  const item = allow(value, field, ['reference', 'status'])
  return { reference: ref(item.reference, `${field}.reference`), status: oneOf(item.status, `${field}.status`, ['pending', 'approved', 'rejected', 'blocked', 'stale', 'unknown']) }
}
function entity(value: unknown, field: string): SiteEntity {
  const item = allow(value, field, ['id', 'status'])
  return { id: ref(item.id, `${field}.id`), status: oneOf(item.status, `${field}.status`, ['planned', 'active', 'blocked', 'completed', 'failed', 'stale', 'unknown']) }
}
function issue(value: unknown): LinksitesOversightProjection['issues'][number] {
  const item = allow(value, 'issue', ['issueId', 'status', 'reference'])
  return { issueId: ref(item.issueId, 'issue.issueId'), status: oneOf(item.status, 'issue.status', ['open', 'blocked', 'failed', 'resolved', 'unknown']), ...(item.reference === undefined ? {} : { reference: ref(item.reference, 'issue.reference') }) }
}
function checkpoint(value: unknown): LinksitesOversightProjection['checkpoint'] {
  const item = allow(value, 'checkpoint', ['checkpointId', 'status', 'reference'])
  return { checkpointId: ref(item.checkpointId, 'checkpoint.checkpointId'), status: oneOf(item.status, 'checkpoint.status', ['current', 'stale', 'conflicted', 'incomplete', 'unavailable']), reference: ref(item.reference, 'checkpoint.reference') }
}
function coded(value: unknown, field: string, statuses: readonly string[]): { code: string; status: never; reference?: string } {
  const item = allow(value, field, ['code', 'status', 'reference'])
  return { code: ref(item.code, `${field}.code`), status: oneOf(item.status, `${field}.status`, statuses) as never, ...(item.reference === undefined ? {} : { reference: ref(item.reference, `${field}.reference`) }) }
}
function remediation(value: unknown): LinksitesOversightProjection['remediation'][number] {
  const item = allow(value, 'remediation', ['reference', 'status'])
  return { reference: ref(item.reference, 'remediation.reference'), status: oneOf(item.status, 'remediation.status', ['pending', 'active', 'completed', 'blocked', 'stale']) }
}
function lease(value: unknown): LinksitesOversightProjection['staleLeases'][number] {
  const item = allow(value, 'staleLeases', ['leaseReference', 'status'])
  return { leaseReference: ref(item.leaseReference, 'staleLeases.leaseReference'), status: oneOf(item.status, 'staleLeases.status', ['stale', 'active', 'released', 'unknown']) }
}
function overlap(value: unknown): LinksitesOversightProjection['overlapWarnings'][number] {
  const item = allow(value, 'overlapWarnings', ['overlapReference', 'status'])
  return { overlapReference: ref(item.overlapReference, 'overlapWarnings.overlapReference'), status: oneOf(item.status, 'overlapWarnings.status', ['open', 'resolved', 'dismissed', 'unknown']) }
}
function lifecycle(value: unknown, field: 'preview' | 'publication' | 'hosting', statuses: readonly string[]): { status: string; reference?: string } {
  const item = allow(value, field, ['status', 'reference'])
  return { status: oneOf(item.status, `${field}.status`, statuses), ...(item.reference === undefined ? {} : { reference: ref(item.reference, `${field}.reference`) }) }
}

export function buildLinksitesOversightProjection(input: LinksitesOversightInput): LinksitesOversightProjection {
  const providerBaseline = bindProviderBaseline('brain', input.providerBaseline)
  rejectForbidden(input)
  for (const [field, value] of Object.entries({ program: input.program, module: input.module, issue: input.issue, run: input.run })) {
    if (!value || typeof value !== 'object') throw new ProjectionInputError('missing_required_field', `${field} is mandatory for an oversight projection`)
  }
  for (const [field, value] of Object.entries({ tenantId: input.tenantId, projectionId: input.projectionId, contextReference: input.contextReference, ownerReference: input.ownerReference, repo: input.repo, release: input.release, commitSha: input.commitSha })) ref(value, field)
  if (!shaPattern.test(input.commitSha)) throw new ProjectionInputError('invalid_commit', 'commitSha must be a Git SHA')
  const now = iso(input.now ?? new Date().toISOString(), 'now')
  const producerTimestamp = iso(input.producerTimestamp ?? input.observationTimestamp, 'producerTimestamp')
  const observationTimestamp = iso(input.observationTimestamp, 'observationTimestamp')
  const ingestionTimestamp = iso(input.ingestionTimestamp ?? now, 'ingestionTimestamp')
  const confidence = input.confidence ?? 0.5
  if (!Number.isFinite(confidence) || confidence < 0 || confidence > 1) throw new ProjectionInputError('invalid_confidence', 'confidence must be between 0 and 1')
  const sequence = input.producerSequence ?? 1
  if (!Number.isInteger(sequence) || sequence < 1 || (sequence === 1 && input.expectedCurrentFingerprint !== null && input.expectedCurrentFingerprint !== undefined) || (sequence > 1 && !digestPattern.test(input.expectedCurrentFingerprint ?? ''))) throw new ProjectionInputError('invalid_lineage', 'producer sequence and predecessor fingerprint are inconsistent')
  if (input.expectedCurrentFingerprint && !digestPattern.test(input.expectedCurrentFingerprint)) throw new ProjectionInputError('invalid_lineage', 'expectedCurrentFingerprint must be SHA-256')
  const incomplete = !input.owner || !input.executor || !input.checkpoint || !input.evidenceReferences
  const classification = oneOf(input.classification ?? (incomplete ? 'incomplete' : 'verified'), 'classification', ['verified', 'stale', 'conflicted', 'incomplete', 'unavailable', 'inferred'] as const)
  const classifications = Array.from(new Set(optionalArray(input.classifications, 'classifications').map((value, index) => oneOf(value, `classifications[${index}]`, ['verified', 'stale', 'conflicted', 'incomplete', 'unavailable', 'inferred'] as const)).concat(classification)))
  const freshness = oneOf(input.freshness ?? (classification === 'stale' ? 'stale' : 'fresh'), 'freshness', ['fresh', 'stale', 'expired', 'unknown'] as const)
  const staleness = oneOf(input.staleness ?? (classification === 'stale' ? 'stale' : 'current'), 'staleness', ['current', 'stale', 'unknown'] as const)
  const sourceFingerprint = digest({ tenantId: input.tenantId, projectionId: input.projectionId, source: { repo: input.repo, release: input.release, commitSha: input.commitSha }, sequence })
  const evidenceReferences = optionalArray(input.evidenceReferences, 'evidenceReferences').map((value, index) => statusRef(value, `evidenceReferences[${index}]`))
  const projection: LinksitesOversightProjection = {
    providerBaseline,
    contractVersion: BRAIN_V2_CONTRACT_VERSION, projectionId: ref(input.projectionId, 'projectionId'), profile: LINKsites_OVERSIGHT_PROFILE, projectionKind: 'projection',
    metadata: { tenantId: ref(input.tenantId, 'tenantId'), domain: 'linksites', domainToken: 'linksites', contextKind: 'site', contextReference: ref(input.contextReference, 'contextReference'), ownerReference: ref(input.ownerReference, 'ownerReference'), confidence, retentionClass: 'governed', purpose: 'projection_exchange', region: text(input.region ?? 'global', 'region', 40).toLowerCase(), shareabilityState: 'tenant_only', sourcePrivacy: 'tenant_internal', destinationPrivacy: 'tenant_internal', authority: 'advisory', verticalAuthority: 'none' },
    privacy: { privacyClassification: 'tenant_internal', noExistenceDisclosure: false, existenceDisclosure: 'tenant_only' },
    title: text(input.title, 'title', 240), summary: text(input.summary, 'summary', 2000), tags: ['linksites', 'oversight'], externalArtifactReferences: [],
    createdAt: producerTimestamp, updatedAt: observationTimestamp, schemaVersion: BRAIN_V2_CONTRACT_VERSION, profileVersion: LINKsites_OVERSIGHT_PROFILE_VERSION,
    sourceFingerprint, producerSequence: sequence, expectedCurrentFingerprint: input.expectedCurrentFingerprint ?? null, provenanceDigest: digest({ sourceFingerprint, evidenceReferences, commitSha: input.commitSha }), producerTimestamp, observationTimestamp, ingestionTimestamp,
    freshness, staleness, classification, classifications,
    programs: [entity(input.program, 'program')], modules: [entity(input.module, 'module')], issues: [issue(input.issue)], runs: [entity(input.run, 'run')],
    owner: input.owner ? { availability: 'available', actorId: ref(input.owner, 'owner'), role: 'owner' } : { availability: 'incomplete' }, executor: input.executor ? { availability: 'available', actorId: ref(input.executor, 'executor'), role: 'executor' } : { availability: 'incomplete' }, checkpoint: input.checkpoint === undefined ? { checkpointId: 'checkpoint-unavailable', status: 'unavailable', reference: 'checkpoint-unavailable' } : checkpoint(input.checkpoint),
    immutableSourceReferences: { repo: ref(input.repo, 'repo'), release: ref(input.release, 'release'), commitSha: input.commitSha }, gates: optionalArray(input.gates, 'gates').map((value, index) => statusRef(value, `gates[${index}]`)), reviews: optionalArray(input.reviews, 'reviews').map((value, index) => statusRef(value, `reviews[${index}]`)), handoffs: optionalArray(input.handoffs, 'handoffs').map((value, index) => statusRef(value, `handoffs[${index}]`)), principalDecisions: optionalArray(input.principalDecisions, 'principalDecisions').map((value, index) => statusRef(value, `principalDecisions[${index}]`)), blockers: optionalArray(input.blockers, 'blockers').map(value => coded(value, 'blockers', ['open', 'resolved', 'stale', 'unknown'])), failures: optionalArray(input.failures, 'failures').map(value => coded(value, 'failures', ['open', 'resolved', 'stale', 'unknown'])), remediation: optionalArray(input.remediation, 'remediation').map(remediation), staleLeases: optionalArray(input.staleLeases, 'staleLeases').map(lease), overlapWarnings: optionalArray(input.overlapWarnings, 'overlapWarnings').map(overlap),
    preview: input.preview === undefined ? { status: 'unavailable' } : lifecycle(input.preview, 'preview', ['not_requested', 'ready', 'failed', 'stale', 'unavailable']) as LinksitesOversightProjection['preview'], publication: input.publication === undefined ? { status: 'unavailable' } : lifecycle(input.publication, 'publication', ['not_requested', 'pending', 'published', 'failed', 'retracted', 'unavailable']) as LinksitesOversightProjection['publication'], hosting: input.hosting === undefined ? { status: 'unavailable' } : lifecycle(input.hosting, 'hosting', ['not_configured', 'ready', 'active', 'failed', 'stale', 'unavailable']) as LinksitesOversightProjection['hosting'], autoworkReferences: optionalArray(input.autoworkReferences, 'autoworkReferences').map((value, index) => statusRef(value, `autoworkReferences[${index}]`)), brainReferences: optionalArray(input.brainReferences, 'brainReferences').map((value, index) => statusRef(value, `brainReferences[${index}]`)), authoritativeLinksitesEvidence: { authority: 'linksites', status: input.evidenceStatus === undefined ? (evidenceReferences.length ? 'verified' : 'incomplete') : oneOf(input.evidenceStatus, 'evidenceStatus', ['verified', 'stale', 'conflicted', 'incomplete', 'unavailable', 'inferred'] as const), evidenceReferences, observedAt: observationTimestamp },
  }
  return projection
}

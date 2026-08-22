/**
 * W2-06 commercial outcome, technical lifecycle, and LiNKsites Architect.
 *
 * LiNKreach supplies a validated commercial decision. LiNKsites records that
 * decision, then performs only technical work. This module deliberately
 * exposes production-provider ports but ships a Phase 1 dry-run adapter:
 * source tests can prove the complete graph without changing a real Payload
 * visibility setting, DNS record, Traefik route, TLS certificate, or domain.
 */

import { createHash, randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import {
  isActivationRequest,
  isCommercialOutcomeEnvelope,
  isRecyclingRequest,
  type ActivationRequest,
  type CommercialOutcomeEnvelope,
  type RecyclingRequest,
} from '@linksites/types'
import {
  assertLiNKSitesLibraryConsumerPolicy,
  submitArchitectCandidate,
  type LibraryCandidateEntry,
  type LibraryCandidateSubmission,
  type PinnedLibraryCatalogReference,
} from './libraryConsumer.ts'
import { archiveAndReleaseExactFoundation, type ProspectAdaptation } from './prospectAdaptation.ts'
import type { ConversionLockRegistry } from './conversionLock.ts'
import type { FoundationReservationManager } from './reusableFoundation.ts'

export const SITE_LIFECYCLE_SCHEMA_VERSION = 1 as const

export type LifecycleStatus =
  | 'outcome_recorded'
  | 'awaiting_activation'
  | 'activation_dry_run_complete'
  | 'recycled'
  | 'retained'
  | 'abandoned'
  | 'manual_attention'

export type LifecycleReceiptKind =
  | 'outcome_recorded'
  | 'activation_step'
  | 'activation_rollback'
  | 'recycling'
  | 'retention'
  | 'architect_candidate'

export interface LifecycleReceipt {
  receiptId: string
  kind: LifecycleReceiptKind
  idempotencyKey: string
  subjectId: string
  mode: 'dry_run' | 'live'
  action: string
  status: 'accepted' | 'completed' | 'rolled_back' | 'failed' | 'skipped'
  createdAt: string
  details: Record<string, string | number | boolean | null>
}

export interface LifecycleRecord {
  schemaVersion: number
  lifecycleId: string
  orgId: string
  leadId: string
  siteId: string
  outcomeEventId: string
  /** The complete immutable commercial input makes replay equivalence auditable. */
  outcomeEnvelope: CommercialOutcomeEnvelope
  outcome: CommercialOutcomeEnvelope['outcome']
  reachAuthorizationReference: string
  status: LifecycleStatus
  retentionUntil: string | null
  activationRequest: ActivationRequest | null
  recyclingRequest: RecyclingRequest | null
  /** Immutable, completed proof from the no-sale recycle operation. */
  recycleEvidence: RecycleEvidence | null
  receipts: LifecycleReceipt[]
  refactoringRequests: RefactoringRequest[]
  candidateSubmissions: ArchitectCandidateSubmissionEvidence[]
  createdAt: string
  updatedAt: string
}

export interface RefactoringRequest {
  requestId: string
  lifecycleId: string
  siteId: string
  foundationId: string
  templateInventoryId: string
  status: 'ready_for_review'
  sanitizedDetails: Record<string, string | number | boolean | null>
  createdAt: string
}

export interface RecycleEvidence {
  adaptationId: string
  foundationId: string
  reservationId: string
  templateInventoryId: string
  sourceRunId: string
  qualityEvidenceReference: string
  passingTestEvidenceReference: string
  /** Resolved by the durable evidence authority, never supplied by Architect callers. */
  sourceEvidenceReference: string
  /** Values extracted by the verified durable evidence resolver for the privacy byte scan. */
  privacyScanValues: string[]
  recycleReceipt: LifecycleReceipt
}

export interface ArchitectCandidateSubmissionEvidence {
  candidateId: string
  lifecycleId: string
  proposalId: string
  canonicalCatalogCommitSha: string
  sourceRunIds: string[]
  sourceEvidenceReferences: string[]
  qualityEvidenceReferences: string[]
  commercialEvidenceReferences: string[]
  testEvidenceReferences: string[]
  submissionReceipt: LifecycleReceipt
  createdAt: string
}

export interface LifecycleStore {
  getByEventId(eventId: string): Promise<LifecycleRecord | null>
  getBySiteId(orgId: string, siteId: string): Promise<LifecycleRecord | null>
  save(record: LifecycleRecord): Promise<void>
}

export interface LifecyclePostgresExecutor {
  query(sql: string, params?: unknown[]): Promise<{ rows: Record<string, unknown>[] }>
}

/** Migration-owned lifecycle persistence. This adapter never creates or alters schema. */
export function createPostgresLifecycleStore(db: LifecyclePostgresExecutor): LifecycleStore {
  const readRecord = (value: unknown): LifecycleRecord | null => {
    if (!isLifecycleRecord(value)) throw new LifecycleError('Lifecycle persistence returned an invalid or inconsistent record.')
    return structuredClone(value)
  }
  return {
    async getByEventId(eventId) {
      const result = await db.query('select record from lsites_sites.lifecycle_records where outcome_event_id = $1', [eventId])
      return result.rows[0]?.record ? readRecord(result.rows[0].record) : null
    },
    async getBySiteId(orgId, siteId) {
      const result = await db.query('select record from lsites_sites.lifecycle_records where org_id = $1 and site_id = $2', [orgId, siteId])
      return result.rows[0]?.record ? readRecord(result.rows[0].record) : null
    },
    async save(record) {
      await db.query(`insert into lsites_sites.lifecycle_records
        (org_id, lifecycle_id, site_id, outcome_event_id, record, updated_at)
        values ($1,$2,$3,$4,$5,now())
        on conflict (org_id, lifecycle_id) do update set record = excluded.record,
          site_id = excluded.site_id, outcome_event_id = excluded.outcome_event_id, updated_at = now()`,
      [record.orgId, record.lifecycleId, record.siteId, record.outcomeEventId, JSON.stringify(record)])
    },
  }
}

export class InMemoryLifecycleStore implements LifecycleStore {
  private readonly byEventId = new Map<string, LifecycleRecord>()
  private readonly bySite = new Map<string, LifecycleRecord>()

  async getByEventId(eventId: string): Promise<LifecycleRecord | null> {
    return structuredClone(this.byEventId.get(eventId) ?? null)
  }

  async getBySiteId(orgId: string, siteId: string): Promise<LifecycleRecord | null> {
    return structuredClone(this.bySite.get(`${orgId}:${siteId}`) ?? null)
  }

  async save(record: LifecycleRecord): Promise<void> {
    const stored = structuredClone(record)
    this.byEventId.set(stored.outcomeEventId, stored)
    this.bySite.set(`${stored.orgId}:${stored.siteId}`, stored)
  }
}

/** Local durable store for the Phase 1 application boundary; atomic replace prevents partial receipts. */
export function createFileLifecycleStore(directory: string): LifecycleStore {
  if (!directory.trim()) throw new LifecycleError('A lifecycle storage directory is required.')
  const pathFor = (orgId: string, siteId: string) => join(directory, `${digest(`${orgId}:${siteId}`)}.json`)
  return {
    async getByEventId(eventId) {
      const files = await listRecords(directory)
      for (const file of files) {
        const candidate = await readLifecycleFile(join(directory, file))
        if (candidate?.outcomeEventId === eventId) return candidate
      }
      return null
    },
    async getBySiteId(orgId, siteId) {
      return readLifecycleFile(pathFor(orgId, siteId))
    },
    async save(record) {
      await mkdir(directory, { recursive: true })
      const destination = pathFor(record.orgId, record.siteId)
      const temporary = `${destination}.tmp-${process.pid}-${randomUUID()}`
      await writeFile(temporary, JSON.stringify(record), 'utf8')
      await rename(temporary, destination)
    },
  }
}

async function listRecords(directory: string): Promise<string[]> {
  try {
    const { readdir } = await import('node:fs/promises')
    return (await readdir(directory)).filter((name) => name.endsWith('.json'))
  } catch (error) {
    if (isErrno(error, 'ENOENT')) return []
    throw error
  }
}

async function readLifecycleFile(path: string): Promise<LifecycleRecord | null> {
  try {
    const parsed: unknown = JSON.parse(await readFile(path, 'utf8'))
    if (!isLifecycleRecord(parsed)) throw new LifecycleError(`Lifecycle storage record "${path}" has an invalid schema.`)
    return parsed
  } catch (error) {
    if (isErrno(error, 'ENOENT')) return null
    if (error instanceof LifecycleError) throw error
    throw new LifecycleError(`Lifecycle storage record "${path}" is unreadable or invalid.`)
  }
}

function isErrno(error: unknown, code: string): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error && (error as NodeJS.ErrnoException).code === code
}

const isNonEmpty = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0
const isIso = (value: unknown): value is string => isNonEmpty(value) && !Number.isNaN(Date.parse(value))
const isDetails = (value: unknown): value is Record<string, string | number | boolean | null> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value) && Object.values(value as Record<string, unknown>).every((item) => item === null || ['string', 'number', 'boolean'].includes(typeof item) && (typeof item !== 'number' || Number.isFinite(item)))
function isLifecycleReceipt(value: unknown): value is LifecycleReceipt {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const receipt = value as LifecycleReceipt
  return isNonEmpty(receipt.receiptId) && ['outcome_recorded', 'activation_step', 'activation_rollback', 'recycling', 'retention', 'architect_candidate'].includes(receipt.kind) &&
    isNonEmpty(receipt.idempotencyKey) && isNonEmpty(receipt.subjectId) && ['dry_run', 'live'].includes(receipt.mode) && isNonEmpty(receipt.action) &&
    ['accepted', 'completed', 'rolled_back', 'failed', 'skipped'].includes(receipt.status) && isIso(receipt.createdAt) && isDetails(receipt.details)
}
function isRefactoringRequest(value: unknown): value is RefactoringRequest {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const request = value as RefactoringRequest
  return isNonEmpty(request.requestId) && isNonEmpty(request.lifecycleId) && isNonEmpty(request.siteId) && isNonEmpty(request.foundationId) && isNonEmpty(request.templateInventoryId) && request.status === 'ready_for_review' && isDetails(request.sanitizedDetails) && isIso(request.createdAt)
}
function isCandidateSubmissionEvidence(value: unknown): value is ArchitectCandidateSubmissionEvidence {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const evidence = value as ArchitectCandidateSubmissionEvidence
  return isNonEmpty(evidence.candidateId) && isNonEmpty(evidence.lifecycleId) && isNonEmpty(evidence.proposalId) && /^[a-f0-9]{40}$/.test(evidence.canonicalCatalogCommitSha) &&
    [evidence.sourceRunIds, evidence.sourceEvidenceReferences, evidence.qualityEvidenceReferences, evidence.commercialEvidenceReferences, evidence.testEvidenceReferences].every((items) => Array.isArray(items) && items.length > 0 && items.every(isNonEmpty)) && isLifecycleReceipt(evidence.submissionReceipt) && isIso(evidence.createdAt)
}
function isRecycleEvidence(value: unknown): value is RecycleEvidence {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const evidence = value as RecycleEvidence
  return isNonEmpty(evidence.adaptationId) && isNonEmpty(evidence.foundationId) && isNonEmpty(evidence.reservationId) && isNonEmpty(evidence.templateInventoryId) && isNonEmpty(evidence.sourceRunId) && isNonEmpty(evidence.sourceEvidenceReference) && isNonEmpty(evidence.qualityEvidenceReference) && isNonEmpty(evidence.passingTestEvidenceReference) && Array.isArray(evidence.privacyScanValues) && evidence.privacyScanValues.every(isNonEmpty) && isLifecycleReceipt(evidence.recycleReceipt)
}
function isLifecycleRecord(value: unknown): value is LifecycleRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as LifecycleRecord
  return record.schemaVersion === SITE_LIFECYCLE_SCHEMA_VERSION && isNonEmpty(record.lifecycleId) && isNonEmpty(record.orgId) && isNonEmpty(record.leadId) && isNonEmpty(record.siteId) &&
    isNonEmpty(record.outcomeEventId) && isCommercialOutcomeEnvelope(record.outcomeEnvelope) && record.outcomeEventId === record.outcomeEnvelope.replay_protection.event_id && record.orgId === record.outcomeEnvelope.org_id && record.leadId === record.outcomeEnvelope.lead_id && record.siteId === record.outcomeEnvelope.site_id && record.outcome === record.outcomeEnvelope.outcome && record.reachAuthorizationReference === record.outcomeEnvelope.reach_authorization_reference &&
    ['outcome_recorded', 'awaiting_activation', 'activation_dry_run_complete', 'recycled', 'retained', 'abandoned', 'manual_attention'].includes(record.status) && (record.retentionUntil === null || isIso(record.retentionUntil)) && (record.activationRequest === null || isActivationRequest(record.activationRequest)) && (record.recyclingRequest === null || isRecyclingRequest(record.recyclingRequest)) && (record.recycleEvidence === null || isRecycleEvidence(record.recycleEvidence)) && Array.isArray(record.receipts) && record.receipts.every(isLifecycleReceipt) && Array.isArray(record.refactoringRequests) && record.refactoringRequests.every(isRefactoringRequest) && Array.isArray(record.candidateSubmissions) && record.candidateSubmissions.every(isCandidateSubmissionEvidence) && isIso(record.createdAt) && isIso(record.updatedAt) && hasConsistentLifecycleInvariants(record)
}

/** Reject records whose individually-valid nested objects belong to another lifecycle. */
function hasConsistentLifecycleInvariants(record: LifecycleRecord): boolean {
  const outcomeReceipt = record.receipts.find((entry) => entry.kind === 'outcome_recorded')
  if (!outcomeReceipt || record.receipts.filter((entry) => entry.kind === 'outcome_recorded').length !== 1 || outcomeReceipt.subjectId !== record.siteId || outcomeReceipt.idempotencyKey !== record.outcomeEnvelope.idempotency_key || outcomeReceipt.action !== `outcome.${record.outcome}` || outcomeReceipt.status !== 'accepted' || outcomeReceipt.mode !== 'dry_run' || outcomeReceipt.details.eventId !== record.outcomeEventId) return false
  // Phase 1 records dry-runs only. A retained live receipt is an invalid
  // lifecycle record, not evidence that a public operation may proceed.
  if (record.receipts.some((entry) => entry.mode !== 'dry_run')) return false
  if (record.activationRequest && (record.activationRequest.org_id !== record.orgId || record.activationRequest.lead_id !== record.leadId || record.activationRequest.site_id !== record.siteId || record.activationRequest.reach_authorization_reference !== record.reachAuthorizationReference || record.outcome !== 'sold')) return false
  if (record.recyclingRequest && (record.recyclingRequest.org_id !== record.orgId || record.recyclingRequest.lead_id !== record.leadId || record.recyclingRequest.site_id !== record.siteId || record.recyclingRequest.reason !== 'no_sale')) return false
  if (record.status === 'recycled') {
    if (record.outcome !== 'no_sale' || !record.recyclingRequest || !record.recycleEvidence) return false
    const evidence = record.recycleEvidence
    const release = record.receipts.find((entry) => entry.receiptId === evidence.recycleReceipt.receiptId)
    if (!release || !sameCanonicalValue(release, evidence.recycleReceipt) || release.kind !== 'recycling' || release.action !== 'inventory.release' || release.status !== 'completed' || release.mode !== 'dry_run' || release.subjectId !== record.siteId || release.idempotencyKey !== record.recyclingRequest.idempotency_key || release.details.adaptationId !== evidence.adaptationId || release.details.foundationId !== evidence.foundationId || release.details.reservationId !== evidence.reservationId || release.details.inventoryId !== evidence.templateInventoryId || release.details.publicMutation !== false) return false
  } else if (record.status === 'manual_attention' && record.recyclingRequest) {
    // A no-sale quarantine can succeed while the exact inventory release (or
    // its required post-release readback) fails.  This is the one incomplete
    // recycle state that may be retained: it preserves the successful
    // quarantine proof and the failed release proof for a human to resolve,
    // but never represents a completed recycle or permits Architect use.
    if (record.outcome !== 'no_sale' || record.recycleEvidence || !isManualRecycleReleaseFailure(record)) return false
  } else if (record.recyclingRequest || record.recycleEvidence) return false
  for (const refactor of record.refactoringRequests) {
    if (refactor.lifecycleId !== record.lifecycleId || refactor.siteId !== record.siteId || record.status !== 'recycled' || !record.recycleEvidence || refactor.foundationId !== record.recycleEvidence.foundationId || refactor.templateInventoryId !== record.recycleEvidence.templateInventoryId) return false
  }
  for (const candidate of record.candidateSubmissions) {
    if (record.status !== 'recycled' || record.outcome !== 'no_sale' || !record.recycleEvidence || candidate.lifecycleId !== record.lifecycleId || candidate.submissionReceipt.subjectId !== record.siteId || candidate.submissionReceipt.kind !== 'architect_candidate' || candidate.submissionReceipt.action !== 'linklibraries.submitArchitectCandidate' || candidate.submissionReceipt.status !== 'accepted' || candidate.submissionReceipt.mode !== 'dry_run' || candidate.submissionReceipt.idempotencyKey !== `candidate:${candidate.proposalId}` || candidate.submissionReceipt.details.submissionReference !== candidate.proposalId || candidate.submissionReceipt.details.publicMutation !== false || !record.receipts.some((receipt) => sameCanonicalValue(receipt, candidate.submissionReceipt)) || !candidate.sourceRunIds.includes(record.recycleEvidence.sourceRunId) || !candidate.qualityEvidenceReferences.includes(record.recycleEvidence.qualityEvidenceReference) || !candidate.testEvidenceReferences.includes(record.recycleEvidence.passingTestEvidenceReference) || !candidate.commercialEvidenceReferences.includes(record.outcomeEventId)) return false
  }
  if (record.status === 'activation_dry_run_complete' && (!record.activationRequest || record.outcome !== 'sold')) return false
  if (record.status === 'awaiting_activation' && (record.outcome !== 'sold' || record.activationRequest !== null)) return false
  if (record.status === 'outcome_recorded' && (record.outcome !== 'no_sale' || record.activationRequest !== null)) return false
  if (record.status === 'retained' && record.outcome !== 'deferred') return false
  if (record.status === 'abandoned' && record.outcome !== 'abandoned') return false
  for (const nested of record.receipts) {
    if (nested.subjectId !== record.siteId) return false
    if (nested.kind === 'activation_step' || nested.kind === 'activation_rollback') {
      if (isActivationExecutionFailureReceipt(nested, record)) continue
      if (!record.activationRequest || nested.idempotencyKey !== record.activationRequest.idempotency_key || nested.mode !== 'dry_run' || !/^(payload|private_wall|domain|dns|route|tls|health)\.(execute|rollback)$/.test(nested.action)) return false
    }
    if (nested.kind === 'recycling') {
      if (record.recyclingRequest) {
        if (nested.idempotencyKey !== record.recyclingRequest.idempotency_key || nested.mode !== 'dry_run') return false
      } else if (nested.status !== 'failed' || nested.action !== 'inventory.binding') return false
    }
    if (nested.kind === 'architect_candidate' && !record.candidateSubmissions.some((candidate) => candidate.submissionReceipt.receiptId === nested.receiptId)) return false
  }
  return true
}

/** The only incomplete recycle state that may survive a restart. */
function isManualRecycleReleaseFailure(record: LifecycleRecord): boolean {
  const request = record.recyclingRequest
  if (!request || record.status !== 'manual_attention') return false
  const quarantines = record.receipts.filter((entry) =>
    entry.kind === 'recycling' &&
    entry.action === 'content.quarantine' &&
    entry.status === 'completed' &&
    entry.mode === 'dry_run' &&
    entry.subjectId === record.siteId &&
    entry.idempotencyKey === request.idempotency_key &&
    entry.details.publicMutation === false &&
    entry.details.leadContentRetained === false &&
    entry.details.leadContentRemoved === true &&
    entry.details.templateInventoryId === request.template_inventory_id &&
    isNonEmpty(entry.details.adaptationId) &&
    isNonEmpty(entry.details.foundationId) &&
    isNonEmpty(entry.details.reservationId),
  )
  const releaseFailures = record.receipts.filter((entry) =>
    entry.kind === 'recycling' &&
    entry.action === 'inventory.release' &&
    entry.status === 'failed' &&
    entry.mode === 'dry_run' &&
    entry.subjectId === record.siteId &&
    entry.idempotencyKey === request.idempotency_key &&
    Object.keys(entry.details).length === 2 &&
    entry.details.publicMutation === false &&
    entry.details.errorRecorded === true,
  )
  return quarantines.length === 1 && releaseFailures.length === 1 &&
    record.receipts.filter((entry) => entry.kind === 'recycling').length === 2
}

/** The only synthetic activation failure receipt written by this service. */
function isActivationExecutionFailureReceipt(receipt: LifecycleReceipt, record: LifecycleRecord): boolean {
  return receipt.kind === 'activation_step' &&
    receipt.action === 'activation.execution' &&
    receipt.status === 'failed' &&
    receipt.mode === 'dry_run' &&
    record.status === 'manual_attention' &&
    Boolean(record.activationRequest) &&
    receipt.idempotencyKey === record.activationRequest?.idempotency_key &&
    receipt.subjectId === record.siteId &&
    Object.keys(receipt.details).length === 2 &&
    receipt.details.publicMutation === false &&
    receipt.details.errorRecorded === true
}

export interface LiNKreachAuthorizationVerifier {
  verify(input: { orgId: string; leadId: string; siteId: string; reference: string; capability: 'outcome' | 'activation' }): Promise<boolean>
}

/** Resolves evidence against the durable run/quality/test authority, not caller strings. */
export interface LifecycleEvidenceVerifier {
  resolveCompletedRecycleEvidence(input: { orgId: string; siteId: string; sourceRunId: string; qualityEvidenceReference: string; passingTestEvidenceReference: string }): Promise<VerifiedRecycleEvidence | null>
}

/** The only evidence shape that may cross into an Architect proposal. */
export interface VerifiedRecycleEvidence {
  sourceRunId: string
  sourceEvidenceReference: string
  qualityEvidenceReference: string
  passingTestEvidenceReference: string
  /** Durable, verified sensitive values used for byte-level privacy scanning. */
  privacyScanValues: string[]
}

export interface ActivationProvider {
  readonly providerName: 'payload' | 'private_wall' | 'domain' | 'dns' | 'route' | 'tls' | 'health'
  execute(input: { lifecycle: LifecycleRecord; request: ActivationRequest; idempotencyKey: string; mode: 'dry_run' }): Promise<LifecycleReceipt>
  rollback(input: { lifecycle: LifecycleRecord; request: ActivationRequest; idempotencyKey: string; mode: 'dry_run' }): Promise<LifecycleReceipt>
}

const ACTIVATION_PROVIDER_NAMES: ActivationProvider['providerName'][] = ['payload', 'private_wall', 'domain', 'dns', 'route', 'tls', 'health']

/** A recorded/sandbox provider. It cannot perform network or public side effects by construction. */
export class DryRunActivationProvider implements ActivationProvider {
  constructor(readonly providerName: ActivationProvider['providerName']) {}

  async execute(input: { lifecycle: LifecycleRecord; request: ActivationRequest; idempotencyKey: string; mode: 'dry_run' }): Promise<LifecycleReceipt> {
    return receipt('activation_step', input.idempotencyKey, input.lifecycle.siteId, 'dry_run', `${this.providerName}.execute`, 'completed', {
      domain: input.request.publication.domain ?? null,
      publicMutation: false,
      provider: this.providerName,
    })
  }

  async rollback(input: { lifecycle: LifecycleRecord; request: ActivationRequest; idempotencyKey: string; mode: 'dry_run' }): Promise<LifecycleReceipt> {
    return receipt('activation_rollback', input.idempotencyKey, input.lifecycle.siteId, 'dry_run', `${this.providerName}.rollback`, 'rolled_back', {
      publicMutation: false,
      provider: this.providerName,
    })
  }
}

export function createPhaseOneActivationProviders(): ActivationProvider[] {
  return ACTIVATION_PROVIDER_NAMES.map((providerName) => new DryRunActivationProvider(providerName))
}

export interface RecyclingContext {
  request: RecyclingRequest
  adaptation: ProspectAdaptation
  reservations: FoundationReservationManager
  conversionLocks: ConversionLockRegistry
  /** Immutable binding recorded by the inventory/adaptation assembly path. */
  inventoryBinding: { templateInventoryId: string; adaptationId: string; foundationId: string; reservationId: string }
  /** Completed source run and its actual accepted quality/test evidence. */
  completedEvidence: { sourceRunId: string; qualityEvidenceReference: string; passingTestEvidenceReference: string }
  /** Removes lead-specific working/Payload references from active use; must return a receipt, not raw data. */
  quarantineLeadContent(): Promise<LifecycleReceipt>
}

export type CandidateAssetKind = 'component' | 'layout' | 'pattern' | 'vertical_asset'

export interface ArchitectInput {
  orgId: string
  siteId: string
  /** This is metadata only; bytes must have their own SHA-256 in candidate.files. */
  assetPreview: Record<string, unknown>
  /** Exact candidate bytes, keyed by candidate.files path, not caller-provided metadata. */
  candidateFileContents: Record<string, string>
  catalogReference: PinnedLibraryCatalogReference
  candidate: LibraryCandidateEntry
}

/** Injectable only to make the fail-closed Architect boundary independently testable. */
export type ArchitectCandidateSubmitter = typeof submitArchitectCandidate

export class LifecycleError extends Error {}

export class SiteLifecycleService {
  constructor(
    private readonly store: LifecycleStore,
    private readonly authorization: LiNKreachAuthorizationVerifier,
    private readonly activationProviders: ActivationProvider[] = createPhaseOneActivationProviders(),
    private readonly evidenceVerifier?: LifecycleEvidenceVerifier,
    private readonly architectCandidateSubmitter: ArchitectCandidateSubmitter = submitArchitectCandidate,
  ) {
    const providerNames = new Set(activationProviders.map((provider) => provider.providerName))
    if (activationProviders.length !== ACTIVATION_PROVIDER_NAMES.length || providerNames.size !== ACTIVATION_PROVIDER_NAMES.length || ACTIVATION_PROVIDER_NAMES.some((name) => !providerNames.has(name))) {
      throw new LifecycleError('Phase 1 activation requires exactly the approved Payload, private-wall, domain, DNS, route, TLS, and health dry-run providers.')
    }
  }

  async recordOutcome(envelope: CommercialOutcomeEnvelope): Promise<LifecycleRecord> {
    if (!isCommercialOutcomeEnvelope(envelope)) throw new LifecycleError('Commercial outcome envelope failed canonical contract validation.')
    const prior = await this.store.getByEventId(envelope.replay_protection.event_id)
    if (prior) {
      if (sameCanonicalValue(prior.outcomeEnvelope, envelope)) return prior
      throw new LifecycleError('Commercial outcome replay event conflicts with the prior immutable outcome record.')
    }
    if (!(await this.authorization.verify({ orgId: envelope.org_id, leadId: envelope.lead_id, siteId: envelope.site_id, reference: envelope.reach_authorization_reference, capability: 'outcome' }))) {
      throw new LifecycleError('LiNKreach outcome authorization was denied.')
    }
    const existing = await this.store.getBySiteId(envelope.org_id, envelope.site_id)
    if (existing && existing.outcomeEventId !== envelope.replay_protection.event_id) throw new LifecycleError('A different commercial outcome already governs this site; manual attention is required.')
    const now = new Date().toISOString()
    const retentionUntil = envelope.outcome === 'deferred' ? addDays(now, 30) : envelope.outcome === 'abandoned' ? addDays(now, 90) : null
    const status: LifecycleStatus = envelope.outcome === 'sold' ? 'awaiting_activation' : envelope.outcome === 'no_sale' ? 'outcome_recorded' : envelope.outcome === 'deferred' ? 'retained' : 'abandoned'
    const record: LifecycleRecord = {
      schemaVersion: SITE_LIFECYCLE_SCHEMA_VERSION,
      lifecycleId: randomUUID(), orgId: envelope.org_id, leadId: envelope.lead_id, siteId: envelope.site_id,
      outcomeEventId: envelope.replay_protection.event_id, outcomeEnvelope: structuredClone(envelope), outcome: envelope.outcome,
      reachAuthorizationReference: envelope.reach_authorization_reference, status, retentionUntil, activationRequest: null,
      recyclingRequest: null, recycleEvidence: null,
      receipts: [receipt('outcome_recorded', envelope.idempotency_key, envelope.site_id, 'dry_run', `outcome.${envelope.outcome}`, 'accepted', { eventId: envelope.replay_protection.event_id })],
      refactoringRequests: [], candidateSubmissions: [],
      createdAt: now, updatedAt: now,
    }
    await this.store.save(record)
    return record
  }

  /** Executes a full activation graph only as a Phase 1 dry-run, even after a valid sale authorization. */
  async dryRunActivation(request: ActivationRequest): Promise<LifecycleRecord> {
    if (!isActivationRequest(request)) throw new LifecycleError('Activation request failed canonical contract validation.')
    const lifecycle = await this.store.getBySiteId(request.org_id, request.site_id)
    if (!lifecycle || lifecycle.outcome !== 'sold') throw new LifecycleError('Activation requires a previously authorized sold outcome.')
    if (lifecycle.leadId !== request.lead_id || lifecycle.reachAuthorizationReference !== request.reach_authorization_reference) throw new LifecycleError('Activation request does not match the authorized commercial outcome.')
    if (!(await this.authorization.verify({ orgId: request.org_id, leadId: request.lead_id, siteId: request.site_id, reference: request.reach_authorization_reference, capability: 'activation' }))) throw new LifecycleError('LiNKreach activation authorization was denied.')
    if (lifecycle.status === 'activation_dry_run_complete') return lifecycle
    // Persist this parent binding as part of any failure evidence too.
    lifecycle.activationRequest = structuredClone(request)
    const receipts: LifecycleReceipt[] = []
    const attemptedProviders: ActivationProvider[] = []
    try {
      for (const provider of this.activationProviders) {
        // A provider may have changed its sandbox state before returning a
        // malformed receipt, so it belongs in the compensating set first.
        attemptedProviders.push(provider)
        const providerReceipt = await provider.execute({ lifecycle, request, idempotencyKey: request.idempotency_key, mode: 'dry_run' })
        assertActivationReceipt(providerReceipt, provider.providerName, lifecycle.siteId, request.idempotency_key, 'execute')
        receipts.push(providerReceipt)
      }
    } catch (error) {
      receipts.push(receipt('activation_step', request.idempotency_key, lifecycle.siteId, 'dry_run', 'activation.execution', 'failed', { publicMutation: false, errorRecorded: true }))
      let rollbackFailure = false
      for (const provider of [...attemptedProviders].reverse()) {
        try {
          const rollbackReceipt = await provider.rollback({ lifecycle, request, idempotencyKey: request.idempotency_key, mode: 'dry_run' })
          assertActivationReceipt(rollbackReceipt, provider.providerName, lifecycle.siteId, request.idempotency_key, 'rollback')
          receipts.push(rollbackReceipt)
        } catch {
          rollbackFailure = true
          receipts.push(receipt('activation_rollback', request.idempotency_key, lifecycle.siteId, 'dry_run', `${provider.providerName}.rollback`, 'failed', { publicMutation: false, provider: provider.providerName, errorRecorded: true }))
        }
      }
      lifecycle.status = 'manual_attention'
      lifecycle.receipts.push(...receipts)
      lifecycle.updatedAt = new Date().toISOString()
      await this.store.save(lifecycle)
      throw new LifecycleError(`Activation dry-run failed${rollbackFailure ? ' and rollback also failed' : ''}; execution and rollback evidence were recorded: ${error instanceof Error ? error.message : 'unknown error'}`)
    }
    lifecycle.status = 'activation_dry_run_complete'
    lifecycle.receipts.push(...receipts)
    lifecycle.updatedAt = new Date().toISOString()
    await this.store.save(lifecycle)
    return lifecycle
  }

  async recycleNoSale(context: RecyclingContext): Promise<LifecycleRecord> {
    if (!isRecyclingRequest(context.request)) throw new LifecycleError('Recycling request failed canonical contract validation.')
    const lifecycle = await this.store.getBySiteId(context.request.org_id, context.request.site_id)
    if (!lifecycle || lifecycle.outcome !== 'no_sale') throw new LifecycleError('Recycling requires an authorized no_sale outcome.')
    if (lifecycle.status === 'recycled') return lifecycle
    if (lifecycle.leadId !== context.request.lead_id) throw new LifecycleError('Recycling request does not match the original lead.')
    let verifiedEvidence: VerifiedRecycleEvidence
    try {
      assertRecyclingBinding(lifecycle, context)
      const resolved = this.evidenceVerifier && await this.evidenceVerifier.resolveCompletedRecycleEvidence({ orgId: lifecycle.orgId, siteId: lifecycle.siteId, ...context.completedEvidence })
      if (!resolved || !sameCanonicalValue({ ...context.completedEvidence }, { sourceRunId: resolved.sourceRunId, qualityEvidenceReference: resolved.qualityEvidenceReference, passingTestEvidenceReference: resolved.passingTestEvidenceReference }) || !isNonEmpty(resolved.sourceEvidenceReference) || !Array.isArray(resolved.privacyScanValues) || !resolved.privacyScanValues.every(isNonEmpty)) throw new LifecycleError('No-sale recycling evidence did not resolve to the exact completed durable run, semantic quality/test gates, and privacy scan values.')
      verifiedEvidence = structuredClone(resolved)
    } catch (error) {
      await recordManualAttention(this.store, lifecycle, context.request.idempotency_key, 'inventory.binding')
      throw error
    }
    // Check the conversion lock before touching prospect content. A sold/locked
    // site must be left completely unchanged if a stale no-sale request arrives.
    context.conversionLocks.assertRecycleAllowed(context.adaptation.foundationId)
    const quarantine = await context.quarantineLeadContent()
    assertQuarantineReceipt(quarantine, lifecycle, context)
    let released: { release: { reservationId: string; foundationId: string; status: 'released' } }
    try {
      released = archiveAndReleaseExactFoundation(context.adaptation, context.reservations, context.conversionLocks)
    } catch (error) {
      await recordRecycleReleaseFailure(this.store, lifecycle, context.request, quarantine)
      throw error
    }
    if (released.release.status !== 'released' || released.release.reservationId !== context.adaptation.reservationId || released.release.foundationId !== context.adaptation.foundationId) {
      await recordRecycleReleaseFailure(this.store, lifecycle, context.request, quarantine)
      throw new LifecycleError('No-sale recycling requires a successful exact inventory release result.')
    }
    const recycleReceipt = receipt('recycling', context.request.idempotency_key, lifecycle.siteId, 'dry_run', 'inventory.release', 'completed', { inventoryId: context.request.template_inventory_id, foundationId: context.adaptation.foundationId, reservationId: released.release.reservationId, adaptationId: context.adaptation.adaptationId, leadContentRetained: false, publicMutation: false })
    lifecycle.status = 'recycled'
    lifecycle.recyclingRequest = structuredClone(context.request)
    lifecycle.recycleEvidence = { adaptationId: context.adaptation.adaptationId, foundationId: context.adaptation.foundationId, reservationId: released.release.reservationId, templateInventoryId: context.request.template_inventory_id, sourceRunId: verifiedEvidence.sourceRunId, sourceEvidenceReference: verifiedEvidence.sourceEvidenceReference, qualityEvidenceReference: verifiedEvidence.qualityEvidenceReference, passingTestEvidenceReference: verifiedEvidence.passingTestEvidenceReference, privacyScanValues: [...new Set(verifiedEvidence.privacyScanValues)], recycleReceipt }
    const refactoringRequest: RefactoringRequest = { requestId: `refactor:${randomUUID()}`, lifecycleId: lifecycle.lifecycleId, siteId: lifecycle.siteId, foundationId: context.adaptation.foundationId, templateInventoryId: context.request.template_inventory_id, status: 'ready_for_review', sanitizedDetails: { outcome: 'no_sale', inventoryReleased: true, leadContentRemoved: true, publicMutation: false }, createdAt: new Date().toISOString() }
    lifecycle.receipts.push(quarantine, recycleReceipt)
    lifecycle.refactoringRequests.push(refactoringRequest)
    lifecycle.updatedAt = new Date().toISOString()
    await this.store.save(lifecycle)
    return lifecycle
  }

  /** Deferred/abandoned records have one bounded retention date; this does not poll or perform actions indefinitely. */
  async expireRetention(orgId: string, siteId: string, now = new Date()): Promise<LifecycleRecord | null> {
    const lifecycle = await this.store.getBySiteId(orgId, siteId)
    if (!lifecycle || !lifecycle.retentionUntil || new Date(lifecycle.retentionUntil).getTime() > now.getTime()) return lifecycle
    lifecycle.retentionUntil = null
    lifecycle.status = 'manual_attention'
    lifecycle.receipts.push(receipt('retention', `retention:${lifecycle.lifecycleId}`, lifecycle.siteId, 'dry_run', 'retention.expired', 'completed', { automaticRetry: false }))
    lifecycle.updatedAt = now.toISOString()
    await this.store.save(lifecycle)
    return lifecycle
  }

  async proposeArchitectCandidate(input: ArchitectInput): Promise<{ submission: LibraryCandidateSubmission; receipt: LifecycleReceipt }> {
    const lifecycle = await this.store.getBySiteId(input.orgId, input.siteId)
    if (!lifecycle || lifecycle.outcome !== 'no_sale' || lifecycle.status !== 'recycled' || !lifecycle.recycleEvidence || !lifecycle.recyclingRequest) throw new LifecycleError('LiNKsites Architect requires a persisted, completed no_sale lifecycle.')
    assertArchitectEvidenceBoundToLifecycle(input, lifecycle)
    if (input.candidate.status !== 'candidate' || !isRedistributableSpdx(input.candidate.license.spdx) || !input.candidate.license.redistributionAllowed) throw new LifecycleError('LiNKsites Architect requires a known redistributable SPDX candidate asset only.')
    if (!isRuntimeCompatible(input.candidate.compatibility.node, input.candidate.compatibility.runtimes)) throw new LifecycleError('LiNKsites Architect candidate is not compatible with the LiNKsites Node 22 browser runtime.')
    const privacyValues = lifecycle.recycleEvidence.privacyScanValues
    assertCandidateBytes(input.candidate, input.candidateFileContents, privacyValues)
    if (containsProspectData(input.assetPreview, privacyValues) || containsLeadValues(candidateHumanText(input.candidate), privacyValues)) throw new LifecycleError('Reusable candidate contains lead/customer data and cannot be submitted.')
    try { assertLiNKSitesLibraryConsumerPolicy({ ...input.candidate, status: 'approved' }) } catch (error) { throw new LifecycleError(`LiNKsites Architect candidate failed LiNKlibraries contract validation: ${error instanceof Error ? error.message : 'invalid candidate'}`) }
    let submission: LibraryCandidateSubmission
    try { submission = this.architectCandidateSubmitter({ catalogReference: input.catalogReference, candidate: structuredClone(input.candidate) }) } catch (error) { throw new LifecycleError(`LiNKsites Architect governed submission was rejected: ${error instanceof Error ? error.message : 'unknown rejection'}`) }
    const lifecycleCandidateId = `architect:${submission.proposalId}`
    const submissionReceipt = receipt('architect_candidate', `candidate:${submission.proposalId}`, lifecycle.siteId, 'dry_run', 'linklibraries.submitArchitectCandidate', 'accepted', { submissionReference: submission.proposalId, canonicalAssetChanged: false, publicMutation: false })
    lifecycle.receipts.push(submissionReceipt)
    lifecycle.candidateSubmissions.push({ candidateId: lifecycleCandidateId, lifecycleId: lifecycle.lifecycleId, proposalId: submission.proposalId, canonicalCatalogCommitSha: submission.canonicalCatalogCommitSha, sourceRunIds: [lifecycle.recycleEvidence.sourceRunId], sourceEvidenceReferences: [lifecycle.recycleEvidence.sourceEvidenceReference], qualityEvidenceReferences: [lifecycle.recycleEvidence.qualityEvidenceReference], commercialEvidenceReferences: [lifecycle.outcomeEventId], testEvidenceReferences: [lifecycle.recycleEvidence.passingTestEvidenceReference], submissionReceipt, createdAt: new Date().toISOString() })
    lifecycle.updatedAt = new Date().toISOString()
    await this.store.save(lifecycle)
    return { submission, receipt: submissionReceipt }
  }
}

function receipt(kind: LifecycleReceiptKind, idempotencyKey: string, subjectId: string, mode: 'dry_run' | 'live', action: string, status: LifecycleReceipt['status'], details: Record<string, string | number | boolean | null>): LifecycleReceipt {
  return { receiptId: randomUUID(), kind, idempotencyKey, subjectId, mode, action, status, details, createdAt: new Date().toISOString() }
}

/** Phase 1 accepts only the exact recorded/sandbox receipt for each provider. */
function assertActivationReceipt(value: LifecycleReceipt, provider: ActivationProvider['providerName'], siteId: string, idempotencyKey: string, operation: 'execute' | 'rollback'): void {
  if (!isLifecycleReceipt(value) || value.kind !== (operation === 'execute' ? 'activation_step' : 'activation_rollback') || value.mode !== 'dry_run' || value.subjectId !== siteId || value.idempotencyKey !== idempotencyKey || value.action !== `${provider}.${operation}` || value.status !== (operation === 'execute' ? 'completed' : 'rolled_back') || value.details.publicMutation !== false || value.details.provider !== provider) {
    throw new LifecycleError(`Activation provider ${provider} returned a non-Phase-1 ${operation} receipt.`)
  }
}

function assertQuarantineReceipt(value: LifecycleReceipt, lifecycle: LifecycleRecord, context: RecyclingContext): void {
  if (!isLifecycleReceipt(value) || value.kind !== 'recycling' || value.mode !== 'dry_run' || value.status !== 'completed' || value.subjectId !== lifecycle.siteId || value.idempotencyKey !== context.request.idempotency_key || value.action !== 'content.quarantine' || value.details.publicMutation !== false || value.details.leadContentRetained !== false || value.details.leadContentRemoved !== true || value.details.adaptationId !== context.adaptation.adaptationId || value.details.foundationId !== context.adaptation.foundationId || value.details.reservationId !== context.adaptation.reservationId || value.details.templateInventoryId !== context.request.template_inventory_id) {
    throw new LifecycleError('No-sale recycling requires a matching Phase-1 dry-run quarantine receipt with a completed lead-content removal proof.')
  }
}

function assertRecyclingBinding(lifecycle: LifecycleRecord, context: RecyclingContext): void {
  const { request, adaptation, inventoryBinding, completedEvidence, reservations } = context
  if (request.org_id !== lifecycle.orgId || request.site_id !== lifecycle.siteId || request.lead_id !== lifecycle.leadId ||
    inventoryBinding.templateInventoryId !== request.template_inventory_id || inventoryBinding.adaptationId !== adaptation.adaptationId || inventoryBinding.foundationId !== adaptation.foundationId || inventoryBinding.reservationId !== adaptation.reservationId ||
    !isNonEmpty(completedEvidence.sourceRunId) || !isNonEmpty(completedEvidence.qualityEvidenceReference) || !isNonEmpty(completedEvidence.passingTestEvidenceReference)) {
    throw new LifecycleError('No-sale recycling inventory/adaptation/evidence binding is invalid; manual attention is required.')
  }
  const active = reservations.getActiveReservation(adaptation.foundationId)
  if (!active || active.reservationId !== adaptation.reservationId || active.foundationId !== adaptation.foundationId) {
    throw new LifecycleError('No-sale recycling requires the exact active reservation; inventory has changed and needs manual attention.')
  }
}

async function recordManualAttention(store: LifecycleStore, lifecycle: LifecycleRecord, idempotencyKey: string, action: string): Promise<void> {
  lifecycle.status = 'manual_attention'
  lifecycle.receipts.push(receipt('recycling', idempotencyKey, lifecycle.siteId, 'dry_run', action, 'failed', { publicMutation: false, errorRecorded: true }))
  lifecycle.updatedAt = new Date().toISOString()
  await store.save(lifecycle)
}

/**
 * Records a quarantine that really completed before the inventory operation
 * failed.  `recycleEvidence` intentionally remains null: there is no release
 * receipt and therefore no completed recycle to reuse or submit as a library
 * candidate.
 */
async function recordRecycleReleaseFailure(store: LifecycleStore, lifecycle: LifecycleRecord, request: RecyclingRequest, quarantine: LifecycleReceipt): Promise<void> {
  lifecycle.status = 'manual_attention'
  lifecycle.recyclingRequest = structuredClone(request)
  lifecycle.receipts.push(quarantine, receipt('recycling', request.idempotency_key, lifecycle.siteId, 'dry_run', 'inventory.release', 'failed', { publicMutation: false, errorRecorded: true }))
  lifecycle.updatedAt = new Date().toISOString()
  await store.save(lifecycle)
}

function assertArchitectEvidenceBoundToLifecycle(input: ArchitectInput, lifecycle: LifecycleRecord): void {
  const evidence = lifecycle.recycleEvidence
  if (!evidence || !isNonEmpty(evidence.sourceEvidenceReference) || evidence.privacyScanValues.length === 0) {
    throw new LifecycleError('LiNKsites Architect evidence must be bound to this persisted completed recycle, its source run, quality proof, passing test proof, and commercial outcome.')
  }
  if (input.candidate.provenance.productRunId !== evidence.sourceRunId) {
    throw new LifecycleError('LiNKsites Architect candidate provenance productRunId must exactly match the durable recycled source run.')
  }
}

const REDISTRIBUTABLE_SPDX = new Set(['MIT', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', 'ISC', 'CC0-1.0', 'MPL-2.0'])
function isRedistributableSpdx(value: string): boolean { return REDISTRIBUTABLE_SPDX.has(value) }

function assertCandidateBytes(candidate: LibraryCandidateEntry, contents: Record<string, string>, knownLeadValues: string[]): void {
  const filePaths = new Set(candidate.files.map((file) => file.path))
  if (Object.keys(contents).length !== filePaths.size || [...filePaths].some((path) => typeof contents[path] !== 'string')) throw new LifecycleError('LiNKsites Architect requires every submitted candidate file byte-for-byte for inspection.')
  for (const file of candidate.files) {
    const bytes = contents[file.path]
    if (digest(bytes) !== file.sha256) throw new LifecycleError(`LiNKsites Architect candidate content checksum does not match ${file.path}.`)
    if (containsLeadValues(bytes, knownLeadValues)) throw new LifecycleError(`Reusable candidate file ${file.path} contains lead/customer data and cannot be submitted.`)
  }
}

function sameCanonicalValue(left: unknown, right: unknown): boolean {
  return JSON.stringify(canonicalize(left)) === JSON.stringify(canonicalize(right))
}
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (!value || typeof value !== 'object') return value
  return Object.fromEntries(Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b)).map(([key, child]) => [key, canonicalize(child)]))
}
function isRuntimeCompatible(nodeRange: string, runtimes: string[]): boolean {
  // W1-05 performs authoritative semver parsing.  This is the explicit
  // Phase-1 compatibility gate for LiNKsites' Node 22 + browser runtime.
  return /(?:\^?22|>=\s*22)/.test(nodeRange) && runtimes.includes('node') && runtimes.includes('browser')
}

function addDays(now: string, days: number): string { return new Date(new Date(now).getTime() + days * 86_400_000).toISOString() }
function digest(value: string): string { return createHash('sha256').update(value).digest('hex') }

const SENSITIVE_KEY = /(?:name|email|phone|address|domain|logo|contact|customer|prospect|lead|secret|token|credential|api[_-]?key)/i
const PERSONAL_TEXT = /(?:\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b|\+?\d[\d ()-]{7,}\d)/
function containsProspectData(value: unknown, knownLeadValues: string[]): boolean {
  if (typeof value === 'string') return value !== '[redacted]' && (PERSONAL_TEXT.test(value) || knownLeadValues.some((known) => known.trim() && value.toLowerCase().includes(known.toLowerCase())))
  if (Array.isArray(value)) return value.some((item) => containsProspectData(item, knownLeadValues))
  if (!value || typeof value !== 'object') return false
  return Object.entries(value as Record<string, unknown>).some(([key, nested]) => SENSITIVE_KEY.test(key) || containsProspectData(nested, knownLeadValues))
}

/** Candidate metadata legitimately contains fields such as `name`; inspect its values without treating schema keys as PII. */
function containsLeadValues(value: unknown, knownLeadValues: string[]): boolean {
  if (typeof value === 'string') return PERSONAL_TEXT.test(value) || knownLeadValues.some((known) => known.trim() && value.toLowerCase().includes(known.toLowerCase()))
  if (Array.isArray(value)) return value.some((item) => containsLeadValues(item, knownLeadValues))
  if (!value || typeof value !== 'object') return false
  return Object.values(value as Record<string, unknown>).some((nested) => containsLeadValues(nested, knownLeadValues))
}

/** Excludes structural checksums/timestamps from PII scanning; they are not human asset content. */
function candidateHumanText(candidate: LibraryCandidateEntry): unknown {
  return { entryId: candidate.entryId, name: candidate.name, summary: candidate.summary, problemDomains: candidate.problemDomains, tags: candidate.tags, languages: candidate.languages, frameworks: candidate.frameworks, securityNotes: candidate.securityReview.notes, reviewedBy: candidate.securityReview.reviewedBy, usage: candidate.usage, integrationNotes: candidate.integrationNotes, gotchas: candidate.gotchas, provenance: { sourceUrl: candidate.provenance.sourceUrl, versionOrRange: candidate.provenance.versionOrRange, productRunId: candidate.provenance.productRunId } }
}

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
} from './libraryConsumer.js'
import { archiveAndRecycleFoundation, type ProspectAdaptation } from './prospectAdaptation.js'
import type { ConversionLockRegistry } from './conversionLock.js'
import type { FoundationReservationManager } from './reusableFoundation.js'

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
function isLifecycleRecord(value: unknown): value is LifecycleRecord {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as LifecycleRecord
  return record.schemaVersion === SITE_LIFECYCLE_SCHEMA_VERSION && isNonEmpty(record.lifecycleId) && isNonEmpty(record.orgId) && isNonEmpty(record.leadId) && isNonEmpty(record.siteId) &&
    isNonEmpty(record.outcomeEventId) && isCommercialOutcomeEnvelope(record.outcomeEnvelope) && record.outcomeEventId === record.outcomeEnvelope.replay_protection.event_id && record.orgId === record.outcomeEnvelope.org_id && record.leadId === record.outcomeEnvelope.lead_id && record.siteId === record.outcomeEnvelope.site_id && record.outcome === record.outcomeEnvelope.outcome && record.reachAuthorizationReference === record.outcomeEnvelope.reach_authorization_reference &&
    ['outcome_recorded', 'awaiting_activation', 'activation_dry_run_complete', 'recycled', 'retained', 'abandoned', 'manual_attention'].includes(record.status) && (record.retentionUntil === null || isIso(record.retentionUntil)) && (record.activationRequest === null || isActivationRequest(record.activationRequest)) && Array.isArray(record.receipts) && record.receipts.every(isLifecycleReceipt) && Array.isArray(record.refactoringRequests) && record.refactoringRequests.every(isRefactoringRequest) && Array.isArray(record.candidateSubmissions) && record.candidateSubmissions.every(isCandidateSubmissionEvidence) && isIso(record.createdAt) && isIso(record.updatedAt)
}

export interface LiNKreachAuthorizationVerifier {
  verify(input: { orgId: string; leadId: string; siteId: string; reference: string; capability: 'outcome' | 'activation' }): Promise<boolean>
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
  /** Removes lead-specific working/Payload references from active use; must return a receipt, not raw data. */
  quarantineLeadContent(): Promise<LifecycleReceipt>
}

export type CandidateAssetKind = 'component' | 'layout' | 'pattern' | 'vertical_asset'

export interface ArchitectInput {
  orgId: string
  siteId: string
  sourceRunIds: string[]
  sourceEvidenceReferences: string[]
  qualityEvidenceReferences: string[]
  commercialEvidenceReferences: string[]
  testEvidenceReferences: string[]
  /** This is metadata only; bytes must have their own SHA-256 in candidate.files. */
  assetPreview: Record<string, unknown>
  knownLeadValues: string[]
  catalogReference: PinnedLibraryCatalogReference
  candidate: LibraryCandidateEntry
}

export class LifecycleError extends Error {}

export class SiteLifecycleService {
  constructor(
    private readonly store: LifecycleStore,
    private readonly authorization: LiNKreachAuthorizationVerifier,
    private readonly activationProviders: ActivationProvider[] = createPhaseOneActivationProviders(),
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
    lifecycle.activationRequest = request
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
    // Check the conversion lock before touching prospect content. A sold/locked
    // site must be left completely unchanged if a stale no-sale request arrives.
    context.conversionLocks.assertRecycleAllowed(context.adaptation.foundationId)
    const quarantine = await context.quarantineLeadContent()
    assertQuarantineReceipt(quarantine, lifecycle, context)
    archiveAndRecycleFoundation(context.adaptation, context.reservations, context.conversionLocks)
    lifecycle.status = 'recycled'
    const recycleReceipt = receipt('recycling', context.request.idempotency_key, lifecycle.siteId, 'dry_run', 'inventory.release', 'completed', { inventoryId: context.request.template_inventory_id, foundationId: context.adaptation.foundationId, leadContentRetained: false, publicMutation: false })
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
    if (!lifecycle || lifecycle.outcome !== 'no_sale' || lifecycle.status !== 'recycled') throw new LifecycleError('LiNKsites Architect requires a persisted, completed no_sale lifecycle.')
    if (!input.sourceRunIds.length || !input.sourceEvidenceReferences.length || !input.qualityEvidenceReferences.length || !input.commercialEvidenceReferences.length || !input.testEvidenceReferences.length) throw new LifecycleError('LiNKsites Architect candidate requires source-run, quality, commercial, and passing-test evidence.')
    if (input.candidate.status !== 'candidate' || !input.candidate.license.redistributionAllowed) throw new LifecycleError('LiNKsites Architect requires a redistributable candidate asset only.')
    if (!isRuntimeCompatible(input.candidate.compatibility.node, input.candidate.compatibility.runtimes)) throw new LifecycleError('LiNKsites Architect candidate is not compatible with the LiNKsites Node 22 browser runtime.')
    if (containsProspectData(input.assetPreview, input.knownLeadValues) || containsLeadValues(candidateHumanText(input.candidate), input.knownLeadValues)) throw new LifecycleError('Reusable candidate contains lead/customer data and cannot be submitted.')
    try { assertLiNKSitesLibraryConsumerPolicy({ ...input.candidate, status: 'approved' }) } catch (error) { throw new LifecycleError(`LiNKsites Architect candidate failed LiNKlibraries contract validation: ${error instanceof Error ? error.message : 'invalid candidate'}`) }
    let submission: LibraryCandidateSubmission
    try { submission = submitArchitectCandidate({ catalogReference: input.catalogReference, candidate: structuredClone(input.candidate) }) } catch (error) { throw new LifecycleError(`LiNKsites Architect governed submission was rejected: ${error instanceof Error ? error.message : 'unknown rejection'}`) }
    const lifecycleCandidateId = `architect:${submission.proposalId}`
    const submissionReceipt = receipt('architect_candidate', `candidate:${submission.proposalId}`, lifecycle.siteId, 'dry_run', 'linklibraries.submitArchitectCandidate', 'accepted', { submissionReference: submission.proposalId, canonicalAssetChanged: false, publicMutation: false })
    lifecycle.receipts.push(submissionReceipt)
    lifecycle.candidateSubmissions.push({ candidateId: lifecycleCandidateId, lifecycleId: lifecycle.lifecycleId, proposalId: submission.proposalId, canonicalCatalogCommitSha: submission.canonicalCatalogCommitSha, sourceRunIds: [...input.sourceRunIds], sourceEvidenceReferences: [...input.sourceEvidenceReferences], qualityEvidenceReferences: [...input.qualityEvidenceReferences], commercialEvidenceReferences: [...input.commercialEvidenceReferences], testEvidenceReferences: [...input.testEvidenceReferences], submissionReceipt, createdAt: new Date().toISOString() })
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

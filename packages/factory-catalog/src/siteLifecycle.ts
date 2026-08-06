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
  status: 'accepted' | 'completed' | 'rolled_back' | 'skipped'
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
  outcome: CommercialOutcomeEnvelope['outcome']
  reachAuthorizationReference: string
  status: LifecycleStatus
  retentionUntil: string | null
  activationRequest: ActivationRequest | null
  receipts: LifecycleReceipt[]
  createdAt: string
  updatedAt: string
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

function isLifecycleRecord(value: unknown): value is LifecycleRecord {
  return typeof value === 'object' && value !== null &&
    typeof (value as LifecycleRecord).lifecycleId === 'string' &&
    typeof (value as LifecycleRecord).outcomeEventId === 'string' &&
    Array.isArray((value as LifecycleRecord).receipts)
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

export interface ArchitectCandidateManifest {
  schemaVersion: number
  candidateId: string
  status: 'candidate'
  sourceRunIds: string[]
  sourceEvidenceReferences: string[]
  kind: CandidateAssetKind
  versionIntent: 'new_entry' | 'new_variant' | 'new_version'
  compatibility: { nodeMajor: number; runtimes: string[] }
  license: { spdx: string; redistributionAllowed: boolean; provenance: string }
  tests: { command: string; passed: boolean }[]
  privacyReview: { passed: true; removedFields: string[]; scannedValues: number }
  assets: Record<string, unknown>
}

export interface CandidateSubmissionPort {
  submit(candidate: ArchitectCandidateManifest): Promise<{ submissionReference: string }>
}

/** Queue-only interface to LiNKlibraries: it creates no catalog entry and cannot select or approve an asset. */
export class InMemoryCandidateSubmissionPort implements CandidateSubmissionPort {
  readonly candidates: ArchitectCandidateManifest[] = []
  async submit(candidate: ArchitectCandidateManifest): Promise<{ submissionReference: string }> {
    if (candidate.status !== 'candidate') throw new LifecycleError('LiNKsites Architect can submit candidate assets only.')
    this.candidates.push(structuredClone(candidate))
    return { submissionReference: `linklibraries-candidate:${candidate.candidateId}` }
  }
}

export interface ArchitectInput {
  sourceRunIds: string[]
  sourceEvidenceReferences: string[]
  kind: CandidateAssetKind
  versionIntent: ArchitectCandidateManifest['versionIntent']
  assets: Record<string, unknown>
  knownLeadValues: string[]
  license: ArchitectCandidateManifest['license']
  tests: ArchitectCandidateManifest['tests']
  compatibility?: ArchitectCandidateManifest['compatibility']
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
      if (prior.orgId === envelope.org_id && prior.leadId === envelope.lead_id && prior.siteId === envelope.site_id && prior.outcome === envelope.outcome && prior.reachAuthorizationReference === envelope.reach_authorization_reference) return prior
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
      outcomeEventId: envelope.replay_protection.event_id, outcome: envelope.outcome,
      reachAuthorizationReference: envelope.reach_authorization_reference, status, retentionUntil, activationRequest: null,
      receipts: [receipt('outcome_recorded', envelope.idempotency_key, envelope.site_id, 'dry_run', `outcome.${envelope.outcome}`, 'accepted', { eventId: envelope.replay_protection.event_id })],
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
    try {
      for (const provider of this.activationProviders) receipts.push(await provider.execute({ lifecycle, request, idempotencyKey: request.idempotency_key, mode: 'dry_run' }))
    } catch (error) {
      for (const provider of [...this.activationProviders].reverse()) receipts.push(await provider.rollback({ lifecycle, request, idempotencyKey: request.idempotency_key, mode: 'dry_run' }))
      lifecycle.status = 'manual_attention'
      lifecycle.receipts.push(...receipts)
      lifecycle.updatedAt = new Date().toISOString()
      await this.store.save(lifecycle)
      throw new LifecycleError(`Activation dry-run failed and compensating rollback was recorded: ${error instanceof Error ? error.message : 'unknown error'}`)
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
    if (quarantine.mode !== 'dry_run' && quarantine.mode !== 'live') throw new LifecycleError('Recycling adapter must return a receipt.')
    archiveAndRecycleFoundation(context.adaptation, context.reservations, context.conversionLocks)
    lifecycle.status = 'recycled'
    lifecycle.receipts.push(quarantine, receipt('recycling', context.request.idempotency_key, lifecycle.siteId, 'dry_run', 'inventory.release', 'completed', { inventoryId: context.request.template_inventory_id, leadContentRetained: false }))
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

  async proposeArchitectCandidate(input: ArchitectInput, submission: CandidateSubmissionPort): Promise<{ candidate: ArchitectCandidateManifest; receipt: LifecycleReceipt }> {
    if (!input.sourceRunIds.length || !input.sourceEvidenceReferences.length) throw new LifecycleError('LiNKsites Architect candidate requires source run and evidence references.')
    if (!input.license.spdx || !input.license.provenance || !input.tests.length || input.tests.some((test) => !test.passed)) throw new LifecycleError('LiNKsites Architect candidate requires passing tests and license/provenance evidence.')
    const scrubbed = scrubProspectData(input.assets, input.knownLeadValues)
    if (containsProspectData(scrubbed.value, input.knownLeadValues)) throw new LifecycleError('Reusable candidate still contains lead/customer data after privacy processing.')
    const candidate: ArchitectCandidateManifest = {
      schemaVersion: SITE_LIFECYCLE_SCHEMA_VERSION, candidateId: `architect-${randomUUID()}`, status: 'candidate',
      sourceRunIds: [...input.sourceRunIds], sourceEvidenceReferences: [...input.sourceEvidenceReferences], kind: input.kind, versionIntent: input.versionIntent,
      compatibility: input.compatibility ?? { nodeMajor: 22, runtimes: ['node', 'browser'] }, license: input.license,
      tests: input.tests.map((test) => ({ ...test })), privacyReview: { passed: true, removedFields: scrubbed.removedFields, scannedValues: scrubbed.scannedValues }, assets: scrubbed.value,
    }
    const queued = await submission.submit(candidate)
    return { candidate, receipt: receipt('architect_candidate', `candidate:${candidate.candidateId}`, candidate.candidateId, 'dry_run', 'linklibraries.candidate.submit', 'accepted', { submissionReference: queued.submissionReference, canonicalAssetChanged: false }) }
  }
}

function receipt(kind: LifecycleReceiptKind, idempotencyKey: string, subjectId: string, mode: 'dry_run' | 'live', action: string, status: LifecycleReceipt['status'], details: Record<string, string | number | boolean | null>): LifecycleReceipt {
  return { receiptId: randomUUID(), kind, idempotencyKey, subjectId, mode, action, status, details, createdAt: new Date().toISOString() }
}

function addDays(now: string, days: number): string { return new Date(new Date(now).getTime() + days * 86_400_000).toISOString() }
function digest(value: string): string { return createHash('sha256').update(value).digest('hex') }

const SENSITIVE_KEY = /(?:name|email|phone|address|domain|logo|contact|customer|prospect|lead|secret|token|credential|api[_-]?key)/i
const PERSONAL_TEXT = /(?:\b[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}\b|\+?\d[\d ()-]{7,}\d)/
function scrubProspectData(value: unknown, knownLeadValues: string[], path = '', result: { removedFields: string[]; scannedValues: number } = { removedFields: [], scannedValues: 0 }): { value: Record<string, unknown>; removedFields: string[]; scannedValues: number } {
  const scrub = (candidate: unknown, currentPath: string): unknown => {
    if (typeof candidate === 'string') {
      result.scannedValues += 1
      return PERSONAL_TEXT.test(candidate) || knownLeadValues.some((known) => known.trim() && candidate.toLowerCase().includes(known.toLowerCase())) ? '[redacted]' : candidate
    }
    if (Array.isArray(candidate)) return candidate.map((item, index) => scrub(item, `${currentPath}[${index}]`))
    if (!candidate || typeof candidate !== 'object') return candidate
    const cleaned: Record<string, unknown> = {}
    for (const [key, nested] of Object.entries(candidate as Record<string, unknown>)) {
      const nextPath = currentPath ? `${currentPath}.${key}` : key
      if (SENSITIVE_KEY.test(key)) { result.removedFields.push(nextPath); continue }
      cleaned[key] = scrub(nested, nextPath)
    }
    return cleaned
  }
  return { value: scrub(value, path) as Record<string, unknown>, ...result }
}

function containsProspectData(value: unknown, knownLeadValues: string[]): boolean {
  if (typeof value === 'string') return value !== '[redacted]' && (PERSONAL_TEXT.test(value) || knownLeadValues.some((known) => known.trim() && value.toLowerCase().includes(known.toLowerCase())))
  if (Array.isArray(value)) return value.some((item) => containsProspectData(item, knownLeadValues))
  if (!value || typeof value !== 'object') return false
  return Object.entries(value as Record<string, unknown>).some(([key, nested]) => SENSITIVE_KEY.test(key) || containsProspectData(nested, knownLeadValues))
}

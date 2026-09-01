import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import type { ActivationRequest, CommercialOutcomeEnvelope, RecyclingRequest } from '@linksites/types'
import type { LibraryCandidateEntry, PinnedLibraryCatalogReference } from '../src/libraryConsumer.js'
import {
  createFileLifecycleStore,
  DryRunActivationProvider,
  InMemoryLifecycleStore,
  LifecycleError,
  SiteLifecycleService,
  type ArchitectCandidateSubmitter,
  type LifecycleEvidenceVerifier,
  type LiNKreachAuthorizationVerifier,
} from '../src/siteLifecycle.js'
import { ConversionLockRegistry } from '../src/conversionLock.js'
import { FoundationReservationManager } from '../src/reusableFoundation.js'

const authorization: LiNKreachAuthorizationVerifier = { verify: async () => true }
const deniedAuthorization: LiNKreachAuthorizationVerifier = { verify: async () => false }
const verifiedEvidence: LifecycleEvidenceVerifier = {
  resolveCompletedRecycleEvidence: async (input) => ({
    sourceRunId: input.sourceRunId,
    sourceEvidenceReference: `evidence://run/${input.sourceRunId}`,
    qualityEvidenceReference: input.qualityEvidenceReference,
    passingTestEvidenceReference: input.passingTestEvidenceReference,
    privacyScanValues: ['Alice Example', 'Private Co'],
  }),
}
const metadata = { schema_version: { major: 1, minor: 0 } as const, org_id: 'org_demo', correlation_id: 'corr-001', idempotency_key: 'commercial:sold:001' }
const validCommercialOutcome: CommercialOutcomeEnvelope = { ...metadata, lead_id: 'lead_demo_example', site_id: 'site_demo_example', outcome: 'sold', reach_authorization_reference: 'reach-auth-001', replay_protection: { event_id: 'commercial-event-001', nonce: 'nonce-001' }, recorded_at: '2026-08-04T00:10:00.000Z' }
const validActivationRequest: ActivationRequest = { ...metadata, idempotency_key: 'activation:001', lead_id: 'lead_demo_example', site_id: 'site_demo_example', reach_authorization_reference: 'reach-auth-001', publication: { domain: 'customer.example.com', environment: 'production', requested_at: '2026-08-04T00:15:00.000Z' } }
const validRecyclingRequest: RecyclingRequest = { ...metadata, idempotency_key: 'recycling:001', lead_id: 'lead_demo_example', site_id: 'site_demo_example', template_inventory_id: 'template-inventory-001', reason: 'no_sale', requested_at: '2026-08-04T00:20:00.000Z' }
const noSale = { ...validCommercialOutcome, outcome: 'no_sale' as const, replay_protection: { event_id: 'commercial-no-sale-001', nonce: 'nonce-no-sale-001' }, idempotency_key: 'commercial:no-sale:001' }
const deferred = { ...validCommercialOutcome, outcome: 'deferred' as const, replay_protection: { event_id: 'commercial-deferred-001', nonce: 'nonce-deferred-001' }, idempotency_key: 'commercial:deferred:001' }

const catalogReference: PinnedLibraryCatalogReference = {
  repositoryUrl: 'https://github.com/linktrend/LiNKlibraries.git', commitSha: 'a'.repeat(40), ref: 'a'.repeat(40),
  catalog: { schemaVersion: 1, generatedAt: '2026-08-04T00:00:00.000Z', sourceCommitSha: 'a'.repeat(40), entries: [{ entryId: 'marketing-smb-v1', kind: 'template', name: 'Existing canonical', summary: 'Existing', problemDomains: ['marketing'], tags: [], languages: ['TypeScript'], frameworks: ['Next.js'], status: 'approved', path: 'entries/marketing-smb-v1' }] },
}
const architectCandidate: LibraryCandidateEntry = {
  schemaVersion: 1, entryId: 'marketing-smb-v2', kind: 'template', name: 'Marketing SMB v2', summary: 'Reusable neutral layout', problemDomains: ['marketing'], tags: ['marketing'], languages: ['TypeScript'], frameworks: ['Next.js'], compatibility: { node: '>=22 <23', runtimes: ['node', 'browser'] }, license: { spdx: 'MIT', redistributionAllowed: true }, securityReview: { reviewedAt: '2026-08-04T00:00:00.000Z', reviewedBy: 'linksites-architect', notes: 'candidate reviewed' }, usage: { howToUse: 'Install into a neutral site.' }, integrationNotes: 'Candidate only.', gotchas: ['Requires Node 22.'], provenance: { sourceSystem: 'manual', contributedAt: '2026-08-04T00:00:00.000Z', productRunId: 'run-001' }, files: [{ path: 'src/index.ts', sha256: createHash('sha256').update('export const reusable = true\n').digest('hex') }], status: 'candidate',
}
const candidateFileContents = { 'src/index.ts': 'export const reusable = true\n' }
const completedEvidence = { sourceRunId: 'run-001', qualityEvidenceReference: 'evidence://quality-001', passingTestEvidenceReference: 'test://candidate-001' }
const recycleBinding = (adaptation: { adaptationId: string; foundationId: string; reservationId: string }, templateInventoryId = validRecyclingRequest.template_inventory_id) => ({ templateInventoryId, adaptationId: adaptation.adaptationId, foundationId: adaptation.foundationId, reservationId: adaptation.reservationId })

describe('W2-06 commercial outcome lifecycle', () => {
  it('validates, authorizes, deduplicates, and rejects conflicting commercial outcomes', async () => {
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization, undefined, verifiedEvidence)
    const first = await service.recordOutcome(validCommercialOutcome)
    expect(first.status).toBe('awaiting_activation')
    expect((await service.recordOutcome(validCommercialOutcome)).lifecycleId).toBe(first.lifecycleId)
    await expect(service.recordOutcome({ ...validCommercialOutcome, outcome: 'no_sale' })).rejects.toThrow(/conflicts/i)
    await expect(new SiteLifecycleService(new InMemoryLifecycleStore(), deniedAuthorization).recordOutcome(validCommercialOutcome)).rejects.toThrow(/authorization/i)
  })

  it('requires an authorized matching sold outcome, then records every activation provider as dry-run only', async () => {
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization, undefined, verifiedEvidence)
    await expect(service.dryRunActivation(validActivationRequest)).rejects.toThrow(/sold outcome/i)
    await service.recordOutcome(validCommercialOutcome)
    await expect(service.dryRunActivation({ ...validActivationRequest, reach_authorization_reference: 'different-auth' })).rejects.toThrow(/does not match/i)
    const completed = await service.dryRunActivation(validActivationRequest)
    expect(completed.status).toBe('activation_dry_run_complete')
    expect(completed.receipts.filter((entry) => entry.kind === 'activation_step')).toHaveLength(7)
    expect(completed.receipts.every((entry) => entry.mode === 'dry_run')).toBe(true)
    expect(completed.receipts.some((entry) => entry.details.publicMutation === true)).toBe(false)
    expect((await service.dryRunActivation(validActivationRequest)).receipts).toHaveLength(completed.receipts.length)
  })

  it('compensates successful dry-run steps and leaves manual attention when a provider fails', async () => {
    const failing = new DryRunActivationProvider('dns')
    failing.execute = async () => { throw new Error('sandbox DNS failure') }
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization, [
      new DryRunActivationProvider('payload'), new DryRunActivationProvider('private_wall'), new DryRunActivationProvider('domain'), failing,
      new DryRunActivationProvider('route'), new DryRunActivationProvider('tls'), new DryRunActivationProvider('health'),
    ])
    await service.recordOutcome(validCommercialOutcome)
    await expect(service.dryRunActivation(validActivationRequest)).rejects.toThrow(/rollback/i)
    const stored = await (service as unknown as { store: InMemoryLifecycleStore }).store.getBySiteId(validActivationRequest.org_id, validActivationRequest.site_id)
    expect(stored?.status).toBe('manual_attention')
    expect(stored?.receipts.some((entry) => entry.kind === 'activation_rollback')).toBe(true)
  })

  it('fails closed for live, public, malformed, or mismatched provider receipts and preserves rollback failures', async () => {
    const invalid = new DryRunActivationProvider('payload')
    invalid.execute = async () => ({ receiptId: 'invalid', kind: 'activation_step', idempotencyKey: validActivationRequest.idempotency_key, subjectId: validActivationRequest.site_id, mode: 'live', action: 'payload.execute', status: 'completed', createdAt: new Date().toISOString(), details: { publicMutation: true, provider: 'payload' } })
    invalid.rollback = async () => { throw new Error('rollback unavailable') }
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization, [invalid, new DryRunActivationProvider('private_wall'), new DryRunActivationProvider('domain'), new DryRunActivationProvider('dns'), new DryRunActivationProvider('route'), new DryRunActivationProvider('tls'), new DryRunActivationProvider('health')])
    await service.recordOutcome(validCommercialOutcome)
    await expect(service.dryRunActivation(validActivationRequest)).rejects.toThrow(/rollback also failed/i)
    const stored = await (service as unknown as { store: InMemoryLifecycleStore }).store.getBySiteId(validCommercialOutcome.org_id, validCommercialOutcome.site_id)
    expect(stored?.status).toBe('manual_attention')
    expect(stored?.receipts.some((entry) => entry.action === 'activation.execution' && entry.status === 'failed')).toBe(true)
    expect(stored?.receipts.some((entry) => entry.action === 'payload.rollback' && entry.status === 'failed')).toBe(true)
  })

  it('persists schema-valid activation failure evidence that a fresh durable store can read', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-06-activation-failure-'))
    try {
      const failing = new DryRunActivationProvider('dns')
      failing.execute = async () => { throw new Error('sandbox DNS failure') }
      const providers = [
        new DryRunActivationProvider('payload'), new DryRunActivationProvider('private_wall'), new DryRunActivationProvider('domain'), failing,
        new DryRunActivationProvider('route'), new DryRunActivationProvider('tls'), new DryRunActivationProvider('health'),
      ]
      const service = new SiteLifecycleService(createFileLifecycleStore(directory), authorization, providers, verifiedEvidence)
      await service.recordOutcome(validCommercialOutcome)
      await expect(service.dryRunActivation(validActivationRequest)).rejects.toThrow(/execution and rollback evidence were recorded/i)

      const restarted = createFileLifecycleStore(directory)
      const stored = await restarted.getBySiteId(validActivationRequest.org_id, validActivationRequest.site_id)
      expect(stored?.status).toBe('manual_attention')
      expect(stored?.receipts.some((entry) => entry.action === 'activation.execution' && entry.status === 'failed' && entry.details.publicMutation === false && entry.details.errorRecorded === true)).toBe(true)
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('quarantines no-sale content, releases inventory, and refuses to recycle a conversion-locked foundation', async () => {
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization, undefined, verifiedEvidence)
    await service.recordOutcome(noSale)
    const reservations = new FoundationReservationManager()
    const reservation = reservations.reserve('foundation-001', 'program-001')
    const adaptation = { schemaVersion: { major: 1, minor: 0 }, adaptationId: 'adaptation-001', siteSpecId: 'spec-001', foundationId: 'foundation-001', reservationId: reservation.reservationId, status: 'published' as const, prospectContent: { businessName: 'Private Co' }, createdAt: '2026-08-01T00:00:00.000Z' }
    const completed = await service.recycleNoSale({ request: validRecyclingRequest, adaptation, reservations, conversionLocks: new ConversionLockRegistry(), inventoryBinding: recycleBinding(adaptation), completedEvidence, quarantineLeadContent: async () => ({ receiptId: 'quarantine-001', kind: 'recycling', idempotencyKey: validRecyclingRequest.idempotency_key, subjectId: 'site_demo_example', mode: 'dry_run', action: 'content.quarantine', status: 'completed', createdAt: new Date().toISOString(), details: { publicMutation: false, leadContentRetained: false, leadContentRemoved: true, adaptationId: adaptation.adaptationId, foundationId: adaptation.foundationId, reservationId: adaptation.reservationId, templateInventoryId: validRecyclingRequest.template_inventory_id } }) })
    expect(completed.status).toBe('recycled')
    expect(reservations.getActiveReservation('foundation-001')).toBeNull()
    expect(completed.refactoringRequests).toHaveLength(1)
    expect(JSON.stringify(completed.refactoringRequests)).not.toContain('Private Co')

    const lockedReservations = new FoundationReservationManager()
    const lockedReservation = lockedReservations.reserve('foundation-locked', 'program-002')
    const lockedAdaptation = { ...adaptation, adaptationId: 'adaptation-locked', foundationId: 'foundation-locked', reservationId: lockedReservation.reservationId }
    const locks = new ConversionLockRegistry()
    locks.createLock({ adaptation: lockedAdaptation, previewDeploymentVersionRef: 'preview-001', conversionInstructionRef: 'reach-auth-001', stripePaymentConfirmationRef: 'payment-ref-not-a-secret', odooCommercialRecordRef: 'commercial-ref-001' })
    const second = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization, undefined, verifiedEvidence)
    await second.recordOutcome({ ...noSale, site_id: 'site-locked', lead_id: 'lead-locked', replay_protection: { event_id: 'no-sale-locked', nonce: 'no-sale-locked-nonce' } })
    await expect(second.recycleNoSale({ request: { ...validRecyclingRequest, site_id: 'site-locked', lead_id: 'lead-locked' }, adaptation: lockedAdaptation, reservations: lockedReservations, conversionLocks: locks, inventoryBinding: recycleBinding(lockedAdaptation), completedEvidence, quarantineLeadContent: async () => { throw new Error('must not quarantine when recycle gate is locked') } })).rejects.toThrow(/must not quarantine|locked/i)
  })

  it('rejects no-sale quarantine receipts that are unrelated, live, skipped, public, or lack a privacy proof', async () => {
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization, undefined, verifiedEvidence)
    await service.recordOutcome(noSale)
    const reservations = new FoundationReservationManager(); const reservation = reservations.reserve('foundation-unsafe', 'program-unsafe')
    const adaptation = { schemaVersion: { major: 1, minor: 0 }, adaptationId: 'adaptation-unsafe', siteSpecId: 'spec-unsafe', foundationId: 'foundation-unsafe', reservationId: reservation.reservationId, status: 'published' as const, prospectContent: { businessName: 'Private Co' }, createdAt: '2026-08-01T00:00:00.000Z' }
    const bad = { receiptId: 'bad', kind: 'recycling' as const, idempotencyKey: validRecyclingRequest.idempotency_key, subjectId: validRecyclingRequest.site_id, mode: 'dry_run' as const, action: 'content.quarantine', status: 'completed' as const, createdAt: new Date().toISOString(), details: { publicMutation: false, leadContentRetained: false, leadContentRemoved: true, adaptationId: adaptation.adaptationId, foundationId: adaptation.foundationId, reservationId: adaptation.reservationId, templateInventoryId: validRecyclingRequest.template_inventory_id } }
    for (const changed of [{ mode: 'live' as const }, { status: 'skipped' as const }, { details: { ...bad.details, publicMutation: true } }, { details: { ...bad.details, adaptationId: 'other' } }, { details: { ...bad.details, leadContentRemoved: false } }]) {
      await expect(service.recycleNoSale({ request: validRecyclingRequest, adaptation, reservations, conversionLocks: new ConversionLockRegistry(), inventoryBinding: recycleBinding(adaptation), completedEvidence, quarantineLeadContent: async () => ({ ...bad, ...changed } as never) })).rejects.toThrow(/quarantine receipt/i)
    }
    expect(reservations.getActiveReservation('foundation-unsafe')).not.toBeNull()
  })

  it('fails closed and records manual attention when inventory binding or active reservation has moved', async () => {
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization, undefined, verifiedEvidence)
    await service.recordOutcome(noSale)
    const reservations = new FoundationReservationManager(); const reservation = reservations.reserve('foundation-moved', 'program-moved')
    const adaptation = { schemaVersion: { major: 1, minor: 0 }, adaptationId: 'adaptation-moved', siteSpecId: 'spec-moved', foundationId: 'foundation-moved', reservationId: reservation.reservationId, status: 'published' as const, prospectContent: { businessName: 'Private Co' }, createdAt: '2026-08-01T00:00:00.000Z' }
    await expect(service.recycleNoSale({ request: validRecyclingRequest, adaptation, reservations, conversionLocks: new ConversionLockRegistry(), inventoryBinding: recycleBinding(adaptation, 'foreign-template'), completedEvidence, quarantineLeadContent: async () => { throw new Error('must not quarantine') } })).rejects.toThrow(/binding/i)
    expect(reservations.getActiveReservation('foundation-moved')?.reservationId).toBe(reservation.reservationId)
    expect((await (service as unknown as { store: InMemoryLifecycleStore }).store.getBySiteId(noSale.org_id, noSale.site_id))?.status).toBe('manual_attention')
  })

  it('durably preserves a successful quarantine and failed inventory readback as the only allowed incomplete recycle state', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-06-release-readback-'))
    try {
      const reservations = new FoundationReservationManager()
      const reservation = reservations.reserve('foundation-release-readback', 'program-release-readback')
      const adaptation = { schemaVersion: { major: 1, minor: 0 }, adaptationId: 'adaptation-release-readback', siteSpecId: 'spec-release-readback', foundationId: 'foundation-release-readback', reservationId: reservation.reservationId, status: 'published' as const, prospectContent: { businessName: 'Private Co' }, createdAt: '2026-08-01T00:00:00.000Z' }
      // Simulate an adversarial provider that reports release success by
      // returning normally but leaves the active reservation in place.  The
      // exact helper must reject its readback and persist both proofs.
      reservations.release = () => undefined
      const service = new SiteLifecycleService(createFileLifecycleStore(directory), authorization, undefined, verifiedEvidence)
      await service.recordOutcome(noSale)
      const quarantine = { receiptId: 'quarantine-release-readback', kind: 'recycling' as const, idempotencyKey: validRecyclingRequest.idempotency_key, subjectId: validRecyclingRequest.site_id, mode: 'dry_run' as const, action: 'content.quarantine', status: 'completed' as const, createdAt: new Date().toISOString(), details: { publicMutation: false, leadContentRetained: false, leadContentRemoved: true, adaptationId: adaptation.adaptationId, foundationId: adaptation.foundationId, reservationId: adaptation.reservationId, templateInventoryId: validRecyclingRequest.template_inventory_id } }
      await expect(service.recycleNoSale({ request: validRecyclingRequest, adaptation, reservations, conversionLocks: new ConversionLockRegistry(), inventoryBinding: recycleBinding(adaptation), completedEvidence, quarantineLeadContent: async () => quarantine })).rejects.toThrow(/release did not complete/i)

      const restarted = createFileLifecycleStore(directory)
      const stored = await restarted.getBySiteId(noSale.org_id, noSale.site_id)
      expect(stored?.status).toBe('manual_attention')
      expect(stored?.recyclingRequest).toEqual(validRecyclingRequest)
      expect(stored?.recycleEvidence).toBeNull()
      expect(stored?.receipts.filter((entry) => entry.action === 'content.quarantine' && entry.status === 'completed')).toEqual([quarantine])
      expect(stored?.receipts.filter((entry) => entry.action === 'inventory.release' && entry.status === 'failed').every((entry) => entry.details.publicMutation === false && entry.details.errorRecorded === true)).toBe(true)
      expect(reservations.getActiveReservation(adaptation.foundationId)?.reservationId).toBe(reservation.reservationId)
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('has bounded deferred retention with no automatic retry loop', async () => {
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization)
    const record = await service.recordOutcome(deferred)
    expect(record.status).toBe('retained')
    const expired = await service.expireRetention(deferred.org_id, deferred.site_id, new Date(new Date(record.createdAt).getTime() + 31 * 24 * 60 * 60 * 1000))
    expect(expired?.status).toBe('manual_attention')
    expect(expired?.retentionUntil).toBeNull()
    expect(expired?.receipts.at(-1)?.details.automaticRetry).toBe(false)
  })

  it('survives a file-store restart and replays an identical outcome exactly once', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-06-'))
    try {
      const first = new SiteLifecycleService(createFileLifecycleStore(directory), authorization)
      const record = await first.recordOutcome(validCommercialOutcome)
      const restarted = new SiteLifecycleService(createFileLifecycleStore(directory), authorization)
      expect((await restarted.recordOutcome(validCommercialOutcome)).lifecycleId).toBe(record.lifecycleId)
      for (const changed of [{ correlation_id: 'other-correlation' }, { idempotency_key: 'other-idempotency' }, { recorded_at: '2026-08-04T00:10:01.000Z' }, { replay_protection: { ...validCommercialOutcome.replay_protection, nonce: 'other-nonce' } }]) {
        await expect(restarted.recordOutcome({ ...validCommercialOutcome, ...changed })).rejects.toThrow(/conflicts/i)
      }
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('fails closed rather than treating a corrupt durable lifecycle record as absent', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-06-corrupt-'))
    try {
      await writeFile(join(directory, 'corrupt.json'), '{"unexpected":true}', 'utf8')
      await expect(createFileLifecycleStore(directory).getByEventId('anything')).rejects.toThrow(/invalid schema/i)
    } finally {
      await rm(directory, { recursive: true, force: true })
    }
  })

  it('rejects coherent-looking foreign nested durable receipts and lifecycle references', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-06-foreign-'))
    try {
      const store = createFileLifecycleStore(directory)
      await new SiteLifecycleService(store, authorization).recordOutcome(validCommercialOutcome)
      const [file] = await readdir(directory)
      const stored = JSON.parse(await readFile(join(directory, file), 'utf8')) as { receipts: Array<{ subjectId: string }> }
      stored.receipts[0].subjectId = 'other-site'
      await writeFile(join(directory, file), JSON.stringify(stored), 'utf8')
      await expect(store.getBySiteId(validCommercialOutcome.org_id, validCommercialOutcome.site_id)).rejects.toThrow(/invalid schema/i)
    } finally { await rm(directory, { recursive: true, force: true }) }
  })

  it('rejects forged lifecycle transitions and every retained live receipt in Phase 1', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'linksites-w2-06-transition-'))
    try {
      const store = createFileLifecycleStore(directory)
      await new SiteLifecycleService(store, authorization).recordOutcome(validCommercialOutcome)
      const [file] = await readdir(directory)
      const stored = JSON.parse(await readFile(join(directory, file), 'utf8')) as { status: string; receipts: Array<{ mode: string }> }
      stored.status = 'outcome_recorded' // sold may never enter the no-sale state
      await writeFile(join(directory, file), JSON.stringify(stored), 'utf8')
      await expect(store.getBySiteId(validCommercialOutcome.org_id, validCommercialOutcome.site_id)).rejects.toThrow(/invalid schema/i)
      stored.status = 'awaiting_activation'
      stored.receipts[0].mode = 'live' // Phase 1 must retain no live operation receipt
      await writeFile(join(directory, file), JSON.stringify(stored), 'utf8')
      await expect(store.getBySiteId(validCommercialOutcome.org_id, validCommercialOutcome.site_id)).rejects.toThrow(/invalid schema/i)
    } finally { await rm(directory, { recursive: true, force: true }) }
  })
})

describe('W2-06 LiNKsites Architect', () => {
  it('uses the W1-05 governed candidate interface and persists its receipt only after a completed no-sale lifecycle', async () => {
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization, undefined, verifiedEvidence)
    await service.recordOutcome(noSale)
    const reservations = new FoundationReservationManager(); const reservation = reservations.reserve('foundation-001', 'program-001')
    const adaptation = { schemaVersion: { major: 1, minor: 0 }, adaptationId: 'adaptation-001', siteSpecId: 'spec-001', foundationId: 'foundation-001', reservationId: reservation.reservationId, status: 'published' as const, prospectContent: { businessName: 'Private Co' }, createdAt: '2026-08-01T00:00:00.000Z' }
    await service.recycleNoSale({ request: validRecyclingRequest, adaptation, reservations, conversionLocks: new ConversionLockRegistry(), inventoryBinding: recycleBinding(adaptation), completedEvidence, quarantineLeadContent: async () => ({ receiptId: 'quarantine-001', kind: 'recycling', idempotencyKey: validRecyclingRequest.idempotency_key, subjectId: validRecyclingRequest.site_id, mode: 'dry_run', action: 'content.quarantine', status: 'completed', createdAt: new Date().toISOString(), details: { publicMutation: false, leadContentRetained: false, leadContentRemoved: true, adaptationId: adaptation.adaptationId, foundationId: adaptation.foundationId, reservationId: adaptation.reservationId, templateInventoryId: validRecyclingRequest.template_inventory_id } }) })
    const result = await service.proposeArchitectCandidate({ orgId: noSale.org_id, siteId: noSale.site_id, assetPreview: { layout: { hero: 'A reusable hero' } }, candidateFileContents, catalogReference, candidate: architectCandidate })
    expect(result.submission.candidate.status).toBe('candidate')
    expect(result.receipt.details.canonicalAssetChanged).toBe(false)
    const lifecycle = await (service as unknown as { store: InMemoryLifecycleStore }).store.getBySiteId(noSale.org_id, noSale.site_id)
    expect(lifecycle?.candidateSubmissions).toHaveLength(1)
    await expect(service.proposeArchitectCandidate({ orgId: noSale.org_id, siteId: noSale.site_id, assetPreview: { leadName: 'Alice Example' }, candidateFileContents, catalogReference, candidate: architectCandidate })).rejects.toThrow(/lead.customer data/i)
    await expect(service.proposeArchitectCandidate({ orgId: noSale.org_id, siteId: noSale.site_id, assetPreview: {}, candidateFileContents, catalogReference, candidate: { ...architectCandidate, entryId: 'marketing-smb-v1' } })).rejects.toThrow(/cannot replace approved canonical/i)
    const customerBytes = 'export const customer = "Alice Example"\n'
    await expect(service.proposeArchitectCandidate({ orgId: noSale.org_id, siteId: noSale.site_id, assetPreview: {}, candidateFileContents: { 'src/index.ts': customerBytes }, catalogReference, candidate: { ...architectCandidate, files: [{ path: 'src/index.ts', sha256: createHash('sha256').update(customerBytes).digest('hex') }] } })).rejects.toThrow(/contains lead.customer data/i)
    await expect(service.proposeArchitectCandidate({ orgId: noSale.org_id, siteId: noSale.site_id, assetPreview: {}, candidateFileContents, catalogReference, candidate: { ...architectCandidate, license: { spdx: 'LicenseRef-Unknown', redistributionAllowed: true } } })).rejects.toThrow(/SPDX/i)
  })

  it('rejects candidate proposals without lifecycle, evidence, redistribution, or canonical safety', async () => {
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization)
    await expect(service.proposeArchitectCandidate({ orgId: 'org_demo', siteId: 'site_demo_example', assetPreview: {}, candidateFileContents, catalogReference, candidate: architectCandidate })).rejects.toBeInstanceOf(LifecycleError)
    await service.recordOutcome(noSale)
    await expect(service.proposeArchitectCandidate({ orgId: noSale.org_id, siteId: noSale.site_id, assetPreview: {}, candidateFileContents, catalogReference, candidate: architectCandidate })).rejects.toThrow(/completed no_sale/i)
  })

  it('rejects a candidate whose claimed source run is foreign before W1-05 submission is called', async () => {
    let submissionCalls = 0
    const submitter: ArchitectCandidateSubmitter = () => {
      submissionCalls += 1
      throw new Error('submission must not be reached')
    }
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization, undefined, verifiedEvidence, submitter)
    await service.recordOutcome(noSale)
    const reservations = new FoundationReservationManager(); const reservation = reservations.reserve('foundation-foreign-run', 'program-foreign-run')
    const adaptation = { schemaVersion: { major: 1, minor: 0 }, adaptationId: 'adaptation-foreign-run', siteSpecId: 'spec-foreign-run', foundationId: 'foundation-foreign-run', reservationId: reservation.reservationId, status: 'published' as const, prospectContent: { businessName: 'Private Co' }, createdAt: '2026-08-01T00:00:00.000Z' }
    await service.recycleNoSale({ request: validRecyclingRequest, adaptation, reservations, conversionLocks: new ConversionLockRegistry(), inventoryBinding: recycleBinding(adaptation), completedEvidence, quarantineLeadContent: async () => ({ receiptId: 'quarantine-foreign-run', kind: 'recycling', idempotencyKey: validRecyclingRequest.idempotency_key, subjectId: validRecyclingRequest.site_id, mode: 'dry_run', action: 'content.quarantine', status: 'completed', createdAt: new Date().toISOString(), details: { publicMutation: false, leadContentRetained: false, leadContentRemoved: true, adaptationId: adaptation.adaptationId, foundationId: adaptation.foundationId, reservationId: adaptation.reservationId, templateInventoryId: validRecyclingRequest.template_inventory_id } }) })

    await expect(service.proposeArchitectCandidate({ orgId: noSale.org_id, siteId: noSale.site_id, assetPreview: {}, candidateFileContents, catalogReference, candidate: { ...architectCandidate, provenance: { ...architectCandidate.provenance, productRunId: 'run-foreign' } } })).rejects.toThrow(/productRunId.*durable recycled source run/i)
    expect(submissionCalls).toBe(0)
  })
})

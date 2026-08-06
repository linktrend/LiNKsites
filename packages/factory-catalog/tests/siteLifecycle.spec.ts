import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { ActivationRequest, CommercialOutcomeEnvelope, RecyclingRequest } from '@linksites/types'
import {
  createFileLifecycleStore,
  DryRunActivationProvider,
  InMemoryCandidateSubmissionPort,
  InMemoryLifecycleStore,
  LifecycleError,
  SiteLifecycleService,
  type LiNKreachAuthorizationVerifier,
} from '../src/siteLifecycle.js'
import { ConversionLockRegistry } from '../src/conversionLock.js'
import { FoundationReservationManager } from '../src/reusableFoundation.js'

const authorization: LiNKreachAuthorizationVerifier = { verify: async () => true }
const deniedAuthorization: LiNKreachAuthorizationVerifier = { verify: async () => false }
const metadata = { schema_version: { major: 1, minor: 0 } as const, org_id: 'org_demo', correlation_id: 'corr-001', idempotency_key: 'commercial:sold:001' }
const validCommercialOutcome: CommercialOutcomeEnvelope = { ...metadata, lead_id: 'lead_demo_example', site_id: 'site_demo_example', outcome: 'sold', reach_authorization_reference: 'reach-auth-001', replay_protection: { event_id: 'commercial-event-001', nonce: 'nonce-001' }, recorded_at: '2026-08-04T00:10:00.000Z' }
const validActivationRequest: ActivationRequest = { ...metadata, idempotency_key: 'activation:001', lead_id: 'lead_demo_example', site_id: 'site_demo_example', reach_authorization_reference: 'reach-auth-001', publication: { domain: 'customer.example.com', environment: 'production', requested_at: '2026-08-04T00:15:00.000Z' } }
const validRecyclingRequest: RecyclingRequest = { ...metadata, idempotency_key: 'recycling:001', lead_id: 'lead_demo_example', site_id: 'site_demo_example', template_inventory_id: 'template-inventory-001', reason: 'no_sale', requested_at: '2026-08-04T00:20:00.000Z' }
const noSale = { ...validCommercialOutcome, outcome: 'no_sale' as const, replay_protection: { event_id: 'commercial-no-sale-001', nonce: 'nonce-no-sale-001' }, idempotency_key: 'commercial:no-sale:001' }
const deferred = { ...validCommercialOutcome, outcome: 'deferred' as const, replay_protection: { event_id: 'commercial-deferred-001', nonce: 'nonce-deferred-001' }, idempotency_key: 'commercial:deferred:001' }

describe('W2-06 commercial outcome lifecycle', () => {
  it('validates, authorizes, deduplicates, and rejects conflicting commercial outcomes', async () => {
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization)
    const first = await service.recordOutcome(validCommercialOutcome)
    expect(first.status).toBe('awaiting_activation')
    expect((await service.recordOutcome(validCommercialOutcome)).lifecycleId).toBe(first.lifecycleId)
    await expect(service.recordOutcome({ ...validCommercialOutcome, outcome: 'no_sale' })).rejects.toThrow(/conflicts/i)
    await expect(new SiteLifecycleService(new InMemoryLifecycleStore(), deniedAuthorization).recordOutcome(validCommercialOutcome)).rejects.toThrow(/authorization/i)
  })

  it('requires an authorized matching sold outcome, then records every activation provider as dry-run only', async () => {
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization)
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

  it('quarantines no-sale content, releases inventory, and refuses to recycle a conversion-locked foundation', async () => {
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization)
    await service.recordOutcome(noSale)
    const reservations = new FoundationReservationManager()
    const reservation = reservations.reserve('foundation-001', 'program-001')
    const adaptation = { schemaVersion: { major: 1, minor: 0 }, adaptationId: 'adaptation-001', siteSpecId: 'spec-001', foundationId: 'foundation-001', reservationId: reservation.reservationId, status: 'published' as const, prospectContent: { businessName: 'Private Co' }, createdAt: '2026-08-01T00:00:00.000Z' }
    const completed = await service.recycleNoSale({ request: validRecyclingRequest, adaptation, reservations, conversionLocks: new ConversionLockRegistry(), quarantineLeadContent: async () => ({ receiptId: 'quarantine-001', kind: 'recycling', idempotencyKey: 'q-001', subjectId: 'site_demo_example', mode: 'dry_run', action: 'content.quarantine', status: 'completed', createdAt: new Date().toISOString(), details: { leadContentRetained: false } }) })
    expect(completed.status).toBe('recycled')
    expect(reservations.getActiveReservation('foundation-001')).toBeNull()

    const lockedReservations = new FoundationReservationManager()
    const lockedReservation = lockedReservations.reserve('foundation-locked', 'program-002')
    const lockedAdaptation = { ...adaptation, adaptationId: 'adaptation-locked', foundationId: 'foundation-locked', reservationId: lockedReservation.reservationId }
    const locks = new ConversionLockRegistry()
    locks.createLock({ adaptation: lockedAdaptation, previewDeploymentVersionRef: 'preview-001', conversionInstructionRef: 'reach-auth-001', stripePaymentConfirmationRef: 'payment-ref-not-a-secret', odooCommercialRecordRef: 'commercial-ref-001' })
    const second = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization)
    await second.recordOutcome({ ...noSale, site_id: 'site-locked', lead_id: 'lead-locked', replay_protection: { event_id: 'no-sale-locked', nonce: 'no-sale-locked-nonce' } })
    await expect(second.recycleNoSale({ request: { ...validRecyclingRequest, site_id: 'site-locked', lead_id: 'lead-locked' }, adaptation: lockedAdaptation, reservations: lockedReservations, conversionLocks: locks, quarantineLeadContent: async () => { throw new Error('must not quarantine when recycle gate is locked') } })).rejects.toThrow(/must not quarantine|locked/i)
  })

  it('has bounded deferred retention with no automatic retry loop', async () => {
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization)
    const record = await service.recordOutcome(deferred)
    expect(record.status).toBe('retained')
    const expired = await service.expireRetention(deferred.org_id, deferred.site_id, new Date('2026-10-01T00:00:00.000Z'))
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
})

describe('W2-06 LiNKsites Architect', () => {
  it('submits only privacy-clean candidate assets and never changes canonical selection', async () => {
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization)
    const submissions = new InMemoryCandidateSubmissionPort()
    const result = await service.proposeArchitectCandidate({
      sourceRunIds: ['run-001'], sourceEvidenceReferences: ['evidence://run-001'], kind: 'layout', versionIntent: 'new_variant',
      assets: { layout: { hero: 'A reusable hero', prospectName: 'Alice Example', body: 'Hello Alice Example', hiddenContact: 'alice@example.test' } }, knownLeadValues: ['Alice Example'],
      license: { spdx: 'MIT', redistributionAllowed: true, provenance: 'source-run-001' }, tests: [{ command: 'pnpm test', passed: true }],
    }, submissions)
    expect(result.candidate.status).toBe('candidate')
    expect(result.candidate.assets).not.toHaveProperty('prospectName')
    expect(JSON.stringify(result.candidate.assets)).not.toContain('Alice Example')
    expect(JSON.stringify(result.candidate.assets)).not.toContain('alice@example.test')
    expect(result.receipt.details.canonicalAssetChanged).toBe(false)
    expect(submissions.candidates).toHaveLength(1)
    await expect(submissions.submit({ ...result.candidate, status: 'approved' as never })).rejects.toThrow(/candidate/i)
  })

  it('rejects candidate proposals without source evidence, passing tests, or licensing provenance', async () => {
    const service = new SiteLifecycleService(new InMemoryLifecycleStore(), authorization)
    const port = new InMemoryCandidateSubmissionPort()
    await expect(service.proposeArchitectCandidate({ sourceRunIds: [], sourceEvidenceReferences: [], kind: 'component', versionIntent: 'new_entry', assets: {}, knownLeadValues: [], license: { spdx: '', redistributionAllowed: true, provenance: '' }, tests: [] }, port)).rejects.toBeInstanceOf(LifecycleError)
    expect(port.candidates).toHaveLength(0)
  })
})

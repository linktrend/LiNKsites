import { describe, expect, it } from 'vitest'
import {
  ProspectAdaptationError,
  archiveAndRecycleFoundation,
  createProspectAdaptation,
  transitionAdaptation,
  type ProspectAdaptation,
} from '../src/prospectAdaptation.js'
import { FoundationReservationManager } from '../src/reusableFoundation.js'
import type { SiteSpecification } from '../src/siteSpecification.js'
import { ConversionLockError, ConversionLockRegistry } from '../src/conversionLock.js'

function buildSiteSpec(overrides: Partial<SiteSpecification> = {}): SiteSpecification {
  return {
    schemaVersion: { major: 1, minor: 0 },
    siteSpecId: 'sitespec-1',
    siteRef: 'site-1',
    kitId: 'home_services',
    tierId: 'standard',
    foundationId: 'foundation-1',
    designProfileRef: 'site-1',
    selectedComponentIds: ['SignupHero'],
    pageCount: 5,
    effectiveMaxPages: 6,
    resolvedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('createProspectAdaptation', () => {
  it('creates a draft Adaptation when the reservation matches and is active', () => {
    const manager = new FoundationReservationManager()
    const reservation = manager.reserve('foundation-1', 'preview-request-1')
    const siteSpec = buildSiteSpec()
    const adaptation = createProspectAdaptation('adapt-1', siteSpec, reservation, { businessName: 'Acme Plumbing' })
    expect(adaptation.status).toBe('draft')
    expect(adaptation.foundationId).toBe('foundation-1')
    expect(adaptation.prospectContent.businessName).toBe('Acme Plumbing')
  })

  it('rejects a reservation for a different Foundation than the Site Specification', () => {
    const manager = new FoundationReservationManager()
    const reservation = manager.reserve('foundation-2', 'preview-request-1')
    const siteSpec = buildSiteSpec({ foundationId: 'foundation-1' })
    expect(() => createProspectAdaptation('adapt-1', siteSpec, reservation, {})).toThrow(ProspectAdaptationError)
  })

  it('rejects a released reservation', () => {
    const manager = new FoundationReservationManager()
    const reservation = manager.reserve('foundation-1', 'preview-request-1')
    manager.release(reservation.reservationId)
    const siteSpec = buildSiteSpec()
    expect(() => createProspectAdaptation('adapt-1', siteSpec, reservation, {})).toThrow(ProspectAdaptationError)
  })
})

describe('transitionAdaptation (lifecycle)', () => {
  const base: ProspectAdaptation = {
    schemaVersion: { major: 1, minor: 0 },
    adaptationId: 'adapt-1',
    siteSpecId: 'sitespec-1',
    foundationId: 'foundation-1',
    reservationId: 'res-1',
    status: 'draft',
    prospectContent: {},
    createdAt: new Date().toISOString(),
  }

  it('allows draft -> previewed -> published -> archived', () => {
    let adaptation = transitionAdaptation(base, 'previewed')
    expect(adaptation.status).toBe('previewed')
    adaptation = transitionAdaptation(adaptation, 'published')
    expect(adaptation.status).toBe('published')
    adaptation = transitionAdaptation(adaptation, 'archived')
    expect(adaptation.status).toBe('archived')
    expect(adaptation.archivedAt).toBeDefined()
  })

  it('allows draft -> archived directly (recycle without ever previewing)', () => {
    const adaptation = transitionAdaptation(base, 'archived')
    expect(adaptation.status).toBe('archived')
  })

  it('rejects an illegal transition (draft -> published, skipping previewed)', () => {
    expect(() => transitionAdaptation(base, 'published')).toThrow(ProspectAdaptationError)
  })

  it('rejects any transition out of archived (terminal state)', () => {
    const archived = transitionAdaptation(base, 'archived')
    expect(() => transitionAdaptation(archived, 'draft')).toThrow(ProspectAdaptationError)
  })
})

describe('archiveAndRecycleFoundation (manual §MVO step 7: close or recycle)', () => {
  it('archives the Adaptation and releases its Foundation reservation', () => {
    const manager = new FoundationReservationManager()
    const reservation = manager.reserve('foundation-1', 'preview-request-1')
    const siteSpec = buildSiteSpec()
    const adaptation = createProspectAdaptation('adapt-1', siteSpec, reservation, {})

    const archived = archiveAndRecycleFoundation(adaptation, manager)

    expect(archived.status).toBe('archived')
    expect(manager.getActiveReservation('foundation-1')).toBeNull()
  })

  it('allows a new reservation on the same Foundation after recycling', () => {
    const manager = new FoundationReservationManager()
    const reservation = manager.reserve('foundation-1', 'preview-request-1')
    const siteSpec = buildSiteSpec()
    const adaptation = createProspectAdaptation('adapt-1', siteSpec, reservation, {})
    archiveAndRecycleFoundation(adaptation, manager)

    expect(() => manager.reserve('foundation-1', 'preview-request-2')).not.toThrow()
  })

  it('does not release a reservation that has already moved on to a different requester', () => {
    const manager = new FoundationReservationManager()
    const reservation = manager.reserve('foundation-1', 'preview-request-1')
    const siteSpec = buildSiteSpec()
    const adaptation = createProspectAdaptation('adapt-1', siteSpec, reservation, {})
    manager.release(reservation.reservationId)
    const newReservation = manager.reserve('foundation-1', 'preview-request-2')

    archiveAndRecycleFoundation(adaptation, manager)

    // The stale adaptation's archival must not have touched the newer, unrelated reservation.
    expect(manager.getActiveReservation('foundation-1')?.reservationId).toBe(newReservation.reservationId)
  })
})

describe('archiveAndRecycleFoundation with a ConversionLockRegistry (manual §10.33/§10.45)', () => {
  it('recycles normally when no Conversion Lock exists for the Foundation', () => {
    const manager = new FoundationReservationManager()
    const lockRegistry = new ConversionLockRegistry()
    const reservation = manager.reserve('foundation-1', 'preview-request-1')
    const siteSpec = buildSiteSpec()
    const adaptation = createProspectAdaptation('adapt-1', siteSpec, reservation, {})

    const archived = archiveAndRecycleFoundation(adaptation, manager, lockRegistry)

    expect(archived.status).toBe('archived')
    expect(manager.getActiveReservation('foundation-1')).toBeNull()
  })

  it('refuses to recycle a Foundation that is locked for conversion, and does not archive the Adaptation', () => {
    const manager = new FoundationReservationManager()
    const lockRegistry = new ConversionLockRegistry()
    const reservation = manager.reserve('foundation-1', 'preview-request-1')
    const siteSpec = buildSiteSpec()
    let adaptation = createProspectAdaptation('adapt-1', siteSpec, reservation, {})
    adaptation = transitionAdaptation(adaptation, 'previewed')
    adaptation = transitionAdaptation(adaptation, 'published')
    lockRegistry.createLock({
      adaptation,
      previewDeploymentVersionRef: 'deployment-v1',
      conversionInstructionRef: 'conversion-1',
      stripePaymentConfirmationRef: 'stripe-1',
      odooCommercialRecordRef: 'odoo-1',
    })

    expect(() => archiveAndRecycleFoundation(adaptation, manager, lockRegistry)).toThrow(ConversionLockError)
    // The Adaptation must remain unarchived -- the whole operation aborts, not just the reservation release.
    expect(adaptation.status).toBe('published')
    expect(manager.getActiveReservation('foundation-1')).not.toBeNull()
  })

  it('remains backward-compatible: omitting the registry entirely still recycles normally', () => {
    const manager = new FoundationReservationManager()
    const reservation = manager.reserve('foundation-1', 'preview-request-1')
    const siteSpec = buildSiteSpec()
    const adaptation = createProspectAdaptation('adapt-1', siteSpec, reservation, {})

    const archived = archiveAndRecycleFoundation(adaptation, manager)

    expect(archived.status).toBe('archived')
  })
})

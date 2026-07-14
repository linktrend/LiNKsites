import { describe, expect, it } from 'vitest'
import {
  FoundationError,
  FoundationReservationManager,
  assertFoundationIsProductionReady,
  assertFoundationMatchesKitAndTier,
  assertProspectNeutral,
  scanForProhibitedFields,
  type ReusableSiteFoundation,
} from '../src/reusableFoundation.js'

function buildFoundation(overrides: Partial<ReusableSiteFoundation> = {}): ReusableSiteFoundation {
  return {
    schemaVersion: { major: 1, minor: 0 },
    foundationId: 'foundation-home-services-standard-001',
    displayName: 'Home Services / Standard — Foundation 001',
    status: 'candidate',
    kitId: 'home_services',
    tierId: 'standard',
    platformReleaseRef: 'platform-release-unset',
    assemblyManifestRef: 'assembly-manifest-unset',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('Foundation lifecycle guard', () => {
  it('rejects a candidate Foundation as production-ready', () => {
    expect(() => assertFoundationIsProductionReady(buildFoundation({ status: 'candidate' }))).toThrow(FoundationError)
  })

  it('accepts an active Foundation as production-ready', () => {
    expect(() => assertFoundationIsProductionReady(buildFoundation({ status: 'active' }))).not.toThrow()
  })

  it('rejects a retired Foundation as production-ready', () => {
    expect(() => assertFoundationIsProductionReady(buildFoundation({ status: 'retired' }))).toThrow(FoundationError)
  })
})

describe('Kit/tier matching (manual §08.28)', () => {
  it('accepts a Foundation that matches the requested Kit and tier', () => {
    const foundation = buildFoundation({ kitId: 'home_services', tierId: 'standard' })
    expect(() => assertFoundationMatchesKitAndTier(foundation, 'home_services', 'standard')).not.toThrow()
  })

  it('rejects a Foundation built for a different Kit', () => {
    const foundation = buildFoundation({ kitId: 'home_services' })
    expect(() => assertFoundationMatchesKitAndTier(foundation, 'landscaping', 'standard')).toThrow(FoundationError)
  })

  it('rejects a Foundation built for a different tier', () => {
    const foundation = buildFoundation({ tierId: 'standard' })
    expect(() => assertFoundationMatchesKitAndTier(foundation, 'home_services', 'premium')).toThrow(FoundationError)
  })
})

describe('prospect-neutrality scanning (manual §08.19)', () => {
  it('finds no violations in clean, generic content', () => {
    const violations = scanForProhibitedFields({ heroHeadline: 'Reliable Home Services', ctaLabel: 'Get a Quote' })
    expect(violations).toEqual([])
  })

  it('flags a prospect name field', () => {
    const violations = scanForProhibitedFields({ prospectName: 'Acme Plumbing' })
    expect(violations).toContain('prospectName')
  })

  it('flags nested prohibited fields', () => {
    const violations = scanForProhibitedFields({ contact: { customerEmail: 'x@example.com' } })
    expect(violations).toContain('contact.customerEmail')
  })

  it('flags credentials/secrets/analytics IDs', () => {
    const violations = scanForProhibitedFields({ apiKey: 'sk_live_x', gaTrackingId: 'UA-123' })
    expect(violations.length).toBe(2)
  })

  it('assertProspectNeutral throws with the specific violating field paths listed', () => {
    expect(() => assertProspectNeutral({ prospectName: 'Acme' })).toThrow(/prospectName/)
  })
})

describe('FoundationReservationManager (manual §08.28, §10.18)', () => {
  it('reserves an unreserved Foundation', () => {
    const manager = new FoundationReservationManager()
    const reservation = manager.reserve('foundation-1', 'preview-request-1')
    expect(reservation.status).toBe('active')
  })

  it('rejects a second concurrent reservation for the same Foundation (exclusivity)', () => {
    const manager = new FoundationReservationManager()
    manager.reserve('foundation-1', 'preview-request-1')
    expect(() => manager.reserve('foundation-1', 'preview-request-2')).toThrow(FoundationError)
  })

  it('allows a new reservation after the prior one is released', () => {
    const manager = new FoundationReservationManager()
    const first = manager.reserve('foundation-1', 'preview-request-1')
    manager.release(first.reservationId)
    const second = manager.reserve('foundation-1', 'preview-request-2')
    expect(second.status).toBe('active')
  })

  it('allows a new reservation after the prior one expires', async () => {
    const manager = new FoundationReservationManager()
    manager.reserve('foundation-1', 'preview-request-1', 1)
    await new Promise((resolve) => setTimeout(resolve, 5))
    const second = manager.reserve('foundation-1', 'preview-request-2')
    expect(second.status).toBe('active')
  })

  it('getActiveReservation returns null once expired, without needing an explicit release', async () => {
    const manager = new FoundationReservationManager()
    manager.reserve('foundation-1', 'preview-request-1', 1)
    await new Promise((resolve) => setTimeout(resolve, 5))
    expect(manager.getActiveReservation('foundation-1')).toBeNull()
  })

  it('different Foundations can be reserved independently', () => {
    const manager = new FoundationReservationManager()
    expect(() => manager.reserve('foundation-1', 'req-1')).not.toThrow()
    expect(() => manager.reserve('foundation-2', 'req-2')).not.toThrow()
  })

  it('throws FoundationError when releasing an unknown reservationId', () => {
    const manager = new FoundationReservationManager()
    expect(() => manager.release('does-not-exist')).toThrow(FoundationError)
  })
})

import { describe, expect, it } from 'vitest'
import { computePreviewInventorySnapshot } from '../src/previewInventory.js'
import { FoundationReservationManager, type ReusableSiteFoundation } from '../src/reusableFoundation.js'
import type { ProspectAdaptation, ProspectAdaptationStatus } from '../src/prospectAdaptation.js'

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

function buildAdaptation(overrides: Partial<ProspectAdaptation> = {}): ProspectAdaptation {
  return {
    schemaVersion: { major: 1, minor: 0 },
    adaptationId: 'adapt-1',
    siteSpecId: 'sitespec-1',
    foundationId: 'foundation-1',
    reservationId: 'res-1',
    status: 'draft',
    prospectContent: {},
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('computePreviewInventorySnapshot: empty inputs', () => {
  it('returns a zeroed snapshot with reservationUtilizationRate exactly 0 (not NaN)', () => {
    const manager = new FoundationReservationManager()
    const snapshot = computePreviewInventorySnapshot([], manager, [])

    expect(snapshot.totalFoundations).toBe(0)
    expect(snapshot.foundationCountsByStatus).toEqual({ candidate: 0, active: 0, deprecated: 0, retired: 0 })
    expect(snapshot.foundationCountsByKitAndTier).toEqual([])
    expect(snapshot.reservationUtilizationRate).toBe(0)
    expect(Number.isNaN(snapshot.reservationUtilizationRate)).toBe(false)
    expect(snapshot.totalAdaptations).toBe(0)
    expect(snapshot.adaptationCountsByStatus).toEqual({ draft: 0, previewed: 0, published: 0, archived: 0 })
    expect(snapshot.foundationReuseDistribution).toEqual([])
    expect(typeof snapshot.generatedAt).toBe('string')
  })
})

describe('computePreviewInventorySnapshot: foundationCountsByStatus', () => {
  it('tallies a mix of all 4 statuses correctly', () => {
    const manager = new FoundationReservationManager()
    const foundations: ReusableSiteFoundation[] = [
      buildFoundation({ foundationId: 'f-1', status: 'candidate' }),
      buildFoundation({ foundationId: 'f-2', status: 'candidate' }),
      buildFoundation({ foundationId: 'f-3', status: 'active' }),
      buildFoundation({ foundationId: 'f-4', status: 'deprecated' }),
      buildFoundation({ foundationId: 'f-5', status: 'retired' }),
      buildFoundation({ foundationId: 'f-6', status: 'retired' }),
    ]
    const snapshot = computePreviewInventorySnapshot(foundations, manager, [])

    expect(snapshot.totalFoundations).toBe(6)
    expect(snapshot.foundationCountsByStatus).toEqual({ candidate: 2, active: 1, deprecated: 1, retired: 2 })
  })
})

describe('computePreviewInventorySnapshot: foundationCountsByKitAndTier', () => {
  it('groups distinct (kitId, tierId) pairs and counts a shared pair correctly', () => {
    const manager = new FoundationReservationManager()
    const foundations: ReusableSiteFoundation[] = [
      buildFoundation({ foundationId: 'f-1', kitId: 'home_services', tierId: 'standard' }),
      buildFoundation({ foundationId: 'f-2', kitId: 'home_services', tierId: 'standard' }),
      buildFoundation({ foundationId: 'f-3', kitId: 'home_services', tierId: 'premium' }),
      buildFoundation({ foundationId: 'f-4', kitId: 'landscaping', tierId: 'standard' }),
    ]
    const snapshot = computePreviewInventorySnapshot(foundations, manager, [])

    expect(snapshot.foundationCountsByKitAndTier).toEqual(
      expect.arrayContaining([
        { kitId: 'home_services', tierId: 'standard', count: 2 },
        { kitId: 'home_services', tierId: 'premium', count: 1 },
        { kitId: 'landscaping', tierId: 'standard', count: 1 },
      ]),
    )
    expect(snapshot.foundationCountsByKitAndTier).toHaveLength(3)
  })
})

describe('computePreviewInventorySnapshot: reservationUtilizationRate', () => {
  it('computes the correct rate, excluding non-active foundations from numerator and denominator', () => {
    const manager = new FoundationReservationManager()
    const foundations: ReusableSiteFoundation[] = [
      buildFoundation({ foundationId: 'active-reserved-1', status: 'active' }),
      buildFoundation({ foundationId: 'active-reserved-2', status: 'active' }),
      buildFoundation({ foundationId: 'active-unreserved-1', status: 'active' }),
      buildFoundation({ foundationId: 'active-unreserved-2', status: 'active' }),
      // Non-active foundation that DOES have a reservation -- must not count.
      buildFoundation({ foundationId: 'candidate-but-reserved', status: 'candidate' }),
    ]
    manager.reserve('active-reserved-1', 'req-1')
    manager.reserve('active-reserved-2', 'req-2')
    manager.reserve('candidate-but-reserved', 'req-3')

    const snapshot = computePreviewInventorySnapshot(foundations, manager, [])

    // 2 of 4 active foundations have an active reservation.
    expect(snapshot.reservationUtilizationRate).toBe(0.5)
  })

  it('returns 0 when there are no active foundations at all', () => {
    const manager = new FoundationReservationManager()
    const foundations: ReusableSiteFoundation[] = [
      buildFoundation({ foundationId: 'f-1', status: 'candidate' }),
      buildFoundation({ foundationId: 'f-2', status: 'retired' }),
    ]
    const snapshot = computePreviewInventorySnapshot(foundations, manager, [])
    expect(snapshot.reservationUtilizationRate).toBe(0)
  })
})

describe('computePreviewInventorySnapshot: adaptationCountsByStatus', () => {
  it('tallies adaptations spanning all 4 statuses correctly', () => {
    const manager = new FoundationReservationManager()
    const statuses: ProspectAdaptationStatus[] = ['draft', 'draft', 'previewed', 'published', 'archived', 'archived', 'archived']
    const adaptations = statuses.map((status, i) => buildAdaptation({ adaptationId: `adapt-${i}`, status }))

    const snapshot = computePreviewInventorySnapshot([], manager, adaptations)

    expect(snapshot.totalAdaptations).toBe(7)
    expect(snapshot.adaptationCountsByStatus).toEqual({ draft: 2, previewed: 1, published: 1, archived: 3 })
  })
})

describe('computePreviewInventorySnapshot: foundationReuseDistribution', () => {
  it('groups and counts adaptations per foundationId, sorted descending by count', () => {
    const manager = new FoundationReservationManager()
    const adaptations: ProspectAdaptation[] = [
      buildAdaptation({ adaptationId: 'a-1', foundationId: 'foundation-popular' }),
      buildAdaptation({ adaptationId: 'a-2', foundationId: 'foundation-popular' }),
      buildAdaptation({ adaptationId: 'a-3', foundationId: 'foundation-popular' }),
      buildAdaptation({ adaptationId: 'a-4', foundationId: 'foundation-rare' }),
    ]

    const snapshot = computePreviewInventorySnapshot([], manager, adaptations)

    expect(snapshot.foundationReuseDistribution).toEqual([
      { foundationId: 'foundation-popular', adaptationCount: 3 },
      { foundationId: 'foundation-rare', adaptationCount: 1 },
    ])
  })

  it('tie-breaks equal counts by foundationId ascending, deterministically', () => {
    const manager = new FoundationReservationManager()
    const adaptations: ProspectAdaptation[] = [
      buildAdaptation({ adaptationId: 'a-1', foundationId: 'foundation-zebra' }),
      buildAdaptation({ adaptationId: 'a-2', foundationId: 'foundation-alpha' }),
      buildAdaptation({ adaptationId: 'a-3', foundationId: 'foundation-mid' }),
    ]

    const snapshot = computePreviewInventorySnapshot([], manager, adaptations)

    expect(snapshot.foundationReuseDistribution).toEqual([
      { foundationId: 'foundation-alpha', adaptationCount: 1 },
      { foundationId: 'foundation-mid', adaptationCount: 1 },
      { foundationId: 'foundation-zebra', adaptationCount: 1 },
    ])
  })
})

import { describe, expect, it } from 'vitest'
import {
  FoundationMatchingError,
  findAndReserveFoundation,
  findEligibleFoundations,
  rankFoundations,
  type FoundationMatchRequest,
} from '../src/foundationMatching.js'
import { FoundationReservationManager, type ReusableSiteFoundation } from '../src/reusableFoundation.js'

function buildFoundation(overrides: Partial<ReusableSiteFoundation> = {}): ReusableSiteFoundation {
  return {
    schemaVersion: { major: 1, minor: 0 },
    foundationId: 'foundation-home-services-standard-001',
    displayName: 'Home Services / Standard — Foundation 001',
    status: 'active',
    kitId: 'home_services',
    tierId: 'standard',
    platformReleaseRef: 'platform-release-unset',
    assemblyManifestRef: 'assembly-manifest-unset',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

function buildRequest(overrides: Partial<FoundationMatchRequest> = {}): FoundationMatchRequest {
  return {
    kitId: 'home_services',
    tierId: 'standard',
    requesterRef: 'preview-request-1',
    ...overrides,
  }
}

describe('findEligibleFoundations (manual §08.16/§10.18 hard filters)', () => {
  it('excludes a Foundation with the wrong kitId', () => {
    const manager = new FoundationReservationManager()
    const pool = [buildFoundation({ foundationId: 'wrong-kit', kitId: 'landscaping' })]
    expect(findEligibleFoundations(pool, buildRequest(), manager)).toEqual([])
  })

  it('excludes a Foundation with the wrong tierId', () => {
    const manager = new FoundationReservationManager()
    const pool = [buildFoundation({ foundationId: 'wrong-tier', tierId: 'premium' })]
    expect(findEligibleFoundations(pool, buildRequest(), manager)).toEqual([])
  })

  it('excludes a Foundation that is not active', () => {
    const manager = new FoundationReservationManager()
    const pool = [buildFoundation({ foundationId: 'candidate-status', status: 'candidate' })]
    expect(findEligibleFoundations(pool, buildRequest(), manager)).toEqual([])
  })

  it('excludes a Foundation that already has an active reservation', () => {
    const manager = new FoundationReservationManager()
    const pool = [buildFoundation({ foundationId: 'already-reserved' })]
    manager.reserve('already-reserved', 'some-other-requester')
    expect(findEligibleFoundations(pool, buildRequest(), manager)).toEqual([])
  })

  it('includes a Foundation that genuinely passes all hard filters', () => {
    const manager = new FoundationReservationManager()
    const eligible = buildFoundation({ foundationId: 'eligible-one' })
    const pool = [
      buildFoundation({ foundationId: 'wrong-kit', kitId: 'landscaping' }),
      eligible,
    ]
    const result = findEligibleFoundations(pool, buildRequest(), manager)
    expect(result).toEqual([eligible])
  })
})

describe('rankFoundations (first-pass recency ranking)', () => {
  it('returns candidates most-recent-first when createdAt values differ', () => {
    const oldest = buildFoundation({ foundationId: 'f-oldest', createdAt: '2024-01-01T00:00:00.000Z' })
    const middle = buildFoundation({ foundationId: 'f-middle', createdAt: '2024-06-01T00:00:00.000Z' })
    const newest = buildFoundation({ foundationId: 'f-newest', createdAt: '2024-12-01T00:00:00.000Z' })
    const ranked = rankFoundations([oldest, newest, middle])
    expect(ranked.map((f) => f.foundationId)).toEqual(['f-newest', 'f-middle', 'f-oldest'])
  })

  it('tie-breaks deterministically by foundationId ascending when createdAt values are identical', () => {
    const same = '2024-06-01T00:00:00.000Z'
    const b = buildFoundation({ foundationId: 'foundation-b', createdAt: same })
    const a = buildFoundation({ foundationId: 'foundation-a', createdAt: same })
    const ranked = rankFoundations([b, a])
    expect(ranked.map((f) => f.foundationId)).toEqual(['foundation-a', 'foundation-b'])
  })

  it('does not mutate the input array', () => {
    const oldest = buildFoundation({ foundationId: 'f-oldest', createdAt: '2024-01-01T00:00:00.000Z' })
    const newest = buildFoundation({ foundationId: 'f-newest', createdAt: '2024-12-01T00:00:00.000Z' })
    const input = [oldest, newest]
    rankFoundations(input)
    expect(input.map((f) => f.foundationId)).toEqual(['f-oldest', 'f-newest'])
  })
})

describe('findAndReserveFoundation', () => {
  it('happy path: returns the correctly-ranked winner with an active reservation recorded', () => {
    const manager = new FoundationReservationManager()
    const older = buildFoundation({ foundationId: 'f-older', createdAt: '2024-01-01T00:00:00.000Z' })
    const newer = buildFoundation({ foundationId: 'f-newer', createdAt: '2024-12-01T00:00:00.000Z' })
    const pool = [older, newer]

    const result = findAndReserveFoundation(pool, buildRequest(), manager)

    expect(result.foundation.foundationId).toBe('f-newer')
    expect(result.reservation.status).toBe('active')
    expect(result.reservation.foundationId).toBe('f-newer')

    const confirmed = manager.getActiveReservation('f-newer')
    expect(confirmed).not.toBeNull()
    expect(confirmed?.reservationId).toBe(result.reservation.reservationId)
  })

  it('throws FoundationMatchingError when the pool is empty', () => {
    const manager = new FoundationReservationManager()
    expect(() => findAndReserveFoundation([], buildRequest(), manager)).toThrow(FoundationMatchingError)
  })

  it('throws FoundationMatchingError naming the kitId/tierId when every candidate fails the hard filters', () => {
    const manager = new FoundationReservationManager()
    const pool = [
      buildFoundation({ foundationId: 'wrong-kit', kitId: 'landscaping' }),
      buildFoundation({ foundationId: 'wrong-status', status: 'retired' }),
    ]
    expect(() => findAndReserveFoundation(pool, buildRequest({ kitId: 'home_services', tierId: 'premium' }), manager)).toThrow(
      /home_services.*premium/,
    )
  })

  it('skips the single most-eligible Foundation if it is already reserved, and reserves the next-best eligible one instead', () => {
    const manager = new FoundationReservationManager()
    const newest = buildFoundation({ foundationId: 'f-newest', createdAt: '2024-12-01T00:00:00.000Z' })
    const middle = buildFoundation({ foundationId: 'f-middle', createdAt: '2024-06-01T00:00:00.000Z' })
    const pool = [newest, middle]

    manager.reserve('f-newest', 'some-other-requester')

    const result = findAndReserveFoundation(pool, buildRequest(), manager)

    expect(result.foundation.foundationId).toBe('f-middle')
    expect(result.reservation.foundationId).toBe('f-middle')
  })
})

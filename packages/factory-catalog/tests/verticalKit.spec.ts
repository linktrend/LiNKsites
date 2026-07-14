import { describe, expect, it } from 'vitest'
import { TIER_SPECIFICATIONS } from '../src/tierSpecification.js'
import {
  HOME_SERVICES_KIT,
  VerticalKitError,
  assertKitIsProductionReady,
  getKitTierVariant,
  resolveEffectiveMaxPages,
} from '../src/verticalKit.js'

describe('HOME_SERVICES_KIT (Decision DR-06 pilot vertical)', () => {
  it('is deliberately a candidate, not active, until real content review happens', () => {
    expect(HOME_SERVICES_KIT.status).toBe('candidate')
  })

  it('defines a tier variant for all 3 tiers', () => {
    expect(HOME_SERVICES_KIT.tierVariants.map((v) => v.tierId).sort()).toEqual(['enterprise', 'premium', 'standard'])
  })

  it('is rejected as production-ready while still a candidate', () => {
    expect(() => assertKitIsProductionReady(HOME_SERVICES_KIT)).toThrow(VerticalKitError)
  })

  it('would be accepted as production-ready once promoted to active', () => {
    const promoted = { ...HOME_SERVICES_KIT, status: 'active' as const }
    expect(() => assertKitIsProductionReady(promoted)).not.toThrow()
  })
})

describe('getKitTierVariant', () => {
  it('returns the correct variant for a known tier', () => {
    const variant = getKitTierVariant(HOME_SERVICES_KIT, 'premium')
    expect(variant.expectedPageTypes).toContain('gallery')
  })

  it('throws for a Kit with no variant for the requested tier', () => {
    const incompleteKit = { ...HOME_SERVICES_KIT, tierVariants: [] }
    expect(() => getKitTierVariant(incompleteKit, 'standard')).toThrow(VerticalKitError)
  })
})

describe('resolveEffectiveMaxPages (manual §08.17)', () => {
  it('uses the Kit variant limit when it is more restrictive than the base tier', () => {
    // Standard tier base allows 8 pages; Home Services' Standard variant only expects 6.
    const effective = resolveEffectiveMaxPages(TIER_SPECIFICATIONS.standard.dimensions.maxPages, HOME_SERVICES_KIT, 'standard')
    expect(effective).toBe(6)
  })

  it('uses the base tier limit when the Kit variant is more generous (never enlarges entitlement)', () => {
    // A hypothetical Kit variant that claims 100 pages for Standard must not enlarge the base tier's 8-page limit.
    const generousKit = {
      ...HOME_SERVICES_KIT,
      tierVariants: [{ tierId: 'standard' as const, maxPagesForVariant: 100, expectedPageTypes: [] }],
    }
    const effective = resolveEffectiveMaxPages(TIER_SPECIFICATIONS.standard.dimensions.maxPages, generousKit, 'standard')
    expect(effective).toBe(TIER_SPECIFICATIONS.standard.dimensions.maxPages)
  })
})

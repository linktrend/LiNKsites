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
  it('is active, promoted 2026-07-14 per Carlos\'s instruction to proceed with a research-grounded provisional default', () => {
    expect(HOME_SERVICES_KIT.status).toBe('active')
  })

  it('defines a tier variant for all 3 tiers', () => {
    expect(HOME_SERVICES_KIT.tierVariants.map((v) => v.tierId).sort()).toEqual(['enterprise', 'premium', 'standard'])
  })

  it('is accepted as production-ready', () => {
    expect(() => assertKitIsProductionReady(HOME_SERVICES_KIT)).not.toThrow()
  })

  it('is rejected as production-ready if reverted to a non-active status', () => {
    const reverted = { ...HOME_SERVICES_KIT, status: 'candidate' as const }
    expect(() => assertKitIsProductionReady(reverted)).toThrow(VerticalKitError)
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
  it('agrees with the base tier when the Kit variant is aligned with it (both research-grounded defaults)', () => {
    // Standard tier base and Home Services' Standard variant are both 6 pages (kept deliberately aligned).
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

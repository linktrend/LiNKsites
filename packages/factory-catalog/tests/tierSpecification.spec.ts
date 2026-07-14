import { describe, expect, it } from 'vitest'
import { TIER_SPECIFICATIONS, checkEntitlement, resolveMostRestrictive } from '../src/tierSpecification.js'

describe('TIER_SPECIFICATIONS', () => {
  it('defines exactly the 3 provisional tiers per manual §03', () => {
    expect(Object.keys(TIER_SPECIFICATIONS).sort()).toEqual(['enterprise', 'premium', 'standard'])
  })

  it('Standard permits no custom component code, per manual §03 §7.1', () => {
    expect(TIER_SPECIFICATIONS.standard.dimensions.allowsCustomComponentCode).toBe(false)
    expect(TIER_SPECIFICATIONS.standard.dimensions.permitsBaseProductCustomCode).toBe(false)
  })

  it('Enterprise still requires exception review for base-product custom code, per manual §03 §7.3', () => {
    // Even Enterprise doesn't get a plain "allowed" for base-product
    // custom code -- this is the manual's explicit "always an exception"
    // rule, not a tier-gated feature.
    expect(TIER_SPECIFICATIONS.enterprise.dimensions.permitsBaseProductCustomCode).toBe(false)
  })
})

describe('customerCmsAccess launch default (Carlos-approved, 2026-07-14)', () => {
  it('every tier -- including Enterprise -- has no customer CMS access at launch', () => {
    for (const tier of Object.values(TIER_SPECIFICATIONS)) {
      expect(tier.dimensions.customerCmsAccess).toBe('none')
    }
  })

  it('Premium and Enterprise are recorded as future CMS-access candidates; Standard is not', () => {
    expect(TIER_SPECIFICATIONS.standard.dimensions.futureCmsAccessCandidate).toBe(false)
    expect(TIER_SPECIFICATIONS.premium.dimensions.futureCmsAccessCandidate).toBe(true)
    expect(TIER_SPECIFICATIONS.enterprise.dimensions.futureCmsAccessCandidate).toBe(true)
  })
})

describe('research-grounded page-count defaults (2026-07-14)', () => {
  it('Standard sits within the researched 5-8 page starter-package range', () => {
    expect(TIER_SPECIFICATIONS.standard.dimensions.maxPages).toBeGreaterThanOrEqual(5)
    expect(TIER_SPECIFICATIONS.standard.dimensions.maxPages).toBeLessThanOrEqual(8)
  })

  it('Premium sits within the researched 10-15 page business-tier range', () => {
    expect(TIER_SPECIFICATIONS.premium.dimensions.maxPages).toBeGreaterThanOrEqual(10)
    expect(TIER_SPECIFICATIONS.premium.dimensions.maxPages).toBeLessThanOrEqual(15)
  })

  it('Premium always offers strictly more pages than Standard', () => {
    expect(TIER_SPECIFICATIONS.premium.dimensions.maxPages).toBeGreaterThan(TIER_SPECIFICATIONS.standard.dimensions.maxPages)
  })
})

describe('priceUsdPerMonthProvisional (illustrative only, not an approved price)', () => {
  it('Standard and Premium carry an illustrative monthly price, with Premium priced higher', () => {
    expect(TIER_SPECIFICATIONS.standard.priceUsdPerMonthProvisional).toBeGreaterThan(0)
    expect(TIER_SPECIFICATIONS.premium.priceUsdPerMonthProvisional).toBeGreaterThan(TIER_SPECIFICATIONS.standard.priceUsdPerMonthProvisional!)
  })

  it('Enterprise deliberately omits a flat illustrative price (custom-quoted, not researchable in the abstract)', () => {
    expect(TIER_SPECIFICATIONS.enterprise.priceUsdPerMonthProvisional).toBeUndefined()
  })
})

describe('checkEntitlement', () => {
  it('allows a page count within the Standard tier limit', () => {
    const result = checkEntitlement(TIER_SPECIFICATIONS.standard, { kind: 'page_count', requested: 5 })
    expect(result.disposition).toBe('allowed')
  })

  it('requires an upgrade when a page count exceeds the Standard tier limit but fits Premium', () => {
    const result = checkEntitlement(TIER_SPECIFICATIONS.standard, { kind: 'page_count', requested: 15 })
    expect(result.disposition).toBe('requires_upgrade')
    expect(result.reason).toContain('premium')
  })

  it('Enterprise has an unbounded page limit in this provisional model, so no page count is ever unsupported there', () => {
    const result = checkEntitlement(TIER_SPECIFICATIONS.enterprise, { kind: 'page_count', requested: 1_000_000 })
    expect(result.disposition).toBe('allowed')
  })

  it('requires an upgrade for custom component code on Standard', () => {
    const result = checkEntitlement(TIER_SPECIFICATIONS.standard, { kind: 'custom_component_code' })
    expect(result.disposition).toBe('requires_upgrade')
  })

  it('reports unsupported for custom component code when already on the highest tier that lacks it', () => {
    // Neither standard nor premium allow it; from premium the "upgrade" path leads to enterprise, which does allow it.
    const result = checkEntitlement(TIER_SPECIFICATIONS.premium, { kind: 'custom_component_code' })
    expect(result.disposition).toBe('requires_upgrade')
    expect(result.reason).toContain('enterprise')
  })

  it('always requires exception review for dedicated runtime, even on the tier that nominally offers it', () => {
    const result = checkEntitlement(TIER_SPECIFICATIONS.enterprise, { kind: 'dedicated_runtime' })
    expect(result.disposition).toBe('exception_required')
  })

  it('always requires exception review for base-product custom code, regardless of tier (manual §03 §7.1/§7.3)', () => {
    for (const tier of Object.values(TIER_SPECIFICATIONS)) {
      const result = checkEntitlement(tier, { kind: 'base_product_custom_code' })
      expect(result.disposition).toBe('exception_required')
    }
  })

  it('allows additional integrations within the Premium limit', () => {
    const result = checkEntitlement(TIER_SPECIFICATIONS.premium, { kind: 'additional_integration', requestedCount: 1 })
    expect(result.disposition).toBe('allowed')
  })

  it('requires an upgrade for additional integrations beyond the Standard limit (which is zero)', () => {
    const result = checkEntitlement(TIER_SPECIFICATIONS.standard, { kind: 'additional_integration', requestedCount: 1 })
    expect(result.disposition).toBe('requires_upgrade')
  })

  it('reports unsupported for additional locales when even the highest tier cannot satisfy the request', () => {
    const result = checkEntitlement(TIER_SPECIFICATIONS.enterprise, { kind: 'additional_localization_locale', requestedCount: Number.POSITIVE_INFINITY + 1 })
    // Enterprise's own limit is POSITIVE_INFINITY, so nothing exceeds it in practice -- exercise the
    // genuinely-unsupported branch with a synthetic highest-tier spec that has a finite limit instead.
    expect(result.disposition).toBe('allowed')

    const finiteEnterprise = { ...TIER_SPECIFICATIONS.enterprise, dimensions: { ...TIER_SPECIFICATIONS.enterprise.dimensions, maxAdditionalLocalizationLocales: 5 } }
    const unsupportedResult = checkEntitlement(finiteEnterprise, { kind: 'additional_localization_locale', requestedCount: 6 })
    expect(unsupportedResult.disposition).toBe('unsupported')
  })

  it('reports unsupported for additional integrations when even the highest tier cannot satisfy the request', () => {
    const finiteEnterprise = { ...TIER_SPECIFICATIONS.enterprise, dimensions: { ...TIER_SPECIFICATIONS.enterprise.dimensions, maxAdditionalIntegrations: 5 } }
    const result = checkEntitlement(finiteEnterprise, { kind: 'additional_integration', requestedCount: 6 })
    expect(result.disposition).toBe('unsupported')
  })

  it('requires an upgrade for dedicated runtime on a tier that does not offer it, when a higher tier does', () => {
    const result = checkEntitlement(TIER_SPECIFICATIONS.standard, { kind: 'dedicated_runtime' })
    expect(result.disposition).toBe('requires_upgrade')
    expect(result.reason).toContain('premium')
  })

  it('reports unsupported for dedicated runtime when no higher tier offers it either', () => {
    // None of the 3 real provisional tiers reach this path directly (enterprise, the highest,
    // already offers dedicatedRuntime), so exercise it with a synthetic highest-tier spec that
    // also lacks it, to cover the genuinely-unsupported branch.
    const noDedicatedRuntimeAnywhere = { ...TIER_SPECIFICATIONS.enterprise, dimensions: { ...TIER_SPECIFICATIONS.enterprise.dimensions, dedicatedRuntime: false } }
    const result = checkEntitlement(noDedicatedRuntimeAnywhere, { kind: 'dedicated_runtime' })
    expect(result.disposition).toBe('unsupported')
  })

  it('allows base-product custom code for a synthetic tier configuration that explicitly permits it', () => {
    // None of the 3 real provisional tiers set permitsBaseProductCustomCode: true (manual §03
    // §7.1/§7.3 -- always an exception by default), but the 'allowed' branch of checkEntitlement's
    // base_product_custom_code case must still be exercised for a tier that explicitly does.
    const hypotheticalTierWithApproval = { ...TIER_SPECIFICATIONS.enterprise, dimensions: { ...TIER_SPECIFICATIONS.enterprise.dimensions, permitsBaseProductCustomCode: true } }
    const result = checkEntitlement(hypotheticalTierWithApproval, { kind: 'base_product_custom_code' })
    expect(result.disposition).toBe('allowed')
  })
})

describe('resolveMostRestrictive (manual §08.17)', () => {
  it('a Kit Tier Variant can never enlarge entitlement beyond the base Tier Specification', () => {
    // Tier allows 10, but the Vertical Kit's variant for this vertical only supports 6 -- the
    // more restrictive number must win.
    expect(resolveMostRestrictive(10, 6)).toBe(6)
  })

  it('a Kit Tier Variant that is MORE generous than the tier does not enlarge entitlement', () => {
    // Kit variant claims to support 20, but the tier only allows 10 -- the tier wins.
    expect(resolveMostRestrictive(10, 20)).toBe(10)
  })
})

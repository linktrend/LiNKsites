import { describe, expect, it } from 'vitest'
import { resolveSiteSpecification, SiteSpecificationError, type ResolveSiteSpecificationInput } from '../src/siteSpecification.js'
import { HOME_SERVICES_KIT, type VerticalKit } from '../src/verticalKit.js'
import { TIER_SPECIFICATIONS } from '../src/tierSpecification.js'
import type { ReusableSiteFoundation } from '../src/reusableFoundation.js'
import { resolveSiteDesignProfile, type StyleFamily } from '../src/designCatalog.js'
import { buildSeededComponentRegistry } from '../src/componentRegistry.js'

const ACTIVE_HOME_SERVICES_KIT: VerticalKit = { ...HOME_SERVICES_KIT, status: 'active' }

function buildFoundation(overrides: Partial<ReusableSiteFoundation> = {}): ReusableSiteFoundation {
  return {
    schemaVersion: { major: 1, minor: 0 },
    foundationId: 'foundation-1',
    displayName: 'Foundation 1',
    status: 'active',
    kitId: 'home_services',
    tierId: 'standard',
    platformReleaseRef: 'release-1',
    assemblyManifestRef: 'manifest-1',
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

const READY_STYLE: StyleFamily = {
  schemaVersion: { major: 1, minor: 0 },
  styleId: 'style-1',
  displayName: 'Style 1',
  status: 'active',
  accessibilityContrastPassed: true,
  baseTokens: { 'color.primary': '#0ea5e9' },
  fontPairing: { headingFont: 'Inter', bodyFont: 'Inter' },
}

function buildBaseInput(overrides: Partial<ResolveSiteSpecificationInput> = {}): ResolveSiteSpecificationInput {
  const componentRegistry = buildSeededComponentRegistry()
  return {
    siteSpecId: 'sitespec-1',
    siteRef: 'site-1',
    kit: ACTIVE_HOME_SERVICES_KIT,
    tier: TIER_SPECIFICATIONS.standard,
    foundation: buildFoundation(),
    designProfile: resolveSiteDesignProfile('site-1', READY_STYLE),
    componentRegistry,
    selectedComponentIds: ['SignupHero', 'CTASection'],
    pageCount: 5,
    ...overrides,
  }
}

describe('resolveSiteSpecification: happy path', () => {
  it('resolves a valid Site Specification from all five Phase 3 objects', () => {
    const spec = resolveSiteSpecification(buildBaseInput())
    expect(spec.kitId).toBe('home_services')
    expect(spec.tierId).toBe('standard')
    expect(spec.foundationId).toBe('foundation-1')
    expect(spec.selectedComponentIds).toEqual(['SignupHero', 'CTASection'])
    expect(spec.effectiveMaxPages).toBe(6) // min(standard tier's 8, Kit's Standard variant 6) per resolveMostRestrictive
  })
})

describe('resolveSiteSpecification: cross-object invariant enforcement', () => {
  it('rejects a non-active Vertical Kit', () => {
    const input = buildBaseInput({ kit: HOME_SERVICES_KIT }) // still 'candidate'
    expect(() => resolveSiteSpecification(input)).toThrow()
  })

  it('rejects a non-active Foundation', () => {
    const input = buildBaseInput({ foundation: buildFoundation({ status: 'candidate' }) })
    expect(() => resolveSiteSpecification(input)).toThrow()
  })

  it('rejects a Foundation built for a different Kit', () => {
    const input = buildBaseInput({ foundation: buildFoundation({ kitId: 'landscaping' }) })
    expect(() => resolveSiteSpecification(input)).toThrow()
  })

  it('rejects a Foundation built for a different tier', () => {
    const input = buildBaseInput({ foundation: buildFoundation({ tierId: 'premium' }) })
    expect(() => resolveSiteSpecification(input)).toThrow()
  })

  it('rejects a Design Profile resolved for a different site', () => {
    const mismatchedProfile = resolveSiteDesignProfile('a-different-site', READY_STYLE)
    const input = buildBaseInput({ designProfile: mismatchedProfile })
    expect(() => resolveSiteSpecification(input)).toThrow(SiteSpecificationError)
  })

  it('rejects a component not available for the selected tier', () => {
    const registry = buildSeededComponentRegistry()
    registry.register({
      schemaVersion: { major: 1, minor: 0 },
      componentId: 'EnterpriseOnlyWidget',
      displayName: 'Enterprise-only widget',
      status: 'active',
      category: 'marketing',
      sourceFile: 'src/components/marketing/EnterpriseOnlyWidget.tsx',
      requiresCustomCode: true,
      restrictedToTiers: [],
    })
    const input = buildBaseInput({ componentRegistry: registry, selectedComponentIds: ['EnterpriseOnlyWidget'] })
    expect(() => resolveSiteSpecification(input)).toThrow()
  })

  it('rejects a page count exceeding the Kit+Tier effective limit', () => {
    const input = buildBaseInput({ pageCount: 100 })
    expect(() => resolveSiteSpecification(input)).toThrow(SiteSpecificationError)
  })

  it('accepts a page count exactly at the effective limit', () => {
    const spec = resolveSiteSpecification(buildBaseInput({ pageCount: 6 }))
    expect(spec.pageCount).toBe(6)
  })

  it('rejects a page count one over the effective limit', () => {
    expect(() => resolveSiteSpecification(buildBaseInput({ pageCount: 7 }))).toThrow(SiteSpecificationError)
  })
})

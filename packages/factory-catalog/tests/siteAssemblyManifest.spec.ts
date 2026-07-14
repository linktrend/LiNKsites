import { describe, expect, it } from 'vitest'
import {
  assembleSiteManifest,
  SiteAssemblyError,
  type AssembleSiteManifestInput,
  type PagePlanEntry,
} from '../src/siteAssemblyManifest.js'
import { HOME_SERVICES_KIT, type VerticalKit } from '../src/verticalKit.js'
import { buildSeededComponentRegistry } from '../src/componentRegistry.js'
import type { SiteSpecification } from '../src/siteSpecification.js'
import type { ProspectAdaptation } from '../src/prospectAdaptation.js'

const ACTIVE_HOME_SERVICES_KIT: VerticalKit = { ...HOME_SERVICES_KIT, status: 'active' }

function buildSiteSpec(overrides: Partial<SiteSpecification> = {}): SiteSpecification {
  return {
    schemaVersion: { major: 1, minor: 0 },
    siteSpecId: 'sitespec-1',
    siteRef: 'site-1',
    kitId: 'home_services',
    tierId: 'standard',
    foundationId: 'foundation-1',
    designProfileRef: 'site-1',
    selectedComponentIds: ['SignupHero', 'CTASection'],
    pageCount: 5,
    effectiveMaxPages: 6,
    resolvedAt: new Date().toISOString(),
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
    prospectContent: { businessName: 'Acme Plumbing' },
    createdAt: new Date().toISOString(),
    ...overrides,
  }
}

const BASE_PAGE_PLAN: PagePlanEntry[] = [
  { route: '/', pageType: 'home', componentIds: ['SignupHero', 'CTASection'] },
  { route: '/services', pageType: 'services', componentIds: ['OfferShowcase'] },
]

function buildBaseInput(overrides: Partial<AssembleSiteManifestInput> = {}): AssembleSiteManifestInput {
  return {
    manifestId: 'manifest-1',
    manifestVersion: 1,
    siteId: 'site-1',
    siteClass: 'preview',
    siteSpec: buildSiteSpec(),
    adaptation: buildAdaptation(),
    kit: ACTIVE_HOME_SERVICES_KIT,
    componentRegistry: buildSeededComponentRegistry(),
    platformReleaseRef: 'release-1',
    pagePlan: BASE_PAGE_PLAN,
    ...overrides,
  }
}

describe('assembleSiteManifest: happy path', () => {
  it('assembles a preview manifest with an adaptation, with deterministic instanceIds/contentRefs', () => {
    const manifest = assembleSiteManifest(buildBaseInput())

    expect(manifest.pages).toHaveLength(2)
    expect(manifest.pages[0].route).toBe('/')
    expect(manifest.pages[0].sections).toHaveLength(2)
    expect(manifest.pages[0].sections[0]).toMatchObject({
      instanceId: '/:SignupHero:0',
      componentId: 'SignupHero',
      contentRef: 'adaptation:adapt-1:/:SignupHero',
    })
    expect(manifest.pages[0].sections[1]).toMatchObject({
      instanceId: '/:CTASection:1',
      componentId: 'CTASection',
      contentRef: 'adaptation:adapt-1:/:CTASection',
    })
    expect(manifest.pages[1].sections[0]).toMatchObject({
      instanceId: '/services:OfferShowcase:0',
      componentId: 'OfferShowcase',
      contentRef: 'adaptation:adapt-1:/services:OfferShowcase',
    })
    expect(manifest.contentReleaseRef).toBe('adaptation:adapt-1')
    expect(manifest.designProfileRef).toBe('site-1')
    expect(manifest.kitId).toBe('home_services')
    expect(manifest.tierId).toBe('standard')
  })

  it('produces byte-identical pages arrays for two calls with identical inputs (determinism, manual §07.14)', () => {
    const first = assembleSiteManifest(buildBaseInput())
    const second = assembleSiteManifest(buildBaseInput())
    expect(JSON.stringify(first.pages)).toBe(JSON.stringify(second.pages))
  })
})

describe('assembleSiteManifest: foundation-class manifest with no adaptation', () => {
  it('uses foundation-neutral contentRefs when no adaptation is supplied', () => {
    const manifest = assembleSiteManifest(
      buildBaseInput({ siteClass: 'foundation', adaptation: undefined }),
    )

    expect(manifest.siteClass).toBe('foundation')
    expect(manifest.contentReleaseRef).toBe('foundation-neutral:home_services')
    expect(manifest.pages[0].sections[0].contentRef).toBe('foundation-neutral:home_services:/:SignupHero')
    expect(manifest.pages[1].sections[0].contentRef).toBe('foundation-neutral:home_services:/services:OfferShowcase')
  })
})

describe('assembleSiteManifest: negative paths', () => {
  it('rejects a non-active Vertical Kit', () => {
    const input = buildBaseInput({ kit: { ...HOME_SERVICES_KIT, status: 'candidate' as const } })
    expect(() => assembleSiteManifest(input)).toThrow()
  })

  it('rejects an Adaptation whose siteSpecId does not match the Site Specification', () => {
    const input = buildBaseInput({ adaptation: buildAdaptation({ siteSpecId: 'sitespec-other' }) })
    expect(() => assembleSiteManifest(input)).toThrow(SiteAssemblyError)
  })

  it('rejects a Site Specification whose siteRef does not match input.siteId', () => {
    const input = buildBaseInput({ siteSpec: buildSiteSpec({ siteRef: 'site-other' }) })
    expect(() => assembleSiteManifest(input)).toThrow(SiteAssemblyError)
  })

  it('rejects a Site Specification whose kitId does not match the supplied kit', () => {
    const input = buildBaseInput({ siteSpec: buildSiteSpec({ kitId: 'landscaping' }) })
    expect(() => assembleSiteManifest(input)).toThrow(SiteAssemblyError)
  })

  it('rejects a pagePlan referencing a component not available for the tier', () => {
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
    const input = buildBaseInput({
      componentRegistry: registry,
      pagePlan: [{ route: '/', pageType: 'home', componentIds: ['EnterpriseOnlyWidget'] }],
    })
    // standard tier does not permit custom component code
    expect(() => assembleSiteManifest(input)).toThrow()
  })
})

import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  LS02_DEPENDENCY_EVIDENCE,
  LS02_DISPATCH_IDEMPOTENCY,
  assertSiteAdoptionIdentities,
  buildCanonicalAdoptionIdentities,
  computeEffectiveAdoptionIdentity,
  AdoptionIdentityError,
} from '../src/adoptionIdentities.js'
import {
  CAPABILITY_CREDIT_BUDGETS,
  capabilityCreditBudget,
  checkCapabilityCredits,
  freezeEntitlementSnapshot,
  rollbackEntitlementMutation,
  dispositionCreditsForPages,
  CapabilityCreditError,
} from '../src/capabilityCredits.js'
import { resolveSiteSpecification, SiteSpecificationError, type ResolveSiteSpecificationInput } from '../src/siteSpecification.js'
import { assembleSiteManifest, SiteAssemblyError, type AssembleSiteManifestInput, type PagePlanEntry } from '../src/siteAssemblyManifest.js'
import { HOME_SERVICES_KIT, classifyPageCost, isZeroCostPage, type VerticalKit } from '../src/verticalKit.js'
import { TIER_SPECIFICATIONS } from '../src/tierSpecification.js'
import type { ReusableSiteFoundation } from '../src/reusableFoundation.js'
import { resolveSiteDesignProfile, type StyleFamily } from '../src/designCatalog.js'
import { buildSeededComponentRegistry } from '../src/componentRegistry.js'

const ACTIVE_HOME_SERVICES_KIT: VerticalKit = { ...HOME_SERVICES_KIT, status: 'active' }

const PIN = (label: string): string => createHash('sha1').update(`ls02-test:${label}`).digest('hex')

function identities() {
  return buildCanonicalAdoptionIdentities({
    layout: PIN('layout'),
    plan: PIN('plan00'),
    overlay: PIN('overlay'),
    config: PIN('config'),
    content: PIN('content'),
  })
}

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
    createdAt: '2026-08-24T00:00:00.000Z',
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

function specInput(overrides: Partial<ResolveSiteSpecificationInput> = {}): ResolveSiteSpecificationInput {
  return {
    siteSpecId: 'sitespec-ls02',
    siteRef: 'site-ls02',
    kit: ACTIVE_HOME_SERVICES_KIT,
    tier: TIER_SPECIFICATIONS.standard,
    foundation: buildFoundation(),
    designProfile: resolveSiteDesignProfile('site-ls02', READY_STYLE),
    componentRegistry: buildSeededComponentRegistry(),
    selectedComponentIds: ['SignupHero', 'CTASection'],
    pageCount: 5,
    ...overrides,
  }
}

const ADOPTION_PAGES = [
  { route: '/', pageType: 'home' },
  { route: '/privacy', pageType: 'privacy' },
  { route: '/system', pageType: 'system' },
  { route: '/services', pageType: 'services' },
  { route: '/gallery', pageType: 'gallery' },
]

describe('LS-02 dependency evidence', () => {
  it('pins MWT-02 candidateTree, H-09 protected identity, LS-01 base, and dispatch idempotency', () => {
    expect(LS02_DISPATCH_IDEMPOTENCY).toBe('cursor-cloud-dispatch-v1:linksites-ls02-272-base627d6d2')
    expect(LS02_DEPENDENCY_EVIDENCE.mwt02Provider.candidateTree).toBe('0178894d6ce718bb7dff3c141892f82144e2d18c')
    expect(LS02_DEPENDENCY_EVIDENCE.h09Protected.commitSha).toBe('ad8560b242da0d15c0d65a6c8d4d17a0171e2d2b')
    expect(LS02_DEPENDENCY_EVIDENCE.h09Protected.treeSha).toBe('6cab53da19ba390d392157dbcc38979f1a6c86b5')
    expect(LS02_DEPENDENCY_EVIDENCE.ls01Protected.commitSha).toBe('627d6d2ae46dadcf3f8c51d2c8681cba01efc754')
    expect(LS02_DEPENDENCY_EVIDENCE.ls01Protected.treeSha).toBe('a2601a98bd63fff5e358d8f585ff459969a2cbce')
  })
})

describe('ISS-07 adoption identities', () => {
  it('requires exact provider/adapter pins and a matching effective digest', () => {
    const built = identities()
    expect(built.provider).toBe(LS02_DEPENDENCY_EVIDENCE.mwt02Provider.candidateTree)
    expect(built.adapter).toBe(LS02_DEPENDENCY_EVIDENCE.h09Protected.treeSha)
    expect(built.effective).toBe(computeEffectiveAdoptionIdentity(built))
    expect(assertSiteAdoptionIdentities(built)).toEqual(built)
  })

  it('rejects a forged provider identity', () => {
    const built = identities()
    expect(() => assertSiteAdoptionIdentities({ ...built, provider: PIN('forged0') })).toThrow(AdoptionIdentityError)
  })

  it('rejects a mismatched effective identity', () => {
    const built = identities()
    expect(() => assertSiteAdoptionIdentities({ ...built, effective: PIN('wrong00') })).toThrow(AdoptionIdentityError)
  })
})

describe('ISS-08 capability-credit entitlements', () => {
  it('locks A=30 B=15 C=6 L=0', () => {
    expect(CAPABILITY_CREDIT_BUDGETS).toEqual({ A: 30, B: 15, C: 6, L: 0 })
    expect(capabilityCreditBudget('A')).toBe(30)
    expect(capabilityCreditBudget('B')).toBe(15)
    expect(capabilityCreditBudget('C')).toBe(6)
    expect(capabilityCreditBudget('L')).toBe(0)
  })

  it('treats core/legal/system pages as zero-cost', () => {
    expect(classifyPageCost('home')).toBe('core')
    expect(classifyPageCost('privacy')).toBe('legal')
    expect(classifyPageCost('system')).toBe('system')
    expect(isZeroCostPage('contact')).toBe(true)
    expect(isZeroCostPage('services')).toBe(false)
  })

  it('allows Plan C with six capability pages and rejects the seventh', () => {
    expect(checkCapabilityCredits('C', 6).disposition).toBe('allowed')
    expect(checkCapabilityCredits('C', 7).disposition).toBe('requires_upgrade')
  })

  it('rejects capability pages on Plan L', () => {
    expect(checkCapabilityCredits('L', 1).disposition).toBe('unsupported')
  })

  it('freezes an immutable snapshot and rolls back mutation attempts', () => {
    const snapshot = freezeEntitlementSnapshot({ snapshotId: 'snap-1', siteRef: 'site-ls02', planId: 'B' })
    expect(Object.isFrozen(snapshot)).toBe(true)
    expect(snapshot.grantedCredits).toBe(15)
    const attempted = { ...snapshot, grantedCredits: 99, planId: 'A' as const }
    expect(() => rollbackEntitlementMutation(snapshot, attempted)).toThrow(CapabilityCreditError)
    expect(snapshot.grantedCredits).toBe(15)
  })

  it('activates zero-cost pages without consuming credits on Plan L', () => {
    const snapshot = freezeEntitlementSnapshot({ snapshotId: 'snap-l', siteRef: 'site-ls02', planId: 'L' })
    const records = dispositionCreditsForPages(snapshot, [
      { route: '/', pageType: 'home' },
      { route: '/privacy', pageType: 'privacy' },
      { route: '/system', pageType: 'system' },
    ])
    expect(records.every((record) => record.creditCost === 0 && record.activationAllowed && record.includeInNavigation)).toBe(true)
  })
})

describe('ISS-07 resolveSiteSpecification adoption path', () => {
  it('binds identities and an immutable snapshot without using kit maxPages as the credit ceiling', () => {
    const spec = resolveSiteSpecification(
      specInput({
        pageCount: ADOPTION_PAGES.length,
        pageTypes: ADOPTION_PAGES.map((page) => page.pageType),
        capabilityPlanId: 'A',
        adoptionIdentities: identities(),
      }),
    )
    expect(spec.adoptionIdentities?.provider).toBe(LS02_DEPENDENCY_EVIDENCE.mwt02Provider.candidateTree)
    expect(spec.capabilityPlanId).toBe('A')
    expect(spec.entitlementSnapshot?.grantedCredits).toBe(30)
    expect(spec.effectiveMaxPages).toBe(33)
  })

  it('rejects Plan L when capability pages are requested', () => {
    expect(() =>
      resolveSiteSpecification(
        specInput({
          pageCount: ADOPTION_PAGES.length,
          pageTypes: ADOPTION_PAGES.map((page) => page.pageType),
          capabilityPlanId: 'L',
          adoptionIdentities: identities(),
        }),
      ),
    ).toThrow(SiteSpecificationError)
  })

  it('preserves the pre-LS-02 path when adoption fields are omitted', () => {
    const spec = resolveSiteSpecification(specInput({ siteSpecId: 'sitespec-1', siteRef: 'site-1', designProfile: resolveSiteDesignProfile('site-1', READY_STYLE) }))
    expect(spec.adoptionIdentities).toBeUndefined()
    expect(spec.pageCount).toBe(5)
  })
})

describe('ISS-09 deterministic Site Assembly Manifest', () => {
  const pagePlan: PagePlanEntry[] = ADOPTION_PAGES.map((page) => ({
    ...page,
    componentIds: page.pageType === 'services' ? ['OfferShowcase'] : ['SignupHero'],
  }))

  function adoptedSpec() {
    return resolveSiteSpecification(
      specInput({
        pageCount: ADOPTION_PAGES.length,
        pageTypes: ADOPTION_PAGES.map((page) => page.pageType),
        capabilityPlanId: 'B',
        adoptionIdentities: identities(),
      }),
    )
  }

  function assemblyInput(overrides: Partial<AssembleSiteManifestInput> = {}): AssembleSiteManifestInput {
    return {
      manifestId: 'manifest-ls02',
      manifestVersion: 1,
      siteId: 'site-ls02',
      siteClass: 'preview',
      siteSpec: adoptedSpec(),
      kit: ACTIVE_HOME_SERVICES_KIT,
      componentRegistry: buildSeededComponentRegistry(),
      platformReleaseRef: 'release-1',
      pagePlan,
      ...overrides,
    }
  }

  it('emits shell/route/schema plans, credit dispositions, and a stable digest', () => {
    const first = assembleSiteManifest(assemblyInput())
    const second = assembleSiteManifest(assemblyInput())
    expect(first.shellPlan?.navigationRoutes).toEqual(['/', '/privacy', '/system', '/services', '/gallery'])
    expect(first.routePlan?.every((entry) => entry.activationAllowed)).toBe(true)
    expect(first.schemaPlan?.map((entry) => entry.schemaRef)[0]).toContain(identities().content)
    expect(first.creditDispositions?.filter((record) => record.creditCost === 0)).toHaveLength(3)
    expect(first.digest).toMatch(/^[a-f0-9]{64}$/)
    expect(first.digest).toBe(second.digest)
    expect(JSON.stringify(first.pages)).toBe(JSON.stringify(second.pages))
    expect(JSON.stringify({ ...first, resolvedAt: undefined })).toBe(JSON.stringify({ ...second, resolvedAt: undefined }))
  })

  it('rejects over-budget capability pages instead of silently activating them', () => {
    const extra: PagePlanEntry[] = [
      ...pagePlan,
      ...Array.from({ length: 20 }, (_, index) => ({
        route: `/extra-${index}`,
        pageType: 'blog',
        componentIds: ['SignupHero'] as string[],
      })),
    ]
    expect(() => assembleSiteManifest(assemblyInput({ pagePlan: extra }))).toThrow(CapabilityCreditError)
  })

  it('rejects duplicate routes (negative path)', () => {
    expect(() =>
      assembleSiteManifest(
        assemblyInput({
          pagePlan: [
            { route: '/', pageType: 'home', componentIds: ['SignupHero'] },
            { route: '/', pageType: 'about', componentIds: ['CTASection'] },
          ],
        }),
      ),
    ).toThrow(SiteAssemblyError)
  })

  it('does not attach LS-02 plans on the legacy assembly path', () => {
    const manifest = assembleSiteManifest({
      manifestId: 'manifest-1',
      manifestVersion: 1,
      siteId: 'site-1',
      siteClass: 'foundation',
      siteSpec: resolveSiteSpecification(specInput({ siteSpecId: 'sitespec-1', siteRef: 'site-1', designProfile: resolveSiteDesignProfile('site-1', READY_STYLE) })),
      kit: ACTIVE_HOME_SERVICES_KIT,
      componentRegistry: buildSeededComponentRegistry(),
      platformReleaseRef: 'release-1',
      pagePlan: [{ route: '/', pageType: 'home', componentIds: ['SignupHero'] }],
    })
    expect(manifest.digest).toBeUndefined()
    expect(manifest.shellPlan).toBeUndefined()
  })
})

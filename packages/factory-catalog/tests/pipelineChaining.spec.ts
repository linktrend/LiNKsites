import { describe, expect, it } from 'vitest'
import {
  PipelineChainingError,
  buildPromotionRequestFromManifest,
  buildSiteAssemblyInputFromSiteSpecification,
} from '../src/pipelineChaining.js'
import type { SiteSpecification } from '../src/siteSpecification.js'
import type { PagePlanEntry, SiteAssemblyManifest } from '../src/siteAssemblyManifest.js'
import type { WorkingPackage } from '../src/promotionService.js'

function buildSiteSpecification(overrides: Partial<SiteSpecification> = {}): SiteSpecification {
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

function buildSiteAssemblyManifest(overrides: Partial<SiteAssemblyManifest> = {}): SiteAssemblyManifest {
  return {
    schemaVersion: { major: 1, minor: 0 },
    manifestId: 'manifest-1',
    manifestVersion: 1,
    siteId: 'site-1',
    siteClass: 'preview',
    kitId: 'home_services',
    tierId: 'standard',
    platformReleaseRef: 'release-1',
    designProfileRef: 'site-1',
    contentReleaseRef: 'foundation-neutral:home_services',
    pages: [
      {
        route: '/',
        pageType: 'home',
        sections: [
          {
            instanceId: '/:SignupHero:0',
            componentId: 'SignupHero',
            componentVersion: '1.0',
            contentRef: 'foundation-neutral:home_services:/:SignupHero',
          },
        ],
      },
    ],
    lineage: {},
    resolvedAt: new Date().toISOString(),
    ...overrides,
  }
}

function buildWorkingPackage(overrides: Partial<WorkingPackage> = {}): WorkingPackage {
  return {
    workingPackageId: 'wp-1',
    workingPackageVersion: 1,
    packageChecksum: 'checksum-1',
    items: [
      {
        sourceItemId: 'item-1',
        payloadCollection: 'pages',
        payloadOperation: 'create',
        targetExternalKey: 'home',
        data: { title: 'Home' },
      },
    ],
    ...overrides,
  }
}

const VALID_PAGE_PLAN: PagePlanEntry[] = [{ route: '/', pageType: 'home', componentIds: ['SignupHero', 'CTASection'] }]

describe('buildSiteAssemblyInputFromSiteSpecification', () => {
  it('maps every field correctly from an accepted Site Specification plus extras, including a supplied adaptationId', () => {
    const spec = buildSiteSpecification()

    const result = buildSiteAssemblyInputFromSiteSpecification(spec, {
      manifestId: 'manifest-1',
      manifestVersion: 1,
      siteClass: 'preview',
      platformReleaseRef: 'release-1',
      pagePlan: VALID_PAGE_PLAN,
      adaptationId: 'adapt-1',
    })

    expect(result).toEqual({
      manifestId: 'manifest-1',
      manifestVersion: 1,
      siteId: 'site-1',
      siteClass: 'preview',
      siteSpecId: 'sitespec-1',
      adaptationId: 'adapt-1',
      kitId: 'home_services',
      platformReleaseRef: 'release-1',
      pagePlan: VALID_PAGE_PLAN,
    })
  })

  it('omits adaptationId (leaves it undefined) when extras does not supply one', () => {
    const spec = buildSiteSpecification()

    const result = buildSiteAssemblyInputFromSiteSpecification(spec, {
      manifestId: 'manifest-1',
      manifestVersion: 1,
      siteClass: 'foundation',
      platformReleaseRef: 'release-1',
      pagePlan: VALID_PAGE_PLAN,
    })

    expect(result.adaptationId).toBeUndefined()
    expect(result.siteId).toBe(spec.siteRef)
    expect(result.siteSpecId).toBe(spec.siteSpecId)
    expect(result.kitId).toBe(spec.kitId)
  })

  it('throws PipelineChainingError with a clear message when pagePlan is empty', () => {
    const spec = buildSiteSpecification()

    expect(() =>
      buildSiteAssemblyInputFromSiteSpecification(spec, {
        manifestId: 'manifest-1',
        manifestVersion: 1,
        siteClass: 'preview',
        platformReleaseRef: 'release-1',
        pagePlan: [],
      }),
    ).toThrow(PipelineChainingError)

    expect(() =>
      buildSiteAssemblyInputFromSiteSpecification(spec, {
        manifestId: 'manifest-1',
        manifestVersion: 1,
        siteClass: 'preview',
        platformReleaseRef: 'release-1',
        pagePlan: [],
      }),
    ).toThrow(/empty pagePlan/)
  })
})

describe('buildPromotionRequestFromManifest', () => {
  it('maps every field correctly from an accepted Site Assembly Manifest plus extras, including a supplied requiredGateReceiptIds', () => {
    const manifest = buildSiteAssemblyManifest()
    const workingPackage = buildWorkingPackage()

    const result = buildPromotionRequestFromManifest(manifest, {
      promotionRequestId: 'promo-1',
      idempotencyKey: 'idem-1',
      workingPackage,
      requiredGateReceiptIds: ['gate-receipt-1'],
    })

    expect(result).toEqual({
      schemaVersion: manifest.schemaVersion,
      promotionRequestId: 'promo-1',
      idempotencyKey: 'idem-1',
      targetSiteId: 'site-1',
      targetState: 'draft',
      workingPackage,
      assemblyManifestId: 'manifest-1',
      requiredGateReceiptIds: ['gate-receipt-1'],
    })
  })

  it('defaults requiredGateReceiptIds to an empty array when extras does not supply one', () => {
    const manifest = buildSiteAssemblyManifest()
    const workingPackage = buildWorkingPackage()

    const result = buildPromotionRequestFromManifest(manifest, {
      promotionRequestId: 'promo-1',
      idempotencyKey: 'idem-1',
      workingPackage,
    })

    expect(result.requiredGateReceiptIds).toEqual([])
    expect(result.targetState).toBe('draft')
  })

  it('throws PipelineChainingError with a clear message when workingPackage.items is empty', () => {
    const manifest = buildSiteAssemblyManifest()
    const emptyWorkingPackage = buildWorkingPackage({ items: [] })

    expect(() =>
      buildPromotionRequestFromManifest(manifest, {
        promotionRequestId: 'promo-1',
        idempotencyKey: 'idem-1',
        workingPackage: emptyWorkingPackage,
      }),
    ).toThrow(PipelineChainingError)

    expect(() =>
      buildPromotionRequestFromManifest(manifest, {
        promotionRequestId: 'promo-1',
        idempotencyKey: 'idem-1',
        workingPackage: emptyWorkingPackage,
      }),
    ).toThrow(/empty workingPackage\.items/)
  })
})

describe('end-to-end pipeline chaining: Site Specification -> Site Assembly input -> resulting Manifest -> Promotion Request', () => {
  it('traces targetSiteId all the way back to the original Site Specification siteRef through both mapping functions', () => {
    const spec = buildSiteSpecification({ siteRef: 'site-acme-plumbing', siteSpecId: 'sitespec-acme' })

    const assemblyInput = buildSiteAssemblyInputFromSiteSpecification(spec, {
      manifestId: 'manifest-acme',
      manifestVersion: 1,
      siteClass: 'preview',
      platformReleaseRef: 'release-1',
      pagePlan: VALID_PAGE_PLAN,
    })

    expect(assemblyInput.siteId).toBe('site-acme-plumbing')
    expect(assemblyInput.siteSpecId).toBe('sitespec-acme')

    // Construct a plausible resulting manifest using the IDs that came out
    // of the first mapping call, proving the two functions actually chain.
    const manifest = buildSiteAssemblyManifest({
      manifestId: assemblyInput.manifestId,
      manifestVersion: assemblyInput.manifestVersion,
      siteId: assemblyInput.siteId,
      siteClass: assemblyInput.siteClass,
      kitId: assemblyInput.kitId,
    })

    const workingPackage = buildWorkingPackage()
    const promotionRequest = buildPromotionRequestFromManifest(manifest, {
      promotionRequestId: 'promo-acme',
      idempotencyKey: 'idem-acme',
      workingPackage,
    })

    expect(promotionRequest.targetSiteId).toBe(spec.siteRef)
    expect(promotionRequest.assemblyManifestId).toBe(assemblyInput.manifestId)
  })
})

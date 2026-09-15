import { createHash } from 'node:crypto'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import {
  LSDATA01_NON_ADMITTED_FIXTURE_TREES,
  LS02_DEPENDENCY_EVIDENCE,
  buildCanonicalAdoptionIdentities,
} from '../src/adoptionIdentities.js'
import { CAPABILITY_CREDIT_BUDGETS } from '../src/capabilityCredits.js'
import { produceWorkingContent, type ApprovedLeadResearchFacts, type ApprovedTemplateAssetBundle, type Ls04ProductionContext, type MediaPolicy } from '../src/contentProduction.js'
import { buildSeededComponentRegistry } from '../src/componentRegistry.js'
import { resolveSiteDesignProfile, type StyleFamily } from '../src/designCatalog.js'
import {
  ExactProviderAdoptionError,
  LSFACT01_HOLD,
  LSFACT01_LIBRARIES_PROVENANCE,
  assembleBoundSite,
  bindExactProviderHandoff,
  createExactProviderRuntime,
  mapBoundWorkingContentPromotion,
  materializeExactProvider,
  restartExactProviderFromCache,
  resolveExactCapabilities,
  rollbackExactProviderCache,
  sealExactProviderHandoff,
  selectExactProviderForProduction,
  type ExactProviderHandoff,
} from '../src/exactProviderAdoption.js'
import { canonicalJsonChecksum } from '../src/libraryConsumer.js'
import { MASTER_TEMPLATE_PIN } from '../src/masterTemplatePin.js'
import type { ReusableSiteFoundation } from '../src/reusableFoundation.js'
import type { ResolveSiteSpecificationInput } from '../src/siteSpecification.js'
import { TIER_SPECIFICATIONS } from '../src/tierSpecification.js'
import { HOME_SERVICES_KIT, type VerticalKit } from '../src/verticalKit.js'
import type { WorkingContentPackage, WorkingContentPromotionInput } from '../src/workingContent.js'
import type { Revision2MaterializedWebsiteTemplate } from '../src/revision2Materialization.js'

const PIN = (label: string): string => createHash('sha1').update(`lsfact01-test:${label}`).digest('hex')
const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex')
const ORG = 'org-lsfact01'
const SITE = 'site-lsfact01'
const ASSET = 'export const template = 1\n'
const ASSET_SHA = sha256(ASSET)
const caches: string[] = []

afterEach(() => {
  while (caches.length > 0) {
    const dir = caches.pop()
    if (dir) rmSync(dir, { recursive: true, force: true })
  }
})

function cacheDir(): string {
  const dir = mkdtempSync(join(tmpdir(), 'lsfact01-'))
  caches.push(dir)
  return dir
}

function metadata(family: 'marketing-smb-v1' | 'master-template-type-1'): string {
  return JSON.stringify({
    family,
    note: 'injected catalog metadata only; not provider implementation source',
    producer: LSFACT01_LIBRARIES_PROVENANCE,
  })
}

function smbHandoff(): ExactProviderHandoff {
  return sealExactProviderHandoff({
    family: 'marketing-smb-v1',
    version: 'marketing-smb-v1',
    files: [{ path: 'entry-metadata.json', bytes: metadata('marketing-smb-v1') }],
  })
}

function masterHandoff(): ExactProviderHandoff {
  return sealExactProviderHandoff({
    family: 'master-template-type-1',
    version: MASTER_TEMPLATE_PIN.version,
    pinCommit: MASTER_TEMPLATE_PIN.commitSha,
    pinTree: MASTER_TEMPLATE_PIN.providerTreeSha,
    files: [{ path: 'release-metadata.json', bytes: metadata('master-template-type-1') }],
  })
}

function relabel(handoff: ExactProviderHandoff, lifecycle: ExactProviderHandoff['lifecycle'], selectability: ExactProviderHandoff['selectability'], compatibility: ExactProviderHandoff['compatibility']): ExactProviderHandoff {
  const pinBase = {
    repositoryUrl: handoff.pin.repositoryUrl,
    commit: handoff.pin.commit,
    tree: handoff.pin.tree,
    entryId: handoff.pin.entryId,
    version: handoff.pin.version,
    lifecycle,
    selectability,
    compatibility,
  }
  return {
    ...handoff,
    lifecycle,
    selectability,
    compatibility,
    pin: {
      ...handoff.pin,
      ...pinBase,
      manifestSha256: canonicalJsonChecksum(pinBase),
    },
  }
}

const ACTIVE_HOME_SERVICES_KIT: VerticalKit = { ...HOME_SERVICES_KIT, status: 'active' }
const READY_STYLE: StyleFamily = {
  schemaVersion: { major: 1, minor: 0 },
  styleId: 'style-lsfact01',
  displayName: 'Style',
  status: 'active',
  accessibilityContrastPassed: true,
  baseTokens: { 'color.primary': '#0ea5e9' },
  fontPairing: { headingFont: 'Inter', bodyFont: 'Inter' },
}

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
    foundationId: 'foundation-lsfact01',
    displayName: 'Foundation',
    status: 'active',
    kitId: 'home_services',
    tierId: 'standard',
    platformReleaseRef: 'release-1',
    assemblyManifestRef: 'manifest-1',
    createdAt: '2026-09-11T00:00:00.000Z',
    ...overrides,
  }
}

function specInput(overrides: Partial<ResolveSiteSpecificationInput> = {}): ResolveSiteSpecificationInput {
  return {
    siteSpecId: 'sitespec-lsfact01',
    siteRef: SITE,
    kit: ACTIVE_HOME_SERVICES_KIT,
    tier: TIER_SPECIFICATIONS.standard,
    foundation: buildFoundation(),
    designProfile: resolveSiteDesignProfile(SITE, READY_STYLE),
    componentRegistry: buildSeededComponentRegistry(),
    selectedComponentIds: ['SignupHero', 'CTASection'],
    pageCount: 4,
    pageTypes: ['home', 'about', 'contact', 'privacy'],
    capabilityPlanId: 'A',
    adoptionIdentities: identities(),
    ...overrides,
  }
}

function ls04Identities(): Ls04ProductionContext {
  return {
    contentMode: 'hybrid',
    identities: {
      orgId: ORG,
      siteId: SITE,
      locale: 'en',
      contentMode: 'hybrid',
      capabilityPlanId: 'A',
      verticalKitId: 'home_services',
      entitlementSnapshotId: 'entitlement-lsfact01',
      templateAdoptionId: 'adoption-lsfact01',
      adoptionIdentities: identities(),
    },
  }
}

function facts(): ApprovedLeadResearchFacts {
  return {
    schemaVersion: { major: 1, minor: 0 },
    leadId: 'lead-lsfact01',
    orgId: ORG,
    businessName: 'Northwind Services',
    geography: 'Austin',
    services: ['Emergency repair'],
    products: [{ slug: 'widget', title: 'Widget', summary: 'A sellable widget', code: 'sku-1' }],
    credentials: [{ name: 'Licensed contractor', sourceReferences: ['https://example.test/license/123'] }],
    reviews: [{ quote: 'They arrived on time.', author: 'Maria Chen', sourceReferences: ['https://example.test/review/maria'] }],
    contact: { phone: '+15155550100', email: 'hello@northwind.test', address: '1 Main St', website: 'https://northwind.test' },
    pricing: 'Quoted per job',
    legalClaims: ['Work is performed by licensed staff.'],
    media: [],
  }
}

function template(): ApprovedTemplateAssetBundle {
  return {
    templateId: 'master-template-type-1',
    libraryAssetPath: 'src/index.mjs',
    libraryAssetSha256: ASSET_SHA,
    baselinePages: [
      { pageId: 'home', route: '/', sections: [{ sectionId: 'hero', componentId: 'SignupHero', copy: { lang: 'en', headline: '{{businessName}} serving {{geography}}', body: 'Approved local information.' } }] },
      { pageId: 'about', route: '/about', sections: [{ sectionId: 'cta', componentId: 'CTASection', copy: { lang: 'en', headline: 'About {{businessName}}', body: 'Licensed local team.' } }] },
      { pageId: 'catalog', route: '/catalog', sections: [{ sectionId: 'offers', componentId: 'OfferShowcase', copy: { lang: 'en', headline: 'Catalog', offers: ['Approved catalog items'] } }] },
      { pageId: 'articles', route: '/articles', sections: [{ sectionId: 'grid', componentId: 'ArticlesGrid', copy: { lang: 'en', headline: 'Guides', articles: ['Local guide'] } }] },
    ],
    media: [{
      assetId: 'library-neutral-mark',
      source: 'library://master-template-type-1/mark',
      sha256: 'a'.repeat(64),
      licenseSpdx: 'UNLICENSED',
      altText: 'Approved neutral template mark',
      width: 512,
      height: 512,
      format: 'webp',
    }],
  }
}

function library(): Revision2MaterializedWebsiteTemplate {
  return {
    reference: {
      authority: 'linksites_local',
      libraryAuthority: 'reference_only',
      materialization: 'input_reference_only',
      artifactType: 'website_template',
      sourceCommitSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      sourceTreeSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      releaseSourceCommitSha: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      releaseSourceTreeSha: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb',
      artifactTreeSha1: 'cccccccccccccccccccccccccccccccccccccccc',
      entryId: 'master-template-type-1',
      version: '1.0.0',
      releaseManifestSha256: 'd'.repeat(64),
      inventorySha256: 'e'.repeat(64),
      payloadSha256: 'f'.repeat(64),
      dependencyLockSha256: '1'.repeat(64),
      receiptType: 'consumption',
      receiptId: 'lsfact01-test-library',
    },
    files: { 'src/index.mjs': ASSET },
    providerRoot: '/tmp',
    releaseRoot: '/tmp',
    artifactRoot: '/tmp',
  }
}

const mediaPolicy: MediaPolicy = {
  allowedSourcePrefixes: ['library://'],
  allowedLicenseSpdx: ['UNLICENSED'],
  maxWidth: 2048,
  maxHeight: 2048,
  allowedFormats: ['webp', 'avif', 'jpg', 'png'],
  requireTemplateMedia: true,
}

function promotionInput(contentPackage: WorkingContentPackage): WorkingContentPromotionInput {
  return {
    schemaVersion: { major: 1, minor: 0 },
    orgId: ORG,
    workingPackageId: 'working-lsfact01',
    workingPackageVersion: 1,
    contentChecksum: 'b'.repeat(64),
    promotionIdempotencyKey: 'promotion:lsfact01',
    contentPackage,
    gateEvidenceReferences: ['gate://lsfact01'],
  }
}

describe('LSFACT-01 exact injected handoffs', () => {
  it('binds both provider families from injected exact provenance without production admission', () => {
    const smb = bindExactProviderHandoff(smbHandoff())
    const master = bindExactProviderHandoff(masterHandoff())
    expect(smb.productionSelectable).toBe(false)
    expect(master.productionSelectable).toBe(false)
    expect(smb.handoff.lifecycle).toBe('quarantined')
    expect(smb.handoff.selectability).toBe('non_selectable')
    expect(master.handoff.lifecycle).toBe('draft')
    expect(master.handoff.compatibility).toBe('unknown')
    expect(smb.hold).toBe(LSFACT01_HOLD.marketingSmbV1)
    expect(master.hold).toBe(LSFACT01_HOLD.masterTemplateType1)
    expect(smb.handoff.producer).toEqual(LSFACT01_LIBRARIES_PROVENANCE)
    expect(master.handoff.pin.commit).toBe(MASTER_TEMPLATE_PIN.commitSha)
  })

  it('rejects non-injected, unknown, fixture, tampered, and relabeled identities', () => {
    expect(() => bindExactProviderHandoff({ ...smbHandoff(), injected: false })).toThrow(/injected/)
    expect(() => bindExactProviderHandoff({ ...smbHandoff(), family: 'unknown-kit', entryId: 'unknown-kit' })).toThrow(ExactProviderAdoptionError)
    expect(() => bindExactProviderHandoff(relabel(smbHandoff(), 'admitted', 'selectable', 'compatible'))).toThrow(/quarantine/)
    expect(() => bindExactProviderHandoff(relabel(masterHandoff(), 'selectable', 'selectable', 'compatible'))).toThrow(/planning\/candidate/)
    const tampered = smbHandoff()
    const files = [...tampered.files]
    files[0] = { ...files[0], bytes: `${files[0].bytes}-mutated` }
    expect(() => bindExactProviderHandoff({ ...tampered, files })).toThrow(/digest mismatch/)
    expect(() => bindExactProviderHandoff({
      ...masterHandoff(),
      pin: { ...masterHandoff().pin, tree: LSDATA01_NON_ADMITTED_FIXTURE_TREES.masterTemplateType1Artifact, manifestSha256: canonicalJsonChecksum({
        repositoryUrl: MASTER_TEMPLATE_PIN.repositoryUrl,
        commit: MASTER_TEMPLATE_PIN.commitSha,
        tree: LSDATA01_NON_ADMITTED_FIXTURE_TREES.masterTemplateType1Artifact,
        entryId: 'master-template-type-1',
        version: MASTER_TEMPLATE_PIN.version,
        lifecycle: 'draft',
        selectability: 'non_selectable',
        compatibility: 'unknown',
      }) },
    })).toThrow(/fixture/)
    expect(() => bindExactProviderHandoff({ ...smbHandoff(), extra: true })).toThrow(/Unexpected handoff field/)
  })

  it('fail-closes production selection for quarantined, draft, fixture, and unproven identities', () => {
    expect(() => selectExactProviderForProduction(smbHandoff())).toThrow(/Production selection fail-closed/)
    expect(() => selectExactProviderForProduction(masterHandoff())).toThrow(/unproven|draft|non-selectable/)
  })
})

describe('LSFACT-01 materialization and cold startup', () => {
  it('materializes injected bytes into a consumer cache and restarts without a provider checkout', () => {
    const bound = bindExactProviderHandoff(masterHandoff())
    const cacheRoot = cacheDir()
    const receipt = materializeExactProvider(bound, cacheRoot)
    expect(receipt.providerCheckoutRequired).toBe(false)
    expect(receipt.family).toBe('master-template-type-1')
    const restarted = restartExactProviderFromCache(cacheRoot, bound.digest)
    expect(restarted.digest).toBe(bound.digest)
    expect(restarted.providerCheckoutRequired).toBe(false)
  })

  it('preserves the prior cache generation across a failed later write and rollback', () => {
    const first = bindExactProviderHandoff(smbHandoff())
    const second = bindExactProviderHandoff(masterHandoff())
    const cacheRoot = cacheDir()
    materializeExactProvider(first, cacheRoot)
    materializeExactProvider(second, cacheRoot)
    const restored = rollbackExactProviderCache(cacheRoot)
    expect(restored.digest).toBe(first.digest)
    expect(restartExactProviderFromCache(cacheRoot, first.digest).family).toBe('marketing-smb-v1')
  })
})

describe('LSFACT-01 adoption, entitlements, assembly, and pins', () => {
  it('uses frozen A/B/C/L credits and keeps products distinct from services', () => {
    expect(CAPABILITY_CREDIT_BUDGETS).toEqual({ A: 30, B: 15, C: 6, L: 0 })
    const bound = bindExactProviderHandoff(smbHandoff())
    const first = resolveExactCapabilities({ bound, siteRef: SITE, planId: 'B', locale: 'en', productCount: 2, serviceCount: 3 })
    const second = resolveExactCapabilities({ bound, siteRef: SITE, planId: 'B', locale: 'en', productCount: 2, serviceCount: 3 })
    expect(first.resolution.digest).toBe(second.resolution.digest)
    expect(first.resolution.productsDistinctFromServices).toBe(true)
    expect(first.resolution.pages.map((page) => page.pageType)).toEqual(['home', 'about', 'contact', 'privacy', 'products', 'services'])
    expect(first.resolution.capabilities.find((item) => item.family === 'product')?.pageType).toBe('products')
    expect(first.resolution.capabilities.find((item) => item.family === 'service')?.pageType).toBe('services')
    expect(first.snapshot.grantedCredits).toBe(15)
    const neither = resolveExactCapabilities({ bound, siteRef: SITE, planId: 'C', locale: 'en', productCount: 0, serviceCount: 0 })
    expect(neither.resolution.pages.some((page) => page.pageType === 'products' || page.pageType === 'services')).toBe(false)
    expect(() => resolveExactCapabilities({ bound, siteRef: SITE, planId: 'L', locale: 'en', productCount: 1, serviceCount: 0 })).toThrow(/Plan L/)
    expect(() => resolveExactCapabilities({ bound, siteRef: SITE, planId: 'A', locale: 'en', productCount: 1, serviceCount: 0, extraCapabilityPages: [{ route: '/admin', pageType: 'blog' }] })).toThrow(/Reserved/)
  })

  it('assembles deterministically without mutating provider bytes', () => {
    const bound = bindExactProviderHandoff(masterHandoff())
    const pageTypes = ['home', 'about', 'contact', 'privacy']
    const spec = specInput({ pageCount: 4, pageTypes, capabilityPlanId: 'A', adoptionIdentities: identities() })
    const first = assembleBoundSite({
      bound,
      specInput: spec,
      assembleInput: {
        manifestId: 'manifest-lsfact01',
        manifestVersion: 1,
        siteId: SITE,
        siteClass: 'preview',
        kit: ACTIVE_HOME_SERVICES_KIT,
        componentRegistry: buildSeededComponentRegistry(),
        platformReleaseRef: 'release-1',
        pagePlan: pageTypes.map((pageType, index) => ({
          route: ['/', '/about', '/contact', '/privacy'][index],
          pageType,
          componentIds: ['SignupHero'],
        })),
      },
    })
    const second = assembleBoundSite({
      bound,
      specInput: spec,
      assembleInput: {
        manifestId: 'manifest-lsfact01',
        manifestVersion: 1,
        siteId: SITE,
        siteClass: 'preview',
        kit: ACTIVE_HOME_SERVICES_KIT,
        componentRegistry: buildSeededComponentRegistry(),
        platformReleaseRef: 'release-1',
        pagePlan: pageTypes.map((pageType, index) => ({
          route: ['/', '/about', '/contact', '/privacy'][index],
          pageType,
          componentIds: ['SignupHero'],
        })),
      },
    })
    expect(first.providerBytesUnchanged).toBe(true)
    expect(first.manifest.digest).toBe(second.manifest.digest)
    expect(first.siteSpec.adoptionIdentities?.provider).toBe(LS02_DEPENDENCY_EVIDENCE.mwt02Provider.candidateTree)
    expect(bound.handoff.files[0].sha256).toBe(sha256(bound.handoff.files[0].bytes))
  })

  it('keeps existing-site pins immutable and retains prior state on failed upgrade', () => {
    const runtime = createExactProviderRuntime(cacheDir())
    const bound = runtime.bind(smbHandoff())
    const pin = runtime.pinExistingSite({
      tenantOrgId: ORG,
      siteId: SITE,
      adoptionIdentities: identities(),
      boundHandoffDigest: bound.digest,
      family: bound.family,
      cacheIdentity: bound.digest,
    })
    expect(() => runtime.retainExistingSitePin(SITE, runtime.bind(masterHandoff()))).toThrow(/must not silently move/)
    const failed = runtime.upgradeOrKeepPrior(SITE, masterHandoff())
    expect(failed.ok).toBe(false)
    expect(failed.pin.boundHandoffDigest).toBe(pin.boundHandoffDigest)
    expect(runtime.getPin(SITE)?.adoptionIdentities.effective).toBe(pin.adoptionIdentities.effective)
    expect(runtime.rollback(SITE).boundHandoffDigest).toBe(pin.boundHandoffDigest)
  })

  it('maps bound working content to distinct product and service Payload promotion records', () => {
    const bound = bindExactProviderHandoff(masterHandoff())
    const produced = produceWorkingContent({
      lead: {
        schema_version: { major: 1, minor: 0 },
        org_id: ORG,
        correlation_id: 'corr-lsfact01',
        idempotency_key: 'lead:lsfact01:research:v1',
        lead_id: 'lead-lsfact01',
        research: { summary: 'Approved local business research.', sources: ['https://example.test/research/lsfact01'] },
        requested_vertical: 'professional-services',
        source: 'lsfact01-test',
      },
      facts: facts(),
      template: template(),
      library: library(),
      mediaPolicy,
      ls04: ls04Identities(),
    })
    const request = mapBoundWorkingContentPromotion(bound, promotionInput(produced.contentPackage), SITE, 'promo-lsfact01', 'manifest-lsfact01')
    const collections = request.workingPackage.items.map((item) => item.payloadCollection)
    expect(collections).toContain('products')
    expect(collections).toContain('services')
    expect(request.bindings?.mappings.some((mapping) => mapping.payloadCollection === 'products')).toBe(true)
    expect(request.bindings?.mappings.some((mapping) => mapping.payloadCollection === 'services')).toBe(true)
    const pageBlocks = request.workingPackage.items
      .filter((item) => item.payloadCollection === 'pages')
      .flatMap((item) => Array.isArray(item.data.content) ? item.data.content as Array<Record<string, unknown>> : [])
    expect(pageBlocks.some((block) => block.blockType === 'hero')).toBe(true)
    expect(new Set(pageBlocks.map((block) => String(block.blockType))).size).toBeGreaterThan(1)
  })
})

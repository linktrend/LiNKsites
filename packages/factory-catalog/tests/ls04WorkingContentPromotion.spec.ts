import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  LS02_DEPENDENCY_EVIDENCE,
  buildCanonicalAdoptionIdentities,
} from '../src/adoptionIdentities.js'
import {
  ContentProductionError,
  LS04_CONTENT_PRODUCTION_EXECUTOR_VERSION,
  produceWorkingContent,
  type ApprovedLeadResearchFacts,
  type ApprovedTemplateAssetBundle,
  type Ls04ProductionContext,
  type MediaPolicy,
} from '../src/contentProduction.js'
import {
  LS04_DISPATCH_IDEMPOTENCY,
  LS04_CONTENT_MODES,
  assertValidWorkingContentPackage,
  type Ls04ContentMode,
  type WorkingContentPackage,
  type WorkingContentPromotionInput,
} from '../src/workingContent.js'
import {
  WorkingContentPromotionError,
  buildPromotionRequestFromPreparedWorkingContent,
  mapWorkingSectionToPayloadBlock,
  promotePreparedWorkingContent,
} from '../src/workingContentPayloadPromotion.js'
import type { Revision2MaterializedWebsiteTemplate } from '../src/revision2Materialization.js'
import { workingContentFixture } from './fixtures/working-content-fixtures.js'
import { PayloadRestDraftTarget } from '../src/targets/payloadRestDraftTarget.js'

const PIN = (label: string): string => createHash('sha1').update(`ls04-test:${label}`).digest('hex')
const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex')
const ORG = 'org-ls04'
const SITE = 'site-ls04'
const ASSET = 'export const template = 1\n'
const ASSET_SHA = sha256(ASSET)

function identities(mode: Ls04ContentMode): Ls04ProductionContext {
  return {
    contentMode: mode,
    identities: {
      orgId: ORG,
      siteId: SITE,
      locale: 'en',
      contentMode: mode,
      capabilityPlanId: 'A',
      verticalKitId: 'home_services',
      entitlementSnapshotId: 'entitlement-ls04',
      templateAdoptionId: 'adoption-ls04',
      adoptionIdentities: buildCanonicalAdoptionIdentities({
        layout: PIN('layout'),
        plan: PIN('plan'),
        overlay: PIN('overlay'),
        config: PIN('config'),
        content: PIN('content'),
      }),
    },
  }
}

function lead(overrides: Record<string, unknown> = {}) {
  return {
    schema_version: { major: 1, minor: 0 },
    org_id: ORG,
    correlation_id: 'corr-ls04',
    idempotency_key: 'lead:ls04:research:v1',
    lead_id: 'lead-ls04',
    research: {
      summary: 'Approved local business research.',
      sources: ['https://example.test/research/ls04'],
    },
    requested_vertical: 'professional-services',
    source: 'ls04-test',
    ...overrides,
  }
}

function facts(mode: Ls04ContentMode, overrides: Partial<ApprovedLeadResearchFacts> = {}): ApprovedLeadResearchFacts {
  const products = [{ slug: 'widget', title: 'Widget', summary: 'A sellable widget', code: 'sku-1' }]
  const services = ['Emergency repair']
  return {
    schemaVersion: { major: 1, minor: 0 },
    leadId: 'lead-ls04',
    orgId: ORG,
    businessName: 'Northwind Services',
    geography: 'Austin',
    services: mode === 'service' || mode === 'hybrid' ? services : [],
    products: mode === 'product' || mode === 'hybrid' ? products : [],
    credentials: [{ name: 'Licensed contractor', sourceReferences: ['https://example.test/license/123'] }],
    reviews: [{ quote: 'They arrived on time.', author: 'Maria Chen', sourceReferences: ['https://example.test/review/maria'] }],
    contact: { phone: '+15155550100', email: 'hello@northwind.test', address: '1 Main St', website: 'https://northwind.test' },
    pricing: 'Quoted per job',
    legalClaims: ['Work is performed by licensed staff.'],
    media: [],
    ...overrides,
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
      receiptId: 'ls04-test-library',
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

function produce(mode: Ls04ContentMode, factOverrides: Partial<ApprovedLeadResearchFacts> = {}, leadOverrides: Record<string, unknown> = {}) {
  return produceWorkingContent({
    lead: lead(leadOverrides),
    facts: facts(mode, factOverrides),
    template: template(),
    library: library(),
    mediaPolicy,
    ls04: identities(mode),
  })
}

function promotionInput(contentPackage: WorkingContentPackage, orgId = ORG): WorkingContentPromotionInput {
  return {
    schemaVersion: { major: 1, minor: 0 },
    orgId,
    workingPackageId: 'working-ls04',
    workingPackageVersion: 1,
    contentChecksum: 'b'.repeat(64),
    promotionIdempotencyKey: 'promotion:ls04',
    contentPackage,
    gateEvidenceReferences: ['gate://ls04'],
  }
}

describe('LS-04 ISS-13 working content production', () => {
  it('retains the LS-04 dispatch identity and four content modes', () => {
    expect(LS04_DISPATCH_IDEMPOTENCY).toBe('cursor-cloud-dispatch-v1:linksites-ls04-285-base6169548')
    expect([...LS04_CONTENT_MODES]).toEqual(['product', 'service', 'hybrid', 'neither'])
  })

  it('pins MWT-02/H-09 adoption identities as dependency evidence only', () => {
    const adoption = identities('service').identities.adoptionIdentities
    expect(adoption.provider).toBe(LS02_DEPENDENCY_EVIDENCE.mwt02Provider.candidateTree)
    expect(adoption.adapter).toBe(LS02_DEPENDENCY_EVIDENCE.h09Protected.treeSha)
  })

  it.each(['product', 'service', 'hybrid', 'neither'] as const)('produces %s working content with semantic, claim, and identity retention', (mode) => {
    const result = produce(mode)
    expect(result.evidence.executorVersion).toBe(LS04_CONTENT_PRODUCTION_EXECUTOR_VERSION)
    assertValidWorkingContentPackage(result.contentPackage)
    const section = result.contentPackage.content.pages[0].sections[0]
    const ls04 = section.content.ls04 as Record<string, unknown>
    expect(ls04).toMatchObject({
      identities: expect.objectContaining({ orgId: ORG, siteId: SITE, contentMode: mode }),
    })
    expect(ls04.semantic).toMatchObject({
      providerComponentId: 'hero-banner',
      targetRecord: expect.objectContaining({ collection: 'pages', family: 'hero' }),
    })
    expect(Array.isArray(ls04.claims)).toBe(true)
    const catalog = (ls04.catalog as { products: unknown[]; services: unknown[] })
    expect(catalog.products.length > 0).toBe(mode === 'product' || mode === 'hybrid')
    expect(catalog.services.length > 0).toBe(mode === 'service' || mode === 'hybrid')
  })

  it('keeps the default W2-01 adapter when LS-04 context is omitted', () => {
    const result = produceWorkingContent({
      lead: lead(),
      facts: facts('service'),
      template: template(),
      library: library(),
      mediaPolicy,
    })
    expect(result.evidence.executorVersion).toBe('w2-01-deterministic-adapter.v1')
    expect(result.contentPackage.content.pages[0].sections[0].content.ls04).toBeUndefined()
  })
})

describe('LS-04 ISS-15 rejection controls', () => {
  it('rejects fake review attribution', () => {
    expect(() => produce('service', {
      reviews: [{ quote: 'Great', author: 'John Doe', sourceReferences: ['https://example.test/review'] }],
    })).toThrow(ContentProductionError)
    try {
      produce('service', { reviews: [{ quote: 'Great', author: 'John Doe', sourceReferences: ['https://example.test/review'] }] })
    } catch (error) {
      expect((error as ContentProductionError).code).toBe('false_claim')
    }
  })

  it('rejects credentials without evidence', () => {
    expect(() => produce('service', { credentials: ['mystery badge'] })).toThrow(/credential/)
  })

  it.each([
    ['percentages', '100% results'],
    ['currency', '$ 9 introductory price'],
    ['guaranteed', 'Guaranteed results'],
    ['number one', 'We are #1 locally'],
    ['always wins', 'Our approach always wins'],
    ['Unicode whitespace percentage', '100\u00a0% results'],
  ])('rejects unverifiable quantified claims: %s', (_label, claim) => {
    expect(() => produce('service', { legalClaims: [claim] }, {
      research: { summary: 'No sources', sources: [] },
    })).toThrow(/quantified claim/)
  })

  it('preserves safe text and Unicode distinctions', () => {
    const safeClaims = [
      'Up to one hundred percent customer satisfaction',
      'EUR 100 is listed in the public price guide',
      'Guaranteedness is not a promise',
      'We ranked #10 last year',
      'Our approach wins awards',
      '保証 100％の結果',
    ]
    for (const claim of safeClaims) {
      expect(() => produce('service', { legalClaims: [claim] }, {
        research: { summary: 'No sources', sources: [] },
      })).not.toThrow()
    }
  })

  it('handles adversarial long digit input without backtracking', () => {
    const longClaim = `${'9'.repeat(100_000)}x`
    expect(() => produce('service', { legalClaims: [longClaim] }, {
      research: { summary: 'No sources', sources: [] },
    })).not.toThrow()
  })

  it('rejects placeholders', () => {
    expect(() => produceWorkingContent({
      lead: lead(),
      facts: facts('service'),
      template: {
        ...template(),
        baselinePages: [{ pageId: 'home', route: '/', sections: [{ sectionId: 'hero', componentId: 'SignupHero', copy: { lang: 'en', headline: 'lorem ipsum demo' } }] }],
      },
      library: library(),
      mediaPolicy,
      ls04: identities('service'),
    })).toThrow(/placeholder/)
  })

  it('rejects unlicensed media', () => {
    expect(() => produceWorkingContent({
      lead: lead(),
      facts: facts('service', {
        media: [{
          assetId: 'stolen',
          source: 'library://master-template-type-1/stolen',
          sha256: 'b'.repeat(64),
          licenseSpdx: 'none',
          altText: 'Unlicensed asset',
          width: 32,
          height: 32,
          format: 'webp',
        }],
      }),
      template: template(),
      library: library(),
      mediaPolicy,
      ls04: identities('service'),
    })).toThrow(ContentProductionError)
  })

  it('rejects missing required product facts in product mode', () => {
    expect(() => produce('product', { products: [] })).toThrow(/products is incomplete/)
  })

  it('rejects tenant-isolated identities', () => {
    const ctx = identities('service')
    ctx.identities = { ...ctx.identities, orgId: 'other-org' }
    expect(() => produceWorkingContent({
      lead: lead(),
      facts: facts('service'),
      template: template(),
      library: library(),
      mediaPolicy,
      ls04: ctx,
    })).toThrow(/tenant/)
  })
})

describe('LS-04 ISS-14 typed promotion', () => {
  it('maps distinct working sections to typed Payload blocks instead of all-hero', () => {
    const produced = produce('hybrid')
    const request = buildPromotionRequestFromPreparedWorkingContent(
      promotionInput(produced.contentPackage),
      SITE,
      'promo-ls04',
      'manifest-ls04',
    )
    const pageItems = request.workingPackage.items.filter((item) => item.payloadCollection === 'pages')
    const blockTypes = pageItems.flatMap((item) => (item.data.content as Array<{ blockType: string }>).map((block) => block.blockType))
    expect(blockTypes).toEqual(['hero', 'cta', 'offerShowcase', 'articles'])
    expect(blockTypes.every((type) => type === 'hero')).toBe(false)
    expect(request.workingPackage.items.some((item) => item.payloadCollection === 'products')).toBe(true)
    expect(request.workingPackage.items.some((item) => item.payloadCollection === 'services')).toBe(true)
    expect(request.workingPackage.items.some((item) => item.payloadCollection === 'core-settings')).toBe(true)
    expect(request.bindings?.entitlementSnapshotId).toBe('entitlement-ls04')
    expect(request.bindings?.templateAdoptionId).toBe('adoption-ls04')
    expect(request.bindings?.mappings.some((mapping) => mapping.reactSymbol === 'SignupHero')).toBe(true)
    expect(request.bindings?.mappings.some((mapping) => mapping.reactSymbol === 'CTASection')).toBe(true)
  })

  it('keeps semantic projection fields strict for Payload readback', () => {
    const produced = produce('service')
    const request = buildPromotionRequestFromPreparedWorkingContent(
      promotionInput(produced.contentPackage),
      SITE,
      'promo-ls04-readback-parity',
      'manifest-ls04',
    )
    const firstPage = request.workingPackage.items.find((item) => item.payloadCollection === 'pages')
    const firstBlock = (firstPage?.data.content as Array<Record<string, unknown>>)[0]
    const target = new PayloadRestDraftTarget({ baseUrl: 'http://payload.test' })

    expect(target.verifyParity(firstBlock, { id: 'page-1', ...firstBlock })).toBe(true)
    expect(() => target.verifyParity(firstBlock, { id: 'page-1' })).toThrow(
      /reactSymbol.*libraryComponentId.*semanticId.*workingSectionId/,
    )
  })

  it('promotes with readback-bound receipts and typed document IDs', async () => {
    const produced = produce('service')
    const seen: string[] = []
    const result = await promotePreparedWorkingContent({
      repository: {
        async recordPromotionReceipt() {
          return {
            promotionReceiptId: 'receipt',
            schemaVersion: { major: 1, minor: 0 },
            orgId: ORG,
            workingPackageId: 'working-ls04',
            versionNumber: 1,
            promotionIdempotencyKey: 'promotion:ls04',
            contentChecksum: 'b'.repeat(64),
            payloadTargetCollection: 'pages',
            payloadDocumentId: 'doc-home',
            payloadDraftRevision: 'checksum-home',
            receipt: {},
            createdAt: new Date().toISOString(),
          }
        },
      },
      prepared: promotionInput(produced.contentPackage),
      target: {
        async upsertDraft(collection, externalKey, data) {
          seen.push(`${collection}:${externalKey}`)
          return { payloadDocumentId: `doc-${externalKey}`, resultChecksum: `checksum-${externalKey}` }
        },
        async readback(payloadDocumentId) {
          return { id: payloadDocumentId }
        },
      },
      targetSiteId: SITE,
      promotionRequestId: 'promo-ls04',
      assemblyManifestId: 'manifest-ls04',
    })
    expect(result.receipt.status).toBe('succeeded')
    expect(result.receipt.bindings?.payloadDocumentIds.length).toBeGreaterThan(1)
    expect(result.receipt.bindings?.readbackChecksums.length).toBe(result.receipt.bindings?.payloadDocumentIds.length)
    expect(seen.some((entry) => entry.startsWith('pages:'))).toBe(true)
    expect(seen.some((entry) => entry.startsWith('services:'))).toBe(true)
    expect(seen.some((entry) => entry.startsWith('core-settings:'))).toBe(true)
  })

  it('rejects unmapped components and cross-tenant promotion', () => {
    expect(() => mapWorkingSectionToPayloadBlock(
      workingContentFixture.content.pages[0],
      { sectionId: 'x', componentId: 'UnknownWidget', content: { lang: 'en' } },
    )).toThrow(/Unmapped working-content component/)

    const produced = produce('service')
    expect(() => buildPromotionRequestFromPreparedWorkingContent(
      promotionInput(produced.contentPackage),
      'other-site',
      'promo-ls04',
      'manifest-ls04',
    )).toThrow(WorkingContentPromotionError)
  })
})

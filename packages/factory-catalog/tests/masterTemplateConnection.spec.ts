import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  MASTER_TEMPLATE_PIN,
  REJECTED_PROVIDER_SHA_PREFIXES,
  assertAdmissibleProviderSha,
} from '../src/masterTemplatePin.js'
import {
  rejectStaleMarketingSmbAuthority,
  selectMasterTemplateForProduction,
  verifyMasterTemplateBundle,
  type MasterTemplateBundle,
} from '../src/masterTemplateConsumer.js'
import { probeMasterTemplateCandidate } from '../src/masterTemplateCandidateProbe.js'
import { assertOverlayAllowed } from '../src/masterTemplateOverridePolicy.js'
import {
  projectMasterTemplatePage,
  projectSemanticBlock,
} from '../src/masterTemplateSemanticProjection.js'

const FIXTURE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  'fixtures/linklibraries/master-template-type-1-1.0.0',
)

const read = (relativePath: string): string => readFileSync(resolve(FIXTURE_ROOT, relativePath), 'utf8')

function loadBundle(overrides: Partial<MasterTemplateBundle> = {}): MasterTemplateBundle {
  return {
    providerCommitSha: MASTER_TEMPLATE_PIN.commitSha,
    catalogueBytes: read('catalogue.json'),
    manifestBytes: read('manifest.json'),
    inventoryBytes: read('inventory.json'),
    receiptBytes: read('release-receipt.json'),
    indexBytes: read('index.json'),
    sourceInventory: JSON.parse(read('source-inventory.json')),
    derivationPolicy: JSON.parse(read('derivation/policy.json')),
    layoutContracts: JSON.parse(read('contracts/layout-contracts.json')),
    defaultContent: JSON.parse(read('content/default-content.json')),
    ...overrides,
  }
}

const site = {
  siteId: 'site-connection-proof',
  locale: 'en',
  publicationStatus: 'draft' as const,
  route: '/preview/master-template',
}

describe('master-template connection compatibility (LS-05 A1 pin)', () => {
  it('rejects the retired 1.0.0 fixture after the exact A1 pin cutover', () => {
    expect(() => verifyMasterTemplateBundle(loadBundle())).toThrow(/Catalogue file SHA-256/)
    expect(MASTER_TEMPLATE_PIN.version).toBe('2.0.0-a1.1')
  })

  it('rejects candidate probing until the exact A1 provider bytes are materialized', () => {
    expect(() => probeMasterTemplateCandidate(loadBundle(), site)).toThrow(/Catalogue file SHA-256/)
  })

  it('rejects the retired fixture before source-inventory compatibility can be claimed', () => {
    expect(() => verifyMasterTemplateBundle(loadBundle())).toThrow(/Catalogue file SHA-256/)
  })

  it('maps archetypes and semantic IDs, and refuses all-sections-to-hero', () => {
    const home = projectMasterTemplatePage({
      archetypeId: 'home',
      title: 'Home',
      slug: 'home',
      content: [
        { id: 'home-hero', blockType: 'hero', data: { heading: 'Hello' } },
        { id: 'home-features', blockType: 'features', data: { heading: 'Features' } },
        { id: 'home-cta', blockType: 'cta', data: { heading: 'Next' } },
      ],
      site,
    })
    expect(home.payloadPageType).toBe('home')
    expect(home.blocks.map((block) => block.libraryComponentId)).toEqual([
      'hero-banner',
      'feature-list',
      'cta-section',
    ])
    expect(home.blocks.map((block) => block.reactSymbol)).toEqual([
      'SignupHero',
      'PlatformFeatures',
      'CTASection',
    ])
    expect(home.blocks.every((block) => block.blockType === 'hero')).toBe(false)
    expect(home.site).toEqual(site)

    expect(() => projectSemanticBlock({ blockType: 'not-a-library-block' }, 0)).toThrow(/Unmapped required semantic/)
    expect(() =>
      projectMasterTemplatePage({
        archetypeId: 'home',
        title: 'Collapsed',
        slug: 'home',
        content: [
          { blockType: 'hero', data: { heading: 'A' } },
          { blockType: 'hero', data: { heading: 'B' } },
        ],
        site,
      }),
    ).toThrow(/all-sections-to-hero/)
    expect(() =>
      projectMasterTemplatePage({
        archetypeId: 'storefront',
        title: 'No',
        slug: 'no',
        content: [],
        site,
      }),
    ).toThrow(/Unknown page archetype/)
  })

  it('does not project stale provider bytes into LiNKsites-owned site state', () => {
    expect(() => probeMasterTemplateCandidate(loadBundle(), site)).toThrow(/Catalogue file SHA-256/)
  })

  it('allows authored overlays and fails closed on generated token files', () => {
    expect(() => assertOverlayAllowed({ path: 'artifact/design/theme.json', kind: 'vertical' })).not.toThrow()
    expect(() => assertOverlayAllowed({ path: 'artifact/content/default-content.json' })).not.toThrow()
    expect(() =>
      assertOverlayAllowed({ path: 'artifact/modules/manifest.json#/modules/newsletter/enabledByDefault' }),
    ).not.toThrow()
    expect(() => assertOverlayAllowed({ path: 'artifact/design/tokens.css' })).toThrow(/Generated token overlay/)
    expect(() => assertOverlayAllowed({ path: 'artifact/design/tokens.json' })).toThrow(/Generated token overlay/)
    expect(() => assertOverlayAllowed({ path: 'artifact/design/variants.json' })).toThrow(/Generated token overlay/)
  })

  it('rejects superseded provider SHAs and stale marketing-smb-v1 authority', () => {
    expect(REJECTED_PROVIDER_SHA_PREFIXES).toEqual(['d7997b6e', '9bdee5dd', 'b2d2bbb0', '3bf53b8b'])
    expect(() => assertAdmissibleProviderSha('d7997b6e3119c6efa7874973e4fe48bf88b0939b')).toThrow(/d7997b6e/)
    expect(() => assertAdmissibleProviderSha('9bdee5dd2ed34da1973dcf7e494def79bdc51776')).toThrow(/9bdee5dd/)
    expect(() => assertAdmissibleProviderSha('b2d2bbb0aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa')).toThrow(/b2d2bbb0/)
    expect(() => assertAdmissibleProviderSha('3bf53b8b407545fc7ed359f29cb8a5810295e8de')).toThrow(/3bf53b8b/)
    expect(() =>
      rejectStaleMarketingSmbAuthority({ entryId: 'marketing-smb-v1', status: 'approved' }),
    ).toThrow(/cannot override current Library quarantine/)
  })

  it('rejects a tampered catalogue byte stream', () => {
    expect(() =>
      verifyMasterTemplateBundle(loadBundle({ catalogueBytes: read('catalogue.json').replace('draft', 'selectable') })),
    ).toThrow(/Catalogue file SHA-256/)
  })
})

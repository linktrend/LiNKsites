import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { MASTER_TEMPLATE_PIN } from '../src/masterTemplatePin.js'
import {
  selectMasterTemplateForProduction,
  verifyMasterTemplateBundle,
  type MasterTemplateBundle,
} from '../src/masterTemplateConsumer.js'
import { probeMasterTemplateCandidate } from '../src/masterTemplateCandidateProbe.js'
import { projectMasterTemplatePage, projectSemanticBlock } from '../src/masterTemplateSemanticProjection.js'
import {
  composeMasterTemplateLookAndFeel,
  resolveLookAndFeelRegion,
} from '../src/masterTemplateLookAndFeel.js'
import {
  assertThemeContractCss,
  assertThemeJsonIsCanonical,
  refuseGeneratedTokenOverlay,
  renderThemeContractCss,
} from '../src/masterTemplateTokens.js'
import {
  assertProductionStillRejectsDraftMaster,
  buildMasterTemplateCandidatePreviewFixture,
  describeMasterTemplatePreviewSeam,
  isMasterTemplateLookAndFeelProofHarnessEnabled,
  runMasterTemplateCandidatePreview,
} from '../src/masterTemplatePreviewSeam.js'

const FIXTURE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  'fixtures/linklibraries/master-template-type-1-1.0.0',
)
const THEME_JSON_PATH = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../apps/web-master/config/theme.json',
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
  siteId: 'site-look-and-feel',
  locale: 'en',
  publicationStatus: 'draft' as const,
  route: '/inspect/master-template',
}

describe('master-template look-and-feel compatibility (LS-05 A1 pin)', () => {
  it('rejects the retired fixture until the exact A1 provider bytes are materialized', () => {
    expect(() => verifyMasterTemplateBundle(loadBundle())).toThrow(/Catalogue file SHA-256/)
  })

  it('maps archetypes to distinct regions and refuses all-sections-to-hero', () => {
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
    const styled = composeMasterTemplateLookAndFeel(home)
    expect(styled.composition).toBe('marketing-shell')
    expect(styled.sections.map((section) => section.libraryComponentId)).toEqual([
      'hero-banner',
      'feature-list',
      'cta-section',
    ])
    expect(styled.sections.map((section) => section.reactSymbol)).toEqual([
      'SignupHero',
      'PlatformFeatures',
      'CTASection',
    ])
    expect(styled.sections.map((section) => section.region)).toEqual(['hero', 'features', 'cta'])
    expect(styled.sections.every((section) => section.region === 'hero')).toBe(false)
    expect(styled.sections[0]?.surface.background).toBe('var(--gradient-hero)')
    expect(styled.sections[1]?.surface.background).toBe('var(--color-background)')

    expect(() => projectSemanticBlock({ blockType: 'not-a-library-block' }, 0)).toThrow(
      /Unmapped required semantic/,
    )
    expect(() => resolveLookAndFeelRegion('dentist-hero')).toThrow(/fail closed/)
    expect(() =>
      composeMasterTemplateLookAndFeel(
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
      ),
    ).toThrow(/all-sections-to-hero/)
  })

  it('does not style starter pages from stale provider bytes', () => {
    expect(() => probeMasterTemplateCandidate(loadBundle(), site)).toThrow(/Catalogue file SHA-256/)
  })

  it('applies authored theme.json into data-theme CSS and refuses generated overlays', () => {
    const theme = JSON.parse(readFileSync(THEME_JSON_PATH, 'utf8')) as unknown
    assertThemeJsonIsCanonical(theme)
    const css = renderThemeContractCss(theme)
    assertThemeContractCss(css)
    expect(css).toContain('--color-primary: #1e5a40')
    expect(css).toContain('--color-accent: #2a6f97')
    expect(css).toContain('--color-background: #eef1ef')
    expect(css).toContain('--font-family:')
    expect(css).toContain('Libre Franklin')
    expect(css).toContain('--spacing-md:')
    expect(css).toContain('--radius-md:')
    expect(css).toContain(':root[data-theme="default"]')
    expect(css).toContain(':root[data-theme="light"]')
    expect(css).toContain(':root[data-theme="dark"]')
    for (const id of ['saas', 'healthcare', 'finance', 'ecommerce', 'legal', 'realestate', 'education', 'restaurant', 'agency', 'nonprofit']) {
      expect(css).toContain(`:root[data-theme="${id}"]`)
    }
    expect(css).not.toContain('dentist')
    expect(css).not.toContain('SINGLE SOURCE OF TRUTH')
    expect(() => refuseGeneratedTokenOverlay('artifact/design/tokens.css')).toThrow(/Generated token overlay/)
    expect(() => refuseGeneratedTokenOverlay('artifact/design/tokens.json')).toThrow(/Generated token overlay/)
    expect(() => refuseGeneratedTokenOverlay('artifact/design/variants.json')).toThrow(/Generated token overlay/)
    expect(() =>
      renderThemeContractCss({
        ...(theme as Record<string, unknown>),
        industryPresets: {
          ...((theme as { industryPresets: Record<string, unknown> }).industryPresets),
          dentist: { name: 'Dentists' },
        },
      }),
    ).toThrow(/dentist|forbidden_vertical_preset|industry_preset_inventory_invalid/)
  })

  it('implements the step 3 preview seam without selecting the draft or using the old demo', () => {
    const seam = describeMasterTemplatePreviewSeam()
    expect(seam.implemented).toBe(true)
    expect(seam.productionSelectable).toBe(false)
    expect(seam.parallelTo).toBe('LINKSITES_W2_04_LOCAL_PROOF')
    expect(seam.oldDemoTemplateId).toBe('marketing-smb-v1')
    expect(seam.notTheOldDemo).toBe(true)
    expect(seam.wouldReuseRoute).toBe('/en/demo/<token>')
    expect(
      isMasterTemplateLookAndFeelProofHarnessEnabled({
        LINKSITES_W2_04_LOCAL_PROOF: '1',
      }),
    ).toBe(false)
    expect(
      isMasterTemplateLookAndFeelProofHarnessEnabled({
        LINKSITES_MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF: '1',
        LINKSITES_W2_04_LOCAL_PROOF: '1',
      }),
    ).toBe(true)
  })

  it('does not seed projected pages from stale provider bytes', () => {
    expect(() => runMasterTemplateCandidatePreview({ siteId: 'northline-preview', locale: 'en' })).toThrow(/Catalogue file SHA-256/)
  })
})

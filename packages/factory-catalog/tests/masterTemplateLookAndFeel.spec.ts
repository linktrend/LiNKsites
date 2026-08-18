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
  describeMasterTemplatePreviewSeam,
  isMasterTemplateLookAndFeelProofHarnessEnabled,
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

describe('master-template look-and-feel render (issue/187)', () => {
  it('keeps the 186 pin inspectable and still rejects production selectability', () => {
    const verified = verifyMasterTemplateBundle(loadBundle())
    expect(verified.pin.commitSha).toBe('6b87993ddaf403aebe7bef97bd268a543a1d14eb')
    expect(verified.artifactTreeSha1).toBe('a2bf0d2e7759e5e6952dacfdeab3ef9b03657d3d')
    expect(verified.lifecycle).toBe('draft')
    expect(verified.selectability).toBe('non_selectable')
    const probe = probeMasterTemplateCandidate(loadBundle(), site)
    expect(probe.productionSelectable).toBe(false)
    expect(() => selectMasterTemplateForProduction(loadBundle())).toThrow(/Production path rejects/)
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

  it('styles starter pages from the candidate probe without using the old demo', () => {
    const probe = probeMasterTemplateCandidate(loadBundle(), site)
    const styled = probe.starterPages.map((page) => composeMasterTemplateLookAndFeel(page))
    expect(styled.map((page) => page.archetypeId)).toEqual(['home', 'about', 'contact'])
    expect(styled.map((page) => page.title)).toEqual(['Northline', 'About Northline', 'Contact Northline'])
    expect(styled[0]?.sections.map((section) => section.region)).toEqual(['hero', 'features', 'proof', 'cta'])
    expect(styled[1]?.sections.map((section) => section.region)).toEqual(['prose', 'collection', 'cta'])
    expect(styled[2]?.sections.map((section) => section.region)).toEqual(['hero', 'form', 'features', 'collection'])
    expect(styled[0]?.sections[0]?.copy.heading).toMatch(/Straightforward help/)
    expect(styled[0]?.sections[2]?.copy.items[0]?.description).toMatch(/exactly what would happen/)
    expect(styled.some((page) => page.slug === 'marketing-smb-v1')).toBe(false)
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

  it('leaves the step 3 preview seam unused and distinct from W2-04 marketing-smb-v1', () => {
    const seam = describeMasterTemplatePreviewSeam()
    expect(seam.implemented).toBe(false)
    expect(seam.productionSelectable).toBe(false)
    expect(seam.parallelTo).toBe('LINKSITES_W2_04_LOCAL_PROOF')
    expect(seam.oldDemoTemplateId).toBe('marketing-smb-v1')
    expect(seam.notTheOldDemo).toBe(true)
    expect(
      isMasterTemplateLookAndFeelProofHarnessEnabled({
        LINKSITES_MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF: '1',
        LINKSITES_W2_04_LOCAL_PROOF: '1',
      }),
    ).toBe(false)
  })
})

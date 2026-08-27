/**
 * Step 3 proof-only preview seam.
 *
 * Parallel to LINKSITES_W2_04_LOCAL_PROOF. When the look-and-feel proof flag
 * is set, this path may inspect the pinned Library draft, seed projected
 * Northline Home/About/Contact, and reuse `/en/demo/<token>`. It never calls
 * selectMasterTemplateForProduction() and never makes the draft selectable.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { probeMasterTemplateCandidate, type MasterTemplateCandidateProbe } from './masterTemplateCandidateProbe.ts'
import {
  type MasterTemplateBundle,
  selectMasterTemplateForProduction,
  verifyMasterTemplateBundle,
} from './masterTemplateConsumer.ts'
import { MASTER_TEMPLATE_PIN, MasterTemplateConsumerError } from './masterTemplatePin.ts'

export const MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF_FLAG =
  'LINKSITES_MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF' as const

export const W2_04_LOCAL_PROOF_FLAG = 'LINKSITES_W2_04_LOCAL_PROOF' as const
export const LEGACY_LOCAL_PROOF_TEMPLATE_ID = 'marketing-smb-v1' as const
export const MASTER_TEMPLATE_PREVIEW_ROUTE = '/en/demo/<token>' as const

const DEFAULT_FIXTURE_ROOT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../tests/fixtures/linklibraries/master-template-type-1-1.0.0',
)

export interface MasterTemplatePreviewSeam {
  mode: 'candidate_preview'
  implemented: true
  productionSelectable: false
  parallelTo: typeof W2_04_LOCAL_PROOF_FLAG
  proofFlag: typeof MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF_FLAG
  wouldReuseRoute: typeof MASTER_TEMPLATE_PREVIEW_ROUTE
  wouldSeed: 'projected starter pages into disposable Payload'
  notTheOldDemo: true
  oldDemoTemplateId: typeof LEGACY_LOCAL_PROOF_TEMPLATE_ID
}

export interface MasterTemplateCandidatePreview {
  mode: 'candidate_preview'
  productionSelectable: false
  probe: MasterTemplateCandidateProbe
  pinSha: typeof MASTER_TEMPLATE_PIN.commitSha
  artifactTreeSha1: typeof MASTER_TEMPLATE_PIN.artifactTreeSha1
}

export interface MasterTemplatePreviewCmsPage {
  id: string
  site: string
  locale: string
  slug: string
  title: string
  pageType: string
  status: 'published'
  previewEnvironment: 'private-preview'
  revision: string
  content: Array<Record<string, unknown>>
}

export interface MasterTemplatePreviewCmsFixture {
  fixtureName: 'master-template-candidate-preview'
  productionSelectable: false
  pin: typeof MASTER_TEMPLATE_PIN
  sites: Array<{ id: string; status: 'published' }>
  siteDomains: Array<{ id: string; hostname: string; site: string; primary: true }>
  siteSettings: Array<{
    id: string
    site: string
    locale: string
    templateId: string
    status: 'published'
  }>
  navigation: {
    primary: Array<{ label: string; slug: string }>
    footer: Array<{ label: string; slug: string }>
  }
  pages: MasterTemplatePreviewCmsPage[]
}

export function describeMasterTemplatePreviewSeam(): MasterTemplatePreviewSeam {
  return {
    mode: 'candidate_preview',
    implemented: true,
    productionSelectable: false,
    parallelTo: W2_04_LOCAL_PROOF_FLAG,
    proofFlag: MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF_FLAG,
    wouldReuseRoute: MASTER_TEMPLATE_PREVIEW_ROUTE,
    wouldSeed: 'projected starter pages into disposable Payload',
    notTheOldDemo: true,
    oldDemoTemplateId: LEGACY_LOCAL_PROOF_TEMPLATE_ID,
  }
}

export function isMasterTemplateLookAndFeelProofHarnessEnabled(
  env: Record<string, string | undefined> = process.env,
): boolean {
  return env[MASTER_TEMPLATE_LOOK_AND_FEEL_PROOF_FLAG] === '1'
}

export function resolveMasterTemplateFixtureRoot(env: Record<string, string | undefined> = process.env): string {
  const configured = env.LINKSITES_MASTER_TEMPLATE_FIXTURE_ROOT
  return configured && configured.trim() ? configured : DEFAULT_FIXTURE_ROOT
}

export function loadPinnedMasterTemplateBundle(
  fixtureRoot: string = resolveMasterTemplateFixtureRoot(),
): MasterTemplateBundle {
  const read = (relativePath: string): string => readFileSync(resolve(fixtureRoot, relativePath), 'utf8')
  return {
    providerCommitSha: MASTER_TEMPLATE_PIN.commitSha,
    catalogueBytes: read('catalogue.json'),
    manifestBytes: read('manifest.json'),
    inventoryBytes: read('inventory.json'),
    receiptBytes: read('release-receipt.json'),
    indexBytes: read('index.json'),
    sourceInventory: JSON.parse(read('source-inventory.json')) as unknown,
    derivationPolicy: JSON.parse(read('derivation/policy.json')) as unknown,
    layoutContracts: JSON.parse(read('contracts/layout-contracts.json')) as unknown,
    defaultContent: JSON.parse(read('content/default-content.json')) as unknown,
  }
}

export function runMasterTemplateCandidatePreview(input?: {
  siteId?: string
  locale?: string
  fixtureRoot?: string
}): MasterTemplateCandidatePreview {
  const bundle = loadPinnedMasterTemplateBundle(input?.fixtureRoot ?? resolveMasterTemplateFixtureRoot())
  const verified = verifyMasterTemplateBundle(bundle)
  const probe = probeMasterTemplateCandidate(bundle, {
    siteId: input?.siteId ?? 'northline-preview',
    locale: input?.locale ?? 'en',
    publicationStatus: 'draft',
    route: MASTER_TEMPLATE_PREVIEW_ROUTE,
  })
  if (probe.productionSelectable !== false || verified.selectability !== 'non_selectable') {
    throw new Error('Candidate preview refused a production-selectable master template.')
  }
  return {
    mode: 'candidate_preview',
    productionSelectable: false,
    probe,
    pinSha: MASTER_TEMPLATE_PIN.commitSha,
    artifactTreeSha1: MASTER_TEMPLATE_PIN.artifactTreeSha1,
  }
}

/**
 * Production admission stays fail-closed even when this module is imported
 * in proof mode. Callers must not treat a successful preview as selection.
 */
export function assertProductionStillRejectsDraftMaster(fixtureRoot?: string): void {
  const bundle = loadPinnedMasterTemplateBundle(fixtureRoot ?? resolveMasterTemplateFixtureRoot())
  try {
    selectMasterTemplateForProduction(bundle)
  } catch (error) {
    if (error instanceof MasterTemplateConsumerError && /Production path rejects/.test(error.message)) {
      return
    }
    throw error
  }
  throw new Error('Production path unexpectedly admitted the draft master template.')
}

export function buildMasterTemplateCandidatePreviewFixture(input?: {
  hostname?: string
  siteId?: string
  locale?: string
  fixtureRoot?: string
}): MasterTemplatePreviewCmsFixture {
  const siteId = input?.siteId ?? 'northline-preview'
  const locale = input?.locale ?? 'en'
  const hostname = input?.hostname ?? '127.0.0.1'
  const preview = runMasterTemplateCandidatePreview({
    siteId,
    locale,
    fixtureRoot: input?.fixtureRoot,
  })
  const pages = preview.probe.starterPages
    .filter((page) => page.archetypeId === 'home' || page.archetypeId === 'about' || page.archetypeId === 'contact')
    .map((page) => ({
      id: `${siteId}-${page.slug}`,
      site: siteId,
      locale,
      slug: page.slug,
      title: page.title,
      pageType: page.archetypeId,
      status: 'published' as const,
      previewEnvironment: 'private-preview' as const,
      revision: `candidate-${MASTER_TEMPLATE_PIN.commitSha.slice(0, 12)}`,
      content: page.blocks.map((block) => ({
        id: block.id,
        blockType: block.blockType,
        libraryComponentId: block.libraryComponentId,
        ...block.data,
      })),
    }))
  return {
    fixtureName: 'master-template-candidate-preview',
    productionSelectable: false,
    pin: MASTER_TEMPLATE_PIN,
    sites: [{ id: siteId, status: 'published' }],
    siteDomains: [{ id: `${siteId}-${hostname}`, hostname, site: siteId, primary: true }],
    siteSettings: [
      {
        id: `${siteId}-settings`,
        site: siteId,
        locale,
        templateId: MASTER_TEMPLATE_PIN.entryId,
        status: 'published',
      },
    ],
    navigation: {
      primary: [
        { label: 'Home', slug: '/en/demo' },
        { label: 'About', slug: '/en/demo/about' },
        { label: 'Contact', slug: '/en/demo/contact' },
      ],
      footer: [],
    },
    pages,
  }
}

export function writeMasterTemplateCandidatePreviewFixture(
  destinationPath: string,
  input?: Parameters<typeof buildMasterTemplateCandidatePreviewFixture>[0],
): MasterTemplatePreviewCmsFixture {
  const fixture = buildMasterTemplateCandidatePreviewFixture(input)
  writeFileSync(destinationPath, `${JSON.stringify(fixture, null, 2)}\n`)
  return fixture
}

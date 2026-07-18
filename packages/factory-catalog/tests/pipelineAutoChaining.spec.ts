import { beforeEach, describe, expect, it, vi } from 'vitest'
import { InMemoryLedgerStore, ProgramLedger, ExecutorRegistry, runIssueOnce, type Run } from '@linksites/program-ledger'
import {
  SITE_SPECIFICATION_ISSUE_TYPE,
  SiteSpecificationExecutor,
  type SiteSpecificationExecutorDeps,
} from '../src/executors/siteSpecificationExecutor.js'
import { SITE_ASSEMBLY_ISSUE_TYPE, SiteAssemblyExecutor, type SiteAssemblyExecutorDeps } from '../src/executors/siteAssemblyExecutor.js'
import { PROMOTE_WORKING_PACKAGE_ISSUE_TYPE, PromotionExecutor } from '../src/executors/promotionExecutor.js'
import {
  PipelineAutoChainingError,
  chainSiteAssemblyToPromotion,
  chainSiteSpecificationToSiteAssembly,
} from '../src/pipelineAutoChaining.js'
import {
  buildPromotionRequestFromManifest,
  buildSiteAssemblyInputFromSiteSpecification,
  type BuildPromotionRequestExtras,
  type BuildSiteAssemblyInputExtras,
} from '../src/pipelineChaining.js'
import { HOME_SERVICES_KIT, type VerticalKit } from '../src/verticalKit.js'
import { TIER_SPECIFICATIONS } from '../src/tierSpecification.js'
import type { ReusableSiteFoundation } from '../src/reusableFoundation.js'
import { buildSeededComponentRegistry } from '../src/componentRegistry.js'
import { resolveSiteDesignProfile, type StyleFamily } from '../src/designCatalog.js'
import { resolveSiteSpecification, type SiteSpecification } from '../src/siteSpecification.js'
import type { PagePlanEntry, SiteAssemblyManifest } from '../src/siteAssemblyManifest.js'
import { PromotionService, type PayloadDraftTarget, type PromotionReceipt, type WorkingPackage } from '../src/promotionService.js'

const ACTIVE_HOME_SERVICES_KIT: VerticalKit = { ...HOME_SERVICES_KIT, status: 'active' }

const FOUNDATION: ReusableSiteFoundation = {
  schemaVersion: { major: 1, minor: 0 },
  foundationId: 'foundation-1',
  displayName: 'Foundation 1',
  status: 'active',
  kitId: 'home_services',
  tierId: 'standard',
  platformReleaseRef: 'release-1',
  assemblyManifestRef: 'manifest-1',
  createdAt: new Date().toISOString(),
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

const SITE_SPEC_INPUT = {
  siteSpecId: 'sitespec-1',
  siteRef: 'site-1',
  kitId: 'home_services',
  tierId: 'standard' as const,
  foundationId: 'foundation-1',
  selectedComponentIds: ['SignupHero', 'CTASection'],
  pageCount: 5,
}

function buildSiteSpecDeps(): SiteSpecificationExecutorDeps {
  return {
    kits: { home_services: ACTIVE_HOME_SERVICES_KIT },
    tiers: TIER_SPECIFICATIONS,
    foundations: { 'foundation-1': FOUNDATION },
    designProfilesBySiteRef: { 'site-1': resolveSiteDesignProfile('site-1', READY_STYLE) },
    componentRegistry: buildSeededComponentRegistry(),
  }
}

// The Site Specification the SiteSpecificationExecutor produces for SITE_SPEC_INPUT --
// resolved once here so the Site Assembly executor can look it up by id, and so tests can
// assert the auto-chained input matches the pure mapper's output exactly.
const specDeps = buildSiteSpecDeps()
const RESOLVED_SITE_SPEC: SiteSpecification = resolveSiteSpecification({
  siteSpecId: SITE_SPEC_INPUT.siteSpecId,
  siteRef: SITE_SPEC_INPUT.siteRef,
  kit: specDeps.kits.home_services,
  tier: specDeps.tiers.standard,
  foundation: specDeps.foundations['foundation-1'],
  designProfile: specDeps.designProfilesBySiteRef['site-1'],
  componentRegistry: specDeps.componentRegistry,
  selectedComponentIds: SITE_SPEC_INPUT.selectedComponentIds,
  pageCount: SITE_SPEC_INPUT.pageCount,
})

function buildAssemblyDeps(): SiteAssemblyExecutorDeps {
  return {
    kits: { home_services: ACTIVE_HOME_SERVICES_KIT },
    siteSpecsById: { 'sitespec-1': RESOLVED_SITE_SPEC },
    adaptationsById: {},
    componentRegistry: buildSeededComponentRegistry(),
  }
}

const VALID_PAGE_PLAN: PagePlanEntry[] = [{ route: '/', pageType: 'home', componentIds: ['SignupHero', 'CTASection'] }]

const ASSEMBLY_EXTRAS: BuildSiteAssemblyInputExtras = {
  manifestId: 'manifest-1',
  manifestVersion: 1,
  siteClass: 'preview',
  platformReleaseRef: 'release-1',
  pagePlan: VALID_PAGE_PLAN,
}

const SITE_ASSEMBLY_INPUT = {
  manifestId: 'manifest-1',
  manifestVersion: 1,
  siteId: 'site-1',
  siteClass: 'preview' as const,
  siteSpecId: 'sitespec-1',
  kitId: 'home_services',
  platformReleaseRef: 'release-1',
  pagePlan: VALID_PAGE_PLAN,
}

const WORKING_PACKAGE: WorkingPackage = {
  workingPackageId: 'wp-1',
  workingPackageVersion: 1,
  packageChecksum: 'checksum-1',
  items: [
    { sourceItemId: 'item-1', payloadCollection: 'pages', payloadOperation: 'create', targetExternalKey: 'home', data: { title: 'Home' } },
  ],
}

const PROMOTION_EXTRAS: BuildPromotionRequestExtras = {
  promotionRequestId: 'promo-1',
  idempotencyKey: 'idem-1',
  workingPackage: WORKING_PACKAGE,
}

const PLACEMENT = { programRef: 'linksites-manual-alignment' }

function buildPromotionTarget(overrides: Partial<PayloadDraftTarget> = {}): PayloadDraftTarget {
  return {
    async upsertDraft(_collection, externalKey) {
      return { payloadDocumentId: `doc-${externalKey}`, resultChecksum: `checksum-${externalKey}` }
    },
    async readback(payloadDocumentId) {
      return { id: payloadDocumentId }
    },
    ...overrides,
  }
}

let store: InMemoryLedgerStore
let ledger: ProgramLedger
let registry: ExecutorRegistry
let promotionService: PromotionService

beforeEach(() => {
  store = new InMemoryLedgerStore()
  ledger = new ProgramLedger(store)
  registry = new ExecutorRegistry()
  promotionService = new PromotionService(buildPromotionTarget())
  registry.register(new SiteSpecificationExecutor(buildSiteSpecDeps()))
  registry.register(new SiteAssemblyExecutor(buildAssemblyDeps()))
  registry.register(new PromotionExecutor({ promotionService }))
})

/** Runs an Issue through a real dispatch->claim->execute->complete cycle and asserts the Run succeeded (Issue is now awaiting_gate). */
async function runToAwaitingGate(issueId: string): Promise<Run> {
  const run = await runIssueOnce(ledger, registry, issueId)
  expect(run.state).toBe('succeeded')
  const issue = await ledger.getIssue(issueId)
  expect(issue?.state).toBe('awaiting_gate')
  return run
}

describe('Pipeline auto-chaining: Site Specification -> Site Assembly', () => {
  it('(a) spawns a Site Assembly Issue with correctly-mapped input once a Site Specification Issue passes its Gate', async () => {
    const specIssue = await ledger.createIssue({
      issueType: SITE_SPECIFICATION_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: SITE_SPEC_INPUT,
    })
    const specRun = await runToAwaitingGate(specIssue.issueId)

    // The Gate genuinely passes.
    const gate = await ledger.decideGate(specIssue.issueId, specRun.runId, 'accepted', { reviewed: true }, 'test-gate')
    expect(gate.decision).toBe('accepted')

    const outcome = await chainSiteSpecificationToSiteAssembly(ledger, gate, {
      assemblyInput: ASSEMBLY_EXTRAS,
      placement: PLACEMENT,
    })

    expect(outcome.chained).toBe(true)
    if (!outcome.chained) throw new Error('expected chaining to occur')

    const nextIssue = outcome.nextIssue
    expect(nextIssue.issueType).toBe(SITE_ASSEMBLY_ISSUE_TYPE)
    // Created ready, NOT dispatched -- it must run and pass its own Gate before chaining onward.
    expect(nextIssue.state).toBe('ready')
    // Input is exactly what the existing pure mapper produces from the accepted Site Specification output.
    expect(nextIssue.input).toEqual({ ...buildSiteAssemblyInputFromSiteSpecification(RESOLVED_SITE_SPEC, ASSEMBLY_EXTRAS) })
    expect(nextIssue.input.siteId).toBe('site-1')
    expect(nextIssue.input.siteSpecId).toBe('sitespec-1')
    expect(nextIssue.input.kitId).toBe('home_services')

    // Prove the auto-created Issue's mapped input is genuinely valid and executable end to end.
    const assemblyRun = await runIssueOnce(ledger, registry, nextIssue.issueId)
    expect(assemblyRun.state).toBe('succeeded')
  })

  it('(b) does NOT spawn a Site Assembly Issue when the Site Specification Issue FAILS its Gate (chaining respects gates, never bypasses them)', async () => {
    const specIssue = await ledger.createIssue({
      issueType: SITE_SPECIFICATION_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: SITE_SPEC_INPUT,
    })
    const specRun = await runToAwaitingGate(specIssue.issueId)

    // The Gate REJECTS the work.
    const gate = await ledger.decideGate(specIssue.issueId, specRun.runId, 'rejected', { reason: 'quality not met' }, 'test-gate')
    expect(gate.decision).toBe('rejected')

    const rejectedIssue = await ledger.getIssue(specIssue.issueId)
    expect(rejectedIssue?.state).toBe('repair_required')

    const createSpy = vi.spyOn(ledger, 'createIssue')
    const outcome = await chainSiteSpecificationToSiteAssembly(ledger, gate, {
      assemblyInput: ASSEMBLY_EXTRAS,
      placement: PLACEMENT,
    })

    expect(outcome.chained).toBe(false)
    if (outcome.chained) throw new Error('expected no chaining after a rejected Gate')
    expect(outcome.reason).toMatch(/not accepted/)
    // The critical assertion: absolutely no next Issue was created.
    expect(createSpy).not.toHaveBeenCalled()
    createSpy.mockRestore()
  })
})

describe('Pipeline auto-chaining: Site Assembly -> Promotion', () => {
  it('(c) spawns a Promotion Issue with correctly-mapped input once a Site Assembly Issue passes its Gate', async () => {
    const assemblyIssue = await ledger.createIssue({
      issueType: SITE_ASSEMBLY_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: SITE_ASSEMBLY_INPUT,
    })
    const assemblyRun = await runToAwaitingGate(assemblyIssue.issueId)
    const manifest = assemblyRun.output as SiteAssemblyManifest

    const gate = await ledger.decideGate(assemblyIssue.issueId, assemblyRun.runId, 'accepted', { reviewed: true }, 'test-gate')
    expect(gate.decision).toBe('accepted')

    const outcome = await chainSiteAssemblyToPromotion(ledger, gate, {
      promotionInput: PROMOTION_EXTRAS,
      placement: PLACEMENT,
    })

    expect(outcome.chained).toBe(true)
    if (!outcome.chained) throw new Error('expected chaining to occur')

    const nextIssue = outcome.nextIssue
    expect(nextIssue.issueType).toBe(PROMOTE_WORKING_PACKAGE_ISSUE_TYPE)
    expect(nextIssue.state).toBe('ready')
    expect(nextIssue.input).toEqual({ ...buildPromotionRequestFromManifest(manifest, PROMOTION_EXTRAS) })
    expect(nextIssue.input.targetSiteId).toBe('site-1')
    expect(nextIssue.input.assemblyManifestId).toBe(manifest.manifestId)
    expect(nextIssue.input.targetState).toBe('draft')

    // Prove the auto-created Promotion Issue's mapped input is genuinely valid and executable end to end.
    const promotionRun = await runIssueOnce(ledger, registry, nextIssue.issueId)
    expect(promotionRun.state).toBe('succeeded')
    expect((promotionRun.output as PromotionReceipt).status).toBe('succeeded')
  })

  it('(d) does NOT spawn a Promotion Issue when the Site Assembly Issue FAILS its Gate', async () => {
    const assemblyIssue = await ledger.createIssue({
      issueType: SITE_ASSEMBLY_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: SITE_ASSEMBLY_INPUT,
    })
    const assemblyRun = await runToAwaitingGate(assemblyIssue.issueId)

    const gate = await ledger.decideGate(assemblyIssue.issueId, assemblyRun.runId, 'rejected', { reason: 'assembly not accepted' }, 'test-gate')
    expect(gate.decision).toBe('rejected')

    const createSpy = vi.spyOn(ledger, 'createIssue')
    const outcome = await chainSiteAssemblyToPromotion(ledger, gate, {
      promotionInput: PROMOTION_EXTRAS,
      placement: PLACEMENT,
    })

    expect(outcome.chained).toBe(false)
    if (outcome.chained) throw new Error('expected no chaining after a rejected Gate')
    expect(createSpy).not.toHaveBeenCalled()
    createSpy.mockRestore()
  })
})

describe('Pipeline auto-chaining: gate-discipline guards and full-chain proof', () => {
  it('rejects a source Issue whose type does not match the chaining step (caller misuse -> PipelineAutoChainingError)', async () => {
    // A Site Specification Gate handed to the Site-Assembly->Promotion chainer is a programming error.
    const specIssue = await ledger.createIssue({
      issueType: SITE_SPECIFICATION_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: SITE_SPEC_INPUT,
    })
    const specRun = await runToAwaitingGate(specIssue.issueId)
    const gate = await ledger.decideGate(specIssue.issueId, specRun.runId, 'accepted', {}, 'test-gate')

    await expect(
      chainSiteAssemblyToPromotion(ledger, gate, { promotionInput: PROMOTION_EXTRAS, placement: PLACEMENT }),
    ).rejects.toBeInstanceOf(PipelineAutoChainingError)
  })

  it('drives the full Site Specification -> Site Assembly -> Promotion chain, requiring a passed Gate at every hop', async () => {
    // Hop 1: Site Specification runs and passes its Gate.
    const specIssue = await ledger.createIssue({
      issueType: SITE_SPECIFICATION_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: SITE_SPEC_INPUT,
    })
    const specRun = await runToAwaitingGate(specIssue.issueId)
    const specGate = await ledger.decideGate(specIssue.issueId, specRun.runId, 'accepted', {}, 'test-gate')

    const toAssembly = await chainSiteSpecificationToSiteAssembly(ledger, specGate, {
      assemblyInput: ASSEMBLY_EXTRAS,
      placement: PLACEMENT,
    })
    expect(toAssembly.chained).toBe(true)
    if (!toAssembly.chained) throw new Error('expected chaining to Site Assembly')

    // Hop 2: the auto-created Site Assembly Issue runs and passes ITS OWN Gate.
    const assemblyRun = await runToAwaitingGate(toAssembly.nextIssue.issueId)
    const assemblyGate = await ledger.decideGate(toAssembly.nextIssue.issueId, assemblyRun.runId, 'accepted', {}, 'test-gate')

    const toPromotion = await chainSiteAssemblyToPromotion(ledger, assemblyGate, {
      promotionInput: PROMOTION_EXTRAS,
      placement: PLACEMENT,
    })
    expect(toPromotion.chained).toBe(true)
    if (!toPromotion.chained) throw new Error('expected chaining to Promotion')

    // Hop 3: the auto-created Promotion Issue runs successfully.
    const promotionRun = await runIssueOnce(ledger, registry, toPromotion.nextIssue.issueId)
    expect(promotionRun.state).toBe('succeeded')

    // Three distinct Issues exist, one per stage, each created only after the prior stage's Gate passed.
    expect(specIssue.issueId).not.toBe(toAssembly.nextIssue.issueId)
    expect(toAssembly.nextIssue.issueId).not.toBe(toPromotion.nextIssue.issueId)
  })
})

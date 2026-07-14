import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryLedgerStore, ProgramLedger, ExecutorRegistry, runIssueOnce } from '@linksites/program-ledger'
import {
  SITE_SPECIFICATION_ISSUE_TYPE,
  SiteSpecificationExecutor,
  type SiteSpecificationExecutorDeps,
} from '../src/executors/siteSpecificationExecutor.js'
import { HOME_SERVICES_KIT, type VerticalKit } from '../src/verticalKit.js'
import { TIER_SPECIFICATIONS } from '../src/tierSpecification.js'
import type { ReusableSiteFoundation } from '../src/reusableFoundation.js'
import { buildSeededComponentRegistry } from '../src/componentRegistry.js'
import { resolveSiteDesignProfile, type StyleFamily } from '../src/designCatalog.js'
import { resolveSiteSpecification, type SiteSpecification } from '../src/siteSpecification.js'

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

function buildDeps(): SiteSpecificationExecutorDeps {
  return {
    kits: { home_services: ACTIVE_HOME_SERVICES_KIT },
    tiers: TIER_SPECIFICATIONS,
    foundations: { 'foundation-1': FOUNDATION },
    designProfilesBySiteRef: { 'site-1': resolveSiteDesignProfile('site-1', READY_STYLE) },
    componentRegistry: buildSeededComponentRegistry(),
  }
}

let ledger: ProgramLedger
let store: InMemoryLedgerStore
let registry: ExecutorRegistry

beforeEach(() => {
  store = new InMemoryLedgerStore()
  ledger = new ProgramLedger(store)
  registry = new ExecutorRegistry()
  registry.register(new SiteSpecificationExecutor(buildDeps()))
})

describe('SiteSpecificationExecutor, driven end-to-end through the Program Ledger', () => {
  it('resolves a valid Site Specification via a real ledger dispatch -> claim -> execute -> complete cycle', async () => {
    const issue = await ledger.createIssue({
      issueType: SITE_SPECIFICATION_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: {
        siteSpecId: 'sitespec-1',
        siteRef: 'site-1',
        kitId: 'home_services',
        tierId: 'standard',
        foundationId: 'foundation-1',
        selectedComponentIds: ['SignupHero', 'CTASection'],
        pageCount: 5,
      },
    })

    const run = await runIssueOnce(ledger, registry, issue.issueId)

    expect(run.state).toBe('succeeded')
    const output = run.output as SiteSpecification

    const deps = buildDeps()
    const directResult = resolveSiteSpecification({
      siteSpecId: 'sitespec-1',
      siteRef: 'site-1',
      kit: deps.kits.home_services,
      tier: deps.tiers.standard,
      foundation: deps.foundations['foundation-1'],
      designProfile: deps.designProfilesBySiteRef['site-1'],
      componentRegistry: deps.componentRegistry,
      selectedComponentIds: ['SignupHero', 'CTASection'],
      pageCount: 5,
    })
    // The executor's output must match what calling resolveSiteSpecification() directly produces
    // (excluding resolvedAt, which is a wall-clock timestamp captured independently by each call).
    expect({ ...output, resolvedAt: undefined }).toEqual({ ...directResult, resolvedAt: undefined })

    const completed = await ledger.getIssue(issue.issueId)
    expect(completed?.state).toBe('awaiting_gate')
  })

  it('fails the Run with invalid_input when the requested Foundation does not exist', async () => {
    const issue = await ledger.createIssue({
      issueType: SITE_SPECIFICATION_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: {
        siteSpecId: 'sitespec-1',
        siteRef: 'site-1',
        kitId: 'home_services',
        tierId: 'standard',
        foundationId: 'does-not-exist',
        selectedComponentIds: [],
        pageCount: 5,
      },
    })

    const run = await runIssueOnce(ledger, registry, issue.issueId)

    expect(run.state).toBe('failed_terminal')
    expect(run.failure?.failureClass).toBe('invalid_input')
    expect(run.failure?.message).toContain('does-not-exist')
  })

  it('fails the Run with invalid_input when a mismatched Foundation/Kit combination is requested (delegated to resolveSiteSpecification\'s own guard)', async () => {
    const issue = await ledger.createIssue({
      issueType: SITE_SPECIFICATION_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: {
        siteSpecId: 'sitespec-1',
        siteRef: 'site-1',
        kitId: 'home_services',
        tierId: 'premium', // Foundation was built for 'standard'
        foundationId: 'foundation-1',
        selectedComponentIds: [],
        pageCount: 5,
      },
    })

    const run = await runIssueOnce(ledger, registry, issue.issueId)

    expect(run.state).toBe('failed_terminal')
    expect(run.failure?.failureClass).toBe('invalid_input')
  })

  it('fails the Run with invalid_input when the Issue input is missing required fields, without throwing', async () => {
    const issue = await ledger.createIssue({
      issueType: SITE_SPECIFICATION_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: { siteSpecId: 'sitespec-1' },
    })

    const run = await runIssueOnce(ledger, registry, issue.issueId)

    expect(run.state).toBe('failed_terminal')
    expect(run.failure?.failureClass).toBe('invalid_input')
  })

  it('produces a real event trail proving the Issue was traced through dispatch, claim, and completion (manual §98.4)', async () => {
    const issue = await ledger.createIssue({
      issueType: SITE_SPECIFICATION_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: {
        siteSpecId: 'sitespec-1',
        siteRef: 'site-1',
        kitId: 'home_services',
        tierId: 'standard',
        foundationId: 'foundation-1',
        selectedComponentIds: [],
        pageCount: 5,
      },
    })

    await runIssueOnce(ledger, registry, issue.issueId)

    const events = await store.listEvents(issue.issueId)
    const eventTypes = events.map((e) => e.type)
    expect(eventTypes).toEqual(expect.arrayContaining(['issue.created', 'run.dispatched', 'run.claimed', 'run.succeeded']))
  })
})

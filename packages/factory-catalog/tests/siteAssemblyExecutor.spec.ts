import { beforeEach, describe, expect, it } from 'vitest'
import { InMemoryLedgerStore, ProgramLedger, ExecutorRegistry, runIssueOnce } from '@linksites/program-ledger'
import { SITE_ASSEMBLY_ISSUE_TYPE, SiteAssemblyExecutor, type SiteAssemblyExecutorDeps } from '../src/executors/siteAssemblyExecutor.js'
import { HOME_SERVICES_KIT, type VerticalKit } from '../src/verticalKit.js'
import { buildSeededComponentRegistry } from '../src/componentRegistry.js'
import { assembleSiteManifest, type SiteAssemblyManifest } from '../src/siteAssemblyManifest.js'
import type { SiteSpecification } from '../src/siteSpecification.js'
import type { ProspectAdaptation } from '../src/prospectAdaptation.js'

const ACTIVE_HOME_SERVICES_KIT: VerticalKit = { ...HOME_SERVICES_KIT, status: 'active' }

const SITE_SPEC: SiteSpecification = {
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
}

const ADAPTATION: ProspectAdaptation = {
  schemaVersion: { major: 1, minor: 0 },
  adaptationId: 'adapt-1',
  siteSpecId: 'sitespec-1',
  foundationId: 'foundation-1',
  reservationId: 'res-1',
  status: 'draft',
  prospectContent: { businessName: 'Acme Plumbing' },
  createdAt: new Date().toISOString(),
}

function buildDeps(): SiteAssemblyExecutorDeps {
  return {
    kits: { home_services: ACTIVE_HOME_SERVICES_KIT },
    siteSpecsById: { 'sitespec-1': SITE_SPEC },
    adaptationsById: { 'adapt-1': ADAPTATION },
    componentRegistry: buildSeededComponentRegistry(),
  }
}

let ledger: ProgramLedger
let registry: ExecutorRegistry

beforeEach(() => {
  ledger = new ProgramLedger(new InMemoryLedgerStore())
  registry = new ExecutorRegistry()
  registry.register(new SiteAssemblyExecutor(buildDeps()))
})

const VALID_INPUT = {
  manifestId: 'manifest-1',
  manifestVersion: 1,
  siteId: 'site-1',
  siteClass: 'preview',
  siteSpecId: 'sitespec-1',
  adaptationId: 'adapt-1',
  kitId: 'home_services',
  platformReleaseRef: 'release-1',
  pagePlan: [{ route: '/', pageType: 'home', componentIds: ['SignupHero', 'CTASection'] }],
}

describe('SiteAssemblyExecutor, driven end-to-end through the Program Ledger', () => {
  it('resolves a valid Site Assembly Manifest matching a direct assembleSiteManifest() call', async () => {
    const issue = await ledger.createIssue({
      issueType: SITE_ASSEMBLY_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: VALID_INPUT,
    })

    const run = await runIssueOnce(ledger, registry, issue.issueId)
    expect(run.state).toBe('succeeded')

    const deps = buildDeps()
    const direct = assembleSiteManifest({
      manifestId: 'manifest-1',
      manifestVersion: 1,
      siteId: 'site-1',
      siteClass: 'preview',
      siteSpec: SITE_SPEC,
      adaptation: ADAPTATION,
      kit: deps.kits.home_services,
      componentRegistry: deps.componentRegistry,
      platformReleaseRef: 'release-1',
      pagePlan: VALID_INPUT.pagePlan,
    })

    const output = run.output as SiteAssemblyManifest
    expect({ ...output, resolvedAt: undefined }).toEqual({ ...direct, resolvedAt: undefined })

    const completed = await ledger.getIssue(issue.issueId)
    expect(completed?.state).toBe('awaiting_gate')
  })

  it('fails with invalid_input when the Site Specification is not registered', async () => {
    const issue = await ledger.createIssue({
      issueType: SITE_ASSEMBLY_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: { ...VALID_INPUT, siteSpecId: 'does-not-exist' },
    })

    const run = await runIssueOnce(ledger, registry, issue.issueId)
    expect(run.state).toBe('failed_terminal')
    expect(run.failure?.failureClass).toBe('invalid_input')
    expect(run.failure?.message).toContain('does-not-exist')
  })

  it('fails with invalid_input when the Adaptation does not match the Site Specification (delegated to assembleSiteManifest\'s own guard)', async () => {
    const mismatchedAdaptation: ProspectAdaptation = { ...ADAPTATION, adaptationId: 'adapt-2', siteSpecId: 'sitespec-other' }
    const deps = buildDeps()
    deps.adaptationsById['adapt-2'] = mismatchedAdaptation
    registry = new ExecutorRegistry()
    registry.register(new SiteAssemblyExecutor(deps))

    const issue = await ledger.createIssue({
      issueType: SITE_ASSEMBLY_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: { ...VALID_INPUT, adaptationId: 'adapt-2' },
    })

    const run = await runIssueOnce(ledger, registry, issue.issueId)
    expect(run.state).toBe('failed_terminal')
    expect(run.failure?.failureClass).toBe('invalid_input')
  })

  it('fails with invalid_input on malformed input without throwing', async () => {
    const issue = await ledger.createIssue({
      issueType: SITE_ASSEMBLY_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: { manifestId: 'manifest-1' },
    })

    const run = await runIssueOnce(ledger, registry, issue.issueId)
    expect(run.state).toBe('failed_terminal')
    expect(run.failure?.failureClass).toBe('invalid_input')
  })

  it('fails with invalid_input when an adaptationId is supplied but not registered', async () => {
    const issue = await ledger.createIssue({
      issueType: SITE_ASSEMBLY_ISSUE_TYPE,
      programRef: 'linksites-manual-alignment',
      input: { ...VALID_INPUT, adaptationId: 'does-not-exist' },
    })

    const run = await runIssueOnce(ledger, registry, issue.issueId)
    expect(run.state).toBe('failed_terminal')
    expect(run.failure?.failureClass).toBe('invalid_input')
    expect(run.failure?.message).toContain('does-not-exist')
  })
})

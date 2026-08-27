import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { InMemoryLedgerStore } from '../src/store.js'
import { ProgramLedger } from '../src/ledger.js'
import { HierarchyRegistry } from '../src/hierarchy.js'
import { ExecutorRegistry, runIssueOnce } from '../src/executor.js'
import { canonicalEvidence } from './evidence.js'
import {
  COMPATIBLE_UPGRADE_PIN,
  EXISTING_SITE_PIN,
  ExistingSiteMigrationEngine,
  ExistingSiteMigrationError,
  INCOMPATIBLE_UPGRADE_PIN,
  classifyUpgrade,
  digestCopiedCatalog,
  digestCopiedSite,
  evaluateLs10Acceptance,
  migrationDependsOn,
  type CopiedExistingSite,
  type PinRecord,
} from '../src/existingSiteMigration.js'
import { ExistingSiteMigrationExecutor } from '../src/existingSiteMigrationExecutor.js'

const here = dirname(fileURLToPath(import.meta.url))
const fixture = <T>(name: string): T => JSON.parse(readFileSync(resolve(here, 'fixtures/iss-31', name), 'utf8')) as T

const copied = fixture<{ sites: CopiedExistingSite[] }>('copied-existing-sites.json')
const compatible = fixture<{ siteIds: string[]; unselectedSiteIds: string[]; targetPin: PinRecord; compatibility: 'compatible' }>('compatible-upgrade.json')
const incompatible = fixture<{ siteIds: string[]; unselectedSiteIds: string[]; targetPin: PinRecord; compatibility: 'incompatible' }>('incompatible-upgrade.json')
const retirement = fixture<{ retirePinCommitSha: string; newSelectionPin: PinRecord; historicSiteId: string; rollbackSiteId: string }>('retirement-and-rollback.json')

const NOW = '2026-08-26T00:00:00.000Z'

function engine(): ExistingSiteMigrationEngine {
  return new ExistingSiteMigrationEngine(copied.sites, EXISTING_SITE_PIN, { now: () => NOW })
}

describe('ISS-31 copied existing-site migration', () => {
  it('keeps existing copied sites pinned when the default pin changes', () => {
    const catalog = engine()
    const before = digestCopiedSite(catalog.getSite('site-published-a'))
    catalog.setDefaultPin(COMPATIBLE_UPGRADE_PIN)
    expect(catalog.getSite('site-published-a').pin.commitSha).toBe(EXISTING_SITE_PIN.commitSha)
    expect(digestCopiedSite(catalog.getSite('site-published-a'))).toBe(before)
    expect(() => catalog.alignExistingSitesToDefault()).toThrow(ExistingSiteMigrationError)
    const fresh = catalog.adoptNewSite({
      siteId: 'site-new-after-default',
      orgId: 'org-new',
      adoptionId: 'adopt:site-new-after-default',
      identities: catalog.getSite('site-published-a').identities,
      configuration: { locale: 'en' },
      content: { schemaVersion: '2.0.0' },
      lifecycle: 'draft',
      active: true,
    })
    expect(fresh.pin.commitSha).toBe(COMPATIBLE_UPGRADE_PIN.commitSha)
  })

  it('plans, applies, and verifies a compatible copied-site upgrade with replayed configuration and content', () => {
    const catalog = engine()
    expect(classifyUpgrade(catalog.getSite('site-published-a').pin, compatible.targetPin)).toBe('compatible')
    const plan = catalog.plan({
      siteIds: compatible.siteIds,
      targetPin: compatible.targetPin,
      compatibility: 'compatible',
    })
    const applied = catalog.apply(plan.planId)
    expect(applied.applied).toBe(true)
    expect(applied.afterDigest).not.toBe(plan.beforeDigest)
    const upgraded = catalog.getSite('site-published-a')
    expect(upgraded.pin.commitSha).toBe(COMPATIBLE_UPGRADE_PIN.commitSha)
    expect(upgraded.configuration.templatePin).toBe(COMPATIBLE_UPGRADE_PIN.commitSha)
    expect(upgraded.configuration.displayName).toBe('Copied published A')
    expect(upgraded.content.homeTitle).toBe('Copied Home A')
    expect(upgraded.content.schemaVersion).toBe('2.0.0')
    const verified = catalog.verify(plan.planId, compatible.unselectedSiteIds)
    expect(verified.verified).toBe(true)
    expect(verified.pinStableForUnselected).toBe(true)
    expect(catalog.getSite('site-published-bystander').pin.commitSha).toBe(EXISTING_SITE_PIN.commitSha)
  })

  it('rejects incompatible upgrades while preserving the active copied site', () => {
    const catalog = engine()
    expect(classifyUpgrade(catalog.getSite('site-published-a').pin, incompatible.targetPin)).toBe('incompatible')
    const before = digestCopiedCatalog([catalog.getSite('site-published-a')])
    const plan = catalog.plan({
      siteIds: incompatible.siteIds,
      targetPin: incompatible.targetPin,
      compatibility: 'incompatible',
    })
    const applied = catalog.apply(plan.planId)
    expect(applied.applied).toBe(false)
    expect(applied.preserved).toBe(true)
    expect(applied.afterDigest).toBe(before)
    expect(catalog.getSite('site-published-a').active).toBe(true)
    expect(catalog.getSite('site-published-a').pin.commitSha).toBe(EXISTING_SITE_PIN.commitSha)
    expect(catalog.getSite('site-published-a').pin.commitSha).not.toBe(INCOMPATIBLE_UPGRADE_PIN.commitSha)
    const verified = catalog.verify(plan.planId, incompatible.unselectedSiteIds)
    expect(verified.verified).toBe(true)
    expect(verified.expectedApplied).toBe(false)
  })

  it('requires a deliberate plan to migrate an invalid legacy pin and then preserves adoption identities', () => {
    const catalog = engine()
    expect(() =>
      catalog.plan({
        siteIds: ['site-invalid-legacy'],
        targetPin: EXISTING_SITE_PIN,
        compatibility: 'incompatible',
      }),
    ).toThrow(/deliberate/)
    const plan = catalog.plan({
      siteIds: ['site-invalid-legacy'],
      targetPin: EXISTING_SITE_PIN,
      compatibility: 'incompatible',
      deliberate: true,
    })
    const applied = catalog.apply(plan.planId)
    expect(applied.applied).toBe(true)
    const migrated = catalog.getSite('site-invalid-legacy')
    expect(migrated.pin.commitSha).toBe(EXISTING_SITE_PIN.commitSha)
    expect(migrated.identities.layout).toBe('1010101010101010101010101010101010101010')
    expect(migrated.identities.plan).toBe('2020202020202020202020202020202020202020')
    expect(migrated.content.homeTitle).toBe('Copied Legacy Home')
    expect(catalog.verify(plan.planId, ['site-published-a']).verified).toBe(true)
  })

  it('readback after rollback matches the before digest', () => {
    const catalog = engine()
    const plan = catalog.plan({
      siteIds: [retirement.rollbackSiteId],
      targetPin: compatible.targetPin,
      compatibility: 'compatible',
    })
    catalog.apply(plan.planId)
    const rolled = catalog.rollback(plan.planId)
    expect(rolled.rolledBack).toBe(true)
    expect(rolled.matchesBefore).toBe(true)
    expect(rolled.readbackDigest).toBe(plan.beforeDigest)
    expect(catalog.getSite(retirement.rollbackSiteId).lifecycle).toBe('rolled_back')
    expect(catalog.getSite(retirement.rollbackSiteId).pin.commitSha).toBe(EXISTING_SITE_PIN.commitSha)
    expect(catalog.getSite(retirement.rollbackSiteId).content.homeTitle).toBe('Copied Home A')
  })

  it('retrieves historic copies after new-selection retirement', () => {
    const catalog = engine()
    const historicBefore = catalog.getSite(retirement.historicSiteId)
    catalog.setDefaultPin(retirement.newSelectionPin)
    catalog.retirePin({ ...EXISTING_SITE_PIN, commitSha: retirement.retirePinCommitSha })
    expect(catalog.pinIsRetired(retirement.retirePinCommitSha)).toBe(true)
    expect(catalog.getSite(retirement.historicSiteId).lifecycle).toBe('retired')
    const historic = catalog.retrieveHistoric(retirement.historicSiteId, retirement.retirePinCommitSha)
    expect(historic).not.toBeNull()
    expect(historic!.pin.commitSha).toBe(EXISTING_SITE_PIN.commitSha)
    expect(historic!.identities.effective).toBe(historicBefore.identities.effective)
    const replacement = catalog.adoptNewSite({
      siteId: 'site-new-selection',
      orgId: 'org-new-selection',
      adoptionId: 'adopt:site-new-selection',
      identities: historicBefore.identities,
      configuration: { locale: 'en' },
      content: { schemaVersion: '2.0.0' },
      lifecycle: 'draft',
      active: true,
    })
    expect(replacement.pin.commitSha).toBe(retirement.newSelectionPin.commitSha)
    expect(catalog.retrieveHistoric(retirement.historicSiteId, retirement.retirePinCommitSha)?.content.homeTitle).toBe(
      'Copied Home Bystander',
    )
  })

  it('locks rollback/readback evidence to the live copied-site engine', () => {
    const catalog = engine()
    const plan = catalog.plan({
      siteIds: compatible.siteIds,
      targetPin: compatible.targetPin,
      compatibility: 'compatible',
    })
    const applied = catalog.apply(plan.planId)
    const verified = catalog.verify(plan.planId, compatible.unselectedSiteIds)
    const rolled = catalog.rollback(plan.planId)
    const other = engine()
    const iplan = other.plan({
      siteIds: incompatible.siteIds,
      targetPin: incompatible.targetPin,
      compatibility: 'incompatible',
    })
    const iapplied = other.apply(iplan.planId)
    const recorded = JSON.parse(
      readFileSync(resolve(here, '../../../docs/evidence/profile-v2-cutover/migration/rollback-readback.json'), 'utf8'),
    ) as {
      compatible: { beforeDigest: string; afterDigest: string; rollbackReadback: string; matchesBefore: boolean; verified: boolean }
      incompatible: { beforeDigest: string; afterDigest: string; preserved: boolean; verified: boolean }
      ls10Acceptance: { status: string }
    }
    expect(recorded.ls10Acceptance.status).toBe('HOLD')
    expect(plan.beforeDigest).toBe(recorded.compatible.beforeDigest)
    expect(applied.afterDigest).toBe(recorded.compatible.afterDigest)
    expect(verified.verified).toBe(recorded.compatible.verified)
    expect(rolled.readbackDigest).toBe(recorded.compatible.rollbackReadback)
    expect(rolled.matchesBefore).toBe(recorded.compatible.matchesBefore)
    expect(iplan.beforeDigest).toBe(recorded.incompatible.beforeDigest)
    expect(iapplied.afterDigest).toBe(recorded.incompatible.afterDigest)
    expect(iapplied.preserved).toBe(recorded.incompatible.preserved)
  })

  it('holds LS-10 acceptance until H-09 consumer conformance is accepted', () => {
    const held = evaluateLs10Acceptance({ h09ConsumerConformanceAccepted: false, iss31EngineeringComplete: true })
    expect(held.status).toBe('HOLD')
    expect(held.reason).toBe('h09_consumer_conformance_not_accepted')
    expect(held.genericRuntimeActive).toBe(true)
    const stillHold = evaluateLs10Acceptance({ h09ConsumerConformanceAccepted: true, iss31EngineeringComplete: true })
    expect(stillHold.status).toBe('HOLD')
    expect(stillHold.reason).toBe('iss31_does_not_accept_ls10_packet')
  })

  it('runs plan/apply/verify through ledger issue dependencies', async () => {
    const catalog = engine()
    const ledger = new ProgramLedger(new InMemoryLedgerStore(), new HierarchyRegistry())
    const registry = new ExecutorRegistry()
    registry.register(new ExistingSiteMigrationExecutor(catalog))
    await ledger.seedProgramGraph()
    const orgId = 'a0000000-a000-a000-a000-a00000000001'
    const planIssue = await ledger.createIssue({
      issueType: 'site.migration.plan',
      programRef: 'linksites',
      moduleRef: 'M16',
      orgId,
      input: {
        siteIds: compatible.siteIds,
        targetPin: compatible.targetPin,
        compatibility: 'compatible',
      },
    })
    expect(migrationDependsOn('site.migration.apply')).toBe('site.migration.plan')
    const applyIssue = await ledger.createIssue({
      issueType: 'site.migration.apply',
      programRef: 'linksites',
      moduleRef: 'M16',
      orgId,
      input: { planId: 'iss31-plan-0001' },
      dependsOn: [planIssue.issueId],
    })
    await expect(ledger.dispatch(applyIssue.issueId)).rejects.toThrow(/depend/i)
    const planRun = await runIssueOnce(ledger, registry, planIssue.issueId)
    await ledger.decideGate(planIssue.issueId, planRun.runId, 'accepted', await canonicalEvidence(ledger, 'issue', planIssue.issueId, orgId), 'iss31-reviewer')
    const applyRun = await runIssueOnce(ledger, registry, applyIssue.issueId)
    expect(applyRun.state).toBe('succeeded')
    await ledger.decideGate(applyIssue.issueId, applyRun.runId, 'accepted', await canonicalEvidence(ledger, 'issue', applyIssue.issueId, orgId), 'iss31-reviewer')
    const verifyIssue = await ledger.createIssue({
      issueType: 'site.migration.verify',
      programRef: 'linksites',
      moduleRef: 'M16',
      orgId,
      input: { planId: 'iss31-plan-0001', unselectedSiteIds: compatible.unselectedSiteIds },
      dependsOn: [applyIssue.issueId],
    })
    const verifyRun = await runIssueOnce(ledger, registry, verifyIssue.issueId)
    expect(verifyRun.state).toBe('succeeded')
    expect((verifyRun.output as { verified: boolean }).verified).toBe(true)
  })
})

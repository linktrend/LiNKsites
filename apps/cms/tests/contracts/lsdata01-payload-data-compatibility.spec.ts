import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  AdoptionIdentityError,
  LSDATA01_NON_ADMITTED_FIXTURE_TREES,
  LSDATA01_PAYLOAD_MIGRATION,
  LSDATA01_SCHEMA_IDENTITIES,
  LS02_DEPENDENCY_EVIDENCE,
  activateAdoptionOrReject,
  assertCompatibleAdoptionIdentities,
  buildCanonicalAdoptionIdentities,
  computeSchemaCompatibilityEffectiveIdentity,
  createLsdata01CompatibilityStore,
  rollbackAdoption,
} from '../../../../packages/factory-catalog/src/adoptionIdentities.ts'
import {
  capabilityCreditBudget,
  deterministicCreditDefaults,
  hydrateCopiedEntitlementRow,
  replayCreditHydration,
} from '../../../../packages/factory-catalog/src/capabilityCredits.ts'
import { migrations } from '../../src/migrations'

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '../../../..')
const PIN = (label: string): string => createHash('sha1').update(`lsdata01:${label}`).digest('hex')

const actor = { actorOrgId: 'org-a', assignedSiteIds: ['site-a'] }

function retainedIdentities() {
  return buildCanonicalAdoptionIdentities({
    layout: PIN('layout'),
    plan: PIN('plan00'),
    overlay: PIN('overlay'),
    config: PIN('config'),
    content: PIN('content'),
  })
}

function schemaCopyIdentities() {
  const identities = {
    provider: LSDATA01_SCHEMA_IDENTITIES.libraries.treeSha,
    adapter: LSDATA01_SCHEMA_IDENTITIES.harness.treeSha,
    layout: PIN('layout'),
    plan: PIN('plan00'),
    overlay: PIN('overlay'),
    config: PIN('config'),
    content: PIN('content'),
    effective: '',
  }
  identities.effective = computeSchemaCompatibilityEffectiveIdentity(identities)
  return identities
}

describe('LSDATA-01 additive Payload/data compatibility', () => {
  it('registers one new additive migration after applied LS-03/LS-04 history', () => {
    expect(migrations.map((migration) => migration.name)).toContain(LSDATA01_PAYLOAD_MIGRATION)
    expect(migrations.filter((migration) => migration.name === LSDATA01_PAYLOAD_MIGRATION)).toHaveLength(1)
  })

  it('does not rewrite applied Payload migration bytes', () => {
    const applied = [
      'apps/cms/src/migrations/20251212_000000_payload_initial_baseline.ts',
      'apps/cms/src/migrations/20251213_locked_docs.ts',
      'apps/cms/src/migrations/20260810_000003_pages_public_activation.ts',
      'apps/cms/src/migrations/20260824_000001_ls03_semantic_models.ts',
      'apps/cms/src/migrations/20260825_000001_ls04_payload_semantic_fields.ts',
    ]
    for (const relativePath of applied) {
      const head = readFileSync(join(repoRoot, relativePath), 'utf8')
      expect(head.length).toBeGreaterThan(0)
    }
    const ls03 = readFileSync(join(repoRoot, 'apps/cms/src/migrations/20260824_000001_ls03_semantic_models.ts'), 'utf8')
    expect(ls03).not.toContain('DROP TABLE IF EXISTS "offer_pages"')
    expect(ls03).not.toContain('DROP TABLE IF EXISTS "case_study_pages"')
  })

  it('keeps Offer and Case collections as preserved projections', () => {
    const collectionsDir = join(dirname(fileURLToPath(import.meta.url)), '../../src/collections')
    expect(readFileSync(join(collectionsDir, 'OfferPage.ts'), 'utf8')).toContain("slug: 'offer-pages'")
    expect(readFileSync(join(collectionsDir, 'CaseStudyPage.ts'), 'utf8')).toContain("slug: 'case-study-pages'")
    const sql = readFileSync(
      join(repoRoot, 'apps/cms/src/migrations/20260911_000001_lsdata01_payload_data_compatibility.ts'),
      'utf8',
    )
    expect(sql).not.toMatch(/DROP TABLE IF EXISTS "(offer_pages|case_study_pages)"/)
    expect(sql).toContain('ADD COLUMN IF NOT EXISTS')
  })

  it('fresh-installs a retained production pin as active', () => {
    const store = createLsdata01CompatibilityStore()
    const first = store.applyMigration()
    const replay = store.applyMigration()
    expect(first).toEqual({ applied: true, name: LSDATA01_PAYLOAD_MIGRATION })
    expect(replay).toEqual({ applied: false, name: LSDATA01_PAYLOAD_MIGRATION })
    const installed = store.installFresh(
      {
        adoptionId: 'adopt:fresh',
        tenantOrgId: 'org-a',
        siteId: 'site-a',
        identities: retainedIdentities(),
        adoptionState: 'adopted',
        claimProduction: true,
      },
      actor,
    )
    expect(installed.activationState).toBe('active')
    expect(installed.compatibilityClass).toBe('retained-production-pin')
    expect(installed.identities.provider).toBe(LS02_DEPENDENCY_EVIDENCE.mwt02Provider.candidateTree)
  })

  it('upgrades copied prior adoptions without changing pins or entitlements', () => {
    const store = createLsdata01CompatibilityStore()
    const prior = store.installFresh(
      {
        adoptionId: 'adopt:copied',
        tenantOrgId: 'org-a',
        siteId: 'site-a',
        identities: retainedIdentities(),
        adoptionState: 'adopted',
        claimProduction: true,
      },
      actor,
    )
    const upgraded = store.upgradeCopied(prior, actor)
    expect(upgraded.identities).toEqual(prior.identities)
    expect(upgraded.activationState).toBe('active')
    expect(store.get('adopt:copied')?.identities.effective).toBe(prior.identities.effective)
  })

  it('rejects incompatible input without partial activation', () => {
    const store = createLsdata01CompatibilityStore()
    const prior = store.installFresh(
      {
        adoptionId: 'adopt:safe',
        tenantOrgId: 'org-a',
        siteId: 'site-a',
        identities: retainedIdentities(),
        adoptionState: 'adopted',
        claimProduction: true,
      },
      actor,
    )
    const rejected = store.rejectIncompatible(
      prior,
      {
        adoptionId: 'adopt:safe',
        tenantOrgId: 'org-a',
        siteId: 'site-a',
        identities: {
          ...retainedIdentities(),
          provider: LSDATA01_NON_ADMITTED_FIXTURE_TREES.masterTemplateType1Artifact,
        },
        adoptionState: 'adopted',
        claimProduction: true,
      },
      actor,
    )
    expect(rejected.activated).toBe(false)
    expect(store.get('adopt:safe')).toEqual(prior)
    expect(() =>
      assertCompatibleAdoptionIdentities(
        { ...retainedIdentities(), provider: PIN('unknown0') },
        { claimProduction: true },
      ),
    ).toThrow(AdoptionIdentityError)
  })

  it('denies cross-tenant and unauthorized site actors fail-closed', () => {
    expect(() =>
      activateAdoptionOrReject(
        null,
        {
          adoptionId: 'adopt:deny',
          tenantOrgId: 'org-a',
          siteId: 'site-a',
          identities: retainedIdentities(),
          adoptionState: 'adopted',
          claimProduction: true,
        },
        { actorOrgId: 'org-b', assignedSiteIds: ['site-a'] },
      ),
    ).toThrow(/Tenant authorization denied/)
    const adoptions = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../src/collections/TemplateAdoptions.ts'), 'utf8')
    expect(adoptions).toContain('Tenant authorization denied: org boundary is fail-closed.')
  })

  it('retains prior LS02 pins and keeps schema copies inactive', () => {
    const classified = assertCompatibleAdoptionIdentities(schemaCopyIdentities(), { claimProduction: false })
    expect(classified.compatibilityClass).toBe('schema-compatibility-copy')
    expect(classified.activationState).toBe('inactive')
    expect(() =>
      assertCompatibleAdoptionIdentities(schemaCopyIdentities(), { claimProduction: true }),
    ).toThrow(/not production admission/)
    const adoptions = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../src/collections/TemplateAdoptions.ts'), 'utf8')
    expect(adoptions).toContain('Frozen schema identities cannot activate production; rejected without partial activation.')
  })

  it('applies deterministic A/B/C/L credit defaults and replays them', () => {
    expect(deterministicCreditDefaults(undefined)).toEqual({
      planId: 'L',
      grantedCredits: 0,
      budgets: { A: 30, B: 15, C: 6, L: 0 },
    })
    expect(capabilityCreditBudget('A')).toBe(30)
    const hydrated = hydrateCopiedEntitlementRow({
      snapshotId: 'snap:copied',
      siteRef: 'site-a',
      planId: 'B',
    })
    expect(hydrated.grantedCredits).toBe(15)
    expect(replayCreditHydration(hydrated).digest).toBe(hydrated.digest)
    expect(() =>
      hydrateCopiedEntitlementRow({
        snapshotId: 'snap:bad',
        siteRef: 'site-a',
        planId: 'B',
        grantedCredits: 99,
      }),
    ).toThrow(/without partial activation/)
    const snapshots = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '../../src/collections/EntitlementSnapshots.ts'), 'utf8')
    expect(snapshots).toContain('assertLsdata01EntitlementDefaults')
    expect(snapshots).toContain('data.grantedCredits = granted')
  })

  it('replays the additive migration up() without changing already-applied SQL', async () => {
    const migration = migrations.find((candidate) => candidate.name === LSDATA01_PAYLOAD_MIGRATION)
    expect(migration).toBeDefined()
    const executed: string[] = []
    const db = {
      execute: async (statement: { queryChunks?: unknown }) => {
        const chunks = (statement.queryChunks ?? []) as Array<{ value?: string[] }>
        executed.push(chunks.flatMap((chunk) => chunk.value ?? []).join('') || String(statement))
      },
    }
    await migration!.up({ db, payload: { logger: { info() {} } } } as never)
    await migration!.up({ db, payload: { logger: { info() {} } } } as never)
    expect(executed).toHaveLength(2)
    expect(executed[0]).toBe(executed[1])
    const source = readFileSync(
      join(repoRoot, 'apps/cms/src/migrations/20260911_000001_lsdata01_payload_data_compatibility.ts'),
      'utf8',
    )
    expect(source).toContain('ADD COLUMN IF NOT EXISTS')
    expect(source).toContain('EXCEPTION WHEN duplicate_object THEN NULL')
  })

  it('rolls back an adoption to the recorded prior pin', () => {
    const adopted = activateAdoptionOrReject(
      null,
      {
        adoptionId: 'adopt:roll',
        tenantOrgId: 'org-a',
        siteId: 'site-a',
        identities: retainedIdentities(),
        adoptionState: 'adopted',
        claimProduction: true,
      },
      actor,
    )
    const rolled = rollbackAdoption(adopted, adopted)
    expect(rolled.adoptionState).toBe('rolled_back')
    expect(rolled.identities.provider).toBe(LS02_DEPENDENCY_EVIDENCE.mwt02Provider.candidateTree)
  })

  it('rejects Product/Service kind swaps without activation', () => {
    const collectionsDir = join(dirname(fileURLToPath(import.meta.url)), '../../src/collections')
    expect(readFileSync(join(collectionsDir, 'Products.ts'), 'utf8')).toContain(
      'Products remain semantically distinct from Services; incompatible kind rejected without activation.',
    )
    expect(readFileSync(join(collectionsDir, 'Services.ts'), 'utf8')).toContain(
      'Services remain semantically distinct from Products; incompatible kind rejected without activation.',
    )
    expect(readFileSync(join(collectionsDir, 'Products.ts'), 'utf8')).toContain("data.semanticKind = 'product'")
    expect(readFileSync(join(collectionsDir, 'Services.ts'), 'utf8')).toContain("data.semanticKind = 'service'")
  })
})

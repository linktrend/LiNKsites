import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { tmpdir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  consumePinnedLibraryEntry,
  assertLibraryCatalogSchema,
  assertLibraryEntryContract,
  assertLiNKSitesCatalogPolicy,
  assertLiNKSitesLibraryConsumerPolicy,
  canonicalJsonChecksum,
  LINKSITES_LIBRARY_CONSUMER,
  LINKLIBRARIES_REPOSITORY,
  createOfflineLibraryFixtureTransport,
  isTrustedLibraryConsumption,
  submitArchitectCandidate,
  type LibraryCatalog,
  type LibraryCompatibilityRequest,
  type LibraryEntryContract,
  type LibraryExactCommitTransport,
  type PinnedLibraryCatalogReference,
} from '../src/libraryConsumer.js'
import {
  createPersistedLibraryBackedSite,
  createFileFactoryCatalogPersistence,
  deserializePersistedLibraryBackedSite,
  rehydratePersistedLibraryBackedSite,
  serializePersistedLibraryBackedSite,
} from '../src/libraryPersistence.js'
import { assembleSiteManifest } from '../src/siteAssemblyManifest.js'
import { buildSeededComponentRegistry } from '../src/componentRegistry.js'
import { resolveSiteDesignProfile, type StyleFamily } from '../src/designCatalog.js'
import { HOME_SERVICES_KIT } from '../src/verticalKit.js'
import { TIER_SPECIFICATIONS } from '../src/tierSpecification.js'
import { resolveSiteSpecification } from '../src/siteSpecification.js'
import type { ReusableSiteFoundation } from '../src/reusableFoundation.js'
import { marketingSmbV1FixtureTest } from './fixtures/linklibraries/marketing-smb-v1/tests/marketingSmbV1.fixture.js'

const FIXTURE_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), 'fixtures/linklibraries/marketing-smb-v1')
const COMMIT_SHA = '1'.repeat(40)
const readFixture = (relativePath: string): string => readFileSync(resolve(FIXTURE_ROOT, relativePath), 'utf8')
const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex')

const fixtureEntry = JSON.parse(readFixture('entry.json')) as LibraryEntryContract
const fixtureFiles: Record<string, string> = {
  'README.md': readFixture('README.md'),
  'assets/marketingSmbV1.ts': readFixture('assets/marketingSmbV1.ts'),
  'tests/marketingSmbV1.fixture.ts': readFixture('tests/marketingSmbV1.fixture.ts'),
}
const fixtureCatalog: LibraryCatalog = {
  schemaVersion: 1,
  generatedAt: '2026-08-04T00:00:00.000Z',
  sourceCommitSha: COMMIT_SHA,
  entries: [{
    entryId: fixtureEntry.entryId,
    kind: fixtureEntry.kind,
    name: fixtureEntry.name,
    summary: fixtureEntry.summary,
    problemDomains: fixtureEntry.problemDomains,
    tags: fixtureEntry.tags,
    languages: fixtureEntry.languages,
    frameworks: fixtureEntry.frameworks,
    status: 'approved',
    path: `entries/${fixtureEntry.entryId}`,
  }],
}
const catalogReference: PinnedLibraryCatalogReference = {
  repositoryUrl: LINKLIBRARIES_REPOSITORY,
  commitSha: COMMIT_SHA,
  ref: COMMIT_SHA,
  catalog: fixtureCatalog,
}
const compatibility: LibraryCompatibilityRequest = { nodeMajor: 22, runtimes: ['node', 'browser'] }
const executable = { entrypoint: 'assets/marketingSmbV1.ts', testFiles: ['tests/marketingSmbV1.fixture.ts'] }

function buildTransport(overrides: Partial<{
  catalog: LibraryCatalog
  entry: LibraryEntryContract
  files: Record<string, string>
  readEntryAtCommit: LibraryExactCommitTransport['verifiedCommit']['readEntryAtCommit']
}> = {}): LibraryExactCommitTransport {
  const catalog = overrides.catalog ?? fixtureCatalog
  return createOfflineLibraryFixtureTransport({
    readCatalog: () => catalog,
    readEntryAtCommit: overrides.readEntryAtCommit ?? (({ entryId }) => ({
      entry: { ...(overrides.entry ?? fixtureEntry), entryId },
      files: overrides.files ?? fixtureFiles,
    })),
  })
}

describe('W1-05 LiNKlibraries consumer', () => {
  it('executes the selected offline entrypoint assertion rather than a vacuous fixture', () => {
    expect(marketingSmbV1FixtureTest()).toContain('<h1>Fixture assertion</h1>')
  })

  it('resolves an authoritative-schema offline entry, verifies assets, and records exact SHA receipt', async () => {
    const consumption = await consumePinnedLibraryEntry({
      catalogReference,
      entryId: 'marketing-smb-v1',
      compatibility,
      executable,
      transport: buildTransport(),
      recordedAt: '2026-08-04T00:01:00.000Z',
    })

    expect(consumption.entry.entryId).toBe('marketing-smb-v1')
    expect(consumption.files['assets/marketingSmbV1.ts']).toContain('export const marketingSmbV1LibraryAsset')
    expect(consumption.receipt).toMatchObject({
      consumer: LINKSITES_LIBRARY_CONSUMER,
      entryId: 'marketing-smb-v1',
      catalogCommitSha: COMMIT_SHA,
      libraryCommitSha: COMMIT_SHA,
      entrypoint: executable.entrypoint,
      recordedAt: '2026-08-04T00:01:00.000Z',
    })
    expect(consumption.receipt.assetChecksums).toEqual({
      'README.md': sha256(fixtureFiles['README.md']),
      'assets/marketingSmbV1.ts': sha256(fixtureFiles['assets/marketingSmbV1.ts']),
      'tests/marketingSmbV1.fixture.ts': sha256(fixtureFiles['tests/marketingSmbV1.fixture.ts']),
    })
    expect(isTrustedLibraryConsumption(consumption)).toBe(true)
    const forgedConsumption = structuredClone(consumption)
    forgedConsumption.entry = { ...forgedConsumption.entry, summary: 'caller-forged summary' }
    expect(isTrustedLibraryConsumption(forgedConsumption)).toBe(false)
  })

  it('requires the LiNKsites-owned adapter and rejects moving refs', async () => {
    await expect(consumePinnedLibraryEntry({
      catalogReference: { ...catalogReference, ref: 'development' },
      entryId: 'marketing-smb-v1', compatibility, executable, transport: buildTransport(),
    })).rejects.toThrow(/exact commit SHA/)

    await expect(consumePinnedLibraryEntry({
      catalogReference,
      entryId: 'marketing-smb-v1', compatibility, executable,
      transport: { verifiedCommit: undefined } as unknown as LibraryExactCommitTransport,
    })).rejects.toThrow(/LiNKsites-owned offline fixture adapter/)
  })

  it('rejects copied adapter objects and exposes no transferable symbol credential', async () => {
    const adapter = buildTransport().verifiedCommit
    expect(Object.getOwnPropertySymbols(adapter)).toHaveLength(0)
    await expect(consumePinnedLibraryEntry({
      catalogReference,
      entryId: 'marketing-smb-v1', compatibility, executable,
      transport: {
        verifiedCommit: { ...adapter },
      } as unknown as LibraryExactCommitTransport,
    })).rejects.toThrow(/copied.*self-attested transport/)

    let selectedPath: string | undefined
    await consumePinnedLibraryEntry({
      catalogReference,
      entryId: 'marketing-smb-v1', compatibility, executable,
      transport: buildTransport({ readEntryAtCommit: ({ path }) => {
        selectedPath = path
        return { entry: fixtureEntry, files: fixtureFiles }
      } }),
    })
    expect(selectedPath).toBe('entries/marketing-smb-v1')
  })

  it('rejects catalog/entry substitution, incompatible ranges, and missing runtime requirements', async () => {
    await expect(consumePinnedLibraryEntry({
      catalogReference, entryId: 'marketing-smb-v1', compatibility, executable,
      transport: buildTransport({ entry: { ...fixtureEntry, summary: 'substituted metadata' } }),
    })).rejects.toThrow(/source-owned immutable fixture/)

    await expect(consumePinnedLibraryEntry({
      catalogReference, entryId: 'marketing-smb-v1', compatibility: { nodeMajor: 21, runtimes: compatibility.runtimes }, executable, transport: buildTransport(),
    })).rejects.toThrow(/owned and fixed/)

    await expect(consumePinnedLibraryEntry({
      catalogReference, entryId: 'marketing-smb-v1', compatibility: { nodeMajor: 22, runtimes: ['node', 'browser', 'edge'] }, executable, transport: buildTransport(),
    })).rejects.toThrow(/owned and fixed/)

    await expect(consumePinnedLibraryEntry({
      catalogReference, entryId: 'marketing-smb-v1', compatibility: { nodeMajor: 21, runtimes: ['node', 'browser'] }, executable, transport: buildTransport(),
    })).rejects.toThrow(/owned and fixed/)

    await expect(consumePinnedLibraryEntry({
      catalogReference, entryId: 'marketing-smb-v1', compatibility: { nodeMajor: 22, runtimes: [] }, executable, transport: buildTransport(),
    })).rejects.toThrow(/owned and fixed/)

    expect(() => assertLiNKSitesLibraryConsumerPolicy({ ...fixtureEntry, compatibility: { ...fixtureEntry.compatibility, node: '>=20 || <18' } })).toThrow(/unsupported or ambiguous/)

    await expect(consumePinnedLibraryEntry({
      catalogReference, entryId: 'marketing-smb-v1', compatibility, executable,
      transport: buildTransport({ entry: { ...fixtureEntry, license: { ...fixtureEntry.license, unexpected: true } } }),
    })).rejects.toThrow(/source-owned immutable fixture/)

    expect(() => assertLibraryEntryContract({
      ...fixtureEntry,
      compatibility: { ...fixtureEntry.compatibility, packageManager: 'pnpm' },
      license: { ...fixtureEntry.license, notes: 'schema-permitted additional property' },
      securityReview: { ...fixtureEntry.securityReview, evidenceRef: 'offline-review-note' },
      usage: { ...fixtureEntry.usage, migrationMode: 'fixture' },
      provenance: { ...fixtureEntry.provenance, sourceBranch: 'development' },
    })).not.toThrow()

    const schemaValidEmptyOptionals = {
      ...fixtureEntry,
      usage: { ...fixtureEntry.usage, examples: [''] },
      provenance: { ...fixtureEntry.provenance, sourceUrl: '', versionOrRange: '', productRunId: '' },
    }
    expect(() => assertLibraryEntryContract(schemaValidEmptyOptionals)).not.toThrow()
    expect(() => assertLiNKSitesLibraryConsumerPolicy(schemaValidEmptyOptionals)).toThrow(/non-empty/)

    await expect(consumePinnedLibraryEntry({
      catalogReference, entryId: 'marketing-smb-v1', compatibility, executable,
      transport: buildTransport({ entry: { ...fixtureEntry, kind: 'vetted_oss', provenance: { ...fixtureEntry.provenance, sourceUrl: 'https://example.com/package', versionOrRange: '^1.2.3' } } }),
    })).rejects.toThrow(/source-owned immutable fixture/)

    await expect(consumePinnedLibraryEntry({
      catalogReference, entryId: 'marketing-smb-v1', compatibility, executable,
      transport: buildTransport({ entry: { ...fixtureEntry, kind: 'vetted_oss', provenance: { ...fixtureEntry.provenance, sourceUrl: 'https://example.com/package', versionOrRange: '^1.2.3' } } }),
    })).rejects.toThrow(/source-owned immutable fixture/)

    await expect(consumePinnedLibraryEntry({
      catalogReference, entryId: 'marketing-smb-v1', compatibility, executable,
      transport: buildTransport({
        catalog: { ...fixtureCatalog, entries: [{ ...fixtureCatalog.entries[0], kind: 'vetted_oss' }] },
        entry: { ...fixtureEntry, kind: 'vetted_oss', provenance: { ...fixtureEntry.provenance, sourceUrl: 'https://example.com/package', versionOrRange: '^1.2.3' } },
      }),
    })).rejects.toThrow(/source-owned immutable fixture/)

    expect(() => assertLibraryEntryContract({ ...fixtureEntry, kind: 'vetted_oss', provenance: { ...fixtureEntry.provenance } })).toThrow(/vetted_oss provenance/)
    expect(() => assertLiNKSitesLibraryConsumerPolicy({ ...fixtureEntry, kind: 'vetted_oss', provenance: { ...fixtureEntry.provenance, sourceUrl: 'not-https', versionOrRange: '^1.2.3' } })).toThrow(/vetted_oss provenance.sourceUrl/)
    expect(() => assertLibraryEntryContract({ ...fixtureEntry, kind: 'vetted_oss', provenance: { ...fixtureEntry.provenance, sourceUrl: 'https://example.com/package', versionOrRange: '^1.2.3' } })).not.toThrow()
  })

  it('conforms to the source JSON schemas before applying separate LiNKsites policy', () => {
    const schemaValidEntry = {
      ...fixtureEntry,
      entryId: 'ab',
      compatibility: { node: '', runtimes: [] },
      tags: [''],
      files: [{ path: '.', sha256: '0'.repeat(64) }],
    }
    expect(() => assertLibraryEntryContract(schemaValidEntry)).not.toThrow()
    expect(() => assertLiNKSitesLibraryConsumerPolicy(schemaValidEntry)).toThrow(/non-empty|unsupported|runtime/)

    const schemaValidCatalog = {
      schemaVersion: 1 as const,
      generatedAt: 'source-schema-generated-at',
      sourceCommitSha: 'abcdefg',
      entries: [{
        entryId: '',
        kind: 'source-schema-allows-this-kind',
        name: '',
        summary: '',
        problemDomains: [],
        tags: [''],
        languages: [],
        frameworks: [],
        status: 'source-schema-allows-this-status',
        path: 'arbitrary-source-path',
      }],
    }
    expect(() => assertLibraryCatalogSchema(schemaValidCatalog)).not.toThrow()
    expect(() => assertLiNKSitesCatalogPolicy(schemaValidCatalog)).toThrow(/LiNKsites/)

    expect(() => assertLibraryCatalogSchema({ ...schemaValidCatalog, entries: [{ ...schemaValidCatalog.entries[0], extra: true }] })).toThrow(/authoritative schema/)
    expect(() => assertLibraryEntryContract({ ...fixtureEntry, problemDomains: [] })).toThrow(/problemDomains/)
    expect(() => assertLibraryEntryContract({ ...fixtureEntry, kind: 'vetted_oss', provenance: { sourceSystem: fixtureEntry.provenance.sourceSystem, contributedAt: fixtureEntry.provenance.contributedAt } })).toThrow(/vetted_oss provenance/)
  })

  it('rejects metadata-only, missing-asset, undeclared, and checksum-mismatch selections', async () => {
    await expect(consumePinnedLibraryEntry({
      catalogReference, entryId: 'marketing-smb-v1', compatibility,
      executable: { entrypoint: 'assets/not-listed.ts', testFiles: executable.testFiles }, transport: buildTransport(),
    })).rejects.toThrow(/missing LiNKsites executable/)

    await expect(consumePinnedLibraryEntry({
      catalogReference, entryId: 'marketing-smb-v1', compatibility, executable,
      transport: buildTransport({ entry: { ...fixtureEntry, files: fixtureEntry.files.filter(({ path }) => path === 'README.md') } }),
    })).rejects.toThrow(/source-owned immutable fixture/)

    await expect(consumePinnedLibraryEntry({
      catalogReference, entryId: 'marketing-smb-v1', compatibility, executable,
      transport: buildTransport({ files: { ...fixtureFiles, 'assets/marketingSmbV1.ts': undefined as unknown as string } }),
    })).rejects.toThrow(/asset content/)

    await expect(consumePinnedLibraryEntry({
      catalogReference, entryId: 'marketing-smb-v1', compatibility, executable,
      transport: buildTransport({ files: { ...fixtureFiles, 'assets/marketingSmbV1.ts': 'tampered' } }),
    })).rejects.toThrow(/asset content/)

    await expect(consumePinnedLibraryEntry({
      catalogReference, entryId: 'marketing-smb-v1', compatibility, executable,
      transport: buildTransport({ files: { ...fixtureFiles, 'assets/undeclared.ts': 'unexpected' } }),
    })).rejects.toThrow(/fabricated or incomplete immutable asset set/)
  })

  it('requires receipts for explicit library selection and durably round-trips an integrity-bound site record', async () => {
    const consumption = await consumePinnedLibraryEntry({ catalogReference, entryId: 'marketing-smb-v1', compatibility, executable, transport: buildTransport() })
    const foundation: ReusableSiteFoundation = {
      schemaVersion: { major: 1, minor: 0 }, foundationId: 'foundation-library-backed', displayName: 'Library-backed foundation', status: 'active',
      kitId: 'home_services', tierId: 'standard', platformReleaseRef: 'release-1', assemblyManifestRef: 'manifest-1', createdAt: '2026-08-04T00:00:00.000Z',
    }
    const style: StyleFamily = {
      schemaVersion: { major: 1, minor: 0 }, styleId: 'style-library-backed', displayName: 'Library-backed style', status: 'active', accessibilityContrastPassed: true,
      baseTokens: { 'color.primary': '#0ea5e9' }, fontPairing: { headingFont: 'Inter', bodyFont: 'Inter' },
    }
    const common = {
      kit: { ...HOME_SERVICES_KIT, status: 'active' as const }, tier: TIER_SPECIFICATIONS.standard, foundation,
      designProfile: resolveSiteDesignProfile('site-library-backed', style), componentRegistry: buildSeededComponentRegistry(), selectedComponentIds: ['SignupHero', 'CTASection'], pageCount: 5,
    }
    expect(() => resolveSiteSpecification({ siteSpecId: 'missing-receipt', siteRef: 'site-library-backed', ...common, libraryEntryId: 'marketing-smb-v1' })).toThrow(/trusted materialized/)
    expect(() => resolveSiteSpecification({ siteSpecId: 'receipt-only', siteRef: 'site-library-backed', ...common, libraryEntryId: 'marketing-smb-v1', libraryReceipt: consumption.receipt })).toThrow(/trusted materialized/)
    const siteSpec = resolveSiteSpecification({ siteSpecId: 'sitespec-library-backed', siteRef: 'site-library-backed', ...common, libraryEntryId: 'marketing-smb-v1', libraryReceipt: consumption.receipt, libraryConsumption: consumption })
    const manifest = assembleSiteManifest({
      manifestId: 'manifest-library-backed', manifestVersion: 1, siteId: 'site-library-backed', siteClass: 'foundation', siteSpec,
      kit: { ...HOME_SERVICES_KIT, status: 'active' }, componentRegistry: buildSeededComponentRegistry(), platformReleaseRef: 'release-1', pagePlan: [{ route: '/', pageType: 'home', componentIds: ['SignupHero', 'CTASection'] }],
    })
    expect(() => assembleSiteManifest({
      manifestId: 'manifest-missing-receipt', manifestVersion: 1, siteId: 'site-library-backed', siteClass: 'foundation',
      siteSpec: { ...siteSpec, libraryReceipt: undefined }, kit: { ...HOME_SERVICES_KIT, status: 'active' }, componentRegistry: buildSeededComponentRegistry(),
      platformReleaseRef: 'release-1', pagePlan: [{ route: '/', pageType: 'home', componentIds: ['SignupHero', 'CTASection'] }],
    })).toThrow(/provenance and receipt bound to the same consumption evidence/)
    const persisted = createPersistedLibraryBackedSite({ siteSpec, manifest })
    const restored = deserializePersistedLibraryBackedSite(serializePersistedLibraryBackedSite(persisted))
    expect(restored.siteSpec.libraryReceipt).toEqual(consumption.receipt)
    expect(restored.manifest.libraryReceipt).toEqual(consumption.receipt)

    const storageDirectory = await mkdtemp(join(tmpdir(), 'linksites-factory-catalog-'))
    try {
      const persistence = createFileFactoryCatalogPersistence(storageDirectory)
      await persistence.writeLibraryBackedSite(persisted)
      const rehydrated = await rehydratePersistedLibraryBackedSite(createFileFactoryCatalogPersistence(storageDirectory), siteSpec.siteRef)
      expect(rehydrated.siteSpec.libraryReceipt).toEqual(consumption.receipt)
      expect(await readdir(storageDirectory)).toHaveLength(1)
      const durablePath = join(storageDirectory, (await readdir(storageDirectory))[0])
      const durable = JSON.parse(await readFile(durablePath, 'utf8')) as { record: typeof persisted }
      durable.record.libraryConsumption.files['assets/marketingSmbV1.ts'] = 'durable-store-tamper'
      await writeFile(durablePath, JSON.stringify(durable), 'utf8')
      await expect(rehydratePersistedLibraryBackedSite(createFileFactoryCatalogPersistence(storageDirectory), siteSpec.siteRef)).rejects.toThrow(/failed SHA-256|file contents|integrity checksum/)
    } finally {
      await rm(storageDirectory, { recursive: true, force: true })
    }
    const tampered = JSON.parse(serializePersistedLibraryBackedSite(persisted)) as typeof persisted
    tampered.manifest.libraryReceipt = { ...tampered.manifest.libraryReceipt!, entryId: 'other-entry' }
    expect(() => deserializePersistedLibraryBackedSite(JSON.stringify(tampered))).toThrow(/same receipt|selected entry ID|checksum mismatch/)

    const tamperedEvidence = JSON.parse(serializePersistedLibraryBackedSite(persisted)) as typeof persisted
    tamperedEvidence.libraryConsumption.files['assets/marketingSmbV1.ts'] = 'caller-replaced-content'
    const { integrityChecksum: _oldChecksum, ...tamperedPayload } = tamperedEvidence
    tamperedEvidence.integrityChecksum = canonicalJsonChecksum(tamperedPayload)
    expect(() => deserializePersistedLibraryBackedSite(JSON.stringify(tamperedEvidence))).toThrow(/failed SHA-256|file contents|integrity checksum/)

    const receiptDivergences: Array<[string, Record<string, unknown>]> = [
      ['recordedAt', { recordedAt: '2026-08-04T00:03:00.000Z' }],
      ['entrypoint', { entrypoint: 'README.md' }],
      ['testFiles', { testFiles: ['README.md'] }],
      ['assetChecksums', { assetChecksums: { ...consumption.receipt.assetChecksums, 'README.md': '0'.repeat(64) } }],
      ['compatibility', { compatibility: { ...consumption.receipt.compatibility, auditNote: 'independently altered' } }],
    ]
    for (const [field, change] of receiptDivergences) {
      const diverged = JSON.parse(serializePersistedLibraryBackedSite(persisted)) as typeof persisted
      diverged.libraryReceipt = { ...diverged.libraryReceipt, ...change }
      const { integrityChecksum: _divergedChecksum, ...divergedPayload } = diverged
      diverged.integrityChecksum = canonicalJsonChecksum(divergedPayload)
      expect(() => deserializePersistedLibraryBackedSite(JSON.stringify(diverged)), field).toThrow(/canonically and completely bound|same receipt/)
    }

    const fabricatedReadback = JSON.parse(serializePersistedLibraryBackedSite(persisted)) as typeof persisted
    fabricatedReadback.libraryConsumption.entry = { ...fabricatedReadback.libraryConsumption.entry, summary: 'fabricated entry' }
    fabricatedReadback.libraryConsumption.receipt = {
      ...fabricatedReadback.libraryConsumption.receipt,
      entryChecksum: canonicalJsonChecksum(fabricatedReadback.libraryConsumption.entry),
    }
    fabricatedReadback.libraryConsumption.verification = {
      ...fabricatedReadback.libraryConsumption.verification,
      entryChecksum: fabricatedReadback.libraryConsumption.receipt.entryChecksum,
    }
    fabricatedReadback.libraryReceipt = fabricatedReadback.libraryConsumption.receipt
    fabricatedReadback.siteSpec.libraryReceipt = fabricatedReadback.libraryReceipt
    fabricatedReadback.manifest.libraryReceipt = fabricatedReadback.libraryReceipt
    fabricatedReadback.siteSpec.libraryConsumption = fabricatedReadback.libraryConsumption
    fabricatedReadback.manifest.libraryConsumption = fabricatedReadback.libraryConsumption
    const { integrityChecksum: _fabricatedChecksum, ...fabricatedPayload } = fabricatedReadback
    fabricatedReadback.integrityChecksum = canonicalJsonChecksum(fabricatedPayload)
    expect(() => deserializePersistedLibraryBackedSite(JSON.stringify(fabricatedReadback))).toThrow(/source-owned W1-05 offline authority|immutable authority/)
  })

  it('keeps Architect candidates proposal-only and cannot replace an approved canonical row', () => {
    const candidate = { ...fixtureEntry, status: 'candidate' as const }
    expect(() => submitArchitectCandidate({ catalogReference, candidate })).toThrow(/cannot replace approved/)
    const proposal = submitArchitectCandidate({ catalogReference, candidate: { ...candidate, entryId: 'marketing-smb-v2' }, submittedAt: '2026-08-04T00:02:00.000Z' })
    expect(proposal.candidate.entryId).toBe('marketing-smb-v2')
    expect(catalogReference.catalog?.entries[0].status).toBe('approved')
  })
})

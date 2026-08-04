import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  LINKSITES_LIBRARY_CONSUMER,
  LINKLIBRARIES_REPOSITORY,
  consumePinnedLibraryEntry,
  submitArchitectCandidate,
  type LibraryArtifactSource,
  type LibraryCatalog,
  type LibraryCompatibilityRequest,
  type LibraryEntryContract,
  type LibraryEntryFetch,
  type PinnedLibraryCatalogReference,
} from '../src/libraryConsumer.js'
import { assembleSiteManifest } from '../src/siteAssemblyManifest.js'
import { buildSeededComponentRegistry } from '../src/componentRegistry.js'
import { resolveSiteDesignProfile, type StyleFamily } from '../src/designCatalog.js'
import { HOME_SERVICES_KIT } from '../src/verticalKit.js'
import { TIER_SPECIFICATIONS } from '../src/tierSpecification.js'
import { resolveSiteSpecification } from '../src/siteSpecification.js'
import type { ReusableSiteFoundation } from '../src/reusableFoundation.js'

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
const compatibility: LibraryCompatibilityRequest = {
  nodeMajor: 20,
  runtimeMajors: { next: 16, react: 19 },
  contentSchema: { major: 1, minor: 0 },
}

function buildSource(overrides: Partial<LibraryEntryFetch> = {}): LibraryArtifactSource {
  const entry = overrides.entry ?? { ...fixtureEntry }
  return {
    fetchEntry: ({ entryId, commitSha }) => ({
      commitSha,
      entry: { ...entry, entryId },
      files: fixtureFiles,
      ...overrides,
    }),
  }
}

describe('W1-05 LiNKlibraries consumer', () => {
  it('resolves an approved offline entry, verifies assets, and records exact SHA receipt', async () => {
    const consumption = await consumePinnedLibraryEntry({
      catalogReference,
      entryId: 'marketing-smb-v1',
      compatibility,
      source: buildSource(),
      recordedAt: '2026-08-04T00:01:00.000Z',
    })

    expect(consumption.entry.entryId).toBe('marketing-smb-v1')
    expect(consumption.files['assets/marketingSmbV1.ts']).toContain('export const marketingSmbV1LibraryAsset')
    expect(consumption.receipt).toMatchObject({
      consumer: LINKSITES_LIBRARY_CONSUMER,
      entryId: 'marketing-smb-v1',
      entryVersion: '1.0.0',
      catalogCommitSha: COMMIT_SHA,
      libraryCommitSha: COMMIT_SHA,
      recordedAt: '2026-08-04T00:01:00.000Z',
    })
    expect(consumption.receipt.assetChecksums).toEqual({
      'README.md': sha256(fixtureFiles['README.md']),
      'assets/marketingSmbV1.ts': sha256(fixtureFiles['assets/marketingSmbV1.ts']),
      'tests/marketingSmbV1.fixture.ts': sha256(fixtureFiles['tests/marketingSmbV1.fixture.ts']),
    })
  })

  it('rejects a moving branch or tag reference', async () => {
    await expect(consumePinnedLibraryEntry({
      catalogReference: { ...catalogReference, ref: 'development' },
      entryId: 'marketing-smb-v1',
      compatibility,
      source: buildSource(),
    })).rejects.toThrow(/Library ref/)

    await expect(consumePinnedLibraryEntry({
      catalogReference: { ...catalogReference, ref: '2'.repeat(40) },
      entryId: 'marketing-smb-v1',
      compatibility,
      source: buildSource(),
    })).rejects.toThrow(/exact catalog commit SHA/)
  })

  it('rejects an entry fetched from a different commit', async () => {
    await expect(consumePinnedLibraryEntry({
      catalogReference,
      entryId: 'marketing-smb-v1',
      compatibility,
      source: { fetchEntry: () => ({ commitSha: '2'.repeat(40), entry: fixtureEntry, files: fixtureFiles }) },
    })).rejects.toThrow(/different commit/)
  })

  it('rejects incompatible runtime and content-schema requirements', async () => {
    await expect(consumePinnedLibraryEntry({
      catalogReference,
      entryId: 'marketing-smb-v1',
      compatibility: { ...compatibility, runtimeMajors: { next: 15, react: 19 } },
      source: buildSource(),
    })).rejects.toThrow(/incompatible with runtime next/)

    await expect(consumePinnedLibraryEntry({
      catalogReference,
      entryId: 'marketing-smb-v1',
      compatibility: { ...compatibility, contentSchema: { major: 2, minor: 0 } },
      source: buildSource(),
    })).rejects.toThrow(/requires content schema/)
  })

  it('rejects metadata-only, missing-asset, and checksum-mismatch entries', async () => {
    await expect(consumePinnedLibraryEntry({
      catalogReference,
      entryId: 'marketing-smb-v1',
      compatibility,
      source: buildSource({
        entry: { ...fixtureEntry, files: fixtureEntry.files.filter(({ path }) => path === 'README.md') },
      }),
    })).rejects.toThrow(/metadata-only or missing-asset/)

    await expect(consumePinnedLibraryEntry({
      catalogReference,
      entryId: 'marketing-smb-v1',
      compatibility,
      source: buildSource({ files: { ...fixtureFiles, 'assets/marketingSmbV1.ts': undefined as unknown as string } }),
    })).rejects.toThrow(/missing asset/)

    await expect(consumePinnedLibraryEntry({
      catalogReference,
      entryId: 'marketing-smb-v1',
      compatibility,
      source: buildSource({ files: { ...fixtureFiles, 'assets/marketingSmbV1.ts': 'tampered' } }),
    })).rejects.toThrow(/failed SHA-256/)

    await expect(consumePinnedLibraryEntry({
      catalogReference,
      entryId: 'marketing-smb-v1',
      compatibility,
      source: buildSource({ files: { ...fixtureFiles, 'assets/undeclared.ts': 'unexpected' } }),
    })).rejects.toThrow(/undeclared asset/)
  })

  it('rejects a fetched entry whose catalog metadata was substituted', async () => {
    await expect(consumePinnedLibraryEntry({
      catalogReference,
      entryId: 'marketing-smb-v1',
      compatibility,
      source: buildSource({ entry: { ...fixtureEntry, summary: 'substituted metadata' } }),
    })).rejects.toThrow(/does not match the pinned catalog/)
  })

  it('persists the verified receipt through Site Specification and Assembly Manifest', async () => {
    const consumption = await consumePinnedLibraryEntry({ catalogReference, entryId: 'marketing-smb-v1', compatibility, source: buildSource() })
    const foundation: ReusableSiteFoundation = {
      schemaVersion: { major: 1, minor: 0 },
      foundationId: 'foundation-library-backed',
      displayName: 'Library-backed foundation',
      status: 'active',
      kitId: 'home_services',
      tierId: 'standard',
      platformReleaseRef: 'release-1',
      assemblyManifestRef: 'manifest-1',
      createdAt: '2026-08-04T00:00:00.000Z',
    }
    const style: StyleFamily = {
      schemaVersion: { major: 1, minor: 0 },
      styleId: 'style-library-backed',
      displayName: 'Library-backed style',
      status: 'active',
      accessibilityContrastPassed: true,
      baseTokens: { 'color.primary': '#0ea5e9' },
      fontPairing: { headingFont: 'Inter', bodyFont: 'Inter' },
    }
    const siteSpec = resolveSiteSpecification({
      siteSpecId: 'sitespec-library-backed',
      siteRef: 'site-library-backed',
      kit: { ...HOME_SERVICES_KIT, status: 'active' },
      tier: TIER_SPECIFICATIONS.standard,
      foundation,
      designProfile: resolveSiteDesignProfile('site-library-backed', style),
      componentRegistry: buildSeededComponentRegistry(),
      selectedComponentIds: ['SignupHero', 'CTASection'],
      pageCount: 5,
      libraryReceipt: consumption.receipt,
    })
    const manifest = assembleSiteManifest({
      manifestId: 'manifest-library-backed',
      manifestVersion: 1,
      siteId: 'site-library-backed',
      siteClass: 'foundation',
      siteSpec,
      kit: { ...HOME_SERVICES_KIT, status: 'active' },
      componentRegistry: buildSeededComponentRegistry(),
      platformReleaseRef: 'release-1',
      pagePlan: [{ route: '/', pageType: 'home', componentIds: ['SignupHero', 'CTASection'] }],
    })

    expect(siteSpec.libraryReceipt).toEqual(consumption.receipt)
    expect(manifest.libraryReceipt).toEqual(consumption.receipt)
  })

  it('keeps Architect candidates proposal-only and cannot replace approved canonical assets', async () => {
    const candidate = { ...fixtureEntry, status: 'candidate' as const }
    expect(() => submitArchitectCandidate({ catalogReference, candidate })).toThrow(/cannot replace approved/)

    const newCandidate = { ...candidate, entryId: 'marketing-smb-v2' }
    const proposal = submitArchitectCandidate({ catalogReference, candidate: newCandidate, submittedAt: '2026-08-04T00:02:00.000Z' })
    expect(proposal.candidate.entryId).toBe('marketing-smb-v2')
    expect(catalogReference.catalog.entries[0].status).toBe('approved')
  })
})

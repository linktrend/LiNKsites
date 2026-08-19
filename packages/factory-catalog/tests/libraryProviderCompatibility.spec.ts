import { describe, expect, it } from 'vitest'
import { providerBaseline, ProviderBaselineError } from '@linksites/types'
import {
  bindCurrentLibrariesBaseline,
  classifyMasterTemplateSelectability,
  currentLibrariesBaseline,
  libraryLaneHandoff,
  OBSOLETE_LIBRARIES_PIN,
  pageLibrarySummaries,
  PR_180_OWNED_LIBRARY_CLIENT,
} from '../src/libraryProviderCompatibility.js'

describe('LiNKlibraries compatibility seam', () => {
  it('pins the current LiNKlibraries identity without owning the PR 180 client', () => {
    const baseline = currentLibrariesBaseline()
    expect(baseline.commit).toBe('4cbe7fb174aba4b159d6c37ba1ef65fd3221510f')
    expect(baseline.tree).toBe('60e582fbd1ce988538b650c99878e700c6cfa0d2')
    expect(baseline.schemaVersion).toBe(2)
    expect(baseline.schemaRevision).toBe(2)
    expect(baseline.catalogueRecordsSha256).toBe(
      '03b52875dd3c2fcf5c8fa056560fd77e0986aca04ba69bd11ebf28c866b97f2c',
    )
    const handoff = libraryLaneHandoff()
    expect(handoff.status).toBe('pending_pr_180_integration')
    expect(handoff.prerequisite).toBe('pr-180')
    expect(handoff.ownedClientPath).toBe(PR_180_OWNED_LIBRARY_CLIENT)
    expect(handoff.providerBaseline).toEqual(baseline)
  })

  it('keeps draft, non-selectable, and unknown master templates unselected', () => {
    expect(classifyMasterTemplateSelectability('draft')).toBe('not_selectable')
    expect(classifyMasterTemplateSelectability('non-selectable')).toBe('not_selectable')
    expect(classifyMasterTemplateSelectability('unknown')).toBe('not_selectable')
    expect(() => classifyMasterTemplateSelectability('approved')).toThrow(/unexpectedSelectability/)
  })

  it('fails closed on the obsolete Issue 127 / PR 180 library pin', () => {
    expect(() =>
      bindCurrentLibrariesBaseline({
        ...providerBaseline('libraries'),
        ...OBSOLETE_LIBRARIES_PIN,
        provider: 'libraries',
        schemaVersion: 2,
        schemaRevision: 2,
        cataloguePath: 'indexes/v2/catalog.json',
        schemaPath: 'schemas/v2',
      }),
    ).toThrow(ProviderBaselineError)
  })

  it('pages compact summaries and rejects oversized or unauthorized dumps', () => {
    const records = Array.from({ length: 10 }, (_, index) => ({ entryId: `entry-${index}` }))
    const page = pageLibrarySummaries(providerBaseline('libraries'), records, 0, 8)
    expect(page.records).toHaveLength(8)
    expect(page.nextOffset).toBe(8)
    expect(() => pageLibrarySummaries(providerBaseline('libraries'), records, 0, 9)).toThrow(
      /invalidPage/,
    )
    expect(() =>
      pageLibrarySummaries(
        providerBaseline('libraries'),
        Array.from({ length: 33 }, (_, index) => ({ entryId: `entry-${index}` })),
      ),
    ).toThrow(/oversizedOrAmbiguousCatalogue/)
  })
})

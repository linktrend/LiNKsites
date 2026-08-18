/**
 * LiNKlibraries compatibility seam for Item 5.
 *
 * Live revision-2 catalogue/materialization remains owned by PR #180 at
 * `packages/factory-catalog/src/libraryProviderClient.ts`. This module only
 * binds the current provider identity, keeps the master template
 * draft/non-selectable/unknown, and fails closed on stale or oversized
 * discovery. It does not duplicate the PR #180 client.
 */
import { bindProviderBaseline, providerBaseline, type LibrariesBaseline } from '@linksites/types'

export const LIBRARY_LANE_PREREQUISITE = 'pr-180' as const
export const LIBRARY_LANE_STATUS = 'pending_pr_180_integration' as const
export const PR_180_OWNED_LIBRARY_CLIENT = 'packages/factory-catalog/src/libraryProviderClient.ts' as const

export const OBSOLETE_LIBRARIES_PIN = Object.freeze({
  commit: 'b2d2bbb035c6e6a3f859480ce57f12e0882dd3f0',
  tree: '2701e6a190468f437102946425a64e890eed6690',
  catalogueRecordsSha256: 'e1659929c19176227b8349c532f2b6744b6c130e035351d1bc89fb30fa39ad77',
})

export type MasterTemplateSelectability = 'draft' | 'non-selectable' | 'unknown'
export type LibraryDiscoveryPage = {
  readonly providerBaseline: LibrariesBaseline
  readonly records: readonly unknown[]
  readonly nextOffset: number | null
}

export class LibraryProviderCompatibilityError extends Error {
  readonly code = 'library_provider_compatibility_rejected' as const
  constructor(readonly reason: string) {
    super(`LiNKlibraries compatibility rejected: ${reason}`)
    this.name = 'LibraryProviderCompatibilityError'
  }
}

export function currentLibrariesBaseline(): LibrariesBaseline {
  return providerBaseline('libraries')
}

export function bindCurrentLibrariesBaseline(candidate: unknown): LibrariesBaseline {
  return bindProviderBaseline('libraries', candidate)
}

export function classifyMasterTemplateSelectability(
  status: MasterTemplateSelectability | string,
): 'not_selectable' {
  if (status === 'draft' || status === 'non-selectable' || status === 'unknown') {
    return 'not_selectable'
  }
  throw new LibraryProviderCompatibilityError('unexpectedSelectability')
}

export function pageLibrarySummaries(
  candidate: unknown,
  records: readonly unknown[],
  offset = 0,
  limit = 8,
): LibraryDiscoveryPage {
  const provider = bindCurrentLibrariesBaseline(candidate)
  if (!Number.isInteger(offset) || offset < 0 || !Number.isInteger(limit) || limit < 1 || limit > 8) {
    throw new LibraryProviderCompatibilityError('invalidPage')
  }
  if (!Array.isArray(records) || records.length > 32) {
    throw new LibraryProviderCompatibilityError('oversizedOrAmbiguousCatalogue')
  }
  const page = records.slice(offset, offset + limit)
  return {
    providerBaseline: provider,
    records: page,
    nextOffset: offset + limit < records.length ? offset + limit : null,
  }
}

export function libraryLaneHandoff(): {
  readonly status: typeof LIBRARY_LANE_STATUS
  readonly prerequisite: typeof LIBRARY_LANE_PREREQUISITE
  readonly ownedClientPath: typeof PR_180_OWNED_LIBRARY_CLIENT
  readonly providerBaseline: LibrariesBaseline
} {
  return {
    status: LIBRARY_LANE_STATUS,
    prerequisite: LIBRARY_LANE_PREREQUISITE,
    ownedClientPath: PR_180_OWNED_LIBRARY_CLIENT,
    providerBaseline: currentLibrariesBaseline(),
  }
}

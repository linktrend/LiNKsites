/**
 * Owned persistence representation for a library-backed Site Specification
 * and Assembly Manifest. This is JSON-safe and verifies the receipt binding
 * after a durable write/read round trip; it is not a deployment or CMS store.
 */

import type { SchemaVersion } from '@linksites/types'
import type { SiteAssemblyManifest } from './siteAssemblyManifest.js'
import type { SiteSpecification } from './siteSpecification.js'
import {
  assertLibraryConsumptionReceipt,
  canonicalJsonChecksum,
  canonicalJsonStringify,
  type LibraryConsumptionReceipt,
} from './libraryConsumer.js'

export interface PersistedLibraryBackedSite {
  schemaVersion: SchemaVersion
  siteSpec: SiteSpecification
  manifest: SiteAssemblyManifest
  libraryReceipt: LibraryConsumptionReceipt
  integrityChecksum: string
}

export class LibraryPersistenceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LibraryPersistenceError'
  }
}

function payloadOf(record: Omit<PersistedLibraryBackedSite, 'integrityChecksum'>): Omit<PersistedLibraryBackedSite, 'integrityChecksum'> {
  return record
}

function assertBound(record: Omit<PersistedLibraryBackedSite, 'integrityChecksum'>): void {
  assertLibraryConsumptionReceipt(record.libraryReceipt)
  if (record.siteSpec.libraryEntryId !== record.libraryReceipt.entryId || record.manifest.libraryEntryId !== record.libraryReceipt.entryId) {
    throw new LibraryPersistenceError('Library-backed site persistence is not bound to the selected entry ID.')
  }
  if (canonicalJsonStringify(record.siteSpec.libraryReceipt) !== canonicalJsonStringify(record.libraryReceipt) || canonicalJsonStringify(record.manifest.libraryReceipt) !== canonicalJsonStringify(record.libraryReceipt)) {
    throw new LibraryPersistenceError('Library-backed Site Specification and Assembly Manifest do not carry the same receipt.')
  }
}

export function createPersistedLibraryBackedSite(input: {
  siteSpec: SiteSpecification
  manifest: SiteAssemblyManifest
}): PersistedLibraryBackedSite {
  if (!input.siteSpec.libraryReceipt || !input.manifest.libraryReceipt || !input.siteSpec.libraryEntryId || !input.manifest.libraryEntryId) {
    throw new LibraryPersistenceError('A library-backed site must persist a receipt and selected entry ID on both site records.')
  }
  const base = {
    schemaVersion: { major: 1, minor: 0 },
    siteSpec: input.siteSpec,
    manifest: input.manifest,
    libraryReceipt: input.siteSpec.libraryReceipt,
  } satisfies Omit<PersistedLibraryBackedSite, 'integrityChecksum'>
  assertBound(base)
  return { ...base, integrityChecksum: canonicalJsonChecksum(payloadOf(base)) }
}

export function serializePersistedLibraryBackedSite(record: PersistedLibraryBackedSite): string {
  assertPersistedLibraryBackedSite(record)
  return canonicalJsonStringify(record)
}

export function deserializePersistedLibraryBackedSite(serialized: string): PersistedLibraryBackedSite {
  let parsed: unknown
  try {
    parsed = JSON.parse(serialized)
  } catch {
    throw new LibraryPersistenceError('Persisted library-backed site is not valid JSON.')
  }
  assertPersistedLibraryBackedSite(parsed)
  return parsed
}

export function assertPersistedLibraryBackedSite(value: unknown): asserts value is PersistedLibraryBackedSite {
  if (!value || typeof value !== 'object') throw new LibraryPersistenceError('Persisted library-backed site must be an object.')
  const record = value as Partial<PersistedLibraryBackedSite>
  if (!record.schemaVersion || record.schemaVersion.major !== 1 || record.schemaVersion.minor !== 0 || !record.siteSpec || !record.manifest || !record.libraryReceipt || typeof record.integrityChecksum !== 'string') throw new LibraryPersistenceError('Persisted library-backed site has an invalid shape.')
  const base = {
    schemaVersion: record.schemaVersion,
    siteSpec: record.siteSpec,
    manifest: record.manifest,
    libraryReceipt: record.libraryReceipt,
  } as Omit<PersistedLibraryBackedSite, 'integrityChecksum'>
  assertBound(base)
  if (record.integrityChecksum !== canonicalJsonChecksum(payloadOf(base))) throw new LibraryPersistenceError('Persisted library-backed site integrity checksum mismatch.')
}

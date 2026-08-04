/**
 * Owned persistence representation for a library-backed Site Specification
 * and Assembly Manifest. This is JSON-safe and verifies the receipt binding
 * after a durable write/read round trip; it is not a deployment or CMS store.
 */

import type { SchemaVersion } from '@linksites/types'
import type { SiteAssemblyManifest } from './siteAssemblyManifest.js'
import type { SiteSpecification } from './siteSpecification.js'
import {
  assertLibraryConsumptionEvidence,
  assertLibraryConsumptionReceipt,
  canonicalJsonChecksum,
  canonicalJsonStringify,
  type LibraryConsumption,
  type LibraryConsumptionReceipt,
} from './libraryConsumer.js'

export interface PersistedLibraryBackedSite {
  schemaVersion: SchemaVersion
  siteSpec: SiteSpecification
  manifest: SiteAssemblyManifest
  libraryConsumption: LibraryConsumption
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
  assertLibraryConsumptionEvidence(record.libraryConsumption)
  assertLibraryConsumptionReceipt(record.libraryReceipt)
  if (record.libraryConsumption.receipt.receiptId !== record.libraryReceipt.receiptId || record.libraryConsumption.receipt.entryChecksum !== record.libraryReceipt.entryChecksum) {
    throw new LibraryPersistenceError('Persisted library-backed site receipt is not the receipt from the materialized consumption evidence.')
  }
  if (record.siteSpec.libraryEntryId !== record.libraryReceipt.entryId || record.manifest.libraryEntryId !== record.libraryReceipt.entryId || !record.siteSpec.libraryConsumption || !record.manifest.libraryConsumption) {
    throw new LibraryPersistenceError('Library-backed site persistence is not bound to the selected entry ID.')
  }
  if (canonicalJsonStringify(record.siteSpec.libraryReceipt) !== canonicalJsonStringify(record.libraryReceipt) || canonicalJsonStringify(record.manifest.libraryReceipt) !== canonicalJsonStringify(record.libraryReceipt) || canonicalJsonStringify(record.siteSpec.libraryConsumption) !== canonicalJsonStringify(record.libraryConsumption) || canonicalJsonStringify(record.manifest.libraryConsumption) !== canonicalJsonStringify(record.libraryConsumption)) {
    throw new LibraryPersistenceError('Library-backed Site Specification and Assembly Manifest do not carry the same receipt.')
  }
}

export function createPersistedLibraryBackedSite(input: {
  siteSpec: SiteSpecification
  manifest: SiteAssemblyManifest
}): PersistedLibraryBackedSite {
  if (!input.siteSpec.libraryReceipt || !input.manifest.libraryReceipt || !input.siteSpec.libraryEntryId || !input.manifest.libraryEntryId || !input.siteSpec.libraryConsumption || !input.manifest.libraryConsumption) {
    throw new LibraryPersistenceError('A library-backed site must persist trusted materialized consumption, receipt, and selected entry ID on both site records.')
  }
  const base = {
    schemaVersion: { major: 1, minor: 0 },
    siteSpec: input.siteSpec,
    manifest: input.manifest,
    libraryConsumption: input.siteSpec.libraryConsumption,
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
  if (!record.schemaVersion || record.schemaVersion.major !== 1 || record.schemaVersion.minor !== 0 || !record.siteSpec || !record.manifest || !record.libraryConsumption || !record.libraryReceipt || typeof record.integrityChecksum !== 'string') throw new LibraryPersistenceError('Persisted library-backed site has an invalid shape.')
  const base = {
    schemaVersion: record.schemaVersion,
    siteSpec: record.siteSpec,
    manifest: record.manifest,
    libraryConsumption: record.libraryConsumption,
    libraryReceipt: record.libraryReceipt,
  } as Omit<PersistedLibraryBackedSite, 'integrityChecksum'>
  assertBound(base)
  if (record.integrityChecksum !== canonicalJsonChecksum(payloadOf(base))) throw new LibraryPersistenceError('Persisted library-backed site integrity checksum mismatch.')
}

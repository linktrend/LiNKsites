/**
 * Owned persistence representation for a library-backed Site Specification
 * and Assembly Manifest. This is JSON-safe and verifies the receipt binding
 * after a durable write/read round trip; it is not a deployment or CMS store.
 */

import type { SchemaVersion } from '@linksites/types'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { SiteAssemblyManifest } from './siteAssemblyManifest'
import type { SiteSpecification } from './siteSpecification'
import {
  assertLibraryConsumptionEvidence,
  assertLibraryConsumptionReceipt,
  assertLibraryVerificationRecord,
  canonicalJsonChecksum,
  canonicalJsonStringify,
  type LibraryConsumption,
  type LibraryConsumptionReceipt,
  type LibraryVerificationRecord,
} from './libraryConsumer'

export interface PersistedLibraryBackedSite {
  schemaVersion: SchemaVersion
  siteSpec: SiteSpecification
  manifest: SiteAssemblyManifest
  libraryConsumption: LibraryConsumption
  libraryReceipt: LibraryConsumptionReceipt
  libraryVerification: LibraryVerificationRecord
  integrityChecksum: string
}

export class LibraryPersistenceError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LibraryPersistenceError'
  }
}

/** LiNKsites-owned persistence boundary; implementations do not require an external service. */
export interface FactoryCatalogPersistence {
  writeLibraryBackedSite(record: PersistedLibraryBackedSite): Promise<void>
  readLibraryBackedSite(siteRef: string): Promise<PersistedLibraryBackedSite | null>
}

interface DurableFactoryCatalogRecord {
  storageSchemaVersion: 1
  siteRef: string
  record: PersistedLibraryBackedSite
}

const durableStorageSchemaVersion = 1 as const

function storageKey(siteRef: string): string {
  if (typeof siteRef !== 'string' || siteRef.trim() === '') throw new LibraryPersistenceError('Factory Catalog persistence requires a non-empty siteRef.')
  return canonicalJsonChecksum(siteRef)
}

/**
 * A real local durable representation for the Factory Catalog. Each record is
 * stored as canonical JSON under a content-derived filename and atomically
 * replaced, then fully revalidated on read. This is fixture/local persistence,
 * not a live database, hosted catalog, or LiNKlibraries integration.
 */
export function createFileFactoryCatalogPersistence(directory: string): FactoryCatalogPersistence {
  if (typeof directory !== 'string' || directory.trim() === '') throw new LibraryPersistenceError('Factory Catalog persistence requires a storage directory.')
  const recordPath = (siteRef: string): string => join(directory, `${storageKey(siteRef)}.json`)

  return {
    async writeLibraryBackedSite(record) {
      assertPersistedLibraryBackedSite(record)
      const path = recordPath(record.siteSpec.siteRef)
      const durable: DurableFactoryCatalogRecord = {
        storageSchemaVersion: durableStorageSchemaVersion,
        siteRef: record.siteSpec.siteRef,
        record,
      }
      await mkdir(directory, { recursive: true })
      const temporaryPath = `${path}.tmp-${process.pid}`
      await writeFile(temporaryPath, canonicalJsonStringify(durable), 'utf8')
      await rename(temporaryPath, path)
    },

    async readLibraryBackedSite(siteRef) {
      const path = recordPath(siteRef)
      let serialized: string
      try {
        serialized = await readFile(path, 'utf8')
      } catch (error) {
        if (isNodeError(error) && error.code === 'ENOENT') return null
        throw new LibraryPersistenceError(`Factory Catalog durable read failed for siteRef "${siteRef}".`)
      }
      let durable: unknown
      try {
        durable = JSON.parse(serialized)
      } catch {
        throw new LibraryPersistenceError(`Factory Catalog durable record for siteRef "${siteRef}" is not valid JSON.`)
      }
      if (!durable || typeof durable !== 'object') throw new LibraryPersistenceError('Factory Catalog durable record must be an object.')
      const parsed = durable as Partial<DurableFactoryCatalogRecord>
      if (parsed.storageSchemaVersion !== durableStorageSchemaVersion || parsed.siteRef !== siteRef || !parsed.record) throw new LibraryPersistenceError('Factory Catalog durable record has an invalid storage envelope.')
      assertPersistedLibraryBackedSite(parsed.record)
      if (parsed.record.siteSpec.siteRef !== siteRef) throw new LibraryPersistenceError('Factory Catalog durable record siteRef does not match its persisted Site Specification.')
      return parsed.record
    },
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error
}

/** Rehydrates only through the owned durable persistence interface. */
export async function rehydratePersistedLibraryBackedSite(
  persistence: FactoryCatalogPersistence,
  siteRef: string,
): Promise<PersistedLibraryBackedSite> {
  if (!persistence || typeof persistence.readLibraryBackedSite !== 'function') throw new LibraryPersistenceError('Factory Catalog rehydration requires its owned persistence interface.')
  const record = await persistence.readLibraryBackedSite(siteRef)
  if (!record) throw new LibraryPersistenceError(`No durable Factory Catalog record exists for siteRef "${siteRef}".`)
  assertPersistedLibraryBackedSite(record)
  if (record.siteSpec.siteRef !== siteRef) throw new LibraryPersistenceError('Rehydrated Factory Catalog record is bound to a different siteRef.')
  return record
}

function payloadOf(record: Omit<PersistedLibraryBackedSite, 'integrityChecksum'>): Omit<PersistedLibraryBackedSite, 'integrityChecksum'> {
  return record
}

function assertBound(record: Omit<PersistedLibraryBackedSite, 'integrityChecksum'>): void {
  assertLibraryConsumptionEvidence(record.libraryConsumption)
  assertLibraryConsumptionReceipt(record.libraryReceipt)
  assertLibraryVerificationRecord(record.libraryVerification)
  if (canonicalJsonStringify(record.libraryConsumption.receipt) !== canonicalJsonStringify(record.libraryReceipt) || canonicalJsonStringify(record.libraryConsumption.verification) !== canonicalJsonStringify(record.libraryVerification)) {
    throw new LibraryPersistenceError('Persisted library-backed site receipt is not canonically and completely bound to the materialized consumption evidence.')
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
    libraryVerification: input.siteSpec.libraryConsumption.verification,
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
  if (!record.schemaVersion || record.schemaVersion.major !== 1 || record.schemaVersion.minor !== 0 || !record.siteSpec || !record.manifest || !record.libraryConsumption || !record.libraryReceipt || !record.libraryVerification || typeof record.integrityChecksum !== 'string') throw new LibraryPersistenceError('Persisted library-backed site has an invalid shape.')
  const base = {
    schemaVersion: record.schemaVersion,
    siteSpec: record.siteSpec,
    manifest: record.manifest,
    libraryConsumption: record.libraryConsumption,
    libraryReceipt: record.libraryReceipt,
    libraryVerification: record.libraryVerification,
  } as Omit<PersistedLibraryBackedSite, 'integrityChecksum'>
  assertBound(base)
  if (record.integrityChecksum !== canonicalJsonChecksum(payloadOf(base))) throw new LibraryPersistenceError('Persisted library-backed site integrity checksum mismatch.')
}

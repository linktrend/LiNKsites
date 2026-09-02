import { canonicalJsonChecksum } from './libraryConsumer.ts'

export const SITE_TRANSFER_SCHEMA_VERSION = '1.0.0' as const
export const SITE_TRANSFER_DIGEST_ALGORITHM = 'sha256' as const

export interface SiteTransferRecord {
  kind: string
  id: string
  value: unknown
}

export interface SiteTransferManifestEntry {
  kind: string
  id: string
  digest: string
}

export interface SiteTransferManifest {
  schemaVersion: typeof SITE_TRANSFER_SCHEMA_VERSION
  digestAlgorithm: typeof SITE_TRANSFER_DIGEST_ALGORITHM
  siteId: string
  entries: SiteTransferManifestEntry[]
  bundleDigest: string
}

export interface SiteTransferBundle {
  manifest: SiteTransferManifest
  records: SiteTransferRecord[]
}

export class SiteTransferError extends Error {
  readonly code: 'MANIFEST_INVALID' | 'DIGEST_MISMATCH'

  constructor(code: SiteTransferError['code'], message: string) {
    super(message)
    this.name = 'SiteTransferError'
    this.code = code
  }
}

const SHA256 = /^[a-f0-9]{64}$/
const IDENTIFIER = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/
const exactKeys = (value: object, expected: string[]): boolean => {
  const actual = Object.keys(value).sort()
  return actual.length === expected.length && actual.every((key, index) => key === [...expected].sort()[index])
}
const recordKey = (record: Pick<SiteTransferRecord, 'kind' | 'id'>): string => `${record.kind}\u0000${record.id}`
const entryDigest = (record: SiteTransferRecord): string => canonicalJsonChecksum(record)
const manifestPayload = (manifest: Omit<SiteTransferManifest, 'bundleDigest'>): unknown => manifest

function assertIdentifier(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || !IDENTIFIER.test(value)) {
    throw new SiteTransferError('MANIFEST_INVALID', `${label} is not a portable identifier.`)
  }
}

function assertRecord(value: unknown, index: number): asserts value is SiteTransferRecord {
  if (typeof value !== 'object' || value === null || Array.isArray(value) || !exactKeys(value, ['id', 'kind', 'value'])) {
    throw new SiteTransferError('MANIFEST_INVALID', `Record ${index} does not conform to the transfer schema.`)
  }
  const record = value as Record<string, unknown>
  assertIdentifier(record.kind, `Record ${index} kind`)
  assertIdentifier(record.id, `Record ${index} id`)
}

/** Produces a deterministic, self-verifying logical site bundle without contacting live services. */
export function exportSiteBundle(siteId: string, records: readonly SiteTransferRecord[]): SiteTransferBundle {
  assertIdentifier(siteId, 'Site ID')
  records.forEach(assertRecord)
  const ordered = records.map((record) => structuredClone(record))
    .sort((left, right) => recordKey(left).localeCompare(recordKey(right)))
  const keys = ordered.map(recordKey)
  if (new Set(keys).size !== keys.length) {
    throw new SiteTransferError('MANIFEST_INVALID', 'Duplicate record identities are forbidden.')
  }
  const unsigned = {
    schemaVersion: SITE_TRANSFER_SCHEMA_VERSION,
    digestAlgorithm: SITE_TRANSFER_DIGEST_ALGORITHM,
    siteId,
    entries: ordered.map(({ kind, id, value }) => ({ kind, id, digest: entryDigest({ kind, id, value }) })),
  }
  return {
    manifest: { ...unsigned, bundleDigest: canonicalJsonChecksum(manifestPayload(unsigned)) },
    records: ordered,
  }
}

/**
 * Validates the complete bundle before returning any records. Unknown schema shapes,
 * unsupported algorithms, reordering, missing/extra records, and corruption fail closed.
 */
export function importSiteBundle(value: unknown): SiteTransferBundle {
  if (typeof value !== 'object' || value === null || Array.isArray(value) || !exactKeys(value, ['manifest', 'records'])) {
    throw new SiteTransferError('MANIFEST_INVALID', 'Bundle does not conform to the transfer schema.')
  }
  const bundle = value as Record<string, unknown>
  if (typeof bundle.manifest !== 'object' || bundle.manifest === null || Array.isArray(bundle.manifest) ||
      !exactKeys(bundle.manifest, ['bundleDigest', 'digestAlgorithm', 'entries', 'schemaVersion', 'siteId'])) {
    throw new SiteTransferError('MANIFEST_INVALID', 'Manifest does not conform to the transfer schema.')
  }
  const manifest = bundle.manifest as Record<string, unknown>
  if (manifest.schemaVersion !== SITE_TRANSFER_SCHEMA_VERSION || manifest.digestAlgorithm !== SITE_TRANSFER_DIGEST_ALGORITHM) {
    throw new SiteTransferError('MANIFEST_INVALID', 'Unsupported transfer schema version or digest algorithm.')
  }
  assertIdentifier(manifest.siteId, 'Site ID')
  if (!SHA256.test(String(manifest.bundleDigest)) || !Array.isArray(manifest.entries) || !Array.isArray(bundle.records)) {
    throw new SiteTransferError('MANIFEST_INVALID', 'Manifest digest or entry collection is invalid.')
  }
  bundle.records.forEach(assertRecord)
  const seen = new Set<string>()
  manifest.entries.forEach((value, index) => {
    if (typeof value !== 'object' || value === null || Array.isArray(value) || !exactKeys(value, ['digest', 'id', 'kind'])) {
      throw new SiteTransferError('MANIFEST_INVALID', `Manifest entry ${index} is invalid.`)
    }
    const entry = value as Record<string, unknown>
    assertIdentifier(entry.kind, `Manifest entry ${index} kind`)
    assertIdentifier(entry.id, `Manifest entry ${index} id`)
    if (!SHA256.test(String(entry.digest)) || seen.has(`${entry.kind}\u0000${entry.id}`)) {
      throw new SiteTransferError('MANIFEST_INVALID', `Manifest entry ${index} has an invalid digest or duplicate identity.`)
    }
    seen.add(`${entry.kind}\u0000${entry.id}`)
  })

  const typedManifest = manifest as unknown as SiteTransferManifest
  const { bundleDigest, ...unsigned } = typedManifest
  if (canonicalJsonChecksum(manifestPayload(unsigned)) !== bundleDigest) {
    throw new SiteTransferError('DIGEST_MISMATCH', 'Manifest digest verification failed.')
  }
  if (bundle.records.length !== typedManifest.entries.length) {
    throw new SiteTransferError('MANIFEST_INVALID', 'Manifest and record counts differ.')
  }
  for (let index = 0; index < typedManifest.entries.length; index += 1) {
    const entry = typedManifest.entries[index]!
    const record = bundle.records[index]!
    if (recordKey(entry) !== recordKey(record)) {
      throw new SiteTransferError('MANIFEST_INVALID', 'Records are not in manifest order or identities differ.')
    }
    if (entry.digest !== entryDigest(record)) {
      throw new SiteTransferError('DIGEST_MISMATCH', `Record ${entry.kind}/${entry.id} failed digest verification.`)
    }
  }
  return structuredClone({ manifest: typedManifest, records: bundle.records as SiteTransferRecord[] })
}

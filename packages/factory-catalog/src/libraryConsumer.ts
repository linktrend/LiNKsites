/**
 * Governed LiNKlibraries consumption for LiNKsites (W1-05).
 *
 * The entry and catalog types below mirror LiNKlibraries schema version 1.
 * LiNKsites-owned selection and receipt fields deliberately live outside that
 * metadata schema. The transport is also a trust boundary: it must verify
 * the requested Git commit before returning either catalog or entry content.
 */

import { createHash } from 'node:crypto'
import type { GitSha, SchemaVersion } from '@linksites/types'

export const LINKSITES_LIBRARY_CONSUMER = 'linksites' as const
export const LINKLIBRARIES_REPOSITORY = 'https://github.com/linktrend/LiNKlibraries.git'
export const LIBRARY_ENTRY_SCHEMA_VERSION = 1 as const
export const LINKSITES_RUNTIME_REQUIREMENTS = {
  nodeMajor: 20,
  runtimes: ['node', 'browser'],
} as const

export type LibraryEntryKind = 'custom_component' | 'code_pattern' | 'template' | 'starter_kit' | 'vetted_oss'
export type LibraryEntryStatus = 'approved' | 'deprecated'
export type LibraryProvenanceSource = 'ide-development' | 'linkdeveloper' | 'manual' | 'migration'
export type LibraryConsumer = typeof LINKSITES_LIBRARY_CONSUMER

export interface LibraryCatalogEntry {
  entryId: string
  kind: LibraryEntryKind
  name: string
  summary: string
  problemDomains: string[]
  tags: string[]
  languages: string[]
  frameworks: string[]
  status: LibraryEntryStatus
  path: string
}

export interface LibraryCatalog {
  schemaVersion: 1
  generatedAt: string
  sourceCommitSha: string
  entries: LibraryCatalogEntry[]
}

export interface PinnedLibraryCatalogReference {
  repositoryUrl: string
  commitSha: GitSha
  /** A transport ref is admissible only when it repeats the exact commit SHA. */
  ref?: string
  /** Optional caller-side snapshot for proposal checks; consumption always fetches through the trusted transport. */
  catalog?: LibraryCatalog
}

export interface LibraryAsset {
  path: string
  sha256: string
}

/** Exact LiNKlibraries `schemas/library-entry.schema.json` representation. */
export interface LibraryEntryContract {
  schemaVersion: 1
  entryId: string
  kind: LibraryEntryKind
  name: string
  summary: string
  problemDomains: string[]
  tags: string[]
  languages: string[]
  frameworks: string[]
  compatibility: {
    node: string
    runtimes: string[]
    [key: string]: unknown
  }
  license: {
    spdx: string
    redistributionAllowed: boolean
    [key: string]: unknown
  }
  securityReview: {
    reviewedAt: string
    reviewedBy: string
    notes: string
    [key: string]: unknown
  }
  usage: {
    howToUse: string
    examples?: string[]
    [key: string]: unknown
  }
  integrationNotes: string
  gotchas: string[]
  provenance: {
    sourceSystem: LibraryProvenanceSource
    contributedAt: string
    sourceUrl?: string
    versionOrRange?: string
    productRunId?: string
    [key: string]: unknown
  }
  files: LibraryAsset[]
  status: LibraryEntryStatus
}

export interface LibraryEntryFetch {
  /** No echoed SHA is accepted as proof; exactness is established by the transport verifier. */
  entry: LibraryEntryContract
  files: Record<string, string>
}

export interface LibraryExactCommitRequest {
  repositoryUrl: string
  commitSha: GitSha
}

/** No callback-only or self-echo verifier is admissible. */
export interface VerifiedLibraryCommit {
  readonly repositoryUrl: string
  readonly commitSha: GitSha
  readonly readCatalog: () => LibraryCatalog | Promise<LibraryCatalog>
  readonly readEntryAtCommit: (input: { entryId: string; path: string }) => LibraryEntryFetch | Promise<LibraryEntryFetch>
}

/**
 * Trusted Git/artifact boundary. The transport must supply a materialized
 * capability whose catalog and entry reads are bound to one exact commit.
 */
export interface LibraryExactCommitTransport {
  readonly verifiedCommit: VerifiedLibraryCommit
}

export interface LibraryCompatibilityRequest {
  nodeMajor: number
  /** LiNKsites runtime names required by the selected asset, not versions invented in entry metadata. */
  runtimes: string[]
}

export interface LibraryEntrypointSelection {
  /** LiNKsites-owned executable asset selection; the external schema has no exportPath field. */
  entrypoint: string
  testFiles: string[]
}

export interface LibraryCompatibilityResult {
  compatible: true
  consumer: typeof LINKSITES_LIBRARY_CONSUMER
  nodeMajor: number
  runtimes: string[]
}

export interface LibraryConsumptionReceipt {
  schemaVersion: SchemaVersion
  receiptId: string
  consumer: typeof LINKSITES_LIBRARY_CONSUMER
  entryId: string
  catalogCommitSha: GitSha
  libraryCommitSha: GitSha
  entryChecksum: string
  assetChecksums: Record<string, string>
  entrypoint: string
  testFiles: string[]
  compatibility: LibraryCompatibilityResult
  recordedAt: string
}

export interface LibraryConsumption {
  entry: LibraryEntryContract
  files: Record<string, string>
  receipt: LibraryConsumptionReceipt
}

const VERIFIED_COMMIT_BRAND = Symbol('linksites.verified-library-commit')
const TRUSTED_CONSUMPTION_BRAND = Symbol('linksites.trusted-library-consumption')

export type LibraryConsumptionEvidence = LibraryConsumption

export class LibraryConsumerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LibraryConsumerError'
  }
}

const SHA256_PATTERN = /^[a-f0-9]{64}$/
const GIT_SHA_PATTERN = /^[a-f0-9]{40}$/
const ENTRY_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const LIBRARY_ENTRY_KINDS: ReadonlySet<LibraryEntryKind> = new Set([
  'custom_component',
  'code_pattern',
  'template',
  'starter_kit',
  'vetted_oss',
])
/** One local schema descriptor drives the runtime shape checks below. */
export const AUTHORITATIVE_LIBRARY_ENTRY_SCHEMA = Object.freeze({
  topLevelKeys: [
    'schemaVersion', 'entryId', 'kind', 'name', 'summary', 'problemDomains', 'tags', 'languages', 'frameworks',
    'compatibility', 'license', 'securityReview', 'usage', 'integrationNotes', 'gotchas', 'provenance', 'files', 'status',
  ],
  nestedKeys: {
    compatibility: ['node', 'runtimes'],
    license: ['spdx', 'redistributionAllowed'],
    securityReview: ['reviewedAt', 'reviewedBy', 'notes'],
    usage: ['howToUse', 'examples'],
    provenance: ['sourceSystem', 'contributedAt', 'sourceUrl', 'versionOrRange', 'productRunId'],
  },
  vettedOssRequiredProvenance: ['sourceUrl', 'versionOrRange'],
} as const)
const LIBRARY_ENTRY_KEYS = AUTHORITATIVE_LIBRARY_ENTRY_SCHEMA.topLevelKeys
const CATALOG_KEYS = ['schemaVersion', 'generatedAt', 'sourceCommitSha', 'entries']

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isGitSha = (value: unknown): value is GitSha => typeof value === 'string' && GIT_SHA_PATTERN.test(value)

const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex')

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (isRecord(value)) {
    return Object.fromEntries(Object.entries(value).sort(([a], [b]) => a.localeCompare(b)).map(([key, nested]) => [key, canonicalize(nested)]))
  }
  return value
}

function deepFreeze<T>(value: T): T {
  if (isRecord(value) || Array.isArray(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested)
    Object.freeze(value)
  }
  return value
}

export const canonicalJsonStringify = (value: unknown): string => JSON.stringify(canonicalize(value))
export const canonicalJsonChecksum = (value: unknown): string => sha256(canonicalJsonStringify(value))

const assertExactKeys = (value: Record<string, unknown>, keys: readonly string[], label: string): void => {
  const expected = new Set(keys)
  if (Object.keys(value).some((key) => !expected.has(key))) throw new LibraryConsumerError(`${label} contains fields outside the authoritative schema.`)
}

function assertNonEmptyString(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || value.trim() === '') throw new LibraryConsumerError(`${label} must be a non-empty string.`)
}

function assertStringArray(value: unknown, label: string, minItems = 0): asserts value is string[] {
  if (!Array.isArray(value) || value.length < minItems || !value.every((item) => typeof item === 'string' && item.trim() !== '')) {
    throw new LibraryConsumerError(`${label} must be an array of non-empty strings.`)
  }
}

function assertSha(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || !SHA256_PATTERN.test(value)) throw new LibraryConsumerError(`${label} must be a lowercase SHA-256 checksum.`)
}

function assertSafePath(value: unknown, label: string): asserts value is string {
  if (
    typeof value !== 'string' || value.length === 0 || value.includes('\\') || value.includes('\u0000') || value.startsWith('/') ||
    /^[A-Za-z]:/.test(value) || value.split('/').some((segment) => segment.length === 0 || segment === '.' || segment === '..')
  ) throw new LibraryConsumerError(`${label} is not a safe relative asset path.`)
}

const assertNodeRange = (range: unknown, label: string): string => {
  assertNonEmptyString(range, label)
  const tokens = range.trim().split(/\s+/)
  if (tokens.some((token) => !/^(?:>=|<=|>|<|=)?\d+$/.test(token))) {
    throw new LibraryConsumerError(`${label} uses an unsupported or ambiguous compatibility range; refusing to guess.`)
  }
  return range
}

const compareRange = (range: string, major: number): boolean => {
  return range.trim().split(/\s+/).every((token) => {
    const match = token.match(/^(>=|<=|>|<|=)?(\d+)$/)
    if (!match) return false
    const expected = Number(match[2])
    switch (match[1] ?? '=') {
      case '>=': return major >= expected
      case '<=': return major <= expected
      case '>': return major > expected
      case '<': return major < expected
      default: return major === expected
    }
  })
}

function assertCatalogEntryShape(row: unknown): asserts row is LibraryCatalogEntry {
  if (!isRecord(row)) throw new LibraryConsumerError('LiNKlibraries catalog contains a malformed entry row.')
  assertNonEmptyString(row.entryId, 'Catalog entryId')
  if (row.entryId.length < 2 || row.entryId.length > 128 || !ENTRY_ID_PATTERN.test(row.entryId) || !LIBRARY_ENTRY_KINDS.has(row.kind as LibraryEntryKind)) throw new LibraryConsumerError(`Catalog entry "${row.entryId}" has an invalid identity or kind.`)
  for (const field of ['name', 'summary']) assertNonEmptyString(row[field], `Catalog ${field}`)
  for (const field of ['problemDomains', 'tags', 'languages', 'frameworks']) assertStringArray(row[field], `Catalog ${field}`)
  if (row.status !== 'approved' && row.status !== 'deprecated') throw new LibraryConsumerError(`Catalog entry "${row.entryId}" has an invalid status.`)
  if (row.path !== `entries/${row.entryId}`) throw new LibraryConsumerError(`Catalog entry "${row.entryId}" has an invalid path.`)
  assertExactKeys(row, ['entryId', 'kind', 'name', 'summary', 'problemDomains', 'tags', 'languages', 'frameworks', 'status', 'path'], `Catalog entry "${row.entryId}"`)
}

function assertCatalogShape(catalog: unknown): asserts catalog is LibraryCatalog {
  if (!isRecord(catalog)) throw new LibraryConsumerError('LiNKlibraries catalog is not an object.')
  assertExactKeys(catalog, CATALOG_KEYS, 'LiNKlibraries catalog')
  if (catalog.schemaVersion !== LIBRARY_ENTRY_SCHEMA_VERSION) throw new LibraryConsumerError('LiNKlibraries catalog schemaVersion 1 is required.')
  assertNonEmptyString(catalog.generatedAt, 'LiNKlibraries catalog generatedAt')
  if (!isGitSha(catalog.sourceCommitSha)) throw new LibraryConsumerError('LiNKlibraries catalog sourceCommitSha must be a full commit SHA.')
  if (!Array.isArray(catalog.entries)) throw new LibraryConsumerError('LiNKlibraries catalog entries must be an array.')
  const seen = new Set<string>()
  for (const row of catalog.entries) {
    assertCatalogEntryShape(row)
    if (seen.has(row.entryId)) throw new LibraryConsumerError(`LiNKlibraries catalog contains duplicate entryId "${row.entryId}".`)
    seen.add(row.entryId)
  }
}

/**
 * Materializes the capability a trusted offline/Git adapter hands to the
 * consumer. The adapter must perform the real exact-object verification before
 * calling this boundary; the resulting object contains the catalog snapshot
 * and a reader closed over the same exact request.
 */
export function materializeVerifiedLibraryCommit(input: {
  request: LibraryExactCommitRequest
  catalog: LibraryCatalog
  readEntryAtCommit: (input: LibraryExactCommitRequest & { entryId: string; path: string }) => LibraryEntryFetch | Promise<LibraryEntryFetch>
}): VerifiedLibraryCommit {
  validatePinnedCatalogReference({ repositoryUrl: input.request.repositoryUrl, commitSha: input.request.commitSha })
  assertCatalogShape(input.catalog)
  if (input.catalog.sourceCommitSha !== input.request.commitSha) throw new LibraryConsumerError('Verified catalog sourceCommitSha does not bind to the requested exact commit.')
  if (typeof input.readEntryAtCommit !== 'function') throw new LibraryConsumerError('Verified exact-commit capability requires a materialized entry reader.')

  const capability = {
    repositoryUrl: input.request.repositoryUrl,
    commitSha: input.request.commitSha,
    readCatalog: () => input.catalog,
    readEntryAtCommit: (request: { entryId: string; path: string }) => input.readEntryAtCommit({ ...input.request, ...request }),
  }
  Object.defineProperty(capability, VERIFIED_COMMIT_BRAND, { value: true, enumerable: false })
  return Object.freeze(capability) as VerifiedLibraryCommit
}

function isVerifiedLibraryCommit(value: unknown): value is VerifiedLibraryCommit {
  return isRecord(value) && Object.getOwnPropertyDescriptor(value, VERIFIED_COMMIT_BRAND)?.value === true && Object.isFrozen(value) &&
    typeof value.repositoryUrl === 'string' && isGitSha(value.commitSha) &&
    typeof value.readCatalog === 'function' && typeof value.readEntryAtCommit === 'function'
}

export function assertLibraryEntryContract(entry: unknown): asserts entry is LibraryEntryContract {
  if (!isRecord(entry)) throw new LibraryConsumerError('LiNKlibraries returned a malformed entry contract.')
  assertExactKeys(entry, LIBRARY_ENTRY_KEYS, `Entry ${String(entry.entryId)}`)
  if (entry.schemaVersion !== LIBRARY_ENTRY_SCHEMA_VERSION) throw new LibraryConsumerError(`Entry "${String(entry.entryId)}" has an unsupported schemaVersion.`)
  assertNonEmptyString(entry.entryId, 'Entry entryId')
  if (entry.entryId.length < 2 || entry.entryId.length > 128 || !ENTRY_ID_PATTERN.test(entry.entryId) || !LIBRARY_ENTRY_KINDS.has(entry.kind as LibraryEntryKind)) throw new LibraryConsumerError(`Entry "${entry.entryId}" has an invalid identity or kind.`)
  for (const field of ['name', 'summary', 'integrationNotes']) assertNonEmptyString(entry[field], `Entry ${field}`)
  assertStringArray(entry.problemDomains, 'Entry problemDomains', 1)
  for (const field of ['tags', 'languages', 'frameworks', 'gotchas']) assertStringArray(entry[field], `Entry ${field}`)
  if (!isRecord(entry.compatibility)) throw new LibraryConsumerError(`Entry "${entry.entryId}" has malformed compatibility metadata.`)
  assertExactKeys(entry.compatibility, AUTHORITATIVE_LIBRARY_ENTRY_SCHEMA.nestedKeys.compatibility, `Entry "${entry.entryId}" compatibility`)
  assertNodeRange(entry.compatibility.node, `Entry "${entry.entryId}" compatibility.node`)
  assertStringArray(entry.compatibility.runtimes, `Entry "${entry.entryId}" compatibility.runtimes`, 1)
  if (!isRecord(entry.license)) throw new LibraryConsumerError(`Entry "${entry.entryId}" has malformed license metadata.`)
  assertExactKeys(entry.license, AUTHORITATIVE_LIBRARY_ENTRY_SCHEMA.nestedKeys.license, `Entry "${entry.entryId}" license`)
  assertNonEmptyString(entry.license.spdx, `Entry "${entry.entryId}" license.spdx`)
  if (typeof entry.license.redistributionAllowed !== 'boolean') throw new LibraryConsumerError(`Entry "${entry.entryId}" license.redistributionAllowed must be boolean.`)
  if (!isRecord(entry.securityReview)) throw new LibraryConsumerError(`Entry "${entry.entryId}" has malformed security review metadata.`)
  assertExactKeys(entry.securityReview, AUTHORITATIVE_LIBRARY_ENTRY_SCHEMA.nestedKeys.securityReview, `Entry "${entry.entryId}" securityReview`)
  for (const field of ['reviewedAt', 'reviewedBy', 'notes']) assertNonEmptyString(entry.securityReview[field], `Entry ${field}`)
  if (!isRecord(entry.usage)) throw new LibraryConsumerError(`Entry "${entry.entryId}" has malformed usage metadata.`)
  assertExactKeys(entry.usage, AUTHORITATIVE_LIBRARY_ENTRY_SCHEMA.nestedKeys.usage, `Entry "${entry.entryId}" usage`)
  assertNonEmptyString(entry.usage.howToUse, `Entry "${entry.entryId}" usage.howToUse`)
  if (entry.usage.examples !== undefined) assertStringArray(entry.usage.examples, `Entry "${entry.entryId}" usage.examples`)
  if (!isRecord(entry.provenance)) throw new LibraryConsumerError(`Entry "${entry.entryId}" has malformed provenance metadata.`)
  assertExactKeys(entry.provenance, AUTHORITATIVE_LIBRARY_ENTRY_SCHEMA.nestedKeys.provenance, `Entry "${entry.entryId}" provenance`)
  if (!['ide-development', 'linkdeveloper', 'manual', 'migration'].includes(entry.provenance.sourceSystem as string)) throw new LibraryConsumerError(`Entry "${entry.entryId}" has an invalid provenance sourceSystem.`)
  assertNonEmptyString(entry.provenance.contributedAt, `Entry "${entry.entryId}" provenance.contributedAt`)
  for (const field of ['sourceUrl', 'versionOrRange', 'productRunId']) if (entry.provenance[field] !== undefined) assertNonEmptyString(entry.provenance[field], `Entry ${field}`)
  if (entry.kind === 'vetted_oss') {
    for (const field of AUTHORITATIVE_LIBRARY_ENTRY_SCHEMA.vettedOssRequiredProvenance) assertNonEmptyString(entry.provenance[field], `Entry "${entry.entryId}" vetted_oss provenance.${field}`)
    assertNonEmptyString(entry.provenance.sourceUrl, `Entry "${entry.entryId}" vetted_oss provenance.sourceUrl`)
    if (!/^https:\/\//.test(entry.provenance.sourceUrl)) throw new LibraryConsumerError(`Entry "${entry.entryId}" vetted_oss provenance.sourceUrl must be an HTTPS URL.`)
  }
  if (!Array.isArray(entry.files) || entry.files.length === 0) throw new LibraryConsumerError(`Entry "${entry.entryId}" has no files.`)
  const paths = new Set<string>()
  for (const asset of entry.files) {
    if (!isRecord(asset)) throw new LibraryConsumerError(`Entry "${entry.entryId}" has malformed file metadata.`)
    assertExactKeys(asset, ['path', 'sha256'], `Entry "${entry.entryId}" file`)
    assertSafePath(asset.path, `Entry "${entry.entryId}" asset`)
    assertSha(asset.sha256, `Entry "${entry.entryId}" asset ${asset.path}`)
    if (paths.has(asset.path)) throw new LibraryConsumerError(`Entry "${entry.entryId}" lists asset "${asset.path}" more than once.`)
    paths.add(asset.path)
  }
  if (entry.status !== 'approved' && entry.status !== 'deprecated') throw new LibraryConsumerError(`Entry "${entry.entryId}" has an invalid status.`)
}

export function validatePinnedCatalogReference(reference: PinnedLibraryCatalogReference): void {
  if (reference.repositoryUrl !== LINKLIBRARIES_REPOSITORY && reference.repositoryUrl !== LINKLIBRARIES_REPOSITORY.slice(0, -4)) throw new LibraryConsumerError('LiNKlibraries repository URL must be the governed HTTPS LiNKlibraries repository.')
  if (!isGitSha(reference.commitSha)) throw new LibraryConsumerError('LiNKlibraries consumption requires a full 40-character commit SHA.')
  if (reference.ref !== undefined && (reference.ref !== reference.commitSha || !isGitSha(reference.ref))) throw new LibraryConsumerError(`Library ref "${reference.ref}" is not admissible; pin the exact commit SHA.`)
}

function assertCompatible(entry: LibraryEntryContract, request: LibraryCompatibilityRequest): LibraryCompatibilityResult {
  if (!request || !Number.isInteger(request.nodeMajor) || !Array.isArray(request.runtimes) ||
      request.nodeMajor !== LINKSITES_RUNTIME_REQUIREMENTS.nodeMajor ||
      request.runtimes.length !== LINKSITES_RUNTIME_REQUIREMENTS.runtimes.length ||
      request.runtimes.some((runtime, index) => runtime !== LINKSITES_RUNTIME_REQUIREMENTS.runtimes[index])) {
    throw new LibraryConsumerError('LiNKsites runtime requirements are owned and fixed at Node >=20 with node+browser; callers cannot weaken or replace the baseline.')
  }
  if (!compareRange(entry.compatibility.node, LINKSITES_RUNTIME_REQUIREMENTS.nodeMajor)) throw new LibraryConsumerError(`Entry "${entry.entryId}" is incompatible with LiNKsites Node ${LINKSITES_RUNTIME_REQUIREMENTS.nodeMajor}; declared range is ${entry.compatibility.node}.`)
  for (const runtime of LINKSITES_RUNTIME_REQUIREMENTS.runtimes) if (!entry.compatibility.runtimes.includes(runtime)) throw new LibraryConsumerError(`Entry "${entry.entryId}" does not declare required LiNKsites runtime "${runtime}".`)
  return { compatible: true, consumer: LINKSITES_LIBRARY_CONSUMER, nodeMajor: LINKSITES_RUNTIME_REQUIREMENTS.nodeMajor, runtimes: [...LINKSITES_RUNTIME_REQUIREMENTS.runtimes] }
}

function verifyFetchedAssets(entry: LibraryEntryContract, files: Record<string, string>, selection: LibraryEntrypointSelection): Record<string, string> {
  assertSafePath(selection.entrypoint, 'LiNKsites entrypoint')
  assertStringArray(selection.testFiles, 'LiNKsites test files', 1)
  const declaredPaths = new Set(entry.files.map(({ path }) => path))
  if (!declaredPaths.has(selection.entrypoint) || selection.testFiles.some((path) => !declaredPaths.has(path))) throw new LibraryConsumerError(`Entry "${entry.entryId}" is missing LiNKsites executable entrypoint/test assets.`)
  for (const path of Object.keys(files)) {
    assertSafePath(path, `Entry "${entry.entryId}" fetched asset`)
    if (!declaredPaths.has(path)) throw new LibraryConsumerError(`Entry "${entry.entryId}" contains undeclared asset "${path}".`)
  }
  const checksums: Record<string, string> = {}
  for (const asset of entry.files) {
    const content = files[asset.path]
    if (typeof content !== 'string' || content.length === 0) throw new LibraryConsumerError(`Entry "${entry.entryId}" is missing asset "${asset.path}".`)
    const actual = sha256(content)
    if (actual !== asset.sha256) throw new LibraryConsumerError(`Entry "${entry.entryId}" asset "${asset.path}" failed SHA-256 verification.`)
    checksums[asset.path] = actual
  }
  for (const path of [selection.entrypoint, ...selection.testFiles]) if (!files[path]?.trim()) throw new LibraryConsumerError(`Entry "${entry.entryId}" executable asset "${path}" is empty.`)
  return checksums
}

export async function consumePinnedLibraryEntry(input: {
  catalogReference: PinnedLibraryCatalogReference
  entryId: string
  compatibility: LibraryCompatibilityRequest
  executable: LibraryEntrypointSelection
  transport: LibraryExactCommitTransport
  recordedAt?: string
}): Promise<LibraryConsumption> {
  validatePinnedCatalogReference(input.catalogReference)
  if (!input.transport || !isVerifiedLibraryCommit(input.transport.verifiedCommit)) throw new LibraryConsumerError('LiNKlibraries consumption requires a materialized trusted exact-commit capability; callback-only or self-attested SHA transport is rejected.')
  const verifiedCommit = input.transport.verifiedCommit
  if (verifiedCommit.repositoryUrl !== input.catalogReference.repositoryUrl || verifiedCommit.commitSha !== input.catalogReference.commitSha) throw new LibraryConsumerError('Materialized LiNKlibraries capability does not bind to the requested exact repository commit.')
  const catalog = await verifiedCommit.readCatalog()
  assertCatalogShape(catalog)
  if (catalog.sourceCommitSha !== input.catalogReference.commitSha) throw new LibraryConsumerError('LiNKlibraries catalog sourceCommitSha does not bind to the requested exact commit.')
  const row = catalog.entries.find((candidate) => candidate.entryId === input.entryId)
  if (!row || row.status !== 'approved') throw new LibraryConsumerError(`No approved LiNKlibraries catalog entry exists for "${input.entryId}".`)
  const fetched = await verifiedCommit.readEntryAtCommit({ entryId: row.entryId, path: row.path })
  if (!isRecord(fetched) || !isRecord(fetched.entry) || !isRecord(fetched.files)) throw new LibraryConsumerError('Materialized exact-commit capability returned no entry/file read evidence; no-op transport is rejected.')
  assertLibraryEntryContract(fetched.entry)
  if (fetched.entry.entryId !== row.entryId) throw new LibraryConsumerError(`Fetched entry identity does not match catalog entry "${row.entryId}".`)
  const metadata = ['entryId', 'kind', 'name', 'summary', 'problemDomains', 'tags', 'languages', 'frameworks', 'status']
  if (canonicalJsonStringify(Object.fromEntries(metadata.map((key) => [key, fetched.entry[key as keyof LibraryEntryContract]]))) !== canonicalJsonStringify(Object.fromEntries(metadata.map((key) => [key, row[key as keyof LibraryCatalogEntry]])))) throw new LibraryConsumerError(`Fetched entry "${input.entryId}" metadata does not match the pinned catalog.`)
  if (fetched.entry.status !== 'approved') throw new LibraryConsumerError(`Entry "${input.entryId}" is not approved for consumption.`)
  const compatibility = assertCompatible(fetched.entry, input.compatibility)
  const assetChecksums = verifyFetchedAssets(fetched.entry, fetched.files, input.executable)
  const receipt: LibraryConsumptionReceipt = {
    schemaVersion: { major: 1, minor: 0 },
    receiptId: `library-consumption:${fetched.entry.entryId}:${input.catalogReference.commitSha}`,
    consumer: LINKSITES_LIBRARY_CONSUMER,
    entryId: fetched.entry.entryId,
    catalogCommitSha: input.catalogReference.commitSha,
    libraryCommitSha: input.catalogReference.commitSha,
    entryChecksum: canonicalJsonChecksum(fetched.entry),
    assetChecksums,
    entrypoint: input.executable.entrypoint,
    testFiles: [...input.executable.testFiles],
    compatibility,
    recordedAt: input.recordedAt ?? new Date().toISOString(),
  }
  assertLibraryReceiptMatchesEntry(receipt, fetched.entry)
  const consumption = { entry: deepFreeze(fetched.entry), files: deepFreeze({ ...fetched.files }), receipt: deepFreeze(receipt) }
  Object.defineProperty(consumption, TRUSTED_CONSUMPTION_BRAND, { value: true, enumerable: false })
  return Object.freeze(consumption)
}

export function assertLibraryConsumptionReceipt(receipt: LibraryConsumptionReceipt): void {
  if (!isRecord(receipt) || !isRecord(receipt.schemaVersion) || receipt.schemaVersion.major !== 1 || receipt.schemaVersion.minor !== 0 || receipt.consumer !== LINKSITES_LIBRARY_CONSUMER || !isGitSha(receipt.catalogCommitSha) || !isGitSha(receipt.libraryCommitSha) || receipt.catalogCommitSha !== receipt.libraryCommitSha || typeof receipt.entryId !== 'string' || !ENTRY_ID_PATTERN.test(receipt.entryId) || !SHA256_PATTERN.test(receipt.entryChecksum) || typeof receipt.recordedAt !== 'string' || !isRecord(receipt.compatibility) || receipt.compatibility.compatible !== true || receipt.compatibility.consumer !== LINKSITES_LIBRARY_CONSUMER || receipt.compatibility.nodeMajor !== LINKSITES_RUNTIME_REQUIREMENTS.nodeMajor || !Array.isArray(receipt.compatibility.runtimes) || receipt.compatibility.runtimes.length !== LINKSITES_RUNTIME_REQUIREMENTS.runtimes.length || receipt.compatibility.runtimes.some((runtime, index) => runtime !== LINKSITES_RUNTIME_REQUIREMENTS.runtimes[index])) throw new LibraryConsumerError('Invalid LiNKsites Library consumption receipt; refusing to persist an unpinned or weakened receipt.')
  if (receipt.receiptId !== `library-consumption:${receipt.entryId}:${receipt.libraryCommitSha}`) throw new LibraryConsumerError('Invalid LiNKsites Library consumption receipt; receipt identity is not deterministic.')
  assertSafePath(receipt.entrypoint, 'Library receipt entrypoint')
  assertStringArray(receipt.testFiles, 'Library receipt test files', 1)
  assertStringArray(receipt.compatibility.runtimes, 'Library receipt runtimes', 1)
  if (!isRecord(receipt.assetChecksums) || Object.keys(receipt.assetChecksums).length === 0) throw new LibraryConsumerError('Invalid LiNKsites Library consumption receipt; no verified asset checksums were recorded.')
  for (const [path, checksum] of Object.entries(receipt.assetChecksums)) {
    assertSafePath(path, 'Library receipt asset')
    assertSha(checksum, `Library receipt asset ${path}`)
  }
}

/** Revalidates materialized consumption, including every persisted file body. */
export function assertLibraryConsumptionEvidence(value: unknown): asserts value is LibraryConsumptionEvidence {
  if (!isRecord(value) || !isRecord(value.entry) || !isRecord(value.files) || !isRecord(value.receipt)) throw new LibraryConsumerError('Library consumption evidence must contain an entry, materialized files, and receipt.')
  const entry = value.entry as LibraryEntryContract
  const receipt = value.receipt as LibraryConsumptionReceipt
  assertLibraryEntryContract(entry)
  assertLibraryReceiptMatchesEntry(receipt, entry)
  const actualChecksums = verifyFetchedAssets(entry, value.files as Record<string, string>, {
    entrypoint: receipt.entrypoint,
    testFiles: receipt.testFiles,
  })
  if (canonicalJsonStringify(actualChecksums) !== canonicalJsonStringify(receipt.assetChecksums)) throw new LibraryConsumerError('Library consumption evidence file contents do not match the persisted receipt.')
}

export function isTrustedLibraryConsumption(value: unknown): value is LibraryConsumptionEvidence {
  return isRecord(value) && Object.getOwnPropertyDescriptor(value, TRUSTED_CONSUMPTION_BRAND)?.value === true
}

export function assertLibraryReceiptMatchesEntry(receipt: LibraryConsumptionReceipt, entry: LibraryEntryContract): void {
  assertLibraryConsumptionReceipt(receipt)
  assertLibraryEntryContract(entry)
  if (receipt.entryId !== entry.entryId || receipt.entryChecksum !== canonicalJsonChecksum(entry)) throw new LibraryConsumerError('Library receipt entry identity/checksum does not match the persisted entry metadata.')
  const declared = Object.fromEntries(entry.files.map(({ path, sha256: checksum }) => [path, checksum]))
  if (canonicalJsonStringify(receipt.assetChecksums) !== canonicalJsonStringify(declared)) throw new LibraryConsumerError('Library receipt asset checksums do not match the persisted entry metadata.')
  if (!receipt.assetChecksums[receipt.entrypoint] || receipt.testFiles.some((path) => !receipt.assetChecksums[path])) throw new LibraryConsumerError('Library receipt executable selection is not integrity-bound to its asset checksums.')
}

export interface LibraryCandidateEntry extends Omit<LibraryEntryContract, 'status'> {
  status: 'candidate'
}

export interface LibraryCandidateSubmission {
  proposalId: string
  consumer: typeof LINKSITES_LIBRARY_CONSUMER
  candidate: LibraryCandidateEntry
  canonicalCatalogCommitSha: GitSha
  submittedAt: string
}

export function submitArchitectCandidate(input: {
  catalogReference: PinnedLibraryCatalogReference
  candidate: LibraryCandidateEntry
  submittedAt?: string
}): LibraryCandidateSubmission {
  validatePinnedCatalogReference(input.catalogReference)
  if (input.catalogReference.ref && input.catalogReference.ref !== input.catalogReference.commitSha) throw new LibraryConsumerError('Architect proposals require an exact catalog commit.')
  if (!input.catalogReference.catalog) throw new LibraryConsumerError('Architect proposals require a catalog snapshot bound to the exact commit.')
  assertCatalogShape(input.catalogReference.catalog)
  if (input.catalogReference.catalog.sourceCommitSha !== input.catalogReference.commitSha) throw new LibraryConsumerError('Architect proposal catalog does not bind to the exact commit.')
  if (input.candidate.status !== 'candidate') throw new LibraryConsumerError('Architect submissions must remain candidate status.')
  const approved = input.catalogReference.catalog?.entries.find((entry) => entry.entryId === input.candidate.entryId && entry.status === 'approved')
  if (approved) throw new LibraryConsumerError(`Architect candidate "${input.candidate.entryId}" cannot replace approved canonical Library assets.`)
  const canonicalCandidate = { ...input.candidate, status: 'approved' as const }
  assertLibraryEntryContract(canonicalCandidate)
  return {
    proposalId: `library-candidate:${input.candidate.entryId}:${canonicalJsonChecksum(input.candidate)}`,
    consumer: LINKSITES_LIBRARY_CONSUMER,
    candidate: input.candidate,
    canonicalCatalogCommitSha: input.catalogReference.commitSha,
    submittedAt: input.submittedAt ?? new Date().toISOString(),
  }
}

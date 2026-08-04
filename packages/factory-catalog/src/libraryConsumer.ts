/**
 * Governed LiNKlibraries consumption for LiNKsites (W1-05).
 *
 * LiNKlibraries is a Git-backed source of reusable implementation assets. It
 * is not a runtime dependency of a rendered site. This adapter therefore
 * accepts a catalog that was already fetched at an immutable commit and an
 * artifact source that can fetch the selected entry at that same commit.
 * Network and Git transport are deliberately injected so the contract can be
 * exercised with deterministic offline fixtures.
 *
 * Selection and lifecycle metadata remain Factory Catalog concerns. The
 * adapter only proves that a governed, compatible, content-addressed Library
 * entry can be consumed and returns the receipt that a Site Specification or
 * Assembly Manifest must persist.
 */

import { createHash } from 'node:crypto'
import type { GitSha } from '@linksites/types'
import type { SchemaVersion } from '@linksites/types'

export const LINKSITES_LIBRARY_CONSUMER = 'linksites' as const
export const LINKLIBRARIES_REPOSITORY = 'https://github.com/linktrend/LiNKlibraries.git'
export const LIBRARY_ENTRY_SCHEMA_VERSION = 1 as const

export type LibraryConsumer = typeof LINKSITES_LIBRARY_CONSUMER | 'ide-development' | 'linkdeveloper'
export type LibraryEntryKind = 'custom_component' | 'code_pattern' | 'template' | 'starter_kit' | 'vetted_oss'
export type LibraryEntryStatus = 'approved' | 'deprecated'

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
  generatedAt?: string
  /** Informational only; the fetch commit in the reference is authoritative. */
  sourceCommitSha?: GitSha
  entries: LibraryCatalogEntry[]
}

export interface PinnedLibraryCatalogReference {
  repositoryUrl: string
  /** The commit used to fetch both the catalog and selected entry. */
  commitSha: GitSha
  /** Optional transport ref. A branch/tag is rejected; a full SHA is allowed. */
  ref?: string
  catalog: LibraryCatalog
}

export interface LibraryAsset {
  path: string
  sha256: string
}

export interface LibraryCompatibility {
  node: string
  runtimes: string[]
  /** Runtime major versions required by the consumer (for example next: 16). */
  runtimeVersions: Record<string, string>
}

export interface LibraryContentSchema {
  name: string
  version: SchemaVersion
  requiredFields: string[]
}

export interface LibraryEntryContract {
  schemaVersion: 1
  entryId: string
  entryVersion: string
  kind: LibraryEntryKind
  name: string
  summary: string
  problemDomains: string[]
  tags: string[]
  languages: string[]
  frameworks: string[]
  status: LibraryEntryStatus
  supportedConsumers: LibraryConsumer[]
  exportPath: string
  compatibility: LibraryCompatibility
  requiredContentSchema: LibraryContentSchema
  optionalSections: string[]
  designTokens: Record<string, string>
  testCommand: string
  testFiles: string[]
  provenance: {
    sourceSystem: string
    sourceRepository: string
    sourcePath: string
    contributedAt: string
  }
  license: {
    spdx: string
    redistributionAllowed: boolean
  }
  versionPolicy: {
    breakingChangeRule: string
    compatiblePatchRule: string
  }
  deprecationPolicy: {
    status: 'active' | 'deprecated'
    replacementEntryId?: string
    sunsetAt?: string
  }
  files: LibraryAsset[]
}

export interface LibraryEntryFetch {
  commitSha: GitSha
  entry: LibraryEntryContract
  /** Materialized files from the exact commit or immutable artifact. */
  files: Record<string, string>
}

export interface LibraryArtifactSource {
  fetchEntry(input: { entryId: string; commitSha: GitSha }): LibraryEntryFetch | Promise<LibraryEntryFetch>
}

export interface LibraryCompatibilityRequest {
  nodeMajor: number
  runtimeMajors: Record<string, number>
  contentSchema: SchemaVersion
}

export interface LibraryCompatibilityResult {
  compatible: true
  consumer: typeof LINKSITES_LIBRARY_CONSUMER
  nodeMajor: number
  runtimeMajors: Record<string, number>
  contentSchema: SchemaVersion
}

export interface LibraryConsumptionReceipt {
  schemaVersion: SchemaVersion
  receiptId: string
  consumer: typeof LINKSITES_LIBRARY_CONSUMER
  entryId: string
  entryVersion: string
  catalogCommitSha: GitSha
  libraryCommitSha: GitSha
  entryChecksum: string
  assetChecksums: Record<string, string>
  compatibility: LibraryCompatibilityResult
  recordedAt: string
}

export interface LibraryConsumption {
  entry: LibraryEntryContract
  files: Record<string, string>
  receipt: LibraryConsumptionReceipt
}

export class LibraryConsumerError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'LibraryConsumerError'
  }
}

const SHA256_PATTERN = /^[a-f0-9]{64}$/
const GIT_SHA_PATTERN = /^[a-f0-9]{40}$/
const SEMVER_PATTERN = /^\d+\.\d+\.\d+$/
const ENTRY_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const isGitSha = (value: unknown): value is GitSha => typeof value === 'string' && GIT_SHA_PATTERN.test(value)

const isSchemaVersion = (value: unknown): value is SchemaVersion =>
  isRecord(value) && typeof value.major === 'number' && typeof value.minor === 'number' &&
  Number.isInteger(value.major) && value.major >= 0 && Number.isInteger(value.minor) && value.minor >= 0

const LIBRARY_ENTRY_KINDS: ReadonlySet<LibraryEntryKind> = new Set([
  'custom_component',
  'code_pattern',
  'template',
  'starter_kit',
  'vetted_oss',
])

const sha256 = (value: string): string => createHash('sha256').update(value, 'utf8').digest('hex')

const canonicalize = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonicalize)
  if (isRecord(value)) {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)]),
    )
  }
  return value
}

const canonicalJsonChecksum = (value: unknown): string => sha256(JSON.stringify(canonicalize(value)))

const firstMajor = (range: string): number | null => {
  const match = range.match(/\d+/)
  return match ? Number(match[0]) : null
}

const assertSha = (value: string, label: string): void => {
  if (!SHA256_PATTERN.test(value)) throw new LibraryConsumerError(`${label} must be a lowercase SHA-256 checksum.`)
}

const assertSafePath = (value: string, label: string): void => {
  if (
    typeof value !== 'string' ||
    value.length === 0 ||
    value.includes('\\') ||
    value.includes('\u0000') ||
    value.startsWith('/') ||
    /^[A-Za-z]:/.test(value) ||
    value.split('/').some((segment) => segment.length === 0 || segment === '.' || segment === '..')
  ) {
    throw new LibraryConsumerError(`${label} is not a safe relative asset path.`)
  }
}

const assertCatalogEntryShape = (row: LibraryCatalogEntry): void => {
  if (
    typeof row.entryId !== 'string' ||
    !ENTRY_ID_PATTERN.test(row.entryId) ||
    !LIBRARY_ENTRY_KINDS.has(row.kind) ||
    typeof row.name !== 'string' ||
    typeof row.summary !== 'string' ||
    !Array.isArray(row.problemDomains) ||
    !Array.isArray(row.tags) ||
    !Array.isArray(row.languages) ||
    !Array.isArray(row.frameworks) ||
    !row.problemDomains.every((value) => typeof value === 'string') ||
    !row.tags.every((value) => typeof value === 'string') ||
    !row.languages.every((value) => typeof value === 'string') ||
    !row.frameworks.every((value) => typeof value === 'string')
  ) {
    throw new LibraryConsumerError('LiNKlibraries catalog contains a malformed entry row.')
  }
}

const catalogEntryProjection = (row: LibraryCatalogEntry): Record<string, unknown> => ({
  entryId: row.entryId,
  kind: row.kind,
  name: row.name,
  summary: row.summary,
  problemDomains: row.problemDomains,
  tags: row.tags,
  languages: row.languages,
  frameworks: row.frameworks,
  status: row.status,
})

const entryCatalogProjection = (entry: LibraryEntryContract): Record<string, unknown> => ({
  entryId: entry.entryId,
  kind: entry.kind,
  name: entry.name,
  summary: entry.summary,
  problemDomains: entry.problemDomains,
  tags: entry.tags,
  languages: entry.languages,
  frameworks: entry.frameworks,
  status: entry.status,
})

export function validatePinnedCatalogReference(reference: PinnedLibraryCatalogReference): void {
  if (reference.repositoryUrl !== LINKLIBRARIES_REPOSITORY && reference.repositoryUrl !== LINKLIBRARIES_REPOSITORY.slice(0, -4)) {
    throw new LibraryConsumerError('LiNKlibraries repository URL must be the governed HTTPS LiNKlibraries repository.')
  }
  if (!isGitSha(reference.commitSha)) {
    throw new LibraryConsumerError('LiNKlibraries consumption requires a full 40-character commit SHA.')
  }
  if (reference.ref !== undefined && (!isGitSha(reference.ref) || reference.ref !== reference.commitSha)) {
    throw new LibraryConsumerError(`Library ref "${reference.ref}" is not admissible; pin the exact catalog commit SHA.`)
  }
  if (!reference.catalog || reference.catalog.schemaVersion !== LIBRARY_ENTRY_SCHEMA_VERSION || !Array.isArray(reference.catalog.entries)) {
    throw new LibraryConsumerError('LiNKlibraries catalog schemaVersion 1 is required.')
  }

  const seen = new Set<string>()
  for (const row of reference.catalog.entries) {
    assertCatalogEntryShape(row)
    if (seen.has(row.entryId)) throw new LibraryConsumerError(`LiNKlibraries catalog contains duplicate entryId "${row.entryId}".`)
    seen.add(row.entryId)
    if (row.status !== 'approved' && row.status !== 'deprecated') {
      throw new LibraryConsumerError(`Catalog entry "${row.entryId}" has an unknown lifecycle status.`)
    }
    if (row.path !== `entries/${row.entryId}`) {
      throw new LibraryConsumerError(`Catalog entry "${row.entryId}" has an invalid path.`)
    }
  }
}

function assertEntryContract(entry: LibraryEntryContract): void {
  if (!isRecord(entry)) throw new LibraryConsumerError('LiNKlibraries returned a malformed entry contract.')
  if (entry.schemaVersion !== LIBRARY_ENTRY_SCHEMA_VERSION) throw new LibraryConsumerError(`Entry "${entry.entryId}" has an unsupported schemaVersion.`)
  if (!entry.entryId || !ENTRY_ID_PATTERN.test(entry.entryId) || !SEMVER_PATTERN.test(entry.entryVersion)) throw new LibraryConsumerError(`Entry "${entry.entryId}" must have a valid ID and semantic entryVersion.`)
  if (entry.status !== 'approved') throw new LibraryConsumerError(`Entry "${entry.entryId}" is not approved for consumption.`)
  if (!Array.isArray(entry.supportedConsumers) || !Array.isArray(entry.testFiles)) {
    throw new LibraryConsumerError(`Entry "${entry.entryId}" has malformed executable metadata.`)
  }
  const expectedDeprecationStatus = entry.status === 'approved' ? 'active' : 'deprecated'
  if (!isRecord(entry.deprecationPolicy) || entry.deprecationPolicy.status !== expectedDeprecationStatus) throw new LibraryConsumerError(`Entry "${entry.entryId}" has an inconsistent deprecation policy.`)
  if (!entry.supportedConsumers.includes(LINKSITES_LIBRARY_CONSUMER)) {
    throw new LibraryConsumerError(`Entry "${entry.entryId}" does not explicitly support LiNKsites.`)
  }
  if (!entry.exportPath || !entry.testCommand || entry.testFiles.length === 0) {
    throw new LibraryConsumerError(`Entry "${entry.entryId}" must declare an executable export and test command.`)
  }
  if (!isRecord(entry.requiredContentSchema) || !isSchemaVersion(entry.requiredContentSchema.version) || typeof entry.requiredContentSchema.name !== 'string' || !Array.isArray(entry.requiredContentSchema.requiredFields)) throw new LibraryConsumerError(`Entry "${entry.entryId}" has an invalid required content schema version.`)
  if (!entry.requiredContentSchema.name || entry.requiredContentSchema.requiredFields.some((field) => typeof field !== 'string' || !field.trim())) {
    throw new LibraryConsumerError(`Entry "${entry.entryId}" has an invalid required content schema.`)
  }
  if (!isRecord(entry.compatibility) || typeof entry.compatibility.node !== 'string' || !Array.isArray(entry.compatibility.runtimes) || !isRecord(entry.compatibility.runtimeVersions) || Object.keys(entry.compatibility.runtimeVersions).length === 0) {
    throw new LibraryConsumerError(`Entry "${entry.entryId}" must declare runtime compatibility versions.`)
  }
  if (!isRecord(entry.provenance) || !isRecord(entry.license) || !isRecord(entry.versionPolicy) || !entry.provenance.sourceRepository || !entry.provenance.sourcePath || !entry.license.spdx) {
    throw new LibraryConsumerError(`Entry "${entry.entryId}" is missing provenance or license information.`)
  }
  if (!entry.versionPolicy.breakingChangeRule || !entry.versionPolicy.compatiblePatchRule) {
    throw new LibraryConsumerError(`Entry "${entry.entryId}" is missing version policy.`)
  }
  if (!entry.deprecationPolicy.status) throw new LibraryConsumerError(`Entry "${entry.entryId}" is missing deprecation policy.`)
  if (!Array.isArray(entry.files) || entry.files.length === 0) throw new LibraryConsumerError(`Entry "${entry.entryId}" has no executable assets.`)

  const paths = new Set<string>()
  for (const asset of entry.files) {
    assertSafePath(asset.path, `Entry "${entry.entryId}" asset`)
    assertSha(asset.sha256, `Entry "${entry.entryId}" asset ${asset.path}`)
    if (paths.has(asset.path)) throw new LibraryConsumerError(`Entry "${entry.entryId}" lists asset "${asset.path}" more than once.`)
    paths.add(asset.path)
  }
  assertSafePath(entry.exportPath, `Entry "${entry.entryId}" exportPath`)
  for (const testFile of entry.testFiles) {
    assertSafePath(testFile, `Entry "${entry.entryId}" testFile`)
    if (typeof testFile !== 'string') throw new LibraryConsumerError(`Entry "${entry.entryId}" has a malformed test asset path.`)
  }
  if (!paths.has(entry.exportPath) || entry.testFiles.some((path) => !paths.has(path))) {
    throw new LibraryConsumerError(`Entry "${entry.entryId}" metadata-only or missing-asset contract: export/test assets are not listed.`)
  }
}

function assertCompatible(entry: LibraryEntryContract, request: LibraryCompatibilityRequest): LibraryCompatibilityResult {
  const requiredNodeMajor = firstMajor(entry.compatibility.node)
  if (requiredNodeMajor === null || request.nodeMajor < requiredNodeMajor) {
    throw new LibraryConsumerError(`Entry "${entry.entryId}" requires Node ${entry.compatibility.node}; consumer has Node ${request.nodeMajor}.`)
  }
  for (const [runtime, expectedMajor] of Object.entries(request.runtimeMajors)) {
    const declared = entry.compatibility.runtimeVersions[runtime]
    if (!declared || firstMajor(declared) !== expectedMajor) {
      throw new LibraryConsumerError(`Entry "${entry.entryId}" is incompatible with runtime ${runtime} major ${expectedMajor}.`)
    }
  }
  if (
    entry.requiredContentSchema.version.major !== request.contentSchema.major ||
    entry.requiredContentSchema.version.minor !== request.contentSchema.minor
  ) {
    throw new LibraryConsumerError(`Entry "${entry.entryId}" requires content schema ${entry.requiredContentSchema.version.major}.${entry.requiredContentSchema.version.minor}.`)
  }
  return {
    compatible: true,
    consumer: LINKSITES_LIBRARY_CONSUMER,
    nodeMajor: request.nodeMajor,
    runtimeMajors: { ...request.runtimeMajors },
    contentSchema: { ...request.contentSchema },
  }
}

function verifyFetchedAssets(entry: LibraryEntryContract, files: Record<string, string>): Record<string, string> {
  const checksums: Record<string, string> = {}
  const declaredPaths = new Set(entry.files.map(({ path }) => path))
  for (const path of Object.keys(files)) {
    assertSafePath(path, `Entry "${entry.entryId}" fetched asset`)
    if (!declaredPaths.has(path)) {
      throw new LibraryConsumerError(`Entry "${entry.entryId}" contains undeclared asset "${path}".`)
    }
  }
  for (const asset of entry.files) {
    const content = files[asset.path]
    if (typeof content !== 'string' || content.length === 0) {
      throw new LibraryConsumerError(`Entry "${entry.entryId}" is missing asset "${asset.path}".`)
    }
    const actual = sha256(content)
    if (actual !== asset.sha256) {
      throw new LibraryConsumerError(`Entry "${entry.entryId}" asset "${asset.path}" failed SHA-256 verification.`)
    }
    checksums[asset.path] = actual
  }
  if (!files[entry.exportPath].trim() || entry.testFiles.some((path) => !files[path].trim())) {
    throw new LibraryConsumerError(`Entry "${entry.entryId}" does not contain non-empty executable/test assets.`)
  }
  return checksums
}

export async function consumePinnedLibraryEntry(input: {
  catalogReference: PinnedLibraryCatalogReference
  entryId: string
  compatibility: LibraryCompatibilityRequest
  source: LibraryArtifactSource
  recordedAt?: string
}): Promise<LibraryConsumption> {
  validatePinnedCatalogReference(input.catalogReference)
  const row = input.catalogReference.catalog.entries.find((candidate) => candidate.entryId === input.entryId)
  if (!row || row.status !== 'approved') {
    throw new LibraryConsumerError(`No approved LiNKlibraries catalog entry exists for "${input.entryId}".`)
  }

  const fetched = await input.source.fetchEntry({ entryId: input.entryId, commitSha: input.catalogReference.commitSha })
  if (fetched.commitSha !== input.catalogReference.commitSha) {
    throw new LibraryConsumerError(`Entry "${input.entryId}" was fetched at a different commit than the pinned catalog.`)
  }
  if (fetched.entry.entryId !== row.entryId) throw new LibraryConsumerError(`Fetched entry identity does not match catalog entry "${row.entryId}".`)
  assertEntryContract(fetched.entry)
  if (JSON.stringify(entryCatalogProjection(fetched.entry)) !== JSON.stringify(catalogEntryProjection(row))) {
    throw new LibraryConsumerError(`Fetched entry "${input.entryId}" metadata does not match the pinned catalog.`)
  }
  const compatibility = assertCompatible(fetched.entry, input.compatibility)
  const assetChecksums = verifyFetchedAssets(fetched.entry, fetched.files)
  const receipt: LibraryConsumptionReceipt = {
    schemaVersion: { major: 1, minor: 0 },
    receiptId: `library-consumption:${fetched.entry.entryId}@${fetched.entry.entryVersion}:${fetched.commitSha}`,
    consumer: LINKSITES_LIBRARY_CONSUMER,
    entryId: fetched.entry.entryId,
    entryVersion: fetched.entry.entryVersion,
    catalogCommitSha: input.catalogReference.commitSha,
    libraryCommitSha: fetched.commitSha,
    entryChecksum: canonicalJsonChecksum(fetched.entry),
    assetChecksums,
    compatibility,
    recordedAt: input.recordedAt ?? new Date().toISOString(),
  }
  return { entry: fetched.entry, files: fetched.files, receipt }
}

export function assertLibraryConsumptionReceipt(receipt: LibraryConsumptionReceipt): void {
  if (
    !isRecord(receipt) ||
    !isSchemaVersion(receipt.schemaVersion) ||
    receipt.schemaVersion.major !== 1 ||
    receipt.schemaVersion.minor !== 0 ||
    receipt.consumer !== LINKSITES_LIBRARY_CONSUMER ||
    !isGitSha(receipt.catalogCommitSha) ||
    !isGitSha(receipt.libraryCommitSha) ||
    receipt.catalogCommitSha !== receipt.libraryCommitSha ||
    !receipt.entryId ||
    !ENTRY_ID_PATTERN.test(receipt.entryId) ||
    !SEMVER_PATTERN.test(receipt.entryVersion) ||
    !SHA256_PATTERN.test(receipt.entryChecksum) ||
    typeof receipt.recordedAt !== 'string' ||
    !isRecord(receipt.compatibility) ||
    !Number.isInteger(receipt.compatibility.nodeMajor) ||
    receipt.compatibility.nodeMajor < 0 ||
    !isRecord(receipt.compatibility.runtimeMajors) ||
    !Object.values(receipt.compatibility.runtimeMajors).every((major) => Number.isInteger(major) && major >= 0) ||
    receipt.compatibility.compatible !== true ||
    receipt.compatibility.consumer !== LINKSITES_LIBRARY_CONSUMER ||
    !isSchemaVersion(receipt.compatibility.contentSchema)
  ) {
    throw new LibraryConsumerError('Invalid LiNKsites Library consumption receipt; refusing to persist an unpinned or incompatible receipt.')
  }
  if (receipt.receiptId !== `library-consumption:${receipt.entryId}@${receipt.entryVersion}:${receipt.libraryCommitSha}`) {
    throw new LibraryConsumerError('Invalid LiNKsites Library consumption receipt; receipt identity is not deterministic.')
  }
  if (!isRecord(receipt.assetChecksums) || Object.keys(receipt.assetChecksums).length === 0) {
    throw new LibraryConsumerError('Invalid LiNKsites Library consumption receipt; no verified asset checksums were recorded.')
  }
  for (const [path, checksum] of Object.entries(receipt.assetChecksums)) {
    assertSafePath(path, 'Library receipt asset')
    assertSha(checksum, `Library receipt asset ${path}`)
  }
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

/**
 * Architect submissions are proposals only. A candidate with the same ID as
 * an approved catalog row is rejected instead of replacing canonical assets;
 * Librarian/Principal governance must perform any later versioned admission.
 */
export function submitArchitectCandidate(input: {
  catalogReference: PinnedLibraryCatalogReference
  candidate: LibraryCandidateEntry
  submittedAt?: string
}): LibraryCandidateSubmission {
  validatePinnedCatalogReference(input.catalogReference)
  const approved = input.catalogReference.catalog.entries.find(
    (entry) => entry.entryId === input.candidate.entryId && entry.status === 'approved',
  )
  if (approved) {
    throw new LibraryConsumerError(`Architect candidate "${input.candidate.entryId}" cannot replace approved canonical Library assets.`)
  }
  if (input.candidate.status !== 'candidate') throw new LibraryConsumerError('Architect submissions must remain candidate status.')
  return {
    proposalId: `library-candidate:${input.candidate.entryId}@${input.candidate.entryVersion}`,
    consumer: LINKSITES_LIBRARY_CONSUMER,
    candidate: input.candidate,
    canonicalCatalogCommitSha: input.catalogReference.commitSha,
    submittedAt: input.submittedAt ?? new Date().toISOString(),
  }
}

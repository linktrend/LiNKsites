import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import {
  admitWebsiteTemplateMaterialization,
  type Revision2ProviderPin,
  type Revision2Result,
  type WebsiteTemplateMaterializationReference,
  validateExactRelease,
} from './libraryProviderClient.ts'
import { MASTER_TEMPLATE_SOURCE_COMMIT_SHA, MASTER_TEMPLATE_SOURCE_TREE_SHA } from './templateIdentity.ts'

export type { Revision2ProviderPin } from './libraryProviderClient.ts'

export type Revision2MaterializedWebsiteTemplate = Readonly<{
  reference: WebsiteTemplateMaterializationReference
  providerRoot: string
  releaseRoot: string
  artifactRoot: string
  files: Readonly<Record<string, string>>
  mode?: 'provider' | 'offline_cache'
  cacheRoot?: string
  materializationReceipt?: Revision2MaterializationReceipt
}>

export type Revision2MaterializationInput = Readonly<{
  providerRoot: string
  entryId: string
  version: string
  pin: Revision2ProviderPin
  receiptPath?: string
  /** Optional consumer-owned cache. Provider bytes are copied only here. */
  cacheRoot?: string
}>

export type Revision2MaterializationReceipt = Readonly<{
  schemaVersion: 1
  packet: 'LS-05'
  verdicts: Readonly<{
    materialization: 'candidate_materialized'
    compatibility: 'adapter_compatible' | 'unknown'
    projection: 'payload_projection_pending' | 'payload_projection_valid'
  }>
  provider: Readonly<{ repository: string; commitSha: string; treeSha: string; sourceReleaseCommitSha: string; sourceReleaseTreeSha: string }>
  release: Readonly<Pick<WebsiteTemplateMaterializationReference, 'entryId' | 'version' | 'artifactTreeSha1' | 'releaseManifestSha256' | 'inventorySha256' | 'payloadSha256' | 'dependencyLockSha256' | 'releaseSourceCommitSha' | 'releaseSourceTreeSha'>>
  adapter: Readonly<{ id: string; version: string; mappingDigest: string }>
  cache: Readonly<{ entryDirectory: string; providerCheckoutRequired: false; inventory: ReadonlyArray<{ path: string; sha256: string; byteLength: number }> }>
  identities: Readonly<{ candidate: string; materialization: string; adapter: string; payload: string | null; effective: string }>
}>

export type Revision2OfflineRestartInput = Readonly<{
  cacheRoot: string
  expected?: Pick<Revision2MaterializationInput, 'entryId' | 'version' | 'pin'>
}>

export type Revision2RollbackInput = Readonly<{ cacheRoot: string }>

const sha256 = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')
const json = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8')) as unknown
const failure = (errors: readonly string[]): Revision2Result<never> => ({ ok: false, errors })
const canonical = (value: unknown): string => value === null || typeof value !== 'object'
  ? JSON.stringify(value)
  : Array.isArray(value)
    ? `[${value.map(canonical).join(',')}]`
    : `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(',')}}`
const identity = (value: unknown): string => createHash('sha1').update(canonical(value), 'utf8').digest('hex')
const confined = (root: string, candidate: string): boolean => {
  const rootWithSeparator = root.endsWith(sep) ? root : `${root}${sep}`
  return candidate === root || candidate.startsWith(rootWithSeparator)
}

const readReceipt = (input: Revision2MaterializationInput, releaseRoot: string): unknown => {
  const candidates = [input.receiptPath, resolve(releaseRoot, 'receipt.json'), resolve(releaseRoot, 'release-receipt.json'), resolve(releaseRoot, 'cache-receipt.json'), resolve(input.providerRoot, 'docs/evidence/master-website-template-v2/a1-provider-gate/provider-gate-receipt.json'), resolve(input.providerRoot, 'materialization/cache/cache-receipt.json')].filter((candidate): candidate is string => Boolean(candidate))
  for (const candidate of candidates) {
    try {
      const value = json(candidate)
      // The provider gate receipt is the immutable evidence for this draft
      // candidate; adapt its release coordinates to the native candidate
      // receipt shape without copying provider artifacts into LiNKsites.
      if (value && typeof value === 'object' && !Array.isArray(value) && (value as Record<string, unknown>).kind === 'mwt-07-a1-provider-gate-receipt') {
        const record = value as Record<string, any>
        const release = record.release as Record<string, unknown> | undefined
        const source = record.sourceDisposition as Record<string, unknown> | undefined
        if (!release || !source) throw new Error('provider gate receipt is missing release/source evidence')
        return {
          schemaVersion: 2,
          schemaRevision: 2,
          receiptType: 'provider_prerelease_candidate',
          release: {
            entryId: release.entryId,
            version: release.version,
            manifestSha256: release.manifestSha256,
            artifactTreeSha1: release.artifactTreeSha1,
            payloadSha256: release.payloadSha256,
            inventoryFileSha256: release.inventorySha256,
            dependencyLockSha256: release.dependencyLockSha256,
          },
          source: { repository: 'LiNKsites', sourceCommit: source.sourceCommit, sourceTree: source.sourceTree },
          catalogue: { fileSha256: '', recordsSha256: '' },
          governance: { lifecycle: release.lifecycle, selectability: release.selectability, compatibility: 'unknown' },
        }
      }
      return value
    } catch { /* fail with one deterministic error */ }
  }
  throw new Error(`no Revision 2 receipt found for ${input.entryId}@${input.version}`)
}

/** Read-only provider release materialization. Provider bytes never enter the repository. */
export function materializeRevision2WebsiteTemplate(input: Revision2MaterializationInput): Revision2Result<Revision2MaterializedWebsiteTemplate> {
  const providerRoot = resolve(input.providerRoot)
  const releaseRoot = resolve(providerRoot, 'registry/v2/entries', input.entryId, 'versions', input.version)
  const artifactRoot = resolve(releaseRoot, 'artifact')
  const errors: string[] = []
  if (!confined(providerRoot, releaseRoot) || !confined(providerRoot, artifactRoot)) return failure(['provider release path escapes provider root'])
  let bundle: unknown
  try {
    const cataloguePath = resolve(providerRoot, 'indexes/v2/catalog.json')
    const catalogueBytes = readFileSync(cataloguePath, 'utf8')
    const catalogue = JSON.parse(catalogueBytes) as unknown
    const manifest = json(resolve(releaseRoot, 'manifest.json'))
    const inventory = json(resolve(releaseRoot, 'inventory.json'))
    const dependencyLock = json(resolve(releaseRoot, 'dependency-lock.json'))
    const candidateReceipt = readReceipt(input, releaseRoot)
    if (candidateReceipt && typeof candidateReceipt === 'object' && !Array.isArray(candidateReceipt) && (candidateReceipt as Record<string, unknown>).receiptType === 'provider_prerelease_candidate') {
      const candidate = candidateReceipt as Record<string, any>
      const catalogRecord = catalogue as Record<string, any>
      candidate.catalogue = { fileSha256: sha256(catalogueBytes), recordsSha256: catalogRecord.recordsSha256 }
    }
    const record = (catalogue as { records?: unknown[] }).records?.find((item) => (item as { entryId?: unknown })?.entryId === input.entryId && (item as { version?: unknown })?.version === input.version)
    bundle = { source: { commitSha: input.pin.sourceCommitSha, treeSha: input.pin.sourceTreeSha }, catalogue, catalogueFileSha256: sha256(catalogueBytes), record, manifest, inventory, dependencyLock, receipt: candidateReceipt }
  } catch (error) {
    return failure([error instanceof Error ? error.message : 'provider release files could not be read'])
  }
  const validated = validateExactRelease(bundle, input.pin, { allowDraftCandidate: true })
  if (!validated.ok) return validated
  const admitted = admitWebsiteTemplateMaterialization(validated)
  if (!admitted.ok) return admitted
  const inventory = (bundle as { inventory: { entries?: unknown[] } }).inventory
  const files: Record<string, string> = {}
  for (const item of inventory.entries ?? []) {
    if (!item || typeof item !== 'object' || (item as { type?: unknown }).type !== 'file') continue
    const path = (item as { path?: unknown }).path
    if (typeof path !== 'string' || path.length === 0 || path.startsWith('/') || path.includes('..') || path.includes('\\')) { errors.push(`inventory file path is unsafe: ${String(path)}`); continue }
    const candidate = resolve(artifactRoot, path)
    if (!confined(artifactRoot, candidate)) { errors.push(`inventory file path escapes artifact: ${path}`); continue }
    try {
      const stat = lstatSync(candidate)
      if (!stat.isFile()) { errors.push(`inventory path is not a regular file: ${path}`); continue }
      const bytes = readFileSync(candidate)
      if (Number((item as { byteLength?: unknown }).byteLength) !== bytes.byteLength || (item as { sha256?: unknown }).sha256 !== sha256(bytes)) errors.push(`inventory digest mismatch: ${path}`)
      files[path] = bytes.toString('utf8')
    } catch { errors.push(`inventory file is missing: ${path}`) }
  }
  if (errors.length) return failure(errors)
  const sourceInventoryPath = Object.keys(files).find((path) => path === 'source-inventory.json' || path.endsWith('/source-inventory.json'))
  if (!sourceInventoryPath) return failure(['provider release is missing source-inventory.json'])
  try {
    const sourceInventory = JSON.parse(files[sourceInventoryPath]) as { sourceRepository?: unknown; sourceCommit?: unknown; sourceTree?: unknown; template?: { sourceRepository?: unknown }; source?: { commitSha?: unknown; treeSha?: unknown } }
    const sourceRepository = sourceInventory.sourceRepository ?? sourceInventory.template?.sourceRepository
    const sourceCommit = sourceInventory.sourceCommit ?? sourceInventory.source?.commitSha
    const sourceTree = sourceInventory.sourceTree ?? sourceInventory.source?.treeSha
    if (sourceRepository !== 'LiNKsites' || sourceCommit !== MASTER_TEMPLATE_SOURCE_COMMIT_SHA || sourceTree !== MASTER_TEMPLATE_SOURCE_TREE_SHA) return failure(['provider source inventory is not bound to the preserved LiNKsites visual handoff'])
  } catch { return failure(['provider source inventory is invalid JSON']) }
  const reference = admitted.value
  const materializationReceipt = buildMaterializationReceipt(input, reference, files, input.cacheRoot)
  if (input.cacheRoot) {
    try { writeCache(input.cacheRoot, materializationReceipt, files) } catch (error) { return failure([error instanceof Error ? error.message : 'consumer cache write failed']) }
  }
  return { ok: true, value: Object.freeze({ reference, providerRoot, releaseRoot, artifactRoot, files: Object.freeze(files), mode: 'provider' as const, ...(input.cacheRoot ? { cacheRoot: resolve(input.cacheRoot), materializationReceipt } : {}) }) }
}

function buildMaterializationReceipt(input: Revision2MaterializationInput, reference: WebsiteTemplateMaterializationReference, files: Record<string, string>, cacheRoot?: string): Revision2MaterializationReceipt {
  const inventory = Object.entries(files).sort(([left], [right]) => left.localeCompare(right)).map(([path, bytes]) => ({ path, sha256: sha256(bytes), byteLength: Buffer.byteLength(bytes) }))
  const candidate = identity({ provider: input.pin.providerCommitSha ?? input.pin.sourceCommitSha, tree: input.pin.providerTreeSha ?? input.pin.sourceTreeSha, entryId: reference.entryId, version: reference.version, artifactTreeSha1: reference.artifactTreeSha1 })
  const materialization = identity({ candidate, inventory })
  const adapter = identity({ id: 'linksites.master-template.revision2', version: '2.0.0-a1.1', mappingDigest: identity('revision2-a1-semantic-mapping-v1') })
  const effective = identity({ candidate, materialization, adapter, payload: null })
  return Object.freeze({
    schemaVersion: 1,
    packet: 'LS-05',
    verdicts: { materialization: 'candidate_materialized' as const, compatibility: 'adapter_compatible' as const, projection: 'payload_projection_pending' as const },
    provider: { repository: 'https://github.com/linktrend/LiNKlibraries.git', commitSha: input.pin.providerCommitSha ?? input.pin.sourceCommitSha, treeSha: input.pin.providerTreeSha ?? input.pin.sourceTreeSha, sourceReleaseCommitSha: input.pin.sourceCommitSha, sourceReleaseTreeSha: input.pin.sourceTreeSha },
    release: { entryId: reference.entryId, version: reference.version, artifactTreeSha1: reference.artifactTreeSha1, releaseManifestSha256: reference.releaseManifestSha256, inventorySha256: reference.inventorySha256, payloadSha256: reference.payloadSha256, dependencyLockSha256: reference.dependencyLockSha256, releaseSourceCommitSha: reference.releaseSourceCommitSha, releaseSourceTreeSha: reference.releaseSourceTreeSha },
    adapter: { id: 'linksites.master-template.revision2', version: '2.0.0-a1.1', mappingDigest: identity('revision2-a1-semantic-mapping-v1') },
    cache: { entryDirectory: cacheRoot ? `entries/${reference.artifactTreeSha1}` : '', providerCheckoutRequired: false as const, inventory },
    identities: { candidate, materialization, adapter, payload: null, effective },
  })
}

type CachePaths = Readonly<{ root: string; active: string; previous: string; entries: string; staging: string }>
function cachePaths(cacheRoot: string): CachePaths {
  const root = resolve(cacheRoot)
  return { root, active: join(root, 'active.json'), previous: join(root, 'previous.json'), entries: join(root, 'entries'), staging: join(root, 'staging') }
}
function writeJsonAtomic(path: string, value: unknown): void {
  const temp = `${path}.tmp-${process.pid}`
  writeFileSync(temp, `${JSON.stringify(value, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' })
  renameSync(temp, path)
}
function readJson(path: string): any | null {
  if (!existsSync(path)) return null
  try { return json(path) } catch { throw new Error(`consumer cache JSON is invalid: ${path}`) }
}
function safeCachePath(root: string, candidate: string): boolean {
  const resolved = resolve(candidate)
  const prefix = root.endsWith(sep) ? root : `${root}${sep}`
  return resolved.startsWith(prefix) && !resolved.includes(`${sep}.${sep}`)
}
function writeCache(cacheRoot: string, receipt: Revision2MaterializationReceipt, files: Record<string, string>): void {
  const dirs = cachePaths(cacheRoot)
  mkdirSync(dirs.root, { recursive: true }); mkdirSync(dirs.entries, { recursive: true }); mkdirSync(dirs.staging, { recursive: true })
  const prior = readJson(dirs.active)
  const entryDir = join(dirs.entries, receipt.release.artifactTreeSha1)
  const stagingDir = join(dirs.staging, `${receipt.release.artifactTreeSha1}.${process.pid}`)
  rmSync(stagingDir, { recursive: true, force: true }); mkdirSync(stagingDir, { recursive: true })
  try {
    for (const [path, bytes] of Object.entries(files)) {
      const destination = resolve(stagingDir, path)
      if (!safeCachePath(stagingDir, destination)) throw new Error(`consumer cache path escapes staging root: ${path}`)
      mkdirSync(resolve(destination, '..'), { recursive: true }); writeFileSync(destination, bytes, { encoding: 'utf8', flag: 'wx' })
    }
    writeJsonAtomic(join(stagingDir, 'materialization-receipt.json'), receipt)
    rmSync(entryDir, { recursive: true, force: true }); renameSync(stagingDir, entryDir)
  } catch (error) { rmSync(stagingDir, { recursive: true, force: true }); throw error }
  if (prior) writeJsonAtomic(dirs.previous, prior)
  writeJsonAtomic(dirs.active, { schemaVersion: 1, identity: receipt.identities.effective, entryId: receipt.release.entryId, version: receipt.release.version, entryDirectory: relative(dirs.root, entryDir), receiptPath: relative(dirs.root, join(entryDir, 'materialization-receipt.json')), previous: prior?.identity ?? null })
}

function verifyCachedEntry(cacheRoot: string, active: any): Revision2Result<Revision2MaterializedWebsiteTemplate> {
  const dirs = cachePaths(cacheRoot)
  if (!active || typeof active.entryDirectory !== 'string') return failure(['consumer cache active pointer is absent'])
  const entryDir = resolve(dirs.root, active.entryDirectory)
  if (!safeCachePath(dirs.root, entryDir)) return failure(['consumer cache entry path escapes cache root'])
  let receipt: Revision2MaterializationReceipt
  try { receipt = readJson(resolve(dirs.root, active.receiptPath)) as Revision2MaterializationReceipt } catch (error) { return failure([error instanceof Error ? error.message : 'consumer cache receipt is absent']) }
  if (!receipt || receipt.packet !== 'LS-05' || receipt.verdicts.materialization !== 'candidate_materialized') return failure(['consumer cache materialization receipt is invalid'])
  const files: Record<string, string> = {}
  for (const item of receipt.cache.inventory) {
    const path = resolve(entryDir, item.path)
    if (!safeCachePath(entryDir, path)) return failure([`consumer cache inventory path escapes entry: ${item.path}`])
    try { const stat = lstatSync(path); if (!stat.isFile()) return failure([`consumer cache path is not a regular file: ${item.path}`]); const bytes = readFileSync(path); if (bytes.byteLength !== item.byteLength || sha256(bytes) !== item.sha256) return failure([`consumer cache digest mismatch: ${item.path}`]); files[item.path] = bytes.toString('utf8') } catch { return failure([`consumer cache file is missing: ${item.path}`]) }
  }
  const reference = Object.freeze({ authority: 'linksites_local' as const, libraryAuthority: 'reference_only' as const, materialization: 'input_reference_only' as const, artifactType: 'website_template' as const, sourceCommitSha: receipt.provider.sourceReleaseCommitSha, sourceTreeSha: receipt.provider.sourceReleaseTreeSha, releaseSourceCommitSha: receipt.release.releaseSourceCommitSha, releaseSourceTreeSha: receipt.release.releaseSourceTreeSha, artifactTreeSha1: receipt.release.artifactTreeSha1, entryId: receipt.release.entryId, version: receipt.release.version, releaseManifestSha256: receipt.release.releaseManifestSha256, inventorySha256: receipt.release.inventorySha256, payloadSha256: receipt.release.payloadSha256, dependencyLockSha256: receipt.release.dependencyLockSha256, receiptType: 'candidate' as const, receiptId: receipt.identities.candidate })
  return { ok: true, value: Object.freeze({ reference, providerRoot: '', releaseRoot: entryDir, artifactRoot: entryDir, files: Object.freeze(files), mode: 'offline_cache' as const, cacheRoot: dirs.root, materializationReceipt: receipt }) }
}

/** Rehydrate only from the consumer-owned cache; no provider checkout is read. */
export function offlineRestartRevision2WebsiteTemplate(input: Revision2OfflineRestartInput): Revision2Result<Revision2MaterializedWebsiteTemplate> {
  const active = readJson(cachePaths(input.cacheRoot).active)
  const result = verifyCachedEntry(input.cacheRoot, active)
  if (!result.ok || !input.expected) return result
  if (result.value.reference.entryId !== input.expected.entryId || result.value.reference.version !== input.expected.version || result.value.reference.sourceCommitSha !== input.expected.pin.sourceCommitSha || result.value.reference.sourceTreeSha !== input.expected.pin.sourceTreeSha) return failure(['consumer cache identity does not match the requested provider release pin'])
  return result
}

/** Activate the previous complete cache entry, leaving its bytes untouched. */
export function rollbackRevision2WebsiteTemplate(input: Revision2RollbackInput): Revision2Result<Revision2MaterializedWebsiteTemplate> {
  const dirs = cachePaths(input.cacheRoot)
  const active = readJson(dirs.active)
  const previous = readJson(dirs.previous)
  if (!active || !previous) return failure(['consumer cache rollback is unavailable'])
  const restored = verifyCachedEntry(input.cacheRoot, previous)
  if (!restored.ok) return restored
  writeJsonAtomic(dirs.previous, active)
  writeJsonAtomic(dirs.active, previous)
  return restored
}

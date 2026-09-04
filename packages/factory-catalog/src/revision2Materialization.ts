import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import {
  admitWebsiteTemplateMaterialization,
  type Revision2ProviderPin,
  type Revision2Result,
  type Revision2SelectionPolicy,
  type WebsiteTemplateMaterializationReference,
  validateExactRelease,
} from './libraryProviderClient.ts'
import { MASTER_TEMPLATE_SOURCE_COMMIT_SHA, MASTER_TEMPLATE_SOURCE_TREE_SHA } from './templateIdentity.ts'
import {
  MASTER_TEMPLATE_ADAPTER_ID,
  MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST,
  MASTER_TEMPLATE_ADAPTER_VERSION,
} from './masterTemplateVersionedAdapter.ts'

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
  /** Candidate materialization is probe-only and must be explicitly selected. */
  selectionPolicy?: Revision2SelectionPolicy
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
const SHA1 = /^[a-f0-9]{40}$/
const SHA256 = /^[a-f0-9]{64}$/
const EXPECTED_RECEIPT_VERDICTS: Revision2MaterializationReceipt['verdicts'] = Object.freeze({
  materialization: 'candidate_materialized',
  compatibility: 'adapter_compatible',
  projection: 'payload_projection_pending',
})
const confined = (root: string, candidate: string): boolean => {
  const rootWithSeparator = root.endsWith(sep) ? root : `${root}${sep}`
  return candidate === root || candidate.startsWith(rootWithSeparator)
}

function providerFileIsConfined(providerRoot: string, candidate: string): boolean {
  const root = resolve(providerRoot)
  const path = resolve(candidate)
  if (!confined(root, path)) return false
  try {
    const rootStat = lstatSync(root)
    if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) return false
    const realRoot = resolve(realpathSync(root))
    const relativeParts = relative(root, path).split(sep).filter(Boolean)
    let current = root
    for (const part of relativeParts) {
      current = join(current, part)
      const stat = lstatSync(current)
      if (stat.isSymbolicLink()) return false
    }
    const realPath = resolve(realpathSync(path))
    return confined(realRoot, realPath) && lstatSync(path).isFile()
  } catch {
    return false
  }
}

function readProviderJson(providerRoot: string, path: string): unknown {
  if (!providerFileIsConfined(providerRoot, path)) throw new Error(`provider path is missing, non-regular, symlinked, or outside provider root: ${relative(resolve(providerRoot), resolve(path))}`)
  return json(path)
}

const readReceipt = (input: Revision2MaterializationInput, releaseRoot: string): unknown => {
  if (input.receiptPath && !providerFileIsConfined(input.providerRoot, resolve(input.receiptPath))) {
    throw new Error('explicit provider receipt path is missing, non-regular, symlinked, or outside provider root')
  }
  const candidates = [input.receiptPath, resolve(releaseRoot, 'receipt.json'), resolve(releaseRoot, 'release-receipt.json'), resolve(releaseRoot, 'cache-receipt.json'), resolve(input.providerRoot, 'docs/evidence/master-website-template-v2/a1-provider-gate/provider-gate-receipt.json'), resolve(input.providerRoot, 'materialization/cache/cache-receipt.json')].filter((candidate): candidate is string => Boolean(candidate))
  for (const candidate of candidates) {
    try {
      const resolvedCandidate = resolve(candidate)
      if (!providerFileIsConfined(input.providerRoot, resolvedCandidate)) continue
      const value = json(resolvedCandidate)
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
    if (!providerFileIsConfined(providerRoot, cataloguePath)) throw new Error('provider catalogue path is missing, non-regular, symlinked, or outside provider root')
    const catalogueBytes = readFileSync(cataloguePath, 'utf8')
    const catalogue = JSON.parse(catalogueBytes) as unknown
    const manifest = readProviderJson(providerRoot, resolve(releaseRoot, 'manifest.json'))
    const inventory = readProviderJson(providerRoot, resolve(releaseRoot, 'inventory.json'))
    const dependencyLock = readProviderJson(providerRoot, resolve(releaseRoot, 'dependency-lock.json'))
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
  const validated = validateExactRelease(bundle, input.pin, { selectionPolicy: input.selectionPolicy })
  if (!validated.ok) return validated
  const admitted = admitWebsiteTemplateMaterialization(validated, { selectionPolicy: input.selectionPolicy })
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
  const adapter = identity({ id: MASTER_TEMPLATE_ADAPTER_ID, version: MASTER_TEMPLATE_ADAPTER_VERSION, mappingDigest: MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST })
  const effective = identity({ candidate, materialization, adapter, payload: null })
  return Object.freeze({
    schemaVersion: 1,
    packet: 'LS-05',
    verdicts: EXPECTED_RECEIPT_VERDICTS,
    provider: { repository: 'https://github.com/linktrend/LiNKlibraries.git', commitSha: input.pin.providerCommitSha ?? input.pin.sourceCommitSha, treeSha: input.pin.providerTreeSha ?? input.pin.sourceTreeSha, sourceReleaseCommitSha: input.pin.sourceCommitSha, sourceReleaseTreeSha: input.pin.sourceTreeSha },
    release: { entryId: reference.entryId, version: reference.version, artifactTreeSha1: reference.artifactTreeSha1, releaseManifestSha256: reference.releaseManifestSha256, inventorySha256: reference.inventorySha256, payloadSha256: reference.payloadSha256, dependencyLockSha256: reference.dependencyLockSha256, releaseSourceCommitSha: reference.releaseSourceCommitSha, releaseSourceTreeSha: reference.releaseSourceTreeSha },
    adapter: { id: MASTER_TEMPLATE_ADAPTER_ID, version: MASTER_TEMPLATE_ADAPTER_VERSION, mappingDigest: MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST },
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
  try {
    const stat = lstatSync(path)
    if (stat.isSymbolicLink() || !stat.isFile()) throw new Error('not a regular file')
    return json(path)
  } catch (error) {
    if (error instanceof Error && error.message === 'not a regular file') throw new Error(`consumer cache JSON path is not a regular file: ${path}`)
    throw new Error(`consumer cache JSON is invalid: ${path}`)
  }
}
function safeCachePath(root: string, candidate: string): boolean {
  const resolved = resolve(candidate)
  const lexicalRoot = resolve(root)
  const prefix = lexicalRoot.endsWith(sep) ? lexicalRoot : `${lexicalRoot}${sep}`
  if (resolved !== lexicalRoot && !resolved.startsWith(prefix)) return false

  // Lexical containment is insufficient when an existing path component is a
  // symlink. Refuse every existing symlinked ancestor and compare the
  // physical paths before callers read or write the cache entry.
  try {
    const rootStat = lstatSync(lexicalRoot)
    if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) return false
    const realRoot = resolve(realpathSync(lexicalRoot))
    let existing = lexicalRoot
    for (const part of relative(lexicalRoot, resolved).split(sep).filter(Boolean)) {
      const next = join(existing, part)
      try {
        const stat = lstatSync(next)
        if (stat.isSymbolicLink()) return false
        existing = next
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') return false
        break
      }
    }
    const realExisting = resolve(realpathSync(existing))
    const realPrefix = realRoot.endsWith(sep) ? realRoot : `${realRoot}${sep}`
    return realExisting === realRoot || realExisting.startsWith(realPrefix)
  } catch {
    return false
  }
}

function receiptVerdictsAreExpected(value: unknown): value is Revision2MaterializationReceipt['verdicts'] {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const verdicts = value as Record<string, unknown>
  return Object.keys(verdicts).length === Object.keys(EXPECTED_RECEIPT_VERDICTS).length
    && verdicts.materialization === EXPECTED_RECEIPT_VERDICTS.materialization
    && verdicts.compatibility === EXPECTED_RECEIPT_VERDICTS.compatibility
    && verdicts.projection === EXPECTED_RECEIPT_VERDICTS.projection
}

function recomputeReceiptIdentities(receipt: Revision2MaterializationReceipt): Revision2MaterializationReceipt['identities'] | null {
  if (!receipt || !receipt.provider || !receipt.release || !receipt.cache || !Array.isArray(receipt.cache.inventory) || !receipt.adapter || !receipt.identities) return null
  if (!SHA1.test(receipt.provider.commitSha) || !SHA1.test(receipt.provider.treeSha) || typeof receipt.release.entryId !== 'string' || typeof receipt.release.version !== 'string' || !SHA1.test(receipt.release.artifactTreeSha1) || !SHA1.test(receipt.release.releaseSourceCommitSha) || !SHA1.test(receipt.release.releaseSourceTreeSha) || !SHA256.test(receipt.release.releaseManifestSha256) || !SHA256.test(receipt.release.inventorySha256) || !SHA256.test(receipt.release.payloadSha256) || !SHA256.test(receipt.release.dependencyLockSha256) || typeof receipt.adapter.id !== 'string' || typeof receipt.adapter.version !== 'string' || !SHA1.test(receipt.adapter.mappingDigest) || typeof receipt.cache.entryDirectory !== 'string') return null
  if (!receipt.cache.inventory.every((item) => item && typeof item.path === 'string' && SHA256.test(item.sha256) && Number.isSafeInteger(item.byteLength) && item.byteLength >= 0)) return null
  if ((receipt.identities.payload !== null && !SHA1.test(receipt.identities.payload)) || !SHA1.test(receipt.identities.candidate) || !SHA1.test(receipt.identities.materialization) || !SHA1.test(receipt.identities.adapter) || !SHA1.test(receipt.identities.effective)) return null
  const candidate = identity({ provider: receipt.provider.commitSha, tree: receipt.provider.treeSha, entryId: receipt.release.entryId, version: receipt.release.version, artifactTreeSha1: receipt.release.artifactTreeSha1 })
  const materialization = identity({ candidate, inventory: receipt.cache.inventory })
  const adapter = identity({ id: receipt.adapter.id, version: receipt.adapter.version, mappingDigest: receipt.adapter.mappingDigest })
  const effective = identity({ candidate, materialization, adapter, payload: receipt.identities.payload ?? null })
  return { candidate, materialization, adapter, payload: receipt.identities.payload ?? null, effective }
}

function sameIdentities(left: Revision2MaterializationReceipt['identities'], right: Revision2MaterializationReceipt['identities']): boolean {
  return left.candidate === right.candidate && left.materialization === right.materialization && left.adapter === right.adapter && left.payload === right.payload && left.effective === right.effective
}

function writeCache(cacheRoot: string, receipt: Revision2MaterializationReceipt, files: Record<string, string>): void {
  const dirs = cachePaths(cacheRoot)
  if (existsSync(dirs.root) && (!safeCachePath(dirs.root, dirs.root) || !safeCachePath(dirs.root, dirs.entries) || !safeCachePath(dirs.root, dirs.staging))) throw new Error('consumer cache root contains a symlinked path component')
  mkdirSync(dirs.root, { recursive: true }); mkdirSync(dirs.entries, { recursive: true }); mkdirSync(dirs.staging, { recursive: true })
  const prior = readJson(dirs.active)
  const entryDir = join(dirs.entries, receipt.release.artifactTreeSha1)
  const stagingDir = join(dirs.staging, `${receipt.release.artifactTreeSha1}.${process.pid}`)
  if (!safeCachePath(dirs.entries, entryDir) || !safeCachePath(dirs.staging, stagingDir)) throw new Error('consumer cache entry path contains a symlinked path component')
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
  if (!active || typeof active.entryDirectory !== 'string' || typeof active.receiptPath !== 'string' || typeof active.identity !== 'string' || typeof active.entryId !== 'string' || typeof active.version !== 'string') return failure(['consumer cache active pointer is absent or invalid'])
  const entryDir = resolve(dirs.root, active.entryDirectory)
  if (!safeCachePath(dirs.root, entryDir)) return failure(['consumer cache entry path escapes cache root'])
  const receiptPath = resolve(dirs.root, active.receiptPath)
  if (!safeCachePath(dirs.root, receiptPath)) return failure(['consumer cache receipt path escapes cache root'])
  if (receiptPath !== resolve(entryDir, 'materialization-receipt.json')) return failure(['consumer cache receipt path is not bound to the active entry'])
  let receipt: Revision2MaterializationReceipt
  try { receipt = readJson(receiptPath) as Revision2MaterializationReceipt } catch (error) { return failure([error instanceof Error ? error.message : 'consumer cache receipt is absent']) }
  if (!receipt || receipt.packet !== 'LS-05' || !receiptVerdictsAreExpected(receipt.verdicts) || receipt.cache?.entryDirectory !== active.entryDirectory || receipt.release?.entryId !== active.entryId || receipt.release?.version !== active.version || receipt.identities?.effective !== active.identity) return failure(['consumer cache materialization receipt is not bound to the active pointer'])
  if (receipt.adapter?.id !== MASTER_TEMPLATE_ADAPTER_ID || receipt.adapter?.version !== MASTER_TEMPLATE_ADAPTER_VERSION || receipt.adapter?.mappingDigest !== MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST) return failure(['consumer cache materialization receipt adapter mapping is not canonical'])
  const recomputed = recomputeReceiptIdentities(receipt)
  if (!recomputed || !sameIdentities(receipt.identities, recomputed)) return failure(['consumer cache materialization receipt identities are invalid'])
  if (!Array.isArray(receipt.cache.inventory)) return failure(['consumer cache materialization receipt inventory is invalid'])
  const files: Record<string, string> = {}
  for (const item of receipt.cache.inventory) {
    if (!item || typeof item.path !== 'string') return failure(['consumer cache inventory path is invalid'])
    const path = resolve(entryDir, item.path)
    if (!safeCachePath(entryDir, path)) return failure([`consumer cache inventory path escapes entry: ${item.path}`])
    try { const stat = lstatSync(path); if (!stat.isFile()) return failure([`consumer cache path is not a regular file: ${item.path}`]); const bytes = readFileSync(path); if (bytes.byteLength !== item.byteLength || sha256(bytes) !== item.sha256) return failure([`consumer cache digest mismatch: ${item.path}`]); files[item.path] = bytes.toString('utf8') } catch { return failure([`consumer cache file is missing: ${item.path}`]) }
  }
  const reference = Object.freeze({ authority: 'linksites_local' as const, libraryAuthority: 'reference_only' as const, materialization: 'input_reference_only' as const, artifactType: 'website_template' as const, sourceCommitSha: receipt.provider.sourceReleaseCommitSha, sourceTreeSha: receipt.provider.sourceReleaseTreeSha, releaseSourceCommitSha: receipt.release.releaseSourceCommitSha, releaseSourceTreeSha: receipt.release.releaseSourceTreeSha, artifactTreeSha1: receipt.release.artifactTreeSha1, entryId: receipt.release.entryId, version: receipt.release.version, releaseManifestSha256: receipt.release.releaseManifestSha256, inventorySha256: receipt.release.inventorySha256, payloadSha256: receipt.release.payloadSha256, dependencyLockSha256: receipt.release.dependencyLockSha256, receiptType: 'candidate' as const, receiptId: receipt.identities.candidate })
  return { ok: true, value: Object.freeze({ reference, providerRoot: '', releaseRoot: entryDir, artifactRoot: entryDir, files: Object.freeze(files), mode: 'offline_cache' as const, cacheRoot: dirs.root, materializationReceipt: receipt }) }
}

/** Rehydrate only from the consumer-owned cache; no provider checkout is read. */
export function offlineRestartRevision2WebsiteTemplate(input: Revision2OfflineRestartInput): Revision2Result<Revision2MaterializedWebsiteTemplate> {
  let active: any
  try { active = readJson(cachePaths(input.cacheRoot).active) } catch (error) { return failure([error instanceof Error ? error.message : 'consumer cache active pointer is invalid']) }
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

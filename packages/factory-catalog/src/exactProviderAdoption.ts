/**
 * LSFACT-01 exact provider adoption and deterministic assembly.
 *
 * Accepts only injected provenance-bearing handoffs. Provider implementation
 * source is never copied; only declared metadata bytes supplied by the caller
 * are cached. Production selection stays fail-closed for the current truthful
 * identities: marketing-smb-v1 remains quarantined/non-selectable and
 * master-template-type-1 remains planning/candidate.
 */

import { createHash } from 'node:crypto'
import { existsSync, lstatSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join, relative, resolve, sep } from 'node:path'
import {
  LSDATA01_NON_ADMITTED_FIXTURE_TREES,
  assertSiteAdoptionIdentities,
  type SiteAdoptionIdentities,
} from './adoptionIdentities.ts'
import {
  capabilityCreditBudget,
  checkCapabilityCredits,
  dispositionCreditsForPages,
  freezeEntitlementSnapshot,
  type CapabilityCreditPlanId,
  type CreditDispositionRecord,
  type ImmutableEntitlementSnapshot,
} from './capabilityCredits.ts'
import { canonicalJsonChecksum, canonicalJsonStringify } from './libraryConsumer.ts'
import { LINKLIBRARIES_REPOSITORY_URL, MASTER_TEMPLATE_PIN } from './masterTemplatePin.ts'
import { rejectStaleMarketingSmbAuthority } from './masterTemplateConsumer.ts'
import { assembleSiteManifest, type AssembleSiteManifestInput, type SiteAssemblyManifest } from './siteAssemblyManifest.ts'
import { resolveSiteSpecification, type ResolveSiteSpecificationInput, type SiteSpecification } from './siteSpecification.ts'
import { classifyPageCost } from './verticalKit.ts'
import { buildPromotionRequestFromPreparedWorkingContent } from './workingContentPayloadPromotion.ts'
import type { WorkingContentPromotionInput } from './workingContent.ts'
import type { PromotionRequest } from './promotionService.ts'

export const LSFACT01_PACKET = 'LSFACT-01' as const

export const LSFACT01_HOLD = Object.freeze({
  marketingSmbV1: 'quarantined/non-selectable; not production admission',
  masterTemplateType1: 'planning/candidate; draft/non_selectable/unknown; not production admission',
  selectableHandoffs: 'exact selectable Library releases remain a later source-release and live-acceptance gate',
})

export const LSFACT01_LIBRARIES_PROVENANCE = Object.freeze({
  repository: 'linktrend/LiNKlibraries',
  commit: '5188aaf1a9313a3746075cd6ccea0937c05f7a32',
  tree: 'e389671f1dc19f6c1e17a2fd3520f4d9e3b1c139',
})

const SHA1 = /^[a-f0-9]{40}$/
const SHA256 = /^[a-f0-9]{64}$/
const RELATIVE_PATH = /^(?!\/)(?!.*(?:^|\/)\.\.(?:\/|$))(?!.*\\)[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*$/
const RESERVED_ROUTES = new Set(['/admin', '/api', '/_next', '/cms', '/login'])
const PRODUCT_PAGE_TYPES = new Set(['product', 'products'])
const SERVICE_PAGE_TYPES = new Set(['service', 'services'])

export type ProviderFamilyId = 'marketing-smb-v1' | 'master-template-type-1'
export type ExactHandoffLifecycle = 'quarantined' | 'draft' | 'admitted' | 'selectable' | 'deprecated' | 'withdrawn' | 'rejected'
export type ExactHandoffSelectability = 'selectable' | 'conditionally_selectable' | 'non_selectable'
export type ExactHandoffCompatibility = 'compatible' | 'conditionally_compatible' | 'incompatible' | 'unknown' | 'not_applicable'

export class ExactProviderAdoptionError extends Error {
  constructor(
    message: string,
    readonly code:
      | 'invalid_handoff'
      | 'tampered'
      | 'lifecycle_denied'
      | 'production_denied'
      | 'unknown_identity'
      | 'unproven'
      | 'fixture_denied'
      | 'path_escape'
      | 'pin_immutable'
      | 'upgrade_failed'
      | 'assembly_denied'
      | 'cache_invalid',
  ) {
    super(message)
    this.name = 'ExactProviderAdoptionError'
  }
}

export interface ExactProviderFile {
  path: string
  sha256: string
  bytes: string
}

export interface ExactProviderPin {
  repositoryUrl: string
  commit: string
  tree: string
  entryId: string
  version: string
  lifecycle: ExactHandoffLifecycle
  selectability: ExactHandoffSelectability
  compatibility: ExactHandoffCompatibility
  manifestSha256: string
  inventorySha256: string
  dependencyLockSha256: string
  artifactDigest: string
}

export interface ExactProviderHandoff {
  schemaVersion: 1
  kind: 'linksites.exact-provider-handoff'
  packet: typeof LSFACT01_PACKET
  injected: true
  family: ProviderFamilyId
  producer: { repository: string; commit: string; tree: string }
  entryId: string
  version: string
  lifecycle: ExactHandoffLifecycle
  selectability: ExactHandoffSelectability
  compatibility: ExactHandoffCompatibility
  production: false
  publicationClass: 'injected-exact-handoff'
  pin: ExactProviderPin
  files: readonly ExactProviderFile[]
  provenance: {
    sourceRepository: string
    sourceCommit: string
    sourceTree: string
    checkoutRequired: false
  }
}

export interface BoundExactProvider {
  family: ProviderFamilyId
  handoff: ExactProviderHandoff
  digest: string
  productionSelectable: false
  hold: string
}

export interface ExactProviderCacheReceipt {
  schemaVersion: 1
  packet: typeof LSFACT01_PACKET
  digest: string
  family: ProviderFamilyId
  entryId: string
  version: string
  providerCheckoutRequired: false
  inventory: ReadonlyArray<{ path: string; sha256: string; byteLength: number }>
}

export interface ExistingSitePin {
  tenantOrgId: string
  siteId: string
  adoptionIdentities: SiteAdoptionIdentities
  boundHandoffDigest: string
  family: ProviderFamilyId
  cacheIdentity: string
}

export interface ExactCapabilityResolution {
  planId: CapabilityCreditPlanId
  grantedCredits: number
  productsDistinctFromServices: true
  capabilities: ReadonlyArray<{
    pageType: string
    family: 'product' | 'service' | 'other-capability' | 'zero-cost'
    creditCost: 0 | 1
    activationAllowed: boolean
  }>
  pages: ReadonlyArray<{ route: string; pageType: string }>
  routes: readonly string[]
  navigation: readonly string[]
  sections: ReadonlyArray<{ route: string; sectionId: string; pageType: string }>
  content: Readonly<{ locale: string; workingContentBound: boolean }>
  credits: CreditDispositionRecord[]
  digest: string
}

export interface ExactProviderRuntime {
  bind(handoff: ExactProviderHandoff): BoundExactProvider
  materialize(bound: BoundExactProvider): ExactProviderCacheReceipt
  restartFromCache(expectedDigest: string): ExactProviderCacheReceipt
  pinExistingSite(pin: ExistingSitePin): ExistingSitePin
  retainExistingSitePin(siteId: string, nextDefault: BoundExactProvider): ExistingSitePin
  upgradeOrKeepPrior(siteId: string, next: ExactProviderHandoff): { ok: boolean; pin: ExistingSitePin; reason?: string }
  rollback(siteId: string): ExistingSitePin
  getPin(siteId: string): ExistingSitePin | undefined
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function sha256Utf8(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

function confined(root: string, candidate: string): boolean {
  const prefix = root.endsWith(sep) ? root : `${root}${sep}`
  return candidate === root || candidate.startsWith(prefix)
}

function familyHold(family: ProviderFamilyId): string {
  return family === 'marketing-smb-v1' ? LSFACT01_HOLD.marketingSmbV1 : LSFACT01_HOLD.masterTemplateType1
}

function inventoryDigest(files: readonly ExactProviderFile[]): string {
  return canonicalJsonChecksum(files.map((file) => ({ path: file.path, sha256: file.sha256 })))
}

function artifactDigest(files: readonly ExactProviderFile[]): string {
  return canonicalJsonChecksum(files.map((file) => ({ path: file.path, sha256: file.sha256, bytes: file.bytes })))
}

function deny(code: ExactProviderAdoptionError['code'], message: string): never {
  throw new ExactProviderAdoptionError(message, code)
}

function assertSha1(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || !SHA1.test(value)) deny('invalid_handoff', `${label} must be a lowercase 40-character SHA-1.`)
}

function assertSha256(value: unknown, label: string): asserts value is string {
  if (typeof value !== 'string' || !SHA256.test(value)) deny('invalid_handoff', `${label} must be a lowercase SHA-256.`)
}

function truthfulLifecycle(family: ProviderFamilyId): { lifecycle: ExactHandoffLifecycle; selectability: ExactHandoffSelectability; compatibility: ExactHandoffCompatibility } {
  if (family === 'marketing-smb-v1') {
    return { lifecycle: 'quarantined', selectability: 'non_selectable', compatibility: 'unknown' }
  }
  return { lifecycle: 'draft', selectability: 'non_selectable', compatibility: 'unknown' }
}

function assertFileList(files: unknown): ExactProviderFile[] {
  if (!Array.isArray(files) || files.length < 1) deny('invalid_handoff', 'Exact handoff must inject at least one declared metadata file.')
  const seen = new Set<string>()
  return files.map((file, index) => {
    if (!isRecord(file)) deny('invalid_handoff', `files[${index}] is not an object.`)
    if (typeof file.path !== 'string' || !RELATIVE_PATH.test(file.path)) deny('path_escape', `Handoff file path is unsafe: ${String(file.path)}`)
    if (seen.has(file.path)) deny('invalid_handoff', `Duplicate handoff file path "${file.path}".`)
    seen.add(file.path)
    if (typeof file.bytes !== 'string') deny('invalid_handoff', `files[${index}].bytes must be a string.`)
    assertSha256(file.sha256, `files[${index}].sha256`)
    if (sha256Utf8(file.bytes) !== file.sha256) deny('tampered', `Handoff file digest mismatch: ${file.path}`)
    return { path: file.path, sha256: file.sha256, bytes: file.bytes }
  })
}

function assertClosedHandoff(value: unknown): asserts value is ExactProviderHandoff {
  if (!isRecord(value)) deny('invalid_handoff', 'Exact provider handoff must be an object.')
  const required = [
    'schemaVersion',
    'kind',
    'packet',
    'injected',
    'family',
    'producer',
    'entryId',
    'version',
    'lifecycle',
    'selectability',
    'compatibility',
    'production',
    'publicationClass',
    'pin',
    'files',
    'provenance',
  ]
  for (const key of Object.keys(value)) {
    if (!required.includes(key)) deny('invalid_handoff', `Unexpected handoff field "${key}".`)
  }
  for (const key of required) {
    if (!(key in value)) deny('invalid_handoff', `Exact provider handoff is missing ${key}.`)
  }
}

export function sealExactProviderHandoff(input: {
  family: ProviderFamilyId
  version: string
  producer?: ExactProviderHandoff['producer']
  pinCommit?: string
  pinTree?: string
  files: ReadonlyArray<{ path: string; bytes: string }>
  dependencyLock?: unknown
}): ExactProviderHandoff {
  const truth = truthfulLifecycle(input.family)
  const files = input.files.map((file) => ({ path: file.path, bytes: file.bytes, sha256: sha256Utf8(file.bytes) }))
  const producer = input.producer ?? LSFACT01_LIBRARIES_PROVENANCE
  const pinCommit = input.pinCommit ?? producer.commit
  const pinTree = input.pinTree ?? producer.tree
  const lock = input.dependencyLock ?? { packages: [], services: [] }
  const pinBase = {
    repositoryUrl: LINKLIBRARIES_REPOSITORY_URL,
    commit: pinCommit,
    tree: pinTree,
    entryId: input.family,
    version: input.version,
    lifecycle: truth.lifecycle,
    selectability: truth.selectability,
    compatibility: truth.compatibility,
  }
  const pin: ExactProviderPin = {
    ...pinBase,
    manifestSha256: canonicalJsonChecksum(pinBase),
    inventorySha256: inventoryDigest(files),
    dependencyLockSha256: canonicalJsonChecksum(lock),
    artifactDigest: artifactDigest(files),
  }
  return {
    schemaVersion: 1,
    kind: 'linksites.exact-provider-handoff',
    packet: LSFACT01_PACKET,
    injected: true,
    family: input.family,
    producer,
    entryId: input.family,
    version: input.version,
    lifecycle: truth.lifecycle,
    selectability: truth.selectability,
    compatibility: truth.compatibility,
    production: false,
    publicationClass: 'injected-exact-handoff',
    pin,
    files,
    provenance: {
      sourceRepository: producer.repository,
      sourceCommit: producer.commit,
      sourceTree: producer.tree,
      checkoutRequired: false,
    },
  }
}

export function assertExactProviderHandoff(value: unknown): ExactProviderHandoff {
  assertClosedHandoff(value)
  if (value.schemaVersion !== 1 || value.kind !== 'linksites.exact-provider-handoff' || value.packet !== LSFACT01_PACKET) {
    deny('invalid_handoff', 'Handoff is not an injected LSFACT-01 exact provider handoff.')
  }
  if (value.injected !== true) deny('invalid_handoff', 'Only injected exact provenance-bearing handoffs are accepted.')
  if (value.production !== false || value.publicationClass !== 'injected-exact-handoff') {
    deny('production_denied', 'Current truthful handoffs are not production-admitted.')
  }
  if (value.family !== 'marketing-smb-v1' && value.family !== 'master-template-type-1') {
    deny('unknown_identity', `Unknown provider family "${String(value.family)}" rejected.`)
  }
  if (!isRecord(value.producer) || typeof value.producer.repository !== 'string') deny('invalid_handoff', 'Handoff producer identity is required.')
  assertSha1(value.producer.commit, 'producer.commit')
  assertSha1(value.producer.tree, 'producer.tree')
  if (!isRecord(value.pin)) deny('invalid_handoff', 'Handoff pin is required.')
  if (value.entryId !== value.family || value.pin.entryId !== value.family) {
    deny('invalid_handoff', 'Handoff family/entry identity is inconsistent.')
  }
  if (typeof value.version !== 'string' || value.version.trim() === '' || value.pin.version !== value.version) {
    deny('invalid_handoff', 'Handoff version identity is missing or inconsistent.')
  }
  if (value.pin.repositoryUrl !== LINKLIBRARIES_REPOSITORY_URL) deny('invalid_handoff', 'Provider pin repository must be LiNKlibraries.')
  assertSha1(value.pin.commit, 'pin.commit')
  assertSha1(value.pin.tree, 'pin.tree')
  assertSha256(value.pin.manifestSha256, 'pin.manifestSha256')
  assertSha256(value.pin.inventorySha256, 'pin.inventorySha256')
  assertSha256(value.pin.dependencyLockSha256, 'pin.dependencyLockSha256')
  assertSha256(value.pin.artifactDigest, 'pin.artifactDigest')
  if (value.pin.tree === LSDATA01_NON_ADMITTED_FIXTURE_TREES.masterTemplateType1Artifact) {
    deny('fixture_denied', 'Provider fixture trees are not production admission and cannot be activated.')
  }
  if (!isRecord(value.provenance) || value.provenance.checkoutRequired !== false) {
    deny('invalid_handoff', 'Exact handoff provenance must declare checkoutRequired=false.')
  }
  assertSha1(value.provenance.sourceCommit, 'provenance.sourceCommit')
  assertSha1(value.provenance.sourceTree, 'provenance.sourceTree')
  if (value.provenance.sourceCommit !== value.producer.commit || value.provenance.sourceTree !== value.producer.tree) {
    deny('invalid_handoff', 'Handoff provenance is not bound to the producer identity.')
  }
  const files = assertFileList(value.files)
  if (inventoryDigest(files) !== value.pin.inventorySha256) deny('tampered', 'Inventory digest does not match the injected files.')
  if (artifactDigest(files) !== value.pin.artifactDigest) deny('tampered', 'Artifact digest does not match the injected files.')
  const pinBase = {
    repositoryUrl: value.pin.repositoryUrl,
    commit: value.pin.commit,
    tree: value.pin.tree,
    entryId: value.pin.entryId,
    version: value.pin.version,
    lifecycle: value.pin.lifecycle,
    selectability: value.pin.selectability,
    compatibility: value.pin.compatibility,
  }
  if (canonicalJsonChecksum(pinBase) !== value.pin.manifestSha256) deny('tampered', 'Manifest digest does not match the pinned identity.')
  if (
    value.lifecycle !== value.pin.lifecycle ||
    value.selectability !== value.pin.selectability ||
    value.compatibility !== value.pin.compatibility
  ) {
    deny('invalid_handoff', 'Handoff lifecycle fields are not bound to the pin.')
  }
  const truth = truthfulLifecycle(value.family)
  if (value.family === 'marketing-smb-v1') {
    if (
      value.lifecycle === 'admitted' ||
      value.lifecycle === 'selectable' ||
      value.selectability === 'selectable' ||
      value.compatibility === 'compatible'
    ) {
      rejectStaleMarketingSmbAuthority({ entryId: value.entryId, status: 'approved', selectability: value.selectability })
    }
    if (value.lifecycle !== truth.lifecycle || value.selectability !== truth.selectability || value.compatibility !== truth.compatibility) {
      deny('lifecycle_denied', 'marketing-smb-v1 remains quarantined/non-selectable; relabeling fixtures is rejected.')
    }
  }
  if (value.family === 'master-template-type-1') {
    if (value.lifecycle !== truth.lifecycle || value.selectability !== truth.selectability || value.compatibility !== truth.compatibility) {
      deny('lifecycle_denied', 'master-template-type-1 remains planning/candidate (draft/non_selectable/unknown).')
    }
    if (value.pin.commit === MASTER_TEMPLATE_PIN.commitSha && value.pin.tree !== MASTER_TEMPLATE_PIN.providerTreeSha) {
      deny('tampered', 'Master template pin tree does not match the frozen candidate identity.')
    }
  }
  if (value.compatibility === 'unknown') {
    /* unproven is bindable but never production-selectable; recorded on the bound object */
  }
  return Object.freeze({
    ...value,
    files: Object.freeze(files.map((file) => Object.freeze({ ...file }))),
    pin: Object.freeze({ ...value.pin }),
    producer: Object.freeze({ ...value.producer }),
    provenance: Object.freeze({ ...value.provenance }),
  })
}

export function bindExactProviderHandoff(value: unknown): BoundExactProvider {
  const handoff = assertExactProviderHandoff(value)
  return Object.freeze({
    family: handoff.family,
    handoff,
    digest: canonicalJsonChecksum({
      family: handoff.family,
      pin: handoff.pin,
      producer: handoff.producer,
      artifactDigest: handoff.pin.artifactDigest,
    }),
    productionSelectable: false,
    hold: familyHold(handoff.family),
  })
}

export function selectExactProviderForProduction(value: unknown): never {
  let bound: BoundExactProvider | undefined
  try {
    bound = bindExactProviderHandoff(value)
  } catch (error) {
    if (error instanceof ExactProviderAdoptionError) throw error
    deny('production_denied', error instanceof Error ? error.message : String(error))
  }
  const reasons = [
    bound.handoff.lifecycle === 'quarantined' ? 'quarantined' : null,
    bound.handoff.lifecycle === 'draft' ? 'draft' : null,
    bound.handoff.selectability !== 'selectable' ? 'non-selectable' : null,
    bound.handoff.compatibility === 'unknown' ? 'unproven' : null,
    bound.handoff.compatibility === 'incompatible' ? 'incompatible' : null,
    bound.handoff.production === false ? 'unproven' : null,
    bound.handoff.injected ? 'fixture' : null,
  ].filter((reason): reason is string => Boolean(reason))
  deny(
    bound.handoff.compatibility === 'unknown' ? 'unproven' : 'production_denied',
    `Production selection fail-closed for ${bound.family}: ${reasons.join(', ')}. HOLD: ${bound.hold}`,
  )
}

function cachePaths(cacheRoot: string) {
  const root = resolve(cacheRoot)
  return { root, active: join(root, 'active.json'), previous: join(root, 'previous.json'), entries: join(root, 'entries') }
}

function writeJsonAtomic(path: string, value: unknown): void {
  const temp = `${path}.tmp-${process.pid}`
  writeFileSync(temp, `${canonicalJsonStringify(value)}\n`, { encoding: 'utf8', flag: 'wx' })
  renameSync(temp, path)
}

function readJson(path: string): unknown {
  if (!existsSync(path)) return null
  const stat = lstatSync(path)
  if (stat.isSymbolicLink() || !stat.isFile()) deny('cache_invalid', `Cache path is not a regular file: ${path}`)
  return JSON.parse(readFileSync(path, 'utf8')) as unknown
}

export function materializeExactProvider(bound: BoundExactProvider, cacheRoot: string): ExactProviderCacheReceipt {
  if (!bound || bound.productionSelectable !== false) deny('production_denied', 'Materialization requires a bound non-production handoff.')
  const dirs = cachePaths(cacheRoot)
  mkdirSync(dirs.root, { recursive: true })
  mkdirSync(dirs.entries, { recursive: true })
  const entryDir = join(dirs.entries, bound.digest)
  if (!confined(dirs.entries, entryDir)) deny('path_escape', 'Cache entry path escapes the cache root.')
  const staging = join(dirs.root, `staging-${process.pid}`)
  rmSync(staging, { recursive: true, force: true })
  mkdirSync(staging, { recursive: true })
  const inventory: Array<{ path: string; sha256: string; byteLength: number }> = []
  try {
    for (const file of bound.handoff.files) {
      const destination = resolve(staging, file.path)
      if (!confined(staging, destination) || relative(staging, destination).startsWith(`..${sep}`)) {
        deny('path_escape', `Cache path escapes staging: ${file.path}`)
      }
      mkdirSync(resolve(destination, '..'), { recursive: true })
      writeFileSync(destination, file.bytes, { encoding: 'utf8', flag: 'wx' })
      if (sha256Utf8(file.bytes) !== file.sha256) deny('tampered', `Refusing to cache tampered bytes: ${file.path}`)
      inventory.push({ path: file.path, sha256: file.sha256, byteLength: Buffer.byteLength(file.bytes) })
    }
    const receipt: ExactProviderCacheReceipt = Object.freeze({
      schemaVersion: 1,
      packet: LSFACT01_PACKET,
      digest: bound.digest,
      family: bound.family,
      entryId: bound.handoff.entryId,
      version: bound.handoff.version,
      providerCheckoutRequired: false,
      inventory: Object.freeze(inventory),
    })
    writeJsonAtomic(join(staging, 'handoff-receipt.json'), receipt)
    writeJsonAtomic(join(staging, 'handoff.json'), bound.handoff)
    rmSync(entryDir, { recursive: true, force: true })
    renameSync(staging, entryDir)
    const prior = readJson(dirs.active)
    if (prior) writeJsonAtomic(dirs.previous, prior)
    writeJsonAtomic(dirs.active, { schemaVersion: 1, digest: bound.digest, entryDirectory: relative(dirs.root, entryDir) })
    return receipt
  } catch (error) {
    rmSync(staging, { recursive: true, force: true })
    if (error instanceof ExactProviderAdoptionError) throw error
    deny('cache_invalid', error instanceof Error ? error.message : 'Consumer cache write failed.')
  }
}

export function restartExactProviderFromCache(cacheRoot: string, expectedDigest: string): ExactProviderCacheReceipt {
  const dirs = cachePaths(cacheRoot)
  const active = readJson(dirs.active)
  if (!isRecord(active) || typeof active.digest !== 'string' || typeof active.entryDirectory !== 'string') {
    deny('cache_invalid', 'Consumer cache active pointer is absent.')
  }
  if (active.digest !== expectedDigest) deny('cache_invalid', 'Consumer cache identity does not match the requested exact digest.')
  return verifyCachedEntry(dirs.root, active)
}

export function rollbackExactProviderCache(cacheRoot: string): ExactProviderCacheReceipt {
  const dirs = cachePaths(cacheRoot)
  const active = readJson(dirs.active)
  const previous = readJson(dirs.previous)
  if (!isRecord(previous) || typeof previous.digest !== 'string' || typeof previous.entryDirectory !== 'string') {
    deny('upgrade_failed', 'Consumer cache rollback is unavailable.')
  }
  const restored = verifyCachedEntry(dirs.root, previous)
  writeJsonAtomic(dirs.previous, active)
  writeJsonAtomic(dirs.active, previous)
  return restored
}

function verifyCachedEntry(cacheRoot: string, pointer: Record<string, unknown>): ExactProviderCacheReceipt {
  if (typeof pointer.digest !== 'string' || typeof pointer.entryDirectory !== 'string') {
    deny('cache_invalid', 'Consumer cache pointer is absent.')
  }
  const entryDir = resolve(cacheRoot, pointer.entryDirectory)
  if (!confined(resolve(cacheRoot), entryDir)) deny('path_escape', 'Cached entry escapes cache root.')
  const receipt = readJson(join(entryDir, 'handoff-receipt.json'))
  const handoff = readJson(join(entryDir, 'handoff.json'))
  if (!isRecord(receipt) || receipt.digest !== pointer.digest || receipt.providerCheckoutRequired !== false) {
    deny('cache_invalid', 'Cached handoff receipt is missing or still requires a provider checkout.')
  }
  const bound = bindExactProviderHandoff(handoff)
  if (bound.digest !== pointer.digest) deny('tampered', 'Cached handoff digest does not match the pointer.')
  if (!Array.isArray(receipt.inventory)) deny('cache_invalid', 'Cached inventory is invalid.')
  for (const item of receipt.inventory) {
    if (!isRecord(item) || typeof item.path !== 'string' || typeof item.sha256 !== 'string') deny('cache_invalid', 'Cached inventory entry is invalid.')
    const path = resolve(entryDir, item.path)
    if (!confined(entryDir, path)) deny('path_escape', `Cached file escapes entry: ${item.path}`)
    const bytes = readFileSync(path, 'utf8')
    if (sha256Utf8(bytes) !== item.sha256) deny('tampered', `Cached file digest mismatch: ${item.path}`)
  }
  return receipt as unknown as ExactProviderCacheReceipt
}

function catalogFamily(pageType: string): ExactCapabilityResolution['capabilities'][number]['family'] {
  const key = pageType.trim().toLowerCase()
  if (PRODUCT_PAGE_TYPES.has(key)) return 'product'
  if (SERVICE_PAGE_TYPES.has(key)) return 'service'
  if (classifyPageCost(key) !== 'capability') return 'zero-cost'
  return 'other-capability'
}

export function resolveExactCapabilities(input: {
  bound: BoundExactProvider
  siteRef: string
  planId: CapabilityCreditPlanId
  locale: string
  productCount: number
  serviceCount: number
  extraCapabilityPages?: ReadonlyArray<{ route: string; pageType: string }>
}): { resolution: ExactCapabilityResolution; snapshot: ImmutableEntitlementSnapshot } {
  if (input.bound.productionSelectable !== false) deny('production_denied', 'Capability resolution requires a bound non-production handoff.')
  if (!Number.isInteger(input.productCount) || input.productCount < 0 || !Number.isInteger(input.serviceCount) || input.serviceCount < 0) {
    deny('assembly_denied', 'Product and service counts must be non-negative integers.')
  }
  const pages: Array<{ route: string; pageType: string }> = [
    { route: '/', pageType: 'home' },
    { route: '/about', pageType: 'about' },
    { route: '/contact', pageType: 'contact' },
    { route: '/privacy', pageType: 'privacy' },
  ]
  if (input.productCount > 0) pages.push({ route: '/products', pageType: 'products' })
  if (input.serviceCount > 0) pages.push({ route: '/services', pageType: 'services' })
  for (const extra of input.extraCapabilityPages ?? []) pages.push(extra)
  const routes = new Set<string>()
  for (const page of pages) {
    if (!page.route.startsWith('/') || RESERVED_ROUTES.has(page.route)) deny('assembly_denied', `Reserved or invalid route "${page.route}" rejected.`)
    if (routes.has(page.route)) deny('assembly_denied', `Duplicate route "${page.route}" rejected.`)
    routes.add(page.route)
  }
  if (input.planId === 'L' && (input.productCount > 0 || input.serviceCount > 0 || (input.extraCapabilityPages ?? []).length > 0)) {
    deny('assembly_denied', 'Plan L grants 0 capability credits; capability pages are unsupported.')
  }
  const snapshot = freezeEntitlementSnapshot({
    snapshotId: `entitlement:lsfact01:${input.siteRef}:${input.planId}:${input.bound.digest}`,
    siteRef: input.siteRef,
    planId: input.planId,
  })
  const credits = dispositionCreditsForPages(snapshot, pages)
  const capabilities = pages.map((page) => {
    const family = catalogFamily(page.pageType)
    const zero = family === 'zero-cost'
    const creditCost: 0 | 1 = zero ? 0 : 1
    return {
      pageType: page.pageType,
      family,
      creditCost,
      activationAllowed: true,
    }
  })
  if (input.productCount > 0 && input.serviceCount > 0) {
    const product = capabilities.find((item) => item.family === 'product')
    const service = capabilities.find((item) => item.family === 'service')
    if (!product || !service || product.pageType === service.pageType) {
      deny('assembly_denied', 'Products and Services must remain semantically distinct.')
    }
  }
  const creditCheck = checkCapabilityCredits(
    input.planId,
    capabilities.filter((item) => item.creditCost === 1).length,
  )
  if (creditCheck.disposition !== 'allowed') deny('assembly_denied', creditCheck.reason)
  const navigation = credits.filter((record) => record.includeInNavigation).map((record) => record.route)
  const sections = pages.map((page) => ({ route: page.route, sectionId: `${page.pageType}:primary`, pageType: page.pageType }))
  const resolution: ExactCapabilityResolution = Object.freeze({
    planId: input.planId,
    grantedCredits: capabilityCreditBudget(input.planId),
    productsDistinctFromServices: true,
    capabilities: Object.freeze(capabilities),
    pages: Object.freeze(pages),
    routes: Object.freeze(pages.map((page) => page.route)),
    navigation: Object.freeze(navigation),
    sections: Object.freeze(sections),
    content: Object.freeze({ locale: input.locale, workingContentBound: true }),
    credits,
    digest: canonicalJsonChecksum({
      bound: input.bound.digest,
      planId: input.planId,
      pages,
      locale: input.locale,
      capabilities,
      navigation,
    }),
  })
  return { resolution, snapshot }
}

export function assembleBoundSite(input: {
  bound: BoundExactProvider
  specInput: ResolveSiteSpecificationInput
  assembleInput: Omit<AssembleSiteManifestInput, 'siteSpec'>
}): { siteSpec: SiteSpecification; manifest: SiteAssemblyManifest; providerBytesUnchanged: true } {
  bindExactProviderHandoff(input.bound.handoff)
  const siteSpec = resolveSiteSpecification(input.specInput)
  const manifest = assembleSiteManifest({ ...input.assembleInput, siteSpec })
  for (const file of input.bound.handoff.files) {
    if (sha256Utf8(file.bytes) !== file.sha256) deny('tampered', 'Layered adoption mutated provider bytes.')
  }
  return { siteSpec, manifest, providerBytesUnchanged: true }
}

export function mapBoundWorkingContentPromotion(
  bound: BoundExactProvider,
  prepared: WorkingContentPromotionInput,
  targetSiteId: string,
  promotionRequestId: string,
  assemblyManifestId: string,
): PromotionRequest {
  bindExactProviderHandoff(bound.handoff)
  if (bound.productionSelectable !== false) deny('production_denied', 'Working-content promotion cannot claim production admission.')
  return buildPromotionRequestFromPreparedWorkingContent(prepared, targetSiteId, promotionRequestId, assemblyManifestId)
}

export function createExactProviderRuntime(cacheRoot: string): ExactProviderRuntime {
  const pins = new Map<string, ExistingSitePin>()
  const previous = new Map<string, ExistingSitePin>()
  return {
    bind: bindExactProviderHandoff,
    materialize(bound) {
      return materializeExactProvider(bound, cacheRoot)
    },
    restartFromCache(expectedDigest) {
      return restartExactProviderFromCache(cacheRoot, expectedDigest)
    },
    pinExistingSite(pin) {
      const identities = assertSiteAdoptionIdentities(pin.adoptionIdentities)
      const stored = Object.freeze({ ...pin, adoptionIdentities: identities })
      pins.set(pin.siteId, stored)
      return stored
    },
    retainExistingSitePin(siteId, nextDefault) {
      const current = pins.get(siteId)
      if (!current) deny('pin_immutable', `No existing-site pin exists for "${siteId}".`)
      if (nextDefault.digest !== current.boundHandoffDigest) {
        deny('pin_immutable', `Existing site "${siteId}" remains pinned; defaults must not silently move it.`)
      }
      return current
    },
    upgradeOrKeepPrior(siteId, next) {
      const current = pins.get(siteId)
      if (!current) deny('upgrade_failed', `No existing-site pin exists for "${siteId}".`)
      try {
        selectExactProviderForProduction(next)
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error)
        previous.set(siteId, current)
        return { ok: false, pin: current, reason }
      }
      deny('upgrade_failed', 'Unreachable production upgrade.')
    },
    rollback(siteId) {
      const current = pins.get(siteId)
      const prior = previous.get(siteId)
      if (!current || !prior) deny('upgrade_failed', `Rollback is unavailable for "${siteId}".`)
      pins.set(siteId, prior)
      previous.set(siteId, current)
      return prior
    },
    getPin(siteId) {
      return pins.get(siteId)
    },
  }
}

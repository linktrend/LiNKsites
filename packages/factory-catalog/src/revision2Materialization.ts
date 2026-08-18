import { createHash } from 'node:crypto'
import { lstatSync, readFileSync } from 'node:fs'
import { resolve, sep } from 'node:path'
import {
  admitWebsiteTemplateMaterialization,
  type Revision2ProviderPin,
  type Revision2Result,
  type Revision2Selection,
  type WebsiteTemplateMaterializationReference,
  validateExactRelease,
} from './libraryProviderClient.js'
import { MASTER_TEMPLATE_SOURCE_COMMIT_SHA, MASTER_TEMPLATE_SOURCE_TREE_SHA } from './templateIdentity.js'

export type { Revision2ProviderPin } from './libraryProviderClient.js'

export type Revision2MaterializedWebsiteTemplate = Readonly<{
  reference: WebsiteTemplateMaterializationReference
  providerRoot: string
  releaseRoot: string
  artifactRoot: string
  files: Readonly<Record<string, string>>
}>

export type Revision2MaterializationInput = Readonly<{
  providerRoot: string
  entryId: string
  version: string
  pin: Revision2ProviderPin
  receiptPath?: string
}>

const sha256 = (value: Buffer | string): string => createHash('sha256').update(value).digest('hex')
const json = (path: string): unknown => JSON.parse(readFileSync(path, 'utf8')) as unknown
const failure = (errors: readonly string[]): Revision2Result<never> => ({ ok: false, errors })

const confined = (root: string, candidate: string): boolean => {
  const rootWithSeparator = root.endsWith(sep) ? root : `${root}${sep}`
  return candidate === root || candidate.startsWith(rootWithSeparator)
}

const readReceipt = (input: Revision2MaterializationInput, releaseRoot: string): unknown => {
  const candidates = [
    input.receiptPath,
    resolve(releaseRoot, 'receipt.json'),
    resolve(releaseRoot, 'cache-receipt.json'),
    resolve(input.providerRoot, 'materialization/cache/cache-receipt.json'),
  ].filter((candidate): candidate is string => Boolean(candidate))
  for (const candidate of candidates) {
    try { return json(candidate) } catch { /* fail with a single deterministic error below */ }
  }
  throw new Error(`no Revision 2 receipt found for ${input.entryId}@${input.version}`)
}

/**
 * Reads a provider-owned Revision 2 release and returns a local, read-only
 * reference. It never writes into the LiNKsites repository or changes Library state.
 */
export function materializeRevision2WebsiteTemplate(
  input: Revision2MaterializationInput,
): Revision2Result<Revision2MaterializedWebsiteTemplate> {
  const providerRoot = resolve(input.providerRoot)
  const releaseRoot = resolve(providerRoot, 'registry/v2/entries', input.entryId, 'versions', input.version)
  const artifactRoot = resolve(releaseRoot, 'artifact')
  const errors: string[] = []
  if (!confined(providerRoot, releaseRoot) || !confined(providerRoot, artifactRoot)) return failure(['provider release path escapes provider root'])

  let bundle: unknown
  try {
    const catalogue = json(resolve(providerRoot, 'indexes/v2/catalog.json'))
    const manifest = json(resolve(releaseRoot, 'manifest.json'))
    const inventory = json(resolve(releaseRoot, 'inventory.json'))
    const dependencyLock = json(resolve(releaseRoot, 'dependency-lock.json'))
    bundle = { source: { commitSha: input.pin.sourceCommitSha, treeSha: input.pin.sourceTreeSha }, catalogue, record: (catalogue as { records?: unknown[] }).records?.find((record) => (record as { entryId?: unknown })?.entryId === input.entryId && (record as { version?: unknown })?.version === input.version), manifest, inventory, dependencyLock, receipt: readReceipt(input, releaseRoot) }
  } catch (error) {
    return failure([error instanceof Error ? error.message : 'provider release files could not be read'])
  }

  const validated = validateExactRelease(bundle, input.pin)
  if (!validated.ok) return validated
  const admitted = admitWebsiteTemplateMaterialization(validated)
  if (!admitted.ok) return admitted

  const inventory = (bundle as { inventory: { entries?: unknown[] } }).inventory
  const files: Record<string, string> = {}
  for (const item of inventory.entries ?? []) {
    if (!item || typeof item !== 'object' || (item as { type?: unknown }).type !== 'file') continue
    const path = (item as { path?: unknown }).path
    if (typeof path !== 'string' || path.length === 0 || path.startsWith('/') || path.includes('..') || path.includes('\\')) {
      errors.push(`inventory file path is unsafe: ${String(path)}`)
      continue
    }
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
  if (sourceInventoryPath) {
    try {
      const sourceInventory = JSON.parse(files[sourceInventoryPath]) as { sourceRepository?: unknown; sourceCommit?: unknown; sourceTree?: unknown }
      if (sourceInventory.sourceRepository !== 'LiNKsites' || sourceInventory.sourceCommit !== MASTER_TEMPLATE_SOURCE_COMMIT_SHA || sourceInventory.sourceTree !== MASTER_TEMPLATE_SOURCE_TREE_SHA) {
        return failure(['provider source inventory is not bound to the preserved LiNKsites visual handoff'])
      }
    } catch {
      return failure(['provider source inventory is invalid JSON'])
    }
  } else {
    return failure(['provider release is missing source-inventory.json'])
  }
  return { ok: true, value: Object.freeze({ reference: admitted.value, providerRoot, releaseRoot, artifactRoot, files: Object.freeze(files) }) }
}

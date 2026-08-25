import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { cpSync, mkdirSync, readFileSync, realpathSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, sep } from 'node:path'

const sha1 = /^[a-f0-9]{40}$/
const sha256 = /^[a-f0-9]{64}$/
const requestedProviderRoot = resolve(process.env.LINKSITES_LINKLIBRARIES_ROOT ?? '')
const providerRoot = realpathSync.native(requestedProviderRoot)
const providerCommit = process.env.LINKSITES_LINKLIBRARIES_COMMIT_SHA ?? ''
const providerTree = process.env.LINKSITES_LINKLIBRARIES_TREE_SHA ?? ''
const version = process.env.LINKSITES_TEMPLATE_VERSION ?? '2.0.0-a1.1'
const entryId = process.env.LINKSITES_TEMPLATE_ID ?? 'master-template-type-1'
const expected = {
  manifest: process.env.LINKSITES_LINKLIBRARIES_MANIFEST_SHA256 ?? 'd681e5305b611aa5247a0fa1711ce75e0a1734e121e6790e50c802b26c1c9697',
  inventory: process.env.LINKSITES_LINKLIBRARIES_INVENTORY_SHA256 ?? 'ad743168022139e7e70bd38ae19c56503cdfc2c4fcc912ece154f4f17b70cc98',
  payload: process.env.LINKSITES_LINKLIBRARIES_PAYLOAD_SHA256 ?? 'b096c013b53edf6fbb30e7794830ec462a5ff47c5b085d43218e91541e0af84a',
  dependencyLock: process.env.LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256 ?? '59f4db72af5de4731c68ee44b525f494c6cd067b42f8da310c345829f1b09c23',
  releaseReceipt: process.env.LINKSITES_LINKLIBRARIES_RELEASE_RECEIPT_SHA256 ?? '2668e0df4d317c4a0d4c9fbd1be7fe5f70f7024195bb310c8644849bf949de57',
  artifactTree: process.env.LINKSITES_LINKLIBRARIES_ARTIFACT_TREE_SHA1 ?? 'a8c6c23fd41a5f0eb9221276998f96862a50119f',
}

const fail = (message: string): never => {
  throw new Error(`EXT-LS-01 candidate probe failed: ${message}`)
}
const readJson = (path: string): Record<string, any> => {
  try { return JSON.parse(readFileSync(path, 'utf8')) as Record<string, any> } catch (error) { fail(`${path}: ${error instanceof Error ? error.message : 'invalid JSON'}`) }
}
const digestFile = (path: string): string => createHash('sha256').update(readFileSync(path)).digest('hex')
const confined = (root: string, path: string): boolean => {
  const normalizedRoot = root.endsWith(sep) ? root : `${root}${sep}`
  return path === root || path.startsWith(normalizedRoot)
}
const git = (...args: string[]): string => execFileSync('git', ['-C', providerRoot, ...args], { encoding: 'utf8' }).trim()

if (!providerRoot || !providerCommit || !providerTree) fail('provider checkout and exact repository identity are required')
if (!sha1.test(providerCommit) || !sha1.test(providerTree)) fail('provider repository commit/tree must be exact SHA-1 values')
try { if (!statSync(providerRoot).isDirectory()) fail('provider root is not a directory') } catch { fail('provider root is not readable') }
if (git('rev-parse', '--show-toplevel') !== providerRoot) fail('provider root is not the selected checkout')
if (git('rev-parse', 'HEAD') !== providerCommit) fail(`provider commit mismatch: expected ${providerCommit}`)
if (git('rev-parse', 'HEAD^{tree}') !== providerTree) fail(`provider tree mismatch: expected ${providerTree}`)

const releaseRoot = resolve(providerRoot, 'registry/v2/entries', entryId, 'versions', version)
if (!confined(providerRoot, releaseRoot)) fail('release path escaped provider root')
const manifestPath = resolve(releaseRoot, 'manifest.json')
const inventoryPath = resolve(releaseRoot, 'inventory.json')
const lockPath = resolve(releaseRoot, 'dependency-lock.json')
const receiptPath = resolve(releaseRoot, 'release-receipt.json')
for (const path of [manifestPath, inventoryPath, lockPath, receiptPath]) {
  try { statSync(path) } catch { fail(`missing release file: ${path}`) }
}
const files = { manifest: manifestPath, inventory: inventoryPath, dependencyLock: lockPath, releaseReceipt: receiptPath }
for (const [name, path] of Object.entries(files)) if (digestFile(path) !== expected[name as keyof typeof expected]) fail(`${name} digest mismatch`)

const manifest = readJson(manifestPath)
const inventory = readJson(inventoryPath)
const receipt = readJson(receiptPath)
if (manifest.entryId !== entryId || manifest.version !== version) fail('manifest entry/version mismatch')
if (manifest.artifactTreeSha1 !== expected.artifactTree || manifest.inventorySha256 !== expected.inventory || manifest.payloadSha256 !== expected.payload || manifest.dependencyLockSha256 !== expected.dependencyLock) fail('manifest A1 digest binding mismatch')
if (receipt.release?.entryId !== entryId || receipt.release?.version !== version || receipt.release?.artifactTreeSha1 !== expected.artifactTree || receipt.release?.manifestSha256 !== expected.manifest || receipt.release?.inventoryFileSha256 !== expected.inventory || receipt.release?.payloadSha256 !== expected.payload || receipt.release?.dependencyLockSha256 !== expected.dependencyLock) fail('release receipt A1 binding mismatch')
if (inventory.artifactTreeSha1 !== expected.artifactTree || inventory.inventorySha256 !== expected.payload) fail('inventory A1 binding mismatch')
if (receipt.governance?.lifecycle !== 'draft' || receipt.governance?.selectability !== 'non_selectable' || receipt.governance?.candidateProbeOnly !== true) fail('provider candidate governance is not draft/non_selectable/candidateProbeOnly')

const sourceInventoryPath = resolve(releaseRoot, 'artifact/source-inventory.json')
const sourceInventory = readJson(sourceInventoryPath)
const sourceCommit = sourceInventory.source?.commit ?? manifest.releaseSource?.releaseSourceCommitSha
const sourceTree = sourceInventory.source?.tree ?? manifest.releaseSource?.releaseSourceRepositoryTreeSha1
if (!sha1.test(sourceCommit ?? '') || !sha1.test(sourceTree ?? '')) fail('provider source handoff identity is absent')
if (sourceInventory.template?.sourceRepository !== 'LiNKsites' || sourceCommit !== '1635a64f1d90efd049c959a7cf38ebac7ccbfdac' || sourceTree !== '873c4acc582050b416fb5a8bc59990345711df46') fail('provider source handoff is not the accepted A1 source identity')

// The provider must supply an immutable candidate catalogue record. A release
// receipt alone is not enough to admit a consumer proof: synthesizing a local
// record or digest would bypass the provider's catalog binding and is
// intentionally rejected.
const providerCataloguePath = resolve(providerRoot, 'indexes/v2/catalog.json')
const runtimeCatalogue = readJson(providerCataloguePath)
if (!Array.isArray(runtimeCatalogue.records)) fail('provider catalogue records are absent')
const candidateRecord = runtimeCatalogue.records.find((record) => record && typeof record === 'object' && (record as Record<string, unknown>).entryId === entryId && (record as Record<string, unknown>).version === version)
if (!candidateRecord) fail(`provider catalogue is not bound to candidate ${entryId}@${version}; provider receipt catalogue.bound=${String(receipt.catalogue?.bound)}`)
if (digestFile(providerCataloguePath) !== receipt.catalogue?.fileSha256 || runtimeCatalogue.recordsSha256 !== receipt.catalogue?.recordsSha256) fail('provider candidate catalogue digest binding mismatch')

const tokenPath = resolve(releaseRoot, 'artifact/design/tokens.css')
if (!confined(releaseRoot, tokenPath)) fail('token path escaped provider release')
try { if (!statSync(tokenPath).isFile()) fail('A1 token CSS is not a regular file') } catch { fail('A1 token CSS is absent') }
// Runtime proof receives a disposable materialized cache, not the provider
// checkout. The checkout is used only for exact identity and digest checks.
const runtimeRoot = resolve(tmpdir(), `linksites-ext-ls01-cache-${process.pid}`)
const runtimeReleaseRoot = resolve(runtimeRoot, 'registry/v2/entries', entryId, 'versions', version)
mkdirSync(resolve(runtimeRoot, 'indexes/v2'), { recursive: true })
mkdirSync(resolve(runtimeReleaseRoot, '..'), { recursive: true })
mkdirSync(resolve(runtimeRoot, 'indexes/v2'), { recursive: true })
const runtimeCataloguePath = resolve(runtimeRoot, 'indexes/v2/catalog.json')
writeFileSync(runtimeCataloguePath, `${JSON.stringify(runtimeCatalogue, null, 2)}\n`, { flag: 'wx' })
cpSync(releaseRoot, runtimeReleaseRoot, { recursive: true, force: true })
if (statSync(resolve(runtimeRoot, '.git'), { throwIfNoEntry: false })) fail('runtime materialized cache unexpectedly contains provider checkout metadata')
const runtimeTokenPath = resolve(runtimeReleaseRoot, 'artifact/design/tokens.css')
if (!statSync(runtimeTokenPath).isFile()) fail('runtime materialized A1 token CSS is absent')
console.log(`LINKSITES_PROVIDER_COMMIT_SHA=${providerCommit}`)
console.log(`LINKSITES_PROVIDER_TREE_SHA=${providerTree}`)
console.log(`LINKSITES_TEMPLATE_VERSION=${version}`)
console.log(`LINKSITES_RELEASE_SOURCE_COMMIT_SHA=${sourceCommit}`)
console.log(`LINKSITES_RELEASE_SOURCE_TREE_SHA=${sourceTree}`)
console.log(`LINKSITES_RUNTIME_CACHE_ROOT=${runtimeRoot}`)
console.log(`LINKSITES_PAIRED_PROOF_TOKEN_CSS_PATH=${runtimeTokenPath}`)
console.log('EXT-LS-01 candidate probe: exact provider checkout/A1 release identity verified; candidate remains draft/non_selectable')

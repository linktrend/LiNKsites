#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { readAndVerifyNativeV2Receipt, CONFIG_SCHEMA_VERSION, HARNESS_RELEASE_PIN, PROFILE_RELEASE_PIN, AUTOWORK_MODES } from '../config/runtime-contract.mjs'

const root = resolve(new URL('../..', import.meta.url).pathname)
const outputFlag = process.argv.indexOf('--output')
const output = outputFlag >= 0 ? resolve(process.cwd(), process.argv[outputFlag + 1] ?? '') : null
const providerStateFlag = process.argv.indexOf('--provider-state')
const providerState = providerStateFlag >= 0 ? process.argv[providerStateFlag + 1] : 'ready'
const platformStateFlag = process.argv.indexOf('--platform-state')
const platformState = platformStateFlag >= 0 ? process.argv[platformStateFlag + 1] : 'ready'
if (!output || !['ready', 'deferred'].includes(providerState) || !['ready', 'pending'].includes(platformState)) throw new Error('usage: node deploy/scripts/generate-deployment-manifest.mjs --output <path> [--provider-state ready|deferred] [--platform-state ready|pending]')

const releaseSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
const releaseTree = execFileSync('git', ['rev-parse', 'HEAD^{tree}'], { cwd: root, encoding: 'utf8' }).trim()
const contractFile = 'deploy/config/runtime-contract.mjs'
const contractBytes = await readFile(resolve(root, contractFile))
const lockfile = await readFile(resolve(root, 'pnpm-lock.yaml'))
const migrationOrderKey = (file) => {
  const match = file.match(/^(\d{8})(?:_?(\d{6}))/)
  return match ? `${match[1]}${match[2]}${file}` : file
}
const files = (await readdir(resolve(root, 'supabase/migrations'))).filter((file) => file.endsWith('.sql')).sort((a, b) => migrationOrderKey(a).localeCompare(migrationOrderKey(b)))
const migrations = await Promise.all(files.map(async (file) => ({ file, sha256: createHash('sha256').update(await readFile(resolve(root, 'supabase/migrations', file))).digest('hex') })))
const payloadIndexPath = resolve(root, 'apps/cms/src/migrations/index.ts')
const payloadIndex = await readFile(payloadIndexPath, 'utf8')
const payloadMigrationImports = [...payloadIndex.matchAll(/from\s+['"]\.\/([^'"]+)['"]/g)].map((match) => match[1])
if (payloadMigrationImports.length === 0) throw new Error('Payload migration index has no loaded migrations')
const resolvePayloadMigration = async (specifier) => {
  const sourceSpecifier = specifier.replace(/\.js$/, '')
  const candidates = specifier.endsWith('.js')
    ? [`${sourceSpecifier}.ts`, specifier]
    : [specifier, `${specifier}.ts`, `${specifier}.js`]
  for (const file of candidates) {
    try {
      return { file, content: await readFile(resolve(root, 'apps/cms/src/migrations', file)) }
    } catch (error) {
      if (error?.code !== 'ENOENT') throw error
    }
  }
  throw new Error(`Payload migration import does not resolve to a source file: ${specifier}`)
}
const payloadMigrations = await Promise.all(payloadMigrationImports.map(async (specifier) => {
  const { file, content } = await resolvePayloadMigration(specifier)
  return {
    file: `apps/cms/src/migrations/${file}`,
    sha256: createHash('sha256').update(content).digest('hex'),
  }
}))
const required = [
  'LINKSITES_CMS_IMAGE_DIGEST', 'LINKSITES_WEB_MASTER_IMAGE_DIGEST',
  'LINKSITES_ORCHESTRATOR_IMAGE_DIGEST', 'LINKSITES_WORKER_IMAGE_DIGEST',
  'LINKSITES_MIGRATIONS_IMAGE_DIGEST',
]
required.push('LINKSITES_TEMPLATE_ID', 'LINKSITES_TEMPLATE_VERSION', 'LINKSITES_TEMPLATE_FORMAT')
if (providerState === 'ready') required.push('LINKSITES_LINKLIBRARIES_ROOT', 'LINKSITES_LINKLIBRARIES_COMMIT_SHA', 'LINKSITES_LINKLIBRARIES_TREE_SHA', 'LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256', 'LINKSITES_LINKLIBRARIES_RECEIPT_PATH', 'LINKLIBRARIES_ARTIFACT_PATH')
if (providerState === 'ready') required.push('LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON')
if (platformState === 'ready') required.push('LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA')
const autoworkMode = process.env.LINKSITES_AUTOWORK_MODE || 'manual'
if (!AUTOWORK_MODES.includes(autoworkMode)) throw new Error('LINKSITES_AUTOWORK_MODE must be manual or live')
if (autoworkMode === 'live') throw new Error('live Autowork cannot be recorded without an exact admitted live handoff; publication remains manual until that admission exists')
const missing = required.filter((name) => !process.env[name] || /<|replace|example|todo/i.test(process.env[name]))
if (missing.length) throw new Error(`missing immutable release identity: ${missing.join(', ')}`)
for (const name of required.filter((name) => name.endsWith('_DIGEST'))) if (!/^sha256:[a-f0-9]{64}$/i.test(process.env[name])) throw new Error(`${name} must be an image SHA-256 digest`)
if (platformState === 'ready' && !/^[a-f0-9]{40}$/i.test(process.env.LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA)) throw new Error('LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA must be a full immutable Git SHA')
let libraries
if (providerState === 'deferred') {
  libraries = {
    state: 'deferred',
    entryId: 'master-template-type-1',
    version: process.env.LINKSITES_TEMPLATE_VERSION,
    reason: 'native-v2-selectable-release-deferred',
    infrastructureAcceptanceEligible: true,
    publishingEligible: false,
    blockedCapabilities: ['renderer-activation', 'template-dependent-publishing', 'orchestrator-intake', 'private-site-pilot', 'public-site-release'],
  }
} else {
  if (process.env.LINKSITES_TEMPLATE_FORMAT !== 'revision2') throw new Error('ready provider releases must use the native Revision 2 materializer')
  const libraryGit = (args) => execFileSync('git', ['-C', process.env.LINKLIBRARIES_ARTIFACT_PATH, ...args], { encoding: 'utf8' }).trim()
  if (libraryGit(['rev-parse', '--is-inside-work-tree']).trim() !== 'true') throw new Error('LINKLIBRARIES_ARTIFACT_PATH must be a Git working tree')
  if (libraryGit(['rev-parse', 'HEAD']) !== process.env.LINKSITES_LINKLIBRARIES_COMMIT_SHA) throw new Error('LiNKlibraries provider commit does not match the release identity')
  if (libraryGit(['rev-parse', 'HEAD^{tree}']) !== process.env.LINKSITES_LINKLIBRARIES_TREE_SHA) throw new Error('LiNKlibraries provider tree does not match the release identity')
  const receiptVerification = readAndVerifyNativeV2Receipt(process.env, { providerRoot: process.env.LINKLIBRARIES_ARTIFACT_PATH })
  if (!receiptVerification.ok) throw new Error(`LiNKlibraries release receipt is not exactly bound to the mounted native Revision 2 release: ${receiptVerification.error}`)
  const { receipt, receiptSha256 } = receiptVerification
  libraries = { state: 'ready', entryId: receipt.entryId, version: receipt.version, providerCommitSha: process.env.LINKSITES_LINKLIBRARIES_COMMIT_SHA, providerTreeSha: process.env.LINKSITES_LINKLIBRARIES_TREE_SHA, dependencyLockSha256: process.env.LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256, receiptType: receipt.receiptType, receiptId: receipt.receiptId ?? null, receiptSha256, infrastructureAcceptanceEligible: true, publishingEligible: true }
}

const manifest = {
  schemaVersion: CONFIG_SCHEMA_VERSION,
  generatedAt: new Date().toISOString(),
  repository: { name: 'LiNKsites', releaseSha, releaseTree, lockfileSha256: createHash('sha256').update(lockfile).digest('hex') },
  configuration: { schemaVersion: CONFIG_SCHEMA_VERSION, contractFile, contractSha256: createHash('sha256').update(contractBytes).digest('hex') },
  pins: {
    harness: { ...HARNESS_RELEASE_PIN },
    profile: { ...PROFILE_RELEASE_PIN },
  },
  autowork: { mode: autoworkMode, liveEnabled: false, adapter: autoworkMode === 'manual' ? 'manual-file' : 'signed-gateway' },
  libraries,
  deferredTemplates: [{ entryId: 'master-template-type-1', state: 'deferred', reason: 'native-v2-selectable-release-deferred', blocksActiveProvider: false }],
  platform: platformState === 'ready'
    ? { state: 'ready', migrationsAppliedSha: process.env.LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA, authority: 'external-governed-admission-required' }
    : {
      state: 'pending',
      reason: 'production-project-migration-authority-and-receipt-not-yet-available',
      infrastructureArtifactAcceptanceEligible: true,
      artifactOnly: true,
      deploymentEligible: false,
      requiresPlatformAdmission: true,
      blockedCapabilities: ['production-migration-apply', 'production-data-plane-startup'],
    },
  images: { cms: process.env.LINKSITES_CMS_IMAGE_DIGEST, webMaster: process.env.LINKSITES_WEB_MASTER_IMAGE_DIGEST, orchestrator: process.env.LINKSITES_ORCHESTRATOR_IMAGE_DIGEST, autoworkWorker: process.env.LINKSITES_WORKER_IMAGE_DIGEST, migrations: process.env.LINKSITES_MIGRATIONS_IMAGE_DIGEST },
  configurationSchema: `deploy/config/runtime-contract.mjs@${CONFIG_SCHEMA_VERSION}`,
  schemas: { supabaseMigrations: migrations, payloadMigrationIndex: { file: 'apps/cms/src/migrations/index.ts', sha256: createHash('sha256').update(payloadIndex).digest('hex'), loaded: payloadMigrations }, payloadMigrations },
  privacy: { privatePreviewOnly: true, publicDnsOrDomainOperationsExecuted: false },
}
await mkdir(dirname(output), { recursive: true })
const manifestBytes = `${JSON.stringify(manifest, null, 2)}\n`
await writeFile(output, manifestBytes)
console.log(JSON.stringify({ status: 'deployment_manifest_generated', output, releaseSha, manifestSha256: createHash('sha256').update(manifestBytes).digest('hex') }))

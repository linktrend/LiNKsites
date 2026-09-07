#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const root = resolve(new URL('../..', import.meta.url).pathname)
const outputFlag = process.argv.indexOf('--output')
const output = outputFlag >= 0 ? resolve(process.cwd(), process.argv[outputFlag + 1] ?? '') : null
const providerStateFlag = process.argv.indexOf('--provider-state')
const providerState = providerStateFlag >= 0 ? process.argv[providerStateFlag + 1] : 'ready'
const platformStateFlag = process.argv.indexOf('--platform-state')
const platformState = platformStateFlag >= 0 ? process.argv[platformStateFlag + 1] : 'ready'
if (!output || !['ready', 'pending'].includes(providerState) || !['ready', 'pending'].includes(platformState)) throw new Error('usage: node deploy/scripts/generate-deployment-manifest.mjs --output <path> [--provider-state ready|pending] [--platform-state ready|pending]')

const releaseSha = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
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
if (providerState === 'ready') required.push('LINKLIBRARIES_CATALOG_SHA', 'LINKLIBRARIES_ENTRY_SHA', 'LINKLIBRARIES_ARTIFACT_PATH')
if (platformState === 'ready') required.push('LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA')
const missing = required.filter((name) => !process.env[name] || /<|replace|example|todo/i.test(process.env[name]))
if (missing.length) throw new Error(`missing immutable release identity: ${missing.join(', ')}`)
for (const name of required.filter((name) => name.endsWith('_DIGEST'))) if (!/^sha256:[a-f0-9]{64}$/i.test(process.env[name])) throw new Error(`${name} must be an image SHA-256 digest`)
if (platformState === 'ready' && !/^[a-f0-9]{40}$/i.test(process.env.LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA)) throw new Error('LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA must be a full immutable Git SHA')
let libraries
if (providerState === 'pending') {
  libraries = {
    state: 'pending',
    entryId: 'marketing-smb-v1',
    reason: 'active-provider-admission-not-supplied',
    infrastructureAcceptanceEligible: false,
    blockedCapabilities: ['renderer-activation', 'orchestrator-intake', 'private-site-pilot', 'public-site-release'],
  }
} else {
  for (const name of ['LINKLIBRARIES_CATALOG_SHA', 'LINKLIBRARIES_ENTRY_SHA']) if (!/^[a-f0-9]{40}$/i.test(process.env[name])) throw new Error(`${name} must be a full immutable Git SHA`)
  if (process.env.LINKLIBRARIES_CATALOG_SHA !== process.env.LINKLIBRARIES_ENTRY_SHA) throw new Error('LiNKlibraries catalog and entry refs must be one exact commit')
  const libraryGit = (args) => execFileSync('git', ['-C', process.env.LINKLIBRARIES_ARTIFACT_PATH, ...args], { encoding: 'utf8' })
  if (libraryGit(['rev-parse', '--is-inside-work-tree']).trim() !== 'true') throw new Error('LINKLIBRARIES_ARTIFACT_PATH must be a Git working tree')
  libraryGit(['cat-file', '-e', `${process.env.LINKLIBRARIES_CATALOG_SHA}^{commit}`])
  const catalogContent = libraryGit(['show', `${process.env.LINKLIBRARIES_CATALOG_SHA}:indexes/catalog.json`])
  const entryContent = libraryGit(['show', `${process.env.LINKLIBRARIES_ENTRY_SHA}:entries/marketing-smb-v1/entry.json`])
  const catalogContentSha256 = createHash('sha256').update(catalogContent).digest('hex')
  const entryContentSha256 = createHash('sha256').update(entryContent).digest('hex')
  if (!JSON.parse(catalogContent).entries?.some((row) => row.entryId === 'marketing-smb-v1' && row.status === 'approved')) throw new Error('LiNKlibraries exact catalog does not approve marketing-smb-v1')
  libraries = { state: 'ready', catalogSha: process.env.LINKLIBRARIES_CATALOG_SHA, entrySha: process.env.LINKLIBRARIES_ENTRY_SHA, entryId: 'marketing-smb-v1', catalogPath: 'indexes/catalog.json', entryPath: 'entries/marketing-smb-v1/entry.json', catalogContentSha256, entryContentSha256 }
}

const manifest = {
  schemaVersion: '1.2.0',
  generatedAt: new Date().toISOString(),
  repository: { name: 'LiNKsites', releaseSha, lockfileSha256: createHash('sha256').update(lockfile).digest('hex') },
  libraries,
  deferredTemplates: [{ entryId: 'master-template-type-1', state: 'pending', reason: 'replacement-template-release-deferred', blocksActiveProvider: false }],
  platform: platformState === 'ready'
    ? { state: 'ready', migrationsAppliedSha: process.env.LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA, authority: 'external-governed-admission-required' }
    : { state: 'pending', reason: 'production-project-migration-authority-and-receipt-not-yet-available', infrastructureArtifactAcceptanceEligible: true, blockedCapabilities: ['production-migration-apply', 'production-data-plane-startup'] },
  images: { cms: process.env.LINKSITES_CMS_IMAGE_DIGEST, webMaster: process.env.LINKSITES_WEB_MASTER_IMAGE_DIGEST, orchestrator: process.env.LINKSITES_ORCHESTRATOR_IMAGE_DIGEST, autoworkWorker: process.env.LINKSITES_WORKER_IMAGE_DIGEST, migrations: process.env.LINKSITES_MIGRATIONS_IMAGE_DIGEST },
  configurationSchema: 'deploy/config/runtime-contract.mjs@1.1.0',
  schemas: { supabaseMigrations: migrations, payloadMigrationIndex: { file: 'apps/cms/src/migrations/index.ts', sha256: createHash('sha256').update(payloadIndex).digest('hex'), loaded: payloadMigrations }, payloadMigrations },
  privacy: { privatePreviewOnly: true, publicDnsOrDomainOperationsExecuted: false },
}
await mkdir(dirname(output), { recursive: true })
const manifestBytes = `${JSON.stringify(manifest, null, 2)}\n`
await writeFile(output, manifestBytes)
console.log(JSON.stringify({ status: 'deployment_manifest_generated', output, releaseSha, manifestSha256: createHash('sha256').update(manifestBytes).digest('hex') }))

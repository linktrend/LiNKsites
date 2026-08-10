#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

const root = resolve(new URL('../..', import.meta.url).pathname)
const outputFlag = process.argv.indexOf('--output')
const output = outputFlag >= 0 ? resolve(process.cwd(), process.argv[outputFlag + 1] ?? '') : null
if (!output) throw new Error('usage: node deploy/scripts/generate-deployment-manifest.mjs --output <path>')

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
const payloadMigrations = await Promise.all(payloadMigrationImports.map(async (file) => ({
  file: `apps/cms/src/migrations/${file}`,
  sha256: createHash('sha256').update(await readFile(resolve(root, 'apps/cms/src/migrations', file))).digest('hex'),
})))
const required = [
  'LINKLIBRARIES_CATALOG_SHA', 'LINKLIBRARIES_ENTRY_SHA',
  'LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA',
  'LINKSITES_CMS_IMAGE_DIGEST', 'LINKSITES_WEB_MASTER_IMAGE_DIGEST',
  'LINKSITES_ORCHESTRATOR_IMAGE_DIGEST', 'LINKSITES_WORKER_IMAGE_DIGEST',
  'LINKSITES_MIGRATIONS_IMAGE_DIGEST', 'LINKLIBRARIES_ARTIFACT_PATH',
]
const missing = required.filter((name) => !process.env[name] || /<|replace|example|todo/i.test(process.env[name]))
if (missing.length) throw new Error(`missing immutable release identity: ${missing.join(', ')}`)
for (const name of required.filter((name) => name.endsWith('_DIGEST'))) if (!/^sha256:[a-f0-9]{64}$/i.test(process.env[name])) throw new Error(`${name} must be an image SHA-256 digest`)
for (const name of ['LINKLIBRARIES_CATALOG_SHA', 'LINKLIBRARIES_ENTRY_SHA', 'LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA']) if (!/^[a-f0-9]{40}$/i.test(process.env[name])) throw new Error(`${name} must be a full immutable Git SHA`)
if (process.env.LINKLIBRARIES_CATALOG_SHA !== process.env.LINKLIBRARIES_ENTRY_SHA) throw new Error('LiNKlibraries catalog and entry refs must be one exact commit')
const libraryGit = (args) => execFileSync('git', ['-C', process.env.LINKLIBRARIES_ARTIFACT_PATH, ...args], { encoding: 'utf8' })
if (libraryGit(['rev-parse', '--is-inside-work-tree']).trim() !== 'true') throw new Error('LINKLIBRARIES_ARTIFACT_PATH must be a Git working tree')
libraryGit(['cat-file', '-e', `${process.env.LINKLIBRARIES_CATALOG_SHA}^{commit}`])
const catalogContent = libraryGit(['show', `${process.env.LINKLIBRARIES_CATALOG_SHA}:indexes/catalog.json`])
const entryContent = libraryGit(['show', `${process.env.LINKLIBRARIES_ENTRY_SHA}:entries/marketing-smb-v1/entry.json`])
const catalogContentSha256 = createHash('sha256').update(catalogContent).digest('hex')
const entryContentSha256 = createHash('sha256').update(entryContent).digest('hex')
if (!JSON.parse(catalogContent).entries?.some((row) => row.entryId === 'marketing-smb-v1' && row.status === 'approved')) throw new Error('LiNKlibraries exact catalog does not approve marketing-smb-v1')

const manifest = {
  schemaVersion: '1.1.0',
  generatedAt: new Date().toISOString(),
  repository: { name: 'LiNKsites', releaseSha, lockfileSha256: createHash('sha256').update(lockfile).digest('hex') },
  libraries: { catalogSha: process.env.LINKLIBRARIES_CATALOG_SHA, entrySha: process.env.LINKLIBRARIES_ENTRY_SHA, entryId: 'marketing-smb-v1', catalogPath: 'indexes/catalog.json', entryPath: 'entries/marketing-smb-v1/entry.json', catalogContentSha256, entryContentSha256 },
  platform: { migrationsAppliedSha: process.env.LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA, authority: 'external-governed-admission-required' },
  images: { cms: process.env.LINKSITES_CMS_IMAGE_DIGEST, webMaster: process.env.LINKSITES_WEB_MASTER_IMAGE_DIGEST, orchestrator: process.env.LINKSITES_ORCHESTRATOR_IMAGE_DIGEST, autoworkWorker: process.env.LINKSITES_WORKER_IMAGE_DIGEST, migrations: process.env.LINKSITES_MIGRATIONS_IMAGE_DIGEST },
  configurationSchema: 'deploy/config/runtime-contract.mjs@1.1.0',
  schemas: { supabaseMigrations: migrations, payloadMigrationIndex: { file: 'apps/cms/src/migrations/index.ts', sha256: createHash('sha256').update(payloadIndex).digest('hex'), loaded: payloadMigrations }, payloadMigrations },
  privacy: { privatePreviewOnly: true, publicDnsOrDomainOperationsExecuted: false },
}
await mkdir(dirname(output), { recursive: true })
await writeFile(output, `${JSON.stringify(manifest, null, 2)}\n`)
console.log(JSON.stringify({ status: 'deployment_manifest_generated', output, releaseSha, manifestSha256: createHash('sha256').update(JSON.stringify(manifest)).digest('hex') }))

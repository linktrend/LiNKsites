import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'
import { SERVICE_CONFIGURATION } from '../config/runtime-contract.mjs'

const root = resolve(new URL('../..', import.meta.url).pathname)
const digest = (character) => `sha256:${character.repeat(64)}`

test('missing active provider is artifact inventory only, never operational acceptance', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-manifest-'))
  const output = join(directory, 'manifest.json')
  try {
    const stdout = execFileSync(process.execPath, [
      'deploy/scripts/generate-deployment-manifest.mjs',
      '--provider-state', 'pending',
      '--platform-state', 'pending',
      '--output', output,
    ], {
      cwd: root,
      env: {
        ...process.env,
        LINKSITES_CMS_IMAGE_DIGEST: digest('1'),
        LINKSITES_WEB_MASTER_IMAGE_DIGEST: digest('2'),
        LINKSITES_ORCHESTRATOR_IMAGE_DIGEST: digest('3'),
        LINKSITES_WORKER_IMAGE_DIGEST: digest('4'),
        LINKSITES_MIGRATIONS_IMAGE_DIGEST: digest('5'),
      },
      encoding: 'utf8',
    })
    const bytes = await readFile(output)
    const manifest = JSON.parse(bytes.toString('utf8'))
    const receipt = JSON.parse(stdout)
    assert.equal(manifest.schemaVersion, '1.2.0')
    assert.equal(manifest.libraries.state, 'pending')
    assert.equal(manifest.libraries.infrastructureAcceptanceEligible, false)
    assert.equal(manifest.libraries.entryId, 'marketing-smb-v1')
    assert.equal(manifest.platform.state, 'pending')
    assert.equal(manifest.platform.infrastructureArtifactAcceptanceEligible, true)
    assert.equal('catalogSha' in manifest.libraries, false)
    assert.equal('migrationsAppliedSha' in manifest.platform, false)
    assert.equal(receipt.manifestSha256, createHash('sha256').update(bytes).digest('hex'))
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('admitted active provider remains ready while replacement template is deferred', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-admitted-manifest-'))
  const output = join(directory, 'manifest.json')
  const artifact = join(directory, 'library')
  try {
    await mkdir(join(artifact, 'indexes'), { recursive: true })
    await mkdir(join(artifact, 'entries/marketing-smb-v1'), { recursive: true })
    const catalog = JSON.stringify({ entries: [{ entryId: 'marketing-smb-v1', status: 'approved' }] }) + '\n'
    const entry = JSON.stringify({ entryId: 'marketing-smb-v1' }) + '\n'
    await writeFile(join(artifact, 'indexes/catalog.json'), catalog)
    await writeFile(join(artifact, 'entries/marketing-smb-v1/entry.json'), entry)
    const git = (...args) => execFileSync('git', ['-C', artifact, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
    git('init')
    git('add', 'indexes/catalog.json', 'entries/marketing-smb-v1/entry.json')
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'synthetic admitted catalog')
    const sha = git('rev-parse', 'HEAD')
    execFileSync(process.execPath, ['deploy/scripts/generate-deployment-manifest.mjs', '--output', output], {
      cwd: root, encoding: 'utf8', env: {
        ...process.env, LINKSITES_CMS_IMAGE_DIGEST: digest('1'), LINKSITES_WEB_MASTER_IMAGE_DIGEST: digest('2'),
        LINKSITES_ORCHESTRATOR_IMAGE_DIGEST: digest('3'), LINKSITES_WORKER_IMAGE_DIGEST: digest('4'), LINKSITES_MIGRATIONS_IMAGE_DIGEST: digest('5'),
        LINKLIBRARIES_CATALOG_SHA: sha, LINKLIBRARIES_ENTRY_SHA: sha, LINKLIBRARIES_ARTIFACT_PATH: artifact,
        LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA: 'a'.repeat(40),
      },
    })
    const manifest = JSON.parse(await readFile(output, 'utf8'))
    assert.equal(manifest.libraries.state, 'ready')
    assert.equal(manifest.libraries.entryId, 'marketing-smb-v1')
    assert.equal(manifest.libraries.catalogSha, sha)
    assert.equal(manifest.libraries.catalogContentSha256, createHash('sha256').update(catalog).digest('hex'))
    assert.equal(manifest.libraries.entryContentSha256, createHash('sha256').update(entry).digest('hex'))
    assert.equal(manifest.libraries.blockedCapabilities, undefined)
    assert.deepEqual(manifest.deferredTemplates, [{ entryId: 'master-template-type-1', state: 'pending', reason: 'replacement-template-release-deferred', blocksActiveProvider: false }])
    // Run the real preflight against synthetic identities and an empty protected
    // env file. Compose only renders configuration; no service is started.
    const runtimeFile = join(directory, 'runtime.env')
    await writeFile(runtimeFile, '', { mode: 0o600 })
    const values = {
      'git-sha-1': sha, 'sha-256': 'b'.repeat(64), uuid: '00000000-0000-4000-8000-000000000001',
      slug: 'synthetic-fixture', 'payload-document-id': '1', 'absolute-path': '/var/lib/linksites/fixture',
      'secret-min-32': 'synthetic-A9!'.repeat(4), 'https-url': 'https://private.synthetic.invalid',
      'postgres-url': ['postgresql:', '//cms@database.synthetic.invalid/linksites'].join(''),
      'nonempty-json-array': '[{"fixture":true}]', 'nonempty-json-object': '{"fixture":true}',
    }
    const runtime = { ...process.env }
    for (const { name, format } of Object.values(SERVICE_CONFIGURATION).flat()) runtime[name] = format.startsWith('literal:') ? format.slice(8) : values[format]
    Object.assign(runtime, {
      LINKSITES_RELEASE_SHA: manifest.repository.releaseSha, W2_02_EXECUTION_REVISION: manifest.repository.releaseSha,
      LINKSITES_RUNTIME_ENV_FILE: runtimeFile, LINKSITES_TEMPLATE_RELEASE_STATE: 'ready',
      LINKLIBRARIES_CATALOG_SHA: sha, LINKLIBRARIES_ENTRY_SHA: sha, LINKLIBRARIES_ARTIFACT_PATH: artifact,
      LINKLIBRARIES_CATALOG_CONTENT_SHA256: manifest.libraries.catalogContentSha256,
      LINKLIBRARIES_ENTRY_CONTENT_SHA256: manifest.libraries.entryContentSha256,
      W2_02_LIBRARY_CATALOG_SHA256: manifest.libraries.catalogContentSha256,
      W2_02_LIBRARY_ENTRY_SHA256: manifest.libraries.entryContentSha256,
      W2_02_DATABASE_URI: ['postgresql:', '//orchestrator@database.synthetic.invalid/linksites'].join(''),
      LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA: manifest.platform.migrationsAppliedSha,
      NODE_ENV: 'production',
    })
    delete runtime.CMS_FIXTURE_PATH
    for (const name of ['TRAEFIK_NETWORK', 'TRAEFIK_ENTRYPOINT', 'TRAEFIK_CMS_HOST', 'TRAEFIK_PREVIEW_HOST', 'TRAEFIK_CMS_PRIVATE_MIDDLEWARE', 'TRAEFIK_PREVIEW_PRIVATE_MIDDLEWARE']) runtime[name] = 'private-fixture'
    for (const [name, key] of Object.entries({ CMS: 'cms', WEB_MASTER: 'webMaster', WORKER: 'autoworkWorker', ORCHESTRATOR: 'orchestrator', MIGRATIONS: 'migrations' })) runtime[`LINKSITES_${name}_IMAGE`] = `registry.invalid/linksites/${key.toLowerCase()}@${manifest.images[key]}`
    const preflight = execFileSync('bash', ['deploy/scripts/preflight-server03-foundation.sh', runtimeFile, output], { cwd: root, env: runtime, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    assert.match(preflight, /preflight passed/)
    const invokePreflight = () => execFileSync('bash', ['deploy/scripts/preflight-server03-foundation.sh', runtimeFile, output], { cwd: root, env: runtime, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
    await writeFile(output, JSON.stringify({ ...manifest, libraries: { ...manifest.libraries, state: 'pending' } }))
    assert.throws(invokePreflight, (error) => /currently admitted marketing-smb-v1/.test(error.stderr))
    await writeFile(output, JSON.stringify({ ...manifest, platform: { state: 'pending' } }))
    assert.throws(invokePreflight, (error) => /exact admitted Platform migration SHA/.test(error.stderr))
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

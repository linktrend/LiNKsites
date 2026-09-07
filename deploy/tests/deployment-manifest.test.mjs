import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import test from 'node:test'

const root = resolve(new URL('../..', import.meta.url).pathname)
const digest = (character) => `sha256:${character.repeat(64)}`
const images = {
  LINKSITES_CMS_IMAGE_DIGEST: digest('1'),
  LINKSITES_WEB_MASTER_IMAGE_DIGEST: digest('2'),
  LINKSITES_ORCHESTRATOR_IMAGE_DIGEST: digest('3'),
  LINKSITES_WORKER_IMAGE_DIGEST: digest('4'),
  LINKSITES_MIGRATIONS_IMAGE_DIGEST: digest('5'),
}

test('deferred native v2 provider state remains eligible for honest infrastructure acceptance', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-manifest-'))
  const output = join(directory, 'manifest.json')
  try {
    const stdout = execFileSync(process.execPath, ['deploy/scripts/generate-deployment-manifest.mjs', '--provider-state', 'deferred', '--platform-state', 'pending', '--output', output], {
      cwd: root, env: { ...process.env, ...images, LINKSITES_TEMPLATE_ID: 'master-template-type-1', LINKSITES_TEMPLATE_VERSION: '2.0.0-a1.1', LINKSITES_TEMPLATE_FORMAT: 'revision2', LINKSITES_LINKLIBRARIES_ROOT: '/var/lib/linksites/linklibraries', LINKSITES_LINKLIBRARIES_COMMIT_SHA: 'a'.repeat(40), LINKSITES_LINKLIBRARIES_TREE_SHA: 'b'.repeat(40), LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256: 'c'.repeat(64), LINKSITES_LINKLIBRARIES_RECEIPT_PATH: '/var/lib/linksites/linklibraries/receipt.json', LINKLIBRARIES_ARTIFACT_PATH: '/var/lib/linksites/linklibraries' }, encoding: 'utf8',
    })
    const bytes = await readFile(output)
    const manifest = JSON.parse(bytes)
    const receipt = JSON.parse(stdout)
    assert.equal(manifest.schemaVersion, '1.2.0')
    assert.equal(manifest.libraries.state, 'deferred')
    assert.equal(manifest.libraries.entryId, 'master-template-type-1')
    assert.equal(manifest.libraries.infrastructureAcceptanceEligible, true)
    assert.equal(manifest.libraries.publishingEligible, false)
    assert.ok(manifest.libraries.blockedCapabilities.includes('template-dependent-publishing'))
    assert.equal('catalogSha' in manifest.libraries, false)
    assert.deepEqual(manifest.deferredTemplates, [{ entryId: 'master-template-type-1', state: 'deferred', reason: 'native-v2-selectable-release-deferred', blocksActiveProvider: false }])
    assert.equal(manifest.platform.state, 'pending')
    assert.equal(receipt.manifestSha256, createHash('sha256').update(bytes).digest('hex'))
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('ready provider state refuses absent native v2 receipt', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-manifest-ready-'))
  try {
    assert.throws(() => execFileSync(process.execPath, ['deploy/scripts/generate-deployment-manifest.mjs', '--provider-state', 'ready', '--output', join(directory, 'manifest.json')], {
      cwd: root, env: { ...process.env, ...images, LINKSITES_TEMPLATE_ID: 'master-template-type-1', LINKSITES_TEMPLATE_VERSION: '2.0.0-a1.1', LINKSITES_TEMPLATE_FORMAT: 'revision2', LINKSITES_LINKLIBRARIES_ROOT: directory, LINKSITES_LINKLIBRARIES_COMMIT_SHA: 'a'.repeat(40), LINKSITES_LINKLIBRARIES_TREE_SHA: 'b'.repeat(40), LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256: 'c'.repeat(64), LINKSITES_LINKLIBRARIES_RECEIPT_PATH: join(directory, 'receipt.json'), LINKLIBRARIES_ARTIFACT_PATH: directory, LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA: 'd'.repeat(40) }, encoding: 'utf8',
    }), /LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON/)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('ready provider state records exact native v2 provider and receipt identity', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-manifest-v2-'))
  const output = join(directory, 'manifest.json')
  try {
    await writeFile(join(directory, 'provider-marker'), 'native-v2\n')
    const git = (...args) => execFileSync('git', ['-C', directory, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
    git('init')
    git('add', 'provider-marker')
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'native v2 provider fixture')
    const commit = git('rev-parse', 'HEAD')
    const tree = git('rev-parse', 'HEAD^{tree}')
    const receipt = {
      schemaVersion: 2, schemaRevision: 2, receiptType: 'consumption', receiptId: 'native-v2-consumption',
      entryId: 'master-template-type-1', version: '2.0.0-a1.1', releaseManifestSha256: 'e'.repeat(64),
      releaseSourceCommitSha: 'f'.repeat(40), releaseSourceRepositoryTreeSha1: '1'.repeat(40), artifactTreeSha1: '2'.repeat(40),
      consumerMaterializedTreeSha1: '3'.repeat(40), issuedAt: '2026-09-07T00:00:00Z', issuer: { actorType: 'automation', actorId: 'fixture' },
      result: 'pass', evidence: [{ kind: 'receipt', locator: 'fixture', sha256: '4'.repeat(64) }], consumerId: 'linksites', consumptionMode: 'materialize',
    }
    await writeFile(join(directory, 'receipt.json'), `${JSON.stringify(receipt)}\n`)
    const env = {
      ...process.env, ...images, LINKSITES_TEMPLATE_ID: receipt.entryId, LINKSITES_TEMPLATE_VERSION: receipt.version, LINKSITES_TEMPLATE_FORMAT: 'revision2',
      LINKSITES_LINKLIBRARIES_ROOT: directory, LINKSITES_LINKLIBRARIES_COMMIT_SHA: commit, LINKSITES_LINKLIBRARIES_TREE_SHA: tree,
      LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256: '5'.repeat(64), LINKSITES_LINKLIBRARIES_RECEIPT_PATH: join(directory, 'receipt.json'),
      LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON: JSON.stringify(receipt), LINKLIBRARIES_ARTIFACT_PATH: directory, LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA: '6'.repeat(40),
    }
    execFileSync(process.execPath, ['deploy/scripts/generate-deployment-manifest.mjs', '--provider-state', 'ready', '--output', output], { cwd: root, env, encoding: 'utf8' })
    const manifest = JSON.parse(await readFile(output, 'utf8'))
    assert.equal(manifest.libraries.state, 'ready')
    assert.equal(manifest.libraries.providerCommitSha, commit)
    assert.equal(manifest.libraries.providerTreeSha, tree)
    assert.equal(manifest.libraries.receiptType, 'consumption')
    assert.equal(manifest.libraries.receiptSha256, createHash('sha256').update(JSON.stringify(receipt)).digest('hex'))
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
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

async function nativeProviderFixture() {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-manifest-v2-'))
  const releaseDirectory = join(directory, 'registry/v2/entries/master-template-type-1/versions/2.0.0-a1.1')
  await mkdir(releaseDirectory, { recursive: true })
  const dependencyProjectionSha256 = createHash('sha256').update('[]').digest('hex')
  const dependencyLockBytes = `${JSON.stringify({ lockSha256: dependencyProjectionSha256, dependencies: [] })}\n`
  const dependencyLockSha256 = createHash('sha256').update(dependencyLockBytes).digest('hex')
  const manifest = {
    schemaVersion: 2,
    schemaRevision: 2,
    manifestType: 'immutable_release',
    releaseId: 'master-template-type-1-2.0.0-a1.1',
    entryId: 'master-template-type-1',
    version: '2.0.0-a1.1',
    dependencyLockSha256,
    artifactTreeSha1: '2'.repeat(40),
    releaseSource: { releaseSourceCommitSha: 'f'.repeat(40), releaseSourceRepositoryTreeSha1: '1'.repeat(40) },
  }
  const manifestBytes = `${JSON.stringify(manifest)}\n`
  await writeFile(join(releaseDirectory, 'manifest.json'), manifestBytes)
  await writeFile(join(releaseDirectory, 'dependency-lock.json'), dependencyLockBytes)
  const receipt = {
    schemaVersion: 2,
    schemaRevision: 2,
    receiptType: 'consumption',
    receiptId: 'native-v2-consumption',
    entryId: 'master-template-type-1',
    version: '2.0.0-a1.1',
    releaseManifestSha256: createHash('sha256').update(manifestBytes).digest('hex'),
    releaseSourceCommitSha: 'f'.repeat(40),
    releaseSourceRepositoryTreeSha1: '1'.repeat(40),
    artifactTreeSha1: '2'.repeat(40),
    consumerMaterializedTreeSha1: '3'.repeat(40),
    issuedAt: '2026-09-07T00:00:00Z',
    issuer: { actorType: 'automation', actorId: 'fixture' },
    result: 'pass',
    evidence: [{ kind: 'receipt', locator: 'fixture', sha256: '4'.repeat(64) }],
    consumerId: 'linksites',
    consumptionMode: 'materialize',
  }
  const receiptBytes = `${JSON.stringify(receipt)}\n`
  const receiptPath = join(directory, 'receipt.json')
  await writeFile(receiptPath, receiptBytes)
  const git = (...args) => execFileSync('git', ['-C', directory, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  git('init')
  git('add', '.')
  git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'native v2 provider fixture')
  const commit = git('rev-parse', 'HEAD')
  const tree = git('rev-parse', 'HEAD^{tree}')
  const env = {
    ...process.env,
    ...images,
    LINKSITES_TEMPLATE_ID: receipt.entryId,
    LINKSITES_TEMPLATE_VERSION: receipt.version,
    LINKSITES_TEMPLATE_FORMAT: 'revision2',
    LINKSITES_LINKLIBRARIES_ROOT: directory,
    LINKSITES_LINKLIBRARIES_COMMIT_SHA: commit,
    LINKSITES_LINKLIBRARIES_TREE_SHA: tree,
    LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256: dependencyLockSha256,
    LINKSITES_LINKLIBRARIES_RECEIPT_PATH: receiptPath,
    LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON: receiptBytes,
    LINKLIBRARIES_ARTIFACT_PATH: directory,
    LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA: '6'.repeat(40),
  }
  return { directory, env, receipt, receiptBytes, receiptPath, dependencyLockSha256 }
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
  const fixture = await nativeProviderFixture()
  const output = join(fixture.directory, 'manifest.json')
  try {
    execFileSync(process.execPath, ['deploy/scripts/generate-deployment-manifest.mjs', '--provider-state', 'ready', '--output', output], { cwd: root, env: fixture.env, encoding: 'utf8' })
    const manifest = JSON.parse(await readFile(output, 'utf8'))
    assert.equal(manifest.libraries.state, 'ready')
    assert.equal(manifest.libraries.providerCommitSha, fixture.env.LINKSITES_LINKLIBRARIES_COMMIT_SHA)
    assert.equal(manifest.libraries.providerTreeSha, fixture.env.LINKSITES_LINKLIBRARIES_TREE_SHA)
    assert.equal(manifest.libraries.receiptType, 'consumption')
    assert.equal(manifest.libraries.receiptSha256, createHash('sha256').update(fixture.receiptBytes).digest('hex'))
  } finally {
    await rm(fixture.directory, { recursive: true, force: true })
  }
})

test('ready provider state rejects forged, stale, or mismatched native v2 receipt bindings', async () => {
  const cases = [
    ['forged environment receipt bytes', (fixture) => ({ ...fixture.env, LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON: fixture.receiptBytes.replace('native-v2-consumption', 'forged-receipt') }), /exactly match the mounted receipt/],
    ['stale mounted receipt bytes', async (fixture) => {
      const stale = { ...fixture.receipt, releaseManifestSha256: 'a'.repeat(64) }
      const staleBytes = `${JSON.stringify(stale)}\n`
      await writeFile(fixture.receiptPath, staleBytes)
      return { ...fixture.env, LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON: staleBytes }
    }, /receipt bytes do not match the configured provider commit/],
    ['provider dependency-lock drift', (fixture) => ({ ...fixture.env, LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256: 'b'.repeat(64) }), /dependency lock does not match/],
    ['provider checkout identity drift', (fixture) => ({ ...fixture.env, LINKSITES_LINKLIBRARIES_COMMIT_SHA: 'c'.repeat(40) }), /provider commit does not match the release identity/],
  ]
  for (const [label, mutate, expected] of cases) {
    const fixture = await nativeProviderFixture()
    try {
      const environment = await mutate(fixture)
      assert.throws(() => execFileSync(process.execPath, ['deploy/scripts/generate-deployment-manifest.mjs', '--provider-state', 'ready', '--output', join(fixture.directory, 'manifest.json')], { cwd: root, env: environment, encoding: 'utf8' }), expected, label)
    } finally {
      await rm(fixture.directory, { recursive: true, force: true })
    }
  }
})

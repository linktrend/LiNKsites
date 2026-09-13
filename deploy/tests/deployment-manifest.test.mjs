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
const canonical = (value) => value === null || typeof value !== 'object'
  ? JSON.stringify(value)
  : Array.isArray(value)
    ? `[${value.map(canonical).join(',')}]`
    : `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonical(value[key])}`).join(',')}}`
const canonicalSha256 = (value) => createHash('sha256').update(canonical(value)).digest('hex')

async function nativeProviderFixture(options = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'linksites-manifest-v2-'))
  const releaseDirectory = join(directory, 'registry/v2/entries/master-template-type-1/versions/2.0.0-a1.1')
  const artifactDirectory = join(releaseDirectory, 'artifact')
  await mkdir(join(directory, 'indexes/v2'), { recursive: true })
  await mkdir(artifactDirectory, { recursive: true })
  const sourceInventoryBytes = '{"sourceRepository":"LiNKsites","sourceCommit":"f28fd53d454cbc33d97951d8e62826dae5a83e40","sourceTree":"34dc7467f4eb382ab7fbe258c5adc0f857d8ab5b"}\n'
  await writeFile(join(artifactDirectory, 'source-inventory.json'), sourceInventoryBytes)
  const inventoryEntries = [{ path: 'source-inventory.json', type: 'file', byteLength: Buffer.byteLength(sourceInventoryBytes), sha256: createHash('sha256').update(sourceInventoryBytes).digest('hex'), mediaType: 'application/json', classification: 'public_reusable', retention: 'release', immutable: true, runtimeDownload: false }]
  const inventorySha256 = canonicalSha256(inventoryEntries)
  const inventory = { schemaVersion: 2, schemaRevision: 2, inventoryType: 'exhaustive_tree_inventory', root: 'artifact', complete: true, includesDirectories: true, includesFiles: true, includesSymlinks: false, entries: inventoryEntries, inventorySha256, artifactTreeSha1: '2'.repeat(40) }
  if (!options.omitInventory) await writeFile(join(releaseDirectory, 'inventory.json'), `${JSON.stringify(inventory)}\n`)
  const dependencyEntries = options.dependencyEntries ?? []
  const dependencyProjectionSha256 = canonicalSha256(dependencyEntries)
  const dependencyLock = { schemaVersion: 2, schemaRevision: 2, lockType: 'deterministic_dependency_lock', manager: 'other', lockVersion: 'fixture-1', dependencies: dependencyEntries, lockSha256: dependencyProjectionSha256 }
  const dependencyLockBytes = `${JSON.stringify(dependencyLock)}\n`
  const dependencyLockSha256 = createHash('sha256').update(dependencyLockBytes).digest('hex')
  const manifest = {
    schemaVersion: 2,
    schemaRevision: 2,
    manifestType: 'immutable_release',
    releaseId: 'master-template-type-1-2.0.0-a1.1',
    entryId: 'master-template-type-1',
    version: '2.0.0-a1.1',
    artifactType: 'website_template',
    dependencyLockSha256,
    artifactTreeSha1: '2'.repeat(40),
    payloadSha256: '7'.repeat(64),
    inventorySha256,
    releaseSource: { releaseSourceCommitSha: 'f'.repeat(40), releaseSourceRepositoryTreeSha1: '1'.repeat(40) },
    extension: { extensionType: 'website_template', templateClass: 'shared_renderer_declarative', contentScope: { siteId: true, locale: true, publicationStatus: true }, draftOnly: true, directPublication: false, urls: ['https://example.invalid/template'], compatibilityDisposition: 'compatible', routes: [{ route: '/', page: 'source-inventory.json' }], assets: ['source-inventory.json'], urlPolicy: { provenanceUrls: ['https://example.invalid/provenance'], licenseUrls: ['https://example.invalid/license'], docsUrls: ['https://example.invalid/docs'] }, runtimeEndpointContracts: [], materialization: { mode: 'copy', sourceRoot: 'artifact', destinationRoot: 'output', commands: [], substitutions: [], outputs: ['source-inventory.json'], network: { allowNetwork: false, allowedHosts: [] } } },
  }
  if (options.materializationOverrides) manifest.extension.materialization = { ...manifest.extension.materialization, ...options.materializationOverrides }
  if (options.omitManifestField) delete manifest[options.omitManifestField]
  const manifestBytes = `${JSON.stringify(manifest)}\n`
  await writeFile(join(releaseDirectory, 'manifest.json'), manifestBytes)
  await writeFile(join(releaseDirectory, 'dependency-lock.json'), dependencyLockBytes)
  const catalogueRecord = { schemaVersion: 2, schemaRevision: 2, recordType: 'catalogue_record', entryId: manifest.entryId, version: manifest.version, artifactType: manifest.artifactType, releaseManifestSha256: createHash('sha256').update(manifestBytes).digest('hex'), releaseSource: manifest.releaseSource, artifactTreeSha1: manifest.artifactTreeSha1, inventorySha256: manifest.inventorySha256, lifecycle: 'selectable', selectability: 'selectable', compatibility: 'compatible', bundlePath: 'registry/v2/entries/master-template-type-1/versions/2.0.0-a1.1', governance: { qualification: { status: 'qualified', receiptId: 'fixture-qualification', independentPass: true }, admission: { status: 'admitted', receiptId: 'fixture-admission' } }, ...options.recordOverrides }
  const catalogueRecords = options.catalogueRecords ?? [catalogueRecord]
  const catalogue = { schemaVersion: 2, schemaRevision: 2, catalogueType: 'catalogue', recordsSha256: canonicalSha256(catalogueRecords), records: catalogueRecords }
  await writeFile(join(directory, 'indexes/v2/catalog.json'), `${JSON.stringify(catalogue)}\n`)
  const catalogueBytes = await readFile(join(directory, 'indexes/v2/catalog.json'))
  const receipt = options.receiptType === 'verified_cache' ? {
    schemaVersion: 2,
    schemaRevision: 2,
    receiptType: 'verified_cache',
    sourceEvidence: { kind: 'external_repository_receipt', receiptId: 'fixture-cache', selectedRepositoryCommitSha: 'f'.repeat(40), selectedRepositoryTreeSha1: '1'.repeat(40), immutable: true },
    releaseSource: manifest.releaseSource,
    catalogueSha256: createHash('sha256').update(catalogueBytes).digest('hex'),
    catalogueRecordsSha256: catalogue.recordsSha256,
    entryId: manifest.entryId,
    version: manifest.version,
    releaseManifestSha256: createHash('sha256').update(manifestBytes).digest('hex'),
    inventorySha256,
    payloadSha256: manifest.payloadSha256,
    artifactTreeSha1: manifest.artifactTreeSha1,
    ...options.receiptOverrides,
  } : {
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
    evidence: [{ kind: 'catalogue', locator: 'indexes/v2/catalog.json', sha256: '4'.repeat(64) }],
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
  let configuredCommit = commit
  let configuredTree = tree
  if (options.checkoutHeadMismatch) {
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '--allow-empty', '-m', 'provider commit object present but not checked out')
    configuredCommit = git('rev-parse', 'HEAD')
    configuredTree = git('rev-parse', 'HEAD^{tree}')
    git('checkout', '--detach', commit)
  }
  if (options.checkoutTreeMismatch) {
    await writeFile(join(directory, 'checkout-tree-mismatch.txt'), 'tree drift fixture\n')
    git('add', 'checkout-tree-mismatch.txt')
    git('-c', 'user.name=Fixture', '-c', 'user.email=fixture@example.invalid', 'commit', '-m', 'provider tree mismatch fixture')
    configuredTree = git('rev-parse', 'HEAD^{tree}')
    git('checkout', '--detach', commit)
  }
  const env = {
    ...process.env,
    ...images,
    LINKSITES_TEMPLATE_ID: receipt.entryId,
    LINKSITES_TEMPLATE_VERSION: receipt.version,
    LINKSITES_TEMPLATE_FORMAT: 'revision2',
    LINKSITES_LINKLIBRARIES_ROOT: directory,
    LINKSITES_LINKLIBRARIES_COMMIT_SHA: configuredCommit,
    LINKSITES_LINKLIBRARIES_TREE_SHA: configuredTree,
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
    const deferredEnv = { ...process.env, ...images, LINKSITES_TEMPLATE_ID: 'master-template-type-1', LINKSITES_TEMPLATE_VERSION: '2.0.0-a1.1', LINKSITES_TEMPLATE_FORMAT: 'revision2' }
    for (const name of ['LINKSITES_LINKLIBRARIES_ROOT', 'LINKSITES_LINKLIBRARIES_COMMIT_SHA', 'LINKSITES_LINKLIBRARIES_TREE_SHA', 'LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256', 'LINKSITES_LINKLIBRARIES_RECEIPT_PATH', 'LINKLIBRARIES_ARTIFACT_PATH', 'LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON']) delete deferredEnv[name]
    const stdout = execFileSync(process.execPath, ['deploy/scripts/generate-deployment-manifest.mjs', '--provider-state', 'deferred', '--platform-state', 'pending', '--output', output], {
      cwd: root, env: deferredEnv, encoding: 'utf8',
    })
    const bytes = await readFile(output)
    const manifest = JSON.parse(bytes)
    const receipt = JSON.parse(stdout)
    assert.equal(manifest.schemaVersion, '1.3.0')
    assert.equal(manifest.libraries.state, 'deferred')
    assert.equal(manifest.autowork.mode, 'manual')
    assert.equal(manifest.autowork.liveEnabled, false)
    assert.equal(manifest.pins.harness.commit, 'de0abe31736e878aad3447bf4b720a40142d8a6e')
    assert.match(manifest.repository.releaseSha, /^[0-9a-f]{40}$/)
    assert.match(manifest.repository.releaseTree, /^[0-9a-f]{40}$/)
    assert.match(manifest.repository.lockfileSha256, /^[a-f0-9]{64}$/)
    assert.match(manifest.configuration.contractSha256, /^[a-f0-9]{64}$/)
    assert.equal(manifest.libraries.entryId, 'master-template-type-1')
    assert.equal(manifest.libraries.infrastructureAcceptanceEligible, true)
    assert.equal(manifest.libraries.publishingEligible, false)
    assert.ok(manifest.libraries.blockedCapabilities.includes('template-dependent-publishing'))
    assert.equal('providerCommitSha' in manifest.libraries, false)
    assert.equal('providerTreeSha' in manifest.libraries, false)
    assert.equal('catalogSha' in manifest.libraries, false)
    assert.deepEqual(manifest.deferredTemplates, [{ entryId: 'master-template-type-1', state: 'deferred', reason: 'native-v2-selectable-release-deferred', blocksActiveProvider: false }])
    assert.equal(manifest.platform.state, 'pending')
    assert.equal(manifest.platform.artifactOnly, true)
    assert.equal(manifest.platform.deploymentEligible, false)
    assert.equal(manifest.platform.requiresPlatformAdmission, true)
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

test('ready provider state rejects an existing provider commit object when checkout HEAD differs', async () => {
  const fixture = await nativeProviderFixture({ checkoutHeadMismatch: true })
  try {
    assert.throws(() => execFileSync(process.execPath, ['deploy/scripts/generate-deployment-manifest.mjs', '--provider-state', 'ready', '--output', join(fixture.directory, 'manifest.json')], { cwd: root, env: fixture.env, encoding: 'utf8' }), /provider commit does not match the release identity/)
  } finally {
    await rm(fixture.directory, { recursive: true, force: true })
  }
})

test('ready provider state rejects a checked-out provider tree mismatch', async () => {
  const fixture = await nativeProviderFixture({ checkoutTreeMismatch: true })
  try {
    assert.throws(() => execFileSync(process.execPath, ['deploy/scripts/generate-deployment-manifest.mjs', '--provider-state', 'ready', '--output', join(fixture.directory, 'manifest.json')], { cwd: root, env: fixture.env, encoding: 'utf8' }), /provider tree does not match the release identity/)
  } finally {
    await rm(fixture.directory, { recursive: true, force: true })
  }
})

test('ready provider state requires an admitted selectable catalogue record and complete artifact inventory', async () => {
  const cases = [
    ['non-selectable catalogue record', { recordOverrides: { selectability: 'non_selectable', lifecycle: 'draft', compatibility: 'unknown' } }, /catalogue selected record is not admitted\/selectable\/compatible/],
    ['missing selected catalogue record', { catalogueRecords: [] }, /exactly one selected entry\/version record/],
    ['missing artifact inventory', { omitInventory: true }, /artifact inventory/],
    ['malformed governance', { recordOverrides: { governance: { qualification: { status: 'qualified', receiptId: 'fixture-qualification', independentPass: false }, admission: { status: 'admitted', receiptId: 'fixture-admission' } } } }, /governance\.qualification is invalid/],
    ['incomplete manifest', { omitManifestField: 'extension' }, /manifest\.extension is missing/],
    ['unknown dependency closure', { dependencyEntries: [{ name: 'runtime-a', version: '1.0.0', ecosystem: 'other', source: 'registry:fixture', integritySha256: 'a'.repeat(64), dependencies: ['runtime-missing'] }] }, /dependencyLock\.dependencies\[0\] closure is invalid/],
    ['circular runtime dependency closure', { dependencyEntries: [{ name: 'runtime-a', version: '1.0.0', ecosystem: 'other', source: 'registry:fixture', integritySha256: 'a'.repeat(64), dependencies: ['runtime-b'] }, { name: 'runtime-b', version: '1.0.0', ecosystem: 'other', source: 'registry:fixture', integritySha256: 'b'.repeat(64), dependencies: ['runtime-a'] }] }, /circular runtime dependency/],
    ['materializer network escape', { materializationOverrides: { network: { allowNetwork: true, allowedHosts: ['example.test'] } } }, /manifest\.extension\.materialization\.network is invalid/],
  ]
  for (const [label, options, expected] of cases) {
    const fixture = await nativeProviderFixture(options)
    try {
      assert.throws(() => execFileSync(process.execPath, ['deploy/scripts/generate-deployment-manifest.mjs', '--provider-state', 'ready', '--output', join(fixture.directory, 'manifest.json')], { cwd: root, env: fixture.env, encoding: 'utf8' }), expected, label)
    } finally {
      await rm(fixture.directory, { recursive: true, force: true })
    }
  }
})

test('verified-cache receipt catalogue digest is cryptographically bound to mounted catalogue bytes', async () => {
  const fixture = await nativeProviderFixture({ receiptType: 'verified_cache', receiptOverrides: { catalogueSha256: '0'.repeat(64) } })
  try {
    assert.throws(() => execFileSync(process.execPath, ['deploy/scripts/generate-deployment-manifest.mjs', '--provider-state', 'ready', '--output', join(fixture.directory, 'manifest.json')], { cwd: root, env: fixture.env, encoding: 'utf8' }), /catalogueSha256 is not bound to the mounted catalogue bytes/)
  } finally {
    await rm(fixture.directory, { recursive: true, force: true })
  }
})

test('mounted catalogue byte drift fails closed even when its JSON remains well formed', async () => {
  const fixture = await nativeProviderFixture()
  try {
    const cataloguePath = join(fixture.directory, 'indexes/v2/catalog.json')
    const catalogue = JSON.parse(await readFile(cataloguePath, 'utf8'))
    catalogue.records[0].summary = 'stale mounted bytes'
    await writeFile(cataloguePath, `${JSON.stringify(catalogue)}\n`)
    assert.throws(() => execFileSync(process.execPath, ['deploy/scripts/generate-deployment-manifest.mjs', '--provider-state', 'ready', '--output', join(fixture.directory, 'manifest.json')], { cwd: root, env: fixture.env, encoding: 'utf8' }), /mounted native v2 provider catalogue bytes do not match the configured provider commit/)
  } finally {
    await rm(fixture.directory, { recursive: true, force: true })
  }
})

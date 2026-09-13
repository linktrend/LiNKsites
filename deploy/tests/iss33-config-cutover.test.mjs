import assert from 'node:assert/strict'
import test from 'node:test'
import { spawn } from 'node:child_process'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import {
  SURFACE_IDS,
  applyMigration,
  assertNoSecretMaterial,
  classifyDiffPaths,
  committedTemplateDrift,
  createIsolatedStore,
  driftCheck,
  fingerprintSnapshot,
  injectDrift,
  loadSurfaceCatalog,
  offlineRehearsal,
  operationsDeniesDeploymentAndVps,
  persistStore,
  planMigration,
  parseEnvTemplate,
  readbackStore,
  refuseLiveCanary,
  rollbackMigration,
  verifyReadback,
} from '../config/cutover/contract.mjs'

const root = resolve(new URL('../..', import.meta.url).pathname)
const cli = resolve(root, 'deploy/scripts/iss33-config-cutover.mjs')

const run = (argv, env = {}) => new Promise((resolveRun) => {
  const child = spawn(process.execPath, [cli, ...argv], {
    cwd: root,
    env: { ...process.env, ...env },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let stdout = ''
  let stderr = ''
  child.stdout.on('data', (chunk) => { stdout += chunk })
  child.stderr.on('data', (chunk) => { stderr += chunk })
  child.on('close', (code) => resolveRun({ code, stdout, stderr }))
})

test('catalog owns exactly the nine ISS-33 configuration surfaces', async () => {
  const catalog = await loadSurfaceCatalog()
  assert.deepEqual(catalog.surfaces.map((surface) => surface.id), [...SURFACE_IDS])
  assert.equal(catalog.liveMutation, false)
  assert.equal(catalog.liveCanary, 'external_fail_closed')
})

test('templates are name-only placeholders and never persist credentials', async () => {
  const catalog = await loadSurfaceCatalog()
  const store = createIsolatedStore(catalog)
  assertNoSecretMaterial(store)
  const readback = readbackStore(store)
  const serialized = JSON.stringify(readback)
  assert.equal(/(?:postgres(?:ql)?:\/\/[^<]|sk_live_)/i.test(serialized), false)
  assert.ok(serialized.includes('[REDACTED]'))
  for (const id of SURFACE_IDS) {
    const entries = Object.values(readback.surfaces[id].entries)
    assert.ok(entries.length > 0)
    for (const entry of entries) {
      if (entry.secret) assert.equal(entry.value, '[REDACTED]')
      else assert.equal(entry.value.startsWith('<'), true)
    }
  }
})

test('isolated migrate/readback/rollback restores every surface fingerprint', async () => {
  const catalog = await loadSurfaceCatalog()
  const store = createIsolatedStore(catalog)
  const before = Object.fromEntries(SURFACE_IDS.map((id) => [id, fingerprintSnapshot(store.surfaces[id].observed)]))
  const plan = planMigration(store)
  assert.ok(plan.steps.every((step) => step.action === 'copy-desired-onto-observed'))
  applyMigration(store)
  assert.equal(verifyReadback(store, 'profile-v2').ok, true)
  assert.equal(driftCheck(store, 'profile-v2').ok, true)
  rollbackMigration(store)
  assert.equal(verifyReadback(store, 'legacy').ok, true)
  for (const id of SURFACE_IDS) {
    assert.equal(fingerprintSnapshot(store.surfaces[id].observed), before[id])
  }
})

test('permanent drift check fails closed on injected mismatch and recovers', async () => {
  const catalog = await loadSurfaceCatalog()
  const store = createIsolatedStore(catalog)
  applyMigration(store)
  injectDrift(store, 'cms', 'PAYLOAD_PUBLIC_SERVER_URL')
  const drifted = driftCheck(store, 'profile-v2')
  assert.equal(drifted.ok, false)
  assert.deepEqual(drifted.driftedSurfaces, ['cms'])
  store.surfaces.cms.observed = structuredClone(store.surfaces.cms.desired)
  assert.equal(driftCheck(store, 'profile-v2').ok, true)
})

test('live production/VPS canary requests fail closed', () => {
  for (const probe of [
    { argv: ['--live'] },
    { argv: ['--vps'] },
    { argv: ['--production'] },
    { env: { LINKSITES_ISS33_CANARY: 'live' } },
    { env: { LINKSITES_DEPLOY_TARGET: 'production' } },
  ]) {
    const result = refuseLiveCanary(probe.argv ?? ['canary'], { ...process.env, ...probe.env })
    assert.equal(result.ok, false)
    assert.equal(result.status, 'live_canary_external')
    assert.equal(result.result, 'fail_closed')
  }
  assert.equal(refuseLiveCanary(['rehearse'], { LINKSITES_ISS33_CANARY: 'offline' }).ok, true)
})

test('scope classifier refuses ledger, orchestrator, execution and release docs', () => {
  const result = classifyDiffPaths([
    'deploy/config/cutover/contract.mjs',
    'docs/evidence/profile-v2-cutover/config/PROOF.md',
    'packages/program-ledger/src/ledger.ts',
    'apps/program-orchestrator/src/index.ts',
    'execution/run.sh',
    'docs/releases/NOTES.md',
  ])
  assert.equal(result.ok, false)
  assert.deepEqual(result.prohibited, [
    'packages/program-ledger/src/ledger.ts',
    'apps/program-orchestrator/src/index.ts',
    'execution/run.sh',
    'docs/releases/NOTES.md',
  ])
  assert.deepEqual(result.owned, [
    'deploy/config/cutover/contract.mjs',
    'docs/evidence/profile-v2-cutover/config/PROOF.md',
  ])
})

test('committed deploy templates remain fail-closed and placeholder-only', async () => {
  const catalog = await loadSurfaceCatalog()
  const productionExample = await readFile(resolve(root, 'deploy/config/production.env.example'), 'utf8')
  const parsed = parseEnvTemplate(productionExample)
  assert.equal(parsed.assigned.includes('LINKSITES_AUTOWORK_MODE'), true)
  assert.equal(parsed.assigned.includes('LINKAUTOWORK_GATEWAY_URL'), false)
  assert.equal(parsed.commented.includes('LINKAUTOWORK_GATEWAY_URL'), true)
  assert.equal(parsed.commented.includes('LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA'), true)
  const result = committedTemplateDrift({
    catalog,
    productionExample,
    compose: await readFile(resolve(root, 'deploy/docker-compose.deploy.yml'), 'utf8'),
    operations: await readFile(resolve(root, 'deploy/OPERATIONS.md'), 'utf8'),
  })
  assert.equal(result.ok, true, result.errors.join('; '))
})

test('commented optional live fields may be named unset; required fields must stay assigned', async () => {
  const catalog = await loadSurfaceCatalog()
  const productionExample = await readFile(resolve(root, 'deploy/config/production.env.example'), 'utf8')
  const compose = await readFile(resolve(root, 'deploy/docker-compose.deploy.yml'), 'utf8')
  const operations = await readFile(resolve(root, 'deploy/OPERATIONS.md'), 'utf8')

  const requiredCommented = productionExample.replace(/^DATABASE_URI=/m, '# DATABASE_URI=')
  const requiredResult = committedTemplateDrift({
    catalog,
    productionExample: requiredCommented,
    compose,
    operations,
  })
  assert.equal(requiredCommented.includes('# DATABASE_URI='), true)
  assert.equal(requiredResult.ok, false)
  assert.ok(requiredResult.errors.some((error) => error.includes('DATABASE_URI') && error.includes('must not be commented')))

  const liveUncommented = productionExample.replace(
    /^# LINKAUTOWORK_GATEWAY_URL=/m,
    'LINKAUTOWORK_GATEWAY_URL=',
  )
  const liveSetResult = committedTemplateDrift({
    catalog,
    productionExample: liveUncommented,
    compose,
    operations,
  })
  assert.equal(liveSetResult.ok, false)
  assert.ok(liveSetResult.errors.some((error) => error.includes('LINKAUTOWORK_GATEWAY_URL') && error.includes('commented and unset')))

  const liveMissing = productionExample.replace(/^# LINKAUTOWORK_GATEWAY_URL=.*\n/m, '')
  const liveMissingResult = committedTemplateDrift({
    catalog,
    productionExample: liveMissing,
    compose,
    operations,
  })
  assert.equal(liveMissingResult.ok, false)
  assert.ok(liveMissingResult.errors.some((error) => error.includes('LINKAUTOWORK_GATEWAY_URL') && error.includes('missing')))
})

test('operations wording still fail-closes VPS mutation when Markdown emphasis is used', async () => {
  const catalog = await loadSurfaceCatalog()
  const productionExample = await readFile(resolve(root, 'deploy/config/production.env.example'), 'utf8')
  const compose = await readFile(resolve(root, 'deploy/docker-compose.deploy.yml'), 'utf8')
  const emphasized = [
    '## 7. Rollback to the prior five-digest manifest',
    '',
    'This document does **not** authorize or perform deployment, VPS mutation.',
    '',
  ].join('\n')
  assert.equal(operationsDeniesDeploymentAndVps(emphasized), true)
  assert.equal(emphasized.includes('does not authorize or perform VPS'), false)
  const emphasizedResult = committedTemplateDrift({
    catalog,
    productionExample,
    compose,
    operations: emphasized,
  })
  assert.equal(emphasizedResult.ok, true, emphasizedResult.errors.join('; '))

  const missingDenial = '## Rollback\nLater authorized work may mutate a VPS.\n'
  assert.equal(operationsDeniesDeploymentAndVps(missingDenial), false)
  const missingResult = committedTemplateDrift({
    catalog,
    productionExample,
    compose,
    operations: missingDenial,
  })
  assert.equal(missingResult.ok, false)
  assert.ok(missingResult.errors.includes('operations manual no longer fail-closes VPS mutation'))
})

test('CLI rehearsal writes an isolated receipt without secret values', async () => {
  const workspace = await mkdtemp(join(tmpdir(), 'iss33-config-'))
  const receiptPath = join(workspace, 'receipt.json')
  const storePath = join(workspace, 'store.json')
  try {
    const catalog = await loadSurfaceCatalog()
    await persistStore(storePath, createIsolatedStore(catalog))
    const rehearsal = await run(['rehearse', '--receipt', receiptPath])
    assert.equal(rehearsal.code, 0, rehearsal.stderr)
    const receipt = JSON.parse(await readFile(receiptPath, 'utf8'))
    assert.equal(receipt.ok, true)
    assert.equal(receipt.publicActivation, false)
    assert.equal(receipt.credentialsPersisted, false)
    assert.equal(receipt.drift.afterInjectedMismatch.ok, false)
    assertNoSecretMaterial(receipt)
    const live = await run(['canary', '--live'])
    assert.equal(live.code, 78)
    assert.equal(JSON.parse(live.stderr).status, 'live_canary_external')
    const templates = await run(['templates'])
    assert.equal(templates.code, 0)
    assert.ok(JSON.parse(templates.stdout).surfaces.cms.DATABASE_URI.startsWith('<redacted-'))
  } finally {
    await rm(workspace, { recursive: true, force: true })
  }
})

test('offlineRehearsal helper covers migrate, drift, rollback and fail-closed canary', async () => {
  const catalog = await loadSurfaceCatalog()
  const receipt = await offlineRehearsal({ catalog })
  assert.equal(receipt.ok, true)
  assert.equal(receipt.surfaces.length, 9)
  assert.equal(receipt.afterRollback.ok, true)
})

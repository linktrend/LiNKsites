#!/usr/bin/env node
import { execFileSync } from 'node:child_process'
import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import {
  applyMigration,
  classifyDiffPaths,
  committedTemplateDrift,
  createIsolatedStore,
  driftCheck,
  loadStore,
  loadSurfaceCatalog,
  offlineRehearsal,
  persistStore,
  planMigration,
  PROTECTED_DEVELOPMENT,
  readbackStore,
  refuseLiveCanary,
  rollbackMigration,
  SURFACE_IDS,
  verifyReadback,
} from '../config/cutover/contract.mjs'

const usage = `usage: node deploy/scripts/iss33-config-cutover.mjs <command> [options]
commands:
  templates              print name-only templates for all nine surfaces
  readback --store <p>   redacted readback of an isolated store
  plan --store <p>       migration plan without applying
  apply --store <p>      apply desired snapshot onto isolated observed state
  verify --store <p> --generation <legacy|profile-v2>
  rollback --store <p>   restore isolated backup
  drift --store <p> --generation <legacy|profile-v2>
  canary                 fail closed unless the request is offline-only
  committed-drift        compare committed deploy templates/compose/ops
  scope-check            refuse paths outside deploy/** and config evidence
  rehearse [--receipt p] offline migration/rollback/drift rehearsal
  validate-evidence --dir <p>
`

const args = process.argv.slice(2)
const command = args[0]
if (!command || command === '--help' || command === 'help') {
  process.stdout.write(usage)
  process.exit(command ? 0 : 64)
}

function flag(name) {
  const index = args.indexOf(`--${name}`)
  if (index < 0) return null
  return args[index + 1] ?? ''
}

function emit(value, code = 0) {
  const payload = `${JSON.stringify(value, null, 2)}\n`
  if (code === 0) process.stdout.write(payload)
  else process.stderr.write(payload)
  process.exit(code)
}

function git(cwd, gitArgs) {
  return execFileSync('git', gitArgs, { cwd, encoding: 'utf8' }).trim()
}

const root = resolve(new URL('../..', import.meta.url).pathname)
const catalog = await loadSurfaceCatalog()
const canary = refuseLiveCanary(args, process.env)
if (!canary.ok) emit(canary, 78)

try {
  if (command === 'templates') {
    emit({
      schemaVersion: catalog.schemaVersion,
      liveMutation: false,
      surfaces: Object.fromEntries(
        catalog.surfaces.map((surface) => [
          surface.id,
          Object.fromEntries(surface.keys.map((key) => [key.name, key.secret ? `<redacted-${key.name}>` : `<${key.name}>`])),
        ]),
      ),
    })
  }

  if (command === 'canary') emit(canary)

  if (command === 'rehearse') {
    const receiptPath = flag('receipt')
    const receipt = await offlineRehearsal({ catalog, receiptPath: receiptPath ? resolve(receiptPath) : null })
    emit(receipt, receipt.ok ? 0 : 78)
  }

  if (command === 'committed-drift') {
    const result = committedTemplateDrift({
      catalog,
      productionExample: await readFile(resolve(root, 'deploy/config/production.env.example'), 'utf8'),
      compose: await readFile(resolve(root, 'deploy/docker-compose.deploy.yml'), 'utf8'),
      operations: await readFile(resolve(root, 'deploy/OPERATIONS.md'), 'utf8'),
    })
    emit(result, result.ok ? 0 : 78)
  }

  if (command === 'scope-check') {
    const base = git(root, ['merge-base', PROTECTED_DEVELOPMENT.commit, 'HEAD'])
    const names = git(root, ['diff', '--name-only', `${base}...HEAD`])
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
    const unstaged = git(root, ['status', '--porcelain'])
      .split('\n')
      .map((line) => line.slice(3).trim())
      .filter(Boolean)
    const result = classifyDiffPaths([...new Set([...names, ...unstaged])])
    emit({ ...result, base, protectedDevelopment: PROTECTED_DEVELOPMENT }, result.ok ? 0 : 78)
  }

  if (command === 'validate-evidence') {
    const dir = resolve(flag('dir') || 'docs/evidence/profile-v2-cutover/config')
    const required = ['SCOPE.json', 'ATTESTATION.json', 'PROOF.md', 'receipts/offline-rehearsal.json']
    const missing = []
    const files = {}
    for (const name of required) {
      try {
        files[name] = await readFile(resolve(dir, name), 'utf8')
      } catch {
        missing.push(name)
      }
    }
    if (missing.length) emit({ ok: false, missing, liveMutation: false }, 78)
    const scope = JSON.parse(files['SCOPE.json'])
    const attestation = JSON.parse(files['ATTESTATION.json'])
    const receipt = JSON.parse(files['receipts/offline-rehearsal.json'])
    const errors = []
    if (scope.liveCanary !== 'external_fail_closed') errors.push('SCOPE liveCanary is not fail-closed')
    if (!SURFACE_IDS.every((id) => scope.surfaces?.includes(id))) errors.push('SCOPE missing surfaces')
    if (attestation.liveMutation !== false) errors.push('ATTESTATION claims live mutation')
    if (receipt.ok !== true || receipt.credentialsPersisted !== false || receipt.publicActivation !== false) {
      errors.push('offline rehearsal receipt is not a passing isolated proof')
    }
    if (!files['PROOF.md'].includes('live canary remains external')) errors.push('PROOF.md missing live-canary bound')
    emit({ ok: errors.length === 0, errors, liveMutation: false }, errors.length ? 78 : 0)
  }

  const storePath = flag('store')
  const needsStore = ['readback', 'plan', 'apply', 'verify', 'rollback', 'drift'].includes(command)
  if (needsStore && !storePath) emit({ status: 'invalid_usage', error: '--store is required' }, 64)

  if (command === 'init-store') {
    const path = resolve(flag('store') || 'deploy/fixtures/iss33-config/isolated-store.json')
    const store = createIsolatedStore(catalog)
    await persistStore(path, store)
    emit({ status: 'initialized_isolated_store', path, liveMutation: false })
  }

  if (needsStore) {
    const path = resolve(storePath)
    const store = await loadStore(path)
    if (command === 'readback') emit(readbackStore(store))
    if (command === 'plan') emit(planMigration(store))
    if (command === 'apply') {
      const result = applyMigration(store)
      await persistStore(path, store)
      emit(result)
    }
    if (command === 'verify') {
      const generation = flag('generation') || 'profile-v2'
      const result = verifyReadback(store, generation)
      emit(result, result.ok ? 0 : 78)
    }
    if (command === 'rollback') {
      const result = rollbackMigration(store)
      await persistStore(path, store)
      emit(result)
    }
    if (command === 'drift') {
      const generation = flag('generation') || 'profile-v2'
      const result = driftCheck(store, generation)
      emit(result, result.ok ? 0 : 78)
    }
  }

  emit({ status: 'unknown_command', command, usage }, 64)
} catch (error) {
  const status = error?.status || 'iss33_config_failed'
  emit({
    status,
    error: error instanceof Error ? error.message : 'unknown error',
    liveMutation: false,
  }, 78)
}

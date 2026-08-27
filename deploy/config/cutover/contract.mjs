import { createHash } from 'node:crypto'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const CUTOVER_SCHEMA_VERSION = '1.0.0'
export const SURFACE_IDS = Object.freeze([
  'cms',
  'web-master',
  'provider',
  'hosting',
  'database',
  'queue',
  'secrets',
  'monitoring',
  'deployment',
])

export const OWNED_PREFIXES = Object.freeze([
  'deploy/',
  'docs/evidence/profile-v2-cutover/config/',
  '.github/linktrend-secret-scan-fixtures.json',
])

export const PROHIBITED_PREFIXES = Object.freeze([
  'packages/program-ledger/',
  'apps/program-orchestrator/',
  'execution/',
  'docs/releases/',
  'docs/evidence/profile-v2-release/',
])

export const PROTECTED_DEVELOPMENT = Object.freeze({
  commit: '7542cb3b1fa1d76cec40f59a522514a86e083038',
  tree: '284814fd2296b2825d8c92f10d9f7dc78ae08e38',
})

const here = dirname(fileURLToPath(import.meta.url))
const surfacesPath = resolve(here, 'surfaces.json')

const placeholderPattern = /^(?:|<[^>]+>|change[-_ ]?me|replace[-_ ]?me|example|todo|mock|undefined|null)$/i
const liveCanaryPattern = /^(?:live|production|vps|hosted|public|customer)$/i
const secretNameHint = /(?:secret|token|password|api[_-]?key|uri|credential)/i

function clone(value) {
  return structuredClone(value)
}

function die(status, extra = {}) {
  const error = Object.assign(new Error(status), { status, ...extra })
  return error
}

export async function loadSurfaceCatalog() {
  const catalog = JSON.parse(await readFile(surfacesPath, 'utf8'))
  if (catalog.schemaVersion !== CUTOVER_SCHEMA_VERSION) {
    throw die('invalid_cutover_schema', { expected: CUTOVER_SCHEMA_VERSION, actual: catalog.schemaVersion })
  }
  if (catalog.liveCanary !== 'external_fail_closed' || catalog.liveMutation !== false) {
    throw die('live_mutation_enabled')
  }
  const ids = catalog.surfaces.map((surface) => surface.id)
  if (ids.length !== SURFACE_IDS.length || SURFACE_IDS.some((id, index) => ids[index] !== id)) {
    throw die('surface_set_mismatch', { expected: SURFACE_IDS, actual: ids })
  }
  return catalog
}

export function templateValue(key) {
  return key.secret ? `<redacted-${key.name}>` : `<${key.name}>`
}

export function snapshotFromSurface(surface, generation) {
  const entries = {}
  for (const key of surface.keys) {
    entries[key.name] = {
      present: true,
      secret: key.secret,
      format: key.format,
      generation,
      value: templateValue(key),
    }
  }
  return {
    surface: surface.id,
    generation,
    liveMutation: false,
    entries,
  }
}

export function redactedEntry(entry) {
  if (!entry) return { present: false, secret: false, value: '' }
  return {
    present: entry.present === true,
    secret: entry.secret === true,
    format: entry.format,
    generation: entry.generation,
    value: entry.secret ? '[REDACTED]' : entry.value,
  }
}

export function fingerprintSnapshot(snapshot) {
  const rows = Object.entries(snapshot.entries)
    .map(([name, entry]) => {
      const redacted = redactedEntry(entry)
      return `${name}=${redacted.secret ? '[REDACTED]' : redacted.value}|${redacted.format}|${redacted.generation}`
    })
    .sort()
  return createHash('sha256').update(rows.join('\n')).digest('hex')
}

export function readbackSnapshot(snapshot) {
  const entries = Object.fromEntries(
    Object.entries(snapshot.entries).map(([name, entry]) => [name, redactedEntry(entry)]),
  )
  return {
    surface: snapshot.surface,
    generation: snapshot.generation,
    liveMutation: false,
    fingerprint: fingerprintSnapshot(snapshot),
    entries,
  }
}

export function assertNoSecretMaterial(value, trail = '$') {
  if (typeof value === 'string') {
    if (value.includes('[REDACTED]')) return
    if (/ltfx\.[A-Za-z0-9._-]+/.test(value) && !value.startsWith('<')) {
      throw die('secret_material_present', { trail })
    }
    if (/(?:postgres(?:ql)?:\/\/[^<]|sk_live_|AKIA[0-9A-Z]{16})/i.test(value)) {
      throw die('secret_material_present', { trail })
    }
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoSecretMaterial(item, `${trail}[${index}]`))
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (secretNameHint.test(key) && typeof child === 'string' && child && !child.startsWith('<') && child !== '[REDACTED]') {
        throw die('secret_material_present', { trail: `${trail}.${key}` })
      }
      assertNoSecretMaterial(child, `${trail}.${key}`)
    }
  }
}

export function createIsolatedStore(catalog) {
  const surfaces = {}
  for (const surface of catalog.surfaces) {
    const current = snapshotFromSurface(surface, 'legacy')
    const desired = snapshotFromSurface(surface, 'profile-v2')
    surfaces[surface.id] = {
      current,
      desired,
      observed: clone(current),
      backup: null,
    }
  }
  const store = {
    schemaVersion: CUTOVER_SCHEMA_VERSION,
    kind: 'iss33-isolated-config-store',
    liveMutation: false,
    liveCanary: 'external_fail_closed',
    protectedDevelopment: clone(PROTECTED_DEVELOPMENT),
    surfaces,
  }
  assertNoSecretMaterial(store)
  return store
}

export function planMigration(store) {
  if (store.liveMutation !== false) throw die('live_mutation_enabled')
  const steps = SURFACE_IDS.map((id) => {
    const surface = store.surfaces[id]
    const currentFp = fingerprintSnapshot(surface.observed)
    const desiredFp = fingerprintSnapshot(surface.desired)
    return {
      surface: id,
      action: currentFp === desiredFp ? 'already-desired' : 'copy-desired-onto-observed',
      fromGeneration: surface.observed.generation,
      toGeneration: surface.desired.generation,
      fromFingerprint: currentFp,
      toFingerprint: desiredFp,
      liveMutation: false,
    }
  })
  return {
    schemaVersion: CUTOVER_SCHEMA_VERSION,
    kind: 'iss33-migration-plan',
    liveMutation: false,
    steps,
  }
}

export function applyMigration(store) {
  if (store.liveMutation !== false) throw die('live_mutation_enabled')
  const plan = planMigration(store)
  for (const id of SURFACE_IDS) {
    const surface = store.surfaces[id]
    surface.backup = clone(surface.observed)
    surface.observed = clone(surface.desired)
  }
  return { status: 'applied_isolated', plan, liveMutation: false }
}

export function rollbackMigration(store) {
  if (store.liveMutation !== false) throw die('live_mutation_enabled')
  for (const id of SURFACE_IDS) {
    const surface = store.surfaces[id]
    if (!surface.backup) throw die('rollback_backup_missing', { surface: id })
    surface.observed = clone(surface.backup)
    surface.backup = null
  }
  return { status: 'rolled_back_isolated', liveMutation: false }
}

export function readbackStore(store) {
  return {
    schemaVersion: CUTOVER_SCHEMA_VERSION,
    kind: 'iss33-config-readback',
    liveMutation: false,
    liveCanary: 'external_fail_closed',
    surfaces: Object.fromEntries(
      SURFACE_IDS.map((id) => [id, readbackSnapshot(store.surfaces[id].observed)]),
    ),
  }
}

export function verifyReadback(store, expectedGeneration) {
  const mismatches = []
  for (const id of SURFACE_IDS) {
    const surface = store.surfaces[id]
    const expected = expectedGeneration === 'profile-v2' ? surface.desired : surface.current
    const observedFp = fingerprintSnapshot(surface.observed)
    const expectedFp = fingerprintSnapshot(expected)
    if (observedFp !== expectedFp || surface.observed.generation !== expectedGeneration) {
      mismatches.push({
        surface: id,
        observedGeneration: surface.observed.generation,
        expectedGeneration,
        observedFingerprint: observedFp,
        expectedFingerprint: expectedFp,
      })
    }
  }
  return {
    ok: mismatches.length === 0,
    expectedGeneration,
    mismatches,
    liveMutation: false,
  }
}

export function driftCheck(store, expectedGeneration = 'profile-v2') {
  const verification = verifyReadback(store, expectedGeneration)
  return {
    schemaVersion: CUTOVER_SCHEMA_VERSION,
    kind: 'iss33-permanent-drift-check',
    liveMutation: false,
    ok: verification.ok,
    expectedGeneration,
    driftedSurfaces: verification.mismatches.map((row) => row.surface),
    mismatches: verification.mismatches,
  }
}

export function injectDrift(store, surfaceId, keyName) {
  const surface = store.surfaces[surfaceId]
  if (!surface?.observed.entries[keyName]) throw die('unknown_drift_target', { surfaceId, keyName })
  surface.observed.entries[keyName] = {
    ...surface.observed.entries[keyName],
    value: '<drifted-non-secret>',
    generation: 'drifted',
  }
  return store
}

export function refuseLiveCanary(argv = process.argv.slice(2), env = process.env) {
  const flags = argv.filter((arg) => arg.startsWith('--')).map((arg) => arg.slice(2).toLowerCase())
  const requested = [
    env.LINKSITES_ISS33_CANARY,
    env.LINKSITES_CANARY,
    env.LINKSITES_DEPLOY_TARGET,
    ...flags,
  ].filter(Boolean)
  const live = requested.filter((value) => liveCanaryPattern.test(String(value)))
  if (live.length > 0) {
    return {
      ok: false,
      status: 'live_canary_external',
      result: 'fail_closed',
      liveMutation: false,
      requested: live,
      reason: 'Production, VPS and live canary remain external to this packet.',
    }
  }
  return {
    ok: true,
    status: 'offline_rehearsal_only',
    result: 'fail_closed_live_path_unused',
    liveMutation: false,
  }
}

export function parseEnvTemplate(source) {
  const names = []
  for (const line of source.split('\n')) {
    if (!line || line.startsWith('#')) continue
    const match = line.match(/^([A-Z0-9_]+)=/)
    if (match) names.push(match[1])
  }
  return names
}

export function committedTemplateDrift({ catalog, productionExample, compose, operations }) {
  const errors = []
  const exampleNames = new Set(parseEnvTemplate(productionExample))
  for (const surface of catalog.surfaces) {
    for (const key of surface.keys) {
      if (key.name.includes('_') && key.name === key.name.toUpperCase() && !exampleNames.has(key.name)) {
        const documented = [
          'PROVIDER_SELECTABILITY',
          'PROVIDER_LIVE_CATALOGUE_PROBE',
          'HOSTING_LIVE_HOST',
          'DATABASE_CREDENTIAL_DISTINCTNESS',
          'MONITORING_METRICS_PATH',
          'MONITORING_ALERT_DEAD_LETTER_NONZERO',
          'MONITORING_ALERT_RETRY_GROWTH_MINUTES',
          'MONITORING_ALERT_READINESS_NON_200_MINUTES',
          'MONITORING_ALERT_BACKUP_CHECKSUM_FAILURE',
          'MONITORING_LOG_REDACTION',
          'MONITORING_LIVE_SCRAPE',
          'DEPLOYMENT_LIVE_CANARY',
        ]
        if (!documented.includes(key.name) && !key.name.startsWith('MONITORING_') && !key.name.startsWith('PROVIDER_') && !key.name.startsWith('HOSTING_') && !key.name.startsWith('DATABASE_CREDENTIAL') && !key.name.startsWith('DEPLOYMENT_')) {
          errors.push(`${surface.id}:${key.name} is missing from production.env.example`)
        }
      }
      if (placeholderPattern.test(templateValue(key)) === false) {
        errors.push(`${surface.id}:${key.name} template is not a placeholder`)
      }
    }
  }
  for (const token of ['${VAR:?', 'condition: service_completed_successfully', 'internal: true']) {
    if (token === '${VAR:?') {
      if (!compose.includes('${') || !compose.includes(':?')) errors.push('compose is not fail-closed')
    } else if (!compose.includes(token)) {
      errors.push(`compose missing ${token}`)
    }
  }
  if (!operations.includes('Rollback') || !operations.includes('does not authorize or perform VPS')) {
    errors.push('operations manual no longer fail-closes VPS mutation')
  }
  return { ok: errors.length === 0, errors, liveMutation: false }
}

export async function persistStore(path, store) {
  assertNoSecretMaterial(store)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(store, null, 2)}\n`)
}

export async function loadStore(path) {
  const store = JSON.parse(await readFile(path, 'utf8'))
  if (store.kind !== 'iss33-isolated-config-store') throw die('invalid_store_kind')
  if (store.liveMutation !== false) throw die('live_mutation_enabled')
  assertNoSecretMaterial(store)
  return store
}

export function pathIsOwned(relPath) {
  return OWNED_PREFIXES.some((prefix) => relPath === prefix.slice(0, -1) || relPath.startsWith(prefix))
}

export function pathIsProhibited(relPath) {
  return PROHIBITED_PREFIXES.some((prefix) => relPath === prefix.slice(0, -1) || relPath.startsWith(prefix))
}

export function classifyDiffPaths(paths) {
  const owned = []
  const prohibited = []
  const outOfScope = []
  for (const relPath of paths) {
    if (pathIsProhibited(relPath)) prohibited.push(relPath)
    else if (pathIsOwned(relPath)) owned.push(relPath)
    else outOfScope.push(relPath)
  }
  return {
    ok: prohibited.length === 0 && outOfScope.length === 0,
    owned,
    prohibited,
    outOfScope,
  }
}

export async function offlineRehearsal({ catalog, receiptPath = null }) {
  const canary = refuseLiveCanary(['rehearse'], process.env)
  if (!canary.ok) return canary
  const store = createIsolatedStore(catalog)
  const before = readbackStore(store)
  const plan = planMigration(store)
  const applied = applyMigration(store)
  const migrated = verifyReadback(store, 'profile-v2')
  const cleanDrift = driftCheck(store, 'profile-v2')
  injectDrift(store, 'hosting', 'TRAEFIK_CMS_HOST')
  const dirtyDrift = driftCheck(store, 'profile-v2')
  store.surfaces.hosting.observed = clone(store.surfaces.hosting.desired)
  const restoredDrift = driftCheck(store, 'profile-v2')
  const rolled = rollbackMigration(store)
  const afterRollback = verifyReadback(store, 'legacy')
  const receipt = {
    schemaVersion: CUTOVER_SCHEMA_VERSION,
    kind: 'iss33-offline-config-rehearsal',
    liveMutation: false,
    liveCanary: 'external_fail_closed',
    publicActivation: false,
    credentialsPersisted: false,
    protectedDevelopment: clone(PROTECTED_DEVELOPMENT),
    surfaces: SURFACE_IDS,
    readbackBefore: before,
    plan,
    applied: applied.status,
    migrated,
    drift: {
      afterApply: cleanDrift,
      afterInjectedMismatch: dirtyDrift,
      afterRestore: restoredDrift,
    },
    rollback: rolled.status,
    afterRollback,
    canary,
  }
  assertNoSecretMaterial(receipt)
  if (!migrated.ok || !cleanDrift.ok || dirtyDrift.ok || !restoredDrift.ok || !afterRollback.ok) {
    receipt.ok = false
    receipt.status = 'rehearsal_failed'
  } else {
    receipt.ok = true
    receipt.status = 'offline_rehearsal_passed'
  }
  if (receiptPath) {
    await mkdir(dirname(receiptPath), { recursive: true })
    await writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`)
  }
  return receipt
}

import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, lstatSync, readFileSync, realpathSync } from 'node:fs'
import { relative, resolve, sep } from 'node:path'
import { validateNativeV2Bundle, validateNativeV2ReceiptValue } from '../../packages/factory-catalog/src/nativeRevision2Validator.js'

export const CONFIG_SCHEMA_VERSION = '1.3.0'
export const TEMPLATE_RELEASE_STATES = Object.freeze(['deferred', 'ready'])
export const AUTOWORK_MODES = Object.freeze(['manual', 'live'])
export const PLATFORM_STATES = Object.freeze(['pending', 'ready'])
export const FIVE_IMAGE_ENV = Object.freeze([
  'LINKSITES_CMS_IMAGE',
  'LINKSITES_WEB_MASTER_IMAGE',
  'LINKSITES_WORKER_IMAGE',
  'LINKSITES_ORCHESTRATOR_IMAGE',
  'LINKSITES_MIGRATIONS_IMAGE',
])
export const HARNESS_RELEASE_PIN = Object.freeze({
  label: 'HC1-A',
  commit: 'de0abe31736e878aad3447bf4b720a40142d8a6e',
  tree: '526cc9ab8feec3ae95089639f03f0382b9878e63',
  compatibleRange: '>=0.1.0 <0.2.0',
})
export const PROFILE_RELEASE_PIN = Object.freeze({
  id: 'linksites-profile',
  version: '0.1.0',
})
const LIVE_AUTOWORK_FIELDS = Object.freeze([
  'LINKAUTOWORK_GATEWAY_URL',
  'LINKAUTOWORK_ISSUER',
  'LINKAUTOWORK_AUDIENCE',
  'LINKAUTOWORK_RECEIPT_CONTRACT',
  'LINKAUTOWORK_CLAIM_CONTRACT',
  'LINKAUTOWORK_LIVE_HANDOFF',
  'LINKAUTOWORK_SIGNING_KEY_ID',
  'LINKAUTOWORK_SIGNING_SECRET',
  'LINKAUTOWORK_EVENT_GRANTS',
  'LINKAUTOWORK_ENVIRONMENT',
  'LINKAUTOWORK_ORG_ID',
])

const placeholder = /^(?:|<[^>]+>|change[-_ ]?me|replace[-_ ]?me|example|todo|mock|undefined|null)$/i
const sha1 = /^[a-f0-9]{40}$/i
const sha256 = /^[a-f0-9]{64}$/i
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const required = (name, format, secret = false) => ({ name, required: true, format, secret })

const canonicalJson = (value) => value === null || typeof value !== 'object'
  ? JSON.stringify(value)
  : Array.isArray(value)
    ? `[${value.map(canonicalJson).join(',')}]`
    : `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`

const sha256Bytes = (value) => createHash('sha256').update(value).digest('hex')
const sha256Json = (value) => sha256Bytes(canonicalJson(value))

function pathIsConfined(root, candidate) {
  const lexicalRoot = resolve(root)
  const lexicalCandidate = resolve(candidate)
  const prefix = lexicalRoot.endsWith(sep) ? lexicalRoot : `${lexicalRoot}${sep}`
  if (lexicalCandidate !== lexicalRoot && !lexicalCandidate.startsWith(prefix)) return false
  try {
    const rootStat = lstatSync(lexicalRoot)
    if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) return false
    const realRoot = resolve(realpathSync(lexicalRoot))
    let current = lexicalRoot
    for (const part of relative(lexicalRoot, lexicalCandidate).split(sep).filter(Boolean)) {
      current = resolve(current, part)
      const stat = lstatSync(current)
      if (stat.isSymbolicLink()) return false
    }
    const realCandidate = resolve(realpathSync(lexicalCandidate))
    const realPrefix = realRoot.endsWith(sep) ? realRoot : `${realRoot}${sep}`
    return (realCandidate === realRoot || realCandidate.startsWith(realPrefix)) && lstatSync(lexicalCandidate).isFile()
  } catch {
    return false
  }
}

function mountedProviderRoot(environment, override) {
  if (override) return resolve(override)
  const configuredRoot = environment.LINKSITES_LINKLIBRARIES_ROOT
  // The deployment preflight runs on the host while the service runs with the
  // container path. Use the host artifact only when the configured mount path
  // is not present; never silently substitute it inside the service.
  if (configuredRoot && existsSync(configuredRoot)) return resolve(configuredRoot)
  if (environment.LINKLIBRARIES_ARTIFACT_PATH && existsSync(environment.LINKLIBRARIES_ARTIFACT_PATH)) return resolve(environment.LINKLIBRARIES_ARTIFACT_PATH)
  return configuredRoot ? resolve(configuredRoot) : null
}

function mountedReceiptPath(environment, root) {
  const configuredPath = environment.LINKSITES_LINKLIBRARIES_RECEIPT_PATH
  const configuredRoot = environment.LINKSITES_LINKLIBRARIES_ROOT
  if (!configuredPath) return null
  if (configuredRoot) {
    const configuredRootPath = resolve(configuredRoot)
    const candidate = resolve(configuredPath)
    const prefix = configuredRootPath.endsWith(sep) ? configuredRootPath : `${configuredRootPath}${sep}`
    if (candidate.startsWith(prefix)) return resolve(root, relative(configuredRootPath, candidate))
  }
  return resolve(configuredPath)
}

function readJsonFile(root, path, label) {
  if (!pathIsConfined(root, path)) throw new Error(`${label} is missing, non-regular, symlinked, or outside the mounted provider root`)
  const bytes = readFileSync(path)
  try { return { bytes, value: JSON.parse(bytes.toString('utf8')) } } catch { throw new Error(`${label} is not valid JSON`) }
}

function readCommittedFile(root, path, label) {
  const relativePath = relative(resolve(root), resolve(path))
  if (!relativePath || relativePath.startsWith(`..${sep}`) || relativePath === '..') throw new Error(`${label} is outside the committed provider checkout`)
  try { return execFileSync('git', ['-C', root, 'show', `HEAD:${relativePath}`]) } catch { throw new Error(`${label} is not present in the configured provider commit`) }
}

function directoryIsConfined(root, path) {
  const lexicalRoot = resolve(root)
  const lexicalCandidate = resolve(path)
  const prefix = lexicalRoot.endsWith(sep) ? lexicalRoot : `${lexicalRoot}${sep}`
  if (lexicalCandidate !== lexicalRoot && !lexicalCandidate.startsWith(prefix)) return false
  try {
    const rootStat = lstatSync(lexicalRoot)
    if (rootStat.isSymbolicLink() || !rootStat.isDirectory()) return false
    const realRoot = resolve(realpathSync(lexicalRoot))
    let current = lexicalRoot
    for (const part of relative(lexicalRoot, lexicalCandidate).split(sep).filter(Boolean)) {
      current = resolve(current, part)
      const stat = lstatSync(current)
      if (stat.isSymbolicLink()) return false
    }
    const realCandidate = resolve(realpathSync(lexicalCandidate))
    const realPrefix = realRoot.endsWith(sep) ? realRoot : `${realRoot}${sep}`
    return (realCandidate === realRoot || realCandidate.startsWith(realPrefix)) && lstatSync(lexicalCandidate).isDirectory()
  } catch {
    return false
  }
}

function validateNativeV2CatalogueAndInventory(providerRoot, releaseRoot, environment, receipt, manifest, inventory, catalogue, dependencyLock) {
  const errors = []
  const records = Array.isArray(catalogue?.records) ? catalogue.records : []
  const selected = records.filter((record) => record?.entryId === environment.LINKSITES_TEMPLATE_ID && record?.version === environment.LINKSITES_TEMPLATE_VERSION)
  if (selected.length !== 1) errors.push('provider catalogue must contain exactly one selected entry/version record')
  const catalogueBytes = readFileSync(resolve(providerRoot, 'indexes/v2/catalog.json'))
  const releaseManifestBytes = readFileSync(resolve(releaseRoot, 'manifest.json'))
  const validation = validateNativeV2Bundle({
    source: { commitSha: environment.LINKSITES_LINKLIBRARIES_COMMIT_SHA, treeSha: environment.LINKSITES_LINKLIBRARIES_TREE_SHA },
    catalogue,
    record: selected[0],
    manifest,
    inventory,
    dependencyLock,
    receipt,
    catalogueFileSha256: sha256Bytes(catalogueBytes),
    dependencyLockFileSha256: sha256Bytes(readFileSync(resolve(releaseRoot, 'dependency-lock.json'))),
  }, {
    expectedDependencyLockSha256: environment.LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256,
    catalogueFileSha256: sha256Bytes(catalogueBytes),
    releaseManifestSha256: sha256Bytes(releaseManifestBytes),
  })
  if (!validation.ok) errors.push(...validation.errors)
  const artifactRoot = resolve(releaseRoot, 'artifact')
  if (!directoryIsConfined(providerRoot, artifactRoot)) errors.push('native v2 artifact root is missing, symlinked, or outside the provider checkout')
  const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
  const digest = (value) => typeof value === 'string' && sha256.test(value)
  const relativePath = (value) => typeof value === 'string' && value.length > 0 && !value.startsWith('/') && !value.includes('\\') && !/(^|\/)\.\.?($|\/)/.test(value)
  const paths = new Set()
  for (const item of inventory?.entries ?? []) {
    if (!object(item) || !relativePath(item.path) || paths.has(item.path)) { errors.push('native v2 artifact inventory contains an unsafe or duplicate path'); continue }
    paths.add(item.path)
    const candidate = resolve(artifactRoot, item.path)
    if (item.type === 'directory') {
      if (!directoryIsConfined(artifactRoot, candidate)) errors.push(`native v2 artifact inventory directory is not present: ${item.path}`)
      continue
    }
    if (item.type !== 'file' || !Number.isSafeInteger(item.byteLength) || item.byteLength < 0 || !digest(item.sha256) || !pathIsConfined(artifactRoot, candidate)) { errors.push(`native v2 artifact inventory file is invalid or missing: ${item.path}`); continue }
    const bytes = readFileSync(candidate)
    if (bytes.byteLength !== item.byteLength || sha256Bytes(bytes) !== item.sha256) errors.push(`native v2 artifact inventory digest mismatch: ${item.path}`)
    try {
      if (!readCommittedFile(providerRoot, candidate, `native v2 artifact ${item.path}`).equals(bytes)) errors.push(`native v2 artifact ${item.path} bytes do not match the configured provider commit`)
    } catch (error) { errors.push(error instanceof Error ? error.message : `native v2 artifact ${item.path} is not committed`) }
  }
  return errors
}

/**
 * This is the executable deployment configuration contract. It deliberately
 * contains names and validation rules only; values are never persisted here.
 */
export const SERVICE_CONFIGURATION = {
  shared: [
    required('LINKSITES_DEPLOYMENT_ENV', 'literal:production'),
    required('LINKSITES_CONFIG_SCHEMA_VERSION', `literal:${CONFIG_SCHEMA_VERSION}`),
    required('LINKSITES_RELEASE_SHA', 'git-sha-1'),
    required('LINKSITES_ORG_ID', 'slug'),
    required('LINKSITES_AUTOWORK_MODE', 'autowork-mode'),
    required('LINKSITES_PLATFORM_STATE', 'platform-state'),
    required('LINKSITES_HARNESS_COMMIT', `literal:${HARNESS_RELEASE_PIN.commit}`),
    required('LINKSITES_HARNESS_TREE', `literal:${HARNESS_RELEASE_PIN.tree}`),
    required('LINKSITES_HARNESS_RANGE', `literal:${HARNESS_RELEASE_PIN.compatibleRange}`),
    required('LINKSITES_PROFILE_ID', `literal:${PROFILE_RELEASE_PIN.id}`),
    required('LINKSITES_PROFILE_VERSION', `literal:${PROFILE_RELEASE_PIN.version}`),
    required('LINKSITES_CMS_IMAGE', 'image-digest-ref'),
    required('LINKSITES_WEB_MASTER_IMAGE', 'image-digest-ref'),
    required('LINKSITES_WORKER_IMAGE', 'image-digest-ref'),
    required('LINKSITES_ORCHESTRATOR_IMAGE', 'image-digest-ref'),
    required('LINKSITES_MIGRATIONS_IMAGE', 'image-digest-ref'),
  ],
  cms: [
    required('DATABASE_URI', 'postgres-url', true),
    required('PAYLOAD_SECRET', 'secret-min-32', true),
    required('PAYLOAD_PUBLIC_SERVER_URL', 'https-url'),
    required('LINKAUTOWORK_OUTBOX_PATH', 'absolute-path'),
    required('LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET', 'secret-min-32', true),
  ],
  'web-master': [
    required('NEXT_PUBLIC_CMS_PROVIDER', 'literal:payload'),
    required('PAYLOAD_BASE_URL', 'https-url'),
    required('PAYLOAD_PUBLIC_SERVER_URL', 'https-url'),
    required('NEXT_PUBLIC_PAYLOAD_API_URL', 'https-url'),
    required('PAYLOAD_API_KEY', 'secret-min-32', true),
    required('PREVIEW_ACCESS_TOKEN', 'secret-min-32', true),
    required('LINKSITES_TEMPLATE_RELEASE_STATE', 'template-release-state'),
    required('LINKSITES_TEMPLATE_FORMAT', 'literal:revision2'),
    required('LINKSITES_TEMPLATE_ID', 'slug'),
    required('LINKSITES_TEMPLATE_VERSION', 'semver'),
  ],
  'autowork-worker': [
    required('DATABASE_URI', 'postgres-url', true),
    required('PAYLOAD_SECRET', 'secret-min-32', true),
    required('PAYLOAD_PUBLIC_SERVER_URL', 'https-url'),
    required('LINKAUTOWORK_OUTBOX_PATH', 'absolute-path'),
    required('LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET', 'secret-min-32', true),
    required('LINKSITES_TEMPLATE_RELEASE_STATE', 'template-release-state'),
  ],
  'program-orchestrator': [
    required('W2_02_MODE', 'literal:production'),
    required('W2_02_DATABASE_URI', 'postgres-url', true),
    required('W2_02_ORG_ID', 'uuid'),
    required('W2_02_SITE_ID', 'uuid'),
    required('W2_02_DATABASE_ROLE', 'slug'),
    required('W2_02_APPROVED_FACTS_PATH', 'absolute-path'),
    required('W2_02_POSTGRES_ADAPTER_MODULE', 'literal:@linksites/program-orchestrator/postgres-adapter'),
    required('W2_02_EXECUTION_REVISION', 'git-sha-1'),
    required('W2_02_EXECUTABLE_CHECKPOINT', 'sha-256'),
    required('W2_02_STATE_DIR', 'absolute-path'),
    required('W2_02_PAYLOAD_BASE_URL', 'https-url'),
    required('W2_02_PAYLOAD_API_KEY', 'secret-min-32', true),
    // The configured Postgres Payload adapter uses positive numeric document
    // IDs. A first valid site can therefore be "1", not a three-character slug.
    required('W2_02_PAYLOAD_SITE_ID', 'payload-document-id'),
    required('W2_02_WEB_MASTER_BASE_URL', 'https-url'),
    required('W2_02_PREVIEW_ACCESS_TOKEN', 'secret-min-32', true),
    required('W2_05_OUTCOME_GATEWAY_SECRET', 'secret-min-32', true),
    required('W2_05_OUTCOME_GATEWAY_KEY_ID', 'slug'),
    required('LINKSITES_TEMPLATE_RELEASE_STATE', 'template-release-state'),
    required('LINKSITES_TEMPLATE_FORMAT', 'literal:revision2'),
    required('LINKSITES_TEMPLATE_ID', 'slug'),
    required('LINKSITES_TEMPLATE_VERSION', 'semver'),
  ],
}

function isPublicLoopback(hostname) {
  const normalized = hostname.toLowerCase()
  return normalized === 'localhost' || normalized === '::1' || normalized === '0.0.0.0' || normalized.startsWith('127.')
}

function validateValue(value, format) {
  if (typeof value !== 'string' || placeholder.test(value.trim())) return 'is empty or a placeholder'
  const trimmed = value.trim()
  if (format.startsWith('literal:')) return trimmed === format.slice('literal:'.length) ? null : `must equal ${format.slice('literal:'.length)}`
  if (format === 'git-sha-1') return sha1.test(trimmed) ? null : 'must be a full 40-character Git SHA'
  if (format === 'autowork-mode') return AUTOWORK_MODES.includes(trimmed) ? null : 'must equal manual or live'
  if (format === 'platform-state') return PLATFORM_STATES.includes(trimmed) ? null : 'must equal pending or ready'
  if (format === 'image-digest-ref') return /^(?:[a-z0-9._-]+\/)+[a-z0-9._-]+:?[^@]*@sha256:[a-f0-9]{64}$/i.test(trimmed) && !/:(?:latest|main|development|staging)@/i.test(trimmed) ? null : 'must be an immutable name@sha256 digest reference'
  if (format === 'template-release-state') return TEMPLATE_RELEASE_STATES.includes(trimmed) ? null : `must equal one of ${TEMPLATE_RELEASE_STATES.join(' or ')}`
  if (format === 'semver') return /^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(trimmed) ? null : 'must be a semantic version'
  if (format === 'sha-256') return sha256.test(trimmed) ? null : 'must be a full 64-character SHA-256'
  if (format === 'uuid') return uuid.test(trimmed) ? null : 'must be a UUID'
  if (format === 'slug') return /^[A-Za-z0-9][A-Za-z0-9_-]{2,127}$/.test(trimmed) ? null : 'must be a 3-128 character identifier'
  if (format === 'payload-document-id') return /^[1-9][0-9]*$/.test(trimmed) ? null : 'must be a positive numeric Payload document ID'
  if (format === 'absolute-path') return trimmed.startsWith('/') && !trimmed.includes('\0') ? null : 'must be an absolute non-NUL path'
  if (format === 'secret-min-32') return trimmed.length >= 32 && !/^(.)\1+$/.test(trimmed) ? null : 'must be at least 32 non-repeated characters'
  if (format === 'nonempty-json-array') {
    try { return Array.isArray(JSON.parse(trimmed)) && JSON.parse(trimmed).length > 0 ? null : 'must be a non-empty JSON array' } catch { return 'must be valid JSON' }
  }
  if (format === 'nonempty-json-object') {
    try { const parsed = JSON.parse(trimmed); return parsed && typeof parsed === 'object' && !Array.isArray(parsed) && Object.keys(parsed).length > 0 ? null : 'must be a non-empty JSON object' } catch { return 'must be valid JSON' }
  }
  if (format === 'postgres-url') {
    try {
      const url = new URL(trimmed)
      return (url.protocol === 'postgres:' || url.protocol === 'postgresql:') && !isPublicLoopback(url.hostname) && Boolean(url.username) ? null : 'must be a non-loopback PostgreSQL URL with a username'
    } catch { return 'must be a PostgreSQL URL' }
  }
  if (format === 'https-url') {
    try {
      const url = new URL(trimmed)
      return url.protocol === 'https:' && !isPublicLoopback(url.hostname) ? null : 'must be a non-loopback HTTPS URL'
    } catch { return 'must be an HTTPS URL' }
  }
  throw new Error(`unsupported config format: ${format}`)
}

export function validateRuntimeConfig(environment, service) {
  if (!Object.prototype.hasOwnProperty.call(SERVICE_CONFIGURATION, service)) throw new Error(`unknown service: ${service}`)
  const errors = []
  const requirements = [...SERVICE_CONFIGURATION.shared, ...SERVICE_CONFIGURATION[service]]
  for (const requirement of requirements) {
    const result = validateValue(environment[requirement.name], requirement.format)
    if (result) errors.push({ name: requirement.name, error: result, secret: requirement.secret })
  }
  if (environment.NODE_ENV && environment.NODE_ENV !== 'production') errors.push({ name: 'NODE_ENV', error: 'must equal production when set', secret: false })
  if (environment.NEXT_PUBLIC_CMS_PROVIDER === 'fixture' || environment.CMS_FIXTURE_PATH) errors.push({ name: 'NEXT_PUBLIC_CMS_PROVIDER', error: 'fixture content is forbidden in the production bundle', secret: false })
  if (environment.W2_02_MODE && environment.W2_02_MODE !== 'production') errors.push({ name: 'W2_02_MODE', error: 'must equal production for the Phase 2 deployment contract', secret: false })
  const autoworkMode = environment.LINKSITES_AUTOWORK_MODE
  if (autoworkMode === 'manual') {
    for (const name of LIVE_AUTOWORK_FIELDS) {
      if (environment[name]) errors.push({ name, error: 'manual/file Autowork forbids live gateway, receipt, or admission fields', secret: name.includes('SECRET') })
    }
  }
  if (autoworkMode === 'live' && ['cms', 'autowork-worker', 'program-orchestrator'].includes(service)) {
    for (const [name, format, secret] of [
      ['LINKAUTOWORK_GATEWAY_URL', 'https-url', false],
      ['LINKAUTOWORK_SIGNING_SECRET', 'secret-min-32', true],
      ['LINKAUTOWORK_SIGNING_KEY_ID', 'slug', false],
      ['LINKAUTOWORK_ENVIRONMENT', 'literal:production', false],
      ['LINKAUTOWORK_EVENT_GRANTS', 'nonempty-json-array', false],
      ['LINKAUTOWORK_ISSUER', 'slug', false],
      ['LINKAUTOWORK_AUDIENCE', 'literal:linksites', false],
      ['LINKAUTOWORK_RECEIPT_CONTRACT', 'literal:2026-08-13.v1', false],
    ]) {
      const result = validateValue(environment[name], format)
      if (result) errors.push({ name, error: result, secret })
    }
    if (environment.LINKAUTOWORK_SIGNING_KEY_ID && (/^ltfx[.-]/i.test(environment.LINKAUTOWORK_SIGNING_KEY_ID) || /(?:secret|token|password|credential)/i.test(environment.LINKAUTOWORK_SIGNING_KEY_ID))) {
      errors.push({ name: 'LINKAUTOWORK_SIGNING_KEY_ID', error: 'must be a key reference, not a secret value', secret: false })
    }
  }
  if (environment.LINKSITES_PLATFORM_STATE === 'ready') {
    const result = validateValue(environment.LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA, 'git-sha-1')
    if (result) errors.push({ name: 'LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA', error: result, secret: false })
  } else if (environment.LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA) {
    errors.push({ name: 'LINKSITES_PLATFORM_MIGRATIONS_APPLIED_SHA', error: 'pending Platform state must not carry a fake applied-migration SHA', secret: false })
  }
  if (environment.DATABASE_URI && environment.W2_02_DATABASE_URI) {
    try {
      const cms = new URL(environment.DATABASE_URI)
      const orchestrator = new URL(environment.W2_02_DATABASE_URI)
      const identity = (url) => `${url.protocol}//${url.hostname}:${url.port || '5432'}/${url.username}`
      if (identity(cms) === identity(orchestrator)) errors.push({ name: 'W2_02_DATABASE_URI', error: 'must be a distinct least-privilege credential from DATABASE_URI', secret: true })
    } catch { /* URL format errors are reported by field validators */ }
  }
  for (const name of ['PAYLOAD_PUBLIC_SERVER_URL', 'PAYLOAD_BASE_URL', 'NEXT_PUBLIC_PAYLOAD_API_URL', 'W2_02_PAYLOAD_BASE_URL', 'W2_02_WEB_MASTER_BASE_URL']) {
    const value = environment[name]
    if (!value) continue
    try {
      const hostname = new URL(value).hostname.toLowerCase()
      if (environment.TRAEFIK_CMS_HOST && ['PAYLOAD_PUBLIC_SERVER_URL', 'PAYLOAD_BASE_URL', 'NEXT_PUBLIC_PAYLOAD_API_URL', 'W2_02_PAYLOAD_BASE_URL'].includes(name) && hostname !== environment.TRAEFIK_CMS_HOST.toLowerCase()) {
        errors.push({ name, error: 'must use the configured private CMS hostname', secret: false })
      }
      if (environment.TRAEFIK_PREVIEW_HOST && name === 'W2_02_WEB_MASTER_BASE_URL' && hostname !== environment.TRAEFIK_PREVIEW_HOST.toLowerCase()) {
        errors.push({ name, error: 'must use the configured private preview hostname', secret: false })
      }
    } catch { /* URL format errors are reported by field validators */ }
  }
  if (service === 'web-master' && environment.PREVIEW_ACCESS_TOKEN && environment.W2_02_PREVIEW_ACCESS_TOKEN && environment.PREVIEW_ACCESS_TOKEN !== environment.W2_02_PREVIEW_ACCESS_TOKEN) errors.push({ name: 'PREVIEW_ACCESS_TOKEN', error: 'must equal W2_02_PREVIEW_ACCESS_TOKEN when both are supplied', secret: true })
  if (['web-master', 'program-orchestrator'].includes(service)) {
    const state = environment.LINKSITES_TEMPLATE_RELEASE_STATE
    if (!state) errors.push({ name: 'LINKSITES_TEMPLATE_RELEASE_STATE', error: 'template release state is required; use deferred until a native v2 release is admitted', secret: false })
    else if (!TEMPLATE_RELEASE_STATES.includes(state)) errors.push({ name: 'LINKSITES_TEMPLATE_RELEASE_STATE', error: 'unknown, pending, or quarantined template states are not operationally selectable', secret: false })
    else {
      for (const name of ['LINKSITES_ADMITTED_TEMPLATE_LIBRARY_PATH', 'LINKSITES_ADMITTED_TEMPLATE_SHA', 'LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON', 'LINKSITES_ADMITTED_TEMPLATE_EVIDENCE_JSON']) {
        if (environment[name]) errors.push({ name, error: 'legacy template admission inputs are forbidden on the production deployment path', secret: false })
      }
      if (state === 'deferred' && environment.LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON) errors.push({ name: 'LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON', error: 'deferred template releases must not carry provider admission receipt evidence', secret: false })
    }
    if (state === 'ready') {
      if (environment.LINKSITES_TEMPLATE_FORMAT !== 'revision2') errors.push({ name: 'LINKSITES_TEMPLATE_FORMAT', error: 'ready template releases require the native Revision 2 materializer', secret: false })
      for (const [name, format] of [['LINKSITES_LINKLIBRARIES_ROOT', 'absolute-path'], ['LINKSITES_LINKLIBRARIES_COMMIT_SHA', 'git-sha-1'], ['LINKSITES_LINKLIBRARIES_TREE_SHA', 'git-sha-1'], ['LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256', 'sha-256'], ['LINKSITES_LINKLIBRARIES_RECEIPT_PATH', 'absolute-path']]) {
        const result = validateValue(environment[name], format)
        if (result) errors.push({ name, error: result, secret: false })
      }
      const receipt = validateNativeV2Receipt(environment.LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON, environment)
      if (receipt) errors.push({ name: 'LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON', error: receipt, secret: false })
    }
  }
  if (service === 'program-orchestrator' && environment.W2_02_EXECUTION_REVISION && environment.LINKSITES_RELEASE_SHA && environment.W2_02_EXECUTION_REVISION !== environment.LINKSITES_RELEASE_SHA) errors.push({ name: 'W2_02_EXECUTION_REVISION', error: 'must equal LINKSITES_RELEASE_SHA', secret: false })
  return { ok: errors.length === 0, service, schemaVersion: CONFIG_SCHEMA_VERSION, errors }
}

function validateNativeV2ReceiptShape(raw, environment = {}) {
  if (typeof raw !== 'string' || !raw.trim()) return 'ready template releases require a native Revision 2 receipt'
  let receipt
  try { receipt = JSON.parse(raw) } catch { return 'must be valid native Revision 2 receipt JSON' }
  if (!receipt || typeof receipt !== 'object' || Array.isArray(receipt)) return 'must be a native Revision 2 receipt object'
  if (receipt.schemaVersion !== 2 || receipt.schemaRevision !== 2) return 'must use native Revision 2 schema 2.2'
  const shapeErrors = validateNativeV2ReceiptValue(receipt)
  if (shapeErrors.length) return shapeErrors.join('; ')
  if (typeof receipt.entryId !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(receipt.entryId)) return 'entryId is invalid'
  if (environment.LINKSITES_TEMPLATE_ID && receipt.entryId !== environment.LINKSITES_TEMPLATE_ID) return 'receipt entryId does not match LINKSITES_TEMPLATE_ID'
  if (typeof receipt.version !== 'string' || !/^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/.test(receipt.version)) return 'version is invalid'
  if (environment.LINKSITES_TEMPLATE_VERSION && receipt.version !== environment.LINKSITES_TEMPLATE_VERSION) return 'receipt version does not match LINKSITES_TEMPLATE_VERSION'
  if (receipt.receiptType === 'consumption' && (receipt.result !== 'pass' || !sha1.test(receipt.consumerMaterializedTreeSha1))) return 'consumption receipt must be a passing native materialization/test receipt'
  return null
}

export function readAndVerifyNativeV2Receipt(environment, { providerRoot: providerRootOverride, expectedRaw } = {}) {
  try {
    const providerRoot = mountedProviderRoot(environment, providerRootOverride)
    const receiptPath = providerRoot && mountedReceiptPath(environment, providerRoot)
    if (!providerRoot || !receiptPath) throw new Error('ready template releases require a mounted native Revision 2 receipt path')
    const receiptFile = readJsonFile(providerRoot, receiptPath, 'mounted native Revision 2 receipt')
    const raw = receiptFile.bytes.toString('utf8')
    const suppliedRaw = expectedRaw ?? environment.LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON
    if (typeof suppliedRaw !== 'string' || suppliedRaw !== raw) throw new Error('configured native v2 receipt bytes do not exactly match the mounted receipt')
    const providerCommit = execFileSync('git', ['-C', providerRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
    const providerTree = execFileSync('git', ['-C', providerRoot, 'rev-parse', 'HEAD^{tree}'], { encoding: 'utf8' }).trim()
    if (providerCommit !== environment.LINKSITES_LINKLIBRARIES_COMMIT_SHA || providerTree !== environment.LINKSITES_LINKLIBRARIES_TREE_SHA) throw new Error('mounted native v2 provider commit/tree does not match configured identity')
    if (!readCommittedFile(providerRoot, receiptPath, 'mounted native Revision 2 receipt').equals(receiptFile.bytes)) throw new Error('mounted native Revision 2 receipt bytes do not match the configured provider commit')
    const shapeError = validateNativeV2ReceiptShape(raw, environment)
    if (shapeError) throw new Error(shapeError)
    const receipt = receiptFile.value
    const releaseRoot = resolve(providerRoot, 'registry/v2/entries', environment.LINKSITES_TEMPLATE_ID, 'versions', environment.LINKSITES_TEMPLATE_VERSION)
    const catalogueFile = readJsonFile(providerRoot, resolve(providerRoot, 'indexes/v2/catalog.json'), 'mounted native v2 provider catalogue')
    const manifestFile = readJsonFile(providerRoot, resolve(releaseRoot, 'manifest.json'), 'mounted native v2 release manifest')
    const inventoryFile = readJsonFile(providerRoot, resolve(releaseRoot, 'inventory.json'), 'mounted native v2 artifact inventory')
    const dependencyLockFile = readJsonFile(providerRoot, resolve(releaseRoot, 'dependency-lock.json'), 'mounted native v2 dependency lock')
    if (!readCommittedFile(providerRoot, resolve(providerRoot, 'indexes/v2/catalog.json'), 'mounted native v2 provider catalogue').equals(catalogueFile.bytes)) throw new Error('mounted native v2 provider catalogue bytes do not match the configured provider commit')
    if (!readCommittedFile(providerRoot, resolve(releaseRoot, 'manifest.json'), 'mounted native v2 release manifest').equals(manifestFile.bytes)) throw new Error('mounted native v2 release manifest bytes do not match the configured provider commit')
    if (!readCommittedFile(providerRoot, resolve(releaseRoot, 'inventory.json'), 'mounted native v2 artifact inventory').equals(inventoryFile.bytes)) throw new Error('mounted native v2 artifact inventory bytes do not match the configured provider commit')
    if (!readCommittedFile(providerRoot, resolve(releaseRoot, 'dependency-lock.json'), 'mounted native v2 dependency lock').equals(dependencyLockFile.bytes)) throw new Error('mounted native v2 dependency lock bytes do not match the configured provider commit')
    const manifest = manifestFile.value
    const inventory = inventoryFile.value
    const catalogue = catalogueFile.value
    const dependencyLock = dependencyLockFile.value
    if (!manifest || typeof manifest !== 'object' || Array.isArray(manifest)) throw new Error('mounted native v2 release manifest is not an object')
    if (!dependencyLock || typeof dependencyLock !== 'object' || Array.isArray(dependencyLock)) throw new Error('mounted native v2 dependency lock is not an object')
    if (manifest.entryId !== environment.LINKSITES_TEMPLATE_ID || manifest.version !== environment.LINKSITES_TEMPLATE_VERSION) throw new Error('mounted native v2 release identity does not match configured entry/version')
    if (manifest.dependencyLockSha256 !== environment.LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256 || sha256Bytes(dependencyLockFile.bytes) !== environment.LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256 || dependencyLock.lockSha256 !== sha256Json(dependencyLock.dependencies)) throw new Error('mounted native v2 dependency lock does not match the configured identity')
    const manifestSha256 = sha256Bytes(manifestFile.bytes)
    if (manifestSha256 !== receipt.releaseManifestSha256) throw new Error('native v2 receipt release manifest digest does not match the mounted release')
    if (manifest.artifactTreeSha1 !== receipt.artifactTreeSha1) throw new Error('native v2 receipt artifact identity does not match the mounted release')
    const manifestSource = manifest.releaseSource
    const receiptSource = receipt.receiptType === 'verified_cache' ? receipt.releaseSource : receipt
    if (!manifestSource || manifestSource.releaseSourceCommitSha !== receiptSource.releaseSourceCommitSha || manifestSource.releaseSourceRepositoryTreeSha1 !== receiptSource.releaseSourceRepositoryTreeSha1) throw new Error('native v2 receipt source identity does not match the mounted release')
    if (receipt.receiptType === 'verified_cache' && (receipt.sourceEvidence.selectedRepositoryCommitSha !== manifestSource.releaseSourceCommitSha || receipt.sourceEvidence.selectedRepositoryTreeSha1 !== manifestSource.releaseSourceRepositoryTreeSha1)) throw new Error('verified cache source evidence does not match the mounted release source')
    const admissionErrors = validateNativeV2CatalogueAndInventory(providerRoot, releaseRoot, environment, receipt, manifest, inventory, catalogue, dependencyLock)
    if (admissionErrors.length) throw new Error(`native Revision 2 catalogue/inventory admission failed: ${admissionErrors.join('; ')}`)
    return { ok: true, raw, receipt, receiptSha256: sha256Bytes(receiptFile.bytes), providerRoot, receiptPath }
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : 'mounted native v2 receipt verification failed' }
  }
}

export function validateNativeV2Receipt(raw, environment = {}, options = {}) {
  const shapeError = validateNativeV2ReceiptShape(raw, environment)
  if (shapeError) return shapeError
  if (options.verifyMounted === false) return null
  const result = readAndVerifyNativeV2Receipt(environment, { expectedRaw: raw })
  return result.ok ? null : result.error
}

export function redactedConfigFingerprint(environment, service) {
  const requirements = [...SERVICE_CONFIGURATION.shared, ...SERVICE_CONFIGURATION[service] ?? []]
  const namesAndValues = requirements.map(({ name, secret }) => `${name}=${secret ? '[REDACTED]' : environment[name] ?? ''}`).sort().join('\n')
  return createHash('sha256').update(namesAndValues).digest('hex')
}

export function configurationReferenceRows() {
  return Object.entries(SERVICE_CONFIGURATION).flatMap(([service, requirements]) => requirements.map((requirement) => ({ service, ...requirement })))
}

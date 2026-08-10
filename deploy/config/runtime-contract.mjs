import { createHash } from 'node:crypto'

export const CONFIG_SCHEMA_VERSION = '1.1.0'

const placeholder = /^(?:|<[^>]+>|change[-_ ]?me|replace[-_ ]?me|example|todo|mock|undefined|null)$/i
const sha1 = /^[a-f0-9]{40}$/i
const sha256 = /^[a-f0-9]{64}$/i
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const required = (name, format, secret = false) => ({ name, required: true, format, secret })

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
  ],
  cms: [
    required('DATABASE_URI', 'postgres-url', true),
    required('PAYLOAD_SECRET', 'secret-min-32', true),
    required('PAYLOAD_PUBLIC_SERVER_URL', 'https-url'),
    required('LINKAUTOWORK_GATEWAY_URL', 'https-url'),
    required('LINKAUTOWORK_SIGNING_SECRET', 'secret-min-32', true),
    required('LINKAUTOWORK_SIGNING_KEY_ID', 'slug'),
    required('LINKAUTOWORK_ENVIRONMENT', 'literal:production'),
    required('LINKAUTOWORK_OUTBOX_PATH', 'absolute-path'),
    required('LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET', 'secret-min-32', true),
    required('LINKAUTOWORK_EVENT_GRANTS', 'nonempty-json-array'),
  ],
  'web-master': [
    required('NEXT_PUBLIC_CMS_PROVIDER', 'literal:payload'),
    required('PAYLOAD_BASE_URL', 'https-url'),
    required('PAYLOAD_PUBLIC_SERVER_URL', 'https-url'),
    required('NEXT_PUBLIC_PAYLOAD_API_URL', 'https-url'),
    required('PAYLOAD_API_KEY', 'secret-min-32', true),
    required('PREVIEW_ACCESS_TOKEN', 'secret-min-32', true),
  ],
  'autowork-worker': [
    required('DATABASE_URI', 'postgres-url', true),
    required('PAYLOAD_SECRET', 'secret-min-32', true),
    required('PAYLOAD_PUBLIC_SERVER_URL', 'https-url'),
    required('LINKAUTOWORK_GATEWAY_URL', 'https-url'),
    required('LINKAUTOWORK_SIGNING_SECRET', 'secret-min-32', true),
    required('LINKAUTOWORK_SIGNING_KEY_ID', 'slug'),
    required('LINKAUTOWORK_ENVIRONMENT', 'literal:production'),
    required('LINKAUTOWORK_OUTBOX_PATH', 'absolute-path'),
    required('LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET', 'secret-min-32', true),
    required('LINKAUTOWORK_EVENT_GRANTS', 'nonempty-json-array'),
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
    required('W2_02_LIBRARY_REPOSITORY_PATH', 'absolute-path'),
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
  if (format === 'sha-256') return sha256.test(trimmed) ? null : 'must be a full 64-character SHA-256'
  if (format === 'uuid') return uuid.test(trimmed) ? null : 'must be a UUID'
  if (format === 'slug') return /^[A-Za-z0-9][A-Za-z0-9_-]{2,127}$/.test(trimmed) ? null : 'must be a 3-128 character identifier'
  if (format === 'payload-document-id') return /^[1-9][0-9]*$/.test(trimmed) ? null : 'must be a positive numeric Payload document ID'
  if (format === 'absolute-path') return trimmed.startsWith('/') && !trimmed.includes('\0') ? null : 'must be an absolute non-NUL path'
  if (format === 'secret-min-32') return trimmed.length >= 32 && !/^(.)\1+$/.test(trimmed) ? null : 'must be at least 32 non-repeated characters'
  if (format === 'nonempty-json-array') {
    try { return Array.isArray(JSON.parse(trimmed)) && JSON.parse(trimmed).length > 0 ? null : 'must be a non-empty JSON array' } catch { return 'must be valid JSON' }
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
  if (service === 'web-master' && environment.PREVIEW_ACCESS_TOKEN && environment.W2_02_PREVIEW_ACCESS_TOKEN && environment.PREVIEW_ACCESS_TOKEN !== environment.W2_02_PREVIEW_ACCESS_TOKEN) errors.push({ name: 'PREVIEW_ACCESS_TOKEN', error: 'must equal W2_02_PREVIEW_ACCESS_TOKEN when both are supplied', secret: true })
  if (service === 'program-orchestrator' && environment.W2_02_EXECUTION_REVISION && environment.LINKSITES_RELEASE_SHA && environment.W2_02_EXECUTION_REVISION !== environment.LINKSITES_RELEASE_SHA) errors.push({ name: 'W2_02_EXECUTION_REVISION', error: 'must equal LINKSITES_RELEASE_SHA', secret: false })
  return { ok: errors.length === 0, service, schemaVersion: CONFIG_SCHEMA_VERSION, errors }
}

export function redactedConfigFingerprint(environment, service) {
  const requirements = [...SERVICE_CONFIGURATION.shared, ...SERVICE_CONFIGURATION[service] ?? []]
  const namesAndValues = requirements.map(({ name, secret }) => `${name}=${secret ? '[REDACTED]' : environment[name] ?? ''}`).sort().join('\n')
  return createHash('sha256').update(namesAndValues).digest('hex')
}

export function configurationReferenceRows() {
  return Object.entries(SERVICE_CONFIGURATION).flatMap(([service, requirements]) => requirements.map((requirement) => ({ service, ...requirement })))
}

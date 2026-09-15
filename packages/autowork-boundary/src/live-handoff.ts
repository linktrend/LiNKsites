import { parseGatewayEventPolicies, type GatewayEnvironment, type GatewayEventPolicy } from './index.ts'

export const PLATFORM_CLAIM_CONTRACT_VERSION = 'platform.auth-claims/1.1.0' as const
export const AUTOWORK_RECEIPT_CONTRACT_VERSION = '2026-08-13.v1' as const
export const LINKSITES_LIVE_AUDIENCE = 'linksites' as const

const environments = new Set<GatewayEnvironment>(['development', 'staging', 'production'])

export type LiveAutoworkHandoff = {
  readonly endpoint: string
  readonly issuer: string
  readonly audience: typeof LINKSITES_LIVE_AUDIENCE
  readonly claimContractVersion: typeof PLATFORM_CLAIM_CONTRACT_VERSION
  readonly receiptContract: typeof AUTOWORK_RECEIPT_CONTRACT_VERSION
  readonly environment: GatewayEnvironment
  readonly orgId: string
  readonly signingKeyRef: string
  readonly grants: readonly GatewayEventPolicy[]
}

export type LiveMode =
  | { readonly enabled: false; readonly reason: 'live_autowork_disabled' }
  | { readonly enabled: true; readonly handoff: LiveAutoworkHandoff }

export class LiveModeError extends Error {
  readonly code: string
  constructor(code: string, message = code) {
    super(message)
    this.name = 'LiveModeError'
    this.code = code
  }
}

const nonEmpty = (value: unknown): value is string => typeof value === 'string' && value.trim() !== ''

/** A handoff may carry only a key reference. Secret material is resolved at call time. */
export const assertSigningKeyRef = (value: unknown, field = 'signingKeyRef'): string => {
  if (!nonEmpty(value)) throw new LiveModeError('missing_signing_key_ref', `${field} is required`)
  if (value.startsWith('ltfx.') || /(?:secret|token|password|credential)\s*=/i.test(value) || value.includes('\n')) {
    throw new LiveModeError('secret_value_forbidden', `${field} must be a key reference, not a secret value`)
  }
  return value
}

export type SigningMaterialResolver = { resolve(keyRef: string): string }

export const resolveSigningMaterial = (resolver: SigningMaterialResolver, keyRef: string): string => {
  const material = resolver.resolve(assertSigningKeyRef(keyRef))
  if (!nonEmpty(material)) throw new LiveModeError('missing_signing_material')
  return material
}

const httpsEndpoint = (value: unknown): string => {
  if (!nonEmpty(value)) throw new LiveModeError('missing_endpoint')
  let url: URL
  try { url = new URL(value) } catch { throw new LiveModeError('invalid_endpoint') }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new LiveModeError('invalid_endpoint')
  if (url.username || url.password) throw new LiveModeError('endpoint_must_not_embed_secrets')
  return url.toString()
}

const rejectSecretFields = (value: unknown, path = 'handoff'): void => {
  if (!value || typeof value !== 'object') return
  if (Array.isArray(value)) { value.forEach((item, index) => rejectSecretFields(item, `${path}[${index}]`)); return }
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (/^(?:.*(?:secret|token|password|credential|privateKey).*)$/i.test(key) && key !== 'signingKeyRef') {
      throw new LiveModeError('secret_value_forbidden', `${path}.${key} must not carry secret values`)
    }
    rejectSecretFields(child, `${path}.${key}`)
  }
}

export const parseLiveAutoworkHandoff = (value: unknown): LiveAutoworkHandoff => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new LiveModeError('live_autowork_incomplete')
  rejectSecretFields(value)
  const record = value as Record<string, unknown>
  const environment = recordEnvironment(record.environment)
  const orgId = nonEmpty(record.orgId) ? record.orgId : ''
  if (!orgId) throw new LiveModeError('missing_scope')
  const grants = typeof record.grants === 'string'
    ? parseGatewayEventPolicies(record.grants)
    : parseGatewayEventPolicies(JSON.stringify(record.grants ?? []))
  if (!grants.some((grant) => grant.orgIds.includes(orgId) && grant.environments.includes(environment))) {
    throw new LiveModeError('missing_grants', 'handoff grants do not cover the organisation and environment')
  }
  if (record.claimContractVersion !== PLATFORM_CLAIM_CONTRACT_VERSION) throw new LiveModeError('invalid_claim_contract')
  if (record.receiptContract !== AUTOWORK_RECEIPT_CONTRACT_VERSION) throw new LiveModeError('invalid_receipt_contract')
  if (record.audience !== LINKSITES_LIVE_AUDIENCE) throw new LiveModeError('invalid_audience')
  if (!nonEmpty(record.issuer)) throw new LiveModeError('missing_issuer')
  return {
    endpoint: httpsEndpoint(record.endpoint),
    issuer: record.issuer,
    audience: LINKSITES_LIVE_AUDIENCE,
    claimContractVersion: PLATFORM_CLAIM_CONTRACT_VERSION,
    receiptContract: AUTOWORK_RECEIPT_CONTRACT_VERSION,
    environment,
    orgId,
    signingKeyRef: assertSigningKeyRef(record.signingKeyRef),
    grants,
  }
}

function recordEnvironment(value: unknown): GatewayEnvironment {
  if (typeof value !== 'string' || !environments.has(value as GatewayEnvironment)) throw new LiveModeError('missing_scope', 'environment is required')
  return value as GatewayEnvironment
}

const liveFieldPresent = (env: NodeJS.ProcessEnv): boolean => Boolean(
  env.LINKAUTOWORK_GATEWAY_URL?.trim()
  || env.LINKAUTOWORK_ISSUER?.trim()
  || env.LINKAUTOWORK_AUDIENCE?.trim()
  || env.LINKAUTOWORK_RECEIPT_CONTRACT?.trim()
  || env.LINKAUTOWORK_SIGNING_KEY_ID?.trim()
  || env.LINKAUTOWORK_EVENT_GRANTS?.trim()
  || env.LINKAUTOWORK_LIVE_HANDOFF?.trim(),
)

export const resolveLiveModeFromEnv = (env: NodeJS.ProcessEnv = process.env): LiveMode => {
  if (env.LINKAUTOWORK_LIVE_HANDOFF?.trim()) {
    return { enabled: true, handoff: parseLiveAutoworkHandoff(JSON.parse(env.LINKAUTOWORK_LIVE_HANDOFF)) }
  }
  if (!liveFieldPresent(env)) return { enabled: false, reason: 'live_autowork_disabled' }
  return {
    enabled: true,
    handoff: parseLiveAutoworkHandoff({
      endpoint: env.LINKAUTOWORK_GATEWAY_URL,
      issuer: env.LINKAUTOWORK_ISSUER,
      audience: env.LINKAUTOWORK_AUDIENCE,
      claimContractVersion: env.LINKAUTOWORK_CLAIM_CONTRACT ?? PLATFORM_CLAIM_CONTRACT_VERSION,
      receiptContract: env.LINKAUTOWORK_RECEIPT_CONTRACT,
      environment: env.LINKAUTOWORK_ENVIRONMENT,
      orgId: env.LINKAUTOWORK_ORG_ID ?? env.W2_02_ORG_ID,
      signingKeyRef: env.LINKAUTOWORK_SIGNING_KEY_ID,
      grants: env.LINKAUTOWORK_EVENT_GRANTS,
    }),
  }
}

export const requireLiveMode = (mode: LiveMode): LiveAutoworkHandoff => {
  if (!mode.enabled) throw new LiveModeError('live_autowork_disabled')
  return mode.handoff
}

export const envSigningMaterialResolver = (env: NodeJS.ProcessEnv = process.env): SigningMaterialResolver => ({
  resolve(keyRef: string) {
    const configuredRef = env.LINKAUTOWORK_SIGNING_KEY_ID
    if (configuredRef !== keyRef) throw new LiveModeError('signing_key_ref_mismatch')
    const material = env.LINKAUTOWORK_SIGNING_SECRET
    if (!nonEmpty(material)) throw new LiveModeError('missing_signing_material')
    return material
  },
})

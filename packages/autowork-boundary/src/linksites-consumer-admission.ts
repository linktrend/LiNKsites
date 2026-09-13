/** Source-only LiNKsites consumer-registration admission. Not a live grant, endpoint, or receipt. */

export const LINKSITES_CONSUMER_CONTRACT_VERSION = 'linksites-consumer-registration.v1' as const
export const LINKSITES_CONSUMER_ENVIRONMENTS = ['development', 'staging', 'production'] as const
export const LINKSITES_CONSUMER_EVENT_GRANTS = [
  'linkautowork.v1.execution.succeeded',
  'linkautowork.v1.execution.failed',
  'linkautowork.v1.lifecycle.transition',
] as const
export const LINKSITES_SIGNING_KEY_REF_PATTERN = /^LINKTREND_[A-Z][A-Z0-9_]{2,127}$/

export type LinksitesConsumerAdmissionCode =
  | 'wrong_organisation'
  | 'wrong_environment'
  | 'unknown_event'
  | 'missing_signing_reference'
  | 'unsafe_public_endpoint'
  | 'invalid_registration'

export class LinksitesConsumerAdmissionError extends Error {
  readonly code: LinksitesConsumerAdmissionCode
  constructor(code: LinksitesConsumerAdmissionCode, message: string) {
    super(message)
    this.name = 'LinksitesConsumerAdmissionError'
    this.code = code
  }
}

export type LinksitesConsumerGrant = {
  readonly organisationId: string
  readonly environment: (typeof LINKSITES_CONSUMER_ENVIRONMENTS)[number]
  readonly eventGrants: readonly (typeof LINKSITES_CONSUMER_EVENT_GRANTS)[number][]
  readonly signingKeyRef: string
}

export type LinksitesPrivateEndpointIdentity = { readonly scheme: 'https'; readonly host: string; readonly path: string }

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const secretShapedSigningValue = /-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:sk|pk|ghp|xox[baprs])[_-][A-Za-z0-9-]{12,}|[A-Za-z0-9+/]{40,}={0,2}/

const isRfc1918Ipv4 = (host: string): boolean => {
  const match = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(host)
  if (!match) return false
  const octets = match.slice(1).map(Number)
  if (octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) return false
  const [a, b] = octets
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168)
}

const isInternalHostname = (host: string): boolean =>
  /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*\.internal$/.test(host)

/** Sanitizes a private HTTPS endpoint into host+path identity. */
export const sanitizePrivateEndpointIdentity = (raw: string): LinksitesPrivateEndpointIdentity => {
  let parsed: URL
  try { parsed = new URL(raw) } catch { throw new LinksitesConsumerAdmissionError('unsafe_public_endpoint', 'private endpoint identity is not a valid URL') }
  if (parsed.username || parsed.password) throw new LinksitesConsumerAdmissionError('unsafe_public_endpoint', 'private endpoint identity must not include credentials')
  if (parsed.protocol !== 'https:') throw new LinksitesConsumerAdmissionError('unsafe_public_endpoint', 'private endpoint identity must use https')
  const host = parsed.hostname.toLowerCase()
  if (!(isRfc1918Ipv4(host) || isInternalHostname(host))) throw new LinksitesConsumerAdmissionError('unsafe_public_endpoint', 'private endpoint identity must not use a public host')
  if (parsed.port && parsed.port !== '443') throw new LinksitesConsumerAdmissionError('unsafe_public_endpoint', 'private endpoint identity must not expose a non-default public port')
  const path = parsed.pathname || '/'
  if (!/^\/[A-Za-z0-9._/-]*$/.test(path) || path.includes('..')) throw new LinksitesConsumerAdmissionError('unsafe_public_endpoint', 'private endpoint path is not a sanitized identity')
  return { scheme: 'https', host, path }
}

export type LinksitesConsumerRegistration = {
  readonly contract_version: typeof LINKSITES_CONSUMER_CONTRACT_VERSION
  readonly organisation_id: string
  readonly environment: (typeof LINKSITES_CONSUMER_ENVIRONMENTS)[number]
  readonly event_grants: (typeof LINKSITES_CONSUMER_EVENT_GRANTS)[number][]
  readonly signing_key_ref: string
  readonly private_endpoint: LinksitesPrivateEndpointIdentity
}

const grantedEvent = (value: unknown): value is (typeof LINKSITES_CONSUMER_EVENT_GRANTS)[number] =>
  typeof value === 'string' && (LINKSITES_CONSUMER_EVENT_GRANTS as readonly string[]).includes(value)

/** Admits a source-only registration against an explicit grant. No network I/O. */
export const admitLinksitesConsumerRegistration = (input: unknown, grant: LinksitesConsumerGrant) => {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new LinksitesConsumerAdmissionError('invalid_registration', 'registration must be an object')
  const record = input as Record<string, unknown>
  if (record.signing_key_ref === undefined || record.signing_key_ref === null || record.signing_key_ref === '') {
    throw new LinksitesConsumerAdmissionError('missing_signing_reference', 'signing-key reference is required')
  }
  if (typeof record.signing_key_ref !== 'string' || secretShapedSigningValue.test(record.signing_key_ref) || !LINKSITES_SIGNING_KEY_REF_PATTERN.test(record.signing_key_ref) || record.signing_key_ref !== grant.signingKeyRef) {
    throw new LinksitesConsumerAdmissionError('missing_signing_reference', 'signing-key reference must match the grant reference and never a value')
  }
  if (record.contract_version !== LINKSITES_CONSUMER_CONTRACT_VERSION) throw new LinksitesConsumerAdmissionError('invalid_registration', 'contract_version is not linksites-consumer-registration.v1')
  if (typeof record.organisation_id !== 'string' || !uuid.test(record.organisation_id)) throw new LinksitesConsumerAdmissionError('invalid_registration', 'organisation_id is not a UUID')
  if (record.organisation_id !== grant.organisationId) throw new LinksitesConsumerAdmissionError('wrong_organisation', 'organisation is not granted')
  if (record.environment !== grant.environment) throw new LinksitesConsumerAdmissionError('wrong_environment', 'environment is not granted')
  if (!Array.isArray(record.event_grants) || record.event_grants.length === 0) throw new LinksitesConsumerAdmissionError('invalid_registration', 'event_grants are required')
  const granted = new Set(grant.eventGrants)
  const eventGrants: (typeof LINKSITES_CONSUMER_EVENT_GRANTS)[number][] = []
  for (const eventName of record.event_grants) {
    if (!grantedEvent(eventName)) throw new LinksitesConsumerAdmissionError('unknown_event', `event is not granted: ${String(eventName)}`)
    if (!granted.has(eventName)) throw new LinksitesConsumerAdmissionError('unknown_event', `event is not granted: ${eventName}`)
    if (!eventGrants.includes(eventName)) eventGrants.push(eventName)
  }
  if (typeof record.private_endpoint !== 'string') throw new LinksitesConsumerAdmissionError('unsafe_public_endpoint', 'private endpoint identity is not a valid URL')
  return {
    contract_version: LINKSITES_CONSUMER_CONTRACT_VERSION,
    organisation_id: record.organisation_id,
    environment: record.environment,
    event_grants: eventGrants,
    signing_key_ref: record.signing_key_ref,
    private_endpoint: sanitizePrivateEndpointIdentity(record.private_endpoint),
  } satisfies LinksitesConsumerRegistration
}

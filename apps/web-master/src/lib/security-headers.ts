export const CSP_DESTINATIONS = [
  'script-src',
  'style-src',
  'img-src',
  'media-src',
  'font-src',
  'frame-src',
  'connect-src',
  'form-action',
] as const

export type CspDestination = (typeof CSP_DESTINATIONS)[number]

export type ApprovedIntegration = {
  id: string
  approval: 'approved'
  csp: Partial<Record<CspDestination, readonly string[]>>
}

export type SecurityPolicyConfiguration = {
  httpsReady: boolean
  integrations: readonly ApprovedIntegration[]
  scriptNonces?: readonly string[]
}

export type SecurityHeaderDescriptor = {
  status: 'READY'
  headers: Readonly<Record<string, string>>
  integrationIds: readonly string[]
}

export type SecurityHeaderHold = {
  status: 'HOLD'
  code: 'MISSING_SECURITY_POLICY_CONFIGURATION'
  headers: Readonly<Record<string, never>>
}

export class UnsafeSecurityPolicyError extends Error {
  readonly code = 'UNSAFE_SECURITY_POLICY_CONFIGURATION'

  constructor(message: string) {
    super(message)
    this.name = 'UnsafeSecurityPolicyError'
  }
}

const TOKEN_PATTERN = /^[A-Za-z0-9+/_=-]{16,256}$/

const assertOrigin = (value: string, integrationId: string): string => {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new UnsafeSecurityPolicyError(`${integrationId}: CSP source must be an absolute origin`)
  }

  if (
    url.protocol !== 'https:' ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash ||
    url.hostname.includes('*')
  ) {
    throw new UnsafeSecurityPolicyError(`${integrationId}: CSP source must be an exact HTTPS origin`)
  }

  return url.origin
}

const serializeDirective = (name: string, values: Iterable<string>): string =>
  `${name} ${Array.from(new Set(values)).sort().join(' ')}`

/**
 * Produces a deterministic, source-only policy descriptor. Applying these
 * headers to a runtime or edge remains a separately governed operation.
 */
export const generateSecurityHeaderDescriptor = (
  configuration?: SecurityPolicyConfiguration,
): SecurityHeaderDescriptor | SecurityHeaderHold => {
  if (!configuration) {
    return {
      status: 'HOLD',
      code: 'MISSING_SECURITY_POLICY_CONFIGURATION',
      headers: Object.freeze({}),
    }
  }

  const integrationIds = new Set<string>()
  const sources = new Map<CspDestination, Set<string>>(
    CSP_DESTINATIONS.map((destination) => [destination, new Set(["'self'"])]),
  )

  for (const integration of configuration.integrations) {
    if (integration.approval !== 'approved') {
      throw new UnsafeSecurityPolicyError(`${integration.id || 'integration'}: integration is not approved`)
    }
    if (!integration.id.trim() || integrationIds.has(integration.id)) {
      throw new UnsafeSecurityPolicyError('integration IDs must be non-empty and unique')
    }
    integrationIds.add(integration.id)

    for (const destination of CSP_DESTINATIONS) {
      for (const source of integration.csp[destination] ?? []) {
        sources.get(destination)?.add(assertOrigin(source, integration.id))
      }
    }
  }

  const nonces = configuration.scriptNonces ?? []
  for (const nonce of nonces) {
    if (!TOKEN_PATTERN.test(nonce)) {
      throw new UnsafeSecurityPolicyError('script nonces must be opaque base64-like tokens of at least 16 characters')
    }
    sources.get('script-src')?.add(`'nonce-${nonce}'`)
  }

  const contentSecurityPolicy = [
    "default-src 'self'",
    ...CSP_DESTINATIONS.map((destination) => serializeDirective(destination, sources.get(destination) ?? [])),
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'none'",
  ].join('; ')

  const headers: Record<string, string> = {
    'Content-Security-Policy': contentSecurityPolicy,
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }
  if (configuration.httpsReady) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
  }

  return {
    status: 'READY',
    headers: Object.freeze(headers),
    integrationIds: Object.freeze(Array.from(integrationIds).sort()),
  }
}

/** Source-compatibility checks for the copied Autowork production PACI ES256/JWKS verifier. Not a live JWKS call. */

export const AUTOWORK_PACI_VERIFIER_SOURCE = 'gateway/src/middleware/auth.ts' as const

export type PaciSourceCompatFinding = {
  readonly sourcePath: string
  readonly productionRequiresEs256AndKid: boolean
  readonly missingJwksFailsClosed503: boolean
  readonly hs256IsTestOnly: boolean
  readonly remoteJwksAcceptsOnlyP256: boolean
  readonly liveJwksCalled: false
}

const requiredSnippets = {
  productionRequiresEs256AndKid: "Platform token requires ES256 and kid",
  missingJwksFailsClosed503: "live Platform JWT verifier is not configured",
  jwksUnavailable503: "Platform JWKS verifier unavailable",
  hs256IsTestOnly: "NODE_ENV === 'test'",
  remoteJwksAcceptsOnlyP256: "key.kty === 'EC' && key.crv === 'P-256'",
}

/** Inspect copied Autowork PACI verifier source. Does not fetch JWKS or verify a hosted token. */
export const inspectCopiedPaciVerifierSource = (source: string, sourcePath = AUTOWORK_PACI_VERIFIER_SOURCE): PaciSourceCompatFinding => {
  if (!source.includes(requiredSnippets.productionRequiresEs256AndKid)) throw new Error('copied PACI verifier is missing ES256/kid fail-closed')
  if (!source.includes(requiredSnippets.missingJwksFailsClosed503)) throw new Error('copied PACI verifier is missing unconfigured JWKS 503')
  if (!source.includes(requiredSnippets.jwksUnavailable503)) throw new Error('copied PACI verifier is missing JWKS unavailable 503')
  if (!source.includes(requiredSnippets.hs256IsTestOnly)) throw new Error('copied PACI verifier is missing test-only HS256 branch')
  if (!source.includes(requiredSnippets.remoteJwksAcceptsOnlyP256)) throw new Error('copied PACI verifier is missing P-256 JWKS admission')
  return {
    sourcePath,
    productionRequiresEs256AndKid: true,
    missingJwksFailsClosed503: true,
    hs256IsTestOnly: true,
    remoteJwksAcceptsOnlyP256: true,
    liveJwksCalled: false,
  }
}

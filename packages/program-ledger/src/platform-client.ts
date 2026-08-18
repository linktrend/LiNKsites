import type { PlatformBaseline } from '@linksites/types'

/**
 * Thin, injected boundary to LiNKplatform's auth-claims verifier.
 *
 * LiNKsites deliberately does not parse or authenticate Platform claims. The
 * provider owns claim shape, durable actor/binding lifecycle, credential
 * expiry/revocation, and capability scope. This port lets the Ledger consume
 * the provider's verified result without an HTTP client or credentials here.
 */

export interface PlatformClaimVerificationRequest {
  readonly providerBaseline: PlatformBaseline
  /** Opaque provider-issued claim/envelope; never read as authority locally. */
  readonly claim: unknown
  readonly expectedOrgId: string
  readonly expectedAudience: string
  readonly expectedRuntimeBindingId: string
  readonly requiredCapabilityId: string
  readonly expectedEnvironment?: string
  readonly now?: string
}

/** Identity and narrow scope returned only after Platform verification. */
export interface VerifiedPlatformCapability {
  readonly orgId: string
  readonly actorId: string
  readonly runtimeBindingId: string
  readonly audience: string
  readonly capabilityId: string
  readonly environment?: string
}

/**
 * Provider adapter implemented by the runtime owner (or a deterministic test
 * double). It must reject malformed, forged, wrong-org, wrong-audience,
 * wrong-binding, expired, revoked, and over-broad claims.
 */
export interface PlatformClaimVerifier {
  verifyCapabilityClaim(
    request: PlatformClaimVerificationRequest,
  ): Promise<VerifiedPlatformCapability>
}

export class PlatformClaimVerificationError extends Error {
  readonly code = 'platform_claim_invalid' as const

  constructor(message: string) {
    super(message)
    this.name = 'PlatformClaimVerificationError'
  }
}

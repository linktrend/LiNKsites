/**
 * Capability-grant gate for Program Ledger dispatch.
 *
 * Spec: LiNKplatform shared-foundation-spec §5 — before issuing any lease /
 * dispatch that touches an external system, the Program Ledger must check
 * `platform.capability_grants` (via `platform.has_capability_grant`).
 *
 * This module is the LiNKsites wiring of that hard gate. Pure lookup helpers
 * live in `./capability-lookup.ts` (local mirror of platform contracts so CI
 * does not need a sibling LiNKplatform checkout).
 */
import {
  assertOrgCapabilityGrant,
  type CapabilityGrantLookup,
} from './capability-lookup.js'
import type { SideEffectClass } from './types.js'
import {
  type PlatformClaimVerifier,
  type VerifiedPlatformCapability,
} from './platform-client.js'
import { bindProviderBaseline } from '@linksites/types'

/** Side-effect classes that touch an irreversible / external system. */
export const EXTERNAL_CAPABILITY_SIDE_EFFECTS: ReadonlySet<SideEffectClass> = new Set([
  'irreversible_external',
  'destructive',
  'financial',
])

export class CapabilityGateError extends Error {
  constructor(
    message: string,
    public readonly code:
      | 'capability_required'
      | 'capability_grant_denied'
      | 'org_required',
  ) {
    super(message)
    this.name = 'CapabilityGateError'
  }
}

export interface CapabilityGateInput {
  sideEffectClass: SideEffectClass
  requiredCapabilityId?: string | null
  orgId?: string | null
  /** Opaque Platform-issued claim; it is never trusted directly by the gate. */
  platformClaim?: unknown
  /** Injected Platform authority for claim/binding verification. */
  platformClaimVerifier?: PlatformClaimVerifier
  expectedAudience?: string
  expectedEnvironment?: string
  runtimeBindingId?: string
  providerBaseline?: unknown
}

function assertVerifiedBinding(
  verified: VerifiedPlatformCapability,
  input: CapabilityGateInput,
  capabilityId: string,
): void {
  if (!input.orgId || verified.orgId !== input.orgId) {
    throw new CapabilityGateError(
      `Platform claim organization does not match the Ledger Issue organization`,
      'capability_grant_denied',
    )
  }
  if (!input.runtimeBindingId || verified.runtimeBindingId !== input.runtimeBindingId) {
    throw new CapabilityGateError(
      `Platform claim runtime binding does not match the requested binding`,
      'capability_grant_denied',
    )
  }
  if (!input.expectedAudience || verified.audience !== input.expectedAudience) {
    throw new CapabilityGateError(
      `Platform claim audience does not match the requested audience`,
      'capability_grant_denied',
    )
  }
  if (verified.capabilityId !== capabilityId) {
    throw new CapabilityGateError(
      `Platform claim is not scoped to capability ${capabilityId}`,
      'capability_grant_denied',
    )
  }
  if (!verified.actorId) {
    throw new CapabilityGateError(
      `Platform claim did not identify a durable principal`,
      'capability_grant_denied',
    )
  }
  if (
    input.expectedEnvironment &&
    verified.environment !== undefined &&
    verified.environment !== input.expectedEnvironment
  ) {
    throw new CapabilityGateError(
      `Platform claim environment does not match the requested environment`,
      'capability_grant_denied',
    )
  }
}

/**
 * Enforces the platform capability-grant gate at dispatch time.
 *
 * - External side-effect classes require both `orgId` and `requiredCapabilityId`.
 * - When a capability id is present, the live lookup must return true.
 * - Non-external classes with no capability id skip the check (no external lease).
 * - Exact Platform identity is required whenever a capability is checked.
 */
export async function assertDispatchCapabilityGrant(
  lookup: CapabilityGrantLookup | undefined,
  input: CapabilityGateInput,
): Promise<void> {
  const needsExternal = EXTERNAL_CAPABILITY_SIDE_EFFECTS.has(input.sideEffectClass)
  const capabilityId = input.requiredCapabilityId ?? null

  if (needsExternal && !capabilityId) {
    throw new CapabilityGateError(
      `Issue with sideEffectClass=${input.sideEffectClass} requires requiredCapabilityId ` +
        `so platform.has_capability_grant can be checked before dispatch`,
      'capability_required',
    )
  }

  if (!capabilityId) {
    return
  }

  if (!input.orgId) {
    throw new CapabilityGateError(
      `Issue requires orgId when requiredCapabilityId=${capabilityId} is set`,
      'org_required',
    )
  }

  if (!lookup) {
    throw new CapabilityGateError(
      `ProgramLedger was constructed without a CapabilityGrantLookup, but Issue requires ` +
        `capability ${capabilityId}`,
      'capability_grant_denied',
    )
  }

  const platformBaseline = bindProviderBaseline('platform', input.providerBaseline)

  try {
    let lookupOrgId = input.orgId
    let lookupCapabilityId = capabilityId

    // The request/model fields above are only binding expectations. When a
    // Platform verifier is supplied, the provider-issued result is the source
    // of identity and narrow capability authority used for the grant lookup.
    if (input.platformClaimVerifier) {
      if (input.platformClaim === undefined) {
        throw new CapabilityGateError(
          `Platform claim is required for capability ${capabilityId}`,
          'capability_grant_denied',
        )
      }
      let verified: VerifiedPlatformCapability
      try {
        verified = await input.platformClaimVerifier.verifyCapabilityClaim({
          providerBaseline: platformBaseline,
          claim: input.platformClaim,
          expectedOrgId: input.orgId,
          expectedAudience: input.expectedAudience ?? '',
          expectedRuntimeBindingId: input.runtimeBindingId ?? '',
          requiredCapabilityId: capabilityId,
          expectedEnvironment: input.expectedEnvironment,
        })
      } catch (err) {
        if (err instanceof CapabilityGateError) throw err
        const message = err instanceof Error ? err.message : String(err)
        throw new CapabilityGateError(
          `Platform claim verification failed: ${message}`,
          'capability_grant_denied',
        )
      }
      assertVerifiedBinding(verified, input, capabilityId)
      lookupOrgId = verified.orgId
      lookupCapabilityId = verified.capabilityId
    }

    await assertOrgCapabilityGrant(lookup, lookupOrgId, lookupCapabilityId)
  } catch (err) {
    if (err instanceof CapabilityGateError) throw err
    const message = err instanceof Error ? err.message : String(err)
    throw new CapabilityGateError(message, 'capability_grant_denied')
  }
}

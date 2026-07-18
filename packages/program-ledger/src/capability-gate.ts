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

/** Side-effect classes that touch an irreversible / external system. */
export const EXTERNAL_CAPABILITY_SIDE_EFFECTS: ReadonlySet<SideEffectClass> = new Set([
  'irreversible_external',
  'destructive',
  'financial',
])

export class CapabilityGateError extends Error {
  constructor(
    message: string,
    public readonly code: 'capability_required' | 'capability_grant_denied' | 'org_required',
  ) {
    super(message)
    this.name = 'CapabilityGateError'
  }
}

export interface CapabilityGateInput {
  sideEffectClass: SideEffectClass
  requiredCapabilityId?: string | null
  orgId?: string | null
}

/**
 * Enforces the platform capability-grant gate at dispatch time.
 *
 * - External side-effect classes require both `orgId` and `requiredCapabilityId`.
 * - When a capability id is present, the live lookup must return true.
 * - Non-external classes with no capability id skip the check (no external lease).
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

  try {
    await assertOrgCapabilityGrant(lookup, input.orgId, capabilityId)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    throw new CapabilityGateError(message, 'capability_grant_denied')
  }
}

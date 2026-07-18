/**
 * Minimal capability-grant lookup port for LiNKsites Program Ledger.
 *
 * Mirrors `@linktrend/platform-contracts` CapabilityGrantLookup /
 * assertOrgCapabilityGrant without a cross-repo `file:` dependency (CI has
 * no sibling LiNKplatform checkout). Live wiring can inject a Supabase RPC
 * adapter that calls platform.has_capability_grant.
 */

/** Lookup port ProgramLedger.dispatch uses for platform.has_capability_grant. */
export interface CapabilityGrantLookup {
  /**
   * Must mirror SQL `platform.has_capability_grant(org_id, capability_id)`:
   * true only when a non-revoked grant exists for an active capability.
   */
  hasCapabilityGrant(orgId: string, capabilityId: string): Promise<boolean>
}

export class CapabilityGrantError extends Error {
  constructor(
    message: string,
    public readonly orgId: string,
    public readonly capabilityId: string,
  ) {
    super(message)
    this.name = 'CapabilityGrantError'
  }
}

/**
 * Fail-closed check used at dispatch when an Issue declares a capability id.
 */
export async function assertOrgCapabilityGrant(
  lookup: CapabilityGrantLookup,
  orgId: string,
  capabilityId: string,
): Promise<void> {
  const ok = await lookup.hasCapabilityGrant(orgId, capabilityId)
  if (!ok) {
    throw new CapabilityGrantError(
      `Org ${orgId} is not granted active use of capability ${capabilityId} ` +
        `(platform.has_capability_grant returned false)`,
      orgId,
      capabilityId,
    )
  }
}

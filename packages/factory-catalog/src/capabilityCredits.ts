/**
 * LS-02 / ISS-08 A/B/C/L capability-credit entitlements.
 *
 * Plans: A=30, B=15, C=6, L=0. Core, legal, and system pages are zero-cost
 * and remain activatable/navigable. Capability pages consume one credit.
 * Snapshots are immutable; attempted mutation is rejected and rolled back.
 */

import { canonicalJsonChecksum, canonicalJsonStringify } from './libraryConsumer.ts'
import type { EntitlementCheckResult, EntitlementDisposition } from './tierSpecification.ts'
import { classifyPageCost, isZeroCostPage, type PageCostClass } from './verticalKit.ts'

export class CapabilityCreditError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CapabilityCreditError'
  }
}

export type CapabilityCreditPlanId = 'A' | 'B' | 'C' | 'L'

export const CAPABILITY_CREDIT_BUDGETS: Readonly<Record<CapabilityCreditPlanId, number>> = Object.freeze({
  A: 30,
  B: 15,
  C: 6,
  L: 0,
})

export interface ImmutableEntitlementSnapshot {
  schemaVersion: { major: 1; minor: 0 }
  snapshotId: string
  siteRef: string
  planId: CapabilityCreditPlanId
  budgets: Readonly<Record<CapabilityCreditPlanId, number>>
  grantedCredits: number
  digest: string
}

export interface CreditDispositionRecord {
  route: string
  pageType: string
  costClass: PageCostClass
  creditCost: 0 | 1
  disposition: EntitlementDisposition
  reason: string
  activationAllowed: boolean
  includeInNavigation: boolean
}

const FROZEN_SNAPSHOTS = new WeakSet<object>()

export function capabilityCreditBudget(planId: CapabilityCreditPlanId): number {
  switch (planId) {
    case 'A':
      return CAPABILITY_CREDIT_BUDGETS.A
    case 'B':
      return CAPABILITY_CREDIT_BUDGETS.B
    case 'C':
      return CAPABILITY_CREDIT_BUDGETS.C
    case 'L':
      return CAPABILITY_CREDIT_BUDGETS.L
    default: {
      const exhaustive: never = planId
      throw new CapabilityCreditError(`Unsupported capability-credit plan "${String(exhaustive)}".`)
    }
  }
}

export function checkCapabilityCredits(planId: CapabilityCreditPlanId, capabilityPageCount: number): EntitlementCheckResult {
  if (!Number.isInteger(capabilityPageCount) || capabilityPageCount < 0) {
    throw new CapabilityCreditError('capabilityPageCount must be a non-negative integer.')
  }
  const budget = capabilityCreditBudget(planId)
  if (capabilityPageCount <= budget) {
    return { disposition: 'allowed', reason: `${capabilityPageCount} capability pages is within plan ${planId}'s ${budget} credits.` }
  }
  if (planId === 'L') {
    return { disposition: 'unsupported', reason: 'Plan L grants 0 capability credits; only zero-cost core/legal/system pages are entitled.' }
  }
  const upgrade = planId === 'C' ? 'B' : planId === 'B' ? 'A' : null
  return upgrade
    ? { disposition: 'requires_upgrade', reason: `${capabilityPageCount} capability pages exceeds plan ${planId}'s ${budget} credits; plan ${upgrade} may support this.` }
    : { disposition: 'unsupported', reason: `${capabilityPageCount} capability pages exceeds plan A's 30-credit ceiling.` }
}

function snapshotDigest(input: Omit<ImmutableEntitlementSnapshot, 'digest'>): string {
  return canonicalJsonChecksum(input)
}

export function freezeEntitlementSnapshot(input: {
  snapshotId: string
  siteRef: string
  planId: CapabilityCreditPlanId
}): ImmutableEntitlementSnapshot {
  const budgets = Object.freeze({ ...CAPABILITY_CREDIT_BUDGETS })
  const unsigned = {
    schemaVersion: { major: 1 as const, minor: 0 as const },
    snapshotId: input.snapshotId,
    siteRef: input.siteRef,
    planId: input.planId,
    budgets,
    grantedCredits: capabilityCreditBudget(input.planId),
  }
  const snapshot = Object.freeze({ ...unsigned, digest: snapshotDigest(unsigned) })
  FROZEN_SNAPSHOTS.add(snapshot)
  return snapshot
}

export function assertImmutableEntitlementSnapshot(snapshot: ImmutableEntitlementSnapshot): void {
  if (!FROZEN_SNAPSHOTS.has(snapshot) || !Object.isFrozen(snapshot) || !Object.isFrozen(snapshot.budgets)) {
    throw new CapabilityCreditError('Entitlement snapshot is not an immutable factory-issued snapshot.')
  }
  const unsigned = {
    schemaVersion: snapshot.schemaVersion,
    snapshotId: snapshot.snapshotId,
    siteRef: snapshot.siteRef,
    planId: snapshot.planId,
    budgets: snapshot.budgets,
    grantedCredits: snapshot.grantedCredits,
  }
  if (snapshot.digest !== snapshotDigest(unsigned)) {
    throw new CapabilityCreditError('Entitlement snapshot digest mismatch; snapshot was tampered with.')
  }
  if (snapshot.grantedCredits !== capabilityCreditBudget(snapshot.planId) || snapshot.budgets.A !== 30 || snapshot.budgets.B !== 15 || snapshot.budgets.C !== 6 || snapshot.budgets.L !== 0) {
    throw new CapabilityCreditError('Entitlement snapshot budgets are not the canonical A=30 B=15 C=6 L=0 table.')
  }
}

export function rollbackEntitlementMutation(
  snapshot: ImmutableEntitlementSnapshot,
  attempted: ImmutableEntitlementSnapshot,
): ImmutableEntitlementSnapshot {
  assertImmutableEntitlementSnapshot(snapshot)
  if (canonicalJsonStringify(attempted) !== canonicalJsonStringify(snapshot)) {
    throw new CapabilityCreditError('Immutable entitlement snapshot mutation rejected; rolled back to the original snapshot.')
  }
  return snapshot
}

export function dispositionCreditsForPages(
  snapshot: ImmutableEntitlementSnapshot,
  pages: ReadonlyArray<{ route: string; pageType: string }>,
): CreditDispositionRecord[] {
  assertImmutableEntitlementSnapshot(snapshot)
  let consumed = 0
  const records: CreditDispositionRecord[] = pages.map((page) => {
    const costClass = classifyPageCost(page.pageType)
    const zeroCost = isZeroCostPage(page.pageType)
    const creditCost: 0 | 1 = zeroCost ? 0 : 1
    if (zeroCost) {
      return {
        route: page.route,
        pageType: page.pageType,
        costClass,
        creditCost,
        disposition: 'allowed',
        reason: `${costClass} pages are zero-cost and do not consume capability credits.`,
        activationAllowed: true,
        includeInNavigation: true,
      }
    }
    consumed += 1
    const check = checkCapabilityCredits(snapshot.planId, consumed)
    const allowed = check.disposition === 'allowed'
    return {
      route: page.route,
      pageType: page.pageType,
      costClass,
      creditCost,
      disposition: check.disposition,
      reason: check.reason,
      activationAllowed: allowed,
      includeInNavigation: allowed,
    }
  })
  const denied = records.find((record) => record.disposition !== 'allowed')
  if (denied) {
    throw new CapabilityCreditError(`Capability-credit entitlement rejected for ${denied.route}: ${denied.reason}`)
  }
  return records
}

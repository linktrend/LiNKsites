/**
 * Foundation Matching (Phase 4, Issue phase4-foundation-matching-001).
 *
 * Manual §08.16/§08.28/§10.18 describe a Foundation-matching process for
 * deciding which Reusable Site Foundation to reserve for a new prospect/
 * lead: apply HARD FILTERS to eliminate ineligible Foundations, then RANK
 * the survivors on many factors, then RESERVE the top-ranked one. This
 * has been an explicitly named open gap (GAP-16, `audit/14_implementation_
 * roadmap.md`): "a real Preview Inventory / matching engine ... to decide
 * which new lead an archived-and-recycled Foundation should be re-offered
 * to."
 *
 * This module is an honestly-scoped FIRST SLICE, not the manual's full
 * engine:
 *
 * - Hard filters (`findEligibleFoundations`) check only the 4 data points
 *   that genuinely exist today: lifecycle status (`active`), Vertical Kit
 *   match, tier match, and current reservation state (delegated to
 *   `FoundationReservationManager.getActiveReservation()`, not duplicated
 *   here). The manual lists many more hard filters this repository cannot
 *   yet check because the underlying data doesn't exist -- e.g. content
 *   availability, design-profile compatibility, locale/script, runtime
 *   mode, integration availability, accessibility status, performance
 *   budget, security policy, and incident/suspension status.
 *
 * - Ranking (`rankFoundations`) uses a single, real, defensible signal --
 *   most-recently-created-first -- since no engagement/telemetry data
 *   exists yet to rank by anything richer. The manual's full multi-factor
 *   ranking (foundation reuse, vertical suitability, content fit,
 *   conversion objective, distinctiveness, historical quality, engagement
 *   evidence, adaptation effort, rendering cost, operational simplicity)
 *   requires data this repository does not have yet.
 *
 * - `findAndReserveFoundation` chains the above and reserves the winner
 *   via the existing `FoundationReservationManager`, so this module never
 *   duplicates reservation-exclusivity logic.
 */

import type { TierId } from './tierSpecification.js'
import { FoundationReservationManager, type FoundationReservation, type ReusableSiteFoundation } from './reusableFoundation.js'

export class FoundationMatchingError extends Error {}

export interface FoundationMatchRequest {
  kitId: string
  tierId: TierId
  /** Opaque ref to the Preview Production Request / lead this match serves (mirrors FoundationReservationManager.reserve()'s requesterRef). */
  requesterRef: string
}

export interface FoundationMatchResult {
  foundation: ReusableSiteFoundation
  reservation: FoundationReservation
}

/**
 * Hard filters (manual §08.16/§10.18), using only data that genuinely
 * exists in this repository today: the Foundation must be `active`,
 * must match the requested kitId and tierId exactly, and must not
 * currently have an active reservation (checked via the given
 * `reservationManager`, not duplicated here -- delegates to
 * `FoundationReservationManager.getActiveReservation()`).
 */
export function findEligibleFoundations(
  pool: ReusableSiteFoundation[],
  request: FoundationMatchRequest,
  reservationManager: FoundationReservationManager,
): ReusableSiteFoundation[] {
  return pool.filter(
    (foundation) =>
      foundation.status === 'active' &&
      foundation.kitId === request.kitId &&
      foundation.tierId === request.tierId &&
      reservationManager.getActiveReservation(foundation.foundationId) === null,
  )
}

/**
 * Ranks eligible candidates by the one real, defensible signal
 * available today -- most-recently-created first (`createdAt`
 * descending) -- with a deterministic tie-break on `foundationId`
 * ascending when `createdAt` values are equal, so ranking is never
 * ambiguous. This is explicitly a first-pass ranking, not the manual's
 * full multi-factor engine (which needs engagement/content-fit data
 * this repository does not have).
 */
export function rankFoundations(candidates: ReusableSiteFoundation[]): ReusableSiteFoundation[] {
  return [...candidates].sort((a, b) => {
    const createdAtDiff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (createdAtDiff !== 0) return createdAtDiff
    return a.foundationId.localeCompare(b.foundationId)
  })
}

/**
 * Runs findEligibleFoundations() then rankFoundations(), reserves the
 * top-ranked Foundation via reservationManager.reserve(), and returns
 * both the Foundation and the resulting Reservation. Throws
 * FoundationMatchingError (with a message naming the kitId/tierId
 * requested) if no eligible candidate survives the hard filters.
 */
export function findAndReserveFoundation(
  pool: ReusableSiteFoundation[],
  request: FoundationMatchRequest,
  reservationManager: FoundationReservationManager,
): FoundationMatchResult {
  const eligible = findEligibleFoundations(pool, request, reservationManager)
  if (eligible.length === 0) {
    throw new FoundationMatchingError(
      `No eligible Foundation found for kitId "${request.kitId}", tierId "${request.tierId}" (all candidates failed hard filters or pool was empty).`,
    )
  }
  const [winner] = rankFoundations(eligible)
  const reservation = reservationManager.reserve(winner.foundationId, request.requesterRef)
  return { foundation: winner, reservation }
}

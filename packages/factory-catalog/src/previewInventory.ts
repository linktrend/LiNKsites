/**
 * Preview Inventory Snapshot (Phase 4, Issue phase4-preview-inventory-001).
 *
 * Manual §10.2's doctrine point 7: "Inventory is measured as a
 * portfolio (what exists, cost, fit, usage, outcomes)." Manual §10.38
 * lists many portfolio-level metrics: coverage rate for qualified
 * leads, % matched without new foundation work, average time to
 * sales-ready preview, foundations by active vertical and tier,
 * foundation reuse distribution, reservation utilization, stale or
 * suspended share, unused foundation age, conversion rate by family,
 * cost per conversion by family.
 *
 * DELIBERATE SCOPE LIMIT: this module does NOT implement the manual's
 * full seven-canonical-object Preview Inventory model (Reusable Site
 * Foundation, Foundation Version, Foundation Reservation, Prospect
 * Adaptation, Preview Deployment, General Improvement, Outcome
 * Record). Most of those already exist from prior Issues; two of them
 * -- Preview Deployment and Outcome Record -- do not exist anywhere in
 * this repository yet (they require a real deployed-preview pipeline
 * and a real Sales-outcome integration, neither of which this
 * repository has). Manufacturing fake versions of those absent
 * objects would be dishonest filler, so this module does not attempt
 * it.
 *
 * What this module DOES do is the real, honest, valuable piece that
 * IS computable today: a pure aggregation function over a pool of
 * `ReusableSiteFoundation`, a live `FoundationReservationManager`, and
 * a pool of `ProspectAdaptation` -- the subset of manual §10.38's
 * metrics that this existing data can actually support. This
 * deliberately EXCLUDES the metrics that need data this repository
 * does not have: cost per conversion, conversion rate by family,
 * coverage rate for qualified leads, and average time to sales-ready
 * preview all require cost ledgers, Sales outcomes, or readiness
 * timestamps that do not exist here yet.
 */

import type { FoundationReservationManager, ReusableSiteFoundation } from './reusableFoundation.js'
import type { ProspectAdaptation, ProspectAdaptationStatus } from './prospectAdaptation.js'

export interface FoundationCountsByStatus {
  candidate: number
  active: number
  deprecated: number
  retired: number
}

export interface FoundationCountsByKitAndTier {
  kitId: string
  tierId: string
  count: number
}

export interface AdaptationCountsByStatus {
  draft: number
  previewed: number
  published: number
  archived: number
}

export interface FoundationReuseEntry {
  foundationId: string
  /** How many ProspectAdaptation records point at this foundation -- a real signal for manual §10.39's similarity/saturation concern (a foundation adapted many times is at higher risk of prospect-visible repetition), even though this module does not implement any saturation THRESHOLD or policy action, only the raw count. */
  adaptationCount: number
}

export interface PreviewInventorySnapshot {
  generatedAt: string
  totalFoundations: number
  foundationCountsByStatus: FoundationCountsByStatus
  foundationCountsByKitAndTier: FoundationCountsByKitAndTier[]
  /** Active reservations right now / active-status foundations right now (0 if there are no active foundations). A real, present-tense utilization signal (manual §10.38's "reservation utilization"), not a time-windowed historical rate (no reservation history/audit trail exists yet to compute that). */
  reservationUtilizationRate: number
  totalAdaptations: number
  adaptationCountsByStatus: AdaptationCountsByStatus
  /** Sorted descending by adaptationCount, so the most-reused (highest-saturation-risk) foundations are first. */
  foundationReuseDistribution: FoundationReuseEntry[]
}

/**
 * Computes a point-in-time Preview Inventory portfolio snapshot from
 * the pools/managers supplied by the caller. This function has no
 * side effects and performs no ledger/persistence writes -- it is a
 * pure aggregation over whatever the caller passes in, matching the
 * manual §10.2's "inventory is measured as a portfolio" doctrine using
 * only data that genuinely exists in this repository today.
 */
export function computePreviewInventorySnapshot(
  foundations: ReusableSiteFoundation[],
  reservationManager: FoundationReservationManager,
  adaptations: ProspectAdaptation[],
): PreviewInventorySnapshot {
  const foundationCountsByStatus: FoundationCountsByStatus = {
    candidate: 0,
    active: 0,
    deprecated: 0,
    retired: 0,
  }
  for (const foundation of foundations) {
    foundationCountsByStatus[foundation.status]++
  }

  const kitTierCounts = new Map<string, FoundationCountsByKitAndTier>()
  for (const foundation of foundations) {
    const key = `${foundation.kitId}::${foundation.tierId}`
    const existing = kitTierCounts.get(key)
    if (existing) {
      existing.count++
    } else {
      kitTierCounts.set(key, { kitId: foundation.kitId, tierId: foundation.tierId, count: 1 })
    }
  }
  const foundationCountsByKitAndTier = Array.from(kitTierCounts.values())

  const activeFoundations = foundations.filter((foundation) => foundation.status === 'active')
  const activeFoundationsWithReservation = activeFoundations.filter(
    (foundation) => reservationManager.getActiveReservation(foundation.foundationId) !== null,
  )
  const reservationUtilizationRate =
    activeFoundations.length === 0 ? 0 : activeFoundationsWithReservation.length / activeFoundations.length

  const adaptationCountsByStatus: AdaptationCountsByStatus = {
    draft: 0,
    previewed: 0,
    published: 0,
    archived: 0,
  }
  for (const adaptation of adaptations) {
    adaptationCountsByStatus[adaptation.status]++
  }

  const reuseCounts = new Map<string, number>()
  for (const adaptation of adaptations) {
    reuseCounts.set(adaptation.foundationId, (reuseCounts.get(adaptation.foundationId) ?? 0) + 1)
  }
  const foundationReuseDistribution = Array.from(reuseCounts.entries())
    .map(([foundationId, adaptationCount]) => ({ foundationId, adaptationCount }))
    .sort((a, b) => {
      if (b.adaptationCount !== a.adaptationCount) return b.adaptationCount - a.adaptationCount
      return a.foundationId.localeCompare(b.foundationId)
    })

  return {
    generatedAt: new Date().toISOString(),
    totalFoundations: foundations.length,
    foundationCountsByStatus,
    foundationCountsByKitAndTier,
    reservationUtilizationRate,
    totalAdaptations: adaptations.length,
    adaptationCountsByStatus,
    foundationReuseDistribution,
  }
}

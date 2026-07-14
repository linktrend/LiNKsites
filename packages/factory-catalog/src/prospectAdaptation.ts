/**
 * Prospect Adaptation (Phase 3/4 boundary, Issue
 * phase3-prospect-adaptation-001).
 *
 * Manual §09-§10: during Preview Production, one specific prospect's
 * business content (name, phone, service area, real photos where
 * rights-cleared, etc.) is adapted ONTO a reserved, still-neutral
 * Reusable Site Foundation. This record is deliberately the mirror
 * image of the Foundation's prospect-neutrality rule (manual §08.19,
 * enforced in reusableFoundation.ts): the Foundation itself must never
 * contain prospect-specific data, but a ProspectAdaptation legitimately
 * DOES -- that is its entire purpose. This file does not re-run
 * `assertProspectNeutral()` against adaptation content; that check
 * belongs to the Foundation, not the Adaptation.
 *
 * What this file DOES enforce is the two safety invariants the manual
 * requires around adaptation itself: (1) an Adaptation may only be
 * created against a currently-active FoundationReservation for the
 * same Foundation the target Site Specification resolved against
 * (manual §08.28/§10.18 -- you cannot adapt a Foundation nobody
 * reserved, or adapt the wrong Foundation), and (2) the manual's
 * required "close or recycle" lifecycle (manual §MVO commercial loop
 * step 7) -- an Adaptation that does not convert must be explicitly
 * archived, which is also the trigger point for the underlying
 * Foundation reservation to be released back to the pool for the next
 * matching lead. Recycling is out of scope here (it requires a real
 * Preview Inventory / matching engine, GAP-16, still absent) -- only
 * the state transition and reservation-release side effect are
 * implemented.
 */

import type { SchemaVersion } from '@linksites/types'
import type { FoundationReservation, FoundationReservationManager } from './reusableFoundation.js'
import type { SiteSpecification } from './siteSpecification.js'

export type ProspectAdaptationStatus = 'draft' | 'previewed' | 'published' | 'archived'

export class ProspectAdaptationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ProspectAdaptationError'
  }
}

export interface ProspectAdaptation {
  schemaVersion: SchemaVersion
  adaptationId: string
  siteSpecId: string
  foundationId: string
  reservationId: string
  status: ProspectAdaptationStatus
  /**
   * Prospect-specific business content (name, contact, service area,
   * etc.). Deliberately untyped/opaque here -- the manual defers the
   * real content schema to the (still-absent) Site Assembly Manifest
   * (GAP-04); this record only needs to carry it, not validate its
   * shape. Unlike Foundation content, this is EXPECTED to contain
   * prospect-specific fields.
   */
  prospectContent: Record<string, unknown>
  createdAt: string
  archivedAt?: string
}

/**
 * Creates a Prospect Adaptation, refusing to do so unless there is a
 * currently-active reservation for the exact Foundation the Site
 * Specification resolved against (manual §08.28/§10.18).
 */
export function createProspectAdaptation(
  adaptationId: string,
  siteSpec: SiteSpecification,
  reservation: FoundationReservation,
  prospectContent: Record<string, unknown>,
): ProspectAdaptation {
  if (reservation.foundationId !== siteSpec.foundationId) {
    throw new ProspectAdaptationError(
      `Reservation "${reservation.reservationId}" is for Foundation "${reservation.foundationId}", but the Site Specification resolved against Foundation "${siteSpec.foundationId}".`,
    )
  }
  if (reservation.status !== 'active') {
    throw new ProspectAdaptationError(
      `Reservation "${reservation.reservationId}" is not active (status: "${reservation.status}") -- cannot create an Adaptation against a released or expired reservation.`,
    )
  }
  return {
    schemaVersion: { major: 1, minor: 0 },
    adaptationId,
    siteSpecId: siteSpec.siteSpecId,
    foundationId: siteSpec.foundationId,
    reservationId: reservation.reservationId,
    status: 'draft',
    prospectContent,
    createdAt: new Date().toISOString(),
  }
}

const ALLOWED_TRANSITIONS: Record<ProspectAdaptationStatus, ProspectAdaptationStatus[]> = {
  draft: ['previewed', 'archived'],
  previewed: ['published', 'archived'],
  published: ['archived'],
  archived: [],
}

export function assertTransitionAllowed(from: ProspectAdaptationStatus, to: ProspectAdaptationStatus): void {
  if (!ALLOWED_TRANSITIONS[from].includes(to)) {
    throw new ProspectAdaptationError(`Illegal Prospect Adaptation transition: "${from}" -> "${to}".`)
  }
}

export function transitionAdaptation(adaptation: ProspectAdaptation, to: ProspectAdaptationStatus): ProspectAdaptation {
  assertTransitionAllowed(adaptation.status, to)
  return {
    ...adaptation,
    status: to,
    ...(to === 'archived' ? { archivedAt: new Date().toISOString() } : {}),
  }
}

/**
 * Manual §MVO commercial loop step 7 ("close or recycle"): archiving a
 * non-converting Adaptation is also the trigger to release its
 * underlying Foundation reservation, so the Foundation becomes
 * available again for the next matching lead. Real matching/re-offer
 * logic (a Preview Inventory engine, GAP-16) is out of scope -- this
 * only performs the state transition plus the release side effect.
 */
export function archiveAndRecycleFoundation(
  adaptation: ProspectAdaptation,
  reservationManager: FoundationReservationManager,
): ProspectAdaptation {
  const archived = transitionAdaptation(adaptation, 'archived')
  const activeReservation = reservationManager.getActiveReservation(archived.foundationId)
  if (activeReservation && activeReservation.reservationId === archived.reservationId) {
    reservationManager.release(activeReservation.reservationId)
  }
  return archived
}

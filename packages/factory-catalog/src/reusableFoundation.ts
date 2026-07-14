/**
 * Reusable Site Foundation (Phase 3, Issue phase3-reusable-foundation-001).
 *
 * Manual §08.2: Vertical Kit, Tier Specification, and Reusable Site
 * Foundation are three DISTINCT objects that must never be collapsed
 * into one undocumented template. This is the third. Manual §08.3.4/
 * §08.18: "a foundation is not a code fork -- it's a pinned composition
 * of shared capabilities." Manual §08.24: a Foundation remains a
 * separate object even after customer sites derive from it (customer
 * sites never mutate the shared Foundation they were adapted from).
 *
 * Manual §08.19 (hard prospect-neutrality rule): Foundations must not
 * contain prospect names, customer contacts, logos, unverified claims,
 * customer-owned unrightsed images, credentials/secrets, live analytics
 * IDs, customer form destinations, domain config, or personal data.
 * `scanForProhibitedFields()` below is the first concrete enforcement
 * mechanism for that rule, usable once a real Foundation content model
 * exists (Site Assembly Manifest / Component Registry -- both still
 * absent, GAP-04/GAP-07).
 *
 * Manual §10.18 / §08.28: Foundations are matched and RESERVED (a
 * time-bounded, exclusive claim) while one Preview Production Request
 * adapts them, to prevent two concurrent adaptations of the same
 * Foundation. `FoundationReservationManager` implements that exclusivity
 * using the same lease-style pattern already proven in
 * packages/program-ledger (claim -> expire -> reclaim), applied here to
 * a different resource (a Foundation slot, not an Issue Run).
 */

import type { SchemaVersion } from '@linksites/types'
import type { TierId } from './tierSpecification.js'

export type FoundationStatus = 'candidate' | 'active' | 'deprecated' | 'retired'

export interface ReusableSiteFoundation {
  schemaVersion: SchemaVersion
  foundationId: string
  displayName: string
  status: FoundationStatus
  /** Which Vertical Kit this Foundation was composed for (manual §08.28's Kit/tier compatibility). */
  kitId: string
  /** Which tier this Foundation's composition targets. */
  tierId: TierId
  /**
   * Manual §08.21: pinned references to the platform release and Site
   * Assembly Manifest this Foundation was built against. Both remain
   * opaque string refs for now -- neither a platform-release registry
   * nor the Site Assembly Engine/Manifest exists yet (GAP-04/GAP-07).
   */
  platformReleaseRef: string
  assemblyManifestRef: string
  /** Illustrative-only cost estimate (manual §08.30 explicitly warns example figures are not approved targets). Undefined until real cost tracking exists. */
  costBaselineUsd?: number
  createdAt: string
}

export class FoundationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'FoundationError'
  }
}

export function assertFoundationIsProductionReady(foundation: ReusableSiteFoundation): void {
  if (foundation.status !== 'active') {
    throw new FoundationError(
      `Foundation "${foundation.foundationId}" is not production-ready (status: "${foundation.status}"). Only "active" Foundations may be reserved for real adaptation work.`,
    )
  }
}

export function assertFoundationMatchesKitAndTier(foundation: ReusableSiteFoundation, kitId: string, tierId: TierId): void {
  if (foundation.kitId !== kitId) {
    throw new FoundationError(`Foundation "${foundation.foundationId}" was built for Kit "${foundation.kitId}", not "${kitId}".`)
  }
  if (foundation.tierId !== tierId) {
    throw new FoundationError(`Foundation "${foundation.foundationId}" was built for tier "${foundation.tierId}", not "${tierId}".`)
  }
}

/**
 * Manual §08.19's prospect-neutrality rule, made mechanically checkable.
 * Field NAMES are checked case-insensitively against a known-prohibited
 * list; this is intentionally a blunt, structural first pass (real
 * enforcement will need content-aware scanning once a real Foundation
 * content model exists) but is still real, useful evidence -- not a
 * placeholder that always passes.
 */
const PROHIBITED_FIELD_NAME_PATTERNS = [
  /prospect.*name/i,
  /customer.*contact/i,
  /customer.*email/i,
  /customer.*phone/i,
  /logo.*url/i,
  /credential/i,
  /secret/i,
  /api.*key/i,
  /analytics.*id/i,
  /ga.*tracking/i,
  /form.*destination/i,
  /domain/i,
  /ssn|social.*security/i,
]

export function scanForProhibitedFields(content: Record<string, unknown>): string[] {
  const violations: string[] = []
  const visit = (obj: Record<string, unknown>, path: string) => {
    for (const [key, value] of Object.entries(obj)) {
      const fullPath = path ? `${path}.${key}` : key
      if (PROHIBITED_FIELD_NAME_PATTERNS.some((pattern) => pattern.test(key))) {
        violations.push(fullPath)
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        visit(value as Record<string, unknown>, fullPath)
      }
    }
  }
  visit(content, '')
  return violations
}

export function assertProspectNeutral(content: Record<string, unknown>): void {
  const violations = scanForProhibitedFields(content)
  if (violations.length > 0) {
    throw new FoundationError(
      `Prospect-neutrality violation (manual §08.19): found prohibited field(s) in Foundation content: ${violations.join(', ')}.`,
    )
  }
}

// --- Foundation Reservation (manual §08.28, §10.18) ---

export type ReservationStatus = 'active' | 'released' | 'expired'

export interface FoundationReservation {
  reservationId: string
  foundationId: string
  /** Opaque ref to the Preview Production Request this reservation serves (manual §09) -- that object doesn't exist yet. */
  requesterRef: string
  status: ReservationStatus
  reservedAt: string
  expiresAt: string
}

/**
 * Enforces foundation-reservation exclusivity: only one active
 * reservation per Foundation at a time, using the same claim/expire
 * pattern already proven in packages/program-ledger's lease/fencing
 * logic (applied here to a Foundation slot instead of a Run).
 */
export class FoundationReservationManager {
  private reservations = new Map<string, FoundationReservation>()
  private counter = 0

  reserve(foundationId: string, requesterRef: string, durationMs = 5 * 60_000): FoundationReservation {
    this.expireStale(foundationId)
    const existing = Array.from(this.reservations.values()).find(
      (r) => r.foundationId === foundationId && r.status === 'active',
    )
    if (existing) {
      throw new FoundationError(`Foundation "${foundationId}" is already reserved (reservation "${existing.reservationId}").`)
    }
    const reservation: FoundationReservation = {
      reservationId: `res-${++this.counter}`,
      foundationId,
      requesterRef,
      status: 'active',
      reservedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + durationMs).toISOString(),
    }
    this.reservations.set(reservation.reservationId, reservation)
    return reservation
  }

  release(reservationId: string): void {
    const reservation = this.reservations.get(reservationId)
    if (!reservation) throw new FoundationError(`Reservation "${reservationId}" not found.`)
    reservation.status = 'released'
  }

  private expireStale(foundationId: string): void {
    const now = Date.now()
    for (const reservation of this.reservations.values()) {
      if (reservation.foundationId === foundationId && reservation.status === 'active' && new Date(reservation.expiresAt).getTime() < now) {
        reservation.status = 'expired'
      }
    }
  }

  getActiveReservation(foundationId: string): FoundationReservation | null {
    this.expireStale(foundationId)
    return Array.from(this.reservations.values()).find((r) => r.foundationId === foundationId && r.status === 'active') ?? null
  }
}

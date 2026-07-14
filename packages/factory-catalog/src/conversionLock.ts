/**
 * Conversion Lock (Phase 4, Issue phase4-conversion-lock-001).
 *
 * Manual §10 §33 ("Conversion lock"): "When Sales sends a valid
 * conversion instruction based on Stripe-confirmed payment and the
 * corresponding Odoo commercial record, LiNKsites locks the relevant
 * preview version and foundation relationship for customer
 * finalization." This lock PREVENTS recycling while fulfilment is
 * active, reassigning prospect-specific assets, updating the preview
 * underneath the order, or losing the exact version shown and sold. It
 * does NOT automatically publish the preview -- finalization (fact
 * verification, provisional-asset replacement, completing purchased
 * scope, production integration/domain config, approval, launch Gates)
 * is explicitly separate in the manual and out of scope here.
 *
 * The manual does not define a dedicated `ConversionLock` schema (an
 * explicitly-named gap in the manual itself). This file is the first
 * reasonable, honestly-scoped implementation of that invariant,
 * following the same claim -> block-conflicting-operations -> release
 * pattern this repository already uses for `FoundationReservationManager`
 * (reusableFoundation.ts) -- applied here to a different resource (a
 * Foundation's conversion state, not a reservation slot).
 *
 * Honest scope boundaries:
 * - No real Stripe or Odoo integration exists in this repository
 *   (GAP-33/34/35, a previously-identified blocker requiring
 *   cross-Program access this repository does not have).
 *   `stripePaymentConfirmationRef` and `odooCommercialRecordRef` are
 *   opaque, caller-supplied string references, never verified against
 *   a real Stripe API call or Odoo record.
 * - `conversionInstructionRef` is likewise an opaque ref to a
 *   Sales-authorized instruction -- no real Sales-authority validation
 *   system exists to check it against (the same honest-scope boundary
 *   as other Issues in this session that reference authority_ref /
 *   proof_authority_ref).
 * - This module implements only the LOCK and its recycle-blocking
 *   invariant (`assertRecycleAllowed()`), not the downstream
 *   customer-finalization workflow the manual explicitly separates
 *   out. It also does not wire `assertRecycleAllowed()` into
 *   `archiveAndRecycleFoundation()` (prospectAdaptation.ts) -- that
 *   would mean editing an already-merged file from a prior Issue,
 *   kept out of scope here to avoid an unreviewed edit to shared
 *   code. See PROOF.md `open_gaps`.
 */

import type { SchemaVersion } from '@linksites/types'
import type { ProspectAdaptation } from './prospectAdaptation.js'

export class ConversionLockError extends Error {}

export interface ConversionLock {
  schemaVersion: SchemaVersion
  lockId: string
  adaptationId: string
  foundationId: string
  /** Opaque ref to the exact deployed preview version that was shown and sold (manual §10.33/§10.49.13: the exact version must not be lost or silently updated). No Preview Deployment object exists in this repository yet, so this is a caller-supplied opaque string, not a validated foreign key. */
  previewDeploymentVersionRef: string
  /** Opaque ref to the Sales-authorized conversion instruction. No real Sales-authority validation system exists to check this against (same honest-scope boundary as other Issues this session that reference authority_ref/proof_authority_ref). */
  conversionInstructionRef: string
  /** Opaque ref to Stripe's payment confirmation. No live Stripe integration exists in this repository (GAP-33/34/35 blocker) -- this is a caller-supplied reference only, never verified against a real Stripe API call. */
  stripePaymentConfirmationRef: string
  /** Opaque ref to the corresponding Odoo commercial record (order/quotation/subscription). Same honest scope boundary as stripePaymentConfirmationRef -- no live Odoo integration exists. */
  odooCommercialRecordRef: string
  lockedAt: string
}

export interface CreateConversionLockInput {
  adaptation: ProspectAdaptation
  previewDeploymentVersionRef: string
  conversionInstructionRef: string
  stripePaymentConfirmationRef: string
  odooCommercialRecordRef: string
}

/**
 * Registry mirroring this repository's existing
 * FoundationReservationManager pattern: creates and tracks Conversion
 * Locks, and is the single authority other code (e.g. a future recycle
 * workflow) must consult before recycling a Foundation, per manual
 * §10.33/§10.45 ("conversion and recycling commands conflict" is an
 * explicit exception case the manual names).
 */
export class ConversionLockRegistry {
  private locksByAdaptationId = new Map<string, ConversionLock>()
  private counter = 0

  /**
   * Creates a Conversion Lock for the given adaptation's Foundation.
   * Requires `input.adaptation.status === 'published'` -- only a
   * published preview can be locked for conversion (throws
   * ConversionLockError otherwise, naming the actual status found).
   * Throws ConversionLockError if that Foundation already has an
   * active lock (from a DIFFERENT adaptation) -- one Foundation cannot
   * be simultaneously locked for two different conversions. If the
   * SAME adaptationId is locked again (a safe idempotent retry),
   * return the EXISTING lock unchanged rather than creating a
   * duplicate or throwing.
   */
  createLock(input: CreateConversionLockInput): ConversionLock {
    const { adaptation } = input

    const existingForAdaptation = this.locksByAdaptationId.get(adaptation.adaptationId)
    if (existingForAdaptation) {
      return existingForAdaptation
    }

    if (adaptation.status !== 'published') {
      throw new ConversionLockError(
        `Cannot create a Conversion Lock for Adaptation "${adaptation.adaptationId}": status is "${adaptation.status}", but only a "published" preview may be locked for conversion (manual §10.33).`,
      )
    }

    const existingForFoundation = this.getLockForFoundation(adaptation.foundationId)
    if (existingForFoundation) {
      throw new ConversionLockError(
        `Foundation "${adaptation.foundationId}" already has an active Conversion Lock ("${existingForFoundation.lockId}", Adaptation "${existingForFoundation.adaptationId}") -- one Foundation cannot be locked for two different conversions at once.`,
      )
    }

    const lock: ConversionLock = {
      schemaVersion: { major: 1, minor: 0 },
      lockId: `lock-${++this.counter}`,
      adaptationId: adaptation.adaptationId,
      foundationId: adaptation.foundationId,
      previewDeploymentVersionRef: input.previewDeploymentVersionRef,
      conversionInstructionRef: input.conversionInstructionRef,
      stripePaymentConfirmationRef: input.stripePaymentConfirmationRef,
      odooCommercialRecordRef: input.odooCommercialRecordRef,
      lockedAt: new Date().toISOString(),
    }
    this.locksByAdaptationId.set(adaptation.adaptationId, lock)
    return lock
  }

  /** Returns the active lock for a Foundation, or null if none exists. */
  getLockForFoundation(foundationId: string): ConversionLock | null {
    return Array.from(this.locksByAdaptationId.values()).find((lock) => lock.foundationId === foundationId) ?? null
  }

  /** Returns true if the given Foundation currently has any active Conversion Lock. */
  isLocked(foundationId: string): boolean {
    return this.getLockForFoundation(foundationId) !== null
  }

  /**
   * The recycle-blocking gate: throws ConversionLockError (naming the
   * foundationId and the locking adaptationId) if the given Foundation
   * is currently locked. A future recycle workflow (e.g. this
   * repository's existing archiveAndRecycleFoundation() in
   * prospectAdaptation.ts) is expected to call this BEFORE recycling,
   * though this Issue does not wire that call itself -- see this
   * Issue's ISSUE.md/PROOF.md open_gaps for why (that would mean
   * editing an already-merged file from a prior Issue, kept out of
   * scope here to avoid an unreviewed edit to shared code).
   */
  assertRecycleAllowed(foundationId: string): void {
    const lock = this.getLockForFoundation(foundationId)
    if (lock) {
      throw new ConversionLockError(
        `Foundation "${foundationId}" cannot be recycled: it is locked for conversion by Adaptation "${lock.adaptationId}" (Conversion Lock "${lock.lockId}", manual §10.33/§10.45).`,
      )
    }
  }
}

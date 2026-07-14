/**
 * Outcome Record (Phase 4, Issue phase4-outcome-record-001).
 *
 * Manual §10 §31: LiNKsites operates under an explicit separation of
 * authority -- Sales owns *commercial outcome* (the CRM-side result of
 * an opportunity), and LiNKsites owns *technical disposition* (what
 * happens to the Foundation/preview as a result). LiNKsites maps
 * Sales's outcome vocabulary to its own technical action vocabulary,
 * but does NOT redefine or own the CRM's outcome vocabulary itself
 * (manual doctrine point 9: "commercial outcome and technical
 * disposition are separate -- Sales decides opportunity outcome;
 * LiNKsites decides reusable asset disposition under authorized
 * outcome instruction").
 *
 * This file is the single, deterministic mapping from Sales outcome to
 * technical disposition, plus an `OutcomeRecord` type that always
 * derives its technical disposition FROM that mapping (never accepts
 * an arbitrary, inconsistent technical disposition from a caller).
 * This enforces the manual's separation-of-authority doctrine at the
 * type level: a caller can request/report a Sales outcome, but cannot
 * independently invent a mismatched technical disposition --
 * `createOutcomeRecord()` is the only exported way to construct an
 * `OutcomeRecord`, and it derives `technicalDisposition` itself.
 *
 * Honest scope boundaries:
 * - The manual §10.31 names both the Sales outcome vocabulary and the
 *   LiNKsites technical disposition vocabulary, but does not print a
 *   literal lookup table connecting every single pair. The mapping in
 *   `mapSalesOutcomeToTechnicalDisposition()` is this repository's own
 *   reasonable, defensible interpretation of the manual's two named
 *   vocabularies against each other -- it should be reviewed against
 *   real Sales/CRM practice before being treated as final policy. See
 *   PROOF.md `open_gaps`.
 * - `requiresConversionLock()` and `requiresRecycling()` are pure
 *   predicates only. This module does NOT wire the resulting technical
 *   disposition into any real downstream action -- it does not call
 *   `ConversionLockRegistry.createLock()` (conversionLock.ts) or
 *   `archiveAndRecycleFoundation()` (prospectAdaptation.ts) itself.
 *   That orchestration is separate, still-open future work, and doing
 *   it here would mean editing already-merged files from prior Issues
 *   outside this Issue's own scope.
 * - `salesAuthorityRef` is an opaque, unvalidated reference -- the same
 *   honest-scope boundary as other authority_ref fields elsewhere in
 *   this package (e.g. `conversionInstructionRef` in
 *   conversionLock.ts). No real Sales-authority validation system
 *   exists to check it against.
 */

import type { SchemaVersion } from '@linksites/types'

/** Manual §10.31's exact Sales-owned commercial outcome vocabulary -- LiNKsites does not redefine this. */
export type SalesOutcome =
  | 'engaged'
  | 'inactive'
  | 'follow_up_scheduled'
  | 'holding'
  | 'rejected'
  | 'lost_to_competitor'
  | 'not_currently_ready'
  | 'invalid_lead'
  | 'converted'
  | 'expired'
  | 'do_not_contact'

/** Manual §10.31's exact LiNKsites-owned technical disposition vocabulary. */
export type TechnicalDisposition =
  | 'keep_active'
  | 'extend_hold'
  | 'upgrade'
  | 'lock_for_conversion'
  | 'expire_deployment'
  | 'cleanse_and_recycle'
  | 'repair'
  | 'refresh'
  | 'deprecate_or_retire'
  | 'preserve_evidence_and_remove_active_serving'

export class OutcomeRecordError extends Error {}

/**
 * The single, deterministic mapping from Sales outcome to technical
 * disposition (manual §10.31). This is the ONE place this mapping is
 * defined -- do not duplicate this logic anywhere else. Use this exact
 * mapping (a reasonable, defensible interpretation of the manual's own
 * outcome list against its own disposition list, since the manual
 * names both vocabularies but does not print a literal lookup table
 * connecting every single pair -- document this honestly):
 *
 * - 'engaged' -> 'keep_active' (still an active, healthy opportunity)
 * - 'inactive' -> 'extend_hold' (not dead, but not currently progressing -- hold rather than recycle immediately)
 * - 'follow_up_scheduled' -> 'keep_active' (still an active, scheduled opportunity)
 * - 'holding' -> 'extend_hold' (explicitly a hold state)
 * - 'rejected' -> 'cleanse_and_recycle' (a real negative outcome -- eligible for recycling per manual §10.34)
 * - 'lost_to_competitor' -> 'cleanse_and_recycle' (same rationale)
 * - 'not_currently_ready' -> 'extend_hold' (not a rejection, just a timing issue)
 * - 'invalid_lead' -> 'preserve_evidence_and_remove_active_serving' (the opportunity itself was never valid -- preserve evidence for audit, but don't keep serving a preview to it)
 * - 'converted' -> 'lock_for_conversion' (manual §10.33's explicit conversion-lock trigger)
 * - 'expired' -> 'cleanse_and_recycle' (expiration policy per manual §10.34)
 * - 'do_not_contact' -> 'preserve_evidence_and_remove_active_serving' (compliance-sensitive -- stop serving, keep an audit trail, do not recycle into active circulation without a separate deliberate step)
 */
export function mapSalesOutcomeToTechnicalDisposition(outcome: SalesOutcome): TechnicalDisposition {
  switch (outcome) {
    case 'engaged':
      return 'keep_active'
    case 'inactive':
      return 'extend_hold'
    case 'follow_up_scheduled':
      return 'keep_active'
    case 'holding':
      return 'extend_hold'
    case 'rejected':
      return 'cleanse_and_recycle'
    case 'lost_to_competitor':
      return 'cleanse_and_recycle'
    case 'not_currently_ready':
      return 'extend_hold'
    case 'invalid_lead':
      return 'preserve_evidence_and_remove_active_serving'
    case 'converted':
      return 'lock_for_conversion'
    case 'expired':
      return 'cleanse_and_recycle'
    case 'do_not_contact':
      return 'preserve_evidence_and_remove_active_serving'
  }
}

export interface OutcomeRecord {
  schemaVersion: SchemaVersion
  outcomeRecordId: string
  /** Opaque ref to the preview/adaptation this outcome concerns -- kept as a plain string rather than importing ProspectAdaptation directly, so this module stays decoupled. */
  adaptationId: string
  salesOutcome: SalesOutcome
  /** ALWAYS derived via mapSalesOutcomeToTechnicalDisposition() -- never independently caller-supplied (enforced by createOutcomeRecord() below, which is the only way to construct one). */
  technicalDisposition: TechnicalDisposition
  /** Opaque ref to the Sales authority/instruction that reported this outcome (same honest-scope boundary as other authority_ref fields elsewhere in this package -- no real Sales-authority validation system exists to check against). */
  salesAuthorityRef: string
  decidedAt: string
}

/**
 * The ONLY constructor for an OutcomeRecord -- derives
 * technicalDisposition itself via mapSalesOutcomeToTechnicalDisposition(),
 * so a caller cannot create an internally-inconsistent record (e.g. a
 * 'converted' outcome paired with a 'cleanse_and_recycle' disposition).
 */
export function createOutcomeRecord(adaptationId: string, salesOutcome: SalesOutcome, salesAuthorityRef: string): OutcomeRecord {
  return {
    schemaVersion: { major: 1, minor: 0 },
    outcomeRecordId: crypto.randomUUID(),
    adaptationId,
    salesOutcome,
    technicalDisposition: mapSalesOutcomeToTechnicalDisposition(salesOutcome),
    salesAuthorityRef,
    decidedAt: new Date().toISOString(),
  }
}

/**
 * Convenience predicate: true iff the given outcome record's technical
 * disposition is 'lock_for_conversion' -- the manual §10.33 trigger
 * for creating a Conversion Lock. Does NOT itself create a lock or
 * call into conversionLock.ts (that wiring is separate, still-open
 * future work) -- this is purely a readable boolean check a future
 * orchestrator could use.
 */
export function requiresConversionLock(record: OutcomeRecord): boolean {
  return record.technicalDisposition === 'lock_for_conversion'
}

/**
 * Convenience predicate: true iff the given outcome record's technical
 * disposition is 'cleanse_and_recycle' -- the manual §10.34 trigger for
 * the recycling pipeline. Does NOT itself call archiveAndRecycleFoundation()
 * or any other recycling code (that wiring is separate, still-open
 * future work) -- this is purely a readable boolean check.
 */
export function requiresRecycling(record: OutcomeRecord): boolean {
  return record.technicalDisposition === 'cleanse_and_recycle'
}

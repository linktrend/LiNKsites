/**
 * Proof Level engine (Phase 4, Issue phase4-proof-level-001).
 *
 * Per the LiNKsites Program Manual §10 ("Preview Inventory and
 * Build-First Sell-Later Production Model") and §09: Proof Level is a
 * dimension SEPARATE from paid tier -- Levels 0-4, where "proof is a
 * website" (manual §10.8). Level 0 is research-only, with no prebuild
 * obligation. Levels 1-4 must produce a visible, personalized website
 * -- never a written report as a substitute -- with escalating
 * investment, personalization, and coverage as the level increases. A
 * Level 1 preview can demonstrate Premium-tier VALUE without
 * prebuilding full Premium entitlement; proof level and paid tier are
 * deliberately never collapsed into one dimension.
 *
 * Every Preview Production Request must carry proof-level + budget
 * authority delegated FROM Sales (manual §10.2.4, §09.37): LiNKsites
 * validates that authority (budget arithmetic), it does not create
 * commercial authority itself. Escalating from one level to another
 * requires NEW authority and must preserve the prior level's history
 * rather than overwrite it (manual §10.30) -- an upgrade produces a
 * new versioned object, never destroys the old one.
 *
 * IMPORTANT -- what this file does NOT decide: the manual explicitly
 * leaves exact dollar budgets, page counts, and per-level feature
 * allowlists as open policy (manual §10.48). `maxAuthorizedInvestmentUsd`
 * and any other numeric values used anywhere in this module (including
 * in its tests) are structural PROVISIONAL placeholders illustrating
 * the *shape* of a Proof Specification and exercising the budget-check
 * engine -- they are not real commercial commitments, following this
 * repo's existing convention (see `tierSpecification.ts`'s own
 * provisional-value doc comments).
 *
 * `proofBlockId` is a field this module's exact interface contract
 * left as a deliberate gap (no stable identity field was specified for
 * `ProofBlock`, yet `supersededBy` needs something real to reference).
 * It is added here, generated in `createProofBlock()` via
 * `crypto.randomUUID()`, so that `escalateProofBlock()` can set the
 * prior block's `supersededBy` to the new block's own `proofBlockId`
 * rather than an arbitrary/unverifiable string.
 */

import type { SchemaVersion } from '@linksites/types'

/** Manual §10.8: Level 0 = research only, no prebuild obligation. Levels 1-4 = must produce a visible, personalized website (never a report substitute). */
export type ProofLevel = 0 | 1 | 2 | 3 | 4

/** Levels that require an actual prebuilt preview (Site Specification's own `proof.level` field is scoped to exactly this range per the manual). */
export type PrebuildProofLevel = 1 | 2 | 3 | 4

export type ProofSpecificationStatus = 'draft' | 'active' | 'deprecated' | 'retired'

export interface ProofSpecification {
  schemaVersion: SchemaVersion
  level: ProofLevel
  version: string
  status: ProofSpecificationStatus
  /** PROVISIONAL placeholder -- manual §10.48 explicitly leaves exact budgets open policy. */
  maxAuthorizedInvestmentUsd: number
  /** One-line description of the personalization/coverage expectation at this level (manual §10.8's per-level intent -- NOT a page-count/feature commitment). */
  scopeSummary: string
}

export class ProofLevelError extends Error {}

/** Manual §10.2's rule: only an `active` Proof Specification may govern real preview production. */
export function assertProofSpecificationIsProductionReady(spec: ProofSpecification): void {
  if (spec.status !== 'active') {
    throw new ProofLevelError(
      `Proof Specification for level ${spec.level} (version ${spec.version}) is '${spec.status}', not 'active' -- only an active specification may govern real preview production (manual §10.2).`,
    )
  }
}

export interface InvestmentAuthorization {
  budgetClass: string
  maximumCostUsd: number
  authorityRef: string
}

export type BudgetCheckDisposition = 'allowed' | 'exceeds_authorized_budget' | 'exceeds_specification_ceiling'

export interface BudgetCheckResult {
  disposition: BudgetCheckDisposition
  reason: string
}

/**
 * Manual §10.2.4 ("proof investment follows authority... agents cannot
 * raise proof level or exceed budget") and §09.37 ("executor stops at
 * definition of done or requests new authority -- cannot improve
 * indefinitely"): checks a requested cost against BOTH the specific
 * authorization's own ceiling AND the Proof Specification's own
 * ceiling for that level, returning a disposition (never a bare
 * boolean), mirroring tierSpecification.ts's checkEntitlement()
 * pattern. Requires the spec to be production-ready first (delegates
 * to assertProofSpecificationIsProductionReady(), not duplicated).
 */
export function checkInvestmentAgainstBudget(
  spec: ProofSpecification,
  authorization: InvestmentAuthorization,
  requestedCostUsd: number,
): BudgetCheckResult {
  assertProofSpecificationIsProductionReady(spec)

  if (requestedCostUsd > authorization.maximumCostUsd) {
    return {
      disposition: 'exceeds_authorized_budget',
      reason: `Requested cost $${requestedCostUsd} exceeds the delegated authorization's own ceiling of $${authorization.maximumCostUsd} (authorityRef: ${authorization.authorityRef}).`,
    }
  }

  if (requestedCostUsd > spec.maxAuthorizedInvestmentUsd) {
    return {
      disposition: 'exceeds_specification_ceiling',
      reason: `Requested cost $${requestedCostUsd} exceeds the Proof Specification's own ceiling of $${spec.maxAuthorizedInvestmentUsd} for level ${spec.level} (version ${spec.version}).`,
    }
  }

  return {
    disposition: 'allowed',
    reason: `Requested cost $${requestedCostUsd} is within both the authorization's ceiling ($${authorization.maximumCostUsd}) and the specification's ceiling ($${spec.maxAuthorizedInvestmentUsd}).`,
  }
}

export interface ProofBlock {
  schemaVersion: SchemaVersion
  /**
   * Stable identity for this ProofBlock. Not part of the exact
   * interface contract given for this module -- added here to fill a
   * deliberate gap (see module-level doc comment) so that
   * `supersededBy` can reference a real, generated id rather than an
   * arbitrary string.
   */
  proofBlockId: string
  /** Links this Proof Block to whichever Site Specification / Preview Production Request it governs -- kept as an opaque ref rather than importing SiteSpecification directly, so this module stays decoupled. */
  siteSpecId: string
  level: PrebuildProofLevel
  specificationVersion: string
  authorization: InvestmentAuthorization
  /** True once this ProofBlock has been superseded by a later escalation -- an upgrade creates a NEW ProofBlock and marks the prior one superseded, it never mutates/deletes the prior one (manual §10.30: "must not overwrite prior level history"). */
  supersededBy: string | null
  createdAt: string
}

function assertIsPrebuildProofLevel(level: ProofLevel): asserts level is PrebuildProofLevel {
  if (level === 0) {
    throw new ProofLevelError('Level 0 is research-only with no prebuild obligation (manual §10.8) -- no ProofBlock exists for a level-0 Proof Specification.')
  }
}

/** Creates the FIRST ProofBlock for a Site Specification at a given level -- validates the investment against the spec/authorization via checkInvestmentAgainstBudget(), throwing ProofLevelError if the disposition is not 'allowed'. */
export function createProofBlock(
  siteSpecId: string,
  spec: ProofSpecification,
  authorization: InvestmentAuthorization,
  requestedCostUsd: number,
): ProofBlock {
  const budgetResult = checkInvestmentAgainstBudget(spec, authorization, requestedCostUsd)
  if (budgetResult.disposition !== 'allowed') {
    throw new ProofLevelError(budgetResult.reason)
  }

  assertIsPrebuildProofLevel(spec.level)

  return {
    schemaVersion: spec.schemaVersion,
    proofBlockId: crypto.randomUUID(),
    siteSpecId,
    level: spec.level,
    specificationVersion: spec.version,
    authorization,
    supersededBy: null,
    createdAt: new Date().toISOString(),
  }
}

/**
 * Escalates an EXISTING ProofBlock to a new, higher level: validates
 * the new level is strictly greater than the current block's level
 * (manual doctrine: proof levels escalate, this function is not for
 * downgrading), validates the new investment against the new spec via
 * createProofBlock()'s own checks (delegate, do not duplicate), marks
 * the prior block's `supersededBy` with the new block's own
 * `proofBlockId`, and returns { previous, next } so the caller can see
 * BOTH -- the prior block's history is preserved (returned), never
 * discarded (manual §10.30).
 */
export function escalateProofBlock(
  previous: ProofBlock,
  newSpec: ProofSpecification,
  newAuthorization: InvestmentAuthorization,
  requestedCostUsd: number,
): { previous: ProofBlock; next: ProofBlock } {
  if (newSpec.level <= previous.level) {
    throw new ProofLevelError(
      `Cannot escalate ProofBlock ${previous.proofBlockId} from level ${previous.level} to level ${newSpec.level} -- escalation requires a strictly higher level (manual §10.30).`,
    )
  }

  const next = createProofBlock(previous.siteSpecId, newSpec, newAuthorization, requestedCostUsd)

  return {
    previous: { ...previous, supersededBy: next.proofBlockId },
    next,
  }
}

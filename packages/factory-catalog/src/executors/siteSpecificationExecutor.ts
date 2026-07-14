/**
 * Site Specification Executor (Phase 2/3 integration, Issue
 * phase3-ledger-executor-integration-001).
 *
 * This closes a gap explicitly named in audit/14_implementation_roadmap.md's
 * Phase 2 status: "A real executor actually calling this ledger to do
 * LiNKsites work ... the ledger core is proven correct in isolation; it
 * has not yet been connected to anything that does real work." It also
 * connects Phase 2 (Program Ledger) to Phase 3 (the reusable-asset
 * factory) for the first time: this is a real `ExecutorAdapter`
 * (`@linksites/program-ledger`) that, when dispatched through the
 * Ledger, actually calls `resolveSiteSpecification()` against real
 * catalog data and returns its result as the Run's output -- not a
 * synthetic echo.
 *
 * Design note on Issue.input: per the Program Ledger's own contract,
 * `Issue.input` must be JSON-serializable (it is digested for
 * idempotency). The Kit/Tier/Foundation/Design Profile/Component
 * Registry objects this executor needs are NOT serialized into the
 * Issue -- the Issue only carries business identifiers (siteSpecId,
 * siteRef, kitId, tierId, foundationId, selectedComponentIds,
 * pageCount). The executor resolves those identifiers against its own
 * injected catalog data sources, exactly as a real executor eventually
 * would resolve them against Supabase-backed tables rather than
 * in-memory maps. Swapping the in-memory `SiteSpecificationExecutorDeps`
 * for a real persistence-backed lookup is the natural next step once
 * live infrastructure is available (see GAP-50).
 */

import type { ExecutorAdapter, ExecutorResult } from '@linksites/program-ledger'
import type { Issue, Run } from '@linksites/program-ledger'
import { resolveSiteSpecification, SiteSpecificationError } from '../siteSpecification.js'
import { VerticalKitError, type VerticalKit } from '../verticalKit.js'
import type { TierId, TierSpecification } from '../tierSpecification.js'
import { FoundationError, type ReusableSiteFoundation } from '../reusableFoundation.js'
import type { SiteDesignProfile } from '../designCatalog.js'
import { ComponentRegistryError, type ComponentRegistry } from '../componentRegistry.js'

export const SITE_SPECIFICATION_ISSUE_TYPE = 'linksites.factory.resolve_site_specification'

export interface SiteSpecificationExecutorDeps {
  kits: Record<string, VerticalKit>
  tiers: Record<TierId, TierSpecification>
  foundations: Record<string, ReusableSiteFoundation>
  designProfilesBySiteRef: Record<string, SiteDesignProfile>
  componentRegistry: ComponentRegistry
}

export interface SiteSpecificationExecutorInput {
  siteSpecId: string
  siteRef: string
  kitId: string
  tierId: TierId
  foundationId: string
  selectedComponentIds: string[]
  pageCount: number
}

function isValidInput(input: Record<string, unknown>): input is SiteSpecificationExecutorInput & Record<string, unknown> {
  return (
    typeof input.siteSpecId === 'string' &&
    typeof input.siteRef === 'string' &&
    typeof input.kitId === 'string' &&
    typeof input.tierId === 'string' &&
    typeof input.foundationId === 'string' &&
    Array.isArray(input.selectedComponentIds) &&
    typeof input.pageCount === 'number'
  )
}

/**
 * The known, expected failure modes from `resolveSiteSpecification()`
 * and its dependencies are all classified `invalid_input` (manual §20
 * §67's failure taxonomy) -- they represent a caller requesting an
 * inconsistent combination of real objects, not a code defect or
 * infrastructure problem. Anything else (e.g. a genuine bug) is
 * re-thrown so `runIssueOnce()`'s caller sees an unexpected error
 * rather than a silently-misclassified one.
 */
function isKnownValidationError(error: unknown): error is Error {
  return (
    error instanceof SiteSpecificationError ||
    error instanceof VerticalKitError ||
    error instanceof FoundationError ||
    error instanceof ComponentRegistryError
  )
}

export class SiteSpecificationExecutor implements ExecutorAdapter {
  readonly executorId = 'linksites-site-specification-executor'

  constructor(private readonly deps: SiteSpecificationExecutorDeps) {}

  canHandle(issueType: string): boolean {
    return issueType === SITE_SPECIFICATION_ISSUE_TYPE
  }

  async execute(issue: Issue, _run: Run): Promise<ExecutorResult> {
    if (!isValidInput(issue.input)) {
      return { kind: 'failure', failureClass: 'invalid_input', message: 'Issue input is missing one or more required fields for site specification resolution.' }
    }

    const kit = this.deps.kits[issue.input.kitId]
    const tier = this.deps.tiers[issue.input.tierId as TierId]
    const foundation = this.deps.foundations[issue.input.foundationId]
    const designProfile = this.deps.designProfilesBySiteRef[issue.input.siteRef]

    if (!kit) return { kind: 'failure', failureClass: 'invalid_input', message: `No Vertical Kit registered for kitId "${issue.input.kitId}".` }
    if (!tier) return { kind: 'failure', failureClass: 'invalid_input', message: `No Tier Specification registered for tierId "${issue.input.tierId}".` }
    if (!foundation) return { kind: 'failure', failureClass: 'invalid_input', message: `No Reusable Site Foundation registered for foundationId "${issue.input.foundationId}".` }
    if (!designProfile) return { kind: 'failure', failureClass: 'invalid_input', message: `No Design Profile has been resolved for siteRef "${issue.input.siteRef}".` }

    try {
      const spec = resolveSiteSpecification({
        siteSpecId: issue.input.siteSpecId,
        siteRef: issue.input.siteRef,
        kit,
        tier,
        foundation,
        designProfile,
        componentRegistry: this.deps.componentRegistry,
        selectedComponentIds: issue.input.selectedComponentIds,
        pageCount: issue.input.pageCount,
      })
      return { kind: 'success', output: spec }
    } catch (error) {
      if (isKnownValidationError(error)) {
        return { kind: 'failure', failureClass: 'invalid_input', message: error.message }
      }
      throw error
    }
  }
}

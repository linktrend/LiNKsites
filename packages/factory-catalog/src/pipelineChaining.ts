/**
 * Pipeline Chaining Helpers (Phase 3, Issue phase3-pipeline-chaining-001).
 *
 * `execution/modules/phase3-reusable-asset-factory/MODULE.md` and
 * `audit/14_implementation_roadmap.md` both name an open gap:
 * "Automatic pipeline chaining (Site Specification -> Site Assembly ->
 * Promotion as one flow) -- each remains an independently dispatchable
 * Issue type for now."
 *
 * IMPORTANT -- what this module deliberately does NOT do: it is NOT a
 * fully autonomous, auto-triggering pipeline. It does not decide WHEN
 * to advance from one stage to the next -- that decision is a distinct
 * Gate-acceptance authority (manual doctrine) that these functions
 * never touch. It also does not fabricate the two pieces of real
 * content each next stage genuinely needs: a `pagePlan` (the manual's
 * "resolved information architecture," §09, which has no automated
 * resolver in this repository yet) or a `WorkingPackage` (real
 * prospect/customer content items, which come from a content-
 * production pipeline this repository has no access to). Manufacturing
 * fake versions of either would be dishonest filler, not real
 * engineering progress -- see siteAssemblyManifest.ts's own `PagePlanEntry`
 * doc comment and promotionService.ts's module doc comment for the same
 * boundary stated at the object level.
 *
 * What this module DOES do, honestly and usefully: given one stage's
 * already-accepted output plus the caller-supplied real data the next
 * stage additionally needs, it builds that next stage's Issue input
 * with every identifier-propagation field (siteSpecId, siteId, kitId,
 * manifestId, assemblyManifestId, targetSiteId, etc.) copied correctly
 * and validated for basic sanity -- eliminating an entire class of
 * "typo'd or omitted an ID field when hand-building the next stage's
 * input" bugs, and giving future orchestration code (once a real IA
 * resolver and content pipeline exist) one obvious, tested place to
 * plug into.
 *
 * These are pure mapping/validation functions: no side effects, no
 * ledger interaction, no dispatch of the next Issue. Wiring them into
 * an actual "on Gate acceptance, dispatch the next Issue" orchestrator
 * is separate, still-open future work.
 */

import type { SiteSpecification } from './siteSpecification.js'
import type { SiteAssemblyExecutorInput } from './executors/siteAssemblyExecutor.js'
import type { PagePlanEntry, SiteAssemblyManifest, SiteClass } from './siteAssemblyManifest.js'
import type { PromotionRequest, WorkingPackage } from './promotionService.js'
import type { SchemaVersion } from '@linksites/types'

export class PipelineChainingError extends Error {}

export interface BuildSiteAssemblyInputExtras {
  manifestId: string
  manifestVersion: number
  siteClass: SiteClass
  platformReleaseRef: string
  /** Caller-supplied real page/component plan -- this function does NOT invent one (no automated information-architecture resolver exists yet, manual §09). */
  pagePlan: PagePlanEntry[]
  adaptationId?: string
}

/**
 * Maps an accepted Site Specification's output into the exact
 * SiteAssemblyExecutorInput shape the SiteAssemblyExecutor expects,
 * propagating siteSpecId/siteRef->siteId/kitId correctly so a caller
 * never has to hand-copy these fields (and risk a typo or omission).
 * Throws PipelineChainingError if `extras.pagePlan` is empty -- a Site
 * Assembly request with zero pages is a meaningless request that
 * should be caught immediately here, with a clear message, rather than
 * deferred to a less specific failure deep inside the executor.
 */
export function buildSiteAssemblyInputFromSiteSpecification(
  spec: SiteSpecification,
  extras: BuildSiteAssemblyInputExtras,
): SiteAssemblyExecutorInput {
  if (extras.pagePlan.length === 0) {
    throw new PipelineChainingError(
      `Cannot build a Site Assembly input for Site Specification "${spec.siteSpecId}" with an empty pagePlan -- a Site Assembly request with zero pages is meaningless.`,
    )
  }

  return {
    manifestId: extras.manifestId,
    manifestVersion: extras.manifestVersion,
    siteId: spec.siteRef,
    siteClass: extras.siteClass,
    siteSpecId: spec.siteSpecId,
    adaptationId: extras.adaptationId,
    kitId: spec.kitId,
    platformReleaseRef: extras.platformReleaseRef,
    pagePlan: extras.pagePlan,
  }
}

export interface BuildPromotionRequestExtras {
  promotionRequestId: string
  idempotencyKey: string
  /** Caller-supplied real working package (content items to promote) -- this function does NOT invent content (no content-production pipeline exists yet, manual §12/§09). */
  workingPackage: WorkingPackage
  requiredGateReceiptIds?: string[]
}

/**
 * Maps an accepted Site Assembly Manifest's output into the exact
 * PromotionRequest shape the PromotionExecutor expects, propagating
 * manifest.siteId->targetSiteId and manifest.manifestId->assemblyManifestId
 * correctly. targetState is always the literal 'draft' (promotion never
 * targets published, per manual §12's own layering doctrine -- this is
 * not a caller-configurable value). Throws PipelineChainingError if
 * `extras.workingPackage.items` is empty -- a promotion request with no
 * items to promote is meaningless and should be caught here with a
 * clear message.
 */
export function buildPromotionRequestFromManifest(
  manifest: SiteAssemblyManifest,
  extras: BuildPromotionRequestExtras,
): PromotionRequest {
  if (extras.workingPackage.items.length === 0) {
    throw new PipelineChainingError(
      `Cannot build a Promotion Request for Site Assembly Manifest "${manifest.manifestId}" with an empty workingPackage.items -- a promotion request with no items to promote is meaningless.`,
    )
  }

  const schemaVersion: SchemaVersion = manifest.schemaVersion

  return {
    schemaVersion,
    promotionRequestId: extras.promotionRequestId,
    idempotencyKey: extras.idempotencyKey,
    targetSiteId: manifest.siteId,
    targetState: 'draft',
    workingPackage: extras.workingPackage,
    assemblyManifestId: manifest.manifestId,
    requiredGateReceiptIds: extras.requiredGateReceiptIds ?? [],
  }
}

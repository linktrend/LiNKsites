/**
 * Site Assembly Manifest (Phase 3, Issue phase3-site-assembly-manifest-001).
 *
 * Manual §07 ("Component Registry, Frontend Structure, and Deterministic
 * Assembly"): a Site Assembly Manifest is a versioned, reconstructable
 * description of what a site's frontend should render -- an ordered
 * list of pages, each composed of specific Component Registry
 * instances bound to content references. It is the deterministic
 * resolution step that turns a Site Specification (already resolved
 * in siteSpecification.ts) plus an optional Prospect Adaptation
 * (prospectAdaptation.ts) into that concrete page/section plan.
 *
 * Manual §07.14 (determinism): the same accepted inputs, pinned
 * versions, and declared environment must produce the same route map,
 * component selections/order, variants, and resolved design profile
 * and content-release references. This function contains no
 * randomness and no current-time-dependent branching that affects
 * `pages` -- the only wall-clock value produced (`resolvedAt`) is
 * informational and never fed back into page/section construction.
 *
 * Manual §07.13 (no content duplication): sections carry an opaque
 * `contentRef` pointer, never inlined prose/media -- mirroring how
 * `ProspectAdaptation.prospectContent` is deliberately kept separate
 * from this manifest rather than copied into it.
 *
 * Manual §07.16 (tier-eligible, active components only): enforced by
 * delegating to `ComponentRegistry.assertComponentAvailableForTier()`
 * (componentRegistry.ts), not re-implemented here.
 *
 * IMPORTANT -- what this does NOT decide: the manual's real "resolved
 * information architecture" concept (§09) -- i.e. which routes/page
 * types a site should have and which components belong on each page
 * -- has no automated resolver in this repository yet. This function
 * accepts that plan as caller-supplied input (`pagePlan`) rather than
 * inventing page/route logic; see `PagePlanEntry` below and the
 * associated ISSUE.md/PROOF.md `open_gaps` for the honest accounting
 * of that boundary. Likewise, `contentRef` values are opaque strings
 * only -- there is no Promotion Service / Payload draft integration
 * wired to this manifest yet, so a `contentRef` cannot currently be
 * resolved against any real content store.
 */

import type { SchemaVersion } from '@linksites/types'
import type { SiteSpecification } from './siteSpecification.js'
import type { ProspectAdaptation } from './prospectAdaptation.js'
import { assertKitIsProductionReady, type VerticalKit } from './verticalKit.js'
import type { ComponentRegistry } from './componentRegistry.js'
import { TIER_SPECIFICATIONS } from './tierSpecification.js'

export type SiteClass = 'foundation' | 'preview' | 'customer'

export interface SiteAssemblySection {
  instanceId: string
  componentId: string
  componentVersion: string
  variant?: string
  contentRef: string
  configurationRef?: string
}

export interface SiteAssemblyPage {
  route: string
  pageType: string
  sections: SiteAssemblySection[]
}

export interface SiteAssemblyLineage {
  foundationId?: string
  priorManifestId?: string
}

export interface SiteAssemblyManifest {
  schemaVersion: SchemaVersion
  manifestId: string
  manifestVersion: number
  siteId: string
  siteClass: SiteClass
  kitId: string
  tierId: string
  platformReleaseRef: string
  designProfileRef: string
  contentReleaseRef: string
  pages: SiteAssemblyPage[]
  lineage: SiteAssemblyLineage
  resolvedAt: string
}

export class SiteAssemblyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SiteAssemblyError'
  }
}

/** One page's deterministic composition plan: which components, in which order, for which route/page type. This stands in for the manual's "resolved information architecture" (Section 09), which has no real resolver yet -- it is supplied by the caller here rather than invented by this function. */
export interface PagePlanEntry {
  route: string
  pageType: string
  /** Component IDs in the exact order they should appear as sections on this page. */
  componentIds: string[]
}

export interface AssembleSiteManifestInput {
  manifestId: string
  manifestVersion: number
  siteId: string
  siteClass: SiteClass
  siteSpec: SiteSpecification
  /** Optional: required for 'preview'/'customer' site classes if the manifest needs prospect-specific content; omit for a 'foundation'-class manifest, which should reference neutral/placeholder content refs instead. */
  adaptation?: ProspectAdaptation
  kit: VerticalKit
  componentRegistry: ComponentRegistry
  platformReleaseRef: string
  pagePlan: PagePlanEntry[]
  lineage?: SiteAssemblyLineage
}

/**
 * Deterministically resolves a Site Assembly Manifest. Enforces, in
 * order:
 *
 * 1. The Vertical Kit must be production-ready (delegates to
 *    `assertKitIsProductionReady()`, not re-implemented here).
 * 2. `siteSpec.kitId` must match `kit.kitId`, and `siteSpec.siteRef`
 *    must match `input.siteId`.
 * 3. If an Adaptation is supplied, `adaptation.siteSpecId` must match
 *    `siteSpec.siteSpecId` -- otherwise assembly is rejected to
 *    prevent prospect/customer manifest cross-contamination.
 * 4. Every componentId in every `pagePlan` entry must be available
 *    for the Site Specification's tier (delegates to
 *    `ComponentRegistry.assertComponentAvailableForTier()` against
 *    the resolved `TierSpecification` looked up from the provisional
 *    `TIER_SPECIFICATIONS` registry, mirroring the same pattern used
 *    in `executors/siteSpecificationExecutor.ts`).
 *
 * Then builds one `SiteAssemblyPage` per `pagePlan` entry, with
 * deterministic `instanceId`s (`${route}:${componentId}:${index}`)
 * and `contentRef`s that vary only by whether an Adaptation was
 * supplied (never by wall-clock time or randomness), so identical
 * inputs always produce byte-identical `pages`.
 */
export function assembleSiteManifest(input: AssembleSiteManifestInput): SiteAssemblyManifest {
  const { manifestId, manifestVersion, siteId, siteClass, siteSpec, adaptation, kit, componentRegistry, platformReleaseRef, pagePlan, lineage } = input

  assertKitIsProductionReady(kit)

  if (siteSpec.kitId !== kit.kitId) {
    throw new SiteAssemblyError(`Site Specification "${siteSpec.siteSpecId}" was resolved for Kit "${siteSpec.kitId}", not "${kit.kitId}".`)
  }
  if (siteSpec.siteRef !== siteId) {
    throw new SiteAssemblyError(`Site Specification "${siteSpec.siteSpecId}" resolves for site "${siteSpec.siteRef}", not "${siteId}".`)
  }

  if (adaptation && adaptation.siteSpecId !== siteSpec.siteSpecId) {
    throw new SiteAssemblyError(
      `Prospect Adaptation "${adaptation.adaptationId}" was created for Site Specification "${adaptation.siteSpecId}", not "${siteSpec.siteSpecId}" -- refusing to assemble a cross-contaminated manifest.`,
    )
  }

  const tier = TIER_SPECIFICATIONS[siteSpec.tierId]

  const pages: SiteAssemblyPage[] = pagePlan.map((pageEntry) => {
    const sections: SiteAssemblySection[] = pageEntry.componentIds.map((componentId, index) => {
      componentRegistry.assertComponentAvailableForTier(componentId, tier)
      const component = componentRegistry.get(componentId)
      const contentRef = adaptation
        ? `adaptation:${adaptation.adaptationId}:${pageEntry.route}:${componentId}`
        : `foundation-neutral:${kit.kitId}:${pageEntry.route}:${componentId}`
      return {
        instanceId: `${pageEntry.route}:${componentId}:${index}`,
        componentId,
        componentVersion: `${component.schemaVersion.major}.${component.schemaVersion.minor}`,
        contentRef,
      }
    })
    return {
      route: pageEntry.route,
      pageType: pageEntry.pageType,
      sections,
    }
  })

  return {
    schemaVersion: { major: 1, minor: 0 },
    manifestId,
    manifestVersion,
    siteId,
    siteClass,
    kitId: kit.kitId,
    tierId: siteSpec.tierId,
    platformReleaseRef,
    designProfileRef: siteSpec.designProfileRef,
    contentReleaseRef: adaptation ? `adaptation:${adaptation.adaptationId}` : `foundation-neutral:${kit.kitId}`,
    pages,
    lineage: lineage ?? {},
    resolvedAt: new Date().toISOString(),
  }
}

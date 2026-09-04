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
import type { SiteSpecification } from './siteSpecification.ts'
import type { ProspectAdaptation } from './prospectAdaptation.ts'
import { assertKitIsProductionReady, classifyPageCost, type VerticalKit } from './verticalKit.ts'
import type { ComponentRegistry } from './componentRegistry.ts'
import { TIER_SPECIFICATIONS } from './tierSpecification.ts'
import { assertLibraryConsumptionEvidence, canonicalJsonChecksum, canonicalJsonStringify, type LibraryConsumption, type LibraryConsumptionReceipt } from './libraryConsumer.ts'
import { assertSiteAdoptionIdentities } from './adoptionIdentities.ts'
import { dispositionCreditsForPages, type CreditDispositionRecord } from './capabilityCredits.ts'

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
  /** Explicit selection marker; when present, trusted materialized consumption is mandatory. */
  libraryEntryId?: string
  /** Carried forward from the Site Specification as durable Library evidence. */
  libraryReceipt?: LibraryConsumptionReceipt
  /** Carried forward from the Site Specification as materialized provenance. */
  libraryConsumption?: LibraryConsumption
  /** LS-02 deterministic shell slots (header/nav/footer). */
  shellPlan?: SiteAssemblyShellPlan
  /** LS-02 ordered route activation/navigation plan. */
  routePlan?: SiteAssemblyRoutePlanEntry[]
  /** LS-02 content-schema plan keyed by route. */
  schemaPlan?: SiteAssemblySchemaPlanEntry[]
  /** LS-02 per-route capability-credit dispositions. */
  creditDispositions?: CreditDispositionRecord[]
  /** LS-02 stable digest over reconstructable assembly facts (never includes resolvedAt). */
  digest?: string
}

export interface SiteAssemblyShellPlan {
  headerSlot: 'site-header'
  footerSlot: 'site-footer'
  navigationRoutes: string[]
}

export interface SiteAssemblyRoutePlanEntry {
  route: string
  pageType: string
  activationAllowed: boolean
  includeInNavigation: boolean
}

export interface SiteAssemblySchemaPlanEntry {
  route: string
  pageType: string
  schemaRef: string
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

  const hasLibrarySelection = Boolean(siteSpec.libraryEntryId || siteSpec.libraryReceipt || siteSpec.libraryConsumption)
  if (hasLibrarySelection) {
    if (!siteSpec.libraryConsumption) throw new SiteAssemblyError('A library-backed Assembly Manifest requires intrinsic trusted LiNKlibraries consumption evidence; a receipt alone is insufficient.')
    assertLibraryConsumptionEvidence(siteSpec.libraryConsumption)
    const libraryEntryId = siteSpec.libraryEntryId ?? siteSpec.libraryConsumption.receipt.entryId
    if (libraryEntryId !== siteSpec.libraryConsumption.receipt.entryId || !siteSpec.libraryReceipt || canonicalJsonStringify(siteSpec.libraryReceipt) !== canonicalJsonStringify(siteSpec.libraryConsumption.receipt)) throw new SiteAssemblyError('A library-backed Assembly Manifest requires Site Specification provenance and receipt bound to the same consumption evidence.')
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

  const hasAdoption = Boolean(siteSpec.adoptionIdentities || siteSpec.capabilityPlanId || siteSpec.pageTypes || siteSpec.entitlementSnapshot)
  let ls02: Pick<SiteAssemblyManifest, 'shellPlan' | 'routePlan' | 'schemaPlan' | 'creditDispositions' | 'digest'> = {}
  if (hasAdoption) {
    if (!siteSpec.adoptionIdentities || !siteSpec.capabilityPlanId || !siteSpec.pageTypes || !siteSpec.entitlementSnapshot) {
      throw new SiteAssemblyError('LS-02 assembly requires Site Specification identities, capability plan, ordered page types, and immutable entitlement snapshot together.')
    }
    const identities = assertSiteAdoptionIdentities(siteSpec.adoptionIdentities)
    if (siteSpec.capabilityPlanId !== siteSpec.entitlementSnapshot.planId) {
      throw new SiteAssemblyError('LS-02 capability plan does not match the frozen entitlement snapshot.')
    }
    if (siteSpec.entitlementSnapshot.siteRef !== siteSpec.siteRef) {
      throw new SiteAssemblyError('LS-02 entitlement snapshot site identity does not match the Site Specification.')
    }
    if (pagePlan.length !== siteSpec.pageCount || pagePlan.length !== siteSpec.pageTypes.length) {
      throw new SiteAssemblyError('LS-02 page plan must contain exactly the adopted Site Specification page count.')
    }
    const routes = new Set<string>()
    for (const [index, page] of pagePlan.entries()) {
      if (!page.route.trim() || !page.pageType.trim()) throw new SiteAssemblyError('LS-02 assembly routes and page types must be non-empty.')
      if (routes.has(page.route)) throw new SiteAssemblyError(`LS-02 assembly rejected duplicate route "${page.route}".`)
      routes.add(page.route)
      if (page.pageType !== siteSpec.pageTypes[index]) {
        throw new SiteAssemblyError(`LS-02 page plan type "${page.pageType}" at index ${index} does not match adopted type "${siteSpec.pageTypes[index]}".`)
      }
    }
    const creditDispositions = dispositionCreditsForPages(siteSpec.entitlementSnapshot, pagePlan)
    const routePlan: SiteAssemblyRoutePlanEntry[] = creditDispositions.map((record) => ({
      route: record.route,
      pageType: record.pageType,
      activationAllowed: record.activationAllowed,
      includeInNavigation: record.includeInNavigation,
    }))
    const schemaPlan: SiteAssemblySchemaPlanEntry[] = pagePlan.map((page) => ({
      route: page.route,
      pageType: page.pageType,
      schemaRef: `schema:${identities.content}:${classifyPageCost(page.pageType)}:${page.route}`,
    }))
    const shellPlan: SiteAssemblyShellPlan = {
      headerSlot: 'site-header',
      footerSlot: 'site-footer',
      navigationRoutes: routePlan.filter((entry) => entry.includeInNavigation).map((entry) => entry.route),
    }
    const digest = canonicalJsonChecksum({
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
      adoptionIdentities: identities,
      capabilityPlanId: siteSpec.capabilityPlanId,
      entitlementSnapshot: siteSpec.entitlementSnapshot,
      shellPlan,
      routePlan,
      schemaPlan,
      creditDispositions,
    })
    ls02 = { shellPlan, routePlan, schemaPlan, creditDispositions, digest }
  }

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
    ...(siteSpec.libraryConsumption ? { libraryEntryId: siteSpec.libraryConsumption.receipt.entryId, libraryReceipt: siteSpec.libraryConsumption.receipt, libraryConsumption: siteSpec.libraryConsumption } : {}),
    ...ls02,
  }
}

/**
 * Site Specification (Phase 3, Issue phase3-site-specification-001).
 *
 * The per-site resolved contract: manual §08/§09 describe assembling one
 * real or prospective site from a Vertical Kit + Tier Specification +
 * Reusable Site Foundation + Design Profile + selected Components, all
 * pinned into one versioned record. This is the integration point that
 * ties together every Phase 3 object built so far in this session
 * (Vertical Kit, Tier Specification, Reusable Site Foundation, Design
 * Intelligence Catalog, Component Registry) -- it does not introduce a
 * sixth parallel object, it composes the five that already exist.
 *
 * `resolveSiteSpecification()` is the closest thing this repository has
 * today to the manual's "deterministic assembly produces valid sites
 * from versioned specifications" exit gate (manual §63) -- it is NOT
 * that full gate (there is still no real Site Assembly Engine that
 * turns this record into an actual rendered site, GAP-04), but it is a
 * real, enforced validation step: it will refuse to resolve a
 * specification that mixes an inactive Kit, a Foundation built for the
 * wrong Kit/tier, an over-tier page count, or a component the tier
 * doesn't permit -- rather than silently accepting an invalid
 * combination.
 */

import type { SchemaVersion } from '@linksites/types'
import { assertFoundationIsProductionReady, assertFoundationMatchesKitAndTier, type ReusableSiteFoundation } from './reusableFoundation.js'
import { assertKitIsProductionReady, resolveEffectiveMaxPages, type VerticalKit } from './verticalKit.js'
import { checkEntitlement, type TierId, type TierSpecification } from './tierSpecification.js'
import type { SiteDesignProfile } from './designCatalog.js'
import type { ComponentRegistry } from './componentRegistry.js'

export class SiteSpecificationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'SiteSpecificationError'
  }
}

export interface SiteSpecification {
  schemaVersion: SchemaVersion
  siteSpecId: string
  /** Opaque ref to the real or prospective site this specification resolves for (manual §09's Prospect Adaptation / eventual real site both point here). */
  siteRef: string
  kitId: string
  tierId: TierId
  foundationId: string
  designProfileRef: string
  selectedComponentIds: string[]
  pageCount: number
  effectiveMaxPages: number
  resolvedAt: string
}

export interface ResolveSiteSpecificationInput {
  siteSpecId: string
  siteRef: string
  kit: VerticalKit
  tier: TierSpecification
  foundation: ReusableSiteFoundation
  designProfile: SiteDesignProfile
  componentRegistry: ComponentRegistry
  selectedComponentIds: string[]
  pageCount: number
}

/**
 * Resolves one Site Specification, enforcing every cross-object
 * invariant this session's five Phase 3 objects define, in a fixed
 * order so failures are easy to diagnose:
 *
 * 1. Kit must be production-ready (active).
 * 2. Foundation must be production-ready (active) AND must match the
 *    requested Kit + tier (manual §08.28).
 * 3. Design Profile's styleId is trusted as already-validated (it can
 *    only have been produced by resolveSiteDesignProfile(), which
 *    itself enforces the accessibility-gated admission rule) -- this
 *    function does not re-validate the profile's style, only that a
 *    profile was actually supplied for this site.
 * 4. Every selected component must be available for this tier
 *    (delegates to ComponentRegistry.assertComponentAvailableForTier(),
 *    not duplicated).
 * 5. Requested page count must not exceed the Kit+Tier's effective max
 *    (manual §08.17 -- the more restrictive of Kit and Tier wins).
 */
export function resolveSiteSpecification(input: ResolveSiteSpecificationInput): SiteSpecification {
  const { siteSpecId, siteRef, kit, tier, foundation, designProfile, componentRegistry, selectedComponentIds, pageCount } = input

  assertKitIsProductionReady(kit)
  assertFoundationIsProductionReady(foundation)
  assertFoundationMatchesKitAndTier(foundation, kit.kitId, tier.tierId)

  if (designProfile.siteRef !== siteRef) {
    throw new SiteSpecificationError(
      `Design Profile was resolved for site "${designProfile.siteRef}", not "${siteRef}" -- cannot attach a mismatched Design Profile to this Site Specification.`,
    )
  }

  for (const componentId of selectedComponentIds) {
    componentRegistry.assertComponentAvailableForTier(componentId, tier)
  }

  const effectiveMaxPages = resolveEffectiveMaxPages(tier.dimensions.maxPages, kit, tier.tierId)
  const pageCountCheck = checkEntitlement(tier, { kind: 'page_count', requested: pageCount })
  if (pageCountCheck.disposition !== 'allowed' || pageCount > effectiveMaxPages) {
    throw new SiteSpecificationError(
      `Requested page count ${pageCount} exceeds the effective limit of ${effectiveMaxPages} for Kit "${kit.kitId}" + tier "${tier.tierId}" (${pageCountCheck.reason}).`,
    )
  }

  return {
    schemaVersion: { major: 1, minor: 0 },
    siteSpecId,
    siteRef,
    kitId: kit.kitId,
    tierId: tier.tierId,
    foundationId: foundation.foundationId,
    designProfileRef: designProfile.siteRef,
    selectedComponentIds,
    pageCount,
    effectiveMaxPages,
    resolvedAt: new Date().toISOString(),
  }
}

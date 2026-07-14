/**
 * Tier Specification (Phase 3, Issue phase3-tier-specification-001).
 *
 * Per the LiNKsites Program Manual §03 (Product, Customer Outcomes,
 * Tiers) and §08 (Vertical Kits, Tier Specifications, Reusable Site
 * Foundations): a Tier Specification is "a versioned, machine-readable
 * product contract defining site scope + managed-service obligations
 * per paid tier" (§08.14). The manual is explicit that Vertical Kit,
 * Tier Specification, and Reusable Site Foundation are three distinct
 * objects that must never be collapsed into one undocumented template
 * (§08.2), and that entitlement enforcement returns a disposition --
 * allowed / requires_upgrade / unsupported / exception_required -- not
 * a blanket yes/no (§08.16).
 *
 * IMPORTANT -- what this file does NOT decide: the manual explicitly
 * defers final tier names, exact page/feature limits, prices, revision
 * allowances, contract terms, and most other numeric/commercial details
 * as "decisions intentionally still open" (manual §03 closing list).
 *
 * UPDATE (2026-07-14): Carlos explicitly instructed that engineering
 * should not wait on final commercial/business decisions, and asked for
 * quick web research to ground these numbers in realistic small-business
 * website market norms rather than arbitrary placeholders, on the
 * explicit understanding that every value below remains trivially
 * changeable later (a one-line edit here, nothing structural) once real
 * pricing/scope decisions are made. The page-count and change-allowance
 * values below are grounded in 2026 small-business website package/
 * maintenance-plan market research (starter packages: ~5-8 pages;
 * business/growth packages: ~10-15 pages; maintenance plans: ~2-6
 * change requests/month at the lower tiers) -- see
 * `execution/modules/phase3-reusable-asset-factory/issues/phase3-business-defaults-001/ISSUE.md`
 * for the full research citations. `priceUsdPerMonthProvisional` on each
 * tier is similarly research-grounded (illustrative market-rate pricing
 * for a comparable bundled build+hosting+maintenance subscription), but
 * is explicitly marked as **illustrative only, not an approved price**
 * -- LiNKtrend's actual cost structure and margins were not researched
 * (this repository has no access to that), so the real price must still
 * come from Carlos. These remain structural placeholders illustrating
 * the *shape* of a Tier Specification and exercising the enforcement
 * engine -- they are not final commercial commitments and must not be
 * presented to a customer until Carlos confirms or adjusts them. Every
 * provisional numeric field is marked as such in its own comment.
 *
 * CMS access clarification (2026-07-14, per Carlos): `customerCmsAccess`
 * models ONLY the CUSTOMER-facing entitlement, never LiNKtrend's own
 * operational access. At initial launch, EVERY tier (including
 * Enterprise) is `'none'` -- no customer, of any tier, gets CMS login
 * access at launch. All content is managed by LiNKtrend staff (human or
 * agent) logging into the CMS, mostly through automation. This is a
 * deliberate, uniform launch default, not an oversight for the lower
 * tiers. `futureCmsAccessCandidate` records which tiers are the more
 * likely candidates to receive real customer CMS access in a FUTURE
 * release once that capability is designed and approved -- it does not
 * change any current behavior, it is a forward-looking data point only,
 * exactly as Carlos asked ("provide for the future but immediately on
 * launch clients will have no access to the CMS").
 */

import type { SchemaVersion } from '@linksites/types'

export type TierId = 'standard' | 'premium' | 'enterprise'

export type EntitlementDisposition = 'allowed' | 'requires_upgrade' | 'unsupported' | 'exception_required'

/**
 * The dimensions manual §03 §8 requires every Tier Specification to
 * cover: site structure, design, content, media, integrations,
 * localization, CMS access, hosting, reliability, maintenance, changes,
 * ownership/export, proof eligibility, quality, exceptions.
 */
export interface TierDimensions {
  /** PROVISIONAL placeholder value -- not a real commercial commitment. */
  maxPages: number
  /** Whether this tier permits Enterprise-style bespoke component/code variation (manual §03 §7.3). */
  allowsCustomComponentCode: boolean
  /** PROVISIONAL placeholder value. */
  maxAdditionalLocalizationLocales: number
  /** PROVISIONAL placeholder value -- integrations beyond the Vertical Kit's baseline set. */
  maxAdditionalIntegrations: number
  /** Whether this tier gets a dedicated frontend/CMS/DB runtime instead of the shared platform (manual §03 §7.3, Enterprise-only by default). */
  dedicatedRuntime: boolean
  /** PROVISIONAL placeholder value -- customer-initiated content/design changes allowed per period. */
  changeAllowancePerMonth: number
  /**
   * The CUSTOMER-facing CMS entitlement (manual §03 §8, "CMS access"
   * dimension) -- NOT LiNKtrend staff's own operational access, which
   * always exists regardless of tier and is not modeled here. At launch
   * this is `'none'` for every tier per Carlos's explicit instruction
   * (2026-07-14); see the module-level doc comment.
   */
  customerCmsAccess: 'none' | 'content_only' | 'full'
  /**
   * Forward-looking only (2026-07-14): whether this tier is a plausible
   * candidate to receive real customer CMS access in a FUTURE release.
   * Does not grant or change any current entitlement -- purely a
   * roadmap marker, per Carlos's instruction to "provide for the future"
   * without turning it on now.
   */
  futureCmsAccessCandidate: boolean
  /** Whether unique, non-catalog component coding is permitted in the base product (manual §03 §7.1: "no unique component coding in base product" for Standard). */
  permitsBaseProductCustomCode: boolean
}

export interface TierSpecification {
  schemaVersion: SchemaVersion
  tierId: TierId
  /** Provisional display name -- manual §03 explicitly defers final tier naming. */
  displayName: string
  status: 'draft' | 'active' | 'deprecated' | 'retired'
  dimensions: TierDimensions
  /**
   * Illustrative-only monthly price in USD for a comparable bundled
   * build+hosting+maintenance subscription, grounded in 2026 market
   * research (see module-level doc comment). NOT an approved price --
   * LiNKtrend's real cost structure/margins were not researched and
   * must come from Carlos. Deliberately optional so a tier can omit it
   * entirely once real pricing exists and this field is repurposed or
   * removed.
   */
  priceUsdPerMonthProvisional?: number
}

/**
 * A named capability an Issue/Site Specification/Prospect Adaptation may
 * request, checked against a Tier Specification's dimensions. This is
 * deliberately a small, illustrative set -- expand as real Vertical Kit
 * and Site Specification work in later Issues defines what capabilities
 * actually need entitlement checks.
 */
export type RequestableCapability =
  | { kind: 'page_count'; requested: number }
  | { kind: 'custom_component_code' }
  | { kind: 'additional_localization_locale'; requestedCount: number }
  | { kind: 'additional_integration'; requestedCount: number }
  | { kind: 'dedicated_runtime' }
  | { kind: 'base_product_custom_code' }

export interface EntitlementCheckResult {
  disposition: EntitlementDisposition
  reason: string
}

/**
 * The three provisional tiers per manual §03 §7. Numeric limits are
 * research-grounded PROVISIONAL defaults (Carlos-approved 2026-07-14 to
 * unblock engineering) -- see the module-level doc comment for sources
 * and for what remains a placeholder pending Carlos's final commercial
 * sign-off (pricing).
 */
export const TIER_SPECIFICATIONS: Record<TierId, TierSpecification> = {
  standard: {
    schemaVersion: { major: 1, minor: 0 },
    tierId: 'standard',
    displayName: 'Standard (provisional name)',
    status: 'active',
    dimensions: {
      maxPages: 6, // Research-grounded default: 2026 starter/small-business packages typically span 5-8 pages; 6 sits at the middle of that range.
      allowsCustomComponentCode: false,
      maxAdditionalLocalizationLocales: 0, // PROVISIONAL
      maxAdditionalIntegrations: 0, // PROVISIONAL
      dedicatedRuntime: false,
      changeAllowancePerMonth: 2, // Research-grounded default: comparable small-business maintenance plans in this price band typically include a handful of light edits/month.
      customerCmsAccess: 'none', // Launch default for every tier -- see module-level doc comment.
      futureCmsAccessCandidate: false,
      permitsBaseProductCustomCode: false,
    },
    priceUsdPerMonthProvisional: 197, // Illustrative only -- see module-level doc comment. Not an approved price.
  },
  premium: {
    schemaVersion: { major: 1, minor: 0 },
    tierId: 'premium',
    displayName: 'Premium (provisional name)',
    status: 'active',
    dimensions: {
      maxPages: 12, // Research-grounded default: 2026 business/growth-tier packages typically span 10-15 pages; 12 sits at the middle of that range.
      allowsCustomComponentCode: false,
      maxAdditionalLocalizationLocales: 2, // PROVISIONAL
      maxAdditionalIntegrations: 2, // PROVISIONAL
      dedicatedRuntime: false,
      changeAllowancePerMonth: 6, // Research-grounded default: comparable mid-tier maintenance plans typically include several edits/month, roughly bi-weekly.
      customerCmsAccess: 'none', // Launch default for every tier -- see module-level doc comment. (Previously modeled as 'content_only' before Carlos's 2026-07-14 clarification.)
      futureCmsAccessCandidate: true,
      permitsBaseProductCustomCode: false,
    },
    priceUsdPerMonthProvisional: 497, // Illustrative only -- see module-level doc comment. Not an approved price.
  },
  enterprise: {
    schemaVersion: { major: 1, minor: 0 },
    tierId: 'enterprise',
    displayName: 'Enterprise (provisional name)',
    status: 'active',
    dimensions: {
      maxPages: Number.POSITIVE_INFINITY,
      allowsCustomComponentCode: true,
      maxAdditionalLocalizationLocales: Number.POSITIVE_INFINITY,
      maxAdditionalIntegrations: Number.POSITIVE_INFINITY,
      dedicatedRuntime: true,
      changeAllowancePerMonth: Number.POSITIVE_INFINITY, // still subject to fair-use/exception review, not modeled here
      customerCmsAccess: 'none', // Launch default for every tier -- see module-level doc comment. (Previously modeled as 'full' before Carlos's 2026-07-14 clarification.)
      futureCmsAccessCandidate: true,
      permitsBaseProductCustomCode: false, // still requires separate approval per manual §03 §7.3 even in Enterprise
    },
    // priceUsdPerMonthProvisional intentionally omitted -- Enterprise is custom-quoted, not a flat rate; not researchable in the abstract.
  },
}

const TIER_ORDER: TierId[] = ['standard', 'premium', 'enterprise']

function nextTierUp(tierId: TierId): TierId | null {
  const index = TIER_ORDER.indexOf(tierId)
  return index >= 0 && index < TIER_ORDER.length - 1 ? TIER_ORDER[index + 1] : null
}

/**
 * The Tier Specification enforcement gate (manual §08.16): checks a
 * requested capability against a Tier Specification's dimensions and
 * returns a disposition, never a bare boolean. `exception_required`
 * covers cases the manual says require separate approval even within
 * the tier that nominally allows the dimension (e.g. Enterprise custom
 * code in the base product).
 */
export function checkEntitlement(tier: TierSpecification, capability: RequestableCapability): EntitlementCheckResult {
  switch (capability.kind) {
    case 'page_count': {
      if (capability.requested <= tier.dimensions.maxPages) {
        return { disposition: 'allowed', reason: `${capability.requested} pages is within ${tier.tierId}'s limit of ${tier.dimensions.maxPages}.` }
      }
      const upgrade = nextTierUp(tier.tierId)
      return upgrade
        ? { disposition: 'requires_upgrade', reason: `${capability.requested} pages exceeds ${tier.tierId}'s limit of ${tier.dimensions.maxPages}; ${upgrade} may support this.` }
        : { disposition: 'unsupported', reason: `${capability.requested} pages exceeds the highest tier's limit.` }
    }

    case 'custom_component_code': {
      if (tier.dimensions.allowsCustomComponentCode) {
        return { disposition: 'allowed', reason: `${tier.tierId} permits custom component code (subject to separate technical approval).` }
      }
      const upgrade = nextTierUp(tier.tierId)
      return upgrade
        ? { disposition: 'requires_upgrade', reason: `${tier.tierId} does not permit custom component code; ${upgrade} may.` }
        : { disposition: 'unsupported', reason: 'No tier permits this.' }
    }

    case 'additional_localization_locale': {
      if (capability.requestedCount <= tier.dimensions.maxAdditionalLocalizationLocales) {
        return { disposition: 'allowed', reason: `${capability.requestedCount} additional locale(s) is within ${tier.tierId}'s limit.` }
      }
      const upgrade = nextTierUp(tier.tierId)
      return upgrade
        ? { disposition: 'requires_upgrade', reason: `Exceeds ${tier.tierId}'s locale limit; ${upgrade} may support this.` }
        : { disposition: 'unsupported', reason: 'Exceeds the highest tier\'s locale limit.' }
    }

    case 'additional_integration': {
      if (capability.requestedCount <= tier.dimensions.maxAdditionalIntegrations) {
        return { disposition: 'allowed', reason: `${capability.requestedCount} additional integration(s) is within ${tier.tierId}'s limit.` }
      }
      const upgrade = nextTierUp(tier.tierId)
      return upgrade
        ? { disposition: 'requires_upgrade', reason: `Exceeds ${tier.tierId}'s integration limit; ${upgrade} may support this.` }
        : { disposition: 'unsupported', reason: 'Exceeds the highest tier\'s integration limit.' }
    }

    case 'dedicated_runtime': {
      if (tier.dimensions.dedicatedRuntime) {
        return { disposition: 'exception_required', reason: 'Dedicated runtime requires explicit technical feasibility, cost, capacity, and commercial approval even in a tier that nominally allows it (manual §03 §7.3).' }
      }
      const upgrade = nextTierUp(tier.tierId)
      return upgrade
        ? { disposition: 'requires_upgrade', reason: `${tier.tierId} does not offer a dedicated runtime; ${upgrade} may.` }
        : { disposition: 'unsupported', reason: 'No tier offers this without exception review.' }
    }

    case 'base_product_custom_code': {
      // Manual §03 §7.1/§7.3: no tier permits unique component coding in
      // the BASE product without separate approval -- this is always an
      // exception, never a plain "allowed", regardless of tier.
      if (!tier.dimensions.permitsBaseProductCustomCode) {
        return { disposition: 'exception_required', reason: 'No tier permits base-product custom component coding without separate, explicit approval (manual §03 §7.1/§7.3).' }
      }
      return { disposition: 'allowed', reason: 'Explicitly permitted for this tier configuration.' }
    }
  }
}

/**
 * Manual §08.17: a Kit Tier Variant mapping must never enlarge
 * commercial entitlement beyond the Tier Specification; the more
 * restrictive rule wins on conflict absent an authorized exception.
 * This helper enforces that invariant when a Vertical Kit's own
 * variant limits are compared against the base Tier Specification.
 */
export function resolveMostRestrictive(tierLimit: number, kitVariantLimit: number): number {
  return Math.min(tierLimit, kitVariantLimit)
}

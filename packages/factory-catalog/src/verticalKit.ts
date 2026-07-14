/**
 * Vertical Kit (Phase 3, Issue phase3-vertical-kit-001).
 *
 * Manual §08.8: "a versioned production package describing how to plan,
 * compose, populate, validate, and maintain sites for a defined SMB
 * category." Manual §08.2 is explicit that Vertical Kit, Tier
 * Specification, and Reusable Site Foundation are three DISTINCT
 * objects that must never be collapsed into one undocumented template.
 * This file is the Vertical Kit side of that split; tierSpecification.ts
 * is the Tier Specification side.
 *
 * Manual §08.17: a Kit Tier Variant expresses a Vertical Kit's
 * vertical-specific limits for one tier, but can NEVER enlarge
 * entitlement beyond the base Tier Specification -- the more
 * restrictive rule always wins (implemented via resolveMostRestrictive()
 * in tierSpecification.ts).
 *
 * IMPORTANT -- what this does NOT decide: real Vertical Kit content
 * (exact page copy, conversion objectives, media/copy patterns for an
 * actual SMB category) requires business/vertical research this
 * repository does not have access to (it belongs to Sales-side lead
 * research per manual §09, or direct business input from Carlos).
 *
 * UPDATE (2026-07-14): Carlos explicitly instructed engineering to
 * proceed without waiting for full commercial sign-off, using web
 * research to pick reasonable defaults that stay easy to change later.
 * Home Services (plumbing/HVAC/electrical/landscaping/cleaning) was
 * already the Decision DR-06 approved pilot vertical, and remains a
 * well-grounded choice: it is one of the most common, well-understood
 * SMB website categories, with a highly repeatable page structure
 * (home/services/about/contact/service-area/reviews) that fits this
 * factory's reuse model well. `HOME_SERVICES_KIT.status` is therefore
 * now `'active'` -- promoted from `'candidate'` -- so the Site
 * Specification / Site Assembly pipeline can run end to end for real
 * (rather than only via test-only status overrides). Its
 * page-structure content is still a reasonable structural default, not
 * verified real business copy -- it remains straightforward to edit or
 * swap for verified content later without any structural change here.
 */

import type { SchemaVersion } from '@linksites/types'
import type { TierId } from './tierSpecification.js'
import { resolveMostRestrictive } from './tierSpecification.js'

/** Manual §04's reusable-capability lifecycle, applied to Vertical Kits (manual §08.10). */
export type VerticalKitStatus = 'candidate' | 'active' | 'deprecated' | 'retired'

export interface KitTierVariant {
  tierId: TierId
  /** Vertical-specific page limit for this tier -- resolved against the base Tier Specification via resolveMostRestrictive(), never used alone. */
  maxPagesForVariant: number
  /** Named page/section types this vertical's Kit expects for this tier (structural, not real copy). */
  expectedPageTypes: string[]
  notes?: string
}

export interface VerticalKit {
  schemaVersion: SchemaVersion
  kitId: string
  displayName: string
  status: VerticalKitStatus
  /** One line describing the SMB category this Kit targets (manual §08.8). */
  description: string
  tierVariants: KitTierVariant[]
}

/**
 * The approved pilot vertical (Decision DR-06,
 * audit/13_decision_and_contradiction_register.md), promoted to
 * `status: 'active'` on 2026-07-14 per Carlos's explicit instruction to
 * proceed -- see module doc comment. Page types are still reasonable
 * structural defaults (the kinds of pages a Home Services SMB site
 * typically needs), not verified real business copy; easy to edit later.
 * Tier-variant page limits are kept aligned with the Tier Specification's
 * own research-grounded defaults (tierSpecification.ts) so the two
 * objects agree rather than one silently overriding the other via
 * resolveMostRestrictive().
 */
export const HOME_SERVICES_KIT: VerticalKit = {
  schemaVersion: { major: 1, minor: 0 },
  kitId: 'home_services',
  displayName: 'Home Services',
  status: 'active',
  description: 'SMB home services businesses (e.g. plumbing, HVAC, electrical, landscaping, cleaning) -- exact sub-vertical boundary may be refined later; Carlos-approved provisional pilot vertical (Decision DR-06, promoted 2026-07-14).',
  tierVariants: [
    {
      tierId: 'standard',
      maxPagesForVariant: 6, // Aligned with Tier Specification's Standard maxPages (research-grounded default, see tierSpecification.ts)
      expectedPageTypes: ['home', 'services', 'about', 'contact', 'service-area', 'reviews'],
    },
    {
      tierId: 'premium',
      maxPagesForVariant: 12, // Aligned with Tier Specification's Premium maxPages (research-grounded default, see tierSpecification.ts)
      expectedPageTypes: ['home', 'services', 'service-detail', 'about', 'contact', 'service-area', 'reviews', 'gallery', 'faq', 'blog'],
    },
    {
      tierId: 'enterprise',
      maxPagesForVariant: Number.POSITIVE_INFINITY,
      expectedPageTypes: ['home', 'services', 'service-detail', 'about', 'contact', 'service-area', 'reviews', 'gallery', 'faq', 'blog', 'careers', 'locations'],
    },
  ],
}

export class VerticalKitError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'VerticalKitError'
  }
}

export function getKitTierVariant(kit: VerticalKit, tierId: TierId): KitTierVariant {
  const variant = kit.tierVariants.find((v) => v.tierId === tierId)
  if (!variant) {
    throw new VerticalKitError(`Vertical Kit "${kit.kitId}" has no tier variant defined for tier "${tierId}".`)
  }
  return variant
}

/**
 * The effective page limit for one Vertical Kit + Tier combination: the
 * more restrictive of the base Tier Specification's limit and this
 * Kit's tier-variant limit (manual §08.17 -- never enlarges entitlement).
 */
export function resolveEffectiveMaxPages(baseTierMaxPages: number, kit: VerticalKit, tierId: TierId): number {
  const variant = getKitTierVariant(kit, tierId)
  return resolveMostRestrictive(baseTierMaxPages, variant.maxPagesForVariant)
}

/**
 * A Vertical Kit must not be used for real production work (e.g.
 * selected in a Site Specification) unless it is `active`. This is the
 * single check every future consumer (Site Specification validation,
 * Foundation matching, etc.) must apply -- centralizing it here avoids
 * each caller re-implementing the same lifecycle rule.
 */
export function assertKitIsProductionReady(kit: VerticalKit): void {
  if (kit.status !== 'active') {
    throw new VerticalKitError(
      `Vertical Kit "${kit.kitId}" is not production-ready (status: "${kit.status}"). Only "active" Kits may be used for real site production.`,
    )
  }
}

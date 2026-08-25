/**
 * LS-03 canonical semantic contract (ISS-10..12).
 *
 * Products and Services stay distinct collections. Offer/Case/template-id
 * surfaces remain compatibility projections only.
 */

/** Governed Issue #275 repair identity; replaces stale `ls03-274-base9da7197e`. */
export const LS03_DISPATCH_IDEMPOTENCY =
  'cursor-cloud-dispatch-v1:linksites-ls03-275-repair-base9da7197e' as const

export const LS03_BASE = Object.freeze({
  commitSha: '9da7197ef8b0f953508c2361c609fae5a643c746',
  treeSha: '1f9eb7cb8d569c78dd50a482d6b7ce985c2cff90',
})

export const LS03_CANONICAL_COLLECTIONS = Object.freeze({
  templateAdoptions: 'template-adoptions',
  entitlementSnapshots: 'entitlement-snapshots',
  products: 'products',
  services: 'services',
  resultsWork: 'results-work',
  articles: 'articles',
  videos: 'videos',
  faqPages: 'faq-pages',
  helpArticles: 'help-articles',
  teamMembers: 'team-members',
  locations: 'locations',
  serviceAreas: 'service-areas',
  policies: 'policies',
  coreSettings: 'core-settings',
})

export const LS03_DEPRECATED_PROJECTION_COLLECTIONS = Object.freeze({
  offerPages: 'offer-pages',
  caseStudyPages: 'case-study-pages',
})

export const LS03_CONTENT_MODES = ['product', 'service', 'hybrid', 'neither'] as const
export type Ls03ContentMode = (typeof LS03_CONTENT_MODES)[number]

export const LS03_CAPABILITY_PLANS = ['A', 'B', 'C', 'L'] as const
export type Ls03CapabilityPlanId = (typeof LS03_CAPABILITY_PLANS)[number]

export const LS03_PLAN_BUDGETS = Object.freeze({
  A: 30,
  B: 15,
  C: 6,
  L: 0,
})

export const LS03_PAYLOAD_MIGRATION = '20260824_000001_ls03_semantic_models' as const
export const LS03_SUPABASE_MIGRATION = '20260824_000001_ls03_payload_semantic_models' as const

export const LS03_ADOPTION_STATES = ['linked', 'adopted', 'replaced', 'rolled_back'] as const
export type Ls03AdoptionState = (typeof LS03_ADOPTION_STATES)[number]

export const LS03_POLICY_KINDS = ['privacy', 'terms', 'cookie', 'other'] as const
export type Ls03PolicyKind = (typeof LS03_POLICY_KINDS)[number]

export const SHA1_IDENTITY = /^[a-f0-9]{40}$/

export function assertDistinctProductAndServiceCollections(): void {
  const products: string = LS03_CANONICAL_COLLECTIONS.products
  const services: string = LS03_CANONICAL_COLLECTIONS.services
  if (products === services) {
    throw new Error('LS-FR-09 requires Products and Services to remain semantically distinct.')
  }
}

export function isDeprecatedTemplateIdProjection(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0
}

/**
 * LS-05 versioned semantic adapter. Provider roles are vocabulary; Payload
 * block types and React symbols remain LiNKsites-owned projections.
 */
import { createHash } from 'node:crypto'

export const MASTER_TEMPLATE_ADAPTER_ID = 'linksites.master-template.revision2' as const
export const MASTER_TEMPLATE_ADAPTER_VERSION = '2.0.0-a1.1' as const

export type ProviderSemanticMapping = Readonly<{
  providerRole: string
  payloadBlockType: string
  reactSymbol: string
  source: 'linksites-adapter'
}>

export type AdapterMappingResult =
  | Readonly<{ supported: true; mapping: ProviderSemanticMapping }>
  | Readonly<{ supported: false; providerRole: string; reason: 'unsupported_provider_semantic' }>

export type VersionedAdapterResult = AdapterMappingResult
  | Readonly<{ supported: false; providerRole: string; version: string; reason: 'unsupported_adapter_version' }>

/** A1 roles required by the provider section-slot contract. */
export const REQUIRED_A1_PROVIDER_ROLES = Object.freeze([
  'hero', 'trust', 'offer_summary', 'featured_services', 'featured_products',
  'proof', 'process', 'about_snapshot', 'faq', 'cta', 'story', 'values',
  'team_preview', 'contact_channels', 'form', 'locations_preview',
  'local_facts', 'availability', 'local_guidance', 'area_cards', 'breadcrumb',
  'title_metadata', 'author_reviewer', 'body', 'concise_answer', 'references',
  'related_articles', 'service_summary', 'service_features', 'pricing',
  'plan_comparison', 'product_summary', 'product_features', 'product_specs',
  'product_pricing', 'gallery', 'video', 'location_details', 'hours',
  'service_area_summary', 'resource_list', 'resource_detail', 'team_list',
  'team_detail', 'legal_body',
] as const)

const mapping = (providerRole: string, payloadBlockType: string, reactSymbol: string): ProviderSemanticMapping => ({ providerRole, payloadBlockType, reactSymbol, source: 'linksites-adapter' })

export const A1_PROVIDER_SEMANTIC_MAP: Readonly<Record<string, ProviderSemanticMapping>> = Object.freeze({
  hero: mapping('hero', 'hero', 'PageHero'), trust: mapping('trust', 'trust', 'TrustBar'), offer_summary: mapping('offer_summary', 'offers', 'OfferSummary'),
  featured_services: mapping('featured_services', 'services', 'ServicesGrid'), featured_products: mapping('featured_products', 'products', 'ProductsGrid'), proof: mapping('proof', 'proof', 'ProofSection'),
  process: mapping('process', 'process', 'ProcessSteps'), about_snapshot: mapping('about_snapshot', 'content', 'AboutSnapshot'), faq: mapping('faq', 'faq', 'FaqSection'), cta: mapping('cta', 'cta', 'CTASection'),
  story: mapping('story', 'content', 'StorySection'), values: mapping('values', 'content', 'ValuesSection'), team_preview: mapping('team_preview', 'team', 'TeamPreview'),
  contact_channels: mapping('contact_channels', 'contact', 'ContactChannelList'), form: mapping('form', 'form', 'DynamicContactForm'), locations_preview: mapping('locations_preview', 'locations', 'LocationsPreview'),
  local_facts: mapping('local_facts', 'localFacts', 'LocalFacts'), availability: mapping('availability', 'availability', 'AvailabilitySection'), local_guidance: mapping('local_guidance', 'content', 'LocalGuidance'),
  area_cards: mapping('area_cards', 'locations', 'AreaCards'), breadcrumb: mapping('breadcrumb', 'breadcrumb', 'Breadcrumbs'), title_metadata: mapping('title_metadata', 'metadata', 'TitleMetadata'),
  author_reviewer: mapping('author_reviewer', 'author', 'AuthorReviewer'), body: mapping('body', 'richText', 'PageRenderer'), concise_answer: mapping('concise_answer', 'answer', 'ConciseAnswer'), references: mapping('references', 'references', 'ReferencesList'),
  related_articles: mapping('related_articles', 'articles', 'RelatedArticles'), service_summary: mapping('service_summary', 'services', 'ServiceSummary'), service_features: mapping('service_features', 'features', 'ServiceFeatures'),
  pricing: mapping('pricing', 'pricing', 'PricingSection'), plan_comparison: mapping('plan_comparison', 'pricing', 'PlanComparison'), product_summary: mapping('product_summary', 'products', 'ProductSummary'),
  product_features: mapping('product_features', 'features', 'ProductFeatures'), product_specs: mapping('product_specs', 'specifications', 'ProductSpecifications'), product_pricing: mapping('product_pricing', 'pricing', 'ProductPricing'),
  gallery: mapping('gallery', 'gallery', 'MediaGallery'), video: mapping('video', 'media', 'VideoSection'), location_details: mapping('location_details', 'locations', 'LocationDetails'), hours: mapping('hours', 'hours', 'BusinessHours'),
  service_area_summary: mapping('service_area_summary', 'locations', 'ServiceAreaSummary'), resource_list: mapping('resource_list', 'resources', 'ResourceList'), resource_detail: mapping('resource_detail', 'richText', 'ResourceDetail'),
  team_list: mapping('team_list', 'team', 'TeamGrid'), team_detail: mapping('team_detail', 'team', 'TeamDetail'), legal_body: mapping('legal_body', 'richText', 'LegalBody'),
})

const canonical = (value: unknown): string => value === null || typeof value !== 'object' ? JSON.stringify(value) : Array.isArray(value) ? `[${value.map(canonical).join(',')}]` : `{${Object.keys(value as Record<string, unknown>).sort().map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`).join(',')}}`

export const MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST = createHash('sha1').update(canonical(A1_PROVIDER_SEMANTIC_MAP), 'utf8').digest('hex') as string

export function mapProviderSemantic(providerRole: unknown): AdapterMappingResult {
  if (typeof providerRole !== 'string' || !providerRole.trim() || !A1_PROVIDER_SEMANTIC_MAP[providerRole]) return { supported: false, providerRole: String(providerRole), reason: 'unsupported_provider_semantic' }
  return { supported: true, mapping: A1_PROVIDER_SEMANTIC_MAP[providerRole] }
}

/** Fail closed before applying A1 semantics to bytes from any other version. */
export function mapVersionedProviderSemantic(version: unknown, providerRole: unknown): VersionedAdapterResult {
  if (version !== MASTER_TEMPLATE_ADAPTER_VERSION) {
    return {
      supported: false,
      providerRole: String(providerRole),
      version: String(version),
      reason: 'unsupported_adapter_version',
    }
  }
  return mapProviderSemantic(providerRole)
}

export function validateA1AdapterCoverage(requiredRoles: readonly string[] = REQUIRED_A1_PROVIDER_ROLES): Readonly<{ complete: true; missing: readonly [] }> | Readonly<{ complete: false; missing: readonly string[] }> {
  const missing = [...new Set(requiredRoles.filter((role) => !A1_PROVIDER_SEMANTIC_MAP[role]))]
  return missing.length === 0 ? { complete: true, missing: [] as const } : { complete: false, missing }
}

export function createMasterTemplateAdapterIdentity(input: Readonly<{ providerCommitSha: string; providerTreeSha: string; version: string }>): string {
  return createHash('sha1').update(canonical({ adapterId: MASTER_TEMPLATE_ADAPTER_ID, adapterVersion: MASTER_TEMPLATE_ADAPTER_VERSION, mappingDigest: MASTER_TEMPLATE_ADAPTER_MAPPING_DIGEST, ...input }), 'utf8').digest('hex')
}

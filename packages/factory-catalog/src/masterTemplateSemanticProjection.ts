/**
 * LiNKsites-owned semantic projection for the master-template skeleton.
 *
 * Library names meaning (archetype + component/block IDs). LiNKsites maps
 * those IDs to Payload block types and React symbols. Missing required IDs
 * fail closed. Distinct sections keep distinct identities — never collapse
 * every section to hero.
 */
import { MasterTemplateConsumerError } from './masterTemplatePin.ts'

export const MASTER_TEMPLATE_ARCHETYPES = [
  'home',
  'about',
  'contact',
  'legal',
  'collection',
  'detail',
] as const

export type MasterTemplateArchetype = (typeof MASTER_TEMPLATE_ARCHETYPES)[number]

export interface SemanticComponentProjection {
  libraryComponentId: string
  payloadBlockType: string
  reactSymbol: string
  sourceFile: string
}

export interface LinksitesOwnedSiteCoordinates {
  siteId: string
  locale: string
  publicationStatus: 'draft' | 'published'
  route: string
}

export interface LibrarySemanticBlock {
  id?: string
  blockType: string
  libraryComponentId?: string
  data?: Record<string, unknown>
}

export interface ProjectedPayloadBlock {
  id: string
  blockType: string
  libraryComponentId: string
  reactSymbol: string
  data: Record<string, unknown>
}

export interface ProjectedMasterTemplatePage {
  archetypeId: MasterTemplateArchetype
  payloadPageType: MasterTemplateArchetype
  title: string
  slug: string
  examplePath?: string
  blocks: ProjectedPayloadBlock[]
  site: LinksitesOwnedSiteCoordinates
}

/** Library component ID → LiNKsites React/Payload mapping. */
export const SEMANTIC_COMPONENT_MAP: Readonly<Record<string, SemanticComponentProjection>> = Object.freeze({
  action: { libraryComponentId: 'action', payloadBlockType: 'cta', reactSymbol: 'CTA', sourceFile: 'src/components/common/CTA.tsx' },
  'newsletter-capture': { libraryComponentId: 'newsletter-capture', payloadBlockType: 'newsletter', reactSymbol: 'NewsletterSection', sourceFile: 'src/components/common/NewsletterSection.tsx' },
  'article-collection': { libraryComponentId: 'article-collection', payloadBlockType: 'articles', reactSymbol: 'ArticlesGrid', sourceFile: 'src/components/marketing/ArticlesGrid.tsx' },
  'cta-section': { libraryComponentId: 'cta-section', payloadBlockType: 'cta', reactSymbol: 'CTASection', sourceFile: 'src/components/marketing/CTASection.tsx' },
  'case-collection': { libraryComponentId: 'case-collection', payloadBlockType: 'caseStudies', reactSymbol: 'CaseStudiesGrid', sourceFile: 'src/components/marketing/CaseStudiesGrid.tsx' },
  'media-background': { libraryComponentId: 'media-background', payloadBlockType: 'media', reactSymbol: 'DynamicBgSection', sourceFile: 'src/components/marketing/DynamicBgSection.tsx' },
  'offer-collection': { libraryComponentId: 'offer-collection', payloadBlockType: 'offerShowcase', reactSymbol: 'OfferShowcase', sourceFile: 'src/components/marketing/OfferShowcase.tsx' },
  'feature-list': { libraryComponentId: 'feature-list', payloadBlockType: 'features', reactSymbol: 'PlatformFeatures', sourceFile: 'src/components/marketing/PlatformFeatures.tsx' },
  'pricing-table': { libraryComponentId: 'pricing-table', payloadBlockType: 'pricing', reactSymbol: 'PricingHomepage', sourceFile: 'src/components/marketing/PricingHomepage.tsx' },
  'pricing-preview': { libraryComponentId: 'pricing-preview', payloadBlockType: 'pricing', reactSymbol: 'PricingPreview', sourceFile: 'src/components/marketing/PricingPreview.tsx' },
  'scroll-hint': { libraryComponentId: 'scroll-hint', payloadBlockType: 'content', reactSymbol: 'ScrollIndicator', sourceFile: 'src/components/marketing/ScrollIndicator.tsx' },
  'hero-banner': { libraryComponentId: 'hero-banner', payloadBlockType: 'hero', reactSymbol: 'SignupHero', sourceFile: 'src/components/marketing/SignupHero.tsx' },
  'social-proof': { libraryComponentId: 'social-proof', payloadBlockType: 'testimonials', reactSymbol: 'SocialProofCarousel', sourceFile: 'src/components/marketing/SocialProofCarousel.tsx' },
  'solution-overview': { libraryComponentId: 'solution-overview', payloadBlockType: 'features', reactSymbol: 'SolutionsOverview', sourceFile: 'src/components/marketing/SolutionsOverview.tsx' },
  'token-background': { libraryComponentId: 'token-background', payloadBlockType: 'media', reactSymbol: 'StaticBgSection', sourceFile: 'src/components/marketing/StaticBgSection.tsx' },
  'rich-text': { libraryComponentId: 'rich-text', payloadBlockType: 'richText', reactSymbol: 'PageRenderer', sourceFile: 'src/components/page-renderer.tsx' },
  'site-header': { libraryComponentId: 'site-header', payloadBlockType: 'content', reactSymbol: 'Header', sourceFile: 'src/components/navigation/Header.tsx' },
  'site-footer': { libraryComponentId: 'site-footer', payloadBlockType: 'content', reactSymbol: 'Footer', sourceFile: 'src/components/navigation/Footer.tsx' },
  'contact-form': { libraryComponentId: 'contact-form', payloadBlockType: 'content', reactSymbol: 'DynamicContactForm', sourceFile: 'src/components/contact/DynamicContactForm.tsx' },
  'location-list': { libraryComponentId: 'location-list', payloadBlockType: 'locations', reactSymbol: 'ContactChannelList', sourceFile: 'src/components/contact/ContactChannelList.tsx' },
  'map-embed': { libraryComponentId: 'map-embed', payloadBlockType: 'locations', reactSymbol: 'GoogleMapEmbed', sourceFile: 'src/components/contact/GoogleMapEmbed.tsx' },
})

/** First Library component chosen for each portable block type. */
export const BLOCK_TYPE_TO_COMPONENT: Readonly<Record<string, string>> = Object.freeze({
  hero: 'hero-banner',
  features: 'feature-list',
  pricing: 'pricing-table',
  testimonials: 'social-proof',
  cta: 'cta-section',
  faq: 'article-collection',
  richText: 'rich-text',
  content: 'rich-text',
  media: 'media-background',
  callout: 'cta-section',
  videoEmbed: 'media-background',
  relatedContent: 'article-collection',
  testimonial: 'social-proof',
  trustFeed: 'social-proof',
  locations: 'feature-list',
  teamMembers: 'article-collection',
  offerShowcase: 'offer-collection',
  caseStudies: 'case-collection',
  articles: 'article-collection',
  newsletter: 'newsletter-capture',
})

export function assertMasterTemplateArchetype(value: unknown): asserts value is MasterTemplateArchetype {
  if (typeof value !== 'string' || !MASTER_TEMPLATE_ARCHETYPES.includes(value as MasterTemplateArchetype)) {
    throw new MasterTemplateConsumerError(
      `Unknown page archetype "${String(value)}"; expected one of ${MASTER_TEMPLATE_ARCHETYPES.join('|')}.`,
    )
  }
}

export function resolveLibraryComponentId(block: LibrarySemanticBlock): string {
  if (block.libraryComponentId) return block.libraryComponentId
  if (block.blockType === 'content' && block.data?.kind === 'contact_form_slot') return 'contact-form'
  const mapped = BLOCK_TYPE_TO_COMPONENT[block.blockType]
  if (!mapped) {
    throw new MasterTemplateConsumerError(
      `Unmapped required semantic block type "${block.blockType}"; refusing all-sections-to-hero fallback.`,
    )
  }
  return mapped
}

export function projectSemanticBlock(block: LibrarySemanticBlock, index: number): ProjectedPayloadBlock {
  const libraryComponentId = resolveLibraryComponentId(block)
  const projection = SEMANTIC_COMPONENT_MAP[libraryComponentId]
  if (!projection) {
    throw new MasterTemplateConsumerError(
      `Unmapped required Library component ID "${libraryComponentId}"; fail closed.`,
    )
  }
  return {
    id: block.id ?? `${projection.payloadBlockType}-${index}`,
    blockType: projection.payloadBlockType,
    libraryComponentId: projection.libraryComponentId,
    reactSymbol: projection.reactSymbol,
    data: { ...(block.data ?? {}) },
  }
}

export function projectMasterTemplatePage(input: {
  archetypeId: unknown
  title: string
  slug: string
  examplePath?: string
  content: LibrarySemanticBlock[]
  site: LinksitesOwnedSiteCoordinates
}): ProjectedMasterTemplatePage {
  assertMasterTemplateArchetype(input.archetypeId)
  if (!input.site.siteId || !input.site.locale || !input.site.route) {
    throw new MasterTemplateConsumerError('Site, locale, and route remain LiNKsites-owned and must be supplied by the consumer.')
  }
  const blocks = input.content.map((block, index) => projectSemanticBlock(block, index))
  const identities = new Set(blocks.map((block) => block.libraryComponentId))
  if (blocks.length > 1 && identities.size === 1 && identities.has('hero-banner')) {
    throw new MasterTemplateConsumerError('Refusing all-sections-to-hero projection; distinct sections must keep distinct semantic IDs.')
  }
  return {
    archetypeId: input.archetypeId,
    payloadPageType: input.archetypeId,
    title: input.title,
    slug: input.slug,
    examplePath: input.examplePath,
    blocks,
    site: input.site,
  }
}

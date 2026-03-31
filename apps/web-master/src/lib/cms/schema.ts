/**
 * CMS Schema Module - Zod Validation for LiNKsites Factory Kit Master Template
 * 
 * This module provides comprehensive Zod schemas for all CMS collections and globals.
 * All schemas are production-grade with runtime validation and strong TypeScript types.
 * 
 * Design Principles:
 * - Runtime validation with Zod
 * - Strong TypeScript inference
 * - Aligned with Payload CMS structure
 * - Generic and Master-Template ready
 * - No project-specific assumptions
 */

import { z } from 'zod';

// ============================================================================
// COMMON SCHEMAS
// ============================================================================

/**
 * SEO Meta Schema
 * Used across multiple collections for search engine optimization
 */
export const SeoMetaSchema = z.object({
  title: z.string().optional(),
  description: z.string().max(160).optional(),
  keywords: z.string().optional(),
  og_image: z.string().url().nullable().optional(),
}).optional();

export type SeoMeta = z.infer<typeof SeoMetaSchema>;

/**
 * Status Enum
 * Publication status for content
 */
export const StatusSchema = z.enum(['draft', 'published', 'archived']);
export type Status = z.infer<typeof StatusSchema>;

/**
 * Theme Variant Schema
 * Scoped theme overlays (not global mutations)
 */
export const ThemeVariantSchema = z.enum(['default', 'dark', 'accent']);
export type ThemeVariant = z.infer<typeof ThemeVariantSchema>;

/**
 * Offer Type Schema
 */
export const OfferTypeSchema = z.enum(['product', 'service']);
export type OfferType = z.infer<typeof OfferTypeSchema>;

/**
 * Resource Category Schema
 */
export const ResourceCategorySchema = z.enum([
  'automation',
  'analytics',
  'ai',
  'data',
  'general',
]);
export type ResourceCategory = z.infer<typeof ResourceCategorySchema>;

/**
 * Video Category Schema
 */
export const VideoCategorySchema = z.enum([
  'tutorial',
  'demo',
  'webinar',
  'case-study',
  'product-update',
]);
export type VideoCategory = z.infer<typeof VideoCategorySchema>;

/**
 * FAQ Category Schema
 */
export const FaqCategorySchema = z.enum([
  'getting-started',
  'billing',
  'technical',
  'account',
  'features',
  'integration',
  'security',
  'general',
]);
export type FaqCategory = z.infer<typeof FaqCategorySchema>;

/**
 * Legal Document Type Schema
 */
export const LegalDocumentTypeSchema = z.enum([
  'privacy-policy',
  'terms-of-use',
  'cookie-policy',
  'gdpr',
  'disclaimer',
  'acceptable-use',
  'sla',
  'other',
]);
export type LegalDocumentType = z.infer<typeof LegalDocumentTypeSchema>;

// ============================================================================
// SITE GLOBAL SCHEMA
// ============================================================================

/**
 * Site Global Configuration
 */
export const SiteSchema = z.object({
  id: z.string(),
  languages: z.array(z.string()),
  primaryLanguage: z.string(),
  themeId: z.string(),
  designSystemVersion: z.string(),
});

export type Site = z.infer<typeof SiteSchema>;

// ============================================================================
// NAVIGATION SCHEMA
// ============================================================================

/**
 * Navigation Link Schema
 */
export const NavigationLinkSchema = z.object({
  label: z.string(),
  slug: z.string(),
});

export type NavigationLink = z.infer<typeof NavigationLinkSchema>;

/**
 * Navigation CTA Schema
 */
export const NavigationCtaSchema = z.object({
  label: z.string(),
  slug: z.string(),
});

export type NavigationCta = z.infer<typeof NavigationCtaSchema>;

/**
 * Navigation Global Configuration
 */
export const NavigationSchema = z.object({
  primary: z.array(NavigationLinkSchema),
  cta: NavigationCtaSchema,
  override_enabled: z.boolean(),
  override_reason: z.string().nullable(),
  computed_label_override: z.string().nullable(),
});

export type Navigation = z.infer<typeof NavigationSchema>;

// ============================================================================
// OFFERS COLLECTION SCHEMA
// ============================================================================

/**
 * Hero Content Schema (used in Offers)
 */
export const HeroContentSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  body: z.string(),
  cta_label: z.string(),
  cta_url: z.string(),
});

export type HeroContent = z.infer<typeof HeroContentSchema>;

/**
 * Offer Schema
 * Core business offerings (products and services)
 */
export const OfferSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  type: OfferTypeSchema,
  short_description: z.string().optional(),
  description: z.string().optional(),
  hero_content: HeroContentSchema.optional(),
  body_content: z.string().optional(),
  features: z.array(z.string()).default([]),
  useCases: z.array(z.string()).default([]),
  pricing: z.array(z.string()).default([]),
  testimonials: z.array(z.string()).default([]),
  relatedResources: z.array(z.string()).default([]),
  seo_meta: SeoMetaSchema,
  theme_variant: ThemeVariantSchema.default('default'),
  sort_order: z.number().default(0),
  status: StatusSchema.default('draft'),
});

export type Offer = z.infer<typeof OfferSchema>;

// ============================================================================
// RESOURCES COLLECTION SCHEMA
// ============================================================================

/**
 * Resource Schema
 * Articles and blog posts
 */
export const ResourceSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().min(1),
  body: z.string().min(1),
  image: z.string().url().optional(),
  date: z.string(), // ISO date string
  offerSlug: z.string().optional(),
  category: ResourceCategorySchema.optional(),
  author: z
    .object({
      name: z.string().optional(),
      bio: z.string().optional(),
      avatar: z.string().url().optional(),
    })
    .optional(),
  seo_meta: SeoMetaSchema,
  status: StatusSchema.default('published'),
});

export type Resource = z.infer<typeof ResourceSchema>;

// ============================================================================
// VIDEOS COLLECTION SCHEMA
// ============================================================================

/**
 * Video Schema
 * Video content and tutorials
 */
export const VideoSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  youtubeId: z.string().min(1),
  thumbnail: z.string().url().optional(),
  duration: z.string().optional(),
  relatedVideos: z.array(z.string()).default([]),
  relatedArticles: z.array(z.string()).default([]),
  category: VideoCategorySchema.optional(),
  publishedDate: z.string().optional(), // ISO date string
  seo_meta: SeoMetaSchema,
  status: StatusSchema.default('published'),
});

export type Video = z.infer<typeof VideoSchema>;

// ============================================================================
// CASES COLLECTION SCHEMA
// ============================================================================

/**
 * Case Study Schema
 * Customer success stories
 */
export const CaseSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().min(1),
  challenge: z.string().min(1),
  solution: z.string().min(1),
  impact: z.string().min(1),
  relatedOffers: z.array(z.string()).default([]),
  customer: z
    .object({
      name: z.string().optional(),
      industry: z.string().optional(),
      size: z.string().optional(),
      logo: z.string().url().optional(),
    })
    .optional(),
  metrics: z
    .array(
      z.object({
        label: z.string(),
        value: z.string(),
      })
    )
    .default([]),
  seo_meta: SeoMetaSchema,
  status: StatusSchema.default('published'),
});

export type Case = z.infer<typeof CaseSchema>;

// ============================================================================
// FAQ COLLECTION SCHEMA
// ============================================================================

/**
 * FAQ Schema
 * Frequently asked questions
 */
export const FaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  category: FaqCategorySchema.optional(),
  offerSlug: z.string().optional(),
  sort_order: z.number().default(0),
  tags: z.array(z.string()).default([]),
  helpful_count: z.number().default(0),
  status: StatusSchema.default('published'),
});

export type Faq = z.infer<typeof FaqSchema>;

// ============================================================================
// LEGAL COLLECTION SCHEMA
// ============================================================================

/**
 * Legal Document Schema
 * Legal documents and policies
 */
export const LegalSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  body: z.string().min(1),
  document_type: LegalDocumentTypeSchema.optional(),
  version: z.string().optional(),
  effectiveDate: z.string().optional(), // ISO date string
  lastUpdated: z.string().optional(), // ISO date string
  summary: z.string().optional(),
  jurisdiction: z.string().optional(),
  status: StatusSchema.default('published'),
  seo_meta: SeoMetaSchema,
});

export type Legal = z.infer<typeof LegalSchema>;

// ============================================================================
// ABOUT GLOBAL SCHEMA
// ============================================================================

/**
 * About Section Schema
 */
export const AboutSectionSchema = z.object({
  title: z.string(),
  body: z.string(),
});

export type AboutSection = z.infer<typeof AboutSectionSchema>;

/**
 * About Global Configuration
 */
export const AboutSchema = z.object({
  heroTitle: z.string(),
  heroSubtitle: z.string(),
  sections: z.array(AboutSectionSchema).default([]),
});

export type About = z.infer<typeof AboutSchema>;

// ============================================================================
// CONTACT GLOBAL SCHEMA
// ============================================================================

/**
 * Contact Intent Schema
 */
export const ContactIntentSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  icon: z.string(),
  priorityRank: z.number(),
  action: z.object({
    type: z.enum(['modal', 'link', 'email']),
    formId: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
  }),
  audienceType: z.enum(['prospect', 'customer', 'partner', 'media']),
  trackingLabel: z.string(),
});

export type ContactIntent = z.infer<typeof ContactIntentSchema>;

/**
 * Contact Channel Schema
 */
export const ContactChannelSchema = z.object({
  id: z.string(),
  channelType: z.enum(['email', 'phone', 'chat', 'calendar', 'social']),
  displayName: z.string(),
  description: z.string(),
  icon: z.string(),
  availabilityText: z.string().optional(),
  badgeText: z.string().nullable().optional(),
  contactValue: z.string(),
  priorityWeight: z.number(),
});

export type ContactChannel = z.infer<typeof ContactChannelSchema>;

/**
 * Help Deflection Schema
 */
export const HelpDeflectionSchema = z.object({
  enabled: z.boolean(),
  title: z.string(),
  description: z.string(),
  ctaText: z.string(),
  ctaUrl: z.string(),
  featuredCategories: z.array(z.string()).default([]),
});

export type HelpDeflection = z.infer<typeof HelpDeflectionSchema>;

/**
 * Trust Schema
 */
export const TrustSchema = z.object({
  responseTimeText: z.string(),
  serviceTierNote: z.string().optional(),
  reassuranceText: z.string(),
  legalLinks: z.array(
    z.object({
      label: z.string(),
      url: z.string(),
    })
  ),
});

export type Trust = z.infer<typeof TrustSchema>;

/**
 * Contact Page Schema
 */
export const ContactPageSchema = z.object({
  title: z.string(),
  subtitle: z.string(),
  seoTitle: z.string(),
  seoDescription: z.string(),
});

export type ContactPage = z.infer<typeof ContactPageSchema>;

/**
 * Contact Global Configuration
 */
export const ContactSchema = z.object({
  page: ContactPageSchema,
  intents: z.array(ContactIntentSchema).default([]),
  channels: z.array(ContactChannelSchema).default([]),
  helpDeflection: HelpDeflectionSchema.optional(),
  trust: TrustSchema.optional(),
});

export type Contact = z.infer<typeof ContactSchema>;

// ============================================================================
// CONTACT FORMS SCHEMA
// ============================================================================

/**
 * Form Field Validation Schema
 */
export const FormFieldValidationSchema = z.object({
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  pattern: z.string().optional(),
  min: z.number().optional(),
  max: z.number().optional(),
});

export type FormFieldValidation = z.infer<typeof FormFieldValidationSchema>;

/**
 * Form Field Option Schema
 */
export const FormFieldOptionSchema = z.object({
  value: z.string(),
  label: z.string(),
});

export type FormFieldOption = z.infer<typeof FormFieldOptionSchema>;

/**
 * Form Field Schema
 */
export const FormFieldSchema = z.object({
  id: z.string(),
  type: z.enum(['text', 'email', 'textarea', 'select', 'checkbox', 'radio']),
  label: z.string(),
  placeholder: z.string().optional(),
  required: z.boolean().default(false),
  validation: FormFieldValidationSchema.optional(),
  options: z.array(FormFieldOptionSchema).optional(),
});

export type FormField = z.infer<typeof FormFieldSchema>;

/**
 * Form Submission Config Schema
 */
export const FormSubmissionConfigSchema = z.object({
  endpoint: z.string(),
  method: z.enum(['POST', 'GET', 'PUT', 'PATCH']),
  intentTag: z.string(),
});

export type FormSubmissionConfig = z.infer<typeof FormSubmissionConfigSchema>;

/**
 * Contact Form Schema
 */
export const ContactFormSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  fields: z.array(FormFieldSchema),
  submitButtonText: z.string(),
  successMessage: z.string(),
  submissionConfig: FormSubmissionConfigSchema,
});

export type ContactForm = z.infer<typeof ContactFormSchema>;

// ============================================================================
// PRICING SCHEMA
// ============================================================================

/**
 * Pricing Plan Schema
 */
export const PricingPlanSchema = z.object({
  name: z.string(),
  price: z.string(),
  period: z.string(),
  description: z.string(),
  features: z.array(z.string()),
  cta: z.string(),
  ctaUrl: z.string(),
  popular: z.boolean().default(false),
});

export type PricingPlan = z.infer<typeof PricingPlanSchema>;

/**
 * Pricing Schema (by offer slug)
 */
export const PricingSchema = z.record(
  z.string(),
  z.object({
    plans: z.array(PricingPlanSchema),
  })
);

export type Pricing = z.infer<typeof PricingSchema>;

// ============================================================================
// TOP-LEVEL CMS PAYLOAD SCHEMA
// ============================================================================

/**
 * Complete CMS Payload Schema
 * This is the top-level schema that validates the entire CMS data structure
 */
export const CmsPayloadSchema = z.object({
  // Globals
  site: SiteSchema,
  navigation: NavigationSchema,
  about: AboutSchema,
  contact: ContactSchema,

  // Collections
  offers: z.array(OfferSchema),
  resources: z.array(ResourceSchema),
  videos: z.array(VideoSchema),
  cases: z.array(CaseSchema),
  faq: z.array(FaqSchema),
  legal: z.array(LegalSchema),
  contactForms: z.array(ContactFormSchema),
  pricing: PricingSchema,
});

export type CmsPayload = z.infer<typeof CmsPayloadSchema>;

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate CMS Payload
 * Throws ZodError if validation fails
 */
export function validateCmsPayload(data: unknown): CmsPayload {
  return CmsPayloadSchema.parse(data);
}

/**
 * Safe Validate CMS Payload
 * Returns success/error result without throwing
 */
export function safeValidateCmsPayload(data: unknown) {
  return CmsPayloadSchema.safeParse(data);
}

/**
 * Validate Offer
 */
export function validateOffer(data: unknown): Offer {
  return OfferSchema.parse(data);
}

/**
 * Validate Resource
 */
export function validateResource(data: unknown): Resource {
  return ResourceSchema.parse(data);
}

/**
 * Validate Video
 */
export function validateVideo(data: unknown): Video {
  return VideoSchema.parse(data);
}

/**
 * Validate Case
 */
export function validateCase(data: unknown): Case {
  return CaseSchema.parse(data);
}

/**
 * Validate FAQ
 */
export function validateFaq(data: unknown): Faq {
  return FaqSchema.parse(data);
}

/**
 * Validate Legal
 */
export function validateLegal(data: unknown): Legal {
  return LegalSchema.parse(data);
}

// ============================================================================
// RELATIONSHIP HELPERS
// ============================================================================

/**
 * Resolve related resources for an offer
 */
export function resolveRelatedResources(
  offer: Offer,
  resources: Resource[]
): Resource[] {
  return resources.filter((resource) =>
    offer.relatedResources.includes(resource.slug)
  );
}

/**
 * Resolve related offers for a case study
 */
export function resolveRelatedOffers(
  caseStudy: Case,
  offers: Offer[]
): Offer[] {
  return offers.filter((offer) =>
    caseStudy.relatedOffers.includes(offer.slug)
  );
}

/**
 * Resolve related videos
 */
export function resolveRelatedVideos(
  video: Video,
  videos: Video[]
): Video[] {
  return videos.filter((v) => video.relatedVideos.includes(v.slug));
}

/**
 * Resolve related articles for a video
 */
export function resolveRelatedArticles(
  video: Video,
  resources: Resource[]
): Resource[] {
  return resources.filter((resource) =>
    video.relatedArticles.includes(resource.slug)
  );
}

/**
 * Get resources by offer slug
 */
export function getResourcesByOffer(
  offerSlug: string,
  resources: Resource[]
): Resource[] {
  return resources.filter((resource) => resource.offerSlug === offerSlug);
}

/**
 * Get FAQs by category
 */
export function getFaqsByCategory(
  category: FaqCategory,
  faqs: Faq[]
): Faq[] {
  return faqs.filter((faq) => faq.category === category);
}

/**
 * Get offers by type
 */
export function getOffersByType(type: OfferType, offers: Offer[]): Offer[] {
  return offers.filter((offer) => offer.type === type);
}

/**
 * Get published items
 */
export function getPublishedItems<T extends { status: Status }>(
  items: T[]
): T[] {
  return items.filter((item) => item.status === 'published');
}

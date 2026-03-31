/**
 * CMS Configuration
 * 
 * Centralized configuration for CMS integration including:
 * - CMS provider settings (Payload CMS)
 * - Collection schema definitions
 * - Field type mappings for dynamic rendering
 * - Content type definitions
 * - CMS-to-template mappings
 * 
 * This configuration maintains compatibility with template.config.json
 * and provides a single source of truth for all CMS-related settings.
 */

import { ENV } from './env.config';

// ============================================================================
// CMS PROVIDER CONFIGURATION
// ============================================================================

export const CMS_PROVIDER = {
  // Provider type
  type: ENV.CMS.PROVIDER,
  
  // Payload CMS configuration
  payload: {
    serverUrl: ENV.CMS.PAYLOAD_PUBLIC_SERVER_URL,
    apiUrl: ENV.CMS.PAYLOAD_API_URL,
    adminPath: '/admin',
  },
  
  // Mock data configuration (for development)
  mock: {
    dataPath: './data/cmsPayload.json',
    enabled: ENV.CMS.PROVIDER !== 'payload',
  },
} as const;

// ============================================================================
// COLLECTION DEFINITIONS
// ============================================================================

export const CMS_COLLECTIONS = {
  // Core business collections
  offers: 'offers',
  
  // Content collections
  resources: 'resources',
  cases: 'cases',
  videos: 'videos',
  faq: 'faq',
  
  // Configuration collections
  navigation: 'navigation',
  pages: 'pages',
  legal: 'legal',
  
  // Media collection
  media: 'media',
  
  // Users collection
  users: 'users',
} as const;

export type CMSCollection = typeof CMS_COLLECTIONS[keyof typeof CMS_COLLECTIONS];

// ============================================================================
// FIELD TYPE MAPPINGS
// ============================================================================

export const FIELD_TYPES = {
  // Text fields
  text: 'text',
  textarea: 'textarea',
  richText: 'richText',
  email: 'email',
  
  // Number fields
  number: 'number',
  
  // Selection fields
  select: 'select',
  radio: 'radio',
  checkbox: 'checkbox',
  
  // Relationship fields
  relationship: 'relationship',
  upload: 'upload',
  
  // Structured fields
  array: 'array',
  group: 'group',
  blocks: 'blocks',
  
  // Special fields
  date: 'date',
  json: 'json',
  code: 'code',
} as const;

export type FieldType = typeof FIELD_TYPES[keyof typeof FIELD_TYPES];

// ============================================================================
// CONTENT TYPE DEFINITIONS
// ============================================================================

export interface CMSOfferType {
  slug: string;
  title: string;
  subtitle?: string;
  type: 'product' | 'service';
  short_description?: string;
  description?: string;
  hero_content?: {
    title?: string;
    subtitle?: string;
    body?: string;
    cta_label?: string;
    cta_url?: string;
  };
  body_content?: string;
  features?: string[];
  useCases?: string[];
  pricing?: string[];
  testimonials?: string[];
  relatedResources?: string[];
  seo_meta?: CMSSEOMeta;
  theme_variant?: 'default' | 'dark' | 'accent';
  sort_order: number;
  status: 'draft' | 'published';
}

export interface CMSResourceType {
  slug: string;
  title: string;
  excerpt?: string;
  body?: string;
  image?: string;
  date?: string;
  offerSlug?: string;
  category?: string;
  seo_meta?: CMSSEOMeta;
  status?: 'draft' | 'published';
}

export interface CMSCaseStudyType {
  slug: string;
  title: string;
  summary?: string;
  challenge?: string;
  solution?: string;
  impact?: string;
  relatedOffers?: string[];
  seo_meta?: CMSSEOMeta;
  status?: 'draft' | 'published';
}

export interface CMSVideoType {
  slug: string;
  title: string;
  description?: string;
  youtubeId?: string;
  vimeoId?: string;
  relatedVideos?: string[];
  relatedArticles?: string[];
  seo_meta?: CMSSEOMeta;
  status?: 'draft' | 'published';
}

export interface CMSFAQType {
  question: string;
  answer: string;
  category?: string;
  sort_order?: number;
}

export interface CMSLegalType {
  slug: string;
  title: string;
  body: string;
  last_updated?: string;
}

export interface CMSSEOMeta {
  title?: string;
  description?: string;
  keywords?: string;
  og_image?: string;
  canonical_url?: string;
}

export interface CMSNavigationType {
  primary?: Array<{
    label: string;
    slug: string;
    children?: Array<{
      label: string;
      slug: string;
    }>;
  }>;
  cta?: {
    label: string;
    slug: string;
  };
  footer?: Array<{
    title: string;
    links: Array<{
      label: string;
      slug: string;
    }>;
  }>;
}

export interface CMSPageType {
  page_id: string;
  page_type: string;
  seo_meta?: CMSSEOMeta;
  theme_override?: 'default' | 'dark';
  sections?: Array<{
    section_id: string;
    component_type: string;
    sort_order: number;
    config?: Record<string, any>;
    visible?: boolean;
  }>;
}

// ============================================================================
// SECTION/COMPONENT TYPES
// ============================================================================

export const SECTION_TYPES = [
  'hero',
  'features',
  'pricing',
  'testimonials',
  'cta',
  'content',
  'grid',
  'carousel',
  'stats',
  'faq',
  'contact-form',
  'newsletter',
] as const;

export type SectionType = typeof SECTION_TYPES[number];

// ============================================================================
// PAGE LAYOUT MAPPINGS
// ============================================================================

export const PAGE_LAYOUTS = {
  homepage: 'offer-index',
  offers: 'offer-index',
  'offer-detail': 'offer-page',
  resources: 'resource-index',
  'resource-detail': 'article',
  'case-study': 'case-study',
  video: 'video',
  about: 'about-index',
  contact: 'contact',
  legal: 'legal',
  faq: 'faq',
} as const;

export type PageLayout = typeof PAGE_LAYOUTS[keyof typeof PAGE_LAYOUTS];

// ============================================================================
// TEMPLATE CONFIG COMPATIBILITY
// ============================================================================

/**
 * Template configuration structure (compatible with template.config.json)
 */
export interface TemplateConfig {
  template: string;
  designSystemVersion: string;
  navigation: {
    primary: Array<{
      labelDocId: string;
      slug: string;
    }>;
    cta: {
      labelDocId: string;
      slug: string;
    };
  };
  legal: Record<string, string>;
  pages: Record<string, {
    layout: string;
    slots: Record<string, any>;
  }>;
}

/**
 * Default template configuration
 */
export const DEFAULT_TEMPLATE_CONFIG: TemplateConfig = {
  template: 'company-site',
  designSystemVersion: 'v1',
  navigation: {
    primary: [
      { labelDocId: 'nav-offers', slug: '/offers' },
      { labelDocId: 'nav-resources', slug: '/resources' },
      { labelDocId: 'nav-about', slug: '/about' },
      { labelDocId: 'nav-contact', slug: '/contact' },
    ],
    cta: { labelDocId: 'nav-cta', slug: '/contact' },
  },
  legal: {
    privacy: 'legal-privacy',
    terms: 'legal-terms',
    cookies: 'legal-cookies',
    gdpr: 'legal-gdpr',
    disclaimer: 'legal-disclaimer',
  },
  pages: {},
};

// ============================================================================
// CMS FIELD SCHEMA HELPERS
// ============================================================================

/**
 * Common SEO meta fields for collections
 */
export const SEO_META_FIELDS = {
  name: 'seo_meta',
  type: 'group' as const,
  fields: [
    { name: 'title', type: 'text' as const },
    { name: 'description', type: 'textarea' as const, maxLength: 160 },
    { name: 'keywords', type: 'text' as const },
    { name: 'og_image', type: 'upload' as const, relationTo: 'media' },
    { name: 'canonical_url', type: 'text' as const },
  ],
};

/**
 * Common status field for collections
 */
export const STATUS_FIELD = {
  name: 'status',
  type: 'select' as const,
  options: [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
  ],
  defaultValue: 'draft',
  required: true,
};

/**
 * Common sort order field for collections
 */
export const SORT_ORDER_FIELD = {
  name: 'sort_order',
  type: 'number' as const,
  required: true,
  defaultValue: 0,
};

// ============================================================================
// CMS QUERY HELPERS
// ============================================================================

/**
 * Build CMS query parameters
 */
export function buildCMSQuery(params: {
  collection: CMSCollection;
  where?: Record<string, any>;
  limit?: number;
  page?: number;
  sort?: string;
  depth?: number;
}): Record<string, any> {
  const { collection, where, limit, page, sort, depth } = params;
  
  return {
    collection,
    where: where || {},
    limit: limit || 10,
    page: page || 1,
    sort: sort || '-createdAt',
    depth: depth || 1,
  };
}

/**
 * Get collection endpoint URL
 */
export function getCollectionEndpoint(collection: CMSCollection): string {
  const baseUrl = CMS_PROVIDER.payload.apiUrl;
  return `${baseUrl}/api/${collection}`;
}

/**
 * Get document endpoint URL
 */
export function getDocumentEndpoint(collection: CMSCollection, id: string): string {
  const baseUrl = CMS_PROVIDER.payload.apiUrl;
  return `${baseUrl}/api/${collection}/${id}`;
}

// ============================================================================
// CONTENT MAPPING HELPERS
// ============================================================================

/**
 * Map CMS content to page slots (for template.config.json compatibility)
 */
export function mapContentToSlots(
  content: any,
  slotMapping: Record<string, string>
): Record<string, any> {
  const slots: Record<string, any> = {};
  
  for (const [slotKey, contentKey] of Object.entries(slotMapping)) {
    if (content[contentKey] !== undefined) {
      slots[slotKey] = content[contentKey];
    }
  }
  
  return slots;
}

/**
 * Get page configuration from template config
 */
export function getPageConfig(
  templateConfig: TemplateConfig,
  pagePath: string
): TemplateConfig['pages'][string] | null {
  return templateConfig.pages[pagePath] || null;
}

// ============================================================================
// MEDIA CONFIGURATION
// ============================================================================

export const MEDIA_CONFIG = {
  // Upload directory
  uploadDir: 'media',
  
  // Static URL path
  staticUrl: '/media',
  
  // Image sizes
  imageSizes: [
    {
      name: 'thumbnail',
      width: 400,
      height: 300,
      position: 'centre' as const,
    },
    {
      name: 'card',
      width: 768,
      height: 576,
      position: 'centre' as const,
    },
    {
      name: 'hero',
      width: 1920,
      height: 1080,
      position: 'centre' as const,
    },
  ],
  
  // Admin thumbnail
  adminThumbnail: 'thumbnail',
  
  // Allowed mime types
  mimeTypes: ['image/*'],
  
  // Max file size (in bytes)
  maxFileSize: 5 * 1024 * 1024, // 5MB
} as const;

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  CMS_PROVIDER,
  CMS_COLLECTIONS,
  FIELD_TYPES,
  SECTION_TYPES,
  PAGE_LAYOUTS,
  DEFAULT_TEMPLATE_CONFIG,
  SEO_META_FIELDS,
  STATUS_FIELD,
  SORT_ORDER_FIELD,
  MEDIA_CONFIG,
  buildCMSQuery,
  getCollectionEndpoint,
  getDocumentEndpoint,
  mapContentToSlots,
  getPageConfig,
};

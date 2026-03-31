/**
 * Site Configuration
 * 
 * Centralized configuration for site-wide settings including:
 * - Site identity and branding
 * - Supported languages and locales
 * - Environment variables mapping
 * - SEO defaults
 * - Analytics settings
 * - External application URLs
 * - Company information
 * 
 * This configuration can be overridden by:
 * 1. Environment variables (highest priority)
 * 2. CMS settings (when connected)
 * 3. Secondary template overrides
 * 4. Client site customizations
 */

import { ENV } from './env.config';

// ============================================================================
// LANGUAGE CONFIGURATION
// ============================================================================

export const SUPPORTED_LANGUAGES = ['en', 'es', 'zh-tw', 'zh-cn'] as const;
export const DEFAULT_LANGUAGE = 'en' as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  es: 'Español',
  'zh-tw': '繁體中文',
  'zh-cn': '简体中文',
};

export const LANGUAGE_LOCALES: Record<SupportedLanguage, string> = {
  en: 'en_US',
  es: 'es_ES',
  'zh-tw': 'zh_TW',
  'zh-cn': 'zh_CN',
};

// ============================================================================
// SITE IDENTITY
// ============================================================================

export const SITE_CONFIG = {
  // Site name/brand (can be overridden by CMS)
  siteName: ENV.SITE.SITE_NAME,
  
  // Site URL (required for SEO)
  siteUrl: ENV.SITE.SITE_URL,
  
  // Site description (SEO default)
  description: 'Transform your business with AI-powered automation and intelligent workflow solutions. Scale effortlessly with enterprise-grade tools.',
  
  // Default author/publisher
  author: ENV.SITE.SITE_NAME,
  
  // Site type
  type: 'website' as const,
} as const;

// ============================================================================
// COMPANY INFORMATION
// ============================================================================

export const COMPANY_INFO = {
  // Legal company name
  legalName: ENV.SITE.COMPANY_LEGAL_NAME,
  
  // Company email
  email: ENV.SITE.COMPANY_EMAIL,
  
  // Company phone
  phone: ENV.SITE.COMPANY_PHONE,
  
  // Company address (can be overridden by CMS)
  address: {
    street: '',
    city: '',
    state: '',
    zip: '',
    country: '',
  },
  
  // Social media handles
  social: {
    twitter: ENV.SOCIAL.TWITTER_HANDLE,
    linkedin: ENV.SOCIAL.LINKEDIN_URL,
    facebook: ENV.SOCIAL.FACEBOOK_URL,
    instagram: ENV.SOCIAL.INSTAGRAM_URL,
    youtube: ENV.SOCIAL.YOUTUBE_URL,
  },
} as const;

// ============================================================================
// EXTERNAL APPLICATION URLS
// ============================================================================

export const APP_URLS = {
  // Main application login
  login: ENV.APP_URLS.APP_LOGIN_URL,
  
  // Main application signup
  signup: ENV.APP_URLS.APP_SIGNUP_URL,
  
  // Admin/dashboard login
  adminLogin: ENV.APP_URLS.ADMIN_LOGIN_URL,
  
  // Help/support portal
  support: ENV.APP_URLS.SUPPORT_URL,
  
  // Documentation
  docs: ENV.APP_URLS.DOCS_URL,
} as const;

// ============================================================================
// SEO DEFAULTS
// ============================================================================

export const SEO_CONFIG = {
  // Default meta title template
  titleTemplate: '%s | ' + SITE_CONFIG.siteName,
  
  // Default meta description
  defaultDescription: SITE_CONFIG.description,
  
  // Default keywords
  defaultKeywords: [
    'AI automation',
    'workflow automation',
    'business intelligence',
    'enterprise software',
    'SaaS platform',
  ],
  
  // Open Graph defaults
  openGraph: {
    type: 'website' as const,
    locale: LANGUAGE_LOCALES[DEFAULT_LANGUAGE],
    siteName: SITE_CONFIG.siteName,
    images: {
      default: '/og-image.png',
      width: 1200,
      height: 630,
    },
  },
  
  // Twitter Card defaults
  twitter: {
    card: 'summary_large_image' as const,
    site: COMPANY_INFO.social.twitter,
    creator: COMPANY_INFO.social.twitter,
  },
  
  // Robots defaults
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
} as const;

// ============================================================================
// ANALYTICS & TRACKING
// ============================================================================

export const ANALYTICS_CONFIG = {
  // Google Analytics
  googleAnalytics: {
    enabled: !!ENV.ANALYTICS.GA_MEASUREMENT_ID,
    measurementId: ENV.ANALYTICS.GA_MEASUREMENT_ID,
  },
  
  // Google Tag Manager
  googleTagManager: {
    enabled: !!ENV.ANALYTICS.GTM_ID,
    containerId: ENV.ANALYTICS.GTM_ID,
  },
  
  // Facebook Pixel
  facebookPixel: {
    enabled: !!ENV.ANALYTICS.FB_PIXEL_ID,
    pixelId: ENV.ANALYTICS.FB_PIXEL_ID,
  },
  
  // LinkedIn Insight Tag
  linkedInInsight: {
    enabled: !!ENV.ANALYTICS.LINKEDIN_PARTNER_ID,
    partnerId: ENV.ANALYTICS.LINKEDIN_PARTNER_ID,
  },
  
  // Hotjar
  hotjar: {
    enabled: !!ENV.ANALYTICS.HOTJAR_ID,
    siteId: ENV.ANALYTICS.HOTJAR_ID,
    version: 6,
  },
  
  // Custom analytics endpoint
  custom: {
    enabled: !!ENV.ANALYTICS.ANALYTICS_ENDPOINT,
    endpoint: ENV.ANALYTICS.ANALYTICS_ENDPOINT,
  },
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS = {
  // Enable/disable cookie consent banner
  cookieConsent: ENV.FEATURES.ENABLE_COOKIE_CONSENT,
  
  // Enable/disable newsletter signup
  newsletter: ENV.FEATURES.ENABLE_NEWSLETTER,
  
  // Enable/disable live chat
  liveChat: ENV.FEATURES.ENABLE_LIVE_CHAT,
  
  // Enable/disable blog/resources section
  blog: ENV.FEATURES.ENABLE_BLOG,
  
  // Enable/disable case studies
  caseStudies: ENV.FEATURES.ENABLE_CASE_STUDIES,
  
  // Enable/disable pricing page
  pricing: ENV.FEATURES.ENABLE_PRICING,
  
  // Enable/disable multi-language support
  i18n: ENV.FEATURES.ENABLE_I18N,
} as const;

// ============================================================================
// ENVIRONMENT
// ============================================================================

export const ENVIRONMENT = {
  // Current environment
  env: ENV.NEXT.NODE_ENV,
  
  // Is production
  isProduction: ENV.NEXT.NODE_ENV === 'production',
  
  // Is development
  isDevelopment: ENV.NEXT.NODE_ENV === 'development',
  
  // Is test
  isTest: ENV.NEXT.NODE_ENV === 'test',
  
  // Base URL
  baseUrl: ENV.SITE.SITE_URL,
  
  // API URL (if separate from site)
  apiUrl: ENV.APP_URLS.API_URL,
} as const;

// ============================================================================
// FALLBACK ASSETS
// ============================================================================

export const FALLBACK_IMAGES = {
  article: '/placeholders/article.jpg',
  avatar: '/placeholders/avatar.jpg',
  default: '/placeholders/default.jpg',
  logo: '/logo.png',
  favicon: '/favicon.ico',
  ogImage: '/og-image.png',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the site name (can be overridden by CMS in the future)
 */
export function getSiteName(): string {
  return SITE_CONFIG.siteName;
}

/**
 * Get the site URL with trailing slash removed
 */
export function getSiteUrl(): string {
  return SITE_CONFIG.siteUrl.replace(/\/$/, '');
}

/**
 * Get absolute URL for a path
 */
export function getAbsoluteUrl(path: string): string {
  const baseUrl = getSiteUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Get locale string from language code
 */
export function getLocaleFromLanguage(lang: string): string {
  return LANGUAGE_LOCALES[lang as SupportedLanguage] || LANGUAGE_LOCALES[DEFAULT_LANGUAGE];
}

/**
 * Check if a language is supported
 */
export function isLanguageSupported(lang: string): lang is SupportedLanguage {
  return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
}

/**
 * Get language name from language code
 */
export function getLanguageName(lang: string): string {
  return LANGUAGE_NAMES[lang as SupportedLanguage] || LANGUAGE_NAMES[DEFAULT_LANGUAGE];
}

// ============================================================================
// EXPORTS
// ============================================================================

export default {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_NAMES,
  LANGUAGE_LOCALES,
  SITE_CONFIG,
  COMPANY_INFO,
  APP_URLS,
  SEO_CONFIG,
  ANALYTICS_CONFIG,
  FEATURE_FLAGS,
  ENVIRONMENT,
  FALLBACK_IMAGES,
  getSiteName,
  getSiteUrl,
  getAbsoluteUrl,
  getLocaleFromLanguage,
  isLanguageSupported,
  getLanguageName,
};

/**
 * Environment Variables Configuration
 * 
 * Centralized configuration for all environment variables used in the application.
 * This provides a single source of truth for env var access with:
 * - Type safety
 * - Default values
 * - Validation
 * - Clear documentation
 * 
 * Usage:
 * ```typescript
 * import { ENV } from '@/config/env.config';
 * 
 * const apiUrl = ENV.CMS.PAYLOAD_API_URL;
 * const webhookUrl = ENV.CONTACT.WEBHOOK_URL;
 * ```
 * 
 * IMPORTANT: Never access process.env directly in application code.
 * Always use this config module instead.
 */

// ============================================================================
// NEXT.JS ENVIRONMENT
// ============================================================================

export const NEXT_ENV = {
  /** Current Node environment (development, production, test) */
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  /** Next.js build ID (auto-generated) */
  BUILD_ID: process.env.__NEXT_BUILD_ID || '',
} as const;

// ============================================================================
// SITE CONFIGURATION
// ============================================================================

export const SITE_ENV = {
  /** Public site name/brand */
  SITE_NAME: process.env.NEXT_PUBLIC_SITE_NAME || 'Company',
  
  /** Public site URL (required for SEO and absolute URLs) */
  SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com',
  
  /** Company legal name */
  COMPANY_LEGAL_NAME: process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || 'Company Inc.',
  
  /** Company email address */
  COMPANY_EMAIL: process.env.NEXT_PUBLIC_COMPANY_EMAIL || 'hello@example.com',
  
  /** Company phone number (optional) */
  COMPANY_PHONE: process.env.NEXT_PUBLIC_COMPANY_PHONE || '',
  
  /** Site ID for multi-site deployments (optional) */
  SITE_ID: process.env.SITE_ID || '',
} as const;

// ============================================================================
// CMS CONFIGURATION
// ============================================================================

export const CMS_ENV = {
  /** CMS provider type ('payload' or 'mock') */
  PROVIDER: (process.env.NEXT_PUBLIC_CMS_PROVIDER as 'payload' | 'mock') || 'mock',
  
  /** Payload CMS public server URL (client-side accessible) */
  PAYLOAD_PUBLIC_SERVER_URL: process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3000',
  
  /** Payload CMS API URL (client-side accessible) */
  PAYLOAD_API_URL: process.env.NEXT_PUBLIC_PAYLOAD_API_URL || 'http://localhost:3000',
  
  /** Payload CMS API key for server-side requests (optional) */
  PAYLOAD_API_KEY: process.env.PAYLOAD_API_KEY || '',
} as const;

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export const THEME_ENV = {
  /** Default theme variant (default, dark, accent, light) */
  DEFAULT_THEME: (process.env.NEXT_PUBLIC_DEFAULT_THEME as 'default' | 'dark' | 'accent' | 'light') || 'default',
  
  /** Allow users to switch themes */
  ALLOW_THEME_SWITCHING: process.env.NEXT_PUBLIC_ALLOW_THEME_SWITCHING !== 'false',
  
  /** Default theme ID (legacy support) */
  DEFAULT_THEME_ID: process.env.DEFAULT_THEME_ID || 'default',
} as const;

// ============================================================================
// ANALYTICS & TRACKING
// ============================================================================

export const ANALYTICS_ENV = {
  /** Google Analytics 4 Measurement ID (format: G-XXXXXXXXXX) */
  GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  
  /** Google Tag Manager Container ID (format: GTM-XXXXXXX) */
  GTM_ID: process.env.NEXT_PUBLIC_GTM_ID || '',
  
  /** Facebook Pixel ID (numeric) */
  FB_PIXEL_ID: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '',
  
  /** LinkedIn Insight Tag Partner ID (numeric) */
  LINKEDIN_PARTNER_ID: process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || '',
  
  /** Hotjar Site ID (numeric) */
  HOTJAR_ID: process.env.NEXT_PUBLIC_HOTJAR_ID || '',
  
  /** Custom analytics endpoint URL (optional) */
  ANALYTICS_ENDPOINT: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '',
} as const;

// ============================================================================
// SOCIAL MEDIA
// ============================================================================

export const SOCIAL_ENV = {
  /** Twitter/X handle (with @) */
  TWITTER_HANDLE: process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@company',
  
  /** LinkedIn company URL */
  LINKEDIN_URL: process.env.NEXT_PUBLIC_LINKEDIN_URL || '',
  
  /** Facebook page URL */
  FACEBOOK_URL: process.env.NEXT_PUBLIC_FACEBOOK_URL || '',
  
  /** Instagram profile URL */
  INSTAGRAM_URL: process.env.NEXT_PUBLIC_INSTAGRAM_URL || '',
  
  /** YouTube channel URL */
  YOUTUBE_URL: process.env.NEXT_PUBLIC_YOUTUBE_URL || '',
} as const;

// ============================================================================
// EXTERNAL APPLICATION URLS
// ============================================================================

export const APP_URLS_ENV = {
  /** Main application login URL */
  APP_LOGIN_URL: process.env.NEXT_PUBLIC_APP_LOGIN_URL || 'https://app.example.com/login',
  
  /** Main application signup URL */
  APP_SIGNUP_URL: process.env.NEXT_PUBLIC_APP_SIGNUP_URL || 'https://app.example.com/signup',
  
  /** Admin/dashboard login URL */
  ADMIN_LOGIN_URL: process.env.NEXT_PUBLIC_ADMIN_LOGIN_URL || 'https://admin.example.com/login',
  
  /** Support portal URL */
  SUPPORT_URL: process.env.NEXT_PUBLIC_SUPPORT_URL || '',
  
  /** Documentation URL */
  DOCS_URL: process.env.NEXT_PUBLIC_DOCS_URL || '',
  
  /** API base URL (if separate from site) */
  API_URL: process.env.NEXT_PUBLIC_API_URL || '',
} as const;

// ============================================================================
// FEATURE FLAGS
// ============================================================================

export const FEATURE_FLAGS_ENV = {
  /** Enable cookie consent banner */
  ENABLE_COOKIE_CONSENT: process.env.NEXT_PUBLIC_ENABLE_COOKIE_CONSENT !== 'false',
  
  /** Enable newsletter signup */
  ENABLE_NEWSLETTER: process.env.NEXT_PUBLIC_ENABLE_NEWSLETTER !== 'false',
  
  /** Enable live chat widget */
  ENABLE_LIVE_CHAT: process.env.NEXT_PUBLIC_ENABLE_LIVE_CHAT === 'true',
  
  /** Enable blog/resources section */
  ENABLE_BLOG: process.env.NEXT_PUBLIC_ENABLE_BLOG !== 'false',
  
  /** Enable case studies section */
  ENABLE_CASE_STUDIES: process.env.NEXT_PUBLIC_ENABLE_CASE_STUDIES !== 'false',
  
  /** Enable pricing page */
  ENABLE_PRICING: process.env.NEXT_PUBLIC_ENABLE_PRICING !== 'false',
  
  /** Enable internationalization (i18n) */
  ENABLE_I18N: process.env.NEXT_PUBLIC_ENABLE_I18N !== 'false',
} as const;

// ============================================================================
// CONTACT & WEBHOOKS
// ============================================================================

export const CONTACT_ENV = {
  /** Contact form webhook URL (N8N or other automation) */
  WEBHOOK_URL: process.env.CONTACT_WEBHOOK_URL || '',
  
  /** Contact form webhook secret for authentication */
  WEBHOOK_SECRET: process.env.CONTACT_WEBHOOK_SECRET || '',
  
  /** Fallback email for contact form submissions */
  FALLBACK_EMAIL: process.env.CONTACT_FALLBACK_EMAIL || '',
  
  /** Contact form API endpoint */
  FORM_ENDPOINT: process.env.CONTACT_FORM_ENDPOINT || '/api/contact',
} as const;

// ============================================================================
// DATABASE & CACHING
// ============================================================================

export const DATABASE_ENV = {
  /** Redis connection URL (optional) */
  REDIS_URL: process.env.REDIS_URL || '',
  
  /** Database connection URL (if needed in future) */
  DATABASE_URL: process.env.DATABASE_URL || '',
} as const;

// ============================================================================
// LEGAL & COMPLIANCE
// ============================================================================

export const LEGAL_ENV = {
  /** Optional centralized legal content API */
  LEGAL_CONTENT_API_URL: process.env.LEGAL_CONTENT_API_URL || '',
} as const;

// ============================================================================
// AI & MACHINE EXPERIENCE
// ============================================================================

export const AI_ENV = {
  /** Enable AI markdown views for bots */
  ENABLE_MARKDOWN: process.env.NEXT_PUBLIC_ENABLE_AI_MARKDOWN !== 'false',

  /** Optional AI training signal header (requires legal review) */
  ENABLE_TRAINING_SIGNAL: process.env.NEXT_PUBLIC_ENABLE_AI_TRAINING_SIGNAL === 'true',

  /** Secret token for AI action endpoints */
  ACTIONS_SECRET: process.env.AI_ACTIONS_SECRET || '',

  /** Rate limit per minute for AI action endpoints */
  ACTIONS_RATE_LIMIT_PER_MIN: Number(process.env.AI_ACTIONS_RATE_LIMIT_PER_MIN || 30),
} as const;

// ============================================================================
// COMBINED ENV OBJECT
// ============================================================================

/**
 * Centralized environment configuration object.
 * Import this in your application code instead of accessing process.env directly.
 */
export const ENV = {
  /** Next.js environment variables */
  NEXT: NEXT_ENV,
  
  /** Site configuration */
  SITE: SITE_ENV,
  
  /** CMS configuration */
  CMS: CMS_ENV,
  
  /** Theme configuration */
  THEME: THEME_ENV,
  
  /** Analytics & tracking */
  ANALYTICS: ANALYTICS_ENV,
  
  /** Social media URLs */
  SOCIAL: SOCIAL_ENV,
  
  /** External application URLs */
  APP_URLS: APP_URLS_ENV,
  
  /** Feature flags */
  FEATURES: FEATURE_FLAGS_ENV,
  
  /** Contact & webhooks */
  CONTACT: CONTACT_ENV,

  /** Legal & compliance */
  LEGAL: LEGAL_ENV,
  
  /** Database & caching */
  DATABASE: DATABASE_ENV,

  /** AI & machine experience */
  AI: AI_ENV,
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if running in production environment
 */
export function isProduction(): boolean {
  return NEXT_ENV.NODE_ENV === 'production';
}

/**
 * Check if running in development environment
 */
export function isDevelopment(): boolean {
  return NEXT_ENV.NODE_ENV === 'development';
}

/**
 * Check if running in test environment
 */
export function isTest(): boolean {
  return NEXT_ENV.NODE_ENV === 'test';
}

/**
 * Check if a required environment variable is set
 * @param value - The environment variable value
 * @param name - The environment variable name (for error messages)
 * @throws Error if the variable is not set in production
 */
export function requireEnv(value: string, name: string): string {
  if (!value && isProduction()) {
    throw new Error(`Required environment variable ${name} is not set`);
  }
  return value;
}

/**
 * Validate that all required environment variables are set
 * Call this during application startup to fail fast
 */
export function validateRequiredEnvVars(): void {
  const errors: string[] = [];
  
  // Only validate in production
  if (!isProduction()) {
    return;
  }
  
  // Required variables in production
  const required = [
    { value: SITE_ENV.SITE_URL, name: 'NEXT_PUBLIC_SITE_URL' },
    { value: SITE_ENV.SITE_NAME, name: 'NEXT_PUBLIC_SITE_NAME' },
  ];
  
  for (const { value, name } of required) {
    let hostname = ''
    try {
      hostname = new URL(value).hostname.toLowerCase()
    } catch {
      hostname = ''
    }
    if (!value || hostname.endsWith('example.com')) {
      errors.push(name);
    }
  }
  
  if (errors.length > 0) {
    throw new Error(
      `Missing required environment variables in production: ${errors.join(', ')}`
    );
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ENV;

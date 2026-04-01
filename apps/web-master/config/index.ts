/**
 * Configuration Layer - Central Export
 * 
 * This module provides a single entry point for all configuration
 * across the Master Template. Import from here to access:
 * - Environment variables (ENV)
 * - Site configuration
 * - Theme configuration
 * - CMS configuration
 * 
 * Usage:
 * ```typescript
 * import { ENV } from '@/config';
 * import { SITE_CONFIG, getSiteName } from '@/config';
 * import { getTheme, THEMES } from '@/config';
 * import { CMS_PROVIDER, CMS_COLLECTIONS } from '@/config';
 * ```
 */

// ============================================================================
// ENVIRONMENT VARIABLES
// ============================================================================

export {
  // Main ENV object
  ENV,
  
  // Individual env groups
  NEXT_ENV,
  SITE_ENV,
  CMS_ENV,
  THEME_ENV,
  ANALYTICS_ENV,
  SOCIAL_ENV,
  APP_URLS_ENV,
  FEATURE_FLAGS_ENV,
  CONTACT_ENV,
  DATABASE_ENV,
  AI_ENV,
  LEGAL_ENV,
  
  // Helper functions
  isProduction,
  isDevelopment,
  isTest,
  requireEnv,
  validateRequiredEnvVars,
} from './env.config';

// ============================================================================
// SITE CONFIGURATION
// ============================================================================

export {
  // Constants
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
  
  // Types
  type SupportedLanguage,
  
  // Helper functions
  getSiteName,
  getSiteUrl,
  getAbsoluteUrl,
  getLocaleFromLanguage,
  isLanguageSupported,
  getLanguageName,
} from './site.config';

// ============================================================================
// AI & SEARCH CONFIGURATION
// ============================================================================

export {
  AI_ACTIONS_VERSION,
  getAiActions,
  AI_FEATURES,
} from './ai.config';

export {
  CRAWL_POLICY,
  buildLlmsTxt,
} from './search.config';

// ============================================================================
// THEME CONFIGURATION
// ============================================================================

export {
  // Constants
  DEFAULT_THEME,
  DARK_THEME,
  ACCENT_THEME,
  LIGHT_THEME,
  THEMES,
  THEME_CONFIG,
  
  // Types
  type ThemeVariant,
  type ThemeColors,
  type ThemeRadius,
  type ThemeTypography,
  type ThemeSpacing,
  type ThemeGradients,
  type ThemeShadows,
  type ThemeTokens,
  type Theme,
  
  // Helper functions
  getTheme,
  getThemeFromRequest,
  isValidThemeVariant,
  getThemeCSSVariables,
} from './theme.config';

// ============================================================================
// CMS CONFIGURATION
// ============================================================================

export {
  // Constants
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
  
  // Types
  type CMSCollection,
  type FieldType,
  type SectionType,
  type PageLayout,
  type CMSOfferType,
  type CMSResourceType,
  type CMSCaseStudyType,
  type CMSVideoType,
  type CMSFAQType,
  type CMSLegalType,
  type CMSSEOMeta,
  type CMSNavigationType,
  type CMSPageType,
  type TemplateConfig,
  
  // Helper functions
  buildCMSQuery,
  getCollectionEndpoint,
  getDocumentEndpoint,
  mapContentToSlots,
  getPageConfig,
} from './cms.config';

// ============================================================================
// RE-EXPORTS FOR CONVENIENCE
// ============================================================================

// Export everything from each config module
export * as envConfig from './env.config';
export * as siteConfig from './site.config';
export * as themeConfig from './theme.config';
export * as cmsConfig from './cms.config';

// ============================================================================
// COMBINED CONFIG OBJECT (Optional)
// ============================================================================

import envConfigDefault from './env.config';
import siteConfigDefault from './site.config';
import themeConfigDefault from './theme.config';
import cmsConfigDefault from './cms.config';
import aiConfigDefault from './ai.config';
import searchConfigDefault from './search.config';

/**
 * Combined configuration object
 * Useful for passing entire config to functions or components
 */
export const config = {
  env: envConfigDefault,
  site: siteConfigDefault,
  theme: themeConfigDefault,
  cms: cmsConfigDefault,
  ai: aiConfigDefault,
  search: searchConfigDefault,
} as const;

export default config;

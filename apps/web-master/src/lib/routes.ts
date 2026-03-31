/**
 * Centralized Route Helpers
 * 
 * Factory-safe route building utilities that ensure:
 * - Consistent URL patterns across the application
 * - i18n-correct paths with language prefixes
 * - Type-safe route generation
 * - Easy adaptation for secondary templates
 * 
 * Usage:
 * ```tsx
 * import { routes } from '@/lib/routes';
 * 
 * // Simple route
 * <Link href={routes.home(lang)}>Home</Link>
 * 
 * // Parameterized route
 * <Link href={routes.offer(lang, offerSlug)}>Offer</Link>
 * ```
 */

import type { SupportedLanguage } from '@/config';

/**
 * Base route builder that ensures language prefix
 */
function buildRoute(lang: string, path: string): string {
  // Ensure path starts with /
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${lang}${cleanPath}`;
}

/**
 * Route definitions organized by section
 */
export const routes = {
  // ============================================================================
  // CORE PAGES
  // ============================================================================
  
  /**
   * Home page
   */
  home: (lang: string): string => `/${lang}`,
  
  /**
   * About page
   */
  about: (lang: string): string => buildRoute(lang, '/about'),
  
  /**
   * Contact page
   */
  contact: (lang: string): string => buildRoute(lang, '/contact'),
  
  /**
   * Pricing page
   */
  pricing: (lang: string): string => buildRoute(lang, '/pricing'),
  
  // ============================================================================
  // OFFERS
  // ============================================================================
  
  /**
   * Offers landing page
   */
  offers: (lang: string): string => buildRoute(lang, '/offers'),
  
  /**
   * Individual offer page
   */
  offer: (lang: string, slug: string): string => buildRoute(lang, `/offers/${slug}`),
  
  // ============================================================================
  // RESOURCES
  // ============================================================================
  
  /**
   * Resources landing page
   */
  resources: (lang: string): string => buildRoute(lang, '/resources'),
  
  /**
   * Articles landing page
   */
  articles: (lang: string): string => buildRoute(lang, '/resources/articles'),
  
  /**
   * Individual article page
   */
  article: (lang: string, slug: string): string => buildRoute(lang, `/resources/articles/${slug}`),
  
  /**
   * Case studies landing page
   */
  caseStudies: (lang: string): string => buildRoute(lang, '/resources/cases'),
  
  /**
   * Individual case study page
   */
  caseStudy: (lang: string, slug: string): string => buildRoute(lang, `/resources/cases/${slug}`),
  
  /**
   * Videos landing page
   */
  videos: (lang: string): string => buildRoute(lang, '/resources/videos'),
  
  /**
   * Individual video page
   */
  video: (lang: string, slug: string): string => buildRoute(lang, `/resources/videos/${slug}`),
  
  /**
   * Help Centre / FAQ landing page
   */
  helpCentre: (lang: string): string => buildRoute(lang, '/resources/faq'),
  
  /**
   * Help category page
   */
  helpCategory: (lang: string, categorySlug: string): string => 
    buildRoute(lang, `/resources/faq/${categorySlug}`),
  
  /**
   * Help article page
   */
  helpArticle: (lang: string, categorySlug: string, articleSlug: string): string => 
    buildRoute(lang, `/resources/faq/${categorySlug}/${articleSlug}`),
  
  // ============================================================================
  // LEGAL
  // ============================================================================
  
  /**
   * Privacy policy page
   */
  privacyPolicy: (lang: string): string => buildRoute(lang, '/legal/privacy-policy'),
  
  /**
   * Terms of use page
   */
  termsOfUse: (lang: string): string => buildRoute(lang, '/legal/terms-of-use'),
  
  /**
   * Cookie policy page
   */
  cookiePolicy: (lang: string): string => buildRoute(lang, '/legal/cookie-policy'),
} as const;

/**
 * Resource type routes mapping
 * Useful for iterating over resource types
 */
export const resourceRoutes = {
  articles: routes.articles,
  cases: routes.caseStudies,
  videos: routes.videos,
  faq: routes.helpCentre,
} as const;

/**
 * Legal routes mapping
 * Useful for footer legal links
 */
export const legalRoutes = {
  'privacy-policy': routes.privacyPolicy,
  'terms-of-use': routes.termsOfUse,
  'cookie-policy': routes.cookiePolicy,
} as const;

/**
 * Breadcrumb builder utility
 * Generates breadcrumb items for a given route
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
  isActive?: boolean;
}

/**
 * Build breadcrumbs for common page types
 */
export const breadcrumbs = {
  /**
   * Offers landing breadcrumbs
   */
  offers: (lang: string, labels: { home: string; offers: string }): BreadcrumbItem[] => [
    { label: labels.home, href: routes.home(lang) },
    { label: labels.offers, href: routes.offers(lang), isActive: true },
  ],
  
  /**
   * Individual offer breadcrumbs
   */
  offer: (
    lang: string, 
    slug: string, 
    labels: { home: string; offers: string; offerTitle: string }
  ): BreadcrumbItem[] => [
    { label: labels.home, href: routes.home(lang) },
    { label: labels.offers, href: routes.offers(lang) },
    { label: labels.offerTitle, href: routes.offer(lang, slug), isActive: true },
  ],
  
  /**
   * Resources landing breadcrumbs
   */
  resources: (lang: string, labels: { home: string; resources: string }): BreadcrumbItem[] => [
    { label: labels.home, href: routes.home(lang) },
    { label: labels.resources, href: routes.resources(lang), isActive: true },
  ],
  
  /**
   * Resource type breadcrumbs (articles, cases, videos)
   */
  resourceType: (
    lang: string,
    type: 'articles' | 'cases' | 'videos' | 'faq',
    labels: { home: string; resources: string; typeLabel: string }
  ): BreadcrumbItem[] => {
    const typeRouteMap = {
      articles: routes.articles,
      cases: routes.caseStudies,
      videos: routes.videos,
      faq: routes.helpCentre,
    };
    
    return [
      { label: labels.home, href: routes.home(lang) },
      { label: labels.resources, href: routes.resources(lang) },
      { label: labels.typeLabel, href: typeRouteMap[type](lang), isActive: true },
    ];
  },
  
  /**
   * Individual resource item breadcrumbs
   */
  resourceItem: (
    lang: string,
    type: 'articles' | 'cases' | 'videos',
    slug: string,
    labels: { home: string; resources: string; typeLabel: string; itemTitle: string }
  ): BreadcrumbItem[] => {
    const typeRouteMap = {
      articles: { list: routes.articles, item: routes.article },
      cases: { list: routes.caseStudies, item: routes.caseStudy },
      videos: { list: routes.videos, item: routes.video },
    };
    
    const routes_map = typeRouteMap[type];
    
    return [
      { label: labels.home, href: routes.home(lang) },
      { label: labels.resources, href: routes.resources(lang) },
      { label: labels.typeLabel, href: routes_map.list(lang) },
      { label: labels.itemTitle, href: routes_map.item(lang, slug), isActive: true },
    ];
  },
  
  /**
   * Help article breadcrumbs
   */
  helpArticle: (
    lang: string,
    categorySlug: string,
    articleSlug: string,
    labels: { 
      home: string; 
      helpCentre: string; 
      categoryTitle?: string; 
      articleTitle: string 
    }
  ): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = [
      { label: labels.home, href: routes.home(lang) },
      { label: labels.helpCentre, href: routes.helpCentre(lang) },
    ];
    
    if (labels.categoryTitle) {
      items.push({
        label: labels.categoryTitle,
        href: routes.helpCategory(lang, categorySlug),
      });
    }
    
    items.push({
      label: labels.articleTitle,
      href: routes.helpArticle(lang, categorySlug, articleSlug),
      isActive: true,
    });
    
    return items;
  },
  
  /**
   * Simple page breadcrumbs (about, contact, pricing)
   */
  simplePage: (
    lang: string,
    pageType: 'about' | 'contact' | 'pricing',
    labels: { home: string; pageLabel: string }
  ): BreadcrumbItem[] => {
    const routeMap = {
      about: routes.about,
      contact: routes.contact,
      pricing: routes.pricing,
    };
    
    return [
      { label: labels.home, href: routes.home(lang) },
      { label: labels.pageLabel, href: routeMap[pageType](lang), isActive: true },
    ];
  },
};

/**
 * Export type for route keys (useful for type-safe route references)
 */
export type RouteKey = keyof typeof routes;
export type ResourceType = keyof typeof resourceRoutes;
export type LegalRouteKey = keyof typeof legalRoutes;

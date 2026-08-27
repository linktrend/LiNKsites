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
import { SUPPORTED_LANGUAGES } from '@/config';

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

export const FAMILY_IDS = ["home", "about", "contact", "legal", "collection", "detail"] as const;
export type FamilyId = (typeof FAMILY_IDS)[number];

export const RESERVED_PUBLIC_SLUGS = Object.freeze([
  "api",
  "admin",
  "login",
  "signup",
  "demo",
  "ai",
  "_ai",
  "sitemap.xml",
  "robots.txt",
  "llms.txt",
  "_next",
]);

export type RetirementMatch = "exact" | "prefix" | "glob";

export type RetirementRule = Readonly<{
  from: string;
  match?: RetirementMatch;
  redirectTo?: string;
  reason: "explicit-retirement-only";
}>;

/** Stale or retired paths redirect only when an explicit target is declared. */
export const EXPLICIT_RETIREMENTS: readonly RetirementRule[] = Object.freeze([
  { from: "home", redirectTo: "", reason: "explicit-retirement-only" },
  { from: "index", reason: "explicit-retirement-only" },
  { from: "resources/docs", match: "prefix", redirectTo: "resources", reason: "explicit-retirement-only" },
  { from: "resources/faq/*/*", match: "glob", redirectTo: "resources/faq/*", reason: "explicit-retirement-only" },
]);

export class FamilyRouteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FamilyRouteError";
  }
}

export type FamilyRouteDecision =
  | Readonly<{ kind: "ok"; family: FamilyId; locale: SupportedLanguage; pathname: string }>
  | Readonly<{ kind: "redirect"; to: string; family: FamilyId; locale: SupportedLanguage }>
  | Readonly<{ kind: "collision"; reason: string }>
  | Readonly<{ kind: "not_found"; reason: string }>;

const isSupportedLocale = (value: string): value is SupportedLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

const normalizePath = (pathname: string): string => {
  const trimmed = pathname.trim();
  if (!trimmed) return "/";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, "") || "/";
};

export function parseLocalePrefix(pathname: string): { locale: SupportedLanguage; rest: string[] } | null {
  const parts = normalizePath(pathname).split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const locale = parts[0];
  if (!isSupportedLocale(locale)) return null;
  return { locale, rest: parts.slice(1) };
}

export function familyPath(locale: SupportedLanguage, family: FamilyId, slug?: string): string {
  switch (family) {
    case "home":
      return routes.home(locale);
    case "about":
      return routes.about(locale);
    case "contact":
      return routes.contact(locale);
    case "legal":
      return slug ? buildRoute(locale, `/legal/${slug}`) : buildRoute(locale, "/legal");
    case "collection":
      return slug ? buildRoute(locale, `/${slug}`) : routes.offers(locale);
    case "detail":
      if (!slug) throw new FamilyRouteError("detail family requires a slug");
      return buildRoute(locale, `/${slug}`);
    default: {
      const exhaustive: never = family;
      throw new FamilyRouteError(`Unknown family "${String(exhaustive)}"`);
    }
  }
}

const COLLECTION_ROOTS = new Set(["offers", "resources", "legal"]);
const RESOURCE_COLLECTIONS = new Set(["articles", "cases", "videos", "faq", "docs"]);
const LEGAL_DETAILS = new Set(["privacy-policy", "terms-of-use", "cookie-policy"]);

function pathSegments(value: string): string[] {
  return value.split("/").filter(Boolean);
}

function matchesRetirement(rule: RetirementRule, rest: string[]): boolean {
  const mode: RetirementMatch = rule.match ?? "exact";
  const fromParts = pathSegments(rule.from);
  switch (mode) {
    case "exact":
      return rule.from === rest.join("/");
    case "prefix":
      return rest.length >= fromParts.length && fromParts.every((part, index) => rest[index] === part);
    case "glob":
      return fromParts.length === rest.length && fromParts.every((part, index) => part === "*" || part === rest[index]);
    default: {
      const exhaustive: never = mode;
      throw new FamilyRouteError(`Unknown retirement match "${String(exhaustive)}"`);
    }
  }
}

function fillRetirementTarget(rule: RetirementRule, rest: string[]): string {
  const target = rule.redirectTo ?? "";
  if (!target.includes("*")) return target;
  const fromParts = pathSegments(rule.from);
  const captured = fromParts.flatMap((part, index) => (part === "*" ? [rest[index] ?? ""] : []));
  let filled = target;
  for (const value of captured) {
    filled = filled.replace("*", value);
  }
  return filled;
}

function retirementFamily(target: string): FamilyId {
  if (!target || target === "home") return "home";
  if (target === "about") return "about";
  if (target === "contact") return "contact";
  if (target === "legal" || target.startsWith("legal/")) return target.split("/").length === 2 ? "legal" : "collection";
  return "collection";
}

export function resolveFamilyRoute(pathname: string): FamilyRouteDecision {
  const normalized = normalizePath(pathname);
  const parsed = parseLocalePrefix(normalized);
  if (!parsed) {
    return { kind: "not_found", reason: "locale-prefix" };
  }
  const { locale, rest } = parsed;
  const head = rest[0] ?? "";

  if (head && RESERVED_PUBLIC_SLUGS.includes(head)) {
    return { kind: "collision", reason: "reserved-slug" };
  }

  const retirement = EXPLICIT_RETIREMENTS.find((rule) => matchesRetirement(rule, rest));
  if (retirement) {
    if (typeof retirement.redirectTo === "string") {
      const filled = fillRetirementTarget(retirement, rest);
      const to = filled ? `/${locale}/${filled}` : `/${locale}`;
      return { kind: "redirect", to, family: retirementFamily(filled), locale };
    }
    return { kind: "not_found", reason: "explicit-retirement-only" };
  }

  if (rest.length === 0) {
    return { kind: "ok", family: "home", locale, pathname: routes.home(locale) };
  }

  if (rest.length === 1 && rest[0] === "about") {
    return { kind: "ok", family: "about", locale, pathname: routes.about(locale) };
  }

  if (rest.length === 1 && rest[0] === "contact") {
    return { kind: "ok", family: "contact", locale, pathname: routes.contact(locale) };
  }

  if (rest[0] === "legal") {
    if (rest.length === 1) {
      return { kind: "ok", family: "collection", locale, pathname: familyPath(locale, "legal") };
    }
    if (rest.length === 2 && LEGAL_DETAILS.has(rest[1])) {
      return { kind: "ok", family: "legal", locale, pathname: familyPath(locale, "legal", rest[1]) };
    }
    return { kind: "not_found", reason: "unknown-legal-slug" };
  }

  if (rest[0] === "offers") {
    if (rest.length === 1) return { kind: "ok", family: "collection", locale, pathname: routes.offers(locale) };
    if (rest.length === 2) return { kind: "ok", family: "detail", locale, pathname: routes.offer(locale, rest[1]) };
    return { kind: "collision", reason: "offer-depth" };
  }

  if (rest[0] === "resources") {
    if (rest.length === 1) return { kind: "ok", family: "collection", locale, pathname: routes.resources(locale) };
    if (rest[1] === "faq" && rest.length > 4) {
      return { kind: "collision", reason: "faq-article-depth" };
    }
    if (rest.length === 2 && RESOURCE_COLLECTIONS.has(rest[1])) {
      return { kind: "ok", family: "collection", locale, pathname: buildRoute(locale, `/resources/${rest[1]}`) };
    }
    if (rest.length >= 3 && RESOURCE_COLLECTIONS.has(rest[1])) {
      return { kind: "ok", family: "detail", locale, pathname: normalized };
    }
    return { kind: "not_found", reason: "unknown-resource-family" };
  }

  if (COLLECTION_ROOTS.has(head) && rest.length > 3) {
    return { kind: "collision", reason: "stale-redirect" };
  }

  if (rest.length === 1) {
    return { kind: "ok", family: "detail", locale, pathname: `/${locale}/${rest[0]}` };
  }

  return { kind: "not_found", reason: "unclassified-path" };
}

export function tenantSafeWhere(siteId: string, locale: string): { siteId: string; locale: string } {
  if (!siteId || !locale) {
    throw new FamilyRouteError("tenant-safe query requires siteId and locale");
  }
  return { siteId, locale };
}

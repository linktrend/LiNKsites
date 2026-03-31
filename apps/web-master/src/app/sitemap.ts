/**
 * Sitemap Configuration
 * 
 * This file generates the sitemap.xml for search engines.
 * It uses Next.js App Router's built-in sitemap generation.
 * 
 * Features:
 * - Dynamic route generation from CMS content
 * - Multi-language support with language alternates
 * - Configurable priority and change frequency
 * - Environment-aware base URL
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */

import { MetadataRoute } from 'next';
import { headers } from "next/headers";
import { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/config';
import { normalizeLocale } from "@/lib/locale-context";
import { listOffers } from "@/lib/repository/offers";
import { listArticles } from "@/lib/repository/articles";
import { listCaseStudies } from "@/lib/repository/caseStudies";
import { listVideos } from "@/lib/repository/videos";
import { payloadFind } from "@/lib/payload-client";
import { siteLocaleFilter } from "@/lib/repository/shared-filters";
import { getSiteIdFromRequest } from "@/lib/site-context";

export const dynamic = "force-dynamic";

/**
 * Priority levels for different page types
 */
const PRIORITIES = {
  homepage: 1.0,
  mainPages: 0.9,      // About, Contact, Pricing
  offers: 0.8,         // Offer pages
  resources: 0.7,      // Resource pages, articles, videos
  cases: 0.7,          // Case studies
  faq: 0.6,            // FAQ pages
  legal: 0.3,          // Legal pages
} as const;

/**
 * Change frequency for different page types
 */
const CHANGE_FREQ = {
  homepage: 'daily',
  mainPages: 'weekly',
  offers: 'weekly',
  resources: 'weekly',
  cases: 'monthly',
  faq: 'monthly',
  legal: 'yearly',
} as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const baseUrl = host ? `${proto}://${host}` : "https://example.com";

  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(DEFAULT_LANGUAGE);
  const fallback: {
    offers: any[];
    resources: any[];
    videos: any[];
    cases: any[];
    pages: any[];
  } = {
    offers: [],
    resources: [],
    videos: [],
    cases: [],
    pages: [],
  };
  let cmsData: typeof fallback = fallback;
  try {
    if (!siteId) return [];
    const [offers, resources, videos, cases] = await Promise.all([
      listOffers({ siteId, locale }),
      listArticles({ siteId, locale }),
      listVideos({ siteId, locale }),
      listCaseStudies({ siteId, locale }),
    ]);
    const pages = await payloadFind<any>({
      collection: "pages",
      where: siteLocaleFilter(siteId, locale),
      depth: 0,
      locale,
      site: siteId,
    }).then((res) => res.docs ?? []);
    cmsData = { offers, resources, videos, cases, pages };
  } catch (error) {
    console.warn("[sitemap] Falling back to empty CMS data", error);
  }
  
  const sitemapEntries: MetadataRoute.Sitemap = [];

  // Helper function to create language alternates
  const createAlternates = (path: string) => {
    const alternates: Record<string, string> = {};
    
    SUPPORTED_LANGUAGES.forEach((lang) => {
      alternates[lang] = `${baseUrl}/${lang}${path}`;
    });
    
    return {
      languages: alternates,
    };
  };

  // ============================================================================
  // CMS PAGES
  // ============================================================================

  if (Array.isArray((cmsData as any).pages)) {
    (cmsData as any).pages.forEach((page: any) => {
      if (page.slug) {
        SUPPORTED_LANGUAGES.forEach((lang) => {
          sitemapEntries.push({
            url: `${baseUrl}/${lang}/${page.slug === "home" ? "" : page.slug}`,
            lastModified: new Date(),
            changeFrequency: CHANGE_FREQ.resources,
            priority: PRIORITIES.resources,
            alternates: createAlternates(`/${page.slug === "home" ? "" : page.slug}`),
          });
        });
      }
    });
  }

  // ============================================================================
  // HOMEPAGE
  // ============================================================================
  
  SUPPORTED_LANGUAGES.forEach((lang) => {
    sitemapEntries.push({
      url: `${baseUrl}/${lang}`,
      lastModified: new Date(),
      changeFrequency: CHANGE_FREQ.homepage,
      priority: PRIORITIES.homepage,
      alternates: createAlternates(''),
    });
  });

  // ============================================================================
  // MAIN PAGES (About, Contact, Pricing)
  // ============================================================================
  
  const mainPages = [
    '/about',
    '/contact',
    '/pricing',
  ];

  mainPages.forEach((page) => {
    SUPPORTED_LANGUAGES.forEach((lang) => {
      sitemapEntries.push({
        url: `${baseUrl}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: CHANGE_FREQ.mainPages,
        priority: PRIORITIES.mainPages,
        alternates: createAlternates(page),
      });
    });
  });

  // ============================================================================
  // OFFERS
  // ============================================================================
  
  // Offers index page
  SUPPORTED_LANGUAGES.forEach((lang) => {
    sitemapEntries.push({
      url: `${baseUrl}/${lang}/offers`,
      lastModified: new Date(),
      changeFrequency: CHANGE_FREQ.offers,
      priority: PRIORITIES.offers,
      alternates: createAlternates('/offers'),
    });
  });

  // Individual offer pages
  if (cmsData.offers && Array.isArray(cmsData.offers)) {
    cmsData.offers
      .filter((offer: any) => offer.status === 'published')
      .forEach((offer: any) => {
        SUPPORTED_LANGUAGES.forEach((lang) => {
          sitemapEntries.push({
            url: `${baseUrl}/${lang}/offers/${offer.slug}`,
            lastModified: new Date(),
            changeFrequency: CHANGE_FREQ.offers,
            priority: PRIORITIES.offers,
            alternates: createAlternates(`/offers/${offer.slug}`),
          });
        });
      });
  }

  // ============================================================================
  // RESOURCES
  // ============================================================================
  
  // Resources index page
  SUPPORTED_LANGUAGES.forEach((lang) => {
    sitemapEntries.push({
      url: `${baseUrl}/${lang}/resources`,
      lastModified: new Date(),
      changeFrequency: CHANGE_FREQ.resources,
      priority: PRIORITIES.resources,
      alternates: createAlternates('/resources'),
    });
  });

  // Resource category pages
  const resourceCategories = [
    '/resources/articles',
    '/resources/videos',
    '/resources/cases',
    '/resources/faq',
    '/resources/docs',
  ];

  resourceCategories.forEach((category) => {
    SUPPORTED_LANGUAGES.forEach((lang) => {
      sitemapEntries.push({
        url: `${baseUrl}/${lang}${category}`,
        lastModified: new Date(),
        changeFrequency: CHANGE_FREQ.resources,
        priority: PRIORITIES.resources,
        alternates: createAlternates(category),
      });
    });
  });

  // Individual articles
  if (cmsData.resources && Array.isArray(cmsData.resources)) {
    cmsData.resources
      .filter((resource: any) => resource.status === 'published')
      .forEach((article: any) => {
        SUPPORTED_LANGUAGES.forEach((lang) => {
          sitemapEntries.push({
            url: `${baseUrl}/${lang}/resources/articles/${article.slug}`,
            lastModified: new Date(),
            changeFrequency: CHANGE_FREQ.resources,
            priority: PRIORITIES.resources,
            alternates: createAlternates(`/resources/articles/${article.slug}`),
          });
        });
      });
  }

  // ============================================================================
  // VIDEOS
  // ============================================================================
  
  if (cmsData.videos && Array.isArray(cmsData.videos)) {
    cmsData.videos
      .filter((video: any) => video.status === 'published')
      .forEach((video: any) => {
        SUPPORTED_LANGUAGES.forEach((lang) => {
          sitemapEntries.push({
            url: `${baseUrl}/${lang}/resources/videos/${video.slug}`,
            lastModified: new Date(),
            changeFrequency: CHANGE_FREQ.resources,
            priority: PRIORITIES.resources,
            alternates: createAlternates(`/resources/videos/${video.slug}`),
          });
        });
      });
  }

  // ============================================================================
  // CASE STUDIES
  // ============================================================================
  
  if (cmsData.cases && Array.isArray(cmsData.cases)) {
    cmsData.cases
      .filter((caseStudy: any) => caseStudy.status === 'published')
      .forEach((caseStudy: any) => {
        SUPPORTED_LANGUAGES.forEach((lang) => {
          sitemapEntries.push({
            url: `${baseUrl}/${lang}/resources/cases/${caseStudy.slug}`,
            lastModified: new Date(),
            changeFrequency: CHANGE_FREQ.cases,
            priority: PRIORITIES.cases,
            alternates: createAlternates(`/resources/cases/${caseStudy.slug}`),
          });
        });
      });
  }

  // ============================================================================
  // FAQ
  // ============================================================================
  
  // Note: FAQ pages use a separate help system with mock data (helpMockData.ts)
  // The FAQ collection in CMS doesn't have slug fields for individual articles.
  // FAQ category pages are statically defined. The FAQ index page is already
  // included in the resource category pages above.
  
  // If you need to add FAQ category pages, you can manually define them here:
  // const faqCategories = ['getting-started', 'billing', 'technical', 'account'];
  // Or import them from the help system: import { getCategories } from '@/lib/helpMockData';

  // ============================================================================
  // LEGAL PAGES
  // ============================================================================

  const legalPages = [
    "/legal/terms-of-use",
    "/legal/privacy-policy",
    "/legal/cookie-policy",
  ];
  legalPages.forEach((page) => {
    SUPPORTED_LANGUAGES.forEach((lang) => {
      sitemapEntries.push({
        url: `${baseUrl}/${lang}${page}`,
        lastModified: new Date(),
        changeFrequency: CHANGE_FREQ.legal,
        priority: PRIORITIES.legal,
        alternates: createAlternates(page),
      });
    });
  });

  return sitemapEntries;
}

/**
 * CUSTOMIZATION GUIDE FOR SECONDARY TEMPLATES & CLIENT SITES
 * ===========================================================
 * 
 * To customize sitemap generation:
 * 
 * 1. Override this file in your secondary template or client site
 * 2. Import and extend the base sitemap:
 * 
 * ```typescript
 * import baseSitemap from '@master-template/app/sitemap';
 * 
 * export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
 *   const baseEntries = await baseSitemap();
 *   
 *   // Add custom entries
 *   const customEntries: MetadataRoute.Sitemap = [
 *     {
 *       url: 'https://yourdomain.com/custom-page',
 *       lastModified: new Date(),
 *       changeFrequency: 'weekly',
 *       priority: 0.8,
 *     },
 *   ];
 *   
 *   return [...baseEntries, ...customEntries];
 * }
 * ```
 * 
 * 3. Adjust priorities and change frequencies:
 * 
 * ```typescript
 * const CUSTOM_PRIORITIES = {
 *   homepage: 1.0,
 *   blog: 0.9,  // Higher priority for blog
 *   products: 0.8,
 * };
 * ```
 * 
 * 4. Filter content by custom criteria:
 * 
 * ```typescript
 * cmsData.offers
 *   .filter((offer) => offer.status === 'published' && offer.featured)
 *   .forEach((offer) => {
 *     // Add to sitemap
 *   });
 * ```
 * 
 * 5. Add custom metadata:
 * 
 * ```typescript
 * {
 *   url: 'https://yourdomain.com/page',
 *   lastModified: new Date(content.updatedAt),
 *   changeFrequency: 'daily',
 *   priority: 0.9,
 *   images: ['https://yourdomain.com/image.jpg'],
 * }
 * ```
 * 
 * 6. Create separate sitemaps for large sites:
 * 
 * Create additional sitemap files:
 * - sitemap-blog.ts
 * - sitemap-products.ts
 * 
 * Then create a sitemap index in sitemap.ts:
 * 
 * ```typescript
 * export default function sitemap(): MetadataRoute.Sitemap {
 *   return [
 *     {
 *       url: 'https://yourdomain.com/sitemap-blog.xml',
 *     },
 *     {
 *       url: 'https://yourdomain.com/sitemap-products.xml',
 *     },
 *   ];
 * }
 * ```
 */

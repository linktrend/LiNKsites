/**
 * Robots.txt Configuration
 * 
 * This file generates the robots.txt file for search engine crawlers.
 * It uses Next.js App Router's built-in robots.txt generation.
 * 
 * Features:
 * - Environment-based behavior (disallow crawling in non-production)
 * - Configurable via @/config
 * - Supports multiple languages and paths
 * - References sitemap location
 * 
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */

import { MetadataRoute } from 'next';
import { headers } from "next/headers";
import { ENVIRONMENT, CRAWL_POLICY } from '@/config';

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const baseUrl = host ? `${proto}://${host}` : "https://example.com";
  const isProduction = ENVIRONMENT.isProduction;
  
  // In non-production environments, disallow all crawling
  if (!isProduction) {
    return {
      rules: {
        userAgent: '*',
        disallow: '/',
      },
    };
  }

  // Production robots.txt configuration
  return {
    rules: [
      {
        userAgent: '*',
        allow: [...CRAWL_POLICY.allow],
        disallow: [...CRAWL_POLICY.disallow],
      },
      ...CRAWL_POLICY.aiBotsDisallow.map((bot) => ({
        userAgent: bot,
        disallow: '/',
      })),
    ],
    sitemap: `${baseUrl}${CRAWL_POLICY.sitemapPath}`,
    host: baseUrl,
  };
}

/**
 * CUSTOMIZATION GUIDE FOR SECONDARY TEMPLATES & CLIENT SITES
 * ===========================================================
 * 
 * To customize robots.txt behavior:
 * 
 * 1. Override this file in your secondary template or client site
 * 2. Import and extend the base configuration:
 * 
 * ```typescript
 * import baseRobots from '@master-template/app/robots';
 * 
 * export default function robots(): MetadataRoute.Robots {
 *   const base = baseRobots();
 *   
 *   return {
 *     ...base,
 *     rules: [
 *       ...base.rules,
 *       {
 *         userAgent: 'CustomBot',
 *         disallow: '/custom-path/',
 *       },
 *     ],
 *   };
 * }
 * ```
 * 
 * 3. Add environment-specific behavior via .env:
 * 
 * ```env
 * NODE_ENV=production
 * NEXT_PUBLIC_SITE_URL=https://yourdomain.com
 * ```
 * 
 * 4. Common customizations:
 * 
 * - Disallow specific sections:
 *   disallow: ['/blog/', '/resources/']
 * 
 * - Allow specific bots:
 *   { userAgent: 'Googlebot', allow: '/' }
 * 
 * - Add crawl delay:
 *   { userAgent: '*', allow: '/', crawlDelay: 10 }
 * 
 * - Multiple sitemaps:
 *   sitemap: [
 *     `${baseUrl}/sitemap.xml`,
 *     `${baseUrl}/sitemap-news.xml`,
 *   ]
 */

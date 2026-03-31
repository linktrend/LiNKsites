# Search Engine Infrastructure - Implementation Complete

**Agent 17 Deliverable**  
**Date:** December 3, 2025  
**Status:** ✅ Complete

---

## Overview

This document describes the search engine infrastructure files implemented for the Master Template. These files provide a production-ready baseline for SEO optimization and search engine discoverability.

## Implemented Files

### 1. `/src/app/robots.ts`

**Purpose:** Generates the `robots.txt` file that instructs search engine crawlers which pages they can or cannot access.

**Features:**
- ✅ Environment-based behavior (disallows crawling in non-production)
- ✅ Configurable via `@/config`
- ✅ Supports multiple languages and paths
- ✅ References sitemap location
- ✅ Blocks AI training bots (GPTBot, ChatGPT-User)

**Configuration:**

The robots.txt behavior is controlled by:
- `ENVIRONMENT.isProduction` from `@/config`
- `getSiteUrl()` for base URL
- `SUPPORTED_LANGUAGES` for language paths

**Default Production Rules:**

```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

Sitemap: https://yourdomain.com/sitemap.xml
Host: https://yourdomain.com
```

**Non-Production Behavior:**

In development, staging, or test environments:
```
User-agent: *
Disallow: /
```

This prevents search engines from indexing non-production sites.

---

### 2. `/src/app/sitemap.ts`

**Purpose:** Generates the `sitemap.xml` file that helps search engines discover and index all pages on the site.

**Features:**
- ✅ Dynamic route generation from CMS content
- ✅ Multi-language support with language alternates
- ✅ Configurable priority and change frequency
- ✅ Environment-aware base URL
- ✅ Filters published content only

**Content Types Included:**

| Content Type | Priority | Change Frequency | Example URL |
|--------------|----------|------------------|-------------|
| Homepage | 1.0 | daily | `/en` |
| Main Pages | 0.9 | weekly | `/en/about`, `/en/contact`, `/en/pricing` |
| Offers | 0.8 | weekly | `/en/offers/ai-automation-platform` |
| Resources | 0.7 | weekly | `/en/resources/articles/article-slug` |
| Case Studies | 0.7 | monthly | `/en/resources/cases/case-slug` |
| FAQ | 0.6 | monthly | `/en/resources/faq/category/question-slug` |
| Legal Pages | 0.3 | yearly | `/en/legal/privacy-policy` |

**Language Alternates:**

Each URL includes language alternates for all supported languages:

```xml
<url>
  <loc>https://yourdomain.com/en/about</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://yourdomain.com/en/about"/>
  <xhtml:link rel="alternate" hreflang="es" href="https://yourdomain.com/es/about"/>
  <xhtml:link rel="alternate" hreflang="zh-tw" href="https://yourdomain.com/zh-tw/about"/>
  <xhtml:link rel="alternate" hreflang="zh-cn" href="https://yourdomain.com/zh-cn/about"/>
</url>
```

**CMS Integration:**

The sitemap automatically pulls content from:
- `cmsData.offers` - Product/service offerings
- `cmsData.resources` - Articles and resources
- `cmsData.videos` - Video content
- `cmsData.cases` - Case studies
- `cmsData.faq` - FAQ articles
- `cmsData.legal` - Legal pages

Only content with `status: 'published'` is included in the sitemap.

---

## How It Works

### Next.js App Router Integration

Both files use Next.js 14's built-in metadata API:

```typescript
// robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { /* ... */ },
    sitemap: 'https://yourdomain.com/sitemap.xml',
  };
}
```

```typescript
// sitemap.ts
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return [
    {
      url: 'https://yourdomain.com/page',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
      alternates: { /* ... */ },
    },
  ];
}
```

Next.js automatically:
- Generates `/robots.txt` at build time
- Generates `/sitemap.xml` at build time (or on-demand)
- Serves these files at the root of your domain
- Handles proper content types and formatting

### Configuration via `@/config`

Both files read from the centralized configuration:

```typescript
import { 
  ENVIRONMENT,           // Environment detection
  getSiteUrl,           // Base URL
  SUPPORTED_LANGUAGES,  // Language codes
  DEFAULT_LANGUAGE,     // Fallback language
} from '@/config';
```

This ensures consistency across the application and makes it easy to update settings in one place.

### CMS Content Integration

The sitemap dynamically fetches content from the CMS:

```typescript
import { getCmsPayload } from '@/lib/contentClient';

const cmsData = await getCmsPayload();
```

This works with both:
- **Mock CMS** (file-based, default)
- **Payload CMS** (when `NEXT_PUBLIC_CMS_PROVIDER=payload`)

The sitemap automatically adapts to the available content without code changes.

---

## Environment Behavior

### Development Environment

**robots.txt:**
```
User-agent: *
Disallow: /
```

**sitemap.xml:**
- Still generated for testing
- Uses `http://localhost:3000` as base URL

### Staging Environment

**robots.txt:**
```
User-agent: *
Disallow: /
```

**sitemap.xml:**
- Generated with staging URL
- Prevents accidental indexing of staging site

### Production Environment

**robots.txt:**
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

Sitemap: https://yourdomain.com/sitemap.xml
```

**sitemap.xml:**
- Full sitemap with all published content
- Production URL from `NEXT_PUBLIC_SITE_URL`

---

## Customization Guide

### For Secondary Templates

Secondary templates can extend or override the base implementation:

#### Option 1: Extend Base Configuration

```typescript
// secondary-template/src/app/robots.ts
import baseRobots from '@master-template/app/robots';

export default function robots(): MetadataRoute.Robots {
  const base = baseRobots();
  
  return {
    ...base,
    rules: [
      ...base.rules,
      {
        userAgent: 'CustomBot',
        disallow: '/custom-path/',
      },
    ],
  };
}
```

#### Option 2: Complete Override

```typescript
// secondary-template/src/app/robots.ts
import { MetadataRoute } from 'next';
import { ENVIRONMENT, getSiteUrl } from '@/config';

export default function robots(): MetadataRoute.Robots {
  // Your custom implementation
  return {
    rules: { /* custom rules */ },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
```

### For Client Sites

Client sites can customize via:

#### 1. Environment Variables

```env
# .env.production
NEXT_PUBLIC_SITE_URL=https://clientdomain.com
NODE_ENV=production
```

#### 2. Override Files

Place custom `robots.ts` or `sitemap.ts` in the client site's `src/app/` directory.

#### 3. Extend Configuration

```typescript
// client-site/src/app/sitemap.ts
import baseSitemap from '@master-template/app/sitemap';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries = await baseSitemap();
  
  // Add client-specific pages
  const customEntries: MetadataRoute.Sitemap = [
    {
      url: 'https://clientdomain.com/custom-page',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
  
  return [...baseEntries, ...customEntries];
}
```

---

## Common Customizations

### 1. Adjust Priorities

```typescript
const PRIORITIES = {
  homepage: 1.0,
  blog: 0.9,        // Increase blog priority
  products: 0.8,
  support: 0.5,
};
```

### 2. Change Frequencies

```typescript
const CHANGE_FREQ = {
  homepage: 'hourly',   // More frequent updates
  blog: 'daily',
  products: 'weekly',
  legal: 'yearly',
};
```

### 3. Block Specific Bots

```typescript
{
  userAgent: 'BadBot',
  disallow: '/',
}
```

### 4. Allow Specific Paths for Specific Bots

```typescript
{
  userAgent: 'Googlebot',
  allow: '/special-content/',
  disallow: '/api/',
}
```

### 5. Add Crawl Delay

```typescript
{
  userAgent: '*',
  allow: '/',
  crawlDelay: 10,  // 10 seconds between requests
}
```

### 6. Filter Content by Criteria

```typescript
cmsData.offers
  .filter((offer) => 
    offer.status === 'published' && 
    offer.featured === true
  )
  .forEach((offer) => {
    // Add to sitemap
  });
```

### 7. Add Image Metadata

```typescript
{
  url: 'https://yourdomain.com/page',
  lastModified: new Date(),
  changeFrequency: 'weekly',
  priority: 0.8,
  images: ['https://yourdomain.com/image.jpg'],
}
```

### 8. Create Multiple Sitemaps (for large sites)

For sites with thousands of URLs, create separate sitemaps:

```typescript
// src/app/sitemap-blog.ts
export default async function sitemapBlog(): Promise<MetadataRoute.Sitemap> {
  // Blog entries only
}

// src/app/sitemap-products.ts
export default async function sitemapProducts(): Promise<MetadataRoute.Sitemap> {
  // Product entries only
}

// src/app/sitemap.ts (index)
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://yourdomain.com/sitemap-blog.xml',
    },
    {
      url: 'https://yourdomain.com/sitemap-products.xml',
    },
  ];
}
```

---

## Testing

### Test robots.txt

**Local:**
```bash
curl http://localhost:3000/robots.txt
```

**Production:**
```bash
curl https://yourdomain.com/robots.txt
```

**Expected Output (Production):**
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /_next/
Disallow: /private/

User-agent: GPTBot
Disallow: /

User-agent: ChatGPT-User
Disallow: /

Sitemap: https://yourdomain.com/sitemap.xml
Host: https://yourdomain.com
```

### Test sitemap.xml

**Local:**
```bash
curl http://localhost:3000/sitemap.xml
```

**Production:**
```bash
curl https://yourdomain.com/sitemap.xml
```

**Validate Sitemap:**
1. Use [Google Search Console](https://search.google.com/search-console)
2. Use [XML Sitemap Validator](https://www.xml-sitemaps.com/validate-xml-sitemap.html)
3. Use [Screaming Frog SEO Spider](https://www.screamingfrog.co.uk/seo-spider/)

### Test Language Alternates

Check that each URL includes proper hreflang tags:

```bash
curl https://yourdomain.com/sitemap.xml | grep -A 5 "xhtml:link"
```

---

## SEO Best Practices

### 1. Keep Sitemap Under 50,000 URLs

If your site grows beyond 50,000 URLs, split into multiple sitemaps.

### 2. Update Sitemap Regularly

The sitemap is generated dynamically from CMS content, so it updates automatically when content changes.

### 3. Submit to Search Engines

After deployment:
- Submit to [Google Search Console](https://search.google.com/search-console)
- Submit to [Bing Webmaster Tools](https://www.bing.com/webmasters)

### 4. Monitor Crawl Errors

Use Google Search Console to monitor:
- Crawl errors
- Coverage issues
- Index status

### 5. Use Proper Priorities

Don't set everything to priority 1.0. Use the priority scale meaningfully:
- 1.0 = Homepage
- 0.8-0.9 = Important pages
- 0.5-0.7 = Regular content
- 0.3-0.4 = Low-priority pages

### 6. Set Realistic Change Frequencies

Don't claim pages update "daily" if they don't. Search engines may ignore your sitemap if it's inaccurate.

---

## Troubleshooting

### Sitemap Not Generating

**Check:**
1. Is `getCmsPayload()` returning data?
2. Are there published items in the CMS?
3. Is `NEXT_PUBLIC_SITE_URL` set correctly?

**Debug:**
```typescript
// Add logging to sitemap.ts
const cmsData = await getCmsPayload();
console.log('CMS Data:', JSON.stringify(cmsData, null, 2));
```

### Robots.txt Blocking Everything

**Check:**
1. Is `NODE_ENV=production` set?
2. Is `ENVIRONMENT.isProduction` returning `true`?

**Debug:**
```typescript
// Add logging to robots.ts
console.log('Environment:', ENVIRONMENT);
console.log('Is Production:', ENVIRONMENT.isProduction);
```

### Wrong Base URL

**Check:**
1. Is `NEXT_PUBLIC_SITE_URL` set in `.env.production`?
2. Does `getSiteUrl()` return the correct URL?

**Fix:**
```env
# .env.production
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Missing Language Alternates

**Check:**
1. Are all languages in `SUPPORTED_LANGUAGES`?
2. Do all pages exist for all languages?

**Debug:**
```typescript
// Check supported languages
console.log('Supported Languages:', SUPPORTED_LANGUAGES);
```

---

## Related Documentation

- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata)
- [Next.js robots.txt](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots)
- [Next.js sitemap.xml](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap)
- [Google Search Central - robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
- [Google Search Central - Sitemaps](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
- [Sitemaps.org Protocol](https://www.sitemaps.org/protocol.html)

---

## Maintenance

### When to Update

Update these files when:
- Adding new content types
- Changing URL structure
- Adding/removing languages
- Blocking new bot types
- Adjusting SEO priorities

### Version History

- **v1.0** (Dec 3, 2025) - Initial implementation
  - robots.ts with environment-based behavior
  - sitemap.ts with multi-language support
  - CMS integration for dynamic content

---

## Conclusion

The search engine infrastructure is now complete and production-ready. Both `robots.txt` and `sitemap.xml` are:

✅ Environment-aware  
✅ Multi-language compatible  
✅ CMS-integrated  
✅ Easily customizable  
✅ Following SEO best practices  

Secondary templates and client sites can extend or override these files as needed while maintaining the core functionality.

For questions or issues, refer to the troubleshooting section or consult the Next.js documentation.

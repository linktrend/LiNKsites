# Search Infrastructure Quick Reference

**Quick access guide for robots.txt, sitemap.xml, and humans.txt**

---

## 📁 File Locations

| File | Location | Purpose |
|------|----------|---------|
| robots.ts | `/src/app/robots.ts` | Generates robots.txt |
| sitemap.ts | `/src/app/sitemap.ts` | Generates sitemap.xml |
| humans.txt | `/public/humans.txt` | Human-readable credits |

---

## 🔧 Configuration

Both robots.ts and sitemap.ts use centralized configuration:

```typescript
import { 
  ENVIRONMENT,           // Environment detection
  getSiteUrl,           // Base URL
  SUPPORTED_LANGUAGES,  // ['en', 'es', 'zh-tw', 'zh-cn']
} from '@/config';
```

**Environment Variables:**
```env
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production
```

---

## 🌐 URLs

Once deployed, these files are accessible at:

- **robots.txt:** `https://yourdomain.com/robots.txt`
- **sitemap.xml:** `https://yourdomain.com/sitemap.xml`
- **humans.txt:** `https://yourdomain.com/humans.txt`

---

## 🧪 Testing

```bash
# Local development
curl http://localhost:3000/robots.txt
curl http://localhost:3000/sitemap.xml

# Production
curl https://yourdomain.com/robots.txt
curl https://yourdomain.com/sitemap.xml
```

---

## 🎨 Customization

### Override robots.ts

```typescript
// your-project/src/app/robots.ts
import { MetadataRoute } from 'next';
import { ENVIRONMENT, getSiteUrl } from '@/config';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/api/'],
    },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
```

### Extend sitemap.ts

```typescript
// your-project/src/app/sitemap.ts
import baseSitemap from '@master-template/app/sitemap';
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseEntries = await baseSitemap();
  
  const customEntries: MetadataRoute.Sitemap = [
    {
      url: 'https://yourdomain.com/custom-page',
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ];
  
  return [...baseEntries, ...customEntries];
}
```

### Update humans.txt

Simply edit `/public/humans.txt` with your team and project information.

---

## 📊 Sitemap Content Types

| Content Type | Priority | Change Frequency | Example |
|--------------|----------|------------------|---------|
| Homepage | 1.0 | daily | `/en` |
| Main Pages | 0.9 | weekly | `/en/about` |
| Offers | 0.8 | weekly | `/en/offers/product` |
| Resources | 0.7 | weekly | `/en/resources/articles/post` |
| Case Studies | 0.7 | monthly | `/en/resources/cases/study` |
| FAQ | 0.6 | monthly | `/en/resources/faq` |
| Legal | 0.3 | yearly | `/en/legal/privacy-policy` |

---

## 🤖 Robots.txt Rules

### Production
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
```

### Non-Production (Dev/Staging)
```
User-agent: *
Disallow: /
```

---

## 🌍 Language Support

All URLs include language alternates:

```xml
<url>
  <loc>https://yourdomain.com/en/about</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://yourdomain.com/en/about"/>
  <xhtml:link rel="alternate" hreflang="es" href="https://yourdomain.com/es/about"/>
  <xhtml:link rel="alternate" hreflang="zh-tw" href="https://yourdomain.com/zh-tw/about"/>
  <xhtml:link rel="alternate" hreflang="zh-cn" href="https://yourdomain.com/zh-cn/about"/>
</url>
```

---

## 📚 Full Documentation

For complete details, see:
- [SEARCH_INFRA_COMPLETE.md](./SEARCH_INFRA_COMPLETE.md) - Full documentation
- [AGENT_17_SEARCH_INFRA_SUMMARY.md](../AGENT_17_SEARCH_INFRA_SUMMARY.md) - Implementation summary

---

## ✅ Checklist for Production

- [ ] Set `NEXT_PUBLIC_SITE_URL` in `.env.production`
- [ ] Set `NODE_ENV=production`
- [ ] Update `humans.txt` with team information
- [ ] Test robots.txt: `curl https://yourdomain.com/robots.txt`
- [ ] Test sitemap.xml: `curl https://yourdomain.com/sitemap.xml`
- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Monitor crawl status and coverage

---

**Last Updated:** December 3, 2025

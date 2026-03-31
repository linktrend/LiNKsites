# LinkTrend CMS Schema Documentation

## Overview

This document describes the complete CMS schema for the LinkTrend Website Factory, designed for Payload CMS integration.

**Status**: Ready for Payload CMS integration (1 week timeline)

**Design Principles**:
- Typed enums (no free-text fields for component types)
- Governance on navigation overrides
- Theme variants as scoped overlays (not global mutations)
- Stable routing (URLs never change)
- SEO-first architecture

---

## Collections

### 1. Offers Collection

**Purpose**: Core business offerings (products and services)

**Slug**: `offers`

**Key Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | text | ✅ | URL identifier (e.g., "ai-automation") |
| `title` | text | ✅ | Display title |
| `subtitle` | text | | Short tagline |
| `type` | select | ✅ | "product" or "service" |
| `short_description` | textarea | | Brief description for cards |
| `description` | textarea | | Full description |
| `hero_content` | group | | Hero section data |
| `body_content` | richText | | Main content body |
| `features` | array | | List of features |
| `useCases` | array | | Use cases |
| `pricing` | array | | Pricing tiers |
| `testimonials` | array | | Customer testimonials |
| `relatedResources` | array | | Related article slugs |
| `seo_meta` | group | | SEO metadata |
| `theme_variant` | select | | "default", "dark", or "accent" (scoped overlay) |
| `sort_order` | number | ✅ | Display order |
| `status` | select | ✅ | "draft" or "published" |

**Routing Rules**:
- `/offers` → Index page OR single offer (if only 1 published)
- `/offers/[slug]` → Individual offer page
- **SEO Rule**: If only 1 offer exists, `/offers/[slug]` redirects 301 to `/offers`

**Navigation Label Logic**:
- Only products → "Products"
- Only services → "Services"
- Mixed → "Products & Services"
- CMS override available via Navigation collection

---

### 2. Navigation Collection

**Purpose**: Global navigation configuration with governance

**Slug**: `navigation`

**Key Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `menu_label` | text | ✅ | Default menu label |
| `plural_label` | text | | Plural form |
| `fallback_label` | text | | Fallback if computation fails |
| `icon_reference` | text | | Icon identifier |
| `visibility_conditions` | json | | Show/hide conditions |
| `override_enabled` | checkbox | | Enable manual override |
| `override_reason` | textarea | | Governance: reason for override |
| `computed_label_override` | text | | Manual override value |

**Governance Rules**:
1. `override_enabled` must be true to use override
2. `override_reason` is required when override is enabled
3. Override always wins over computed label
4. Routes NEVER change regardless of labels

---

### 3. Pages Collection

**Purpose**: Global page configuration and composition

**Slug**: `pages`

**Key Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `page_id` | text | ✅ | Unique identifier |
| `page_type` | select | ✅ | Page type classification |
| `seo_meta` | group | | SEO metadata |
| `theme_override` | select | | Global site-wide theme |
| `sections` | array | | Page sections |

**Section Fields** (typed enums):

| Field | Type | Options |
|-------|------|---------|
| `section_id` | text | Unique identifier |
| `component_type` | select | hero, features, pricing, testimonials, cta, content, grid, carousel, stats, faq, contact-form, newsletter |
| `sort_order` | number | Display order |
| `config` | json | Section configuration |
| `visible` | checkbox | Show/hide |

**CRITICAL**: `component_type` is a typed enum - NO free-text allowed

---

### 4. Resources Collection

**Purpose**: Articles and blog posts

**Slug**: `resources`

**Key Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | text | ✅ | URL identifier |
| `title` | text | ✅ | Article title |
| `excerpt` | textarea | ✅ | Preview summary |
| `body` | richText | ✅ | Full content |
| `image` | upload | | Featured image |
| `date` | date | ✅ | Publication date |
| `offerSlug` | text | | Related offer |
| `category` | select | | automation, analytics, ai, data, general |
| `author` | group | | Author info |
| `seo_meta` | group | | SEO metadata |

---

### 5. Cases Collection

**Purpose**: Customer case studies

**Slug**: `cases`

**Key Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | text | ✅ | URL identifier |
| `title` | text | ✅ | Case study title |
| `summary` | textarea | ✅ | Brief summary |
| `challenge` | richText | ✅ | Customer challenge |
| `solution` | richText | ✅ | Solution provided |
| `impact` | richText | ✅ | Results achieved |
| `relatedOffers` | array | | Related offer slugs |
| `customer` | group | | Customer info |
| `metrics` | array | | Key metrics |
| `seo_meta` | group | | SEO metadata |

---

### 6. Videos Collection

**Purpose**: Video content and tutorials

**Slug**: `videos`

**Key Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | text | ✅ | URL identifier |
| `title` | text | ✅ | Video title |
| `description` | textarea | ✅ | Video description |
| `youtubeId` | text | ✅ | YouTube video ID |
| `thumbnail` | upload | | Custom thumbnail |
| `duration` | text | | Video duration |
| `relatedVideos` | array | | Related video slugs |
| `relatedArticles` | array | | Related article slugs |
| `category` | select | | tutorial, demo, webinar, case-study, product-update |
| `publishedDate` | date | | Publication date |
| `seo_meta` | group | | SEO metadata |

---

### 7. FAQ Collection

**Purpose**: Frequently asked questions

**Slug**: `faq`

**Key Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `question` | text | ✅ | The question |
| `answer` | richText | ✅ | The answer |
| `category` | select | | getting-started, billing, technical, account, features, integration, security, general |
| `offerSlug` | text | | Related offer (optional) |
| `sort_order` | number | | Display order |
| `tags` | array | | Search tags |
| `helpful_count` | number | | Helpful votes (read-only) |
| `status` | select | | published, draft |

---

### 8. Legal Collection

**Purpose**: Legal documents and policies

**Slug**: `legal`

**Key Fields**:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `slug` | text | ✅ | URL identifier |
| `title` | text | ✅ | Document title |
| `body` | richText | ✅ | Full content |
| `document_type` | select | ✅ | privacy-policy, terms-of-use, cookie-policy, gdpr, disclaimer, acceptable-use, sla, other |
| `version` | text | | Document version |
| `effectiveDate` | date | ✅ | Effective date |
| `lastUpdated` | date | ✅ | Last update date |
| `summary` | textarea | | Plain-language summary |
| `jurisdiction` | text | | Legal jurisdiction |
| `status` | select | ✅ | active, draft, archived |
| `seo_meta` | group | | SEO metadata |

---

## Theme System

### Global Theme
- Controlled via `data-theme` attribute on `<html>` element
- Options: "default", "dark"
- Site-wide mutation

### Theme Variants (Offers)
- Controlled via `theme_variant` field on Offers
- Options: "default", "dark", "accent"
- **Scoped overlay only** - does NOT mutate global theme
- Applied to offer page only

**Rule**: Offers may use `theme_variant` ONLY as a scoped overlay, never as a global mutation.

---

## Routing Architecture

### Canonical Routes (IMMUTABLE)

```
/                           → Homepage
/offers                     → Offers index OR single offer
/offers/[slug]              → Individual offer (redirects if only 1)
/resources                  → Resources index
/resources/articles         → Articles list
/resources/articles/[slug]  → Article detail
/resources/cases            → Case studies list
/resources/cases/[slug]     → Case study detail
/resources/videos           → Videos list
/resources/videos/[slug]    → Video detail
/resources/faq              → FAQ index
/about                      → About page
/contact                    → Contact page
/legal/[slug]               → Legal documents
```

**Rules**:
1. Routes NEVER change regardless of CMS labels
2. Labels are display-only (navigation, breadcrumbs, headings)
3. Slugs are stable identifiers
4. SEO: Single offer redirects `/offers/[slug]` → `/offers` (301)

---

## Environment Variables

```bash
# CMS Provider
NEXT_PUBLIC_CMS_PROVIDER=mock          # or "payload"

# Payload CMS API
NEXT_PUBLIC_PAYLOAD_API_URL=http://localhost:3000

# Payload Server URL
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
```

---

## Data Flow

```
User Request
    ↓
Next.js Page (SSR/SSG)
    ↓
contentClient.getCmsPayload()
    ↓
Check CMS_PROVIDER
    ↓
├─ mock → Load from cmsPayload.json
└─ payload → Fetch from Payload API
    ↓
Transform to CmsPayload shape
    ↓
Return to page
```

---

## Type Safety

All CMS types are derived from the mock data structure:

```typescript
export type CmsOffer = typeof data.offers[number];
export type CmsResource = typeof data.resources[number];
// etc.
```

This ensures type compatibility between mock and Payload CMS.

---

## Migration Checklist

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for step-by-step instructions.







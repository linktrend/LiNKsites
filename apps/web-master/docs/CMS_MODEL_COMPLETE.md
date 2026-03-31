# CMS Model Complete Documentation

**Status**: ✅ Production-Ready with Zod Validation  
**Version**: 1.0.0  
**Last Updated**: 2025-12-03

---

## Overview

This document provides comprehensive documentation for the **Website Factory Master Template CMS Model**, now hardened with Zod schemas, strong TypeScript types, and runtime validation.

### Key Features

- ✅ **Runtime Validation**: All CMS data validated with Zod schemas
- ✅ **Strong TypeScript Types**: Full type safety across the application
- ✅ **Payload CMS Ready**: Schema aligned with Payload CMS collections
- ✅ **Generic & Reusable**: No project-specific assumptions
- ✅ **Relationship Enforcement**: Typed relationships between collections
- ✅ **Error Handling**: Graceful validation error handling

---

## Architecture

### Data Flow

```
┌─────────────────┐
│  User Request   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Next.js Page  │
│   (SSR/SSG)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────┐
│  contentClient.getCmsPayload()│
└────────┬────────────────────┘
         │
         ▼
┌──────────────────────┐
│  Check CMS_PROVIDER  │
└────┬─────────────┬───┘
     │             │
     ▼             ▼
┌─────────┐   ┌──────────────┐
│  Mock   │   │ Payload CMS  │
│  JSON   │   │     API      │
└────┬────┘   └──────┬───────┘
     │               │
     └───────┬───────┘
             │
             ▼
    ┌────────────────┐
    │ Zod Validation │
    │  (Runtime)     │
    └────────┬───────┘
             │
             ▼
    ┌────────────────┐
    │ Typed CmsPayload│
    │   (Success)    │
    └────────────────┘
```

---

## Collections

### 1. Offers Collection

**Purpose**: Core business offerings (products and services)

**Schema Location**: `src/lib/cms/schema.ts` → `OfferSchema`

**Type**: `Offer`

#### Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `slug` | `string` | ✅ | min(1) | URL identifier (e.g., "ai-automation-platform") |
| `title` | `string` | ✅ | min(1) | Display title |
| `subtitle` | `string` | ❌ | - | Short tagline |
| `type` | `enum` | ✅ | "product" \| "service" | Offer classification |
| `short_description` | `string` | ❌ | - | Brief description for cards |
| `description` | `string` | ❌ | - | Full description |
| `hero_content` | `HeroContent` | ❌ | - | Hero section data |
| `body_content` | `string` | ❌ | - | Main content body (HTML/Markdown) |
| `features` | `string[]` | ❌ | default([]) | List of features |
| `useCases` | `string[]` | ❌ | default([]) | Use cases |
| `pricing` | `string[]` | ❌ | default([]) | Pricing tiers |
| `testimonials` | `string[]` | ❌ | default([]) | Customer testimonials |
| `relatedResources` | `string[]` | ❌ | default([]) | Related article slugs |
| `seo_meta` | `SeoMeta` | ❌ | - | SEO metadata |
| `theme_variant` | `enum` | ❌ | "default" \| "dark" \| "accent" | Theme overlay |
| `sort_order` | `number` | ❌ | default(0) | Display order |
| `status` | `enum` | ❌ | "draft" \| "published" \| "archived" | Publication status |

#### Relationships

- **Outbound**: `relatedResources` → Resources (by slug)
- **Inbound**: Resources → Offers (via `offerSlug`)
- **Inbound**: Cases → Offers (via `relatedOffers`)

#### Example

```typescript
import { getOfferBySlug } from '@/lib/contentClient';

const offer = await getOfferBySlug('ai-automation-platform');
// Type: Offer | undefined
```

---

### 2. Resources Collection

**Purpose**: Articles and blog posts

**Schema Location**: `src/lib/cms/schema.ts` → `ResourceSchema`

**Type**: `Resource`

#### Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `slug` | `string` | ✅ | min(1) | URL identifier |
| `title` | `string` | ✅ | min(1) | Article title |
| `excerpt` | `string` | ✅ | min(1) | Preview summary |
| `body` | `string` | ✅ | min(1) | Full content (HTML/Markdown) |
| `image` | `string` | ❌ | url() | Featured image URL |
| `date` | `string` | ✅ | - | Publication date (ISO 8601) |
| `offerSlug` | `string` | ❌ | - | Related offer slug |
| `category` | `enum` | ❌ | "automation" \| "analytics" \| "ai" \| "data" \| "general" | Article category |
| `author` | `object` | ❌ | - | Author information |
| `seo_meta` | `SeoMeta` | ❌ | - | SEO metadata |
| `status` | `enum` | ❌ | default("published") | Publication status |

#### Relationships

- **Outbound**: `offerSlug` → Offers (by slug)
- **Inbound**: Offers → Resources (via `relatedResources`)
- **Inbound**: Videos → Resources (via `relatedArticles`)

#### Example

```typescript
import { getResources, getResourcesByOffer } from '@/lib/contentClient';
import { getResourcesByOffer } from '@/lib/cms/schema';

const allResources = await getResources();
const automationArticles = getResourcesByOffer('ai-automation-platform', allResources);
```

---

### 3. Videos Collection

**Purpose**: Video content and tutorials

**Schema Location**: `src/lib/cms/schema.ts` → `VideoSchema`

**Type**: `Video`

#### Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `slug` | `string` | ✅ | min(1) | URL identifier |
| `title` | `string` | ✅ | min(1) | Video title |
| `description` | `string` | ✅ | min(1) | Video description |
| `youtubeId` | `string` | ✅ | min(1) | YouTube video ID |
| `thumbnail` | `string` | ❌ | url() | Custom thumbnail URL |
| `duration` | `string` | ❌ | - | Video duration (e.g., "5:30") |
| `relatedVideos` | `string[]` | ❌ | default([]) | Related video slugs |
| `relatedArticles` | `string[]` | ❌ | default([]) | Related article slugs |
| `category` | `enum` | ❌ | "tutorial" \| "demo" \| "webinar" \| "case-study" \| "product-update" | Video category |
| `publishedDate` | `string` | ❌ | - | Publication date (ISO 8601) |
| `seo_meta` | `SeoMeta` | ❌ | - | SEO metadata |
| `status` | `enum` | ❌ | default("published") | Publication status |

#### Relationships

- **Outbound**: `relatedVideos` → Videos (by slug)
- **Outbound**: `relatedArticles` → Resources (by slug)

#### Example

```typescript
import { getVideoBySlug } from '@/lib/contentClient';
import { resolveRelatedArticles } from '@/lib/cms/schema';

const video = await getVideoBySlug('ai-demo');
const resources = await getResources();
const relatedArticles = resolveRelatedArticles(video, resources);
```

---

### 4. Cases Collection

**Purpose**: Customer case studies and success stories

**Schema Location**: `src/lib/cms/schema.ts` → `CaseSchema`

**Type**: `Case`

#### Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `slug` | `string` | ✅ | min(1) | URL identifier |
| `title` | `string` | ✅ | min(1) | Case study title |
| `summary` | `string` | ✅ | min(1) | Brief summary |
| `challenge` | `string` | ✅ | min(1) | Customer challenge |
| `solution` | `string` | ✅ | min(1) | Solution provided |
| `impact` | `string` | ✅ | min(1) | Results achieved |
| `relatedOffers` | `string[]` | ❌ | default([]) | Related offer slugs |
| `customer` | `object` | ❌ | - | Customer information |
| `metrics` | `array` | ❌ | default([]) | Key metrics (label/value pairs) |
| `seo_meta` | `SeoMeta` | ❌ | - | SEO metadata |
| `status` | `enum` | ❌ | default("published") | Publication status |

#### Relationships

- **Outbound**: `relatedOffers` → Offers (by slug)

#### Example

```typescript
import { getCaseBySlug } from '@/lib/contentClient';
import { resolveRelatedOffers } from '@/lib/cms/schema';

const caseStudy = await getCaseBySlug('global-retail-automation');
const offers = await getOffers();
const relatedOffers = resolveRelatedOffers(caseStudy, offers);
```

---

### 5. FAQ Collection

**Purpose**: Frequently asked questions

**Schema Location**: `src/lib/cms/schema.ts` → `FaqSchema`

**Type**: `Faq`

#### Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `question` | `string` | ✅ | min(1) | The question |
| `answer` | `string` | ✅ | min(1) | The answer |
| `category` | `enum` | ❌ | "getting-started" \| "billing" \| "technical" \| "account" \| "features" \| "integration" \| "security" \| "general" | FAQ category |
| `offerSlug` | `string` | ❌ | - | Related offer slug |
| `sort_order` | `number` | ❌ | default(0) | Display order |
| `tags` | `string[]` | ❌ | default([]) | Search tags |
| `helpful_count` | `number` | ❌ | default(0) | Helpful votes |
| `status` | `enum` | ❌ | default("published") | Publication status |

#### Relationships

- **Outbound**: `offerSlug` → Offers (by slug)

#### Example

```typescript
import { getFaqs } from '@/lib/contentClient';
import { getFaqsByCategory } from '@/lib/cms/schema';

const allFaqs = await getFaqs();
const billingFaqs = getFaqsByCategory('billing', allFaqs);
```

---

### 6. Legal Collection

**Purpose**: Legal documents and policies

**Schema Location**: `src/lib/cms/schema.ts` → `LegalSchema`

**Type**: `Legal`

#### Fields

| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `slug` | `string` | ✅ | min(1) | URL identifier |
| `title` | `string` | ✅ | min(1) | Document title |
| `body` | `string` | ✅ | min(1) | Full content |
| `document_type` | `enum` | ❌ | "privacy-policy" \| "terms-of-use" \| "cookie-policy" \| "gdpr" \| "disclaimer" \| "acceptable-use" \| "sla" \| "other" | Document type |
| `version` | `string` | ❌ | - | Document version |
| `effectiveDate` | `string` | ❌ | - | Effective date (ISO 8601) |
| `lastUpdated` | `string` | ❌ | - | Last update date (ISO 8601) |
| `summary` | `string` | ❌ | - | Plain-language summary |
| `jurisdiction` | `string` | ❌ | - | Legal jurisdiction |
| `status` | `enum` | ❌ | default("published") | Publication status |
| `seo_meta` | `SeoMeta` | ❌ | - | SEO metadata |

#### Example

```typescript
import { getLegalDocumentBySlug } from '@/lib/contentClient';

const privacyPolicy = await getLegalDocumentBySlug('privacy-policy');
```

---

### 7. Contact Forms Collection

**Purpose**: Dynamic contact form configurations

**Schema Location**: `src/lib/cms/schema.ts` → `ContactFormSchema`

**Type**: `ContactForm`

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | ✅ | Form identifier |
| `title` | `string` | ✅ | Form title |
| `description` | `string` | ✅ | Form description |
| `fields` | `FormField[]` | ✅ | Form fields configuration |
| `submitButtonText` | `string` | ✅ | Submit button label |
| `successMessage` | `string` | ✅ | Success message |
| `submissionConfig` | `FormSubmissionConfig` | ✅ | Submission configuration |

#### Example

```typescript
import { getContactFormById } from '@/lib/contentClient';

const salesForm = await getContactFormById('sales-form');
```

---

## Globals

### 1. Site Global

**Purpose**: Site-wide configuration

**Schema**: `SiteSchema`

**Type**: `Site`

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Site identifier |
| `languages` | `string[]` | Supported languages |
| `primaryLanguage` | `string` | Primary language code |
| `themeId` | `string` | Theme identifier |
| `designSystemVersion` | `string` | Design system version |

---

### 2. Navigation Global

**Purpose**: Global navigation configuration

**Schema**: `NavigationSchema`

**Type**: `Navigation`

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `primary` | `NavigationLink[]` | Primary navigation links |
| `cta` | `NavigationCta` | Call-to-action button |
| `override_enabled` | `boolean` | Enable manual override |
| `override_reason` | `string \| null` | Governance: reason for override |
| `computed_label_override` | `string \| null` | Manual override value |

---

### 3. About Global

**Purpose**: About page content

**Schema**: `AboutSchema`

**Type**: `About`

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `heroTitle` | `string` | Hero title |
| `heroSubtitle` | `string` | Hero subtitle |
| `sections` | `AboutSection[]` | Content sections |

---

### 4. Contact Global

**Purpose**: Contact page configuration

**Schema**: `ContactSchema`

**Type**: `Contact`

#### Fields

| Field | Type | Description |
|-------|------|-------------|
| `page` | `ContactPage` | Page metadata |
| `intents` | `ContactIntent[]` | Contact intents |
| `channels` | `ContactChannel[]` | Contact channels |
| `helpDeflection` | `HelpDeflection` | Help deflection config |
| `trust` | `Trust` | Trust indicators |

---

## Relationships Map

```
Offers
  ├─→ relatedResources → Resources (by slug)
  ├─← Resources.offerSlug
  └─← Cases.relatedOffers

Resources
  ├─→ offerSlug → Offers (by slug)
  ├─← Offers.relatedResources
  └─← Videos.relatedArticles

Videos
  ├─→ relatedVideos → Videos (by slug)
  └─→ relatedArticles → Resources (by slug)

Cases
  └─→ relatedOffers → Offers (by slug)

FAQ
  └─→ offerSlug → Offers (by slug)
```

---

## Usage Examples

### Basic Usage

```typescript
import { getCmsPayload } from '@/lib/contentClient';

// Get entire CMS payload (validated)
const cms = await getCmsPayload();
// Type: CmsPayload

// Access collections
const offers = cms.offers; // Type: Offer[]
const resources = cms.resources; // Type: Resource[]
```

### Using Typed Accessors

```typescript
import {
  getOffers,
  getOfferBySlug,
  getResources,
  getResourceBySlug,
} from '@/lib/contentClient';

// Get all offers
const offers = await getOffers();

// Get specific offer
const offer = await getOfferBySlug('ai-automation-platform');

// Get all resources
const resources = await getResources();

// Get specific resource
const article = await getResourceBySlug('ai-automation-101');
```

### Using Relationship Helpers

```typescript
import {
  resolveRelatedResources,
  resolveRelatedOffers,
  getResourcesByOffer,
  getOffersByType,
  getPublishedItems,
} from '@/lib/cms/schema';

// Resolve related resources for an offer
const offer = await getOfferBySlug('ai-automation-platform');
const resources = await getResources();
const relatedArticles = resolveRelatedResources(offer, resources);

// Get resources by offer
const automationArticles = getResourcesByOffer('ai-automation-platform', resources);

// Get offers by type
const products = getOffersByType('product', offers);

// Get only published items
const publishedOffers = getPublishedItems(offers);
```

### Error Handling

```typescript
import { getCmsPayload } from '@/lib/contentClient';

try {
  const cms = await getCmsPayload();
  // Use validated data
} catch (error) {
  console.error('CMS validation failed:', error);
  // Handle validation errors
  // Error includes detailed Zod validation messages
}
```

---

## Validation Rules

### String Fields

- **slug**: `min(1)` - Must not be empty
- **title**: `min(1)` - Must not be empty
- **url fields**: `url()` - Must be valid URL
- **email fields**: `email()` - Must be valid email

### Enum Fields

All enum fields are strictly validated against allowed values:

- **Status**: `"draft" | "published" | "archived"`
- **OfferType**: `"product" | "service"`
- **ThemeVariant**: `"default" | "dark" | "accent"`
- **ResourceCategory**: `"automation" | "analytics" | "ai" | "data" | "general"`
- **VideoCategory**: `"tutorial" | "demo" | "webinar" | "case-study" | "product-update"`
- **FaqCategory**: `"getting-started" | "billing" | "technical" | "account" | "features" | "integration" | "security" | "general"`
- **LegalDocumentType**: `"privacy-policy" | "terms-of-use" | "cookie-policy" | "gdpr" | "disclaimer" | "acceptable-use" | "sla" | "other"`

### SEO Meta

```typescript
{
  title?: string;
  description?: string; // max 160 characters
  keywords?: string;
  og_image?: string; // must be valid URL or null
}
```

---

## Payload CMS Mapping

### Collection Mapping

| CMS Collection | Payload Collection | Slug |
|----------------|-------------------|------|
| Offers | `offers` | `offers` |
| Resources | `resources` | `resources` |
| Videos | `videos` | `videos` |
| Cases | `cases` | `cases` |
| FAQ | `faq` | `faq` |
| Legal | `legal` | `legal` |
| Contact Forms | `contact-forms` | `contactForms` |

### Global Mapping

| CMS Global | Payload Global | Endpoint |
|------------|---------------|----------|
| Site | `site` | `globals/site` |
| Navigation | `navigation` | `globals/navigation` |
| About | `about` | `globals/about` |
| Contact | `contact` | `globals/contact` |

### Field Type Mapping

| Zod Type | Payload Type |
|----------|-------------|
| `z.string()` | `text` |
| `z.string().email()` | `email` |
| `z.string().url()` | `text` (with validation) |
| `z.number()` | `number` |
| `z.boolean()` | `checkbox` |
| `z.enum([...])` | `select` |
| `z.array(z.string())` | `array` with text fields |
| `z.object({...})` | `group` |
| Rich text | `richText` |
| Date string | `date` |

---

## Environment Variables

```bash
# CMS Provider Selection
NEXT_PUBLIC_CMS_PROVIDER=mock          # or "payload"

# Payload CMS API URL (when using Payload)
NEXT_PUBLIC_PAYLOAD_API_URL=http://localhost:3000

# Payload Server URL
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
```

---

## File Structure

```
src/
├── lib/
│   ├── cms/
│   │   └── schema.ts              # Zod schemas and types
│   └── contentClient.ts           # CMS client with validation
├── cms/
│   ├── payload.config.ts          # Payload CMS config
│   └── collections/
│       ├── Offers.ts              # Offers collection
│       ├── Resources.ts           # Resources collection
│       ├── Videos.ts              # Videos collection
│       ├── Cases.ts               # Cases collection
│       ├── FAQ.ts                 # FAQ collection
│       ├── Legal.ts               # Legal collection
│       ├── Navigation.ts          # Navigation global
│       └── Pages.ts               # Pages collection
└── data/
    └── cmsPayload.json            # Mock CMS data
```

---

## Migration Notes for Payload CMS

### Step 1: Install Payload CMS

```bash
npm install payload @payloadcms/db-mongodb @payloadcms/richtext-slate
```

### Step 2: Configure Collections

Use the collection definitions in `src/cms/collections/` as templates for Payload CMS collections.

### Step 3: Update Environment Variables

```bash
NEXT_PUBLIC_CMS_PROVIDER=payload
NEXT_PUBLIC_PAYLOAD_API_URL=http://localhost:3000
```

### Step 4: Test Validation

The Zod schemas will automatically validate data from Payload CMS, ensuring type safety.

---

## Testing

### Validate Mock Data

```typescript
import { validateCmsPayload } from '@/lib/cms/schema';
import data from '@/data/cmsPayload.json';

try {
  const validated = validateCmsPayload(data);
  console.log('✅ Mock data is valid');
} catch (error) {
  console.error('❌ Validation failed:', error);
}
```

### Test Individual Collections

```typescript
import { validateOffer, validateResource } from '@/lib/cms/schema';

const offer = validateOffer({
  slug: 'test-offer',
  title: 'Test Offer',
  type: 'product',
  status: 'published',
  sort_order: 1,
});
```

---

## Best Practices

### 1. Always Use Typed Accessors

```typescript
// ✅ Good
const offers = await getOffers();

// ❌ Avoid
const cms = await getCmsPayload();
const offers = cms.offers; // Less explicit
```

### 2. Use Relationship Helpers

```typescript
// ✅ Good
const related = resolveRelatedResources(offer, resources);

// ❌ Avoid
const related = resources.filter(r => offer.relatedResources.includes(r.slug));
```

### 3. Handle Validation Errors

```typescript
// ✅ Good
try {
  const cms = await getCmsPayload();
} catch (error) {
  // Handle error gracefully
  return fallbackData;
}
```

### 4. Use Published Items Filter

```typescript
// ✅ Good
const published = getPublishedItems(offers);

// ❌ Avoid
const published = offers.filter(o => o.status === 'published');
```

---

## Troubleshooting

### Validation Errors

If you encounter validation errors:

1. Check the console for detailed Zod error messages
2. Verify field types match the schema
3. Ensure required fields are present
4. Check enum values are valid

### Type Errors

If TypeScript shows type errors:

1. Ensure you're importing types from `@/lib/cms/schema`
2. Use typed accessors from `@/lib/contentClient`
3. Check that Zod is installed: `npm list zod`

---

## Changelog

### Version 1.0.0 (2025-12-03)

- ✅ Initial release with complete Zod schemas
- ✅ Runtime validation for all collections
- ✅ Strong TypeScript types
- ✅ Typed collection accessors
- ✅ Relationship helpers
- ✅ Payload CMS alignment

---

## Support

For questions or issues:

1. Check this documentation
2. Review `src/lib/cms/schema.ts` for schema definitions
3. Review `src/lib/contentClient.ts` for usage examples
4. Check Zod documentation: https://zod.dev

---

**End of Documentation**

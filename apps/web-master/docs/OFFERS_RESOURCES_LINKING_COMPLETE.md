# Offers & Resources Cross-Linking Integrity System

**Status**: ✅ Complete  
**Agent**: Agent 19  
**Date**: December 3, 2025

## Overview

This document describes the comprehensive relationship integrity system between offers, resources (articles), case studies, videos, and FAQs. The system ensures type-safe, validated cross-linking with graceful handling of broken references.

## Table of Contents

1. [Relationship Types](#relationship-types)
2. [Schema Definitions](#schema-definitions)
3. [Integrity Validation](#integrity-validation)
4. [Safe Resolution Helpers](#safe-resolution-helpers)
5. [UI Component Behavior](#ui-component-behavior)
6. [Extending in Vertical Templates](#extending-in-vertical-templates)
7. [Best Practices](#best-practices)

---

## Relationship Types

The system supports six primary relationship types:

### 1. Offer → Resources (One-to-Many)
- **Field**: `Offer.relatedResources: string[]`
- **Description**: Offers can reference multiple related articles/resources
- **Example**: AI Automation Platform → ["ai-automation-101", "automation-best-practices"]

### 2. Resource → Offer (Many-to-One)
- **Field**: `Resource.offerSlug?: string`
- **Description**: Resources can be associated with one offer
- **Example**: "AI Automation 101" article → "ai-automation-platform"

### 3. Case Study → Offers (Many-to-Many)
- **Field**: `Case.relatedOffers: string[]`
- **Description**: Case studies can reference multiple related offers
- **Example**: "Enterprise Transformation" case → ["ai-automation", "data-insights"]

### 4. Video → Videos (Many-to-Many)
- **Field**: `Video.relatedVideos: string[]`
- **Description**: Videos can reference other related videos
- **Example**: "Getting Started" video → ["advanced-features", "tips-and-tricks"]

### 5. Video → Articles (Many-to-Many)
- **Field**: `Video.relatedArticles: string[]`
- **Description**: Videos can reference related articles/resources
- **Example**: "Tutorial Video" → ["written-guide", "best-practices"]

### 6. FAQ → Offer (Many-to-One)
- **Field**: `Faq.offerSlug?: string`
- **Description**: FAQs can be associated with one offer
- **Example**: "How do I integrate?" FAQ → "ai-automation-platform"

---

## Schema Definitions

All relationships are defined in the Zod schema (`src/lib/cms/schema.ts`):

```typescript
// Offer Schema
export const OfferSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  // ... other fields
  relatedResources: z.array(z.string()).default([]),
  // ...
});

// Resource Schema
export const ResourceSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  // ... other fields
  offerSlug: z.string().optional(),
  // ...
});

// Case Schema
export const CaseSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  // ... other fields
  relatedOffers: z.array(z.string()).default([]),
  // ...
});

// Video Schema
export const VideoSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  // ... other fields
  relatedVideos: z.array(z.string()).default([]),
  relatedArticles: z.array(z.string()).default([]),
  // ...
});

// FAQ Schema
export const FaqSchema = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  // ... other fields
  offerSlug: z.string().optional(),
  // ...
});
```

### Type Safety

All relationships are:
- ✅ **Type-safe**: Enforced by TypeScript and Zod schemas
- ✅ **Runtime validated**: Checked when CMS data is loaded
- ✅ **Optional by default**: Missing references don't break the system
- ✅ **Array-based**: Support multiple relationships where appropriate

---

## Integrity Validation

The system includes comprehensive validation in `src/lib/relationshipIntegrity.ts`.

### Validation Report Structure

```typescript
interface ValidationReport {
  valid: boolean;
  issues: ValidationIssue[];
  summary: {
    totalIssues: number;
    errors: number;
    warnings: number;
    byRelationship: Record<RelationshipType, number>;
  };
}
```

### Running Validation

Validation runs automatically in development mode when the CMS payload is loaded:

```typescript
import { validateRelationships, printValidationReport } from './relationshipIntegrity';

const payload = await getCmsPayload();
const report = validateRelationships(payload);

if (!report.valid) {
  console.warn(printValidationReport(report));
}
```

### Example Validation Output

```
================================================================================
RELATIONSHIP INTEGRITY VALIDATION REPORT
================================================================================

❌ Found 3 issue(s):
   - Errors: 0
   - Warnings: 3

Issues by relationship type:
   - offer-to-resources: 2
   - case-to-offers: 1

Detailed issues:
--------------------------------------------------------------------------------
⚠️ [offer-to-resources] Offer "ai-automation-platform" references non-existent resource "deleted-article"
⚠️ [offer-to-resources] Offer "data-analytics-suite" references non-existent resource "old-guide"
⚠️ [case-to-offers] Case "enterprise-case" references non-existent offer "deprecated-offer"
```

---

## Safe Resolution Helpers

All resolution helpers gracefully handle broken references:

### 1. Resolve Offer Resources

```typescript
import { resolveOfferResources } from '@/lib/relationshipIntegrity';

const { resources, brokenRefs } = resolveOfferResources(
  offer,
  allResources,
  { strict: true } // Optional: log warnings
);

// resources: Resource[] - only valid resources
// brokenRefs: string[] - slugs that couldn't be resolved
```

### 2. Resolve Resource Offer

```typescript
import { resolveResourceOffer } from '@/lib/relationshipIntegrity';

const { offer, broken } = resolveResourceOffer(
  resource,
  allOffers,
  { strict: true }
);

// offer: Offer | null
// broken: boolean - true if reference exists but couldn't be resolved
```

### 3. Resolve Case Offers

```typescript
import { resolveCaseOffers } from '@/lib/relationshipIntegrity';

const { offers, brokenRefs } = resolveCaseOffers(
  caseStudy,
  allOffers,
  { strict: true }
);
```

### 4. Resolve Related Videos

```typescript
import { resolveRelatedVideos } from '@/lib/relationshipIntegrity';

const { videos, brokenRefs } = resolveRelatedVideos(
  video,
  allVideos,
  { strict: true }
);
```

### 5. Resolve Video Articles

```typescript
import { resolveVideoArticles } from '@/lib/relationshipIntegrity';

const { articles, brokenRefs } = resolveVideoArticles(
  video,
  allResources,
  { strict: true }
);
```

### 6. Resolve FAQ Offer

```typescript
import { resolveFaqOffer } from '@/lib/relationshipIntegrity';

const { offer, broken } = resolveFaqOffer(
  faq,
  allOffers,
  { strict: true }
);
```

### Utility Functions

The module also provides utility functions for common queries:

```typescript
// Get all resources for an offer (direct + indirect)
const resources = getAllOfferResources(offer, allResources);

// Get all case studies for an offer
const cases = getOfferCaseStudies(offer, allCases);

// Get all videos related to an offer (through articles)
const videos = getOfferVideos(offer, allVideos, allResources);

// Get all FAQs for an offer
const faqs = getOfferFaqs(offer, allFaqs);
```

---

## UI Component Behavior

All UI components that display related content handle edge cases gracefully:

### Empty State (0 items)

Components hide sections when there are no related items:

```tsx
{relatedVideos.length > 0 && (
  <section>
    <h2>Related videos</h2>
    {/* ... */}
  </section>
)}
```

### Single Item (1 item)

Components adjust grid layout for better visual balance:

```tsx
<div className={`grid gap-4 ${
  relatedVideos.length === 1 ? 'md:grid-cols-1 max-w-md' :
  relatedVideos.length === 2 ? 'md:grid-cols-2' :
  'md:grid-cols-3'
}`}>
```

### Multiple Items (2+ items)

Components use responsive grids:
- **1 item**: Single column, max-width container
- **2 items**: 2-column grid on medium+ screens
- **3+ items**: 3-column grid on medium+ screens

### Components Updated

1. **VideoLayout** (`src/layouts/VideoLayout.tsx`)
   - Related videos section
   - Related articles section

2. **CaseStudyLayout** (`src/layouts/CaseStudyLayout.tsx`)
   - Related offers section

3. **ArticlesGrid** (`src/components/marketing/ArticlesGrid.tsx`)
   - Empty state handling
   - Responsive grid layout

4. **CaseStudiesGrid** (`src/components/marketing/CaseStudiesGrid.tsx`)
   - Empty state handling
   - Responsive grid layout

---

## Extending in Vertical Templates

The relationship system is designed to be safely extended in vertical templates.

### Adding New Relationship Types

1. **Update the Schema** (`src/lib/cms/schema.ts`):

```typescript
export const OfferSchema = z.object({
  // ... existing fields
  relatedWebinars: z.array(z.string()).default([]),
});
```

2. **Add Resolution Helper** (`src/lib/relationshipIntegrity.ts`):

```typescript
export function resolveOfferWebinars(
  offer: Offer,
  allWebinars: Webinar[],
  options: { strict?: boolean } = {}
): { webinars: Webinar[]; brokenRefs: string[] } {
  const { strict = false } = options;
  const webinars: Webinar[] = [];
  const brokenRefs: string[] = [];

  for (const slug of offer.relatedWebinars || []) {
    const webinar = allWebinars.find(w => w.slug === slug);
    if (webinar) {
      webinars.push(webinar);
    } else {
      brokenRefs.push(slug);
      if (strict) {
        console.warn(
          `[Relationship Integrity] Offer "${offer.slug}" references non-existent webinar "${slug}"`
        );
      }
    }
  }

  return { webinars, brokenRefs };
}
```

3. **Update Validation** (`src/lib/relationshipIntegrity.ts`):

```typescript
export function validateRelationships(payload: CmsPayload): ValidationReport {
  const issues: ValidationIssue[] = [];

  // ... existing validations

  // Validate offer -> webinars relationships
  for (const offer of payload.offers) {
    const { brokenRefs } = resolveOfferWebinars(offer, payload.webinars || []);
    for (const ref of brokenRefs) {
      issues.push({
        type: 'broken-reference',
        severity: 'warning',
        relationship: 'offer-to-webinars',
        sourceSlug: offer.slug,
        targetSlug: ref,
        message: `Offer "${offer.slug}" references non-existent webinar "${ref}"`
      });
    }
  }

  // ... rest of validation
}
```

4. **Use in Components**:

```tsx
import { resolveOfferWebinars } from '@/lib/relationshipIntegrity';

const { webinars } = resolveOfferWebinars(offer, allWebinars);

{webinars.length > 0 && (
  <section>
    <h2>Related Webinars</h2>
    {/* ... */}
  </section>
)}
```

### Guidelines for Extensions

✅ **DO**:
- Use array fields for one-to-many relationships
- Use optional string fields for many-to-one relationships
- Always provide default values (empty arrays or undefined)
- Create resolution helpers that return both valid items and broken refs
- Add validation to the comprehensive validation function
- Handle empty states in UI components

❌ **DON'T**:
- Make relationship fields required
- Throw errors on broken references
- Assume relationships will always resolve
- Skip validation for new relationship types

---

## Best Practices

### 1. Always Use Resolution Helpers

**Good**:
```typescript
const { resources } = resolveOfferResources(offer, allResources);
```

**Bad**:
```typescript
const resources = allResources.filter(r => 
  offer.relatedResources.includes(r.slug)
);
```

### 2. Handle Empty States in UI

**Good**:
```tsx
{relatedItems.length > 0 && (
  <section>
    <h2>Related Items</h2>
    {/* ... */}
  </section>
)}
```

**Bad**:
```tsx
<section>
  <h2>Related Items</h2>
  {relatedItems.map(/* ... */)}
</section>
```

### 3. Use Strict Mode in Development

```typescript
const { resources, brokenRefs } = resolveOfferResources(
  offer,
  allResources,
  { strict: process.env.NODE_ENV === 'development' }
);
```

### 4. Validate Before Deployment

Run validation as part of your build process:

```typescript
// In a build script or test
import { validateRelationships } from '@/lib/relationshipIntegrity';
import { getCmsPayload } from '@/lib/contentClient';

const payload = await getCmsPayload();
const report = validateRelationships(payload);

if (!report.valid) {
  console.error('CMS relationship validation failed!');
  console.error(printValidationReport(report));
  process.exit(1);
}
```

### 5. Document New Relationships

When adding new relationship types:
1. Update this documentation
2. Add examples to the CMS mock data
3. Create tests for the resolution helpers
4. Update the validation report types

---

## Integration Points

### CMS Collections

All relationship fields are defined in:
- `src/cms/collections/Offers.ts`
- `src/cms/collections/Resources.ts`
- `src/cms/collections/Cases.ts`
- `src/cms/collections/Videos.ts`
- `src/cms/collections/FAQ.ts`

### Content Client

The content client (`src/lib/contentClient.ts`) automatically validates relationships in development mode.

### Page Service

The page service (`src/lib/pageService.ts`) uses resolution helpers to safely resolve relationships when building pages.

### Components

All components that display related content are located in:
- `src/layouts/` - Page layouts
- `src/components/marketing/` - Marketing components
- `src/components/resources/` - Resource components

---

## Troubleshooting

### Broken References in Development

If you see warnings about broken references:

1. Check the validation report in the console
2. Verify the referenced slug exists in the CMS
3. Check for typos in slug names
4. Ensure the referenced item is published (if using status filtering)

### Missing Related Content in UI

If related content isn't showing:

1. Verify the relationship exists in the CMS data
2. Check that the resolution helper is being used
3. Ensure the UI component handles the empty state correctly
4. Check browser console for validation warnings

### Type Errors

If you encounter TypeScript errors:

1. Ensure you're using the correct types from `src/lib/cms/schema.ts`
2. Check that your resolution helper returns the correct type
3. Verify that optional fields are properly typed as `string | undefined`

---

## Summary

The Offers & Resources Cross-Linking Integrity System provides:

✅ **Type-safe relationships** between all content types  
✅ **Comprehensive validation** with detailed reporting  
✅ **Graceful error handling** for broken references  
✅ **Safe resolution helpers** for all relationship types  
✅ **Responsive UI components** that handle 0, 1, and many items  
✅ **Extension-friendly design** for vertical templates  
✅ **Development-time warnings** to catch issues early  

This system ensures data integrity while maintaining flexibility for future extensions and customizations.

---

## Related Documentation

- [CMS Schema Documentation](./CMS_SCHEMA.md)
- [Content Client Guide](./cms-mapping.md)
- [Component Architecture](./README.md)

---

**Last Updated**: December 3, 2025  
**Maintained By**: Agent 19  
**Status**: ✅ Production Ready

# Unified Layout System Migration Guide

## Overview

This guide documents the migration to a unified `layout[]` block system across all page collections in the CMS and Website template.

## What Changed

### 1. CMS Collections - New Unified Blocks System

**Created:** `src/cms/blocks/index.ts`
- Defines all reusable blocks for the layout system
- Includes: Hero, Features, Pricing, Testimonials, CTA, FAQ, Rich Text, Content, Media, Articles, Case Studies, Offer Showcase, Newsletter

### 2. Updated Collections

All collections now support the `layout[]` field using the unified blocks:

#### Pages Collection (`src/cms/collections/Pages.ts`)
- **BREAKING CHANGE:** Replaced `sections[]` array with `layout[]` blocks
- Added `site`, `locale`, `slug`, `title` fields
- Renamed `seo_meta` to `seo`
- Removed `page_id`, `page_type`, `theme_override` fields

#### Offers Collection (`src/cms/collections/Offers.ts`)
- Added `layout[]` field for flexible page composition
- Deprecated `body_content` (kept for migration)
- All existing fields preserved

#### Cases Collection (`src/cms/collections/Cases.ts`)
- Added `layout[]` field
- Deprecated `challenge`, `solution`, `impact` richText fields (kept for migration)
- All existing fields preserved

#### Resources Collection (`src/cms/collections/Resources.ts`)
- Added `layout[]` field
- Deprecated `body` richText field (kept for migration)
- All existing fields preserved

#### FAQ Collection (`src/cms/collections/FAQ.ts`)
- **BREAKING CHANGE:** Transformed from individual FAQ items to FAQ pages
- Added `slug`, `title`, and `layout[]` fields
- Deprecated `question` and `answer` fields (kept for migration)
- Use FAQ block within layout[] for actual FAQ items

#### Legal Collection (`src/cms/collections/Legal.ts`)
- Added `layout[]` field
- Deprecated `body` richText field (kept for migration)
- All existing fields preserved

#### Videos Collection (`src/cms/collections/Videos.ts`)
- Added `layout[]` field for additional content
- All existing fields preserved

### 3. Website Repository Updates

#### Type Definitions
Updated all repository interfaces to include `layout?: CmsPageBlock[]`:
- `src/lib/repository/offers.ts` - CmsOffer
- `src/lib/repository/articles.ts` - CmsArticle
- `src/lib/repository/caseStudies.ts` - CmsCaseStudy
- `src/lib/repository/faq.ts` - CmsFaq
- `src/lib/repository/legal.ts` - CmsLegal
- `src/lib/repository/videos.ts` - CmsVideo

#### PageRenderer (`src/components/page-renderer.tsx`)
- Already compatible with layout[] system
- Supports all block types defined in the CMS
- Renders blocks in order with proper type handling

## Migration Steps

### For Existing Content

1. **Pages Collection:**
   - Convert old `sections[]` entries to `layout[]` blocks
   - Map `component_type` to appropriate block types
   - Transfer `config` JSON to block-specific fields

2. **Offers, Cases, Resources, Legal:**
   - Migrate richText content to `layout[]` using richText blocks
   - Example: Convert `body_content` → `layout: [{ blockType: 'richText', content: body_content }]`

3. **FAQ Collection:**
   - Create new FAQ pages with `slug` and `title`
   - Add FAQ block to `layout[]` with items array
   - Migrate individual FAQ items to FAQ block items

### For New Content

Simply use the `layout[]` field in the CMS admin interface:
1. Add blocks in desired order
2. Configure each block's specific fields
3. Blocks will render automatically via PageRenderer

## Block Types Reference

| Block Type | Purpose | Key Fields |
|------------|---------|------------|
| `hero` | Page header with CTA | heading, subheading, ctaLabel, ctaUrl, backgroundImage |
| `features` | Feature grid | title, subtitle, items[] |
| `pricing` | Pricing tables | title, plans[], monthlyLabel, yearlyLabel |
| `testimonials` | Customer testimonials | title, testimonials[] |
| `cta` | Call-to-action section | title, body, ctaLabel, ctaUrl |
| `faq` | FAQ accordion | title, items[] |
| `richText` | Rich text content | content |
| `content` | Content block (alias) | content |
| `media` | Image/video display | media, caption, altText |
| `articles` | Article grid | articles[] (relationship) |
| `caseStudies` | Case study grid | caseStudies[] (relationship) |
| `offerShowcase` | Offer cards | offers[] (relationship) |
| `newsletter` | Newsletter signup | title, subtitle, placeholder, buttonText |

## Benefits

1. **Consistency:** All pages use the same block system
2. **Flexibility:** Mix and match blocks in any order
3. **Type Safety:** Full TypeScript support
4. **Reusability:** Blocks defined once, used everywhere
5. **Maintainability:** Single source of truth for block definitions
6. **Extensibility:** Easy to add new block types

## Backward Compatibility

- Deprecated fields are kept in collections for migration
- Old fields will continue to work until migrated
- PageRenderer handles both old and new content structures

## Testing

- ✅ TypeScript compilation passes
- ✅ All repository types updated
- ✅ PageRenderer compatible with all blocks
- ⚠️ Full build requires CMS connection (not tested in this migration)

## Next Steps

1. Start CMS (Payload) instance
2. Create sample pages using new layout[] system
3. Test all block types in PageRenderer
4. Migrate existing content from deprecated fields
5. Remove deprecated fields after migration complete

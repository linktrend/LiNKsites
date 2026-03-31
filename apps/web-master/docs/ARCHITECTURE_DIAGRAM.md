# Unified Layout System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CMS (Payload)                            │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Unified Blocks                           │ │
│  │  (src/cms/blocks/index.ts)                                 │ │
│  │                                                             │ │
│  │  • Hero          • Features      • Pricing                 │ │
│  │  • Testimonials  • CTA           • FAQ                     │ │
│  │  • Rich Text     • Content       • Media                   │ │
│  │  • Articles      • Case Studies  • Offer Showcase          │ │
│  │  • Newsletter                                              │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              ▲                                    │
│                              │                                    │
│                              │ imports                            │
│                              │                                    │
│  ┌───────────────────────────┴──────────────────────────────┐   │
│  │                    Collections                            │   │
│  │                                                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │   │
│  │  │  Pages   │  │  Offers  │  │  Cases   │  │Resources │ │   │
│  │  │          │  │          │  │          │  │          │ │   │
│  │  │ layout[] │  │ layout[] │  │ layout[] │  │ layout[] │ │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘ │   │
│  │                                                            │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐               │   │
│  │  │   FAQ    │  │  Legal   │  │  Videos  │               │   │
│  │  │          │  │          │  │          │               │   │
│  │  │ layout[] │  │ layout[] │  │ layout[] │               │   │
│  │  └──────────┘  └──────────┘  └──────────┘               │   │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ API / GraphQL
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Website (Next.js)                           │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                  Repository Layer                           │ │
│  │  (src/lib/repository/)                                     │ │
│  │                                                             │ │
│  │  • pages.ts        • offers.ts       • caseStudies.ts     │ │
│  │  • articles.ts     • faq.ts          • legal.ts           │ │
│  │  • videos.ts                                               │ │
│  │                                                             │ │
│  │  All export interfaces with: layout?: CmsPageBlock[]      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│                              │ provides data                      │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Page Routes                              │ │
│  │  (src/app/[lang]/...)                                      │ │
│  │                                                             │ │
│  │  • [[...slug]]/page.tsx    (dynamic pages)                │ │
│  │  • offers/[slug]/page.tsx   (offer pages)                 │ │
│  │  • resources/articles/[slug]/page.tsx                     │ │
│  │  • resources/cases/[slug]/page.tsx                        │ │
│  │  • etc...                                                  │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│                              │ passes page data                   │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   PageRenderer                              │ │
│  │  (src/components/page-renderer.tsx)                        │ │
│  │                                                             │ │
│  │  Loops through page.layout[] and renders each block       │ │
│  │                                                             │ │
│  │  switch (block.blockType) {                                │ │
│  │    case 'hero': return <HeroSection />                    │ │
│  │    case 'features': return <FeaturesSection />            │ │
│  │    case 'pricing': return <PricingSection />              │ │
│  │    // ... etc for all 13 block types                      │ │
│  │  }                                                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                    │
│                              │ renders                            │
│                              ▼                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                   Rendered Page                             │ │
│  │                                                             │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Hero Block                                            │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Features Block                                        │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Pricing Block                                         │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ CTA Block                                             │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │ Newsletter Block                                      │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
1. CMS Admin creates page
   └─> Adds blocks to layout[]
       └─> Configures each block's fields

2. Content saved in Payload database
   └─> Stored as JSON with blockType identifier

3. Website fetches page data
   └─> Repository layer queries CMS API
       └─> Returns CmsPage with layout: CmsPageBlock[]

4. Page route receives data
   └─> Passes to PageRenderer component

5. PageRenderer iterates layout[]
   └─> Renders each block based on blockType
       └─> Passes block-specific props to components

6. Browser displays composed page
   └─> Blocks rendered in order
       └─> Fully responsive and interactive
```

## Block Structure

```typescript
// Example: Hero Block in database
{
  "blockType": "hero",
  "id": "abc123",
  "heading": "Welcome to Our Platform",
  "subheading": "The best solution for your needs",
  "ctaLabel": "Get Started",
  "ctaUrl": "/contact",
  "backgroundImage": { /* media object */ }
}

// Rendered as:
<HeroSection 
  block={{
    blockType: "hero",
    heading: "Welcome to Our Platform",
    subheading: "The best solution for your needs",
    ctaLabel: "Get Started",
    ctaUrl: "/contact",
    backgroundImage: { ... }
  }}
  locale="en"
/>
```

## Collection Schema Pattern

```typescript
// Every collection now has:
{
  name: 'layout',
  type: 'blocks',
  blocks: allBlocks,  // ← imports from src/cms/blocks/index.ts
  admin: {
    description: 'Page layout composed of blocks'
  }
}
```

## Type Safety Flow

```
CMS Block Definition (Payload Field Config)
              ↓
TypeScript Interface (CmsPageBlock union type)
              ↓
Repository Interface (layout?: CmsPageBlock[])
              ↓
Page Component Props (page: CmsPage)
              ↓
PageRenderer (block: CmsPageBlock)
              ↓
Block Component (block: HeroBlock | FeaturesBlock | ...)
```

## Benefits of This Architecture

### 1. Single Source of Truth
```
src/cms/blocks/index.ts
    ↓
All collections import this
    ↓
Consistent block definitions everywhere
```

### 2. Type Safety
```
CMS defines blocks → TypeScript types → Runtime validation
```

### 3. Reusability
```
Define block once → Use in any collection → Render anywhere
```

### 4. Flexibility
```
Content creators → Mix blocks freely → Custom page layouts
```

### 5. Maintainability
```
Update block definition → Automatically applies everywhere
```

## Migration Path

```
Old System:
┌──────────────────┐
│ Pages            │
│ sections[] JSON  │
└──────────────────┘
┌──────────────────┐
│ Offers           │
│ body_content     │
└──────────────────┘
┌──────────────────┐
│ Cases            │
│ challenge        │
│ solution         │
│ impact           │
└──────────────────┘

         ↓ MIGRATION ↓

New System:
┌──────────────────┐
│ Pages            │
│ layout[]         │
└──────────────────┘
┌──────────────────┐
│ Offers           │
│ layout[]         │
│ (body_content)   │ ← deprecated
└──────────────────┘
┌──────────────────┐
│ Cases            │
│ layout[]         │
│ (challenge)      │ ← deprecated
│ (solution)       │ ← deprecated
│ (impact)         │ ← deprecated
└──────────────────┘
```

## Extension Points

### Adding New Block Types

```
1. Define block in src/cms/blocks/index.ts
   ↓
2. Add to allBlocks export
   ↓
3. Add TypeScript type to CmsPageBlock union
   ↓
4. Add case to PageRenderer switch
   ↓
5. Create rendering component
   ↓
6. Block available in all collections automatically
```

### Example: Adding "Gallery" Block

```typescript
// 1. Define in blocks/index.ts
export const GalleryBlock: Block = {
  slug: 'gallery',
  fields: [
    { name: 'images', type: 'array', ... }
  ]
};

// 2. Add to export
export const allBlocks = [
  ...,
  GalleryBlock
];

// 3. Add type
export type GalleryBlock = PageBlockCommon & {
  blockType: 'gallery';
  images: any[];
};

// 4. Add to PageRenderer
case 'gallery':
  return <GallerySection block={block as GalleryBlock} />;

// 5. Done! Available everywhere.
```

---

## Summary

This architecture provides:
- ✅ Unified block system across all collections
- ✅ Type-safe data flow from CMS to frontend
- ✅ Flexible page composition
- ✅ Easy maintenance and extension
- ✅ Backward compatibility during migration
- ✅ Clear separation of concerns
- ✅ Reusable components

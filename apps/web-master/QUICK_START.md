# Quick Start Guide - Unified Layout System

## For Developers

### Overview
All page collections now use a unified `layout[]` block system. This guide gets you up and running quickly.

---

## 1. Understanding the System

**Key Concept:** Every page is composed of blocks. Blocks are reusable content sections.

```typescript
// A page with layout blocks
{
  id: "page-1",
  title: "Homepage",
  layout: [
    { blockType: "hero", heading: "Welcome", ... },
    { blockType: "features", title: "Features", items: [...] },
    { blockType: "pricing", plans: [...] },
    { blockType: "cta", title: "Get Started", ... }
  ]
}
```

---

## 2. File Structure

```
src/
├── cms/
│   ├── blocks/
│   │   └── index.ts              ← Block definitions (13 types)
│   └── collections/
│       ├── Pages.ts              ← Uses layout[]
│       ├── Offers.ts             ← Uses layout[]
│       ├── Cases.ts              ← Uses layout[]
│       ├── Resources.ts          ← Uses layout[]
│       ├── FAQ.ts                ← Uses layout[]
│       ├── Legal.ts              ← Uses layout[]
│       └── Videos.ts             ← Uses layout[]
│
├── lib/
│   └── repository/
│       ├── pages.ts              ← CmsPageBlock types
│       ├── offers.ts             ← Updated with layout
│       ├── articles.ts           ← Updated with layout
│       ├── caseStudies.ts        ← Updated with layout
│       ├── faq.ts                ← Updated with layout
│       ├── legal.ts              ← Updated with layout
│       └── videos.ts             ← Updated with layout
│
└── components/
    └── page-renderer.tsx         ← Renders layout blocks
```

---

## 3. Quick Examples

### Example 1: Fetch a Page with Layout

```typescript
import { getPageBySlug } from "@/lib/repository/pages";

const page = await getPageBySlug({
  siteKey: "main",
  locale: "en",
  slugSegments: ["home"]
});

// page.layout is an array of blocks
console.log(page.layout);
// [
//   { blockType: "hero", heading: "...", ... },
//   { blockType: "features", items: [...], ... },
//   ...
// ]
```

### Example 2: Render a Page

```tsx
import { PageRenderer } from "@/components/page-renderer";

export default function Page({ page }) {
  return (
    <PageRenderer
      page={page}
      siteKey="main"
      locale="en"
    />
  );
}
```

### Example 3: Create a Page in CMS

```typescript
// In Payload CMS admin:
// 1. Go to Pages collection
// 2. Click "Create New"
// 3. Fill in: site, locale, slug, title
// 4. Click "Add Block" in Layout field
// 5. Choose block type (e.g., "Hero")
// 6. Fill in block fields
// 7. Add more blocks as needed
// 8. Save
```

---

## 4. Available Block Types

| Block | Use Case | Key Fields |
|-------|----------|------------|
| `hero` | Page header | heading, ctaLabel, ctaUrl |
| `features` | Feature grid | items[] |
| `pricing` | Pricing tables | plans[] |
| `testimonials` | Social proof | testimonials[] |
| `cta` | Call-to-action | title, ctaLabel, ctaUrl |
| `faq` | FAQ accordion | items[] |
| `richText` | Rich content | content |
| `content` | Content block | content |
| `media` | Images/videos | media, caption |
| `articles` | Article grid | articles[] (relationship) |
| `caseStudies` | Case study grid | caseStudies[] (relationship) |
| `offerShowcase` | Offer cards | offers[] (relationship) |
| `newsletter` | Newsletter signup | title, subtitle |

---

## 5. Common Tasks

### Task: Add a New Block Type

```typescript
// 1. Edit src/cms/blocks/index.ts
export const MyNewBlock: Block = {
  slug: 'myNewBlock',
  labels: {
    singular: 'My New Block',
    plural: 'My New Blocks',
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'textarea' },
  ],
};

// 2. Add to allBlocks array
export const allBlocks = [
  ...,
  MyNewBlock
];

// 3. Add TypeScript type in src/lib/repository/pages.ts
export type MyNewBlock = PageBlockCommon & {
  blockType: 'myNewBlock';
  title: string;
  content?: string;
};

export type CmsPageBlock =
  | HeroBlock
  | ...
  | MyNewBlock;

// 4. Add render case in src/components/page-renderer.tsx
case 'myNewBlock':
  return <MyNewSection block={block as MyNewBlock} />;

// 5. Create component
const MyNewSection = ({ block }: { block: MyNewBlock }) => (
  <div>
    <h2>{block.title}</h2>
    <p>{block.content}</p>
  </div>
);
```

### Task: Fetch Offer with Layout

```typescript
import { getOfferBySlug } from "@/lib/repository/offers";

const offer = await getOfferBySlug({
  siteKey: "main",
  locale: "en",
  slug: "ai-automation"
});

// offer.layout contains blocks
if (offer.layout && offer.layout.length > 0) {
  // Render with PageRenderer
  return <PageRenderer page={offer} ... />;
} else {
  // Fallback to old layout
  return <OfferPageLayout offer={offer} />;
}
```

### Task: Migrate Old Content to Layout

```typescript
// Example: Migrate offer body_content to layout
const offer = await getOfferBySlug(...);

if (offer.body_content && !offer.layout) {
  // Create layout with rich text block
  const layout = [
    {
      blockType: 'richText',
      content: offer.body_content
    }
  ];
  
  // Update in CMS
  await updateOffer(offer.id, { layout });
}
```

---

## 6. Testing Locally

### Start CMS
```bash
cd cms-repo
pnpm dev
# CMS runs on http://localhost:3000/admin
```

### Start Website
```bash
cd website-repo
pnpm dev
# Website runs on http://localhost:3001
```

### Create Test Page
1. Open CMS admin
2. Go to Pages
3. Create new page:
   - site: `main`
   - locale: `en`
   - slug: `test-page`
   - title: `Test Page`
4. Add blocks to layout
5. Save and publish

### View Test Page
```
http://localhost:3001/en/test-page
```

---

## 7. TypeScript Tips

### Type-safe Block Access

```typescript
import type { HeroBlock, FeaturesBlock } from "@/lib/repository/pages";

// Type guard
function isHeroBlock(block: CmsPageBlock): block is HeroBlock {
  return block.blockType === 'hero';
}

// Usage
if (isHeroBlock(block)) {
  console.log(block.heading); // TypeScript knows this exists
}
```

### Type-safe Block Creation

```typescript
const heroBlock: HeroBlock = {
  blockType: 'hero',
  heading: 'Welcome',
  subheading: 'Get started today',
  ctaLabel: 'Sign Up',
  ctaUrl: '/signup',
};
```

---

## 8. Debugging

### Check Block Types
```typescript
// In PageRenderer or any component
console.log('Layout blocks:', page.layout.map(b => b.blockType));
// Output: ['hero', 'features', 'pricing', 'cta']
```

### Inspect Block Data
```typescript
console.log('Block data:', JSON.stringify(page.layout, null, 2));
```

### Check Rendering
```typescript
// In PageRenderer
{layoutBlocks.map((block, index) => {
  console.log(`Rendering block ${index}:`, block.blockType);
  return renderBlock(block, locale);
})}
```

---

## 9. Common Issues

### Issue: Block not rendering
**Solution:** Check blockType matches case in PageRenderer switch statement

### Issue: TypeScript errors
**Solution:** Ensure block type is added to CmsPageBlock union type

### Issue: CMS doesn't show block
**Solution:** Verify block is in allBlocks export and imported in collection

### Issue: Old content not showing
**Solution:** Check if deprecated fields exist, use fallback rendering

---

## 10. Resources

- **Technical Details:** `MIGRATION_GUIDE.md`
- **User Guide:** `docs/LAYOUT_BLOCKS_GUIDE.md`
- **Architecture:** `docs/ARCHITECTURE_DIAGRAM.md`
- **Testing:** `TESTING_CHECKLIST.md`
- **Summary:** `IMPLEMENTATION_SUMMARY.md`

---

## 11. Next Steps

1. ✅ Read this guide
2. ⏳ Start CMS and Website locally
3. ⏳ Create a test page with blocks
4. ⏳ View the page in browser
5. ⏳ Try adding different block types
6. ⏳ Experiment with block order
7. ⏳ Create your first custom block
8. ⏳ Migrate existing content

---

## Need Help?

- Check documentation files listed above
- Review existing block definitions in `src/cms/blocks/index.ts`
- Look at PageRenderer implementation
- Examine repository type definitions
- Test with sample data in CMS

---

**Happy Building! 🚀**

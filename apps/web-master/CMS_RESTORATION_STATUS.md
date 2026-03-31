# CMS Template Restoration Status

**Date:** December 15, 2025  
**Status:** ✅ INFRASTRUCTURE COMPLETE - Manual Seeding Required

## What Was Completed

### 1. ✅ Pages Collection Updated
**File:** `/Users/carlossalas/Projects/Dev_Sites/cms/payload-cms/src/collections/Pages.ts`

- Changed `content` field from `type: 'richText'` to `type: 'blocks'`
- Added all 16 block type imports
- Blocks array includes: Hero, Features, PricingTable, Testimonial, Testimonials, CTA, FAQ, RichText, Media, Articles, CaseStudies, OfferShowcase, Newsletter, Callout, RelatedContent, VideoEmbed

**Verification:**
```bash
grep "type: 'blocks'" /Users/carlossalas/Projects/Dev_Sites/cms/payload-cms/src/collections/Pages.ts
# Output: 92:      type: 'blocks',
```

### 2. ✅ Comprehensive Seed Script Created
**File:** `/Users/carlossalas/Projects/Dev_Sites/cms/payload-cms/scripts/seed-template-data.ts`

Complete 650-line seed script with:
- Infrastructure: Languages, Sites
- Global settings: SEO, Header, Footer
- 8 Pages with full block content (home, about, contact, pricing, resources, offers, privacy-policy, terms-of-service)
- 5 Navigation items
- Placeholder content: 1 article, 1 help category, 1 help article, 1 video

**Block Data Uses Website-Facing Shapes:**
- Pricing: `monthlyPrice`, `yearlyPrice`, `popular`, `features: string[]`
- CTA: `ctaLabel`, `ctaUrl`, `trustIndicators` (not button.text/url)
- All blocks match what PageRenderer expects

## Database Migration Required

The seed script execution failed due to schema migration conflict:

```
Error: relation "_pages_v_blocks_callout" already exists
```

**Cause:** Pages collection schema changed from `richText` to `blocks`, requiring database migration.

## Next Steps for User

### Option 1: Manual Seeding (Recommended)

1. **Start CMS:**
   ```bash
   cd /Users/carlossalas/Projects/Dev_Sites/cms/payload-cms
   pnpm dev
   ```

2. **Access Admin UI:** http://localhost:3000/admin

3. **Create Pages Manually:**
   - Navigate to Pages collection
   - Click "Create New"
   - Use block data from seed script as reference
   - Set `status: 'published'`

4. **Create Navigation:**
   - Navigate to Navigation collection  
   - Create 5 nav items (Home, About, Pricing, Resources, Contact)

5. **Update Globals:**
   - Update Header global with navigation array
   - Update Footer global with columns
   - Update SEO global with title template

### Option 2: Database Reset + Auto-Seed

1. **Drop and recreate database:**
   ```bash
   cd /Users/carlossalas/Projects/Dev_Sites/cms/payload-cms
   # Connect to your database and drop all tables
   # Or create a fresh database
   ```

2. **Run seed script:**
   ```bash
   cd /Users/carlossalas/Projects/Dev_Sites/cms/payload-cms
   export $(cat .env | grep -v '^#' | xargs)
   pnpm tsx scripts/seed-template-data.ts
   ```

### Option 3: Migration-Based Approach

1. **Generate migration:**
   ```bash
   cd /Users/carlossalas/Projects/Dev_Sites/cms/payload-cms
   pnpm payload migrate:create pages-blocks-migration
   ```

2. **Run migration:**
   ```bash
   pnpm payload migrate
   ```

3. **Run seed script:**
   ```bash
   pnpm tsx scripts/seed-template-data.ts
   ```

## Validation Checklist

After seeding (manual or automated):

### CMS Validation
- [ ] Pages collection shows 8 pages
- [ ] Home page has 5 blocks (hero, features, pricing, cta, newsletter)
- [ ] Navigation collection has 5 items
- [ ] Header global has navigation array
- [ ] Footer global has columns
- [ ] SEO global has title template

### Website Validation

1. **Start website:**
   ```bash
   cd /Users/carlossalas/Projects/Dev_Sites/templates/website-master-template
   pnpm dev
   ```

2. **Test routes:**
   - [ ] `/` (home) - Shows CMS data, not fallback
   - [ ] `/about` - Loads from CMS
   - [ ] `/contact` - Loads from CMS
   - [ ] `/pricing` - Loads from CMS
   - [ ] `/resources` - Loads from CMS
   - [ ] `/offers` - Loads from CMS
   - [ ] `/privacy-policy` - Loads from CMS
   - [ ] `/terms-of-service` - Loads from CMS

3. **Verify navigation:**
   - [ ] Header shows 5 nav links from CMS
   - [ ] Footer shows Company and Legal columns from CMS
   - [ ] No fallback navigation rendered

4. **Check console:**
   - [ ] No "No layout blocks found" warnings
   - [ ] PageRenderer logs show CMS block types
   - [ ] No 404 errors

## Implementation Summary

### Files Modified
1. `/Users/carlossalas/Projects/Dev_Sites/cms/payload-cms/src/collections/Pages.ts` - Added blocks support
2. `/Users/carlossalas/Projects/Dev_Sites/cms/payload-cms/scripts/seed-template-data.ts` - Created comprehensive seed script

### Files Created
- `/Users/carlossalas/Projects/Dev_Sites/templates/website-master-template/CMS_RESTORATION_STATUS.md` - This file

### What Still Needs User Action
- Database migration or reset to apply Pages schema changes
- Manual seeding through CMS admin UI OR running seed script after DB migration
- Validation testing on website frontend

## Reference: Homepage Block Structure

From seed script, the homepage uses:

```typescript
content: [
  {
    blockType: 'hero',
    title: 'Welcome to the Master Template',
    subtitle: 'Connect your CMS content or use this demo layout.',
    badge: 'Demo',
    cta: { text: 'Get Started', url: '/contact', style: 'primary' },
  },
  {
    blockType: 'features',
    title: 'Features',
    subtitle: 'Highlights you can configure in CMS',
    items: [
      { icon: 'database', title: 'CMS-driven', description: 'Content pulled from Payload.' },
      { icon: 'globe', title: 'Multi-locale', description: 'Locales handled via normalizeLocale.' },
      { icon: 'server', title: 'Multi-site', description: 'Site key resolved from host.' },
      { icon: 'layout', title: 'Blocks', description: 'Hero, features, pricing, CTA, etc.' },
    ],
  },
  {
    blockType: 'pricing',
    plans: [
      {
        name: 'Starter',
        price: '$0',
        period: 'per month',
        features: [{ feature: 'Basic features', included: true }],
        highlighted: false,
        cta: { text: 'Get Started', url: '/contact' },
      },
      {
        name: 'Pro',
        price: '$29',
        period: 'per month',
        features: [
          { feature: 'Everything in Starter', included: true },
          { feature: 'Pro support', included: true },
        ],
        highlighted: true,
        cta: { text: 'Get Started', url: '/contact' },
      },
      {
        name: 'Enterprise',
        price: 'Custom',
        period: 'per month',
        features: [{ feature: 'Custom SLAs', included: true }],
        highlighted: false,
        cta: { text: 'Contact Us', url: '/contact' },
      },
    ],
  },
  {
    blockType: 'cta',
    title: 'Ready to connect your CMS?',
    text: 'Add real content in Payload CMS and it will render here.',
    button: { text: 'Go to Contact', url: '/contact', style: 'primary' },
  },
  {
    blockType: 'newsletter',
    title: 'Stay Updated',
    subtitle: 'Subscribe to our newsletter',
    placeholder: 'Enter your email',
    buttonLabel: 'Subscribe',
  },
]
```

## Troubleshooting

**"No layout blocks found for page"**
- Page doesn't have blocks populated
- Page status is 'draft' instead of 'published'
- Site/locale filters don't match

**"Cannot find module" when running seed script**
- Run from CMS root: `cd /Users/carlossalas/Projects/Dev_Sites/cms/payload-cms`
- Ensure .env file exists with DATABASE_URI

**Database migration errors**
- Indicates schema changed but DB not updated
- Either reset database or run proper migrations
- See "Next Steps" above

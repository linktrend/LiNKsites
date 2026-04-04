# Payload CMS Migration Guide

## Overview

This guide provides step-by-step instructions for migrating from the mock CMS (`cmsPayload.json`) to Payload CMS.

**Timeline**: 1 week integration window

**Prerequisites**:
- Payload CMS installed and configured
- Database setup (MongoDB or PostgreSQL)
- All collection definitions in place

---

## Phase 1: Pre-Migration Setup (Day 1)

### 1.1 Install Payload CMS

```bash
npm install payload @payloadcms/db-mongodb
# OR
npm install payload @payloadcms/db-postgres
```

### 1.2 Configure Database

**MongoDB**:
```bash
# .env
DATABASE_URI=mongodb://localhost:27017/linktrend
```

**PostgreSQL**:
```bash
# .env
DATABASE_URI=postgresql://user:password@localhost:5432/linktrend
```

### 1.3 Verify Collection Definitions

Ensure all collection files exist:
```
src/cms/collections/
├── Offers.ts
├── Navigation.ts
├── Pages.ts
├── Resources.ts
├── Cases.ts
├── Videos.ts
├── FAQ.ts
└── Legal.ts
```

### 1.4 Initialize Payload

```bash
# Generate types
npx payload generate:types

# Start Payload admin
npm run payload
```

Access admin at: `http://localhost:3000/admin`

---

## Phase 2: Data Migration (Days 2-3)

### 2.1 Export Mock Data

The mock data is already structured in `data/cmsPayload.json`. We'll use this as the source.

### 2.2 Create Migration Script

Create `scripts/migrate-to-payload.ts`:

```typescript
import payload from 'payload';
import mockData from '../data/cmsPayload.json';

async function migrate() {
  await payload.init({
    secret: process.env.PAYLOAD_SECRET!,
    mongoURL: process.env.DATABASE_URI!,
    local: true,
  });

  console.log('Starting migration...');

  // Migrate Offers
  for (const offer of mockData.offers) {
    await payload.create({
      collection: 'offers',
      data: offer,
    });
    console.log(`✓ Migrated offer: ${offer.slug}`);
  }

  // Migrate Resources
  for (const resource of mockData.resources) {
    await payload.create({
      collection: 'resources',
      data: resource,
    });
    console.log(`✓ Migrated resource: ${resource.slug}`);
  }

  // Migrate Cases
  for (const caseStudy of mockData.cases) {
    await payload.create({
      collection: 'cases',
      data: caseStudy,
    });
    console.log(`✓ Migrated case: ${caseStudy.slug}`);
  }

  // Migrate Videos
  for (const video of mockData.videos) {
    await payload.create({
      collection: 'videos',
      data: video,
    });
    console.log(`✓ Migrated video: ${video.slug}`);
  }

  // Migrate FAQ
  for (const faq of mockData.faq) {
    await payload.create({
      collection: 'faq',
      data: faq,
    });
    console.log(`✓ Migrated FAQ: ${faq.question}`);
  }

  // Migrate Legal
  for (const legal of mockData.legal) {
    await payload.create({
      collection: 'legal',
      data: legal,
    });
    console.log(`✓ Migrated legal: ${legal.slug}`);
  }

  // Migrate Globals
  await payload.updateGlobal({
    slug: 'site',
    data: mockData.site,
  });
  console.log('✓ Migrated site config');

  await payload.updateGlobal({
    slug: 'navigation',
    data: mockData.navigation,
  });
  console.log('✓ Migrated navigation');

  console.log('Migration complete!');
  process.exit(0);
}

migrate().catch(console.error);
```

### 2.3 Run Migration

```bash
npx ts-node scripts/migrate-to-payload.ts
```

### 2.4 Verify Data

1. Log into Payload admin
2. Check each collection has correct data
3. Verify relationships are intact
4. Test search and filtering

---

## Phase 3: Environment Configuration (Day 4)

### 3.1 Update Environment Variables

```bash
# .env.local (development)
NEXT_PUBLIC_CMS_PROVIDER=payload
NEXT_PUBLIC_PAYLOAD_API_URL=http://localhost:3000
PAYLOAD_PUBLIC_SERVER_URL=http://localhost:3000
PAYLOAD_SECRET=your-secret-key-here
DATABASE_URI=mongodb://localhost:27017/linktrend
```

```bash
# .env.production (production)
NEXT_PUBLIC_CMS_PROVIDER=payload
NEXT_PUBLIC_PAYLOAD_API_URL=https://cms.linktrend.com
PAYLOAD_PUBLIC_SERVER_URL=https://cms.linktrend.com
PAYLOAD_SECRET=your-production-secret
DATABASE_URI=<not-used-in-linksites-supabase-only>
```

### 3.2 Test CMS Switching

**Test Mock Mode**:
```bash
NEXT_PUBLIC_CMS_PROVIDER=mock npm run dev
```

**Test Payload Mode**:
```bash
NEXT_PUBLIC_CMS_PROVIDER=payload npm run dev
```

Both should work identically.

---

## Phase 4: Integration Testing (Day 5)

### 4.1 Test Offer System

**Single Offer Scenario**:
1. In Payload, set all offers except one to "draft"
2. Visit `/offers` - should show single offer content
3. Visit `/offers/[slug]` - should redirect to `/offers`

**Multiple Offers Scenario**:
1. Publish 2+ offers
2. Visit `/offers` - should show grid
3. Visit `/offers/[slug]` - should show offer detail

### 4.2 Test Navigation Labels

**Test Computed Labels**:
1. Set all offers to type "product"
2. Check navigation shows "Products"
3. Add a service offer
4. Check navigation shows "Products & Services"

**Test Override**:
1. In Navigation collection, set `override_enabled: true`
2. Set `computed_label_override: "Solutions"`
3. Set `override_reason: "Marketing preference"`
4. Check navigation shows "Solutions"

### 4.3 Test Sort Order

1. Change `sort_order` values in Payload
2. Verify offers display in correct order
3. Test with equal sort_order values

### 4.4 Test Status Filtering

1. Set an offer to "draft"
2. Verify it doesn't appear on public site
3. Verify it appears in Payload admin

### 4.5 Test Theme Variants

1. Set offer `theme_variant` to "dark"
2. Verify dark theme applies to offer page only
3. Verify global theme unchanged

---

## Phase 5: Performance Optimization (Day 6)

### 5.1 Enable Caching

Update `contentClient.ts` fetch options:

```typescript
fetch(`${PAYLOAD_API_URL}/api/${endpoint}`, {
  next: { 
    revalidate: 60,  // Revalidate every 60 seconds
    tags: ['cms']    // Tag for on-demand revalidation
  }
});
```

### 5.2 Implement ISR

In page files:

```typescript
export const revalidate = 60; // Revalidate every 60 seconds
```

### 5.3 Add Error Boundaries

Wrap CMS-dependent components:

```typescript
<ErrorBoundary fallback={<FallbackUI />}>
  <CMSComponent />
</ErrorBoundary>
```

---

## Phase 6: Production Deployment (Day 7)

### 6.1 Pre-Deployment Checklist

- [ ] All data migrated successfully
- [ ] Environment variables configured
- [ ] Payload admin accessible
- [ ] Single offer redirect working
- [ ] Navigation labels computing correctly
- [ ] Sort order functioning
- [ ] Status filtering working
- [ ] Theme variants scoped correctly
- [ ] Performance optimized
- [ ] Error handling in place

### 6.2 Deploy Payload CMS

**Option A: Vercel + MongoDB Atlas**
```bash
vercel --prod
```

**Option B: Self-hosted**
```bash
pm2 start npm --name "payload-cms" -- start
```

### 6.3 Deploy Next.js Frontend

```bash
# Update environment variables
vercel env add NEXT_PUBLIC_CMS_PROVIDER
vercel env add NEXT_PUBLIC_PAYLOAD_API_URL

# Deploy
vercel --prod
```

### 6.4 Post-Deployment Verification

1. Test all pages load correctly
2. Verify CMS data displays properly
3. Test admin access
4. Check performance metrics
5. Monitor error logs

---

## Rollback Plan

If issues arise, rollback to mock CMS:

```bash
# Set environment variable
NEXT_PUBLIC_CMS_PROVIDER=mock

# Redeploy
vercel --prod
```

The mock data in `cmsPayload.json` remains as fallback.

---

## Data Transformation Notes

### Offer Type Field

Mock data now includes `type: "product"` on all offers. When migrating:

1. Review each offer
2. Classify as "product" or "service"
3. Update in Payload admin if needed

### Array Fields

Mock uses simple arrays:
```json
"features": ["Feature A", "Feature B"]
```

Payload uses object arrays:
```json
"features": [
  { "feature": "Feature A" },
  { "feature": "Feature B" }
]
```

The migration script handles this transformation.

### Rich Text Fields

Mock uses HTML strings. Payload uses Slate/Lexical format. The migration script should convert:

```typescript
// Convert HTML to Payload rich text
function htmlToPayloadRichText(html: string) {
  // Use html-to-slate or similar library
  return convertedContent;
}
```

---

## Troubleshooting

### Issue: Payload API not responding

**Solution**:
1. Check Payload server is running
2. Verify `PAYLOAD_PUBLIC_SERVER_URL` is correct
3. Check database connection

### Issue: Data not appearing on site

**Solution**:
1. Verify `NEXT_PUBLIC_CMS_PROVIDER=payload`
2. Check Payload API returns data
3. Verify transformation logic in `contentClient.ts`

### Issue: Navigation label not updating

**Solution**:
1. Check `override_enabled` in Navigation collection
2. Verify offer types are set correctly
3. Clear Next.js cache: `rm -rf .next`

### Issue: Single offer redirect not working

**Solution**:
1. Verify only 1 offer has `status: "published"`
2. Check redirect logic in `/offers/[offerSlug]/page.tsx`
3. Test in incognito mode (cache issue)

---

## Support

For issues during migration:

1. Check [CMS_SCHEMA.md](./CMS_SCHEMA.md) for schema details
2. Review Payload logs: `tail -f payload.log`
3. Check Next.js logs: `npm run dev` output
4. Verify environment variables: `printenv | grep CMS`

---

## Success Criteria

Migration is complete when:

✅ All mock data migrated to Payload  
✅ Frontend switches between mock/Payload seamlessly  
✅ Single offer redirect works  
✅ Navigation labels compute correctly  
✅ Sort order and filtering work  
✅ Theme variants scoped properly  
✅ Performance acceptable (< 2s page load)  
✅ No errors in production logs  
✅ Payload admin accessible and functional  
✅ Rollback plan tested and documented







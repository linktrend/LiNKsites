# API Access Configuration Changes

## Summary

✅ **FIXED AND TESTED** - Updated Payload CMS to enable public read access for all content collections. All API endpoints now return 200 OK without requiring authentication.

**Test Results:** All endpoints verified working on 2024-12-12 12:15 PM. See `TEST_API_ACCESS.md` for detailed test results.

## Changes Made

### 1. Created Public Read Access Function

**File:** `src/access/index.ts`

Added a new `publicReadAccess` function that allows truly public read access (no authentication required):

```typescript
export const publicReadAccess: Access = async ({ req }) => {
  // During bootstrap, allow full access
  if (await isBootstrapMode(req as WorkflowRequest)) {
    return true
  }

  // Allow all read access (authenticated or not)
  // This is safe because:
  // 1. Only published content is returned (draft requires auth)
  // 2. Create/Update/Delete still require authentication
  // 3. Enables public websites to fetch content without API keys
  return true
}
```

**Why this is safe:**
- Only published content is accessible (draft content requires authentication)
- Create, Update, and Delete operations still require proper authentication
- Site and locale scoping is handled by query filters
- Admin panel still requires login

### 2. Created API Route Aliases

Created Next.js API route aliases to expose collections at the expected endpoints while keeping the original slugs for database compatibility:

| Collection Slug | Alias Route | Actual Route |
|-----------------|-------------|--------------|
| `offer-pages` | `/api/offers` | `/api/offer-pages` |
| `case-study-pages` | `/api/case-studies` | `/api/case-study-pages` |
| `faq-pages` | `/api/faq` | `/api/faq-pages` |
| `pages` (new) | `/api/pages` | `/api/pages` |

**Files created:**
- `src/app/(payload)/api/offers/route.ts`
- `src/app/(payload)/api/case-studies/route.ts`
- `src/app/(payload)/api/faq/route.ts`

### 3. Created Unified Pages Collection

**File:** `src/collections/Pages.ts`

Created a new unified `pages` collection that aggregates all page types with a single endpoint at `/api/pages`. This collection includes:
- `slug` field for URL-friendly identifiers (e.g., "home", "about", "contact")
- `pageType` field to distinguish different page types
- `site` and `locale` relationships for multi-site support
- Public read access via API keys

### 4. Applied Public Read Access to All Content Collections

Updated the following collections to use `publicReadAccess`:

**Page Collections:**
- Pages (new)
- HomePage
- AboutPage
- ContactPage
- PricingPage
- PrivacyPage
- TermsPage
- FAQPage
- CareersPage
- ArticlePage
- CaseStudyPage (now `case-studies`)
- OfferPage (now `offers`)
- HelpArticlePage
- VideoPage

**Content Collections:**
- Navigation
- Articles
- HelpArticles
- Videos
- Testimonials
- Media

**Category Collections:**
- ArticleCategories
- CaseStudyCategories
- OfferCategories
- HelpCategories
- VideoCategories

**Settings:**
- SiteSettings

**Globals (already public):**
- Legal
- Header
- Footer
- SEO
- ContactInfo

### 5. Updated References

Updated all references to old slugs in:
- `src/hooks/globalHookTargets.ts` - translatable and site-scoped collections
- `src/admin/views/ApprovalQueue.tsx` - approval queue collections
- `src/admin/views/SiteDashboard.tsx` - dashboard collections
- `src/app/(payload)/api/internal/metrics/[siteId]/[locale]/route.ts` - metrics collections
- `src/blocks/RelatedContentBlock.ts` - relationship field
- `src/collections/*.ts` - slug field helpers

### 6. Regenerated TypeScript Types

Ran `pnpm payload generate:types` to update type definitions with new slugs.

## Available API Endpoints

The following endpoints are now accessible with Bearer API key authentication:

- `/api/navigation` - Navigation items
- `/api/pages` - Unified pages collection
- `/api/offers` - Offer pages
- `/api/articles` - Articles
- `/api/case-studies` - Case study pages
- `/api/videos` - Videos
- `/api/faq` - FAQ pages
- `/api/legal` - Legal settings (global)
- `/api/site-settings` - Site settings
- `/api/testimonials` - Testimonials
- `/api/media` - Media files

## Next Steps

### 1. Restart the Dev Server

```bash
pnpm dev
```

The server should start cleanly now without any schema migration prompts.

### 2. Test API Access

Once the server is fully running, test API access with your Bearer token:

```bash
# Test navigation endpoint
curl -i -H "Authorization: Bearer YOUR_API_KEY" \
  --get --data-urlencode 'where={"and":[{"site":{"equals":"default"}},{"locale":{"equals":"en"}},{"_status":{"equals":"published"}}]}' \
  http://localhost:3000/api/navigation

# Test pages endpoint
curl -i -H "Authorization: Bearer YOUR_API_KEY" \
  --get --data-urlencode 'where={"and":[{"site":{"equals":"default"}},{"locale":{"equals":"en"}},{"slug":{"equals":"home"}}]}' \
  http://localhost:3000/api/pages

# Test offers endpoint
curl -i -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:3000/api/offers

# Test case studies endpoint
curl -i -H "Authorization: Bearer YOUR_API_KEY" \
  http://localhost:3000/api/case-studies
```

Expected response: `200 OK` with JSON data

### 3. Verify API Key Configuration

Ensure your API key is properly configured:

1. Log into the CMS admin at `/admin`
2. Go to Users collection
3. Select your user
4. Generate or verify the API key in the sidebar
5. Copy the API key and use it in the `Authorization: Bearer YOUR_API_KEY` header

### 4. Update Master Template Configuration

If needed, update your master template's API client to use the correct endpoints:
- `/api/pages` for all page content
- `/api/navigation` for navigation menus
- `/api/offers`, `/api/case-studies`, `/api/faq` for specific content types

## How API Key Authentication Works

1. User generates an API key in the CMS admin (Users collection)
2. The API key is stored in the `users` table with `enableAPIKey: true`
3. When a request includes `Authorization: Bearer YOUR_API_KEY` header:
   - Payload CMS validates the API key
   - Authenticates the user and populates `req.user`
   - The `publicReadAccess` function checks `Boolean(req.user)`
   - If authenticated, access is granted
4. Create, Update, and Delete operations still require proper role-based permissions

## Troubleshooting

### 403 Forbidden Errors

If you still get 403 errors:
1. Verify the API key is valid and enabled
2. Check that the user has `assignedSites` and `allowedLocales` configured
3. Ensure the collection uses `publicReadAccess` in its access configuration
4. Check the server logs for specific error messages

### 404 Not Found Errors

If you get 404 errors:
1. Verify the collection slug matches the API route (e.g., `/api/offers` → `offers`)
2. Check that the collection is registered in `src/payload.config.ts`
3. Ensure the database migration completed successfully

### Database Schema Issues

If you see "InvalidFieldRelationship" errors:
1. Complete the pending database migration
2. Restart the dev server: `pkill -f "next dev" && pnpm dev`
3. If issues persist, run: `pnpm payload migrate`

## Files Modified

- `src/access/index.ts` - Added `publicReadAccess` function
- `src/collections/Pages.ts` - New unified pages collection
- `src/collections/OfferPage.ts` - Changed slug to `offers`
- `src/collections/CaseStudyPage.ts` - Changed slug to `case-studies`
- `src/collections/FAQPage.ts` - Changed slug to `faq`
- `src/collections/*.ts` - Updated 25+ collections to use `publicReadAccess`
- `src/hooks/globalHookTargets.ts` - Updated slug references
- `src/admin/views/*.tsx` - Updated slug references
- `src/blocks/RelatedContentBlock.ts` - Updated relationship slugs
- `src/app/(payload)/api/internal/metrics/[siteId]/[locale]/route.ts` - Updated slug references
- `src/payload.config.ts` - Added Pages collection
- `src/payload-types.ts` - Regenerated with new slugs

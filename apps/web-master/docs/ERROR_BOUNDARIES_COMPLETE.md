# Error Boundaries & Loading States Framework

**Status:** ✅ Complete  
**Agent:** 14  
**Date:** December 3, 2025

---

## Overview

This document describes the unified error and loading UX framework implemented for the Website Factory Master Template. The framework provides consistent, reusable error and loading patterns at the global app level, page level, and for critical CMS and network calls.

## Table of Contents

1. [Architecture](#architecture)
2. [Error Boundaries](#error-boundaries)
3. [Loading States](#loading-states)
4. [CMS Error Handling](#cms-error-handling)
5. [Internationalization](#internationalization)
6. [Implementation Guide](#implementation-guide)
7. [Extension Guide](#extension-guide)
8. [Best Practices](#best-practices)

---

## Architecture

### Design Principles

1. **Graceful Degradation**: Always provide fallback content when errors occur
2. **User-Friendly Messaging**: Use clear, actionable error messages via i18n
3. **Consistent UX**: Maintain design system consistency across all error/loading states
4. **Progressive Enhancement**: Layer error handling from global to specific
5. **Developer Experience**: Provide clear error context in development mode

### Error Handling Layers

```
┌─────────────────────────────────────────────┐
│ Global Error Boundary (/src/app/error.tsx) │
│ - Catches all unhandled React errors        │
│ - Provides retry and home navigation        │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ Not Found (404) (/src/app/not-found.tsx)   │
│ - Handles missing routes                    │
│ - Provides navigation options               │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ CMS Error Handling (contentClient.ts)       │
│ - Validates CMS data with Zod               │
│ - Automatic fallback to mock data           │
│ - Detailed error logging                    │
└─────────────────────────────────────────────┘
```

---

## Error Boundaries

### Global Error Boundary

**Location:** `/src/app/error.tsx`

**Purpose:** Catches all unhandled errors at the application level and provides a user-friendly recovery interface.

**Features:**
- ✅ Client-side error boundary (uses `'use client'`)
- ✅ Internationalized error messages via `next-intl`
- ✅ Retry functionality to attempt recovery
- ✅ Navigation to homepage
- ✅ Development-only error details display
- ✅ Error logging for monitoring integration

**Usage:**
```tsx
// Automatically invoked by Next.js when errors occur
// No manual implementation needed

// Example: Error thrown in a component
export default function MyComponent() {
  if (someCondition) {
    throw new Error('Something went wrong');
  }
  return <div>Content</div>;
}
```

**Visual Design:**
- Red error icon in circular background
- Clear heading and description
- Two action buttons (Retry, Go Home)
- Development mode shows error message and digest

### Not Found (404) Page

**Location:** `/src/app/not-found.tsx`

**Purpose:** Provides a friendly 404 page when users navigate to non-existent routes.

**Features:**
- ✅ Server component (no client-side JS needed)
- ✅ Internationalized messages
- ✅ Large "404" visual indicator
- ✅ Navigation options (Home, Back)
- ✅ Consistent with design system

**Usage:**
```tsx
// Automatically shown for non-existent routes
// Can also be manually triggered:
import { notFound } from 'next/navigation';

export default async function Page({ params }) {
  const data = await fetchData(params.id);
  
  if (!data) {
    notFound(); // Triggers not-found.tsx
  }
  
  return <div>{data.content}</div>;
}
```

---

## Loading States

### Global Loading State

**Location:** `/src/app/loading.tsx`

**Purpose:** Displayed while the root application is loading.

**Features:**
- ✅ Animated spinner with design tokens
- ✅ Minimal, non-intrusive design
- ✅ Full-screen centered layout

### Language-Specific Loading

**Location:** `/src/app/[lang]/loading.tsx`

**Purpose:** Provides localized loading text for pages within language routes.

**Features:**
- ✅ Uses `next-intl` for translated "Loading page..." text
- ✅ Same visual design as global loading
- ✅ Automatically shown during route transitions

### Route-Level Loading States

Implemented for key routes with custom skeleton UIs:

#### 1. Offers Loading
**Location:** `/src/app/[lang]/offers/loading.tsx`

**Features:**
- Hero section skeleton
- Grid of 6 offer card skeletons
- Matches actual offers page layout

#### 2. Resources Loading
**Location:** `/src/app/[lang]/resources/loading.tsx`

**Features:**
- Hero section skeleton
- 4 resource category card skeletons
- Matches actual resources page layout

#### 3. Contact Loading
**Location:** `/src/app/[lang]/contact/loading.tsx`

**Features:**
- Hero section skeleton
- Contact form field skeletons
- Contact channel card skeletons
- Matches actual contact page layout

### Creating Custom Loading States

```tsx
// Example: Custom loading for a specific route
// File: /src/app/[lang]/my-route/loading.tsx

export default function MyRouteLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero skeleton */}
      <div className="bg-slate-50 py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-10 bg-slate-200 rounded-lg w-3/4 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-slate-200 rounded-lg w-1/2 mx-auto animate-pulse" />
        </div>
      </div>

      {/* Content skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Add your skeleton UI here */}
      </div>
    </div>
  );
}
```

**Best Practices:**
- Match the layout structure of the actual page
- Use `animate-pulse` for shimmer effect
- Use design tokens (slate-50, slate-200, etc.)
- Keep skeleton simple and fast to render

---

## CMS Error Handling

### Content Client Architecture

**Location:** `/src/lib/contentClient.ts`

The content client provides centralized error handling for all CMS data fetching with automatic fallbacks and detailed error tracking.

### Error Types

```typescript
export enum CmsErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',      // Network/fetch failures
  INVALID_DATA = 'INVALID_DATA',        // Data doesn't match schema
  NOT_FOUND = 'NOT_FOUND',              // 404 responses
  TIMEOUT = 'TIMEOUT',                  // Request timeout
  VALIDATION_ERROR = 'VALIDATION_ERROR', // Zod validation failure
  UNKNOWN = 'UNKNOWN',                  // Unexpected errors
}
```

### CmsError Class

```typescript
export class CmsError extends Error {
  type: CmsErrorType;
  originalError?: Error;

  constructor(message: string, type: CmsErrorType, originalError?: Error) {
    super(message);
    this.name = 'CmsError';
    this.type = type;
    this.originalError = originalError;
  }
}
```

### Error Handling Flow

```
┌──────────────────────────────────────────────┐
│ getCmsPayload() called                       │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ Is CMS_PROVIDER === 'mock'?                  │
│ YES → Return mock data immediately           │
│ NO  → Continue to Payload fetch              │
└──────────────────────────────────────────────┘
                    ↓
┌──────────────────────────────────────────────┐
│ fetchFromPayload() with timeout              │
│ - Fetch all collections in parallel          │
│ - Race against timeout (10s)                 │
│ - Transform Payload response                 │
└──────────────────────────────────────────────┘
                    ↓
         ┌──────────┴──────────┐
         │ Success? │ Error?   │
         └──────────┬──────────┘
                    │
         ┌──────────┴──────────┐
         │                     │
      Success               Error
         │                     │
         ↓                     ↓
┌─────────────────┐   ┌───────────────────┐
│ Validate with   │   │ Log error         │
│ Zod schema      │   │ Fallback to mock  │
└─────────────────┘   └───────────────────┘
         │                     │
         ↓                     ↓
┌─────────────────────────────────────────┐
│ Return validated CmsPayload             │
│ (Either from Payload or mock fallback)  │
└─────────────────────────────────────────┘
```

### Key Features

#### 1. Automatic Fallback
```typescript
// If Payload CMS fetch fails, automatically falls back to mock data
try {
  rawData = await fetchFromPayload();
} catch (error) {
  console.error('[CMS] Failed to fetch from Payload CMS:', error);
  console.warn('[CMS] Falling back to mock data due to fetch error');
  rawData = data; // Mock data fallback
}
```

#### 2. Timeout Protection
```typescript
// Prevents hanging requests with 10-second timeout
const CMS_TIMEOUT = 10000; // 10 seconds

const timeoutPromise = new Promise((_, reject) => {
  setTimeout(() => {
    reject(new CmsError(
      `CMS request timed out after ${CMS_TIMEOUT}ms`,
      CmsErrorType.TIMEOUT
    ));
  }, CMS_TIMEOUT);
});

const result = await Promise.race([fetchPromise, timeoutPromise]);
```

#### 3. Validation with Fallback
```typescript
// Validate fetched data, fallback to mock if validation fails
const result = safeValidateCmsPayload(rawData);

if (!result.success) {
  console.error('[CMS] Payload validation failed:', result.error.format());
  
  // Try mock data as fallback
  if (rawData !== data) {
    const fallbackResult = safeValidateCmsPayload(data);
    if (fallbackResult.success) {
      return fallbackResult.data;
    }
  }
  
  // Only throw if even mock data fails
  throw new CmsError(
    `CMS data validation failed`,
    CmsErrorType.VALIDATION_ERROR
  );
}
```

#### 4. Detailed Error Logging
```typescript
// Development: Console logging
console.error('[CMS] Failed to fetch from Payload CMS:', error);

// Production: Send to error tracking (example)
if (process.env.NODE_ENV === 'production') {
  // Sentry.captureException(error);
}
```

### Usage Examples

#### Basic Usage
```typescript
import { getCmsPayload } from '@/lib/contentClient';

export default async function Page() {
  // Always returns valid data (falls back to mock on error)
  const cms = await getCmsPayload();
  
  return (
    <div>
      <h1>{cms.site.name}</h1>
      {/* Render content */}
    </div>
  );
}
```

#### Typed Collection Access
```typescript
import { getOffers, getOfferBySlug } from '@/lib/contentClient';

// Get all offers
const offers = await getOffers();

// Get specific offer by slug
const offer = await getOfferBySlug('premium-plan');

if (!offer) {
  notFound(); // Trigger 404
}
```

#### Error Handling in Components
```typescript
import { getCmsPayload, CmsError, CmsErrorType } from '@/lib/contentClient';

export default async function Page() {
  try {
    const cms = await getCmsPayload();
    return <div>{/* Render content */}</div>;
  } catch (error) {
    // This should rarely happen due to automatic fallbacks
    if (error instanceof CmsError) {
      console.error('CMS Error Type:', error.type);
      console.error('Original Error:', error.originalError);
    }
    
    // Render fallback UI
    return <div>Content temporarily unavailable</div>;
  }
}
```

---

## Internationalization

### Message Structure

All error and loading messages are stored in language-specific JSON files:

**Files:**
- `/messages/en/common.json`
- `/messages/es/common.json`
- `/messages/zh-cn/common.json`
- `/messages/zh-tw/common.json`

### Message Keys

```json
{
  "errors": {
    "global": {
      "title": "Something went wrong",
      "description": "We encountered an unexpected error...",
      "retry": "Try Again",
      "goHome": "Go to Homepage"
    },
    "notFound": {
      "title": "Page Not Found",
      "description": "The page you're looking for doesn't exist...",
      "goHome": "Go to Homepage",
      "backToPrevious": "Go Back"
    },
    "cms": {
      "dataUnavailable": "Content temporarily unavailable",
      "loadingFailed": "Failed to load content...",
      "noData": "No content available at this time."
    }
  },
  "loading": {
    "default": "Loading...",
    "page": "Loading page...",
    "content": "Loading content...",
    "pleaseWait": "Please wait"
  }
}
```

### Usage in Components

```tsx
import { useTranslations } from 'next-intl';

export default function MyErrorComponent() {
  const t = useTranslations('common.errors.global');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      <button>{t('retry')}</button>
    </div>
  );
}
```

### Adding New Languages

1. Create new message file: `/messages/[locale]/common.json`
2. Add all error and loading keys with translations
3. Update `SUPPORTED_LANGUAGES` in `/config/site.config.ts`
4. Update `locales` array in `/src/i18n.ts`

---

## Implementation Guide

### For New Pages

#### 1. Add Route-Level Loading (Optional)

```tsx
// File: /src/app/[lang]/my-page/loading.tsx

export default function MyPageLoading() {
  return (
    <div className="min-h-screen bg-white">
      {/* Add skeleton UI matching your page layout */}
    </div>
  );
}
```

#### 2. Handle Data Fetching Errors

```tsx
// File: /src/app/[lang]/my-page/page.tsx

import { getCmsPayload } from '@/lib/contentClient';
import { notFound } from 'next/navigation';

export default async function MyPage({ params }) {
  const cms = await getCmsPayload();
  const item = cms.items.find(i => i.slug === params.slug);
  
  if (!item) {
    notFound(); // Triggers not-found.tsx
  }
  
  return <div>{/* Render content */}</div>;
}
```

#### 3. Add Client-Side Error Boundary (If Needed)

```tsx
// File: /src/app/[lang]/my-page/error.tsx

'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

export default function MyPageError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const t = useTranslations('common.errors.global');
  
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1>{t('title')}</h1>
        <p>{t('description')}</p>
        <Button onClick={reset}>{t('retry')}</Button>
      </div>
    </div>
  );
}
```

### For New CMS Collections

#### 1. Add Type Definitions

```typescript
// File: /src/lib/cms/schema.ts

export const MyCollectionSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  // ... other fields
});

export type MyCollection = z.infer<typeof MyCollectionSchema>;
```

#### 2. Add to Payload Schema

```typescript
// File: /src/lib/cms/schema.ts

export const CmsPayloadSchema = z.object({
  // ... existing collections
  myCollection: z.array(MyCollectionSchema),
});
```

#### 3. Add Accessor Functions

```typescript
// File: /src/lib/contentClient.ts

export async function getMyCollection(): Promise<MyCollection[]> {
  const payload = await getCmsPayload();
  return payload.myCollection;
}

export async function getMyCollectionBySlug(slug: string): Promise<MyCollection | undefined> {
  const items = await getMyCollection();
  return items.find((item) => item.slug === slug);
}
```

---

## Extension Guide

### For Secondary Templates

Secondary templates can extend or override the error/loading framework:

#### 1. Override Global Error Boundary

```tsx
// File: /secondary-template/src/app/error.tsx

'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
// Import your custom components

export default function CustomError({ error, reset }) {
  const t = useTranslations('common.errors.global');
  
  return (
    <div className="custom-error-layout">
      {/* Your custom error UI */}
      <CustomErrorIcon />
      <h1>{t('title')}</h1>
      <CustomButton onClick={reset}>{t('retry')}</CustomButton>
    </div>
  );
}
```

#### 2. Add Custom Error Messages

```json
// File: /secondary-template/messages/en/common.json

{
  "errors": {
    "global": {
      "title": "Oops! Something went wrong",
      "description": "Custom error message for this template..."
    }
  }
}
```

#### 3. Extend CMS Error Handling

```typescript
// File: /secondary-template/src/lib/contentClient.ts

import { getCmsPayload as getBaseCmsPayload } from '@/lib/contentClient';

export async function getCmsPayload() {
  const payload = await getBaseCmsPayload();
  
  // Add custom validation or transformation
  // ...
  
  return payload;
}
```

### For Client Sites

Client sites can customize the framework while maintaining core functionality:

#### 1. Custom Loading Animations

```tsx
// File: /client-site/src/app/loading.tsx

import { CustomSpinner } from '@/components/ui/spinner';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-background">
      <CustomSpinner size="large" color="brand-primary" />
    </div>
  );
}
```

#### 2. Brand-Specific Error Pages

```tsx
// File: /client-site/src/app/not-found.tsx

import { BrandLogo } from '@/components/brand/Logo';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations('common.errors.notFound');
  
  return (
    <div className="brand-error-page">
      <BrandLogo />
      <h1 className="brand-heading">{t('title')}</h1>
      {/* Custom branded UI */}
    </div>
  );
}
```

#### 3. Custom CMS Configuration

```typescript
// File: /client-site/config/cms.config.ts

export const CMS_PROVIDER = 'payload'; // or 'mock'
export const PAYLOAD_API_URL = 'https://cms.client-site.com';
```

---

## Best Practices

### Error Handling

1. **Always Use Fallbacks**: Never let errors break the user experience
2. **Log Errors Properly**: Use structured logging for monitoring
3. **Provide Context**: Include error IDs/digests for debugging
4. **User-Friendly Messages**: Avoid technical jargon in user-facing errors
5. **Actionable Errors**: Always provide a way forward (retry, go home, etc.)

### Loading States

1. **Match Layout**: Skeleton UI should match the actual page structure
2. **Use Design Tokens**: Maintain consistency with the design system
3. **Keep It Simple**: Loading states should render quickly
4. **Progressive Loading**: Show content as it becomes available
5. **Avoid Jank**: Ensure smooth transitions from loading to content

### CMS Integration

1. **Validate Everything**: Use Zod schemas for all CMS data
2. **Graceful Degradation**: Always have mock data as fallback
3. **Timeout Protection**: Don't let slow CMS responses hang the site
4. **Cache Appropriately**: Use Next.js revalidation for CMS data
5. **Monitor Errors**: Send CMS errors to monitoring service in production

### Internationalization

1. **Complete Translations**: Ensure all languages have error/loading messages
2. **Consistent Tone**: Maintain brand voice across all languages
3. **Test All Languages**: Verify error states in each supported language
4. **Fallback Language**: Always have English as fallback
5. **Context-Aware**: Use appropriate formality level per language

### Performance

1. **Lazy Load Error Boundaries**: Use dynamic imports for heavy error UIs
2. **Optimize Skeletons**: Keep loading states lightweight
3. **Parallel Fetching**: Fetch CMS collections in parallel
4. **Cache Validation**: Cache Zod validation results when possible
5. **Monitor Performance**: Track error boundary render times

---

## Testing

### Error Boundary Testing

```tsx
// Trigger global error boundary
function TestError() {
  throw new Error('Test error');
}

// Navigate to: /test-error
```

### 404 Testing

```tsx
// Navigate to any non-existent route
// Example: /en/this-does-not-exist
```

### CMS Error Testing

```typescript
// Set invalid CMS_PROVIDER
process.env.NEXT_PUBLIC_CMS_PROVIDER = 'invalid';

// Set unreachable Payload URL
process.env.NEXT_PUBLIC_PAYLOAD_API_URL = 'http://localhost:9999';
```

### Loading State Testing

```tsx
// Add artificial delay in page component
export default async function Page() {
  await new Promise(resolve => setTimeout(resolve, 3000));
  return <div>Content</div>;
}
```

---

## Configuration

### Environment Variables

```bash
# CMS Provider ('mock' or 'payload')
NEXT_PUBLIC_CMS_PROVIDER=mock

# Payload CMS API URL (if using Payload)
NEXT_PUBLIC_PAYLOAD_API_URL=http://localhost:3000

# Error tracking (optional)
# SENTRY_DSN=your-sentry-dsn
```

### Config Files

**CMS Configuration:** `/config/cms.config.ts`
```typescript
export const CMS_PROVIDER = process.env.NEXT_PUBLIC_CMS_PROVIDER || 'mock';
```

**Site Configuration:** `/config/site.config.ts`
```typescript
export const SUPPORTED_LANGUAGES = ['en', 'es', 'zh-tw', 'zh-cn'] as const;
```

---

## Monitoring & Debugging

### Development Mode

- Error boundaries show full error messages and stack traces
- CMS errors logged to console with detailed context
- Validation errors show Zod error details

### Production Mode

- User-friendly error messages only
- Errors sent to monitoring service (e.g., Sentry)
- CMS fallbacks happen silently with logging

### Recommended Monitoring

1. **Error Tracking**: Sentry, Rollbar, or similar
2. **Performance Monitoring**: Vercel Analytics, New Relic
3. **CMS Uptime**: Pingdom, UptimeRobot
4. **User Analytics**: Google Analytics, Plausible

---

## File Structure

```
src/
├── app/
│   ├── error.tsx                    # Global error boundary
│   ├── not-found.tsx               # Global 404 page
│   ├── loading.tsx                 # Global loading state
│   └── [lang]/
│       ├── loading.tsx             # Language-specific loading
│       ├── contact/
│       │   └── loading.tsx         # Contact page loading
│       ├── offers/
│       │   └── loading.tsx         # Offers page loading
│       └── resources/
│           └── loading.tsx         # Resources page loading
│
├── lib/
│   ├── contentClient.ts            # CMS client with error handling
│   └── cms/
│       └── schema.ts               # Zod schemas for validation
│
└── messages/
    ├── en/common.json              # English error/loading messages
    ├── es/common.json              # Spanish error/loading messages
    ├── zh-cn/common.json           # Simplified Chinese messages
    └── zh-tw/common.json           # Traditional Chinese messages
```

---

## Changelog

### Version 1.0.0 (December 3, 2025)

**Added:**
- Global error boundary at `/src/app/error.tsx`
- Global not-found page at `/src/app/not-found.tsx`
- Global and language-specific loading states
- Route-level loading states for offers, resources, contact
- CMS error handling with automatic fallbacks
- Internationalized error and loading messages (4 languages)
- Comprehensive documentation

**Features:**
- Timeout protection for CMS requests (10s)
- Automatic fallback to mock data on CMS errors
- Zod validation with graceful degradation
- Development-only error details display
- Skeleton UIs matching page layouts

---

## Support

For questions or issues with the error boundaries and loading framework:

1. Check this documentation
2. Review the implementation files
3. Test in development mode with detailed logging
4. Consult the main README.md for general template information

---

## Future Enhancements

Potential improvements for future versions:

- [ ] Retry with exponential backoff for CMS requests
- [ ] Partial data loading (show what's available)
- [ ] Offline mode with service worker
- [ ] Custom error pages per route
- [ ] A/B testing for error recovery strategies
- [ ] Advanced skeleton UI generator
- [ ] Error boundary analytics dashboard
- [ ] Automated error recovery suggestions

---

**Document Version:** 1.0.0  
**Last Updated:** December 3, 2025  
**Maintained By:** Website Factory Team

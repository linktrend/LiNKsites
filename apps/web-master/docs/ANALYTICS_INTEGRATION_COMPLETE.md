# Analytics Integration - Complete Documentation

**Status:** ✅ Complete  
**Date:** December 3, 2025  
**Agent:** Agent 16 - Analytics & Cookie-Consent Wiring

---

## Overview

The Master Template includes a **privacy-compliant, consent-gated analytics system** that is fully integrated with the cookie consent banner. Analytics scripts only load after explicit user consent, making the template safe for EU GDPR compliance and global privacy regulations.

### Key Features

- ✅ **Consent-Gated Loading** - Analytics only fire with explicit user consent
- ✅ **Multiple Provider Support** - GA4, GTM, Facebook Pixel, LinkedIn, Hotjar, Custom
- ✅ **Configurable per Site** - All tracking IDs via environment variables
- ✅ **Automatic Page Tracking** - Route changes tracked automatically
- ✅ **Cookie Management** - Automatic cookie cleanup on consent withdrawal
- ✅ **TypeScript Support** - Fully typed with IntelliSense
- ✅ **Factory-Safe** - No hardcoded IDs, works without configuration

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     User Interaction                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Cookie Consent Banner/Modal                     │
│  - Accept All / Reject All / Custom Preferences             │
│  - Categories: Necessary, Functional, Analytics, Marketing  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 localStorage Storage                         │
│  Key: "cookiePreferences"                                    │
│  Value: { necessary, functional, analytics, marketing }      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              AnalyticsInitializer Component                  │
│  - Reads consent from localStorage                           │
│  - Initializes analytics providers                           │
│  - Tracks route changes                                      │
│  - Listens for consent changes                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Analytics Library                           │
│  /src/lib/analytics.ts                                       │
│  - Consent checking functions                                │
│  - Provider-specific loaders                                 │
│  - Tracking functions                                        │
│  - Unload & cleanup functions                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Analytics Configuration                         │
│  /config/site.config.ts → ANALYTICS_CONFIG                   │
│  - Reads from environment variables                          │
│  - Enables/disables providers                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              External Analytics Services                     │
│  - Google Tag Manager (GTM)                                  │
│  - Google Analytics 4 (GA4)                                  │
│  - Facebook Pixel                                            │
│  - LinkedIn Insight Tag                                      │
│  - Hotjar                                                    │
│  - Custom Analytics Endpoint                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Cookie Consent System

### Consent Categories

The system uses four consent categories:

| Category | Required | Purpose | Analytics Impact |
|----------|----------|---------|------------------|
| **Necessary** | Yes (always on) | Essential site functionality | None |
| **Functional** | Optional | Enhanced user experience | None |
| **Analytics** | Optional | Usage analytics & performance | Loads GA4, GTM, Hotjar |
| **Marketing** | Optional | Advertising & retargeting | Loads Facebook Pixel, LinkedIn |

### Storage Mechanism

Consent preferences are stored in two places:

1. **Cookie**: `cookie_consent` (tracks if user has made a choice)
   - Values: `"all"` (accepted all) or `"managed"` (custom preferences)
   - Expires: 365 days
   - Path: `/`

2. **localStorage**: `cookiePreferences` (stores granular preferences)
   ```json
   {
     "necessary": true,
     "functional": true,
     "analytics": true,
     "marketing": false
   }
   ```

### Components

#### 1. Cookie Consent Banner
**Location:** `/src/components/common/CookieConsentBanner.tsx`

- Shows on first visit (no consent cookie present)
- Two primary actions:
  - **Accept All** - Enables all categories
  - **Manage Cookies** - Opens preferences modal
- Triggers `initializeAnalytics()` on acceptance
- Dispatches `consentChanged` event

#### 2. Cookie Preferences Modal
**Location:** `/src/components/modals/CookiePreferencesModal.tsx`

- Granular control over each category
- Three actions:
  - **Accept All** - Enable all optional categories
  - **Reject All** - Disable all optional categories
  - **Save Preferences** - Save custom selection
- Smart reinitialization:
  - Calls `unloadAnalytics()` if consent revoked
  - Calls `initializeAnalytics()` with new preferences
  - Dispatches `consentChanged` event

---

## Analytics Library

### Location
`/src/lib/analytics.ts`

### Core Functions

#### Consent Management

```typescript
// Check if analytics consent granted
hasAnalyticsConsent(): boolean

// Check if marketing consent granted
hasMarketingConsent(): boolean

// Get full consent preferences
getConsentPreferences(): ConsentPreferences | null

// Check if any analytics provider is configured
isAnalyticsConfigured(): boolean
```

#### Initialization

```typescript
// Initialize all analytics providers based on consent
initializeAnalytics(): void

// Remove all analytics and clear cookies
unloadAnalytics(): void

// Clear analytics cookies only
clearAnalyticsCookies(): void
```

#### Provider Loaders

```typescript
// Load Google Tag Manager (requires analytics consent)
loadGoogleTagManager(): void

// Load Google Analytics 4 (requires analytics consent)
loadGoogleAnalytics(): void

// Load Facebook Pixel (requires marketing consent)
loadFacebookPixel(): void

// Load LinkedIn Insight Tag (requires marketing consent)
loadLinkedInInsight(): void

// Load Hotjar (requires analytics consent)
loadHotjar(): void
```

#### Tracking Functions

```typescript
// Track custom event (GA4)
trackEvent(event: AnalyticsEvent): void

// Track page view (GA4)
trackPageView(url: string, title?: string): void

// Track Facebook Pixel event
trackFacebookEvent(eventName: string, params?: Record<string, any>): void
```

#### Utility Functions

```typescript
// Get list of loaded providers
getLoadedProviders(): AnalyticsProvider[]

// Check if specific provider is loaded
isProviderLoaded(provider: AnalyticsProvider): boolean
```

### Consent Gating

Every analytics function checks consent before executing:

```typescript
export function loadGoogleAnalytics(): void {
  if (typeof window === 'undefined') return;
  if (loadedProviders.has('ga4')) return;
  if (!ANALYTICS_CONFIG.googleAnalytics.enabled) return;
  if (!hasAnalyticsConsent()) {
    console.log('[Analytics] GA4 load blocked: no analytics consent');
    return;
  }
  // ... load GA4
}
```

This ensures analytics **never** load without explicit consent.

---

## Configuration

### Environment Variables

All analytics providers are configured via environment variables in `.env` or `.env.local`:

```bash
# ============================================================================
# ANALYTICS & TRACKING CONFIGURATION
# ============================================================================
# Privacy-compliant analytics with consent gating
# All analytics scripts only load AFTER explicit user consent

# Google Analytics 4 (GA4)
# Get your Measurement ID from: https://analytics.google.com/
# Format: G-XXXXXXXXXX
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Google Tag Manager (GTM)
# Get your Container ID from: https://tagmanager.google.com/
# Format: GTM-XXXXXXX
NEXT_PUBLIC_GTM_ID=

# Facebook Pixel
# Get your Pixel ID from: https://business.facebook.com/
# Format: numeric ID
NEXT_PUBLIC_FB_PIXEL_ID=

# LinkedIn Insight Tag
# Get your Partner ID from: https://www.linkedin.com/campaignmanager/
# Format: numeric ID
NEXT_PUBLIC_LINKEDIN_PARTNER_ID=

# Hotjar (Heatmaps & Session Recording)
# Get your Site ID from: https://insights.hotjar.com/
# Format: numeric ID
NEXT_PUBLIC_HOTJAR_ID=

# Custom Analytics Endpoint (Optional)
# For self-hosted or custom analytics solutions
NEXT_PUBLIC_ANALYTICS_ENDPOINT=
```

### Config Structure

**Location:** `/config/site.config.ts`

```typescript
export const ANALYTICS_CONFIG = {
  // Google Analytics
  googleAnalytics: {
    enabled: !!process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '',
  },
  
  // Google Tag Manager
  googleTagManager: {
    enabled: !!process.env.NEXT_PUBLIC_GTM_ID,
    containerId: process.env.NEXT_PUBLIC_GTM_ID || '',
  },
  
  // Facebook Pixel
  facebookPixel: {
    enabled: !!process.env.NEXT_PUBLIC_FB_PIXEL_ID,
    pixelId: process.env.NEXT_PUBLIC_FB_PIXEL_ID || '',
  },
  
  // LinkedIn Insight Tag
  linkedInInsight: {
    enabled: !!process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID,
    partnerId: process.env.NEXT_PUBLIC_LINKEDIN_PARTNER_ID || '',
  },
  
  // Hotjar
  hotjar: {
    enabled: !!process.env.NEXT_PUBLIC_HOTJAR_ID,
    siteId: process.env.NEXT_PUBLIC_HOTJAR_ID || '',
    version: 6,
  },
  
  // Custom analytics endpoint
  custom: {
    enabled: !!process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT,
    endpoint: process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT || '',
  },
} as const;
```

### Provider Auto-Detection

Providers are automatically enabled/disabled based on whether their environment variable is set:

- If `NEXT_PUBLIC_GA_MEASUREMENT_ID` is set → GA4 enabled
- If `NEXT_PUBLIC_GTM_ID` is set → GTM enabled
- If `NEXT_PUBLIC_FB_PIXEL_ID` is set → Facebook Pixel enabled
- etc.

**No configuration = no analytics loading** (factory-safe).

---

## Usage Guide

### For Secondary Templates / Client Sites

#### Step 1: Configure Analytics Providers

Add your tracking IDs to `.env.local`:

```bash
# Example: Enable GA4 and Facebook Pixel
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-ABC123XYZ
NEXT_PUBLIC_FB_PIXEL_ID=1234567890
```

#### Step 2: Deploy

That's it! The system will:
1. ✅ Automatically detect enabled providers
2. ✅ Show cookie consent banner on first visit
3. ✅ Load analytics only after user consents
4. ✅ Track page views on route changes
5. ✅ Clean up cookies if consent is revoked

### Tracking Custom Events

```typescript
import { trackEvent } from '@/lib/analytics';

// Track a button click
trackEvent({
  action: 'button_click',
  category: 'engagement',
  label: 'cta_signup',
  value: 1,
});

// Track a form submission
trackEvent({
  action: 'form_submit',
  category: 'conversion',
  label: 'contact_form',
});
```

### Tracking Facebook Pixel Events

```typescript
import { trackFacebookEvent } from '@/lib/analytics';

// Track a purchase
trackFacebookEvent('Purchase', {
  value: 99.99,
  currency: 'USD',
});

// Track a lead
trackFacebookEvent('Lead', {
  content_name: 'Contact Form',
});
```

### Manual Initialization

If you need to manually trigger analytics initialization:

```typescript
import { initializeAnalytics } from '@/lib/analytics';

// After user grants consent
initializeAnalytics();
```

### Checking Consent Status

```typescript
import { hasAnalyticsConsent, hasMarketingConsent } from '@/lib/analytics';

if (hasAnalyticsConsent()) {
  // User has granted analytics consent
  // Safe to track analytics events
}

if (hasMarketingConsent()) {
  // User has granted marketing consent
  // Safe to track marketing events
}
```

---

## Automatic Features

### 1. Route Change Tracking

The `AnalyticsInitializer` component automatically tracks page views on route changes:

```typescript
// In AnalyticsInitializer.tsx
const pathname = usePathname();

useEffect(() => {
  if (!isAnalyticsConfigured()) return;
  trackPageView(pathname);
}, [pathname]);
```

**Result:** Every route change sends a page view event to all enabled analytics providers.

### 2. Consent Change Detection

The system listens for consent changes via two mechanisms:

#### a) Storage Events (Cross-Tab)
```typescript
window.addEventListener('storage', (e) => {
  if (e.key === 'cookiePreferences' && e.newValue) {
    initializeAnalytics();
  }
});
```

#### b) Custom Events (Same Tab)
```typescript
window.addEventListener('consentChanged', () => {
  initializeAnalytics();
});
```

**Result:** Analytics reinitialize immediately when user changes preferences.

### 3. Cookie Cleanup

When user revokes consent, the system:
1. Removes all analytics scripts from DOM
2. Clears analytics JavaScript objects
3. Deletes analytics cookies

```typescript
export function clearAnalyticsCookies(): void {
  const cookiesToClear = [
    '_ga', '_gid', '_gat', '_gcl_au', // Google
    '_fbp', '_fbc',                   // Facebook
    'li_fat_id', 'lidc',              // LinkedIn
    '_hjid', '_hjFirstSeen',          // Hotjar
  ];
  
  cookiesToClear.forEach(cookieName => {
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
  });
}
```

---

## Privacy & Compliance

### GDPR Compliance

✅ **Consent Before Tracking**
- Analytics scripts only load after explicit opt-in
- No tracking on first page load without consent

✅ **Granular Control**
- Users can enable/disable specific categories
- Separate controls for analytics vs. marketing

✅ **Right to Withdraw**
- Users can revoke consent at any time
- Analytics immediately unload and cookies are cleared

✅ **Data Minimization**
- IP anonymization enabled for GA4
- Only necessary cookies set without consent

### Cookie Banner Requirements

The cookie banner includes:
- ✅ Clear explanation of cookie usage
- ✅ Link to privacy policy
- ✅ "Accept All" and "Manage Cookies" options
- ✅ Granular category controls in modal
- ✅ Ability to reject all optional cookies

### Recommended Privacy Policy Language

Include this in your privacy policy:

```markdown
## Analytics & Cookies

We use analytics cookies to understand how visitors use our website. 
These cookies are only set with your explicit consent.

### Analytics Providers
- Google Analytics 4: Website usage analytics
- Google Tag Manager: Tag management system
- Facebook Pixel: Conversion tracking (marketing consent required)
- LinkedIn Insight Tag: B2B conversion tracking (marketing consent required)
- Hotjar: Heatmaps and session recording

### Your Choices
You can manage your cookie preferences at any time by clicking 
"Cookie Preferences" in the footer. You can also clear your cookies 
through your browser settings.
```

---

## Advanced Configuration

### Adding a Custom Analytics Provider

1. **Add environment variable** to `.env.example`:
```bash
NEXT_PUBLIC_CUSTOM_ANALYTICS_ID=
```

2. **Update config** in `/config/site.config.ts`:
```typescript
customProvider: {
  enabled: !!process.env.NEXT_PUBLIC_CUSTOM_ANALYTICS_ID,
  id: process.env.NEXT_PUBLIC_CUSTOM_ANALYTICS_ID || '',
}
```

3. **Add loader function** in `/src/lib/analytics.ts`:
```typescript
export function loadCustomProvider(): void {
  if (typeof window === 'undefined') return;
  if (loadedProviders.has('custom')) return;
  if (!ANALYTICS_CONFIG.customProvider.enabled) return;
  if (!hasAnalyticsConsent()) return;

  // Your custom initialization logic
  const script = document.createElement('script');
  script.src = 'https://your-analytics.com/script.js';
  document.head.appendChild(script);
  
  loadedProviders.add('custom');
}
```

4. **Call in initialization**:
```typescript
export function initializeAnalytics(): void {
  // ...
  if (preferences.analytics) {
    loadCustomProvider();
  }
}
```

### Server-Side Analytics

For server-side analytics (e.g., PostHog, Plausible), you can:

1. Add server-side tracking in API routes
2. Use server components to inject tracking scripts
3. Implement custom middleware for page view tracking

Example middleware approach:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // Check consent cookie
  const consent = request.cookies.get('cookie_consent');
  
  if (consent?.value === 'all') {
    // Send server-side analytics event
    fetch('https://your-analytics.com/api/event', {
      method: 'POST',
      body: JSON.stringify({
        url: request.url,
        userAgent: request.headers.get('user-agent'),
      }),
    });
  }
  
  return NextResponse.next();
}
```

---

## Testing

### Without Tracking IDs

The system is **factory-safe** and works without any configuration:

```bash
# No analytics environment variables set
npm run build
npm run dev
```

**Expected behavior:**
- ✅ Cookie banner shows (if enabled)
- ✅ No analytics scripts load
- ✅ No console errors
- ✅ `isAnalyticsConfigured()` returns `false`
- ✅ Tracking functions exit early (no-op)

### With Tracking IDs

```bash
# Set test tracking IDs
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TEST123
npm run dev
```

**Expected behavior:**
1. Cookie banner shows on first visit
2. After accepting, GA4 script loads
3. Page views tracked on route changes
4. Console logs show: `[Analytics] GA4 loaded successfully`

### Testing Consent Withdrawal

1. Accept all cookies
2. Verify analytics scripts loaded (check Network tab)
3. Open cookie preferences modal
4. Disable analytics
5. Save preferences
6. Verify:
   - Analytics scripts removed from DOM
   - `window.gtag` is undefined
   - Analytics cookies cleared

### Testing Route Changes

1. Accept analytics cookies
2. Navigate between pages
3. Check browser console for: `[Analytics] Tracking page view: /path`
4. Verify page views in GA4 Real-Time reports

---

## Troubleshooting

### Analytics Not Loading

**Problem:** Analytics scripts don't load after consent.

**Solutions:**
1. Check environment variables are set correctly
2. Verify `NEXT_PUBLIC_` prefix is used
3. Check browser console for error messages
4. Verify consent is stored: `localStorage.getItem('cookiePreferences')`
5. Check `isAnalyticsConfigured()` returns `true`

### Page Views Not Tracking

**Problem:** Route changes don't trigger page views.

**Solutions:**
1. Verify `AnalyticsInitializer` is in layout
2. Check analytics consent is granted
3. Verify `trackPageView()` is being called (console logs)
4. Check GA4 Real-Time reports for events

### Cookies Not Clearing

**Problem:** Analytics cookies persist after revoking consent.

**Solutions:**
1. Check `unloadAnalytics()` is called
2. Verify `clearAnalyticsCookies()` executes
3. Some cookies may persist due to browser caching
4. Users can manually clear via browser settings

### GTM Not Loading

**Problem:** Google Tag Manager doesn't initialize.

**Solutions:**
1. Verify `NEXT_PUBLIC_GTM_ID` format: `GTM-XXXXXXX`
2. Check analytics consent is granted
3. Verify no ad blockers are interfering
4. Check GTM container is published

---

## Performance Considerations

### Script Loading

All analytics scripts are loaded **asynchronously** to avoid blocking page rendering:

```typescript
const script = document.createElement('script');
script.async = true;
script.src = 'https://...';
document.head.appendChild(script);
```

### Lazy Initialization

Analytics only initialize when:
1. User grants consent (not on page load)
2. Configuration exists (no wasted checks)

### Bundle Size

The analytics library adds minimal overhead:
- Core library: ~15KB (uncompressed)
- No external dependencies
- Tree-shakeable exports

---

## Migration Guide

### From Existing Analytics Setup

If you have hardcoded analytics scripts in your HTML:

1. **Remove hardcoded scripts** from `layout.tsx` or `_document.tsx`
2. **Move tracking IDs** to environment variables
3. **Add AnalyticsInitializer** to root layout (already done)
4. **Test consent flow** thoroughly

### From Google Analytics Universal (UA)

GA4 is already configured. To migrate:

1. Create GA4 property in Google Analytics
2. Get new Measurement ID (format: `G-XXXXXXXXXX`)
3. Set `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX`
4. Run dual tracking during transition (keep UA script separate)
5. Remove UA after migration complete

---

## Best Practices

### 1. Always Use Environment Variables

❌ **Don't:**
```typescript
const GA_ID = 'G-ABC123XYZ'; // Hardcoded
```

✅ **Do:**
```typescript
const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
```

### 2. Check Consent Before Tracking

❌ **Don't:**
```typescript
trackEvent({ action: 'click' }); // No consent check
```

✅ **Do:**
```typescript
if (hasAnalyticsConsent()) {
  trackEvent({ action: 'click' });
}
```

### 3. Use Descriptive Event Names

❌ **Don't:**
```typescript
trackEvent({ action: 'click' });
```

✅ **Do:**
```typescript
trackEvent({
  action: 'cta_click',
  category: 'engagement',
  label: 'hero_signup_button',
});
```

### 4. Test Without Configuration

Always test that your site works without analytics configured:

```bash
# Clear all analytics env vars
unset NEXT_PUBLIC_GA_MEASUREMENT_ID
unset NEXT_PUBLIC_GTM_ID
# etc.

npm run build
```

### 5. Document Custom Tracking

If you add custom tracking events, document them:

```typescript
/**
 * Track product view event
 * @param productId - Unique product identifier
 * @param productName - Human-readable product name
 */
export function trackProductView(productId: string, productName: string) {
  trackEvent({
    action: 'product_view',
    category: 'ecommerce',
    label: productName,
    product_id: productId,
  });
}
```

---

## Summary

### What's Implemented

✅ **Cookie Consent System**
- Banner component with accept/manage options
- Modal with granular category controls
- localStorage-based preference storage
- Cookie-based consent tracking

✅ **Analytics Library**
- Consent-gated initialization
- Support for 6 analytics providers
- Automatic page view tracking
- Cookie cleanup on consent withdrawal
- TypeScript support

✅ **Configuration System**
- Environment variable-based config
- Auto-detection of enabled providers
- Factory-safe defaults (works without config)
- Centralized in `/config/site.config.ts`

✅ **Integration**
- AnalyticsInitializer in root layout
- Route change tracking
- Consent change listeners
- Cross-tab synchronization

✅ **Documentation**
- Complete usage guide
- Privacy compliance notes
- Troubleshooting section
- Best practices

### What's Configurable

- ✅ Google Analytics 4 (GA4)
- ✅ Google Tag Manager (GTM)
- ✅ Facebook Pixel
- ✅ LinkedIn Insight Tag
- ✅ Hotjar
- ✅ Custom analytics endpoint

### Privacy Compliance

- ✅ GDPR compliant (consent-first)
- ✅ CCPA compliant (opt-out capable)
- ✅ Cookie cleanup on withdrawal
- ✅ IP anonymization (GA4)
- ✅ Granular consent categories

---

## Next Steps

### For Template Users

1. Copy `.env.example` to `.env.local`
2. Add your tracking IDs
3. Test cookie consent flow
4. Verify analytics in provider dashboards

### For Template Maintainers

1. Keep analytics library updated
2. Add new providers as needed
3. Monitor privacy regulation changes
4. Update documentation as system evolves

---

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review console logs for error messages
3. Verify environment variables are set correctly
4. Test with provider's debug tools (GA Debugger, Facebook Pixel Helper, etc.)

---

**End of Documentation**

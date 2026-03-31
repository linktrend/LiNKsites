/**
 * Analytics Integration Module
 * 
 * Privacy-compliant analytics system with consent gating.
 * Supports multiple analytics providers with pluggable architecture.
 * 
 * Features:
 * - Google Analytics 4 (GA4)
 * - Facebook Pixel
 * - LinkedIn Insight Tag
 * - Extensible provider system
 * - Consent-based loading
 * - TypeScript support
 */

import { ANALYTICS_CONFIG } from '@/config';

// ============================================================================
// TYPES
// ============================================================================

export type AnalyticsEvent = {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  [key: string]: any;
};

export type ConsentPreferences = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

export type AnalyticsProvider = 'ga4' | 'facebook' | 'linkedin' | 'hotjar' | 'gtm' | 'custom';

// ============================================================================
// CONSTANTS
// ============================================================================

const CONSENT_KEY = 'cookiePreferences';
const ANALYTICS_LOADED_KEY = '__analytics_loaded';

// Track which providers have been initialized
const loadedProviders = new Set<AnalyticsProvider>();

// ============================================================================
// CONSENT MANAGEMENT
// ============================================================================

/**
 * Get user consent preferences from localStorage
 */
export function getConsentPreferences(): ConsentPreferences | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) return null;
    
    return JSON.parse(stored) as ConsentPreferences;
  } catch (error) {
    console.error('[Analytics] Failed to parse consent preferences:', error);
    return null;
  }
}

/**
 * Check if analytics consent has been granted
 */
export function hasAnalyticsConsent(): boolean {
  const preferences = getConsentPreferences();
  return preferences?.analytics === true;
}

/**
 * Check if marketing consent has been granted
 */
export function hasMarketingConsent(): boolean {
  const preferences = getConsentPreferences();
  return preferences?.marketing === true;
}

/**
 * Check if any analytics provider is enabled in config
 */
export function isAnalyticsConfigured(): boolean {
  return (
    ANALYTICS_CONFIG.googleAnalytics.enabled ||
    ANALYTICS_CONFIG.googleTagManager.enabled ||
    ANALYTICS_CONFIG.facebookPixel.enabled ||
    ANALYTICS_CONFIG.linkedInInsight.enabled ||
    ANALYTICS_CONFIG.hotjar.enabled ||
    ANALYTICS_CONFIG.custom.enabled
  );
}

// ============================================================================
// GOOGLE TAG MANAGER (GTM)
// ============================================================================

/**
 * Initialize Google Tag Manager
 * Only loads if consent is granted and GTM is configured
 */
export function loadGoogleTagManager(): void {
  if (typeof window === 'undefined') return;
  if (loadedProviders.has('gtm')) return;
  if (!ANALYTICS_CONFIG.googleTagManager.enabled) return;
  if (!hasAnalyticsConsent()) {
    console.log('[Analytics] GTM load blocked: no analytics consent');
    return;
  }

  const containerId = ANALYTICS_CONFIG.googleTagManager.containerId;
  if (!containerId) {
    console.warn('[Analytics] GTM container ID not configured');
    return;
  }

  try {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js'
    });

    // Load GTM script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`;
    script.onload = () => {
      console.log('[Analytics] GTM loaded successfully');
      loadedProviders.add('gtm');
    };
    script.onerror = () => {
      console.error('[Analytics] Failed to load GTM script');
    };
    
    document.head.appendChild(script);
  } catch (error) {
    console.error('[Analytics] Error initializing GTM:', error);
  }
}

// ============================================================================
// GOOGLE ANALYTICS 4 (GA4)
// ============================================================================

/**
 * Initialize Google Analytics 4
 * Only loads if consent is granted and GA4 is configured
 */
export function loadGoogleAnalytics(): void {
  if (typeof window === 'undefined') return;
  if (loadedProviders.has('ga4')) return;
  if (!ANALYTICS_CONFIG.googleAnalytics.enabled) return;
  if (!hasAnalyticsConsent()) {
    console.log('[Analytics] GA4 load blocked: no analytics consent');
    return;
  }

  const measurementId = ANALYTICS_CONFIG.googleAnalytics.measurementId;
  if (!measurementId) {
    console.warn('[Analytics] GA4 measurement ID not configured');
    return;
  }

  try {
    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    
    // Define gtag function
    window.gtag = function gtag() {
      if (window.dataLayer) {
        window.dataLayer.push(arguments);
      }
    };
    
    // Configure GA4 with consent
    if (window.gtag) {
      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        anonymize_ip: true,
        cookie_flags: 'SameSite=None;Secure',
      });
    }

    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.onload = () => {
      console.log('[Analytics] GA4 loaded successfully');
      loadedProviders.add('ga4');
    };
    script.onerror = () => {
      console.error('[Analytics] Failed to load GA4 script');
    };
    
    document.head.appendChild(script);
  } catch (error) {
    console.error('[Analytics] Error initializing GA4:', error);
  }
}

/**
 * Send event to Google Analytics
 */
export function trackEvent(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;
  if (!window.gtag) return;

  try {
    window.gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      ...event,
    });
  } catch (error) {
    console.error('[Analytics] Error tracking event:', error);
  }
}

/**
 * Track page view
 */
export function trackPageView(url: string, title?: string): void {
  if (typeof window === 'undefined') return;
  if (!hasAnalyticsConsent()) return;
  if (!window.gtag) return;

  try {
    window.gtag('event', 'page_view', {
      page_path: url,
      page_title: title || document.title,
    });
  } catch (error) {
    console.error('[Analytics] Error tracking page view:', error);
  }
}

// ============================================================================
// FACEBOOK PIXEL
// ============================================================================

/**
 * Initialize Facebook Pixel
 * Only loads if marketing consent is granted and Pixel is configured
 */
export function loadFacebookPixel(): void {
  if (typeof window === 'undefined') return;
  if (loadedProviders.has('facebook')) return;
  if (!ANALYTICS_CONFIG.facebookPixel.enabled) return;
  if (!hasMarketingConsent()) {
    console.log('[Analytics] Facebook Pixel load blocked: no marketing consent');
    return;
  }

  const pixelId = ANALYTICS_CONFIG.facebookPixel.pixelId;
  if (!pixelId) {
    console.warn('[Analytics] Facebook Pixel ID not configured');
    return;
  }

  try {
    // Initialize fbq
    window.fbq = function() {
      window.fbq.callMethod
        ? window.fbq.callMethod.apply(window.fbq, arguments)
        : window.fbq.queue.push(arguments);
    };
    
    if (!window._fbq) window._fbq = window.fbq;
    window.fbq.push = window.fbq;
    window.fbq.loaded = true;
    window.fbq.version = '2.0';
    window.fbq.queue = [];

    // Load Facebook Pixel script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    script.onload = () => {
      window.fbq('init', pixelId);
      window.fbq('track', 'PageView');
      console.log('[Analytics] Facebook Pixel loaded successfully');
      loadedProviders.add('facebook');
    };
    script.onerror = () => {
      console.error('[Analytics] Failed to load Facebook Pixel script');
    };
    
    document.head.appendChild(script);
  } catch (error) {
    console.error('[Analytics] Error initializing Facebook Pixel:', error);
  }
}

/**
 * Track Facebook Pixel event
 */
export function trackFacebookEvent(eventName: string, params?: Record<string, any>): void {
  if (typeof window === 'undefined') return;
  if (!hasMarketingConsent()) return;
  if (!window.fbq) return;

  try {
    window.fbq('track', eventName, params);
  } catch (error) {
    console.error('[Analytics] Error tracking Facebook event:', error);
  }
}

// ============================================================================
// LINKEDIN INSIGHT TAG
// ============================================================================

/**
 * Initialize LinkedIn Insight Tag
 * Only loads if marketing consent is granted and LinkedIn is configured
 */
export function loadLinkedInInsight(): void {
  if (typeof window === 'undefined') return;
  if (loadedProviders.has('linkedin')) return;
  if (!ANALYTICS_CONFIG.linkedInInsight.enabled) return;
  if (!hasMarketingConsent()) {
    console.log('[Analytics] LinkedIn Insight load blocked: no marketing consent');
    return;
  }

  const partnerId = ANALYTICS_CONFIG.linkedInInsight.partnerId;
  if (!partnerId) {
    console.warn('[Analytics] LinkedIn Partner ID not configured');
    return;
  }

  try {
    // Initialize _linkedin_data_partner_ids
    window._linkedin_partner_id = partnerId;
    window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
    window._linkedin_data_partner_ids.push(partnerId);

    // Load LinkedIn Insight script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js';
    script.onload = () => {
      console.log('[Analytics] LinkedIn Insight loaded successfully');
      loadedProviders.add('linkedin');
    };
    script.onerror = () => {
      console.error('[Analytics] Failed to load LinkedIn Insight script');
    };
    
    document.head.appendChild(script);
  } catch (error) {
    console.error('[Analytics] Error initializing LinkedIn Insight:', error);
  }
}

// ============================================================================
// HOTJAR
// ============================================================================

/**
 * Initialize Hotjar
 * Only loads if analytics consent is granted and Hotjar is configured
 */
export function loadHotjar(): void {
  if (typeof window === 'undefined') return;
  if (loadedProviders.has('hotjar')) return;
  if (!ANALYTICS_CONFIG.hotjar.enabled) return;
  if (!hasAnalyticsConsent()) {
    console.log('[Analytics] Hotjar load blocked: no analytics consent');
    return;
  }

  const siteId = ANALYTICS_CONFIG.hotjar.siteId;
  const version = ANALYTICS_CONFIG.hotjar.version;
  
  if (!siteId) {
    console.warn('[Analytics] Hotjar site ID not configured');
    return;
  }

  try {
    // Initialize Hotjar
    window.hj = window.hj || function() {
      (window.hj.q = window.hj.q || []).push(arguments);
    };
    window._hjSettings = { hjid: parseInt(siteId), hjsv: version };

    // Load Hotjar script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://static.hotjar.com/c/hotjar-${siteId}.js?sv=${version}`;
    script.onload = () => {
      console.log('[Analytics] Hotjar loaded successfully');
      loadedProviders.add('hotjar');
    };
    script.onerror = () => {
      console.error('[Analytics] Failed to load Hotjar script');
    };
    
    document.head.appendChild(script);
  } catch (error) {
    console.error('[Analytics] Error initializing Hotjar:', error);
  }
}

// ============================================================================
// MAIN ANALYTICS LOADER
// ============================================================================

/**
 * Initialize all analytics providers based on consent
 * This is the main entry point for loading analytics
 */
export function initializeAnalytics(): void {
  if (typeof window === 'undefined') return;
  
  // Prevent double initialization
  if ((window as any)[ANALYTICS_LOADED_KEY]) {
    console.log('[Analytics] Already initialized');
    return;
  }

  console.log('[Analytics] Initializing analytics...');
  
  // Check if we have any consent
  const preferences = getConsentPreferences();
  if (!preferences) {
    console.log('[Analytics] No consent preferences found');
    return;
  }

  // Load analytics providers based on consent
  if (preferences.analytics) {
    loadGoogleTagManager();
    loadGoogleAnalytics();
    loadHotjar();
  }

  if (preferences.marketing) {
    loadFacebookPixel();
    loadLinkedInInsight();
  }

  // Mark as initialized
  (window as any)[ANALYTICS_LOADED_KEY] = true;
}

/**
 * Clear analytics cookies
 * Attempts to remove common analytics cookies
 */
export function clearAnalyticsCookies(): void {
  if (typeof window === 'undefined') return;

  const cookiesToClear = [
    // Google Analytics / GTM
    '_ga', '_gid', '_gat', '_gat_gtag_', '_gcl_au', '_gac_',
    // Facebook
    '_fbp', '_fbc',
    // LinkedIn
    'li_fat_id', 'lidc', 'li_sugr',
    // Hotjar
    '_hjid', '_hjFirstSeen', '_hjIncludedInSessionSample',
  ];

  cookiesToClear.forEach(cookieName => {
    // Clear for current domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // Clear for parent domain
    const domain = window.location.hostname.split('.').slice(-2).join('.');
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${domain}`;
  });

  console.log('[Analytics] Analytics cookies cleared');
}

/**
 * Remove all analytics scripts and reset state
 * Used when user revokes consent
 */
export function unloadAnalytics(): void {
  if (typeof window === 'undefined') return;

  console.log('[Analytics] Unloading analytics...');

  // Remove GA4
  if ('gtag' in window) {
    (window as any).gtag = undefined;
  }
  if ('dataLayer' in window) {
    (window as any).dataLayer = undefined;
  }

  // Remove Facebook Pixel
  if ('fbq' in window) {
    (window as any).fbq = undefined;
  }
  if ('_fbq' in window) {
    (window as any)._fbq = undefined;
  }

  // Remove LinkedIn
  if ('_linkedin_partner_id' in window) {
    (window as any)._linkedin_partner_id = undefined;
  }
  if ('_linkedin_data_partner_ids' in window) {
    (window as any)._linkedin_data_partner_ids = undefined;
  }

  // Remove Hotjar
  if ('hj' in window) {
    (window as any).hj = undefined;
  }
  if ('_hjSettings' in window) {
    (window as any)._hjSettings = undefined;
  }

  // Remove all analytics scripts
  const scripts = document.querySelectorAll('script[src*="googletagmanager"], script[src*="gtag"], script[src*="fbevents"], script[src*="licdn.com"], script[src*="hotjar"]');
  scripts.forEach(script => script.remove());

  // Clear analytics cookies
  clearAnalyticsCookies();

  // Clear loaded providers
  loadedProviders.clear();

  // Reset initialization flag
  (window as any)[ANALYTICS_LOADED_KEY] = undefined;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get list of loaded analytics providers
 */
export function getLoadedProviders(): AnalyticsProvider[] {
  return Array.from(loadedProviders);
}

/**
 * Check if a specific provider is loaded
 */
export function isProviderLoaded(provider: AnalyticsProvider): boolean {
  return loadedProviders.has(provider);
}

// ============================================================================
// WINDOW TYPE EXTENSIONS
// ============================================================================

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
    fbq?: any;
    _fbq?: any;
    _linkedin_partner_id?: string;
    _linkedin_data_partner_ids?: string[];
    hj?: any;
    _hjSettings?: { hjid: number; hjsv: number };
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

const analytics = {
  initializeAnalytics,
  unloadAnalytics,
  clearAnalyticsCookies,
  loadGoogleTagManager,
  loadGoogleAnalytics,
  loadFacebookPixel,
  loadLinkedInInsight,
  loadHotjar,
  trackEvent,
  trackPageView,
  trackFacebookEvent,
  hasAnalyticsConsent,
  hasMarketingConsent,
  getConsentPreferences,
  isAnalyticsConfigured,
  getLoadedProviders,
  isProviderLoaded,
};

export default analytics;

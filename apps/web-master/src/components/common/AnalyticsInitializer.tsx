"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { initializeAnalytics, isAnalyticsConfigured, trackPageView } from "@/lib/analytics";

/**
 * AnalyticsInitializer Component
 * 
 * Initializes analytics providers based on user consent.
 * This component should be placed in the root layout to ensure
 * analytics are loaded as early as possible after consent is granted.
 * 
 * Features:
 * - Automatic initialization on mount if consent exists
 * - Listens for consent changes via storage events
 * - Tracks page views on route changes
 * - Only initializes if analytics is configured
 * - Client-side only (no SSR)
 */
export function AnalyticsInitializer() {
  const pathname = usePathname();

  // Initialize analytics and listen for consent changes
  useEffect(() => {
    // Only initialize if analytics is configured
    if (!isAnalyticsConfigured()) {
      console.log('[AnalyticsInitializer] No analytics providers configured');
      return;
    }

    // Initialize analytics on mount (if consent exists)
    initializeAnalytics();

    // Listen for consent changes
    const handleStorageChange = (e: StorageEvent) => {
      // Only react to cookie preference changes
      if (e.key === 'cookiePreferences' && e.newValue) {
        console.log('[AnalyticsInitializer] Consent preferences changed, reinitializing...');
        initializeAnalytics();
      }
    };

    // Listen for custom consent change events (from same window)
    const handleConsentChange = () => {
      console.log('[AnalyticsInitializer] Consent changed, reinitializing...');
      initializeAnalytics();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('consentChanged', handleConsentChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('consentChanged', handleConsentChange);
    };
  }, []);

  // Track page views on route changes
  useEffect(() => {
    if (!isAnalyticsConfigured()) return;
    
    // Track the page view
    trackPageView(pathname);
  }, [pathname]);

  // This component doesn't render anything
  return null;
}

/**
 * useWebVitals Hook
 * 
 * React hook for monitoring Web Vitals metrics in components.
 * Automatically initializes Web Vitals monitoring on mount.
 * 
 * Usage:
 * ```tsx
 * import { useWebVitals } from '@/hooks/useWebVitals';
 * 
 * function MyComponent() {
 *   useWebVitals(); // That's it!
 *   return <div>...</div>;
 * }
 * ```
 * 
 * Advanced usage with custom handler:
 * ```tsx
 * import { useWebVitals } from '@/hooks/useWebVitals';
 * 
 * function MyComponent() {
 *   useWebVitals({
 *     onMetric: (metric) => {
 *       console.log(`${metric.name}: ${metric.value}`);
 *     },
 *     reportAllChanges: true,
 *   });
 *   return <div>...</div>;
 * }
 * ```
 */

'use client';

import { useEffect, useRef } from 'react';
import { observeWebVitals, sendWebVitalToAnalytics, logWebVitalToConsole, type WebVitalMetric } from '@/lib/webVitals';

export interface UseWebVitalsOptions {
  /**
   * Custom callback for handling metrics
   * If not provided, metrics are sent to analytics by default
   */
  onMetric?: (metric: WebVitalMetric) => void;
  
  /**
   * Whether to report all changes or only final values
   * Default: false (only report final values)
   */
  reportAllChanges?: boolean;
  
  /**
   * Enable console logging in development
   * Default: true in development, false in production
   */
  enableConsoleLogging?: boolean;
  
  /**
   * Custom endpoint to send metrics to
   */
  customEndpoint?: string;
}

/**
 * Hook to monitor Web Vitals metrics
 * 
 * Automatically initializes Web Vitals monitoring on mount and cleans up on unmount.
 * By default, metrics are sent to analytics (if consent is granted) and logged to console in development.
 */
export function useWebVitals(options?: UseWebVitalsOptions): void {
  const {
    onMetric,
    reportAllChanges = false,
    enableConsoleLogging = process.env.NODE_ENV === 'development',
    customEndpoint,
  } = options || {};

  // Use ref to track if we've already initialized
  const initializedRef = useRef(false);

  useEffect(() => {
    // Prevent double initialization in development (React StrictMode)
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Initialize Web Vitals monitoring
    observeWebVitals((metric) => {
      // Log to console in development
      if (enableConsoleLogging) {
        logWebVitalToConsole(metric);
      }

      // Use custom handler if provided, otherwise send to analytics
      if (onMetric) {
        onMetric(metric);
      } else {
        sendWebVitalToAnalytics(metric);
      }

      // Send to custom endpoint if provided
      if (customEndpoint) {
        const { sendWebVitalToEndpoint } = require('@/lib/webVitals');
        sendWebVitalToEndpoint(metric, customEndpoint);
      }
    }, reportAllChanges);

    // Cleanup function
    return () => {
      initializedRef.current = false;
    };
  }, [onMetric, reportAllChanges, enableConsoleLogging, customEndpoint]);
}

export default useWebVitals;

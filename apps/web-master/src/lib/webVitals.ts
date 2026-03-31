/**
 * Web Vitals Monitoring Module
 * 
 * Tracks Core Web Vitals metrics for performance monitoring.
 * Integrates with analytics when consent is granted.
 * 
 * Core Web Vitals:
 * - LCP (Largest Contentful Paint): < 2.5s (good), < 4s (needs improvement), >= 4s (poor)
 * - FID (First Input Delay): < 100ms (good), < 300ms (needs improvement), >= 300ms (poor)
 * - CLS (Cumulative Layout Shift): < 0.1 (good), < 0.25 (needs improvement), >= 0.25 (poor)
 * 
 * Additional Metrics:
 * - FCP (First Contentful Paint): < 1.8s (good), < 3s (needs improvement), >= 3s (poor)
 * - TTFB (Time to First Byte): < 800ms (good), < 1800ms (needs improvement), >= 1800ms (poor)
 * - INP (Interaction to Next Paint): < 200ms (good), < 500ms (needs improvement), >= 500ms (poor)
 */

import { hasAnalyticsConsent, trackEvent } from './analytics';

// ============================================================================
// TYPES
// ============================================================================

export type MetricName = 'CLS' | 'FCP' | 'FID' | 'LCP' | 'TTFB' | 'INP';

export type MetricRating = 'good' | 'needs-improvement' | 'poor';

export interface WebVitalMetric {
  name: MetricName;
  value: number;
  rating: MetricRating;
  delta: number;
  id: string;
  navigationType?: string;
}

export type WebVitalsCallback = (metric: WebVitalMetric) => void;

// ============================================================================
// METRIC THRESHOLDS
// ============================================================================

const METRIC_THRESHOLDS = {
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  FID: { good: 100, poor: 300 },
  LCP: { good: 2500, poor: 4000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
} as const;

// ============================================================================
// RATING CALCULATION
// ============================================================================

/**
 * Calculate metric rating based on thresholds
 */
function getRating(metricName: MetricName, value: number): MetricRating {
  const thresholds = METRIC_THRESHOLDS[metricName];
  
  if (value <= thresholds.good) {
    return 'good';
  }
  
  if (value <= thresholds.poor) {
    return 'needs-improvement';
  }
  
  return 'poor';
}

// ============================================================================
// WEB VITALS OBSERVER
// ============================================================================

/**
 * Initialize Web Vitals monitoring
 * 
 * This function dynamically imports the web-vitals library only when needed,
 * reducing the initial bundle size. It observes all Core Web Vitals metrics
 * and reports them via the provided callback.
 * 
 * @param onMetric - Callback function to handle metric reports
 * @param reportAllChanges - Whether to report all changes or only final values
 */
export async function observeWebVitals(
  onMetric: WebVitalsCallback,
  reportAllChanges: boolean = false
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    // Dynamic import to avoid loading web-vitals on server
    const webVitalsModule = await import('web-vitals');
    const { onCLS, onFCP, onLCP, onTTFB, onINP } = webVitalsModule;
    
    // Check if onFID exists (older versions) or use onINP (newer versions)
    const onFID = 'onFID' in webVitalsModule ? (webVitalsModule as any).onFID : null;

    // Observe all Core Web Vitals
    onCLS((metric) => {
      const webVitalMetric: WebVitalMetric = {
        name: 'CLS',
        value: metric.value,
        rating: getRating('CLS', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      };
      onMetric(webVitalMetric);
    }, { reportAllChanges });

    onFCP((metric) => {
      const webVitalMetric: WebVitalMetric = {
        name: 'FCP',
        value: metric.value,
        rating: getRating('FCP', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      };
      onMetric(webVitalMetric);
    }, { reportAllChanges });

    // FID is deprecated in favor of INP, but we'll track it if available
    if (onFID) {
      onFID((metric: any) => {
        const webVitalMetric: WebVitalMetric = {
          name: 'FID',
          value: metric.value,
          rating: getRating('FID', metric.value),
          delta: metric.delta,
          id: metric.id,
          navigationType: metric.navigationType,
        };
        onMetric(webVitalMetric);
      }, { reportAllChanges });
    }

    onLCP((metric) => {
      const webVitalMetric: WebVitalMetric = {
        name: 'LCP',
        value: metric.value,
        rating: getRating('LCP', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      };
      onMetric(webVitalMetric);
    }, { reportAllChanges });

    onTTFB((metric) => {
      const webVitalMetric: WebVitalMetric = {
        name: 'TTFB',
        value: metric.value,
        rating: getRating('TTFB', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      };
      onMetric(webVitalMetric);
    }, { reportAllChanges });

    // INP (Interaction to Next Paint) - replaces FID in web-vitals v3+
    onINP((metric) => {
      const webVitalMetric: WebVitalMetric = {
        name: 'INP',
        value: metric.value,
        rating: getRating('INP', metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      };
      onMetric(webVitalMetric);
    }, { reportAllChanges });

  } catch (error) {
    console.error('[WebVitals] Failed to load web-vitals library:', error);
  }
}

// ============================================================================
// ANALYTICS INTEGRATION
// ============================================================================

/**
 * Send Web Vitals metric to analytics
 * Only sends if analytics consent is granted
 */
export function sendWebVitalToAnalytics(metric: WebVitalMetric): void {
  if (!hasAnalyticsConsent()) {
    console.log(`[WebVitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating}) - Analytics consent not granted`);
    return;
  }

  // Send to analytics
  trackEvent({
    action: 'web_vitals',
    category: 'Performance',
    label: metric.name,
    value: Math.round(metric.value),
    metric_name: metric.name,
    metric_value: metric.value,
    metric_rating: metric.rating,
    metric_delta: metric.delta,
    metric_id: metric.id,
    navigation_type: metric.navigationType,
  });

  console.log(`[WebVitals] ${metric.name}: ${metric.value.toFixed(2)} (${metric.rating})`);
}

// ============================================================================
// CONSOLE REPORTING (DEVELOPMENT)
// ============================================================================

/**
 * Log Web Vitals metric to console (development only)
 */
export function logWebVitalToConsole(metric: WebVitalMetric): void {
  if (process.env.NODE_ENV !== 'development') return;

  const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
  
  console.log(
    `${emoji} [WebVitals] ${metric.name}:`,
    {
      value: `${metric.value.toFixed(2)}${metric.name === 'CLS' ? '' : 'ms'}`,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
    }
  );
}

// ============================================================================
// CUSTOM REPORTING
// ============================================================================

/**
 * Send Web Vitals to custom endpoint
 * Useful for custom analytics or monitoring solutions
 */
export async function sendWebVitalToEndpoint(
  metric: WebVitalMetric,
  endpoint: string
): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const body = JSON.stringify({
      metric: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      navigationType: metric.navigationType,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: Date.now(),
    });

    // Use sendBeacon if available (more reliable for page unload)
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' });
      navigator.sendBeacon(endpoint, blob);
    } else {
      // Fallback to fetch
      fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
        keepalive: true,
      }).catch((error) => {
        console.error('[WebVitals] Failed to send metric to endpoint:', error);
      });
    }
  } catch (error) {
    console.error('[WebVitals] Failed to send metric to endpoint:', error);
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize Web Vitals monitoring with default handlers
 * 
 * This is the main entry point for Web Vitals monitoring.
 * It sets up observers for all metrics and sends them to analytics.
 * 
 * @param options - Configuration options
 */
export async function initializeWebVitals(options?: {
  reportAllChanges?: boolean;
  customEndpoint?: string;
  enableConsoleLogging?: boolean;
}): Promise<void> {
  const {
    reportAllChanges = false,
    customEndpoint,
    enableConsoleLogging = process.env.NODE_ENV === 'development',
  } = options || {};

  await observeWebVitals((metric) => {
    // Log to console in development
    if (enableConsoleLogging) {
      logWebVitalToConsole(metric);
    }

    // Send to analytics
    sendWebVitalToAnalytics(metric);

    // Send to custom endpoint if provided
    if (customEndpoint) {
      sendWebVitalToEndpoint(metric, customEndpoint);
    }
  }, reportAllChanges);
}

// ============================================================================
// EXPORTS
// ============================================================================

const webVitals = {
  observeWebVitals,
  sendWebVitalToAnalytics,
  logWebVitalToConsole,
  sendWebVitalToEndpoint,
  initializeWebVitals,
  getRating,
  METRIC_THRESHOLDS,
};

export default webVitals;

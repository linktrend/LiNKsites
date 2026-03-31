/**
 * WebVitalsMonitor Component
 * 
 * Client-side component that monitors Web Vitals metrics.
 * Place this in your root layout to enable Web Vitals tracking across the entire app.
 * 
 * Features:
 * - Automatic Web Vitals monitoring
 * - Analytics integration (respects user consent)
 * - Console logging in development
 * - Optional custom endpoint for metrics
 * 
 * Usage:
 * ```tsx
 * // In your root layout
 * import { WebVitalsMonitor } from '@/components/common/WebVitalsMonitor';
 * 
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <body>
 *         <WebVitalsMonitor />
 *         {children}
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */

'use client';

import { useState, useEffect } from 'react';
import { useWebVitals } from '@/hooks/useWebVitals';

export interface WebVitalsMonitorProps {
  /**
   * Whether to report all changes or only final values
   * Default: false (only report final values)
   */
  reportAllChanges?: boolean;
  
  /**
   * Enable console logging
   * Default: true in development, false in production
   */
  enableConsoleLogging?: boolean;
  
  /**
   * Custom endpoint to send metrics to
   */
  customEndpoint?: string;
}

/**
 * Component that monitors Web Vitals metrics
 * 
 * This component doesn't render anything, it just sets up Web Vitals monitoring.
 * Place it in your root layout to enable tracking across the entire app.
 */
export function WebVitalsMonitor({
  reportAllChanges = false,
  enableConsoleLogging: enableConsoleLoggingProp,
  customEndpoint,
}: WebVitalsMonitorProps) {
  // Determine enableConsoleLogging client-side only to avoid hydration mismatch
  const [enableConsoleLogging, setEnableConsoleLogging] = useState(false);

  useEffect(() => {
    // Set the value client-side based on prop or environment
    if (enableConsoleLoggingProp !== undefined) {
      setEnableConsoleLogging(enableConsoleLoggingProp);
    } else {
      // Only check NODE_ENV on client-side
      setEnableConsoleLogging(process.env.NODE_ENV === 'development');
    }
  }, [enableConsoleLoggingProp]);

  useWebVitals({
    reportAllChanges,
    enableConsoleLogging,
    customEndpoint,
  });

  // This component doesn't render anything
  return null;
}

export default WebVitalsMonitor;

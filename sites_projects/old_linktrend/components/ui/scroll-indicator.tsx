'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
import { ArrowRight, ArrowLeft } from 'lucide-react';

interface ScrollIndicatorProps {
  containerRef: React.RefObject<HTMLDivElement>;
  tableId: string;
  className?: string;
}

/**
 * ScrollIndicator - Shows "Scroll →" chip when horizontal overflow exists
 * - Hides after scrollLeft > 8 OR 3s timeout (persisted in sessionStorage)
 * - Respects RTL and reduced motion
 */
export function ScrollIndicator({ 
  containerRef, 
  tableId, 
  className 
}: ScrollIndicatorProps) {
  const [show, setShow] = React.useState(false);
  const [hasScrolled, setHasScrolled] = React.useState(false);
  const [reducedMotion, setReducedMotion] = React.useState(true);
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  const observerRef = React.useRef<ResizeObserver>();

  // Check sessionStorage for dismissed state
  const storageKey = `table-scroll-indicator-${tableId}`;

  // Check for reduced motion preference
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      setReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    }
  }, []);

  React.useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return;
    
    const container = containerRef.current;
    if (!container) {
      // Retry after a short delay if container isn't ready
      const timeout = setTimeout(() => {
        // Re-run effect if container wasn't ready
      }, 100);
      return () => clearTimeout(timeout);
    }

    const checkOverflow = () => {
      const el = containerRef.current;
      if (!el) return;
      try {
        const hasOverflow = el.scrollWidth > el.clientWidth;
        let wasDismissed = false;
        try {
          wasDismissed = sessionStorage.getItem(storageKey) === 'dismissed';
        } catch (e) {
          // sessionStorage might be unavailable
        }
        
        if (hasOverflow && !wasDismissed && !hasScrolled) {
          setShow(true);
          
          // Auto-hide after 3 seconds
          if (timeoutRef.current) clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => {
            setShow(false);
            try {
              sessionStorage.setItem(storageKey, 'dismissed');
            } catch (e) {
              // Ignore sessionStorage errors
            }
          }, 3000);
        } else {
          setShow(false);
        }
      } catch (e) {
        // Ignore errors
        setShow(false);
      }
    };

    // Initial check with small delay to ensure layout is ready
    const rafId = requestAnimationFrame(() => {
      checkOverflow();
    });

    // Observe container size changes
    let observer: ResizeObserver | null = null;
    try {
      observer = new ResizeObserver(checkOverflow);
      observer.observe(container);
      observerRef.current = observer;
    } catch (e) {
      // ResizeObserver might not be available
    }

    // Handle scroll
    const handleScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      if (el.scrollLeft > 8 && !hasScrolled) {
        setHasScrolled(true);
        setShow(false);
        try {
          sessionStorage.setItem(storageKey, 'dismissed');
        } catch (e) {
          // Ignore sessionStorage errors
        }
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (observer) observer.disconnect();
      container.removeEventListener('scroll', handleScroll);
    };
  }, [containerRef, tableId, storageKey, hasScrolled]);

  // Check for RTL direction
  const isRTL = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    const container = containerRef.current;
    if (!container) return false;
    const computedStyle = window.getComputedStyle(container);
    return computedStyle.direction === 'rtl';
  }, [containerRef]);

  if (!show) return null;

  return (
    <div
      className={cn(
        'absolute bottom-2 right-2 z-20 flex items-center gap-1 rounded-full bg-background/95 px-2 py-1 text-xs text-muted-foreground shadow-sm border backdrop-blur-sm',
        // Animate with reduced motion guard
        'transition-opacity duration-300',
        !reducedMotion && 'animate-[fadeIn_0.3s_ease-in]',
        className
      )}
      role="status"
      aria-label={isRTL ? 'Scroll left' : 'Scroll right'}
    >
      <span className="whitespace-nowrap">
        {isRTL ? '← Scroll' : 'Scroll →'}
      </span>
      {isRTL ? (
        <ArrowLeft className="h-3 w-3" aria-hidden="true" />
      ) : (
        <ArrowRight className="h-3 w-3" aria-hidden="true" />
      )}
    </div>
  );
}


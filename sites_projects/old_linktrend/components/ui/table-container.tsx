'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
import { ScrollIndicator } from './scroll-indicator';

export interface TableContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Table height preset */
  height?: 'sm' | 'md' | 'lg';
  /** Required unique ID for sessionStorage and scroll indicator */
  id: string;
  /** Enable sticky header (default: true) */
  stickyHeader?: boolean;
  children: React.ReactNode;
}

const heightMap = {
  sm: 'max-h-[360px]',
  md: 'max-h-[480px]',
  lg: 'max-h-[600px]',
} as const;

/**
 * TableContainer - Unified wrapper for all admin console tables
 * - Persistent horizontal scrollbar
 * - Fixed vertical height with scrolling
 * - Scroll indicator integration
 * - Safari scrollbar support
 */
export const TableContainer = React.forwardRef<HTMLDivElement, TableContainerProps>(
  ({ height = 'lg', id, stickyHeader = true, children, className, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const [hasHorizontalScroll, setHasHorizontalScroll] = React.useState(false);

    // Combine refs
    React.useImperativeHandle(ref, () => containerRef.current as HTMLDivElement);

    // Check for horizontal scroll
    React.useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const checkScroll = () => {
        setHasHorizontalScroll(container.scrollWidth > container.clientWidth);
      };

      checkScroll();
      const observer = new ResizeObserver(checkScroll);
      observer.observe(container);

      return () => observer.disconnect();
    }, [children]);

    return (
      <div className="relative">
        <div
          ref={containerRef}
          id={id}
          className={cn(
            'w-full',
            // Horizontal and vertical scrolling
            'overflow-x-scroll overflow-y-auto',
            // Height based on preset
            heightMap[height],
            // Safari support
            'overscroll-x-contain',
            // Conditional class for Safari scrollbar spacer
            hasHorizontalScroll && 'has-hscroll',
            className
          )}
          style={{
            scrollbarGutter: 'stable both-edges',
          } as React.CSSProperties}
          {...props}
        >
          {children}
        </div>
        <ScrollIndicator containerRef={containerRef} tableId={id} />
      </div>
    );
  }
);

TableContainer.displayName = 'TableContainer';


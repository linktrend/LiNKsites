'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { TableHeadText, TableHeadNumeric, TableHeadStatus } from './table-cells';

export type SortDirection = 'asc' | 'desc' | null;

export interface SortableHeaderProps {
  children: React.ReactNode;
  sortDirection?: SortDirection;
  onSort?: () => void;
  className?: string;
  align?: 'left' | 'right' | 'center';
}

/**
 * SortableHeader - Consistent sortable header with icon
 */
export function SortableHeader({
  children,
  sortDirection = null,
  onSort,
  className,
  align = 'left'
}: SortableHeaderProps) {
  const BaseHead = React.useMemo(() => {
    if (align === 'center') return TableHeadStatus;
    // All text and numeric columns are left-aligned
    return align === 'right' ? TableHeadNumeric : TableHeadText;
  }, [align]);

  const Icon = React.useMemo(() => {
    if (sortDirection === 'asc') return ArrowUp;
    if (sortDirection === 'desc') return ArrowDown;
    return ArrowUpDown;
  }, [sortDirection]);

  if (!onSort) {
    return (
      <BaseHead className={className}>
        {children}
      </BaseHead>
    );
  }

  return (
    <BaseHead className={className}>
      <button
        onClick={onSort}
        className={cn(
          'flex items-center gap-2 w-full',
          align === 'center' ? 'justify-center' : 'justify-start',
          'hover:text-foreground transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm'
        )}
        aria-label={`Sort by ${typeof children === 'string' ? children : 'column'}`}
      >
        <span>{children}</span>
        <Icon 
          className={cn(
            'h-4 w-4 transition-opacity',
            sortDirection === null ? 'opacity-40' : 'opacity-100'
          )}
          aria-hidden="true"
        />
      </button>
    </BaseHead>
  );
}


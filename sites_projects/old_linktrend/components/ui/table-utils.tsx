'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { TableCell } from './table';

/**
 * DateTimeCell - Two-line date/time formatting
 * Line 1: Date (standard font)
 * Line 2: Time (smaller font, same color)
 */
export interface DateTimeCellProps {
  date: Date | string;
  className?: string;
  dateFormat?: (date: Date) => string;
  timeFormat?: (date: Date) => string;
}

export function DateTimeCell({ 
  date, 
  className,
  dateFormat,
  timeFormat 
}: DateTimeCellProps) {
  const dateObj = React.useMemo(() => {
    if (!date) return new Date();
    if (date instanceof Date) return date;
    const parsed = new Date(date);
    // Return fallback date if invalid
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }, [date]);

  const dateStr = dateFormat 
    ? dateFormat(dateObj)
    : dateObj.toLocaleDateString();
  
  const timeStr = timeFormat
    ? timeFormat(dateObj)
    : dateObj.toLocaleTimeString();

  return (
    <div className={cn('flex flex-col leading-tight', className)}>
      <span className="text-sm">{dateStr}</span>
      <span className="text-xs text-muted-foreground">{timeStr}</span>
    </div>
  );
}

/**
 * UserOrgCell - Two-line user/organization formatting
 * Line 1: Display Name (standard font)
 * Line 2: Username/Email (smaller font, same as time style)
 */
export interface UserOrgCellProps {
  primary: string;
  secondary: string;
  className?: string;
}

export function UserOrgCell({ primary, secondary, className }: UserOrgCellProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <span className="font-medium truncate whitespace-nowrap">{primary}</span>
      <span className="text-xs text-muted-foreground truncate whitespace-nowrap">
        {secondary}
      </span>
    </div>
  );
}

/**
 * DetailsLink - Consistent Details link component
 * - Grey arrow icon + "Details" text
 * - Preserves expand/collapse functionality
 * - ARIA attributes for accessibility
 */
export interface DetailsLinkProps {
  isExpanded: boolean;
  onToggle: () => void;
  className?: string;
  label?: string;
}

export function DetailsLink({ 
  isExpanded, 
  onToggle, 
  className,
  label = 'Details'
}: DetailsLinkProps) {
  return (
    <button
      onClick={onToggle}
      aria-expanded={isExpanded}
      aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label}`}
      className={cn(
        'flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors self-start',
        className
      )}
      type="button"
    >
      {isExpanded ? (
        <>
          <ChevronUp className="h-3 w-3" aria-hidden="true" />
          <span>{label}</span>
        </>
      ) : (
        <>
          <ChevronDown className="h-3 w-3" aria-hidden="true" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}

/**
 * ExpandedRowCell - Cell for expanded row details
 * - Uses aria-live for screen readers
 * - Grey background
 */
export interface ExpandedRowCellProps {
  colSpan: number;
  children: React.ReactNode;
  className?: string;
}

export function ExpandedRowCell({ 
  colSpan, 
  children, 
  className 
}: ExpandedRowCellProps) {
  return (
    <TableCell 
      colSpan={colSpan} 
      className={cn('bg-muted/50 p-4', className)}
      aria-live="polite"
    >
      {children}
    </TableCell>
  );
}


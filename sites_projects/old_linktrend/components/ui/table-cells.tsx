'use client';

import * as React from 'react';
import { cn } from '@/utils/cn';
import { TableCell, TableHead } from './table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

/**
 * TableHead variants for different column types
 */
export const TableHeadText = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <TableHead
    ref={ref}
    className={cn('text-left', className)}
    {...props}
  />
));
TableHeadText.displayName = 'TableHeadText';

export const TableHeadNumeric = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <TableHead
    ref={ref}
    className={cn('text-left', className)}
    {...props}
  />
));
TableHeadNumeric.displayName = 'TableHeadNumeric';

export const TableHeadStatus = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <TableHead
    ref={ref}
    className={cn('text-center max-w-[120px]', className)}
    {...props}
  />
));
TableHeadStatus.displayName = 'TableHeadStatus';

export const TableHeadAction = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <TableHead
    ref={ref}
    className={cn('text-center max-w-[100px]', className)}
    {...props}
  />
));
TableHeadAction.displayName = 'TableHeadAction';

/**
 * TableCell variants for different column types
 */
export const TableCellText = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <TableCell
    ref={ref}
    className={cn('text-left', className)}
    {...props}
  />
));
TableCellText.displayName = 'TableCellText';

export const TableCellNumeric = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <TableCell
    ref={ref}
    className={cn('text-left font-medium tabular-nums', className)}
    {...props}
  />
));
TableCellNumeric.displayName = 'TableCellNumeric';

export const TableCellStatus = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <TableCell
    ref={ref}
    className={cn('text-center max-w-[120px]', className)}
    {...props}
  />
));
TableCellStatus.displayName = 'TableCellStatus';

export const TableCellAction = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <TableCell
    ref={ref}
    className={cn('text-center max-w-[100px]', className)}
    {...props}
  />
));
TableCellAction.displayName = 'TableCellAction';

/**
 * TruncatedTextCell - For long strings with tooltip
 */
export interface TruncatedTextCellProps {
  text: string;
  maxLength?: number;
  className?: string;
}

export function TruncatedTextCell({ 
  text, 
  maxLength = 50,
  className 
}: TruncatedTextCellProps) {
  const shouldTruncate = text.length > maxLength;
  const displayText = shouldTruncate ? `${text.slice(0, maxLength)}...` : text;

  if (!shouldTruncate) {
    return <span className={className}>{text}</span>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('cursor-help', className)}>{displayText}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-md">
          <p className="break-words">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * ActionIconsCell - Evenly spaced icons in actions column
 */
export interface ActionIconsCellProps {
  children: React.ReactNode;
  className?: string;
}

export function ActionIconsCell({ children, className }: ActionIconsCellProps) {
  return (
    <div className={cn('flex items-center justify-center gap-2', className)}>
      {React.Children.map(React.Children.toArray(children), (child, index) => (
        <div key={index} className="flex-shrink-0">
          {child}
        </div>
      ))}
    </div>
  );
}


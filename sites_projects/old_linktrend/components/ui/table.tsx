import * as React from 'react';

import { cn } from '@/utils/cn';

export type TableDensity = 'compact' | 'comfortable' | 'expanded';

export interface TableProps extends React.HTMLAttributes<HTMLTableElement> {
  density?: TableDensity;
}

const Table = React.forwardRef<
  HTMLTableElement,
  TableProps
>(({ className, density = 'comfortable', ...props }, ref) => {
  const densityClasses = {
    compact: '[&_td]:min-h-[40px] [&_th]:h-10',
    comfortable: '[&_td]:min-h-[48px] [&_th]:h-12',
    expanded: '[&_td]:min-h-[56px] [&_th]:h-14',
  };

  return (
    <table
      ref={ref}
      role="table"
      className={cn(
        'w-full caption-bottom text-sm',
        // Fixed layout for header/body alignment
        'table-fixed',
        densityClasses[density],
        className
      )}
      {...props}
    />
  );
});
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead 
    ref={ref} 
    className={cn(
      '[&_tr]:border-b [&_tr]:border-border/50',
      // Sticky header for vertical scrolling
      '[&_tr]:sticky [&_tr]:top-0 [&_tr]:z-10 [&_tr]:bg-background',
      className
    )} 
    {...props} 
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn('[&_tr:last-child]:border-0', className)}
    {...props}
  />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={cn(
      'border-t bg-zinc-100/50 font-medium [&>tr]:last:border-b-0 dark:bg-zinc-800/50',
      className
    )}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    role="row"
    className={cn(
      'border-b border-border/50 transition-colors',
      'hover:bg-muted/30',
      'data-[state=selected]:bg-muted',
      'min-h-[48px]',
      className
    )}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <th
    ref={ref}
    role="columnheader"
    className={cn(
      'h-12 px-4 text-left align-middle font-medium text-sm text-muted-foreground [&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    role="cell"
    className={cn(
      'px-4 py-3 align-middle [&:has([role=checkbox])]:pr-0',
      // Standard text styling
      'text-sm text-foreground/90',
      // Allow wrapping with line clamp for long content
      'whitespace-normal break-words',
      // Consistent min height
      'min-h-[48px]',
      className
    )}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={cn('mt-4 text-sm text-zinc-500 dark:text-zinc-400', className)}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption
};

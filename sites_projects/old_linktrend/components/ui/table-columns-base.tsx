'use client';

import * as React from 'react';

/**
 * CSS width tokens for consistent column sizing
 */
export const COLUMN_WIDTHS = {
  xs: '56px',
  sm: '112px',
  md: '160px',
  lg: '224px',
} as const;

export type ColumnWidth = keyof typeof COLUMN_WIDTHS;

/**
 * Column definition for colgroup
 * Supports proportional width constraints: min-w-[120px] max-w-[260px]
 */
export interface ColumnDef {
  width?: ColumnWidth | string;
  minWidth?: ColumnWidth | string | number;
  maxWidth?: ColumnWidth | string | number;
  className?: string;
}

/**
 * Colgroup component that maps column definitions to CSS variables
 */
export function TableColgroup({ 
  columns, 
  className 
}: { 
  columns: ColumnDef[];
  className?: string;
}) {
  return (
    <colgroup className={className}>
      {columns.map((col, index) => {
        let width = col.width 
          ? (COLUMN_WIDTHS[col.width as ColumnWidth] || col.width)
          : 'auto';
        
        // Convert token keys to CSS variables
        if (col.width && COLUMN_WIDTHS[col.width as ColumnWidth]) {
          width = `var(--col-${col.width})`;
        } else if (col.width && !width.includes('px') && !width.includes('var(') && !width.includes('%')) {
          width = `var(--col-${col.width})`;
        }
        
        const style: React.CSSProperties = {
          width,
          minWidth: col.minWidth 
            ? (typeof col.minWidth === 'number' 
                ? `${col.minWidth}px` 
                : (COLUMN_WIDTHS[col.minWidth as ColumnWidth] || col.minWidth))
            : '120px', // Default min width
          maxWidth: col.maxWidth 
            ? (typeof col.maxWidth === 'number'
                ? `${col.maxWidth}px`
                : (COLUMN_WIDTHS[col.maxWidth as ColumnWidth] || col.maxWidth))
            : '260px', // Default max width
        };
        return <col key={index} style={style} className={col.className} />;
      })}
    </colgroup>
  );
}


/**
 * Reusable Breadcrumbs Component
 * 
 * Factory-safe breadcrumb navigation that:
 * - Uses centralized route helpers
 * - Supports i18n translations
 * - Gracefully degrades when segments are missing
 * - Follows consistent spacing standards
 * 
 * Usage:
 * ```tsx
 * import { Breadcrumbs } from '@/components/common/Breadcrumbs';
 * import { breadcrumbs } from '@/lib/routes';
 * 
 * const items = breadcrumbs.offer(lang, slug, {
 *   home: t('breadcrumbs.home'),
 *   offers: t('navigation.offers'),
 *   offerTitle: offer.title
 * });
 * 
 * <Breadcrumbs items={items} />
 * ```
 */

"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { BreadcrumbItem } from "@/lib/routes";

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <section
      id="breadcrumbs"
      className={`pt-8 sm:pt-12 pb-2 sm:pb-3 ${className}`}
      data-cms-section="breadcrumbs"
    >
      <div className="container px-4 sm:px-6">
        <nav 
          className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap"
          aria-label="Breadcrumb"
        >
          {items.map((item, index) => {
            const isLast = index === items.length - 1;
            const isActive = item.isActive || isLast;

            return (
              <div key={`${item.href}-${index}`} className="flex items-center gap-2">
                {isActive ? (
                  <span
                    className="text-foreground font-medium truncate max-w-[200px]"
                    aria-current="page"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="hover:text-foreground transition-colors truncate max-w-[200px]"
                  >
                    {item.label}
                  </Link>
                )}
                
                {!isLast && (
                  <ChevronRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                )}
              </div>
            );
          })}
        </nav>
      </div>
    </section>
  );
}

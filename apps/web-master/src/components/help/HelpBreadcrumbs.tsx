"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { routes } from "@/lib/routes";

interface HelpBreadcrumbsProps {
  lang: string;
  categorySlug?: string;
  categoryTitle?: string;
  articleTitle?: string;
}

export function HelpBreadcrumbs({ lang, categorySlug, categoryTitle, articleTitle }: HelpBreadcrumbsProps) {
  const t = useTranslations();
  return (
    <section
      id="breadcrumbs"
      className="pt-6 sm:pt-8 pb-4 sm:pb-6"
      data-cms-section="breadcrumbs"
    >
      <div className="container px-4 sm:px-6">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          {/* Home */}
          <Link
            href={routes.home(lang)}
            className="hover:text-foreground transition-colors"
            data-cms-field="breadcrumbs.home"
          >
            {t("breadcrumbs.home")}
          </Link>
          
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
          
          {/* Help Centre */}
          <Link
            href={routes.helpCentre(lang)}
            className="hover:text-foreground transition-colors"
            data-cms-field="breadcrumbs.helpCentre"
          >
            {t("breadcrumbs.helpCentre")}
          </Link>
          
          {/* Category (if present) */}
          {categorySlug && categoryTitle && (
            <>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
              {articleTitle ? (
                <Link
                  href={routes.helpCategory(lang, categorySlug)}
                  className="hover:text-foreground transition-colors truncate max-w-[200px]"
                  data-cms-field="breadcrumbs.category"
                >
                  {categoryTitle}
                </Link>
              ) : (
                <span
                  className="text-foreground font-medium truncate max-w-[200px]"
                  data-cms-field="breadcrumbs.category"
                >
                  {categoryTitle}
                </span>
              )}
            </>
          )}
          
          {/* Article (if present) */}
          {articleTitle && (
            <>
              <ChevronRight className="h-4 w-4 flex-shrink-0" />
              <span
                className="text-foreground font-medium truncate max-w-[300px]"
                data-cms-field="breadcrumbs.article"
              >
                {articleTitle}
              </span>
            </>
          )}
        </nav>
      </div>
    </section>
  );
}

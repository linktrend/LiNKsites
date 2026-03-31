"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { routes } from "@/lib/routes";
import { formatDateForSSR } from "@/lib/dateUtils";

export interface ArticleData {
  id: string;
  slug: string;
  title: string;
  shortDescription?: string;
  author: string;
  updatedAt: string;
}

interface HelpArticleListProps {
  articles: ArticleData[];
  lang: string;
  categorySlug: string;
}

export function HelpArticleList({ articles, lang, categorySlug }: HelpArticleListProps) {
  const t = useTranslations();
  const [formattedDates, setFormattedDates] = useState<Record<string, string>>({});

  useEffect(() => {
    // Format dates client-side only to avoid hydration mismatch
    const dates: Record<string, string> = {};
    articles.forEach((article) => {
      dates[article.id] = formatDateForSSR(article.updatedAt);
    });
    setFormattedDates(dates);
  }, [articles]);

  if (articles.length === 0) {
    return (
      <section
        id="article-list"
        className="pt-6 sm:pt-8 pb-12 sm:pb-16"
        data-cms-section="articleList"
      >
        <div className="container px-4 sm:px-6">
          <div className="max-w-4xl">
            <div className="text-center py-12 bg-muted/30 rounded-lg border border-border">
              <p className="text-muted-foreground">
                {t("help.noArticles")}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                {t("help.checkBackSoon")}{" "}
                <Link href={`/${lang}/contact`} className="text-primary hover:underline">
                  {t("help.contactSupport")}
                </Link>{" "}
                {t("help.forAssistance")}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="article-list"
      className="pt-6 sm:pt-8 pb-12 sm:pb-16"
      data-cms-section="articleList"
    >
      <div className="container px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4" data-cms-collection="articles">
            {articles.map((article, index) => (
              <Link
                key={article.id}
                href={routes.helpArticle(lang, categorySlug, article.slug)}
                className="group block p-6 bg-background rounded-lg border border-border hover:shadow-lg hover:border-primary/50 transition-all"
                data-cms-item={`articles[${index}]`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3
                      className="text-lg sm:text-xl font-semibold mb-2 group-hover:text-primary transition-colors"
                      data-cms-field={`articles[${index}].title`}
                    >
                      {article.title}
                    </h3>
                    
                    {/* Short Description */}
                    {article.shortDescription && (
                      <p
                        className="text-sm text-muted-foreground mb-3 line-clamp-2"
                        data-cms-field={`articles[${index}].shortDescription`}
                      >
                        {article.shortDescription}
                      </p>
                    )}
                    
                    {/* Metadata */}
                    <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                      <span data-cms-field={`articles[${index}].author`}>
                        By {article.author}
                      </span>
                      <span className="hidden sm:inline">·</span>
                      <span data-cms-field={`articles[${index}].updatedAt`}>
                        Updated on {formattedDates[article.id] || '...'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Chevron Icon */}
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

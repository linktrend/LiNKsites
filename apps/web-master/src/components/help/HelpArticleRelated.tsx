"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowUpRight } from "lucide-react";
import { routes } from "@/lib/routes";

interface RelatedArticle {
  id: string;
  slug: string;
  categorySlug: string;
  title: string;
  shortDescription?: string;
}

interface HelpArticleRelatedProps {
  relatedArticles: RelatedArticle[];
  lang: string;
}

export function HelpArticleRelated({ relatedArticles, lang }: HelpArticleRelatedProps) {
  const t = useTranslations();
  if (relatedArticles.length === 0) {
    return null;
  }

  return (
    <section
      id="related-articles"
      className="pt-8 sm:pt-12 pb-8 sm:pb-12 bg-muted/30"
      data-cms-section="relatedArticles"
    >
      <div className="container px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Divider */}
          <div className="border-t border-border mb-8"></div>
          
          {/* Section Heading */}
          <h2 className="text-2xl font-bold mb-6">
            {t("help.relatedArticles")}
          </h2>
          
          {/* Articles List */}
          <div className="space-y-4" data-cms-collection="relatedArticles">
            {relatedArticles.map((article, index) => (
              <Link
                key={article.id}
                href={routes.helpArticle(lang, article.categorySlug, article.slug)}
                className="group flex items-start justify-between gap-4 p-4 bg-background rounded-lg border border-border hover:shadow-md hover:border-primary/50 transition-all"
                data-cms-item={`relatedArticles[${index}]`}
              >
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-semibold mb-1 group-hover:text-primary transition-colors"
                    data-cms-field={`relatedArticles[${index}].title`}
                  >
                    {article.title}
                  </h3>
                  {article.shortDescription && (
                    <p
                      className="text-sm text-muted-foreground line-clamp-2"
                      data-cms-field={`relatedArticles[${index}].shortDescription`}
                    >
                      {article.shortDescription}
                    </p>
                  )}
                </div>
                <ArrowUpRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

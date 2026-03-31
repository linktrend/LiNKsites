"use client";

import Link from "next/link";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getImageWithFallback } from "@/lib/imageFallback";
import type { CmsArticle } from "@/lib/repository/articles";

interface Props {
  lang: string;
  articles: CmsArticle[];
}

export function ArticlesGrid({ lang, articles }: Props) {
  const t = useTranslations();
  const tPages = useTranslations('pages');
  // Deterministic selection to keep SSR/CSR consistent
  const selectedArticles = articles.slice(0, Math.min(4, articles.length));

  // Handle empty state
  if (articles.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold">{tPages('home.articles.title')}</h2>
          <p className="text-lg text-muted-foreground">{tPages('home.articles.subtitle')}</p>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p>No articles available at the moment. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">{tPages('home.articles.title')}</h2>
        <p className="text-lg text-muted-foreground">{tPages('home.articles.subtitle')}</p>
      </div>
      <div className={`grid gap-6 ${
        selectedArticles.length === 1 ? 'md:grid-cols-1 max-w-2xl mx-auto' :
        selectedArticles.length === 2 ? 'md:grid-cols-2' :
        selectedArticles.length === 3 ? 'md:grid-cols-3' :
        'md:grid-cols-2'
      }`}>
        {selectedArticles.map((article) => (
          <Card 
            key={article.slug} 
            className="group border-slate-200 hover:border-primary/40 hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Article Image */}
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              <Image
                src={getImageWithFallback(article.image, 'article')}
                alt={article.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <CardHeader>
              <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">
                {article.category}
              </div>
              <CardTitle className="text-xl line-clamp-2">{article.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-base leading-relaxed line-clamp-3">
                {article.excerpt}
              </CardDescription>
              <Link 
                href={`/${lang}/resources/articles/${article.slug}`} 
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                {t('readArticle')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

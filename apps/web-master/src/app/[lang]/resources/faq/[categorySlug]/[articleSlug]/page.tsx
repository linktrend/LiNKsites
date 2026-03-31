import { notFound } from "next/navigation";
import { buildMetadata, buildArticleJsonLd } from "@/lib/seo";
import { HelpCentreHero } from "@/components/help/HelpCentreHero";
import { HelpSearchField } from "@/components/help/HelpSearchField";
import { HelpBreadcrumbs } from "@/components/help/HelpBreadcrumbs";
import { HelpCategoryHeader } from "@/components/help/HelpCategoryHeader";
import { HelpArticleHeader } from "@/components/help/HelpArticleHeader";
import { HelpArticleBody } from "@/components/help/HelpArticleBody";
import { HelpArticleRelated } from "@/components/help/HelpArticleRelated";
import { HelpArticleFeedback } from "@/components/help/HelpArticleFeedback";
import { ScrollToTop } from "@/components/common/ScrollToTop";
import { getCategoryBySlug, getArticleBySlug, getRelatedArticles } from "@/lib/helpMockData";
import { SITE_CONFIG } from "@/config";
import { normalizeLocale } from "@/lib/locale-context";

type Props = { params: { lang: string; categorySlug: string; articleSlug: string } };

export async function generateMetadata({ params }: Props) {
  const locale = normalizeLocale(params.lang);
  const article = getArticleBySlug(params.categorySlug, params.articleSlug);
  const category = getCategoryBySlug(params.categorySlug);
  
  if (!article || !category) {
    return buildMetadata(locale, `/resources/faq/${params.categorySlug}/${params.articleSlug}`);
  }

  return buildMetadata(locale, `/resources/faq/${params.categorySlug}/${params.articleSlug}`, {
    title: `${article.title || 'Help Article'} - Help Center`,
    description: article.shortDescription || '',
    keywords: [
      "help article",
      category.title || '',
      article.title || '',
      "FAQ",
      "support",
    ].filter(Boolean),
    ogType: "article",
    author: article.author || 'Support Team',
  });
}

export default async function HelpArticlePage({ params }: Props) {
  const { categorySlug, articleSlug } = params;
  const lang = normalizeLocale(params.lang);
  
  // Fetch category data
  const category = getCategoryBySlug(categorySlug);
  
  if (!category) {
    return notFound();
  }
  
  // Fetch article data
  const article = getArticleBySlug(categorySlug, articleSlug);
  
  if (!article) {
    return notFound();
  }
  
  // Fetch related articles
  const relatedArticles = getRelatedArticles(article.relatedArticles);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <HelpCentreHero
        title="Help Centre"
        subtitle="Find answers, guides, and support to help you succeed"
      />
      
      {/* Search Field */}
      <HelpSearchField placeholder="Search for help articles..." />
      
      {/* Breadcrumbs */}
      <HelpBreadcrumbs
        lang={lang}
        categorySlug={categorySlug}
        categoryTitle={category.title}
        articleTitle={article.title}
      />
      
      {/* Article Header */}
      <HelpArticleHeader
        article={{
          title: article.title || 'Help Article',
          author: article.author || 'Support Team',
          updatedAt: article.updatedAt || "2024-01-01T00:00:00Z",
        }}
      />
      
      {/* Article Body */}
      <HelpArticleBody content={article.body || ''} />
      
      {/* Scroll to Top Button */}
      <ScrollToTop />
      
      {/* Related Articles */}
      <HelpArticleRelated
        relatedArticles={relatedArticles.map(related => ({
          id: related.id || '',
          slug: related.slug || '',
          categorySlug: related.categorySlug || '',
          title: related.title || 'Article',
          shortDescription: related.shortDescription || '',
        }))}
        lang={lang}
      />
      
      {/* Feedback */}
      <HelpArticleFeedback articleSlug={articleSlug} />
    </div>
  );
}

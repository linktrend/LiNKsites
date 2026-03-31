import { notFound } from "next/navigation";
import { buildMetadata, buildFAQJsonLd } from "@/lib/seo";
import { HelpCentreHero } from "@/components/help/HelpCentreHero";
import { HelpSearchField } from "@/components/help/HelpSearchField";
import { HelpBreadcrumbs } from "@/components/help/HelpBreadcrumbs";
import { HelpCategoryHeader } from "@/components/help/HelpCategoryHeader";
import { HelpArticleList } from "@/components/help/HelpArticleList";
import { getCategoryBySlug, getArticlesByCategory } from "@/lib/helpMockData";
import { normalizeLocale } from "@/lib/locale-context";

type Props = { params: { lang: string; categorySlug: string } };

export async function generateMetadata({ params }: Props) {
  const locale = normalizeLocale(params.lang);
  const category = getCategoryBySlug(params.categorySlug);
  
  if (!category) {
    return buildMetadata(locale, `/resources/faq/${params.categorySlug}`);
  }

  return buildMetadata(locale, `/resources/faq/${params.categorySlug}`, {
    title: `${category.title || 'Help'} - Help Center`,
    description: category.slogan || `Find help articles and answers about ${category.title || 'this topic'}`,
    keywords: [
      "help",
      "FAQ",
      category.title || '',
      "support",
      "documentation",
    ].filter(Boolean),
  });
}

export default async function HelpCategoryPage({ params }: Props) {
  const { categorySlug } = params;
  const lang = normalizeLocale(params.lang);
  
  // Fetch category data (mock data for now, will be CMS later)
  const category = getCategoryBySlug(categorySlug);
  
  if (!category) {
    return notFound();
  }
  
  // Fetch articles for this category
  const articles = getArticlesByCategory(categorySlug);

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
      />
      
      {/* Category Header */}
      <HelpCategoryHeader
        category={{
          title: category.title || 'Help Category',
          slogan: category.slogan || '',
          author: category.author || 'Support Team',
          articleCount: category.articleCount || 0,
          lastUpdated: category.lastUpdated || "2024-01-01T00:00:00Z",
        }}
        isArticlePage={false}
      />
      
      {/* Article List */}
      <HelpArticleList
        articles={articles.map(article => ({
          id: article.id || '',
          slug: article.slug || '',
          title: article.title || 'Article',
          shortDescription: article.shortDescription || '',
          author: article.author || 'Support Team',
          updatedAt: article.updatedAt || "2024-01-01T00:00:00Z",
        }))}
        lang={lang}
        categorySlug={categorySlug}
      />
    </div>
  );
}

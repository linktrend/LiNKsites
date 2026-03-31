import { ArticlesPageContent } from "@/components/resources/ArticlesPageContent";
import { buildMetadata } from "@/lib/seo";
import { getArticles } from "@/lib/pageService";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props) {
  const locale = normalizeLocale(params.lang);
  return buildMetadata(locale, "/resources/articles", {
    title: "Articles",
    description: "Read our latest articles on automation, business intelligence, and digital transformation. Expert insights and practical guides.",
    keywords: [
      "articles",
      "blog",
      "automation guides",
      "business insights",
      "best practices",
      "tutorials",
    ],
  });
}

export default async function ArticlesPage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const page = await getArticles(locale, siteId);
  return <ArticlesPageContent lang={locale} articles={page.data.articles} />;
}

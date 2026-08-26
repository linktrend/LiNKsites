import { ArticlesPageContent } from "@/components/resources/ArticlesPageContent";
import { buildMetadata } from "@/lib/seo";
import { getArticles } from "@/lib/pageService";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  try {
    const { locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/resources/articles` });
    return buildMetadata(locale, "/resources/articles", { title: "Articles" });
  } catch {
    return { title: "Page unavailable", robots: { index: false, follow: false } };
  }
}

export default async function ArticlesPage({ params }: Props) {
  const { lang } = await params;
  const { siteId, locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/resources/articles` });
  const page = await getArticles(locale, siteId);
  if (!page.data.articles.length) notFound();
  return <ArticlesPageContent lang={locale} articles={page.data.articles} />;
}

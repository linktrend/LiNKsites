import { notFound } from "next/navigation";
import { getResourceArticle } from "@/lib/pageService";
import { buildMetadata } from "@/lib/seo";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";
import { ArticleLayout } from "@/layouts/ArticleLayout";
import { resolveImage } from "@/lib/resolveImage";

export type Props = { params: Promise<{ lang: string; articleSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang, articleSlug } = await params;
  try {
    const { siteId, locale } = await requirePublicFamilyPage({
      lang,
      pathname: `/${lang}/resources/articles/${articleSlug}`,
    });
    const page = await getResourceArticle(locale, siteId, articleSlug);
    const article = page?.data?.article;
    if (!article) return { title: "Page unavailable", robots: { index: false, follow: false } };
    const seo = (article as { seo?: { title?: string; description?: string; ogImage?: { url?: string }; canonicalUrl?: string } }).seo ?? {};
    return buildMetadata(locale, `/resources/articles/${articleSlug}`, {
      title: seo.title ?? article.title ?? "Article",
      description: seo.description ?? article.excerpt ?? "",
      ogType: "article",
      ogImage: seo.ogImage?.url ?? resolveImage(article.image ?? undefined) ?? undefined,
      canonicalUrl: seo.canonicalUrl,
    });
  } catch {
    return { title: "Page unavailable", robots: { index: false, follow: false } };
  }
}

export default async function ResourceArticlePage({ params }: Props) {
  const { lang, articleSlug } = await params;
  const { siteId, locale } = await requirePublicFamilyPage({
    lang,
    pathname: `/${lang}/resources/articles/${articleSlug}`,
  });
  const page = await getResourceArticle(locale, siteId, articleSlug);
  if (!page?.data?.article) return notFound();
  return <ArticleLayout lang={locale} page={page as never} />;
}

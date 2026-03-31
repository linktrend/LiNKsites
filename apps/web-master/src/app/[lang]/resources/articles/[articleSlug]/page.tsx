import { notFound } from "next/navigation";
import { getResourceArticle } from "@/lib/pageService";
import { buildMetadata } from "@/lib/seo";
import { SEO_CONFIG } from "@/config";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";
import { ArticleLayout } from "@/layouts/ArticleLayout";
import { resolveImage } from "@/lib/resolveImage";

export type Props = { params: { lang: string; articleSlug: string } };

export async function generateMetadata({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  try {
    const page = await getResourceArticle(locale, siteId, params.articleSlug);
    const article = page?.data?.article;

    if (!article) {
      return buildMetadata(locale, `/resources/articles/${params.articleSlug}`);
    }

    const seo = (article as any).seo ?? {};
    const ogImage =
      (seo?.ogImage as any)?.url ??
      resolveImage(article.image ?? undefined) ??
      undefined;

    return buildMetadata(locale, `/resources/articles/${params.articleSlug}`, {
      title: seo.title ?? article.title ?? "Article",
      description: seo.description ?? article.excerpt ?? "",
      keywords:
        seo.keywords && Array.isArray(seo.keywords)
          ? seo.keywords
          : [
              article.category || "article",
              article.title || "",
              "article",
              "guide",
              ...SEO_CONFIG.defaultKeywords,
            ].filter(Boolean),
      ogType: "article",
      ogImage,
      canonicalUrl: seo.canonicalUrl,
    });
  } catch (error) {
    return buildMetadata(locale, `/resources/articles/${params.articleSlug}`);
  }
}

export default async function ResourceArticlePage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const page = await getResourceArticle(locale, siteId, params.articleSlug);
  if (!page?.data?.article) return notFound();
  return <ArticleLayout lang={locale} page={page as any} />;
}

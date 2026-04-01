import { payloadFind } from "@/lib/payload-client";
import { siteLocaleFilter } from "@/lib/repository/shared-filters";
import { CmsPageBlock } from "@/lib/repository/pages";
import { blocksToPlainText } from "@/lib/lexical-plain-text";
import { runtimeConfig } from "@/config/runtime";

export interface CmsArticle {
  id: string;
  site: string;
  locale: string;
  slug: string;
  title: string;
  excerpt?: string;
  layout?: CmsPageBlock[];
  body?: any;
  publishedAt?: string;
  category?: string;
  image?: any;
  status?: string;
  date?: string;
  offerSlug?: string;
  seo?: {
    title?: string;
    description?: string;
    ogImage?: any;
    canonicalUrl?: string;
    keywords?: string[];
  };
  reviewedAt?: string | null;
  reviewedBy?: { id?: string | number; name?: string; email?: string } | string | null;
}

type Upload = { url?: string } | string | null | undefined;
const toAbsoluteUrl = (value: string): string => {
  if (/^https?:\/\//i.test(value)) return value;
  try {
    return new URL(value, runtimeConfig.payloadBaseUrl).toString();
  } catch {
    return value;
  }
};
const uploadToUrl = (value: Upload): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return toAbsoluteUrl(value);
  if (typeof value === "object" && typeof (value as any).url === "string") return toAbsoluteUrl((value as any).url);
  return undefined;
};

type Category = { name?: string; slug?: string } | string | null | undefined;
const categoryToString = (value: Category): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  const name = (value as any).name;
  const slug = (value as any).slug;
  if (typeof name === "string" && name.trim()) return name;
  if (typeof slug === "string" && slug.trim()) return slug;
  return undefined;
};

type ArticleDoc = {
  id: string;
  site: string;
  locale: string;
  slug: string;
  title?: string;
  description?: string;
  featuredImage?: Upload;
  content?: unknown;
  status?: string;
  publishedAt?: string;
  category?: Category;
  seo?: any;
  reviewedAt?: string;
  reviewedBy?: any;
};

const normalizeArticle = (doc: ArticleDoc): CmsArticle => ({
  id: String(doc.id),
  site: String(doc.site),
  locale: String(doc.locale),
  slug: String(doc.slug),
  title: doc.title ?? "",
  excerpt: doc.description ?? "",
  body: blocksToPlainText(doc.content),
  publishedAt: doc.publishedAt,
  category: categoryToString(doc.category),
  image: uploadToUrl(doc.featuredImage),
  status: doc.status,
  date: doc.publishedAt,
  seo: doc.seo,
  reviewedAt: doc.reviewedAt ?? null,
  reviewedBy: doc.reviewedBy ?? null,
});

type ListArgs = {
  siteId: string;
  locale: string;
  limit?: number;
};

export const listArticles = async ({
  siteId,
  locale,
  limit,
}: ListArgs): Promise<CmsArticle[]> => {
  const where = siteLocaleFilter(siteId, locale);

  const result = await payloadFind<ArticleDoc>({
    collection: "articles",
    where,
    limit,
    depth: 2,
    locale,
    site: siteId,
  });

  return (result.docs ?? []).map(normalizeArticle);
};

export const getArticleBySlug = async ({
  siteId,
  locale,
  slug,
}: {
  siteId: string;
  locale: string;
  slug: string;
}): Promise<CmsArticle | null> => {
  const baseFilter = siteLocaleFilter(siteId, locale);

  const where = {
    and: [...baseFilter.and, { slug: { equals: slug } }],
  };

  const result = await payloadFind<ArticleDoc>({
    collection: "articles",
    where,
    limit: 1,
    depth: 2,
    locale,
    site: siteId,
  });

  const doc = result.docs?.[0];
  return doc ? normalizeArticle(doc) : null;
};

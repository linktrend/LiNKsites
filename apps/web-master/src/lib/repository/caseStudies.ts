import { payloadFind } from "@/lib/payload-client";
import { siteLocaleFilter } from "@/lib/repository/shared-filters";
import { CmsPageBlock } from "@/lib/repository/pages";
import { lexicalToPlainText } from "@/lib/lexical-plain-text";

export interface CmsCaseStudy {
  id: string;
  site: string;
  locale: string;
  slug: string;
  title: string;
  summary?: string;
  excerpt?: string;
  layout?: CmsPageBlock[];
  body?: any;
  image?: any;
  status?: string;
  challenge?: string;
  solution?: string;
  impact?: string;
  lastUpdated?: string;
  relatedOffers?: string[];
  seo?: {
    title?: string;
    description?: string;
    ogImage?: any;
    canonicalUrl?: string;
    keywords?: string[];
  };
}

type CaseStudyPageDoc = {
  id: string;
  site: string;
  locale: string;
  slug: string;
  title?: string;
  excerpt?: string;
  challenge?: unknown;
  solution?: unknown;
  results?: Array<{ metric?: string; value?: string }> | null;
  status?: string;
  seo?: any;
  publishedAt?: string;
  updatedAt?: string;
};

const normalizeCaseStudy = (doc: CaseStudyPageDoc): CmsCaseStudy => {
  const results = Array.isArray(doc.results) ? doc.results : [];
  const impact =
    results.length > 0
      ? results
          .map((r) => `${r.metric ?? ""}${r.metric ? ": " : ""}${r.value ?? ""}`.trim())
          .filter(Boolean)
          .join(" | ")
      : undefined;

  return {
    id: String(doc.id),
    site: String(doc.site),
    locale: String(doc.locale),
    slug: String(doc.slug),
    title: doc.title ?? "",
    summary: doc.excerpt ?? undefined,
    excerpt: doc.excerpt ?? undefined,
    challenge: lexicalToPlainText(doc.challenge),
    solution: lexicalToPlainText(doc.solution),
    impact,
    lastUpdated: doc.publishedAt ?? doc.updatedAt,
    status: doc.status,
    seo: doc.seo,
  };
};

export const listCaseStudies = async ({
  siteId,
  locale,
  limit,
}: {
  siteId: string;
  locale: string;
  limit?: number;
}): Promise<CmsCaseStudy[]> => {
  const where = siteLocaleFilter(siteId, locale);

  const result = await payloadFind<CaseStudyPageDoc>({
    collection: "case-study-pages",
    where,
    limit,
    depth: 2,
    locale,
    site: siteId,
  });

  return (result.docs ?? []).map(normalizeCaseStudy);
};

export const getCaseStudyBySlug = async ({
  siteId,
  locale,
  slug,
}: {
  siteId: string;
  locale: string;
  slug: string;
}): Promise<CmsCaseStudy | null> => {
  const baseFilter = siteLocaleFilter(siteId, locale);

  const where = {
    and: [...baseFilter.and, { slug: { equals: slug } }],
  };

  const result = await payloadFind<CaseStudyPageDoc>({
    collection: "case-study-pages",
    where,
    limit: 1,
    depth: 2,
    locale,
    site: siteId,
  });

  const doc = result.docs?.[0];
  return doc ? normalizeCaseStudy(doc) : null;
};

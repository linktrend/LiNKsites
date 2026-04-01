import { payloadFind } from "@/lib/payload-client";
import { siteLocaleFilter } from "@/lib/repository/shared-filters";
import { CmsPageBlock } from "@/lib/repository/pages";

export interface CmsOffer {
  id: string;
  site: string;
  locale: string;
  slug: string;
  title: string;
  subtitle?: string;
  short_description?: string;
  status?: string;
  description?: string;
  type?: string;
  layout?: CmsPageBlock[];
  features?: string[];
  useCases?: string[];
  pricing?: string[];
  testimonials?: string[];
  relatedResources?: string[];
  hero_content?: any;
  body_content?: any;
  sort_order?: number;
  theme_variant?: string;
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

type OfferPageDoc = {
  id: string;
  site: string;
  locale: string;
  slug: string;
  title?: string;
  excerpt?: string;
  status?: string;
  seo?: any;
  reviewedAt?: string;
  reviewedBy?: any;
};

const normalizeOffer = (doc: OfferPageDoc): CmsOffer => ({
  id: String(doc.id),
  site: String(doc.site),
  locale: String(doc.locale),
  slug: String(doc.slug),
  title: doc.title ?? "",
  subtitle: doc.excerpt ?? undefined,
  short_description: doc.excerpt ?? undefined,
  description: doc.excerpt ?? undefined,
  status: doc.status,
  seo: doc.seo,
  reviewedAt: doc.reviewedAt ?? null,
  reviewedBy: doc.reviewedBy ?? null,
});

export const listOffers = async ({
  siteId,
  locale,
  limit,
}: {
  siteId: string;
  locale: string;
  limit?: number;
}): Promise<CmsOffer[]> => {
  const where = siteLocaleFilter(siteId, locale);

  const result = await payloadFind<OfferPageDoc>({
    collection: "offer-pages",
    where,
    limit,
    depth: 2,
    locale,
    site: siteId,
  });

  return (result.docs ?? []).map(normalizeOffer);
};

export const getOfferBySlug = async ({
  siteId,
  locale,
  slug,
}: {
  siteId: string;
  locale: string;
  slug: string;
}): Promise<CmsOffer | null> => {
  const baseFilter = siteLocaleFilter(siteId, locale);

  const where = {
    and: [...baseFilter.and, { slug: { equals: slug } }],
  };

  const result = await payloadFind<OfferPageDoc>({
    collection: "offer-pages",
    where,
    limit: 1,
    depth: 2,
    locale,
    site: siteId,
  });

  const doc = result.docs?.[0];
  return doc ? normalizeOffer(doc) : null;
};

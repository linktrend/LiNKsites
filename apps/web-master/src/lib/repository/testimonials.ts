import { payloadFind } from "@/lib/payload-client";
import { siteLocaleFilter } from "@/lib/repository/shared-filters";

export interface CmsTestimonial {
  id: string;
  site: string;
  locale: string;
  quote: string;
  author?: string;
  role?: string;
  avatar?: any;
}

export const listTestimonials = async ({
  siteId,
  locale,
  limit,
}: {
  siteId: string;
  locale: string;
  limit?: number;
}): Promise<CmsTestimonial[]> => {
  const where = siteLocaleFilter(siteId, locale);

  const result = await payloadFind<CmsTestimonial>({
    collection: "testimonials",
    where,
    limit,
    depth: 2,
    locale,
    site: siteId,
  });

  return result.docs;
};

export const getTestimonial = async ({
  siteId,
  locale,
  id,
}: {
  siteId: string;
  locale: string;
  id: string;
}): Promise<CmsTestimonial | null> => {
  const baseFilter = siteLocaleFilter(siteId, locale);

  const where = {
    and: [...baseFilter.and, { id: { equals: id } }],
  };

  const result = await payloadFind<CmsTestimonial>({
    collection: "testimonials",
    where,
    limit: 1,
    depth: 2,
    locale,
    site: siteId,
  });

  return result.docs[0] ?? null;
};

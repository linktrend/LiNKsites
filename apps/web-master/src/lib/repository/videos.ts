import { payloadFind } from "@/lib/payload-client";
import { siteLocaleFilter } from "@/lib/repository/shared-filters";
import { CmsPageBlock } from "@/lib/repository/pages";

export interface CmsVideo {
  id: string;
  site: string;
  locale: string;
  slug: string;
  title: string;
  description?: string;
  layout?: CmsPageBlock[];
  youtubeId?: string;
  thumbnail?: any;
  relatedArticles?: string[];
  relatedVideos?: string[];
  status?: string;
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

export const listVideos = async ({
  siteId,
  locale,
  limit,
}: {
  siteId: string;
  locale: string;
  limit?: number;
}): Promise<CmsVideo[]> => {
  const where = siteLocaleFilter(siteId, locale);
  const result = await payloadFind<CmsVideo>({
    collection: "videos",
    where,
    limit,
    depth: 2,
    locale,
    site: siteId,
  });
  return result.docs;
};

export const getVideoBySlug = async ({
  siteId,
  locale,
  slug,
}: {
  siteId: string;
  locale: string;
  slug: string;
}): Promise<CmsVideo | null> => {
  const where = {
    and: [
      ...siteLocaleFilter(siteId, locale).and,
      { slug: { equals: slug } },
    ],
  };
  const result = await payloadFind<CmsVideo>({
    collection: "videos",
    where,
    limit: 1,
    depth: 2,
    locale,
    site: siteId,
  });
  return result.docs[0] ?? null;
};

import { notFound } from "next/navigation";
import { getVideoResource } from "@/lib/pageService";
import { buildMetadata } from "@/lib/seo";
import { SEO_CONFIG } from "@/config";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";
import { VideoLayout } from "@/layouts/VideoLayout";

export type Props = { params: { lang: string; videoSlug: string } };

export async function generateMetadata({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  try {
    const page = await getVideoResource(locale, siteId, params.videoSlug);
    const video = page?.data?.video;

    if (!video) {
      return buildMetadata(locale, `/resources/videos/${params.videoSlug}`);
    }

    const seo = (video as any).seo ?? {};

    return buildMetadata(locale, `/resources/videos/${params.videoSlug}`, {
      title: seo.title ?? video.title ?? "Video",
      description: seo.description ?? video.description ?? "",
      keywords:
        seo.keywords && Array.isArray(seo.keywords)
          ? seo.keywords
          : ["video tutorial", video.title || "", "training", "guide", ...SEO_CONFIG.defaultKeywords].filter(Boolean),
      ogType: "article",
      ogImage: (seo.ogImage as any)?.url ?? (video.thumbnail as any)?.url ?? undefined,
      canonicalUrl: seo.canonicalUrl,
    });
  } catch (error) {
    return buildMetadata(locale, `/resources/videos/${params.videoSlug}`);
  }
}

export default async function VideoResourcePage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const page = await getVideoResource(locale, siteId, params.videoSlug);
  if (!page?.data?.video) return notFound();
  return <VideoLayout lang={locale} page={page as any} />;
}

import { notFound } from "next/navigation";
import { getVideoResource } from "@/lib/pageService";
import { buildMetadata } from "@/lib/seo";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";
import { VideoLayout } from "@/layouts/VideoLayout";

export type Props = { params: Promise<{ lang: string; videoSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang, videoSlug } = await params;
  try {
    const { siteId, locale } = await requirePublicFamilyPage({
      lang,
      pathname: `/${lang}/resources/videos/${videoSlug}`,
    });
    const page = await getVideoResource(locale, siteId, videoSlug);
    const video = page?.data?.video;
    if (!video) return { title: "Page unavailable", robots: { index: false, follow: false } };
    const seo = (video as { seo?: { title?: string; description?: string; canonicalUrl?: string } }).seo ?? {};
    return buildMetadata(locale, `/resources/videos/${videoSlug}`, {
      title: seo.title ?? video.title ?? "Video",
      description: seo.description ?? video.description ?? "",
      canonicalUrl: seo.canonicalUrl,
    });
  } catch {
    return { title: "Page unavailable", robots: { index: false, follow: false } };
  }
}

export default async function VideoResourcePage({ params }: Props) {
  const { lang, videoSlug } = await params;
  const { siteId, locale } = await requirePublicFamilyPage({
    lang,
    pathname: `/${lang}/resources/videos/${videoSlug}`,
  });
  const page = await getVideoResource(locale, siteId, videoSlug);
  if (!page?.data?.video) return notFound();
  return <VideoLayout lang={locale} page={page as never} />;
}

import { VideosPageContent } from "@/components/resources/VideosPageContent";
import { buildMetadata } from "@/lib/seo";
import { getVideosPage } from "@/lib/pageService";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  try {
    const { locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/resources/videos` });
    return buildMetadata(locale, "/resources/videos", { title: "Videos" });
  } catch {
    return { title: "Page unavailable", robots: { index: false, follow: false } };
  }
}

export default async function VideosPage({ params }: Props) {
  const { lang } = await params;
  const { siteId, locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/resources/videos` });
  const page = await getVideosPage(locale, siteId);
  if (!page.data.videos.length) notFound();
  return <VideosPageContent lang={locale} videos={page.data.videos} />;
}

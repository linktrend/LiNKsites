import { VideosPageContent } from "@/components/resources/VideosPageContent";
import { buildMetadata } from "@/lib/seo";
import { getVideosPage } from "@/lib/pageService";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props) {
  const locale = normalizeLocale(params.lang);
  return buildMetadata(locale, "/resources/videos", {
    title: "Videos",
  });
}

export default async function VideosPage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const page = await getVideosPage(locale, siteId);
  return <VideosPageContent lang={locale} videos={page.data.videos} />;
}

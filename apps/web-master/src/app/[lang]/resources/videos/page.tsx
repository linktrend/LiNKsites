import { VideosPageContent } from "@/components/resources/VideosPageContent";
import { buildMetadata } from "@/lib/seo";
import { getVideosPage } from "@/lib/pageService";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props) {
  const locale = normalizeLocale(params.lang);
  return buildMetadata(locale, "/resources/videos", {
    title: "Video Tutorials",
    description: "Watch our video tutorials to learn how to use our platform effectively. Step-by-step guides and best practices.",
    keywords: [
      "video tutorials",
      "training videos",
      "how-to guides",
      "platform tutorials",
      "video library",
    ],
  });
}

export default async function VideosPage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const page = await getVideosPage(locale, siteId);
  return <VideosPageContent lang={locale} videos={page.data.videos} />;
}

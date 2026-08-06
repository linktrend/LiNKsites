import { notFound } from "next/navigation";
import { getVideoResource } from "@/lib/pageService";
import { VideoLayout } from "@/layouts/VideoLayout";

type Props = { params: { lang: string; videoSlug: string } };

export default async function VideoResourcePage({ params }: Props) {
  const page = await getVideoResource(params.lang, params.videoSlug);
  if (!page) return notFound();
  return <VideoLayout lang={params.lang} page={page} />;
}

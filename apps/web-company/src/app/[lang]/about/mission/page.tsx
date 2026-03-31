import { getAboutMission } from "@/lib/pageService";
import { AboutLayout } from "@/layouts/AboutLayout";

type Props = { params: { lang: string } };

export default async function AboutMissionPage({ params }: Props) {
  const page = await getAboutMission(params.lang);
  return <AboutLayout lang={params.lang} page={page} />;
}

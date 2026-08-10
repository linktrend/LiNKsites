import { getAboutTeam } from "@/lib/pageService";
import { AboutLayout } from "@/layouts/AboutLayout";

type Props = { params: { lang: string } };

export default async function AboutTeamPage({ params }: Props) {
  const page = await getAboutTeam(params.lang);
  return <AboutLayout lang={params.lang} page={page} />;
}

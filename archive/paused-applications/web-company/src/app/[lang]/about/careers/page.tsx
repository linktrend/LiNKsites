import { getAboutCareers } from "@/lib/pageService";
import { AboutLayout } from "@/layouts/AboutLayout";

type Props = { params: { lang: string } };

export default async function AboutCareersPage({ params }: Props) {
  const page = await getAboutCareers(params.lang);
  return <AboutLayout lang={params.lang} page={page} />;
}

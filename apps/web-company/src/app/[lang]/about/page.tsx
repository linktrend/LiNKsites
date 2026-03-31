import { getAboutIndex } from "@/lib/pageService";
import { AboutLayout } from "@/layouts/AboutLayout";

type Props = { params: { lang: string } };

export default async function AboutIndexPage({ params }: Props) {
  const page = await getAboutIndex(params.lang);
  return <AboutLayout lang={params.lang} page={page} />;
}

import { getAboutCompany } from "@/lib/pageService";
import { AboutLayout } from "@/layouts/AboutLayout";

type Props = { params: { lang: string } };

export default async function AboutCompanyPage({ params }: Props) {
  const page = await getAboutCompany(params.lang);
  return <AboutLayout lang={params.lang} page={page} />;
}

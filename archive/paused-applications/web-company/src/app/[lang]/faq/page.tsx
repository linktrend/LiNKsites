import { getFaqPage } from "@/lib/pageService";
import { FAQLayout } from "@/layouts/FAQLayout";

type Props = { params: { lang: string } };

export default async function FAQPage({ params }: Props) {
  const page = await getFaqPage(params.lang);
  return <FAQLayout lang={params.lang} page={page} />;
}

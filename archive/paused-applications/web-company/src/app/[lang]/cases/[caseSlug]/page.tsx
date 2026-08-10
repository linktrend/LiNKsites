import { notFound } from "next/navigation";
import { getCaseStudyPage } from "@/lib/pageService";
import { CaseStudyLayout } from "@/layouts/CaseStudyLayout";

type Props = { params: { lang: string; caseSlug: string } };

export default async function CaseStudyPage({ params }: Props) {
  const page = await getCaseStudyPage(params.lang, params.caseSlug);
  if (!page) return notFound();
  return <CaseStudyLayout lang={params.lang} page={page} />;
}

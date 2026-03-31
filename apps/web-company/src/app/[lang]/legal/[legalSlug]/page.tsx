import { notFound } from "next/navigation";
import { getLegalPage } from "@/lib/pageService";
import { LegalLayout } from "@/layouts/LegalLayout";

type Props = { params: { lang: string; legalSlug: string } };

export default async function LegalPage({ params }: Props) {
  const page = await getLegalPage(params.lang, params.legalSlug);
  if (!page) return notFound();
  return <LegalLayout lang={params.lang} page={page} />;
}

import { notFound } from "next/navigation";
import { getOfferPage } from "@/lib/pageService";
import { OfferPageLayout } from "@/layouts/OfferPageLayout";

type Props = { params: { lang: string; offerSlug: string } };

export default async function OfferPage({ params }: Props) {
  const page = await getOfferPage(params.lang, params.offerSlug);
  if (!page) return notFound();
  return <OfferPageLayout lang={params.lang} page={page} />;
}

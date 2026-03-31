import { notFound } from "next/navigation";
import { getHomePage } from "@/lib/pageService";
import { OfferIndexLayout } from "@/layouts/OfferIndexLayout";

type Props = { params: { lang: string } };

export default async function HomePage({ params }: Props) {
  const page = await getHomePage(params.lang);
  if (!page) return notFound();
  return <OfferIndexLayout lang={params.lang} page={page} />;
}

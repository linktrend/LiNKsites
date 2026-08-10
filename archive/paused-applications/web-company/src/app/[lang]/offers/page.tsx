import { getOfferIndex } from "@/lib/pageService";
import { OfferIndexLayout } from "@/layouts/OfferIndexLayout";

type Props = { params: { lang: string } };

export default async function OfferIndexPage({ params }: Props) {
  const page = await getOfferIndex(params.lang);
  return <OfferIndexLayout lang={params.lang} page={page} />;
}

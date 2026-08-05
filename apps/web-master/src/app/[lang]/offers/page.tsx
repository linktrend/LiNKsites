import { notFound } from "next/navigation";
import { getOfferIndex, getOfferPage } from "@/lib/pageService";
import { OfferIndexLayout } from "@/layouts/OfferIndexLayout";
import { OfferPageLayout } from "@/layouts/OfferPageLayout";
import { buildMetadata } from "@/lib/seo";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props) {
  const locale = normalizeLocale(params.lang);
  return buildMetadata(locale, "/offers", { title: "Offers" });
}

export default async function OfferIndexPage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const page = await getOfferIndex(locale, siteId);
  const publishedOffers = page.data.offers.filter((o: any) => o.status === "published");

  if (publishedOffers.length === 0) return notFound();

  // SEO RULE: If only 1 offer exists, render it directly at /offers
  if (publishedOffers.length === 1) {
    const singleOffer = publishedOffers[0];
    const offerPageData = await getOfferPage(locale, siteId, singleOffer.slug);
    return (
      <OfferPageLayout lang={locale} page={offerPageData as any} />
    );
  }

  // Otherwise, show grid layout
  return <OfferIndexLayout lang={locale} page={page} />;
}

import { notFound } from "next/navigation";
import { getOfferIndex, getOfferPage } from "@/lib/pageService";
import { OfferIndexLayout } from "@/layouts/OfferIndexLayout";
import { OfferPageLayout } from "@/layouts/OfferPageLayout";
import { buildMetadata } from "@/lib/seo";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  try {
    const { locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/offers` });
    return buildMetadata(locale, "/offers", { title: "Offers" });
  } catch {
    return { title: "Page unavailable", robots: { index: false, follow: false } };
  }
}

export default async function OfferIndexPage({ params }: Props) {
  const { lang } = await params;
  const { siteId, locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/offers` });
  const page = await getOfferIndex(locale, siteId);
  const publishedOffers = page.data.offers.filter((o: { status?: string }) => o.status === "published");
  if (publishedOffers.length === 0) return notFound();
  if (publishedOffers.length === 1) {
    const singleOffer = publishedOffers[0] as { slug: string };
    const offerPageData = await getOfferPage(locale, siteId, singleOffer.slug);
    return <OfferPageLayout lang={locale} page={offerPageData as never} />;
  }
  return <OfferIndexLayout lang={locale} page={page} />;
}

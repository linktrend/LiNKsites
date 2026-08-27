import { notFound, redirect } from "next/navigation";
import { getOfferPage } from "@/lib/pageService";
import { OfferPageLayout } from "@/layouts/OfferPageLayout";
import { buildMetadata } from "@/lib/seo/ssr-metadata";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";
import { listOffers } from "@/lib/repository/offers";

type Props = { params: Promise<{ lang: string; offerSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang, offerSlug } = await params;
  try {
    const { siteId, locale } = await requirePublicFamilyPage({
      lang,
      pathname: `/${lang}/offers/${offerSlug}`,
    });
    const page = await getOfferPage(locale, siteId, offerSlug);
    const offer = page.data.offer;
    if (!offer) return { title: "Page unavailable", robots: { index: false, follow: false } };
    const seo = (offer as { seo?: { title?: string; description?: string; canonicalUrl?: string } }).seo ?? {};
    return buildMetadata(locale, `/offers/${offerSlug}`, {
      title: seo.title ?? offer.title,
      description: seo.description,
      canonicalUrl: seo.canonicalUrl,
    });
  } catch {
    return { title: "Page unavailable", robots: { index: false, follow: false } };
  }
}

export default async function OfferPage({ params }: Props) {
  const { lang, offerSlug } = await params;
  const { siteId, locale } = await requirePublicFamilyPage({
    lang,
    pathname: `/${lang}/offers/${offerSlug}`,
  });
  const publishedOffers = (await listOffers({ siteId, locale })).filter(
    (o: { status?: string }) => o.status === "published",
  );
  if (publishedOffers.length === 1) {
    redirect(`/${locale}/offers`);
  }
  const page = await getOfferPage(locale, siteId, offerSlug);
  if (!page.data.offer) return notFound();
  return <OfferPageLayout lang={locale} page={page as never} />;
}

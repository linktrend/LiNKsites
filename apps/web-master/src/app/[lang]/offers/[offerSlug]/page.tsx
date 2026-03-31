import { notFound, redirect } from "next/navigation";
import { getOfferPage } from "@/lib/pageService";
import { OfferPageLayout } from "@/layouts/OfferPageLayout";
import { buildMetadata, buildProductJsonLd } from "@/lib/seo";
import { SEO_CONFIG, SITE_CONFIG, getSiteUrl } from "@/config";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";
import { listOffers } from "@/lib/repository/offers";

type Props = { params: { lang: string; offerSlug: string } };

export async function generateMetadata({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  try {
    const page = await getOfferPage(locale, siteId, params.offerSlug);
    const offer = page.data.offer;
    
    if (!offer) {
      return buildMetadata(locale, `/offers/${params.offerSlug}`);
    }

    const seo = (offer as any).seo ?? {};

    return buildMetadata(locale, `/offers/${params.offerSlug}`, {
      title: seo.title ?? offer.title,
      description: seo.description ?? offer.short_description ?? offer.description,
      keywords:
        seo.keywords && Array.isArray(seo.keywords)
          ? seo.keywords
          : [
              offer.title,
              offer.type ?? "offer",
              "business solution",
              "enterprise software",
              ...SEO_CONFIG.defaultKeywords,
            ].filter(Boolean) as string[],
      ogImage: (seo.ogImage as any)?.url ?? SEO_CONFIG.openGraph.images.default,
      canonicalUrl: seo.canonicalUrl,
    });
  } catch (error) {
    return buildMetadata(locale, `/offers/${params.offerSlug}`);
  }
}

export default async function OfferPage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const publishedOffers = (await listOffers({ siteId, locale })).filter(
    (o: any) => o.status === "published",
  );

  // SEO RULE: If only 1 offer exists, redirect to /offers
  if (publishedOffers.length === 1) {
    redirect(`/${locale}/offers`);
  }

  const page = await getOfferPage(locale, siteId, params.offerSlug);
  if (!page.data.offer) return notFound();
  
  const offer = page.data.offer;
  
  // Structured data for offer page
  const productJsonLd = buildProductJsonLd({
    name: offer.title,
    description: offer.short_description || offer.description || '',
    image: `${getSiteUrl()}${SEO_CONFIG.openGraph.images.default}`,
    url: `${getSiteUrl()}/${locale}/offers/${params.offerSlug}`,
    brand: SITE_CONFIG.siteName,
  });

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <OfferPageLayout lang={locale} page={page as any} />
    </>
  );
}

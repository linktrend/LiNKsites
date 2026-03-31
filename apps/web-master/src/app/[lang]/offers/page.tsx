import { getOfferIndex, getOfferPage } from "@/lib/pageService";
import { OfferIndexLayout } from "@/layouts/OfferIndexLayout";
import { OfferPageLayout } from "@/layouts/OfferPageLayout";
import { buildMetadata, buildProductJsonLd } from "@/lib/seo";
import { SEO_CONFIG, SITE_CONFIG, getSiteUrl } from "@/config";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props) {
  const locale = normalizeLocale(params.lang);
  return buildMetadata(locale, "/offers", {
    title: "Our Solutions",
    description: "Explore our comprehensive suite of AI-powered automation solutions. From workflow automation to business intelligence, find the perfect solution for your needs.",
    keywords: [
      "business solutions",
      "automation products",
      "enterprise software",
      "AI solutions",
      "workflow tools",
      ...SEO_CONFIG.defaultKeywords,
    ],
  });
}

export default async function OfferIndexPage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const page = await getOfferIndex(locale, siteId);
  const publishedOffers = page.data.offers.filter((o: any) => o.status === "published");

  // SEO RULE: If only 1 offer exists, render it directly at /offers
  if (publishedOffers.length === 1) {
    const singleOffer = publishedOffers[0];
    const offerPageData = await getOfferPage(locale, siteId, singleOffer.slug);
    
    // Structured data for single offer
    const productJsonLd = buildProductJsonLd({
      name: singleOffer.title,
      description: singleOffer.short_description || singleOffer.description || '',
      image: `${getSiteUrl()}${SEO_CONFIG.openGraph.images.default}`,
      url: `${getSiteUrl()}/${locale}/offers`,
      brand: SITE_CONFIG.siteName,
    });

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
        />
        <OfferPageLayout lang={locale} page={offerPageData as any} />
      </>
    );
  }

  // Otherwise, show grid layout
  return <OfferIndexLayout lang={locale} page={page} />;
}

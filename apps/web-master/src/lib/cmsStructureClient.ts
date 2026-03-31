import { dynamicOfferNavLabel } from "./offerLabel";
import { runtimeConfig } from "@/config/runtime";
import { normalizeLocale } from "@/lib/locale-context";
import { listOffers, CmsOffer } from "@/lib/repository/offers";
import { getNavigation, CmsNavigation } from "@/lib/repository/navigation";
import { CmsPage } from "@/lib/repository/pages";

export type SiteConfig = { id: string; primaryLanguage?: string };

export async function getStructuralData(): Promise<{
  site: SiteConfig;
  navigation: (CmsNavigation | null) & { offersLabel: string };
  offers: CmsOffer[];
}> {
  const locale = normalizeLocale("en");
  const site = { id: runtimeConfig.defaultSiteId, primaryLanguage: locale };
  const [offers, navigation] = await Promise.all([
    listOffers({ siteId: site.id, locale }),
    getNavigation({ siteId: site.id, locale, key: "primary" }),
  ]);
  
  // Compute offers label with CMS override support
  const offersLabel = dynamicOfferNavLabel(offers);
  
  return {
    site,
    navigation: navigation ? ({ ...navigation, offersLabel } as any) : ({ offersLabel } as any),
    offers,
  };
}

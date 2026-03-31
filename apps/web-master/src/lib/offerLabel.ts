import { CmsOffer } from "@/lib/repository/offers";

export type OfferMode = "product_only" | "service_only" | "mixed";

export interface OfferCounts {
  offer_count: number;
  product_count: number;
  service_count: number;
  offer_mode: OfferMode;
}

export function getOfferCounts(offers: CmsOffer[]): OfferCounts {
  const products = offers.filter((o) => (o as any).type === "product");
  const services = offers.filter((o) => (o as any).type === "service");

  return {
    offer_count: offers.length,
    product_count: products.length,
    service_count: services.length,
    offer_mode: getOfferMode(products.length, services.length),
  };
}

export function getOfferMode(productCount: number, serviceCount: number): OfferMode {
  if (productCount > 0 && serviceCount === 0) return "product_only";
  if (serviceCount > 0 && productCount === 0) return "service_only";
  if (productCount > 0 && serviceCount > 0) return "mixed";
  return "mixed"; // fallback
}

export function dynamicOfferNavLabel(offers: CmsOffer[], cmsOverride?: string): string {
  if (cmsOverride) return cmsOverride;

  const types = new Set(
    offers
      .map((o) => {
        const value = (o as { type?: string }).type;
        return typeof value === "string" ? value.toLowerCase() : undefined;
      })
      .filter((v): v is string => Boolean(v))
  );

  const hasProduct = types.has("product");
  const hasService = types.has("service");

  if (hasProduct && hasService) return "Products & Services";
  if (hasProduct) return "Products";
  if (hasService) return "Services";
  return "Products & Services";
}

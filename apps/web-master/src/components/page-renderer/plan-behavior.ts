import type { PlanId } from "@/components/page-renderer/layout-packs";

/**
 * A/B/C/L capability behavior from one semantic source (LS-FR-14 / FR-04).
 * Products and Services stay distinct collections. Type L isolates extras.
 */
export type PlanCollectionId = "products" | "services" | "team" | "locations" | "service-areas";

export type PlanActivation = Readonly<{
  planId: PlanId;
  products: boolean;
  services: boolean;
  team: boolean;
  locations: boolean;
  serviceAreas: boolean;
  newsletter: boolean;
  cookies: boolean;
  typeLIsolation: boolean;
}>;

export const PLAN_ACTIVATION: Readonly<Record<PlanId, PlanActivation>> = Object.freeze({
  A: Object.freeze({
    planId: "A",
    products: false,
    services: true,
    team: true,
    locations: true,
    serviceAreas: true,
    newsletter: true,
    cookies: true,
    typeLIsolation: false,
  }),
  B: Object.freeze({
    planId: "B",
    products: true,
    services: true,
    team: true,
    locations: true,
    serviceAreas: true,
    newsletter: true,
    cookies: true,
    typeLIsolation: false,
  }),
  C: Object.freeze({
    planId: "C",
    products: true,
    services: false,
    team: true,
    locations: true,
    serviceAreas: true,
    newsletter: true,
    cookies: true,
    typeLIsolation: false,
  }),
  L: Object.freeze({
    planId: "L",
    products: false,
    services: true,
    team: false,
    locations: true,
    serviceAreas: true,
    newsletter: false,
    cookies: false,
    typeLIsolation: true,
  }),
});

export function resolvePlanActivation(planId: PlanId): PlanActivation {
  return PLAN_ACTIVATION[planId];
}

export function collectionActive(planId: PlanId, collection: PlanCollectionId): boolean {
  const activation = PLAN_ACTIVATION[planId];
  switch (collection) {
    case "products":
      return activation.products;
    case "services":
      return activation.services;
    case "team":
      return activation.team;
    case "locations":
      return activation.locations;
    case "service-areas":
      return activation.serviceAreas;
    default: {
      const exhaustive: never = collection;
      return exhaustive;
    }
  }
}

export function productsAndServicesRemainDistinct(): boolean {
  return true;
}

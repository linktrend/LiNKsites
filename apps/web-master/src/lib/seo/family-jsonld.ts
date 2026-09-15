import {
  assertJsonLdMatchesVisibleFacts,
  collectVisibleFacts,
  projectVisibleJsonLd,
  type VisibleFacts,
} from "@/lib/seo/visible-facts";

export const FAMILY_JSON_LD_TYPES = Object.freeze({
  home: "WebSite",
  about: "Organization",
  contact: "LocalBusiness",
  legal: "WebPage",
  collection: "CollectionPage",
  detail: "WebPage",
  product: "Product",
  service: "Service",
  article: "Article",
  video: "VideoObject",
  faq: "FAQPage",
  person: "Person",
  location: "LocalBusiness",
  breadcrumb: "BreadcrumbList",
} as const);

export type FamilyJsonLdKind = keyof typeof FAMILY_JSON_LD_TYPES;

export function jsonLdForVisibleFamily(
  kind: FamilyJsonLdKind,
  facts: VisibleFacts,
): Record<string, unknown> {
  const type = FAMILY_JSON_LD_TYPES[kind];
  const node = projectVisibleJsonLd(type, facts);
  assertJsonLdMatchesVisibleFacts(node, facts);
  return node;
}

export function visibleFactsFromPage(input: {
  name?: unknown;
  url?: unknown;
  description?: unknown;
  headline?: unknown;
}): VisibleFacts {
  return collectVisibleFacts({
    name: input.name,
    url: input.url,
    description: input.description,
    headline: input.headline,
  });
}

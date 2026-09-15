import {
  A1_PROVIDER_SEMANTIC_MAP,
  REQUIRED_A1_PROVIDER_ROLES,
  SEMANTIC_COMPONENT_MAP,
  validateA1AdapterCoverage,
} from "@linksites/factory-catalog";

/** CMS and adapter payload types the consumer PageRenderer can mount. */
export const CONSUMER_RENDERABLE_BLOCK_TYPES = Object.freeze(
  new Set([
    "hero",
    "features",
    "pricing",
    "testimonials",
    "cta",
    "faq",
    "richText",
    "content",
    "media",
    "callout",
    "videoEmbed",
    "relatedContent",
    "testimonial",
    "trustFeed",
    "locations",
    "teamMembers",
    "offerShowcase",
    "caseStudies",
    "articles",
    "newsletter",
    "trust",
    "offers",
    "services",
    "products",
    "proof",
    "process",
    "team",
    "contact",
    "form",
    "localFacts",
    "availability",
    "breadcrumb",
    "metadata",
    "author",
    "answer",
    "references",
    "gallery",
    "hours",
    "resources",
    "specifications",
  ]),
);

export function consumerPayloadTypesFromAdapter(): readonly string[] {
  return Object.freeze([
    ...new Set(Object.values(A1_PROVIDER_SEMANTIC_MAP).map((row) => row.payloadBlockType)),
  ]);
}

/**
 * Full semantic adapter surface for LS-FR-13: every required A1 role and
 * library component ID must map to a consumer-owned payload type we render.
 */
export function assertConsumerAdapterSurface(): void {
  const coverage = validateA1AdapterCoverage(REQUIRED_A1_PROVIDER_ROLES);
  if (!coverage.complete) {
    throw new Error(
      `Incomplete provider semantic adapter; missing ${coverage.missing.join(", ")}`,
    );
  }
  for (const role of REQUIRED_A1_PROVIDER_ROLES) {
    const mapped = A1_PROVIDER_SEMANTIC_MAP[role];
    if (!CONSUMER_RENDERABLE_BLOCK_TYPES.has(mapped.payloadBlockType)) {
      throw new Error(
        `Unrendered required provider semantic "${role}" payload "${mapped.payloadBlockType}"`,
      );
    }
  }
  for (const [libraryComponentId, projection] of Object.entries(SEMANTIC_COMPONENT_MAP)) {
    if (!CONSUMER_RENDERABLE_BLOCK_TYPES.has(projection.payloadBlockType)) {
      throw new Error(
        `Unrendered required Library component ID "${libraryComponentId}"`,
      );
    }
  }
}

export function assertNotAllHeroProjection(payloadBlockTypes: readonly string[]): void {
  const types = payloadBlockTypes.filter(Boolean);
  if (types.length > 1 && types.every((type) => type === "hero")) {
    throw new Error("all-Hero projection is not admitted");
  }
}

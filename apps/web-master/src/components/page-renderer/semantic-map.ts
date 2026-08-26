import { mapProviderSemantic } from "@linksites/factory-catalog";

export class ProviderSemanticError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProviderSemanticError";
  }
}

const PAYLOAD_BLOCK_TYPES = new Set([
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
]);

export type MappedBlock = Readonly<{
  payloadBlockType: string;
  reactSymbol: string;
  providerRole?: string;
}>;

/**
 * Resolve a CMS/provider block to a consumer-owned payload type.
 * Unknown required provider roles fail closed and must not become public copy.
 */
export function mapBlockToPayloadType(block: {
  blockType?: unknown;
  providerRole?: unknown;
  semanticId?: unknown;
}): MappedBlock {
  const providerRole =
    typeof block.providerRole === "string" && block.providerRole.trim()
      ? block.providerRole
      : typeof block.semanticId === "string" && block.semanticId.trim()
        ? block.semanticId
        : undefined;

  if (providerRole) {
    const mapped = mapProviderSemantic(providerRole);
    if (!mapped.supported) {
      throw new ProviderSemanticError(`Unknown required provider semantic "${providerRole}"`);
    }
    return {
      payloadBlockType: mapped.mapping.payloadBlockType,
      reactSymbol: mapped.mapping.reactSymbol,
      providerRole,
    };
  }

  const blockType = typeof block.blockType === "string" ? block.blockType : "";
  if (!PAYLOAD_BLOCK_TYPES.has(blockType)) {
    throw new ProviderSemanticError(`Unknown required block type "${blockType || "unknown"}"`);
  }
  return { payloadBlockType: blockType, reactSymbol: "PageRenderer" };
}

import { mapProviderSemantic, SEMANTIC_COMPONENT_MAP } from "@linksites/factory-catalog";

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

function nonEmpty(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

/** LS-04 identity is `pageId:sectionId:libraryComponentId`, not an A1 provider role. */
function libraryComponentFromSemanticId(semanticId: string): string | undefined {
  const parts = semanticId.split(":").filter(Boolean);
  return parts.length >= 3 ? parts[parts.length - 1] : undefined;
}

/**
 * Resolve a CMS/provider block to a consumer-owned payload type.
 * Unknown required provider roles fail closed and must not become public copy.
 */
export function mapBlockToPayloadType(block: {
  blockType?: unknown;
  providerRole?: unknown;
  semanticId?: unknown;
  libraryComponentId?: unknown;
}): MappedBlock {
  const providerRole = nonEmpty(block.providerRole);

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

  const semanticId = nonEmpty(block.semanticId);
  const libraryComponentId =
    nonEmpty(block.libraryComponentId) ??
    (semanticId ? libraryComponentFromSemanticId(semanticId) : undefined);

  if (libraryComponentId) {
    const projection = SEMANTIC_COMPONENT_MAP[libraryComponentId];
    if (!projection) {
      throw new ProviderSemanticError(`Unknown required Library component ID "${libraryComponentId}"`);
    }
    return {
      payloadBlockType: projection.payloadBlockType,
      reactSymbol: projection.reactSymbol,
    };
  }

  const blockType = typeof block.blockType === "string" ? block.blockType : "";
  if (!PAYLOAD_BLOCK_TYPES.has(blockType)) {
    throw new ProviderSemanticError(`Unknown required block type "${blockType || "unknown"}"`);
  }
  return { payloadBlockType: blockType, reactSymbol: "PageRenderer" };
}

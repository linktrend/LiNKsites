/**
 * JSON-LD may emit only visible published facts (LS-FR-18 / ISS-22).
 * Invented authors, empty images, and schema fields that are not on the page
 * are omitted. A mismatch between JSON-LD and visible facts fails closed.
 */

export type VisibleFacts = Readonly<Record<string, string>>;

export class VisibleFactError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VisibleFactError";
  }
}

const isPresent = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function collectVisibleFacts(input: Record<string, unknown>): VisibleFacts {
  const facts: Record<string, string> = {};
  for (const [key, value] of Object.entries(input)) {
    if (isPresent(value)) facts[key] = value.trim();
  }
  return Object.freeze(facts);
}

export function projectVisibleJsonLd(
  type: string,
  facts: VisibleFacts,
  extra?: Record<string, unknown>,
): Record<string, unknown> {
  if (!type.trim()) throw new VisibleFactError("JSON-LD type is required");
  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type,
  };
  for (const [key, value] of Object.entries(facts)) {
    node[key] = value;
  }
  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value === undefined || value === null || value === "") continue;
      if (typeof value === "string" && !value.trim()) continue;
      node[key] = value;
    }
  }
  return node;
}

export function assertJsonLdMatchesVisibleFacts(
  jsonLd: Record<string, unknown>,
  facts: VisibleFacts,
  keys: readonly string[] = ["name", "url", "headline", "description"],
): void {
  for (const key of keys) {
    if (facts[key] === undefined) continue;
    if (jsonLd[key] !== facts[key]) {
      throw new VisibleFactError(`jsonLd.${key} must equal visibleFacts.${key}`);
    }
  }
  for (const key of ["name", "headline", "description", "image", "url"]) {
    const value = jsonLd[key];
    if (typeof value !== "string") continue;
    if (!value.trim()) {
      throw new VisibleFactError(`jsonLd.${key} is empty and is not a visible fact`);
    }
  }
}

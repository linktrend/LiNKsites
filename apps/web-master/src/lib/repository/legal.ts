import { payloadFind } from "@/lib/payload-client";
import { siteLocaleFilter } from "@/lib/repository/shared-filters";
import { ENV } from "@/config";

export interface CmsLegal {
  id: string;
  site: string;
  locale: string;
  slug: string;
  title: string;
  summary?: string;
  body?: string;
  status?: string;
  seo?: {
    title?: string;
    description?: string;
    ogImage?: any;
    canonicalUrl?: string;
    keywords?: string[];
  };
  reviewedAt?: string | null;
  reviewedBy?: { id?: string | number; name?: string; email?: string } | string | null;
}

type PolicyCollection = "terms-pages" | "privacy-pages" | "cookie-policy-pages";

type PolicyDoc = {
  id: string;
  site: string;
  locale: string;
  slug: string;
  title: string;
  status?: string;
  seo?: any;
  content?: Array<{ blockType?: string; content?: unknown }>;
  reviewedAt?: string;
  reviewedBy?: any;
};

const lexicalToPlainText = (value: unknown): string => {
  if (!value) return "";
  if (typeof value === "string") return value;
  const children = (value as any)?.root?.children ?? [];
  const parts: string[] = [];
  for (const node of children) {
    const text = (node?.children ?? []).map((c: any) => c?.text ?? "").join(" ").trim();
    if (text) parts.push(text);
  }
  return parts.join("\n\n");
};

const blocksToPlainText = (blocks: unknown): string => {
  if (!Array.isArray(blocks)) return "";
  const out: string[] = [];
  for (const block of blocks) {
    if (!block || typeof block !== "object") continue;
    const blockType = (block as any).blockType;
    if (blockType !== "richText") continue;
    const text = lexicalToPlainText((block as any).content);
    if (text) out.push(text);
  }
  return out.join("\n\n");
};

const slugToCollection = (slug: string): PolicyCollection => {
  if (slug === "privacy-policy") return "privacy-pages";
  if (slug === "cookie-policy") return "cookie-policy-pages";
  return "terms-pages";
};

export const getLegalBySlug = async ({
  siteId,
  locale,
  slug,
}: {
  siteId: string;
  locale: string;
  slug: string;
}): Promise<CmsLegal | null> => {
  if (ENV.LEGAL.LEGAL_CONTENT_API_URL) {
    try {
      const response = await fetch(
        `${ENV.LEGAL.LEGAL_CONTENT_API_URL.replace(/\/$/, "")}/${slug}?locale=${locale}`,
        { cache: "no-store" }
      );
      if (response.ok) {
        const data = await response.json();
        return {
          id: String(data.id ?? slug),
          site: siteId,
          locale,
          slug,
          title: data.title ?? slug,
          summary: data.summary ?? data.description,
          body: data.body ?? "",
          status: data.status,
          seo: data.seo,
          reviewedAt: data.reviewedAt ?? null,
          reviewedBy: data.reviewedBy ?? null,
        };
      }
    } catch {
      // fallback to CMS
    }
  }

  const collection = slugToCollection(slug);
  const where = {
    and: [...siteLocaleFilter(siteId, locale).and, { slug: { equals: slug } }],
  };

  const result = await payloadFind<PolicyDoc>({
    collection,
    where,
    limit: 1,
    depth: 1,
    locale,
    site: siteId,
  });
  const doc = result.docs[0];
  if (!doc) return null;

  return {
    id: String(doc.id),
    site: siteId,
    locale,
    slug,
    title: doc.title ?? slug,
    summary: doc.seo?.description,
    body: blocksToPlainText(doc.content),
    status: doc.status,
    seo: doc.seo,
    reviewedAt: doc.reviewedAt ?? null,
    reviewedBy: doc.reviewedBy ?? null,
  };
};

// Kept for compatibility with existing callers (sitemap no longer depends on it).
export const listLegal = async (): Promise<CmsLegal[]> => [];

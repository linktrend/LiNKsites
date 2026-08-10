import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SUPPORTED_LANGUAGES } from "@/config";
import { isPageVisibleToAudience } from "@/lib/public-surface";
import { payloadFind } from "@/lib/payload-client";
import { getSiteIdFromRequest } from "@/lib/site-context";

export const dynamic = "force-dynamic";

type PublicPageRecord = {
  slug?: string;
  locale?: string;
  previewEnvironment?: string | null;
};

/**
 * The sitemap is derived only from canonical public `pages` documents. It
 * never invents route entries and never includes private-preview or unknown
 * audience documents.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteId = await getSiteIdFromRequest().catch(() => null);
  if (!siteId) return [];

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const baseUrl = host ? `${proto}://${host}` : "https://example.com";

  const result = await payloadFind<PublicPageRecord>({
    collection: "pages",
    where: {
      and: [
        { site: { equals: siteId } },
        { status: { equals: "published" } },
      ],
    },
    limit: 100,
    depth: 0,
    site: siteId,
  }).catch(() => null);

  const pages = (result?.docs ?? []).filter((page) =>
    Boolean(page.slug && page.locale && SUPPORTED_LANGUAGES.includes(page.locale as (typeof SUPPORTED_LANGUAGES)[number])) &&
    isPageVisibleToAudience(page, "public"),
  );

  return pages.map((page) => ({
    url: `${baseUrl}/${page.locale}/${page.slug === "home" ? "" : page.slug}`,
    changeFrequency: "weekly",
    priority: page.slug === "home" ? 1 : 0.7,
  }));
}

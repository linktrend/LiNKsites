import { MetadataRoute } from "next";

import { loadPublishedAuthority } from "@/lib/seo/published-catalog";
import { publishedSitemap } from "@/lib/seo/published-authority";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const authority = await loadPublishedAuthority();
  return publishedSitemap(authority).map((entry) => ({
    url: entry.url,
    lastModified: entry.lastModified,
    changeFrequency: "weekly",
    priority: entry.url.endsWith("/en") || entry.url.endsWith("/en/") ? 1 : 0.7,
  }));
}

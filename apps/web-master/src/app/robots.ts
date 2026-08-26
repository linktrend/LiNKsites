import { MetadataRoute } from "next";

import { loadPublishedAuthority } from "@/lib/seo/published-catalog";
import { publishedRobots } from "@/lib/seo/published-authority";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const authority = await loadPublishedAuthority();
  const robots = publishedRobots(authority);
  if (!robots.allowCrawling) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...robots.disallow],
      },
    ],
    sitemap: robots.sitemap,
    host: authority.baseUrl,
  };
}

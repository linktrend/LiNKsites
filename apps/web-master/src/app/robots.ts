import { MetadataRoute } from "next";

import { loadPublishedAuthority } from "@/lib/seo/published-catalog";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const authority = await loadPublishedAuthority();
  if (!authority.robots.allowCrawling) {
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
        disallow: [...authority.robots.disallow],
      },
    ],
    sitemap: authority.robots.sitemap,
    host: authority.baseUrl,
  };
}

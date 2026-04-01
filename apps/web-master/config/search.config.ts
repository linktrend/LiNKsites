import { getSiteUrl } from "./site.config";

export const CRAWL_POLICY = {
  allow: ["/"],
  disallow: ["/api/", "/admin/", "/_next/", "/private/"],
  aiBotsDisallow: ["GPTBot", "ChatGPT-User"],
  sitemapPath: "/sitemap.xml",
  llmsHighlights: [
    "/",
    "/offers",
    "/resources",
    "/resources/articles",
    "/resources/videos",
    "/resources/cases",
    "/resources/faq",
    "/about",
    "/contact",
    "/legal/privacy-policy",
    "/legal/terms-of-use",
    "/legal/cookie-policy",
  ],
} as const;

export const buildLlmsTxt = (baseUrl = getSiteUrl()): string => {
  const lines: string[] = [];
  lines.push("# llms.txt");
  lines.push(`# Generated: ${new Date().toISOString()}`);
  lines.push(`# Base: ${baseUrl}`);
  lines.push("");
  lines.push("User-agent: *");
  for (const allow of CRAWL_POLICY.allow) {
    lines.push(`Allow: ${allow}`);
  }
  for (const disallow of CRAWL_POLICY.disallow) {
    lines.push(`Disallow: ${disallow}`);
  }
  for (const bot of CRAWL_POLICY.aiBotsDisallow) {
    lines.push("");
    lines.push(`User-agent: ${bot}`);
    lines.push("Disallow: /");
  }
  lines.push("");
  lines.push("# High-signal entry points");
  for (const path of CRAWL_POLICY.llmsHighlights) {
    lines.push(`${baseUrl}${path}`);
  }
  lines.push("");
  lines.push(`# Sitemap: ${baseUrl}${CRAWL_POLICY.sitemapPath}`);
  return lines.join("\n");
};

export default {
  CRAWL_POLICY,
  buildLlmsTxt,
} as const;

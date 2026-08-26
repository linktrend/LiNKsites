/**
 * One published discoverability authority for sitemap, canonical, hreflang,
 * robots, llms.txt and AI projections (LS-FR-19 / ISS-22).
 *
 * Drafts, private-preview documents, redirects and retired paths are excluded
 * from every projection. Tenant/locale/entitlement boundaries stay identical
 * across those surfaces.
 */

export type DiscoverabilityStatus = "published" | "draft" | "private" | "redirect" | "retired";

export type CatalogRecord = Readonly<{
  family: string;
  locale: string;
  path: string;
  status: DiscoverabilityStatus;
  lastModified?: string;
}>;

export type PublishedUrl = Readonly<{
  family: string;
  locale: string;
  path: string;
  canonical: string;
  lastModified?: string;
}>;

export type PublishedAuthority = Readonly<{
  schemaVersion: "ls07-published-authority/v1";
  baseUrl: string;
  defaultLocale: string;
  publicEligible: boolean;
  production: boolean;
  urls: readonly PublishedUrl[];
  hreflang: Readonly<Record<string, Readonly<Record<string, string>>>>;
  sitemap: readonly { url: string; lastModified?: string }[];
  robots: Readonly<{
    allowCrawling: boolean;
    sitemap?: string;
    disallow: readonly string[];
  }>;
  llmsTxt: string;
  aiProjection: readonly { locale: string; path: string; canonical: string; family: string }[];
}>;

export class PublishedAuthorityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PublishedAuthorityError";
  }
}

const normalizeBaseUrl = (value: string): string => value.replace(/\/+$/, "");

const normalizePath = (value: string): string => {
  const trimmed = value.trim();
  if (!trimmed) return "/";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, "") || "/";
};

const localeNeutralKey = (locale: string, path: string): string => {
  const normalized = normalizePath(path);
  const prefix = `/${locale}`;
  if (normalized === prefix) return "/";
  if (normalized.startsWith(`${prefix}/`)) return normalized.slice(prefix.length) || "/";
  return normalized;
};

export function isDiscoverable(record: CatalogRecord): boolean {
  return record.status === "published";
}

export function assertNoLeak(records: readonly CatalogRecord[], urls: readonly PublishedUrl[]): void {
  const publishedPaths = new Set(urls.map((url) => `${url.locale}:${url.path}`));
  for (const record of records) {
    if (isDiscoverable(record)) continue;
    const leaked = publishedPaths.has(`${record.locale}:${normalizePath(record.path)}`);
    if (leaked) {
      throw new PublishedAuthorityError(
        `non-published ${record.status} path leaked into discoverability: ${record.path}`,
      );
    }
  }
}

export function projectPublishedAuthority(input: {
  baseUrl: string;
  locales: readonly string[];
  defaultLocale: string;
  records: readonly CatalogRecord[];
  publicEligible: boolean;
  production: boolean;
}): PublishedAuthority {
  const baseUrl = normalizeBaseUrl(input.baseUrl);
  if (!/^https?:\/\//.test(baseUrl)) {
    throw new PublishedAuthorityError("baseUrl must be an absolute http(s) origin");
  }
  if (!input.locales.includes(input.defaultLocale)) {
    throw new PublishedAuthorityError("defaultLocale must be included in locales");
  }

  const urls: PublishedUrl[] = [];
  if (input.publicEligible) {
    for (const record of input.records) {
      if (!isDiscoverable(record)) continue;
      if (!input.locales.includes(record.locale)) continue;
      const path = normalizePath(record.path);
      urls.push({
        family: record.family,
        locale: record.locale,
        path,
        canonical: `${baseUrl}${path}`,
        lastModified: record.lastModified,
      });
    }
  }

  urls.sort((a, b) => a.canonical.localeCompare(b.canonical));
  assertNoLeak(input.records, urls);

  const grouped = new Map<string, PublishedUrl[]>();
  for (const url of urls) {
    const key = localeNeutralKey(url.locale, url.path);
    const list = grouped.get(key) ?? [];
    list.push(url);
    grouped.set(key, list);
  }

  const hreflang: Record<string, Record<string, string>> = {};
  for (const [key, list] of grouped) {
    const languages: Record<string, string> = {};
    for (const item of list) languages[item.locale] = item.canonical;
    const defaultItem = list.find((item) => item.locale === input.defaultLocale) ?? list[0];
    if (defaultItem) languages["x-default"] = defaultItem.canonical;
    hreflang[key] = languages;
  }

  const allowCrawling = Boolean(input.production && input.publicEligible);
  const sitemap = allowCrawling ? urls.map((url) => ({ url: url.canonical, lastModified: url.lastModified })) : [];
  const robots = allowCrawling
    ? { allowCrawling: true, sitemap: `${baseUrl}/sitemap.xml`, disallow: ["/api/", "/admin/", "/_next/", "/private/"] as const }
    : { allowCrawling: false, disallow: ["/"] as const };

  const llmsLines = [
    "# llms.txt",
    `# Base: ${baseUrl}`,
    "",
    "User-agent: *",
    allowCrawling ? "Allow: /" : "Disallow: /",
    ...robots.disallow.filter((rule) => rule !== "/").flatMap((rule) => [`Disallow: ${rule}`]),
    "",
    "# Published indexable URLs (same authority as sitemap)",
    ...(allowCrawling ? urls.map((url) => url.canonical) : ["# none: not public-eligible or not production"]),
    "",
    allowCrawling ? `# Sitemap: ${baseUrl}/sitemap.xml` : "# Sitemap: omitted",
  ];

  const aiProjection = allowCrawling
    ? urls.map((url) => ({ locale: url.locale, path: url.path, canonical: url.canonical, family: url.family }))
    : [];

  return Object.freeze({
    schemaVersion: "ls07-published-authority/v1",
    baseUrl,
    defaultLocale: input.defaultLocale,
    publicEligible: input.publicEligible,
    production: input.production,
    urls: Object.freeze(urls),
    hreflang: Object.freeze(hreflang),
    sitemap: Object.freeze(sitemap),
    robots: Object.freeze(robots),
    llmsTxt: llmsLines.join("\n"),
    aiProjection: Object.freeze(aiProjection),
  });
}

export function hreflangForPath(authority: PublishedAuthority, locale: string, path: string): Readonly<Record<string, string>> {
  const key = localeNeutralKey(locale, path);
  return authority.hreflang[key] ?? {};
}

import { runtimeConfig } from "@/config/runtime";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const isMockProvider = (process.env.NEXT_PUBLIC_CMS_PROVIDER ?? "mock") !== "payload";

type MockPayloadData = {
  site?: { id?: string };
  navigation?: Record<string, Array<{ label?: string; slug?: string }>>;
  offers?: unknown[];
  resources?: unknown[];
  videos?: unknown[];
  about?: unknown;
  contact?: unknown;
  legal?: unknown[];
  faq?: unknown[];
  cases?: unknown[];
  contactForms?: unknown[];
  pricing?: unknown;
};

let mockPayloadCache: MockPayloadData | null = null;

const loadMockPayload = (): MockPayloadData | null => {
  if (mockPayloadCache) return mockPayloadCache;
  try {
    const filePath = join(process.cwd(), "data", "cmsPayload.json");
    const raw = readFileSync(filePath, "utf8");
    mockPayloadCache = JSON.parse(raw) as MockPayloadData;
    return mockPayloadCache;
  } catch {
    return null;
  }
};

const withSiteLocale = <T extends Record<string, any>>(
  docs: T[],
  site?: string,
  locale?: string,
): T[] => {
  return docs.map((doc) => ({
    ...doc,
    ...(site ? { site } : {}),
    ...(locale ? { locale } : {}),
  }));
};

const matchesEquals = (doc: Record<string, any>, field: string, value: unknown): boolean => {
  if (value === undefined) return true;
  return doc[field] === value;
};

const mockPayloadFind = async <T>({
  collection,
  where,
  limit,
  locale,
  site,
}: {
  collection: string;
  where?: Record<string, unknown>;
  limit?: number;
  locale?: string;
  site?: string;
}): Promise<{
  docs: T[];
  page: number;
  totalDocs: number;
  totalPages: number;
  limit: number;
}> => {
  const mock = loadMockPayload();
  const safeLimit = typeof limit === "number" ? limit : 100;

  if (!mock) {
    return { docs: [], page: 1, totalDocs: 0, totalPages: 1, limit: safeLimit };
  }

  const siteId = site || mock.site?.id || "company-site";
  const andFilters = Array.isArray((where as any)?.and) ? (where as any).and : [];
  const navKeyFilter = andFilters.find((f: any) => f?.navKey?.equals)?.navKey?.equals;

  if (collection === "navigation") {
    const nav = mock.navigation ?? {};
    const items = Array.isArray(nav[navKeyFilter]) ? (nav[navKeyFilter] as any[]) : [];
    const docs = items.map((item, index) => ({
      id: `${navKeyFilter}-${index + 1}`,
      label: item.label ?? "",
      url: item.slug ?? "#",
      external: false,
      order: index,
      navKey: navKeyFilter,
      site: siteId,
      locale,
    }));
    return {
      docs: withSiteLocale(docs as any, siteId, locale) as T[],
      page: 1,
      totalDocs: docs.length,
      totalPages: 1,
      limit: safeLimit,
    };
  }

  if (collection === "site-domains") {
    const hostnameFilter = (where as any)?.hostname?.equals as string | undefined;
    const doc = hostnameFilter
      ? { id: "localhost-domain", hostname: hostnameFilter, site: siteId, primary: true }
      : { id: "localhost-domain", hostname: "localhost", site: siteId, primary: true };
    return {
      docs: [doc as any] as T[],
      page: 1,
      totalDocs: 1,
      totalPages: 1,
      limit: safeLimit,
    };
  }

  const collectionsMap: Record<string, unknown[]> = {
    offers: mock.offers ?? [],
    resources: mock.resources ?? [],
    videos: mock.videos ?? [],
    legal: mock.legal ?? [],
    faq: mock.faq ?? [],
    cases: mock.cases ?? [],
    "contact-forms": mock.contactForms ?? [],
  };

  if (collection in collectionsMap) {
    const items = collectionsMap[collection] ?? [];
    const slugFilter = andFilters.find((f: any) => f?.slug?.equals)?.slug?.equals;
    const statusFilter = andFilters.find((f: any) => f?.status?.equals)?.status?.equals;
    const filtered = (items as any[]).filter((doc) => {
      if (slugFilter && !matchesEquals(doc, "slug", slugFilter)) return false;
      if (statusFilter && doc.status && !matchesEquals(doc, "status", statusFilter)) return false;
      return true;
    });
    return {
      docs: withSiteLocale(filtered as any, siteId, locale) as T[],
      page: 1,
      totalDocs: filtered.length,
      totalPages: 1,
      limit: safeLimit,
    };
  }

  return { docs: [], page: 1, totalDocs: 0, totalPages: 1, limit: safeLimit };
};

type FetchArgs = {
  path: string;
  init?: RequestInit;
};

const buildUrl = (path: string) => {
  const normalizedPath = path.startsWith("/")
    ? path.slice(1)
    : path;
  return new URL(normalizedPath, runtimeConfig.payloadBaseUrl).toString();
};

const withAuthHeader = (headers: HeadersInit = {}): HeadersInit => {
  if (!runtimeConfig.payloadApiKey) return headers;
  return {
    ...headers,
    Authorization: `Bearer ${runtimeConfig.payloadApiKey}`,
  };
};

/**
 * Payload's REST API expects bracket-style query params for filters, e.g.
 * `where[slug][equals]=about`. The previous JSON-string approach was ignored
 * by the API, which is why our pages were always returning the first entry
 * (Terms). This flattens a `where` object into the bracketed params Payload
 * understands.
 */
const appendWhereParams = (
  searchParams: URLSearchParams,
  value: unknown,
  path: (string | number)[] = [],
) => {
  if (value === undefined || value === null) return;

  if (Array.isArray(value)) {
    value.forEach((v, i) => appendWhereParams(searchParams, v, [...path, i]));
    return;
  }

  if (typeof value === "object") {
    Object.entries(value as Record<string, unknown>).forEach(([k, v]) =>
      appendWhereParams(searchParams, v, [...path, k]),
    );
    return;
  }

  // Reduce over a (string | number)[] path but ensure the final key is a string.
  const key = path.reduce<string>((acc, part) => `${acc}[${part}]`, "where");
  searchParams.append(key, String(value));
};

export const payloadFetch = async <T>({ path, init }: FetchArgs): Promise<T> => {
  if (isMockProvider) {
    throw new Error(`Payload fetch blocked in mock mode for ${path}`);
  }
  const response = await fetch(buildUrl(path), {
    cache: "no-store",
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...withAuthHeader(init?.headers),
    },
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Payload request failed (${response.status} ${response.statusText}) for ${path}${
        body ? `: ${body}` : ""
      }`,
    );
  }

  return response.json() as Promise<T>;
};

type FindArgs = {
  collection: string;
  where?: Record<string, unknown>;
  depth?: number;
  limit?: number;
  page?: number;
  locale?: string;
  draft?: boolean;
  /**
   * Required for public (unauthenticated) reads against the LiNKsites CMS.
   * The CMS access layer scopes public reads by this query param.
   */
  site?: string;
};

export const payloadFind = async <T>({
  collection,
  where,
  depth,
  limit,
  page,
  locale,
  draft,
  site,
}: FindArgs): Promise<{
  docs: T[];
  page: number;
  totalDocs: number;
  totalPages: number;
  limit: number;
}> => {
  if (isMockProvider) {
    return mockPayloadFind<T>({ collection, where, limit, locale, site });
  }
  const url = new URL(`api/${collection}`, runtimeConfig.payloadBaseUrl);

  if (typeof depth === "number") url.searchParams.set("depth", String(depth));
  if (typeof limit === "number") url.searchParams.set("limit", String(limit));
  if (typeof page === "number") url.searchParams.set("page", String(page));
  if (locale) url.searchParams.set("locale", locale);
  if (typeof draft === "boolean") url.searchParams.set("draft", String(draft));
  if (site) url.searchParams.set("site", site);
  if (where) {
    appendWhereParams(url.searchParams, where);
  }

  return payloadFetch({
    path: url.toString(),
  });
};

export const payloadReadGlobal = async <T>(
  slug: string,
  locale?: string,
  site?: string,
): Promise<T> => {
  if (isMockProvider) {
    const mock = loadMockPayload();
    if (!mock) return null as T;
    const globals: Record<string, unknown> = {
      about: mock.about ?? null,
      contact: mock.contact ?? null,
    };
    return (globals[slug] ?? null) as T;
  }
  const url = new URL(`api/globals/${slug}`, runtimeConfig.payloadBaseUrl);
  if (locale) url.searchParams.set("locale", locale);
  if (site) url.searchParams.set("site", site);

  return payloadFetch({ path: url.toString() });
};

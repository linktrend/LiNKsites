import { runtimeConfig } from "@/config/runtime";

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
  const url = new URL(`api/globals/${slug}`, runtimeConfig.payloadBaseUrl);
  if (locale) url.searchParams.set("locale", locale);
  if (site) url.searchParams.set("site", site);

  return payloadFetch({ path: url.toString() });
};

import { headers } from "next/headers";

import { runtimeConfig } from "@/config/runtime";
import { payloadFind } from "@/lib/payload-client";

type SiteDomainDoc = {
  id: string;
  hostname: string;
  site: string | { id?: string };
  primary?: boolean;
};

const normalizeHost = (host: string): string => {
  const trimmed = host.trim().toLowerCase();
  // In local dev, host header is usually "localhost:3000". The CMS stores
  // hostnames without port, so strip the port to make local mapping work.
  return trimmed.replace(/:\d+$/, "");
};

const TENANT_CACHE_TTL_MS = 5 * 60 * 1000;
const tenantCache = new Map<string, { siteId: string; expiresAt: number }>();

const cacheGet = (host: string): string | null => {
  const entry = tenantCache.get(host);
  if (!entry) return null;
  if (Date.now() >= entry.expiresAt) {
    tenantCache.delete(host);
    return null;
  }
  return entry.siteId;
};

const cacheSet = (host: string, siteId: string) => {
  tenantCache.set(host, { siteId, expiresAt: Date.now() + TENANT_CACHE_TTL_MS });
};

export const getHostnameFromRequest = (): string => {
  return normalizeHost(headers().get("host") ?? "");
};

export const resolveSiteIdByHostname = async (hostname: string): Promise<string | null> => {
  const normalized = normalizeHost(hostname);
  if (!normalized) return null;

  const cached = cacheGet(normalized);
  if (cached) return cached;

  const result = await payloadFind<SiteDomainDoc>({
    collection: "site-domains",
    where: { hostname: { equals: normalized } },
    limit: 1,
    depth: 1,
  }).catch(() => null);

  const doc = result?.docs?.[0];
  const siteId =
    typeof doc?.site === "string"
      ? doc.site
      : typeof doc?.site === "object" && doc.site && typeof (doc.site as any).id === "string"
        ? String((doc.site as any).id)
        : null;

  if (siteId) cacheSet(normalized, siteId);
  return siteId;
};

/**
 * Resolves the current tenant siteId for this request.
 *
 * Resolution priority:
 * 1) Dedicated deployments: `SITE_ID` env var locks the frontend to one site.
 * 2) Hostname mapping (site-domains collection).
 * 3) DEFAULT_SITE_ID env var fallback (useful for local dev).
 */
export const getSiteIdFromRequest = async (): Promise<string> => {
  if (runtimeConfig.dedicatedSiteId) return runtimeConfig.dedicatedSiteId;

  const host = getHostnameFromRequest();
  const resolved = await resolveSiteIdByHostname(host);
  if (resolved) return resolved;

  return runtimeConfig.defaultSiteId;
};

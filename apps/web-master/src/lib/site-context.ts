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
const cmsProvider = process.env.NEXT_PUBLIC_CMS_PROVIDER ?? "payload";
const isFixtureProvider = cmsProvider === "fixture";

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

export const getHostnameFromRequest = async (): Promise<string> => {
  const headerList = await headers();
  return normalizeHost(headerList.get("host") ?? "");
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

export class SiteResolutionError extends Error {
  constructor(hostname: string) {
    super(`No published site mapping exists for host "${hostname || "unknown"}".`);
    this.name = "SiteResolutionError";
  }
}

/**
 * Resolves the current tenant siteId for this request.
 *
 * Resolution priority:
 * 1) Dedicated deployments: `SITE_ID` env var locks the frontend to one site.
 * 2) Hostname mapping (site-domains collection).
 *
 * Shared Payload deployments deliberately have no DEFAULT_SITE_ID fallback:
 * an unknown host must not receive another tenant's content. Local fixture
 * mode uses DEFAULT_SITE_ID explicitly, and dedicated deployments use SITE_ID.
 */
export const getSiteIdFromRequest = async (): Promise<string> => {
  if (runtimeConfig.dedicatedSiteId) return runtimeConfig.dedicatedSiteId;
  if (isFixtureProvider) {
    if (!runtimeConfig.defaultSiteId) throw new Error("DEFAULT_SITE_ID is required in fixture mode.");
    return runtimeConfig.defaultSiteId;
  }

  const host = await getHostnameFromRequest();
  const resolved = await resolveSiteIdByHostname(host);
  if (resolved) return resolved;

  throw new SiteResolutionError(host);
};

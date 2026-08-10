import { headers } from "next/headers";

import { runtimeConfig } from "@/config/runtime";
import { payloadFind } from "@/lib/payload-client";
import { countPublicPages, isPublicSiteEligible } from "@/lib/public-surface";

type SiteDomainDoc = {
  id: string;
  hostname: string;
  site: string | number | { id?: string | number };
  primary?: boolean;
};

type PublicSiteDoc = {
  id: string | number;
  status?: string;
};

const normalizeHost = (host: string): string => {
  const trimmed = host.trim().toLowerCase();
  // In local dev, host header is usually "localhost:3000". The CMS stores
  // hostnames without port, so strip the port to make local mapping work.
  return trimmed.replace(/:\d+$/, "");
};

export const getHostnameFromRequest = async (): Promise<string> => {
  const headerList = await headers();
  return normalizeHost(headerList.get("host") ?? headerList.get("x-forwarded-host") ?? "");
};

const extractSiteId = (site: SiteDomainDoc["site"]): string | null => {
  if (typeof site === "string" || typeof site === "number") return String(site) || null;
  return site?.id !== undefined && site.id !== null && String(site.id) ? String(site.id) : null;
};

const hasPublicPage = async (siteId: string): Promise<boolean> => {
  const result = await payloadFind<{ previewEnvironment?: string | null }>({
    collection: "pages",
    where: {
      and: [
        { site: { equals: siteId } },
        { status: { equals: "published" } },
      ],
    },
    // Do not use limit: 1 here: a private-preview page may sort ahead of a
    // public page, and must never be enough to make the site public.
    limit: 100,
    depth: 0,
    site: siteId,
  });

  return countPublicPages(result.docs) > 0;
};

const resolvePublicSite = async (siteId: string): Promise<string | null> => {
  if (!siteId) return null;

  try {
    const [siteResult, publicPage] = await Promise.all([
      payloadFind<PublicSiteDoc>({
        collection: "sites",
        where: { id: { equals: siteId } },
        limit: 1,
        depth: 0,
        select: ["id", "status"],
      }),
      hasPublicPage(siteId),
    ]);
    const site = siteResult.docs[0];
    return isPublicSiteEligible(site, publicPage ? 1 : 0) ? siteId : null;
  } catch {
    // Tenant resolution is a security boundary. CMS errors cannot fall back
    // to a configured or fixture-derived tenant.
    return null;
  }
};

const resolveMappedSiteIdByHostname = async (hostname: string): Promise<string | null> => {
  const normalized = normalizeHost(hostname);
  if (!normalized) return null;

  const result = await payloadFind<SiteDomainDoc>({
    collection: "site-domains",
    where: { hostname: { equals: normalized } },
    limit: 1,
    depth: 0,
  }).catch(() => null);

  const siteId = result?.docs?.[0] ? extractSiteId(result.docs[0].site) : null;
  return siteId;
};

export const resolveSiteIdByHostname = async (hostname: string): Promise<string | null> => {
  const siteId = await resolveMappedSiteIdByHostname(hostname);
  return siteId ? resolvePublicSite(siteId) : null;
};

const resolvePreviewSite = async (siteId: string): Promise<string | null> => {
  if (!siteId) return null;
  try {
    const result = await payloadFind<PublicSiteDoc>({
      collection: "sites",
      where: { id: { equals: siteId } },
      limit: 1,
      depth: 0,
      select: ["id", "status"],
    });
    const site = result.docs[0];
    // The token wall authorizes this separate preview path. It still needs a
    // real mapped CMS site and must reject archived/unknown tenants; it does
    // not use public-page presence as lifecycle authority.
    return site?.id && ["draft", "active", "published"].includes(site.status ?? "")
      ? String(site.id)
      : null;
  } catch {
    return null;
  }
};

export class SiteResolutionError extends Error {
  constructor(hostname: string) {
    super(`No published and lifecycle-eligible site mapping exists for host "${hostname || "unknown"}".`);
    this.name = "SiteResolutionError";
  }
}

/**
 * Resolves the current public tenant for this request.
 *
 * Every path requires an explicit CMS site record with `status: published`
 * and at least one published page. Fixture mode follows the same hostname
 * mapping path; it never turns an ambient default or fixture data into a tenant.
 * Dedicated SITE_ID deployments still require the same eligibility proof.
 */
export const getSiteIdFromRequest = async (): Promise<string> => {
  if (runtimeConfig.dedicatedSiteId) {
    const resolved = await resolvePublicSite(runtimeConfig.dedicatedSiteId);
    if (resolved) return resolved;
    throw new SiteResolutionError("SITE_ID");
  }

  const host = await getHostnameFromRequest();
  const resolved = await resolveSiteIdByHostname(host);
  if (resolved) return resolved;

  throw new SiteResolutionError(host);
};

/**
 * Resolves an explicitly mapped tenant for the token-gated preview route.
 * This intentionally does not grant public/lifecycle eligibility to a
 * private-only site; normal routes continue to use getSiteIdFromRequest().
 */
export const getPreviewSiteIdFromRequest = async (): Promise<string> => {
  if (runtimeConfig.dedicatedSiteId) {
    const resolved = await resolvePreviewSite(runtimeConfig.dedicatedSiteId);
    if (resolved) return resolved;
    throw new SiteResolutionError("SITE_ID");
  }

  const host = await getHostnameFromRequest();
  const mapped = await resolveMappedSiteIdByHostname(host);
  const resolved = mapped ? await resolvePreviewSite(mapped) : null;
  if (resolved) return resolved;
  throw new SiteResolutionError(host);
};

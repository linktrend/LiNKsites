import { headers } from "next/headers";

import { runtimeConfig } from "@/config/runtime";
import { payloadFind } from "@/lib/payload-client";
import { isPublicSiteEligible } from "@/lib/public-surface";

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
  return normalizeHost(headerList.get("host") ?? "");
};

const extractSiteId = (site: SiteDomainDoc["site"]): string | null => {
  if (typeof site === "string" || typeof site === "number") return String(site) || null;
  return site?.id !== undefined && site.id !== null && String(site.id) ? String(site.id) : null;
};

const hasPublishedPage = async (siteId: string): Promise<boolean> => {
  const result = await payloadFind<unknown>({
    collection: "pages",
    where: {
      and: [
        { site: { equals: siteId } },
        { status: { equals: "published" } },
      ],
    },
    limit: 1,
    depth: 0,
    site: siteId,
  });

  return result.docs.length > 0;
};

const resolvePublicSite = async (siteId: string): Promise<string | null> => {
  if (!siteId) return null;

  try {
    const [siteResult, publishedPage] = await Promise.all([
      payloadFind<PublicSiteDoc>({
        collection: "sites",
        where: { id: { equals: siteId } },
        limit: 1,
        depth: 0,
        select: ["id", "status"],
      }),
      hasPublishedPage(siteId),
    ]);
    const site = siteResult.docs[0];
    return isPublicSiteEligible(site, publishedPage ? 1 : 0) ? siteId : null;
  } catch {
    // Tenant resolution is a security boundary. CMS errors cannot fall back
    // to a configured or fixture-derived tenant.
    return null;
  }
};

export const resolveSiteIdByHostname = async (hostname: string): Promise<string | null> => {
  const normalized = normalizeHost(hostname);
  if (!normalized) return null;

  const result = await payloadFind<SiteDomainDoc>({
    collection: "site-domains",
    where: { hostname: { equals: normalized } },
    limit: 1,
    depth: 0,
  }).catch(() => null);

  const siteId = result?.docs?.[0] ? extractSiteId(result.docs[0].site) : null;
  return siteId ? resolvePublicSite(siteId) : null;
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

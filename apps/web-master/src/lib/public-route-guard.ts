import { notFound, redirect } from "next/navigation";
import { NextResponse } from "next/server";

import { getSiteIdFromRequest } from "@/lib/site-context";
import {
  resolveFamilyRoute,
  tenantSafeWhere,
  type FamilyId,
  type FamilyRouteDecision,
} from "@/lib/routes";
import type { SupportedLanguage } from "@/config";

/**
 * Public content routes must share the same host-to-published-site proof as
 * ordinary page rendering. A missing, private-only, or otherwise invalid
 * tenant is deliberately indistinguishable from an absent public route.
 */
export const getPublicSiteIdOrNull = async (): Promise<string | null> => {
  try {
    return await getSiteIdFromRequest();
  } catch {
    return null;
  }
};

export const publicRouteNotFound = (): NextResponse =>
  new NextResponse("Not Found", {
    status: 404,
    headers: {
      "cache-control": "private, no-store, max-age=0",
      "x-content-type-options": "nosniff",
    },
  });

export type PublicFamilyContext = Readonly<{
  siteId: string;
  locale: SupportedLanguage;
  family: FamilyId;
  pathname: string;
}>;

export async function requirePublicFamilyPage(input: {
  lang: string;
  pathname: string;
}): Promise<PublicFamilyContext> {
  const siteId = await getPublicSiteIdOrNull();
  if (!siteId) notFound();

  const decision: FamilyRouteDecision = resolveFamilyRoute(input.pathname);
  if (decision.kind === "redirect") {
    redirect(decision.to);
  }
  if (decision.kind !== "ok") {
    notFound();
  }

  const tenant = tenantSafeWhere(siteId, decision.locale);
  if (decision.locale !== input.lang) {
    notFound();
  }

  return {
    siteId: tenant.siteId,
    locale: decision.locale,
    family: decision.family,
    pathname: decision.pathname,
  };
}

export function familyFailureResponse(decision: FamilyRouteDecision): NextResponse {
  if (decision.kind === "ok") {
    throw new Error("familyFailureResponse called for a successful decision");
  }
  return publicRouteNotFound();
}

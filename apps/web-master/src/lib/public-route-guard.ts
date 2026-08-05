import { NextResponse } from "next/server";

import { getSiteIdFromRequest } from "@/lib/site-context";

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

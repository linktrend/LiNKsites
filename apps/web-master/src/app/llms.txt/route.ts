import { NextResponse } from "next/server";

import { getPublicSiteIdOrNull, publicRouteNotFound } from "@/lib/public-route-guard";
import { loadPublishedAuthority } from "@/lib/seo/published-catalog";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  if (!(await getPublicSiteIdOrNull())) return publicRouteNotFound();
  const authority = await loadPublishedAuthority();
  return new NextResponse(authority.llmsTxt, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
}

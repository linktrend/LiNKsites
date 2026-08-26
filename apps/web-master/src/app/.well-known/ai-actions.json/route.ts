import { NextResponse } from "next/server";
import { getAiActions } from "@/config";
import { getPublicSiteIdOrNull, publicRouteNotFound } from "@/lib/public-route-guard";
import { loadPublishedAuthority } from "@/lib/seo/published-catalog";
import { publishedAiProjection } from "@/lib/seo/published-authority";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  if (!(await getPublicSiteIdOrNull())) return publicRouteNotFound();

  const authority = await loadPublishedAuthority();
  const actions = getAiActions();
  const origin = new URL(actions.actions[0]?.url ?? `${authority.baseUrl}/`).origin;

  return NextResponse.json(
    {
      version: actions.version,
      generatedAt: actions.generatedAt,
      baseUrl: authority.baseUrl,
      actions: actions.actions.map((action) => ({
        ...action,
        url: action.url.replace(origin, authority.baseUrl),
      })),
      projections: publishedAiProjection(authority),
    },
    {
      headers: {
        "cache-control": "public, max-age=300",
      },
    },
  );
}

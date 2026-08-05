import { NextResponse } from "next/server";
import { getAiActions } from "@/config";
import { getPublicSiteIdOrNull, publicRouteNotFound } from "@/lib/public-route-guard";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  if (!(await getPublicSiteIdOrNull())) return publicRouteNotFound();

  const actions = getAiActions();
  return NextResponse.json(actions, {
    headers: {
      "cache-control": "public, max-age=300",
    },
  });
}

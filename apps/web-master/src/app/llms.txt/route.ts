import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { buildLlmsTxt } from "@/config";
import { getPublicSiteIdOrNull, publicRouteNotFound } from "@/lib/public-route-guard";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  if (!(await getPublicSiteIdOrNull())) return publicRouteNotFound();

  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const baseUrl = host ? `${proto}://${host}` : undefined;
  const body = buildLlmsTxt(baseUrl);

  return new NextResponse(body, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "x-content-type-options": "nosniff",
    },
  });
}

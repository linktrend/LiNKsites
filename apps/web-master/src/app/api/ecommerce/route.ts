import { NextRequest, NextResponse } from "next/server";

import { activateSideEffect, resolveConfiguredHook } from "@/lib/forms/side-effect-policy";
import { getPublicSiteIdOrNull, publicRouteNotFound } from "@/lib/public-route-guard";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await getPublicSiteIdOrNull())) return publicRouteNotFound();
  void request;
  const configured = resolveConfiguredHook("ecommerce");
  const decision = activateSideEffect({
    kind: "ecommerce",
    endpoint: "/api/ecommerce",
    configured,
    requiresConsent: true,
    consentGranted: false,
  });
  if (decision.ok) {
    return NextResponse.json(
      { success: false, error: "hook_not_executed", message: "ecommerce hook is configured but this route never fakes success" },
      { status: 501 },
    );
  }
  return NextResponse.json({ success: false, error: decision.code, message: decision.message }, { status: 503 });
}

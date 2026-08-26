import { NextRequest, NextResponse } from "next/server";

import { activateSideEffect, resolveConfiguredHook, type SideEffectKind } from "@/lib/forms/side-effect-policy";
import { getPublicSiteIdOrNull, publicRouteNotFound } from "@/lib/public-route-guard";

export const dynamic = "force-dynamic";

function inactiveModule(kind: SideEffectKind, endpoint: string): NextResponse {
  const decision = activateSideEffect({
    kind,
    endpoint,
    configured: resolveConfiguredHook(kind),
    requiresConsent: true,
    consentGranted: false,
  });
  if (decision.ok) {
    return NextResponse.json(
      { success: false, error: "hook_not_executed", message: `${kind} hook is configured but this route never fakes success` },
      { status: 501 },
    );
  }
  return NextResponse.json({ success: false, error: decision.code, message: decision.message }, { status: 503 });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await getPublicSiteIdOrNull())) return publicRouteNotFound();
  void request;
  return inactiveModule("booking", "/api/booking");
}

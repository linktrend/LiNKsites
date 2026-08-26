import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { ENVIRONMENT } from "@/config";
import { enforceAbuseLimit, abuseKeyFromRequest, enqueueGovernedSideEffect } from "@/lib/forms/governed-side-effect";
import { SideEffectPolicyError, activateSideEffect, resolveConfiguredHook } from "@/lib/forms/side-effect-policy";
import { getPublicSiteIdOrNull, publicRouteNotFound } from "@/lib/public-route-guard";

export const dynamic = "force-dynamic";

const newsletterApiSchema = z.object({
  intentTag: z.string().min(1).max(100).default("newsletter"),
  formData: z.object({
    email: z.string().email(),
    acceptedTerms: z.literal(true),
  }),
  metadata: z
    .object({
      timestamp: z.string().optional(),
      userAgent: z.string().optional(),
      referrer: z.string().optional(),
      language: z.string().optional(),
    })
    .optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await getPublicSiteIdOrNull())) return publicRouteNotFound();

  const decision = activateSideEffect({
    kind: "newsletter",
    endpoint: "/api/newsletter",
    configured: resolveConfiguredHook("newsletter"),
    requiresConsent: true,
    consentGranted: true,
  });
  if (!decision.ok) {
    return NextResponse.json(
      { success: false, error: decision.code, message: decision.message },
      { status: 503 },
    );
  }

  const abuse = enforceAbuseLimit(abuseKeyFromRequest(request.headers));
  if (!abuse.ok) {
    return NextResponse.json(
      { success: false, error: "rate_limited", message: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(abuse.retryAfterSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "invalid_json", message: "The request body must be valid JSON" },
      { status: 400 },
    );
  }

  try {
    const validated = newsletterApiSchema.parse(body);
    await enqueueGovernedSideEffect({
      kind: "newsletter",
      intent: validated.intentTag,
      submission: { email: validated.formData.email, acceptedTerms: true },
      metadata: {
        timestamp: validated.metadata?.timestamp || new Date().toISOString(),
        userAgent: validated.metadata?.userAgent || request.headers.get("user-agent") || "unknown",
        referrer: validated.metadata?.referrer || request.headers.get("referer") || "direct",
        language: validated.metadata?.language || "en",
      },
    });
    return NextResponse.json({ success: true, message: "Newsletter subscription received" });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "validation_failed",
          message: "Please check your form inputs and try again",
          ...(ENVIRONMENT.isProduction ? {} : { details: error.issues }),
        },
        { status: 400 },
      );
    }
    if (error instanceof SideEffectPolicyError) {
      return NextResponse.json({ success: false, error: error.code, message: error.message }, { status: 503 });
    }
    return NextResponse.json(
      { success: false, error: "enqueue_failed", message: "Newsletter subscription could not be completed." },
      { status: 500 },
    );
  }
}

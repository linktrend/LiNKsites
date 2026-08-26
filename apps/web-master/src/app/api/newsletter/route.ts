import { NextRequest, NextResponse } from "next/server";

import { ENVIRONMENT } from "@/config";
import { enforceAbuseLimit, abuseKeyFromRequest, enqueueGovernedSideEffect } from "@/lib/forms/governed-side-effect";
import { evaluateNewsletterRequest, newsletterSuccessAfterEnqueue } from "@/lib/forms/newsletter-policy";
import { SideEffectPolicyError } from "@/lib/forms/side-effect-policy";
import { getPublicSiteIdOrNull, publicRouteNotFound } from "@/lib/public-route-guard";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await getPublicSiteIdOrNull())) return publicRouteNotFound();

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

  const evaluation = evaluateNewsletterRequest(body);
  if (!evaluation.ok && evaluation.stage === "parse") {
    return NextResponse.json(
      {
        success: false,
        error: "validation_failed",
        message: "Please check your form inputs and try again",
        ...(ENVIRONMENT.isProduction ? {} : { details: evaluation.error.issues }),
      },
      { status: 400 },
    );
  }
  if (!evaluation.ok && evaluation.stage === "policy") {
    const status = evaluation.decision.code === "consent_required" ? 400 : 503;
    return NextResponse.json(
      { success: false, error: evaluation.decision.code, message: evaluation.decision.message },
      { status },
    );
  }
  if (!evaluation.ok) {
    const exhaustive: never = evaluation;
    return NextResponse.json(
      { success: false, error: "newsletter_rejected", message: String(exhaustive) },
      { status: 400 },
    );
  }

  try {
    await enqueueGovernedSideEffect({
      kind: "newsletter",
      intent: evaluation.payload.intentTag,
      submission: {
        email: evaluation.payload.formData.email,
        acceptedTerms: evaluation.payload.formData.acceptedTerms,
      },
      metadata: {
        timestamp: evaluation.payload.metadata?.timestamp || new Date().toISOString(),
        userAgent: evaluation.payload.metadata?.userAgent || request.headers.get("user-agent") || "unknown",
        referrer: evaluation.payload.metadata?.referrer || request.headers.get("referer") || "direct",
        language: evaluation.payload.metadata?.language || "en",
      },
    });
    const outcome = newsletterSuccessAfterEnqueue(true);
    if (!outcome.success) {
      return NextResponse.json(
        { success: false, error: outcome.code, message: outcome.message },
        { status: 500 },
      );
    }
    return NextResponse.json({ success: true, message: "Newsletter subscription received" });
  } catch (error) {
    if (error instanceof SideEffectPolicyError) {
      return NextResponse.json({ success: false, error: error.code, message: error.message }, { status: 503 });
    }
    return NextResponse.json(
      { success: false, error: "enqueue_failed", message: "Newsletter subscription could not be completed." },
      { status: 500 },
    );
  }
}

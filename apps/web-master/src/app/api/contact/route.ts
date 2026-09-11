import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ENVIRONMENT } from "@/config";
import { getPublicSiteIdOrNull, publicRouteNotFound } from "@/lib/public-route-guard";
import { abuseKeyFromRequest, enforceAbuseLimit, enqueueGovernedSideEffect } from "@/lib/forms/governed-side-effect";
import { SideEffectPolicyError } from "@/lib/forms/side-effect-policy";
import { contactSuccessAfterEnqueue, evaluateContactRequest } from "@/lib/forms/contact-policy";

const MAX_REQUEST_SIZE = 1024 * 1024;

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!(await getPublicSiteIdOrNull())) return publicRouteNotFound();

  const abuse = enforceAbuseLimit(abuseKeyFromRequest(request.headers));
  if (!abuse.ok) {
    return NextResponse.json(
      { success: false, error: "rate_limited", message: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(abuse.retryAfterSeconds) } },
    );
  }

  try {
    const contentLength = request.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: "Request too large",
          message: "The request payload exceeds the maximum allowed size",
        },
        { status: 413 },
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON",
          message: "The request body must be valid JSON",
        },
        { status: 400 },
      );
    }

    const evaluated = evaluateContactRequest(body);
    if (!evaluated.ok) {
      if (evaluated.stage === "parse") {
        return NextResponse.json(
          {
            success: false,
            error: "Validation failed",
            message: "Please check your form inputs and try again",
            ...(ENVIRONMENT.isProduction
              ? {}
              : {
                  details: evaluated.error.issues.map((issue) => ({
                    path: issue.path.join("."),
                    message: issue.message,
                  })),
                }),
          },
          { status: 400 },
        );
      }
      const status = evaluated.decision.code === "consent_required" ? 403 : 503;
      return NextResponse.json(
        { success: false, error: evaluated.decision.code, message: evaluated.decision.message },
        { status },
      );
    }

    const sanitizedFormData = Object.entries(evaluated.payload.formData).reduce(
      (acc, [key, value]) => {
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          acc[key] = value;
        } else if (value === null || value === undefined) {
          acc[key] = "";
        } else {
          acc[key] = String(value);
        }
        return acc;
      },
      {} as Record<string, string | number | boolean>,
    );

    const payload = {
      intent: evaluated.payload.intentTag,
      submission: sanitizedFormData,
      metadata: {
        timestamp: evaluated.payload.metadata?.timestamp || new Date().toISOString(),
        userAgent: evaluated.payload.metadata?.userAgent || request.headers.get("user-agent") || "unknown",
        referrer: evaluated.payload.metadata?.referrer || request.headers.get("referer") || "direct",
        language: evaluated.payload.metadata?.language || "en",
        ip: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      },
    };

    await enqueueGovernedSideEffect({
      kind: "contact",
      intent: payload.intent,
      submission: payload.submission,
      metadata: payload.metadata,
    });

    const success = contactSuccessAfterEnqueue(true);
    if (success.success !== true) {
      return NextResponse.json(
        { success: false, error: success.code, message: success.message },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Contact request received successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          message: "Please check your form inputs and try again",
        },
        { status: 400 },
      );
    }

    if (error instanceof SideEffectPolicyError) {
      return NextResponse.json({ success: false, error: error.code, message: error.message }, { status: 503 });
    }

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred. Please try again later",
      },
      { status: 500 },
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  if (!(await getPublicSiteIdOrNull())) return publicRouteNotFound();

  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}

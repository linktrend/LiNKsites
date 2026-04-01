import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { ENV } from "@/config";
import { checkRateLimit } from "@/lib/ai/rateLimit";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const token = request.headers.get("x-ai-action-token");
  if (!ENV.AI.ACTIONS_SECRET) {
    return NextResponse.json(
      { success: false, error: "ai_actions_disabled", message: "AI actions are not configured." },
      { status: 503 }
    );
  }

  if (!token || token !== ENV.AI.ACTIONS_SECRET) {
    return NextResponse.json(
      { success: false, error: "unauthorized", message: "Missing or invalid AI action token." },
      { status: 401 }
    );
  }

  const clientKey =
    request.headers.get("x-forwarded-for") ||
    request.headers.get("x-real-ip") ||
    request.ip ||
    "unknown";

  const limit = ENV.AI.ACTIONS_RATE_LIMIT_PER_MIN;
  const rate = checkRateLimit(clientKey, limit);
  if (!rate.ok) {
    return NextResponse.json(
      { success: false, error: "rate_limited", message: "Rate limit exceeded." },
      {
        status: 429,
        headers: {
          "Retry-After": String(rate.retryAfterSeconds),
        },
      }
    );
  }

  const body = await request.text();
  const h = headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const baseUrl = host ? `${proto}://${host}` : "";

  const response = await fetch(`${baseUrl}/api/contact`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-ai-action-proxy": "true",
      "user-agent": request.headers.get("user-agent") || "",
    },
    body,
  });

  const payload = await response.json().catch(() => ({}));
  return NextResponse.json(payload, { status: response.status });
}

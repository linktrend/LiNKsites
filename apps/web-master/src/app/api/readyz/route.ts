import { NextResponse } from "next/server";
import { runtimeConfig } from "@/config/runtime";

export const dynamic = "force-dynamic";

export function GET() {
  const provider = process.env.NEXT_PUBLIC_CMS_PROVIDER ?? "payload";
  const validProvider = provider === "payload" || provider === "fixture";
  const cmsConfigured = provider === "fixture"
    ? Boolean(process.env.CMS_FIXTURE_PATH && process.env.DEFAULT_SITE_ID)
    : Boolean(runtimeConfig.payloadBaseUrl && /^https?:\/\//.test(runtimeConfig.payloadBaseUrl));
  const ready = validProvider && cmsConfigured && (provider === "fixture" || Boolean(runtimeConfig.payloadApiKey || process.env.NODE_ENV !== "production"));
  return NextResponse.json(
    { status: ready ? "ready" : "not_ready", service: "web-master", cmsProvider: provider },
    { status: ready ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}

import { NextResponse } from "next/server";
import { runtimeConfig } from "@/config/runtime";

export const dynamic = "force-dynamic";

export function GET() {
  const provider = process.env.NEXT_PUBLIC_CMS_PROVIDER ?? "payload";
  const production = process.env.LINKSITES_DEPLOYMENT_ENV === "production";
  const validProvider = provider === "payload";
  const cmsConfigured = Boolean(runtimeConfig.payloadBaseUrl && /^https:\/\//.test(runtimeConfig.payloadBaseUrl));
  const ready = validProvider && cmsConfigured && Boolean(runtimeConfig.payloadApiKey || !production);
  return NextResponse.json(
    { status: ready ? "ready" : "not_ready", service: "web-master", cmsProvider: provider },
    { status: ready ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}

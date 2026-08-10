import { NextResponse } from "next/server";
import { runtimeConfig } from "@/config/runtime";

export const dynamic = "force-dynamic";

export async function GET() {
  const provider = process.env.NEXT_PUBLIC_CMS_PROVIDER ?? "payload";
  const production = process.env.LINKSITES_DEPLOYMENT_ENV === "production";
  const validProvider = provider === "payload";
  const cmsConfigured = Boolean(runtimeConfig.payloadBaseUrl && /^https:\/\//.test(runtimeConfig.payloadBaseUrl));
  let cmsReachable = false;
  if (validProvider && cmsConfigured && Boolean(runtimeConfig.payloadApiKey || !production)) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3_000);
    try {
      const response = await fetch(`${runtimeConfig.payloadBaseUrl.replace(/\/$/, "")}/api/pages?limit=1`, {
        headers: runtimeConfig.payloadApiKey ? { Authorization: `users API-Key ${runtimeConfig.payloadApiKey}` } : undefined,
        cache: "no-store",
        signal: controller.signal,
      });
      cmsReachable = response.ok;
    } catch {
      cmsReachable = false;
    } finally {
      clearTimeout(timeout);
    }
  }
  const ready = validProvider && cmsConfigured && cmsReachable;
  return NextResponse.json(
    { status: ready ? "ready" : "not_ready", service: "web-master", cmsProvider: provider },
    { status: ready ? 200 : 503, headers: { "cache-control": "no-store" } },
  );
}

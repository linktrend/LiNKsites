import type { NextRequest } from "next/server";

export type TrafficSource =
  | "ai"
  | "social"
  | "search"
  | "referral"
  | "direct"
  | "unknown";

const SOCIAL_SOURCES = [
  "tiktok",
  "instagram",
  "facebook",
  "linkedin",
  "twitter",
  "x",
  "youtube",
] as const;

const AI_REFERRERS = [
  "chat.openai.com",
  "perplexity.ai",
  "claude.ai",
  "gemini.google.com",
  "copilot.microsoft.com",
  "poe.com",
] as const;

const SEARCH_REFERRERS = [
  "google.",
  "bing.com",
  "duckduckgo.com",
  "yahoo.com",
  "baidu.com",
  "yandex.",
] as const;

export const resolveTrafficSource = (request: NextRequest): TrafficSource => {
  const url = request.nextUrl;
  const utmSource = url.searchParams.get("utm_source")?.toLowerCase();
  if (utmSource) {
    if (SOCIAL_SOURCES.some((source) => utmSource.includes(source))) return "social";
    if (utmSource.includes("ai") || utmSource.includes("llm")) return "ai";
    if (utmSource.includes("search")) return "search";
    return "referral";
  }

  const referrer = request.headers.get("referer") || request.headers.get("referrer");
  if (!referrer) return "direct";

  try {
    const host = new URL(referrer).hostname.toLowerCase();
    if (AI_REFERRERS.some((source) => host.includes(source))) return "ai";
    if (SOCIAL_SOURCES.some((source) => host.includes(source))) return "social";
    if (SEARCH_REFERRERS.some((source) => host.includes(source))) return "search";
    return "referral";
  } catch {
    return "unknown";
  }
};

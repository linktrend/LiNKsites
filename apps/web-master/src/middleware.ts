import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from "next/server";
import { AI_FEATURES } from "@/config";
import { resolveTrafficSource } from "@/lib/trafficSource";

const AI_UA_PATTERNS = [
  /GPTBot/i,
  /ChatGPT-User/i,
  /Claude/i,
  /Perplexity/i,
  /Google-Extended/i,
  /Bingbot/i,
  /Baiduspider/i,
  /YandexBot/i,
] as const;

const isAiAgent = (userAgent: string | null): boolean => {
  if (!userAgent) return false;
  return AI_UA_PATTERNS.some((pattern) => pattern.test(userAgent));
};

const shouldServeMarkdown = (request: NextRequest): boolean => {
  if (!AI_FEATURES.enableMarkdownViews) return false;
  const userAgent = request.headers.get("user-agent");
  const accept = request.headers.get("accept") || "";
  if (!isAiAgent(userAgent)) return false;
  if (accept.includes("text/markdown")) return true;
  return true;
};

const withTrainingSignal = (response: NextResponse): NextResponse => {
  if (AI_FEATURES.enableTrainingSignal) {
    response.headers.set("Content-Signal", "ai-train=yes");
  }
  return response;
};

const withTrafficCookie = (request: NextRequest, response: NextResponse): NextResponse => {
  const source = resolveTrafficSource(request);
  const existing = request.cookies.get("lsites_source")?.value;
  if (source && source !== existing) {
    response.cookies.set("lsites_source", source, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
    });
  }
  return response;
};

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es', 'zh-tw', 'zh-cn'],

  // Used when no locale matches
  defaultLocale: 'en',

  // Always use a prefix for all locales
  localePrefix: 'always'
});

export default function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (pathname.startsWith("/_ai")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.replace("/_ai", "/ai");
    return withTrafficCookie(request, withTrainingSignal(NextResponse.rewrite(url)));
  }

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/ai") ||
    pathname.startsWith("/sitemap") ||
    pathname.startsWith("/robots") ||
    pathname.startsWith("/llms")
  ) {
    return withTrafficCookie(request, withTrainingSignal(NextResponse.next()));
  }

  if (shouldServeMarkdown(request)) {
    const url = request.nextUrl.clone();
    url.pathname = "/ai/markdown";
    url.searchParams.set("path", `${pathname}${search}`);
    return withTrafficCookie(request, withTrainingSignal(NextResponse.rewrite(url)));
  }

  const response = intlMiddleware(request);
  return withTrafficCookie(request, withTrainingSignal(response));
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|es|zh-tw|zh-cn)/:path*', '/_ai/:path*', '/ai/:path*']
};

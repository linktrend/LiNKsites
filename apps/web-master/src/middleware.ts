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

  const demoMatch = pathname.match(/^\/(?:en|es|zh-tw|zh-cn)\/demo(?:\/([^/]+))?(?:\/|$)/);
  if (demoMatch && demoMatch[1]) {
    const configuredToken = process.env.PREVIEW_ACCESS_TOKEN;
    const candidateToken = demoMatch[1];
    if (!configuredToken || !candidateToken || candidateToken !== configuredToken) {
      return new NextResponse("Not Found", {
        status: 404,
        headers: {
          "X-Robots-Tag": "noindex, nofollow, noarchive",
          "Cache-Control": "private, no-store, max-age=0",
        },
      });
    }
  }

  // The completion URL is stable and contains no credential. The protected
  // preview boundary carries the application key as a request header.
  const stableDemoMatch = pathname.match(/^\/(?:en|es|zh-tw|zh-cn)\/demo(?:\/|$)/);
  if (stableDemoMatch && !pathname.match(/^\/(?:en|es|zh-tw|zh-cn)\/demo\/[^/]+/)) {
    const configuredKey = process.env.PREVIEW_ACCESS_TOKEN;
    if (!configuredKey || request.headers.get("x-linksites-preview-key") !== configuredKey) {
      return new NextResponse("Not Found", { status: 404, headers: { "X-Robots-Tag": "noindex, nofollow, noarchive", "Cache-Control": "private, no-store, max-age=0" } });
    }
  }

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
  if (pathname.match(/^\/(?:en|es|zh-tw|zh-cn)\/demo(?:\/|$)/)) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
  }
  return withTrafficCookie(request, withTrainingSignal(response));
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|es|zh-tw|zh-cn)/:path*', '/_ai/:path*', '/ai/:path*']
};

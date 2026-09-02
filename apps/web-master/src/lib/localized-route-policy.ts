import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/config";
import { resolveFamilyRoute } from "@/lib/routes";

export type LocaleResolution =
  | Readonly<{ kind: "exact"; locale: SupportedLanguage }>
  | Readonly<{ kind: "fallback"; locale: SupportedLanguage; requestedLocale: SupportedLanguage }>
  | Readonly<{ kind: "reject"; reason: "unsupported-locale" | "locale-unavailable" | "invalid-fallback" }>;

export type LocalizedCanonicalDecision =
  | Readonly<{ status: "READY"; locale: SupportedLanguage; pathname: string; canonical: string }>
  | Readonly<{
      status: "HOLD";
      reason: "missing-live-base-url" | "missing-live-locale-configuration";
    }>
  | Readonly<{
      status: "REJECT";
      reason: "unsupported-locale" | "locale-unavailable" | "invalid-fallback" | "invalid-public-route";
    }>;

const supportedLocale = (value: string): value is SupportedLanguage =>
  (SUPPORTED_LANGUAGES as readonly string[]).includes(value);

const uniqueAvailableLocales = (
  locales: readonly string[],
): readonly SupportedLanguage[] | null => {
  if (locales.some((locale) => !supportedLocale(locale))) return null;
  return [...new Set(locales)] as SupportedLanguage[];
};

/**
 * Resolve an explicitly requested locale. Fallback is allowed only when both
 * the requested and fallback locales are supported and the fallback is live.
 * Unknown locale identifiers never silently become the default locale.
 */
export function resolveLocalePolicy(input: {
  requestedLocale: string;
  availableLocales: readonly string[];
  fallbackLocale?: string;
}): LocaleResolution {
  if (!supportedLocale(input.requestedLocale)) {
    return { kind: "reject", reason: "unsupported-locale" };
  }

  const available = uniqueAvailableLocales(input.availableLocales);
  if (!available) return { kind: "reject", reason: "locale-unavailable" };
  if (available.includes(input.requestedLocale)) {
    return { kind: "exact", locale: input.requestedLocale };
  }

  const fallback = input.fallbackLocale ?? DEFAULT_LANGUAGE;
  if (!supportedLocale(fallback)) return { kind: "reject", reason: "invalid-fallback" };
  if (!available.includes(fallback)) return { kind: "reject", reason: "locale-unavailable" };
  return { kind: "fallback", locale: fallback, requestedLocale: input.requestedLocale };
}

const normalizeBaseUrl = (value: string): string | null => {
  try {
    const url = new URL(value);
    if (!/^https?:$/.test(url.protocol) || url.username || url.password || url.search || url.hash) return null;
    return url.origin + url.pathname.replace(/\/+$/, "");
  } catch {
    return null;
  }
};

/**
 * Produce a canonical URL only from a validated public route and explicit live
 * locale configuration. Absent live configuration is a HOLD, not an implicit
 * localhost/default-locale success.
 */
export function canonicalLocalizedUrl(input: {
  baseUrl?: string;
  requestedLocale: string;
  availableLocales?: readonly string[];
  fallbackLocale?: string;
  pathname: string;
}): LocalizedCanonicalDecision {
  if (!input.baseUrl) return { status: "HOLD", reason: "missing-live-base-url" };
  if (!input.availableLocales?.length) {
    return { status: "HOLD", reason: "missing-live-locale-configuration" };
  }

  const locale = resolveLocalePolicy({
    requestedLocale: input.requestedLocale,
    availableLocales: input.availableLocales,
    fallbackLocale: input.fallbackLocale,
  });
  if (locale.kind === "reject") return { status: "REJECT", reason: locale.reason };

  const path = input.pathname.startsWith("/") ? input.pathname : `/${input.pathname}`;
  if (path.includes("?") || path.includes("#") || path.includes("\\") || path.includes("//")) {
    return { status: "REJECT", reason: "invalid-public-route" };
  }
  const withoutLocale = path.replace(/^\/(?:en|es|zh-tw|zh-cn)(?=\/|$)/, "") || "/";
  const localizedPath = withoutLocale === "/" ? `/${locale.locale}` : `/${locale.locale}${withoutLocale}`;
  const route = resolveFamilyRoute(localizedPath);
  if (route.kind !== "ok" || route.pathname !== localizedPath) {
    return { status: "REJECT", reason: "invalid-public-route" };
  }

  const baseUrl = normalizeBaseUrl(input.baseUrl);
  if (!baseUrl) return { status: "REJECT", reason: "invalid-public-route" };
  return {
    status: "READY",
    locale: locale.locale,
    pathname: localizedPath,
    canonical: `${baseUrl}${localizedPath}`,
  };
}

import type { Metadata } from "next";
import { languages } from "./siteConfig";

export function buildHreflang(slug: string) {
  return languages.map((lang) => ({
    hrefLang: lang,
    href: `/${lang}${slug.startsWith("/") ? slug : `/${slug}`}`,
  }));
}

export function buildCanonical(lang: string, slug: string) {
  return `/${lang}${slug.startsWith("/") ? slug : `/${slug}`}`;
}

export function buildMetadata(lang: string, slug: string, overrides?: Partial<Metadata>): Metadata {
  return {
    alternates: {
      canonical: buildCanonical(lang, slug),
      languages: Object.fromEntries(buildHreflang(slug).map((h) => [h.hrefLang, h.href])),
    },
    ...overrides,
  };
}

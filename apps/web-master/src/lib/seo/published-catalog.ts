import { headers } from "next/headers";

import { DEFAULT_LANGUAGE, ENVIRONMENT, SUPPORTED_LANGUAGES } from "@/config";
import { payloadFind } from "@/lib/payload-client";
import { isPageVisibleToAudience, isPublicSiteEligible } from "@/lib/public-surface";
import { getSiteIdFromRequest } from "@/lib/site-context";
import {
  projectPublishedAuthority,
  type CatalogRecord,
  type DiscoverabilityStatus,
  type PublishedAuthority,
} from "@/lib/seo/published-authority";

type IndexedDoc = {
  slug?: string;
  locale?: string;
  status?: string;
  previewEnvironment?: string | null;
  updatedAt?: string;
};

const localePrefixPath = (locale: string, slug: string): string => {
  if (!slug || slug === "home") return `/${locale}`;
  return `/${locale}/${slug.replace(/^\/+/, "")}`;
};

function statusFor(doc: IndexedDoc): DiscoverabilityStatus {
  if (doc.previewEnvironment === "private-preview") return "private";
  if (doc.status && doc.status !== "published") return "draft";
  if (!isPageVisibleToAudience(doc, "public")) return "private";
  return "published";
}

function toRecords(family: string, docs: IndexedDoc[], pathOf: (doc: IndexedDoc) => string): CatalogRecord[] {
  return docs.flatMap((doc) => {
    if (!doc.slug || !doc.locale) return [];
    if (!SUPPORTED_LANGUAGES.includes(doc.locale as (typeof SUPPORTED_LANGUAGES)[number])) return [];
    return [
      {
        family,
        locale: doc.locale,
        path: pathOf(doc),
        status: statusFor(doc),
        lastModified: doc.updatedAt,
      },
    ];
  });
}

async function findPublishedDocs(collection: string, siteId: string): Promise<IndexedDoc[]> {
  const result = await payloadFind<IndexedDoc>({
    collection,
    where: {
      and: [{ site: { equals: siteId } }],
    },
    limit: 200,
    depth: 0,
    site: siteId,
  }).catch(() => null);
  return result?.docs ?? [];
}

export async function requestBaseUrl(): Promise<string> {
  const h = await headers();
  const proto = h.get("x-forwarded-proto") ?? "https";
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  return host ? `${proto}://${host}` : "https://example.com";
}

export async function loadPublishedAuthority(): Promise<PublishedAuthority> {
  const baseUrl = await requestBaseUrl();
  const siteId = await getSiteIdFromRequest().catch(() => null);
  if (!siteId) {
    return projectPublishedAuthority({
      baseUrl,
      locales: SUPPORTED_LANGUAGES,
      defaultLocale: DEFAULT_LANGUAGE,
      records: [],
      publicEligible: false,
      production: ENVIRONMENT.isProduction,
    });
  }

  const [pages, offers, articles, videos, cases, privacy, terms, cookies, faqs] = await Promise.all([
    findPublishedDocs("pages", siteId),
    findPublishedDocs("offer-pages", siteId),
    findPublishedDocs("articles", siteId),
    findPublishedDocs("videos", siteId),
    findPublishedDocs("case-study-pages", siteId),
    findPublishedDocs("privacy-pages", siteId),
    findPublishedDocs("terms-pages", siteId),
    findPublishedDocs("cookie-policy-pages", siteId),
    findPublishedDocs("faq-pages", siteId),
  ]);

  const publishedPageCount = pages.filter((page) => statusFor(page) === "published").length;
  const publicEligible = isPublicSiteEligible({ id: siteId, status: "published" }, publishedPageCount);

  const records: CatalogRecord[] = [
    ...toRecords("home", pages, (doc) => localePrefixPath(doc.locale as string, doc.slug === "home" ? "home" : (doc.slug as string))),
    ...toRecords("offer", offers, (doc) => `/${doc.locale}/offers/${doc.slug}`),
    ...toRecords("article", articles, (doc) => `/${doc.locale}/resources/articles/${doc.slug}`),
    ...toRecords("video", videos, (doc) => `/${doc.locale}/resources/videos/${doc.slug}`),
    ...toRecords("case", cases, (doc) => `/${doc.locale}/resources/cases/${doc.slug}`),
    ...toRecords("legal", privacy, (doc) => `/${doc.locale}/legal/${doc.slug}`),
    ...toRecords("legal", terms, (doc) => `/${doc.locale}/legal/${doc.slug}`),
    ...toRecords("legal", cookies, (doc) => `/${doc.locale}/legal/${doc.slug}`),
    ...toRecords("faq", faqs, (doc) => `/${doc.locale}/resources/faq/${doc.slug}`),
  ];

  return projectPublishedAuthority({
    baseUrl,
    locales: SUPPORTED_LANGUAGES,
    defaultLocale: DEFAULT_LANGUAGE,
    records,
    publicEligible,
    production: ENVIRONMENT.isProduction,
  });
}

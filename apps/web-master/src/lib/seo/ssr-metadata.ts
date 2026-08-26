import type { Metadata } from "next";

import { SITE_CONFIG, SEO_CONFIG, getLocaleFromLanguage } from "@/config";
import { loadPublishedAuthority } from "@/lib/seo/published-catalog";
import { ssrPageAlternates } from "@/lib/seo/published-authority";
import type { SEOParams } from "@/lib/seo";

/**
 * SSR metadata uses one published authority for canonical and hreflang.
 */
export async function buildMetadata(lang: string, slug: string, params?: SEOParams): Promise<Metadata> {
  const {
    title,
    description = SITE_CONFIG.description,
    keywords = SEO_CONFIG.defaultKeywords,
    ogImage = SEO_CONFIG.openGraph.images.default,
    ogType = "website",
    publishedTime,
    modifiedTime,
    author = SITE_CONFIG.author,
    section,
    noIndex = false,
    noFollow = false,
  } = params || {};

  const authority = await loadPublishedAuthority();
  const alternates = ssrPageAlternates(authority, lang, slug);
  const pageTitle = title ? `${title} | ${SITE_CONFIG.siteName}` : SITE_CONFIG.siteName;
  const canonicalUrl = alternates.canonical;
  const suppressIndex = noIndex || !alternates.indexable;
  const absoluteOgImage = ogImage.startsWith("http") ? ogImage : `${authority.baseUrl}${ogImage}`;
  const locale = getLocaleFromLanguage(lang);
  const keywordsString: string | undefined = Array.isArray(keywords)
    ? [...keywords].join(", ")
    : typeof keywords === "string"
      ? keywords
      : undefined;

  return {
    title: pageTitle,
    description,
    keywords: keywordsString,
    authors: [{ name: author }],
    creator: author,
    publisher: SITE_CONFIG.siteName,
    robots: {
      index: !suppressIndex,
      follow: !noFollow,
      googleBot: {
        index: !suppressIndex,
        follow: !noFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: canonicalUrl,
      languages:
        Object.keys(alternates.languages).length > 0
          ? { ...alternates.languages }
          : {
              [lang]: canonicalUrl,
              "x-default": canonicalUrl,
            },
    },
    openGraph: {
      type: ogType,
      locale,
      url: canonicalUrl,
      title: title || SITE_CONFIG.siteName,
      description,
      siteName: SITE_CONFIG.siteName,
      images: [
        {
          url: absoluteOgImage,
          width: SEO_CONFIG.openGraph.images.width,
          height: SEO_CONFIG.openGraph.images.height,
          alt: title || SITE_CONFIG.siteName,
        },
      ],
      ...(ogType === "article" && {
        publishedTime,
        modifiedTime,
        authors: [author],
        section,
      }),
    },
    twitter: {
      card: SEO_CONFIG.twitter.card,
      site: SEO_CONFIG.twitter.site,
      creator: SEO_CONFIG.twitter.creator,
      title: title || SITE_CONFIG.siteName,
      description,
      images: [absoluteOgImage],
    },
    metadataBase: new URL(authority.baseUrl),
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
  };
}

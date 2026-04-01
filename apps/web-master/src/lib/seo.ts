import type { Metadata } from "next";
import { 
  SUPPORTED_LANGUAGES, 
  LANGUAGE_NAMES, 
  SITE_CONFIG, 
  SEO_CONFIG,
  getLocaleFromLanguage,
  getSiteUrl 
} from "@/config";

/**
 * SEO Metadata Builder
 * Generates comprehensive metadata for Next.js pages with SEO best practices
 */

export interface SEOParams {
  title?: string;
  description?: string;
  keywords?: readonly string[] | string[];
  ogImage?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  canonicalUrl?: string;
}

export function buildHreflang(slug: string) {
  return SUPPORTED_LANGUAGES.map((lang) => ({
    hrefLang: lang,
    href: `/${lang}${slug.startsWith("/") ? slug : `/${slug}`}`,
  }));
}

export function buildCanonical(lang: string, slug: string) {
  const baseUrl = getSiteUrl();
  return `${baseUrl}/${lang}${slug.startsWith("/") ? slug : `/${slug}`}`;
}

export function buildAbsoluteUrl(lang: string, slug: string) {
  return buildCanonical(lang, slug);
}

/**
 * Enhanced metadata builder with full SEO support
 * Supports CMS-driven fields: title, description, ogImage
 */
export function buildMetadata(
  lang: string,
  slug: string,
  params?: SEOParams
): Metadata {
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
    canonicalUrl: canonicalOverride,
  } = params || {};

  const pageTitle = title ? `${title} | ${SITE_CONFIG.siteName}` : SITE_CONFIG.siteName;
  const canonicalUrl = canonicalOverride
    ? canonicalOverride.startsWith("http")
      ? canonicalOverride
      : `${getSiteUrl()}${canonicalOverride}`
    : buildCanonical(lang, slug);
  const absoluteOgImage = ogImage.startsWith("http")
    ? ogImage
    : `${getSiteUrl()}${ogImage}`;

  const locale = getLocaleFromLang(lang);

  const keywordsString: string | undefined = Array.isArray(keywords) ? [...keywords].join(", ") : (typeof keywords === 'string' ? keywords : undefined);
  
  const metadata: Metadata = {
    title: pageTitle,
    description,
    keywords: keywordsString,
    authors: [{ name: author }],
    creator: author,
    publisher: SITE_CONFIG.siteName,
    
    // Robots
    robots: {
      index: !noIndex,
      follow: !noFollow,
      googleBot: {
        index: !noIndex,
        follow: !noFollow,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },

    // Alternates (canonical + hreflang)
    alternates: {
      canonical: canonicalUrl,
      languages: Object.fromEntries(
        buildHreflang(slug).map((h) => [h.hrefLang, `${getSiteUrl()}${h.href}`])
      ),
    },

    // OpenGraph
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

    // Twitter
    twitter: {
      card: SEO_CONFIG.twitter.card,
      site: SEO_CONFIG.twitter.site,
      creator: SEO_CONFIG.twitter.creator,
      title: title || SITE_CONFIG.siteName,
      description,
      images: [absoluteOgImage],
    },

    // Additional metadata
    metadataBase: new URL(getSiteUrl()),
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
  };

  return metadata;
}

/**
 * Get locale string from language code
 */
function getLocaleFromLang(lang: string): string {
  return getLocaleFromLanguage(lang);
}

/**
 * Generate JSON-LD structured data
 */
export function buildJsonLd(type: string, data: Record<string, any>) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };
}

/**
 * Organization JSON-LD
 */
export function buildOrganizationJsonLd() {
  return buildJsonLd("Organization", {
    name: SITE_CONFIG.siteName,
    url: getSiteUrl(),
    logo: `${getSiteUrl()}/logo.png`,
    description: SITE_CONFIG.description,
    sameAs: [
      // Add social media URLs here when available
    ],
  });
}

/**
 * WebSite JSON-LD
 */
export function buildWebSiteJsonLd(
  actions: Array<{ name: string; url: string; method?: string; description?: string }> = []
) {
  const searchAction = {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${getSiteUrl()}/resources?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  };

  const actionList = actions.map((action) => ({
    "@type": "Action",
    name: action.name,
    description: action.description,
    target: {
      "@type": "EntryPoint",
      urlTemplate: action.url,
      httpMethod: action.method ?? "GET",
    },
  }));

  return buildJsonLd("WebSite", {
    name: SITE_CONFIG.siteName,
    url: getSiteUrl(),
    description: SITE_CONFIG.description,
    potentialAction: [searchAction, ...actionList],
  });
}

/**
 * Article JSON-LD
 */
export function buildArticleJsonLd(params: {
  title: string;
  description: string;
  url: string;
  image: string;
  datePublished: string;
  dateModified?: string;
  author: string;
  section?: string;
  reviewedBy?: string;
  verificationDate?: string;
}) {
  return buildJsonLd("Article", {
    headline: params.title,
    description: params.description,
    url: params.url,
    image: params.image,
    datePublished: params.datePublished,
    dateModified: params.verificationDate || params.dateModified || params.datePublished,
    author: {
      "@type": "Person",
      name: params.author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.siteName,
      logo: {
        "@type": "ImageObject",
        url: `${getSiteUrl()}/logo.png`,
      },
    },
    ...(params.reviewedBy && {
      reviewedBy: {
        "@type": "Person",
        name: params.reviewedBy,
      },
    }),
    ...(params.section && { articleSection: params.section }),
  });
}

/**
 * Product JSON-LD
 */
export function buildProductJsonLd(params: {
  name: string;
  description: string;
  image: string;
  url: string;
  brand?: string;
  reviewedBy?: string;
  verificationDate?: string;
  offers?: {
    price: string;
    priceCurrency: string;
    availability: string;
  };
}) {
  return buildJsonLd("Product", {
    name: params.name,
    description: params.description,
    image: params.image,
    url: params.url,
    brand: {
      "@type": "Brand",
      name: params.brand || SITE_CONFIG.siteName,
    },
    ...(params.reviewedBy && {
      reviewedBy: {
        "@type": "Person",
        name: params.reviewedBy,
      },
    }),
    ...(params.verificationDate && {
      dateModified: params.verificationDate,
    }),
    ...(params.offers && {
      offers: {
        "@type": "Offer",
        price: params.offers.price,
        priceCurrency: params.offers.priceCurrency,
        availability: `https://schema.org/${params.offers.availability}`,
      },
    }),
  });
}

/**
 * VideoObject JSON-LD
 */
export function buildVideoJsonLd(params: {
  title: string;
  description: string;
  url: string;
  thumbnailUrl: string;
  uploadDate?: string;
  reviewedBy?: string;
  verificationDate?: string;
}) {
  return buildJsonLd("VideoObject", {
    name: params.title,
    description: params.description,
    thumbnailUrl: params.thumbnailUrl,
    contentUrl: params.url,
    embedUrl: params.url,
    uploadDate: params.uploadDate ?? params.verificationDate,
    ...(params.reviewedBy && {
      reviewedBy: {
        "@type": "Person",
        name: params.reviewedBy,
      },
    }),
  });
}

/**
 * Breadcrumb JSON-LD
 */
export function buildBreadcrumbJsonLd(items: Array<{ name: string; url: string }>) {
  return buildJsonLd("BreadcrumbList", {
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

/**
 * FAQ JSON-LD
 */
export function buildFAQJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return buildJsonLd("FAQPage", {
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  });
}

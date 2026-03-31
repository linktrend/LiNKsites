import { notFound } from "next/navigation";

import { buildMetadata } from "@/lib/seo";
import { normalizeLocale } from "@/lib/locale-context";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { getNavigation } from "@/lib/repository/navigation";
import { getPageBySlug } from "@/lib/repository/pages";
import type { CmsPage } from "@/lib/repository/pages";
import { getTemplateIdForSite } from "@/lib/template-context";
import { getTemplateModule } from "@/templates/registry";

type PageProps = {
  params: {
    lang: string;
    slug?: string[];
  };
};

export async function generateMetadata({ params }: PageProps) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const slugSegments = params.slug ?? [];
  const slugPath = slugSegments.length > 0 ? `/${slugSegments.join("/")}` : "/";

  try {
    const page = await getPageBySlug({ siteId, locale, slugSegments });
    if (!page) {
      return buildMetadata(locale, slugPath);
    }

    return buildMetadata(locale, slugPath, {
      title: page.seo?.title ?? page.title,
      description: page.seo?.description,
      ogImage: (page.seo?.ogImage as any)?.url ?? undefined,
      canonicalUrl: page.seo?.canonicalUrl,
    });
  } catch (error) {
    console.error("[generateMetadata] Failed for page", slugPath, error);
    return buildMetadata(locale, slugPath);
  }
}

export default async function CmsPage({ params }: PageProps) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const slugSegments = params.slug ?? [];

  const [page, primaryNav, footerNav, templateId] = await Promise.all([
    getPageBySlug({ siteId, locale, slugSegments }),
    getNavigation({ siteId, locale, key: "primary" }).catch(() => null),
    getNavigation({ siteId, locale, key: "footer" }).catch(() => null),
    getTemplateIdForSite({ siteId, locale }),
  ]);

  // Fallback page to show the template even if CMS has no content yet
  const fallbackPage: CmsPage = {
    id: "fallback-page",
    site: siteId,
    locale,
    slug: slugSegments.length > 0 ? slugSegments.join("/") : "home",
    title: "Demo Page",
    seo: {
      title: "Demo Page",
      description: "Default demo content",
    },
    content: [
      {
        blockType: "hero",
        title: "Welcome to the Master Template",
        subtitle: "Connect your CMS content or use this demo layout.",
        badge: "Demo",
        cta: { text: "Contact", url: `/${locale}/contact`, style: "primary" },
      },
      {
        blockType: "features",
        title: "Features",
        subtitle: "Highlights you can configure in CMS",
        items: [
          { id: "f1", title: "CMS-driven", description: "Content pulled from Payload." },
          { id: "f2", title: "Multi-locale", description: "Locales handled via normalizeLocale." },
          { id: "f3", title: "Multi-site", description: "Site key resolved from host." },
          { id: "f4", title: "Blocks", description: "Hero, features, pricing, CTA, etc." },
        ],
      },
      {
        blockType: "pricing",
        title: "Pricing",
        subtitle: "Example plans",
        plans: [
          { id: "p1", name: "Starter", price: "$0", period: "per month", features: ["Basic features"], highlighted: false },
          { id: "p2", name: "Pro", price: "$29", period: "per month", features: ["Everything in Starter", "Pro support"], highlighted: true },
          { id: "p3", name: "Enterprise", price: "Custom", period: "", features: ["Custom SLAs"], highlighted: false },
        ],
      },
      {
        blockType: "cta",
        title: "Ready to connect your CMS?",
        text: "Add real content in Payload CMS and it will render here.",
        button: { text: "Go to Contact", url: `/${locale}/contact` },
        trustIndicators: ["No credit card required", "Cancel anytime", "CMS-driven"],
      },
      {
        blockType: "newsletter",
      },
    ],
  };

  const resolvedPage = page ?? fallbackPage;
  const template = getTemplateModule(templateId);

  return (
    <template.PageRenderer
      page={resolvedPage}
      primaryNav={primaryNav}
      footerNav={footerNav}
      siteKey={siteId}
      locale={locale}
    />
  );
}

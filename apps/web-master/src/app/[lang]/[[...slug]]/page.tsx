import { notFound } from "next/navigation";

import { buildMetadata } from "@/lib/seo";
import { normalizeLocale } from "@/lib/locale-context";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { getNavigation } from "@/lib/repository/navigation";
import { getPageBySlug } from "@/lib/repository/pages";
import { getTemplateIdForSite } from "@/lib/template-context";
import { getTemplateModule } from "@/templates/registry";
import { PageTypeMarker } from "@/components/layouts/PageTypeMarker";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
    if (!page) return { robots: { index: false, follow: false }, title: "Page unavailable" };

    return buildMetadata(locale, slugPath, {
      title: page.seo?.title ?? page.title,
      description: page.seo?.description,
      ogImage: (page.seo?.ogImage as any)?.url ?? undefined,
      canonicalUrl: page.seo?.canonicalUrl,
    });
  } catch (error) {
    console.error("[generateMetadata] Published CMS content unavailable", slugPath, error);
    return { robots: { index: false, follow: false }, title: "Page unavailable" };
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

  if (!page) return notFound();
  const template = getTemplateModule(templateId);

  return (
    <>
      <PageTypeMarker pageType={page.pageType ?? null} />
      <template.PageRenderer
        page={page}
        primaryNav={primaryNav}
        footerNav={footerNav}
        siteKey={siteId}
        locale={locale}
      />
    </>
  );
}

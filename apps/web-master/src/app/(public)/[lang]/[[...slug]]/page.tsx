import { notFound } from "next/navigation";

import { buildMetadata } from "@/lib/seo";
import { getNavigation } from "@/lib/repository/navigation";
import { getPageBySlug } from "@/lib/repository/pages";
import { getTemplateIdForSite } from "@/lib/template-context";
import { getTemplateModule } from "@/templates/registry";
import { PageTypeMarker } from "@/components/layouts/PageTypeMarker";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";
import { getSiteSettings } from "@/lib/repository/siteSettings";
import { resolveLayoutRuntime } from "@/components/page-renderer/layout-packs";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type PageProps = {
  params: Promise<{
    lang: string;
    slug?: string[];
  }>;
};

const publicPath = (lang: string, slug: string[] = []) =>
  slug.length === 0 ? `/${lang}` : `/${lang}/${slug.join("/")}`;

export async function generateMetadata({ params }: PageProps) {
  const { lang, slug = [] } = await params;
  const slugPath = slug.length > 0 ? `/${slug.join("/")}` : "/";
  try {
    const { siteId, locale } = await requirePublicFamilyPage({
      lang,
      pathname: publicPath(lang, slug),
    });
    const page = await getPageBySlug({ siteId, locale, slugSegments: slug });
    if (!page) return { robots: { index: false, follow: false }, title: "Page unavailable" };

    return buildMetadata(locale, slugPath, {
      title: page.seo?.title ?? page.title,
      description: page.seo?.description,
      ogImage: (page.seo?.ogImage as { url?: string } | undefined)?.url ?? undefined,
      canonicalUrl: page.seo?.canonicalUrl,
    });
  } catch {
    return { robots: { index: false, follow: false }, title: "Page unavailable" };
  }
}

export default async function CmsPage({ params }: PageProps) {
  const { lang, slug = [] } = await params;
  const { siteId, locale } = await requirePublicFamilyPage({
    lang,
    pathname: publicPath(lang, slug),
  });

  const [page, primaryNav, footerNav, templateId, settings] = await Promise.all([
    getPageBySlug({ siteId, locale, slugSegments: slug }),
    getNavigation({ siteId, locale, key: "primary" }).catch(() => null),
    getNavigation({ siteId, locale, key: "footer" }).catch(() => null),
    getTemplateIdForSite({ siteId, locale }),
    getSiteSettings({ siteId, locale }).catch(() => null),
  ]);

  if (!page) return notFound();
  const template = getTemplateModule(templateId);
  const runtime = resolveLayoutRuntime({
    layoutPackId: (settings as { layoutPackId?: unknown } | null)?.layoutPackId,
    planId: (settings as { planId?: unknown } | null)?.planId,
  });

  return (
    <>
      <PageTypeMarker pageType={page.pageType ?? null} />
      <template.PageRenderer
        page={page}
        primaryNav={primaryNav}
        footerNav={footerNav}
        siteKey={siteId}
        locale={locale}
        layoutPackId={runtime.layoutPackId}
        planId={runtime.planId}
      />
    </>
  );
}

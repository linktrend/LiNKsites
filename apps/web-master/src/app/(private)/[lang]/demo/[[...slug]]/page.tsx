import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getNavigation } from "@/lib/repository/navigation";
import { getPageBySlug } from "@/lib/repository/pages";
import { getPreviewSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";
import { getTemplateIdForSite } from "@/lib/template-context";
import { getTemplateModule } from "@/templates/registry";
import { loadPrivatePreviewLayoutRuntime } from "@/lib/private-preview-layout";

export const dynamic = "force-dynamic";
export const revalidate = 0;
type Props = { params: Promise<{ lang: string; slug?: string[] }> };

export async function generateMetadata(): Promise<Metadata> {
  return { title: "Private preview", robots: { index: false, follow: false, googleBot: { index: false, follow: false } } };
}

export default async function ProtectedDemoPage({ params }: Props) {
  const { lang, slug = [] } = await params;
  const locale = normalizeLocale(lang);
  const siteId = await getPreviewSiteIdFromRequest();
  const [page, primaryNav, footerNav, templateId] = await Promise.all([
    getPageBySlug({ siteId, locale, slugSegments: slug, audience: "private-preview" }),
    getNavigation({ siteId, locale, key: "primary" }),
    getNavigation({ siteId, locale, key: "footer" }),
    getTemplateIdForSite({ siteId, locale }),
  ]);
  if (!page) notFound();
  const template = getTemplateModule(templateId);
  let runtime;
  try {
    runtime = loadPrivatePreviewLayoutRuntime();
  } catch {
    notFound();
  }
  return (
    <div data-private-preview="true" data-cms-revision={page.revision ?? "unknown"}>
      <template.PageRenderer
        page={page}
        primaryNav={primaryNav}
        footerNav={footerNav}
        siteKey={siteId}
        locale={locale}
        layoutPackId={runtime.layoutPackId}
        planId={runtime.planId}
      />
    </div>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { timingSafeEqual } from "node:crypto";

import { getNavigation } from "@/lib/repository/navigation";
import { getPageBySlug } from "@/lib/repository/pages";
import { getPreviewSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";
import { getTemplateIdForSite } from "@/lib/template-context";
import { getTemplateModule } from "@/templates/registry";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Props = { params: Promise<{ lang: string; token: string; slug?: string[] }> };

const hasPreviewAccess = (candidate: string): boolean => {
  const configured = process.env.PREVIEW_ACCESS_TOKEN;
  if (!configured || !candidate) return false;
  const left = Buffer.from(candidate);
  const right = Buffer.from(configured);
  return left.length === right.length && timingSafeEqual(left, right);
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Private preview",
    robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}

export default async function PrivateDemoPage({ params }: Props) {
  const { lang, token, slug = [] } = await params;
  if (!hasPreviewAccess(token)) notFound();

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
  return (
    <div data-private-preview="true" data-cms-revision={page.revision ?? "unknown"}>
      <template.PageRenderer
        page={page}
        primaryNav={primaryNav}
        footerNav={footerNav}
        siteKey={siteId}
        locale={locale}
      />
    </div>
  );
}

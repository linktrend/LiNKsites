import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";
import { getPageBySlug } from "@/lib/repository/pages";
import { getTemplateIdForSite } from "@/lib/template-context";
import { getTemplateModule } from "@/templates/registry";

export type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(lang);
  try {
    const page = await getPageBySlug({ siteId, locale, slugSegments: ["legal", "terms-of-use"] });
    if (page) {
      return buildMetadata(locale, "/legal/terms-of-use", {
        title: page.seo?.title ?? page.title,
        description: page.seo?.description,
        ogImage: (page.seo?.ogImage as any)?.url ?? undefined,
        canonicalUrl: page.seo?.canonicalUrl,
      });
    }
  } catch (error) {
    console.error("Error generating terms of use metadata:", error);
  }

  return { title: "Page unavailable", robots: { index: false, follow: false } };
}

export default async function TermsOfUsePage({ params }: Props) {
  const { lang } = await params;
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(lang);
  const page = await getPageBySlug({ siteId, locale, slugSegments: ["legal", "terms-of-use"] });
  if (!page) return notFound();
  const templateId = await getTemplateIdForSite({ siteId, locale });
  const template = getTemplateModule(templateId);
  return <template.PageRenderer page={page} siteKey={siteId} locale={locale} />;
}

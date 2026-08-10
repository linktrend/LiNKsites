import { notFound } from "next/navigation";
import { getCaseStudyPage } from "@/lib/pageService";
import { buildMetadata } from "@/lib/seo";
import { SEO_CONFIG } from "@/config";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";
import { CaseStudyLayout } from "@/layouts/CaseStudyLayout";

export type Props = { params: { lang: string; caseSlug: string } };

export async function generateMetadata({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  try {
    const page = await getCaseStudyPage(locale, siteId, params.caseSlug);
    const caseStudy = page?.data?.case;

    if (!caseStudy) {
      return buildMetadata(locale, `/resources/cases/${params.caseSlug}`);
    }

    const seo = (caseStudy as any).seo ?? {};

    return buildMetadata(locale, `/resources/cases/${params.caseSlug}`, {
      title: seo.title ?? caseStudy.title ?? "Case Study",
      description: seo.description ?? caseStudy.summary ?? "",
      keywords:
        seo.keywords && Array.isArray(seo.keywords)
          ? seo.keywords
          : [
              "case study",
              caseStudy.title || "",
              "success story",
              ...SEO_CONFIG.defaultKeywords,
            ].filter(Boolean),
      ogType: "article",
      ogImage: (seo.ogImage as any)?.url ?? undefined,
      canonicalUrl: seo.canonicalUrl,
    });
  } catch (error) {
    return buildMetadata(locale, `/resources/cases/${params.caseSlug}`);
  }
}

export default async function CaseStudyPage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const page = await getCaseStudyPage(locale, siteId, params.caseSlug);
  if (!page?.data?.case) return notFound();
  return <CaseStudyLayout lang={locale} page={page as any} />;
}

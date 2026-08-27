import { notFound } from "next/navigation";
import { getCaseStudyPage } from "@/lib/pageService";
import { buildMetadata } from "@/lib/seo/ssr-metadata";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";
import { CaseStudyLayout } from "@/layouts/CaseStudyLayout";

export type Props = { params: Promise<{ lang: string; caseSlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang, caseSlug } = await params;
  try {
    const { siteId, locale } = await requirePublicFamilyPage({
      lang,
      pathname: `/${lang}/resources/cases/${caseSlug}`,
    });
    const page = await getCaseStudyPage(locale, siteId, caseSlug);
    const caseStudy = page?.data?.case;
    if (!caseStudy) return { title: "Page unavailable", robots: { index: false, follow: false } };
    const seo = (caseStudy as { seo?: { title?: string; description?: string; canonicalUrl?: string } }).seo ?? {};
    return buildMetadata(locale, `/resources/cases/${caseSlug}`, {
      title: seo.title ?? caseStudy.title ?? "Case Study",
      description: seo.description ?? caseStudy.summary ?? "",
      canonicalUrl: seo.canonicalUrl,
    });
  } catch {
    return { title: "Page unavailable", robots: { index: false, follow: false } };
  }
}

export default async function CaseStudyPage({ params }: Props) {
  const { lang, caseSlug } = await params;
  const { siteId, locale } = await requirePublicFamilyPage({
    lang,
    pathname: `/${lang}/resources/cases/${caseSlug}`,
  });
  const page = await getCaseStudyPage(locale, siteId, caseSlug);
  if (!page?.data?.case) return notFound();
  return <CaseStudyLayout lang={locale} page={page as never} />;
}

import { CaseStudiesPageContent } from "@/components/resources/CaseStudiesPageContent";
import { buildMetadata } from "@/lib/seo";
import { getCasesPage } from "@/lib/pageService";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  try {
    const { locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/resources/cases` });
    return buildMetadata(locale, "/resources/cases", { title: "Case Studies" });
  } catch {
    return { title: "Page unavailable", robots: { index: false, follow: false } };
  }
}

export default async function CasesPage({ params }: Props) {
  const { lang } = await params;
  const { siteId, locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/resources/cases` });
  const page = await getCasesPage(locale, siteId);
  if (!page.data.cases.length) notFound();
  return <CaseStudiesPageContent lang={locale} cases={page.data.cases} />;
}

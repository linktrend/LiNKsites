import { CaseStudiesPageContent } from "@/components/resources/CaseStudiesPageContent";
import { buildMetadata } from "@/lib/seo";
import { getCasesPage } from "@/lib/pageService";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props) {
  const locale = normalizeLocale(params.lang);
  return buildMetadata(locale, "/resources/cases", {
    title: "Case Studies",
  });
}

export default async function CasesPage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const page = await getCasesPage(locale, siteId);
  if (page.data.cases.length === 0) return <CaseStudiesPageContent lang={locale} cases={[]} />;
  return <CaseStudiesPageContent lang={locale} cases={page.data.cases} />;
}

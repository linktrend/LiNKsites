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
    description: "Discover how leading companies transform their operations with our AI-powered automation platform. Real results from real customers.",
    keywords: [
      "case studies",
      "success stories",
      "customer testimonials",
      "business results",
      "ROI",
      "implementation",
    ],
  });
}

export default async function CasesPage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const page = await getCasesPage(locale, siteId);
  return <CaseStudiesPageContent lang={locale} cases={page.data.cases} />;
}

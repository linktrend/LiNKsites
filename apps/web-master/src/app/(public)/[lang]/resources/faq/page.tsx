import { notFound } from "next/navigation";
import { CmsFaqList } from "@/components/resources/CmsFaqList";
import { buildMetadata } from "@/lib/seo";
import { getFaqPage } from "@/lib/pageService";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";
import { tenantSafeWhere } from "@/lib/routes";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  try {
    const { locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/resources/faq` });
    return buildMetadata(locale, "/resources/faq", { title: "FAQ" });
  } catch {
    return { title: "Page unavailable", robots: { index: false, follow: false } };
  }
}

export default async function FaqPage({ params }: Props) {
  const { lang } = await params;
  const { siteId, locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/resources/faq` });
  const tenant = tenantSafeWhere(siteId, locale);
  const page = await getFaqPage(locale, tenant.siteId);
  if (page.data.faqs.length === 0) return notFound();
  return <CmsFaqList faqs={page.data.faqs} />;
}

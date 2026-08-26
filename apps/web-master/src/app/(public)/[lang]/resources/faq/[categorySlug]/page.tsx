import { notFound } from "next/navigation";
import { CmsFaqList } from "@/components/resources/CmsFaqList";
import { buildMetadata } from "@/lib/seo";
import { listFaq } from "@/lib/repository/faq";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";
import { tenantSafeWhere } from "@/lib/routes";

type Props = { params: Promise<{ lang: string; categorySlug: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang, categorySlug } = await params;
  try {
    const { locale } = await requirePublicFamilyPage({
      lang,
      pathname: `/${lang}/resources/faq/${categorySlug}`,
    });
    return buildMetadata(locale, `/resources/faq/${categorySlug}`, { title: "FAQ" });
  } catch {
    return { title: "Page unavailable", robots: { index: false, follow: false } };
  }
}

export default async function FaqCategoryPage({ params }: Props) {
  const { lang, categorySlug } = await params;
  const { siteId, locale } = await requirePublicFamilyPage({
    lang,
    pathname: `/${lang}/resources/faq/${categorySlug}`,
  });
  const tenant = tenantSafeWhere(siteId, locale);
  const faqs = (await listFaq(tenant)).filter((faq) => faq.slug === categorySlug);
  if (faqs.length === 0) return notFound();
  return <CmsFaqList faqs={faqs} />;
}

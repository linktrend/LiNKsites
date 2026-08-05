import { notFound } from "next/navigation";
import { CmsFaqList } from "@/components/resources/CmsFaqList";
import { buildMetadata } from "@/lib/seo";
import { listFaq } from "@/lib/repository/faq";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";

type Props = { params: { lang: string; categorySlug: string } };

export async function generateMetadata({ params }: Props) {
  const locale = normalizeLocale(params.lang);
  return buildMetadata(locale, `/resources/faq/${params.categorySlug}`, { title: "FAQ" });
}

export default async function FaqCategoryPage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const faqs = (await listFaq({ siteId, locale })).filter((faq) => faq.slug === params.categorySlug);
  if (faqs.length === 0) return notFound();
  return <CmsFaqList faqs={faqs} />;
}

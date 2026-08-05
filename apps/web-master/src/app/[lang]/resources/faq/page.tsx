import { notFound } from "next/navigation";
import { CmsFaqList } from "@/components/resources/CmsFaqList";
import { buildMetadata } from "@/lib/seo";
import { getFaqPage } from "@/lib/pageService";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";

type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props) {
  const locale = normalizeLocale(params.lang);
  return buildMetadata(locale, "/resources/faq", { title: "FAQ" });
}

export default async function FaqPage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const page = await getFaqPage(locale, siteId);
  if (page.data.faqs.length === 0) return notFound();
  return <CmsFaqList faqs={page.data.faqs} />;
}

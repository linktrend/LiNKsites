import { notFound } from "next/navigation";
import { getDocsPage } from "@/lib/pageService";
import { buildMetadata } from "@/lib/seo";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  try {
    const { locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/resources/docs` });
    return buildMetadata(locale, "/resources/docs", { title: "Documentation" });
  } catch {
    return { title: "Page unavailable", robots: { index: false, follow: false } };
  }
}

export default async function DocsPage({ params }: Props) {
  const { lang } = await params;
  await requirePublicFamilyPage({ lang, pathname: `/${lang}/resources/docs` });
  await getDocsPage(lang);
  notFound();
}

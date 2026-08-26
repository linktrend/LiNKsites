import { buildMetadata } from "@/lib/seo";
import { loadLegalFamilyPage } from "@/layouts/legal-family-page";

export type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  try {
    const { page, locale } = await loadLegalFamilyPage(lang, "terms-of-use");
    return buildMetadata(locale, "/legal/terms-of-use", {
      title: page.seo?.title ?? page.title,
      description: page.seo?.description,
      canonicalUrl: page.seo?.canonicalUrl,
    });
  } catch {
    return { title: "Page unavailable", robots: { index: false, follow: false } };
  }
}

export default async function TermsOfUsePage({ params }: Props) {
  const { lang } = await params;
  const { page, siteId, locale, template, runtime } = await loadLegalFamilyPage(lang, "terms-of-use");
  return (
    <template.PageRenderer
      page={page}
      siteKey={siteId}
      locale={locale}
      layoutPackId={runtime.layoutPackId}
      planId={runtime.planId}
    />
  );
}

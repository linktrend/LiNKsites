import { notFound } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { normalizeLocale } from "@/lib/locale-context";
import { getLegalBySlug } from "@/lib/repository/legal";
import { LegalLayout } from "@/layouts/LegalLayout";

export type Props = { params: { lang: string } };

export async function generateMetadata({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  try {
    const legal = await getLegalBySlug({ siteId, locale, slug: "terms-of-use" });
    if (legal) {
      const seo = (legal as any).seo ?? {};
      return buildMetadata(locale, "/legal/terms-of-use", {
        title: seo.title ?? legal.title ?? "Terms of Use",
        description: seo.description ?? legal.summary ?? legal.body ?? "Terms of use",
        ogImage: (seo.ogImage as any)?.url ?? undefined,
        canonicalUrl: seo.canonicalUrl,
      });
    }
  } catch (error) {
    console.error("Error generating terms of use metadata:", error);
  }

  return buildMetadata(locale, "/legal/terms-of-use", {
    title: "Terms of Use",
    description: "Review the terms that govern your use of our services.",
  });
}

export default async function TermsOfUsePage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const legal = await getLegalBySlug({ siteId, locale, slug: "terms-of-use" });
  if (!legal) return notFound();
  return <LegalLayout lang={locale} page={{ data: { legal } }} />;
}

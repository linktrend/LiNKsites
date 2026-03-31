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
    const legal = await getLegalBySlug({ siteId, locale, slug: "privacy-policy" });
    if (legal) {
      const seo = (legal as any).seo ?? {};
      return buildMetadata(locale, "/legal/privacy-policy", {
        title: seo.title ?? legal.title ?? "Privacy Policy",
        description: seo.description ?? legal.summary ?? legal.body ?? "Privacy policy",
        ogImage: (seo.ogImage as any)?.url ?? undefined,
        canonicalUrl: seo.canonicalUrl,
      });
    }
  } catch (error) {
    console.error("Error generating privacy policy metadata:", error);
  }

  return buildMetadata(locale, "/legal/privacy-policy", {
    title: "Privacy Policy",
    description: "Learn how we collect, use, and protect your personal information.",
  });
}

export default async function PrivacyPolicyPage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const legal = await getLegalBySlug({ siteId, locale, slug: "privacy-policy" });
  if (!legal) return notFound();
  return <LegalLayout lang={locale} page={{ data: { legal } }} />;
}

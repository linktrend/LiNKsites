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
    const legal = await getLegalBySlug({ siteId, locale, slug: "cookie-policy" });
    if (legal) {
      const seo = (legal as any).seo ?? {};
      return buildMetadata(locale, "/legal/cookie-policy", {
        title: seo.title ?? legal.title ?? "Cookie Policy",
        description: seo.description ?? legal.summary ?? legal.body ?? "Cookie policy",
        ogImage: (seo.ogImage as any)?.url ?? undefined,
        canonicalUrl: seo.canonicalUrl,
      });
    }
  } catch (error) {
    console.error("Error generating cookie policy metadata:", error);
  }

  return buildMetadata(locale, "/legal/cookie-policy", {
    title: "Cookie Policy",
    description: "Understand how cookies are used across the site.",
  });
}

export default async function CookiePolicyPage({ params }: Props) {
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const legal = await getLegalBySlug({ siteId, locale, slug: "cookie-policy" });
  if (!legal) return notFound();
  return <LegalLayout lang={locale} page={{ data: { legal } }} />;
}

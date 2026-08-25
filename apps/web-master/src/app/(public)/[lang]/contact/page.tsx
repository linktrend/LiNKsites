import { buildMetadata } from "@/lib/seo";
import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/repository/pages";
import { getTemplateIdForSite } from "@/lib/template-context";
import { getTemplateModule } from "@/templates/registry";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";
import { loadAcceptedLayoutRuntime } from "@/components/page-renderer/accepted-identities";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props) {
  const { lang } = await params;
  try {
    const { siteId, locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/contact` });
    const page = await getPageBySlug({ siteId, locale, slugSegments: ["contact"] });
    if (!page) throw new Error("missing");
    return buildMetadata(locale, "/contact", {
      title: page.seo?.title || page.title || "Contact",
      description: page.seo?.description,
    });
  } catch {
    return { title: "Page unavailable", robots: { index: false, follow: false } };
  }
}

export default async function ContactPage({ params }: Props) {
  const { lang } = await params;
  const { siteId, locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/contact` });
  const [page, templateId] = await Promise.all([
    getPageBySlug({ siteId, locale, slugSegments: ["contact"] }),
    getTemplateIdForSite({ siteId, locale }),
  ]);
  if (!page) notFound();
  const template = getTemplateModule(templateId);
  let runtime;
  try {
    runtime = loadAcceptedLayoutRuntime();
  } catch {
    notFound();
  }
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

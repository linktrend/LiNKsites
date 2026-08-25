import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/repository/pages";
import { getTemplateIdForSite } from "@/lib/template-context";
import { getTemplateModule } from "@/templates/registry";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";
import { loadAcceptedLayoutRuntime } from "@/components/page-renderer/accepted-identities";

export async function loadLegalFamilyPage(lang: string, slug: string) {
  const path = `legal/${slug}`;
  const { siteId, locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/${path}` });
  const page = await getPageBySlug({ siteId, locale, slugSegments: ["legal", slug] });
  if (!page) notFound();
  const templateId = await getTemplateIdForSite({ siteId, locale });
  const template = getTemplateModule(templateId);
  let runtime;
  try {
    runtime = loadAcceptedLayoutRuntime();
  } catch {
    notFound();
  }
  return { page, siteId, locale, template, runtime, path };
}

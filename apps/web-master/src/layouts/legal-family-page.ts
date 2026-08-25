import { notFound } from "next/navigation";
import { getPageBySlug } from "@/lib/repository/pages";
import { getTemplateIdForSite } from "@/lib/template-context";
import { getTemplateModule } from "@/templates/registry";
import { requirePublicFamilyPage } from "@/lib/public-route-guard";
import { getSiteSettings } from "@/lib/repository/siteSettings";
import { resolveLayoutRuntime } from "@/components/page-renderer/layout-packs";

export async function loadLegalFamilyPage(lang: string, slug: string) {
  const path = `legal/${slug}`;
  const { siteId, locale } = await requirePublicFamilyPage({ lang, pathname: `/${lang}/${path}` });
  const page = await getPageBySlug({ siteId, locale, slugSegments: ["legal", slug] });
  if (!page) notFound();
  const templateId = await getTemplateIdForSite({ siteId, locale });
  const template = getTemplateModule(templateId);
  const settings = await getSiteSettings({ siteId, locale }).catch(() => null);
  const runtime = resolveLayoutRuntime({
    layoutPackId: (settings as { layoutPackId?: unknown } | null)?.layoutPackId,
    planId: (settings as { planId?: unknown } | null)?.planId,
  });
  return { page, siteId, locale, template, runtime, path };
}

import { getSiteSettings } from "@/lib/repository/siteSettings";
import { assertTemplateAdmission } from "@/lib/template-admission";
import type { LocaleCode } from "@linksites/types";

export const getTemplateIdForSite = async ({
  siteId,
  locale,
}: {
  siteId: string;
  locale: LocaleCode;
}): Promise<string> => {
  const settings = await getSiteSettings({ siteId, locale });
  const templateId = settings?.templateId;
  if (!templateId) throw new Error(`Published site "${siteId}" has no admitted template selection`);
  assertTemplateAdmission(templateId);
  return templateId;
};

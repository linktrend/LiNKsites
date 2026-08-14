import { getSiteSettings } from "@/lib/repository/siteSettings";
import { assertTemplateAdmission, getAdmittedRevision2Template } from "@/lib/template-admission";
import { MASTER_TEMPLATE_ID } from "@linksites/factory-catalog";
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
  if (templateId === MASTER_TEMPLATE_ID || process.env.LINKSITES_TEMPLATE_FORMAT === "revision2") {
    const admitted = getAdmittedRevision2Template();
    if (admitted.reference.entryId !== templateId) throw new Error(`Published site selected template "${templateId}" but the pinned Revision 2 release is "${admitted.reference.entryId}"`);
  } else {
    assertTemplateAdmission(templateId);
  }
  return templateId;
};

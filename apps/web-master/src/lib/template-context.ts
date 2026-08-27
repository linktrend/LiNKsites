import { getSiteSettings } from "@/lib/repository/siteSettings";
import { assertTemplateAdmission, getAdmittedRevision2Template } from "@/lib/template-admission";
import { MASTER_TEMPLATE_PIN } from "@linksites/factory-catalog/master-template-pin";
import { isMasterTemplateLookAndFeelProofHarnessEnabled } from "@linksites/factory-catalog/master-template-preview-seam";
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
  if (templateId) {
    if (process.env.LINKSITES_TEMPLATE_FORMAT === "revision2" && templateId === MASTER_TEMPLATE_PIN.entryId) {
      const materialized = getAdmittedRevision2Template();
      if (materialized.reference.entryId !== templateId) {
        throw new Error(`Revision 2 provider release is for "${materialized.reference.entryId}", not "${templateId}"`);
      }
      return templateId;
    }
    assertTemplateAdmission(templateId);
    return templateId;
  }
  if (isMasterTemplateLookAndFeelProofHarnessEnabled()) {
    assertTemplateAdmission(MASTER_TEMPLATE_PIN.entryId);
    return MASTER_TEMPLATE_PIN.entryId;
  }
  throw new Error(`Published site "${siteId}" has no admitted template selection`);
};

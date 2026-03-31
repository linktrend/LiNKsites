import { DEFAULT_TEMPLATE_ID } from "@/templates/registry";
import { getSiteSettings } from "@/lib/repository/siteSettings";
import type { LocaleCode } from "@linksites/types";

export const getTemplateIdForSite = async ({
  siteId,
  locale,
}: {
  siteId: string;
  locale: LocaleCode;
}): Promise<string> => {
  try {
    const settings = await getSiteSettings({ siteId, locale });
    return settings?.templateId || DEFAULT_TEMPLATE_ID;
  } catch {
    return DEFAULT_TEMPLATE_ID;
  }
};

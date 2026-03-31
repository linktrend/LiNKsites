import { payloadFind } from "@/lib/payload-client";
import { siteLocaleFilter } from "@/lib/repository/shared-filters";

export interface CmsSiteSettings {
  id: string;
  site: string;
  locale: string;
  templateId?: string;
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
  branding?: {
    logo?: any;
    favicon?: any;
  };
  metadataDefaults?: {
    titleSuffix?: string;
    description?: string;
  };
}

export const getSiteSettings = async ({
  siteId,
  locale,
}: {
  siteId: string;
  locale: string;
}): Promise<CmsSiteSettings | null> => {
  const where = siteLocaleFilter(siteId, locale);

  const result = await payloadFind<CmsSiteSettings>({
    collection: "site-settings",
    where,
    limit: 1,
    depth: 2,
    locale,
    site: siteId,
  });

  return result.docs[0] ?? null;
};

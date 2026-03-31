import { payloadReadGlobal } from "@/lib/payload-client";

export interface CmsContact {
  page?: {
    title?: string;
    subtitle?: string;
    seoTitle?: string;
    seoDescription?: string;
  };
  intents?: any[];
  channels?: any[];
  helpDeflection?: any;
  trust?: any;
  contactForms?: any[];
}

type GetContactArgs = {
  siteKey: string;
  locale: string;
};

export const getContact = async ({ locale }: GetContactArgs): Promise<CmsContact | null> => {
  try {
    return await payloadReadGlobal<CmsContact>("contact", locale);
  } catch {
    return null;
  }
};

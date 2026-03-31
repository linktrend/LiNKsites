import { payloadReadGlobal } from "@/lib/payload-client";

export interface CmsAbout {
  heroTitle?: string;
  heroSubtitle?: string;
  sections?: Array<{ title?: string; body?: string }>;
}

export const getAbout = async (locale: string): Promise<CmsAbout | null> => {
  try {
    return await payloadReadGlobal<CmsAbout>("about", locale);
  } catch {
    return null;
  }
};

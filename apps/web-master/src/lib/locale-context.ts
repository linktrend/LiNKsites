import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/config";

export const SUPPORTED_LOCALES = SUPPORTED_LANGUAGES;

export type SupportedLocale = SupportedLanguage;

export const normalizeLocale = (langParam: string): SupportedLocale => {
  return SUPPORTED_LOCALES.includes(langParam as SupportedLocale)
    ? (langParam as SupportedLocale)
    : "en";
};

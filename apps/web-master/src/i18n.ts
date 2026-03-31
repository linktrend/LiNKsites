import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Can be imported from a shared config
export const locales = ['en', 'es', 'zh-tw', 'zh-cn'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Handle undefined locale by using default locale
  // This can happen when rendering pages outside [locale] segment (e.g., root not-found.tsx)
  const resolvedLocale = locale ?? 'en';
  
  // Validate that the resolved locale is valid
  if (!locales.includes(resolvedLocale as Locale)) {
    notFound();
  }

  return {
    locale: resolvedLocale as string,
    messages: {
      ...(await import(`../messages/${resolvedLocale}/common.json`)).default,
      navigation: (await import(`../messages/${resolvedLocale}/navigation.json`)).default,
      footer: (await import(`../messages/${resolvedLocale}/footer.json`)).default,
      pages: (await import(`../messages/${resolvedLocale}/pages.json`)).default,
    }
  };
});

import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { SUPPORTED_LANGUAGES, getThemeFromRequest } from "@/config";
import { getNavigation } from "@/lib/repository/navigation";
import { normalizeLocale } from "@/lib/locale-context";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { MarketingLayoutClient } from "@/components/layouts/MarketingLayoutClient";

// Multi-tenant websites must render per-request (hostname determines tenant).
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#0ea5e9",
};

export const metadata: Metadata = {
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
  },
};

export default async function LangLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { lang: string };
}) {
  const theme = await getThemeFromRequest();
  const siteId = await getSiteIdFromRequest();
  const locale = normalizeLocale(params.lang);
  const [primaryNav, footerNav] = await Promise.all([
    getNavigation({ siteId, locale, key: "primary" }),
    getNavigation({ siteId, locale, key: "footer" }),
  ]);
  const messages = await getMessages();

  return (
    <div data-theme={theme.id} data-lang={locale}>
      <NextIntlClientProvider messages={messages}>
        <MarketingLayoutClient lang={locale} primaryNav={primaryNav} footerNav={footerNav}>
          {children}
        </MarketingLayoutClient>
      </NextIntlClientProvider>
    </div>
  );
}

import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { getThemeFromRequest } from "@/config";
import { getNavigation } from "@/lib/repository/navigation";
import { getSiteSettings } from "@/lib/repository/siteSettings";
import { normalizeLocale } from "@/lib/locale-context";
import { getPublicSiteIdOrNull } from "@/lib/public-route-guard";
import { MarketingLayoutClient } from "@/components/layouts/MarketingLayoutClient";
import { resolveLayoutRuntime } from "@/components/page-renderer/layout-packs";

// Multi-tenant websites must render per-request (hostname determines tenant).
export const dynamic = "force-dynamic";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: "#1e5a40",
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
  params: Promise<{ lang: string }>;
}) {
  const theme = await getThemeFromRequest();
  const siteId = await getPublicSiteIdOrNull();
  if (!siteId) notFound();
  const { lang } = await params;
  const locale = normalizeLocale(lang);
  const [primaryNav, footerNav, settings] = await Promise.all([
    getNavigation({ siteId, locale, key: "primary" }),
    getNavigation({ siteId, locale, key: "footer" }),
    getSiteSettings({ siteId, locale }).catch(() => null),
  ]);
  const messages = await getMessages();
  const trafficSource = (await cookies()).get("lsites_source")?.value;
  const runtime = resolveLayoutRuntime({
    layoutPackId: (settings as { layoutPackId?: unknown } | null)?.layoutPackId,
    planId: (settings as { planId?: unknown } | null)?.planId,
  });

  return (
    <div data-theme={theme.id} data-lang={locale}>
      <NextIntlClientProvider messages={messages}>
        <MarketingLayoutClient
          lang={locale}
          primaryNav={primaryNav}
          footerNav={footerNav}
          trafficSource={trafficSource}
          planId={runtime.planId}
        >
          {children}
        </MarketingLayoutClient>
      </NextIntlClientProvider>
    </div>
  );
}

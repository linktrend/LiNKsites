import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { cookies } from "next/headers";
import { SUPPORTED_LANGUAGES, getThemeFromRequest } from "@/config";
import { getNavigation } from "@/lib/repository/navigation";
import { normalizeLocale } from "@/lib/locale-context";
import { getSiteIdFromRequest } from "@/lib/site-context";
import { MarketingLayoutClient } from "@/components/layouts/MarketingLayoutClient";
import { getAdmittedRevision2Template, getDraftRevision2TemplateForPairedProof } from "@/lib/template-admission";
import { readFileSync } from "node:fs";

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
  params: Promise<{ lang: string }>;
}) {
  const theme = await getThemeFromRequest();
  const siteId = await getSiteIdFromRequest();
  const { lang } = await params;
  const locale = normalizeLocale(lang);
  const [primaryNav, footerNav] = await Promise.all([
    getNavigation({ siteId, locale, key: "primary" }),
    getNavigation({ siteId, locale, key: "footer" }),
  ]);
  const messages = await getMessages();
  const trafficSource = (await cookies()).get("lsites_source")?.value;
  const providerTemplate = process.env.LINKSITES_PAIRED_PROOF === "1"
    ? getDraftRevision2TemplateForPairedProof()
    : process.env.LINKSITES_TEMPLATE_FORMAT === "revision2"
      ? getAdmittedRevision2Template()
      : null;
  const providerTokenCss = process.env.LINKSITES_PAIRED_PROOF_TOKEN_CSS_PATH
    ? readFileSync(process.env.LINKSITES_PAIRED_PROOF_TOKEN_CSS_PATH, "utf8")
    : providerTemplate?.files["design/tokens.css"];

  return (
    <div data-theme={theme.id} data-lang={locale}>
      {providerTokenCss ? <style data-linksites-provider-tokens dangerouslySetInnerHTML={{ __html: providerTokenCss }} /> : null}
      <NextIntlClientProvider messages={messages}>
        <MarketingLayoutClient
          lang={locale}
          primaryNav={primaryNav}
          footerNav={footerNav}
          trafficSource={trafficSource}
        >
          {children}
        </MarketingLayoutClient>
      </NextIntlClientProvider>
    </div>
  );
}

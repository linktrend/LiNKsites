"use client";

import { ReactNode } from "react";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { CookieConsentBanner } from "@/components/common/CookieConsentBanner";
import { NewsletterSection } from "@/components/common/NewsletterSection";
import { CmsNavigation } from "@/lib/repository/navigation";
import type { PlanId } from "@/components/page-renderer/layout-packs";
import { resolveShell } from "@/components/shell/resolved-shell";

type Props = {
  lang: string;
  primaryNav?: CmsNavigation | null;
  footerNav?: CmsNavigation | null;
  children: ReactNode;
  trafficSource?: string;
  planId: PlanId;
};

export function MarketingLayoutClient({
  lang,
  primaryNav,
  footerNav,
  children,
  trafficSource,
  planId,
}: Props) {
  const shell = resolveShell({ locale: lang, planId });
  const isolated = shell.typeLShellMode === "isolated";

  return (
    <div
      className="flex min-h-screen flex-col"
      data-traffic-source={trafficSource ?? "direct"}
      data-plan-id={planId}
      data-type-l-shell={shell.typeLShellMode}
      data-no-placeholders="true"
    >
      <Header lang={lang} navigation={primaryNav} planId={planId} />
      <main data-shell-region="main" className="flex-1">
        {children}
      </main>
      {!isolated ? <NewsletterSection lang={lang} /> : null}
      <Footer lang={lang} navigation={footerNav} planId={planId} />
      {!isolated ? <CookieConsentBanner lang={lang} /> : null}
    </div>
  );
}

"use client";

import { ReactNode, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Header } from "@/components/navigation/Header";
import { Footer } from "@/components/navigation/Footer";
import { CookieConsentBanner } from "@/components/common/CookieConsentBanner";
import { NewsletterSection } from "@/components/common/NewsletterSection";
import { CmsNavigation } from "@/lib/repository/navigation";

type Props = {
  lang: string;
  primaryNav?: CmsNavigation | null;
  footerNav?: CmsNavigation | null;
  children: ReactNode;
  trafficSource?: string;
};

export function MarketingLayoutClient({ lang, primaryNav, footerNav, children, trafficSource }: Props) {
  const pathname = usePathname();
  
  const isHomepage = useMemo(() => 
    pathname === `/${lang}` || pathname === `/${lang}/`, 
    [pathname, lang]
  );
  
  const isPricingPage = useMemo(() => 
    pathname === `/${lang}/pricing` || pathname === `/${lang}/pricing/`, 
    [pathname, lang]
  );

  return (
    <div className="flex min-h-screen flex-col" data-traffic-source={trafficSource ?? "direct"}>
      <Header lang={lang} navigation={primaryNav} />
      <main className="flex-1">{children}</main>
      {!isHomepage && !isPricingPage && <NewsletterSection lang={lang} />}
      <Footer lang={lang} navigation={footerNav} />
      <CookieConsentBanner lang={lang} />
    </div>
  );
}

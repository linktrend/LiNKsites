"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { CmsNavigation } from "@/lib/repository/navigation";
import { CookiePreferencesModal } from "@/components/modals/CookiePreferencesModal";
import { COMPANY_INFO, getSiteName } from "@/config";
import { routes } from "@/lib/routes";
import type { PlanId } from "@/components/page-renderer/layout-packs";
import { FOOTER_ZONES, resolveShell, resolvedSocialLinks } from "@/components/shell/resolved-shell";

type Props = { lang: string; navigation?: CmsNavigation | null; planId?: PlanId };

export function Footer({ lang, navigation, planId = "A" }: Props) {
  const t = useTranslations();
  const tFooter = useTranslations("footer");
  const [cookieModalOpen, setCookieModalOpen] = useState(false);
  const siteName = getSiteName();
  const shell = resolveShell({ locale: lang, planId });
  const isolated = shell.typeLShellMode === "isolated";
  const navItems = isolated ? [] : navigation?.items ?? [];
  const social = isolated ? [] : resolvedSocialLinks(COMPANY_INFO.social);
  const contactEmail = COMPANY_INFO.email?.trim();
  const contactPhone = COMPANY_INFO.phone?.trim();

  return (
    <footer
      data-shell-region="site-footer"
      data-shell-footer={shell.footer}
      data-footer-zones={FOOTER_ZONES.join(" ")}
      data-type-l={isolated ? "isolated" : "not-applicable"}
      className="mt-8 border-t text-white safe-bottom"
      style={{ backgroundImage: "var(--gradient-surface-footer)" }}
    >
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12 pb-4 sm:pb-6 space-y-8 sm:space-y-10">
        {isolated ? (
          <div data-footer-zone="policy" className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-white/80">
            <p>{t("copyright", { siteName })}</p>
            <div className="flex flex-wrap gap-3">
              <Link href={routes.privacyPolicy(lang)} className="hover:text-white/60">
                {tFooter("legal.privacyPolicy")}
              </Link>
              <Link href={routes.termsOfUse(lang)} className="hover:text-white/60">
                {tFooter("legal.termsOfUse")}
              </Link>
              <Link href={routes.cookiePolicy(lang)} className="hover:text-white/60">
                {tFooter("legal.cookiePolicy")}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-6 mb-6">
              <div data-footer-zone="brand" className="flex flex-col gap-3">
                <span className="text-base sm:text-lg font-bold">{siteName}</span>
                <p className="text-xs sm:text-sm text-white/80 max-w-md">{tFooter("description")}</p>
              </div>

              <div data-footer-zone="navigation">
                <p className="font-semibold text-xs sm:text-sm mb-3 text-white">Explore</p>
                <ul className="space-y-1">
                  {navItems.map((item) => (
                    <li key={item.id}>
                      <Link href={item.url} className="text-xs sm:text-sm text-white/70 hover:text-white">
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div data-footer-zone="contact">
                <p className="font-semibold text-xs sm:text-sm mb-3 text-white">Contact</p>
                <ul className="space-y-1 text-xs sm:text-sm text-white/70">
                  {contactEmail ? (
                    <li>
                      <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
                    </li>
                  ) : null}
                  {contactPhone ? (
                    <li>
                      <a href={`tel:${contactPhone}`}>{contactPhone}</a>
                    </li>
                  ) : null}
                  <li>
                    <Link href={routes.contact(lang)} className="hover:text-white">
                      Contact
                    </Link>
                  </li>
                </ul>
              </div>

              <div data-footer-zone="social">
                <p className="font-semibold text-xs sm:text-sm mb-3 text-white">Social</p>
                {social.length === 0 ? (
                  <p className="text-xs text-white/60">No published social profiles.</p>
                ) : (
                  <ul className="space-y-1">
                    {social.map((item) => (
                      <li key={item.name}>
                        <a href={item.href} className="text-xs sm:text-sm text-white/70 hover:text-white" rel="noopener noreferrer">
                          {item.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div data-footer-zone="policy">
                <p className="font-semibold text-xs sm:text-sm mb-3 text-white">Policy</p>
                <ul className="space-y-1 text-xs sm:text-sm text-white/70">
                  <li>
                    <Link href={routes.termsOfUse(lang)} className="hover:text-white">
                      {tFooter("legal.termsOfUse")}
                    </Link>
                  </li>
                  <li>
                    <Link href={routes.privacyPolicy(lang)} className="hover:text-white">
                      {tFooter("legal.privacyPolicy")}
                    </Link>
                  </li>
                  <li>
                    <Link href={routes.cookiePolicy(lang)} className="hover:text-white">
                      {tFooter("legal.cookiePolicy")}
                    </Link>
                  </li>
                  <li>
                    <button type="button" onClick={() => setCookieModalOpen(true)} className="hover:text-white">
                      {t("manageCookies")}
                    </button>
                  </li>
                </ul>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-white/80">{t("copyright", { siteName })}</p>
          </>
        )}
      </div>
      <CookiePreferencesModal isOpen={cookieModalOpen} onClose={() => setCookieModalOpen(false)} />
    </footer>
  );
}

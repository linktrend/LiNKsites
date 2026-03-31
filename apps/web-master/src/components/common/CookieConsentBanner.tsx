"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { CookiePreferencesModal } from "@/components/modals/CookiePreferencesModal";
import { getSiteName } from "@/config";
import { initializeAnalytics } from "@/lib/analytics";

type Props = { lang: string };

const setCookie = (name: string, value: string, days: number) => {
  if (typeof document === 'undefined') return;
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${name}=${value}; expires=${expires}; path=/`;
};

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEQ = `${name}=`;
  return document.cookie.split(";").reduce<string | null>((acc, raw) => {
    const cookie = raw.trim();
    if (cookie.startsWith(nameEQ)) return cookie.substring(nameEQ.length);
    return acc;
  }, null);
};

export function CookieConsentBanner({ lang }: Props) {
  const t = useTranslations();
  const [showBanner, setShowBanner] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const siteName = getSiteName();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    
    if (!getCookie("cookie_consent")) {
      setShowBanner(true);
    }
    
    // Listen for custom event to open cookie modal from other pages
    const handleOpenCookieModal = () => {
      setModalOpen(true);
    };
    
    window.addEventListener('openCookieModal', handleOpenCookieModal);
    
    return () => {
      window.removeEventListener('openCookieModal', handleOpenCookieModal);
    };
  }, [isMounted]);

  const acceptAll = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    setCookie("cookie_consent", "all", 365);
    localStorage.setItem(
      "cookiePreferences",
      JSON.stringify({ necessary: true, functional: true, analytics: true, marketing: true })
    );
    
    // Trigger analytics initialization immediately
    initializeAnalytics();
    
    // Dispatch custom event for other listeners
    window.dispatchEvent(new Event('consentChanged'));
    
    setShowBanner(false);
  };

  const handleModalClose = () => {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      setShowBanner(false);
      setModalOpen(false);
      return;
    }
    
    if (!getCookie("cookie_consent")) {
      setCookie("cookie_consent", "managed", 365);
    }
    setShowBanner(false);
    setModalOpen(false);
  };

  if (!isMounted || !showBanner) return null;

  const message = t("cookies.banner.message", {
    siteName,
    privacyPolicy: t("legal.privacyPolicy"),
  });

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-white/95 backdrop-blur p-4 shadow-lg">
        <div className="container mx-auto flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-slate-700">
            {message}{" "}
            <Link href={`/${lang}/legal/cookie-policy`} className="underline font-medium">
              {t("legal.privacyPolicy")}
            </Link>
          </p>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setModalOpen(true)}>
              {t("cookies.banner.manageCookies")}
            </Button>
            <Button onClick={acceptAll}>{t("cookies.banner.acceptAll")}</Button>
          </div>
        </div>
      </div>
      <CookiePreferencesModal isOpen={modalOpen} onClose={handleModalClose} />
    </>
  );
}

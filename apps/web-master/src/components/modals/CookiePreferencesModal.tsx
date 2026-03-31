"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";
import { getSiteName } from "@/config";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { initializeAnalytics, unloadAnalytics, getConsentPreferences } from "@/lib/analytics";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

type Preferences = {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
};

export function CookiePreferencesModal({ isOpen, onClose }: Props) {
  const t = useTranslations();
  const [preferences, setPreferences] = useState<Preferences>({
    necessary: true,
    functional: true,
    analytics: false,
    marketing: false
  });
  const [policyOpen, setPolicyOpen] = useState(false);
  const siteName = getSiteName();
  const siteNameLower = siteName.toLowerCase().replace(/\s+/g, '');
  const cookiePolicyBody = "";

  useEffect(() => {
    if (!isOpen) {
      setPolicyOpen(false);
    } else {
      // Load current preferences when modal opens
      const currentPreferences = getConsentPreferences();
      if (currentPreferences) {
        setPreferences(currentPreferences);
      }
    }
  }, [isOpen]);

  const handleSave = () => {
    const previousPreferences = getConsentPreferences();
    
    // Save new preferences
    localStorage.setItem("cookiePreferences", JSON.stringify(preferences));
    
    // Check if analytics/marketing consent changed
    const analyticsChanged = previousPreferences?.analytics !== preferences.analytics;
    const marketingChanged = previousPreferences?.marketing !== preferences.marketing;
    
    if (analyticsChanged || marketingChanged) {
      // If consent was revoked, unload analytics first
      if (previousPreferences?.analytics && !preferences.analytics) {
        unloadAnalytics();
      }
      
      // Reinitialize with new preferences
      initializeAnalytics();
      
      // Dispatch custom event for other listeners
      window.dispatchEvent(new Event('consentChanged'));
    }
    
    onClose();
  };

  const handleAcceptAll = () => {
    setPreferences({ necessary: true, functional: true, analytics: true, marketing: true });
  };

  const handleRejectAll = () => {
    setPreferences({ necessary: true, functional: false, analytics: false, marketing: false });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{t("cookies.modal.title")}</DialogTitle>
          <DialogDescription>{t("cookies.modal.description", { siteName })}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <PreferenceRow
            id="necessary"
            title={t("cookies.modal.necessary")}
            description={t("cookies.modal.necessaryDesc", { siteName })}
            checked={preferences.necessary}
            disabled
            onChange={() => undefined}
          />
          <PreferenceRow
            id="functional"
            title={t("cookies.modal.functionalCookies")}
            description={t("cookies.modal.functionalCookiesDesc")}
            checked={preferences.functional}
            onChange={(checked) => setPreferences((prev) => ({ ...prev, functional: checked }))}
          />
          <PreferenceRow
            id="analytics"
            title={t("cookies.modal.analyticsCookies")}
            description={t("cookies.modal.analyticsCookiesDesc")}
            checked={preferences.analytics}
            onChange={(checked) => setPreferences((prev) => ({ ...prev, analytics: checked }))}
          />
          <PreferenceRow
            id="marketing"
            title={t("cookies.modal.marketingCookies")}
            description={t("cookies.modal.marketingCookiesDesc", { siteName })}
            checked={preferences.marketing}
            onChange={(checked) => setPreferences((prev) => ({ ...prev, marketing: checked }))}
          />
        </div>

        <div className="border-t pt-4">
          <button
            type="button"
            onClick={() => setPolicyOpen((open) => !open)}
            className="flex w-full items-center justify-between text-sm font-semibold text-slate-900 hover:text-primary transition-colors"
          >
            {t("cookies.modal.policyTitle")}
            <ChevronDown className={`h-4 w-4 transition-transform ${policyOpen ? "rotate-180" : ""}`} />
          </button>
          {policyOpen && (
            <div className="mt-3 max-h-48 overflow-y-auto space-y-3 text-sm text-slate-600 leading-relaxed">
              {cookiePolicyBody ? (
                <div dangerouslySetInnerHTML={{ __html: cookiePolicyBody }} />
              ) : (
                <>
                  <p>{t("cookies.modal.policyText", { siteName })}</p>
                  <p>{t("cookies.modal.policyContact", { siteName, siteNameLower })}</p>
                </>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleRejectAll} className="w-full sm:w-auto">
            {t("cookies.modal.rejectAll")}
          </Button>
          <Button variant="outline" onClick={handleAcceptAll} className="w-full sm:w-auto">
            {t("cookies.modal.acceptAll")}
          </Button>
          <Button onClick={handleSave} className="w-full sm:w-auto">
            {t("cookies.modal.savePreferences")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PreferenceRow({
  id,
  title,
  description,
  checked,
  disabled,
  onChange
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between space-x-4">
      <div className="space-y-1">
        <Label htmlFor={id} className="text-base font-medium">
          {title}
        </Label>
        <p className="text-sm text-slate-600">{description}</p>
      </div>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onChange} className="mt-1" />
    </div>
  );
}

"use client";

import { useState, useId, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { signupFormSchema, SignupFormData } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, Check } from "lucide-react";

interface SignupHeroProps {
  lang: string;
}

export function SignupHero({ lang }: SignupHeroProps) {
  const t = useTranslations();
  const tPages = useTranslations("pages");
  const [showEmailPhone, setShowEmailPhone] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupFormSchema),
    defaultValues: {
      email: "",
      phone: "",
      acceptedTerms: false,
    },
  });

  const acceptedTerms = watch("acceptedTerms");
  const email = watch("email");
  const phone = watch("phone");
  const emailId = useId();
  const phoneId = useId();
  const termsId = useId();

  const onSubmit = (data: SignupFormData) => {
    // Navigate to contact page with form data
    console.log("Signup data:", data);
    window.open(`/${lang}/contact`, "_self");
  };

  const trustBullets = [
    t("trust.noCreditCard"),
    t("trust.cancelAnytime"),
    t("trust.skipOnboarding"),
    t("trust.privacyFriendly"),
  ];

  // Prevent hydration mismatch by rendering skeleton until mounted
  if (!isMounted) {
    return (
      <div className="flex h-full flex-col gap-4 sm:gap-6 rounded-xl bg-white/5 p-4 sm:p-6 backdrop-blur">
        <div className="space-y-2">
          <div className="h-8 bg-white/10 rounded animate-pulse" />
          <div className="h-6 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="h-10 bg-white/10 rounded animate-pulse" />
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 bg-white/10 rounded animate-pulse" />
          ))}
        </div>
        <div className="h-12 bg-white/10 rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div
      className="flex h-full flex-col gap-4 sm:gap-6 rounded-xl bg-white/5 p-4 sm:p-6 backdrop-blur"
      data-cms-component="signup-hero"
    >
      <div className="space-y-2 text-white">
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-bold leading-tight"
          data-cms-field="signup.title"
        >
          {tPages("home.signup.title")}
        </h1>
        <p
          className="text-base sm:text-lg text-white/70"
          data-cms-field="signup.subtitle"
        >
          {tPages("home.signup.subtitle")}
        </p>
      </div>

      {/* Continue with text */}
      <p
        className="text-sm text-white/80 text-center"
        data-cms-field="signup.continueWithText"
      >
        {tPages("home.signup.continueWith")}
      </p>

      {/* OAuth buttons */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3" data-cms-field="signup.oauthButtons">
        {["google", "apple", "microsoft"].map((provider) => (
          <button
            key={provider}
            type="button"
            className="rounded-lg border border-white/20 bg-white/10 p-3 sm:p-2.5 md:p-2 text-xs sm:text-sm font-semibold text-white hover:bg-white/20 active:bg-white/30 transition-all touch-target sm:touch-target-auto min-h-[44px] sm:min-h-0"
            data-cms-field={`signup.oauth.${provider}`}
          >
            {tPages(`home.signup.oauth.${provider}`)}
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="flex-grow border-t border-border"></div>
        <span
          className="relative z-10 bg-background px-2 text-xs uppercase text-muted-foreground rounded"
          data-cms-field="signup.dividerText"
        >
          {t("divider.or")}
        </span>
        <div className="flex-grow border-t border-border"></div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        {/* Collapsible email/phone section */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setShowEmailPhone(!showEmailPhone)}
            className="w-full flex items-center justify-between rounded-lg border border-white/20 bg-white/10 p-3 text-sm font-semibold text-white hover:bg-white/20 active:bg-white/30 transition-all min-h-[44px]"
            data-cms-field="signup.emailPhoneToggle"
          >
            <span>{tPages("home.signup.emailPhoneToggle")}</span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${
                showEmailPhone ? "rotate-180" : ""
              }`}
            />
          </button>

          {showEmailPhone && (
            <div className="grid gap-3 sm:gap-4 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-2">
                  <Label
                    htmlFor={emailId}
                    className="text-white text-sm sm:text-base"
                    data-cms-field="signup.emailLabel"
                  >
                    {t("labels.email")}
                  </Label>
                  <Input
                    id={emailId}
                    type="email"
                    placeholder={t("placeholders.email")}
                    {...register("email")}
                    className="bg-black/20 border-white/30 text-white placeholder:text-white/60 h-11 sm:h-10 md:h-10 text-base sm:text-sm"
                    data-cms-field="signup.emailInput"
                  />
                  {errors.email && (
                    <p className="text-sm text-red-300 mt-1">
                      {t(errors.email.message as string)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor={phoneId}
                    className="text-white text-sm sm:text-base"
                    data-cms-field="signup.phoneLabel"
                  >
                    {t("labels.phone")}
                  </Label>
                  <Input
                    id={phoneId}
                    type="tel"
                    placeholder={t("placeholders.phone")}
                    {...register("phone")}
                    className="bg-black/20 border-white/30 text-white placeholder:text-white/60 h-11 sm:h-10 md:h-10 text-base sm:text-sm"
                    data-cms-field="signup.phoneInput"
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-300 mt-1">
                      {t(errors.phone.message as string)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Trust bullets - two columns */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2" data-cms-field="signup.trustBullets">
          {trustBullets.map((bullet, index) => (
            <div
              key={bullet}
              className="flex items-start gap-2"
              data-cms-field={`signup.trustBullet.${index}`}
            >
              <Check className="h-4 w-4 text-white/80 flex-shrink-0 mt-0.5" />
              <span className="text-xs text-white/80 leading-tight">{bullet}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <Button
          type="submit"
          disabled={(showEmailPhone && !email && !phone) || !acceptedTerms}
          className="w-full text-base sm:text-base md:text-lg h-12 sm:h-10 md:h-10 btn-accent-red disabled:opacity-70 touch-target sm:touch-target-auto active:scale-[0.98] sm:active:scale-100 transition-transform"
          data-cms-field="signup.ctaButton"
        >
          {t("buttons.createAccount")}
        </Button>

        {/* Legal text with checkbox below button */}
        <div className="flex items-start gap-2 justify-center">
          <Checkbox
            id={termsId}
            checked={acceptedTerms}
            onCheckedChange={(checked) => setValue("acceptedTerms", Boolean(checked))}
            className="mt-0.5 h-4 w-4 sm:h-4 sm:w-4"
            data-cms-field="signup.termsCheckbox"
          />
          <div
            className="text-xs text-white/70 leading-relaxed text-center"
            data-cms-field="signup.legalText"
          >
            <label htmlFor={termsId} className="cursor-pointer hover:text-white transition-colors">
              {t("legal.acceptTerms")}
            </label>
            <br />
            <Link
              href={`/${lang}/legal/privacy-policy`}
              className="text-primary hover:underline active:underline"
            >
              {t("legal.privacyPolicy")}
            </Link>{" "}
            {t("legal.and")}{" "}
            <Link
              href={`/${lang}/legal/terms-of-use`}
              className="text-primary hover:underline active:underline"
            >
              {t("legal.termsOfUse")}
            </Link>
          </div>
        </div>
        {errors.acceptedTerms && (
          <p className="text-sm text-red-300 text-center">
            {t(errors.acceptedTerms.message as string)}
          </p>
        )}
      </form>
    </div>
  );
}

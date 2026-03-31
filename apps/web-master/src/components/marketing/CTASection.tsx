"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getSiteName } from "@/config";
import { routes } from "@/lib/routes";

interface CTASectionProps {
  lang: string;
  data?: Record<string, unknown>;
}

type CTAData = {
  title?: string;
  body?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  trustIndicators?: string[];
};

export function CTASection({ lang, data }: CTASectionProps) {
  const t = useTranslations();
  const siteName = getSiteName();
  const parsed = (data ?? {}) as CTAData;
  
  const trustIndicators =
    parsed.trustIndicators && Array.isArray(parsed.trustIndicators) && parsed.trustIndicators.length > 0
      ? parsed.trustIndicators
      : [
          t("cta.trustIndicators.noCreditCard"),
          t("cta.trustIndicators.freeTemplates"),
          t("cta.trustIndicators.cancelAnytime"),
        ];

  const title = parsed.title ?? t("cta.ready");
  const description = parsed.body ?? t("cta.description", { siteName });
  const ctaLabel = parsed.ctaLabel ?? t("cta.getStartedFree");
  const ctaUrl = parsed.ctaUrl ?? routes.contact(lang);
  
  return (
    <Card className="h-full rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-white">
      <CardContent className="flex h-full flex-col gap-6 px-8 pt-10 pb-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="text-lg text-muted-foreground">
            {description}
          </p>
        </div>
        <Button className="w-full bg-rose-500 text-white hover:bg-rose-600" size="lg" asChild>
          <Link href={ctaUrl}>{ctaLabel}</Link>
        </Button>
        <div className="space-y-2">
          {trustIndicators.map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="h-3 w-3" />
              </span>
              {item}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

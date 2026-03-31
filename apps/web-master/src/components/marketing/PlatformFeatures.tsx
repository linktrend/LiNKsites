"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Zap, TrendingUp, Sparkles, HeadphonesIcon, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteName } from "@/config";

interface PlatformFeaturesProps {
  lang: string;
}

export const PlatformFeatures = forwardRef<HTMLDivElement, PlatformFeaturesProps>(
  ({ lang }, gridRef) => {
    const t = useTranslations();
    const siteName = getSiteName();
    
    const features = [
  {
    icon: Zap,
    title: t("pages.home.platformFeatures.0.title"),
    description: t("pages.home.platformFeatures.0.description", { siteName }),
    href: "/offers/ai-automation"
  },
  {
    icon: TrendingUp,
    title: t("pages.home.platformFeatures.1.title"),
    description: t("pages.home.platformFeatures.1.description"),
    href: "/offers/data-insights"
  },
  {
    icon: Sparkles,
    title: t("pages.home.platformFeatures.2.title"),
    description: t("pages.home.platformFeatures.2.description"),
    href: "/resources/articles"
  },
  {
    icon: HeadphonesIcon,
    title: t("pages.home.platformFeatures.3.title"),
    description: t("pages.home.platformFeatures.3.description"),
    href: "/contact"
  }
];

    return (
      <div className="flex h-full flex-col" id="platform-features-container">
        <div className="space-y-2 pt-6">
          <h2 className="text-3xl font-bold">{t("pages.home.platformFeaturesTitle")}</h2>
          <p className="text-lg text-muted-foreground">{t("pages.home.platformFeaturesSubtitle")}</p>
        </div>
        <div ref={gridRef} id="platform-features-grid" className="grid gap-6 md:grid-cols-2 mt-24">
        {features.map(({ icon: Icon, title, description, href }) => (
          <Card key={title} className="group flex h-full flex-col border-slate-200 hover:border-primary/40 hover:shadow-lg">
            <CardHeader>
              <div className="mb-2 inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between">
              <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
              <Link
                href={`/${lang}${href}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                {t("buttons.learnMore")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    );
  }
);

PlatformFeatures.displayName = "PlatformFeatures";

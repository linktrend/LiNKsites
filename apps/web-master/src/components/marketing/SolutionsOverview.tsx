"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Users, Building2, TrendingUp, UserCheck, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSiteName } from "@/config";

interface SolutionsOverviewProps {
  lang: string;
}

export function SolutionsOverview({ lang }: SolutionsOverviewProps) {
  const t = useTranslations();
  const siteName = getSiteName();
  
  const solutions = [
  {
    icon: Users,
    title: t("pages.home.solutions.0.title"),
    description: t("pages.home.solutions.0.description", { siteName }),
    href: "/offers/ai-automation"
  },
  {
    icon: Building2,
    title: t("pages.home.solutions.1.title"),
    description: t("pages.home.solutions.1.description"),
    href: "/resources/cases"
  },
  {
    icon: TrendingUp,
    title: t("pages.home.solutions.2.title"),
    description: t("pages.home.solutions.2.description"),
    href: "/resources/articles"
  },
  {
    icon: UserCheck,
    title: t("pages.home.solutions.3.title"),
    description: t("pages.home.solutions.3.description"),
    href: "/resources/videos"
  }
];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold">{t("pages.home.solutionsTitle")}</h2>
        <p className="text-lg text-muted-foreground">{t("pages.home.solutionsSubtitle", { siteName })}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {solutions.map(({ icon: Icon, title, description, href }) => (
          <Card key={title} className="group border-slate-200 hover:border-primary/40 hover:shadow-lg">
            <CardHeader>
              <div className="inline-flex rounded-lg bg-primary/10 p-2 text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-base leading-relaxed">{description}</CardDescription>
              <Link href={`/${lang}${href}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
                {t("buttons.explore")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

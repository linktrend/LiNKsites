"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getFallbackImage } from "@/lib/imageFallback";
import type { CmsCaseStudy } from "@/lib/repository/caseStudies";

interface Props {
  lang: string;
  cases: CmsCaseStudy[];
}

export function CaseStudiesGrid({ lang, cases }: Props) {
  const t = useTranslations();
  const tPages = useTranslations('pages');
  // Deterministic selection to keep SSR/CSR consistent
  const selectedCases = cases.slice(0, Math.min(4, cases.length));

  // Handle empty state
  if (cases.length === 0) {
    return (
      <div className="flex h-full flex-col" id="case-studies-container">
        <div className="space-y-2 pt-6">
          <h2 className="text-3xl font-bold">{tPages('home.caseStudies.title')}</h2>
          <p className="text-lg text-muted-foreground">{tPages('home.caseStudies.subtitle')}</p>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <p>No case studies available at the moment. Check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" id="case-studies-container">
      <div className="space-y-2 pt-6">
        <h2 className="text-3xl font-bold">{tPages('home.caseStudies.title')}</h2>
        <p className="text-lg text-muted-foreground">{tPages('home.caseStudies.subtitle')}</p>
      </div>
      <div id="case-studies-grid" className={`grid gap-6 mt-8 ${
        selectedCases.length === 1 ? 'md:grid-cols-1 max-w-2xl mx-auto' :
        selectedCases.length === 2 ? 'md:grid-cols-2' :
        selectedCases.length === 3 ? 'md:grid-cols-3' :
        'md:grid-cols-2'
      }`}>
        {selectedCases.map((caseStudy) => (
          <Card 
            key={caseStudy.slug} 
            className="group flex h-full flex-col border-slate-200 hover:border-primary/40 hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Case Study Image */}
            <div className="relative w-full aspect-[16/9] overflow-hidden">
              <Image
                src={getFallbackImage('case')}
                alt={caseStudy.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <CardHeader>
              <CardTitle className="text-xl line-clamp-2">{caseStudy.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-between">
              <CardDescription className="text-base leading-relaxed line-clamp-3">
                {caseStudy.summary}
              </CardDescription>
              <Link
                href={`/${lang}/resources/cases/${caseStudy.slug}`}
                className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary"
              >
                {t('readCaseStudy')}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Sparkles, Zap, BarChart3, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CmsOffer } from "@/lib/repository/offers";
import { APP_URLS } from "@/config";
import { routes } from "@/lib/routes";

interface Props {
  lang: string;
  offers: CmsOffer[];
}

// Icon mapping for offers
const iconMap: Record<string, any> = {
  "ai-automation-platform": Sparkles,
  "data-analytics-suite": BarChart3,
  "ai-strategy-implementation": Zap,
  "data-engineering-integration": Cog,
};

export function OfferShowcase({ lang, offers }: Props) {
  const t = useTranslations();
  const tPages = useTranslations('pages');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-rotate carousel (slow - every 6 seconds)
  useEffect(() => {
    if (offers.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [offers.length, isPaused]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + offers.length) % offers.length);
    setIsPaused(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % offers.length);
    setIsPaused(true);
  };

  const handleDotClick = (index: number) => {
    setCurrentIndex(index);
    setIsPaused(true);
  };

  // Single offer - Featured block
  if (offers.length === 1) {
    const offer = offers[0];
    const Icon = iconMap[offer.slug] || Sparkles;

    return (
      <div className="container px-4 sm:px-6" data-cms-component="offer-showcase">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-3" data-cms-field="offerShowcase.title">
            {tPages('home.offers.titleSingle')}
          </h2>
          <p className="text-lg text-muted-foreground" data-cms-field="offerShowcase.subtitle">
            {tPages('home.offers.subtitleSingle')}
          </p>
        </div>

        {/* Featured Offer */}
        <Card className="max-w-4xl mx-auto mb-12 border-primary/50 shadow-lg">
          <CardContent className="p-8 sm:p-12">
            <div className="flex flex-col items-center text-center space-y-6">
              {/* Icon */}
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <Icon className="h-8 w-8 text-primary" />
              </div>

              {/* Title */}
              <h3 className="text-3xl sm:text-4xl font-bold" data-cms-field="offer.title">
                {offer.title}
              </h3>

              {/* Value Proposition */}
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl" data-cms-field="offer.subtitle">
                {offer.subtitle}
              </p>

              {/* Description */}
              <p className="text-base text-muted-foreground max-w-2xl" data-cms-field="offer.description">
                {offer.short_description}
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" asChild>
                  <a href={APP_URLS.signup} target="_blank" rel="noopener noreferrer">
                    {t('buttons.getStarted')}
                  </a>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href={routes.offer(lang, offer.slug)}>
                    {t('buttons.learnMore')}
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Global CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <Button size="lg" variant="outline" asChild>
            <Link href={routes.offers(lang)}>
              {tPages('home.offers.viewAllSolutions')}
            </Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href={routes.pricing(lang)}>
              {tPages('home.offers.viewPricing')}
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  // Multiple offers - Carousel
  return (
    <div 
      className="container px-4 sm:px-6" 
      data-cms-component="offer-showcase"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
    >
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold mb-3" data-cms-field="offerShowcase.title">
          {tPages('home.offers.titleMultiple')}
        </h2>
        <p className="text-lg text-muted-foreground" data-cms-field="offerShowcase.subtitle">
          {tPages('home.offers.subtitleMultiple')}
        </p>
      </div>

      {/* Carousel Container */}
      <div className="relative max-w-5xl mx-auto mb-8">
        {/* Carousel Cards */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {offers.map((offer, index) => {
              const Icon = iconMap[offer.slug] || Sparkles;
              
              return (
                <div
                  key={offer.slug}
                  className="w-full flex-shrink-0 px-2"
                  data-cms-field={`offer.${index}`}
                >
                  <Card className="border-border hover:border-primary/50 transition-colors shadow-md">
                    <CardContent className="p-8 sm:p-10">
                      <div className="flex flex-col items-center text-center space-y-6">
                        {/* Icon */}
                        <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Icon className="h-7 w-7 text-primary" />
                        </div>

                        {/* Offer Name */}
                        <h3 className="text-2xl sm:text-3xl font-bold" data-cms-field="offer.title">
                          {offer.title}
                        </h3>

                        {/* One-line Value Proposition */}
                        <p className="text-lg text-muted-foreground line-clamp-2" data-cms-field="offer.subtitle">
                          {offer.subtitle}
                        </p>

                        {/* CTA */}
                        <Button size="lg" asChild className="mt-4">
                          <a href={APP_URLS.signup} target="_blank" rel="noopener noreferrer">
                            {t('buttons.getStarted')}
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={handlePrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 sm:-translate-x-12 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background border-2 border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all shadow-lg"
          aria-label="Previous offer"
        >
          <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
        <button
          onClick={handleNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 sm:translate-x-12 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-background border-2 border-border hover:border-primary hover:bg-primary/5 flex items-center justify-center transition-all shadow-lg"
          aria-label="Next offer"
        >
          <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      {/* Dots Indicator */}
      <div className="flex justify-center gap-2 mb-12" data-cms-field="carousel.indicators">
        {offers.map((_, index) => (
          <button
            key={index}
            onClick={() => handleDotClick(index)}
            aria-label={`Go to offer ${index + 1}`}
            className={cn(
              "h-2.5 rounded-full transition-all duration-300",
              index === currentIndex 
                ? "w-8 bg-primary" 
                : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
            )}
          />
        ))}
      </div>

      {/* Global CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button size="lg" variant="outline" asChild>
          <Link href={routes.offers(lang)}>
            {tPages('home.offers.viewAllSolutions')}
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href={routes.pricing(lang)}>
            {tPages('home.offers.viewPricing')}
          </Link>
        </Button>
      </div>
    </div>
  );
}

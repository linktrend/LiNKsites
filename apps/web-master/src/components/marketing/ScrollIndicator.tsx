"use client";

import { useTranslations } from "next-intl";
import { ChevronDown } from "lucide-react";

export function ScrollIndicator() {
  const t = useTranslations();
  
  const handleScroll = () => {
    // Ensure we're on the client before accessing DOM APIs
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }
    
    const offerShowcase = document.querySelector('[data-cms-section="offer-showcase"]');
    if (offerShowcase) {
      const headerHeight = document.querySelector('header')?.offsetHeight || 0;
      const yOffset = -headerHeight;
      const y = offerShowcase.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Ensure deterministic rendering - always render the same structure
  const buttonText = t("pages.home.exploreMore");

  return (
    <div className="flex justify-center">
      <button
        type="button"
        onClick={handleScroll}
        className="flex flex-col items-center gap-2 text-white/70 hover:text-white"
        data-cms-field="hero.scrollButton"
      >
        <span className="text-xs font-semibold uppercase tracking-wide" data-cms-field="hero.scrollButtonText">{buttonText}</span>
        <ChevronDown className="h-6 w-6 animate-bounce" />
      </button>
    </div>
  );
}

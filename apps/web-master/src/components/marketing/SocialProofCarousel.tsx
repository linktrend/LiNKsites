"use client";

import { useEffect, useState } from "react";
import { useTranslations } from 'next-intl';
import { Quote } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Testimonial = { type: "testimonial"; index: number };
type MediaMention = { type: "media"; index: number };

export function SocialProofCarousel() {
  const tPages = useTranslations('pages');
  const [index, setIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const items: Array<Testimonial | MediaMention> = [
    { type: "testimonial", index: 0 },
    { type: "media", index: 0 },
    { type: "testimonial", index: 1 },
    { type: "media", index: 1 }
  ];

  useEffect(() => {
    const id = setInterval(() => setIndex((prev) => (prev + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, [items.length]);

  const current = items[index];

  // Prevent hydration mismatch by rendering null until mounted
  if (!isMounted) {
    return (
      <div className="flex h-full flex-col" data-cms-component="social-proof-carousel">
        <Card className="bg-surface-overlay backdrop-blur-md border-white/20 shadow-2xl flex-1 flex flex-col min-h-[368px] sm:min-h-[414px]">
          <CardContent className="p-6 sm:p-8 pt-6 sm:pt-8 flex-1 flex flex-col">
            <div className="space-y-4">
              <div className="h-8 w-8 bg-white/10 rounded animate-pulse" />
              <div className="h-20 bg-white/10 rounded animate-pulse" />
              <div className="h-12 bg-white/10 rounded animate-pulse" />
            </div>
          </CardContent>
        </Card>
        <div className="flex justify-center gap-2 mt-4 flex-shrink-0 h-6">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-2 w-2 rounded-full bg-white/70" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" data-cms-component="social-proof-carousel">
      <Card className="bg-surface-overlay backdrop-blur-md border-white/20 shadow-2xl flex-1 flex flex-col min-h-[368px] sm:min-h-[414px]">
        <CardContent className="p-6 sm:p-8 pt-6 sm:pt-8 flex-1 flex flex-col">
          <div className="space-y-4" data-cms-field="socialProof.item" data-cms-item-index={index}>
            {current.type === "testimonial" ? (
              <>
                <Quote className="h-8 w-8 text-white opacity-90 drop-shadow-lg" />
                <p className="text-lg leading-relaxed text-white font-medium drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]" data-cms-field="socialProof.quote">
                  {tPages(`home.socialProof.testimonials.${current.index}.quote`)}
                </p>
                <div>
                  <p className="font-semibold text-white drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]" data-cms-field="socialProof.author">
                    {tPages(`home.socialProof.testimonials.${current.index}.author`)}
                  </p>
                  <p className="text-sm text-white/95 drop-shadow-md [text-shadow:_0_1px_2px_rgb(0_0_0_/_60%)]" data-cms-field="socialProof.title">
                    {tPages(`home.socialProof.testimonials.${current.index}.title`)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <span className="inline-flex rounded-full bg-white/25 backdrop-blur-sm px-4 py-1 text-sm font-semibold text-white drop-shadow-lg border border-white/30 [text-shadow:_0_1px_2px_rgb(0_0_0_/_60%)]" data-cms-field="socialProof.publication">
                  {tPages(`home.socialProof.media.${current.index}.featuredIn`, { 
                    publication: tPages(`home.socialProof.media.${current.index}.publication`)
                  })}
                </span>
                <p className="text-xl font-semibold text-white drop-shadow-lg [text-shadow:_0_2px_4px_rgb(0_0_0_/_80%)]" data-cms-field="socialProof.quote">
                  {tPages(`home.socialProof.media.${current.index}.quote`)}
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center gap-2 mt-4 flex-shrink-0 h-6" data-cms-field="socialProof.indicators">
        {items.map((_, i) => (
          <button
            key={i}
            aria-label={`Show slide ${i + 1}`}
            onClick={() => setIndex(i)}
            className={cn(
              "h-2 rounded-full transition-all duration-300 drop-shadow-lg",
              i === index ? "w-8 bg-white shadow-lg" : "w-2 bg-white/70"
            )}
          />
        ))}
      </div>
    </div>
  );
}

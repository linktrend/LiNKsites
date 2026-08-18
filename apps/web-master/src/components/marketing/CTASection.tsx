"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

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

export function CTASection({ data }: CTASectionProps) {
  const parsed = (data ?? {}) as CTAData;
  const trustIndicators = Array.isArray(parsed.trustIndicators) ? parsed.trustIndicators : [];

  if (!parsed.title || !parsed.body || !parsed.ctaLabel || !parsed.ctaUrl) {
    return (
      <Card className="h-full rounded-xl border border-dashed">
        <CardContent className="py-8 text-sm text-muted-foreground">
          Call-to-action content is unavailable for this published page.
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="h-full rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-primary/5 to-white">
      <CardContent className="flex h-full flex-col gap-6 px-8 pt-10 pb-8">
        <div className="space-y-3">
          <h2 className="text-3xl font-bold">{parsed.title}</h2>
          <p className="text-lg text-muted-foreground">
            {parsed.body}
          </p>
        </div>
        <Button
          className="w-full text-white hover:opacity-90"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-foreground)" }}
          size="lg"
          asChild
        >
          <Link href={parsed.ctaUrl} data-ai-action="contact" data-ai-action-target={parsed.ctaUrl}>
            {parsed.ctaLabel}
          </Link>
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

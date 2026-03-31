"use client";

import { CmsHelpDeflection } from "@/lib/contactTypes";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import Link from "next/link";

interface HelpDeflectionSectionProps {
  helpDeflection: CmsHelpDeflection;
  lang: string;
}

export function HelpDeflectionSection({ helpDeflection, lang }: HelpDeflectionSectionProps) {
  if (!helpDeflection.enabled) {
    return null;
  }

  return (
    <div className="bg-muted/50 rounded-lg border border-border p-8 text-center">
      <div className="max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <BookOpen className="h-8 w-8 text-primary" />
        </div>
        <h2 className="text-2xl font-semibold mb-3 text-foreground">
          {helpDeflection.title}
        </h2>
        <p className="text-muted-foreground mb-6">
          {helpDeflection.description}
        </p>
        <Button asChild size="lg">
          <Link href={`/${lang}${helpDeflection.ctaUrl}`}>
            <BookOpen className="h-4 w-4 mr-2" />
            {helpDeflection.ctaText}
          </Link>
        </Button>
      </div>
    </div>
  );
}

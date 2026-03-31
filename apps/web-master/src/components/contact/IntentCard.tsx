"use client";

import { useTranslations } from "next-intl";
import { CmsContactIntent } from "@/lib/contactTypes";
import * as LucideIcons from "lucide-react";

interface IntentCardProps {
  intent: CmsContactIntent;
  onClick: () => void;
}

export function IntentCard({ intent, onClick }: IntentCardProps) {
  const t = useTranslations();
  // Dynamically get the icon component from lucide-react
  const IconComponent = (LucideIcons as any)[intent.icon] || LucideIcons.HelpCircle;

  return (
    <button
      onClick={onClick}
      className="group p-6 bg-background rounded-lg border border-border hover:border-primary hover:shadow-md transition-all duration-200 text-left w-full"
      aria-label={`${intent.title}: ${intent.description}`}
    >
      <div className="flex flex-col h-full">
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          <IconComponent className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
          {intent.title}
        </h3>
        <p className="text-sm text-muted-foreground flex-1">
          {intent.description}
        </p>
        <div className="mt-4 text-sm text-primary font-medium group-hover:translate-x-1 transition-transform">
          {t("contact.getInTouch")} →
        </div>
      </div>
    </button>
  );
}

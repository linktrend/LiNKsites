"use client";

import { CmsContactIntent } from "@/lib/contactTypes";
import { IntentCard } from "./IntentCard";
import { useContactForm } from "./ContactFormContext";

interface IntentGridProps {
  intents: CmsContactIntent[];
}

export function IntentGrid({ intents }: IntentGridProps) {
  const { openForm } = useContactForm();

  // Sort by priority rank
  const sortedIntents = [...intents].sort((a, b) => a.priorityRank - b.priorityRank);

  const handleIntentClick = (intent: CmsContactIntent) => {
    if (intent.action.type === "modal" && intent.action.formId) {
      openForm(intent.action.formId);
    } else if (intent.action.type === "link" && intent.action.url) {
      window.open(intent.action.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {sortedIntents.map((intent) => (
        <IntentCard
          key={intent.id}
          intent={intent}
          onClick={() => handleIntentClick(intent)}
        />
      ))}
    </div>
  );
}

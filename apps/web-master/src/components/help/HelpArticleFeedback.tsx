"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  articleSlug: string;
}

export function HelpArticleFeedback({ articleSlug }: Props) {
  const t = useTranslations();
  const [feedback, setFeedback] = useState<'yes' | 'no' | null>(null);

  const handleFeedback = (response: 'yes' | 'no') => {
    setFeedback(response);
    
    // Track feedback (console.log for now, PostHog/API later)
    const feedbackData = {
      articleSlug,
      feedback: response,
      timestamp: Date.now(),
    };
    console.log('Article feedback:', feedbackData);
  };

  return (
    <section
      id="article-feedback"
      className="pt-8 sm:pt-12 pb-12 sm:pb-16"
      data-cms-section="articleFeedback"
    >
      <div className="container px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="p-6 sm:p-8 bg-muted/30 rounded-lg border border-border text-center">
            {feedback === null ? (
              <>
                <p
                  className="text-lg font-medium mb-6"
                  data-cms-field="feedback.question"
                >
                  {t("help.feedback.question")}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    variant="outline"
                    onClick={() => handleFeedback('yes')}
                    className="w-full sm:w-auto"
                  >
                    <ThumbsUp className="h-4 w-4 mr-2" />
                    {t("help.feedback.yes")}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleFeedback('no')}
                    className="w-full sm:w-auto"
                  >
                    <ThumbsDown className="h-4 w-4 mr-2" />
                    {t("help.feedback.no")}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-lg font-medium text-primary">
                {t("help.feedback.thanks")}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { newsletterSchema, NewsletterFormData } from "@/lib/validation";
import { routes } from "@/lib/routes";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2 } from "lucide-react";

interface Props {
  lang: string;
}

export function NewsletterSection({ lang }: Props) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success">("idle");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
      acceptedTerms: false,
    },
  });

  const acceptedTerms = watch("acceptedTerms");

  const onSubmit = async (data: NewsletterFormData) => {
    setIsSubmitting(true);

    try {
      // Simulate API call - replace with actual newsletter subscription endpoint
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Newsletter signup:", data);
      
      setSubmitStatus("success");
      reset();
      
      // Reset success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus("idle");
      }, 5000);
    } catch (error) {
      console.error("Newsletter subscription error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="py-8 sm:py-12 bg-background">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6">
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 shadow-lg">
          <CardContent className="p-6 pt-8 sm:p-8 sm:pt-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start">
              {/* Left Side - Title and Description */}
              <div>
                <h3 className="text-xl sm:text-2xl font-bold mb-2">
                  {t("newsletter.title")}
                </h3>
                <p className="text-sm sm:text-base text-muted-foreground">
                  {t("newsletter.description")}
                </p>
              </div>

              {/* Right Side - Form */}
              <div className="space-y-4">
                {submitStatus === "success" ? (
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm font-medium text-green-900">
                      {t("forms.success.newsletterSubscribed")}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Email Field */}
                    <div>
                      <Input
                        type="email"
                        placeholder={t("placeholders.enterEmail")}
                        {...register("email")}
                        className="w-full"
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1">
                          {t(errors.email.message as string)}
                        </p>
                      )}
                    </div>

                    {/* Checkbox + Text + Button Row */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                      <div className="flex items-start gap-2 flex-1">
                        <Checkbox
                          id="newsletter-terms"
                          checked={acceptedTerms}
                          onCheckedChange={(checked) =>
                            setValue("acceptedTerms", checked === true)
                          }
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor="newsletter-terms"
                          className="text-xs sm:text-sm text-muted-foreground leading-relaxed cursor-pointer"
                        >
                          {t("legal.acceptTerms")}{" "}
                          <Link
                            href={routes.privacyPolicy(lang)}
                            className="underline hover:text-foreground text-primary"
                          >
                            {t("legal.privacyPolicy")}
                          </Link>{" "}
                          {t("legal.and")}{" "}
                          <Link
                            href={routes.termsOfUse(lang)}
                            className="underline hover:text-foreground text-primary"
                          >
                            {t("legal.termsOfUse")}
                          </Link>
                        </Label>
                      </div>
                      {errors.acceptedTerms && (
                        <p className="text-sm text-red-500 w-full sm:hidden">
                          {t(errors.acceptedTerms.message as string)}
                        </p>
                      )}
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-primary text-primary-foreground hover:bg-primary/90 whitespace-nowrap w-full sm:w-auto"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            {t("forms.loading.submitting")}
                          </>
                        ) : (
                          t("buttons.joinNewsletter")
                        )}
                      </Button>
                    </div>
                    {errors.acceptedTerms && (
                      <p className="text-sm text-red-500 hidden sm:block">
                        {t(errors.acceptedTerms.message as string)}
                      </p>
                    )}
                  </form>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

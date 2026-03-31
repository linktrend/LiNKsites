"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { contactFormSchema, ContactFormData } from "@/lib/validation";
import { handleFormSubmission } from "@/lib/forms";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

interface ContactFormProps {
  lang?: string;
}

export function ContactForm({ lang = "en" }: ContactFormProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      captcha: false,
    },
  });

  const captchaValue = watch("captcha");

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    const result = await handleFormSubmission(
      data,
      {
        endpoint: "/api/contact",
        method: "POST",
        intentTag: "contact-form",
        lang,
      },
      {
        onSuccess: () => {
          setSubmitStatus("success");
          reset();
        },
        onError: (error) => {
          setSubmitStatus("error");
          setErrorMessage(error.message);
        },
      }
    );

    setIsSubmitting(false);
  };

  if (submitStatus === "success") {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground">
          {t("forms.success.title")}
        </h3>
        <p className="text-muted-foreground">{t("forms.success.contactSubmitted")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Name Field */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="name" className="text-sm font-medium">
          {t("labels.name")}
        </Label>
        <Input
          id="name"
          {...register("name")}
          placeholder={t("placeholders.enterName")}
          className="border rounded-md px-3 py-2"
        />
        {errors.name && (
          <p className="text-sm text-red-500 mt-1">{t(errors.name.message as string)}</p>
        )}
      </div>

      {/* Email Field */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="email" className="text-sm font-medium">
          {t("labels.email")}
        </Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder={t("placeholders.email")}
          className="border rounded-md px-3 py-2"
        />
        {errors.email && (
          <p className="text-sm text-red-500 mt-1">{t(errors.email.message as string)}</p>
        )}
      </div>

      {/* Message Field */}
      <div className="flex flex-col gap-1">
        <Label htmlFor="message" className="text-sm font-medium">
          {t("labels.message")}
        </Label>
        <textarea
          id="message"
          {...register("message")}
          rows={4}
          placeholder={t("placeholders.enterMessage")}
          className="border rounded-md px-3 py-2 w-full resize-none"
        />
        {errors.message && (
          <p className="text-sm text-red-500 mt-1">{t(errors.message.message as string)}</p>
        )}
      </div>

      {/* Captcha Checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="captcha"
          checked={captchaValue}
          onCheckedChange={(checked) => setValue("captcha", checked === true)}
        />
        <Label htmlFor="captcha" className="text-sm text-muted-foreground cursor-pointer">
          {t("forms.validation.captchaRequired")}
        </Label>
      </div>
      {errors.captcha && (
        <p className="text-sm text-red-500 mt-1">{t(errors.captcha.message as string)}</p>
      )}

      {/* Error Message */}
      {submitStatus === "error" && (
        <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">{t("forms.errors.submissionFailed")}</p>
            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex px-4 py-2 rounded-md bg-primary text-primary-foreground font-semibold"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            {t("forms.loading.submitting")}
          </>
        ) : (
          t("buttons.send")
        )}
      </Button>
    </form>
  );
}

"use client";

import { useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { CmsContactForm } from "@/lib/contactTypes";
import { generateZodSchema, getDefaultValues } from "@/lib/validation";
import { handleFormSubmission } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface DynamicContactFormProps {
  formSchema: CmsContactForm;
  lang: string;
}

export function DynamicContactForm({ formSchema, lang }: DynamicContactFormProps) {
  const t = useTranslations();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Generate Zod schema from CMS form schema (memoized)
  const zodSchema = useMemo(() => generateZodSchema(formSchema), [formSchema]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(zodSchema),
    defaultValues: getDefaultValues(formSchema.fields),
  });

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    const result = await handleFormSubmission(
      data,
      {
        endpoint: formSchema.submissionConfig.endpoint,
        method: formSchema.submissionConfig.method,
        intentTag: formSchema.submissionConfig.intentTag,
        lang,
      },
      {
        onSuccess: () => {
          setSubmitStatus("success");
          reset();
        },
        onError: (error) => {
          setSubmitStatus("error");
          setErrorMessage(error.message || t("forms.errors.networkError"));
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
        <p className="text-muted-foreground">{formSchema.successMessage}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Form Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-foreground">{formSchema.title}</h2>
        <p className="text-sm text-muted-foreground">{formSchema.description}</p>
      </div>

      {/* Dynamic Fields */}
      <div className="space-y-4">
        {formSchema.fields.map((field) => (
          <div key={field.id}>
            <Label htmlFor={field.id} className="text-sm font-medium mb-2 block">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>

            {field.type === "select" ? (
              <select
                id={field.id}
                {...register(field.id)}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground"
              >
                <option value="">{field.placeholder}</option>
                {field.options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                id={field.id}
                {...register(field.id)}
                placeholder={field.placeholder}
                rows={6}
                className="w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none text-foreground"
              />
            ) : (
              <Input
                id={field.id}
                type={field.type}
                {...register(field.id)}
                placeholder={field.placeholder}
                className="w-full"
              />
            )}

            {errors[field.id] && (
              <p className="text-sm text-red-500 mt-1">
                {t(errors[field.id]?.message as string)}
              </p>
            )}
          </div>
        ))}
      </div>

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
      <div className="flex justify-end gap-4 pt-4 border-t border-border">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {t("forms.loading.submitting")}
            </>
          ) : (
            formSchema.submitButtonText
          )}
        </Button>
      </div>
    </form>
  );
}

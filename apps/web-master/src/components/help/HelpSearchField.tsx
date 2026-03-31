"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { searchFormSchema, SearchFormData } from "@/lib/validation";
import { Search } from "lucide-react";

interface HelpSearchFieldProps {
  placeholder?: string;
  heading?: string;
}

export function HelpSearchField({ placeholder, heading }: HelpSearchFieldProps) {
  const t = useTranslations();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      query: "",
    },
  });

  const onSubmit = (data: SearchFormData) => {
    console.log("Search query:", data.query);
    // Implement search functionality here
  };

  const defaultPlaceholder = placeholder || t("placeholders.search");

  return (
    <section
      id="search-section"
      className="pt-8 sm:pt-12 pb-4 sm:pb-6"
      data-cms-section="search"
    >
      <div className="container px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          {heading && (
            <>
              <h2
                className="text-2xl sm:text-3xl font-bold mb-4 text-center"
                data-cms-field="search.heading"
              >
                {heading}
              </h2>
              <p className="text-center text-base sm:text-lg text-muted-foreground mb-6">
                {t("help.search.description")}
              </p>
            </>
          )}

          <form onSubmit={handleSubmit(onSubmit)} role="search">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" aria-hidden="true" />
              <input
                type="text"
                placeholder={defaultPlaceholder}
                {...register("query")}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 text-base"
                data-cms-field="search.placeholder"
                aria-label={t("help.search.label")}
              />
            </div>
            {errors.query && (
              <p className="text-sm text-red-500 mt-2 text-center">
                {t(errors.query.message as string)}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}

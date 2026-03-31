import { z } from "zod";

/**
 * Search Form Schema
 * Used for help center and general search forms
 */
export const searchFormSchema = z.object({
  query: z
    .string()
    .min(2, "forms.validation.searchMin")
    .max(200, "forms.validation.searchMax"),
});

export type SearchFormData = z.infer<typeof searchFormSchema>;



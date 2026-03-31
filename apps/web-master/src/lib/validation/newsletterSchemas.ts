import { z } from "zod";

/**
 * Newsletter Subscription Schema
 * Used for newsletter signup forms
 */
export const newsletterSchema = z.object({
  email: z
    .string()
    .email("forms.validation.emailInvalid"),
  acceptedTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: "forms.validation.termsRequired",
    }),
});

export type NewsletterFormData = z.infer<typeof newsletterSchema>;



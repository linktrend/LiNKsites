import { z } from "zod";

/**
 * Signup Form Schema
 * Used for user registration/signup forms
 */
export const signupFormSchema = z.object({
  email: z
    .string()
    .email("forms.validation.emailInvalid")
    .optional()
    .or(z.literal("")),
  phone: z
    .string()
    .min(10, "forms.validation.phoneMin")
    .max(20, "forms.validation.phoneMax")
    .optional()
    .or(z.literal("")),
  acceptedTerms: z
    .boolean()
    .refine((val) => val === true, {
      message: "forms.validation.termsRequired",
    }),
}).refine(
  (data) => data.email || data.phone,
  {
    message: "forms.validation.emailOrPhoneRequired",
    path: ["email"],
  }
);

export type SignupFormData = z.infer<typeof signupFormSchema>;



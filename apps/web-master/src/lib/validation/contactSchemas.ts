import { z } from "zod";

/**
 * Contact Form Schema
 * Used for basic contact form submissions
 */
export const contactFormSchema = z.object({
  name: z
    .string()
    .min(2, "forms.validation.nameMin")
    .max(100, "forms.validation.nameMax"),
  email: z
    .string()
    .email("forms.validation.emailInvalid"),
  message: z
    .string()
    .min(10, "forms.validation.messageMin")
    .max(1000, "forms.validation.messageMax"),
  captcha: z
    .boolean()
    .refine((val) => val === true, {
      message: "forms.validation.captchaRequired",
    })
    .optional(),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;



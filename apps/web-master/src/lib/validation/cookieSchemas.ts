import { z } from "zod";

/**
 * Cookie Preferences Schema
 * Used for cookie consent management
 */
export const cookiePreferencesSchema = z.object({
  functional: z.boolean(),
  analytics: z.boolean(),
  marketing: z.boolean(),
});

export type CookiePreferencesData = z.infer<typeof cookiePreferencesSchema>;



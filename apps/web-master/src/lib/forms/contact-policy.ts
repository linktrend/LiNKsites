/**
 * Contact activation parses consent from the request body. Consent must not
 * be assumed before parse (LS-FR-22).
 */

import { z } from "zod";

import {
  activateSideEffect,
  rejectFakeSuccess,
  resolveConfiguredHook,
  type SideEffectDecision,
} from "@/lib/forms/side-effect-policy";

const truthyConsent = (value: unknown): boolean =>
  value === true || value === "true" || value === "on" || value === "1" || value === 1;

export const contactPayloadSchema = z.object({
  intentTag: z.string().min(1).max(100),
  formData: z
    .record(z.string(), z.any())
    .refine((data) => Object.keys(data).length > 0, { message: "Form data cannot be empty" }),
  metadata: z
    .object({
      timestamp: z.string().optional(),
      userAgent: z.string().optional(),
      referrer: z.string().optional(),
      language: z.string().optional(),
    })
    .optional(),
});

export type ContactPayload = z.infer<typeof contactPayloadSchema>;

export type ContactEvaluation =
  | Readonly<{ ok: true; payload: ContactPayload; decision: Extract<SideEffectDecision, { ok: true }> }>
  | Readonly<{ ok: false; stage: "parse"; error: z.ZodError }>
  | Readonly<{ ok: false; stage: "policy"; decision: Extract<SideEffectDecision, { ok: false }> }>;

export function consentGrantedFromFormData(formData: Record<string, unknown>): boolean {
  return (
    truthyConsent(formData.acceptedTerms) ||
    truthyConsent(formData.privacyConsent) ||
    truthyConsent(formData.consent)
  );
}

export function evaluateContactRequest(
  body: unknown,
  env: NodeJS.Dict<string> = process.env,
): ContactEvaluation {
  const parsed = contactPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, stage: "parse", error: parsed.error };
  }

  const decision = activateSideEffect({
    kind: "contact",
    endpoint: "/api/contact",
    configured: resolveConfiguredHook("contact", env),
    requiresConsent: true,
    consentGranted: consentGrantedFromFormData(parsed.data.formData),
  });
  if (!decision.ok) {
    return { ok: false, stage: "policy", decision };
  }
  return { ok: true, payload: parsed.data, decision };
}

export function contactSuccessAfterEnqueue(enqueued: boolean) {
  return rejectFakeSuccess({
    transportOk: true,
    payloadSuccess: true,
    enqueued,
  });
}

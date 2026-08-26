/**
 * Newsletter activation uses parsed consent/privacy flags. Consent must not be
 * assumed before the body is parsed (LS-FR-22 / ISS-23).
 */

import { z } from "zod";

import {
  activateSideEffect,
  rejectFakeSuccess,
  resolveConfiguredHook,
  type SideEffectDecision,
} from "@/lib/forms/side-effect-policy";

export const newsletterPayloadSchema = z.object({
  intentTag: z.string().min(1).max(100).default("newsletter"),
  formData: z.object({
    email: z.string().email(),
    acceptedTerms: z.boolean(),
  }),
  metadata: z
    .object({
      timestamp: z.string().optional(),
      userAgent: z.string().optional(),
      referrer: z.string().optional(),
      language: z.string().optional(),
    })
    .optional(),
});

export type NewsletterPayload = z.infer<typeof newsletterPayloadSchema>;

export type NewsletterEvaluation =
  | Readonly<{ ok: true; payload: NewsletterPayload; decision: Extract<SideEffectDecision, { ok: true }> }>
  | Readonly<{ ok: false; stage: "parse"; error: z.ZodError }>
  | Readonly<{ ok: false; stage: "policy"; decision: Extract<SideEffectDecision, { ok: false }> }>;

export function evaluateNewsletterRequest(
  body: unknown,
  env: NodeJS.Dict<string> = process.env,
): NewsletterEvaluation {
  const parsed = newsletterPayloadSchema.safeParse(body);
  if (!parsed.success) {
    return { ok: false, stage: "parse", error: parsed.error };
  }

  const decision = activateSideEffect({
    kind: "newsletter",
    endpoint: "/api/newsletter",
    configured: resolveConfiguredHook("newsletter", env),
    requiresConsent: true,
    consentGranted: parsed.data.formData.acceptedTerms === true,
  });
  if (!decision.ok) {
    return { ok: false, stage: "policy", decision };
  }
  return { ok: true, payload: parsed.data, decision };
}

export function newsletterSuccessAfterEnqueue(enqueued: boolean) {
  return rejectFakeSuccess({
    transportOk: true,
    payloadSuccess: true,
    enqueued,
  });
}

/**
 * Side-effect modules activate only with a real hook, consent, privacy and
 * failure behavior (LS-FR-22 / ISS-23). Fake success is rejected.
 */

export const SIDE_EFFECT_KINDS = ["contact", "newsletter", "booking", "analytics", "ecommerce"] as const;
export type SideEffectKind = (typeof SIDE_EFFECT_KINDS)[number];

export type SideEffectHook = Readonly<{
  kind: SideEffectKind;
  endpoint: string;
  configured: boolean;
  requiresConsent: boolean;
  consentGranted: boolean;
}>;

export type SideEffectDecision =
  | Readonly<{ ok: true; kind: SideEffectKind; endpoint: string }>
  | Readonly<{ ok: false; kind: SideEffectKind; code: string; message: string }>;

export class SideEffectPolicyError extends Error {
  readonly code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "SideEffectPolicyError";
    this.code = code;
  }
}

const REAL_ENDPOINT = /^\/api\/(contact|newsletter|booking|ecommerce)$/;

export function activateSideEffect(hook: SideEffectHook): SideEffectDecision {
  if (!SIDE_EFFECT_KINDS.includes(hook.kind)) {
    return { ok: false, kind: hook.kind, code: "unknown_module", message: `unknown side-effect module ${hook.kind}` };
  }
  if (!hook.configured) {
    return {
      ok: false,
      kind: hook.kind,
      code: "hook_not_configured",
      message: `${hook.kind} is inactive until a real hook is configured`,
    };
  }
  if (hook.kind !== "analytics" && !REAL_ENDPOINT.test(hook.endpoint)) {
    return {
      ok: false,
      kind: hook.kind,
      code: "unreal_endpoint",
      message: `${hook.kind} endpoint must be a real local API hook`,
    };
  }
  if (hook.requiresConsent && !hook.consentGranted) {
    return {
      ok: false,
      kind: hook.kind,
      code: "consent_required",
      message: `${hook.kind} requires privacy consent before activation`,
    };
  }
  return { ok: true, kind: hook.kind, endpoint: hook.endpoint };
}

export function assertActivated(hook: SideEffectHook): string {
  const decision = activateSideEffect(hook);
  if (!decision.ok) throw new SideEffectPolicyError(decision.code, decision.message);
  return decision.endpoint;
}

export function rejectFakeSuccess(input: {
  transportOk: boolean;
  payloadSuccess?: boolean;
  enqueued: boolean;
}): { success: true } | { success: false; code: string; message: string } {
  if (!input.transportOk || input.payloadSuccess !== true || !input.enqueued) {
    return {
      success: false,
      code: "fake_success_rejected",
      message: "success is only allowed after a real hook enqueue",
    };
  }
  return { success: true };
}

export function resolveConfiguredHook(kind: SideEffectKind, env: NodeJS.Dict<string> = process.env): boolean {
  switch (kind) {
    case "contact":
    case "newsletter":
      return Boolean(
        env.LINKAUTOWORK_GATEWAY_URL &&
          env.LINKAUTOWORK_SIGNING_SECRET &&
          env.LINKAUTOWORK_SIGNING_KEY_ID &&
          env.LINKAUTOWORK_ENVIRONMENT &&
          env.LINKSITES_ORG_ID &&
          env.LINKSITES_SITE_ID &&
          env.LINKAUTOWORK_OUTBOX_PATH &&
          env.LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET &&
          env.LINKAUTOWORK_EVENT_GRANTS,
      );
    case "booking":
      return Boolean(env.LINKSITES_BOOKING_HOOK_URL && env.LINKSITES_BOOKING_HOOK_SECRET);
    case "ecommerce":
      return Boolean(env.LINKSITES_ECOMMERCE_HOOK_URL && env.LINKSITES_ECOMMERCE_HOOK_SECRET);
    case "analytics":
      return env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true";
    default: {
      const exhaustive: never = kind;
      throw new SideEffectPolicyError("unknown_module", `unknown side-effect module ${String(exhaustive)}`);
    }
  }
}

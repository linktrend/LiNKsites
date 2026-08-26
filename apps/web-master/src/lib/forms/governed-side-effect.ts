import { FileOutbox, LiNKautoworkGateway, parseGatewayEventPolicies, type GatewayEnvironment } from "@linksites/autowork-boundary";
import type { LiNKautoworkEventName } from "@linksites/types";

import { checkRateLimit } from "@/lib/ai/rateLimit";
import { SideEffectPolicyError, resolveConfiguredHook, type SideEffectKind } from "@/lib/forms/side-effect-policy";

type GovernedFormKind = Extract<SideEffectKind, "contact" | "newsletter">;

export function canonicalGovernedFormEventName(kind: GovernedFormKind): LiNKautoworkEventName {
  switch (kind) {
    case "contact":
    case "newsletter":
      return "contact.submitted";
    default: {
      const exhaustive: never = kind;
      throw new SideEffectPolicyError("unauthorized_event", `unsupported governed event ${String(exhaustive)}`);
    }
  }
}

const FORM_RATE_LIMIT_PER_MINUTE = 10;

export function abuseKeyFromRequest(headers: Headers): string {
  return headers.get("x-forwarded-for") || headers.get("x-real-ip") || "unknown";
}

export function enforceAbuseLimit(key: string): { ok: true } | { ok: false; retryAfterSeconds: number } {
  const rate = checkRateLimit(`ls07-form:${key}`, FORM_RATE_LIMIT_PER_MINUTE);
  if (!rate.ok) return { ok: false, retryAfterSeconds: rate.retryAfterSeconds };
  return { ok: true };
}

export async function enqueueGovernedSideEffect(input: {
  kind: GovernedFormKind;
  intent: string;
  submission: Record<string, string | number | boolean>;
  metadata: Record<string, string>;
}): Promise<void> {
  if (!resolveConfiguredHook(input.kind)) {
    throw new SideEffectPolicyError("hook_not_configured", `${input.kind} governed hook is incomplete`);
  }
  const url = process.env.LINKAUTOWORK_GATEWAY_URL as string;
  const secret = process.env.LINKAUTOWORK_SIGNING_SECRET as string;
  const keyId = process.env.LINKAUTOWORK_SIGNING_KEY_ID as string;
  const environment = process.env.LINKAUTOWORK_ENVIRONMENT as GatewayEnvironment;
  const orgId = process.env.LINKSITES_ORG_ID as string;
  const siteId = process.env.LINKSITES_SITE_ID as string;
  const outboxPath = process.env.LINKAUTOWORK_OUTBOX_PATH as string;
  const integrityMaterial = process.env.LINKAUTOWORK_OUTBOX_INTEGRITY_SECRET as string;
  const grants = process.env.LINKAUTOWORK_EVENT_GRANTS as string;
  const eventName = canonicalGovernedFormEventName(input.kind);
  const gateway = new LiNKautoworkGateway({
    secret,
    keyId,
    environment,
    policies: parseGatewayEventPolicies(grants),
    transport: async (request) => {
      const response = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(request),
      });
      const acknowledgedAt = response.headers.get("x-linkautowork-acknowledged-at") ?? new Date().toISOString();
      return {
        status: response.status,
        receiptId: response.headers.get("x-linkautowork-receipt") ?? "missing",
        receiptSignature: response.headers.get("x-linkautowork-receipt-signature") ?? "missing",
        acknowledgedAt,
      };
    },
  });
  const outbox = new FileOutbox(outboxPath, {
    maxAttempts: 5,
    metrics: gateway.metrics,
    integritySecret: integrityMaterial,
    resigner: (request, attempt) => gateway.resignRequest(request, attempt),
    validator: (request) => gateway.verifyStored(request),
  });
  await outbox.enqueue(
    gateway.buildRequest(
      eventName,
      orgId,
      `web:${siteId}`,
      `${input.kind}:${siteId}:${input.metadata.timestamp}:${input.intent}`,
      { lead_id: `${input.kind}:${siteId}`, site_id: siteId, submission: input.submission },
    ),
  );
}

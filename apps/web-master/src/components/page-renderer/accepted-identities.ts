import { MASTER_TEMPLATE_PIN } from "@linksites/factory-catalog/master-template-pin";

import {
  LayoutPackError,
  resolveLayoutRuntime,
  type LayoutPackId,
  type LayoutRuntime,
  type PlanId,
} from "@/components/page-renderer/layout-packs";

export const ACCEPTED_IDENTITY_SOURCE = "injected" as const;

export type AcceptedLs04Identity = Readonly<{
  source: typeof ACCEPTED_IDENTITY_SOURCE;
  workingContentIdentity: string;
  promotionReceiptIdentity: string;
  capabilityPlanId: PlanId;
}>;

export type AcceptedLs05Identity = Readonly<{
  source: typeof ACCEPTED_IDENTITY_SOURCE;
  adapterIdentity: string;
  materializationReceiptIdentity: string;
  layoutPackId: LayoutPackId;
}>;

export type AcceptedLayoutIdentities = Readonly<{
  ls04: AcceptedLs04Identity;
  ls05: AcceptedLs05Identity;
}>;

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

function parseJsonObject(raw: string, label: string): Record<string, unknown> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    throw new LayoutPackError(`fail closed: ${label} is not valid JSON`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new LayoutPackError(`fail closed: ${label} must be an object`);
  }
  return parsed as Record<string, unknown>;
}

function asIdentityRecord(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new LayoutPackError(`fail closed: ${label} is absent`);
  }
  return value as Record<string, unknown>;
}

function optionalRecord(value: unknown): Record<string, unknown> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  return value as Record<string, unknown>;
}

function requireInjectedSource(record: Record<string, unknown>, label: string): void {
  if (record.source !== ACCEPTED_IDENTITY_SOURCE) {
    throw new LayoutPackError(`fail closed: ${label} source must be injected`);
  }
}

/**
 * Bind layoutPackId / planId from accepted LS-04 and LS-05 identity objects.
 * CmsSiteSettings is not a layout authority and must not supply A1/A defaults.
 */
export function bindAcceptedLayoutIdentities(input: {
  ls04?: unknown;
  ls05?: unknown;
  provider?: unknown;
  layout?: unknown;
}): AcceptedLayoutIdentities {
  const ls04 = asIdentityRecord(input.ls04, "accepted LS-04 identity");
  const ls05 = asIdentityRecord(input.ls05, "accepted LS-05 identity");
  requireInjectedSource(ls04, "LS-04 identity");
  requireInjectedSource(ls05, "LS-05 identity");
  if (!isNonEmptyString(ls04.workingContentIdentity) || !isNonEmptyString(ls04.promotionReceiptIdentity)) {
    throw new LayoutPackError("fail closed: accepted LS-04 working-content/promotion identities are absent");
  }
  if (!isNonEmptyString(ls05.adapterIdentity) || !isNonEmptyString(ls05.materializationReceiptIdentity)) {
    throw new LayoutPackError("fail closed: accepted LS-05 adapter/materialization identities are absent");
  }

  const layout = optionalRecord(input.layout);
  const provider = optionalRecord(input.provider);
  if (layout) requireInjectedSource(layout, "layout identity");
  if (provider) requireInjectedSource(provider, "provider identity");

  const layoutPackIdCandidate =
    (isNonEmptyString(ls05.layoutPackId) ? ls05.layoutPackId : undefined) ??
    (provider && isNonEmptyString(provider.layoutPackId) ? provider.layoutPackId : undefined) ??
    (layout && isNonEmptyString(layout.layoutPackId) ? layout.layoutPackId : undefined);
  const planIdCandidate =
    (isNonEmptyString(ls04.capabilityPlanId) ? ls04.capabilityPlanId : undefined) ??
    (layout && isNonEmptyString(layout.planId) ? layout.planId : undefined);

  if (!isNonEmptyString(layoutPackIdCandidate)) {
    throw new LayoutPackError("fail closed: accepted LS-05 layoutPackId is absent");
  }
  if (!isNonEmptyString(planIdCandidate)) {
    throw new LayoutPackError("fail closed: accepted LS-04 planId is absent");
  }
  if (layout && isNonEmptyString(layout.layoutPackId) && layout.layoutPackId !== layoutPackIdCandidate) {
    throw new LayoutPackError("fail closed: layout identity layoutPackId does not match LS-05");
  }
  if (layout && isNonEmptyString(layout.planId) && layout.planId !== planIdCandidate) {
    throw new LayoutPackError("fail closed: layout identity planId does not match LS-04");
  }
  if (provider && isNonEmptyString(provider.layoutPackId) && provider.layoutPackId !== layoutPackIdCandidate) {
    throw new LayoutPackError("fail closed: provider identity layoutPackId does not match LS-05");
  }
  if (layoutPackIdCandidate === "A1") {
    if (MASTER_TEMPLATE_PIN.version !== "2.0.0-a1.1") {
      throw new LayoutPackError("fail closed: LS-05 A1 identity does not match the accepted provider pin");
    }
    if (provider && isNonEmptyString(provider.semver) && provider.semver !== MASTER_TEMPLATE_PIN.version) {
      throw new LayoutPackError("fail closed: accepted LS-05 provider semver does not match the A1 pin");
    }
    if (provider && isNonEmptyString(provider.providerId) && provider.providerId !== MASTER_TEMPLATE_PIN.entryId) {
      throw new LayoutPackError("fail closed: accepted LS-05 provider id does not match the A1 pin");
    }
  }

  const runtime = resolveLayoutRuntime({
    layoutPackId: layoutPackIdCandidate,
    planId: planIdCandidate,
  });
  return {
    ls04: {
      source: ACCEPTED_IDENTITY_SOURCE,
      workingContentIdentity: ls04.workingContentIdentity,
      promotionReceiptIdentity: ls04.promotionReceiptIdentity,
      capabilityPlanId: runtime.planId,
    },
    ls05: {
      source: ACCEPTED_IDENTITY_SOURCE,
      adapterIdentity: ls05.adapterIdentity,
      materializationReceiptIdentity: ls05.materializationReceiptIdentity,
      layoutPackId: runtime.layoutPackId,
    },
  };
}

export function resolveLayoutRuntimeFromAcceptedIdentities(input: {
  ls04?: unknown;
  ls05?: unknown;
  provider?: unknown;
  layout?: unknown;
}): LayoutRuntime {
  const bound = bindAcceptedLayoutIdentities(input);
  return resolveLayoutRuntime({
    layoutPackId: bound.ls05.layoutPackId,
    planId: bound.ls04.capabilityPlanId,
  });
}

function identitiesFromEnvObject(parsed: Record<string, unknown>): {
  ls04?: unknown;
  ls05?: unknown;
  provider?: unknown;
  layout?: unknown;
} {
  if (parsed.identities && typeof parsed.identities === "object" && !Array.isArray(parsed.identities)) {
    return parsed.identities as {
      ls04?: unknown;
      ls05?: unknown;
      provider?: unknown;
      layout?: unknown;
    };
  }
  return parsed;
}

export function loadAcceptedLayoutRuntime(
  env: Record<string, string | undefined> = process.env,
): LayoutRuntime {
  const combinedRaw = env.LINKSITES_LS06_ACCEPTED_IDENTITIES_JSON;
  if (isNonEmptyString(combinedRaw)) {
    return resolveLayoutRuntimeFromAcceptedIdentities(
      identitiesFromEnvObject(parseJsonObject(combinedRaw, "LINKSITES_LS06_ACCEPTED_IDENTITIES_JSON")),
    );
  }
  const ls04Raw = env.LINKSITES_LS04_IDENTITY_JSON;
  const ls05Raw = env.LINKSITES_LS05_IDENTITY_JSON;
  if (!isNonEmptyString(ls04Raw) || !isNonEmptyString(ls05Raw)) {
    throw new LayoutPackError(
      "fail closed: accepted LS-04/LS-05 identities are absent; CmsSiteSettings is not a layout authority",
    );
  }
  return resolveLayoutRuntimeFromAcceptedIdentities({
    ls04: parseJsonObject(ls04Raw, "LINKSITES_LS04_IDENTITY_JSON"),
    ls05: parseJsonObject(ls05Raw, "LINKSITES_LS05_IDENTITY_JSON"),
    provider: isNonEmptyString(env.LINKSITES_LS05_PROVIDER_IDENTITY_JSON)
      ? parseJsonObject(env.LINKSITES_LS05_PROVIDER_IDENTITY_JSON, "LINKSITES_LS05_PROVIDER_IDENTITY_JSON")
      : undefined,
    layout: isNonEmptyString(env.LINKSITES_LS04_LAYOUT_IDENTITY_JSON)
      ? parseJsonObject(env.LINKSITES_LS04_LAYOUT_IDENTITY_JSON, "LINKSITES_LS04_LAYOUT_IDENTITY_JSON")
      : undefined,
  });
}

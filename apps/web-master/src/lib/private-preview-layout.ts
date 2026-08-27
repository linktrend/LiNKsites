import { MASTER_TEMPLATE_PIN } from "@linksites/factory-catalog/master-template-pin";

import {
  loadAcceptedLayoutRuntime,
  resolveLayoutRuntimeFromAcceptedIdentities,
} from "@/components/page-renderer/accepted-identities";
import type { LayoutRuntime } from "@/components/page-renderer/layout-packs";

const ACCEPTED_IDENTITY_SOURCE = "injected" as const;

/**
 * Proof-only identities for the disposable W2-04/W2-02 private preview path.
 * Production continues to require injected LS-04/LS-05 identity JSON. This is
 * not a CmsSiteSettings default and is not consulted unless the local-proof
 * flag is deliberately set.
 */
const W2_04_LOCAL_PROOF_IDENTITIES = {
  ls04: {
    source: ACCEPTED_IDENTITY_SOURCE,
    workingContentIdentity: "ls04:working-content:w2-04-local-proof:v1",
    promotionReceiptIdentity: "ls04:promotion-receipt:w2-04-local-proof:v1",
    capabilityPlanId: "B" as const,
  },
  ls05: {
    source: ACCEPTED_IDENTITY_SOURCE,
    adapterIdentity: "ls05:adapter:w2-04-local-proof:v1",
    materializationReceiptIdentity: "ls05:materialization:w2-04-local-proof:v1",
    layoutPackId: "A1" as const,
  },
  provider: {
    source: ACCEPTED_IDENTITY_SOURCE,
    providerId: MASTER_TEMPLATE_PIN.entryId,
    semver: MASTER_TEMPLATE_PIN.version,
    layoutPackId: "A1" as const,
    candidateIdentity: "provider:w2-04-local-proof:layout-A1",
  },
  layout: {
    source: ACCEPTED_IDENTITY_SOURCE,
    layoutPackId: "A1" as const,
    planId: "B" as const,
    shellId: "marketing-shell",
  },
} as const;

export function loadPrivatePreviewLayoutRuntime(
  env: Record<string, string | undefined> = process.env,
): LayoutRuntime {
  try {
    return loadAcceptedLayoutRuntime(env);
  } catch (error) {
    if (env.LINKSITES_W2_04_LOCAL_PROOF !== "1") throw error;
    return resolveLayoutRuntimeFromAcceptedIdentities(W2_04_LOCAL_PROOF_IDENTITIES);
  }
}

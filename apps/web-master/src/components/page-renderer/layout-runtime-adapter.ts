import {
  bindAcceptedLayoutIdentities,
  type AcceptedLayoutIdentities,
} from "@/components/page-renderer/accepted-identities";
import {
  LayoutPackError,
  resolveLayoutRuntime,
  type LayoutRuntime,
} from "@/components/page-renderer/layout-packs";

export const LAYOUT_RUNTIME_ADAPTER_SCHEMA = "linksites.layout-runtime-adapter/v1" as const;

export type LayoutRuntimeAdapterPacket = Readonly<{
  schemaVersion: typeof LAYOUT_RUNTIME_ADAPTER_SCHEMA;
  ls04: unknown;
  ls05: unknown;
  provider: unknown;
  layout: unknown;
}>;

/**
 * Consumer-owned injection seam for LS-05. Implementations supply data only;
 * this runtime remains the authority that validates provider and layout identity.
 */
export interface LayoutRuntimeAdapter {
  read(): LayoutRuntimeAdapterPacket;
}

export type BoundLayoutRuntimeAdapter = Readonly<{
  identities: AcceptedLayoutIdentities;
  runtime: LayoutRuntime;
}>;

export function bindLayoutRuntimeAdapter(adapter: LayoutRuntimeAdapter): BoundLayoutRuntimeAdapter {
  const packet = adapter.read();
  if (packet.schemaVersion !== LAYOUT_RUNTIME_ADAPTER_SCHEMA) {
    throw new LayoutPackError(`fail closed: unsupported layout runtime adapter schema "${String(packet.schemaVersion)}"`);
  }
  const identities = bindAcceptedLayoutIdentities(packet);
  return Object.freeze({
    identities,
    runtime: resolveLayoutRuntime({
      layoutPackId: identities.ls05.layoutPackId,
      planId: identities.ls04.capabilityPlanId,
    }),
  });
}

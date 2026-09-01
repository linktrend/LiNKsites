import {
  LAYOUT_RUNTIME_ADAPTER_SCHEMA,
  type LayoutRuntimeAdapter,
  type LayoutRuntimeAdapterPacket,
} from "../../src/components/page-renderer/layout-runtime-adapter.ts";

export const FAKE_LS05_HOLD_INPUTS = Object.freeze({
  exactLs05AdapterReceipt: "HOLD",
  exactA1MaterializationReceipt: "HOLD",
  liveProviderReadback: "HOLD",
} as const);

const PACKET: LayoutRuntimeAdapterPacket = Object.freeze({
  schemaVersion: LAYOUT_RUNTIME_ADAPTER_SCHEMA,
  ls04: Object.freeze({
    source: "injected",
    workingContentIdentity: "fake:ls04:working-content:v1",
    promotionReceiptIdentity: "fake:ls04:promotion:v1",
    capabilityPlanId: "B",
  }),
  ls05: Object.freeze({
    source: "injected",
    adapterIdentity: "fake:ls05:adapter:v1",
    materializationReceiptIdentity: "fake:ls05:materialization:v1",
    layoutPackId: "A1",
  }),
  provider: Object.freeze({
    source: "injected",
    providerId: "master-template-type-1",
    semver: "2.0.0-a1.1",
    layoutPackId: "A1",
    candidateIdentity: "fake:provider:a1:v1",
  }),
  layout: Object.freeze({ source: "injected", layoutPackId: "A1", planId: "B" }),
});

/** Deterministic test double only: it never reads LS-05 files, env, network, or live state. */
export function createFakeLs05LayoutAdapter(
  mutate?: (packet: LayoutRuntimeAdapterPacket) => LayoutRuntimeAdapterPacket,
): LayoutRuntimeAdapter {
  const packet = mutate ? mutate(PACKET) : PACKET;
  return Object.freeze({ read: () => packet });
}

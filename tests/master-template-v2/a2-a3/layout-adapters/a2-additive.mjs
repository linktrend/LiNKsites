/**
 * ISS-28 additive A2 layout adapter declared after the post-A1 amendment.
 * Maps bound A2 layout digest onto the architecture-ready split-shell composition
 * without changing accepted A1 or plan semantics.
 */

import { PROVIDER_PIN } from "../constants.mjs";
import { ClosedFailure } from "../identities.mjs";

export const A2_ADDITIVE_ADAPTER = Object.freeze({
  adapterId: "linksites.master-template.layout.a2-additive",
  adapterVersion: "2.0.0",
  layoutPackId: "A2",
  layoutPack: "a2",
  pageRenderer: "composition-a2-split-shell",
  regions: Object.freeze(["site-header", "aside", "main", "site-footer"]),
  architectureReady: true,
  additive: true,
  frozen: false,
  mutatesAcceptedA1: false,
  mutatesPlanSemantics: false,
  providerLayoutSha256: PROVIDER_PIN.a2LayoutSha256,
  source: "post-a1-amendment-additive",
});

export function resolveA2AdditiveAdapter(input = {}) {
  if (input.layoutPackId != null && input.layoutPackId !== "A2" && input.layoutPackId !== "a2") {
    throw new ClosedFailure("iss28_mapping", `A2 adapter refused layoutPackId=${String(input.layoutPackId)}`);
  }
  if (input.providerLayoutSha256 != null && input.providerLayoutSha256 !== PROVIDER_PIN.a2LayoutSha256) {
    throw new ClosedFailure("iss28_mapping", "A2 provider layout digest mismatch");
  }
  if (input.mutatesAcceptedA1 === true) {
    throw new ClosedFailure("a1_mutated", "A2 additive mapping must not mutate accepted A1");
  }
  return A2_ADDITIVE_ADAPTER;
}

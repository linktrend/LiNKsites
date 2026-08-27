/**
 * ISS-28 additive A3 layout adapter declared after the post-A1 amendment.
 * Maps bound A3 layout digest onto the architecture-ready stacked-shell composition
 * without changing accepted A1 or plan semantics.
 */

import { PROVIDER_PIN } from "../constants.mjs";
import { ClosedFailure } from "../identities.mjs";

export const A3_ADDITIVE_ADAPTER = Object.freeze({
  adapterId: "linksites.master-template.layout.a3-additive",
  adapterVersion: "2.0.0",
  layoutPackId: "A3",
  layoutPack: "a3",
  pageRenderer: "composition-a3-stacked-shell",
  regions: Object.freeze(["site-header", "main", "secondary", "site-footer"]),
  architectureReady: true,
  additive: true,
  frozen: false,
  mutatesAcceptedA1: false,
  mutatesPlanSemantics: false,
  providerLayoutSha256: PROVIDER_PIN.a3LayoutSha256,
  source: "post-a1-amendment-additive",
});

export function resolveA3AdditiveAdapter(input = {}) {
  if (input.layoutPackId != null && input.layoutPackId !== "A3" && input.layoutPackId !== "a3") {
    throw new ClosedFailure("iss28_mapping", `A3 adapter refused layoutPackId=${String(input.layoutPackId)}`);
  }
  if (input.providerLayoutSha256 != null && input.providerLayoutSha256 !== PROVIDER_PIN.a3LayoutSha256) {
    throw new ClosedFailure("iss28_mapping", "A3 provider layout digest mismatch");
  }
  if (input.mutatesAcceptedA1 === true) {
    throw new ClosedFailure("a1_mutated", "A3 additive mapping must not mutate accepted A1");
  }
  return A3_ADDITIVE_ADAPTER;
}

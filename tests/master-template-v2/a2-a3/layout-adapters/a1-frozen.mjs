/**
 * ISS-28 frozen A1 layout adapter. Read-only freeze of accepted LS-08 semantics.
 * This module must not introduce A1 structural or plan-semantic changes.
 */

import { FROZEN_A1 } from "../constants.mjs";
import { ClosedFailure } from "../identities.mjs";

export const A1_FROZEN_ADAPTER = Object.freeze({
  adapterId: "linksites.master-template.layout.a1-frozen",
  adapterVersion: "2.0.0-a1.1",
  layoutPackId: "A1",
  layoutPack: "a1",
  pageRenderer: FROZEN_A1.pageRenderer,
  regions: FROZEN_A1.regions,
  architectureReady: false,
  additive: false,
  frozen: true,
  mutatesAcceptedA1: false,
  providerLayoutDigestBound: false,
  source: "ls08-accepted-freeze",
});

export function resolveFrozenA1Adapter() {
  return A1_FROZEN_ADAPTER;
}

export function assertA1NotMutated(candidate) {
  if (!candidate || typeof candidate !== "object") {
    throw new ClosedFailure("a1_mutated", "A1 adapter candidate is absent");
  }
  if (candidate.pageRenderer !== A1_FROZEN_ADAPTER.pageRenderer) {
    throw new ClosedFailure("a1_mutated", "A1 pageRenderer must remain composition-a1-linear-shell");
  }
  const regions = Array.isArray(candidate.regions) ? candidate.regions.join("|") : "";
  if (regions !== A1_FROZEN_ADAPTER.regions.join("|")) {
    throw new ClosedFailure("a1_mutated", "A1 region set must remain site-header|main|site-footer");
  }
  if (candidate.architectureReady === true || candidate.mutatesAcceptedA1 === true) {
    throw new ClosedFailure("a1_mutated", "A1 adapter must remain frozen and non-architecture-ready");
  }
  return true;
}

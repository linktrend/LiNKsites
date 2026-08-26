/**
 * ISS-28 additive layout adapter registry declared after the post-A1 amendment.
 * A1 is frozen. A2/A3 are additive. Unknown packs fail closed.
 * Plan A/B/C/L identities are not remapped.
 */

import { ADDITIVE_ADAPTER_MODULES, POST_A1_AMENDMENT } from "../constants.mjs";
import { ClosedFailure } from "../identities.mjs";
import { A1_FROZEN_ADAPTER, assertA1NotMutated, resolveFrozenA1Adapter } from "./a1-frozen.mjs";
import { A2_ADDITIVE_ADAPTER, resolveA2AdditiveAdapter } from "./a2-additive.mjs";
import { A3_ADDITIVE_ADAPTER, resolveA3AdditiveAdapter } from "./a3-additive.mjs";

export const DECLARED_AFTER_AMENDMENT = Object.freeze({
  amendmentCommit: POST_A1_AMENDMENT.commit,
  amendmentTree: POST_A1_AMENDMENT.tree,
  modules: ADDITIVE_ADAPTER_MODULES,
});

export const PLAN_SEMANTICS = Object.freeze({
  a: { planId: "a", isolatedShell: false },
  b: { planId: "b", isolatedShell: false },
  c: { planId: "c", isolatedShell: false },
  l: { planId: "l", isolatedShell: true },
});

export function resolveLayoutAdapter(layoutPackId, input = {}) {
  const pack = String(layoutPackId || "").toLowerCase();
  if (pack === "a1") {
    const frozen = resolveFrozenA1Adapter();
    assertA1NotMutated(frozen);
    return frozen;
  }
  if (pack === "a2") return resolveA2AdditiveAdapter({ ...input, layoutPackId: "A2" });
  if (pack === "a3") return resolveA3AdditiveAdapter({ ...input, layoutPackId: "A3" });
  throw new ClosedFailure("iss28_mapping", `unknown layout pack "${String(layoutPackId)}"`);
}

export function assertStructurallyDistinctAdapters() {
  const signatures = [A1_FROZEN_ADAPTER, A2_ADDITIVE_ADAPTER, A3_ADDITIVE_ADAPTER].map(
    (item) => `${item.pageRenderer}|${item.regions.join("|")}`,
  );
  if (new Set(signatures).size !== signatures.length) {
    throw new ClosedFailure("iss28_mapping", "A1/A2/A3 adapter compositions are not structurally distinct");
  }
  assertA1NotMutated(A1_FROZEN_ADAPTER);
  if (A2_ADDITIVE_ADAPTER.mutatesAcceptedA1 || A3_ADDITIVE_ADAPTER.mutatesAcceptedA1) {
    throw new ClosedFailure("a1_mutated", "additive adapters must not mutate accepted A1");
  }
  if (A2_ADDITIVE_ADAPTER.mutatesPlanSemantics || A3_ADDITIVE_ADAPTER.mutatesPlanSemantics) {
    throw new ClosedFailure("iss28_mapping", "additive adapters must not change plan A/B/C/L semantics");
  }
  return true;
}

export function resolvePlanSemantics(planId) {
  const plan = PLAN_SEMANTICS[String(planId || "").toLowerCase()];
  if (!plan) throw new ClosedFailure("iss28_mapping", `unknown plan "${String(planId)}"`);
  return plan;
}

export { A1_FROZEN_ADAPTER, A2_ADDITIVE_ADAPTER, A3_ADDITIVE_ADAPTER };

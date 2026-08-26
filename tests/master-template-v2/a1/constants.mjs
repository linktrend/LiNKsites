/**
 * LS-08 ISS-25..27 preparation constants.
 * Packet completion and accepted consumer receipts are forbidden here.
 */

export const HARNESS_ID = "ls08-a1-iss-25-27-preparation";
export const HARNESS_VERSION = "0.1.0";
export const PACKET_ID = "LS-08";
export const GITHUB_ISSUE = 334;
export const ISSUES = Object.freeze(["ISS-25", "ISS-26", "ISS-27"]);

export const SURFACES = Object.freeze(["server", "browser"]);
export const PLANS = Object.freeze(["a", "b", "c", "l"]);
export const LAYOUT_PACK = "a1";
export const SCENARIOS = Object.freeze([
  "product",
  "service",
  "hybrid",
  "local",
  "resources",
  "trust",
  "failure",
  "lifecycle",
]);

export const REVIEW_DIMENSIONS = Object.freeze([
  "visual",
  "accessibility",
  "privacy",
  "tenant",
]);

export const LIFECYCLE_PROOFS = Object.freeze(["cache_restart", "tamper", "rollback", "migration"]);

export const CONSUMER_VERDICTS = Object.freeze([
  "candidate_materialized",
  "adapter_compatible",
  "payload_projection_valid",
  "server_render_valid",
  "browser_fixture_valid",
  "migration_rollback_valid",
  "tamper_rejected",
  "cache_restart_valid",
]);

export const VERDICT_VALUES = Object.freeze(["NOT_RUN", "FAIL", "HOLD", "UNAVAILABLE", "PASS"]);

export const EVIDENCE_CLASSES = Object.freeze(["preparation-fixture", "schema-fixture", "paired-proof"]);

export const CHECK_IDS = Object.freeze({
  PACKET_SCOPE: "packet.scope",
  PREPARATION_ONLY: "packet.preparation_only",
  MATRIX_COMPLETE: "iss25.matrix_complete",
  REVIEW_DIMENSIONS: "iss26.review_dimensions",
  LIFECYCLE_FIXTURES: "iss26.lifecycle_fixtures",
  RECEIPT_HOLD: "iss27.receipt_hold",
  NO_LS07_INVENTION: "integrity.no_ls07_invention",
  NO_PROVIDER_BYTES: "integrity.no_provider_bytes",
  NO_ACCEPTED_RECEIPT: "integrity.no_accepted_receipt",
  NO_COMPLETION: "integrity.no_completion_claim",
  DEPENDENCIES_OPEN: "dependencies.declared_unsatisfied",
});

export const FORBIDDEN_FABRICATION_KEYS = Object.freeze([
  "providerBytes",
  "providerCheckout",
  "a1Bytes",
  "liveProvider",
  "inventedLs07Checkpoint",
  "protectedLs07Sha",
]);

export const FORBIDDEN_RECEIPT_CLAIMS = Object.freeze([
  "production_selectable",
  "production_observed",
  "provider_contract_valid",
]);

export const PENDING_DEPENDENCIES = Object.freeze([
  {
    id: "ls07-protected-integration",
    required: true,
    satisfied: false,
    reason:
      "LS-07 SSR/SEO/forms/accessibility work is not a protected-integrated checkpoint on origin/development. This harness does not invent one.",
  },
  {
    id: "exact-provider-a1-binding",
    required: true,
    satisfied: false,
    reason:
      "Exact LiNKlibraries A1 candidate bytes/identities are not bound. This harness does not fetch or fabricate provider bytes.",
  },
]);

export const INDEPENDENT_OF = Object.freeze([
  "apps/**",
  "packages/**",
  "provider-bytes",
  "LS-07-protected-checkpoint",
  "LS-05-immutable-a1",
]);

export const NOT_COMPLETION_OF = Object.freeze(["LS-08", "ISS-25", "ISS-26", "ISS-27"]);

export const OWNED_PATHS = Object.freeze([
  "tests/master-template-v2/a1/**",
  "docs/evidence/master-v2/a1/**",
]);

export const PROHIBITED_PATHS = Object.freeze([
  "apps/**",
  "packages/**",
  "supabase/migrations/**",
  "provider-bytes",
]);

/**
 * @returns {{ surface: string, planId: string, scenario: string }[]}
 */
export function requiredMatrixSlots() {
  const slots = [];
  for (const surface of SURFACES) {
    for (const planId of PLANS) {
      for (const scenario of SCENARIOS) {
        slots.push({ surface, planId, scenario });
      }
    }
  }
  return slots;
}

export function slotKey(slot) {
  return `${slot.surface}:${slot.planId}:${slot.scenario}`;
}

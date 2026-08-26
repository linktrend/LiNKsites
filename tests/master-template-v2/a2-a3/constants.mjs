/**
 * LS-09 ISS-28..30 A2/A3 complete consumer proof constants.
 * Binds exact protected development, LS-08 freeze, post-A1 amendment ancestor,
 * and final provider 2.0.0 identities. Does not embed provider bytes and does
 * not claim production selectability, VPS/live proof, or MWT outputs.
 */

export const HARNESS_ID = "ls09-a2-a3-iss-28-30-complete-provider-proof";
export const HARNESS_VERSION = "1.0.0";
export const PACKET_ID = "LS-09";
export const GITHUB_ISSUE = 353;
export const ISSUES = Object.freeze(["ISS-28", "ISS-29", "ISS-30"]);

export const SURFACES = Object.freeze(["server", "browser"]);
export const PLANS = Object.freeze(["a", "b", "c", "l"]);
export const LAYOUT_PACKS = Object.freeze(["a2", "a3"]);
export const DIMENSIONS = Object.freeze([
  "semantic",
  "functional",
  "visual",
  "accessibility",
  "performance",
]);

export const REVIEW_DIMENSIONS = Object.freeze([
  "visual",
  "accessibility",
  "privacy",
  "tenant",
  "performance",
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

export const ALL_LAYOUT_ADAPTER_VERDICTS = Object.freeze([
  "a1_adapter_compatible",
  "a2_adapter_compatible",
  "a3_adapter_compatible",
  "a1_browser_fixture_valid",
  "a2_browser_fixture_valid",
  "a3_browser_fixture_valid",
]);

export const VERDICT_VALUES = Object.freeze(["NOT_RUN", "FAIL", "HOLD", "UNAVAILABLE", "PASS"]);
export const EVIDENCE_CLASSES = Object.freeze(["paired-proof"]);

/** Exact protected LiNKsites development that integrated LS-08. */
export const PROTECTED_DEVELOPMENT = Object.freeze({
  repository: "linktrend/LiNKsites",
  ref: "development",
  commit: "fd36e3084ddbd26356e3c12883c8754003d671ce",
  tree: "b0772be140486124362ee9bba4eb7d4447ecd227",
});

/** Frozen LS-08 A1 identities. LS-09 must not mutate these semantics. */
export const FROZEN_A1 = Object.freeze({
  packetId: "LS-08",
  layoutPack: "a1",
  pageRenderer: "composition-a1-linear-shell",
  regions: Object.freeze(["site-header", "main", "site-footer"]),
  architectureReady: false,
  releaseEntryVersion: "master-template-type-1@2.0.0-a1.1",
  providerCommit: "f28fd53d454cbc33d97951d8e62826dae5a83e40",
  providerTree: "34dc7467f4eb382ab7fbe258c5adc0f857d8ab5b",
  overallVerdict: "A1_SEMANTICS_FROZEN",
  evidenceDir: "docs/evidence/master-v2/a1",
});

/** Post-A1 amendment ancestor (identity bind only). */
export const POST_A1_AMENDMENT = Object.freeze({
  repository: "linktrend/LiNKlibraries",
  commit: "e71598781266199cd4fde0c14e6501102a3147a2",
  tree: "076bc0bebdce20af6bb92e7a608eae7e2d93492e",
  bytesEmbedded: false,
});

/** Immutable LS-09 provider handoff receipt identity. Bytes are not fabricated. */
export const PROVIDER_HANDOFF = Object.freeze({
  path: "/Users/linktrend/Projects/LiNKlibraries/.git/execution-evidence/mwt-ls09-provider-handoff-20260826.json",
  sha256: "0b5ffe70f47fea9cec24cf0dc86ef33720bed2edad350623b2e418cc8da5a0a6",
  bytesEmbedded: false,
});

/** Protected LiNKlibraries main final 2.0.0 pin. Bytes are not copied. */
export const PROVIDER_PIN = Object.freeze({
  repository: "linktrend/LiNKlibraries",
  ref: "main",
  commit: "9764638f0a17eeb65be8dd5880ed241a8d3b3fa3",
  tree: "57600ebd7362f107c421c61026ab0bf4c9b1c51c",
  releaseEntryVersion: "master-template-type-1@2.0.0",
  entryId: "master-template-type-1",
  version: "2.0.0",
  lifecycle: "draft",
  selectability: "non_selectable",
  compatibility: "unknown",
  artifactTree: "b599c0f0ee6bc2aad3484aa42ef1fd9e86a05758",
  releaseManifestSha256: "f1ba6261aefd628672a4bae3333fc07827f82df1a39083e1c20ae881c2cc9916",
  inventorySha256: "9d94ab2d18d1c77b1a709739c38ad8ca95f1d0ef571092dd2c710573ab31cb20",
  payloadSha256: "fc6ed2e8748960c6cd53ac69e678a1fca8bd572105ea747941ceb9e2225c4489",
  releaseReceiptSha256: "f0a9ec65459e79edee1ca3867ca929dbd649c0ed261ca003be9d73fda1b1c42b",
  a2LayoutSha256: "4bf209397a048f9177b082d7141a1efe453f3b9456e27c54beb2a02478ad0c3e",
  a3LayoutSha256: "6c59252601be7e199615c63e2929f40a818cca282981d365f71abb191df71c88",
  bytesEmbedded: false,
  conformanceClaimed: false,
  selectableClaimed: false,
  productionSelectable: false,
  vpsProofClaimed: false,
  liveProofClaimed: false,
  mwtOutputClaimed: false,
});

export const ADDITIVE_ADAPTER_MODULES = Object.freeze([
  "tests/master-template-v2/a2-a3/layout-adapters/a1-frozen.mjs",
  "tests/master-template-v2/a2-a3/layout-adapters/a2-additive.mjs",
  "tests/master-template-v2/a2-a3/layout-adapters/a3-additive.mjs",
  "tests/master-template-v2/a2-a3/layout-adapters/index.mjs",
]);

export const CHECK_IDS = Object.freeze({
  PACKET_SCOPE: "packet.scope",
  ISS28_A1_UNCHANGED: "iss28.a1_semantics_unchanged",
  ISS28_A2_MAPPING: "iss28.a2_additive_mapping",
  ISS28_A3_MAPPING: "iss28.a3_additive_mapping",
  ISS28_ADAPTERS_DECLARED: "iss28.additive_adapters_declared",
  MATRIX_COMPLETE: "iss29.matrix_complete",
  MATRIX_RUN: "iss29.matrix_run",
  REVIEW_DIMENSIONS: "iss29.review_dimensions",
  LIFECYCLE_PROOF: "iss29.lifecycle_proof",
  ALL_LAYOUT_VERDICTS: "iss30.all_layout_adapter_browser_verdicts",
  ADMISSION_EVIDENCE: "iss30.final_provider_admission_evidence",
  LS08_BOUND: "integrity.ls08_protected_bound",
  PROVIDER_PIN_BOUND: "integrity.provider_pin_bound",
  AMENDMENT_BOUND: "integrity.post_a1_amendment_bound",
  HANDOFF_BOUND: "integrity.provider_handoff_bound",
  NO_PROVIDER_BYTES: "integrity.no_provider_bytes",
  NO_SELECTABILITY: "integrity.no_selectability_or_live_proof",
  PRODUCTION_GATES: "integrity.production_selection_gated",
});

export const FORBIDDEN_FABRICATION_KEYS = Object.freeze([
  "providerBytes",
  "providerCheckout",
  "a1Bytes",
  "a2Bytes",
  "a3Bytes",
  "liveProvider",
  "inventedLs08Checkpoint",
  "protectedLs08Sha",
  "mwtOutputs",
  "vpsProof",
  "liveProof",
]);

export const FORBIDDEN_RECEIPT_CLAIMS = Object.freeze([
  "production_selectable",
  "production_observed",
  "provider_contract_valid",
  "provider_conformance",
  "selectable",
  "mwt-08",
  "MWT-08",
  "mwt08",
  "vps-live",
  "live_proof",
]);

export const SATISFIED_DEPENDENCIES = Object.freeze([
  {
    id: "ls08-protected-integration",
    required: true,
    satisfied: true,
    reason: "LS-08 is protected-integrated on origin/development at the exact bound commit/tree.",
    identity: { ...PROTECTED_DEVELOPMENT },
  },
  {
    id: "exact-provider-final-2.0.0-binding",
    required: true,
    satisfied: true,
    reason: "Final master-template-type-1@2.0.0 pin is bound by identity only. Provider bytes are not copied.",
    identity: {
      repository: PROVIDER_PIN.repository,
      ref: PROVIDER_PIN.ref,
      commit: PROVIDER_PIN.commit,
      tree: PROVIDER_PIN.tree,
      releaseEntryVersion: PROVIDER_PIN.releaseEntryVersion,
      lifecycle: PROVIDER_PIN.lifecycle,
      selectability: PROVIDER_PIN.selectability,
      artifactTree: PROVIDER_PIN.artifactTree,
      releaseManifestSha256: PROVIDER_PIN.releaseManifestSha256,
      inventorySha256: PROVIDER_PIN.inventorySha256,
      payloadSha256: PROVIDER_PIN.payloadSha256,
      releaseReceiptSha256: PROVIDER_PIN.releaseReceiptSha256,
      a2LayoutSha256: PROVIDER_PIN.a2LayoutSha256,
      a3LayoutSha256: PROVIDER_PIN.a3LayoutSha256,
    },
  },
  {
    id: "post-a1-amendment-ancestor",
    required: true,
    satisfied: true,
    reason: "Post-A1 amendment ancestor is bound by exact commit/tree. Amendment bytes are not fabricated.",
    identity: { ...POST_A1_AMENDMENT },
  },
  {
    id: "mwt-ls09-provider-handoff",
    required: true,
    satisfied: true,
    reason: "LS-09 provider handoff receipt is bound by exact path and SHA-256. Receipt bytes are not fabricated.",
    identity: { ...PROVIDER_HANDOFF },
  },
]);

export const OWNED_PATHS = Object.freeze([
  "tests/master-template-v2/a2-a3/**",
  "docs/evidence/master-v2/a2-a3/**",
  ...ADDITIVE_ADAPTER_MODULES,
]);

export const PROHIBITED_PATHS = Object.freeze([
  "apps/**",
  "packages/**",
  "supabase/migrations/**",
  "tests/master-template-v2/a1/**",
  "docs/evidence/master-v2/a1/**",
  "provider-bytes",
]);

export const TENANT_ID = "tenant-ls09-a2-a3";
export const VIEWPORTS = Object.freeze({
  desktop: Object.freeze({ width: 1280, height: 720 }),
  mobile: Object.freeze({ width: 390, height: 844 }),
});

export const PERF_LAB_BUDGETS = Object.freeze({
  lcpSeconds: 2.5,
  inpMs: 200,
  cls: 0.1,
  class: "lab",
  fieldData: false,
});

/**
 * @returns {{ layoutPack: string, surface: string, planId: string, dimension: string }[]}
 */
export function requiredMatrixSlots() {
  const slots = [];
  for (const layoutPack of LAYOUT_PACKS) {
    for (const surface of SURFACES) {
      for (const planId of PLANS) {
        for (const dimension of DIMENSIONS) {
          slots.push({ layoutPack, surface, planId, dimension });
        }
      }
    }
  }
  return slots;
}

export function slotKey(slot) {
  return `${slot.layoutPack}:${slot.surface}:${slot.planId}:${slot.dimension}`;
}

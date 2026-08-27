/**
 * LS-08 ISS-25..27 A1 paired consumer proof constants.
 * Binds exact provider pin and EXT-LS-01 receipt identity. Does not embed
 * provider bytes and does not claim selectability, provider conformance, or MWT-08.
 */

export const HARNESS_ID = "ls08-a1-iss-25-27-paired-consumer-proof";
export const HARNESS_VERSION = "1.0.0";
export const PACKET_ID = "LS-08";
export const GITHUB_ISSUE = 350;
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

export const EVIDENCE_CLASSES = Object.freeze(["paired-proof"]);

export const PROTECTED_DEVELOPMENT = Object.freeze({
  repository: "linktrend/LiNKsites",
  ref: "development",
  commit: "e89cfd49fafe7f1dc7b137f77c2ab481140a6cca",
  tree: "27c5578ab1416b7a37ddf79168b91be1547eb127",
});

/** Protected LiNKlibraries MWT-07 A1 pin. Bytes are not copied. */
export const PROVIDER_PIN = Object.freeze({
  repository: "linktrend/LiNKlibraries",
  packet: "MWT-07",
  commit: "f28fd53d454cbc33d97951d8e62826dae5a83e40",
  tree: "34dc7467f4eb382ab7fbe258c5adc0f857d8ab5b",
  releaseEntryVersion: "master-template-type-1@2.0.0-a1.1",
  entryId: "master-template-type-1",
  version: "2.0.0-a1.1",
  lifecycle: "draft",
  selectability: "non_selectable",
  compatibility: "unknown",
  artifactTree: "a8c6c23fd41a5f0eb9221276998f96862a50119f",
  releaseManifestSha256: "d681e5305b611aa5247a0fa1711ce75e0a1734e121e6790e50c802b26c1c9697",
  inventorySha256: "ad743168022139e7e70bd38ae19c56503cdfc2c4fcc912ece154f4f17b70cc98",
  dependencyLockSha256: "59f4db72af5de4731c68ee44b525f494c6cd067b42f8da310c345829f1b09c23",
  payloadProjectionSha256: "b096c013b53edf6fbb30e7794830ec462a5ff47c5b085d43218e91541e0af84a",
  releaseReceiptSha256: "2668e0df4d317c4a0d4c9fbd1be7fe5f70f7024195bb310c8644849bf949de57",
  bytesEmbedded: false,
  conformanceClaimed: false,
  selectableClaimed: false,
  mwt08Claimed: false,
});

/** Accepted EXT-LS-01 consumer proof receipt identity. Contents are not fabricated. */
export const EXT_LS_01_RECEIPT = Object.freeze({
  gateId: "EXT-LS-01",
  path: ".git/linktrend-evidence/execution-2026-08-25/ext-ls-01-issue321-966a4b0/consumer-proof-receipt.json",
  sha256: "5422616a2db650af44d3c87253066dfc5acd80054b4a6dcd35bd83ce6ca978e3",
  consumerCommit: "966a4b08c5fdb0fc9a9bb429a5916600b459cee9",
  consumerTree: "fa6f3fcbd737c9954214d79b733fe9b8f5d4f68f",
  bytesEmbedded: false,
  acceptedBinding: true,
});

export const CHECK_IDS = Object.freeze({
  PACKET_SCOPE: "packet.scope",
  MATRIX_COMPLETE: "iss25.matrix_complete",
  MATRIX_RUN: "iss25.matrix_run",
  REVIEW_DIMENSIONS: "iss26.review_dimensions",
  LIFECYCLE_PROOF: "iss26.lifecycle_proof",
  RECEIPT_EMITTED: "iss27.receipt_emitted",
  A1_SEMANTICS_FROZEN: "iss27.a1_semantics_frozen",
  LS07_BOUND: "integrity.ls07_protected_bound",
  PROVIDER_PIN_BOUND: "integrity.provider_pin_bound",
  EXT_LS01_BOUND: "integrity.ext_ls01_receipt_bound",
  NO_PROVIDER_BYTES: "integrity.no_provider_bytes",
  NO_SELECTABILITY: "integrity.no_selectability_or_conformance",
  NO_MWT08: "integrity.no_mwt08_claim",
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
  "provider_conformance",
  "selectable",
  "mwt-08",
  "MWT-08",
  "mwt08",
]);

export const SATISFIED_DEPENDENCIES = Object.freeze([
  {
    id: "ls07-protected-integration",
    required: true,
    satisfied: true,
    reason: "LS-07 is present on protected origin/development at the exact bound commit/tree.",
    identity: { ...PROTECTED_DEVELOPMENT },
  },
  {
    id: "exact-provider-a1-binding",
    required: true,
    satisfied: true,
    reason: "MWT-07 A1 pin is bound by identity only. Provider bytes are not copied.",
    identity: {
      repository: PROVIDER_PIN.repository,
      commit: PROVIDER_PIN.commit,
      tree: PROVIDER_PIN.tree,
      releaseEntryVersion: PROVIDER_PIN.releaseEntryVersion,
      lifecycle: PROVIDER_PIN.lifecycle,
      selectability: PROVIDER_PIN.selectability,
    },
  },
  {
    id: "ext-ls-01-consumer-proof-receipt",
    required: true,
    satisfied: true,
    reason: "EXT-LS-01 receipt is bound by exact path and SHA-256. Receipt bytes are not fabricated.",
    identity: { ...EXT_LS_01_RECEIPT },
  },
]);

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

export const TENANT_ID = "tenant-ls08-a1";
export const VIEWPORTS = Object.freeze({
  desktop: Object.freeze({ width: 1280, height: 720 }),
  mobile: Object.freeze({ width: 390, height: 844 }),
});

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

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

/** Protected LiNKlibraries A1 pin. Bytes are not copied. */
export const PROVIDER_PIN = Object.freeze({
  repository: "linktrend/LiNKlibraries",
  packet: "MWT-07",
  commit: "998c02c29fae5acc429804d7e03dcc74df7e7a52",
  tree: "63c7f6f8811b93f90a1dcc101cdeea94bdc6d4b3",
  releaseEntryVersion: "master-template-type-1@2.0.0-a1.1",
  entryId: "master-template-type-1",
  version: "2.0.0-a1.1",
  lifecycle: "draft",
  selectability: "non_selectable",
  compatibility: "unknown",
  artifactTree: "6aadb2dff52efe30f512ddb2a5510a881fc027e2",
  releaseManifestSha256: "b4e0b141631694101b8daf5494499160b31e2ba6cbe66d0ec622f9690d567026",
  inventorySha256: "29262c08e9db2797ff292dc8179965c0ed080064a0b71d1bb477c4e0d63f0f72",
  dependencyLockSha256: "59f4db72af5de4731c68ee44b525f494c6cd067b42f8da310c345829f1b09c23",
  payloadProjectionSha256: "884eaaa612a25167c84eb77dd271ee1413dabe6f08c56dc65464c5b464d2e4d6",
  releaseReceiptSha256: "9e53946b4dadcec3e939bd1f42bb41b1d8851d29ac7c2de3f4a66dcdd9ce1021",
  catalogueBindingReceiptSha256: "a1b47f09f981c4db4150ee2297a9c4cd6ca45a0f8487449ac1791147cd1aa6d3",
  rollback: "node scripts/v2/rebind-master-template-v2-release.mjs --version 2.0.0-a1.1 --rollback",
  bytesEmbedded: false,
  conformanceClaimed: false,
  selectableClaimed: false,
  mwt08Claimed: false,
});

/** EXT-LS-01 consumer proof receipt identity. Out-of-tree bytes are authoritative. */
export const EXT_LS_01_RECEIPT = Object.freeze({
  gateId: "EXT-LS-01",
  path: ".git/linktrend-evidence/ext-ls-01-issue551/consumer-proof-receipt.json",
  sha256: "c0f05d4e314ca62b6e83f420d1934e8ccd823d9a4399b1547abe30f92521b8a5",
  consumerCommit: "df53bbaf854a44ea651deb5af4f165aa9df4cccb",
  consumerTree: "4d08448f5e629747b0df93a6d80f52fc5402be66",
  bytesEmbedded: false,
  acceptedBinding: false,
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
    reason: "Protected A1 pin is bound by independently recomputed identity only. Provider bytes are not copied.",
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
    reason: "EXT-LS-01 receipt is bound only when out-of-tree bytes exist and the SHA-256 recomputes. Missing receipt cannot report bound=true.",
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

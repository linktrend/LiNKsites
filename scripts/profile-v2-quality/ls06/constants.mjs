export const HARNESS_ID = "profile-v2-quality-ls06-preparation";
export const HARNESS_VERSION = "0.1.0";
export const PACKET_SCHEMA = "ls06-preparation-packet/v1";
export const CONTRACT_SCHEMA = "ls06-layout-renderer-contract/v1";
export const CONFIGURATION_SCHEMA = "ls06-renderer-configuration/v1";
export const ROLLBACK_SCHEMA = "ls06-rollback-plan/v1";

export const INJECTED_SOURCE = "injected";

export const REQUIRED_LAYOUT_PACKS = Object.freeze(["A1", "A2", "A3"]);
export const REQUIRED_SHELL_REGIONS = Object.freeze([
  "site-header",
  "main",
  "site-footer",
]);
export const REQUIRED_SHELL_BEHAVIOR = Object.freeze([
  "header",
  "footer",
  "mobile",
  "locale",
  "actions",
]);
export const REQUIRED_FAMILY_IDS = Object.freeze([
  "home",
  "about",
  "contact",
  "legal",
  "collection",
  "detail",
]);

export const CHECK_IDS = Object.freeze({
  PACKET_SCHEMA: "packet.schema",
  PREPARATION_ONLY: "packet.preparation_only",
  LS04_IDENTITY: "identities.ls04",
  LS05_IDENTITY: "identities.ls05",
  PROVIDER_IDENTITY: "identities.provider",
  LAYOUT_IDENTITY: "identities.layout",
  INJECTED_ONLY: "identities.injected_only",
  LAYOUT_PROVIDER_MATCH: "identities.layout_provider_match",
  CONTRACT_DISTINCT: "contract.structurally_distinct",
  CONTRACT_SHELL: "contract.shell_header_footer",
  CONTRACT_TYPE_L: "contract.type_l_isolation",
  CONTRACT_NO_PLACEHOLDERS: "contract.no_placeholders",
  CONFIG_OFFLINE: "configuration.offline",
  CONFIG_BIND: "configuration.identity_bind",
  ROLLBACK_PREVIOUS: "rollback.previous_present",
  ROLLBACK_READBACK: "rollback.readback",
  ROLLBACK_OFFLINE: "rollback.offline",
  ROLLBACK_DIGEST: "rollback.configuration_digest",
  NO_PROVIDER_BYTES: "integrity.no_provider_bytes",
  NO_COMPLETION: "integrity.no_completion_claim",
});

export const FORBIDDEN_FABRICATION_KEYS = Object.freeze([
  "providerBytes",
  "providerCheckout",
  "providerResult",
  "liveProvider",
  "appsPath",
  "packagesPath",
  "webMasterPath",
]);

export const FORBIDDEN_SOURCE_VALUES = Object.freeze([
  "live",
  "discovered",
  "checkout",
  "runtime",
  "fabricated",
  "apps",
  "packages",
]);

export const NOT_COMPLETION_OF = Object.freeze(["LS-06"]);
export const INDEPENDENT_OF = Object.freeze([
  "apps/**",
  "packages/**",
  "provider-bytes",
  "LS-04-implementation",
  "LS-05-implementation",
]);

export const EVIDENCE_BOUNDARIES = Object.freeze({
  evaluated: [
    "injected-ls04-identity",
    "injected-ls05-identity",
    "injected-provider-identity",
    "injected-layout-identity",
    "layout-renderer-contract",
    "offline-renderer-configuration",
    "offline-rollback-plan",
  ],
  notEvaluated: [
    "apps/web-master",
    "packages",
    "provider-bytes",
    "live-runtime",
    "LS-06-completion",
    "LS-04-product-code",
    "LS-05-product-code",
  ],
});

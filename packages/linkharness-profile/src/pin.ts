/** Exact LiNKharness HC1-A pin. Bound by commit/tree; source is not copied. */

export const HARNESS_PIN = Object.freeze({
  label: "HC1-A",
  repository: "linktrend/LiNKharness",
  commit: "de0abe31736e878aad3447bf4b720a40142d8a6e",
  tree: "526cc9ab8feec3ae95089639f03f0382b9878e63",
  contractsPackage: "@linktrend/linkharness-contracts",
  contractsVersion: "0.1.0",
  compatibleRange: ">=0.1.0 <0.2.0",
  copyPolicy: "do_not_copy_harness_source",
} as const);

export const PROFILE_IDENTITY = Object.freeze({
  identityType: "profile" as const,
  id: "linksites-profile",
  version: "0.1.0",
});

export const PROGRAM_IDENTITY = Object.freeze({
  identityType: "program" as const,
  id: "linksites-program",
  version: "0.1.0",
});

export const PROFILE_CLOCK = "2026-08-24T00:00:00.000Z";
export const CUTOVER_PACKET = "LS-10";
export const PACKET_ID = "LS-01";
export const PACKET_ISSUES = Object.freeze(["ISS-04", "ISS-05", "ISS-06"] as const);

export const LIBRARY_PIN = Object.freeze({
  repository: "linktrend/LiNKlibraries",
  planningCommit: "f25b385c1e34d958834ce4b7e085ab454a956918",
  planningTree: "626828346c8a4841c8ae95ac6b4fa9af4941f1fb",
  consumerCommit: "6b87993ddaf403aebe7bef97bd268a543a1d14eb",
  consumerTree: "a2bf0d2e7759e5e6952dacfdeab3ef9b03657d3d",
  productId: "master-template-type-1",
  selectable: false,
  bytesCopied: false,
  lifecycle: "draft",
} as const);

export const LS00_EVIDENCE = Object.freeze({
  packet: "LS-00",
  identityPath: "docs/evidence/profile-v2-baseline/identity.json",
  validatorPath: "scripts/validate-profile-v2-baseline.mjs",
} as const);

#!/usr/bin/env node
/**
 * Persist LS-09 ISS-28..30 evidence under docs/evidence/master-v2/a2-a3.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import {
  ADDITIVE_ADAPTER_MODULES,
  GITHUB_ISSUE,
  ISSUES,
  PACKET_ID,
  POST_A1_AMENDMENT,
  PROTECTED_DEVELOPMENT,
  PROVIDER_HANDOFF,
  PROVIDER_PIN,
  SATISFIED_DEPENDENCIES,
} from "../constants.mjs";
import { aggregateVerdicts, runIss29Matrix } from "../harness.mjs";
import { renderSlotHtml, slotHtmlPath } from "../html-fixtures.mjs";
import { loadInjectedFixture, runIndependentReview, runLifecycleProof } from "../iss29.mjs";
import { emitAdmissionEvidence, emitAllLayoutVerdicts, loadFrozenA1Receipt } from "../iss30.mjs";
import { emitConsumerReceipt } from "../receipt.mjs";
import { DECLARED_AFTER_AMENDMENT } from "../layout-adapters/index.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../../");
const evidence = path.join(repoRoot, "docs/evidence/master-v2/a2-a3");

function writeJson(relative, value) {
  const dest = path.join(evidence, relative);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, `${JSON.stringify(value, null, 2)}\n`);
  return dest;
}

function digestFile(relative) {
  const bytes = fs.readFileSync(path.join(evidence, relative));
  return { path: `docs/evidence/master-v2/a2-a3/${relative}`, sha256: createHash("sha256").update(bytes).digest("hex") };
}

fs.mkdirSync(path.join(evidence, "fixtures/slots"), { recursive: true });
writeJson("fixtures/injected-lifecycle.json", {
  schemaVersion: 1,
  kind: "ls09-injected-lifecycle-fixture",
  packetId: PACKET_ID,
  preparationOnly: true,
  providerBytesPresent: false,
  ls08ProtectedIntegrated: false,
  relativePath: "fixture/site-copy.json",
  bytes: "{\"kind\":\"injected-not-provider\",\"layoutPack\":\"a2\",\"dimension\":\"performance\"}\n",
  note: "Fixture-owned bytes for migration/rollback/tamper/cache-restart tests. Not provider A2/A3.",
});

const matrix = runIss29Matrix();
for (const slot of matrix.slots) {
  const rendered = renderSlotHtml(slot);
  const dest = path.join(evidence, slotHtmlPath(slot));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, rendered.html);
}

const review = await runIndependentReview();
const lifecycle = await runLifecycleProof(loadInjectedFixture(evidence));
review.lifecycle = lifecycle;
const a1Receipt = loadFrozenA1Receipt(repoRoot);
const allLayout = emitAllLayoutVerdicts(matrix, a1Receipt);
const admission = emitAdmissionEvidence();
const verdicts = aggregateVerdicts(matrix, lifecycle);
const receipt = emitConsumerReceipt({
  verdicts,
  allLayoutVerdicts: allLayout.verdicts,
  freezeAcceptedA1: true,
});

writeJson("fixtures/iss-29-matrix.json", matrix);
writeJson("fixtures/iss-29-review.json", review);
writeJson("fixtures/iss-30-receipt.json", receipt);
writeJson("fixtures/iss-30-all-layout-verdicts.json", allLayout);
writeJson("fixtures/iss-30-admission-evidence.json", admission);
writeJson("bindings/provider-pin.json", {
  schemaVersion: 1,
  kind: "ls09-provider-pin-binding",
  bound: true,
  bytesPresent: false,
  ...PROVIDER_PIN,
});
writeJson("bindings/provider-handoff.json", {
  schemaVersion: 1,
  kind: "ls09-provider-handoff-binding",
  bound: true,
  ...PROVIDER_HANDOFF,
});
writeJson("bindings/post-a1-amendment.json", {
  schemaVersion: 1,
  kind: "ls09-post-a1-amendment-binding",
  bound: true,
  ...POST_A1_AMENDMENT,
});
writeJson("bindings/additive-layout-adapter-declaration.json", {
  schemaVersion: 1,
  kind: "ls09-additive-layout-adapter-declaration",
  packetId: PACKET_ID,
  declaredAfter: "post-a1-amendment",
  amendmentCommit: DECLARED_AFTER_AMENDMENT.amendmentCommit,
  amendmentTree: DECLARED_AFTER_AMENDMENT.amendmentTree,
  modules: [...ADDITIVE_ADAPTER_MODULES],
  mutatesAcceptedA1: false,
  mutatesPlanSemantics: false,
});
writeJson("STATUS.json", {
  schemaVersion: 1,
  kind: "ls09-a2-a3-complete-proof-status",
  packetId: PACKET_ID,
  githubIssue: GITHUB_ISSUE,
  issues: [...ISSUES],
  preparationOnly: false,
  packetCompletion: true,
  packetComplete: true,
  pairedProofRun: true,
  consumerProofPresent: true,
  providerBytesPresent: false,
  freezeAcceptedA1: true,
  admitted: false,
  providerSelectable: false,
  productionSelectable: false,
  productionSelectionGated: true,
  providerConformance: false,
  vpsProofClaimed: false,
  liveProofClaimed: false,
  mwtOutputClaimed: false,
  ls08Checkpoint: {
    present: true,
    protectedIntegrated: true,
    repository: PROTECTED_DEVELOPMENT.repository,
    ref: PROTECTED_DEVELOPMENT.ref,
    commit: PROTECTED_DEVELOPMENT.commit,
    tree: PROTECTED_DEVELOPMENT.tree,
  },
  frozenA1: {
    layoutPack: "a1",
    pageRenderer: "composition-a1-linear-shell",
    architectureReady: false,
    overallVerdict: "A1_SEMANTICS_FROZEN",
  },
  providerFinal: {
    bound: true,
    bytesPresent: false,
    commit: PROVIDER_PIN.commit,
    tree: PROVIDER_PIN.tree,
    releaseEntryVersion: PROVIDER_PIN.releaseEntryVersion,
    lifecycle: "draft",
    selectability: "non_selectable",
    artifactTree: PROVIDER_PIN.artifactTree,
    releaseManifestSha256: PROVIDER_PIN.releaseManifestSha256,
    inventorySha256: PROVIDER_PIN.inventorySha256,
    payloadSha256: PROVIDER_PIN.payloadSha256,
    releaseReceiptSha256: PROVIDER_PIN.releaseReceiptSha256,
    a2LayoutSha256: PROVIDER_PIN.a2LayoutSha256,
    a3LayoutSha256: PROVIDER_PIN.a3LayoutSha256,
    conformanceClaimed: false,
    selectableClaimed: false,
    productionSelectable: false,
    vpsProofClaimed: false,
    liveProofClaimed: false,
    mwtOutputClaimed: false,
  },
  postA1Amendment: { bound: true, ...POST_A1_AMENDMENT },
  providerHandoff: { bound: true, ...PROVIDER_HANDOFF },
  notes: [
    "LS-09 ISS-28..30 A2/A3 complete consumer proof on protected development.",
    "A1 semantics remain frozen. Production selection remains gated. Provider bytes were not copied.",
  ],
});
writeJson("SCOPE.json", {
  schemaVersion: 1,
  kind: "ls09-a2-a3-complete-proof-scope",
  packetId: PACKET_ID,
  githubIssue: GITHUB_ISSUE,
  issues: [...ISSUES],
  preparationOnly: false,
  packetComplete: true,
  ownedPaths: [
    "tests/master-template-v2/a2-a3/**",
    "docs/evidence/master-v2/a2-a3/**",
    ...ADDITIVE_ADAPTER_MODULES,
  ],
  prohibitedPaths: [
    "apps/**",
    "packages/**",
    "supabase/migrations/**",
    "tests/master-template-v2/a1/**",
    "docs/evidence/master-v2/a1/**",
    "provider-bytes",
  ],
  independentOf: [],
});
writeJson("DEPENDENCIES.json", {
  schemaVersion: 1,
  kind: "ls09-bound-dependencies",
  packetId: PACKET_ID,
  githubIssue: GITHUB_ISSUE,
  policy: "fail-closed",
  dependencies: SATISFIED_DEPENDENCIES.map((item) => ({
    id: item.id,
    required: item.required,
    satisfied: item.satisfied,
    reason: item.reason,
    identity: item.identity,
  })),
});

const checksums = [
  "STATUS.json",
  "SCOPE.json",
  "DEPENDENCIES.json",
  "fixtures/iss-29-matrix.json",
  "fixtures/iss-29-review.json",
  "fixtures/iss-30-receipt.json",
  "fixtures/iss-30-all-layout-verdicts.json",
  "fixtures/iss-30-admission-evidence.json",
  "fixtures/injected-lifecycle.json",
  "fixtures/http-proof.json",
  "bindings/provider-pin.json",
  "bindings/provider-handoff.json",
  "bindings/post-a1-amendment.json",
  "bindings/additive-layout-adapter-declaration.json",
  ...matrix.slots.map((slot) => slotHtmlPath(slot)),
].map(digestFile);
writeJson("CHECKSUMS.json", { schemaVersion: 1, packetId: PACKET_ID, files: checksums });

process.stdout.write(`wrote LS-09 evidence slots=${matrix.slots.length} receipt=${receipt.overallVerdict}\n`);

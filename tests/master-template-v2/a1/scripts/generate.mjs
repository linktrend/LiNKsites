#!/usr/bin/env node
/**
 * Persist LS-08 ISS-25..27 paired-proof evidence under docs/evidence/master-v2/a1.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { EXT_LS_01_RECEIPT, GITHUB_ISSUE, ISSUES, PACKET_ID, PROTECTED_DEVELOPMENT, PROVIDER_PIN, SATISFIED_DEPENDENCIES } from "../constants.mjs";
import { runIss25Matrix } from "../harness.mjs";
import { renderSlotHtml, slotHtmlPath } from "../html-fixtures.mjs";
import { loadInjectedFixture, runIndependentReview, runLifecycleProof } from "../iss26.mjs";
import { emitConsumerReceipt } from "../receipt.mjs";
import { aggregateVerdicts } from "../harness.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../../");
const evidence = path.join(repoRoot, "docs/evidence/master-v2/a1");

function writeJson(relative, value) {
  const dest = path.join(evidence, relative);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, `${JSON.stringify(value, null, 2)}\n`);
  return dest;
}

function digestFile(relative) {
  const bytes = fs.readFileSync(path.join(evidence, relative));
  return { path: `docs/evidence/master-v2/a1/${relative}`, sha256: createHash("sha256").update(bytes).digest("hex") };
}

const matrix = runIss25Matrix();
for (const slot of matrix.slots) {
  const rendered = renderSlotHtml(slot);
  const dest = path.join(evidence, slotHtmlPath(slot));
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, rendered.html);
}

const review = await runIndependentReview();
const lifecycle = await runLifecycleProof(loadInjectedFixture(evidence));
review.lifecycle = lifecycle;
const verdicts = aggregateVerdicts(matrix, lifecycle);
const receipt = emitConsumerReceipt({ verdicts, freezeAcceptedA1: true });

writeJson("fixtures/iss-25-matrix.json", matrix);
writeJson("fixtures/iss-26-review.json", review);
writeJson("fixtures/iss-27-receipt.json", receipt);
writeJson("bindings/provider-pin.json", {
  schemaVersion: 1,
  kind: "ls08-provider-pin-binding",
  bound: true,
  bytesPresent: false,
  ...PROVIDER_PIN,
});
writeJson("bindings/ext-ls-01-receipt.json", {
  schemaVersion: 1,
  kind: "ls08-ext-ls-01-receipt-binding",
  bound: true,
  ...EXT_LS_01_RECEIPT,
});
writeJson("STATUS.json", {
  schemaVersion: 1,
  kind: "ls08-a1-paired-proof-status",
  packetId: PACKET_ID,
  githubIssue: GITHUB_ISSUE,
  issues: [...ISSUES],
  preparationOnly: false,
  packetCompletion: true,
  packetComplete: true,
  pairedProofRun: true,
  consumerProofPresent: true,
  a1BytesPresent: false,
  freezeAcceptedA1: true,
  providerSelectable: false,
  providerConformance: false,
  mwt08Claimed: false,
  ls07Checkpoint: {
    present: true,
    protectedIntegrated: true,
    repository: PROTECTED_DEVELOPMENT.repository,
    ref: PROTECTED_DEVELOPMENT.ref,
    commit: PROTECTED_DEVELOPMENT.commit,
    tree: PROTECTED_DEVELOPMENT.tree,
  },
  providerA1: {
    bound: true,
    bytesPresent: false,
    commit: PROVIDER_PIN.commit,
    tree: PROVIDER_PIN.tree,
    releaseEntryVersion: PROVIDER_PIN.releaseEntryVersion,
    lifecycle: "draft",
    selectability: "non_selectable",
    conformanceClaimed: false,
    selectableClaimed: false,
    mwt08Claimed: false,
  },
  extLs01Receipt: {
    bound: true,
    ...EXT_LS_01_RECEIPT,
  },
  notes: [
    "LS-08 ISS-25..27 paired consumer proof on protected development.",
    "Provider remains draft/non-selectable. Provider bytes were not copied.",
  ],
});
writeJson("SCOPE.json", {
  schemaVersion: 1,
  kind: "ls08-a1-paired-proof-scope",
  packetId: PACKET_ID,
  githubIssue: GITHUB_ISSUE,
  issues: [...ISSUES],
  preparationOnly: false,
  packetComplete: true,
  ownedPaths: ["tests/master-template-v2/a1/**", "docs/evidence/master-v2/a1/**"],
  prohibitedPaths: ["apps/**", "packages/**", "supabase/migrations/**", "provider-bytes"],
  independentOf: [],
});
writeJson("DEPENDENCIES.json", {
  schemaVersion: 1,
  kind: "ls08-a1-bound-dependencies",
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
  "fixtures/iss-25-matrix.json",
  "fixtures/iss-26-review.json",
  "fixtures/iss-27-receipt.json",
  "fixtures/injected-lifecycle.json",
  "bindings/provider-pin.json",
  "bindings/ext-ls-01-receipt.json",
  ...matrix.slots.map((slot) => slotHtmlPath(slot)),
].map(digestFile);
writeJson("CHECKSUMS.json", { schemaVersion: 1, packetId: PACKET_ID, files: checksums });

process.stdout.write(`wrote LS-08 evidence slots=${matrix.slots.length} receipt=${receipt.overallVerdict}\n`);

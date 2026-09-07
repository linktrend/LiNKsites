import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  TemplateAdmissionError,
  assertProductionReceiptIdentityBindings,
  assertProductionTemplateReleaseReady,
} from "../src/lib/template-admission.ts";

const sourceCommitSha = "1".repeat(40);
const sourceTreeSha = "2".repeat(40);
const providerCommitSha = "3".repeat(40);
const providerTreeSha = "4".repeat(40);
const artifactTreeSha1 = "5".repeat(40);
const dependencyLockSha256 = "6".repeat(64);
const reference = {
  entryId: "master-template-type-1",
  version: "2.0.0",
  sourceCommitSha,
  sourceTreeSha,
  releaseSourceCommitSha: sourceCommitSha,
  releaseSourceTreeSha: sourceTreeSha,
  artifactTreeSha1,
  releaseManifestSha256: "7".repeat(64),
  dependencyLockSha256,
};
const configuration = {
  entryId: reference.entryId,
  version: reference.version,
  providerCommitSha,
  providerTreeSha,
  sourceCommitSha,
  sourceTreeSha,
  artifactTreeSha1,
  dependencyLockSha256,
};
const receipt = {
  schemaVersion: 2,
  schemaRevision: 2,
  receiptType: "consumption",
  entryId: reference.entryId,
  version: reference.version,
  releaseManifestSha256: reference.releaseManifestSha256,
  releaseSourceCommitSha: sourceCommitSha,
  releaseSourceRepositoryTreeSha1: sourceTreeSha,
  artifactTreeSha1,
};

test("production readiness rejects mounted receipt bytes that differ from supplied evidence", async () => {
  const directory = await mkdtemp(join(tmpdir(), "linksites-ready-receipt-"));
  const receiptPath = join(directory, "receipt.json");
  const names = [
    "LINKSITES_DEPLOYMENT_ENV",
    "LINKSITES_TEMPLATE_RELEASE_STATE",
    "LINKSITES_TEMPLATE_FORMAT",
    "LINKSITES_TEMPLATE_ID",
    "LINKSITES_TEMPLATE_VERSION",
    "LINKSITES_LINKLIBRARIES_RECEIPT_PATH",
    "LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON",
  ];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    const supplied = JSON.stringify(receipt);
    await writeFile(receiptPath, `${supplied}\n`);
    process.env.LINKSITES_DEPLOYMENT_ENV = "production";
    process.env.LINKSITES_TEMPLATE_RELEASE_STATE = "ready";
    process.env.LINKSITES_TEMPLATE_FORMAT = "revision2";
    process.env.LINKSITES_TEMPLATE_ID = reference.entryId;
    process.env.LINKSITES_TEMPLATE_VERSION = reference.version;
    process.env.LINKSITES_LINKLIBRARIES_RECEIPT_PATH = receiptPath;
    process.env.LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON = supplied;

    assert.throws(
      () => assertProductionTemplateReleaseReady(reference.entryId),
      (error: unknown) => error instanceof TemplateAdmissionError && /bytes\/digest/.test(error.message),
    );
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
    await rm(directory, { recursive: true, force: true });
  }
});

test("deferred production release remains blocked without inspecting provider receipt evidence", () => {
  const names = ["LINKSITES_DEPLOYMENT_ENV", "LINKSITES_TEMPLATE_RELEASE_STATE", "LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON"];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  try {
    process.env.LINKSITES_DEPLOYMENT_ENV = "production";
    process.env.LINKSITES_TEMPLATE_RELEASE_STATE = "deferred";
    process.env.LINKSITES_TEMPLATE_RELEASE_RECEIPT_JSON = "not-json";
    assert.throws(
      () => assertProductionTemplateReleaseReady(reference.entryId),
      (error: unknown) => error instanceof TemplateAdmissionError && /deferred/.test(error.message),
    );
  } finally {
    for (const [name, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
});

test("production readiness identity binding accepts a complete native receipt", () => {
  assert.doesNotThrow(() => assertProductionReceiptIdentityBindings(receipt, reference, configuration));
});

for (const [label, mutate, expectedMessage] of [
  ["entry", (value: typeof receipt) => ({ ...value, entryId: "other-template" }), "entryId"],
  ["version", (value: typeof receipt) => ({ ...value, version: "2.0.1" }), "version"],
  ["provider commit", (value: typeof receipt) => value, "provider commit"],
  ["provider tree", (value: typeof receipt) => value, "provider tree"],
  ["source-release commit", (value: typeof receipt) => ({ ...value, releaseSourceCommitSha: "8".repeat(40) }), "source-release commit"],
  ["source-release tree", (value: typeof receipt) => ({ ...value, releaseSourceRepositoryTreeSha1: "9".repeat(40) }), "source-release tree"],
  ["artifact tree", (value: typeof receipt) => ({ ...value, artifactTreeSha1: "a".repeat(40) }), "artifact tree"],
  ["dependency-lock", (value: typeof receipt) => value, "dependency-lock"],
] as const) {
  test(`production readiness rejects ${label} identity mismatch`, () => {
    const changedConfiguration = { ...configuration };
    const changedReceipt = mutate(receipt) as typeof receipt;
    let providerIdentity = { commitSha: providerCommitSha, treeSha: providerTreeSha };
    if (label === "provider commit") providerIdentity = { ...providerIdentity, commitSha: "b".repeat(40) };
    if (label === "provider tree") providerIdentity = { ...providerIdentity, treeSha: "c".repeat(40) };
    if (label === "dependency-lock") changedConfiguration.dependencyLockSha256 = "d".repeat(64);
    assert.throws(
      () => assertProductionReceiptIdentityBindings(changedReceipt, reference, changedConfiguration, providerIdentity),
      new RegExp(expectedMessage),
    );
  });
}

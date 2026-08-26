import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { CHECK_IDS, EXT_LS_01_RECEIPT, PROVIDER_PIN, PROTECTED_DEVELOPMENT, requiredMatrixSlots } from "./constants.mjs";
import { evaluatePairedProof, evaluateIss25Matrix, runIss25Matrix } from "./harness.mjs";
import { ClosedFailure } from "./identities.mjs";
import { emitConsumerReceipt } from "./receipt.mjs";
import { renderSlotHtml } from "./html-fixtures.mjs";
import { evaluateSlot } from "./slot-proof.mjs";
import { server as fixtureServer } from "./scripts/serve-fixtures.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const evidenceDir = join(repoRoot, "docs/evidence/master-v2/a1");
const validateCli = join(here, "scripts/validate.mjs");
const runCli = join(here, "scripts/run.mjs");
const gitCommonDir = execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: repoRoot, encoding: "utf8" }).trim();

function failedIds(report) {
  return report.checks.filter((item) => item.status === "FAIL").map((item) => item.id);
}

test("owned evidence directory PASSes as paired consumer proof", async () => {
  const report = await evaluatePairedProof(evidenceDir, { repoRoot, gitCommonDir });
  assert.deepEqual(failedIds(report), []);
  assert.equal(report.status, "PASS");
  assert.equal(report.ok, true);
  assert.equal(report.packetComplete, true);
  assert.equal(report.receipt.overallVerdict, "A1_SEMANTICS_FROZEN");
  assert.equal(report.receipt.freezeAcceptedA1, true);
  assert.equal(report.receipt.providerSelectable, false);
  assert.equal(report.receipt.mwt08Claimed, false);
  assert.equal(report.receipt.providerBytesPresent, false);
});

test("ISS-25 matrix enumerates 64 run A1 slots", () => {
  const matrix = JSON.parse(readFileSync(join(evidenceDir, "fixtures/iss-25-matrix.json"), "utf8"));
  assert.equal(matrix.slots.length, requiredMatrixSlots().length);
  assert.equal(matrix.slots.length, 64);
  const result = evaluateIss25Matrix(matrix);
  assert.equal(result.status, "PASS");
  assert.ok(matrix.slots.every((slot) => slot.status === "PASS" && slot.pairedProofRun === true));
});

test("CLI validate and run report PROOF_OK with frozen A1 semantics", async () => {
  const validate = execFileSync(process.execPath, [validateCli, "--evidence", evidenceDir], { encoding: "utf8" });
  assert.match(validate, /PROOF_OK/);
  assert.match(validate, /packetCompletion=true/);
  assert.match(validate, /A1_SEMANTICS_FROZEN/);

  const run = execFileSync(process.execPath, [runCli, "--evidence", evidenceDir], { encoding: "utf8" });
  const report = JSON.parse(run);
  assert.equal(report.status, "PASS");
  assert.equal(report.receipt.overallVerdict, "A1_SEMANTICS_FROZEN");
});

test("receipt CLI emits frozen semantics without selectability", () => {
  const stdout = execFileSync(process.execPath, [runCli, "--emit-receipt"], { encoding: "utf8" });
  const receipt = JSON.parse(stdout);
  assert.equal(receipt.overallVerdict, "A1_SEMANTICS_FROZEN");
  assert.equal(receipt.emitted, true);
  assert.equal(receipt.packetCompletion, true);
  assert.equal(receipt.providerSelectable, false);
  assert.equal(receipt.bindings.extLs01Receipt.sha256, EXT_LS_01_RECEIPT.sha256);
  assert.equal(receipt.bindings.providerPin.commit, PROVIDER_PIN.commit);
});

test("emitConsumerReceipt refuses selectability and MWT-08", () => {
  const verdicts = Object.fromEntries(
    [
      "candidate_materialized",
      "adapter_compatible",
      "payload_projection_valid",
      "server_render_valid",
      "browser_fixture_valid",
      "migration_rollback_valid",
      "tamper_rejected",
      "cache_restart_valid",
    ].map((key) => [key, "PASS"]),
  );
  assert.throws(
    () => emitConsumerReceipt({ verdicts, freezeAcceptedA1: true, selectable: true }),
    (error) => error instanceof ClosedFailure && error.code === "forbidden_claim",
  );
  assert.throws(
    () => emitConsumerReceipt({ verdicts, freezeAcceptedA1: true, mwt08: true }),
    (error) => error instanceof ClosedFailure && error.code === "forbidden_claim",
  );
});

test("wrong LS-07 checkpoint fails closed", async () => {
  const temp = mkdtempSync(join(tmpdir(), "ls08-iss-ls07-"));
  try {
    cpSync(evidenceDir, temp, { recursive: true });
    const statusPath = join(temp, "STATUS.json");
    const status = JSON.parse(readFileSync(statusPath, "utf8"));
    status.ls07Checkpoint.commit = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    writeFileSync(statusPath, JSON.stringify(status));
    const report = await evaluatePairedProof(temp, { repoRoot, gitCommonDir });
    assert.equal(report.status, "FAIL");
    assert.ok(failedIds(report).includes(CHECK_IDS.LS07_BOUND));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("provider bytes fabrication fails closed", async () => {
  const temp = mkdtempSync(join(tmpdir(), "ls08-iss-bytes-"));
  try {
    cpSync(evidenceDir, temp, { recursive: true });
    const statusPath = join(temp, "STATUS.json");
    const status = JSON.parse(readFileSync(statusPath, "utf8"));
    status.providerA1 = { ...status.providerA1, bytesPresent: true, providerBytes: "nope" };
    writeFileSync(statusPath, JSON.stringify(status));
    const report = await evaluatePairedProof(temp, { repoRoot, gitCommonDir });
    assert.equal(report.status, "FAIL");
    assert.ok(failedIds(report).includes(CHECK_IDS.NO_PROVIDER_BYTES));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("wrong EXT-LS-01 digest fails closed", async () => {
  const temp = mkdtempSync(join(tmpdir(), "ls08-iss-receipt-"));
  try {
    cpSync(evidenceDir, temp, { recursive: true });
    const bindingPath = join(temp, "bindings/ext-ls-01-receipt.json");
    const binding = JSON.parse(readFileSync(bindingPath, "utf8"));
    binding.sha256 = "0".repeat(64);
    writeFileSync(bindingPath, JSON.stringify(binding));
    const report = await evaluatePairedProof(temp, { repoRoot, gitCommonDir });
    assert.equal(report.status, "FAIL");
    assert.ok(failedIds(report).includes(CHECK_IDS.EXT_LS01_BOUND));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("missing ISS-25 slot fails closed", async () => {
  const temp = mkdtempSync(join(tmpdir(), "ls08-iss-slot-"));
  try {
    cpSync(evidenceDir, temp, { recursive: true });
    const matrixPath = join(temp, "fixtures/iss-25-matrix.json");
    const matrix = JSON.parse(readFileSync(matrixPath, "utf8"));
    matrix.slots = matrix.slots.filter(
      (slot) => !(slot.surface === "browser" && slot.planId === "l" && slot.scenario === "lifecycle"),
    );
    writeFileSync(matrixPath, JSON.stringify(matrix));
    const report = await evaluatePairedProof(temp, { repoRoot, gitCommonDir });
    assert.equal(report.status, "FAIL");
    assert.ok(failedIds(report).includes(CHECK_IDS.MATRIX_COMPLETE));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("Type L product browser fixture isolates shell", () => {
  const slot = evaluateSlot({ surface: "browser", planId: "l", scenario: "product" });
  const html = renderSlotHtml(slot).html;
  assert.equal(slot.status, "PASS");
  assert.match(html, /data-global-navigation="false"/);
  assert.doesNotMatch(html, /data-action="primary-cta"/);
});

test("failure fixture rejects fake success", () => {
  const slot = evaluateSlot({ surface: "server", planId: "a", scenario: "failure" });
  assert.equal(slot.status, "PASS");
  assert.match(renderSlotHtml(slot).html, /data-fake-success="false"/);
});

test("HTTP fixture server serves A1 HTML without provider bytes", async () => {
  await new Promise((resolvePromise) => fixtureServer.listen(0, "127.0.0.1", resolvePromise));
  try {
    const address = fixtureServer.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const html = await new Promise((resolvePromise, reject) => {
      http.get(`http://127.0.0.1:${port}/slots/server-a-product.html`, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolvePromise(Buffer.concat(chunks).toString("utf8")));
      }).on("error", reject);
    });
    assert.match(html, /data-layout-pack="a1"/);
    assert.match(html, /data-provider-bytes="false"/);
    assert.match(html, /Industrial fasteners/);
  } finally {
    await new Promise((resolvePromise) => fixtureServer.close(resolvePromise));
  }
});

test("bindings pin protected development and MWT-07 identities", () => {
  const status = JSON.parse(readFileSync(join(evidenceDir, "STATUS.json"), "utf8"));
  assert.equal(status.ls07Checkpoint.commit, PROTECTED_DEVELOPMENT.commit);
  assert.equal(status.ls07Checkpoint.tree, PROTECTED_DEVELOPMENT.tree);
  assert.equal(status.providerA1.commit, PROVIDER_PIN.commit);
  assert.equal(status.providerA1.tree, PROVIDER_PIN.tree);
  assert.equal(status.providerA1.selectability, "non_selectable");
  const receiptBind = JSON.parse(readFileSync(join(evidenceDir, "bindings/ext-ls-01-receipt.json"), "utf8"));
  assert.equal(receiptBind.sha256, EXT_LS_01_RECEIPT.sha256);
  assert.equal(receiptBind.consumerCommit, EXT_LS_01_RECEIPT.consumerCommit);
});

test("syntax of harness scripts is valid", () => {
  for (const file of [
    "harness.mjs",
    "receipt.mjs",
    "lifecycle.mjs",
    "identities.mjs",
    "slot-proof.mjs",
    "html-fixtures.mjs",
    "iss26.mjs",
    "scripts/run.mjs",
    "scripts/validate.mjs",
    "scripts/generate.mjs",
    "scripts/serve-fixtures.mjs",
  ]) {
    execFileSync(process.execPath, ["--check", join(here, file)]);
  }
});

void runIss25Matrix;

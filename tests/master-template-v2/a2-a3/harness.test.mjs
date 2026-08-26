import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import http from "node:http";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  CHECK_IDS,
  POST_A1_AMENDMENT,
  PROVIDER_HANDOFF,
  PROVIDER_PIN,
  PROTECTED_DEVELOPMENT,
  requiredMatrixSlots,
} from "./constants.mjs";
import { evaluatePairedProof, evaluateIss29Matrix, runIss29Matrix } from "./harness.mjs";
import { ClosedFailure } from "./identities.mjs";
import { emitConsumerReceipt } from "./receipt.mjs";
import { renderSlotHtml } from "./html-fixtures.mjs";
import { evaluateSlot } from "./slot-proof.mjs";
import { resolveLayoutAdapter } from "./layout-adapters/index.mjs";
import { server as fixtureServer } from "./scripts/serve-fixtures.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const evidenceDir = join(repoRoot, "docs/evidence/master-v2/a2-a3");
const validateCli = join(here, "scripts/validate.mjs");
const runCli = join(here, "scripts/run.mjs");

function failedIds(report) {
  return report.checks.filter((item) => item.status === "FAIL").map((item) => item.id);
}

test("owned evidence directory PASSes as complete consumer proof", async () => {
  const report = await evaluatePairedProof(evidenceDir, { repoRoot });
  assert.deepEqual(failedIds(report), []);
  assert.equal(report.status, "PASS");
  assert.equal(report.ok, true);
  assert.equal(report.packetComplete, true);
  assert.equal(report.receipt.overallVerdict, "ALL_LAYOUT_ADAPTER_BROWSER_VERDICTS");
  assert.equal(report.receipt.freezeAcceptedA1, true);
  assert.equal(report.receipt.productionSelectionGated, true);
  assert.equal(report.receipt.productionSelectable, false);
  assert.equal(report.receipt.admitted, false);
  assert.equal(report.receipt.providerBytesPresent, false);
});

test("ISS-29 matrix enumerates 80 run A2/A3 slots", () => {
  const matrix = JSON.parse(readFileSync(join(evidenceDir, "fixtures/iss-29-matrix.json"), "utf8"));
  assert.equal(matrix.slots.length, requiredMatrixSlots().length);
  assert.equal(matrix.slots.length, 80);
  const result = evaluateIss29Matrix(matrix);
  assert.equal(result.status, "PASS");
  assert.ok(matrix.slots.every((slot) => slot.status === "PASS" && slot.pairedProofRun === true));
});

test("ISS-28 additive mappings leave frozen A1 intact", () => {
  const a1 = resolveLayoutAdapter("a1");
  const a2 = resolveLayoutAdapter("a2");
  const a3 = resolveLayoutAdapter("a3");
  assert.equal(a1.pageRenderer, "composition-a1-linear-shell");
  assert.equal(a1.frozen, true);
  assert.equal(a2.pageRenderer, "composition-a2-split-shell");
  assert.equal(a2.providerLayoutSha256, PROVIDER_PIN.a2LayoutSha256);
  assert.equal(a3.pageRenderer, "composition-a3-stacked-shell");
  assert.equal(a3.providerLayoutSha256, PROVIDER_PIN.a3LayoutSha256);
  assert.equal(a2.mutatesAcceptedA1, false);
  assert.equal(a3.mutatesPlanSemantics, false);
});

test("CLI validate and run report PROOF_OK with gated selection", async () => {
  const validate = execFileSync(process.execPath, [validateCli, "--evidence", evidenceDir], { encoding: "utf8" });
  assert.match(validate, /PROOF_OK/);
  assert.match(validate, /packetCompletion=true/);
  assert.match(validate, /ALL_LAYOUT_ADAPTER_BROWSER_VERDICTS/);

  const run = execFileSync(process.execPath, [runCli, "--evidence", evidenceDir], { encoding: "utf8" });
  const report = JSON.parse(run);
  assert.equal(report.status, "PASS");
  assert.equal(report.receipt.productionSelectionGated, true);
});

test("receipt CLI emits all-layout verdicts without selectability", () => {
  const stdout = execFileSync(process.execPath, [runCli, "--emit-receipt"], { encoding: "utf8" });
  const receipt = JSON.parse(stdout);
  assert.equal(receipt.overallVerdict, "ALL_LAYOUT_ADAPTER_BROWSER_VERDICTS");
  assert.equal(receipt.emitted, true);
  assert.equal(receipt.admitted, false);
  assert.equal(receipt.bindings.providerHandoff.sha256, PROVIDER_HANDOFF.sha256);
  assert.equal(receipt.bindings.providerPin.commit, PROVIDER_PIN.commit);
  assert.equal(receipt.bindings.postA1Amendment.commit, POST_A1_AMENDMENT.commit);
});

test("emitConsumerReceipt refuses selectability and live proof", () => {
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
  const allLayoutVerdicts = Object.fromEntries(
    [
      "a1_adapter_compatible",
      "a2_adapter_compatible",
      "a3_adapter_compatible",
      "a1_browser_fixture_valid",
      "a2_browser_fixture_valid",
      "a3_browser_fixture_valid",
    ].map((key) => [key, "PASS"]),
  );
  assert.throws(
    () => emitConsumerReceipt({ verdicts, allLayoutVerdicts, freezeAcceptedA1: true, selectable: true }),
    (error) => error instanceof ClosedFailure && error.code === "forbidden_claim",
  );
  assert.throws(
    () => emitConsumerReceipt({ verdicts, allLayoutVerdicts, freezeAcceptedA1: true, liveProof: true }),
    (error) => error instanceof ClosedFailure && error.code === "forbidden_claim",
  );
});

test("wrong LS-08 checkpoint fails closed", async () => {
  const temp = mkdtempSync(join(tmpdir(), "ls09-iss-ls08-"));
  try {
    cpSync(evidenceDir, temp, { recursive: true });
    const statusPath = join(temp, "STATUS.json");
    const status = JSON.parse(readFileSync(statusPath, "utf8"));
    status.ls08Checkpoint.commit = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    writeFileSync(statusPath, JSON.stringify(status));
    const report = await evaluatePairedProof(temp, { repoRoot });
    assert.equal(report.status, "FAIL");
    assert.ok(failedIds(report).includes(CHECK_IDS.LS08_BOUND));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("provider bytes fabrication fails closed", async () => {
  const temp = mkdtempSync(join(tmpdir(), "ls09-iss-bytes-"));
  try {
    cpSync(evidenceDir, temp, { recursive: true });
    const statusPath = join(temp, "STATUS.json");
    const status = JSON.parse(readFileSync(statusPath, "utf8"));
    status.providerFinal = { ...status.providerFinal, bytesPresent: true, providerBytes: "nope" };
    writeFileSync(statusPath, JSON.stringify(status));
    const report = await evaluatePairedProof(temp, { repoRoot });
    assert.equal(report.status, "FAIL");
    assert.ok(failedIds(report).includes(CHECK_IDS.NO_PROVIDER_BYTES));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("wrong handoff digest fails closed", async () => {
  const temp = mkdtempSync(join(tmpdir(), "ls09-iss-handoff-"));
  try {
    cpSync(evidenceDir, temp, { recursive: true });
    const bindingPath = join(temp, "bindings/provider-handoff.json");
    const binding = JSON.parse(readFileSync(bindingPath, "utf8"));
    binding.sha256 = "0".repeat(64);
    writeFileSync(bindingPath, JSON.stringify(binding));
    const report = await evaluatePairedProof(temp, { repoRoot });
    assert.equal(report.status, "FAIL");
    assert.ok(failedIds(report).includes(CHECK_IDS.HANDOFF_BOUND));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("missing ISS-29 slot fails closed", async () => {
  const temp = mkdtempSync(join(tmpdir(), "ls09-iss-slot-"));
  try {
    cpSync(evidenceDir, temp, { recursive: true });
    const matrixPath = join(temp, "fixtures/iss-29-matrix.json");
    const matrix = JSON.parse(readFileSync(matrixPath, "utf8"));
    matrix.slots = matrix.slots.filter(
      (slot) => !(slot.surface === "browser" && slot.layoutPack === "a3" && slot.planId === "l" && slot.dimension === "performance"),
    );
    writeFileSync(matrixPath, JSON.stringify(matrix));
    const report = await evaluatePairedProof(temp, { repoRoot });
    assert.equal(report.status, "FAIL");
    assert.ok(failedIds(report).includes(CHECK_IDS.MATRIX_COMPLETE));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("Type L A2 semantic browser fixture isolates shell", () => {
  const slot = evaluateSlot({ layoutPack: "a2", surface: "browser", planId: "l", dimension: "semantic" });
  const html = renderSlotHtml(slot).html;
  assert.equal(slot.status, "PASS");
  assert.match(html, /data-global-navigation="false"/);
  assert.doesNotMatch(html, /data-action="primary-cta"/);
  assert.match(html, /data-region="aside"/);
});

test("A3 visual fixture uses stacked secondary region", () => {
  const slot = evaluateSlot({ layoutPack: "a3", surface: "server", planId: "c", dimension: "visual" });
  assert.equal(slot.status, "PASS");
  assert.match(renderSlotHtml(slot).html, /data-region="secondary"/);
  assert.match(renderSlotHtml(slot).html, /composition-a3-stacked-shell/);
});

test("HTTP fixture server serves A2 HTML without provider bytes", async () => {
  await new Promise((resolvePromise) => fixtureServer.listen(0, "127.0.0.1", resolvePromise));
  try {
    const address = fixtureServer.address();
    const port = typeof address === "object" && address ? address.port : 0;
    const html = await new Promise((resolvePromise, reject) => {
      http.get(`http://127.0.0.1:${port}/slots/server-a2-a-semantic.html`, (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolvePromise(Buffer.concat(chunks).toString("utf8")));
      }).on("error", reject);
    });
    assert.match(html, /data-layout-pack="a2"/);
    assert.match(html, /data-provider-bytes="false"/);
    assert.match(html, /Semantic IDs remain distinct/);
  } finally {
    await new Promise((resolvePromise) => fixtureServer.close(resolvePromise));
  }
});

test("bindings pin protected development and 2.0.0 identities", () => {
  const status = JSON.parse(readFileSync(join(evidenceDir, "STATUS.json"), "utf8"));
  assert.equal(status.ls08Checkpoint.commit, PROTECTED_DEVELOPMENT.commit);
  assert.equal(status.ls08Checkpoint.tree, PROTECTED_DEVELOPMENT.tree);
  assert.equal(status.providerFinal.commit, PROVIDER_PIN.commit);
  assert.equal(status.providerFinal.tree, PROVIDER_PIN.tree);
  assert.equal(status.providerFinal.selectability, "non_selectable");
  assert.equal(status.productionSelectionGated, true);
  const handoff = JSON.parse(readFileSync(join(evidenceDir, "bindings/provider-handoff.json"), "utf8"));
  assert.equal(handoff.sha256, PROVIDER_HANDOFF.sha256);
});

test("syntax of harness scripts is valid", () => {
  for (const file of [
    "harness.mjs",
    "receipt.mjs",
    "lifecycle.mjs",
    "identities.mjs",
    "slot-proof.mjs",
    "html-fixtures.mjs",
    "iss29.mjs",
    "iss30.mjs",
    "layout-adapters/index.mjs",
    "layout-adapters/a1-frozen.mjs",
    "layout-adapters/a2-additive.mjs",
    "layout-adapters/a3-additive.mjs",
    "scripts/run.mjs",
    "scripts/validate.mjs",
    "scripts/generate.mjs",
    "scripts/serve-fixtures.mjs",
  ]) {
    execFileSync(process.execPath, ["--check", join(here, file)]);
  }
});

void runIss29Matrix;

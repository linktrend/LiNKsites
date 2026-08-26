import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import { CHECK_IDS, requiredMatrixSlots } from "./constants.mjs";
import { evaluatePreparation, evaluateIss25Matrix } from "./harness.mjs";
import { ClosedFailure } from "./identities.mjs";
import {
  applyInjectedMigration,
  restartFromInjectedCache,
  rollbackInjectedMigration,
  sha256Hex,
  tamperInjectedCache,
  TAMPER_REJECTED,
  ROLLBACK_UNAVAILABLE,
} from "./lifecycle.mjs";
import { emitConsumerReceipt } from "./receipt.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const evidenceDir = join(repoRoot, "docs/evidence/master-v2/a1");
const validateCli = join(here, "scripts/validate.mjs");
const runCli = join(here, "scripts/run.mjs");

function failedIds(report) {
  return report.checks.filter((item) => item.status === "FAIL").map((item) => item.id);
}

test("owned evidence directory PASSes as preparation only", () => {
  const report = evaluatePreparation(evidenceDir);
  assert.deepEqual(failedIds(report), []);
  assert.equal(report.status, "PASS");
  assert.equal(report.ok, true);
  assert.equal(report.preparationOnly, true);
  assert.equal(report.packetComplete, false);
  assert.equal(report.receipt.overallVerdict, "NOT_EMITTED");
  assert.equal(report.receipt.emitted, false);
  assert.equal(report.receipt.freezeAcceptedA1, false);
});

test("ISS-25 matrix enumerates 64 unbound A1 slots", () => {
  const matrix = JSON.parse(readFileSync(join(evidenceDir, "fixtures/iss-25-matrix.json"), "utf8"));
  assert.equal(matrix.slots.length, requiredMatrixSlots().length);
  assert.equal(matrix.slots.length, 64);
  const result = evaluateIss25Matrix(matrix);
  assert.equal(result.status, "PASS");
  assert.ok(matrix.slots.every((slot) => slot.status === "NOT_RUN" && slot.pairedProofRun === false));
});

test("CLI validate and run report PREPARATION_OK without acceptance", () => {
  const validate = execFileSync(process.execPath, [validateCli, "--evidence", evidenceDir], { encoding: "utf8" });
  assert.match(validate, /PREPARATION_OK/);
  assert.match(validate, /packetCompletion=false/);
  assert.match(validate, /NOT_EMITTED/);

  const run = execFileSync(process.execPath, [runCli, "--evidence", evidenceDir], { encoding: "utf8" });
  const report = JSON.parse(run);
  assert.equal(report.status, "PASS");
  assert.equal(report.receipt.overallVerdict, "NOT_EMITTED");
});

test("hold-receipt CLI does not emit ACCEPT", () => {
  const stdout = execFileSync(process.execPath, [runCli, "--emit-hold-receipt"], { encoding: "utf8" });
  const receipt = JSON.parse(stdout);
  assert.equal(receipt.overallVerdict, "NOT_EMITTED");
  assert.equal(receipt.emitted, false);
  assert.equal(receipt.packetCompletion, false);
});

test("emitConsumerReceipt refuses accept and freeze requests", () => {
  assert.throws(
    () => emitConsumerReceipt({ accept: true }),
    (error) => error instanceof ClosedFailure && error.code === "forbidden_accepted_receipt",
  );
  assert.throws(
    () => emitConsumerReceipt({ freezeAcceptedA1: true }),
    (error) => error instanceof ClosedFailure && error.code === "forbidden_accepted_receipt",
  );
  assert.throws(
    () => emitConsumerReceipt({ packetCompletion: true }),
    (error) => error instanceof ClosedFailure && error.code === "forbidden_completion_claim",
  );
});

test("invented LS-07 protected checkpoint fails closed", () => {
  const temp = mkdtempSync(join(tmpdir(), "ls08-iss-ls07-"));
  try {
    cpSync(evidenceDir, temp, { recursive: true });
    const statusPath = join(temp, "STATUS.json");
    const status = JSON.parse(readFileSync(statusPath, "utf8"));
    status.ls07Checkpoint = {
      present: true,
      protectedIntegrated: true,
      commit: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
      tree: "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
    };
    writeFileSync(statusPath, JSON.stringify(status));
    const report = evaluatePreparation(temp);
    assert.equal(report.status, "FAIL");
    assert.ok(failedIds(report).includes(CHECK_IDS.NO_LS07_INVENTION));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("provider bytes fabrication fails closed", () => {
  const temp = mkdtempSync(join(tmpdir(), "ls08-iss-bytes-"));
  try {
    cpSync(evidenceDir, temp, { recursive: true });
    const statusPath = join(temp, "STATUS.json");
    const status = JSON.parse(readFileSync(statusPath, "utf8"));
    status.providerA1 = { bound: true, bytesPresent: true, providerBytes: "nope" };
    writeFileSync(statusPath, JSON.stringify(status));
    const report = evaluatePreparation(temp);
    assert.equal(report.status, "FAIL");
    assert.ok(failedIds(report).includes(CHECK_IDS.NO_PROVIDER_BYTES));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("missing ISS-25 slot fails closed", () => {
  const temp = mkdtempSync(join(tmpdir(), "ls08-iss-slot-"));
  try {
    cpSync(evidenceDir, temp, { recursive: true });
    const matrixPath = join(temp, "fixtures/iss-25-matrix.json");
    const matrix = JSON.parse(readFileSync(matrixPath, "utf8"));
    matrix.slots = matrix.slots.filter(
      (slot) => !(slot.surface === "browser" && slot.planId === "l" && slot.scenario === "lifecycle"),
    );
    writeFileSync(matrixPath, JSON.stringify(matrix));
    const report = evaluatePreparation(temp);
    assert.equal(report.status, "FAIL");
    assert.ok(failedIds(report).includes(CHECK_IDS.MATRIX_COMPLETE));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("ISS-27 fixture that claims ACCEPT fails closed", () => {
  const temp = mkdtempSync(join(tmpdir(), "ls08-iss-accept-"));
  try {
    cpSync(evidenceDir, temp, { recursive: true });
    const receiptPath = join(temp, "fixtures/iss-27-receipt-hold.json");
    const receipt = JSON.parse(readFileSync(receiptPath, "utf8"));
    receipt.overallVerdict = "ACCEPT";
    receipt.emitted = true;
    receipt.packetCompletion = true;
    writeFileSync(receiptPath, JSON.stringify(receipt));
    const report = evaluatePreparation(temp);
    assert.equal(report.status, "FAIL");
    assert.ok(failedIds(report).includes(CHECK_IDS.RECEIPT_HOLD));
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("injected migration, cache restart, tamper reject, and rollback run without A1/LS-07", async () => {
  const cacheRoot = mkdtempSync(join(tmpdir(), "ls08-life-"));
  try {
    const fixture = JSON.parse(readFileSync(join(evidenceDir, "fixtures/injected-lifecycle.json"), "utf8"));
    const first = await applyInjectedMigration({
      cacheRoot,
      relativePath: fixture.relativePath,
      bytes: fixture.bytes,
      expectedSha256: sha256Hex(fixture.bytes),
    });
    assert.equal(first.preparationOnly, true);
    assert.equal(first.providerA1Bound, false);
    assert.equal(first.ls07ProtectedIntegrated, false);

    const restarted = await restartFromInjectedCache({ cacheRoot });
    assert.equal(restarted.mode, "offline-fixture");

    const second = await applyInjectedMigration({
      cacheRoot,
      relativePath: fixture.relativePath,
      bytes: `${fixture.bytes}upgrade\n`,
    });
    assert.equal(second.beforeSha256, first.sha256);

    await rollbackInjectedMigration({ cacheRoot });
    const restored = await restartFromInjectedCache({ cacheRoot });
    assert.equal(restored.sha256, first.sha256);

    await tamperInjectedCache({ cacheRoot, relativePath: fixture.relativePath });
    await assert.rejects(
      () => restartFromInjectedCache({ cacheRoot }),
      (error) => error instanceof ClosedFailure && error.code === TAMPER_REJECTED,
    );
  } finally {
    rmSync(cacheRoot, { recursive: true, force: true });
  }
});

test("rollback without previous pointer fails closed", async () => {
  const cacheRoot = mkdtempSync(join(tmpdir(), "ls08-life-empty-"));
  try {
    await assert.rejects(
      () => rollbackInjectedMigration({ cacheRoot }),
      (error) => error instanceof ClosedFailure && error.code === ROLLBACK_UNAVAILABLE,
    );
  } finally {
    rmSync(cacheRoot, { recursive: true, force: true });
  }
});

test("syntax of harness scripts is valid", () => {
  for (const file of ["harness.mjs", "receipt.mjs", "lifecycle.mjs", "identities.mjs", "scripts/run.mjs", "scripts/validate.mjs"]) {
    execFileSync(process.execPath, ["--check", join(here, file)]);
  }
});

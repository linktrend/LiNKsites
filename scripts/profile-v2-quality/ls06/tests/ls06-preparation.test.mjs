import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { evaluatePacket } from "../evaluate.mjs";
import { CHECK_IDS } from "../constants.mjs";
import { missingLs04Fields, missingProviderFields } from "../identities.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const fixtures = join(here, "..", "fixtures");
const runJs = join(here, "..", "run.mjs");

function fixture(name) {
  return join(fixtures, name);
}

function failedIds(report) {
  return report.checks.filter((item) => item.status === "FAIL").map((item) => item.id);
}

test("identity helpers fail closed on absent LS-04/provider fields", () => {
  assert.ok(missingLs04Fields(null).includes("workingContentIdentity"));
  assert.ok(missingProviderFields({}).includes("candidateIdentity"));
});

test("injected identities packet PASSes as preparationOnly and not LS-06 completion", () => {
  const report = evaluatePacket(fixture("pass-injected-identities"));
  assert.equal(report.status, "PASS");
  assert.equal(report.preparationOnly, true);
  assert.equal(report.ls06Complete, false);
  assert.equal(report.scope, "ls06-preparation-only");
  assert.deepEqual(report.notCompletionOf, ["LS-06"]);
  assert.ok(report.independentOf.includes("provider-bytes"));
  assert.ok(report.evidenceBoundaries.notEvaluated.includes("LS-06-completion"));
  assert.equal(failedIds(report).length, 0);
});

test("absent LS-04 identity fails closed", () => {
  const report = evaluatePacket(fixture("fail-missing-ls04"));
  assert.equal(report.status, "FAIL");
  assert.ok(failedIds(report).includes(CHECK_IDS.LS04_IDENTITY));
});

test("absent LS-05 identity fails closed", () => {
  const report = evaluatePacket(fixture("fail-missing-ls05"));
  assert.equal(report.status, "FAIL");
  assert.ok(failedIds(report).includes(CHECK_IDS.LS05_IDENTITY));
});

test("absent provider identity fails closed", () => {
  const report = evaluatePacket(fixture("fail-missing-provider"));
  assert.equal(report.status, "FAIL");
  assert.ok(failedIds(report).includes(CHECK_IDS.PROVIDER_IDENTITY));
});

test("absent layout identity fails closed", () => {
  const report = evaluatePacket(fixture("fail-missing-layout"));
  assert.equal(report.status, "FAIL");
  assert.ok(failedIds(report).includes(CHECK_IDS.LAYOUT_IDENTITY));
});

test("non-injected provider source fails closed", () => {
  const report = evaluatePacket(fixture("fail-live-source"));
  assert.equal(report.status, "FAIL");
  assert.ok(failedIds(report).includes(CHECK_IDS.INJECTED_ONLY));
});

test("LS-06 completion claim fails closed", () => {
  const report = evaluatePacket(fixture("fail-completion-claim"));
  assert.equal(report.status, "FAIL");
  assert.ok(failedIds(report).includes(CHECK_IDS.NO_COMPLETION));
});

test("providerBytes key fails integrity", () => {
  const report = evaluatePacket(fixture("fail-provider-bytes"));
  assert.equal(report.status, "FAIL");
  assert.ok(failedIds(report).includes(CHECK_IDS.NO_PROVIDER_BYTES));
});

test("malformed packet.json fails closed", () => {
  const report = evaluatePacket(fixture("fail-malformed-packet"));
  assert.equal(report.status, "FAIL");
  assert.equal(report.loadError.code, "INPUT_MALFORMED");
});

test("missing packet.json fails closed", () => {
  const report = evaluatePacket(fixture("fail-missing-packet"));
  assert.equal(report.status, "FAIL");
  assert.equal(report.loadError.code, "INPUT_MISSING");
});

test("path escape fails closed", () => {
  const report = evaluatePacket(fixture("fail-path-escape"));
  assert.equal(report.status, "FAIL");
  assert.equal(report.loadError.code, "PATH_ESCAPE");
});

test("symlinked source escape fails closed", () => {
  const temp = mkdtempSync(join(tmpdir(), "ls06-symlink-escape-"));
  try {
    const packetDir = join(temp, "packet");
    cpSync(fixture("pass-injected-identities"), packetDir, { recursive: true });
    const outsideContract = join(temp, "outside-contract.json");
    writeFileSync(outsideContract, "{}\n");
    unlinkSync(join(packetDir, "contract.json"));
    symlinkSync(outsideContract, join(packetDir, "contract.json"));

    const report = evaluatePacket(packetDir);
    assert.equal(report.status, "FAIL");
    assert.equal(report.loadError.code, "PATH_ESCAPE");
    assert.match(report.loadError.message, /through symlink/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("rollback digest mismatch fails closed", () => {
  const report = evaluatePacket(fixture("fail-rollback-mismatch"));
  assert.equal(report.status, "FAIL");
  assert.ok(failedIds(report).includes(CHECK_IDS.ROLLBACK_DIGEST));
});

test("A1/A2 identical compositions fail structural distinctness", () => {
  const report = evaluatePacket(fixture("fail-a1-a2-same-structure"));
  assert.equal(report.status, "FAIL");
  assert.ok(failedIds(report).includes(CHECK_IDS.CONTRACT_DISTINCT));
});

test("placeholder header fails shell and placeholder checks", () => {
  const report = evaluatePacket(fixture("fail-placeholder-shell"));
  assert.equal(report.status, "FAIL");
  const failed = failedIds(report);
  assert.ok(failed.includes(CHECK_IDS.CONTRACT_SHELL));
  assert.ok(failed.includes(CHECK_IDS.CONTRACT_NO_PLACEHOLDERS));
});

test("CLI emits machine-readable PASS and FAIL with exit codes", () => {
  const pass = spawnSync(process.execPath, [runJs, "--packet", fixture("pass-injected-identities")], {
    encoding: "utf8",
  });
  assert.equal(pass.status, 0);
  const passReport = JSON.parse(pass.stdout);
  assert.equal(passReport.status, "PASS");
  assert.equal(passReport.preparationOnly, true);

  const fail = spawnSync(process.execPath, [runJs, "--packet", fixture("fail-missing-ls04")], {
    encoding: "utf8",
  });
  assert.equal(fail.status, 1);
  const failReport = JSON.parse(fail.stdout);
  assert.equal(failReport.status, "FAIL");
});

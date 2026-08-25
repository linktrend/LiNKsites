#!/usr/bin/env node
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync, cpSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { test } from "node:test";
import {
  validatePreparationDir,
  validateReceiptBundle,
} from "./validate-receipt-bundle.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../../..");
const validator = join(here, "validate-receipt-bundle.mjs");
const preparationDir = join(repoRoot, "docs/evidence/ls08/preparation");

function loadFixture() {
  return JSON.parse(readFileSync(join(preparationDir, "fixtures/schema-only-bundle.json"), "utf8"));
}

function runCli(args, { expectFail = false } = {}) {
  try {
    const stdout = execFileSync(process.execPath, [validator, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    assert.equal(expectFail, false);
    return { code: 0, stdout, stderr: "" };
  } catch (error) {
    assert.equal(expectFail, true);
    return {
      code: error.status,
      stdout: error.stdout || "",
      stderr: error.stderr || "",
    };
  }
}

test("preparation directory is schema-ok and incomplete", () => {
  const result = validatePreparationDir(preparationDir);
  assert.deepEqual(result.failures, []);
  assert.equal(result.ok, true);
  const cli = runCli(["--dir", preparationDir]);
  assert.match(cli.stdout, /SCHEMA_OK/);
  assert.match(cli.stdout, /packetCompletion=false/);
});

test("schema-only fixture is not treated as A1 or consumer proof", () => {
  const status = JSON.parse(readFileSync(join(preparationDir, "STATUS.json"), "utf8"));
  const bundle = loadFixture();
  assert.equal(status.a1BytesPresent, false);
  assert.equal(status.providerReceiptPresent, false);
  assert.equal(status.consumerProofPresent, false);
  assert.equal(bundle.evidenceClass, "schema-fixture");
  assert.equal(bundle.packetCompletion, false);
  assert.equal(bundle.providerIdentity.releaseEntryVersion.includes("a1.1"), false);
});

test("rejects missing exact provider identity", () => {
  const bundle = loadFixture();
  delete bundle.providerIdentity.commit;
  const result = validateReceiptBundle(bundle);
  assert.equal(result.ok, false);
  assert.ok(result.failures.some((item) => item.includes("providerIdentity.commit")));
});

test("rejects blank consumer tree", () => {
  const bundle = loadFixture();
  bundle.consumerIdentity.tree = "unknown";
  const result = validateReceiptBundle(bundle);
  assert.equal(result.ok, false);
  assert.ok(result.failures.some((item) => item.includes("consumerIdentity.tree")));
});

test("rejects missing plan L browser cell", () => {
  const bundle = loadFixture();
  bundle.cells = bundle.cells.filter((cell) => !(cell.surface === "browser" && cell.planId === "l"));
  const result = validateReceiptBundle(bundle);
  assert.equal(result.ok, false);
  assert.ok(result.failures.some((item) => item.includes("missing cell browser:l") || item.includes("exactly 8")));
});

test("rejects missing rollback or tamper verdict fields", () => {
  const bundle = loadFixture();
  delete bundle.cells[0].verdicts.migration_rollback_valid;
  delete bundle.cells[0].verdicts.tamper_rejected;
  const result = validateReceiptBundle(bundle);
  assert.equal(result.ok, false);
  assert.ok(result.failures.some((item) => item.includes("migration_rollback_valid")));
  assert.ok(result.failures.some((item) => item.includes("tamper_rejected")));
});

test("rejects packetCompletion on schema fixtures", () => {
  const bundle = loadFixture();
  bundle.packetCompletion = true;
  const result = validateReceiptBundle(bundle);
  assert.equal(result.ok, false);
  assert.ok(result.failures.some((item) => item.includes("packetCompletion")));
});

test("CLI --bundle reports identity failures", () => {
  const temp = mkdtempSync(join(tmpdir(), "ls08-bundle-"));
  try {
    const bundle = loadFixture();
    bundle.providerIdentity.repository = "linktrend/LiNKsites";
    const file = join(temp, "bad.json");
    writeFileSync(file, JSON.stringify(bundle));
    const cli = runCli(["--bundle", file], { expectFail: true });
    assert.match(cli.stderr, /providerIdentity.repository/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("CLI rejects preparation STATUS that claims A1 bytes", () => {
  const temp = mkdtempSync(join(tmpdir(), "ls08-prep-"));
  try {
    cpSync(preparationDir, temp, { recursive: true });
    const statusPath = join(temp, "STATUS.json");
    const status = JSON.parse(readFileSync(statusPath, "utf8"));
    status.a1BytesPresent = true;
    writeFileSync(statusPath, JSON.stringify(status));
    const cli = runCli(["--dir", temp], { expectFail: true });
    assert.match(cli.stderr, /a1BytesPresent/);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test("syntax of validator is valid", () => {
  execFileSync(process.execPath, ["--check", validator]);
});

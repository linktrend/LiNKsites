#!/usr/bin/env node
/**
 * Dependency-independent LS-08 receipt-bundle validator.
 * Checks schema, exact provider/consumer identities, A/B/C/L × server/browser
 * coverage, and rollback/tamper verdict fields. Does not load A1 bytes or
 * claim packet completion.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const GIT_SHA = /^[0-9a-f]{40}$/;
const SURFACES = ["server", "browser"];
const PLANS = ["a", "b", "c", "l"];
const LAYOUT_PACKS = new Set(["a1", "a2", "a3"]);
const EVIDENCE_CLASSES = new Set(["schema-fixture", "paired-proof"]);
const VERDICT_KEYS = [
  "candidate_materialized",
  "adapter_compatible",
  "payload_projection_valid",
  "server_render_valid",
  "browser_fixture_valid",
  "migration_rollback_valid",
  "tamper_rejected",
  "cache_restart_valid",
];
const VERDICT_VALUES = new Set(["NOT_RUN", "FAIL", "HOLD", "UNAVAILABLE", "PASS"]);
const FORBIDDEN_IDENTITY_TOKENS = new Set([
  "",
  "unknown",
  "UNKNOWN",
  "tbd",
  "TBD",
  "pending",
  "PENDING",
  "0000000000000000000000000000000000000000",
]);

export const REQUIRED_PREPARATION_FILES = [
  "README.md",
  "STATUS.json",
  "receipt-bundle.schema.json",
  "fixtures/schema-only-bundle.json",
];

function failList() {
  return [];
}

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function rejectIdentityToken(label, value, failures) {
  if (typeof value !== "string" || FORBIDDEN_IDENTITY_TOKENS.has(value.trim())) {
    failures.push(`${label} is missing or not an exact identity`);
    return false;
  }
  return true;
}

function rejectGitSha(label, value, failures) {
  if (!rejectIdentityToken(label, value, failures)) return false;
  if (!GIT_SHA.test(value)) {
    failures.push(`${label} must be a 40-character lowercase git SHA`);
    return false;
  }
  return true;
}

export function validateReceiptBundle(bundle) {
  const failures = failList();
  if (!isObject(bundle)) {
    return { ok: false, failures: ["bundle must be a JSON object"] };
  }

  if (bundle.schemaVersion !== 1) failures.push("schemaVersion must be 1");
  if (bundle.kind !== "ls08-receipt-bundle") failures.push("kind must be ls08-receipt-bundle");
  if (bundle.packetId !== "LS-08") failures.push("packetId must be LS-08");
  if (typeof bundle.packetCompletion !== "boolean") {
    failures.push("packetCompletion must be boolean");
  }
  if (!EVIDENCE_CLASSES.has(bundle.evidenceClass)) {
    failures.push("evidenceClass must be schema-fixture or paired-proof");
  }
  if (!LAYOUT_PACKS.has(bundle.layoutPack)) {
    failures.push("layoutPack must be a1, a2, or a3");
  }

  if (!Array.isArray(bundle.surfaces) || !sameSet(bundle.surfaces, SURFACES)) {
    failures.push("surfaces must be exactly [server, browser]");
  }
  if (!Array.isArray(bundle.plans) || !sameSet(bundle.plans, PLANS)) {
    failures.push("plans must be exactly [a, b, c, l]");
  }

  validateProviderIdentity(bundle.providerIdentity, failures);
  validateConsumerIdentity(bundle.consumerIdentity, failures);
  validateCells(bundle.cells, failures);

  if (bundle.evidenceClass === "schema-fixture" && bundle.packetCompletion === true) {
    failures.push("schema-fixture must not set packetCompletion true");
  }
  if (bundle.packetCompletion === true && hasIncompleteVerdicts(bundle.cells)) {
    failures.push("packetCompletion true is forbidden while any cell verdict is NOT_RUN or HOLD");
  }
  if (bundle.evidenceClass === "paired-proof" && bundle.packetCompletion === true) {
    failures.push("this validator does not admit packet completion; paired proof remains out of scope");
  }

  return { ok: failures.length === 0, failures };
}

function sameSet(actual, expected) {
  if (actual.length !== expected.length) return false;
  const seen = new Set();
  for (const item of actual) {
    if (!expected.includes(item) || seen.has(item)) return false;
    seen.add(item);
  }
  return seen.size === expected.length;
}

function validateProviderIdentity(identity, failures) {
  if (!isObject(identity)) {
    failures.push("providerIdentity is missing");
    return;
  }
  if (identity.repository !== "linktrend/LiNKlibraries") {
    failures.push("providerIdentity.repository must be linktrend/LiNKlibraries");
  }
  rejectGitSha("providerIdentity.commit", identity.commit, failures);
  rejectGitSha("providerIdentity.tree", identity.tree, failures);
  rejectGitSha("providerIdentity.releaseArtifactTree", identity.releaseArtifactTree, failures);
  if (!rejectIdentityToken("providerIdentity.releaseEntryVersion", identity.releaseEntryVersion, failures)) {
    return;
  }
  if (!identity.releaseEntryVersion.startsWith("master-template-type-1@")) {
    failures.push("providerIdentity.releaseEntryVersion must name master-template-type-1@…");
  }
}

function validateConsumerIdentity(identity, failures) {
  if (!isObject(identity)) {
    failures.push("consumerIdentity is missing");
    return;
  }
  if (identity.repository !== "linktrend/LiNKsites") {
    failures.push("consumerIdentity.repository must be linktrend/LiNKsites");
  }
  rejectGitSha("consumerIdentity.commit", identity.commit, failures);
  rejectGitSha("consumerIdentity.tree", identity.tree, failures);
}

function validateCells(cells, failures) {
  if (!Array.isArray(cells) || cells.length !== 8) {
    failures.push("cells must contain exactly 8 server/browser × A/B/C/L entries");
    return;
  }
  const seen = new Set();
  for (const [index, cell] of cells.entries()) {
    const prefix = `cells[${index}]`;
    if (!isObject(cell)) {
      failures.push(`${prefix} must be an object`);
      continue;
    }
    if (!SURFACES.includes(cell.surface)) failures.push(`${prefix}.surface is missing or invalid`);
    if (!PLANS.includes(cell.planId)) failures.push(`${prefix}.planId is missing or invalid`);
    const key = `${cell.surface}:${cell.planId}`;
    if (seen.has(key)) failures.push(`duplicate cell ${key}`);
    seen.add(key);
    validateVerdicts(`${prefix}.verdicts`, cell.verdicts, failures);
  }
  for (const surface of SURFACES) {
    for (const plan of PLANS) {
      const key = `${surface}:${plan}`;
      if (!seen.has(key)) failures.push(`missing cell ${key}`);
    }
  }
}

function validateVerdicts(label, verdicts, failures) {
  if (!isObject(verdicts)) {
    failures.push(`${label} is missing`);
    return;
  }
  for (const key of VERDICT_KEYS) {
    const value = verdicts[key];
    if (!VERDICT_VALUES.has(value)) {
      failures.push(`${label}.${key} is missing or not an allowed verdict`);
    }
  }
  for (const extra of Object.keys(verdicts)) {
    if (!VERDICT_KEYS.includes(extra)) {
      failures.push(`${label}.${extra} is not a declared verdict field`);
    }
  }
}

function hasIncompleteVerdicts(cells) {
  if (!Array.isArray(cells)) return true;
  return cells.some(
    (cell) =>
      isObject(cell?.verdicts) &&
      VERDICT_KEYS.some((key) => cell.verdicts[key] === "NOT_RUN" || cell.verdicts[key] === "HOLD"),
  );
}

export function validatePreparationStatus(status) {
  const failures = failList();
  if (!isObject(status)) return { ok: false, failures: ["STATUS.json must be an object"] };
  if (status.kind !== "ls08-preparation-status") failures.push("STATUS.kind must be ls08-preparation-status");
  if (status.packetId !== "LS-08") failures.push("STATUS.packetId must be LS-08");
  if (status.packetCompletion !== false) failures.push("STATUS.packetCompletion must be false");
  if (status.a1BytesPresent !== false) failures.push("STATUS.a1BytesPresent must be false");
  if (status.providerReceiptPresent !== false) failures.push("STATUS.providerReceiptPresent must be false");
  if (status.consumerProofPresent !== false) failures.push("STATUS.consumerProofPresent must be false");
  if (status.pairedProofRun !== false) failures.push("STATUS.pairedProofRun must be false");
  if (status.dependencyIndependent !== true) failures.push("STATUS.dependencyIndependent must be true");
  return { ok: failures.length === 0, failures };
}

export function validatePreparationDir(dir) {
  const failures = failList();
  for (const relative of REQUIRED_PREPARATION_FILES) {
    const full = path.join(dir, relative);
    if (!fs.existsSync(full)) failures.push(`missing ${relative}`);
  }
  if (failures.length) return { ok: false, failures };

  let status;
  let bundle;
  try {
    status = JSON.parse(fs.readFileSync(path.join(dir, "STATUS.json"), "utf8"));
  } catch {
    failures.push("STATUS.json is not parseable JSON");
  }
  try {
    bundle = JSON.parse(fs.readFileSync(path.join(dir, "fixtures/schema-only-bundle.json"), "utf8"));
  } catch {
    failures.push("fixtures/schema-only-bundle.json is not parseable JSON");
  }
  try {
    JSON.parse(fs.readFileSync(path.join(dir, "receipt-bundle.schema.json"), "utf8"));
  } catch {
    failures.push("receipt-bundle.schema.json is not parseable JSON");
  }

  if (status) {
    const statusResult = validatePreparationStatus(status);
    failures.push(...statusResult.failures);
  }
  if (bundle) {
    if (bundle.evidenceClass !== "schema-fixture") {
      failures.push("preparation fixture evidenceClass must be schema-fixture");
    }
    const bundleResult = validateReceiptBundle(bundle);
    failures.push(...bundleResult.failures);
  }
  return { ok: failures.length === 0, failures };
}

function parseArgs(argv) {
  const options = { dir: null, bundle: null };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dir") options.dir = argv[++i];
    else if (arg === "--bundle") options.bundle = argv[++i];
    else if (arg === "--help") options.help = true;
    else {
      options.unknown = arg;
    }
  }
  return options;
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help || options.unknown) {
    process.stderr.write(
      "usage: validate-receipt-bundle.mjs --dir <preparation-dir> | --bundle <bundle.json>\n",
    );
    process.exitCode = options.help ? 0 : 2;
    return;
  }
  if (!options.dir && !options.bundle) {
    process.stderr.write("FAIL: pass --dir or --bundle\n");
    process.exitCode = 2;
    return;
  }

  const failures = [];
  if (options.bundle) {
    let bundle;
    try {
      bundle = JSON.parse(fs.readFileSync(options.bundle, "utf8"));
    } catch (error) {
      failures.push(`unreadable bundle: ${error.message}`);
    }
    if (bundle) failures.push(...validateReceiptBundle(bundle).failures);
  }
  if (options.dir) {
    failures.push(...validatePreparationDir(options.dir).failures);
  }

  if (failures.length) {
    for (const failure of failures) process.stderr.write(`FAIL: ${failure}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write("LS-08 receipt-bundle schema validation: SCHEMA_OK packetCompletion=false\n");
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) main();

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  PLACEHOLDER_HARNESS,
  PLACEHOLDER_LS10,
  PROTECTED_COMMIT,
  PROTECTED_TREE,
  isOwnedPath,
  isProhibitedPath,
  validateAgainstSchema,
  validateEvidenceDirs,
  writeChecksums,
} from "./validate-ls11-release-evidence.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const evidenceDir = path.resolve(here, "..");
const releasesDir = path.resolve(evidenceDir, "../../releases");
const repoRoot = path.resolve(evidenceDir, "../../..");

function cloneEvidence() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "ls11-evidence-"));
  const clonedEvidence = path.join(root, "docs/evidence/profile-v2-release");
  const clonedReleases = path.join(root, "docs/releases");
  fs.cpSync(evidenceDir, clonedEvidence, { recursive: true });
  fs.cpSync(releasesDir, clonedReleases, { recursive: true });
  return { root, clonedEvidence, clonedReleases };
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

test("owned path helper accepts only LS-11 docs", () => {
  assert.equal(isOwnedPath("docs/evidence/profile-v2-release/STATUS.json"), true);
  assert.equal(isOwnedPath("docs/releases/STATUS.json"), true);
  assert.equal(isOwnedPath("packages/profile/src/index.ts"), false);
  assert.equal(isProhibitedPath("apps/web-master/package.json"), true);
  assert.equal(isProhibitedPath("docs/evidence/profile-v2-release/STATUS.json"), false);
});

test("live completion evidence validates while historical templates remain fail-closed", () => {
  const result = validateEvidenceDirs(evidenceDir, releasesDir, repoRoot);
  assert.deepEqual(result.failures, []);
  assert.equal(result.ok, true);
});

test("schema requires packetCompletion true", () => {
  const schema = JSON.parse(
    fs.readFileSync(path.join(evidenceDir, "schemas/status.schema.json"), "utf8"),
  );
  const status = JSON.parse(fs.readFileSync(path.join(evidenceDir, "STATUS.json"), "utf8"));
  status.packetCompletion = false;
  const failures = validateAgainstSchema(status, schema);
  assert.ok(failures.some((row) => row.includes("packetCompletion")));
});

test("historical placeholders do not override the authoritative completion binding", () => {
  const { clonedEvidence, clonedReleases } = cloneEvidence();
  const depsPath = path.join(clonedEvidence, "DEPENDENCIES.json");
  const deps = JSON.parse(fs.readFileSync(depsPath, "utf8"));
  deps.dependencies[0].satisfied = true;
  deps.dependencies[0].commit = "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  deps.dependencies[0].tree = "bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
  deps.dependencies[0].bindingState = "bound";
  writeJson(depsPath, deps);
  const result = validateEvidenceDirs(clonedEvidence, clonedReleases, repoRoot);
  assert.equal(result.ok, false);
  assert.ok(result.failures.some((row) => /schema|future-placeholder|commit\/tree|satisfied/i.test(row)));
});

test("validator fail-closes founder execute and unknown identities", () => {
  const { clonedEvidence, clonedReleases } = cloneEvidence();
  const founderPath = path.join(clonedEvidence, "templates/founder-reserved-decisions.json");
  const founder = JSON.parse(fs.readFileSync(founderPath, "utf8"));
  founder.decisions.main.authorized = true;
  founder.decisions.main.executed = true;
  founder.decisions.main.identity = "unknown";
  writeJson(founderPath, founder);
  const result = validateEvidenceDirs(clonedEvidence, clonedReleases, repoRoot);
  assert.equal(result.ok, false);
  assert.ok(result.failures.length > 0);
});

test("placeholder names are the reserved future identities", () => {
  const deps = JSON.parse(fs.readFileSync(path.join(evidenceDir, "DEPENDENCIES.json"), "utf8"));
  const receipts = JSON.parse(
    fs.readFileSync(path.join(evidenceDir, "templates/receipt-binding.json"), "utf8"),
  );
  assert.equal(deps.dependencies[0].placeholderId, PLACEHOLDER_LS10);
  assert.equal(deps.dependencies[1].placeholderId, PLACEHOLDER_HARNESS);
  assert.equal(receipts.bindings[0].placeholderId, PLACEHOLDER_HARNESS);
  assert.equal(receipts.bindings[1].placeholderId, PLACEHOLDER_LS10);
  assert.equal(deps.dependencies[0].commit, null);
  assert.equal(receipts.bindings[0].tree, null);
});

test("completion binds the exact accepted protected development identity", () => {
  const identity = JSON.parse(fs.readFileSync(path.join(evidenceDir, "identity.json"), "utf8"));
  assert.notEqual(identity.protectedDevelopment.commit, PROTECTED_COMMIT);
  assert.notEqual(identity.protectedDevelopment.tree, PROTECTED_TREE);
  assert.equal(identity.ls11Complete, false);
  const completion = JSON.parse(fs.readFileSync(path.join(evidenceDir, "COMPLETION.json"), "utf8"));
  assert.equal(completion.packetCompletion, true);
  assert.equal(completion.exactProduct.protectedDevelopmentCommit, "d5056f8e4ce832a759fda18f8b3282eba170b471");
  assert.equal(completion.exactProduct.tree, "3358c4ae4e33143799b301aa5c34f498f6a3d7ac");
});

test("writeChecksums round-trips packageDigest", () => {
  const { clonedEvidence, clonedReleases } = cloneEvidence();
  const payload = writeChecksums(clonedEvidence, clonedReleases);
  assert.match(payload.packageDigest, /^sha256:[0-9a-f]{64}$/);
  const result = validateEvidenceDirs(clonedEvidence, clonedReleases, repoRoot);
  assert.deepEqual(result.failures, []);
  assert.equal(result.ok, true);
});

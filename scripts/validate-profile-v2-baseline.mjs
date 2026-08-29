#!/usr/bin/env node
/**
 * Fail-closed LS-00 / Profile v2 baseline evidence validator.
 * Emits PASS only when every required evidence file is present, parseable,
 * internally consistent, ancestor-bound to the advertised development commit,
 * scoped to owned paths, and free of unknown/stale identities.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_REPOSITORY = "linktrend/LiNKsites";
const EXPECTED_ORIGIN = "https://github.com/linktrend/LiNKsites";
const EXPECTED_BASELINE_COMMIT = "a23f87aa44a8625a32bb2f0d5015d7c0cf57f33d";
const EXPECTED_BASELINE_TREE = "cc444092dfc07c9e77d9eb6f441751e5b9fec3d0";
const EXPECTED_ISSUE_BRANCH = "dev/cloudcursor/linksites-ls-00-d5e7";
const EXPECTED_SELECTOR = "grok-4.6";
const FORBIDDEN_STATUS = new Set(["unknown", "PENDING", "pass", "PASS"]);
const REQUIRED_JSON = [
  "identity.json",
  "open-work.json",
  "library-pins.json",
  "database-runtime.json",
  "baseline-tests.json",
  "authority-inventory.json",
  "requirements-map.json",
  "external-configuration.json",
  "route-readback.json",
];
const REQUIRED_FR_IDS = Array.from({ length: 25 }, (_, i) => `LS-FR-${String(i + 1).padStart(2, "0")}`);
const OWNED_PREFIXES = [
  "docs/evidence/profile-v2-baseline/",
  "scripts/validate-profile-v2-baseline.mjs",
];
const PROHIBITED_PREFIXES = ["packages/", "apps/", "supabase/migrations/"];
const GENERATED_OUTPUT_CLOSURE_CANDIDATES = [
  ".ide-development/config/generated-output-closure.json",
  "core/managed-core/config/generated-output-closure.json",
];

const failures = [];

function fail(message) {
  failures.push(message);
}

function git(repoRoot, args, { allowFailure = false } = {}) {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    if (!allowFailure) {
      fail(`git ${args.join(" ")} failed: ${error.stderr || error.message}`);
    }
    return "";
  }
}

function stableStringify(value) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys
    .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
    .join(",")}}`;
}

function walkStatus(node, trail) {
  if (Array.isArray(node)) {
    node.forEach((item, index) => walkStatus(item, `${trail}[${index}]`));
    return;
  }
  if (node && typeof node === "object") {
    if (Object.prototype.hasOwnProperty.call(node, "status")) {
      const status = node.status;
      if (typeof status !== "string" || FORBIDDEN_STATUS.has(status) || status === "unknown") {
        fail(`${trail}.status is forbidden or missing (${JSON.stringify(status)})`);
      }
    }
    for (const [key, child] of Object.entries(node)) {
      if (key === "status") continue;
      walkStatus(child, `${trail}.${key}`);
    }
  }
}

function computeProfileDigest(evidence) {
  const digestSource = {};
  for (const name of REQUIRED_JSON) {
    const clone = structuredClone(evidence[name]);
    if (name === "identity.json" && clone && typeof clone === "object") {
      delete clone.profileDigest;
    }
    digestSource[name] = clone;
  }
  return `sha256:${createHash("sha256").update(stableStringify(digestSource)).digest("hex")}`;
}

function isOwned(relPath) {
  return OWNED_PREFIXES.some((prefix) =>
    prefix.endsWith("/") ? relPath.startsWith(prefix) : relPath === prefix,
  );
}

function isProhibited(relPath) {
  return PROHIBITED_PREFIXES.some((prefix) => relPath === prefix || relPath.startsWith(prefix));
}

function isSafeRepoRelative(value) {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    !value.includes("\\") &&
    !path.isAbsolute(value) &&
    !value.split("/").includes("..")
  );
}

function loadDeclaredGeneratedOutputs(root) {
  let closurePath = "";
  let raw = "";
  for (const candidate of GENERATED_OUTPUT_CLOSURE_CANDIDATES) {
    const abs = path.join(root, candidate);
    if (!fs.existsSync(abs)) continue;
    closurePath = candidate;
    try {
      raw = fs.readFileSync(abs, "utf8");
    } catch (error) {
      fail(`unreadable generated-output closure at ${candidate}: ${error.message}`);
      return new Set();
    }
    break;
  }
  if (!closurePath) {
    fail(
      `generated-output closure missing; looked for ${GENERATED_OUTPUT_CLOSURE_CANDIDATES.join(", ")}`,
    );
    return new Set();
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (error) {
    fail(`malformed generated-output closure at ${closurePath}: ${error.message}`);
    return new Set();
  }
  if (
    parsed === null ||
    typeof parsed !== "object" ||
    Array.isArray(parsed) ||
    parsed.schemaVersion !== 1 ||
    parsed.kind !== "generated-output-closure"
  ) {
    fail(`generated-output closure identity is invalid at ${closurePath}`);
    return new Set();
  }
  if (!Array.isArray(parsed.outputs) || parsed.outputs.length < 1) {
    fail(`generated-output closure outputs must be a non-empty array at ${closurePath}`);
    return new Set();
  }
  const declared = new Set();
  parsed.outputs.forEach((entry, index) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
      fail(`generated-output closure outputs[${index}] must be an object`);
      return;
    }
    const paths = [entry.output];
    if (entry.additionalOutputs !== undefined) {
      if (!Array.isArray(entry.additionalOutputs)) {
        fail(`generated-output closure outputs[${index}].additionalOutputs must be an array`);
        return;
      }
      paths.push(...entry.additionalOutputs);
    }
    for (const outputPath of paths) {
      if (!isSafeRepoRelative(outputPath)) {
        fail(
          `generated-output closure outputs[${index}] has an unsafe output path ${JSON.stringify(outputPath)}`,
        );
        continue;
      }
      declared.add(outputPath);
    }
  });
  return declared;
}

function isDeclaredGeneratedOutput(relPath, declared) {
  return declared.has(relPath);
}

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "..");
const evidenceDir = path.join(repoRoot, "docs/evidence/profile-v2-baseline");

if (!fs.existsSync(path.join(repoRoot, ".git")) && !fs.existsSync(path.join(repoRoot, ".git"))) {
  // worktrees have .git as a file
}
if (!fs.existsSync(path.join(repoRoot, "docs/architecture/linksites-profile-v2/EXECUTION-MANIFEST.json"))) {
  fail("execution manifest missing at docs/architecture/linksites-profile-v2/EXECUTION-MANIFEST.json");
}

const evidence = {};
for (const name of REQUIRED_JSON) {
  const filePath = path.join(evidenceDir, name);
  if (!fs.existsSync(filePath)) {
    fail(`missing evidence file ${name}`);
    continue;
  }
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`unreadable or malformed JSON ${name}: ${error.message}`);
    continue;
  }
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    fail(`${name} must be a JSON object`);
    continue;
  }
  evidence[name] = parsed;
  walkStatus(parsed, name);
}

const identity = evidence["identity.json"];
if (identity) {
  if (identity.repository !== EXPECTED_REPOSITORY) fail("identity.repository mismatch");
  if (identity.normalizedOrigin !== EXPECTED_ORIGIN) fail("identity.normalizedOrigin mismatch");
  if (identity.baselineCommit !== EXPECTED_BASELINE_COMMIT) fail("identity.baselineCommit mismatch");
  if (identity.baselineTree !== EXPECTED_BASELINE_TREE) fail("identity.baselineTree mismatch");
  if (identity.issueBranch !== EXPECTED_ISSUE_BRANCH) fail("identity.issueBranch mismatch");
  if (identity.packet !== "LS-00") fail("identity.packet mismatch");
  const issues = Array.isArray(identity.issues) ? identity.issues.join(",") : "";
  if (issues !== "ISS-01,ISS-02,ISS-03") fail("identity.issues must be ISS-01, ISS-02, ISS-03");
}

const actualBaselineTree = git(repoRoot, ["rev-parse", `${EXPECTED_BASELINE_COMMIT}^{tree}`]);
if (actualBaselineTree && actualBaselineTree !== EXPECTED_BASELINE_TREE) {
  fail(
    `git tree for ${EXPECTED_BASELINE_COMMIT} is ${actualBaselineTree}, expected ${EXPECTED_BASELINE_TREE}`,
  );
}

const head = git(repoRoot, ["rev-parse", "HEAD"]);
if (head && head !== EXPECTED_BASELINE_COMMIT) {
  git(repoRoot, ["merge-base", "--is-ancestor", EXPECTED_BASELINE_COMMIT, "HEAD"]);
}

const branch = git(repoRoot, ["branch", "--show-current"]);
if (branch && branch !== EXPECTED_ISSUE_BRANCH) {
  fail(`current branch is ${branch}, expected ${EXPECTED_ISSUE_BRANCH}`);
}

const declaredGeneratedOutputs = loadDeclaredGeneratedOutputs(repoRoot);
const changed = [
  ...git(repoRoot, ["diff", "--name-only", EXPECTED_BASELINE_COMMIT]).split("\n"),
  ...git(repoRoot, ["ls-files", "--others", "--exclude-standard"]).split("\n"),
].filter(Boolean);
for (const relPath of changed) {
  if (isProhibited(relPath)) {
    fail(`prohibited path changed: ${relPath}`);
    continue;
  }
  if (isOwned(relPath) || isDeclaredGeneratedOutput(relPath, declaredGeneratedOutputs)) {
    continue;
  }
  fail(`out-of-scope path changed: ${relPath}`);
}

const requirements = evidence["requirements-map.json"];
if (requirements) {
  const ids = Array.isArray(requirements.requirements)
    ? requirements.requirements.map((row) => row.id)
    : [];
  for (const id of REQUIRED_FR_IDS) {
    if (!ids.includes(id)) fail(`requirements-map missing ${id}`);
  }
  if (ids.length !== 25) fail(`requirements-map must contain exactly 25 rows, found ${ids.length}`);
}

const route = evidence["route-readback.json"];
if (route) {
  if (route.requested?.fast !== false) fail("route-readback.requested.fast must be false");
  if (route.apiReadback?.fast !== false) fail("route-readback.apiReadback.fast must be false");
  if (route.packetBinding?.fast !== false) fail("route-readback.packetBinding.fast must be false");
  if (route.requested?.semanticRoute !== EXPECTED_SELECTOR) {
    fail("route-readback.requested.semanticRoute mismatch");
  }
  if (route.packetBinding?.selectorId !== EXPECTED_SELECTOR) {
    fail("route-readback.packetBinding.selectorId mismatch");
  }
  if (route.prepared?.claimed !== false) fail("PREPARED must not be claimed");
  if (!route.apiReadback?.originalModelName) fail("missing apiReadback.originalModelName");
}

const authority = evidence["authority-inventory.json"];
if (authority) {
  if (!Array.isArray(authority.sharedOrHarnessCandidate) || authority.sharedOrHarnessCandidate.length < 1) {
    fail("authority-inventory.sharedOrHarnessCandidate missing");
  }
  if (!Array.isArray(authority.websiteDomain) || authority.websiteDomain.length < 1) {
    fail("authority-inventory.websiteDomain missing");
  }
}

if (identity && evidence["open-work.json"] && evidence["library-pins.json"]) {
  const digest = computeProfileDigest(evidence);
  if (identity.profileDigest === "PENDING") {
    fail(`identity.profileDigest is PENDING; expected ${digest}`);
  } else if (identity.profileDigest !== digest) {
    fail(`identity.profileDigest stale/mismatched: got ${identity.profileDigest}, expected ${digest}`);
  }
}

if (failures.length > 0) {
  process.stderr.write(`FAIL: profile-v2 baseline validator\n${failures.map((item) => `- ${item}`).join("\n")}\n`);
  process.exit(1);
}

process.stdout.write(
  `PASS: profile-v2 baseline evidence bound to ${EXPECTED_BASELINE_COMMIT} tree ${EXPECTED_BASELINE_TREE}\n`,
);
process.exit(0);

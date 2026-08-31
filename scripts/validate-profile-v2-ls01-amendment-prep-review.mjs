#!/usr/bin/env node
/**
 * Fail-closed independent-review validator for LS-01-PREP (issue 401).
 * Emits PASS only when this review packet binds the exact candidate, remains
 * a separate worker, does not mutate the candidate or unlock LS-01, and
 * stays scoped to owned review paths.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const EXPECTED_REPOSITORY = "linktrend/LiNKsites";
const EXPECTED_ORIGIN = "https://github.com/linktrend/LiNKsites";
const EXPECTED_DEVELOPMENT_COMMIT = "635a1032f6c72e17729645d4ff464a0fe182cbee";
const EXPECTED_DEVELOPMENT_TREE = "6317e1ed6454087bf3ed74c49899ffb155bca418";
const EXPECTED_ISSUE = 402;
const EXPECTED_ISSUE_BRANCH = "issue/402-independent-narrow-review-of-ls-01-prep-issue-40";
const EXPECTED_SUBJECT_COMMIT = "dc1147058001009f31c3665091703a227afe837f";
const EXPECTED_SUBJECT_TREE = "396f69ef443a6ec510f981ee3fc58301e4a5f58b";
const EXPECTED_IMPLEMENTER = "bc-061eb717-cf58-4d7f-8e99-75cdfb209305";
const EXPECTED_REVIEWER = "bc-ad843395-7f37-490a-a5e4-54017830eed9";
const FORBIDDEN_STATUS = new Set(["unknown", "PENDING", "pass", "PASS"]);
const REQUIRED_JSON = [
  "identity.json",
  "SUBJECT.json",
  "CHECKS.json",
  "FINDINGS.json",
  "VERDICT.json",
  "STATUS.json",
  "SCOPE.json",
];
const OWNED_PREFIXES = [
  "docs/evidence/profile-v2-ls01-amendment-prep-review/",
  "scripts/validate-profile-v2-ls01-amendment-prep-review.mjs",
];
const PROHIBITED_PREFIXES = [
  "packages/",
  "apps/",
  "supabase/migrations/",
  ".ide-development/",
  "docs/evidence/profile-v2-ls01-amendment-prep/",
  "scripts/validate-profile-v2-ls01-amendment-prep.mjs",
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
    for (const [key, value] of Object.entries(node)) {
      if (key === "status" && typeof value === "string" && FORBIDDEN_STATUS.has(value)) {
        fail(`${trail}.${key} has forbidden value ${value}`);
      }
      walkStatus(value, `${trail}.${key}`);
    }
  }
}

function isOwned(relPath) {
  return OWNED_PREFIXES.some(
    (prefix) => relPath === prefix.replace(/\/$/, "") || relPath.startsWith(prefix),
  );
}

function isProhibited(relPath) {
  return PROHIBITED_PREFIXES.some((prefix) => relPath.startsWith(prefix));
}

function computeProfileDigest(evidence) {
  const identity = { ...evidence["identity.json"] };
  delete identity.profileDigest;
  const parts = [`identity.json:${stableStringify(identity)}`];
  for (const name of REQUIRED_JSON.filter((item) => item !== "identity.json").sort()) {
    parts.push(`${name}:${stableStringify(evidence[name])}`);
  }
  return `sha256:${createHash("sha256").update(parts.join("\n")).digest("hex")}`;
}

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const evidenceDir = path.join(repoRoot, "docs/evidence/profile-v2-ls01-amendment-prep-review");
const evidence = {};

if (!fs.existsSync(evidenceDir)) {
  fail("evidence directory missing");
}

for (const name of REQUIRED_JSON) {
  const filePath = path.join(evidenceDir, name);
  if (!fs.existsSync(filePath)) {
    fail(`missing ${name}`);
    continue;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    evidence[name] = parsed;
    walkStatus(parsed, name);
  } catch (error) {
    fail(`unreadable ${name}: ${error.message}`);
  }
}

const identity = evidence["identity.json"];
if (identity) {
  if (identity.repository !== EXPECTED_REPOSITORY) fail("identity.repository mismatch");
  if (identity.normalizedOrigin !== EXPECTED_ORIGIN) fail("identity.normalizedOrigin mismatch");
  if (identity.githubIssue !== EXPECTED_ISSUE) fail("identity.githubIssue mismatch");
  if (identity.issueBranch !== EXPECTED_ISSUE_BRANCH) fail("identity.issueBranch mismatch");
  if (identity.protectedDevelopment?.commit !== EXPECTED_DEVELOPMENT_COMMIT) {
    fail("identity.protectedDevelopment.commit mismatch");
  }
  if (identity.protectedDevelopment?.tree !== EXPECTED_DEVELOPMENT_TREE) {
    fail("identity.protectedDevelopment.tree mismatch");
  }
  if (identity.ideDevelopment?.touched !== false) fail("identity.ideDevelopment.touched must be false");
  if (identity.ideDevelopment?.writeLease !== false) fail("identity.ideDevelopment.writeLease must be false");
  if (identity.reviewer?.worker !== EXPECTED_REVIEWER) fail("identity.reviewer.worker mismatch");
  if (identity.reviewer?.fast !== false) fail("identity.reviewer.fast must be false");
  if (identity.reviewer?.separateWorker !== true) fail("identity.reviewer.separateWorker must be true");
}

const subject = evidence["SUBJECT.json"];
if (subject) {
  if (subject.subject?.commit !== EXPECTED_SUBJECT_COMMIT) fail("SUBJECT commit mismatch");
  if (subject.subject?.tree !== EXPECTED_SUBJECT_TREE) fail("SUBJECT tree mismatch");
  if (subject.subject?.githubIssue !== 401) fail("SUBJECT githubIssue must be 401");
  if (subject.subject?.implementerWorker !== EXPECTED_IMPLEMENTER) {
    fail("SUBJECT implementerWorker mismatch");
  }
  if (subject.subject?.implementerWorker === EXPECTED_REVIEWER) {
    fail("self-review: implementerWorker equals reviewer");
  }
}

const remoteSubject = git(repoRoot, [
  "rev-parse",
  "origin/issue/401-prepare-ls-01-executable-manifest-amendment-inpu",
], { allowFailure: true });
if (remoteSubject && remoteSubject !== EXPECTED_SUBJECT_COMMIT) {
  fail(
    `origin issue/401 moved to ${remoteSubject}; this review binds ${EXPECTED_SUBJECT_COMMIT}`,
  );
}
const remoteSubjectTree = git(repoRoot, [
  "rev-parse",
  `${EXPECTED_SUBJECT_COMMIT}^{tree}`,
], { allowFailure: true });
if (remoteSubjectTree && remoteSubjectTree !== EXPECTED_SUBJECT_TREE) {
  fail(`subject tree drifted to ${remoteSubjectTree}`);
}

const checks = evidence["CHECKS.json"];
if (checks) {
  if (checks.fullSuite !== false) fail("CHECKS.fullSuite must be false");
  const prep = (checks.checks || []).find((row) => row.id === "prep-validator-on-exact-candidate");
  if (!prep || prep.exitCode !== 0) fail("prep validator check must be recorded with exitCode 0");
  if (!String(prep.stdout || "").includes("LS-01 remains locked")) {
    fail("prep validator stdout must record LS-01 remains locked");
  }
}

const findings = evidence["FINDINGS.json"];
if (findings) {
  const blocking = (findings.findings || []).filter((row) => row.blocking === true);
  if (blocking.length > 0) fail("blocking findings present; verdict cannot be accepted");
}

const verdict = evidence["VERDICT.json"];
if (verdict) {
  if (verdict.verdict !== "accepted") fail("VERDICT.verdict must be accepted");
  if (verdict.subjectCommit !== EXPECTED_SUBJECT_COMMIT) fail("VERDICT.subjectCommit mismatch");
  if (verdict.subjectTree !== EXPECTED_SUBJECT_TREE) fail("VERDICT.subjectTree mismatch");
  if (verdict.ls01Executable !== false) fail("VERDICT.ls01Executable must be false");
  if (verdict.dispatchAuthorized !== false) fail("VERDICT.dispatchAuthorized must be false");
  if (verdict.hc1aBound !== false) fail("VERDICT.hc1aBound must be false");
  if (verdict.selfReview !== false) fail("VERDICT.selfReview must be false");
  if (Array.isArray(verdict.requiredRework) && verdict.requiredRework.length > 0) {
    fail("VERDICT.requiredRework must be empty for accepted");
  }
}

const status = evidence["STATUS.json"];
if (status) {
  if (status.reviewComplete !== true) fail("STATUS.reviewComplete must be true");
  if (status.ls01Executable !== false) fail("STATUS.ls01Executable must be false");
  if (status.dispatchAuthorized !== false) fail("STATUS.dispatchAuthorized must be false");
  if (status.candidateMutated !== false) fail("STATUS.candidateMutated must be false");
  if (status.ideManagedFilesTouched !== false) fail("STATUS.ideManagedFilesTouched must be false");
}

const liveManifest = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "docs/architecture/linksites-profile-v2/EXECUTION-MANIFEST.json"), "utf8"),
);
const livePackets = (liveManifest.packets || []).map((row) => row.id);
if (livePackets.join(",") !== "LS-00") {
  fail(`live EXECUTION-MANIFEST packets drifted: ${livePackets.join(",")}`);
}
const liveRouting = JSON.parse(
  fs.readFileSync(path.join(repoRoot, "docs/architecture/linksites-profile-v2/MODEL-ROUTING-AUTHORITY.json"), "utf8"),
);
if (liveRouting.status !== "ROUTES_BOUND_DISPATCH_NOT_AUTHORIZED") {
  fail(`live routing status drifted: ${liveRouting.status}`);
}

const advertisedCommit = git(repoRoot, ["rev-parse", "origin/development"], { allowFailure: true });
if (advertisedCommit && advertisedCommit !== EXPECTED_DEVELOPMENT_COMMIT) {
  fail(
    `origin/development moved to ${advertisedCommit}; this packet is bound to ${EXPECTED_DEVELOPMENT_COMMIT}`,
  );
}
const advertisedTree = git(repoRoot, ["rev-parse", "origin/development^{tree}"], { allowFailure: true });
if (advertisedTree && advertisedTree !== EXPECTED_DEVELOPMENT_TREE) {
  fail(`origin/development tree moved to ${advertisedTree}; this packet is bound to ${EXPECTED_DEVELOPMENT_TREE}`);
}

const branch = git(repoRoot, ["branch", "--show-current"]);
if (branch && branch !== EXPECTED_ISSUE_BRANCH) {
  fail(`current branch is ${branch}, expected ${EXPECTED_ISSUE_BRANCH}`);
}

const changed = [
  ...git(repoRoot, ["diff", "--name-only", EXPECTED_DEVELOPMENT_COMMIT]).split("\n"),
  ...git(repoRoot, ["ls-files", "--others", "--exclude-standard"]).split("\n"),
].filter(Boolean);
for (const relPath of changed) {
  if (isProhibited(relPath)) {
    fail(`prohibited path changed: ${relPath}`);
    continue;
  }
  if (isOwned(relPath)) continue;
  fail(`out-of-scope path changed: ${relPath}`);
}

if (identity && subject && checks && findings && verdict && status) {
  const digest = computeProfileDigest(evidence);
  if (identity.profileDigest === "PENDING") {
    fail(`identity.profileDigest is PENDING; expected ${digest}`);
  } else if (identity.profileDigest !== digest) {
    fail(`identity.profileDigest stale/mismatched: got ${identity.profileDigest}, expected ${digest}`);
  }
}

if (failures.length > 0) {
  process.stderr.write(
    `FAIL: profile-v2 LS-01 amendment-prep independent-review validator\n${failures.map((item) => `- ${item}`).join("\n")}\n`,
  );
  process.exit(1);
}

process.stdout.write(
  `PASS: LS-01-PREP independent review of ${EXPECTED_SUBJECT_COMMIT} tree ${EXPECTED_SUBJECT_TREE}; LS-01 remains locked\n`,
);
process.exit(0);

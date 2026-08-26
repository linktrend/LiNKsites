#!/usr/bin/env node
/**
 * Fail-closed LS-11 release evidence scaffolding validator.
 * SCHEMA_OK / SCAFFOLDING_OK is not packet completion, production proof,
 * admission, or a founder main/publish/deploy authorization.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const PROTECTED_COMMIT = "02ebf5d8710c50c1f2c390989239f0baf916ba97";
export const PROTECTED_TREE = "fb427d30ea7c3e7060fc9cc1a63a1110266dd755";
export const EXPECTED_REPOSITORY = "linktrend/LiNKsites";
export const GITHUB_ISSUE = 361;
export const PACKET_ID = "LS-11";
export const PLACEHOLDER_LS10 = "FUTURE_LS10_CUTOVER_IDENTITY";
export const PLACEHOLDER_HARNESS = "FUTURE_HARNESS_H09_CONFORMANCE_IDENTITY";

export const OWNED_PREFIXES = [
  "docs/evidence/profile-v2-release/",
  "docs/releases/",
];

export const PROHIBITED_PREFIXES = [
  "packages/",
  "apps/",
  "deploy/",
  "execution/",
  "config/",
  "supabase/",
  "infra/",
  "tests/",
  "scripts/",
  ".github/",
];

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

const FORBIDDEN_MD_CLAIMS = [
  /\bls-11 is complete\b/i,
  /\bpacketCompletion["']?\s*:\s*true\b/,
  /\bpromoted to main\b/i,
  /\bthis release is published\b/i,
  /\bfounderAuthorized["']?\s*:\s*true\b/,
  /\bthis is production proof\b/i,
];

const SECRET_PATTERNS = [
  /-----BEGIN (?:RSA |OPENSSH |EC |DSA )?PRIVATE KEY-----/,
  /AKIA[0-9A-Z]{16}/,
  /ghp_[A-Za-z0-9]{20,}/,
  /github_pat_[A-Za-z0-9_]{20,}/,
  /sk_live_[A-Za-z0-9]{20,}/,
  /xox[baprs]-[A-Za-z0-9-]{20,}/,
  /(?:api[_-]?key|secret[_-]?key|password|access_token)\s*[:=]\s*['"][^'"]{16,}['"]/i,
];

export const LIVE_JSON = [
  { file: "STATUS.json", schema: "schemas/status.schema.json" },
  { file: "SCOPE.json", schema: "schemas/scope.schema.json" },
  { file: "DEPENDENCIES.json", schema: "schemas/dependencies.schema.json" },
  { file: "identity.json", schema: "schemas/identity.schema.json" },
  { file: "templates/exact-tree-review.json", schema: "schemas/exact-tree-review.schema.json" },
  { file: "templates/full-rollback-rehearsal.json", schema: "schemas/full-rollback-rehearsal.schema.json" },
  { file: "templates/receipt-binding.json", schema: "schemas/receipt-binding.schema.json" },
  { file: "templates/admission-release-handoff.json", schema: "schemas/admission-release-handoff.schema.json" },
  { file: "templates/founder-reserved-decisions.json", schema: "schemas/founder-reserved-decisions.schema.json" },
];

export const LIVE_MD = [
  "README.md",
  "PROOF.md",
  "checklists/ISS-34-independent-exact-tree-review.md",
  "checklists/ISS-35-full-rollback-receipt-binding.md",
  "checklists/ISS-36-admission-release-handoff.md",
];

export const RELEASE_FILES = ["README.md", "profile-v2-ls11-release.md", "STATUS.json"];

export const REQUIRED_HEADINGS = {
  "README.md": ["Owned paths", "Fail-closed validator"],
  "PROOF.md": ["What this proves", "What this does not prove"],
  "checklists/ISS-34-independent-exact-tree-review.md": ["Exact head", "Dimensions"],
  "checklists/ISS-35-full-rollback-receipt-binding.md": ["Full suite", "Receipt binding"],
  "checklists/ISS-36-admission-release-handoff.md": ["Founder-reserved"],
};

const SCHEMA_FILES = [
  "schemas/status.schema.json",
  "schemas/scope.schema.json",
  "schemas/dependencies.schema.json",
  "schemas/identity.schema.json",
  "schemas/exact-tree-review.schema.json",
  "schemas/full-rollback-rehearsal.schema.json",
  "schemas/receipt-binding.schema.json",
  "schemas/admission-release-handoff.schema.json",
  "schemas/founder-reserved-decisions.schema.json",
  "schemas/releases-status.schema.json",
  "schemas/checksums.schema.json",
];

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function failList() {
  return [];
}

function readJson(filePath, failures, label = filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    failures.push(`${label} is not parseable JSON: ${error.message}`);
    return null;
  }
}

function resolveRef(schema, root) {
  const ref = schema && schema.$ref;
  if (!ref) return schema;
  if (!ref.startsWith("#/")) {
    throw new Error(`unsupported $ref ${ref}`);
  }
  let cur = root;
  for (const part of ref.slice(2).split("/")) {
    if (!isObject(cur) || !Object.prototype.hasOwnProperty.call(cur, part)) {
      throw new Error(`unresolved $ref ${ref}`);
    }
    cur = cur[part];
  }
  return cur;
}

export function validateAgainstSchema(data, schema, pointer = "$", root = schema) {
  const failures = [];
  const resolved = resolveRef(schema, root);
  if (!isObject(resolved)) {
    return [`${pointer}: invalid schema`];
  }

  if (Object.prototype.hasOwnProperty.call(resolved, "const")) {
    if (data !== resolved.const) {
      failures.push(`${pointer} must equal ${JSON.stringify(resolved.const)}`);
    }
  }

  if (resolved.enum && !resolved.enum.includes(data)) {
    failures.push(`${pointer} must be one of ${resolved.enum.join(", ")}`);
  }

  if (resolved.type) {
    const types = Array.isArray(resolved.type) ? resolved.type : [resolved.type];
    if (!types.some((type) => matchesType(data, type))) {
      failures.push(`${pointer} must be type ${types.join("|")}`);
      return failures;
    }
  }

  if (resolved.pattern && typeof data === "string" && !new RegExp(resolved.pattern).test(data)) {
    failures.push(`${pointer} does not match pattern ${resolved.pattern}`);
  }
  if (resolved.minLength && typeof data === "string" && data.length < resolved.minLength) {
    failures.push(`${pointer} is shorter than ${resolved.minLength}`);
  }

  if (resolved.type === "object" || isObject(data)) {
    if (isObject(data)) {
      const required = resolved.required || [];
      for (const key of required) {
        if (!Object.prototype.hasOwnProperty.call(data, key)) {
          failures.push(`${pointer}.${key} is required`);
        }
      }
      const properties = resolved.properties || {};
      for (const [key, value] of Object.entries(data)) {
        if (properties[key]) {
          failures.push(
            ...validateAgainstSchema(value, properties[key], `${pointer}.${key}`, root),
          );
        } else if (resolved.additionalProperties === false) {
          failures.push(`${pointer}.${key} is not allowed`);
        }
      }
    }
  }

  if (Array.isArray(data) && resolved.items) {
    if (Number.isInteger(resolved.minItems) && data.length < resolved.minItems) {
      failures.push(`${pointer} must have at least ${resolved.minItems} items`);
    }
    if (Number.isInteger(resolved.maxItems) && data.length > resolved.maxItems) {
      failures.push(`${pointer} must have at most ${resolved.maxItems} items`);
    }
    if (resolved.uniqueItems) {
      const seen = new Set(data.map((item) => JSON.stringify(item)));
      if (seen.size !== data.length) failures.push(`${pointer} items must be unique`);
    }
    data.forEach((item, index) => {
      failures.push(
        ...validateAgainstSchema(item, resolved.items, `${pointer}[${index}]`, root),
      );
    });
  }

  return failures;
}

function matchesType(data, type) {
  switch (type) {
    case "object":
      return isObject(data);
    case "array":
      return Array.isArray(data);
    case "string":
      return typeof data === "string";
    case "number":
      return typeof data === "number" && !Number.isNaN(data);
    case "integer":
      return Number.isInteger(data);
    case "boolean":
      return typeof data === "boolean";
    case "null":
      return data === null;
    default:
      return false;
  }
}

function walk(node, trail, visit) {
  visit(trail, node);
  if (Array.isArray(node)) {
    node.forEach((item, index) => walk(item, `${trail}[${index}]`, visit));
    return;
  }
  if (isObject(node)) {
    for (const [key, child] of Object.entries(node)) {
      walk(child, `${trail}.${key}`, visit);
    }
  }
}

function rejectForbiddenIdentities(label, node, failures) {
  walk(node, label, (trail, value) => {
    if (typeof value !== "string") return;
    if (FORBIDDEN_IDENTITY_TOKENS.has(value.trim())) {
      failures.push(`${trail} uses a forbidden identity token`);
    }
  });
}

function rejectTrueCompletionClaims(label, node, failures) {
  const forbiddenTrue = new Set([
    "packetCompletion",
    "ls11Complete",
    "exactTreeReviewComplete",
    "fullSuiteRun",
    "rollbackRehearsalRun",
    "receiptsBound",
    "admitted",
    "released",
    "handedOff",
    "promoted",
    "productionProof",
    "hostedProof",
    "founderAuthorized",
    "mainPublished",
    "productionDeployed",
    "releasePublished",
    "reviewRun",
    "bound",
    "satisfied",
    "authorized",
    "executed",
    "granted",
  ]);
  walk(node, label, (trail, value) => {
    const key = trail.split(".").pop();
    if (forbiddenTrue.has(key) && value === true) {
      failures.push(`${trail} must remain false on scaffolding`);
    }
  });
}

function sha256File(filePath) {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

export function checksumTargets(evidenceDir, releasesDir) {
  const files = [
    ...LIVE_JSON.map((row) => row.file),
    ...LIVE_MD,
    ...SCHEMA_FILES,
    "validators/validate-ls11-release-evidence.mjs",
    "validators/validate-ls11-release-evidence.test.mjs",
  ].map((relative) => ({
    path: `docs/evidence/profile-v2-release/${relative}`,
    abs: path.join(evidenceDir, relative),
  }));
  for (const relative of RELEASE_FILES) {
    files.push({
      path: `docs/releases/${relative}`,
      abs: path.join(releasesDir, relative),
    });
  }
  files.sort((a, b) => a.path.localeCompare(b.path));
  return files;
}

export function buildChecksums(evidenceDir, releasesDir) {
  const files = checksumTargets(evidenceDir, releasesDir).map((entry) => ({
    path: entry.path,
    sha256: sha256File(entry.abs),
  }));
  const packageDigest = `sha256:${createHash("sha256")
    .update(files.map((row) => `${row.path}:${row.sha256}`).join("\n"))
    .digest("hex")}`;
  return {
    schemaVersion: 1,
    kind: "ls11-release-checksums",
    algorithm: "sha256",
    packetId: PACKET_ID,
    githubIssue: GITHUB_ISSUE,
    protectedDevelopment: {
      commit: PROTECTED_COMMIT,
      tree: PROTECTED_TREE,
    },
    packageDigest,
    files,
  };
}

function git(repoRoot, args, { allowFailure = false } = {}) {
  try {
    return execFileSync("git", args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    if (allowFailure) return "";
    throw new Error(`git ${args.join(" ")} failed: ${error.stderr || error.message}`);
  }
}

export function isOwnedPath(relPath) {
  return OWNED_PREFIXES.some((prefix) => relPath === prefix.slice(0, -1) || relPath.startsWith(prefix));
}

export function isProhibitedPath(relPath) {
  return PROHIBITED_PREFIXES.some((prefix) => relPath === prefix.slice(0, -1) || relPath.startsWith(prefix));
}

function validateMarkdown(filePath, relative, failures) {
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`unreadable markdown ${relative}: ${error.message}`);
    return;
  }
  if (!text.trim()) {
    failures.push(`${relative} is empty`);
    return;
  }
  const headings = REQUIRED_HEADINGS[relative];
  if (headings) {
    for (const heading of headings) {
      if (!text.includes(heading)) {
        failures.push(`${relative} missing required heading or phrase: ${heading}`);
      }
    }
  }
  for (const claim of FORBIDDEN_MD_CLAIMS) {
    if (claim.test(text)) {
      failures.push(`${relative} contains forbidden completion/publish claim: ${claim}`);
    }
  }
}

function scanSecrets(filePath, relative, failures) {
  let text;
  try {
    text = fs.readFileSync(filePath, "utf8");
  } catch (error) {
    failures.push(`unreadable for secret scan ${relative}: ${error.message}`);
    return;
  }
  for (const pattern of SECRET_PATTERNS) {
    if (pattern.test(text)) {
      failures.push(`${relative} matches secret pattern ${pattern}`);
    }
  }
}

function validateFuturePlaceholders(dependencies, bindings, failures) {
  const depIds = new Map(dependencies.map((row) => [row.id, row]));
  const ls10 = depIds.get("ls10-cutover");
  const harness = depIds.get("harness-h09-conformance");
  if (!ls10 || ls10.placeholderId !== PLACEHOLDER_LS10) {
    failures.push("LS-10 dependency placeholder is missing or misnamed");
  }
  if (!harness || harness.placeholderId !== PLACEHOLDER_HARNESS) {
    failures.push("Harness H-09 dependency placeholder is missing or misnamed");
  }
  for (const row of [...dependencies, ...bindings]) {
    if (row.bindingState !== "future-placeholder") {
      failures.push(`${row.id || row.placeholderId} bindingState must be future-placeholder`);
    }
    if (row.commit !== null || row.tree !== null) {
      failures.push(`${row.id || row.placeholderId} commit/tree must stay null until a future exact identity exists`);
    }
    if (row.satisfied === true || row.bound === true) {
      failures.push(`${row.id || row.placeholderId} must not be marked satisfied/bound`);
    }
  }
}

export function validateEvidenceDirs(evidenceDir, releasesDir, repoRoot) {
  const failures = failList();
  const required = [
    ...LIVE_JSON.map((row) => row.file),
    ...LIVE_MD,
    ...SCHEMA_FILES,
    "SHA256SUMS.json",
    "validators/validate-ls11-release-evidence.mjs",
    "validators/validate-ls11-release-evidence.test.mjs",
  ];
  for (const relative of required) {
    if (!fs.existsSync(path.join(evidenceDir, relative))) {
      failures.push(`missing ${relative}`);
    }
  }
  for (const relative of RELEASE_FILES) {
    if (!fs.existsSync(path.join(releasesDir, relative))) {
      failures.push(`missing docs/releases/${relative}`);
    }
  }
  if (failures.length) return { ok: false, failures };

  const documents = {};
  for (const row of LIVE_JSON) {
    const schema = readJson(path.join(evidenceDir, row.schema), failures, row.schema);
    const data = readJson(path.join(evidenceDir, row.file), failures, row.file);
    documents[row.file] = data;
    if (schema && data) {
      failures.push(...validateAgainstSchema(data, schema).map((msg) => `${row.file}: ${msg}`));
    }
  }

  const releasesSchema = readJson(
    path.join(evidenceDir, "schemas/releases-status.schema.json"),
    failures,
    "schemas/releases-status.schema.json",
  );
  const releasesStatus = readJson(path.join(releasesDir, "STATUS.json"), failures, "docs/releases/STATUS.json");
  if (releasesSchema && releasesStatus) {
    failures.push(
      ...validateAgainstSchema(releasesStatus, releasesSchema).map((msg) => `docs/releases/STATUS.json: ${msg}`),
    );
  }

  const checksumSchema = readJson(
    path.join(evidenceDir, "schemas/checksums.schema.json"),
    failures,
    "schemas/checksums.schema.json",
  );
  const checksums = readJson(path.join(evidenceDir, "SHA256SUMS.json"), failures, "SHA256SUMS.json");
  if (checksumSchema && checksums) {
    failures.push(...validateAgainstSchema(checksums, checksumSchema).map((msg) => `SHA256SUMS.json: ${msg}`));
  }

  for (const file of Object.values(documents)) {
    if (file) {
      rejectForbiddenIdentities("evidence", file, failures);
      rejectTrueCompletionClaims("evidence", file, failures);
    }
  }
  if (releasesStatus) {
    rejectForbiddenIdentities("releases", releasesStatus, failures);
    rejectTrueCompletionClaims("releases", releasesStatus, failures);
  }

  if (documents["DEPENDENCIES.json"] && documents["templates/receipt-binding.json"]) {
    validateFuturePlaceholders(
      documents["DEPENDENCIES.json"].dependencies || [],
      documents["templates/receipt-binding.json"].bindings || [],
      failures,
    );
  }

  for (const relative of LIVE_MD) {
    validateMarkdown(path.join(evidenceDir, relative), relative, failures);
    scanSecrets(path.join(evidenceDir, relative), relative, failures);
  }
  validateMarkdown(path.join(releasesDir, "README.md"), "docs/releases/README.md", failures);
  validateMarkdown(
    path.join(releasesDir, "profile-v2-ls11-release.md"),
    "docs/releases/profile-v2-ls11-release.md",
    failures,
  );

  const scanJson = [
    ...LIVE_JSON.map((row) => path.join(evidenceDir, row.file)),
    path.join(releasesDir, "STATUS.json"),
    ...SCHEMA_FILES.map((relative) => path.join(evidenceDir, relative)),
  ];
  for (const abs of scanJson) {
    scanSecrets(abs, path.relative(repoRoot, abs), failures);
  }

  const expected = buildChecksums(evidenceDir, releasesDir);
  if (checksums) {
    if (checksums.packageDigest !== expected.packageDigest) {
      failures.push(
        `packageDigest mismatch: recorded ${checksums.packageDigest} computed ${expected.packageDigest}`,
      );
    }
    const recorded = new Map((checksums.files || []).map((row) => [row.path, row.sha256]));
    for (const row of expected.files) {
      if (recorded.get(row.path) !== row.sha256) {
        failures.push(`digest mismatch for ${row.path}`);
      }
    }
  }

  try {
    const tracked = git(repoRoot, ["diff", "--name-only", PROTECTED_COMMIT]);
    const untracked = git(repoRoot, ["ls-files", "--others", "--exclude-standard"]);
    const names = [...tracked.split("\n"), ...untracked.split("\n")].filter(Boolean);
    for (const name of names) {
      if (!isOwnedPath(name)) {
        failures.push(`scope violation: ${name} is outside owned LS-11 paths`);
      }
      if (isProhibitedPath(name)) {
        failures.push(`prohibited path modified: ${name}`);
      }
    }
    git(repoRoot, ["diff", "--check", PROTECTED_COMMIT]);
  } catch (error) {
    failures.push(String(error.message || error));
  }

  return { ok: failures.length === 0, failures };
}

export function writeChecksums(evidenceDir, releasesDir) {
  const payload = buildChecksums(evidenceDir, releasesDir);
  fs.writeFileSync(
    path.join(evidenceDir, "SHA256SUMS.json"),
    `${JSON.stringify(payload, null, 2)}\n`,
    "utf8",
  );
  return payload;
}

function parseArgs(argv) {
  const options = { dir: null, releasesDir: null, writeChecksums: false };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--dir") options.dir = argv[++i];
    else if (arg === "--releases-dir") options.releasesDir = argv[++i];
    else if (arg === "--write-checksums") options.writeChecksums = true;
    else if (arg === "--help") options.help = true;
    else options.unknown = arg;
  }
  return options;
}

function defaultRepoRoot(start) {
  let cur = path.resolve(start);
  while (cur !== path.dirname(cur)) {
    if (fs.existsSync(path.join(cur, ".git"))) return cur;
    cur = path.dirname(cur);
  }
  return path.resolve(start);
}

function main(argv = process.argv.slice(2)) {
  const options = parseArgs(argv);
  if (options.help || options.unknown) {
    process.stderr.write(
      "usage: validate-ls11-release-evidence.mjs --dir <evidence-dir> --releases-dir <releases-dir> [--write-checksums]\n",
    );
    process.exitCode = options.help ? 0 : 2;
    return;
  }
  if (!options.dir || !options.releasesDir) {
    process.stderr.write("FAIL: pass --dir and --releases-dir\n");
    process.exitCode = 2;
    return;
  }
  const evidenceDir = path.resolve(options.dir);
  const releasesDir = path.resolve(options.releasesDir);
  const repoRoot = defaultRepoRoot(evidenceDir);
  if (options.writeChecksums) writeChecksums(evidenceDir, releasesDir);
  const result = validateEvidenceDirs(evidenceDir, releasesDir, repoRoot);
  if (!result.ok) {
    for (const failure of result.failures) process.stderr.write(`FAIL: ${failure}\n`);
    process.exitCode = 1;
    return;
  }
  process.stdout.write(
    "LS-11 release evidence scaffolding: SCAFFOLDING_OK packetCompletion=false ls11Complete=false\n",
  );
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) main();

import { HARNESS_PIN } from "./pin.ts";
import type {
  CompatibilityDeclaration,
  IssueRecord,
  ModuleRecord,
  PhaseRecord,
  ProfileRecord,
  ProgramRecord,
  ValidationFailure,
  ValidationResult,
} from "./types.ts";

const ID = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$/;
const SEMVER = /^(0|[1-9][0-9]{0,2})\.(0|[1-9][0-9]{0,2})\.(0|[1-9][0-9]{0,2})$/;
const RANGE = /^>=\d+\.\d+\.\d+ <\d+\.\d+\.\d+$|^\^\d+\.\d+\.\d+$/;
const INSTANT = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/;
const SHA256 = /^sha256:[0-9a-f]{64}$/;
const SHA40 = /^[0-9a-f]{40}$/;
const REPO = /^[^/\s]+\/[^/\s]+$/;
const WEBSITE_FIELD = /cms|payload|nextjs|react|seo|hosting|template|pagefamily|jsonld|executorlanes|providerbinding/i;

const IDENTITY_KEYS = new Set(["identityType", "id", "version", "digest"]);
const ACTOR_KEYS = new Set(["identity", "role"]);
const BINDING_KEYS = new Set(["repository", "commit", "tree", "artifactDigest", "profileDigest"]);
const PROGRAM_KEYS = new Set([
  "identity",
  "profileId",
  "compatibleHarnessRange",
  "moduleIds",
  "budgetIds",
  "createdAt",
  "updatedAt",
  "actor",
  "binding",
  "domainPayload",
]);
const MODULE_KEYS = new Set(["identity", "programId", "phaseIds", "dependsOn", "createdAt", "updatedAt", "actor", "domainPayload"]);
const PHASE_KEYS = new Set(["identity", "programId", "moduleId", "issueIds", "gateIds", "createdAt", "updatedAt", "actor", "domainPayload"]);
const ISSUE_KEYS = new Set([
  "identity",
  "programId",
  "moduleId",
  "phaseId",
  "ownedResources",
  "dependsOn",
  "createdAt",
  "updatedAt",
  "actor",
  "domainPayload",
]);
const PROFILE_KEYS = new Set([
  "identity",
  "compatibleHarnessRange",
  "program",
  "modules",
  "phases",
  "issues",
  "adapters",
  "redaction",
  "compatibility",
  "domainPayload",
]);
const ADAPTER_KEYS = new Set(["adapterId", "contractVersion"]);
const REDACTION_KEYS = new Set(["deniedPaths"]);
const COMPAT_KEYS = new Set(["contractName", "contractVersion", "compatibleRange", "migrations"]);
const MIGRATION_KEYS = new Set(["from", "to", "breaking", "handlerId"]);

export class ProfileValidationError extends Error {
  readonly failures: ValidationFailure[];
  constructor(failures: ValidationFailure[]) {
    super(failures.map((item) => `${item.code}@${item.path}: ${item.message}`).join("; "));
    this.name = "ProfileValidationError";
    this.failures = failures;
  }
}

function fail(failures: ValidationFailure[], code: string, path: string, message: string): void {
  failures.push({ code, path, message });
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function closedKeys(failures: ValidationFailure[], path: string, value: Record<string, unknown>, allowed: Set<string>): void {
  for (const key of Object.keys(value)) {
    if (!allowed.has(key)) fail(failures, "unknown_field", `${path}.${key}`, `closed contract rejects ${key}`);
    if (key !== "domainPayload" && WEBSITE_FIELD.test(key)) {
      fail(failures, "website_field_on_universal", `${path}.${key}`, "website fields cannot sit on universal records");
    }
  }
}

function identity(failures: ValidationFailure[], path: string, value: unknown, expectedType: string): void {
  if (!isObject(value)) {
    fail(failures, "invalid_shape", path, "identity must be an object");
    return;
  }
  closedKeys(failures, path, value, IDENTITY_KEYS);
  if (value.identityType !== expectedType) fail(failures, "identity_type", `${path}.identityType`, `expected ${expectedType}`);
  if (typeof value.id !== "string" || !ID.test(value.id)) fail(failures, "invalid_id", `${path}.id`, "id is closed");
  if (typeof value.version !== "string" || !SEMVER.test(value.version)) fail(failures, "invalid_semver", `${path}.version`, "version is closed semver");
  if (value.digest !== undefined && (typeof value.digest !== "string" || !SHA256.test(value.digest))) {
    fail(failures, "invalid_digest", `${path}.digest`, "digest must be sha256:<64 hex>");
  }
}

function actor(failures: ValidationFailure[], path: string, value: unknown): void {
  if (!isObject(value)) {
    fail(failures, "invalid_shape", path, "actor must be an object");
    return;
  }
  closedKeys(failures, path, value, ACTOR_KEYS);
  identity(failures, `${path}.identity`, value.identity, "actor");
  if (value.role !== undefined && !["principal", "executor", "system", "profile"].includes(String(value.role))) {
    fail(failures, "invalid_role", `${path}.role`, "role is closed");
  }
}

function stringList(failures: ValidationFailure[], path: string, value: unknown, pattern?: RegExp, min = 0): string[] {
  if (!Array.isArray(value) || value.length < min) {
    fail(failures, "invalid_list", path, `expected unique list with min ${min}`);
    return [];
  }
  const seen = new Set<string>();
  const items: string[] = [];
  for (const [index, item] of value.entries()) {
    if (typeof item !== "string" || (pattern && !pattern.test(item))) {
      fail(failures, "invalid_list_item", `${path}[${index}]`, "list item rejected");
      continue;
    }
    if (seen.has(item)) fail(failures, "duplicate", `${path}[${index}]`, "values must be unique");
    seen.add(item);
    items.push(item);
  }
  return items;
}

function timestamps(failures: ValidationFailure[], path: string, createdAt: unknown, updatedAt: unknown): void {
  if (typeof createdAt !== "string" || !INSTANT.test(createdAt)) fail(failures, "invalid_time", `${path}.createdAt`, "instant required");
  if (typeof updatedAt !== "string" || !INSTANT.test(updatedAt)) fail(failures, "invalid_time", `${path}.updatedAt`, "instant required");
}

function program(failures: ValidationFailure[], value: unknown): ProgramRecord | null {
  if (!isObject(value)) {
    fail(failures, "invalid_shape", "program", "program must be an object");
    return null;
  }
  closedKeys(failures, "program", value, PROGRAM_KEYS);
  identity(failures, "program.identity", value.identity, "program");
  if (typeof value.profileId !== "string" || !ID.test(value.profileId)) fail(failures, "invalid_id", "program.profileId", "profileId required");
  if (typeof value.compatibleHarnessRange !== "string" || !RANGE.test(value.compatibleHarnessRange)) {
    fail(failures, "invalid_range", "program.compatibleHarnessRange", "range required");
  }
  stringList(failures, "program.moduleIds", value.moduleIds, ID, 1);
  stringList(failures, "program.budgetIds", value.budgetIds, ID);
  timestamps(failures, "program", value.createdAt, value.updatedAt);
  actor(failures, "program.actor", value.actor);
  if (value.binding !== undefined) {
    if (!isObject(value.binding)) fail(failures, "invalid_shape", "program.binding", "binding must be an object");
    else {
      closedKeys(failures, "program.binding", value.binding, BINDING_KEYS);
      if (value.binding.repository !== undefined && (typeof value.binding.repository !== "string" || !REPO.test(value.binding.repository))) {
        fail(failures, "invalid_repository", "program.binding.repository", "owner/name required");
      }
      if (value.binding.commit !== undefined && (typeof value.binding.commit !== "string" || !SHA40.test(value.binding.commit))) {
        fail(failures, "invalid_commit", "program.binding.commit", "40-hex commit");
      }
      if (value.binding.tree !== undefined && (typeof value.binding.tree !== "string" || !SHA40.test(value.binding.tree))) {
        fail(failures, "invalid_tree", "program.binding.tree", "40-hex tree");
      }
    }
  }
  return value as unknown as ProgramRecord;
}

function moduleRecord(failures: ValidationFailure[], path: string, value: unknown): ModuleRecord | null {
  if (!isObject(value)) {
    fail(failures, "invalid_shape", path, "module must be an object");
    return null;
  }
  closedKeys(failures, path, value, MODULE_KEYS);
  identity(failures, `${path}.identity`, value.identity, "module");
  if (typeof value.programId !== "string" || !ID.test(value.programId)) fail(failures, "invalid_id", `${path}.programId`, "programId required");
  stringList(failures, `${path}.phaseIds`, value.phaseIds, ID, 1);
  if (value.dependsOn !== undefined) stringList(failures, `${path}.dependsOn`, value.dependsOn, ID);
  timestamps(failures, path, value.createdAt, value.updatedAt);
  actor(failures, `${path}.actor`, value.actor);
  return value as unknown as ModuleRecord;
}

function phaseRecord(failures: ValidationFailure[], path: string, value: unknown): PhaseRecord | null {
  if (!isObject(value)) {
    fail(failures, "invalid_shape", path, "phase must be an object");
    return null;
  }
  closedKeys(failures, path, value, PHASE_KEYS);
  identity(failures, `${path}.identity`, value.identity, "phase");
  for (const field of ["programId", "moduleId"] as const) {
    if (typeof value[field] !== "string" || !ID.test(String(value[field]))) fail(failures, "invalid_id", `${path}.${field}`, `${field} required`);
  }
  stringList(failures, `${path}.issueIds`, value.issueIds, ID, 1);
  stringList(failures, `${path}.gateIds`, value.gateIds, ID);
  timestamps(failures, path, value.createdAt, value.updatedAt);
  actor(failures, `${path}.actor`, value.actor);
  return value as unknown as PhaseRecord;
}

function issueRecord(failures: ValidationFailure[], path: string, value: unknown): IssueRecord | null {
  if (!isObject(value)) {
    fail(failures, "invalid_shape", path, "issue must be an object");
    return null;
  }
  closedKeys(failures, path, value, ISSUE_KEYS);
  identity(failures, `${path}.identity`, value.identity, "issue");
  for (const field of ["programId", "moduleId", "phaseId"] as const) {
    if (typeof value[field] !== "string" || !ID.test(String(value[field]))) fail(failures, "invalid_id", `${path}.${field}`, `${field} required`);
  }
  stringList(failures, `${path}.ownedResources`, value.ownedResources);
  stringList(failures, `${path}.dependsOn`, value.dependsOn, ID);
  timestamps(failures, path, value.createdAt, value.updatedAt);
  actor(failures, `${path}.actor`, value.actor);
  return value as unknown as IssueRecord;
}

function compatibility(failures: ValidationFailure[], value: unknown): CompatibilityDeclaration | null {
  if (!isObject(value)) {
    fail(failures, "invalid_shape", "compatibility", "compatibility must be an object");
    return null;
  }
  closedKeys(failures, "compatibility", value, COMPAT_KEYS);
  if (value.contractName !== HARNESS_PIN.contractsPackage) {
    fail(failures, "unknown_contract", "compatibility.contractName", "must bind HC1-A contracts package");
  }
  if (value.contractVersion !== HARNESS_PIN.contractsVersion) {
    fail(failures, "contract_version", "compatibility.contractVersion", "must equal 0.1.0");
  }
  if (typeof value.compatibleRange !== "string" || !RANGE.test(value.compatibleRange)) {
    fail(failures, "invalid_range", "compatibility.compatibleRange", "range required");
  }
  if (!Array.isArray(value.migrations)) fail(failures, "invalid_list", "compatibility.migrations", "migrations required");
  else {
    for (const [index, step] of value.migrations.entries()) {
      if (!isObject(step)) {
        fail(failures, "invalid_shape", `compatibility.migrations[${index}]`, "migration must be an object");
        continue;
      }
      closedKeys(failures, `compatibility.migrations[${index}]`, step, MIGRATION_KEYS);
    }
  }
  return value as unknown as CompatibilityDeclaration;
}

export function validateProfile(input: unknown): ValidationResult {
  const failures: ValidationFailure[] = [];
  if (!isObject(input)) {
    return { ok: false, failures: [{ code: "invalid_shape", path: "$", message: "profile must be an object" }] };
  }
  closedKeys(failures, "$", input, PROFILE_KEYS);
  identity(failures, "identity", input.identity, "profile");
  if (typeof input.compatibleHarnessRange !== "string" || !RANGE.test(input.compatibleHarnessRange)) {
    fail(failures, "invalid_range", "compatibleHarnessRange", "range required");
  }
  if (input.compatibleHarnessRange !== HARNESS_PIN.compatibleRange) {
    fail(failures, "harness_range", "compatibleHarnessRange", "must equal HC1-A range >=0.1.0 <0.2.0");
  }
  const programRecord = program(failures, input.program);
  if (!Array.isArray(input.modules) || input.modules.length < 1) fail(failures, "invalid_list", "modules", "at least one module");
  if (!Array.isArray(input.phases) || input.phases.length < 1) fail(failures, "invalid_list", "phases", "at least one phase");
  if (!Array.isArray(input.issues) || input.issues.length < 1) fail(failures, "invalid_list", "issues", "at least one issue");
  const modules = Array.isArray(input.modules)
    ? (input.modules.map((item, index) => moduleRecord(failures, `modules[${index}]`, item)).filter(Boolean) as ModuleRecord[])
    : [];
  const phases = Array.isArray(input.phases)
    ? (input.phases.map((item, index) => phaseRecord(failures, `phases[${index}]`, item)).filter(Boolean) as PhaseRecord[])
    : [];
  const issues = Array.isArray(input.issues)
    ? (input.issues.map((item, index) => issueRecord(failures, `issues[${index}]`, item)).filter(Boolean) as IssueRecord[])
    : [];

  if (!Array.isArray(input.adapters)) fail(failures, "invalid_list", "adapters", "adapters required");
  else {
    for (const [index, adapter] of input.adapters.entries()) {
      if (!isObject(adapter)) fail(failures, "invalid_shape", `adapters[${index}]`, "adapter ref required");
      else {
        closedKeys(failures, `adapters[${index}]`, adapter, ADAPTER_KEYS);
        if (typeof adapter.adapterId !== "string" || !ID.test(adapter.adapterId)) {
          fail(failures, "invalid_id", `adapters[${index}].adapterId`, "adapterId required");
        }
        if (typeof adapter.contractVersion !== "string" || !SEMVER.test(adapter.contractVersion)) {
          fail(failures, "invalid_semver", `adapters[${index}].contractVersion`, "contractVersion required");
        }
      }
    }
    if (!input.adapters.some((item) => isObject(item) && item.adapterId === "process")) {
      fail(failures, "missing_process_adapter", "adapters", "process adapter must be enabled");
    }
  }

  if (!isObject(input.redaction)) fail(failures, "invalid_shape", "redaction", "redaction required");
  else {
    closedKeys(failures, "redaction", input.redaction, REDACTION_KEYS);
    stringList(failures, "redaction.deniedPaths", input.redaction.deniedPaths);
    const denied = Array.isArray(input.redaction.deniedPaths) ? input.redaction.deniedPaths : [];
    if (!denied.includes("secret") || !denied.includes("credential")) {
      fail(failures, "redaction_paths", "redaction.deniedPaths", "secret and credential must be denied");
    }
  }

  compatibility(failures, input.compatibility);

  if (programRecord) {
    const moduleIds = new Set(modules.map((item) => item.identity.id));
    if (programRecord.moduleIds.length !== modules.length) {
      fail(failures, "module_mismatch", "program.moduleIds", "must match modules exactly");
    }
    for (const id of programRecord.moduleIds) {
      if (!moduleIds.has(id)) fail(failures, "dangling_issue", "program.moduleIds", `unknown module ${id}`);
    }
    if (programRecord.profileId !== (isObject(input.identity) ? input.identity.id : "")) {
      fail(failures, "profile_mismatch", "program.profileId", "must equal profile identity id");
    }
    if (programRecord.compatibleHarnessRange !== input.compatibleHarnessRange) {
      fail(failures, "range_mismatch", "program.compatibleHarnessRange", "must match profile range");
    }
  }

  const phaseIds = new Set(phases.map((item) => item.identity.id));
  const issueIds = new Set(issues.map((item) => item.identity.id));
  for (const module of modules) {
    for (const phaseId of module.phaseIds) {
      if (!phaseIds.has(phaseId)) fail(failures, "dangling_issue", `module:${module.identity.id}`, `unknown phase ${phaseId}`);
    }
  }
  for (const phase of phases) {
    for (const issueId of phase.issueIds) {
      if (!issueIds.has(issueId)) fail(failures, "dangling_issue", `phase:${phase.identity.id}`, `unknown issue ${issueId}`);
    }
    if (!modules.some((item) => item.identity.id === phase.moduleId)) {
      fail(failures, "dangling_issue", `phase:${phase.identity.id}`, `unknown module ${phase.moduleId}`);
    }
  }
  for (const issue of issues) {
    if (!modules.some((item) => item.identity.id === issue.moduleId)) {
      fail(failures, "dangling_issue", `issue:${issue.identity.id}`, `unknown module ${issue.moduleId}`);
    }
    if (!phaseIds.has(issue.phaseId)) fail(failures, "dangling_issue", `issue:${issue.identity.id}`, `unknown phase ${issue.phaseId}`);
    for (const dep of issue.dependsOn) {
      if (!issueIds.has(dep)) fail(failures, "dangling_issue", `issue:${issue.identity.id}`, `unknown dependency ${dep}`);
    }
  }

  if (input.domainPayload !== undefined && !isObject(input.domainPayload)) {
    fail(failures, "invalid_shape", "domainPayload", "domainPayload must be an object");
  }

  return { ok: failures.length === 0, failures };
}

export function assertValidProfile(input: unknown): ProfileRecord {
  const result = validateProfile(input);
  if (!result.ok) throw new ProfileValidationError(result.failures);
  return input as ProfileRecord;
}

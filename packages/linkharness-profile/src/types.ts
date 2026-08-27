export type IdentityType =
  | "program"
  | "module"
  | "phase"
  | "issue"
  | "program_run"
  | "issue_run"
  | "attempt"
  | "executor"
  | "gate"
  | "evidence"
  | "approval"
  | "budget"
  | "profile"
  | "lease"
  | "lock"
  | "heartbeat"
  | "dispatch_intent"
  | "actor";

export interface ExactIdentity {
  identityType: IdentityType;
  id: string;
  version: string;
  digest?: string;
}

export interface ExactBinding {
  repository?: string;
  commit?: string;
  tree?: string;
  artifactDigest?: string;
  profileDigest?: string;
}

export interface Actor {
  identity: ExactIdentity;
  role?: "principal" | "executor" | "system" | "profile";
}

export interface ProgramRecord {
  identity: ExactIdentity;
  profileId: string;
  compatibleHarnessRange: string;
  moduleIds: string[];
  budgetIds: string[];
  createdAt: string;
  updatedAt: string;
  actor: Actor;
  binding?: ExactBinding;
  domainPayload?: Record<string, unknown>;
}

export interface ModuleRecord {
  identity: ExactIdentity;
  programId: string;
  phaseIds: string[];
  dependsOn?: string[];
  createdAt: string;
  updatedAt: string;
  actor: Actor;
  domainPayload?: Record<string, unknown>;
}

export interface PhaseRecord {
  identity: ExactIdentity;
  programId: string;
  moduleId: string;
  issueIds: string[];
  gateIds: string[];
  createdAt: string;
  updatedAt: string;
  actor: Actor;
  domainPayload?: Record<string, unknown>;
}

export interface IssueRecord {
  identity: ExactIdentity;
  programId: string;
  moduleId: string;
  phaseId: string;
  ownedResources: string[];
  dependsOn: string[];
  createdAt: string;
  updatedAt: string;
  actor: Actor;
  domainPayload?: Record<string, unknown>;
}

export interface AdapterRef {
  adapterId: string;
  contractVersion: string;
}

export interface RedactionBoundary {
  deniedPaths: string[];
}

export interface MigrationDeclaration {
  from: string;
  to: string;
  breaking: boolean;
  handlerId: string;
}

export interface CompatibilityDeclaration {
  contractName: string;
  contractVersion: string;
  compatibleRange: string;
  migrations: MigrationDeclaration[];
}

export interface ProfileRecord {
  identity: ExactIdentity;
  compatibleHarnessRange: string;
  program: ProgramRecord;
  modules: ModuleRecord[];
  phases: PhaseRecord[];
  issues: IssueRecord[];
  adapters: AdapterRef[];
  redaction: RedactionBoundary;
  compatibility: CompatibilityDeclaration;
  domainPayload?: Record<string, unknown>;
}

export interface ProfilePort {
  identity(): ExactIdentity;
  compatibleHarnessRange(): string;
  definition(): ProfileRecord;
  enabledAdapters(): readonly AdapterRef[];
  redaction(): RedactionBoundary;
  compatibility(): CompatibilityDeclaration;
}

export interface ConfigurationRedactionPort {
  deniedPaths(): readonly string[];
  redact(value: unknown, path?: string): unknown;
}

export type ProofLevel = "assertion" | "command" | "artifact" | "replica" | "independent";
export type TrustClass = "deterministic" | "tool" | "agent" | "human" | "subprogram";
export type SiteLifecycle = "draft" | "preview" | "published" | "retired" | "rolled_back";

export interface ExecutorLane {
  laneId: string;
  adapterId: string;
  trustClass: TrustClass;
  enabled: boolean;
}

export interface ProviderBinding {
  repository: string;
  productId: string;
  planningCommit: string;
  planningTree: string;
  consumerCommit: string;
  consumerTree: string;
  selectable: boolean;
  bytesCopied: boolean;
  lifecycle: "draft";
}

export interface DomainGate {
  gateId: string;
  proofLevel: ProofLevel;
  reserved: boolean;
  approvalAction?: string;
}

export interface TransitionMapper {
  from: SiteLifecycle;
  to: SiteLifecycle;
  issueId: string;
  evidenceKind: string;
}

export interface EvidenceMapper {
  domainVerdict: string;
  proofLevel: ProofLevel;
  subjectKind: string;
}

export interface ValidationFailure {
  code: string;
  path: string;
  message: string;
}

export interface ValidationResult {
  ok: boolean;
  failures: ValidationFailure[];
}

export interface WebsiteDomainPayload {
  kind: "linksites.website_profile";
  packet: string;
  issues: readonly string[];
  executorLanes: readonly ExecutorLane[];
  providerBinding: ProviderBinding;
  domainGates: readonly DomainGate[];
  reservedApprovals: readonly string[];
  siteTransitionMappers: readonly TransitionMapper[];
  evidenceMappers: readonly EvidenceMapper[];
  configuration: {
    requiredEnv: readonly string[];
    optionalEnv: readonly string[];
    currentGenericRuntimeActive: boolean;
  };
  readiness: {
    cutoverPacket: string;
    currentGenericRuntimeActive: boolean;
  };
  migration: {
    fromAuthority: string;
    toAuthority: string;
    breaking: boolean;
    handlerId: string;
    rollbackKeepsCurrentRuntime: boolean;
  };
}

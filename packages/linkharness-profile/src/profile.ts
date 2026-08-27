import {
  CUTOVER_PACKET,
  HARNESS_PIN,
  LIBRARY_PIN,
  PACKET_ID,
  PACKET_ISSUES,
  PROFILE_CLOCK,
  PROFILE_IDENTITY,
  PROGRAM_IDENTITY,
} from "./pin.ts";
import type {
  Actor,
  DomainGate,
  EvidenceMapper,
  ExecutorLane,
  IssueRecord,
  ModuleRecord,
  PhaseRecord,
  ProfileRecord,
  TransitionMapper,
  WebsiteDomainPayload,
} from "./types.ts";

const actor: Actor = {
  identity: { identityType: "actor", id: "linksites-profile-authority", version: "0.1.0" },
  role: "profile",
};

function stamp<T extends object>(value: T): T & { createdAt: string; updatedAt: string; actor: Actor } {
  return { ...value, createdAt: PROFILE_CLOCK, updatedAt: PROFILE_CLOCK, actor };
}

export const RESERVED_APPROVALS = Object.freeze([
  "main_promote",
  "publish_release",
  "deploy_production",
  "github_protection_change",
  "provider_live_mutation",
] as const);

export const EXECUTOR_LANES: readonly ExecutorLane[] = Object.freeze([
  { laneId: "process", adapterId: "process", trustClass: "deterministic", enabled: true },
  { laneId: "tool", adapterId: "tool", trustClass: "tool", enabled: false },
  { laneId: "agent", adapterId: "agent", trustClass: "agent", enabled: false },
  { laneId: "human", adapterId: "human", trustClass: "human", enabled: false },
  { laneId: "subprogram", adapterId: "subprogram", trustClass: "subprogram", enabled: false },
]);

export const DOMAIN_GATES: readonly DomainGate[] = Object.freeze([
  { gateId: "gate-semantic-coverage", proofLevel: "command", reserved: false },
  { gateId: "gate-privacy-consent", proofLevel: "artifact", reserved: false },
  { gateId: "gate-provider-integrity", proofLevel: "artifact", reserved: false },
  { gateId: "gate-publish-production", proofLevel: "independent", reserved: true, approvalAction: "publish_release" },
  { gateId: "gate-main-promote", proofLevel: "independent", reserved: true, approvalAction: "main_promote" },
  { gateId: "gate-deploy-production", proofLevel: "independent", reserved: true, approvalAction: "deploy_production" },
  { gateId: "gate-github-protection-change", proofLevel: "independent", reserved: true, approvalAction: "github_protection_change" },
  { gateId: "gate-provider-live-mutation", proofLevel: "independent", reserved: true, approvalAction: "provider_live_mutation" },
]);

export const SITE_TRANSITION_MAPPERS: readonly TransitionMapper[] = Object.freeze([
  { from: "draft", to: "preview", issueId: "issue-assembly", evidenceKind: "assembly_receipt" },
  { from: "preview", to: "published", issueId: "issue-hosting", evidenceKind: "publish_receipt" },
  { from: "published", to: "retired", issueId: "issue-pin-migrate", evidenceKind: "retirement_receipt" },
  { from: "published", to: "rolled_back", issueId: "issue-pin-migrate", evidenceKind: "rollback_receipt" },
  { from: "preview", to: "rolled_back", issueId: "issue-pin-migrate", evidenceKind: "rollback_receipt" },
]);

export const EVIDENCE_MAPPERS: readonly EvidenceMapper[] = Object.freeze([
  { domainVerdict: "semantic_coverage", proofLevel: "command", subjectKind: "issue" },
  { domainVerdict: "privacy_consent", proofLevel: "artifact", subjectKind: "issue" },
  { domainVerdict: "provider_integrity", proofLevel: "artifact", subjectKind: "issue" },
  { domainVerdict: "publish", proofLevel: "independent", subjectKind: "gate" },
  { domainVerdict: "rollback", proofLevel: "artifact", subjectKind: "issue" },
]);

function issue(
  id: string,
  moduleId: string,
  phaseId: string,
  ownedResources: string[],
  dependsOn: string[],
): IssueRecord {
  return stamp({
    identity: { identityType: "issue" as const, id, version: "0.1.0" },
    programId: PROGRAM_IDENTITY.id,
    moduleId,
    phaseId,
    ownedResources,
    dependsOn,
  });
}

const modules: ModuleRecord[] = [
  stamp({
    identity: { identityType: "module" as const, id: "mod-site-definition", version: "0.1.0" },
    programId: PROGRAM_IDENTITY.id,
    phaseIds: ["phase-specify-and-assemble"],
    dependsOn: [],
  }),
  stamp({
    identity: { identityType: "module" as const, id: "mod-content-runtime", version: "0.1.0" },
    programId: PROGRAM_IDENTITY.id,
    phaseIds: ["phase-author-and-promote"],
    dependsOn: ["mod-site-definition"],
  }),
  stamp({
    identity: { identityType: "module" as const, id: "mod-provider-web", version: "0.1.0" },
    programId: PROGRAM_IDENTITY.id,
    phaseIds: ["phase-adapt-and-render"],
    dependsOn: ["mod-content-runtime"],
  }),
  stamp({
    identity: { identityType: "module" as const, id: "mod-site-lifecycle", version: "0.1.0" },
    programId: PROGRAM_IDENTITY.id,
    phaseIds: ["phase-operate-and-prove"],
    dependsOn: ["mod-provider-web"],
  }),
];

const phases: PhaseRecord[] = [
  stamp({
    identity: { identityType: "phase" as const, id: "phase-specify-and-assemble", version: "0.1.0" },
    programId: PROGRAM_IDENTITY.id,
    moduleId: "mod-site-definition",
    issueIds: ["issue-site-spec", "issue-entitlement", "issue-assembly"],
    gateIds: ["gate-semantic-coverage"],
  }),
  stamp({
    identity: { identityType: "phase" as const, id: "phase-author-and-promote", version: "0.1.0" },
    programId: PROGRAM_IDENTITY.id,
    moduleId: "mod-content-runtime",
    issueIds: ["issue-working-content", "issue-cms-models", "issue-promotion"],
    gateIds: ["gate-privacy-consent"],
  }),
  stamp({
    identity: { identityType: "phase" as const, id: "phase-adapt-and-render", version: "0.1.0" },
    programId: PROGRAM_IDENTITY.id,
    moduleId: "mod-provider-web",
    issueIds: ["issue-provider-adapter", "issue-web-render", "issue-projections"],
    gateIds: ["gate-provider-integrity"],
  }),
  stamp({
    identity: { identityType: "phase" as const, id: "phase-operate-and-prove", version: "0.1.0" },
    programId: PROGRAM_IDENTITY.id,
    moduleId: "mod-site-lifecycle",
    issueIds: ["issue-pin-migrate", "issue-hosting", "issue-evidence"],
    gateIds: ["gate-publish-production"],
  }),
];

const issues: IssueRecord[] = [
  issue("issue-site-spec", "mod-site-definition", "phase-specify-and-assemble", ["resource:site-specification"], []),
  issue("issue-entitlement", "mod-site-definition", "phase-specify-and-assemble", ["resource:entitlement"], ["issue-site-spec"]),
  issue("issue-assembly", "mod-site-definition", "phase-specify-and-assemble", ["resource:assembly-manifest"], ["issue-entitlement"]),
  issue("issue-working-content", "mod-content-runtime", "phase-author-and-promote", ["resource:working-content"], ["issue-assembly"]),
  issue("issue-cms-models", "mod-content-runtime", "phase-author-and-promote", ["resource:content-models"], ["issue-working-content"]),
  issue("issue-promotion", "mod-content-runtime", "phase-author-and-promote", ["resource:content-promotion"], ["issue-cms-models"]),
  issue("issue-provider-adapter", "mod-provider-web", "phase-adapt-and-render", ["resource:provider-adapter"], ["issue-promotion"]),
  issue("issue-web-render", "mod-provider-web", "phase-adapt-and-render", ["resource:web-render"], ["issue-provider-adapter"]),
  issue("issue-projections", "mod-provider-web", "phase-adapt-and-render", ["resource:projections"], ["issue-web-render"]),
  issue("issue-pin-migrate", "mod-site-lifecycle", "phase-operate-and-prove", ["resource:pin-migrate"], ["issue-projections"]),
  issue("issue-hosting", "mod-site-lifecycle", "phase-operate-and-prove", ["resource:hosting"], ["issue-pin-migrate"]),
  issue("issue-evidence", "mod-site-lifecycle", "phase-operate-and-prove", ["resource:evidence"], ["issue-hosting"]),
];

export const LINKSITES_DOMAIN_PAYLOAD: WebsiteDomainPayload = Object.freeze({
  kind: "linksites.website_profile",
  packet: PACKET_ID,
  issues: [...PACKET_ISSUES],
  executorLanes: EXECUTOR_LANES,
  providerBinding: {
    repository: LIBRARY_PIN.repository,
    productId: LIBRARY_PIN.productId,
    planningCommit: LIBRARY_PIN.planningCommit,
    planningTree: LIBRARY_PIN.planningTree,
    consumerCommit: LIBRARY_PIN.consumerCommit,
    consumerTree: LIBRARY_PIN.consumerTree,
    selectable: LIBRARY_PIN.selectable,
    bytesCopied: LIBRARY_PIN.bytesCopied,
    lifecycle: LIBRARY_PIN.lifecycle,
  },
  domainGates: DOMAIN_GATES,
  reservedApprovals: RESERVED_APPROVALS,
  siteTransitionMappers: SITE_TRANSITION_MAPPERS,
  evidenceMappers: EVIDENCE_MAPPERS,
  configuration: {
    requiredEnv: ["NODE_ENV"],
    optionalEnv: ["LINKSITES_HARNESS_CONTRACTS"],
    currentGenericRuntimeActive: true,
  },
  readiness: {
    cutoverPacket: CUTOVER_PACKET,
    currentGenericRuntimeActive: true,
  },
  migration: {
    fromAuthority: "packages/program-ledger",
    toAuthority: "@linksites/profile",
    breaking: false,
    handlerId: "ls01-profile-compat-facade",
    rollbackKeepsCurrentRuntime: true,
  },
});

export function createLinksitesProfile(): ProfileRecord {
  return {
    identity: { ...PROFILE_IDENTITY },
    compatibleHarnessRange: HARNESS_PIN.compatibleRange,
    program: stamp({
      identity: { ...PROGRAM_IDENTITY },
      profileId: PROFILE_IDENTITY.id,
      compatibleHarnessRange: HARNESS_PIN.compatibleRange,
      moduleIds: modules.map((item) => item.identity.id),
      budgetIds: ["budget-tokens", "budget-elapsed", "budget-currency"],
      binding: { repository: "linktrend/LiNKsites" },
    }),
    modules: modules.map((item) => ({ ...item, phaseIds: [...item.phaseIds], dependsOn: [...(item.dependsOn ?? [])] })),
    phases: phases.map((item) => ({ ...item, issueIds: [...item.issueIds], gateIds: [...item.gateIds] })),
    issues: issues.map((item) => ({
      ...item,
      ownedResources: [...item.ownedResources],
      dependsOn: [...item.dependsOn],
    })),
    adapters: [{ adapterId: "process", contractVersion: "0.1.0" }],
    redaction: { deniedPaths: ["secret", "credential"] },
    compatibility: {
      contractName: HARNESS_PIN.contractsPackage,
      contractVersion: HARNESS_PIN.contractsVersion,
      compatibleRange: HARNESS_PIN.compatibleRange,
      migrations: [],
    },
    domainPayload: structuredClone(LINKSITES_DOMAIN_PAYLOAD) as unknown as Record<string, unknown>,
  };
}

export const LINKSITES_PROFILE: ProfileRecord = createLinksitesProfile();

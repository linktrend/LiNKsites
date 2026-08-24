import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { describe, it } from "node:test";
import {
  HARNESS_PIN,
  LIBRARY_PIN,
  LINKSITES_PROFILE,
  MIGRATION_PLAN,
  PACKET_ID,
  PACKET_ISSUES,
  RESERVED_APPROVALS,
  assertValidProfile,
  createConfigurationRedactionPort,
  createLinksitesProfilePort,
  evaluateReadiness,
  evidenceMapper,
  nextPacketKeepsGenericRuntime,
  siteTransitionMapper,
  validateProfile,
} from "../src/index.ts";
import type { ProfileRecord, WebsiteDomainPayload } from "../src/types.ts";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");

function cloneProfile(): ProfileRecord {
  return structuredClone(LINKSITES_PROFILE);
}

function domainPayload(): WebsiteDomainPayload {
  return LINKSITES_PROFILE.domainPayload as unknown as WebsiteDomainPayload;
}

describe("LS-01 harness pin", () => {
  it("pins exact HC1-A commit, tree, and range", () => {
    assert.equal(HARNESS_PIN.label, "HC1-A");
    assert.equal(HARNESS_PIN.commit, "de0abe31736e878aad3447bf4b720a40142d8a6e");
    assert.equal(HARNESS_PIN.tree, "526cc9ab8feec3ae95089639f03f0382b9878e63");
    assert.equal(HARNESS_PIN.contractsPackage, "@linktrend/linkharness-contracts");
    assert.equal(HARNESS_PIN.contractsVersion, "0.1.0");
    assert.equal(HARNESS_PIN.compatibleRange, ">=0.1.0 <0.2.0");
    assert.equal(HARNESS_PIN.copyPolicy, "do_not_copy_harness_source");
  });

  it("optionally checks a sibling LiNKharness pin object", () => {
    const sibling = "/agent/repos/LiNKharness";
    if (!existsSync(`${sibling}/.git`)) {
      return;
    }
    const commit = execFileSync("git", ["rev-parse", `${HARNESS_PIN.commit}^{commit}`], {
      cwd: sibling,
      encoding: "utf8",
    }).trim();
    const tree = execFileSync("git", ["rev-parse", `${HARNESS_PIN.commit}^{tree}`], {
      cwd: sibling,
      encoding: "utf8",
    }).trim();
    assert.equal(commit, HARNESS_PIN.commit);
    assert.equal(tree, HARNESS_PIN.tree);
  });
});

describe("LS-01 profile composition", () => {
  it("exports a valid Profile v2 composition", () => {
    const result = validateProfile(LINKSITES_PROFILE);
    assert.equal(result.ok, true, JSON.stringify(result.failures));
    assertValidProfile(LINKSITES_PROFILE);
    assert.equal(PACKET_ID, "LS-01");
    assert.deepEqual(PACKET_ISSUES, ["ISS-04", "ISS-05", "ISS-06"]);
    assert.equal(LINKSITES_PROFILE.identity.identityType, "profile");
    assert.equal(LINKSITES_PROFILE.identity.id, "linksites-profile");
    assert.equal(LINKSITES_PROFILE.compatibleHarnessRange, ">=0.1.0 <0.2.0");
    assert.equal(LINKSITES_PROFILE.program.identity.identityType, "program");
    assert.equal(LINKSITES_PROFILE.modules.length, 4);
    assert.equal(LINKSITES_PROFILE.phases.length, 4);
    assert.equal(LINKSITES_PROFILE.issues.length, 12);
    assert.equal(LINKSITES_PROFILE.adapters[0]?.adapterId, "process");
  });

  it("rejects unknown fields", () => {
    const invalid = cloneProfile() as ProfileRecord & { extra?: string };
    invalid.extra = "no";
    const result = validateProfile(invalid);
    assert.equal(result.ok, false);
    assert.ok(result.failures.some((failure) => failure.code === "unknown_field"));
  });

  it("rejects website fields on universal records", () => {
    const invalid = cloneProfile();
    (invalid.program as ProfileRecord["program"] & { executorLanes?: unknown }).executorLanes = [];
    const result = validateProfile(invalid);
    assert.equal(result.ok, false);
    assert.ok(result.failures.some((failure) => failure.code === "website_field_on_universal"));
  });

  it("rejects broken referential integrity", () => {
    const invalid = cloneProfile();
    invalid.program.moduleIds = [...invalid.program.moduleIds, "mod-missing"];
    const result = validateProfile(invalid);
    assert.equal(result.ok, false);
    assert.ok(result.failures.some((failure) => failure.code === "dangling_issue"));
  });

  it("enables only the process executor lane", () => {
    const lanes = domainPayload().executorLanes;
    assert.equal(lanes.find((lane) => lane.laneId === "process")?.enabled, true);
    for (const lane of lanes.filter((item) => item.laneId !== "process")) {
      assert.equal(lane.enabled, false);
    }
  });

  it("keeps library and provider bytes uncopied", () => {
    assert.equal(LIBRARY_PIN.planningCommit, "f25b385c1e34d958834ce4b7e085ab454a956918");
    assert.equal(LIBRARY_PIN.planningTree, "626828346c8a4841c8ae95ac6b4fa9af4941f1fb");
    assert.equal(LIBRARY_PIN.consumerCommit, "6b87993ddaf403aebe7bef97bd268a543a1d14eb");
    assert.equal(LIBRARY_PIN.consumerTree, "a2bf0d2e7759e5e6952dacfdeab3ef9b03657d3d");
    assert.equal(LIBRARY_PIN.productId, "master-template-type-1");
    assert.equal(LIBRARY_PIN.bytesCopied, false);
    assert.equal(domainPayload().providerBinding.bytesCopied, false);
  });

  it("reserves the five website approvals", () => {
    assert.deepEqual(RESERVED_APPROVALS, [
      "main_promote",
      "publish_release",
      "deploy_production",
      "github_protection_change",
      "provider_live_mutation",
    ]);
  });
});

describe("LS-01 ports and mappers", () => {
  it("implements ProfilePort against the composed profile", () => {
    const port = createLinksitesProfilePort();
    assert.equal(port.identity().id, "linksites-profile");
    assert.equal(port.compatibleHarnessRange(), ">=0.1.0 <0.2.0");
    assert.equal(port.definition().identity.id, "linksites-profile");
    assert.deepEqual(port.enabledAdapters(), [{ adapterId: "process", contractVersion: "0.1.0" }]);
    assert.deepEqual(port.redaction().deniedPaths, ["secret", "credential"]);
    assert.equal(port.compatibility().contractName, "@linktrend/linkharness-contracts");
  });

  it("maps site transitions and evidence kinds", () => {
    assert.equal(siteTransitionMapper(LINKSITES_PROFILE, "draft", "preview")?.issueId, "issue-assembly");
    assert.equal(siteTransitionMapper(LINKSITES_PROFILE, "preview", "published")?.issueId, "issue-hosting");
    assert.equal(evidenceMapper(LINKSITES_PROFILE, "rollback")?.proofLevel, "artifact");
  });

  it("redacts denied configuration paths", () => {
    const redaction = createConfigurationRedactionPort();
    assert.equal(redaction.redact("token", "secret.token"), "[REDACTED]");
    assert.equal(redaction.redact("ok", "public.name"), "ok");
    assert.deepEqual(redaction.deniedPaths(), ["secret", "credential"]);
  });
});

describe("LS-01 migration and readiness", () => {
  it("keeps the current generic runtime until LS-10", () => {
    assert.equal(MIGRATION_PLAN.cutoverPacket, "LS-10");
    assert.equal(MIGRATION_PLAN.rollbackKeepsCurrentRuntime, true);
    assert.equal(nextPacketKeepsGenericRuntime("LS-02"), true);
    assert.equal(nextPacketKeepsGenericRuntime("LS-10"), false);
  });

  it("reports readiness without claiming cutover", () => {
    const readiness = evaluateReadiness(
      LINKSITES_PROFILE,
      REPO_ROOT,
      existsSync("/agent/repos/LiNKharness/.git") ? "/agent/repos/LiNKharness" : undefined,
    );
    assert.equal(readiness.profileValid, true);
    assert.equal(readiness.ls00Preserved, true);
    assert.equal(readiness.genericRuntimeUntilPacket, "LS-10");
    assert.equal(readiness.processLaneOnly, true);
    assert.equal(readiness.providerBytesCopied, false);
    if (existsSync("/agent/repos/LiNKharness/.git")) {
      assert.equal(readiness.siblingHarnessPin.matches, true);
    }
  });
});

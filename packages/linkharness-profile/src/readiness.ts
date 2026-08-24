import { existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";
import { CUTOVER_PACKET, HARNESS_PIN, LS00_EVIDENCE } from "./pin.ts";
import { LINKSITES_PROFILE } from "./profile.ts";
import type { ProfileRecord, WebsiteDomainPayload } from "./types.ts";
import { validateProfile } from "./validate.ts";

export type ReadinessReport = {
  profileValid: boolean;
  ls00Preserved: boolean;
  harnessRange: string;
  processLaneOnly: boolean;
  providerBytesCopied: false;
  genericRuntimeUntilPacket: typeof CUTOVER_PACKET;
  siblingHarnessPin: { checked: boolean; matches?: boolean; commit?: string; tree?: string };
};

export function ls00IdentityPresent(repoRoot: string): boolean {
  return existsSync(resolve(repoRoot, LS00_EVIDENCE.identityPath));
}

export function siblingHarnessPin(harnessRoot: string): { matches: boolean; commit: string; tree: string } {
  const commit = execFileSync("git", ["-C", harnessRoot, "rev-parse", `${HARNESS_PIN.commit}^{commit}`], {
    encoding: "utf8",
  }).trim();
  const tree = execFileSync("git", ["-C", harnessRoot, "rev-parse", `${HARNESS_PIN.commit}^{tree}`], {
    encoding: "utf8",
  }).trim();
  return {
    matches: commit === HARNESS_PIN.commit && tree === HARNESS_PIN.tree,
    commit,
    tree,
  };
}

export function evaluateReadiness(
  profile: ProfileRecord = LINKSITES_PROFILE,
  repoRoot: string = process.cwd(),
  harnessRoot: string | undefined = existsSync("/agent/repos/LiNKharness/.git")
    ? "/agent/repos/LiNKharness"
    : undefined,
): ReadinessReport {
  const domain = profile.domainPayload as unknown as WebsiteDomainPayload;
  const sibling = harnessRoot ? { checked: true, ...siblingHarnessPin(harnessRoot) } : { checked: false };
  return {
    profileValid: validateProfile(profile).ok,
    ls00Preserved: ls00IdentityPresent(repoRoot),
    harnessRange: HARNESS_PIN.compatibleRange,
    processLaneOnly:
      profile.adapters.every((adapter) => adapter.adapterId === "process") &&
      domain.executorLanes.filter((lane) => lane.enabled).every((lane) => lane.laneId === "process"),
    providerBytesCopied: false,
    genericRuntimeUntilPacket: CUTOVER_PACKET,
    siblingHarnessPin: sibling,
  };
}

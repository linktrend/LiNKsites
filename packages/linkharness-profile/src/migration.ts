import { CUTOVER_PACKET } from "./pin.ts";

export const CURRENT_GENERIC_RUNTIME = "program-ledger+program-orchestrator+execution" as const;

export type MigrationPlan = {
  currentRuntime: typeof CURRENT_GENERIC_RUNTIME;
  targetProfile: "@linksites/profile";
  cutoverPacket: typeof CUTOVER_PACKET;
  rollbackKeepsCurrentRuntime: true;
  steps: readonly string[];
};

export function nextPacketKeepsGenericRuntime(packet: string): boolean {
  return packet !== CUTOVER_PACKET;
}

export const MIGRATION_PLAN: MigrationPlan = {
  currentRuntime: CURRENT_GENERIC_RUNTIME,
  targetProfile: "@linksites/profile",
  cutoverPacket: CUTOVER_PACKET,
  rollbackKeepsCurrentRuntime: true,
  steps: [
    "Keep packages/program-ledger, apps/program-orchestrator, and execution as the live runtime until LS-10.",
    "Bind HC1-A contracts by pin only; do not copy Harness source.",
    "Keep @linksites/profile as the Profile boundary and do not swap runtime owners in this packet.",
    "Rollback restores this pin and Profile package and leaves the generic runtime in place.",
  ],
};

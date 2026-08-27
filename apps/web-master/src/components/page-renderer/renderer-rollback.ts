import { createHash } from "node:crypto";

import { FAMILY_IDS } from "@/lib/routes";
import {
  LAYOUT_COMPOSITIONS,
  type LayoutPackId,
  type PlanId,
} from "@/components/page-renderer/layout-packs";
import { resolveShell } from "@/components/shell/resolved-shell";

export const IMPLEMENTATION_CONFIGURATION_SCHEMA =
  "ls06-implementation-renderer-configuration/v1" as const;
export const IMPLEMENTATION_ROLLBACK_SCHEMA = "ls06-implementation-rollback/v1" as const;

export class RendererRollbackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RendererRollbackError";
  }
}

export type ImplementationRendererConfiguration = Readonly<{
  schemaVersion: typeof IMPLEMENTATION_CONFIGURATION_SCHEMA;
  mode: "implementation";
  layoutPackId: LayoutPackId;
  planId: PlanId;
  shellId: string;
  noPlaceholders: true;
  typeLIsolation: true;
  typeLShellMode: "isolated" | "not-applicable";
  families: readonly string[];
  compositions: typeof LAYOUT_COMPOSITIONS;
}>;

export type ImplementationRollbackPlan = Readonly<{
  schemaVersion: typeof IMPLEMENTATION_ROLLBACK_SCHEMA;
  mode: "implementation";
  restoreWithoutProviderCheckout: true;
  readbackRequired: true;
  mutatesRuntime: false;
  distinctFromPreparationRollback: true;
  previous: Readonly<{
    rendererConfigurationDigest: string;
  }>;
  current: Readonly<{
    rendererConfigurationDigest: string;
  }>;
}>;

const canonical = (value: unknown): string => {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(canonical).join(",")}]`;
  const rec = value as Record<string, unknown>;
  return `{${Object.keys(rec)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonical(rec[key])}`)
    .join(",")}}`;
};

export function rendererConfigurationDigest(configuration: ImplementationRendererConfiguration): string {
  const hex = createHash("sha256").update(canonical(configuration), "utf8").digest("hex");
  return `sha256:${hex}`;
}

export function buildImplementationRendererConfiguration(input: {
  layoutPackId: LayoutPackId;
  planId: PlanId;
  locale: string;
}): ImplementationRendererConfiguration {
  const shell = resolveShell({ locale: input.locale, planId: input.planId });
  return Object.freeze({
    schemaVersion: IMPLEMENTATION_CONFIGURATION_SCHEMA,
    mode: "implementation",
    layoutPackId: input.layoutPackId,
    planId: input.planId,
    shellId: shell.typeLShellMode === "isolated" ? "type-l-isolated-shell" : "marketing-shell",
    noPlaceholders: true,
    typeLIsolation: true,
    typeLShellMode: shell.typeLShellMode,
    families: FAMILY_IDS,
    compositions: LAYOUT_COMPOSITIONS,
  });
}

export function buildImplementationRollbackPlan(input: {
  previousDigest: string;
  configuration: ImplementationRendererConfiguration;
}): ImplementationRollbackPlan {
  if (!input.previousDigest.startsWith("sha256:") || input.previousDigest.length !== 71) {
    throw new RendererRollbackError("fail closed: previous renderer configuration digest is absent");
  }
  const currentDigest = rendererConfigurationDigest(input.configuration);
  return Object.freeze({
    schemaVersion: IMPLEMENTATION_ROLLBACK_SCHEMA,
    mode: "implementation",
    restoreWithoutProviderCheckout: true,
    readbackRequired: true,
    mutatesRuntime: false,
    distinctFromPreparationRollback: true,
    previous: Object.freeze({ rendererConfigurationDigest: input.previousDigest }),
    current: Object.freeze({ rendererConfigurationDigest: currentDigest }),
  });
}

export function readbackRendererConfiguration(
  configuration: ImplementationRendererConfiguration,
  expectedDigest: string,
): string {
  const actual = rendererConfigurationDigest(configuration);
  if (actual !== expectedDigest) {
    throw new RendererRollbackError(
      `fail closed: renderer configuration digest readback mismatch (expected ${expectedDigest}, got ${actual})`,
    );
  }
  return actual;
}

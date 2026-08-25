export const LAYOUT_PACK_IDS = ["A1", "A2", "A3"] as const;
export type LayoutPackId = (typeof LAYOUT_PACK_IDS)[number];

export const PLAN_IDS = ["A", "B", "C", "L"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

export const REQUIRED_SHELL_REGIONS = ["site-header", "main", "site-footer"] as const;
export type ShellRegion = (typeof REQUIRED_SHELL_REGIONS)[number] | "aside" | "secondary";

export type LayoutComposition = Readonly<{
  pageRenderer: string;
  regions: readonly ShellRegion[];
  architectureReady: boolean;
}>;

export const LAYOUT_COMPOSITIONS: Readonly<Record<LayoutPackId, LayoutComposition>> = Object.freeze({
  A1: Object.freeze({
    pageRenderer: "composition-a1-linear-shell",
    regions: Object.freeze(["site-header", "main", "site-footer"] as const),
    architectureReady: false,
  }),
  A2: Object.freeze({
    pageRenderer: "composition-a2-split-shell",
    regions: Object.freeze(["site-header", "aside", "main", "site-footer"] as const),
    architectureReady: true,
  }),
  A3: Object.freeze({
    pageRenderer: "composition-a3-stacked-shell",
    regions: Object.freeze(["site-header", "main", "secondary", "site-footer"] as const),
    architectureReady: true,
  }),
});

export class LayoutPackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LayoutPackError";
  }
}

const isLayoutPackId = (value: unknown): value is LayoutPackId =>
  typeof value === "string" && (LAYOUT_PACK_IDS as readonly string[]).includes(value);

const isPlanId = (value: unknown): value is PlanId =>
  typeof value === "string" && (PLAN_IDS as readonly string[]).includes(value);

export type LayoutRuntime = Readonly<{
  layoutPackId: LayoutPackId;
  planId: PlanId;
  composition: LayoutComposition;
}>;

export function resolveLayoutRuntime(input: {
  layoutPackId?: unknown;
  planId?: unknown;
} = {}): LayoutRuntime {
  const layoutPackId = input.layoutPackId == null || input.layoutPackId === "" ? "A1" : input.layoutPackId;
  const planId = input.planId == null || input.planId === "" ? "A" : input.planId;
  if (!isLayoutPackId(layoutPackId)) {
    throw new LayoutPackError(`Unknown required layout pack "${String(layoutPackId)}"`);
  }
  if (!isPlanId(planId)) {
    throw new LayoutPackError(`Unknown required plan "${String(planId)}"`);
  }
  return {
    layoutPackId,
    planId,
    composition: LAYOUT_COMPOSITIONS[layoutPackId],
  };
}

export function assertStructurallyDistinctCompositions(
  compositions: Readonly<Record<LayoutPackId, LayoutComposition>> = LAYOUT_COMPOSITIONS,
): void {
  const rendererIds = LAYOUT_PACK_IDS.map((pack) => compositions[pack].pageRenderer);
  const regionSignatures = LAYOUT_PACK_IDS.map((pack) => compositions[pack].regions.join("|"));
  if (new Set(rendererIds).size !== rendererIds.length) {
    throw new LayoutPackError("A1/A2/A3 pageRenderer identities are not structurally distinct");
  }
  if (new Set(regionSignatures).size !== regionSignatures.length) {
    throw new LayoutPackError("A1/A2/A3 region sets are not structurally distinct");
  }
  for (const pack of LAYOUT_PACK_IDS) {
    for (const region of REQUIRED_SHELL_REGIONS) {
      if (!compositions[pack].regions.includes(region)) {
        throw new LayoutPackError(`${pack} is missing required region ${region}`);
      }
    }
  }
  if (compositions.A2.architectureReady !== true || compositions.A3.architectureReady !== true) {
    throw new LayoutPackError("A2 and A3 must be architecture-ready");
  }
}

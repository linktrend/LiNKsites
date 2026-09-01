import { LayoutPackError, type LayoutPackId } from "@/components/page-renderer/layout-packs";

export const RESPONSIVE_LAYOUT_MODES = ["compact", "wide"] as const;
export type ResponsiveLayoutMode = (typeof RESPONSIVE_LAYOUT_MODES)[number];

export type ResponsiveLayoutDecision = Readonly<{
  layoutPackId: LayoutPackId;
  mode: ResponsiveLayoutMode;
  asideVisible: boolean;
  columns: 1 | 2;
}>;

const WIDE_VIEWPORT_MIN_PX = 1024;
const MAX_SUPPORTED_VIEWPORT_PX = 16_384;

/** Pure viewport contract used by server/browser fixtures without reading global window state. */
export function resolveResponsiveLayout(input: {
  layoutPackId: LayoutPackId;
  viewportWidth: number;
}): ResponsiveLayoutDecision {
  if (!Number.isInteger(input.viewportWidth) || input.viewportWidth <= 0) {
    throw new LayoutPackError("fail closed: viewport width must be a positive integer");
  }
  if (input.viewportWidth > MAX_SUPPORTED_VIEWPORT_PX) {
    throw new LayoutPackError("fail closed: viewport width exceeds the supported runtime bound");
  }
  const wide = input.viewportWidth >= WIDE_VIEWPORT_MIN_PX;
  return Object.freeze({
    layoutPackId: input.layoutPackId,
    mode: wide ? "wide" : "compact",
    asideVisible: input.layoutPackId === "A2" && wide,
    columns: input.layoutPackId === "A2" && wide ? 2 : 1,
  });
}

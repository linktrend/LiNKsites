import { createElement, type ReactNode } from "react";

import {
  LayoutPackError,
  type LayoutPackId,
  type LayoutRuntime,
} from "@/components/page-renderer/layout-packs";

export function composeLayoutBody(runtime: LayoutRuntime, main: ReactNode, title: string): ReactNode {
  switch (runtime.layoutPackId) {
    case "A1":
      return main;
    case "A2":
      return createElement(
        "div",
        { className: "grid gap-8 lg:grid-cols-[minmax(12rem,18rem)_minmax(0,1fr)]" },
        createElement(
          "aside",
          { "data-region": "aside", className: "hidden lg:block border-r border-border/60 px-4 py-8" },
          createElement("p", { className: "text-sm font-semibold" }, title),
        ),
        main,
      );
    case "A3":
      return createElement(
        "div",
        { className: "flex flex-col" },
        main,
        createElement(
          "section",
          { "data-region": "secondary", className: "border-t border-border/60 py-8" },
          createElement("div", { className: "container px-4 sm:px-6 text-sm text-muted-foreground" }, title),
        ),
      );
    default: {
      const exhaustive: never = runtime.layoutPackId;
      throw new LayoutPackError(`Unknown required layout pack "${String(exhaustive)}"`);
    }
  }
}

export function pageRendererMountAttributes(runtime: LayoutRuntime): Readonly<{
  "data-page-renderer": string;
  "data-layout-pack": LayoutPackId;
  "data-architecture-ready": "true" | "false";
  "data-plan-id": string;
}> {
  return {
    "data-page-renderer": runtime.composition.pageRenderer,
    "data-layout-pack": runtime.layoutPackId,
    "data-architecture-ready": runtime.composition.architectureReady ? "true" : "false",
    "data-plan-id": runtime.planId,
  };
}

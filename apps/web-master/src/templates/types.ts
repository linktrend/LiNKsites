import type { ComponentType } from "react";
import type { CmsPage } from "@/lib/repository/pages";
import type { LayoutPackId, PlanId } from "@/components/page-renderer/layout-packs";

export type TemplateId = string;

export type TemplateModule = {
  id: TemplateId;
  name: string;
  PageRenderer: ComponentType<{
    page: CmsPage;
    siteKey: string;
    locale: string;
    primaryNav?: unknown;
    footerNav?: unknown;
    layoutPackId?: LayoutPackId;
    planId?: PlanId;
  }>;
};


import type { ComponentType } from "react";
import type { CmsPage } from "@/lib/repository/pages";

export type TemplateId = string;

export type TemplateModule = {
  id: TemplateId;
  name: string;
  PageRenderer: ComponentType<{ page: CmsPage; siteKey: string; locale: string; primaryNav?: unknown; footerNav?: unknown }>;
};


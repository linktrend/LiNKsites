import type { TemplateId, TemplateModule } from "@/templates/types";
import { marketingSmbV1 } from "@/templates/marketing-smb-v1";

const TEMPLATES: Record<TemplateId, TemplateModule> = {
  [marketingSmbV1.id]: marketingSmbV1,
};

export const getTemplateModule = (templateId: TemplateId): TemplateModule => {
  return TEMPLATES[templateId] ?? marketingSmbV1;
};

export const DEFAULT_TEMPLATE_ID: TemplateId = marketingSmbV1.id;


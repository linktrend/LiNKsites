import type { TemplateId, TemplateModule } from "@/templates/types";
import { assertTemplateAdmission } from "@/lib/template-admission";

// The executable module is supplied by the admitted LiNKlibraries artifact.
// There is intentionally no local migration-source or default template here.
const TEMPLATES = new Map<TemplateId, TemplateModule>();

export const getTemplateModule = (templateId: TemplateId): TemplateModule => {
  assertTemplateAdmission(templateId);
  const template = TEMPLATES.get(templateId);
  if (!template) {
    throw new Error(`No admitted LiNKlibraries template module is materialized for "${templateId}"`);
  }
  return template;
};

export const registerAdmittedTemplateModule = (template: TemplateModule): void => {
  assertTemplateAdmission(template.id);
  TEMPLATES.set(template.id, template);
};

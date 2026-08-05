import type { TemplateId, TemplateModule } from "@/templates/types";
import { assertTemplateAdmission } from "@/lib/template-admission";
import { PageRenderer } from "@/components/page-renderer";

// The executable module is supplied by the admitted LiNKlibraries artifact.
// There is intentionally no local migration-source or default template here.
const TEMPLATES = new Map<TemplateId, TemplateModule>();

// This explicit local-proof registration lets the W2-04 disposable
// Payload harness exercise the same CMS-to-renderer HTTP path. It is not a
// production fallback: production still requires a materialized library
// module unless this proof-only environment flag is deliberately set, and
// admission is still checked before this module is returned.
const localProofTemplateId = process.env.LINKSITES_W2_04_LOCAL_PROOF_TEMPLATE_ID as TemplateId | undefined;
if (process.env.LINKSITES_W2_04_LOCAL_PROOF === "1" && localProofTemplateId) {
  TEMPLATES.set(localProofTemplateId, {
    id: localProofTemplateId,
    name: "W2-04 local proof renderer",
    PageRenderer,
  });
}

export const getTemplateModule = (templateId: TemplateId): TemplateModule => {
  assertTemplateAdmission(templateId);
  const template = TEMPLATES.get(templateId);
  if (!template) {
    throw new Error(`No admitted LiNKlibraries template module is materialized for "${templateId}"`);
  }
  return template;
};

export const registerAdmittedTemplateModule = (
  template: TemplateModule,
  materializedAssetBytes: Record<string, string>,
): void => {
  assertTemplateAdmission(template.id, materializedAssetBytes);
  TEMPLATES.set(template.id, template);
};

import type { TemplateId, TemplateModule } from "@/templates/types";
import { getAdmittedTemplateEvidence, assertTemplateAdmission } from "@/lib/template-admission";
import { PageRenderer } from "@/components/page-renderer";
import { readFileSync } from "node:fs";
import { resolve, sep } from "node:path";

// The executable module is supplied by the admitted LiNKlibraries artifact.
// There is intentionally no local migration-source or default template here.
const TEMPLATES = new Map<TemplateId, TemplateModule>();

const materializedTemplateLibraryPath = process.env.LINKSITES_ADMITTED_TEMPLATE_LIBRARY_PATH;

const readMaterializedAssets = (): Record<string, string> => {
  if (!materializedTemplateLibraryPath) {
    throw new Error("No read-only LiNKlibraries artifact path is configured for the admitted template");
  }
  const evidence = getAdmittedTemplateEvidence();
  const entryRoot = resolve(materializedTemplateLibraryPath, "entries", evidence.entry.entryId);
  const confinedRoot = `${entryRoot}${sep}`;
  return Object.fromEntries(Object.keys(evidence.files).map((relativePath) => {
    const candidate = resolve(entryRoot, relativePath);
    if (!candidate.startsWith(confinedRoot)) {
      throw new Error(`LiNKlibraries template asset path escapes the admitted entry: ${relativePath}`);
    }
    return [relativePath, readFileSync(candidate, "utf8")];
  }));
};

const materializeAdmittedTemplate = (templateId: TemplateId): TemplateModule => {
  const evidence = getAdmittedTemplateEvidence();
  if (evidence.entry.entryId !== templateId) {
    throw new Error(`LiNKlibraries evidence is not admitted for requested template "${templateId}"`);
  }
  const materializedAssetBytes = readMaterializedAssets();
  // The admitted library entry exports a framework-neutral declarative template.
  // PageRenderer is LiNKsites' reviewed React adapter for that published CMS
  // content, and is registered only after every library asset is byte-bound to
  // the admitted evidence. No local or implicit template fallback exists.
  const template: TemplateModule = { id: templateId, name: evidence.entry.name, PageRenderer };
  registerAdmittedTemplateModule(template, materializedAssetBytes);
  return template;
};

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
  return TEMPLATES.get(templateId) ?? materializeAdmittedTemplate(templateId);
};

export const registerAdmittedTemplateModule = (
  template: TemplateModule,
  materializedAssetBytes: Record<string, string>,
): void => {
  assertTemplateAdmission(template.id, materializedAssetBytes);
  TEMPLATES.set(template.id, template);
};

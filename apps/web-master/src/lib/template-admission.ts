import {
  assertLibraryConsumptionEvidence,
  assertLibraryConsumptionReceipt,
  canonicalJsonStringify,
  LINKSITES_LIBRARY_CONSUMER,
  type LibraryConsumptionEvidence,
  type LibraryConsumptionReceipt,
} from "@linksites/factory-catalog/library-consumer";
import { MASTER_TEMPLATE_PIN } from "@linksites/factory-catalog/master-template-pin";
import {
  isMasterTemplateLookAndFeelProofHarnessEnabled,
  runMasterTemplateCandidatePreview,
} from "@linksites/factory-catalog/master-template-preview-seam";

const GIT_SHA_PATTERN = /^[a-f0-9]{40}$/;

export type AdmittedTemplateReceipt = LibraryConsumptionReceipt;

export class TemplateAdmissionError extends Error {
  constructor(message: string) {
    super(`LiNKlibraries template admission failed: ${message}`);
    this.name = "TemplateAdmissionError";
  }
}

const parseJson = (raw: string, label: string): unknown => {
  try {
    return JSON.parse(raw) as unknown;
  } catch {
    throw new TemplateAdmissionError(`${label} JSON is invalid`);
  }
};

const admitMasterTemplateCandidatePreview = (templateId: string): AdmittedTemplateReceipt => {
  if (templateId !== MASTER_TEMPLATE_PIN.entryId) {
    throw new TemplateAdmissionError(
      "look-and-feel proof harness only inspects pinned master-template-type-1; it does not admit any other template",
    );
  }
  const preview = runMasterTemplateCandidatePreview();
  if (preview.productionSelectable !== false || preview.probe.verified.selectability !== "non_selectable") {
    throw new TemplateAdmissionError("look-and-feel proof harness refused a production-selectable result");
  }
  return {
    schemaVersion: 1,
    receiptId: `proof-only-not-admitted:${MASTER_TEMPLATE_PIN.commitSha}`,
    consumer: LINKSITES_LIBRARY_CONSUMER,
    entryId: MASTER_TEMPLATE_PIN.entryId,
    catalogCommitSha: MASTER_TEMPLATE_PIN.commitSha,
    libraryCommitSha: MASTER_TEMPLATE_PIN.commitSha,
    verificationId: `candidate-probe:${MASTER_TEMPLATE_PIN.artifactTreeSha1}`,
    entryChecksum: MASTER_TEMPLATE_PIN.releaseManifestSha256,
    assetChecksums: {},
    entrypoint: "candidate-probe",
    testFiles: [],
    compatibility: {
      compatible: true,
      consumer: LINKSITES_LIBRARY_CONSUMER,
      nodeMajor: 22,
      runtimes: ["node", "browser"],
    },
    recordedAt: "2026-08-18T00:00:00.000Z",
  };
};

const loadAdmittedEvidence = (): LibraryConsumptionEvidence => {
  if (isMasterTemplateLookAndFeelProofHarnessEnabled()) {
    throw new TemplateAdmissionError(
      "look-and-feel proof harness does not emit production admission evidence; draft remains non_selectable",
    );
  }
  const receiptRaw = process.env.LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON;
  const evidenceRaw = process.env.LINKSITES_ADMITTED_TEMPLATE_EVIDENCE_JSON;
  const expectedSha = process.env.LINKSITES_ADMITTED_TEMPLATE_SHA;

  if (!receiptRaw || !evidenceRaw || !expectedSha) {
    throw new TemplateAdmissionError(
      "no authoritative receipt, materialized evidence, and exact LiNKlibraries SHA are configured; local template sources are not admissible",
    );
  }
  if (!GIT_SHA_PATTERN.test(expectedSha)) {
    throw new TemplateAdmissionError("LINKSITES_ADMITTED_TEMPLATE_SHA must be a full 40-character lowercase Git SHA");
  }

  const receiptValue = parseJson(receiptRaw, "receipt") as LibraryConsumptionReceipt;
  const evidenceValue = parseJson(evidenceRaw, "materialized evidence") as LibraryConsumptionEvidence;

  try {
    // Both checks are intentional: the receipt verifier validates the
    // admission contract, while the evidence verifier binds the receipt to
    // the source-owned authority and every materialized asset byte.
    assertLibraryConsumptionReceipt(receiptValue);
    assertLibraryConsumptionEvidence(evidenceValue);
  } catch (error) {
    throw new TemplateAdmissionError(
      `factory-catalog authoritative verification rejected the admission evidence: ${error instanceof Error ? error.message : "unknown verifier error"}`,
    );
  }

  if (canonicalJsonStringify(receiptValue) !== canonicalJsonStringify(evidenceValue.receipt)) {
    throw new TemplateAdmissionError("receipt JSON is not exactly bound to the independently verified materialized evidence");
  }
  if (receiptValue.libraryCommitSha !== expectedSha || receiptValue.catalogCommitSha !== expectedSha) {
    throw new TemplateAdmissionError("configured SHA does not match the independently verified receipt commit SHA");
  }
  if (evidenceValue.entry.status !== "approved") {
    throw new TemplateAdmissionError("the admitted template is not registered as an approved catalog entry");
  }

  return evidenceValue;
};

export const getAdmittedTemplateEvidence = (): LibraryConsumptionEvidence => loadAdmittedEvidence();

export const getAdmittedTemplateReceipt = (): AdmittedTemplateReceipt => loadAdmittedEvidence().receipt;

/**
 * Proves that the selected template is the approved catalog entry and, when
 * supplied by the materializer, that the bytes actually loaded by the app are
 * exactly the bytes covered by the factory-catalog evidence.
 */
export const assertTemplateAdmission = (
  templateId: string,
  materializedAssetBytes?: Record<string, string>,
): AdmittedTemplateReceipt => {
  if (isMasterTemplateLookAndFeelProofHarnessEnabled()) {
    if (materializedAssetBytes !== undefined) {
      throw new TemplateAdmissionError("look-and-feel proof harness does not admit materialized production assets");
    }
    return admitMasterTemplateCandidatePreview(templateId);
  }
  const evidence = loadAdmittedEvidence();
  const receipt = evidence.receipt;

  if (receipt.entryId !== templateId || evidence.entry.entryId !== templateId) {
    throw new TemplateAdmissionError(
      `site selected "${templateId}" but the independently verified receipt is for "${receipt.entryId}"`,
    );
  }

  if (materializedAssetBytes !== undefined) {
    const expectedPaths = Object.keys(evidence.files).sort();
    const actualPaths = Object.keys(materializedAssetBytes).sort();
    if (canonicalJsonStringify(actualPaths) !== canonicalJsonStringify(expectedPaths)) {
      throw new TemplateAdmissionError("materialized template assets do not match the evidence asset set");
    }
    for (const path of expectedPaths) {
      if (materializedAssetBytes[path] !== evidence.files[path]) {
        throw new TemplateAdmissionError(`materialized template asset bytes differ for "${path}"`);
      }
    }
  }

  return receipt;
};

import {
  assertLibraryConsumptionEvidence,
  assertLibraryConsumptionReceipt,
  canonicalJsonStringify,
  type LibraryConsumptionEvidence,
  type LibraryConsumptionReceipt,
} from "@linksites/factory-catalog/library-consumer";

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

const loadAdmittedEvidence = (): LibraryConsumptionEvidence => {
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

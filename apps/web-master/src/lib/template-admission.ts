import {
  assertLibraryConsumptionEvidence,
  assertLibraryConsumptionReceipt,
  canonicalJsonStringify,
  type LibraryConsumptionEvidence,
  type LibraryConsumptionReceipt,
} from "@linksites/factory-catalog/library-consumer";
import {
  materializeRevision2WebsiteTemplate,
  type Revision2MaterializedWebsiteTemplate,
  type Revision2ProviderPin,
} from "@linksites/factory-catalog/revision2-materialization";

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
 * The production path consumes a pinned Revision 2 release from LiNKlibraries.
 * The provider directory is read-only input; no template files are copied into
 * this repository. The legacy functions above remain only for the disposable
 * W2-04 compatibility proof.
 */
export const getAdmittedRevision2Template = (): Revision2MaterializedWebsiteTemplate => {
  return materializeRevision2FromEnvironment(false);
};

const materializeRevision2FromEnvironment = (allowDraftCandidate: boolean): Revision2MaterializedWebsiteTemplate => {
  const providerRoot = process.env.LINKSITES_LINKLIBRARIES_ROOT;
  const sourceCommitSha = process.env.LINKSITES_LINKLIBRARIES_COMMIT_SHA;
  const sourceTreeSha = process.env.LINKSITES_LINKLIBRARIES_TREE_SHA;
  const dependencyLockSha256 = process.env.LINKSITES_LINKLIBRARIES_DEPENDENCY_LOCK_SHA256;
  const entryId = process.env.LINKSITES_TEMPLATE_ID ?? "master-template-type-1";
  const version = process.env.LINKSITES_TEMPLATE_VERSION ?? "1.0.0";
  if (!providerRoot || !sourceCommitSha || !sourceTreeSha || !dependencyLockSha256) {
    throw new TemplateAdmissionError(
      "no pinned LiNKlibraries Revision 2 root, source commit/tree, and dependency-lock digest are configured",
    );
  }
  const pin: Revision2ProviderPin = { sourceCommitSha, sourceTreeSha, dependencyLockSha256 };
  const result = materializeRevision2WebsiteTemplate({
    providerRoot,
    entryId,
    version,
    pin,
    receiptPath: process.env.LINKSITES_LINKLIBRARIES_RECEIPT_PATH,
    allowDraftCandidate,
  });
  if (!result.ok) throw new TemplateAdmissionError(result.errors.join("; "));
  return result.value;
};

/**
 * Non-production paired-proof lane only. It accepts the exact immutable
 * provider candidate while it remains draft/non-selectable; production callers
 * must use getAdmittedRevision2Template instead.
 */
export const getDraftRevision2TemplateForPairedProof = (): Revision2MaterializedWebsiteTemplate => {
  if (process.env.LINKSITES_PAIRED_PROOF === "1") return materializeRevision2FromEnvironment(true);
  throw new TemplateAdmissionError("draft candidate materialization is restricted to the paired-proof lane");
};

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

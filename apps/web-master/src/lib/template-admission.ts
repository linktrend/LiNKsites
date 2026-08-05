const GIT_SHA_PATTERN = /^[a-f0-9]{40}$/;
const SHA256_PATTERN = /^[a-f0-9]{64}$/;

export type AdmittedTemplateReceipt = {
  schemaVersion: { major: number; minor: number };
  receiptId: string;
  consumer: "linksites";
  entryId: string;
  catalogCommitSha: string;
  libraryCommitSha: string;
  verificationId: string;
  entryChecksum: string;
  assetChecksums: Record<string, string>;
  entrypoint: string;
};

export class TemplateAdmissionError extends Error {
  constructor(message: string) {
    super(`LiNKlibraries template admission failed: ${message}`);
    this.name = "TemplateAdmissionError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const requiredString = (value: unknown, field: string): string => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TemplateAdmissionError(`receipt field "${field}" is required`);
  }
  return value;
};

const parseReceipt = (raw: string): AdmittedTemplateReceipt => {
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new TemplateAdmissionError("receipt JSON is invalid");
  }
  if (!isRecord(value)) throw new TemplateAdmissionError("receipt must be an object");

  const schemaVersion = value.schemaVersion;
  if (!isRecord(schemaVersion) || schemaVersion.major !== 1 || schemaVersion.minor !== 0) {
    throw new TemplateAdmissionError("receipt schemaVersion must be 1.0");
  }
  if (value.consumer !== "linksites") throw new TemplateAdmissionError("receipt consumer is not linksites");

  const receipt = {
    schemaVersion: { major: 1, minor: 0 },
    receiptId: requiredString(value.receiptId, "receiptId"),
    consumer: "linksites" as const,
    entryId: requiredString(value.entryId, "entryId"),
    catalogCommitSha: requiredString(value.catalogCommitSha, "catalogCommitSha"),
    libraryCommitSha: requiredString(value.libraryCommitSha, "libraryCommitSha"),
    verificationId: requiredString(value.verificationId, "verificationId"),
    entryChecksum: requiredString(value.entryChecksum, "entryChecksum"),
    assetChecksums: value.assetChecksums,
    entrypoint: requiredString(value.entrypoint, "entrypoint"),
  };

  if (!GIT_SHA_PATTERN.test(receipt.catalogCommitSha) || !GIT_SHA_PATTERN.test(receipt.libraryCommitSha)) {
    throw new TemplateAdmissionError("receipt commit SHAs must be full 40-character lowercase Git SHAs");
  }
  if (!SHA256_PATTERN.test(receipt.entryChecksum)) {
    throw new TemplateAdmissionError("receipt entryChecksum must be a 64-character SHA-256 value");
  }
  if (!isRecord(receipt.assetChecksums) || Object.keys(receipt.assetChecksums).length === 0) {
    throw new TemplateAdmissionError("receipt assetChecksums must be non-empty");
  }
  for (const [path, checksum] of Object.entries(receipt.assetChecksums)) {
    if (!path || !SHA256_PATTERN.test(String(checksum))) {
      throw new TemplateAdmissionError(`receipt asset checksum is invalid for "${path}"`);
    }
  }

  return receipt as AdmittedTemplateReceipt;
};

export const getAdmittedTemplateReceipt = (): AdmittedTemplateReceipt => {
  const raw = process.env.LINKSITES_ADMITTED_TEMPLATE_RECEIPT_JSON;
  const expectedSha = process.env.LINKSITES_ADMITTED_TEMPLATE_SHA;
  if (!raw || !expectedSha) {
    throw new TemplateAdmissionError(
      "no admitted receipt and exact LiNKlibraries SHA are configured; local template sources are not admissible",
    );
  }
  if (!GIT_SHA_PATTERN.test(expectedSha)) {
    throw new TemplateAdmissionError("LINKSITES_ADMITTED_TEMPLATE_SHA must be a full 40-character lowercase Git SHA");
  }

  const receipt = parseReceipt(raw);
  if (receipt.libraryCommitSha !== expectedSha) {
    throw new TemplateAdmissionError("configured SHA does not match receipt.libraryCommitSha");
  }
  return receipt;
};

export const assertTemplateAdmission = (templateId: string): AdmittedTemplateReceipt => {
  const receipt = getAdmittedTemplateReceipt();
  if (receipt.entryId !== templateId) {
    throw new TemplateAdmissionError(
      `site selected "${templateId}" but the admitted receipt is for "${receipt.entryId}"`,
    );
  }
  return receipt;
};

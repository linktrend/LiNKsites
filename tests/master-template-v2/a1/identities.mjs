/**
 * Fail-closed identity gates for LS-08 A1 paired consumer proof.
 * Exact pins are bound. Provider bytes, selectability, and MWT-08 are refused.
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  EXT_LS_01_RECEIPT,
  FORBIDDEN_FABRICATION_KEYS,
  FORBIDDEN_RECEIPT_CLAIMS,
  PROTECTED_DEVELOPMENT,
  PROVIDER_PIN,
} from "./constants.mjs";

export const GIT_SHA1 = /^[0-9a-f]{40}$/;
export const GIT_SHA256 = /^[0-9a-f]{64}$/;

export class ClosedFailure extends Error {
  /**
   * @param {string} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = "ClosedFailure";
    this.code = code;
  }
}

/**
 * @param {unknown} value
 * @returns {value is Record<string, unknown>}
 */
export function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * @param {unknown} value
 * @param {string[]} acc
 * @returns {string[]}
 */
export function collectStrings(value, acc = []) {
  if (typeof value === "string") acc.push(value);
  else if (Array.isArray(value)) value.forEach((item) => collectStrings(item, acc));
  else if (isRecord(value)) Object.values(value).forEach((item) => collectStrings(item, acc));
  return acc;
}

export function sha256Hex(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * @param {unknown} raw
 */
export function requireProtectedLs07(raw) {
  if (!isRecord(raw)) {
    throw new ClosedFailure("ls07_unbound", "ls07Checkpoint must bind protected development");
  }
  if (raw.present !== true || raw.protectedIntegrated !== true) {
    throw new ClosedFailure("ls07_unbound", "LS-07 protected integration must be bound for LS-08 proof");
  }
  if (raw.commit !== PROTECTED_DEVELOPMENT.commit || raw.tree !== PROTECTED_DEVELOPMENT.tree) {
    throw new ClosedFailure(
      "ls07_mismatch",
      `LS-07 checkpoint must be ${PROTECTED_DEVELOPMENT.commit}/${PROTECTED_DEVELOPMENT.tree}`,
    );
  }
  if (raw.repository != null && raw.repository !== PROTECTED_DEVELOPMENT.repository) {
    throw new ClosedFailure("ls07_mismatch", "LS-07 repository must be linktrend/LiNKsites");
  }
  return {
    present: true,
    protectedIntegrated: true,
    commit: PROTECTED_DEVELOPMENT.commit,
    tree: PROTECTED_DEVELOPMENT.tree,
  };
}

/**
 * Bind the exact MWT-07 pin. Bound means identity match, not bytes present.
 * @param {unknown} raw
 */
export function requireProviderPin(raw) {
  if (!isRecord(raw)) {
    throw new ClosedFailure("provider_unbound", "providerA1 must bind the exact MWT-07 pin");
  }
  if (raw.bound !== true) {
    throw new ClosedFailure("provider_unbound", "providerA1.bound must be true (identity pin, not bytes)");
  }
  if (raw.bytesPresent === true || raw.a1BytesPresent === true) {
    throw new ClosedFailure("provider_bytes", "provider A1 bytes must not be present or fabricated");
  }
  const commit = raw.commit ?? raw.protectedDevelopmentCommit;
  const tree = raw.tree ?? raw.protectedDevelopmentTree;
  if (commit !== PROVIDER_PIN.commit || tree !== PROVIDER_PIN.tree) {
    throw new ClosedFailure(
      "provider_mismatch",
      `provider pin must be ${PROVIDER_PIN.commit}/${PROVIDER_PIN.tree}`,
    );
  }
  const entry = raw.releaseEntryVersion ?? raw.entry;
  if (entry != null && entry !== PROVIDER_PIN.releaseEntryVersion) {
    throw new ClosedFailure("provider_mismatch", "releaseEntryVersion must be master-template-type-1@2.0.0-a1.1");
  }
  if (raw.lifecycle != null && raw.lifecycle !== "draft") {
    throw new ClosedFailure("provider_selectability", "provider lifecycle must remain draft");
  }
  if (raw.selectability != null && raw.selectability !== "non_selectable") {
    throw new ClosedFailure("provider_selectability", "provider must remain non_selectable");
  }
  if (raw.conformanceClaimed === true || raw.selectableClaimed === true || raw.mwt08Claimed === true) {
    throw new ClosedFailure("provider_selectability", "provider conformance, selectability, and MWT-08 are forbidden");
  }
  for (const key of FORBIDDEN_FABRICATION_KEYS) {
    if (Object.prototype.hasOwnProperty.call(raw, key) && raw[key] != null && raw[key] !== false) {
      throw new ClosedFailure("provider_bytes", `forbidden provider fabrication key: ${key}`);
    }
  }
  return {
    bound: true,
    bytesPresent: false,
    commit: PROVIDER_PIN.commit,
    tree: PROVIDER_PIN.tree,
    releaseEntryVersion: PROVIDER_PIN.releaseEntryVersion,
    lifecycle: "draft",
    selectability: "non_selectable",
  };
}

/**
 * @param {unknown} raw
 * @param {{ repoRoot?: string, gitCommonDir?: string }} [paths]
 */
export function requireExtLs01Receipt(raw, paths = {}) {
  if (!isRecord(raw)) {
    throw new ClosedFailure("ext_ls01_unbound", "extLs01Receipt binding is required");
  }
  if (raw.sha256 !== EXT_LS_01_RECEIPT.sha256) {
    throw new ClosedFailure("ext_ls01_mismatch", "EXT-LS-01 receipt SHA-256 does not match the accepted digest");
  }
  if (raw.consumerCommit !== EXT_LS_01_RECEIPT.consumerCommit || raw.consumerTree !== EXT_LS_01_RECEIPT.consumerTree) {
    throw new ClosedFailure("ext_ls01_mismatch", "EXT-LS-01 consumer checkpoint commit/tree mismatch");
  }
  if (raw.path !== EXT_LS_01_RECEIPT.path) {
    throw new ClosedFailure("ext_ls01_mismatch", "EXT-LS-01 receipt path mismatch");
  }
  if (raw.bytesEmbedded === true) {
    throw new ClosedFailure("provider_bytes", "EXT-LS-01 receipt bytes must not be fabricated or re-embedded");
  }

  const candidates = [];
  if (paths.repoRoot) candidates.push(path.join(paths.repoRoot, raw.path));
  if (paths.gitCommonDir) {
    const relative = String(raw.path).replace(/^\.git\//, "");
    candidates.push(path.join(paths.gitCommonDir, relative));
  }
  let bytesPresent = false;
  for (const candidate of candidates) {
    if (!fs.existsSync(candidate)) continue;
    const digest = sha256Hex(fs.readFileSync(candidate));
    if (digest !== EXT_LS_01_RECEIPT.sha256) {
      throw new ClosedFailure(
        "ext_ls01_mismatch",
        `EXT-LS-01 receipt at ${candidate} does not match SHA-256 ${EXT_LS_01_RECEIPT.sha256}`,
      );
    }
    bytesPresent = true;
    break;
  }

  return {
    bound: true,
    sha256: EXT_LS_01_RECEIPT.sha256,
    path: EXT_LS_01_RECEIPT.path,
    consumerCommit: EXT_LS_01_RECEIPT.consumerCommit,
    consumerTree: EXT_LS_01_RECEIPT.consumerTree,
    bytesPresent,
    bytesEmbedded: false,
  };
}

/**
 * @param {unknown} value
 */
export function assertNoFabricationKeys(value) {
  if (!isRecord(value) && !Array.isArray(value)) return;
  const visit = (node) => {
    if (Array.isArray(node)) {
      node.forEach(visit);
      return;
    }
    if (!isRecord(node)) return;
    for (const [key, child] of Object.entries(node)) {
      if (FORBIDDEN_FABRICATION_KEYS.includes(key) && child != null && child !== false) {
        throw new ClosedFailure("provider_bytes", `forbidden fabrication key: ${key}`);
      }
      visit(child);
    }
  };
  visit(value);
}

/**
 * @param {unknown} value
 * @returns {string[]}
 */
export function forbiddenReceiptClaims(value) {
  return collectStrings(value).flatMap((text) => {
    const hits = [];
    for (const claim of FORBIDDEN_RECEIPT_CLAIMS) {
      const escaped = claim.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const pattern = new RegExp(`(^|[^A-Za-z0-9_-])${escaped}([^A-Za-z0-9_-]|$)`, "i");
      if (pattern.test(text)) hits.push(claim);
    }
    return hits;
  });
}

export function assertNoSelectabilityOrMwt08(value) {
  const claims = forbiddenReceiptClaims(value);
  if (claims.length) {
    throw new ClosedFailure("forbidden_claim", `forbidden receipt claim: ${claims.join(", ")}`);
  }
}

/**
 * Confirm consumer catalog pin files still name the same MWT-07 identities.
 * This reads identity text only; it does not load provider artifacts.
 *
 * @param {string} repoRoot
 */
export function assertCatalogPinFiles(repoRoot) {
  const pinPath = path.join(repoRoot, "packages/factory-catalog/src/masterTemplatePin.ts");
  const clientPath = path.join(repoRoot, "packages/factory-catalog/src/libraryProviderClient.ts");
  if (!fs.existsSync(pinPath) || !fs.existsSync(clientPath)) {
    throw new ClosedFailure("provider_unbound", "consumer catalog pin files are absent");
  }
  const pinText = fs.readFileSync(pinPath, "utf8");
  const clientText = fs.readFileSync(clientPath, "utf8");
  for (const [label, needle] of [
    ["MWT-07 commit", PROVIDER_PIN.commit],
    ["MWT-07 tree", PROVIDER_PIN.tree],
    ["entry version", PROVIDER_PIN.version],
  ]) {
    if (!pinText.includes(needle) && !clientText.includes(needle)) {
      throw new ClosedFailure("provider_mismatch", `consumer catalog pin files missing ${label} ${needle}`);
    }
  }
  if (!pinText.includes("non_selectable") || !pinText.includes("draft")) {
    throw new ClosedFailure("provider_selectability", "catalog pin must remain draft/non_selectable");
  }
}

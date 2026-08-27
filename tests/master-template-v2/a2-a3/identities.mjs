/**
 * Fail-closed identity gates for LS-09 A2/A3 complete consumer proof.
 * Exact pins are bound. Provider bytes, selectability, VPS/live proof, and
 * MWT outputs are refused.
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import {
  FROZEN_A1,
  FORBIDDEN_FABRICATION_KEYS,
  FORBIDDEN_RECEIPT_CLAIMS,
  POST_A1_AMENDMENT,
  PROTECTED_DEVELOPMENT,
  PROVIDER_HANDOFF,
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

export function requireProtectedLs08(raw) {
  if (!isRecord(raw)) {
    throw new ClosedFailure("ls08_unbound", "ls08Checkpoint must bind protected development");
  }
  if (raw.present !== true || raw.protectedIntegrated !== true) {
    throw new ClosedFailure("ls08_unbound", "LS-08 protected integration must be bound for LS-09 proof");
  }
  if (raw.commit !== PROTECTED_DEVELOPMENT.commit || raw.tree !== PROTECTED_DEVELOPMENT.tree) {
    throw new ClosedFailure(
      "ls08_mismatch",
      `LS-08 checkpoint must be ${PROTECTED_DEVELOPMENT.commit}/${PROTECTED_DEVELOPMENT.tree}`,
    );
  }
  if (raw.repository != null && raw.repository !== PROTECTED_DEVELOPMENT.repository) {
    throw new ClosedFailure("ls08_mismatch", "LS-08 repository must be linktrend/LiNKsites");
  }
  return {
    present: true,
    protectedIntegrated: true,
    commit: PROTECTED_DEVELOPMENT.commit,
    tree: PROTECTED_DEVELOPMENT.tree,
  };
}

export function requireFrozenA1(raw) {
  if (!isRecord(raw)) {
    throw new ClosedFailure("a1_unfrozen", "frozen A1 semantics binding is required");
  }
  if (raw.layoutPack !== FROZEN_A1.layoutPack || raw.pageRenderer !== FROZEN_A1.pageRenderer) {
    throw new ClosedFailure("a1_mutated", "ISS-28 must not change accepted A1 layout/pageRenderer semantics");
  }
  if (raw.architectureReady === true) {
    throw new ClosedFailure("a1_mutated", "accepted A1 must remain architectureReady=false");
  }
  if (raw.overallVerdict != null && raw.overallVerdict !== FROZEN_A1.overallVerdict) {
    throw new ClosedFailure("a1_mutated", "accepted A1 overallVerdict must remain A1_SEMANTICS_FROZEN");
  }
  return { ...FROZEN_A1 };
}

export function requireProviderPin(raw) {
  if (!isRecord(raw)) {
    throw new ClosedFailure("provider_unbound", "providerFinal must bind the exact 2.0.0 pin");
  }
  if (raw.bound !== true) {
    throw new ClosedFailure("provider_unbound", "providerFinal.bound must be true (identity pin, not bytes)");
  }
  if (raw.bytesPresent === true || raw.a2BytesPresent === true || raw.a3BytesPresent === true) {
    throw new ClosedFailure("provider_bytes", "provider A2/A3/final bytes must not be present or fabricated");
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
    throw new ClosedFailure("provider_mismatch", "releaseEntryVersion must be master-template-type-1@2.0.0");
  }
  if (raw.lifecycle != null && raw.lifecycle !== "draft") {
    throw new ClosedFailure("provider_selectability", "provider lifecycle must remain draft until reserved admission");
  }
  if (raw.selectability != null && raw.selectability !== "non_selectable") {
    throw new ClosedFailure("provider_selectability", "provider must remain non_selectable");
  }
  if (
    raw.conformanceClaimed === true ||
    raw.selectableClaimed === true ||
    raw.productionSelectable === true ||
    raw.vpsProofClaimed === true ||
    raw.liveProofClaimed === true ||
    raw.mwtOutputClaimed === true
  ) {
    throw new ClosedFailure(
      "provider_selectability",
      "provider conformance, selectability, VPS/live proof, and MWT outputs are forbidden",
    );
  }
  for (const digest of ["releaseManifestSha256", "inventorySha256", "payloadSha256", "releaseReceiptSha256", "a2LayoutSha256", "a3LayoutSha256"]) {
    if (raw[digest] != null && raw[digest] !== PROVIDER_PIN[digest]) {
      throw new ClosedFailure("provider_mismatch", `${digest} does not match the bound 2.0.0 digest`);
    }
  }
  if (raw.artifactTree != null && raw.artifactTree !== PROVIDER_PIN.artifactTree) {
    throw new ClosedFailure("provider_mismatch", "artifactTree does not match the bound 2.0.0 tree");
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

export function requireAmendmentAncestor(raw) {
  if (!isRecord(raw)) {
    throw new ClosedFailure("amendment_unbound", "postA1Amendment ancestor binding is required");
  }
  if (raw.commit !== POST_A1_AMENDMENT.commit || raw.tree !== POST_A1_AMENDMENT.tree) {
    throw new ClosedFailure(
      "amendment_mismatch",
      `amendment ancestor must be ${POST_A1_AMENDMENT.commit}/${POST_A1_AMENDMENT.tree}`,
    );
  }
  if (raw.bytesEmbedded === true) {
    throw new ClosedFailure("provider_bytes", "amendment bytes must not be fabricated");
  }
  return { ...POST_A1_AMENDMENT, bound: true };
}

/**
 * Bind handoff identity. If local bytes exist they must match; absence is allowed.
 * @param {unknown} raw
 */
export function requireProviderHandoff(raw) {
  if (!isRecord(raw)) {
    throw new ClosedFailure("handoff_unbound", "providerHandoff binding is required");
  }
  if (raw.sha256 !== PROVIDER_HANDOFF.sha256) {
    throw new ClosedFailure("handoff_mismatch", "LS-09 provider handoff SHA-256 does not match the bound digest");
  }
  if (raw.path !== PROVIDER_HANDOFF.path) {
    throw new ClosedFailure("handoff_mismatch", "LS-09 provider handoff path mismatch");
  }
  if (raw.bytesEmbedded === true) {
    throw new ClosedFailure("provider_bytes", "handoff receipt bytes must not be fabricated or re-embedded");
  }
  let bytesPresent = false;
  if (fs.existsSync(PROVIDER_HANDOFF.path)) {
    const digest = sha256Hex(fs.readFileSync(PROVIDER_HANDOFF.path));
    if (digest !== PROVIDER_HANDOFF.sha256) {
      throw new ClosedFailure(
        "handoff_mismatch",
        `handoff at ${PROVIDER_HANDOFF.path} does not match SHA-256 ${PROVIDER_HANDOFF.sha256}`,
      );
    }
    bytesPresent = true;
  }
  return {
    bound: true,
    sha256: PROVIDER_HANDOFF.sha256,
    path: PROVIDER_HANDOFF.path,
    bytesPresent,
    bytesEmbedded: false,
  };
}

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

export function assertNoSelectabilityOrLiveProof(value) {
  const claims = forbiddenReceiptClaims(value);
  if (claims.length) {
    throw new ClosedFailure("forbidden_claim", `forbidden receipt claim: ${claims.join(", ")}`);
  }
}

export function assertA1EvidenceUnchanged(repoRoot) {
  const receiptPath = path.join(repoRoot, FROZEN_A1.evidenceDir, "fixtures/iss-27-receipt.json");
  if (!fs.existsSync(receiptPath)) {
    throw new ClosedFailure("a1_unfrozen", "LS-08 ISS-27 receipt is absent; cannot prove A1 freeze");
  }
  const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
  if (receipt.overallVerdict !== FROZEN_A1.overallVerdict || receipt.freezeAcceptedA1 !== true) {
    throw new ClosedFailure("a1_mutated", "LS-08 A1 freeze receipt is not intact");
  }
  if (receipt.frozenSemantics?.layoutPack !== "a1") {
    throw new ClosedFailure("a1_mutated", "LS-08 frozen layoutPack is no longer a1");
  }
  if (receipt.frozenSemantics?.releaseEntryVersion !== FROZEN_A1.releaseEntryVersion) {
    throw new ClosedFailure("a1_mutated", "LS-08 frozen A1 release identity changed");
  }
}

/**
 * Fail-closed identity gates for LS-08 A1 preparation.
 * Missing LS-07 / provider identities are open dependencies, not invented pins.
 */

import {
  FORBIDDEN_FABRICATION_KEYS,
  FORBIDDEN_RECEIPT_CLAIMS,
} from "./constants.mjs";

export const GIT_SHA1 = /^[0-9a-f]{40}$/;

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

/**
 * Synthetic or placeholder SHAs are allowed only when explicitly unbound.
 * Treating them as a protected LS-07 checkpoint is an invention.
 *
 * @param {unknown} raw
 * @returns {{ present: false, protectedIntegrated: false } | never}
 */
export function requireUnboundLs07Checkpoint(raw) {
  if (raw == null) {
    return { present: false, protectedIntegrated: false };
  }
  if (!isRecord(raw)) {
    throw new ClosedFailure("ls07_invention", "ls07Checkpoint must be an object or omitted");
  }
  if (raw.protectedIntegrated === true || raw.present === true) {
    throw new ClosedFailure(
      "ls07_invention",
      "LS-07 protected integration is not present; refusing invented checkpoint",
    );
  }
  if (raw.commit != null || raw.tree != null) {
    throw new ClosedFailure(
      "ls07_invention",
      "unbound LS-07 checkpoint must not carry commit/tree identities",
    );
  }
  return { present: false, protectedIntegrated: false };
}

/**
 * @param {unknown} raw
 * @returns {{ bound: false, bytesPresent: false }}
 */
export function requireUnboundProviderA1(raw) {
  if (raw == null) {
    return { bound: false, bytesPresent: false };
  }
  if (!isRecord(raw)) {
    throw new ClosedFailure("provider_bytes", "providerA1 must be an object or omitted");
  }
  if (raw.bound === true || raw.bytesPresent === true || raw.a1BytesPresent === true) {
    throw new ClosedFailure(
      "provider_bytes",
      "exact provider A1 is not bound; refusing invented provider bytes or binding",
    );
  }
  for (const key of FORBIDDEN_FABRICATION_KEYS) {
    if (Object.prototype.hasOwnProperty.call(raw, key) && raw[key] != null && raw[key] !== false) {
      throw new ClosedFailure("provider_bytes", `forbidden provider fabrication key: ${key}`);
    }
  }
  return { bound: false, bytesPresent: false };
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
      const pattern = new RegExp(`\\b${claim}\\b`, "i");
      if (pattern.test(text)) hits.push(claim);
    }
    return hits;
  });
}

/**
 * Git SHAs may appear only on explicitly unbound schema fixtures, never as
 * protected-integration or A1-binding claims.
 *
 * @param {unknown} value
 * @param {string} label
 */
export function rejectProtectedShaClaim(value, label) {
  if (typeof value !== "string") return;
  if (GIT_SHA1.test(value)) {
    throw new ClosedFailure(
      "ls07_invention",
      `${label} carries a git SHA but LS-07/provider A1 remain unbound; refusing invented pin`,
    );
  }
}

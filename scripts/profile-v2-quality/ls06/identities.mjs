import {
  FORBIDDEN_FABRICATION_KEYS,
  FORBIDDEN_SOURCE_VALUES,
  INJECTED_SOURCE,
} from "./constants.mjs";

/**
 * @param {unknown} value
 * @returns {value is string}
 */
export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * @param {unknown} node
 * @param {string[]} found
 * @returns {string[]}
 */
export function collectForbiddenKeys(node, found = []) {
  if (!node || typeof node !== "object") return found;
  if (Array.isArray(node)) {
    for (const item of node) collectForbiddenKeys(item, found);
    return found;
  }
  const rec = /** @type {Record<string, unknown>} */ (node);
  for (const [key, value] of Object.entries(rec)) {
    if (FORBIDDEN_FABRICATION_KEYS.includes(key) && found.indexOf(key) === -1) {
      found.push(key);
    }
    collectForbiddenKeys(value, found);
  }
  return found;
}

/**
 * @param {unknown} identities
 * @returns {{ id: string, source: unknown }[]}
 */
export function identitySources(identities) {
  if (!identities || typeof identities !== "object") return [];
  const rec = /** @type {Record<string, unknown>} */ (identities);
  const out = [];
  for (const id of ["ls04", "ls05", "provider", "layout"]) {
    const block = rec[id];
    if (block && typeof block === "object" && !Array.isArray(block)) {
      out.push({
        id,
        source: /** @type {Record<string, unknown>} */ (block).source,
      });
    }
  }
  return out;
}

/**
 * @param {unknown} identities
 * @returns {string[]}
 */
export function missingIdentityBlocks(identities) {
  if (!identities || typeof identities !== "object") {
    return ["ls04", "ls05", "provider", "layout"];
  }
  const rec = /** @type {Record<string, unknown>} */ (identities);
  return ["ls04", "ls05", "provider", "layout"].filter((id) => {
    const block = rec[id];
    return !block || typeof block !== "object" || Array.isArray(block);
  });
}

/**
 * @param {unknown} ls04
 * @returns {string[]}
 */
export function missingLs04Fields(ls04) {
  if (!ls04 || typeof ls04 !== "object") {
    return ["workingContentIdentity", "promotionReceiptIdentity", "source"];
  }
  const rec = /** @type {Record<string, unknown>} */ (ls04);
  const missing = [];
  if (!isNonEmptyString(rec.workingContentIdentity)) {
    missing.push("workingContentIdentity");
  }
  if (!isNonEmptyString(rec.promotionReceiptIdentity)) {
    missing.push("promotionReceiptIdentity");
  }
  if (!isNonEmptyString(rec.source)) missing.push("source");
  return missing;
}

/**
 * @param {unknown} ls05
 * @returns {string[]}
 */
export function missingLs05Fields(ls05) {
  if (!ls05 || typeof ls05 !== "object") {
    return ["adapterIdentity", "materializationReceiptIdentity", "source"];
  }
  const rec = /** @type {Record<string, unknown>} */ (ls05);
  const missing = [];
  if (!isNonEmptyString(rec.adapterIdentity)) missing.push("adapterIdentity");
  if (!isNonEmptyString(rec.materializationReceiptIdentity)) {
    missing.push("materializationReceiptIdentity");
  }
  if (!isNonEmptyString(rec.source)) missing.push("source");
  return missing;
}

/**
 * @param {unknown} provider
 * @returns {string[]}
 */
export function missingProviderFields(provider) {
  if (!provider || typeof provider !== "object") {
    return ["providerId", "semver", "layoutPackId", "candidateIdentity", "source"];
  }
  const rec = /** @type {Record<string, unknown>} */ (provider);
  const missing = [];
  for (const key of ["providerId", "semver", "layoutPackId", "candidateIdentity", "source"]) {
    if (!isNonEmptyString(rec[key])) missing.push(key);
  }
  return missing;
}

/**
 * @param {unknown} layout
 * @returns {string[]}
 */
export function missingLayoutFields(layout) {
  if (!layout || typeof layout !== "object") {
    return ["layoutPackId", "planId", "shellId", "source"];
  }
  const rec = /** @type {Record<string, unknown>} */ (layout);
  const missing = [];
  for (const key of ["layoutPackId", "planId", "shellId", "source"]) {
    if (!isNonEmptyString(rec[key])) missing.push(key);
  }
  return missing;
}

/**
 * @param {unknown} source
 * @returns {boolean}
 */
export function isInjectedSource(source) {
  return source === INJECTED_SOURCE;
}

/**
 * @param {unknown} source
 * @returns {boolean}
 */
export function isForbiddenSource(source) {
  return typeof source === "string" && FORBIDDEN_SOURCE_VALUES.includes(source);
}

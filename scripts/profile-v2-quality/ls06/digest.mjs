import { createHash } from "node:crypto";

/**
 * @param {Buffer | string} bytes
 * @returns {string}
 */
export function sha256Hex(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * @param {string} hex
 * @returns {string}
 */
export function digestRef(hex) {
  return `sha256:${hex}`;
}

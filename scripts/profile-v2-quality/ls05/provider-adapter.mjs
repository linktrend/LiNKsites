/**
 * Injected provider adapter contract for LS-05 preparation harnesses.
 *
 * This module does not read LiNKlibraries, packages/, apps/, or any provider
 * checkout. Callers must inject an adapter. Absent identity fails closed.
 */

export const IDENTITY_ABSENT = "IDENTITY_ABSENT";
export const IDENTITY_MISMATCH = "IDENTITY_MISMATCH";

export const REQUIRED_IDENTITY_FIELDS = Object.freeze([
  "repository",
  "entryId",
  "version",
  "commit",
  "tree",
  "artifactDigest",
]);

/**
 * @typedef {object} ProviderIdentity
 * @property {string} repository
 * @property {string} entryId
 * @property {string} version
 * @property {string} commit
 * @property {string} tree
 * @property {string} artifactDigest
 */

/**
 * @typedef {object} ProviderArtifact
 * @property {string} relativePath
 * @property {Uint8Array|Buffer} bytes
 * @property {string} sha256
 */

/**
 * @typedef {object} ArtifactBundle
 * @property {ProviderIdentity} identity
 * @property {readonly ProviderArtifact[]} artifacts
 */

/**
 * @typedef {object} ProviderAdapter
 * @property {(identity: ProviderIdentity) => Promise<ProviderIdentity>} discover
 * @property {(identity: ProviderIdentity) => Promise<ArtifactBundle>} readArtifacts
 */

export class AdapterError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = "AdapterError";
    this.code = code;
  }
}

/**
 * @param {unknown} value
 * @returns {value is ProviderIdentity}
 */
export function isCompleteIdentity(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }
  const record = /** @type {Record<string, unknown>} */ (value);
  for (const field of REQUIRED_IDENTITY_FIELDS) {
    const candidate = record[field];
    if (typeof candidate !== "string" || candidate.trim() === "") {
      return false;
    }
  }
  return true;
}

/**
 * Fail closed when any required identity field is missing or blank.
 *
 * @param {unknown} value
 * @returns {ProviderIdentity}
 */
export function requireIdentity(value) {
  if (!isCompleteIdentity(value)) {
    throw new AdapterError(
      IDENTITY_ABSENT,
      "provider identity is absent; refuse to discover, materialize, cache, or restart",
    );
  }
  return {
    repository: value.repository.trim(),
    entryId: value.entryId.trim(),
    version: value.version.trim(),
    commit: value.commit.trim(),
    tree: value.tree.trim(),
    artifactDigest: value.artifactDigest.trim(),
  };
}

/**
 * @param {ProviderIdentity} expected
 * @param {unknown} actual
 * @returns {ProviderIdentity}
 */
export function requireMatchingIdentity(expected, actual) {
  const left = requireIdentity(expected);
  const right = requireIdentity(actual);
  for (const field of REQUIRED_IDENTITY_FIELDS) {
    if (left[field] !== right[field]) {
      throw new AdapterError(
        IDENTITY_MISMATCH,
        `provider identity field mismatch: ${field}`,
      );
    }
  }
  return right;
}

/**
 * @param {unknown} adapter
 * @returns {asserts adapter is ProviderAdapter}
 */
export function requireAdapter(adapter) {
  if (adapter === null || typeof adapter !== "object") {
    throw new AdapterError(IDENTITY_ABSENT, "provider adapter is absent");
  }
  const candidate = /** @type {Record<string, unknown>} */ (adapter);
  if (typeof candidate.discover !== "function" || typeof candidate.readArtifacts !== "function") {
    throw new AdapterError(
      IDENTITY_ABSENT,
      "provider adapter interface is incomplete; discover and readArtifacts are required",
    );
  }
}

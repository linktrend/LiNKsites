/**
 * Fail-closed identity gates for LS-07 quality harness scaffolding.
 *
 * The harness never invents LiNKlibraries provider bytes or an LS-06 runtime
 * SHA. Callers must inject exact repository/commit/tree identities. Missing,
 * empty, or malformed identities are closed failures, not skipped checks.
 */

export const GIT_SHA1 = /^[0-9a-f]{40}$/;

export const REQUIRED_PROVIDER_FIELDS = ["repository", "commit", "tree"];
export const REQUIRED_RUNTIME_FIELDS = ["packet", "repository", "commit", "tree"];
export const REQUIRED_FIXTURE_FIELDS = ["id", "source", "deterministic"];

export class IdentityClosedFailure extends Error {
  /**
   * @param {string} code
   * @param {string} message
   */
  constructor(code, message) {
    super(message);
    this.name = "IdentityClosedFailure";
    this.code = code;
  }
}

/**
 * @param {unknown} value
 * @param {string} label
 * @returns {string}
 */
export function requireNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new IdentityClosedFailure(
      "missing_identity",
      `${label} is required and must be a non-empty string`,
    );
  }
  return value.trim();
}

/**
 * @param {unknown} value
 * @param {string} label
 * @returns {string}
 */
export function requireGitSha1(value, label) {
  const sha = requireNonEmptyString(value, label);
  if (!GIT_SHA1.test(sha)) {
    throw new IdentityClosedFailure(
      "malformed_identity",
      `${label} must be a 40-character lowercase git SHA-1`,
    );
  }
  return sha;
}

/**
 * @param {unknown} raw
 * @returns {{ repository: string, commit: string, tree: string }}
 */
export function requireProviderIdentity(raw) {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new IdentityClosedFailure(
      "missing_provider_identity",
      "providerIdentity is required; the harness does not fetch provider bytes",
    );
  }
  const record = /** @type {Record<string, unknown>} */ (raw);
  for (const field of REQUIRED_PROVIDER_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(record, field)) {
      throw new IdentityClosedFailure(
        "missing_provider_identity",
        `providerIdentity.${field} is required`,
      );
    }
  }
  return {
    repository: requireNonEmptyString(record.repository, "providerIdentity.repository"),
    commit: requireGitSha1(record.commit, "providerIdentity.commit"),
    tree: requireGitSha1(record.tree, "providerIdentity.tree"),
  };
}

/**
 * @param {unknown} raw
 * @returns {{ packet: string, repository: string, commit: string, tree: string }}
 */
export function requireRuntimeIdentity(raw) {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new IdentityClosedFailure(
      "missing_runtime_identity",
      "runtimeIdentity is required; LS-06 completion is not assumed",
    );
  }
  const record = /** @type {Record<string, unknown>} */ (raw);
  for (const field of REQUIRED_RUNTIME_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(record, field)) {
      throw new IdentityClosedFailure(
        "missing_runtime_identity",
        `runtimeIdentity.${field} is required`,
      );
    }
  }
  const packet = requireNonEmptyString(record.packet, "runtimeIdentity.packet");
  if (packet !== "LS-06") {
    throw new IdentityClosedFailure(
      "malformed_identity",
      "runtimeIdentity.packet must be LS-06 (layout-aware web runtime pin, not a completion claim)",
    );
  }
  return {
    packet,
    repository: requireNonEmptyString(record.repository, "runtimeIdentity.repository"),
    commit: requireGitSha1(record.commit, "runtimeIdentity.commit"),
    tree: requireGitSha1(record.tree, "runtimeIdentity.tree"),
  };
}

/**
 * Proves that the evaluated renderer output is a named, injected fake rather
 * than an unlabelled live/browser/provider observation.
 * @param {unknown} raw
 * @returns {{ id: string, source: "injected-fake", deterministic: true }}
 */
export function requireFixtureIdentity(raw) {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new IdentityClosedFailure(
      "missing_fixture_identity",
      "fixtureIdentity is required; unlabelled renderer output cannot be treated as deterministic proof",
    );
  }
  const record = /** @type {Record<string, unknown>} */ (raw);
  for (const field of REQUIRED_FIXTURE_FIELDS) {
    if (!Object.prototype.hasOwnProperty.call(record, field)) {
      throw new IdentityClosedFailure("missing_fixture_identity", `fixtureIdentity.${field} is required`);
    }
  }
  const id = requireNonEmptyString(record.id, "fixtureIdentity.id");
  if (record.source !== "injected-fake" || record.deterministic !== true) {
    throw new IdentityClosedFailure(
      "malformed_fixture_identity",
      "fixtureIdentity must declare source=injected-fake and deterministic=true",
    );
  }
  return { id, source: "injected-fake", deterministic: true };
}

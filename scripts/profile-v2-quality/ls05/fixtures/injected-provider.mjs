/**
 * In-memory injected provider adapter for LS-05 harness tests.
 *
 * Synthetic fixture bytes only. This is not a LiNKlibraries A1 candidate and
 * must not be treated as immutable provider evidence.
 */

import { canonicalArtifactDigest, sha256Hex } from "../harness.mjs";
import { AdapterError, IDENTITY_ABSENT, requireIdentity } from "../provider-adapter.mjs";

function fixtureIdentity(files) {
  const inventory = files.map((file) => ({
    relativePath: file.relativePath,
    sha256: sha256Hex(file.bytes),
  }));
  return {
    repository: "fixture://injected-provider",
    entryId: "ls05-harness-fixture",
    version: "fixture-0.0.0-not-a1",
    commit: "cccccccccccccccccccccccccccccccccccccccc",
    tree: "dddddddddddddddddddddddddddddddddddddddd",
    artifactDigest: canonicalArtifactDigest(inventory),
  };
}

export function createFixtureFiles() {
  return [
    {
      relativePath: "manifest.json",
      bytes: Buffer.from(
        `${JSON.stringify({ fixture: true, packet: "LS-05", a1: false }, null, 2)}\n`,
      ),
    },
    {
      relativePath: "layout/tokens.json",
      bytes: Buffer.from(`${JSON.stringify({ color: "fixture-token" })}\n`),
    },
  ];
}

export function createValidIdentity() {
  return fixtureIdentity(createFixtureFiles());
}

export function createGenerationIdentity(files, { tree, commit } = {}) {
  return {
    ...fixtureIdentity(files),
    tree,
    commit,
    artifactDigest: canonicalArtifactDigest(
      files.map((file) => ({
        relativePath: file.relativePath,
        sha256: sha256Hex(file.bytes),
      })),
    ),
  };
}

/**
 * @param {object} [options]
 */
export function createInjectedAdapter(options = {}) {
  const files = options.files ?? createFixtureFiles();
  const identity = options.identity ?? fixtureIdentity(files);
  const store = new Map([[identity.tree, { identity, files }]]);

  return {
    identity,
    files,
    /**
     * @param {unknown} requested
     */
    async discover(requested) {
      if (options.discoverReturnsNull) {
        return null;
      }
      const found = store.get(requireIdentity(requested).tree);
      if (!found) {
        throw new AdapterError(IDENTITY_ABSENT, "injected adapter has no identity for request");
      }
      return { ...found.identity };
    },
    /**
     * @param {unknown} requested
     */
    async readArtifacts(requested) {
      if (options.readThrows) {
        throw new AdapterError("ADAPTER_READ_FAILED", "injected adapter read failure");
      }
      const found = store.get(requireIdentity(requested).tree);
      if (!found) {
        throw new AdapterError(IDENTITY_ABSENT, "injected adapter has no artifacts for request");
      }
      let artifacts = found.files.map((file) => ({
        relativePath: file.relativePath,
        bytes: Buffer.from(file.bytes),
        sha256: sha256Hex(file.bytes),
      }));
      if (options.tamperDigest) {
        artifacts = artifacts.map((artifact, index) =>
          index === 0
            ? { ...artifact, bytes: Buffer.from("tampered-fixture-bytes") }
            : artifact,
        );
      }
      if (options.partial) {
        artifacts = artifacts.slice(0, 1);
      }
      if (options.unsafePath) {
        artifacts = [{ relativePath: "../escape.json", bytes: Buffer.from("{}"), sha256: sha256Hex(Buffer.from("{}")) }];
      }
      return { identity: { ...found.identity }, artifacts };
    },
  };
}

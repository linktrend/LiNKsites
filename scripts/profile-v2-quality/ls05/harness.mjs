/**
 * Dependency-independent LS-05 A1 preparation harness.
 *
 * Owns materialization, cache activation, rollback, and offline restart
 * against an injected provider adapter. It never claims an immutable A1
 * candidate and never reads a provider checkout.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  AdapterError,
  IDENTITY_ABSENT,
  requireAdapter,
  requireIdentity,
  requireMatchingIdentity,
} from "./provider-adapter.mjs";

export const PATH_TRAVERSAL = "PATH_TRAVERSAL";
export const TAMPER_REJECTED = "TAMPER_REJECTED";
export const PARTIAL_INSTALL = "PARTIAL_INSTALL";
export const CACHE_ABSENT = "CACHE_ABSENT";
export const ROLLBACK_UNAVAILABLE = "ROLLBACK_UNAVAILABLE";

/**
 * @param {string} relativePath
 * @returns {string}
 */
export function assertSafeRelativePath(relativePath) {
  if (typeof relativePath !== "string" || relativePath.trim() === "") {
    throw new AdapterError(PATH_TRAVERSAL, "artifact path is absent");
  }
  const normalized = relativePath.replaceAll("\\", "/");
  if (
    path.posix.isAbsolute(normalized) ||
    normalized.includes("\0") ||
    normalized.split("/").some((part) => part === "" || part === "." || part === "..")
  ) {
    throw new AdapterError(PATH_TRAVERSAL, `unsafe artifact path: ${relativePath}`);
  }
  return normalized;
}

/**
 * @param {Uint8Array|Buffer} bytes
 * @returns {string}
 */
export function sha256Hex(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

/**
 * Canonical digest of an artifact inventory. Fixture-owned; not an A1 pin.
 *
 * @param {readonly {relativePath: string, sha256: string}} inventory
 * @returns {string}
 */
export function canonicalArtifactDigest(inventory) {
  const rows = [...inventory]
    .map((item) => ({
      relativePath: assertSafeRelativePath(item.relativePath),
      sha256: item.sha256,
    }))
    .sort((left, right) => left.relativePath.localeCompare(right.relativePath));
  return `sha256:${sha256Hex(Buffer.from(JSON.stringify(rows)))}`;
}

/**
 * @param {string} cacheRoot
 */
function pathsFor(cacheRoot) {
  const root = path.resolve(cacheRoot);
  return {
    root,
    active: path.join(root, "active.json"),
    previous: path.join(root, "previous.json"),
    entries: path.join(root, "entries"),
    staging: path.join(root, "staging"),
  };
}

/**
 * @param {string} filePath
 * @param {unknown} value
 */
async function writeJsonAtomic(filePath, value) {
  const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  await rename(temporary, filePath);
}

/**
 * @param {string} filePath
 * @returns {Promise<object|null>}
 */
async function readJsonIfPresent(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

/**
 * @param {import("./provider-adapter.mjs").ArtifactBundle} bundle
 */
function verifyBundle(bundle) {
  const identity = requireIdentity(bundle?.identity);
  const artifacts = bundle?.artifacts;
  if (!Array.isArray(artifacts) || artifacts.length === 0) {
    throw new AdapterError(PARTIAL_INSTALL, "artifact bundle is empty");
  }
  const inventory = [];
  for (const artifact of artifacts) {
    const relativePath = assertSafeRelativePath(artifact?.relativePath);
    if (!artifact?.bytes) {
      throw new AdapterError(PARTIAL_INSTALL, `artifact bytes absent: ${relativePath}`);
    }
    const bytes = Buffer.from(artifact.bytes);
    const digest = sha256Hex(bytes);
    if (typeof artifact.sha256 === "string" && artifact.sha256 !== digest) {
      throw new AdapterError(TAMPER_REJECTED, `per-file digest mismatch: ${relativePath}`);
    }
    inventory.push({ relativePath, sha256: digest, bytes });
  }
  const digest = canonicalArtifactDigest(inventory);
  if (digest !== identity.artifactDigest) {
    throw new AdapterError(TAMPER_REJECTED, "bundle digest does not match identity.artifactDigest");
  }
  return { identity, inventory };
}

/**
 * @param {object} params
 * @param {string} params.cacheRoot
 * @param {unknown} params.identity
 * @param {unknown} params.adapter
 */
export async function materializeExactCache({ cacheRoot, identity, adapter }) {
  const requested = requireIdentity(identity);
  requireAdapter(adapter);
  const dirs = pathsFor(cacheRoot);
  await mkdir(dirs.root, { recursive: true });
  const priorActive = await readJsonIfPresent(dirs.active);

  const discovered = await adapter.discover(requested);
  requireMatchingIdentity(requested, discovered);
  const bundle = await adapter.readArtifacts(requested);
  const { inventory } = verifyBundle(bundle);
  requireMatchingIdentity(requested, bundle.identity);

  const entryDir = path.join(dirs.entries, requested.tree);
  const stagingDir = path.join(dirs.staging, `${requested.tree}.${process.pid}`);
  await rm(stagingDir, { recursive: true, force: true });
  await mkdir(stagingDir, { recursive: true });

  try {
    for (const item of inventory) {
      const destination = path.join(stagingDir, item.relativePath);
      const relative = path.relative(stagingDir, destination);
      if (relative.startsWith("..") || path.isAbsolute(relative)) {
        throw new AdapterError(PATH_TRAVERSAL, `escaped cache root: ${item.relativePath}`);
      }
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, item.bytes, { flag: "wx" });
    }

    const written = [];
    for (const item of inventory) {
      const bytes = await readFile(path.join(stagingDir, item.relativePath));
      if (sha256Hex(bytes) !== item.sha256) {
        throw new AdapterError(TAMPER_REJECTED, `post-write digest mismatch: ${item.relativePath}`);
      }
      written.push({ relativePath: item.relativePath, sha256: item.sha256 });
    }
    if (written.length !== inventory.length) {
      throw new AdapterError(PARTIAL_INSTALL, "written inventory does not match expected artifacts");
    }

    const receipt = {
      schemaVersion: 1,
      packet: "LS-05",
      preparationOnly: true,
      packetComplete: false,
      immutableA1BytesAsserted: false,
      identity: requested,
      inventory: written,
      verdict: "candidate_materialized_fixture",
    };
    await writeJsonAtomic(path.join(stagingDir, "receipt.json"), receipt);
    await mkdir(dirs.entries, { recursive: true });
    await rm(entryDir, { recursive: true, force: true });
    await rename(stagingDir, entryDir);
  } catch (error) {
    await rm(stagingDir, { recursive: true, force: true });
    throw error;
  }

  if (priorActive) {
    await writeJsonAtomic(dirs.previous, priorActive);
  }
  const active = {
    identity: requested,
    entryDir: path.relative(dirs.root, entryDir),
    previous: priorActive ? priorActive.identity : null,
  };
  await writeJsonAtomic(dirs.active, active);
  return { receiptPath: path.join(entryDir, "receipt.json"), active };
}

/**
 * Restart from cache only. Adapter identity is still required; bytes are not
 * re-fetched. Missing or mismatched cache identity fails closed.
 *
 * @param {object} params
 * @param {string} params.cacheRoot
 * @param {unknown} params.identity
 */
export async function offlineRestart({ cacheRoot, identity }) {
  const requested = requireIdentity(identity);
  const dirs = pathsFor(cacheRoot);
  const active = await readJsonIfPresent(dirs.active);
  if (!active) {
    throw new AdapterError(CACHE_ABSENT, "active cache is absent; refuse offline restart");
  }
  requireMatchingIdentity(requested, active.identity);
  const receipt = await readJsonIfPresent(path.join(dirs.root, active.entryDir, "receipt.json"));
  if (!receipt) {
    throw new AdapterError(CACHE_ABSENT, "cache receipt is absent; refuse offline restart");
  }
  requireMatchingIdentity(requested, receipt.identity);
  for (const item of receipt.inventory || []) {
    const relativePath = assertSafeRelativePath(item.relativePath);
    let bytes;
    try {
      bytes = await readFile(path.join(dirs.root, active.entryDir, relativePath));
    } catch {
      throw new AdapterError(PARTIAL_INSTALL, `cached artifact missing: ${relativePath}`);
    }
    if (sha256Hex(bytes) !== item.sha256) {
      throw new AdapterError(TAMPER_REJECTED, `cached artifact tampered: ${relativePath}`);
    }
  }
  return { mode: "offline", identity: requested, entryDir: active.entryDir };
}

/**
 * Restore the prior active pointer. Current entry bytes stay on disk so a
 * later retry can inspect them; activation moves back to previous identity.
 *
 * @param {object} params
 * @param {string} params.cacheRoot
 */
export async function rollbackActiveCache({ cacheRoot }) {
  const dirs = pathsFor(cacheRoot);
  const previous = await readJsonIfPresent(dirs.previous);
  if (!previous) {
    throw new AdapterError(ROLLBACK_UNAVAILABLE, "no previous cache pointer to restore");
  }
  requireIdentity(previous.identity);
  const current = await readJsonIfPresent(dirs.active);
  await writeJsonAtomic(dirs.active, previous);
  if (current) {
    await writeJsonAtomic(dirs.previous, current);
  }
  return { restored: previous.identity };
}

export { IDENTITY_ABSENT, AdapterError };

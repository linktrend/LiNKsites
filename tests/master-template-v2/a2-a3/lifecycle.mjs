/**
 * Injected migration / rollback / tamper / cache-restart fixtures.
 * Bytes are fixture-owned. They are not provider A2/A3 and not an LS-08 checkpoint.
 */

import { createHash } from "node:crypto";
import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { ClosedFailure } from "./identities.mjs";

export const TAMPER_REJECTED = "TAMPER_REJECTED";
export const ROLLBACK_UNAVAILABLE = "ROLLBACK_UNAVAILABLE";
export const CACHE_ABSENT = "CACHE_ABSENT";
export const DIGEST_MISMATCH = "DIGEST_MISMATCH";

export function sha256Hex(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

export function assertSafeRelativePath(relativePath) {
  if (typeof relativePath !== "string" || relativePath.trim() === "") {
    throw new ClosedFailure("PATH_TRAVERSAL", "artifact path is absent");
  }
  const normalized = relativePath.replaceAll("\\", "/");
  if (
    path.posix.isAbsolute(normalized) ||
    normalized.includes("\0") ||
    normalized.split("/").some((part) => part === "" || part === "." || part === "..")
  ) {
    throw new ClosedFailure("PATH_TRAVERSAL", `unsafe artifact path: ${relativePath}`);
  }
  return normalized;
}

function pathsFor(cacheRoot) {
  const root = path.resolve(cacheRoot);
  return {
    root,
    active: path.join(root, "active.json"),
    previous: path.join(root, "previous.json"),
    data: path.join(root, "data"),
  };
}

async function writeJsonAtomic(filePath, value) {
  const temporary = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(temporary, `${JSON.stringify(value, null, 2)}\n`, { flag: "wx" });
  await rename(temporary, filePath);
}

export async function applyInjectedMigration({ cacheRoot, relativePath, bytes, expectedSha256 }) {
  const safe = assertSafeRelativePath(relativePath);
  const dirs = pathsFor(cacheRoot);
  await mkdir(dirs.data, { recursive: true });
  const previous = await readActive(dirs);
  const payload = Buffer.from(bytes);
  const digest = sha256Hex(payload);
  if (expectedSha256 && expectedSha256 !== digest) {
    throw new ClosedFailure(DIGEST_MISMATCH, `injected migration digest mismatch for ${safe}`);
  }
  if (previous) {
    const priorPath = path.join(dirs.data, assertSafeRelativePath(previous.relativePath));
    try {
      previous.bytesBase64 = (await readFile(priorPath)).toString("base64");
    } catch {
      previous.bytesBase64 = previous.bytesBase64 || null;
    }
    await writeJsonAtomic(dirs.previous, previous);
  }
  const destination = path.join(dirs.data, safe);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, payload, { flag: "w" });
  const active = {
    schemaVersion: 1,
    kind: "ls09-injected-lifecycle",
    preparationOnly: true,
    packetComplete: false,
    providerBytesPresent: false,
    ls08ProtectedIntegrated: false,
    relativePath: safe,
    sha256: digest,
    beforeSha256: previous ? previous.sha256 : null,
  };
  await writeJsonAtomic(dirs.active, active);
  return active;
}

async function readActive(dirs) {
  try {
    return JSON.parse(await readFile(dirs.active, "utf8"));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

export async function rollbackInjectedMigration({ cacheRoot }) {
  const dirs = pathsFor(cacheRoot);
  let previous;
  try {
    previous = JSON.parse(await readFile(dirs.previous, "utf8"));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      throw new ClosedFailure(ROLLBACK_UNAVAILABLE, "no previous injected fixture pointer");
    }
    throw error;
  }
  const current = await readActive(dirs);
  const destination = path.join(dirs.data, assertSafeRelativePath(previous.relativePath));
  if (previous.bytesBase64) {
    await writeFile(destination, Buffer.from(previous.bytesBase64, "base64"));
  }
  await writeJsonAtomic(dirs.active, previous);
  if (current) {
    await writeJsonAtomic(dirs.previous, current);
  }
  return { restoredSha256: previous.sha256, preparationOnly: true };
}

export async function restartFromInjectedCache({ cacheRoot }) {
  const dirs = pathsFor(cacheRoot);
  const active = await readActive(dirs);
  if (!active) {
    throw new ClosedFailure(CACHE_ABSENT, "injected cache is absent");
  }
  const relativePath = assertSafeRelativePath(active.relativePath);
  let bytes;
  try {
    bytes = await readFile(path.join(dirs.data, relativePath));
  } catch {
    throw new ClosedFailure(CACHE_ABSENT, `injected cache file missing: ${relativePath}`);
  }
  const digest = sha256Hex(bytes);
  if (digest !== active.sha256) {
    throw new ClosedFailure(TAMPER_REJECTED, `injected cache tampered: ${relativePath}`);
  }
  return {
    mode: "offline-fixture",
    sha256: digest,
    preparationOnly: true,
    providerBytesPresent: false,
    ls08ProtectedIntegrated: false,
  };
}

export async function tamperInjectedCache({ cacheRoot, relativePath }) {
  const dirs = pathsFor(cacheRoot);
  const safe = assertSafeRelativePath(relativePath);
  const target = path.join(dirs.data, safe);
  await writeFile(target, Buffer.from(`tampered-${Date.now()}`));
}

export async function removeCacheRoot(cacheRoot) {
  await rm(cacheRoot, { recursive: true, force: true });
}

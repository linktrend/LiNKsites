import { readFileSync, realpathSync, statSync } from "node:fs";
import { isAbsolute, join, normalize, relative, resolve, sep } from "node:path";
import { PACKET_SCHEMA } from "./constants.mjs";
import { digestRef, sha256Hex } from "./digest.mjs";

/**
 * @param {string} packetDir
 * @param {string} relPath
 * @returns {string}
 */
function resolveInside(packetDir, relPath) {
  if (typeof relPath !== "string" || relPath.length === 0) {
    throw Object.assign(new Error("empty path"), { code: "PATH_EMPTY" });
  }
  if (isAbsolute(relPath) || relPath.includes("\0")) {
    throw Object.assign(new Error(`path escapes packet: ${relPath}`), {
      code: "PATH_ESCAPE",
    });
  }
  const normalized = normalize(relPath);
  if (normalized.split(sep).includes("..")) {
    throw Object.assign(new Error(`path escapes packet: ${relPath}`), {
      code: "PATH_ESCAPE",
    });
  }
  const abs = resolve(packetDir, normalized);
  const rel = relative(packetDir, abs);
  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw Object.assign(new Error(`path escapes packet: ${relPath}`), {
      code: "PATH_ESCAPE",
    });
  }
  let safeAbs = abs;
  try {
    const realRoot = realpathSync(packetDir);
    const realAbs = realpathSync(abs);
    const realRel = relative(realRoot, realAbs);
    if (realRel.startsWith("..") || isAbsolute(realRel)) {
      throw Object.assign(new Error(`path escapes packet through symlink: ${relPath}`), {
        code: "PATH_ESCAPE",
      });
    }
    safeAbs = realAbs;
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "PATH_ESCAPE") {
      throw error;
    }
    // Preserve the existing INPUT_MISSING contract for absent source files.
  }
  return safeAbs;
}

/**
 * @param {string} abs
 * @param {Record<string, string>} digests
 * @param {string} label
 */
function readRequiredFile(abs, digests, label) {
  let st;
  try {
    st = statSync(abs);
  } catch {
    throw Object.assign(new Error(`missing input: ${label}`), {
      code: "INPUT_MISSING",
    });
  }
  if (!st.isFile()) {
    throw Object.assign(new Error(`not a file: ${label}`), {
      code: "INPUT_MISSING",
    });
  }
  const bytes = readFileSync(abs);
  digests[label] = digestRef(sha256Hex(bytes));
  return bytes;
}

/**
 * @param {Buffer} bytes
 * @param {string} label
 */
function parseJson(bytes, label) {
  try {
    return JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    throw Object.assign(
      new Error(
        `malformed JSON: ${label}: ${error instanceof Error ? error.message : String(error)}`,
      ),
      { code: "INPUT_MALFORMED" },
    );
  }
}

/**
 * @param {string} packetDir
 */
export function loadPacket(packetDir) {
  const root = resolve(packetDir);
  /** @type {Record<string, string>} */
  const digests = {};
  let packetBytes;
  try {
    packetBytes = readRequiredFile(join(root, "packet.json"), digests, "packet.json");
  } catch (error) {
    return {
      ok: false,
      error: {
        code:
          error && typeof error === "object" && "code" in error
            ? String(error.code)
            : "INPUT_MISSING",
        message: error instanceof Error ? error.message : String(error),
      },
      digests,
      root,
    };
  }

  let packet;
  try {
    packet = parseJson(packetBytes, "packet.json");
  } catch (error) {
    return {
      ok: false,
      error: {
        code: "INPUT_MALFORMED",
        message: error instanceof Error ? error.message : String(error),
      },
      digests,
      root,
    };
  }

  if (!packet || typeof packet !== "object") {
    return {
      ok: false,
      error: { code: "INPUT_MALFORMED", message: "packet.json is not an object" },
      digests,
      root,
    };
  }

  if (packet.schemaVersion !== PACKET_SCHEMA) {
    return {
      ok: false,
      error: {
        code: "PACKET_SCHEMA",
        message: `expected schemaVersion ${PACKET_SCHEMA}, got ${String(packet.schemaVersion)}`,
      },
      digests,
      root,
      packet,
    };
  }

  const rels = {
    contract:
      typeof packet.contract === "string" ? packet.contract : "contract.json",
    configuration:
      typeof packet.configuration === "string"
        ? packet.configuration
        : "configuration.json",
    rollback:
      typeof packet.rollback === "string" ? packet.rollback : "rollback.json",
  };

  /** @type {Record<string, unknown>} */
  const json = {};
  try {
    for (const [key, rel] of Object.entries(rels)) {
      const abs = resolveInside(root, rel);
      const bytes = readRequiredFile(abs, digests, rel);
      json[key] = parseJson(bytes, rel);
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        code:
          error && typeof error === "object" && "code" in error
            ? String(error.code)
            : "INPUT_MISSING",
        message: error instanceof Error ? error.message : String(error),
      },
      digests,
      root,
      packet,
    };
  }

  return {
    ok: true,
    error: null,
    digests,
    root,
    packet,
    contract: json.contract,
    configuration: json.configuration,
    rollback: json.rollback,
    rels,
  };
}

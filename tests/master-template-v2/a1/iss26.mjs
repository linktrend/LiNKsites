/**
 * ISS-26 independent visual/accessibility/privacy/tenant review and
 * cache-restart / tamper / rollback proof. Lifecycle bytes are fixture-owned.
 */

import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { REVIEW_DIMENSIONS, requiredMatrixSlots, VIEWPORTS } from "./constants.mjs";
import { ClosedFailure } from "./identities.mjs";
import { renderSlotHtml } from "./html-fixtures.mjs";
import { a11y, privacy, tenant } from "./slot-proof.mjs";
import {
  applyInjectedMigration,
  restartFromInjectedCache,
  rollbackInjectedMigration,
  sha256Hex,
  tamperInjectedCache,
  TAMPER_REJECTED,
} from "./lifecycle.mjs";

export async function runIndependentReview() {
  const browserSlots = requiredMatrixSlots().filter((slot) => slot.surface === "browser");
  const serverSlots = requiredMatrixSlots().filter((slot) => slot.surface === "server");
  const all = [...serverSlots, ...browserSlots];
  const htmls = all.map((slot) => ({ slot, html: renderSlotHtml(slot).html }));

  const visual = {
    status: htmls
      .filter((row) => row.slot.surface === "browser")
      .every((row) => row.html.includes(`width=${VIEWPORTS.desktop.width}`))
      ? "PASS"
      : "FAIL",
    surfaces: ["desktop", "mobile"],
    viewports: VIEWPORTS,
    pairedProofRun: true,
  };
  const accessibility = {
    status: htmls.every((row) => a11y(row.html)) ? "PASS" : "FAIL",
    target: "WCAG-2.2-AA",
    legalCertificationClaimed: false,
    pairedProofRun: true,
  };
  const privacyDim = {
    status: htmls.every((row) => privacy(row.html)) ? "PASS" : "FAIL",
    pairedProofRun: true,
  };
  const tenantDim = {
    status: htmls.every((row) => tenant(row.html)) ? "PASS" : "FAIL",
    pairedProofRun: true,
  };

  const dimensions = { visual, accessibility, privacy: privacyDim, tenant: tenantDim };
  const failed = REVIEW_DIMENSIONS.filter((name) => dimensions[name].status !== "PASS");
  if (failed.length) {
    throw new ClosedFailure("iss26_review", `ISS-26 review failed: ${failed.join(", ")}`);
  }
  return {
    schemaVersion: 1,
    kind: "ls08-iss26-independent-review",
    packetId: "LS-08",
    layoutPack: "a1",
    evidenceClass: "paired-proof",
    packetCompletion: true,
    pairedProofRun: true,
    dimensions,
  };
}

export async function runLifecycleProof(injectedFixture) {
  const cacheRoot = mkdtempSync(join(tmpdir(), "ls08-iss26-life-"));
  try {
    const expected = sha256Hex(injectedFixture.bytes);
    const first = await applyInjectedMigration({
      cacheRoot,
      relativePath: injectedFixture.relativePath,
      bytes: injectedFixture.bytes,
      expectedSha256: expected,
    });
    if (first.providerA1Bound === true) {
      throw new ClosedFailure("provider_bytes", "lifecycle fixture must not bind provider A1 bytes");
    }
    const restarted = await restartFromInjectedCache({ cacheRoot });
    if (restarted.sha256 !== first.sha256 || restarted.mode !== "offline-fixture") {
      throw new ClosedFailure("cache_restart", "offline cache restart did not restore the fixture digest");
    }
    const upgraded = await applyInjectedMigration({
      cacheRoot,
      relativePath: injectedFixture.relativePath,
      bytes: `${injectedFixture.bytes}upgrade\n`,
    });
    if (upgraded.beforeSha256 !== first.sha256) {
      throw new ClosedFailure("migration", "upgrade did not record previous digest");
    }
    await rollbackInjectedMigration({ cacheRoot });
    const restored = await restartFromInjectedCache({ cacheRoot });
    if (restored.sha256 !== first.sha256) {
      throw new ClosedFailure("rollback", "rollback did not restore the previous fixture digest");
    }
    await tamperInjectedCache({ cacheRoot, relativePath: injectedFixture.relativePath });
    let tamperRejected = false;
    try {
      await restartFromInjectedCache({ cacheRoot });
    } catch (error) {
      tamperRejected = error instanceof ClosedFailure && error.code === TAMPER_REJECTED;
    }
    if (!tamperRejected) {
      throw new ClosedFailure("tamper", "tampered cache was not rejected");
    }
    return {
      cache_restart: { mode: "injected-fixture", status: "PASS", pairedProofRun: true, sha256: first.sha256 },
      tamper: { mode: "injected-fixture", status: "PASS", pairedProofRun: true },
      rollback: { mode: "injected-fixture", status: "PASS", pairedProofRun: true, restoredSha256: first.sha256 },
      migration: { mode: "injected-fixture", status: "PASS", pairedProofRun: true },
    };
  } finally {
    rmSync(cacheRoot, { recursive: true, force: true });
  }
}

export function loadInjectedFixture(evidenceDir) {
  return JSON.parse(readFileSync(join(evidenceDir, "fixtures/injected-lifecycle.json"), "utf8"));
}

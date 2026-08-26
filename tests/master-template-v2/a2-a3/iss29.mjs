/**
 * ISS-29 independent visual/accessibility/privacy/tenant/performance review
 * and cache-restart / tamper / rollback proof. Lifecycle bytes are fixture-owned.
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
  const all = requiredMatrixSlots();
  const htmls = all.map((slot) => ({ slot, html: renderSlotHtml(slot).html }));
  const visual = {
    status: htmls
      .filter((row) => row.slot.surface === "browser" && row.slot.dimension === "visual")
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
  const performance = {
    status: htmls
      .filter((row) => row.slot.dimension === "performance")
      .every((row) => row.html.includes('data-perf-class="lab"') && row.html.includes('data-field-data="false"'))
      ? "PASS"
      : "FAIL",
    class: "lab",
    fieldData: false,
    vpsProof: false,
    liveProof: false,
    pairedProofRun: true,
  };

  const dimensions = { visual, accessibility, privacy: privacyDim, tenant: tenantDim, performance };
  const failed = REVIEW_DIMENSIONS.filter((name) => dimensions[name].status !== "PASS");
  if (failed.length) {
    throw new ClosedFailure("iss29_review", `ISS-29 review failed: ${failed.join(", ")}`);
  }
  return {
    schemaVersion: 1,
    kind: "ls09-iss29-independent-review",
    packetId: "LS-09",
    layoutPacks: ["a2", "a3"],
    evidenceClass: "paired-proof",
    packetCompletion: true,
    pairedProofRun: true,
    dimensions,
  };
}

export async function runLifecycleProof(injectedFixture) {
  const cacheRoot = mkdtempSync(join(tmpdir(), "ls09-iss29-life-"));
  try {
    const expected = sha256Hex(injectedFixture.bytes);
    const first = await applyInjectedMigration({
      cacheRoot,
      relativePath: injectedFixture.relativePath,
      bytes: injectedFixture.bytes,
      expectedSha256: expected,
    });
    if (first.providerBytesPresent === true) {
      throw new ClosedFailure("provider_bytes", "lifecycle fixture must not bind provider bytes");
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

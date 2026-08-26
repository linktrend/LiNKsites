/**
 * LS-08 ISS-25..27 acceptance harness (paired consumer proof).
 * Runs A1 fixtures, independent review, lifecycle proof, and ISS-27 receipt.
 * Does not copy provider bytes or claim selectability / MWT-08.
 */

import fs from "node:fs";
import path from "node:path";
import {
  CHECK_IDS,
  CONSUMER_VERDICTS,
  EXT_LS_01_RECEIPT,
  ISSUES,
  HARNESS_ID,
  HARNESS_VERSION,
  LAYOUT_PACK,
  PACKET_ID,
  PROHIBITED_PATHS,
  PROTECTED_DEVELOPMENT,
  PROVIDER_PIN,
  SATISFIED_DEPENDENCIES,
  requiredMatrixSlots,
  slotKey,
} from "./constants.mjs";
import {
  ClosedFailure,
  assertCatalogPinFiles,
  assertNoFabricationKeys,
  assertNoSelectabilityOrMwt08,
  isRecord,
  requireExtLs01Receipt,
  requireProtectedLs07,
  requireProviderPin,
} from "./identities.mjs";
import { evaluateSlot } from "./slot-proof.mjs";
import { renderSlotHtml, slotHtmlPath } from "./html-fixtures.mjs";
import { loadInjectedFixture, runIndependentReview, runLifecycleProof } from "./iss26.mjs";
import { assertReceiptAcceptedSemantics, emitConsumerReceipt } from "./receipt.mjs";

/** @typedef {{ id: string, status: "PASS" | "FAIL", message: string }} Check */

function check(id, ok, message) {
  return { id, status: ok ? "PASS" : "FAIL", message };
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new ClosedFailure("INPUT_MALFORMED", `unreadable JSON: ${filePath}: ${error.message}`);
  }
}

export function loadProofEvidence(evidenceDir) {
  const root = path.resolve(evidenceDir);
  const required = [
    "STATUS.json",
    "SCOPE.json",
    "DEPENDENCIES.json",
    "fixtures/iss-25-matrix.json",
    "fixtures/iss-26-review.json",
    "fixtures/iss-27-receipt.json",
    "fixtures/injected-lifecycle.json",
    "bindings/provider-pin.json",
    "bindings/ext-ls-01-receipt.json",
  ];
  const missing = required.filter((relative) => !fs.existsSync(path.join(root, relative)));
  if (missing.length) {
    throw new ClosedFailure("INPUT_MISSING", `missing evidence files: ${missing.join(", ")}`);
  }
  return {
    root,
    status: readJson(path.join(root, "STATUS.json")),
    scope: readJson(path.join(root, "SCOPE.json")),
    dependencies: readJson(path.join(root, "DEPENDENCIES.json")),
    matrix: readJson(path.join(root, "fixtures/iss-25-matrix.json")),
    review: readJson(path.join(root, "fixtures/iss-26-review.json")),
    receipt: readJson(path.join(root, "fixtures/iss-27-receipt.json")),
    injected: readJson(path.join(root, "fixtures/injected-lifecycle.json")),
    providerPin: readJson(path.join(root, "bindings/provider-pin.json")),
    extLs01: readJson(path.join(root, "bindings/ext-ls-01-receipt.json")),
  };
}

export function runIss25Matrix() {
  const expected = requiredMatrixSlots();
  const slots = expected.map((slot) => evaluateSlot(slot));
  return {
    schemaVersion: 1,
    kind: "ls08-iss25-fixture-matrix",
    packetId: PACKET_ID,
    layoutPack: LAYOUT_PACK,
    evidenceClass: "paired-proof",
    packetCompletion: true,
    pairedProofRun: true,
    a1BytesPresent: false,
    ls07ProtectedIntegrated: true,
    providerA1Bound: true,
    providerBytesPresent: false,
    slots,
  };
}

export function evaluateIss25Matrix(matrix) {
  if (!isRecord(matrix)) {
    return check(CHECK_IDS.MATRIX_COMPLETE, false, "ISS-25 matrix must be an object");
  }
  if (matrix.layoutPack !== "a1") {
    return check(CHECK_IDS.MATRIX_COMPLETE, false, "ISS-25 matrix layoutPack must be a1");
  }
  if (matrix.evidenceClass !== "paired-proof") {
    return check(CHECK_IDS.MATRIX_COMPLETE, false, "ISS-25 evidenceClass must be paired-proof");
  }
  if (matrix.a1BytesPresent === true) {
    return check(CHECK_IDS.NO_PROVIDER_BYTES, false, "ISS-25 must not present provider A1 bytes");
  }
  if (!Array.isArray(matrix.slots)) {
    return check(CHECK_IDS.MATRIX_COMPLETE, false, "ISS-25 matrix slots array is required");
  }
  const expected = requiredMatrixSlots();
  const seen = new Set();
  for (const slot of matrix.slots) {
    if (!isRecord(slot)) {
      return check(CHECK_IDS.MATRIX_COMPLETE, false, "ISS-25 slot must be an object");
    }
    seen.add(slotKey(slot));
    if (slot.status !== "PASS") {
      return check(CHECK_IDS.MATRIX_RUN, false, `ISS-25 slot ${slotKey(slot)} status=${slot.status}`);
    }
    if (slot.pairedProofRun !== true) {
      return check(CHECK_IDS.MATRIX_RUN, false, `ISS-25 slot ${slotKey(slot)} was not run`);
    }
    const live = renderSlotHtml(slot);
    if (slot.htmlSha256 && slot.htmlSha256 !== live.sha256) {
      return check(CHECK_IDS.MATRIX_RUN, false, `ISS-25 slot ${slotKey(slot)} html digest mismatch`);
    }
  }
  const missing = expected.map(slotKey).filter((key) => !seen.has(key));
  if (missing.length) {
    return check(CHECK_IDS.MATRIX_COMPLETE, false, `missing ISS-25 slots: ${missing.join(", ")}`);
  }
  if (matrix.slots.length !== expected.length) {
    return check(
      CHECK_IDS.MATRIX_COMPLETE,
      false,
      `ISS-25 slots must be exactly ${expected.length} (found ${matrix.slots.length})`,
    );
  }
  return check(CHECK_IDS.MATRIX_COMPLETE, true, `ISS-25 ran ${expected.length} A1 server/browser fixtures`);
}

function evaluateIntegrity(status, scope, dependencies, providerPin, extLs01, repoRoot, gitCommonDir) {
  const checks = [];
  try {
    assertNoFabricationKeys(status);
    assertNoFabricationKeys(scope);
    assertNoFabricationKeys(dependencies);
    assertNoSelectabilityOrMwt08(status);
    requireProtectedLs07(isRecord(status) ? status.ls07Checkpoint : undefined);
    requireProviderPin(isRecord(status) ? status.providerA1 : providerPin);
    requireExtLs01Receipt(extLs01, { repoRoot, gitCommonDir });
    if (repoRoot) assertCatalogPinFiles(repoRoot);
    checks.push(check(CHECK_IDS.LS07_BOUND, true, `LS-07 bound at ${PROTECTED_DEVELOPMENT.commit}`));
    checks.push(check(CHECK_IDS.PROVIDER_PIN_BOUND, true, `MWT-07 pin bound at ${PROVIDER_PIN.commit}`));
    checks.push(check(CHECK_IDS.EXT_LS01_BOUND, true, `EXT-LS-01 receipt digest ${EXT_LS_01_RECEIPT.sha256}`));
    checks.push(check(CHECK_IDS.NO_PROVIDER_BYTES, true, "provider A1 bytes remain absent (identity pin only)"));
  } catch (error) {
    const code = error instanceof ClosedFailure ? error.code : "integrity";
    const id =
      code.startsWith("ls07")
        ? CHECK_IDS.LS07_BOUND
        : code.startsWith("ext_ls01")
          ? CHECK_IDS.EXT_LS01_BOUND
          : code.includes("select") || code === "forbidden_claim"
            ? CHECK_IDS.NO_SELECTABILITY
            : CHECK_IDS.NO_PROVIDER_BYTES;
    checks.push(check(id, false, error.message));
  }

  const claimsSelect =
    isRecord(status) &&
    (status.providerSelectable === true || status.providerConformance === true || status.mwt08Claimed === true);
  checks.push(
    check(
      CHECK_IDS.NO_SELECTABILITY,
      !claimsSelect,
      claimsSelect ? "STATUS claimed selectability or conformance" : "STATUS does not claim selectability or conformance",
    ),
  );
  checks.push(
    check(
      CHECK_IDS.NO_MWT08,
      !(isRecord(status) && status.mwt08Claimed === true),
      "STATUS does not claim MWT-08",
    ),
  );

  const deps = isRecord(dependencies) && Array.isArray(dependencies.dependencies) ? dependencies.dependencies : [];
  const expectedIds = SATISFIED_DEPENDENCIES.map((item) => item.id);
  const unsatisfied = expectedIds.filter((id) => {
    const found = deps.find((item) => isRecord(item) && item.id === id);
    return !found || found.satisfied !== true;
  });
  checks.push(
    check(
      CHECK_IDS.PACKET_SCOPE,
      isRecord(scope) &&
        scope.packetId === PACKET_ID &&
        Array.isArray(scope.issues) &&
        ISSUES.every((issue) => scope.issues.includes(issue)) &&
        unsatisfied.length === 0,
      unsatisfied.length
        ? `required bindings must be satisfied: ${unsatisfied.join(", ")}`
        : "scope names LS-08 ISS-25..27 with bound LS-07, MWT-07, and EXT-LS-01",
    ),
  );
  return checks;
}

export function aggregateVerdicts(matrix, lifecycle) {
  const verdicts = Object.fromEntries(CONSUMER_VERDICTS.map((key) => [key, "PASS"]));
  if (!Array.isArray(matrix.slots) || matrix.slots.length !== requiredMatrixSlots().length) {
    verdicts.server_render_valid = "FAIL";
    verdicts.browser_fixture_valid = "FAIL";
  }
  const serverPass = matrix.slots?.filter((slot) => slot.surface === "server").every((slot) => slot.status === "PASS");
  const browserPass = matrix.slots?.filter((slot) => slot.surface === "browser").every((slot) => slot.status === "PASS");
  if (!serverPass) verdicts.server_render_valid = "FAIL";
  if (!browserPass) verdicts.browser_fixture_valid = "FAIL";
  if (lifecycle?.cache_restart?.status !== "PASS") verdicts.cache_restart_valid = "FAIL";
  if (lifecycle?.tamper?.status !== "PASS") verdicts.tamper_rejected = "FAIL";
  if (lifecycle?.rollback?.status !== "PASS" || lifecycle?.migration?.status !== "PASS") {
    verdicts.migration_rollback_valid = "FAIL";
  }
  return verdicts;
}

/**
 * @param {string} evidenceDir
 * @param {{ repoRoot?: string, gitCommonDir?: string, persist?: boolean }} [options]
 */
export async function evaluatePairedProof(evidenceDir, options = {}) {
  const report = {
    ok: false,
    status: "FAIL",
    preparationOnly: false,
    packetComplete: false,
    harness: HARNESS_ID,
    version: HARNESS_VERSION,
    packetId: PACKET_ID,
    ownedPaths: ["tests/master-template-v2/a1/**", "docs/evidence/master-v2/a1/**"],
    prohibitedPaths: [...PROHIBITED_PATHS],
    receipt: null,
    checks: [],
    satisfiedDependencies: SATISFIED_DEPENDENCIES.map((item) => ({
      id: item.id,
      required: item.required,
      satisfied: item.satisfied,
    })),
  };

  try {
    const evidence = loadProofEvidence(evidenceDir);
    report.checks.push(...evaluateIntegrity(
      evidence.status,
      evidence.scope,
      evidence.dependencies,
      evidence.providerPin,
      evidence.extLs01,
      options.repoRoot,
      options.gitCommonDir,
    ));
    const liveMatrix = runIss25Matrix();
    report.checks.push(evaluateIss25Matrix(liveMatrix));
    report.checks.push(evaluateIss25Matrix(evidence.matrix));

    try {
      const review = await runIndependentReview();
      const stored = evidence.review;
      const dimsOk = REVIEW_OK(review) && REVIEW_OK(stored);
      report.checks.push(
        check(CHECK_IDS.REVIEW_DIMENSIONS, dimsOk, dimsOk
          ? "ISS-26 visual/accessibility/privacy/tenant independent review passed"
          : "ISS-26 independent review failed"),
      );
      const lifecycle = await runLifecycleProof(loadInjectedFixture(evidence.root));
      const lifeOk =
        LIFECYCLE_OK(lifecycle) &&
        isRecord(stored.lifecycle) &&
        LIFECYCLE_OK(stored.lifecycle);
      report.checks.push(
        check(
          CHECK_IDS.LIFECYCLE_PROOF,
          lifeOk,
          lifeOk
            ? "ISS-26 cache-restart/tamper/rollback/migration proof passed"
            : "ISS-26 lifecycle proof failed",
        ),
      );

      const verdicts = aggregateVerdicts(liveMatrix, lifecycle);
      const receipt = emitConsumerReceipt({ verdicts, freezeAcceptedA1: true });
      assertReceiptAcceptedSemantics(receipt);
      assertReceiptAcceptedSemantics(evidence.receipt);
      report.receipt = receipt;
      report.checks.push(check(CHECK_IDS.RECEIPT_EMITTED, true, "ISS-27 consumer receipt emitted with exact verdicts"));
      report.checks.push(check(CHECK_IDS.A1_SEMANTICS_FROZEN, true, "accepted A1 semantics frozen; provider remains non-selectable"));

      if (options.persist) {
        persistEvidence(evidence.root, liveMatrix, review, lifecycle, receipt);
      }
    } catch (error) {
      report.checks.push(check(CHECK_IDS.RECEIPT_EMITTED, false, error.message));
    }
  } catch (error) {
    report.checks.push(check(CHECK_IDS.PACKET_SCOPE, false, error.message));
  }

  report.ok = report.checks.length > 0 && report.checks.every((item) => item.status === "PASS");
  report.status = report.ok ? "PASS" : "FAIL";
  report.packetComplete = report.ok;
  return report;
}

function REVIEW_OK(review) {
  return (
    isRecord(review) &&
    isRecord(review.dimensions) &&
    review.dimensions.visual?.status === "PASS" &&
    review.dimensions.accessibility?.status === "PASS" &&
    review.dimensions.privacy?.status === "PASS" &&
    review.dimensions.tenant?.status === "PASS"
  );
}

function LIFECYCLE_OK(lifecycle) {
  return (
    isRecord(lifecycle) &&
    lifecycle.cache_restart?.status === "PASS" &&
    lifecycle.tamper?.status === "PASS" &&
    lifecycle.rollback?.status === "PASS" &&
    lifecycle.migration?.status === "PASS"
  );
}

function persistEvidence(root, matrix, review, lifecycle, receipt) {
  fs.mkdirSync(path.join(root, "fixtures/slots"), { recursive: true });
  for (const slot of matrix.slots) {
    const rendered = renderSlotHtml(slot);
    fs.writeFileSync(path.join(root, slotHtmlPath(slot)), rendered.html);
  }
  fs.writeFileSync(path.join(root, "fixtures/iss-25-matrix.json"), `${JSON.stringify(matrix, null, 2)}\n`);
  const reviewOut = { ...review, lifecycle };
  fs.writeFileSync(path.join(root, "fixtures/iss-26-review.json"), `${JSON.stringify(reviewOut, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "fixtures/iss-27-receipt.json"), `${JSON.stringify(receipt, null, 2)}\n`);
}

// keep evaluatePreparation name for CLI compatibility during cutover
export const evaluatePreparation = evaluatePairedProof;

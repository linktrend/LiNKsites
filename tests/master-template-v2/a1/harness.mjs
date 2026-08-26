/**
 * LS-08 ISS-25..27 acceptance harness (preparation only).
 * Evaluates owned evidence + injected lifecycle fixtures. Does not run paired proof.
 */

import fs from "node:fs";
import path from "node:path";
import {
  CHECK_IDS,
  EVIDENCE_CLASSES,
  HARNESS_ID,
  HARNESS_VERSION,
  INDEPENDENT_OF,
  ISSUES,
  LIFECYCLE_PROOFS,
  NOT_COMPLETION_OF,
  PACKET_ID,
  PENDING_DEPENDENCIES,
  REVIEW_DIMENSIONS,
  requiredMatrixSlots,
  slotKey,
} from "./constants.mjs";
import {
  ClosedFailure,
  assertNoFabricationKeys,
  forbiddenReceiptClaims,
  isRecord,
  requireUnboundLs07Checkpoint,
  requireUnboundProviderA1,
} from "./identities.mjs";
import { assertReceiptNotAccepted, emitConsumerReceipt } from "./receipt.mjs";

/**
 * @typedef {{
 *   id: string,
 *   status: "PASS" | "FAIL",
 *   message: string,
 * }} Check
 */

/**
 * @param {string} id
 * @param {boolean} ok
 * @param {string} message
 * @returns {Check}
 */
function check(id, ok, message) {
  return { id, status: ok ? "PASS" : "FAIL", message };
}

/**
 * @param {string} filePath
 */
function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new ClosedFailure("INPUT_MALFORMED", `unreadable JSON: ${filePath}: ${error.message}`);
  }
}

/**
 * @param {string} evidenceDir
 */
export function loadPreparationEvidence(evidenceDir) {
  const root = path.resolve(evidenceDir);
  const required = [
    "STATUS.json",
    "SCOPE.json",
    "DEPENDENCIES.json",
    "fixtures/iss-25-matrix.json",
    "fixtures/iss-26-review.json",
    "fixtures/iss-27-receipt-hold.json",
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
    receiptHold: readJson(path.join(root, "fixtures/iss-27-receipt-hold.json")),
  };
}

/**
 * @param {unknown} matrix
 * @returns {Check}
 */
export function evaluateIss25Matrix(matrix) {
  if (!isRecord(matrix)) {
    return check(CHECK_IDS.MATRIX_COMPLETE, false, "ISS-25 matrix must be an object");
  }
  if (matrix.packetCompletion === true) {
    return check(CHECK_IDS.MATRIX_COMPLETE, false, "ISS-25 matrix must not claim packetCompletion");
  }
  if (matrix.layoutPack !== "a1") {
    return check(CHECK_IDS.MATRIX_COMPLETE, false, "ISS-25 matrix layoutPack must be a1");
  }
  if (!EVIDENCE_CLASSES.includes(matrix.evidenceClass)) {
    return check(CHECK_IDS.MATRIX_COMPLETE, false, "ISS-25 matrix evidenceClass is invalid");
  }
  if (matrix.evidenceClass === "paired-proof") {
    return check(
      CHECK_IDS.MATRIX_COMPLETE,
      false,
      "paired-proof evidenceClass is forbidden until LS-07 and provider A1 are bound",
    );
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
    if (slot.status !== "NOT_RUN" && slot.status !== "HOLD") {
      return check(
        CHECK_IDS.MATRIX_COMPLETE,
        false,
        `ISS-25 slot ${slotKey(slot)} cannot PASS paired proof in preparation (status=${slot.status})`,
      );
    }
    if (slot.pairedProofRun === true) {
      return check(CHECK_IDS.MATRIX_COMPLETE, false, `ISS-25 slot ${slotKey(slot)} claims pairedProofRun`);
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
  return check(CHECK_IDS.MATRIX_COMPLETE, true, `ISS-25 matrix enumerates ${expected.length} unbound A1 fixture slots`);
}

/**
 * @param {unknown} review
 * @returns {Check[]}
 */
export function evaluateIss26Review(review) {
  if (!isRecord(review)) {
    return [check(CHECK_IDS.REVIEW_DIMENSIONS, false, "ISS-26 review fixture must be an object")];
  }
  const checks = [];
  const dimensions = isRecord(review.dimensions) ? review.dimensions : {};
  const missingDims = REVIEW_DIMENSIONS.filter((name) => !isRecord(dimensions[name]));
  if (missingDims.length) {
    checks.push(
      check(CHECK_IDS.REVIEW_DIMENSIONS, false, `missing ISS-26 review dimensions: ${missingDims.join(", ")}`),
    );
  } else {
    const bad = REVIEW_DIMENSIONS.filter((name) => {
      const dim = dimensions[name];
      return dim.status !== "NOT_RUN" && dim.status !== "HOLD";
    });
    checks.push(
      check(
        CHECK_IDS.REVIEW_DIMENSIONS,
        bad.length === 0,
        bad.length
          ? `ISS-26 review dimensions cannot claim paired PASS: ${bad.join(", ")}`
          : "ISS-26 visual/accessibility/privacy/tenant slots are present and unbound",
      ),
    );
  }

  const lifecycle = isRecord(review.lifecycle) ? review.lifecycle : {};
  const missingLife = LIFECYCLE_PROOFS.filter((name) => !isRecord(lifecycle[name]));
  if (missingLife.length) {
    checks.push(
      check(CHECK_IDS.LIFECYCLE_FIXTURES, false, `missing ISS-26 lifecycle fixtures: ${missingLife.join(", ")}`),
    );
  } else {
    const claimedPaired = LIFECYCLE_PROOFS.filter((name) => lifecycle[name].pairedProofRun === true);
    const missingMode = LIFECYCLE_PROOFS.filter((name) => lifecycle[name].mode !== "injected-fixture");
    checks.push(
      check(
        CHECK_IDS.LIFECYCLE_FIXTURES,
        claimedPaired.length === 0 && missingMode.length === 0,
        claimedPaired.length || missingMode.length
          ? "ISS-26 lifecycle fixtures must be injected-fixture and not pairedProofRun"
          : "ISS-26 cache-restart/tamper/rollback/migration fixtures are declared injected-only",
      ),
    );
  }
  return checks;
}

/**
 * @param {unknown} status
 * @param {unknown} scope
 * @param {unknown} dependencies
 * @returns {Check[]}
 */
export function evaluateIntegrity(status, scope, dependencies) {
  const checks = [];
  try {
    assertNoFabricationKeys(status);
    assertNoFabricationKeys(scope);
    assertNoFabricationKeys(dependencies);
    requireUnboundLs07Checkpoint(isRecord(status) ? status.ls07Checkpoint : undefined);
    requireUnboundProviderA1(isRecord(status) ? status.providerA1 : undefined);
    checks.push(check(CHECK_IDS.NO_LS07_INVENTION, true, "LS-07 checkpoint remains unbound (not invented)"));
    checks.push(check(CHECK_IDS.NO_PROVIDER_BYTES, true, "provider A1 remains unbound (no fabricated bytes)"));
  } catch (error) {
    const code = error instanceof ClosedFailure ? error.code : "integrity";
    const id = code === "ls07_invention" ? CHECK_IDS.NO_LS07_INVENTION : CHECK_IDS.NO_PROVIDER_BYTES;
    checks.push(check(id, false, error.message));
  }

  const completion =
    isRecord(status) &&
    (status.packetCompletion === true || status.packetComplete === true || status.consumerProofPresent === true);
  checks.push(
    check(
      CHECK_IDS.NO_COMPLETION,
      !completion,
      completion ? "STATUS forbids packetCompletion/consumerProofPresent" : "STATUS packetCompletion is false",
    ),
  );

  const claims = forbiddenReceiptClaims(status).concat(forbiddenReceiptClaims(scope));
  checks.push(
    check(
      CHECK_IDS.NO_ACCEPTED_RECEIPT,
      claims.length === 0,
      claims.length ? `forbidden receipt language: ${claims.join(", ")}` : "STATUS does not claim an accepted receipt",
    ),
  );

  const deps = isRecord(dependencies) && Array.isArray(dependencies.dependencies) ? dependencies.dependencies : [];
  const expectedIds = PENDING_DEPENDENCIES.map((item) => item.id);
  const unsatisfied = expectedIds.filter((id) => {
    const found = deps.find((item) => isRecord(item) && item.id === id);
    return !found || found.satisfied !== false;
  });
  checks.push(
    check(
      CHECK_IDS.DEPENDENCIES_OPEN,
      unsatisfied.length === 0,
      unsatisfied.length
        ? `pending dependencies must be recorded unsatisfied: ${unsatisfied.join(", ")}`
        : "LS-07 protected integration and provider A1 binding remain explicitly unsatisfied",
    ),
  );

  const issuesOk =
    isRecord(scope) &&
    Array.isArray(scope.issues) &&
    ISSUES.every((issue) => scope.issues.includes(issue));
  checks.push(
    check(
      CHECK_IDS.PACKET_SCOPE,
      isRecord(scope) && scope.packetId === PACKET_ID && issuesOk,
      issuesOk ? "scope names LS-08 ISS-25..27" : "SCOPE.json must name packet LS-08 and ISS-25..27",
    ),
  );
  checks.push(
    check(
      CHECK_IDS.PREPARATION_ONLY,
      isRecord(status) && status.preparationOnly === true && status.pairedProofRun === false,
      "STATUS must be preparationOnly with pairedProofRun=false",
    ),
  );
  return checks;
}

/**
 * @param {string} evidenceDir
 */
export function evaluatePreparation(evidenceDir) {
  /** @type {{ ok: boolean, status: "PASS" | "FAIL", preparationOnly: true, packetComplete: false, harness: string, version: string, packetId: string, independentOf: string[], notCompletionOf: string[], receipt: object, checks: Check[], pendingDependencies: object[] }} */
  const report = {
    ok: false,
    status: "FAIL",
    preparationOnly: true,
    packetComplete: false,
    harness: HARNESS_ID,
    version: HARNESS_VERSION,
    packetId: PACKET_ID,
    independentOf: [...INDEPENDENT_OF],
    notCompletionOf: [...NOT_COMPLETION_OF],
    receipt: emitConsumerReceipt(),
    checks: [],
    pendingDependencies: PENDING_DEPENDENCIES.map((item) => ({ ...item })),
  };

  try {
    const evidence = loadPreparationEvidence(evidenceDir);
    report.checks.push(evaluateIss25Matrix(evidence.matrix));
    report.checks.push(...evaluateIss26Review(evidence.review));
    report.checks.push(...evaluateIntegrity(evidence.status, evidence.scope, evidence.dependencies));
    try {
      assertReceiptNotAccepted(evidence.receiptHold);
      report.checks.push(check(CHECK_IDS.RECEIPT_HOLD, true, "ISS-27 hold receipt does not accept or freeze A1"));
    } catch (error) {
      report.checks.push(check(CHECK_IDS.RECEIPT_HOLD, false, error.message));
    }
  } catch (error) {
    report.checks.push(check(CHECK_IDS.PACKET_SCOPE, false, error.message));
  }

  report.ok = report.checks.every((item) => item.status === "PASS");
  report.status = report.ok ? "PASS" : "FAIL";
  return report;
}

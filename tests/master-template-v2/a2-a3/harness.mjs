/**
 * LS-09 ISS-28..30 acceptance harness.
 * Additive A2/A3 mappings, paired fixtures, all-layout verdicts, gated admission.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  ADDITIVE_ADAPTER_MODULES,
  CHECK_IDS,
  CONSUMER_VERDICTS,
  ISSUES,
  HARNESS_ID,
  HARNESS_VERSION,
  PACKET_ID,
  POST_A1_AMENDMENT,
  PROHIBITED_PATHS,
  PROTECTED_DEVELOPMENT,
  PROVIDER_HANDOFF,
  PROVIDER_PIN,
  SATISFIED_DEPENDENCIES,
  requiredMatrixSlots,
  slotKey,
} from "./constants.mjs";
import {
  ClosedFailure,
  assertA1EvidenceUnchanged,
  assertNoFabricationKeys,
  assertNoSelectabilityOrLiveProof,
  isRecord,
  requireAmendmentAncestor,
  requireFrozenA1,
  requireProtectedLs08,
  requireProviderHandoff,
  requireProviderPin,
} from "./identities.mjs";
import { evaluateSlot } from "./slot-proof.mjs";
import { renderSlotHtml, slotHtmlPath } from "./html-fixtures.mjs";
import { loadInjectedFixture, runIndependentReview, runLifecycleProof } from "./iss29.mjs";
import {
  assertAdmissionGated,
  emitAdmissionEvidence,
  emitAllLayoutVerdicts,
  loadFrozenA1Receipt,
} from "./iss30.mjs";
import { assertReceiptComplete, emitConsumerReceipt } from "./receipt.mjs";
import {
  A2_ADDITIVE_ADAPTER,
  A3_ADDITIVE_ADAPTER,
  DECLARED_AFTER_AMENDMENT,
  assertStructurallyDistinctAdapters,
  resolveLayoutAdapter,
} from "./layout-adapters/index.mjs";

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
    "fixtures/iss-29-matrix.json",
    "fixtures/iss-29-review.json",
    "fixtures/iss-30-receipt.json",
    "fixtures/iss-30-all-layout-verdicts.json",
    "fixtures/iss-30-admission-evidence.json",
    "fixtures/injected-lifecycle.json",
    "bindings/provider-pin.json",
    "bindings/provider-handoff.json",
    "bindings/post-a1-amendment.json",
    "bindings/additive-layout-adapter-declaration.json",
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
    matrix: readJson(path.join(root, "fixtures/iss-29-matrix.json")),
    review: readJson(path.join(root, "fixtures/iss-29-review.json")),
    receipt: readJson(path.join(root, "fixtures/iss-30-receipt.json")),
    allLayout: readJson(path.join(root, "fixtures/iss-30-all-layout-verdicts.json")),
    admission: readJson(path.join(root, "fixtures/iss-30-admission-evidence.json")),
    injected: readJson(path.join(root, "fixtures/injected-lifecycle.json")),
    providerPin: readJson(path.join(root, "bindings/provider-pin.json")),
    handoff: readJson(path.join(root, "bindings/provider-handoff.json")),
    amendment: readJson(path.join(root, "bindings/post-a1-amendment.json")),
    adapters: readJson(path.join(root, "bindings/additive-layout-adapter-declaration.json")),
  };
}

export function runIss29Matrix() {
  const expected = requiredMatrixSlots();
  const slots = expected.map((slot) => evaluateSlot(slot));
  return {
    schemaVersion: 1,
    kind: "ls09-iss29-fixture-matrix",
    packetId: PACKET_ID,
    layoutPacks: ["a2", "a3"],
    dimensions: ["semantic", "functional", "visual", "accessibility", "performance"],
    evidenceClass: "paired-proof",
    packetCompletion: true,
    pairedProofRun: true,
    providerBytesPresent: false,
    ls08ProtectedIntegrated: true,
    providerFinalBound: true,
    slots,
  };
}

export function evaluateIss29Matrix(matrix) {
  if (!isRecord(matrix)) {
    return check(CHECK_IDS.MATRIX_COMPLETE, false, "ISS-29 matrix must be an object");
  }
  if (!Array.isArray(matrix.layoutPacks) || matrix.layoutPacks.join(",") !== "a2,a3") {
    return check(CHECK_IDS.MATRIX_COMPLETE, false, "ISS-29 matrix layoutPacks must be a2,a3");
  }
  if (matrix.evidenceClass !== "paired-proof") {
    return check(CHECK_IDS.MATRIX_COMPLETE, false, "ISS-29 evidenceClass must be paired-proof");
  }
  if (matrix.providerBytesPresent === true) {
    return check(CHECK_IDS.NO_PROVIDER_BYTES, false, "ISS-29 must not present provider bytes");
  }
  if (!Array.isArray(matrix.slots)) {
    return check(CHECK_IDS.MATRIX_COMPLETE, false, "ISS-29 matrix slots array is required");
  }
  const expected = requiredMatrixSlots();
  const seen = new Set();
  for (const slot of matrix.slots) {
    if (!isRecord(slot)) {
      return check(CHECK_IDS.MATRIX_COMPLETE, false, "ISS-29 slot must be an object");
    }
    seen.add(slotKey(slot));
    if (slot.status !== "PASS") {
      return check(CHECK_IDS.MATRIX_RUN, false, `ISS-29 slot ${slotKey(slot)} status=${slot.status}`);
    }
    if (slot.pairedProofRun !== true) {
      return check(CHECK_IDS.MATRIX_RUN, false, `ISS-29 slot ${slotKey(slot)} was not run`);
    }
    const live = renderSlotHtml(slot);
    if (slot.htmlSha256 && slot.htmlSha256 !== live.sha256) {
      return check(CHECK_IDS.MATRIX_RUN, false, `ISS-29 slot ${slotKey(slot)} html digest mismatch`);
    }
  }
  const missing = expected.map(slotKey).filter((key) => !seen.has(key));
  if (missing.length) {
    return check(CHECK_IDS.MATRIX_COMPLETE, false, `missing ISS-29 slots: ${missing.join(", ")}`);
  }
  if (matrix.slots.length !== expected.length) {
    return check(
      CHECK_IDS.MATRIX_COMPLETE,
      false,
      `ISS-29 slots must be exactly ${expected.length} (found ${matrix.slots.length})`,
    );
  }
  return check(CHECK_IDS.MATRIX_COMPLETE, true, `ISS-29 ran ${expected.length} A2/A3 paired fixtures`);
}

function evaluateIntegrity(status, scope, dependencies, providerPin, handoff, amendment, repoRoot) {
  const checks = [];
  try {
    assertNoFabricationKeys(status);
    assertNoFabricationKeys(scope);
    assertNoFabricationKeys(dependencies);
    assertNoSelectabilityOrLiveProof(status);
    requireProtectedLs08(isRecord(status) ? status.ls08Checkpoint : undefined);
    requireFrozenA1(isRecord(status) ? status.frozenA1 : undefined);
    requireProviderPin(isRecord(status) ? status.providerFinal : providerPin);
    requireAmendmentAncestor(amendment);
    requireProviderHandoff(handoff);
    if (repoRoot) assertA1EvidenceUnchanged(repoRoot);
    checks.push(check(CHECK_IDS.LS08_BOUND, true, `LS-08 bound at ${PROTECTED_DEVELOPMENT.commit}`));
    checks.push(check(CHECK_IDS.PROVIDER_PIN_BOUND, true, `2.0.0 pin bound at ${PROVIDER_PIN.commit}`));
    checks.push(check(CHECK_IDS.AMENDMENT_BOUND, true, `amendment ancestor ${POST_A1_AMENDMENT.commit}`));
    checks.push(check(CHECK_IDS.HANDOFF_BOUND, true, `handoff digest ${PROVIDER_HANDOFF.sha256}`));
    checks.push(check(CHECK_IDS.NO_PROVIDER_BYTES, true, "provider bytes remain absent (identity pin only)"));
  } catch (error) {
    const code = error instanceof ClosedFailure ? error.code : "integrity";
    const id =
      code.startsWith("ls08")
        ? CHECK_IDS.LS08_BOUND
        : code.startsWith("handoff")
          ? CHECK_IDS.HANDOFF_BOUND
          : code.startsWith("amendment")
            ? CHECK_IDS.AMENDMENT_BOUND
            : code.startsWith("a1")
              ? CHECK_IDS.ISS28_A1_UNCHANGED
              : code.includes("select") || code === "forbidden_claim"
                ? CHECK_IDS.NO_SELECTABILITY
                : CHECK_IDS.NO_PROVIDER_BYTES;
    checks.push(check(id, false, error.message));
  }

  const claimsSelect =
    isRecord(status) &&
    (status.providerSelectable === true ||
      status.productionSelectable === true ||
      status.admitted === true ||
      status.providerConformance === true);
  checks.push(
    check(
      CHECK_IDS.NO_SELECTABILITY,
      !claimsSelect,
      claimsSelect ? "STATUS claimed selectability or admission" : "STATUS does not claim selectability or admission",
    ),
  );
  checks.push(
    check(
      CHECK_IDS.PRODUCTION_GATES,
      isRecord(status) && status.productionSelectionGated === true && status.productionSelectable !== true,
      "production selection remains gated",
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
        : "scope names LS-09 ISS-28..30 with bound LS-08, 2.0.0 pin, amendment, and handoff",
    ),
  );
  return checks;
}

function evaluateIss28(adaptersBinding) {
  const checks = [];
  try {
    assertStructurallyDistinctAdapters();
    const a2 = resolveLayoutAdapter("a2", { providerLayoutSha256: PROVIDER_PIN.a2LayoutSha256 });
    const a3 = resolveLayoutAdapter("a3", { providerLayoutSha256: PROVIDER_PIN.a3LayoutSha256 });
    const a1 = resolveLayoutAdapter("a1");
    if (a1.pageRenderer !== "composition-a1-linear-shell" || a1.frozen !== true) {
      throw new ClosedFailure("a1_mutated", "A1 adapter is not frozen");
    }
    if (a2.pageRenderer !== A2_ADDITIVE_ADAPTER.pageRenderer || a2.providerLayoutSha256 !== PROVIDER_PIN.a2LayoutSha256) {
      throw new ClosedFailure("iss28_mapping", "A2 additive mapping mismatch");
    }
    if (a3.pageRenderer !== A3_ADDITIVE_ADAPTER.pageRenderer || a3.providerLayoutSha256 !== PROVIDER_PIN.a3LayoutSha256) {
      throw new ClosedFailure("iss28_mapping", "A3 additive mapping mismatch");
    }
    const declared = isRecord(adaptersBinding) ? adaptersBinding.modules : [];
    const missing = ADDITIVE_ADAPTER_MODULES.filter((item) => !declared.includes(item));
    if (missing.length || adaptersBinding?.amendmentCommit !== DECLARED_AFTER_AMENDMENT.amendmentCommit) {
      throw new ClosedFailure("iss28_mapping", "additive adapter modules are not declared after the amendment");
    }
    checks.push(check(CHECK_IDS.ISS28_A1_UNCHANGED, true, "accepted A1 semantics remain frozen"));
    checks.push(check(CHECK_IDS.ISS28_A2_MAPPING, true, `A2 maps to ${a2.pageRenderer}`));
    checks.push(check(CHECK_IDS.ISS28_A3_MAPPING, true, `A3 maps to ${a3.pageRenderer}`));
    checks.push(check(CHECK_IDS.ISS28_ADAPTERS_DECLARED, true, "additive layout adapter modules declared after amendment"));
  } catch (error) {
    const id = String(error.message || "").includes("A1") ? CHECK_IDS.ISS28_A1_UNCHANGED : CHECK_IDS.ISS28_ADAPTERS_DECLARED;
    checks.push(check(id, false, error.message));
  }
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
 * @param {{ repoRoot?: string, persist?: boolean }} [options]
 */
const defaultRepoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

export async function evaluatePairedProof(evidenceDir, options = {}) {
  options = { repoRoot: defaultRepoRoot, ...options };
  const report = {
    ok: false,
    status: "FAIL",
    preparationOnly: false,
    packetComplete: false,
    harness: HARNESS_ID,
    version: HARNESS_VERSION,
    packetId: PACKET_ID,
    ownedPaths: ["tests/master-template-v2/a2-a3/**", "docs/evidence/master-v2/a2-a3/**"],
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
    report.checks.push(
      ...evaluateIntegrity(
        evidence.status,
        evidence.scope,
        evidence.dependencies,
        evidence.providerPin,
        evidence.handoff,
        evidence.amendment,
        options.repoRoot,
      ),
    );
    report.checks.push(...evaluateIss28(evidence.adapters));
    const liveMatrix = runIss29Matrix();
    report.checks.push(evaluateIss29Matrix(liveMatrix));
    report.checks.push(evaluateIss29Matrix(evidence.matrix));

    try {
      const review = await runIndependentReview();
      const stored = evidence.review;
      const dimsOk = REVIEW_OK(review) && REVIEW_OK(stored);
      report.checks.push(
        check(
          CHECK_IDS.REVIEW_DIMENSIONS,
          dimsOk,
          dimsOk ? "ISS-29 visual/accessibility/privacy/tenant/performance review passed" : "ISS-29 independent review failed",
        ),
      );
      const lifecycle = await runLifecycleProof(loadInjectedFixture(evidence.root));
      const lifeOk = LIFECYCLE_OK(lifecycle) && isRecord(stored.lifecycle) && LIFECYCLE_OK(stored.lifecycle);
      report.checks.push(
        check(
          CHECK_IDS.LIFECYCLE_PROOF,
          lifeOk,
          lifeOk
            ? "ISS-29 cache-restart/tamper/rollback/migration proof passed"
            : "ISS-29 lifecycle proof failed",
        ),
      );

      const a1Receipt = loadFrozenA1Receipt(options.repoRoot);
      const allLayout = emitAllLayoutVerdicts(liveMatrix, a1Receipt);
      const admission = emitAdmissionEvidence();
      assertAdmissionGated(admission);
      assertAdmissionGated(evidence.admission);
      const verdicts = aggregateVerdicts(liveMatrix, lifecycle);
      const receipt = emitConsumerReceipt({
        verdicts,
        allLayoutVerdicts: allLayout.verdicts,
        freezeAcceptedA1: true,
      });
      assertReceiptComplete(receipt);
      assertReceiptComplete(evidence.receipt);
      report.receipt = receipt;
      report.checks.push(check(CHECK_IDS.ALL_LAYOUT_VERDICTS, true, "ISS-30 all-layout adapter/browser verdicts PASS"));
      report.checks.push(
        check(CHECK_IDS.ADMISSION_EVIDENCE, true, "ISS-30 admission evidence coordinated; production selection gated"),
      );

      if (options.persist) {
        persistEvidence(evidence.root, liveMatrix, review, lifecycle, receipt, allLayout, admission);
      }
    } catch (error) {
      report.checks.push(check(CHECK_IDS.ALL_LAYOUT_VERDICTS, false, error.message));
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
    review.dimensions.tenant?.status === "PASS" &&
    review.dimensions.performance?.status === "PASS"
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

function persistEvidence(root, matrix, review, lifecycle, receipt, allLayout, admission) {
  fs.mkdirSync(path.join(root, "fixtures/slots"), { recursive: true });
  for (const slot of matrix.slots) {
    const rendered = renderSlotHtml(slot);
    fs.writeFileSync(path.join(root, slotHtmlPath(slot)), rendered.html);
  }
  fs.writeFileSync(path.join(root, "fixtures/iss-29-matrix.json"), `${JSON.stringify(matrix, null, 2)}\n`);
  const reviewOut = { ...review, lifecycle };
  fs.writeFileSync(path.join(root, "fixtures/iss-29-review.json"), `${JSON.stringify(reviewOut, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "fixtures/iss-30-receipt.json"), `${JSON.stringify(receipt, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "fixtures/iss-30-all-layout-verdicts.json"), `${JSON.stringify(allLayout, null, 2)}\n`);
  fs.writeFileSync(path.join(root, "fixtures/iss-30-admission-evidence.json"), `${JSON.stringify(admission, null, 2)}\n`);
}

export const evaluatePreparation = evaluatePairedProof;

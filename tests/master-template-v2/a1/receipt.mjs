/**
 * ISS-27 consumer receipt emitter for LS-08 preparation.
 * Never emits an accepted receipt. Freeze of A1 semantics is forbidden.
 */

import {
  CHECK_IDS,
  CONSUMER_VERDICTS,
  GITHUB_ISSUE,
  ISSUES,
  PACKET_ID,
  PENDING_DEPENDENCIES,
} from "./constants.mjs";
import {
  ClosedFailure,
  forbiddenReceiptClaims,
  isRecord,
  requireUnboundLs07Checkpoint,
  requireUnboundProviderA1,
} from "./identities.mjs";

const HOLD_VERDICTS = Object.fromEntries(CONSUMER_VERDICTS.map((key) => [key, "NOT_RUN"]));

/**
 * @param {unknown} request
 * @returns {object}
 */
export function emitConsumerReceipt(request = {}) {
  if (request != null && !isRecord(request)) {
    throw new ClosedFailure("receipt_invalid", "receipt request must be an object");
  }
  const payload = isRecord(request) ? request : {};

  if (payload.accept === true || payload.overallVerdict === "ACCEPT" || payload.freezeAcceptedA1 === true) {
    throw new ClosedFailure(
      "forbidden_accepted_receipt",
      "accepted consumer receipt is forbidden until LS-07 is protected-integrated and exact provider A1 is bound",
    );
  }
  if (payload.packetCompletion === true || payload.packetComplete === true) {
    throw new ClosedFailure("forbidden_completion_claim", "LS-08 packetCompletion is forbidden in preparation");
  }

  requireUnboundLs07Checkpoint(payload.ls07Checkpoint);
  requireUnboundProviderA1(payload.providerA1);

  const claims = forbiddenReceiptClaims(payload);
  if (claims.length) {
    throw new ClosedFailure("forbidden_accepted_receipt", `forbidden receipt claim: ${claims.join(", ")}`);
  }

  return {
    schemaVersion: 1,
    kind: "ls08-consumer-receipt",
    packetId: PACKET_ID,
    githubIssue: GITHUB_ISSUE,
    issues: [...ISSUES],
    evidenceClass: "preparation-fixture",
    packetCompletion: false,
    freezeAcceptedA1: false,
    overallVerdict: "NOT_EMITTED",
    overallReason:
      "ISS-27 cannot return an accepted consumer receipt before LS-07 protected integration and exact provider A1 binding.",
    verdicts: { ...HOLD_VERDICTS },
    pendingDependencies: PENDING_DEPENDENCIES.map((item) => ({ ...item })),
    checkId: CHECK_IDS.RECEIPT_HOLD,
    emitted: false,
  };
}

/**
 * @param {unknown} receipt
 */
export function assertReceiptNotAccepted(receipt) {
  if (!isRecord(receipt)) {
    throw new ClosedFailure("receipt_invalid", "receipt must be an object");
  }
  if (receipt.emitted === true) {
    throw new ClosedFailure("forbidden_accepted_receipt", "preparation receipt must set emitted=false");
  }
  if (receipt.packetCompletion === true || receipt.freezeAcceptedA1 === true) {
    throw new ClosedFailure("forbidden_accepted_receipt", "accepted or completed receipt is forbidden");
  }
  if (receipt.overallVerdict !== "NOT_EMITTED" && receipt.overallVerdict !== "HOLD") {
    throw new ClosedFailure(
      "forbidden_accepted_receipt",
      `overallVerdict must be NOT_EMITTED or HOLD (got ${String(receipt.overallVerdict)})`,
    );
  }
  const claims = forbiddenReceiptClaims(receipt);
  if (claims.length) {
    throw new ClosedFailure("forbidden_accepted_receipt", `forbidden receipt claim: ${claims.join(", ")}`);
  }
}

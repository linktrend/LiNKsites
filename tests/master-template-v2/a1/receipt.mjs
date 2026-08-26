/**
 * ISS-27 consumer receipt emitter for LS-08 paired proof.
 * Freezes accepted A1 semantics. Does not claim selectability, conformance, or MWT-08.
 */

import {
  CHECK_IDS,
  CONSUMER_VERDICTS,
  EXT_LS_01_RECEIPT,
  GITHUB_ISSUE,
  ISSUES,
  PACKET_ID,
  PROTECTED_DEVELOPMENT,
  PROVIDER_PIN,
  SATISFIED_DEPENDENCIES,
} from "./constants.mjs";
import {
  ClosedFailure,
  assertNoSelectabilityOrMwt08,
  isRecord,
} from "./identities.mjs";

/**
 * @param {object} input
 */
export function emitConsumerReceipt(input = {}) {
  if (input != null && !isRecord(input)) {
    throw new ClosedFailure("receipt_invalid", "receipt request must be an object");
  }
  const payload = isRecord(input) ? input : {};
  assertNoSelectabilityOrMwt08(payload);

  if (payload.selectable === true || payload.productionSelectable === true || payload.providerConformance === true) {
    throw new ClosedFailure("forbidden_claim", "selectability and provider conformance cannot be emitted");
  }
  if (payload.mwt08 === true || payload.mwt08Claimed === true) {
    throw new ClosedFailure("forbidden_claim", "MWT-08 cannot be claimed from LS-08");
  }
  if (payload.providerBytes != null && payload.providerBytes !== false) {
    throw new ClosedFailure("provider_bytes", "consumer receipt must not carry provider bytes");
  }

  const verdicts = isRecord(payload.verdicts) ? payload.verdicts : null;
  if (!verdicts) {
    throw new ClosedFailure("receipt_incomplete", "ISS-27 requires exact consumer verdicts from ISS-25/ISS-26");
  }
  for (const key of CONSUMER_VERDICTS) {
    if (verdicts[key] !== "PASS") {
      throw new ClosedFailure("receipt_incomplete", `verdict ${key} must be PASS before freeze (got ${String(verdicts[key])})`);
    }
  }

  if (payload.freezeAcceptedA1 === false) {
    throw new ClosedFailure("receipt_incomplete", "ISS-27 must freeze accepted A1 semantics after paired proof");
  }

  return {
    schemaVersion: 1,
    kind: "ls08-consumer-receipt",
    packetId: PACKET_ID,
    githubIssue: GITHUB_ISSUE,
    issues: [...ISSUES],
    evidenceClass: "paired-proof",
    packetCompletion: true,
    freezeAcceptedA1: true,
    overallVerdict: "A1_SEMANTICS_FROZEN",
    overallReason:
      "ISS-25/26/27 paired consumer proof passed on protected development. A1 semantics are frozen for this consumer. Provider remains draft/non-selectable. Later library packets are not claimed.",
    emitted: true,
    providerSelectable: false,
    providerConformanceClaimed: false,
    mwt08Claimed: false,
    providerBytesPresent: false,
    frozenSemantics: {
      layoutPack: "a1",
      plans: ["a", "b", "c", "l"],
      releaseEntryVersion: PROVIDER_PIN.releaseEntryVersion,
      providerCommit: PROVIDER_PIN.commit,
      providerTree: PROVIDER_PIN.tree,
      providerLifecycle: "draft",
      providerSelectability: "non_selectable",
      consumerProtectedCommit: PROTECTED_DEVELOPMENT.commit,
      consumerProtectedTree: PROTECTED_DEVELOPMENT.tree,
    },
    bindings: {
      providerPin: {
        repository: PROVIDER_PIN.repository,
        packet: PROVIDER_PIN.packet,
        commit: PROVIDER_PIN.commit,
        tree: PROVIDER_PIN.tree,
        releaseEntryVersion: PROVIDER_PIN.releaseEntryVersion,
      },
      extLs01Receipt: {
        path: EXT_LS_01_RECEIPT.path,
        sha256: EXT_LS_01_RECEIPT.sha256,
        consumerCommit: EXT_LS_01_RECEIPT.consumerCommit,
        consumerTree: EXT_LS_01_RECEIPT.consumerTree,
        bytesEmbedded: false,
      },
    },
    verdicts: { ...verdicts },
    satisfiedDependencies: SATISFIED_DEPENDENCIES.map((item) => ({
      id: item.id,
      required: item.required,
      satisfied: item.satisfied,
    })),
    checkId: CHECK_IDS.RECEIPT_EMITTED,
  };
}

/**
 * @param {unknown} receipt
 */
export function assertReceiptAcceptedSemantics(receipt) {
  if (!isRecord(receipt)) {
    throw new ClosedFailure("receipt_invalid", "receipt must be an object");
  }
  assertNoSelectabilityOrMwt08(receipt);
  if (receipt.emitted !== true) {
    throw new ClosedFailure("receipt_incomplete", "ISS-27 receipt must set emitted=true");
  }
  if (receipt.packetCompletion !== true || receipt.freezeAcceptedA1 !== true) {
    throw new ClosedFailure("receipt_incomplete", "ISS-27 must complete the packet and freeze A1 semantics");
  }
  if (receipt.overallVerdict !== "A1_SEMANTICS_FROZEN") {
    throw new ClosedFailure("receipt_incomplete", `overallVerdict must be A1_SEMANTICS_FROZEN (got ${String(receipt.overallVerdict)})`);
  }
  if (receipt.providerSelectable === true || receipt.providerConformanceClaimed === true || receipt.mwt08Claimed === true) {
    throw new ClosedFailure("forbidden_claim", "receipt claimed selectability, conformance, or MWT-08");
  }
  if (receipt.providerBytesPresent === true) {
    throw new ClosedFailure("provider_bytes", "receipt must not present provider bytes");
  }
  const verdicts = isRecord(receipt.verdicts) ? receipt.verdicts : {};
  for (const key of CONSUMER_VERDICTS) {
    if (verdicts[key] !== "PASS") {
      throw new ClosedFailure("receipt_incomplete", `receipt verdict ${key} is not PASS`);
    }
  }
}

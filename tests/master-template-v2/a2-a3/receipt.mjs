/**
 * ISS-30 consumer receipt emitter for LS-09 complete A2/A3 proof.
 * Coordinates all-layout verdicts. Does not claim production selectability.
 */

import {
  ALL_LAYOUT_ADAPTER_VERDICTS,
  CHECK_IDS,
  CONSUMER_VERDICTS,
  GITHUB_ISSUE,
  ISSUES,
  PACKET_ID,
  POST_A1_AMENDMENT,
  PROTECTED_DEVELOPMENT,
  PROVIDER_HANDOFF,
  PROVIDER_PIN,
  SATISFIED_DEPENDENCIES,
} from "./constants.mjs";
import { ClosedFailure, assertNoSelectabilityOrLiveProof, isRecord } from "./identities.mjs";

export function emitConsumerReceipt(input = {}) {
  if (input != null && !isRecord(input)) {
    throw new ClosedFailure("receipt_invalid", "receipt request must be an object");
  }
  const payload = isRecord(input) ? input : {};
  assertNoSelectabilityOrLiveProof(payload);

  if (payload.selectable === true || payload.productionSelectable === true || payload.providerConformance === true) {
    throw new ClosedFailure("forbidden_claim", "selectability and provider conformance cannot be emitted");
  }
  if (payload.admitted === true) {
    throw new ClosedFailure("forbidden_claim", "LS-09 cannot admit the provider into production selection");
  }
  if (payload.vpsProof === true || payload.liveProof === true || payload.mwtOutputClaimed === true) {
    throw new ClosedFailure("forbidden_claim", "VPS/live proof and MWT outputs cannot be claimed");
  }
  if (payload.providerBytes != null && payload.providerBytes !== false) {
    throw new ClosedFailure("provider_bytes", "consumer receipt must not carry provider bytes");
  }

  const verdicts = isRecord(payload.verdicts) ? payload.verdicts : null;
  if (!verdicts) {
    throw new ClosedFailure("receipt_incomplete", "ISS-30 requires exact consumer verdicts from ISS-29");
  }
  for (const key of CONSUMER_VERDICTS) {
    if (verdicts[key] !== "PASS") {
      throw new ClosedFailure("receipt_incomplete", `verdict ${key} must be PASS (got ${String(verdicts[key])})`);
    }
  }
  const allLayout = isRecord(payload.allLayoutVerdicts) ? payload.allLayoutVerdicts : null;
  if (!allLayout) {
    throw new ClosedFailure("receipt_incomplete", "ISS-30 requires all-layout adapter/browser verdicts");
  }
  for (const key of ALL_LAYOUT_ADAPTER_VERDICTS) {
    if (allLayout[key] !== "PASS") {
      throw new ClosedFailure("receipt_incomplete", `all-layout verdict ${key} must be PASS`);
    }
  }
  if (payload.freezeAcceptedA1 === false) {
    throw new ClosedFailure("a1_mutated", "ISS-30 must preserve accepted A1 freeze");
  }

  return {
    schemaVersion: 1,
    kind: "ls09-consumer-receipt",
    packetId: PACKET_ID,
    githubIssue: GITHUB_ISSUE,
    issues: [...ISSUES],
    evidenceClass: "paired-proof",
    packetCompletion: true,
    freezeAcceptedA1: true,
    overallVerdict: "ALL_LAYOUT_ADAPTER_BROWSER_VERDICTS",
    overallReason:
      "ISS-28/29/30 A2/A3 additive mappings and paired fixtures passed on protected development. A1 semantics remain frozen. Final provider 2.0.0 identities are bound. Production selection remains gated. Provider bytes, VPS/live proof, and MWT outputs are not claimed.",
    emitted: true,
    admitted: false,
    providerSelectable: false,
    productionSelectable: false,
    productionSelectionGated: true,
    providerConformanceClaimed: false,
    vpsProofClaimed: false,
    liveProofClaimed: false,
    mwtOutputClaimed: false,
    providerBytesPresent: false,
    bindings: {
      providerPin: {
        repository: PROVIDER_PIN.repository,
        ref: PROVIDER_PIN.ref,
        commit: PROVIDER_PIN.commit,
        tree: PROVIDER_PIN.tree,
        releaseEntryVersion: PROVIDER_PIN.releaseEntryVersion,
        artifactTree: PROVIDER_PIN.artifactTree,
        releaseManifestSha256: PROVIDER_PIN.releaseManifestSha256,
        inventorySha256: PROVIDER_PIN.inventorySha256,
        payloadSha256: PROVIDER_PIN.payloadSha256,
        releaseReceiptSha256: PROVIDER_PIN.releaseReceiptSha256,
        a2LayoutSha256: PROVIDER_PIN.a2LayoutSha256,
        a3LayoutSha256: PROVIDER_PIN.a3LayoutSha256,
      },
      postA1Amendment: { ...POST_A1_AMENDMENT },
      providerHandoff: { ...PROVIDER_HANDOFF },
      consumerProtected: { ...PROTECTED_DEVELOPMENT },
    },
    verdicts: { ...verdicts },
    allLayoutVerdicts: { ...allLayout },
    satisfiedDependencies: SATISFIED_DEPENDENCIES.map((item) => ({
      id: item.id,
      required: item.required,
      satisfied: item.satisfied,
    })),
    checkId: CHECK_IDS.ALL_LAYOUT_VERDICTS,
  };
}

export function assertReceiptComplete(receipt) {
  if (!isRecord(receipt)) throw new ClosedFailure("receipt_invalid", "receipt must be an object");
  assertNoSelectabilityOrLiveProof(receipt);
  if (receipt.emitted !== true || receipt.packetCompletion !== true) {
    throw new ClosedFailure("receipt_incomplete", "ISS-30 receipt must complete the packet");
  }
  if (receipt.overallVerdict !== "ALL_LAYOUT_ADAPTER_BROWSER_VERDICTS") {
    throw new ClosedFailure("receipt_incomplete", `overallVerdict mismatch: ${String(receipt.overallVerdict)}`);
  }
  if (receipt.freezeAcceptedA1 !== true) {
    throw new ClosedFailure("a1_mutated", "receipt must preserve accepted A1 freeze");
  }
  if (receipt.admitted === true || receipt.providerSelectable === true || receipt.productionSelectable === true) {
    throw new ClosedFailure("forbidden_claim", "receipt claimed production selectability");
  }
  if (receipt.providerBytesPresent === true) {
    throw new ClosedFailure("provider_bytes", "receipt must not present provider bytes");
  }
}

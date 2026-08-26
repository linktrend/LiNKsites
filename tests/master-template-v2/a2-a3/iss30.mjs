/**
 * ISS-30 all-layout adapter/browser verdicts and final provider admission evidence.
 * Production selection remains gated. Provider bytes, VPS/live proof, and MWT
 * outputs are not claimed.
 */

import fs from "node:fs";
import path from "node:path";
import {
  ALL_LAYOUT_ADAPTER_VERDICTS,
  FROZEN_A1,
  PACKET_ID,
  POST_A1_AMENDMENT,
  PROVIDER_HANDOFF,
  PROVIDER_PIN,
} from "./constants.mjs";
import { ClosedFailure, isRecord } from "./identities.mjs";
import {
  A1_FROZEN_ADAPTER,
  A2_ADDITIVE_ADAPTER,
  A3_ADDITIVE_ADAPTER,
  assertStructurallyDistinctAdapters,
} from "./layout-adapters/index.mjs";

function layoutPass(matrix, layoutPack, surface) {
  return (matrix.slots || [])
    .filter((slot) => slot.layoutPack === layoutPack && slot.surface === surface)
    .every((slot) => slot.status === "PASS" && slot.pairedProofRun === true);
}

export function emitAllLayoutVerdicts(matrix, a1Receipt) {
  assertStructurallyDistinctAdapters();
  if (!isRecord(a1Receipt) || a1Receipt.overallVerdict !== FROZEN_A1.overallVerdict || a1Receipt.freezeAcceptedA1 !== true) {
    throw new ClosedFailure("a1_unfrozen", "ISS-30 requires the frozen LS-08 A1 receipt");
  }
  const a1Browser = a1Receipt.verdicts?.browser_fixture_valid === "PASS";
  const a1Adapter = a1Receipt.verdicts?.adapter_compatible === "PASS";
  const verdicts = {
    a1_adapter_compatible: a1Adapter ? "PASS" : "FAIL",
    a1_browser_fixture_valid: a1Browser ? "PASS" : "FAIL",
    a2_adapter_compatible: layoutPass(matrix, "a2", "server") && A2_ADDITIVE_ADAPTER.additive ? "PASS" : "FAIL",
    a2_browser_fixture_valid: layoutPass(matrix, "a2", "browser") ? "PASS" : "FAIL",
    a3_adapter_compatible: layoutPass(matrix, "a3", "server") && A3_ADDITIVE_ADAPTER.additive ? "PASS" : "FAIL",
    a3_browser_fixture_valid: layoutPass(matrix, "a3", "browser") ? "PASS" : "FAIL",
  };
  for (const key of ALL_LAYOUT_ADAPTER_VERDICTS) {
    if (verdicts[key] !== "PASS") {
      throw new ClosedFailure("iss30_verdicts", `all-layout verdict ${key} is not PASS`);
    }
  }
  return {
    schemaVersion: 1,
    kind: "ls09-iss30-all-layout-verdicts",
    packetId: PACKET_ID,
    evidenceClass: "paired-proof",
    packetCompletion: true,
    a1Frozen: true,
    a1PageRenderer: A1_FROZEN_ADAPTER.pageRenderer,
    a2PageRenderer: A2_ADDITIVE_ADAPTER.pageRenderer,
    a3PageRenderer: A3_ADDITIVE_ADAPTER.pageRenderer,
    providerBytesPresent: false,
    productionSelectable: false,
    verdicts,
  };
}

export function emitAdmissionEvidence() {
  return {
    schemaVersion: 1,
    kind: "ls09-iss30-final-provider-admission-evidence",
    packetId: PACKET_ID,
    coordinated: true,
    admitted: false,
    productionSelectable: false,
    productionSelectionGated: true,
    providerConformanceClaimed: false,
    vpsProofClaimed: false,
    liveProofClaimed: false,
    mwtOutputClaimed: false,
    providerBytesPresent: false,
    bytesEmbedded: false,
    reason:
      "ISS-30 coordinates final provider admission evidence identities for master-template-type-1@2.0.0. Production selection remains gated. Provider bytes, VPS/live proof, and MWT outputs are not claimed.",
    provider: {
      repository: PROVIDER_PIN.repository,
      ref: PROVIDER_PIN.ref,
      commit: PROVIDER_PIN.commit,
      tree: PROVIDER_PIN.tree,
      releaseEntryVersion: PROVIDER_PIN.releaseEntryVersion,
      lifecycle: "draft",
      selectability: "non_selectable",
      artifactTree: PROVIDER_PIN.artifactTree,
      releaseManifestSha256: PROVIDER_PIN.releaseManifestSha256,
      inventorySha256: PROVIDER_PIN.inventorySha256,
      payloadSha256: PROVIDER_PIN.payloadSha256,
      releaseReceiptSha256: PROVIDER_PIN.releaseReceiptSha256,
      a2LayoutSha256: PROVIDER_PIN.a2LayoutSha256,
      a3LayoutSha256: PROVIDER_PIN.a3LayoutSha256,
    },
    amendment: { ...POST_A1_AMENDMENT },
    handoff: { ...PROVIDER_HANDOFF, bound: true },
    adapters: {
      a1: { adapterId: A1_FROZEN_ADAPTER.adapterId, frozen: true },
      a2: { adapterId: A2_ADDITIVE_ADAPTER.adapterId, additive: true },
      a3: { adapterId: A3_ADDITIVE_ADAPTER.adapterId, additive: true },
    },
  };
}

export function loadFrozenA1Receipt(repoRoot) {
  const file = path.join(repoRoot, FROZEN_A1.evidenceDir, "fixtures/iss-27-receipt.json");
  return JSON.parse(fs.readFileSync(file, "utf8"));
}

export function assertAdmissionGated(evidence) {
  if (!isRecord(evidence)) throw new ClosedFailure("admission_invalid", "admission evidence must be an object");
  if (evidence.admitted === true || evidence.productionSelectable === true) {
    throw new ClosedFailure("forbidden_claim", "production selection must remain gated");
  }
  if (evidence.productionSelectionGated !== true) {
    throw new ClosedFailure("admission_invalid", "productionSelectionGated must be true");
  }
  if (
    evidence.providerBytesPresent === true ||
    evidence.vpsProofClaimed === true ||
    evidence.liveProofClaimed === true ||
    evidence.mwtOutputClaimed === true
  ) {
    throw new ClosedFailure("forbidden_claim", "admission evidence claimed bytes or live/MWT proof");
  }
}

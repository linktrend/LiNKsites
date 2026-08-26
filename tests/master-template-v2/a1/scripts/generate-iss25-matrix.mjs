#!/usr/bin/env node
/**
 * Emit the ISS-25 A1 × A/B/C/L × scenario × surface fixture matrix.
 * Slots are NOT_RUN preparation stubs. No paired proof is claimed.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LAYOUT_PACK, PACKET_ID, requiredMatrixSlots } from "../constants.mjs";

export function buildIss25Matrix() {
  return {
    schemaVersion: 1,
    kind: "ls08-iss25-fixture-matrix",
    packetId: PACKET_ID,
    layoutPack: LAYOUT_PACK,
    evidenceClass: "preparation-fixture",
    packetCompletion: false,
    pairedProofRun: false,
    a1BytesPresent: false,
    ls07ProtectedIntegrated: false,
    providerA1Bound: false,
    slots: requiredMatrixSlots().map((slot) => ({
      ...slot,
      status: "NOT_RUN",
      pairedProofRun: false,
      evidence: "unbound-preparation-slot",
    })),
  };
}

function main(argv = process.argv.slice(2)) {
  const outIdx = argv.indexOf("--out");
  const matrix = buildIss25Matrix();
  const text = `${JSON.stringify(matrix, null, 2)}\n`;
  if (outIdx !== -1 && argv[outIdx + 1]) {
    const dest = path.resolve(argv[outIdx + 1]);
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.writeFileSync(dest, text);
    process.stdout.write(`wrote ${dest} slots=${matrix.slots.length}\n`);
    return;
  }
  process.stdout.write(text);
}

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isCli) main();

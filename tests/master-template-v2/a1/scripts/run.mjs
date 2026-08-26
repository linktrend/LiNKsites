#!/usr/bin/env node
/**
 * Bounded LS-08 ISS-25..27 preparation runner.
 * Never claims packet completion or an accepted consumer receipt.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluatePreparation } from "../harness.mjs";
import { emitConsumerReceipt } from "../receipt.mjs";

function printHelp() {
  process.stdout.write(`LS-08 A1 ISS-25..27 preparation harness (not consumer proof)

Usage:
  node tests/master-template-v2/a1/scripts/run.mjs --evidence <dir>
  node tests/master-template-v2/a1/scripts/run.mjs --emit-hold-receipt

Fail-closed: missing LS-07 checkpoint and unbound provider A1 are recorded,
not invented. Accepted receipts cannot be emitted.
`);
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) return { help: true };
  if (argv.includes("--emit-hold-receipt")) return { emitHold: true };
  const idx = argv.indexOf("--evidence");
  if (idx === -1 || !argv[idx + 1]) {
    return { error: "missing required --evidence <dir> (or --emit-hold-receipt)" };
  }
  return { evidence: path.resolve(argv[idx + 1]) };
}

const parsed = parseArgs(process.argv.slice(2));
if (parsed.help) {
  printHelp();
  process.exit(0);
}
if (parsed.error) {
  process.stderr.write(`${parsed.error}\n`);
  printHelp();
  process.exit(2);
}
if (parsed.emitHold) {
  process.stdout.write(`${JSON.stringify(emitConsumerReceipt(), null, 2)}\n`);
  process.exit(0);
}

const report = evaluatePreparation(parsed.evidence);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exit(report.status === "PASS" ? 0 : 1);

const isCli = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
void isCli;

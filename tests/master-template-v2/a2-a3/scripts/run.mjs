#!/usr/bin/env node
/**
 * LS-09 ISS-28..30 complete consumer proof runner.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { aggregateVerdicts, evaluatePairedProof, runIss29Matrix } from "../harness.mjs";
import { emitConsumerReceipt } from "../receipt.mjs";
import { loadInjectedFixture, runLifecycleProof } from "../iss29.mjs";
import { emitAllLayoutVerdicts, loadFrozenA1Receipt } from "../iss30.mjs";

function printHelp() {
  process.stdout.write(`LS-09 A2/A3 ISS-28..30 complete consumer proof

Usage:
  node tests/master-template-v2/a2-a3/scripts/run.mjs --evidence <dir>
  node tests/master-template-v2/a2-a3/scripts/run.mjs --emit-receipt
`);
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) return { help: true };
  if (argv.includes("--emit-receipt")) return { emitReceipt: true };
  const idx = argv.indexOf("--evidence");
  if (idx === -1 || !argv[idx + 1]) {
    return { error: "missing required --evidence <dir> (or --emit-receipt)" };
  }
  return { evidence: path.resolve(argv[idx + 1]) };
}

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../../");

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
if (parsed.emitReceipt) {
  const evidence = path.join(repoRoot, "docs/evidence/master-v2/a2-a3");
  const matrix = runIss29Matrix();
  const lifecycle = await runLifecycleProof(loadInjectedFixture(evidence));
  const allLayout = emitAllLayoutVerdicts(matrix, loadFrozenA1Receipt(repoRoot));
  const receipt = emitConsumerReceipt({
    verdicts: aggregateVerdicts(matrix, lifecycle),
    allLayoutVerdicts: allLayout.verdicts,
    freezeAcceptedA1: true,
  });
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  process.exit(0);
}

const report = await evaluatePairedProof(parsed.evidence, { repoRoot });
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exit(report.status === "PASS" ? 0 : 1);

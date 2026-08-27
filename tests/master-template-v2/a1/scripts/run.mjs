#!/usr/bin/env node
/**
 * LS-08 ISS-25..27 paired consumer proof runner.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluatePairedProof } from "../harness.mjs";
import { emitConsumerReceipt } from "../receipt.mjs";
import { runIss25Matrix, aggregateVerdicts } from "../harness.mjs";
import { loadInjectedFixture, runLifecycleProof } from "../iss26.mjs";

function printHelp() {
  process.stdout.write(`LS-08 A1 ISS-25..27 paired consumer proof

Usage:
  node tests/master-template-v2/a1/scripts/run.mjs --evidence <dir>
  node tests/master-template-v2/a1/scripts/run.mjs --emit-receipt
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
const gitCommonDir = execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: repoRoot, encoding: "utf8" }).trim();

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
  const evidence = path.join(repoRoot, "docs/evidence/master-v2/a1");
  const matrix = runIss25Matrix();
  const lifecycle = await runLifecycleProof(loadInjectedFixture(evidence));
  const receipt = emitConsumerReceipt({ verdicts: aggregateVerdicts(matrix, lifecycle), freezeAcceptedA1: true });
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  process.exit(0);
}

const report = await evaluatePairedProof(parsed.evidence, { repoRoot, gitCommonDir });
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exit(report.status === "PASS" ? 0 : 1);

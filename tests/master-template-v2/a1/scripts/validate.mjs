#!/usr/bin/env node
/**
 * Fail-closed validator for docs/evidence/master-v2/a1 preparation artifacts.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluatePreparation } from "../harness.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const defaultEvidence = path.resolve(here, "../../../../docs/evidence/master-v2/a1");

const evidence = process.argv.includes("--evidence")
  ? path.resolve(process.argv[process.argv.indexOf("--evidence") + 1])
  : defaultEvidence;

const report = evaluatePreparation(evidence);
for (const item of report.checks) {
  const prefix = item.status === "PASS" ? "PASS" : "FAIL";
  process.stderr.write(`${prefix}: ${item.id}: ${item.message}\n`);
}
if (!report.ok) {
  process.stderr.write("LS-08 ISS-25..27 preparation: FAIL packetCompletion=false\n");
  process.exit(1);
}
process.stdout.write("LS-08 ISS-25..27 preparation: PREPARATION_OK packetCompletion=false overallVerdict=NOT_EMITTED\n");
process.exit(0);

#!/usr/bin/env node
/**
 * Fail-closed validator for docs/evidence/master-v2/a1 paired-proof artifacts.
 */
import { execFileSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { evaluatePairedProof } from "../harness.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../../");
const defaultEvidence = path.join(repoRoot, "docs/evidence/master-v2/a1");
const gitCommonDir = execFileSync("git", ["rev-parse", "--git-common-dir"], { cwd: repoRoot, encoding: "utf8" }).trim();

const evidence = process.argv.includes("--evidence")
  ? path.resolve(process.argv[process.argv.indexOf("--evidence") + 1])
  : defaultEvidence;

const report = await evaluatePairedProof(evidence, { repoRoot, gitCommonDir });
for (const item of report.checks) {
  const prefix = item.status === "PASS" ? "PASS" : "FAIL";
  process.stderr.write(`${prefix}: ${item.id}: ${item.message}\n`);
}
if (!report.ok) {
  process.stderr.write("LS-08 ISS-25..27 paired proof: FAIL\n");
  process.exit(1);
}
process.stdout.write("LS-08 ISS-25..27 paired proof: PROOF_OK packetCompletion=true overallVerdict=A1_SEMANTICS_FROZEN\n");
process.exit(0);

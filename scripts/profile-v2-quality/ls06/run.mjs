#!/usr/bin/env node
import { resolve } from "node:path";
import { evaluatePacket } from "./evaluate.mjs";

function printHelp() {
  process.stdout.write(`LS-06 preparation harness (not LS-06 completion)

Usage:
  node scripts/profile-v2-quality/ls06/run.mjs --packet <dir>

Evaluates injected LS-04/LS-05/provider/layout identities plus offline
layout/renderer contract, configuration, and rollback. Fails closed when
those identities are absent. Never reads apps/**, packages/**, or
provider bytes.
`);
}

function parseArgs(argv) {
  if (argv.includes("--help") || argv.includes("-h")) return { help: true };
  const packetIdx = argv.indexOf("--packet");
  if (packetIdx === -1 || !argv[packetIdx + 1]) {
    return { error: "missing required --packet <dir>" };
  }
  return { packet: resolve(argv[packetIdx + 1]) };
}

const parsed = parseArgs(process.argv.slice(2));
if (parsed.help) {
  printHelp();
  process.exit(0);
}
if (parsed.error) {
  process.stderr.write(`${parsed.error}\n`);
  printHelp();
  process.exit(1);
}

const report = evaluatePacket(parsed.packet);
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
process.exit(report.status === "PASS" ? 0 : 1);

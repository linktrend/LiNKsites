#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export function validateW208Packet(source) {
  assert.match(source, /\*\*Status:\*\*[^\n]*Luna High verification/);
  assert.match(source, /\*\*Status:\*\*[^\n]*VPS authority remains on HOLD/i);
  assert.match(source, /\*\*Executor:\*\* Luna High verifier/);
  assert.doesNotMatch(source, /\bTerra\b/);
  assert.match(source, /Do not deploy, configure the VPS, create DNS records, activate domains, or run the live first-site test/);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const packet = new URL("../docs/production-roadmap/wave-2/W2-08-LOCAL-CERTIFICATION-AND-PHASE-1-RELEASE-GATE.md", import.meta.url);
  validateW208Packet(await readFile(packet, "utf8"));
  console.log("W2-08 pre-VPS source validation: PASS (VPS/live: HOLD)");
}

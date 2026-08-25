#!/usr/bin/env node
/**
 * Read one injected LS-07 quality payload from stdin or --input <file>.
 * Never contacts a renderer, provider, or runtime.
 */
import fs from "node:fs";
import { evaluateInjectedQuality, assertClosedOrPass } from "./harness.mjs";

const args = process.argv.slice(2);
let raw;
const inputIdx = args.indexOf("--input");
if (inputIdx !== -1) {
  const file = args[inputIdx + 1];
  if (!file) {
    process.stderr.write("FAIL: --input requires a path\n");
    process.exit(2);
  }
  raw = fs.readFileSync(file, "utf8");
} else {
  raw = fs.readFileSync(0, "utf8");
}

let payload;
try {
  payload = JSON.parse(raw);
} catch (error) {
  process.stderr.write(`FAIL: injected payload is not JSON: ${error.message}\n`);
  process.exit(2);
}

const result = evaluateInjectedQuality(payload);
process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
try {
  assertClosedOrPass(result);
} catch (error) {
  process.stderr.write(`FAIL: ${error.message}\n`);
  process.exit(1);
}
process.stdout.write("PASS: injected LS-07 quality contracts held\n");

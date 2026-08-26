#!/usr/bin/env node
/**
 * Emit ISS-25 matrix JSON (paired-proof run).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runIss25Matrix } from "../harness.mjs";

function main(argv = process.argv.slice(2)) {
  const outIdx = argv.indexOf("--out");
  const matrix = runIss25Matrix();
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

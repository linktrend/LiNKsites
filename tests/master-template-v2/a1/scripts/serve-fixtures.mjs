#!/usr/bin/env node
/**
 * Serve ISS-25 HTML fixtures for server/browser HTTP proof. Bound to loopback.
 */
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { requiredMatrixSlots } from "../constants.mjs";
import { slotHtmlPath } from "../html-fixtures.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const evidence = path.resolve(here, "../../../../docs/evidence/master-v2/a1");
const port = Number(process.env.LS08_FIXTURE_PORT || 8765);

const server = http.createServer((req, res) => {
  const url = new URL(req.url || "/", `http://127.0.0.1:${port}`);
  if (url.pathname === "/health") {
    res.writeHead(200, { "content-type": "application/json" });
    res.end(JSON.stringify({ ok: true, packetId: "LS-08", slots: requiredMatrixSlots().length }));
    return;
  }
  const match = url.pathname.match(/^\/slots\/(server|browser)-([abcl])-([a-z]+)\.html$/);
  if (!match) {
    res.writeHead(404);
    res.end("not found");
    return;
  }
  const slot = { surface: match[1], planId: match[2], scenario: match[3] };
  const file = path.join(evidence, slotHtmlPath(slot));
  if (!fs.existsSync(file)) {
    res.writeHead(404);
    res.end("missing fixture");
    return;
  }
  res.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  res.end(fs.readFileSync(file));
});

if (process.argv.includes("--listen")) {
  server.listen(port, "127.0.0.1", () => {
    process.stdout.write(`LS-08 fixture server http://127.0.0.1:${port}/health\n`);
  });
}

export { server, port };

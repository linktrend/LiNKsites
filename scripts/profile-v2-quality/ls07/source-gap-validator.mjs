#!/usr/bin/env node
/**
 * Dependency-independent source/runtime bridge for the LS-07 quality harness.
 *
 * Synthetic renderer checks may pass, but exact materialization, runtime, and
 * live-browser identities remain HOLD until receipts from those authorities are
 * supplied. This module performs no checkout, network request, or live probe.
 */
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { evaluateInjectedQuality } from "./harness.mjs";

const SHA1 = /^[0-9a-f]{40}$/;
const LIVE_SOURCES = ["materialization", "runtime", "liveBrowser"];

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactIdentity(value, repository) {
  return (
    isRecord(value) &&
    value.repository === repository &&
    SHA1.test(value.commit ?? "") &&
    SHA1.test(value.tree ?? "")
  );
}

function hold(id, reason) {
  return { id, status: "HOLD", reason };
}

/**
 * Validate the bounded synthetic slice without converting identity-shaped
 * strings into live-source evidence.
 *
 * @param {unknown} input
 */
export function evaluateSourceGap(input) {
  const failures = [];
  if (!isRecord(input)) {
    return { ok: false, status: "FAIL", failures: ["input must be an object"], checks: [] };
  }

  if (input.kind !== "ls07-source-gap-fixture" || input.synthetic !== true) {
    failures.push("input must declare kind=ls07-source-gap-fixture and synthetic=true");
  }
  if (input.networkAllowed !== false || input.providerCheckoutAllowed !== false) {
    failures.push("network and provider checkout must be explicitly disabled");
  }

  const claims = isRecord(input.liveClaims) ? input.liveClaims : {};
  for (const source of LIVE_SOURCES) {
    if (claims[source] !== "HOLD") {
      failures.push(`liveClaims.${source} must be HOLD for synthetic input`);
    }
  }

  const quality = evaluateInjectedQuality(input.qualityInput);
  if (quality.closedFailures.length) {
    failures.push(...quality.closedFailures.map((item) => `${item.code}: ${item.message}`));
  } else if (!quality.ok) {
    failures.push(...quality.findings.map((item) => `${item.dimension}/${item.code}: ${item.message}`));
  }

  const provider = isRecord(input.qualityInput) ? input.qualityInput.providerIdentity : null;
  const runtime = isRecord(input.qualityInput) ? input.qualityInput.runtimeIdentity : null;
  if (!exactIdentity(provider, "linktrend/LiNKlibraries")) {
    failures.push("synthetic provider identity must be well-formed and repository-bound");
  }
  if (!exactIdentity(runtime, "linktrend/LiNKsites")) {
    failures.push("synthetic runtime identity must be well-formed and repository-bound");
  }

  const checks = [
    {
      id: "synthetic_quality_contract",
      status: failures.length === 0 ? "PASS" : "FAIL",
      reason: "deterministic injected renderer contract only",
    },
    hold("materialization_identity", "exact materialization receipt not supplied"),
    hold("runtime_identity", "protected runtime readback not supplied"),
    hold("live_browser_identity", "live browser observation not supplied"),
  ];

  return {
    ok: failures.length === 0,
    status: failures.length === 0 ? "HOLD" : "FAIL",
    packetComplete: false,
    syntheticComplete: failures.length === 0,
    liveIdentityStatus: Object.fromEntries(LIVE_SOURCES.map((source) => [source, "HOLD"])),
    failures,
    checks,
  };
}

function main(argv) {
  if (argv.length !== 1) {
    console.error("usage: node source-gap-validator.mjs <synthetic-input.json>");
    process.exitCode = 2;
    return;
  }
  try {
    const result = evaluateSourceGap(JSON.parse(readFileSync(argv[0], "utf8")));
    const output = JSON.stringify(result, null, 2);
    (result.ok ? console.log : console.error)(output);
    if (!result.ok) process.exitCode = 1;
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main(process.argv.slice(2));
}

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { evaluateSourceGap } from "../source-gap-validator.mjs";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const fixturePath = join(root, "fixtures/source-gap.synthetic.json");
const validatorPath = join(root, "source-gap-validator.mjs");
const fixture = () => JSON.parse(readFileSync(fixturePath, "utf8"));

test("synthetic contract passes while every live identity remains HOLD", () => {
  const result = evaluateSourceGap(fixture());
  assert.equal(result.ok, true);
  assert.equal(result.status, "HOLD");
  assert.equal(result.packetComplete, false);
  assert.equal(result.syntheticComplete, true);
  assert.deepEqual(Object.values(result.liveIdentityStatus), ["HOLD", "HOLD", "HOLD"]);
  assert.equal(result.checks[0].status, "PASS");
  assert.ok(result.checks.slice(1).every((check) => check.status === "HOLD"));
});

test("synthetic input cannot promote a live identity to PASS", () => {
  const input = fixture();
  input.liveClaims.runtime = "PASS";
  const result = evaluateSourceGap(input);
  assert.equal(result.status, "FAIL");
  assert.ok(result.failures.some((failure) => failure.includes("liveClaims.runtime")));
});

test("synthetic input must state every live HOLD explicitly", () => {
  const input = fixture();
  delete input.liveClaims.liveBrowser;
  const result = evaluateSourceGap(input);
  assert.equal(result.status, "FAIL");
  assert.ok(result.failures.some((failure) => failure.includes("liveClaims.liveBrowser")));
});

test("repository-shaped identities are validated without being called live", () => {
  const input = fixture();
  input.qualityInput.providerIdentity.repository = "linktrend/LiNKsites";
  const result = evaluateSourceGap(input);
  assert.equal(result.status, "FAIL");
  assert.ok(result.failures.some((failure) => failure.includes("provider identity")));
});

test("network or provider-checkout permission fails closed", () => {
  for (const field of ["networkAllowed", "providerCheckoutAllowed"]) {
    const input = fixture();
    input[field] = true;
    assert.equal(evaluateSourceGap(input).status, "FAIL");
  }
});

test("CLI emits a HOLD result for the synthetic fixture", () => {
  const output = execFileSync(process.execPath, [validatorPath, fixturePath], { encoding: "utf8" });
  const result = JSON.parse(output);
  assert.equal(result.status, "HOLD");
  assert.equal(result.packetComplete, false);
});

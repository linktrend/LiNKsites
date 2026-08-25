import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { evaluateInjectedQuality } from "../harness.mjs";
import { requireProviderIdentity, requireRuntimeIdentity, IdentityClosedFailure } from "../identities.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(here, "..", "fixtures");

function loadFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(fixtures, name), "utf8"));
}

function clone(value) {
  return structuredClone(value);
}

test("valid injected renderer output passes accessibility, performance, and SEO contracts", () => {
  const result = evaluateInjectedQuality(loadFixture("injected-renderer.valid.json"));
  assert.equal(result.ok, true);
  assert.equal(result.packetComplete, false);
  assert.equal(result.ls06CompleteClaimed, false);
  assert.equal(result.closedFailures.length, 0);
  assert.equal(result.findings.length, 0);
  assert.equal(result.identities.runtime.packet, "LS-06");
});

test("missing provider and runtime identities fail closed before quality scoring", () => {
  const result = evaluateInjectedQuality(loadFixture("injected-renderer.missing-identities.json"));
  assert.equal(result.ok, false);
  assert.ok(result.closedFailures.length >= 1);
  assert.match(result.closedFailures[0].code, /missing_provider_identity|missing_runtime_identity/);
  assert.equal(result.findings.length, 0);
});

test("empty provider commit fails closed", () => {
  const payload = clone(loadFixture("injected-renderer.valid.json"));
  payload.providerIdentity.commit = "";
  const result = evaluateInjectedQuality(payload);
  assert.equal(result.ok, false);
  assert.equal(result.closedFailures[0].code, "missing_identity");
});

test("missing runtime tree fails closed", () => {
  const payload = clone(loadFixture("injected-renderer.valid.json"));
  delete payload.runtimeIdentity.tree;
  const result = evaluateInjectedQuality(payload);
  assert.equal(result.ok, false);
  assert.equal(result.closedFailures[0].code, "missing_runtime_identity");
});

test("malformed runtime SHA fails closed", () => {
  assert.throws(
    () => requireRuntimeIdentity({ packet: "LS-06", repository: "linktrend/LiNKsites", commit: "not-a-sha", tree: "d".repeat(40) }),
    (error) => error instanceof IdentityClosedFailure && error.code === "malformed_identity",
  );
});

test("provider identity helper refuses a null injection", () => {
  assert.throws(
    () => requireProviderIdentity(null),
    (error) => error instanceof IdentityClosedFailure && error.code === "missing_provider_identity",
  );
});

test("missing injected html fails the accessibility contract", () => {
  const payload = clone(loadFixture("injected-renderer.valid.json"));
  payload.rendererOutput.html = "";
  const result = evaluateInjectedQuality(payload);
  assert.equal(result.ok, false);
  assert.equal(result.closedFailures.length, 0);
  assert.ok(result.findings.some((item) => item.code === "a11y_missing_html"));
});

test("img without alt fails accessibility", () => {
  const payload = clone(loadFixture("injected-renderer.valid.json"));
  payload.rendererOutput.html =
    '<html lang="en"><body><main><h1>Fixture shop</h1><img src="/fixture.png"></main></body></html>';
  const result = evaluateInjectedQuality(payload);
  assert.equal(result.ok, false);
  assert.ok(result.findings.some((item) => item.code === "a11y_missing_alt"));
});

test("over-budget LCP fails performance", () => {
  const payload = clone(loadFixture("injected-renderer.valid.json"));
  payload.rendererOutput.performance.lcpMs = 4000;
  const result = evaluateInjectedQuality(payload);
  assert.equal(result.ok, false);
  assert.ok(result.findings.some((item) => item.code === "perf_budget_exceeded"));
});

test("missing performance metrics fail closed at the contract layer", () => {
  const payload = clone(loadFixture("injected-renderer.valid.json"));
  delete payload.rendererOutput.performance;
  const result = evaluateInjectedQuality(payload);
  assert.equal(result.ok, false);
  assert.ok(result.findings.some((item) => item.code === "perf_missing_metrics"));
});

test("json-ld that disagrees with visible facts fails SEO", () => {
  const payload = clone(loadFixture("injected-renderer.valid.json"));
  payload.rendererOutput.document.jsonLd.name = "Other shop";
  const result = evaluateInjectedQuality(payload);
  assert.equal(result.ok, false);
  assert.ok(result.findings.some((item) => item.code === "seo_jsonld_visible_fact_mismatch"));
});

test("missing canonical fails SEO", () => {
  const payload = clone(loadFixture("injected-renderer.valid.json"));
  payload.rendererOutput.document.canonical = "";
  const result = evaluateInjectedQuality(payload);
  assert.equal(result.ok, false);
  assert.ok(result.findings.some((item) => item.code === "seo_missing_metadata"));
});

test("forbidden completion claims fail closed", () => {
  const payload = clone(loadFixture("injected-renderer.valid.json"));
  payload.packetComplete = true;
  const result = evaluateInjectedQuality(payload);
  assert.equal(result.ok, false);
  assert.equal(result.closedFailures[0].code, "forbidden_completion_claim");
});

test("missing renderer output fails closed", () => {
  const payload = clone(loadFixture("injected-renderer.valid.json"));
  delete payload.rendererOutput;
  const result = evaluateInjectedQuality(payload);
  assert.equal(result.ok, false);
  assert.equal(result.closedFailures[0].code, "missing_renderer_output");
});

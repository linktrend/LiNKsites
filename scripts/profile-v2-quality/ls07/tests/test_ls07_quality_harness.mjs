import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { evaluateInjectedQuality } from "../harness.mjs";
import { requireProviderIdentity, requireRuntimeIdentity, IdentityClosedFailure } from "../identities.mjs";
import { IMPLEMENTATION_A11Y_MATRIX } from "../implementation-matrix.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const fixtures = path.join(here, "..", "fixtures");

function loadFixture(name) {
  return JSON.parse(fs.readFileSync(path.join(fixtures, name), "utf8"));
}

function clone(value) {
  return structuredClone(value);
}

test("deterministic injected fake passes SSR/discoverability/accessibility/forms/privacy contracts", () => {
  const result = evaluateInjectedQuality(loadFixture("injected-renderer.valid.json"));
  assert.equal(result.ok, true);
  assert.equal(result.packetComplete, false);
  assert.equal(result.ls06CompleteClaimed, false);
  assert.equal(result.closedFailures.length, 0);
  assert.equal(result.findings.length, 0);
  assert.equal(result.identities.runtime.packet, "LS-06");
  assert.equal(result.identities.fixture.source, "injected-fake");
  assert.deepEqual(Object.values(result.dependencyStatus), ["HOLD", "HOLD", "HOLD", "HOLD"]);
});

test("unlabelled or non-deterministic runtime evidence fails closed", () => {
  const missing = clone(loadFixture("injected-renderer.valid.json"));
  delete missing.fixtureIdentity;
  assert.equal(evaluateInjectedQuality(missing).closedFailures[0].code, "missing_fixture_identity");
  const live = clone(loadFixture("injected-renderer.valid.json"));
  live.fixtureIdentity.source = "live-browser";
  live.fixtureIdentity.deterministic = false;
  assert.equal(evaluateInjectedQuality(live).closedFailures[0].code, "malformed_fixture_identity");
});

test("forms and privacy observations fail on fake success, consent bypass, analytics, or network", () => {
  for (const [field, value, code] of [
    ["fakeSuccessRejected", false, "form_fake_success"],
    ["consentGranted", true, "privacy_consent_not_blocked"],
    ["analyticsEmitted", true, "privacy_analytics_leak"],
    ["networkAttempted", true, "side_effect_network_forbidden"],
    ["secretFieldsPresent", true, "privacy_secret_leak"],
  ]) {
    const payload = clone(loadFixture("injected-renderer.valid.json"));
    payload.rendererOutput.sideEffects[field] = value;
    assert.ok(evaluateInjectedQuality(payload).findings.some((item) => item.code === code));
  }
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

test("implementation matrix does not claim legal certification", () => {
  assert.equal(IMPLEMENTATION_A11Y_MATRIX.legalCertificationClaimed, false);
  assert.equal(IMPLEMENTATION_A11Y_MATRIX.target, "WCAG 2.2 AA");
  const visual = JSON.parse(fs.readFileSync(path.join(fixtures, "visual-regression.json"), "utf8"));
  assert.equal(visual.legalCertificationClaimed, false);
  assert.ok(visual.fixtures.length >= 3);
});

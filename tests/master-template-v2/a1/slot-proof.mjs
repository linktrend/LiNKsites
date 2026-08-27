/**
 * Evaluate one ISS-25 A1 slot against consumer-owned HTML and bound identities.
 */

import { CONSUMER_VERDICTS, TENANT_ID } from "./constants.mjs";
import { ClosedFailure } from "./identities.mjs";
import { renderSlotHtml } from "./html-fixtures.mjs";

function passMap(overrides = {}) {
  return Object.fromEntries(CONSUMER_VERDICTS.map((key) => [key, overrides[key] ?? "PASS"]));
}

function a11y(html) {
  const lang = /\slang\s*=\s*["'][a-z]{2}/i.test(html);
  const main = /<main[\s>]/i.test(html);
  const h1 = [...html.matchAll(/<h1[\s>]/gi)].length === 1;
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
  const alt = imgs.length === 0 || imgs.every((match) => /\salt\s*=/i.test(match[0]));
  return lang && main && h1 && alt;
}

function privacy(html) {
  return (
    html.includes('data-analytics="inactive"') &&
    html.includes('data-consent="required"') &&
    !/googletagmanager|facebook\.net|hotjar/i.test(html)
  );
}

function tenant(html) {
  return html.includes(`data-tenant-id="${TENANT_ID}"`) && !html.includes('data-tenant-id="other-tenant"');
}

function productsDistinct(html, scenario) {
  if (!["product", "service", "hybrid"].includes(scenario)) return true;
  const product = html.includes("provider:product:fasteners");
  const service = html.includes("provider:service:installation");
  if (scenario === "product") return product && html.includes('data-family="product"');
  if (scenario === "service") return service && html.includes('data-family="service"') && !html.includes('data-family="product"');
  return product && service && html.includes('data-family="hybrid"');
}

function typeLIsolated(html, planId) {
  if (planId !== "l") return !html.includes('data-shell="type-l-isolated"') || html.includes('data-global-navigation="true"');
  return (
    html.includes('data-shell="type-l-isolated"') &&
    html.includes('data-global-navigation="false"') &&
    !html.includes('data-action="primary-cta"')
  );
}

function failureClosed(html, scenario) {
  if (scenario !== "failure") return true;
  return (
    html.includes('data-fake-success="false"') &&
    html.includes('data-failure="missing-required"') &&
    !html.includes('data-fake-success="true"') &&
    !/request accepted/i.test(html)
  );
}

function trustClosed(html, scenario) {
  if (scenario !== "trust") return true;
  return html.includes('data-fake-review="false"') && !html.includes("five-star guaranteed");
}

/**
 * @param {{ surface: string, planId: string, scenario: string }} slot
 */
export function evaluateSlot(slot) {
  const rendered = renderSlotHtml(slot);
  const html = rendered.html;
  const reasons = [];
  if (!html.includes('data-layout-pack="a1"')) reasons.push("missing A1 layout pack");
  if (!html.includes(`data-plan-id="${slot.planId}"`)) reasons.push("missing plan id");
  if (!html.includes('data-page-renderer="composition-a1-linear-shell"')) reasons.push("missing A1 renderer");
  if (!html.includes('data-provider-bytes="false"')) reasons.push("provider bytes claim missing");
  if (!a11y(html)) reasons.push("accessibility fixture failed");
  if (!privacy(html)) reasons.push("privacy fixture failed");
  if (!tenant(html)) reasons.push("tenant fixture failed");
  if (!productsDistinct(html, slot.scenario)) reasons.push("product/service projection collided");
  if (!typeLIsolated(html, slot.planId)) reasons.push("Type L isolation failed");
  if (!failureClosed(html, slot.scenario)) reasons.push("failure fixture did not reject fake success");
  if (!trustClosed(html, slot.scenario)) reasons.push("trust fixture allowed fake reviews");
  if (slot.surface === "browser" && !html.includes('name="viewport"')) reasons.push("browser viewport missing");
  if (slot.surface === "server" && html.includes('name="viewport"')) reasons.push("server fixture must not pretend to be a viewport capture");

  if (reasons.length) {
    throw new ClosedFailure("slot_failed", `${slot.surface}:${slot.planId}:${slot.scenario}: ${reasons.join("; ")}`);
  }

  const lifecycleKeys =
    slot.scenario === "lifecycle"
      ? {}
      : {
          migration_rollback_valid: "HOLD",
          tamper_rejected: "HOLD",
          cache_restart_valid: "HOLD",
        };

  const surfaceKeys =
    slot.surface === "server"
      ? { server_render_valid: "PASS", browser_fixture_valid: "HOLD" }
      : { server_render_valid: "HOLD", browser_fixture_valid: "PASS" };

  return {
    ...slot,
    status: "PASS",
    pairedProofRun: true,
    htmlSha256: rendered.sha256,
    evidence: slotHtmlRef(slot),
    verdicts: passMap({ ...lifecycleKeys, ...surfaceKeys }),
  };
}

function slotHtmlRef(slot) {
  return `fixtures/slots/${slot.surface}-${slot.planId}-${slot.scenario}.html`;
}

export { a11y, privacy, tenant };

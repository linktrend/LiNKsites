/**
 * Evaluate one ISS-29 A2/A3 slot against consumer-owned HTML and bound adapters.
 */

import { CONSUMER_VERDICTS, TENANT_ID } from "./constants.mjs";
import { ClosedFailure } from "./identities.mjs";
import { renderSlotHtml } from "./html-fixtures.mjs";
import { resolveLayoutAdapter } from "./layout-adapters/index.mjs";

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

function typeLIsolated(html, planId) {
  if (planId !== "l") return !html.includes('data-shell="type-l-isolated"') || html.includes('data-global-navigation="true"');
  return (
    html.includes('data-shell="type-l-isolated"') &&
    html.includes('data-global-navigation="false"') &&
    !html.includes('data-action="primary-cta"')
  );
}

function dimensionOk(html, slot, adapter) {
  if (slot.dimension === "semantic") {
    return (
      html.includes("provider:product:fasteners") &&
      html.includes("provider:service:installation") &&
      html.includes('data-family="hybrid"')
    );
  }
  if (slot.dimension === "functional") {
    return html.includes('data-fake-success="false"') && html.includes('data-hook="contact"');
  }
  if (slot.dimension === "visual") {
    if (adapter.layoutPack === "a2") return html.includes('data-region="aside"') && html.includes("composition-a2-split-shell");
    return html.includes('data-region="secondary"') && html.includes("composition-a3-stacked-shell");
  }
  if (slot.dimension === "accessibility") {
    return a11y(html) && html.includes('data-region="site-header"') && html.includes('data-region="site-footer"');
  }
  if (slot.dimension === "performance") {
    return (
      html.includes('data-perf-class="lab"') &&
      html.includes('data-field-data="false"') &&
      html.includes('data-vps-proof="false"') &&
      html.includes('data-live-proof="false"')
    );
  }
  return false;
}

/**
 * @param {{ layoutPack: string, surface: string, planId: string, dimension: string }} slot
 */
export function evaluateSlot(slot) {
  const adapter = resolveLayoutAdapter(slot.layoutPack);
  const rendered = renderSlotHtml(slot);
  const html = rendered.html;
  const reasons = [];
  if (!html.includes(`data-layout-pack="${adapter.layoutPack}"`)) reasons.push("missing layout pack");
  if (!html.includes(`data-plan-id="${slot.planId}"`)) reasons.push("missing plan id");
  if (!html.includes(`data-page-renderer="${adapter.pageRenderer}"`)) reasons.push("missing page renderer");
  if (!html.includes('data-provider-bytes="false"')) reasons.push("provider bytes claim missing");
  if (!html.includes('data-a1-mutated="false"')) reasons.push("A1 mutation guard missing");
  if (html.includes('data-layout-pack="a1"') || html.includes("composition-a1-linear-shell")) {
    reasons.push("ISS-29 slot must not rewrite frozen A1 HTML");
  }
  if (!a11y(html)) reasons.push("accessibility fixture failed");
  if (!privacy(html)) reasons.push("privacy fixture failed");
  if (!tenant(html)) reasons.push("tenant fixture failed");
  if (!typeLIsolated(html, slot.planId)) reasons.push("Type L isolation failed");
  if (!dimensionOk(html, slot, adapter)) reasons.push(`${slot.dimension} dimension failed`);
  if (slot.surface === "browser" && !html.includes('name="viewport"')) reasons.push("browser viewport missing");
  if (slot.surface === "server" && html.includes('name="viewport"')) reasons.push("server fixture must not pretend to be a viewport capture");

  if (reasons.length) {
    throw new ClosedFailure("slot_failed", `${slotKeyLocal(slot)}: ${reasons.join("; ")}`);
  }

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
    pageRenderer: adapter.pageRenderer,
    verdicts: passMap({
      migration_rollback_valid: "HOLD",
      tamper_rejected: "HOLD",
      cache_restart_valid: "HOLD",
      ...surfaceKeys,
    }),
  };
}

function slotKeyLocal(slot) {
  return `${slot.layoutPack}:${slot.surface}:${slot.planId}:${slot.dimension}`;
}

function slotHtmlRef(slot) {
  return `fixtures/slots/${slot.surface}-${slot.layoutPack}-${slot.planId}-${slot.dimension}.html`;
}

export { a11y, privacy, tenant };

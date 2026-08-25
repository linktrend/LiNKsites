/**
 * Deterministic accessibility, performance, and SEO contracts over injected
 * renderer outputs. The harness never boots web-master or copies provider HTML.
 */

import { IdentityClosedFailure, requireNonEmptyString } from "./identities.mjs";

export const PERFORMANCE_BUDGETS = Object.freeze({
  lcpMs: 2500,
  cls: 0.1,
  inpMs: 200,
  transferBytes: 500_000,
});

/**
 * @param {unknown} raw
 * @returns {Record<string, unknown>}
 */
export function requireRendererOutput(raw) {
  if (raw == null || typeof raw !== "object" || Array.isArray(raw)) {
    throw new IdentityClosedFailure(
      "missing_renderer_output",
      "rendererOutput must be injected; the harness does not render product pages",
    );
  }
  return /** @type {Record<string, unknown>} */ (raw);
}

/**
 * @param {Record<string, unknown>} output
 * @returns {{ code: string, message: string }[]}
 */
export function evaluateAccessibility(output) {
  const findings = [];
  const html = typeof output.html === "string" ? output.html : "";
  if (html.trim() === "") {
    findings.push({
      code: "a11y_missing_html",
      message: "injected renderer html is required for accessibility evaluation",
    });
    return findings;
  }
  if (!/\slang\s*=\s*["'][a-z]{2}(-[A-Za-z0-9]+)?["']/i.test(html)) {
    findings.push({
      code: "a11y_missing_lang",
      message: "injected html must declare a document lang",
    });
  }
  if (!/<main[\s>]/i.test(html)) {
    findings.push({
      code: "a11y_missing_main",
      message: "injected html must include a main landmark",
    });
  }
  if (!/<h1[\s>]/i.test(html)) {
    findings.push({
      code: "a11y_missing_h1",
      message: "injected html must include exactly-evaluable h1 content",
    });
  }
  const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
  for (const match of imgs) {
    const tag = match[0];
    if (!/\salt\s*=/i.test(tag)) {
      findings.push({
        code: "a11y_missing_alt",
        message: "injected img elements must include an alt attribute",
      });
      break;
    }
  }
  const injected = output.accessibility;
  if (injected && typeof injected === "object" && !Array.isArray(injected)) {
    const violations = /** @type {Record<string, unknown>} */ (injected).violations;
    if (Array.isArray(violations) && violations.length > 0) {
      findings.push({
        code: "a11y_injected_violations",
        message: `injected accessibility.violations is non-empty (${violations.length})`,
      });
    }
  }
  return findings;
}

/**
 * @param {Record<string, unknown>} output
 * @returns {{ code: string, message: string }[]}
 */
export function evaluatePerformance(output) {
  const findings = [];
  const performance = output.performance;
  if (performance == null || typeof performance !== "object" || Array.isArray(performance)) {
    findings.push({
      code: "perf_missing_metrics",
      message: "injected renderer performance metrics are required",
    });
    return findings;
  }
  const metrics = /** @type {Record<string, unknown>} */ (performance);
  /** @type {Array<[string, number]>} */
  const numeric = [
    ["lcpMs", PERFORMANCE_BUDGETS.lcpMs],
    ["cls", PERFORMANCE_BUDGETS.cls],
    ["inpMs", PERFORMANCE_BUDGETS.inpMs],
    ["transferBytes", PERFORMANCE_BUDGETS.transferBytes],
  ];
  for (const [field, budget] of numeric) {
    if (!Object.prototype.hasOwnProperty.call(metrics, field)) {
      findings.push({
        code: "perf_missing_metrics",
        message: `injected performance.${field} is required`,
      });
      continue;
    }
    const value = metrics[field];
    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      findings.push({
        code: "perf_invalid_metrics",
        message: `injected performance.${field} must be a finite non-negative number`,
      });
      continue;
    }
    if (value > budget) {
      findings.push({
        code: "perf_budget_exceeded",
        message: `injected performance.${field}=${value} exceeds budget ${budget}`,
      });
    }
  }
  return findings;
}

/**
 * @param {Record<string, unknown>} output
 * @returns {{ code: string, message: string }[]}
 */
export function evaluateSeo(output) {
  const findings = [];
  const document = output.document;
  if (document == null || typeof document !== "object" || Array.isArray(document)) {
    findings.push({
      code: "seo_missing_document",
      message: "injected renderer document metadata is required",
    });
    return findings;
  }
  const doc = /** @type {Record<string, unknown>} */ (document);
  try {
    requireNonEmptyString(doc.title, "document.title");
    requireNonEmptyString(doc.canonical, "document.canonical");
    requireNonEmptyString(doc.robots, "document.robots");
  } catch (error) {
    if (error instanceof IdentityClosedFailure) {
      findings.push({ code: "seo_missing_metadata", message: error.message });
    } else {
      throw error;
    }
  }
  if (typeof doc.canonical === "string" && doc.canonical && !/^https?:\/\//.test(doc.canonical)) {
    findings.push({
      code: "seo_invalid_canonical",
      message: "document.canonical must be an absolute http(s) URL",
    });
  }
  if (!Array.isArray(doc.hreflang) || doc.hreflang.length < 1) {
    findings.push({
      code: "seo_missing_hreflang",
      message: "document.hreflang must be a non-empty injected array",
    });
  }
  const jsonLd = doc.jsonLd;
  const visibleFacts = doc.visibleFacts;
  if (jsonLd == null || typeof jsonLd !== "object" || Array.isArray(jsonLd)) {
    findings.push({
      code: "seo_missing_jsonld",
      message: "document.jsonLd must be injected",
    });
  }
  if (visibleFacts == null || typeof visibleFacts !== "object" || Array.isArray(visibleFacts)) {
    findings.push({
      code: "seo_missing_visible_facts",
      message: "document.visibleFacts must be injected",
    });
  }
  if (
    jsonLd &&
    typeof jsonLd === "object" &&
    !Array.isArray(jsonLd) &&
    visibleFacts &&
    typeof visibleFacts === "object" &&
    !Array.isArray(visibleFacts)
  ) {
    const ld = /** @type {Record<string, unknown>} */ (jsonLd);
    const facts = /** @type {Record<string, unknown>} */ (visibleFacts);
    for (const key of ["name", "url"]) {
      if (facts[key] !== undefined && ld[key] !== facts[key]) {
        findings.push({
          code: "seo_jsonld_visible_fact_mismatch",
          message: `jsonLd.${key} must equal visibleFacts.${key}`,
        });
      }
    }
  }
  return findings;
}

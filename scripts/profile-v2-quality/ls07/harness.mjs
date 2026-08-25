/**
 * LS-07 quality fixture harness. Evaluates injected renderer outputs only.
 * Does not claim LS-06 or LS-07 packet completion.
 */

import {
  IdentityClosedFailure,
  requireProviderIdentity,
  requireRuntimeIdentity,
} from "./identities.mjs";
import {
  evaluateAccessibility,
  evaluatePerformance,
  evaluateSeo,
  requireRendererOutput,
} from "./contracts.mjs";

/**
 * @typedef {{
 *   ok: boolean,
 *   packetComplete: false,
 *   ls06CompleteClaimed: false,
 *   identities?: { provider: object, runtime: object },
 *   findings: { dimension: string, code: string, message: string }[],
 *   closedFailures: { code: string, message: string }[],
 * }} HarnessResult
 */

/**
 * @param {unknown} input
 * @returns {HarnessResult}
 */
export function evaluateInjectedQuality(input) {
  /** @type {HarnessResult} */
  const result = {
    ok: false,
    packetComplete: false,
    ls06CompleteClaimed: false,
    findings: [],
    closedFailures: [],
  };

  if (input == null || typeof input !== "object" || Array.isArray(input)) {
    result.closedFailures.push({
      code: "missing_payload",
      message: "quality payload must be an injected object",
    });
    return result;
  }

  const payload = /** @type {Record<string, unknown>} */ (input);
  if (payload.packetComplete === true || payload.ls06CompleteClaimed === true) {
    result.closedFailures.push({
      code: "forbidden_completion_claim",
      message: "LS-07 scaffolding forbids packetComplete and ls06CompleteClaimed",
    });
    return result;
  }

  try {
    const provider = requireProviderIdentity(payload.providerIdentity);
    const runtime = requireRuntimeIdentity(payload.runtimeIdentity);
    const renderer = requireRendererOutput(payload.rendererOutput);
    result.identities = { provider, runtime };

    const a11y = evaluateAccessibility(renderer).map((finding) => ({
      dimension: "accessibility",
      ...finding,
    }));
    const perf = evaluatePerformance(renderer).map((finding) => ({
      dimension: "performance",
      ...finding,
    }));
    const seo = evaluateSeo(renderer).map((finding) => ({
      dimension: "seo",
      ...finding,
    }));
    result.findings = [...a11y, ...perf, ...seo];
    result.ok = result.findings.length === 0;
    return result;
  } catch (error) {
    if (error instanceof IdentityClosedFailure) {
      result.closedFailures.push({ code: error.code, message: error.message });
      return result;
    }
    throw error;
  }
}

/**
 * @param {HarnessResult} result
 */
export function assertClosedOrPass(result) {
  if (result.closedFailures.length > 0) {
    const detail = result.closedFailures.map((item) => `${item.code}: ${item.message}`).join("; ");
    throw new IdentityClosedFailure("fail_closed", detail);
  }
  if (!result.ok) {
    const detail = result.findings.map((item) => `${item.dimension}/${item.code}: ${item.message}`).join("; ");
    throw new IdentityClosedFailure("contract_failed", detail);
  }
}

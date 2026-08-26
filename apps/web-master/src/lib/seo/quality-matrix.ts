/**
 * Accessibility, performance and visual-regression matrices for LS-07 / ISS-24.
 * Automated checks are fail-closed. Manual/legal items are labeled as such and
 * are never claimed as certification.
 */

export const WCAG_TARGET = "WCAG 2.2 AA" as const;

export const ACCESSIBILITY_MATRIX = Object.freeze([
  { id: "a11y.lang", mode: "automated", criterion: "document language", required: true },
  { id: "a11y.main", mode: "automated", criterion: "main landmark", required: true },
  { id: "a11y.h1", mode: "automated", criterion: "exactly one h1", required: true },
  { id: "a11y.alt", mode: "automated", criterion: "img alt attributes", required: true },
  { id: "a11y.keyboard", mode: "manual", criterion: "keyboard and focus order", required: true, proof: "lab/manual" },
  { id: "a11y.contrast", mode: "manual", criterion: "contrast against theme tokens", required: true, proof: "lab/manual" },
  { id: "a11y.motion", mode: "manual", criterion: "motion/zoom/touch", required: true, proof: "lab/manual" },
  { id: "a11y.rtl", mode: "manual", criterion: "RTL-readiness", required: false, proof: "lab/manual" },
  { id: "a11y.legal", mode: "legal", criterion: "WCAG certification", required: false, proof: "not-claimed" },
] as const);

export const PERFORMANCE_BUDGETS = Object.freeze({
  source: "lab",
  lcpMs: 2500,
  inpMs: 200,
  cls: 0.1,
  transferBytes: 500_000,
});

export const VISUAL_REGRESSION_FIXTURES = Object.freeze([
  { id: "home-desktop", family: "home", viewport: { width: 1280, height: 720 }, layoutPackId: "A1" },
  { id: "home-mobile", family: "home", viewport: { width: 390, height: 844 }, layoutPackId: "A1" },
  { id: "offer-desktop", family: "detail", viewport: { width: 1280, height: 720 }, layoutPackId: "A2" },
  { id: "type-l-isolated", family: "home", viewport: { width: 1280, height: 720 }, layoutPackId: "A1", planId: "L" },
] as const);

export type MatrixResult = Readonly<{
  id: string;
  status: "PASS" | "FAIL" | "MANUAL" | "NOT_CLAIMED";
  detail: string;
}>;

export function evaluateAccessibilityMatrix(html: string): MatrixResult[] {
  return ACCESSIBILITY_MATRIX.map((row) => {
    if (row.mode === "legal") {
      return { id: row.id, status: "NOT_CLAIMED", detail: "WCAG certification is not claimed" };
    }
    if (row.mode === "manual") {
      return { id: row.id, status: "MANUAL", detail: `${row.criterion} requires lab/manual proof` };
    }
    if (row.id === "a11y.lang") {
      const ok = /\slang\s*=\s*["'][a-z]{2}/i.test(html) || /\bdata-lang\s*=\s*["'][a-z]{2}/i.test(html);
      return { id: row.id, status: ok ? "PASS" : "FAIL", detail: row.criterion };
    }
    if (row.id === "a11y.main") {
      return { id: row.id, status: /<main[\s>]/i.test(html) ? "PASS" : "FAIL", detail: row.criterion };
    }
    if (row.id === "a11y.h1") {
      const count = [...html.matchAll(/<h1[\s>]/gi)].length;
      return { id: row.id, status: count === 1 ? "PASS" : "FAIL", detail: `h1 count ${count}` };
    }
    const imgs = [...html.matchAll(/<img\b[^>]*>/gi)];
    const missing = imgs.some((match) => !/\salt\s*=/i.test(match[0]));
    return { id: row.id, status: missing ? "FAIL" : "PASS", detail: row.criterion };
  });
}

export function evaluatePerformanceBudgets(metrics: {
  lcpMs: number;
  inpMs: number;
  cls: number;
  transferBytes: number;
}): MatrixResult[] {
  return (Object.keys(PERFORMANCE_BUDGETS) as Array<keyof typeof PERFORMANCE_BUDGETS>)
    .filter((key) => key !== "source")
    .map((key) => {
      const budget = PERFORMANCE_BUDGETS[key];
      const value = metrics[key];
      const ok = typeof value === "number" && Number.isFinite(value) && value <= budget;
      return {
        id: `perf.${key}`,
        status: ok ? "PASS" : "FAIL",
        detail: `lab ${key}=${value} budget=${budget}`,
      } as MatrixResult;
    });
}

# Known Issues

Last Updated: Dec 22, 2025

## Critical Issues (Blockers)

### VAL-002: Production Build Blocked
- **Status:** 🔴 OPEN
- **Severity:** HIGH
- **Description:** TypeScript errors in `scripts/` prevent `pnpm build` from completing.
- **Impact:** Cannot produce production build artifacts.
- **Workaround:** Use dev server (`pnpm dev`) or temporarily exclude `scripts/` from build/tsconfig.
- **Solution:** Fix TypeScript errors in `scripts/` directory.
- **Estimated Effort:** 2-3 hours
- **Assigned:** Unassigned
- **Related:** VAL-001

## Non-Critical Issues

### VAL-001: TypeScript Errors in Scripts
- **Status:** 🟠 OPEN
- **Severity:** MEDIUM
- **Description:** Dev utility scripts contain TS errors (types/imports) that fail production compilation.
- **Impact:** Blocks production build; dev server unaffected if scripts are not imported.
- **Workaround:** Run dev without building; exclude `scripts/` from production build scope temporarily.
- **Resolution Path:** Audit and fix all TS errors in `scripts/*.ts`.

### VAL-003: ESLint Warnings
- **Status:** 🟡 OPEN
- **Severity:** LOW
- **Description:** Non-blocking ESLint warnings remain (style/ordering/unused) across app.
- **Impact:** Does not block build; reduces code quality signal.
- **Workaround:** None needed; warnings tolerable short-term.
- **Resolution Path:** Run `pnpm lint` and address reported warnings.

### VAL-004: Moderate Security Vulnerability
- **Status:** 🟡 OPEN
- **Severity:** MEDIUM
- **Description:** Dev-only esbuild CORS vulnerability (MEDIUM-002).
- **Impact:** Non-blocking; limited to dev tooling.
- **Workaround:** Keep dev server restricted; monitor for upstream patch.
- **Resolution Path:** Update esbuild when fix is released; re-run security audit.

## Resolved Issues
- Wave 1 critical security issues resolved (Next.js RCE/DoS/source exposure, esbuild critical).
- Wave 2 completed all critical fixes; tests 19/19 passing.
- Site scoping and locale validation enforced via hooks to prevent cross-site leakage.

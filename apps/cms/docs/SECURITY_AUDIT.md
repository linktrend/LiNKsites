# Security Audit

Date: Dec 22, 2025
Last Audit: Wave 3

## 1. Executive Summary
- Status: ✅ SECURE (no critical/high outstanding)
- Critical vulnerabilities: 0
- High vulnerabilities: 0
- Moderate: 1 (dev-only esbuild CORS; see MEDIUM-002)

## 2. Vulnerability History
- Wave 1: 4 critical (Next.js RCE, DoS, source exposure, esbuild CORS).
- Wave 2: All critical resolved via framework and dependency updates.
- Wave 3: Remaining issue downgraded to moderate (esbuild dev dependency).

## 3. Current Vulnerabilities
- MEDIUM-002: esbuild CORS (dev dependency only, non-blocking; monitor for fix).

## 4. Security Fixes Applied
- Upgraded Next.js 15.4.7 → 16.1.0 (addressed CVE-2025-55184, CVE-2025-55183).
- Upgraded PayloadCMS 3.65.0 → 3.69.0.
- Updated dependencies across app to remove known critical/high vulnerabilities.
- Enforced site scoping and locale validation in hooks.

## 5. Security Best Practices
- Site scoping enforced for all requests.
- Locale validation required before publish.
- CSRF protection enabled through Next.js/Payload defaults.
- CORS configured appropriately for allowed origins.
- Database connections should use SSL.

## 6. Recommendations
- Monitor upstream CVEs; run `pnpm audit` before deployments.
- Keep dependencies updated regularly.
- Prioritize fix for MEDIUM-002 when upstream patch lands.
- Re-run full test suite after dependency bumps.

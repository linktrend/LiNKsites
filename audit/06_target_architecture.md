# 06 — Target-State Architecture (per manual doctrine, Sections 01–24)

This is the manual's required target, restated for direct comparison against `05_current_architecture.md`. It is not a new design — every element below is cited to its owning manual section and is the audit's synthesis, not an invention.

```
Visitor
   │
   ▼
Cloudflare (DNS, edge TLS, CDN, WAF/rate limits) — §15
   │  Full(strict) TLS only, no Flexible SSL — §15,§17
   ▼
Traefik (VPS-local reverse proxy; host-based routing, origin TLS, health checks) — §15
   │  Unknown/inactive hostname → fail closed, never default/first-customer render — §15,§18
   ▼
Shared regional frontend pool (one or more VPS, metric-driven scaling — never "20 sites/VPS" as a hard rule) — §01,§15,§23
   │  consumes ONLY: Payload content API / trusted Local API co-located / versioned published-content release / cache from published content
   │  NEVER: Supabase working tables, direct Postgres from browser — §12
   ▼
Central Payload CMS control plane (one logical service; central Postgres authority; NOT one DB per VPS) — §01,§12,§15
   ▲
   │  Promotion Service (ONLY trusted write path; validates checksums + Gate receipts; no raw SQL into Payload tables) — §12
   │
Supabase working layer (Program Ledger: Issues/Runs/Gates/Events/Exceptions; research/evidence; product capability;
   preview/customer production; validation/publication; economics/observability — six logical domains) — §12,§20,§23
   ▲
   │  Executors (deterministic code preferred; AI reserved for interpretation/generation/judgment; pinned model routes) — §20
   │
Program Controller (deterministic dispatch/state progression; NOT OpenClaw, NOT an LLM) — §02,§04,§20
   ▲
   │  Contracts (versioned, signed, idempotent) — §02,§21
   │
LiNKtrend Sales Program  ⇄  Stripe (payment-first)  ⇄  Odoo (commercial/accounting authority)
   via: Integration Ledger / outbox-inbox / Odoo Adapter Service (narrow, allow-listed methods only) — §21
   NEVER: direct cross-Program DB writes; browser-redirect-as-payment-proof — §14,§21

OpenClaw (external, replaceable oversight adapter; OCS-0..OCS-5; never in the live serving/payment path) — §22
Carlos (sole protected authority for material/destructive/legal/security/financial decisions) — §01,§22
```

## Target reusable-asset stack (factory side), per §06–§11

```
Design Intelligence Catalog (versioned styles/palettes/fonts/motion + token hierarchy) — §06
        ↓ resolves to
Component Registry (15-field governed records; lifecycle; compatibility matrix) — §07
        ↓ assembled by
Site Assembly Engine → Site Assembly Manifest (deterministic, reproducible) — §07
        ↓ populated via
Vertical Kit + Tier Specification + Reusable Site Foundation (three distinct, never-collapsed objects) — §08
        ↓ instantiated per prospect via
Lead Research Package (Sales) → Site Specification (LiNKsites) → Prospect Adaptation Contract (LiNKsites) — §09
        ↓ produces
Preview Inventory: Foundation Reservation → Prospect Adaptation → Preview Deployment → Preview Release — §10,§13
        ↓ on conversion (Stripe+Odoo verified only)
Paid Website Activation Package → Customer Site Instance → Final Site Specification → Launch Candidate → Launch Certificate — §14
```

## Key target-vs-current gaps (see `09_gap_and_risk_register.yaml` for full register)

| Target element | Current evidence | Gap severity |
|---|---|---|
| Program Ledger (Issues/Runs/Gates) | Absent — only Payload workflowFields + n8n webhooks | Critical (blocks Phase 2 exit gate) |
| Component Registry (machine object) | Documentation JSON only (`index.json`), not governed record | High |
| Design Intelligence Catalog | Absent | High |
| Vertical Kit / Tier Specification | Absent (narrative text only in `sites_specs/`) | High |
| Preview Inventory / Proof Levels / Conversion Lock | Absent (one static template only) | High |
| Promotion Service (Supabase→Payload trusted path) | Absent — no working-layer/draft-promotion code found | Critical |
| Integration Ledger / Odoo Adapter / Stripe ingress | Absent (0 code hits) | Blocker for Phase 5 |
| Tenant isolation test matrix (negative tests) | Absent (no negative/cross-tenant test found in 9 test files) | Critical (security release-blocker per §18.84-85) |
| Secrets manager (dedicated, non-.env) | configured-unverified (GSM render script exists; not verified live) | High |
| Object storage governance | Absent (no provider decided or wired) | Medium |
| OpenClaw / Program Controller as deterministic service | Absent (by design — not yet built; consistent with "OpenClaw not required" doctrine, but Program Controller itself is also absent) | Critical |
| Backup/restore for Payload+Supabase Postgres | Not found in repo | Critical |

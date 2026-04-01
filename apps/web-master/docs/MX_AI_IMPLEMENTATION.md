# Machine Experience (MX) Implementation

This document captures the Phase 3 Master Template v4.0 MX requirements now implemented in the template.

## AI Markdown Views
- **Route:** `/ai/markdown?path=<original-path>` (legacy `/_ai/markdown` rewrites to this)
- **Purpose:** Serve content-equivalent Markdown for AI agents.
- **Parity:** Uses the same CMS-driven data as the human UI (no content divergence).
- **Enable/Disable:** `NEXT_PUBLIC_ENABLE_AI_MARKDOWN` (default `true`).

## AI Actions Surface
- **Manifest:** `/.well-known/ai-actions.json`
- **Versioned + validated** via Zod (`AI_ACTIONS_VERSION`).
- **State-changing actions** are secured with token + rate limit.
  - **Token header:** `X-AI-Action-Token`
  - **Endpoint:** `/api/ai-actions/contact`
  - **Rate limit:** `AI_ACTIONS_RATE_LIMIT_PER_MIN`

## llms.txt
- **Route:** `/llms.txt`
- **Source-of-truth shared with `robots.txt`** via `CRAWL_POLICY`.
- Lists high-signal entry points for LLMs.

## Content-Signal Header (Optional)
- **Header:** `Content-Signal: ai-train=yes`
- **Enable:** `NEXT_PUBLIC_ENABLE_AI_TRAINING_SIGNAL=true`
- **Note:** Non-standard. Must be enabled only after legal/privacy review.

## Traffic-Source Adaptive UI
- `data-traffic-source` attribute set from referrer/UTM.
- UI changes must not alter core factual content.

## Trust Feed (Positive-Only)
- `trustFeed` block supports **min rating** and **positive-only** filtering.
- If filtering violates platform policy, hide the module.

## Verification Metadata
- JSON-LD uses `reviewedAt` / `reviewedBy` workflow fields to populate verification metadata.
- If dedicated verification fields are added later, map them here without changing the template contract.

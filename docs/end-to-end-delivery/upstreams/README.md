# Worker-visible upstream inputs (immutable planning/source)

This directory is a **sanitized, worker-visible planning/source input bundle** for LiNKsites packet LSG0-02.

These files are **immutable planning/source inputs**. They are not product code, not an admitted provider release, and not live/E2E/production evidence.

This generation **corrects the same version directories** (source commit/tree identity did not change). Access-only HOLDs from the prior checkpoint are replaced with exact bound-source copies. Semantic/provider/live HOLDs remain.

## Versioning

Copied material lives under `<program>/<full-source-commit>/`.

- Do not edit copied source bytes in place.
- A later exact handoff, pin change, or semantic source-identity change produces a **new version directory** keyed by the new full source commit.
- `index.json` is the catalogue for this bundle generation. Hash mismatch or semantic drift invalidates the generation (see `semanticChangeInvalidation` in `index.json`).

## Provider truth preserved without invention

- `marketing-smb-v1` is **quarantined/non-selectable** at the exact LiNKlibraries pin (`entries/marketing-smb-v1/entry.json`: `state=quarantined`, `selectable=false`; absent from `indexes/v2/catalog.json` records).
- Master Website Template (`master-template-type-1`) remains **planning/candidate**: catalogue `lifecycle=draft`, `selectability=non_selectable`, `compatibility=unknown`. Not production admission.
- LiNKharness: LiNKsites Profile fixture plus Profile authoring contract copied. TypeScript schema/port/event implementation withheld (`do_not_copy_harness_source`). Not hosted-executor proof.
- LiNKplatform: auth-claims 1.1.0, token-envelope schema, catalogue-provider handoff schema, and sanitized accept/reject fixtures copied. Token-envelope fixtures with private/stage endpoints withheld. Freeze records are **not** live hosted-auth proof.
- LiNKautowork: gateway/event/status/lifecycle/HTTP/receipt **contract documentation** and **sanitized accept/reject fixtures** retained from the exact pin. Implementation source, secret-shaped fixtures, private endpoints, tokens, and historical bulk evidence remain withheld.

## Programs

| Program | Pin | Bundle status |
|---|---|---|
| linkharness | `7f8d5199…` / tree `2ce580d5…` | PARTIAL_WITHHOLD (Profile fixture + authoring contract; TS implementation withheld) |
| linklibraries | `5188aaf1…` / tree `e389671f…` | PARTIAL_WITHHOLD (catalogue/entry/schema/handoff; assets/executable/bulk evidence withheld) |
| linkplatform | `67ba8646…` / tree `863e6b1f…` | PARTIAL_WITHHOLD (auth/token/catalogue schemas + sanitized fixtures; private-endpoint token fixtures and TS withheld) |
| linkautowork | `605c8281…` / tree `c03f9c65…` | PARTIAL_WITHHOLD (contract docs + sanitized fixtures; secret-shaped fixture and implementation withheld) |

Exact bound source commits were used. Development branch tips were not substituted.

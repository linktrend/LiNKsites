# Worker-visible upstream inputs (immutable planning/source)

This directory is a **sanitized, worker-visible planning/source input bundle**.

These files are **immutable planning/source inputs**. They are not product code, not an admitted provider release, and not live/E2E/production evidence. Copies do **not** prove registration, grants, live endpoints, health, receipts, provider integration, or production.

Prior LSG0-02 version directories are **preserved**. LSG0-04 adds **new** version directories keyed by the current protected `main` commits. Do not edit copied source bytes in place.

LSG0-02 generation **corrected the same version directories** (those source commit/tree identities did not change). Access-only HOLDs from the prior checkpoint were replaced with exact bound-source copies. Semantic/provider/live HOLDs remain.

## Versioning

Copied material lives under `<program>/<full-source-commit>/`.

- Do not edit copied source bytes in place.
- A later exact handoff, pin change, or semantic source-identity change produces a **new version directory** keyed by the new full source commit.
- `index.json` is the catalogue for this bundle generation. Hash mismatch or semantic drift invalidates the generation (see `semanticChangeInvalidation` in `index.json`).

## Provider truth preserved without invention

- `marketing-smb-v1` is **quarantined/non-selectable** at the exact LiNKlibraries pin (`entries/marketing-smb-v1/entry.json`: `state=quarantined`, `selectable=false`; absent from `indexes/v2/catalog.json` records).
- Master Website Template (`master-template-type-1`) remains **planning/candidate**: catalogue `lifecycle=draft`, `selectability=non_selectable`, `compatibility=unknown`. Not production admission.
- LiNKharness: LiNKsites Profile fixture plus Profile authoring contract copied. TypeScript schema/port/event implementation withheld (`do_not_copy_harness_source`). Not hosted-executor proof.
- LiNKplatform (LSG0-02 pin `67ba8646…`): auth-claims 1.1.0, token-envelope schema, catalogue-provider handoff schema, and sanitized accept/reject fixtures copied. Token-envelope fixtures with private/stage endpoints withheld. Freeze records are **not** live hosted-auth proof.
- LiNKautowork (LSG0-02 pin `605c8281…`): gateway/event/status/lifecycle/HTTP/receipt **contract documentation** and **sanitized accept/reject fixtures** retained from the exact pin. Implementation source, secret-shaped fixtures, private endpoints, tokens, and historical bulk evidence remain withheld.
- LiNKplatform (LSG0-04 protected `main` `a0058e74…` / tree `cc3ac1e0…`): same contract/schema/sanitized-fixture set plus the current LiNKclient `EXT-LCL` provider-handoff JSON. Token-envelope fixtures, drafts, SQL, TypeScript, bulk evidence, and three source markdown files with trailing whitespace (`platform-catalogue-profile-v1.md`, consumer-pin packet, 000017 handoff) withheld unmutated. **Not** LiNKsites registration or live issuer/health.
- LiNKautowork (LSG0-04 protected `main` `2e30109a…` / tree `af6883f2…`): current gateway/event/receipt/status/lifecycle/HTTP/persistence/notifications/aggregation contracts, sanitized fixtures, source-local candidate handoff, and LiNKskills consumer HOLD JSON. Secret-shaped fixture and implementation withheld. **Not** LiNKsites consumer registration, grants, live endpoints, health, or receipts.

## Programs

| Program | Pin | Packet | Bundle status |
|---|---|---|---|
| linkharness | `7f8d5199…` / tree `2ce580d5…` | LSG0-02 | PARTIAL_WITHHOLD (Profile fixture + authoring contract; TS implementation withheld) |
| linklibraries | `5188aaf1…` / tree `e389671f…` | LSG0-02 | PARTIAL_WITHHOLD (catalogue/entry/schema/handoff; assets/executable/bulk evidence withheld) |
| linkplatform | `67ba8646…` / tree `863e6b1f…` | LSG0-02 | PARTIAL_WITHHOLD (auth/token/catalogue schemas + sanitized fixtures; private-endpoint token fixtures and TS withheld) |
| linkautowork | `605c8281…` / tree `c03f9c65…` | LSG0-02 | PARTIAL_WITHHOLD (contract docs + sanitized fixtures; secret-shaped fixture and implementation withheld) |
| linkplatform | `a0058e74…` / tree `cc3ac1e0…` | LSG0-04 | PARTIAL_WITHHOLD (current protected main contracts/schemas/sanitized fixtures + pin/000017 source handoffs; not live proof) |
| linkautowork | `2e30109a…` / tree `af6883f2…` | LSG0-04 | PARTIAL_WITHHOLD (current protected main contracts/fixtures + candidate/HOLD handoffs; not live activation) |

Exact bound source commits were used. Development branch tips were not substituted. LSG0-04 directories bind `ref=main` at the supplied 40-character commits only.

# Worker-visible upstream inputs (immutable planning/source)

This directory is a **sanitized, worker-visible planning/source input bundle** for LiNKsites packet LSG0-02.

These files are **immutable planning/source inputs**. They are not product code, not an admitted provider release, and not live/E2E/production evidence.

## Versioning

Copied material lives under ` <program>/<full-source-commit>/ `.

- Do not edit copied bytes in place.
- A later exact handoff, pin change, or semantic correction produces a **new version directory** keyed by the new full source commit.
- `index.json` is the catalogue for this bundle generation. Hash mismatch or semantic drift invalidates the generation (see `semanticChangeInvalidation` in `index.json`).

## Provider truth preserved without invention

- `marketing-smb-v1` is treated as **quarantined/non-selectable** unless exact LiNKlibraries source bytes at the pinned commit/tree prove otherwise. Those bytes were **not readable** here, so the program is **HOLD** and local LiNKsites fixtures were not substituted.
- Master Website Template material remains **planning/candidate** input unless exact source bytes prove otherwise. Not copied; **HOLD**.
- LiNKharness Profile/ports/events and the linksites-profile fixture were evaluated from the consumer but **not copied** (source unreadable; Harness pin also forbids copying implementation source).
- LiNKplatform auth-claims/token/catalogue-provider schemas and accept/reject fixtures were evaluated from the consumer but **not copied** (source unreadable).
- LiNKautowork gateway/event/status/lifecycle/HTTP/receipt **contract documentation** and **sanitized accept/reject fixtures** were copied from the exact readable pin. Implementation source, secret-shaped fixtures, private endpoints, tokens, and historical bulk evidence were withheld.

## Programs

| Program | Pin | Bundle status |
|---|---|---|
| linkharness | `7f8d5199…` / tree `2ce580d5…` | HOLD (repo unreadable with available auth) |
| linklibraries | `5188aaf1…` / tree `e389671f…` | HOLD (repo unreadable with available auth) |
| linkplatform | `67ba8646…` / tree `863e6b1f…` | HOLD (repo unreadable with available auth) |
| linkautowork | `605c8281…` / tree `c03f9c65…` | Copied contract docs + sanitized fixtures |

No branch tip was substituted for an unread pin.

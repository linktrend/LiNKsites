# W1-05 — LiNKlibraries Consumer and Master-Template Contract

**Status:** Planned — pending approval and W1-01 contract freeze
**Wave:** 1
**Executor:** one Codex Luna High implementation agent
**Scope:** coordinated LiNKsites and LiNKlibraries change; do not modify either repository without the packet's explicit approval

## Outcome

Make LiNKsites a governed, SHA-pinned consumer of LiNKlibraries while keeping LiNKsites-specific selection, inventory, compatibility, and lifecycle logic inside the Factory Catalog.

## Ownership boundary

**LiNKlibraries owns:** complete reusable vertical-template packages containing template/component/layout/design-system implementations, baseline copy/text, all media/assets required by the template, tested helpers, content schemas, licenses/provenance, and version governance. Initially, LiNKtrend creates these packages through a manual template-production process before LiNKsites consumes them. A future dedicated Program may automate that creation process, but it is not part of the current LiNKsites Program.

**LiNKsites owns:** vertical/package selection rules, compatibility policy, reusable-foundation records, site specifications, reservations/inventory, prospect adaptations, assembly manifests, conversion locks, outcomes, and receipts recording exact library SHAs.

## Read before work

- accepted W1-01 contracts
- `apps/web-master/src/templates/marketing-smb-v1.ts`
- `packages/factory-catalog/**`
- `docs/LINKSITES-INTENT.md`
- LiNKlibraries current intent, catalog schema, validation commands, consumer flow, and real entry assets/tests

## Required implementation

1. Add LiNKsites as an explicit supported LiNKlibraries consumer using the library's existing catalog-fetch, entry-select, entry-fetch, and Git-SHA receipt pattern.
2. Define a master-template library entry contract for `marketing-smb-v1` without falsely labeling incomplete or metadata-only content as production approved.
3. The entry contract must include executable assets, export/entry point, compatibility/runtime versions, required content schema, baseline copy/text, the complete bundled media/asset inventory for the supported vertical/tier, optional sections, design tokens, test command, provenance/license fields, version and deprecation policy. Missing required copy or assets make the package non-selectable; LiNKsites must not compensate by requesting per-prospect generation.
4. Implement a LiNKsites library client/adapter that:
   - reads an approved catalog reference;
   - resolves only compatible entries;
   - fetches the exact repository commit or immutable artifact;
   - verifies checksum/SHA;
   - records a consumption receipt;
   - fails closed on moving branches, missing assets, incompatible schemas, or checksum mismatch.
5. Extend Factory Catalog manifests/site specifications to store exact entry ID/version/SHA/checksum and compatibility result.
6. Provide deterministic offline fixtures so tests do not require GitHub/network access.
7. Define the submission interface used later by the LiNKsites Architect: it proposes a candidate/version through LiNKlibraries governance and cannot overwrite canonical approved assets.
8. If the current template remains physically in LiNKsites during Wave 1, document it as a migration source. W2-04 must complete the substantive library artifact and update the pinned receipt.

## Parallel/cross-repository safety

- Use separate branches/worktrees and exact base SHAs for each repository.
- Produce one commit/checkpoint per repository with reciprocal contract version references.
- Do not merge one side until integration proves both exact SHAs together.
- Never publish credentials or use a mutable `main` reference as evidence of what was consumed.

## Required tests

- valid catalog/entry resolution
- exact SHA/checksum pinning
- moving-ref rejection
- incompatible runtime/content schema rejection
- metadata-only/missing-asset rejection
- offline fixture consumption
- durable Factory Catalog receipt
- Architect candidate submission cannot replace an approved entry

## Acceptance gates

- LiNKsites is explicitly named and validated as a consumer.
- A master-template entry contract contains or points to real executable assets, not descriptive metadata alone.
- One test proves the full pinned consumption flow and receipt.
- Factory logic has not been moved wholesale into LiNKlibraries.
- Both repository validation suites pass at recorded exact SHAs.

## Evidence and handoff

Report both base/result SHAs, cross-repo compatibility version, entry inventory, executable asset proof, commands/results, pinning receipt example, unresolved migration work for W2-04, and integration order.

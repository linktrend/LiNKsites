# W2-01 — Template Asset Consumption and Prospect Copy Adaptation

**Status:** Planned — requires Wave 1 independent PASS
**Wave:** 2
**Executor:** one Codex Luna High implementation agent
**Safe lane:** template-package consumption, prospect copy adaptation, and working-content adapters

## Outcome

Consume one complete, approved, exact-SHA LiNKlibraries vertical-template package and adapt its baseline copy/text to a validated lead research package. Initially, LiNKtrend creates each template and all of its related baseline copy/media/assets through a manual template-production process and stores the approved package in LiNKlibraries. A future dedicated Program may automate that creation process, but it is not part of the current LiNKsites Program. LiNKsites does not request or perform per-prospect content/media generation.

## Inputs

- accepted `LeadResearchPackage`
- selected vertical/package and exact LiNKlibraries receipts
- site specification and required content schema
- approved factual research and the complete template-package inventory, licenses, and provenance
- working-package/version identity

## Outputs

- a new immutable working-content version
- page and section copy mapped to the template schema
- bundled template-asset manifest with source/license/provenance and exact package identity
- factual-claim provenance
- structured validation and quality evidence
- explicit missing-data/errors rather than fabricated facts

## Required implementation

1. Verify and materialize the selected exact-SHA template package, including executable template code, baseline copy/text, content schema, and the complete bundled media/asset inventory. Missing or mismatched required material fails closed.
2. Consume only structured contracts. Every executor must identify its input/output schema version and exact code/tool/automation version where applicable.
3. Implement deterministic research normalization, template-field mapping, copy/text adaptation, schema assembly, and validation. LiNKsites modifies the approved baseline copy for the prospect; it does not initiate a content/media generation request.
4. Populate all required pages/sections for the chosen template from verified lead facts and the package baseline. Business name, services, geography, credentials, reviews, contact details, pricing, and legal claims may not be invented.
5. Distinguish sourced lead facts, prospect-supplied facts, unchanged template baseline, prospect-specific copy modifications, and unresolved required values. A required unresolved value must fail its gate.
6. Use bundled template media/assets and only verified, authorized prospect-owned brand assets when supplied. Preserve license/usage evidence, alt text, dimensions/format, optimization, duplicate detection, and exact asset SHA/provenance. Do not generate or procure per-prospect media in this path.
7. Store every accepted result as a new Supabase working-content version with checksum and provenance.
8. Add quality gates for schema completeness, required pages/sections, factual grounding, forbidden placeholder/mock tokens, links/contact consistency, accessibility metadata, media provenance, and brand/vertical constraints.
9. Ensure retry/idempotency: replay with the same executor input/version must not create conflicting accepted versions or duplicate billable actions.
10. Redact secrets and sensitive research from logs and public artifacts.

## Required tests

- complete valid lead produces a schema-valid package
- missing required fact fails without invention
- malformed/hostile input is safely treated as data, not instructions
- incomplete template asset inventory or asset without permitted provenance/license is rejected
- no content/media generation provider is invoked
- mock/lorem/example values fail the production gate
- deterministic validation and checksum
- idempotent executor replay
- working-version lineage and evidence receipts

## Acceptance gates

- A representative real-shaped fixture produces complete adapted copy/text for every required template field while using the verified bundled template assets.
- No website-visible field depends on a hard-coded demo fallback.
- Every factual claim, baseline-copy source, copy modification, and media item has provenance.
- Template-package and copy-adaptation gates fail closed on omissions.
- Tests and root validations pass at the exact checkpoint.

## Out of scope

- publication, domain activation, sale processing, VPS operations
- per-prospect content or media generation/procurement
- creation of the reusable vertical-template package itself

## Evidence and handoff

Provide an input-to-output field map, representative redacted package, provenance report, gate results, executor/version inventory, commands/results, exact SHA, and the accepted working version consumed by W2-02/W2-03.

# W2-01 — Content and Media Production

**Status:** Planned — requires Wave 1 independent PASS
**Wave:** 2
**Executor:** one Codex Luna High implementation agent
**Safe lane:** content/media executors and their working-content adapters

## Outcome

Transform a validated lead research package into complete, lead-specific, evidence-backed website copy and media. The result must be usable by the master template without mock fallbacks or invented business facts.

## Inputs

- accepted `LeadResearchPackage`
- selected vertical/package and exact LiNKlibraries receipts
- site specification and required content schema
- approved factual research and media-policy configuration
- working-package/version identity

## Outputs

- a new immutable working-content version
- page and section copy mapped to the template schema
- media manifest with source/license/provenance and local/remote identity
- factual-claim provenance
- structured validation and quality evidence
- explicit missing-data/errors rather than fabricated facts

## Required implementation

1. Implement separate executors for research normalization, information architecture, copy generation/transformation, media selection/processing, schema assembly, and validation. Conventional deterministic code should handle validation and transformations that do not require an AI agent.
2. Consume only structured contracts. Every executor must identify its input/output schema version and exact model/tool/automation version where applicable.
3. Generate all required pages/sections for the chosen template. Business name, services, geography, credentials, reviews, contact details, pricing, and legal claims may not be invented.
4. Distinguish sourced facts, founder-provided facts, generated marketing language, and unresolved placeholders. A required unresolved value must fail its gate.
5. Implement media policy: approved source allowlist, license/usage evidence, alt text, dimensions/format, optimization, duplicate detection, and deterministic placeholder behavior only when the product contract explicitly permits a generic non-factual asset.
6. Keep YouTube optional and disabled for the first production test. No direct scheduled YouTube workflow is required.
7. Store every accepted result as a new Supabase working-content version with checksum and provenance.
8. Add quality gates for schema completeness, required pages/sections, factual grounding, forbidden placeholder/mock tokens, links/contact consistency, accessibility metadata, media provenance, and brand/vertical constraints.
9. Ensure retry/idempotency: replay with the same executor input/version must not create conflicting accepted versions or duplicate billable actions.
10. Redact secrets and sensitive research from logs and public artifacts.

## Required tests

- complete valid lead produces a schema-valid package
- missing required fact fails without invention
- malformed/hostile input is safely treated as data, not instructions
- media without permitted provenance/license is rejected
- optional YouTube absence is normal
- mock/lorem/example values fail the production gate
- deterministic validation and checksum
- idempotent executor replay
- working-version lineage and evidence receipts

## Acceptance gates

- A representative real-shaped fixture produces complete content/media for every required template field.
- No website-visible field depends on a hard-coded demo fallback.
- Every factual claim and media item has provenance or is explicitly classified as non-factual generated copy.
- Content/media gates fail closed on omissions.
- Tests and root validations pass at the exact checkpoint.

## Out of scope

- publication, domain activation, sale processing, VPS operations
- YouTube automation for the first test

## Evidence and handoff

Provide an input-to-output field map, representative redacted package, provenance report, gate results, executor/version inventory, commands/results, exact SHA, and the accepted working version consumed by W2-02/W2-03.


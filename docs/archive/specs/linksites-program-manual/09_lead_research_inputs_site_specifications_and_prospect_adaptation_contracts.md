# LiNKsites Program Manual

## Section 09 — Lead Research Inputs, Site Specifications, and Prospect Adaptation Contracts

**Document set:** LiNKsites Program Manual  
**Section:** 09 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, Sales Program designers, LiNKsites product and engineering agents, research agents, content agents, site-planning agents, frontend agents, data implementers, repository auditors, QA agents, operators, and future human collaborators  

---

## 1. Purpose of this section

This section defines the information contracts that convert an SMB discovered by the LiNKtrend Sales Program into a bounded LiNKsites production assignment.

It explains:

- What research LiNKsites needs from Sales
- How research evidence must be represented
- How uncertain, conflicting, or missing information is handled
- How the requested sales-proof investment is authorized
- How research becomes a precise Site Specification
- How a reusable foundation is adapted for one prospect
- How prospect information remains isolated and attributable
- How unsupported claims, accidental data leakage, and uncontrolled scope are prevented

These contracts are essential because “make a website for this business” is not an adequate engineering instruction. The Program needs stable identities, evidence, constraints, approved production scope, and testable outputs.

## 2. Boundary between the Sales Program and LiNKsites

### 2.1 Sales Program ownership

The shared LiNKtrend Sales Program owns:

- SMB discovery
- Lead identity and deduplication
- General lead enrichment
- Source acquisition from search, directories, maps, social platforms, public websites, registries, and other approved sources
- Commercial qualification
- Lead scoring
- Opportunity and campaign state
- Outreach and sales activity
- Odoo CRM records
- Proof-level request and investment authority
- Recommended and quoted product or tier
- Prospect response and commercial outcome

Sales may use tools such as official platform APIs, search providers, Firecrawl, browser automation, extraction services, code, deterministic workflows, or research agents according to the final technical and legal policies of the Sales Program.

### 2.2 LiNKsites ownership

LiNKsites owns:

- Defining website-specific research requirements
- Validating the Lead Research Package
- Determining website-product feasibility
- Mapping the prospect to a Vertical Kit
- Recommending or validating a suitable tier from a technical perspective
- Matching or authorizing a reusable foundation
- Producing the Site Specification
- Performing prospect adaptation
- Producing and validating the site preview
- Returning technical, cost, and limitation information to Sales

LiNKsites does not become a general lead-discovery or outreach system merely because it consumes public evidence.

## 3. The three core contracts

The preview intake and adaptation process depends on three related but distinct contracts.

| Contract | Producer | Primary purpose |
|---|---|---|
| Lead Research Package | Sales Program | Supply attributable business evidence and commercial context |
| Site Specification | LiNKsites intake/planning | Define the exact website proof to be produced |
| Prospect Adaptation Contract | LiNKsites planning | Define how the selected foundation may be changed for this prospect within authority, budget, and compatibility |

The contracts must not be collapsed into one free-form prompt. Each has its own authority, schema, version, validation, and lifecycle.

## 4. Lead Research Package definition

A **Lead Research Package** is a versioned, attributable collection of normalized evidence about one SMB and the commercial context in which LiNKsites is being asked to produce website proof.

It must distinguish:

- Raw or captured evidence
- Normalized facts
- Source interpretations
- Inferences
- Commercial scores
- Missing information
- Conflicts
- Research limitations

The package is an input to production, not automatic permission to publish everything it contains.

## 5. Lead Research Package envelope

Every package should contain an envelope equivalent to:

```yaml
research_package_id: stable-id
schema_version: version
package_version: version
created_at: timestamp
updated_at: timestamp
producer_program: linktrend-sales
producer_run_ids: []
prospect:
  canonical_lead_id: sales-lead-id
  organization_id: canonical-smb-id
  odoo_lead_or_opportunity_ref: optional-odoo-reference
  display_name: normalized-name
identity_resolution:
  status: resolved-or-ambiguous
  confidence: bounded-score
  duplicate_refs: []
campaign:
  campaign_id: campaign-id
  target_product: linksites
  requested_proof_level: 1-to-4
  recommended_tier_id: optional-tier
  priority: policy-defined
  deadline: optional-timestamp
evidence_manifest_ref: evidence-manifest-id
normalized_business_profile_ref: profile-id
website_assessment_ref: assessment-id
brand_asset_manifest_ref: optional-asset-manifest
research_gaps: []
conflicts: []
sensitivity_profile: profile-id
freshness_receipt: receipt-id
```

The physical data may be normalized across several records. The logical contract must remain reconstructable.

## 6. Canonical identity and deduplication

LiNKsites must not begin expensive production until the package identifies which business is being targeted with sufficient confidence.

Identity resolution should consider:

- Normalized business name
- Trading names and aliases
- Address and service area
- Telephone number
- Domain
- Email domain
- Map or directory identifiers
- Social profile identifiers
- Registration identifiers where available and appropriate
- Parent, branch, and location relationships

The system must distinguish:

- One business with several profiles
- One brand with several locations
- Several businesses with similar names
- A business that moved or rebranded
- A duplicate lead already in Odoo
- An agency, marketplace, or directory page that is not the business itself

An ambiguous identity returns a missing-input or exception package. LiNKsites must not create a persuasive site for the wrong business merely because the name appears similar.

## 7. Required business profile

The normalized business profile should provide, where discoverable:

### 7.1 Identity

- Public business or trading name
- Legal name if relevant and sourced
- Logo and brand marks
- Existing domain or confirmation that none was found
- Public profile URLs

### 7.2 Contact and location

- Public telephone numbers
- Public email addresses
- Physical address
- Service area
- Map coordinates or place reference where appropriate
- Opening or contact hours
- Preferred visible contact method if evidence supports it

### 7.3 Offering

- Services or products publicly offered
- Service categories
- Specializations
- Price information only when explicitly sourced
- Appointment, booking, ordering, visit, or enquiry model

### 7.4 Trust information

- Public credentials
- Associations
- Awards
- Years in operation
- Testimonials or reviews
- Team information

These fields require exact source status. Their presence in a profile does not mean they are approved for website use.

### 7.5 Audience and positioning signals

- Apparent customer categories
- Geographic focus
- Language signals
- Tone and brand presentation
- Differentiators stated by the business
- Common customer questions or pain points supported by public evidence

### 7.6 Digital presence

- Existing website state
- Map or directory presence
- Social pages
- Booking or ordering profiles
- Messaging channels
- Review profiles
- Evidence of recent activity

## 8. Website-specific assessment

The Lead Research Package should include a structured website-opportunity assessment rather than only a binary `has_website` field.

Possible states include:

- No website found
- Domain exists but does not resolve
- Placeholder or parked domain
- Social profile used as primary presence
- Directory-only presence
- Website exists but is materially incomplete
- Website is outdated or visibly broken
- Website is not mobile-usable
- Website lacks a clear conversion path
- Website has material performance or accessibility problems
- Website has insecure or invalid configuration
- Website is functional but could be improved
- Website appears strong and may not be a suitable LiNKsites lead
- State uncertain

The assessment should record observable evidence, capture time, affected URLs, test method, and confidence. It must avoid unsupported commercial conclusions such as “the site loses 80% of customers” unless a valid measurement supports that claim.

## 9. Website assessment dimensions

Website research may examine:

- Availability and TLS state
- Mobile rendering
- Navigation
- Content clarity
- Service information
- Contact-path visibility
- Form function
- Booking or messaging links
- Basic performance indicators
- Obvious accessibility issues
- Metadata and indexability
- Structured data
- Broken links or assets
- Content freshness signals
- Domain consistency
- Brand consistency with public profiles
- Language support
- Location and hours consistency

This is a production and opportunity input. It is not a formal legal, accessibility, security, or SEO certification.

## 10. Evidence object

Each material fact or asset should be traceable to one or more evidence objects.

```yaml
evidence_id: stable-id
subject_id: organization-or-location-id
source_type: website-map-directory-social-registry-customer-other
source_provider: provider-id
source_url_or_ref: source-reference
retrieved_at: timestamp
observed_at: optional-timestamp
retrieval_method: api-firecrawl-browser-script-agent-manual
collector_run_id: run-id
raw_snapshot_ref: optional-snapshot-or-artifact
snapshot_checksum: optional-checksum
extracted_claims: []
access_context: public-or-authorized
freshness_class: policy-class
reliability_class: policy-class
rights_notes: optional-notes
sensitivity: classification
```

Firecrawl can be a useful Sales Program executor for crawling and extracting public website content into structured evidence. LiNKsites should depend on the evidence contract, not on Firecrawl itself. This permits Sales to replace or combine collection tools without changing LiNKsites production logic.

## 11. Fact classification

Every material content candidate should have a status such as:

| Status | Meaning | Preview use |
|---|---|---|
| Verified public fact | Directly supported by a current authoritative public source | Normally eligible within proof policy |
| Corroborated public fact | Supported by multiple independent or consistent sources | Eligible with provenance |
| Single-source public assertion | Stated publicly but not corroborated | Use according to field-risk policy |
| Customer-supplied fact | Supplied by an authorized customer representative | Eligible after identity and approval controls |
| Inference | Reasoned from evidence but not explicitly stated | Never present as certain fact |
| Marketing transformation | Rephrasing of supported facts into approved copy | Eligible after factual review |
| Unverified claim | Material assertion without sufficient support | Block or use internal placeholder only |
| Placeholder | Temporary structure or copy awaiting truth | Must not become production truth |
| Conflicted | Reliable sources disagree | Block or resolve before material use |
| Stale | Evidence is outside the applicable freshness policy | Refresh or obtain confirmation |

Classification must be field-level. A source can be reliable for an address while not proving a credential or price.

## 12. High-risk facts and claims

The system must apply stricter proof to claims that could materially mislead a visitor, including:

- Prices
- Guarantees
- Awards
- Certifications
- Licenses
- Professional qualifications
- Years in business
- Health, safety, legal, or financial claims
- Customer numbers
- Performance or outcome claims
- Testimonials
- Staff identity and roles
- Availability
- Service areas
- Affiliations

The legal policy will be reconciled later. Regardless of that later policy, the technical system must preserve source, confidence, age, and approval so a rule can be enforced.

## 13. Research freshness

Freshness is not one global number. Different facts age at different rates.

Examples:

- Business hours and price information may change frequently.
- A telephone number or address may be stable but still require verification.
- A logo may remain current for years or change suddenly after rebranding.
- Reviews and social activity are time-sensitive signals.
- A website assessment can become stale after a redesign.

Freshness policy should therefore be configured by field class, source, proof level, and publication risk. The package records when evidence was obtained and when refresh becomes mandatory.

If research is stale at intake, LiNKsites may request a targeted refresh rather than repeating all discovery.

## 14. Conflicting evidence

When sources disagree, the system must not allow an agent to choose silently.

A conflict record should include:

- Field or claim affected
- Competing values
- Evidence references
- Source classes
- Dates
- Confidence
- Resolution rule applied
- Resolved value or unresolved status
- Resolver and Run

Possible outcomes are:

- Prefer a more authoritative current source
- Prefer a customer-confirmed value after purchase
- Use a neutral formulation that does not assert the disputed detail
- Omit the information from the preview
- Return a research clarification request

## 15. Brand and media inputs

The package should identify available brand and media sources separately from content facts.

For each asset, record:

- Asset ID
- Source
- Captured or supplied date
- File or snapshot reference
- Visible subject
- Apparent relationship to the business
- Technical properties
- Reuse or preview-use status
- Rights status or unresolved rights question
- Required attribution
- Whether it may be transformed
- Whether it may be used only as a reference

Finding an image on a public page does not itself make the image a reusable foundation asset. Media creation, rights, provenance, and substitution are defined fully in Section 11.

## 16. Research gaps

The package must state what was not found or could not be resolved. Typical gaps include:

- No logo of adequate quality
- No verified email
- Conflicting hours
- Unclear service list
- No reliable business photography
- No evidence for a stated credential
- No existing website access
- Unknown domain control
- Unknown booking destination
- Uncertain preferred language

Absence of evidence should not automatically become a negative fact. “No website found” is different from “the business has no website.”

## 17. Research Sufficiency Profile

Research sufficiency depends on the requested proof level, Vertical Kit, and risk of the fields used.

Every Vertical Kit should define a Research Sufficiency Profile containing:

- Mandatory identity fields
- Minimum evidence sources
- Required website assessment dimensions
- Required offering fields
- Required contact or conversion fields
- High-risk fields that must be omitted without confirmation
- Optional enrichment fields
- Freshness thresholds
- Acceptable unresolved gaps
- Conditions that block adaptation

The profile should be machine-checkable where possible.

## 18. Progressive Sales Proof Levels

Proof levels control speculative investment before a sale. They do not define the paid product.

| Level | Intended prospect class | Production intent |
|---|---|---|
| Level 1 | Plausible prospect | Minimum viable personalized preview based on a highly reusable vertical foundation |
| Level 2 | Good prospect | Personalized homepage and essential site experience using a well-matched reusable design |
| Level 3 | Strong prospect | Near-complete, substantially personalized website based on governed reusable assets |
| Level 4 | Highest-probability or highest-value prospect | Complete sale-ready preview, potentially upgraded from a previously unsold Level 2 or Level 3 foundation |

These are governing definitions, not exact page-count commitments. Each proof level requires a versioned Proof Specification defining its allowed investment, content depth, media treatment, validation, and deployment behavior.

A prospect may begin at any justified level. Upgrades occur through a new authorization and updated Site Specification.

## 19. Preview Production Request

The Sales Program sends a **Preview Production Request** that references the Lead Research Package.

It should include:

```yaml
preview_request_id: stable-id
request_version: version
canonical_lead_id: sales-lead-id
research_package_id: package-id
campaign_id: campaign-id
requested_product: linksites
requested_proof_level: level
recommended_tier_id: tier-id-or-null
commercial_priority: policy-value
investment_authorization:
  budget_class: class
  maximum_cost: governed-value-or-reference
  authority_ref: authority-record
deadline: timestamp-or-null
requested_language_or_locale: values
requested_conversion_focus: optional-value
sales_notes: bounded-structured-notes
correlation_id: end-to-end-id
idempotency_key: unique-request-key
```

LiNKsites should reject or quarantine duplicate, expired, contradictory, or unauthorized requests.

## 20. Intake validation

M07 Preview Request Intake and Planning performs:

1. Schema and version validation.
2. Identity and duplicate validation.
3. Research-package integrity and freshness checks.
4. Proof authority and budget checks.
5. Product and Vertical Kit feasibility.
6. Tier recommendation compatibility.
7. Locale, content, media, and integration feasibility.
8. Current production capacity check.
9. Foundation inventory match request.
10. Deadline feasibility.

The disposition must be explicit:

- Accepted
- Accepted with recorded limitations
- Needs targeted research
- Needs Sales clarification
- Needs capability or foundation investment authorization
- Deferred for capacity
- Rejected as technically incompatible
- Cancelled or superseded

## 21. Site Specification definition

A **Site Specification** is the exact, versioned production contract for one foundation, preview, or customer site version.

For a prospect preview, it converts research, proof authority, product rules, and the selected foundation into testable requirements. It is not finished copy, frontend code, or Payload content.

The Site Specification states what must be produced, what may be varied, what evidence supports the content, what remains provisional, and which Gates determine completion.

## 22. Site Specification logical record

```yaml
site_specification_id: stable-id
version: version
state: draft-approved-superseded-cancelled
site_class: prospect_preview
canonical_lead_id: sales-lead-id
preview_request_id: request-id
research_package_id: package-version
proof:
  level: 1-to-4
  specification_version: proof-spec-version
  budget_ref: authorized-budget
product:
  recommended_tier_id: tier-id
  tier_specification_version: tier-version
vertical:
  kit_id: vertical-kit-id
  kit_version: kit-version
  subvertical: optional-value
foundation:
  strategy: reuse-adapt-refresh-new
  selected_foundation_id: optional-id
  selected_foundation_version: optional-version
design:
  site_design_profile_ref: profile-or-selection-contract
information_architecture_ref: route-and-page-plan
content_requirements_ref: content-requirements-version
media_requirements_ref: media-plan-version
conversion_requirements_ref: conversion-plan-version
integration_requirements_ref: integration-plan-version
locale_profile_ref: locale-profile-version
preview_safety_profile: profile-version
analytics_profile: profile-version
acceptance_gate_profile: gate-profile-version
known_limitations: []
open_questions: []
execution_plan_ref: plan-id
correlation_id: end-to-end-id
approved_by: authority-ref
approved_at: timestamp
```

## 23. Site identity and purpose

The Specification must state:

- Whether the object is a neutral foundation, prospect preview, or customer site
- The canonical prospect or customer identity where applicable
- The primary visitor audience
- The primary conversion objective
- Secondary objectives
- The proof and tier context
- Whether the preview is private, controlled, or otherwise limited
- The intended Sales use

This prevents a preview from being mistaken for a live customer-authorized website.

## 24. Information architecture requirements

The Specification defines:

- Routes or page types required at the proof level
- Navigation model
- Required and optional sections
- Section purpose and priority
- Permitted reordering
- Location or service structures
- Language behavior
- Footer and global information
- Preview-only notices or safeguards where required

It should refer to Vertical Kit patterns and registered components rather than prescribe arbitrary JSX.

## 25. Conversion requirements

The Specification must define the intended visitor action and its safe preview behavior.

Examples include:

- Call the business using a verified public number
- Open an existing booking page
- View directions
- Send a preview enquiry to a controlled LiNKtrend destination rather than a nonexistent business inbox
- Demonstrate a form without transmitting personal information to an unconfigured endpoint

The production path and preview path may differ. The Specification must prevent a demonstration integration from being mistaken for a live production service.

## 26. Content Requirements Matrix

Each required content field or block should be represented with:

| Field | Meaning |
|---|---|
| Content slot | Stable schema location |
| Purpose | Why the visitor needs it |
| Source requirement | Acceptable evidence class |
| Current candidate | Proposed value or reference |
| Factual status | Verified, inferred, placeholder, conflicted, and so on |
| Proof-level treatment | Required, optional, omitted, or provisional |
| Publication requirement | Confirmation or approval needed before live use |
| Transformation rules | What copy editing is allowed |
| Length and format | Schema and design limits |
| Missing-data behavior | Omit, fallback, block, or request clarification |

This matrix prevents content generation from becoming an untracked creative exercise.

## 27. Media Requirements Matrix

For every media role, define:

- Purpose
- Required subject
- Preferred source class
- Permitted fallback
- Aspect ratio and responsive variants
- Resolution and format
- Rights and provenance status
- Transformation allowance
- Alt-text basis
- Proof-level quality
- Production replacement requirement

The Specification may authorize a lower-cost preview asset that must be replaced or confirmed after purchase. That requirement must survive into the Paid Website Activation Package.

## 28. Design and component requirements

The Specification binds:

- Design selection inputs
- Approved Site Design Profile or candidate range
- Customer-brand evidence
- Required component capabilities
- Permitted component variants
- Vertical Kit and Tier Variant constraints
- Similarity or campaign-distinctiveness requirements
- Accessibility and responsive profiles
- Performance budget

An agent may recommend among eligible choices. The accepted selection is recorded through the Design Decision Record and Site Assembly Manifest defined in Sections 06 and 07.

## 29. Known limitations and provisional elements

The Specification must make limitations explicit, for example:

- Hours omitted because sources conflict
- Stock or generated image used for preview only
- Booking shown as a link because account authorization is unavailable
- One page demonstrated although the recommended paid tier includes more
- Copy derived from public information and awaiting customer confirmation
- Domain and production form not configured before purchase

Limitations are not buried in executor logs. They are structured outputs passed to Sales and later fulfilment.

## 30. Prospect Adaptation Contract definition

A **Prospect Adaptation Contract** is the instance-specific instruction that binds:

- One approved Site Specification
- One reserved reusable foundation or authorized new-foundation strategy
- One Lead Research Package version
- One proof-level authorization
- One set of permitted changes
- One budget and execution plan

The foundation's general Adaptation Contract states what can normally change. The Prospect Adaptation Contract states which of those changes are required and authorized for this lead.

## 31. Prospect Adaptation Contract record

```yaml
adaptation_contract_id: stable-id
version: version
state: planned-active-validating-complete-superseded-cancelled
preview_id: preview-id
site_specification_id: specification-version
research_package_id: package-version
foundation:
  id: foundation-id
  version: foundation-version
  reservation_id: reservation-id
proof_authority_ref: authority-record
budget:
  maximum: governed-value-or-ref
  cost_policy: policy-version
change_plan:
  direct_substitutions: []
  bounded_composition_changes: []
  content_production_issues: []
  media_production_issues: []
  integration_preview_actions: []
prohibited_changes: []
required_gate_profile: gate-profile-version
executor_policy: executor-policy-version
deadline: timestamp-or-null
lineage_policy: lineage-policy-version
rollback_ref: rollback-plan
```

## 32. Adaptation change classes

### 32.1 Direct substitutions

These are low-cost changes already anticipated by the foundation:

- Business name and identity
- Verified contact details
- Approved token profile
- Copy within existing slots
- Media within existing roles
- Standard call-to-action targets

### 32.2 Bounded composition changes

These use pretested alternatives:

- Approved component variant
- Optional section inclusion
- Permitted section reordering
- Compatible design profile
- Alternate Kit page pattern

### 32.3 Proof upgrade

These require more pre-sale investment but no new platform capability:

- More complete content
- Additional pages
- Better or additional media
- Greater personalization
- More extensive validation

They require updated proof authority.

### 32.4 Foundation refresh or refactor

The existing foundation remains broadly suitable but needs governed correction or recomposition before use.

### 32.5 New capability

A missing component, schema, integration adapter, or platform feature must enter the capability-development lifecycle. Routine adaptation cannot authorize it implicitly.

## 33. Prospect adaptation workflow

1. Lock the accepted Site Specification version.
2. Reserve and verify the selected foundation.
3. Create the prospect-isolated adaptation identity and workspace records.
4. Build a field-level content mapping from research evidence.
5. Resolve the Site Design Profile within authorized constraints.
6. Apply direct substitutions.
7. Apply approved composition changes.
8. Request copy and media Issues.
9. Configure safe preview conversion behavior.
10. Construct the prospect Site Assembly Manifest.
11. Validate schema, evidence, lineage, budget, and isolation.
12. Produce the Supabase working package.
13. Pass the package to controlled Payload draft promotion.
14. Render and validate the preview.
15. Return completion, limitations, cost, and evidence to Sales.

Runs may occur in parallel where dependencies allow, but acceptance follows the contract and Gates.

## 34. Prospect data isolation

Every prospect adaptation must use stable isolation boundaries for:

- Content records
- Asset records
- Configuration
- Analytics identifiers
- Preview routing
- Form destinations
- Build and deployment records
- Logs and cost records
- Foundation lineage

The system must prevent:

- Prior prospect names appearing in copy
- Prior logos or photography appearing in media
- Old telephone or address data remaining in metadata
- Another prospect's analytics receiving events
- A shared form posting to the wrong destination
- A cached preview rendering the wrong content
- Prospect data being written into the neutral foundation

Automated leakage tests should search both visible and non-visible outputs, including metadata, structured data, asset filenames, alt text, manifests, forms, and caches.

## 35. Factual transformation rules

Copy agents may:

- Summarize supported services
- Rewrite publicly stated facts in clear original language
- Organize information for visitor comprehension
- Convert first-person or fragmented public text into suitable business copy
- Create generic connective language that does not introduce unsupported claims
- Propose calls to action consistent with verified contact paths

They must not invent:

- Credentials
- Testimonials
- Results
- Prices
- Guarantees
- Staff
- Locations
- Availability
- Awards
- Years of operation
- Customer promises

Every material statement should be traceable either to evidence, an approved generic pattern, or a clearly classified provisional status.

## 36. Placeholders and preview-safe inference

Build-first selling sometimes requires producing an attractive site before the prospect has supplied information. The solution is controlled provisional content, not fabrication.

Permitted approaches may include:

- Omit a section whose facts are unavailable
- Use neutral vertical copy that makes no business-specific claim
- Use a clearly internal placeholder blocked from publication
- Demonstrate structure with a safe sample label in a controlled preview
- Use a verified social or directory contact path
- State only what the public evidence supports

The Preview Safety Profile determines which provisional elements may be visible to the prospect and which must never leave internal staging. Customer production publication applies stricter confirmation requirements.

## 37. Budget and scope control

Every adaptation Run must charge cost to the authorized preview and report against the budget.

The control layer should know:

- Expected cost by Issue
- Actual compute, model, media, deployment, and intervention cost
- Remaining budget
- Whether the work is reusable capability investment or prospect-specific adaptation
- Whether a proof upgrade is justified
- Whether an exception is required

An executor must not keep improving a preview indefinitely because additional work seems beneficial. It stops at the Site Specification's Definition of Done or requests new authority.

## 38. Adaptation outputs

A completed adaptation produces:

- Prospect Adaptation Package
- Prospect Site Assembly Manifest
- Content Requirements Matrix with resolved statuses
- Media Plan and asset references
- Site Design Profile and Design Decision Record
- Foundation and preview lineage
- Supabase working-package reference
- Known limitations and production replacement requirements
- Cost record
- Executor and Run evidence
- Gate receipts
- Payload-promotion eligibility receipt

These outputs must remain understandable to a later AI or human without access to the originating chat or agent memory.

## 39. Change and supersession

New research, prospect feedback, proof upgrades, or corrected facts may require a new version of:

- Lead Research Package
- Site Specification
- Prospect Adaptation Contract
- Content candidates
- Site Assembly Manifest

The system must decide whether active Runs:

- Continue on the pinned version
- Pause and replan
- Cancel and compensate
- Complete but do not promote

A correction must not overwrite the evidence that explains why the prior version existed.

## 40. Sales feedback loop

LiNKsites returns structured information to Sales, including:

- Request disposition
- Missing research
- Website-fit assessment correction
- Recommended tier or Vertical Kit adjustment
- Foundation and preview strategy
- Expected and actual cost
- Preview limitations
- Preview URL and readiness receipt
- Suggested proof upgrade only where evidence supports it
- Commercially relevant technical answer

Sales returns:

- Prospect engagement
- Objections
- Corrections
- Requested changes
- Proof upgrade authorization
- Hold, recycle, conversion, or rejection outcome

These events improve future research and matching without giving either Program the other's authority.

## 41. Executor responsibilities

### 41.1 Deterministic executors

Code, scripts, and automations should perform:

- Schema validation
- Identity and reference checks
- Evidence checksum validation
- Freshness evaluation
- Research Sufficiency Profile evaluation
- Duplicate request detection
- Budget checks
- Foundation eligibility filtering
- Content-field mapping validation
- Leakage scanning
- Manifest creation
- Cost aggregation

### 41.2 Research and planning agents

Agents may:

- Synthesize evidence
- Resolve low-risk semantic mappings
- Propose vertical and subvertical fit
- Recommend content emphasis
- Draft the Site Specification
- Evaluate qualitative foundation fit
- Identify contradictions and missing inputs

Their accepted outputs are structured records and must cite evidence IDs.

### 41.3 OpenClaw oversight

OpenClaw may present exceptions, summarize evidence, request Carlos's decision, or exercise explicitly delegated operational authority. It is not required for ordinary request validation or adaptation and is not the data authority.

## 42. Failure and exception handling

Common exceptions include:

- Ambiguous business identity
- Duplicate Odoo lead or active preview
- Missing proof authority
- Stale research
- Insufficient factual evidence
- Unsupported vertical
- No eligible foundation
- Required capability missing
- Media rights unresolved
- Deadline or budget infeasible
- Conflicting tier recommendation
- Previous-prospect leakage detected
- Source becomes unavailable

Each exception has a code, severity, owner, allowed resolution paths, retry policy, and evidence. It must not be hidden inside a model explanation.

## 43. Security and sensitivity

The research package should contain only information needed for the workflow. It must distinguish public business data from personal, private, credential, or customer-supplied information.

Controls should include:

- No secrets in research or Site Specification records
- Restricted access to personal contact details where collected
- Source snapshots stored under defined retention and access policy
- Logs that avoid unnecessary content reproduction
- Preview links protected according to proof policy
- Customer-authorized information separated from public research
- Deletion, retention, and recycling hooks preserved for later policy decisions

Final legal and privacy constraints remain a later decision, but the architecture must be capable of enforcing them.

## 44. Repository audit questions

The later repository audit must determine:

1. Whether lead research has a canonical schema or exists only in notes, prompts, and scraped files.
2. Whether Odoo, local databases, Supabase tables, and repositories contain duplicate business identities.
3. Whether evidence objects preserve source, capture time, method, and raw reference.
4. Whether Firecrawl or other collectors are implemented and where their outputs go.
5. Whether fact confidence and publication authority are conflated.
6. Whether research gaps and conflicts are represented.
7. Whether proof-level authority is machine-checkable.
8. Whether Site Specifications exist or agents build directly from research prompts.
9. Whether foundations have general and prospect-specific Adaptation Contracts.
10. Whether prospect content contaminates templates or shared code.
11. Whether preview forms, analytics, metadata, and structured data leak prior prospect information.
12. Whether cost is tracked against authorization.
13. Whether Supabase working records can be traced to research and Site Specification versions.
14. Whether Payload drafts can be traced back to approved working records.
15. Which schemas, scripts, prompts, crawlers, and datasets can be retained or normalized.

## 45. Initial implementation sequence

1. Define canonical organization, location, lead, evidence, claim, conflict, and research-gap schemas with the Sales Program.
2. Define the Lead Research Package contract and versioning.
3. Define website-specific Research Sufficiency Profiles for the initial Vertical Kits.
4. Connect Sales collectors, including Firecrawl where useful, through evidence adapters.
5. Implement identity, duplicate, freshness, and sufficiency validation.
6. Define Proof Specifications and the Preview Production Request contract.
7. Define the Site Specification and its content, media, conversion, design, and limitation subcontracts.
8. Define the Prospect Adaptation Contract and budget controls.
9. Implement isolated prospect workspaces and lineage.
10. Implement deterministic leakage, schema, and provenance Gates.
11. Prove one end-to-end Level 1 adaptation and one higher-investment adaptation.
12. Prove correction, proof upgrade, cancellation, and recycling paths.
13. Measure research reuse, adaptation cost, error rate, and Sales usefulness.

## 46. Decisions intentionally still open

This section does not finalize:

- Exact lead-scoring formulas
- Exact proof-level budgets
- Exact freshness periods
- Exact minimum source counts
- Final data-retention periods
- Final platform-specific collection restrictions
- Final legal basis for scraping, storage, outreach, voice calls, or personal data
- The first active Vertical Kits
- Final public preview access policy
- Exact high-risk claim rules by market and industry
- Which research providers are primary or fallback

These must be configured through later commercial, legal, operational, and engineering decisions. The contracts above preserve the information needed to make and enforce them.

## 47. Acceptance criteria

This part of LiNKsites is adequately defined and implemented when:

1. Sales supplies a versioned Lead Research Package rather than an unstructured prompt.
2. LiNKsites can verify canonical lead identity and detect ambiguous or duplicate work.
3. Every material fact and asset can reference attributable evidence.
4. Facts, inferences, marketing transformations, placeholders, stale data, and conflicts are distinguished.
5. Research Sufficiency Profiles are specific to Vertical Kit, proof level, and field risk.
6. Firecrawl and other collectors can be replaced without changing the LiNKsites input contract.
7. A Preview Production Request contains proof authority, budget, campaign, deadline, and idempotency identifiers.
8. Every accepted request produces a versioned Site Specification.
9. The Site Specification defines identity, purpose, routes, content, media, design, components, conversion, integrations, locale, limitations, and Gates.
10. A Prospect Adaptation Contract binds one specification, research version, reserved foundation, proof authority, budget, and change plan.
11. Routine adaptation cannot authorize arbitrary code or unsupported scope.
12. Prospect-specific content and assets remain isolated from the neutral foundation and other previews.
13. Automated checks cover visible and non-visible prior-prospect leakage.
14. Unsupported claims cannot become accepted content merely because an agent generated fluent copy.
15. Preview-safe provisional content cannot silently become production truth.
16. Actual adaptation cost is traceable to Issues and Runs and compared with authorization.
17. Corrected research or proof upgrades produce explicit superseding versions.
18. LiNKsites returns structured technical outcomes to Sales without taking CRM or commercial authority.
19. Exceptions have codes, owners, evidence, and resolution paths.
20. The full package remains understandable without access to chat history or executor memory.

## 48. Governing conclusion

LiNKsites can operate autonomously only when research, planning, and personalization are represented as explicit contracts.

The Sales Program discovers and understands the commercial lead. The Lead Research Package gives LiNKsites attributable evidence about the business. LiNKsites converts that evidence, together with proof authority, the Vertical Kit, Tier Specification, and reusable inventory, into a precise Site Specification. The Prospect Adaptation Contract then authorizes a bounded set of changes to one reserved foundation.

This structure allows the factory to produce convincing build-first proof quickly while controlling cost and preserving truth. Agents can use their judgment to interpret research and shape a suitable site, but deterministic validation prevents them from confusing inference with fact, preview scope with paid entitlement, or one prospect's data with reusable inventory. The result is a production process that is personalized without being improvised and autonomous without being unaccountable.

---

**End of Section 09**

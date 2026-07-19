# LiNKsites Program Manual

## Section 08 — Vertical Kits, Tier Specifications, and Reusable Site Foundations

**Document set:** LiNKsites Program Manual  
**Section:** 08 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, product agents, engineering agents, vertical-research agents, designers, content-system implementers, frontend implementers, repository auditors, QA agents, Sales Program integrators, operators, and future human collaborators  

---

## 1. Purpose of this section

This section defines three of the most important reusable production assets in LiNKsites:

1. **Vertical Kits**, which convert knowledge about a category of SMB into governed production rules.
2. **Tier Specifications**, which define what LiNKsites may promise and produce at each paid service level.
3. **Reusable Site Foundations**, which are tested, prospect-neutral website structures that can be adapted quickly into sales previews and customer sites.

Together, these assets make the original LiNKsites thesis operational: invest in reusable knowledge, components, structures, media patterns, and content schemas once; then create each new website through controlled adaptation rather than starting from nothing.

This system preserves the economic advantages of templates without reducing the customer product to a generic theme. It also preserves the advantages of AI without making expensive, inconsistent, frontier-model generation the center of every site build.

## 2. The relationship among the three assets

The three assets answer different questions.

| Asset | Question answered |
|---|---|
| Vertical Kit | What does this category of SMB normally need in order to communicate clearly and convert suitable visitors? |
| Tier Specification | What scope, capability, service, and continuing obligation has the customer purchased? |
| Reusable Site Foundation | Which tested site composition can satisfy that vertical and tier with the least safe adaptation work? |

Their normal relationship is:

```text
Vertical Kit rules
+ Tier Specification rules
+ Design Intelligence and Component Registry
→ Reusable Site Foundation
→ Prospect adaptation
→ Customer Site Instance
```

These objects must remain separate. A single foundation may be compatible with more than one tier. A tier may apply across many Vertical Kits. A Vertical Kit may support many foundations. Combining them into one undocumented template would make product changes, migration, cost accounting, and autonomous selection difficult.

## 3. Governing doctrine

1. **Vertical knowledge is reusable production knowledge.** It must be represented in structured, versioned form rather than only in prompts or design files.
2. **Tier rules are enforceable product contracts.** They are not informal sales descriptions.
3. **Foundations are prospect-neutral.** Prospect and customer facts live in isolated adaptations and content records.
4. **A foundation is not a code fork.** It is a pinned composition of shared platform capabilities, schemas, tokens, and neutral assets.
5. **Reuse is bounded by fit and rights.** The cheapest foundation is not eligible if it is unsuitable, stale, restricted, or unsafe.
6. **Variation is governed.** Different foundations, component variants, content, media, design profiles, and kit subtypes can produce distinct sites without uncontrolled code generation.
7. **Proof level and paid tier remain separate.** Pre-sale investment authority does not redefine the product sold.
8. **Facts are never inherited from another business.** Only patterns and reusable assets may be inherited.
9. **Version changes are explicit.** Existing customer sites do not silently change when a Kit, tier, or foundation is updated.
10. **Performance evidence improves the system.** Conversion, rejection, engagement, cost, quality, and maintenance evidence should influence future Kit and foundation decisions.

## 4. Definition of a Vertical Kit

A **Vertical Kit** is a versioned production package that describes how LiNKsites should plan, compose, populate, validate, and maintain websites for a defined category of SMB.

Examples of possible verticals include restaurants, dentists, accountants, salons, local trades, tutors, property services, and professional practices. These examples are illustrative only. The first commercial Vertical Kits have not yet been finally approved and must not be hard-coded by an implementation agent.

A Vertical Kit is not:

- A finished customer website
- One visual template
- A list of generic marketing slogans
- A collection of copied competitor sites
- A Sales lead list
- A hosting region
- A locale or language
- A promise that every business in the category has identical needs

It is a governed description of repeatable needs and permissible production patterns.

## 5. Vertical versus market, locale, and hosting region

These concepts must not be confused.

- A **vertical** describes the business type and its operating/customer pattern.
- A **subvertical** captures a meaningfully different specialization inside a vertical.
- A **market profile** may describe commercial, cultural, regulatory, or customer-behavior differences in a place where a product is offered.
- A **locale profile** describes language, script, formatting, and presentation requirements.
- A **hosting region** describes where frontend capacity is deployed for speed, reliability, or operations.

The location of a VPS does not determine the Vertical Kit. LiNKsites may initially place customers from different regions on the same VPS and later group them regionally as capacity grows. That hosting topology is independent from the kit used to produce their sites.

A Vertical Kit may use market or locale overlays when evidence shows a real difference. The system should not duplicate an entire Kit merely because a site uses another language or is hosted on another regional VPS.

## 6. Vertical granularity

A vertical must be narrow enough to support useful production decisions and broad enough to justify reuse.

“Small business” is generally too broad because it does not determine visitor needs, content structure, calls to action, or integrations. Conversely, a category defined around one individual prospect is too narrow to justify a reusable Kit.

A vertical should split into subverticals when evidence shows material differences in matters such as:

- Visitor intent
- Trust requirements
- Service or product structure
- Conversion action
- Required pages
- Media needs
- Structured data
- Booking or enquiry behavior
- Business terminology
- Compliance-sensitive claims
- Operational integrations

For example, two businesses may share a broad industry label but need different Kit variants because one primarily books appointments while another primarily sells fixed service packages. A split is justified by production meaning, not by taxonomy for its own sake.

## 7. Vertical Kit contents

Each Vertical Kit should contain or reference the following governed elements.

### 7.1 Identity and scope

- Stable Kit ID
- Kit name and version
- Lifecycle state
- Owner
- Included business types
- Excluded or unsupported business types
- Subvertical taxonomy
- Intended customer profile
- Known edge cases

### 7.2 Audience and visitor jobs

- Typical visitor categories
- Information visitors need before acting
- Trust barriers
- Common objections
- Urgency patterns
- Device and context assumptions supported by evidence
- Primary and secondary visitor actions

### 7.3 Business information ontology

The Kit defines the kinds of facts needed to create an accurate site, such as:

- Business identity
- Service or product categories
- Locations or service areas
- Opening or availability information
- Contact methods
- Credentials
- Team information
- Price presentation, where appropriate
- Policies
- Testimonials or proof
- Booking, enquiry, ordering, or visit instructions

The ontology describes fields and relationships. It does not invent values for a prospect.

### 7.4 Content patterns

- Page-purpose patterns
- Section-purpose patterns
- Copy frameworks
- Required factual inputs
- Optional enrichment inputs
- Prohibited unsupported claims
- Tone ranges
- Content-length ranges
- Frequently asked question patterns
- Metadata patterns

### 7.5 Conversion patterns

- Primary conversion objective
- Secondary conversion objectives
- Calls to action
- Placement rules
- Contact and booking pathways
- Trust evidence required before an action
- Friction reduction patterns
- Measurement events

### 7.6 Page and navigation patterns

- Required page types
- Optional page types
- Permitted navigation structures
- Single-page versus multi-page eligibility
- Location-page behavior
- Service-detail behavior
- Tier-specific page rules

### 7.7 Design constraints

- Suitable and unsuitable style families
- Content-density expectations
- Media emphasis
- Layout profiles
- Typography or script requirements
- Component compatibility
- Distinctiveness requirements
- Accessibility constraints particular to common content

### 7.8 Media patterns

- Required media roles
- Suitable aspect ratios
- Image categories
- Video eligibility
- Customer-specific media priority
- Stock or generated media policy
- Prohibited misleading representations
- Alt-text requirements
- Rights and provenance requirements

### 7.9 Integration patterns

- Standard contact methods
- Booking or scheduling patterns
- Map and directions behavior
- Payment or ordering links where supported
- Messaging actions
- Newsletter or lead capture
- External system adapters
- Safe fallback behavior

### 7.10 Quality and test fixtures

- Representative fictional or licensed test businesses
- Minimum and maximum content cases
- Multilingual fixtures where required
- Responsive and accessibility fixtures
- Expected visitor journeys
- Structured-data examples
- Unsupported-case fixtures
- Pilot and production Gate requirements

## 8. Vertical Kit logical record

A machine-readable record should be equivalent to:

```yaml
vertical_kit_id: vertical.example
version: 1.2.0
state: active
owner: linksites-product
scope:
  included_business_types: []
  excluded_business_types: []
  subverticals: []
visitor_profiles: []
business_ontology_ref: ontology-version
content_pattern_refs: []
conversion_profile_refs: []
page_pattern_refs: []
design_constraints_ref: constraints-version
media_profile_ref: media-profile-version
integration_profile_ref: integration-profile-version
tier_mappings:
  - tier-specification-and-kit-variant-references
component_compatibility_ref: matrix-version
locale_overlays: []
market_overlays: []
test_fixture_refs: []
research_evidence_refs: []
quality_gate_profile: vertical-kit-gates-version
freshness:
  reviewed_at: date
  review_due_at: date
supersedes: optional-prior-version
```

The exact physical schema will be finalized during engineering design. The listed concepts are required even if implemented across several normalized records.

## 9. Evidence and factual safety

Vertical research produces three different classes of knowledge:

1. **Stable production pattern:** a reusable structural observation with sufficient evidence.
2. **Hypothesis:** a plausible pattern requiring pilot evidence.
3. **Prospect-specific fact:** information about one business that must never be promoted into a generic Kit as though universally true.

The Kit must record sources, research date, confidence, and review state. It must distinguish “businesses of this type often benefit from X” from “this prospect definitely offers X.”

Competitor websites may inform pattern research, but their text, images, brand identity, or distinctive design must not be copied into a foundation. Reuse must be based on general production knowledge and rights-cleared assets.

Legal and regulatory decisions are intentionally handled in a later dedicated reconciliation step. Engineering must preserve fields and policy hooks for restrictions without inventing the final legal policy in this section.

## 10. Vertical Kit lifecycle

The governing lifecycle is:

```text
candidate
→ researching
→ designing
→ building
→ validating
→ pilot_ready
→ active
→ refresh_required, suspended, or deprecated
→ retired
```

### 10.1 Candidate

A possible vertical is recorded with an opportunity rationale, initial demand signal, expected repeatability, and owner. Candidate status authorizes investigation, not production.

### 10.2 Researching

Executors gather evidence about visitor needs, business information, conversion patterns, media, integrations, existing lead volume, competitive quality, and production feasibility.

### 10.3 Designing

The Kit ontology, page patterns, tier variants, design constraints, components, content schemas, and test approach are specified.

### 10.4 Building

Missing components, schemas, neutral assets, fixtures, and initial foundations are produced through their own governed capability lifecycles.

### 10.5 Validating

Representative cases are assembled and evaluated for factual safety, usability, visual quality, accessibility, performance, conversion-path clarity, cost, and repeatability.

### 10.6 Pilot ready

The Kit may support limited build-first previews within an explicit pilot budget and review policy. It is not yet assumed safe for high-volume autonomous production.

### 10.7 Active

The Kit may be selected automatically within its declared compatibility and capacity rules.

### 10.8 Refresh, suspension, deprecation, and retirement

A Kit may require action because of stale assumptions, poor outcomes, platform changes, security or license concerns, repeated rejection, new market evidence, or unmanageable production cost. Historical lineage and derived-site relationships must be preserved.

## 11. Vertical Kit creation workflow

The normal creation workflow is:

1. Identify a sufficiently large and reachable SMB opportunity.
2. Define the candidate vertical boundary.
3. Gather and classify research evidence.
4. Model visitor jobs and business information.
5. Define conversion, page, content, media, and integration patterns.
6. Map the patterns to provisional Tier Specifications.
7. Identify available Registry components and capability gaps.
8. Define design compatibility using the Design Intelligence Catalog.
9. Build test fixtures and initial foundations.
10. Run technical, visual, content, and usability validation.
11. Produce a cost and repeatability assessment.
12. Approve limited pilot use.
13. Measure preview production and Sales outcomes.
14. Correct the Kit and approve active production, or suspend the hypothesis.

An AI agent may accelerate research and synthesis, but a Kit becomes active only through recorded Gates and evidence.

## 12. Definition of a Tier Specification

A **Tier Specification** is a versioned, machine-readable product contract defining the website scope and continuing managed-service obligations for a paid LiNKsites tier.

The current provisional tier names are:

1. Standard
2. Premium
3. Enterprise

The final public names, pricing, page limits, service allowances, and exact benefits remain business decisions. Engineering must support governed configuration and versioning rather than treating provisional values as permanent constants.

A tier is not a judgment about design quality. Every tier must meet its applicable baseline quality requirements. Tiers differ primarily in breadth, variation, service depth, resource allocation, integration, isolation, and exception handling.

## 13. Tier Specification contents

Every Tier Specification must define at least:

### 13.1 Product identity

- Product and Tier IDs
- Version and lifecycle state
- Customer-facing name and internal name
- Effective dates
- Superseded version
- Commercial catalog references

### 13.2 Site structure

- Allowed page types
- Page or content limits
- Navigation complexity
- Location and language rules
- Included section categories
- Prohibited structures

### 13.3 Design scope

- Eligible foundation classes
- Design-profile ranges
- Permitted component variants
- Customer-brand adaptation depth
- Visual customization boundary
- Unique design or component policy

### 13.4 Content and media scope

- Included research transformation
- Copy scope
- Media sourcing or creation scope
- Revision policy
- Required customer inputs
- Rights and approval responsibilities

### 13.5 Integration scope

- Included standard integrations
- Eligible add-ons
- Custom integration boundary
- Credential and customer-account requirements
- Failure and support obligations

### 13.6 Hosting and operations

- Shared or dedicated frontend eligibility
- Capacity and fair-use profile
- Monitoring class
- Backup and recovery class
- Maintenance scope
- Support or response policy reference
- Data-isolation options

### 13.7 Change entitlement

- Included change workflow
- Allowance or fair-use reference
- Approval authority
- Excess or quotation behavior
- Emergency correction behavior

### 13.8 Quality requirements

- Accessibility profile
- Performance budget
- Browser and viewport support
- SEO baseline
- Security checks
- Launch and recurring health Gates

### 13.9 Exceptions

- Allowed exception types
- Required authority
- Upgrade triggers
- Separate quotation triggers
- Unsupported requests

## 14. Tier logical record

```yaml
tier_id: linksites.standard
version: 1.0.0
state: active
effective_from: date
product_catalog_ref: odoo-product-reference
site_structure_profile: profile-version
design_entitlement_profile: profile-version
content_entitlement_profile: profile-version
media_entitlement_profile: profile-version
integration_entitlement_profile: profile-version
hosting_class: shared-managed
operations_profile: profile-version
change_entitlement_profile: profile-version
quality_gate_profile: profile-version
eligible_addons: []
exception_policy: policy-version
commercial_values_ref: governed-catalog-reference
supersedes: optional-tier-version
```

Prices and payment state belong to the commercial systems. The Tier Specification may reference the relevant Odoo Product Catalog identity, but LiNKsites should not become the accounting authority.

## 15. Provisional tier doctrine

### 15.1 Standard

Standard is the most constrained, reusable, and automation-oriented product. It normally requires an active Vertical Kit and approved foundation. It should use a bounded page and component set, standard integrations, shared managed hosting, and rule-based changes. Unique component development is not included in the base product.

### 15.2 Premium

Premium permits greater controlled variation, content and media depth, page breadth, localization, integrations, service entitlement, and potentially stronger hosting or reporting characteristics. It remains productized and must not silently become unlimited custom development.

### 15.3 Enterprise

Enterprise covers justified requirements beyond the Standard and Premium boundaries, potentially including custom components, advanced integrations, dedicated frontend allocation, stronger isolation, formal service requirements, or complex multi-location and multilingual structures.

Enterprise capability is not automatic permission to promise anything. Feasibility, capacity, cost, security, maintenance, and commercial approval are required before acceptance.

## 16. Tier enforcement

Tier rules must be evaluated before:

- Preview planning
- Foundation matching
- Component selection
- Design-profile selection
- Content and media production
- Integration activation
- Hosting placement
- Customer-requested change
- Upgrade or downgrade
- Renewal or service modification

An executor must be able to return one of these outcomes:

- Allowed within entitlement
- Allowed with configured option or add-on
- Requires tier upgrade
- Requires separate quotation and feasibility review
- Unsupported
- Requires human or OpenClaw-mediated exception decision

The reason and exact Tier Specification version must be recorded.

## 17. Kit-to-tier mapping

A Vertical Kit does not simply declare that it supports a tier. It should define a **Kit Tier Variant** describing how that tier is expressed for the vertical.

For example, a tier might permit several pages generally, while the Kit Tier Variant determines which page types create the most value for that business category. The mapping may define:

- Required and optional page patterns
- Minimum trust elements
- Conversion-path depth
- Media expectations
- Eligible integrations
- Design and component ranges
- Localization behavior
- Foundation requirements
- Validation fixtures

The mapping must never enlarge the commercial entitlement beyond the Tier Specification. When rules conflict, the more restrictive applicable rule wins unless an authorized exception is recorded.

## 18. Definition of a Reusable Site Foundation

A **Reusable Site Foundation** is a prospect-neutral, versioned, fully tested site composition prepared for rapid adaptation within declared Vertical Kit, tier, design, and content boundaries.

It may include:

- Route and page structure
- Component selections and versions
- Section order and variants
- Site Design Profile compatibility
- Neutral content-slot structure
- Neutral or rights-cleared media patterns
- Payload schema mapping
- Integration capability placeholders
- Structured-data mapping
- Test fixtures
- Quality receipts
- Adaptation instructions
- Cost baseline

A foundation is more complete than a wireframe but less specific than a prospect preview. It should be capable of rendering as a coherent demonstration with neutral fixture content, while remaining safe to cleanse and adapt.

## 19. What a foundation must not contain

A reusable foundation must not contain unisolated:

- Prospect names
- Customer contact information
- Customer logos or trademarks
- Unverified business claims
- Customer-owned images without reusable rights
- Customer credentials or secrets
- Live analytics identifiers
- Customer-specific form destinations
- Domain configuration
- Personal data
- Mutable references that allow one adaptation to change another

If prospect-specific information is used in a preview, it belongs to that preview's content, asset, configuration, and lineage records—not to the neutral foundation.

## 20. Foundation classes

Foundations may be classified by the dimensions that materially affect reuse.

### 20.1 Vertical and subvertical

A foundation identifies the business categories for which it has been validated.

### 20.2 Tier compatibility

A foundation may support one tier or a bounded range. Supporting Premium does not necessarily mean it can be reduced to Standard without structural changes.

### 20.3 Conversion profile

Examples include call-first, enquiry-first, booking-first, visit-location, or catalogue-browse. These are behavior patterns, not guaranteed business outcomes.

### 20.4 Content-depth profile

The foundation may be optimized for concise, moderate, or extensive business information.

### 20.5 Media profile

Some foundations depend on strong customer photography, while others remain effective with limited media and should be matched accordingly.

### 20.6 Design compatibility

A foundation may support one approved Site Design Profile or a tested range of profiles and variants.

### 20.7 Locale and structure

Single-language, multilingual, single-location, multi-location, and service-area foundations require separate compatibility evidence.

These classes are attributes, not necessarily separate codebases.

## 21. Foundation Manifest

The foundation should have a machine-readable manifest similar to:

```yaml
foundation_id: stable-id
version: 2.0.0
state: available
vertical_kit:
  id: vertical-id
  version_range: governed-range
compatible_tier_variants: []
platform_release: release-id
assembly_manifest_ref: neutral-site-manifest
compatible_design_profiles: []
content_slot_schema: schema-version
media_requirements: media-profile-version
integration_capabilities: []
locale_capabilities: []
adaptation_contract: contract-version
quality_receipts: []
cost_baseline: cost-record-id
provenance_manifest: provenance-record-id
inventory_policy: policy-version
lineage:
  derived_from: optional-foundation-id
  supersedes: optional-prior-version
```

The foundation's Site Assembly Manifest follows Section 07 and identifies the actual components, variants, routes, and schema references.

## 22. Adaptation Contract

Every available foundation must define what may change during ordinary prospect adaptation and what requires a higher-cost path.

The Adaptation Contract should distinguish:

### 22.1 Direct substitutions

Low-cost deterministic changes, such as:

- Business identity
- Approved palette or font profile
- Copy within schema
- Media within required aspect and rights rules
- Contact and location data
- Standard call-to-action target

### 22.2 Bounded composition changes

Changes allowed from tested options, such as:

- Component variant
- Optional section inclusion
- Approved section reorder
- Compatible design-profile change
- Approved page-pattern selection

### 22.3 Upgrade work

Changes that require additional budget or proof authority, such as:

- Additional page structure
- New media production
- Higher tier integration
- Multilingual expansion
- Significant design recomposition

### 22.4 Capability-development work

Changes that require a new component, schema, integration adapter, or platform capability. These do not belong in routine adaptation and must pass the capability lifecycle.

## 23. Foundation production workflow

1. Receive an active or pilot-ready Vertical Kit and Tier Variant.
2. Confirm the inventory or campaign need.
3. Select eligible Design Intelligence profiles.
4. Select active Registry components.
5. Define neutral routes, pages, and content slots.
6. Create or select rights-cleared neutral media patterns.
7. Create the neutral Site Assembly Manifest.
8. Map content slots to Payload schemas.
9. Define the Adaptation Contract.
10. Render representative fixtures.
11. Run functional, visual, accessibility, performance, SEO, security, localization, and CMS-mapping Gates.
12. Calculate initial and expected adaptation cost.
13. Record provenance, versions, and test receipts.
14. Admit the foundation into inventory only after approval.

## 24. Foundation lifecycle

The lifecycle is:

```text
planned
→ building
→ validating
→ available
→ reserved and/or adapted
→ customer_derived
→ refresh_required, repairing, suspended, or deprecated
→ retired
```

The reusable foundation remains a separate object even after customer sites are derived from it. A converted preview does not consume or transfer ownership of the general foundation unless a later commercial policy explicitly says otherwise.

## 25. Inventory as a governed portfolio

Foundations are production and sales inventory. Inventory management must know:

- How many eligible foundations exist by vertical, tier, conversion profile, media profile, language, and style family
- Which are available, reserved, adapted, stale, or suspended
- Which prospects and customers derive from each foundation
- Initial build cost
- Cost of each adaptation and upgrade
- Conversion and rejection history
- Maintenance burden
- Similarity and overuse risk
- Rights and reuse constraints
- Capacity for concurrent adaptations

Inventory targets should be driven by real lead volume and campaign opportunity. Building a large catalog before lead evidence exists can waste capital; building nothing before outreach weakens the build-first strategy.

## 26. Foundation build authorization

When a preview request has no suitable available foundation, the Program should decide whether to:

- Adapt the nearest eligible foundation
- Refresh or repair an existing foundation
- Refactor an unsold preview-derived structure into a neutral foundation
- Build a new foundation
- Reduce the prebuild proof level
- Decline or defer the request

The decision should consider:

- Lead quality and proof level
- Reusability across other leads
- Vertical inventory shortage
- Expected initial cost
- Expected refactor cost if unsold
- Time to outreach
- Component and asset availability
- Sales evidence
- Production capacity

This implements the accepted view that prebuilding is an investment. The objective is not zero upfront spend; it is the lowest rational spend that produces compelling proof and retains reusable value.

## 27. Proof levels remain separate from foundations and tiers

The Sales Program may authorize different levels of pre-sale investment based on lead quality and opportunity.

A proof level determines how completely a foundation is adapted before purchase. It may range from low-cost presentation using a strongly reusable base to a more extensively personalized, validated preview for a high-potential lead.

The identifiers remain separate:

```text
proof_level
recommended_tier_id
quoted_tier_id
purchased_tier_id
active_tier_id
foundation_id
preview_id
```

A sophisticated preview does not grant Enterprise entitlement. Conversely, a lower-cost preview can demonstrate the value of a Premium product without implementing every paid feature before purchase.

## 28. Foundation matching

Foundation matching should use hard eligibility filters followed by ranking.

### 28.1 Hard filters

- Lifecycle eligibility
- Vertical and subvertical fit
- Tier Variant compatibility
- Platform release availability
- Required language and script support
- Required conversion path
- Required page and integration capability
- Media feasibility
- Design compatibility
- Rights and reuse eligibility
- Quality freshness
- No conflicting reservation

### 28.2 Ranking factors

- Adaptation cost
- Time to sales-ready preview
- Lead and brand fit
- Content fit
- Previous conversion or engagement evidence
- Rejection history
- Visual distinctiveness in the campaign
- Current inventory utilization
- Expected maintenance burden
- Reusability if the prospect does not buy

The matching result must include reason codes and alternatives. An agent may help evaluate qualitative fit, but it cannot override failed eligibility rules.

## 29. Refactoring and recycling unsold previews

An unsold preview is not automatically a total loss. The Program should separate:

- Reusable foundation value
- Prospect-specific content and assets
- General improvements created during adaptation
- Restricted or non-reusable material

The recycling process should:

1. Confirm that the Sales opportunity may be closed, held, or recycled.
2. Remove or isolate prospect identity and private data.
3. Remove customer- or prospect-specific assets without reusable rights.
4. Preserve general component, schema, design, or foundation improvements through their governed pipelines.
5. Restore neutral fixture content.
6. Re-run required quality Gates.
7. Update cost and lineage records.
8. Return the foundation to inventory or create a new version.

A site initially produced for a lower-quality lead may later be refactored and offered to a stronger lead if it fits the new prospect and passes all cleansing, accuracy, rights, distinctiveness, and quality requirements.

## 30. Cost model for reusable production assets

The Program must track cost at several levels:

- Vertical Kit research and creation
- Component or design capability creation
- Foundation initial build
- Prospect adaptation
- Proof upgrade
- Final customer conversion
- Recycling and cleansing
- Maintenance and migration
- AI model and token cost
- Human or OpenClaw-mediated intervention cost
- Hosting and third-party service cost

The cost record should preserve executor, Run, resource usage, and allocation method. Shared capability costs may be amortized across uses, but the original spend must remain visible.

The important commercial measures include:

- Average initial foundation cost
- Average adaptation cost
- Average recycle cost
- Cost per sales-ready preview
- Cost per converted customer
- Reuse count before conversion
- Time to recover prebuild investment
- Maintenance cost by foundation family

The earlier illustration of a USD 30 initial build and USD 5 refactor expresses the intended economic logic, not approved cost constants. Actual values must be measured.

## 31. Preserving variety

Reuse must not make LiNKsites visibly repetitive.

Variety can come from:

- Multiple foundations per valuable Vertical Kit and Tier Variant
- Different page and section compositions
- Approved component variants
- Different Site Design Profiles
- Customer brand inputs
- Business-specific content structure
- Suitable customer or rights-cleared media
- Conversion-profile differences
- Subvertical differences
- Language and content-density differences

The Program should track similarity within active campaigns and avoid repeatedly showing adjacent prospects the same exact composition when a suitable alternative exists. It must not choose an inferior site merely to force novelty.

Distinctiveness remains constrained by maintainability, accessibility, tier, and quality.

## 32. Multi-location and multilingual behavior

Multi-location and multilingual capabilities must be represented explicitly in Tier and Kit compatibility.

A multilingual site may require:

- Locale-specific routes
- Translation status and approval
- Script-compatible fonts
- Locale-specific metadata
- Language switch behavior
- Alternate-link behavior
- Content-length resilience
- Localized forms and integrations

A multi-location site may require:

- Shared versus location-specific facts
- Location pages
- Map and directions behavior
- Location-specific calls to action
- Structured-data relationships
- Content ownership and update rules

These capabilities should be assembled from shared patterns where possible, but must not be pretended into existence by duplicating pages without a content and operational model.

## 33. Quality Gates

### 33.1 Vertical Kit Gates

- Research sufficiency
- Scope and taxonomy
- Factual-safety model
- Product and tier compatibility
- Component and design compatibility
- Content ontology completeness
- Conversion-path clarity
- Fixture and test coverage
- Pilot readiness
- Active production approval

### 33.2 Tier Specification Gates

- Commercial authority
- Entitlement completeness
- Technical feasibility
- Operations and support feasibility
- Quality profile completeness
- Add-on and exception behavior
- Version and effective-date validity

### 33.3 Foundation Gates

- Prospect neutrality
- Rights and provenance
- Registry and platform compatibility
- Payload mapping
- Design quality
- Responsive behavior
- Accessibility
- Functional behavior
- Performance
- SEO and structured data
- Security
- Adaptation contract completeness
- Cost baseline
- Inventory admission

No single screenshot or agent statement substitutes for these receipts.

## 34. Feedback and continuous improvement

The Program should connect production and commercial outcomes back to reusable assets.

Useful evidence includes:

- Preview engagement
- Prospect response
- Sales conversion
- Rejection reasons
- Time to produce
- Adaptation cost
- Gate failure frequency
- Customer change requests
- Website engagement and conversion events
- Support incidents
- Performance regressions
- Foundation reuse rate

Evidence may lead to:

- Kit content-pattern changes
- New subvertical
- Tier entitlement change
- New or retired component
- New foundation
- Foundation refresh
- Changed matching weights
- Media or design-profile change
- Suspension of a poor or misleading pattern

Correlation does not prove causation. Agents should present evidence and confidence rather than automatically treating every sale or rejection as proof about one design choice.

## 35. Versioning and migration

Vertical Kits, Tier Specifications, Kit Tier Variants, foundations, and their supporting schemas are all versioned.

When a version changes, the system must determine:

- Whether new previews use the new version immediately
- Whether existing preview production may finish on the pinned version
- Whether active foundations remain compatible
- Whether customer sites require migration
- Whether commercial entitlement changes affect existing contracts
- Whether content transformation is required
- Whether customer approval is required
- Whether rollback remains available

A Tier Specification must not silently remove a customer's existing entitlement. Commercial transition rules belong in approved product policy and Odoo records.

A new Vertical Kit version must not silently rewrite facts or content on customer sites. It may trigger a review or migration Issue.

## 36. Executors and authority

### 36.1 Deterministic executors

Code, scripts, and automations should handle:

- Schema validation
- Eligibility filtering
- Version and state checks
- Compatibility resolution
- Inventory counting
- Reservation concurrency
- Cost aggregation
- Manifest creation
- Cleansing checks
- Test execution
- Migration targeting

### 36.2 Agent executors

Agents may assist with:

- Vertical research synthesis
- Pattern and ontology proposals
- Content-framework design
- Foundation fit evaluation
- Qualitative design assessment
- Rejection and performance analysis
- New foundation recommendations

### 36.3 OpenClaw and human authority

OpenClaw is not part of the runtime required to select or render a foundation. It may act as the solo nontechnical owner's operational interface when the autonomous system requires a judgment, exception, incident response, or approval within delegated authority.

Decisions outside delegated policy—such as final product scope, new tier commitments, large prebuild investment, or unsupported enterprise work—return to Carlos or another authorized human.

## 37. Cross-Program contract with LiNKtrend Sales

The Sales Program supplies:

- Lead and opportunity identity
- Lead Research Package
- Proof-level authority
- Recommended or quoted tier
- Campaign and deadline
- Preview budget
- Customer response and Sales outcome
- Purchase and Stripe-confirmed activation references through the commercial workflow

LiNKsites supplies:

- Kit and tier feasibility
- Foundation Match Proposal
- Cost and delivery estimate
- Preview identity and URL after validation
- Capability or input exceptions
- Recycle, hold, upgrade, or conversion status

Sales cannot directly mutate a Kit, foundation, Payload publication state, or frontend release. LiNKsites cannot redefine lead status, price, payment, or CRM authority.

## 38. Repository audit questions

The implementation audit must determine:

1. Whether existing repositories contain explicit Vertical Kits or only informal templates and prompts.
2. Which historical vertical definitions overlap, conflict, or remain useful.
3. Whether tier names and limits are hard-coded in UI or workflow logic.
4. Whether existing foundations contain prospect or customer data.
5. Whether sites are shared compositions or copied repositories.
6. Whether foundations have stable IDs, versions, manifests, schemas, costs, and lineage.
7. Whether Payload content types correspond to vertical ontologies and frontend components.
8. Whether reusable media has provenance and suitable rights.
9. Whether prospect adaptations can be cleansed and recycled safely.
10. Whether proof level is incorrectly conflated with paid tier.
11. Whether matching and inventory state exist or are informal.
12. Which foundations are technically, visually, or commercially stale.
13. Whether multilingual and multi-location capabilities are real and tested.
14. Whether quality receipts can be reconstructed.
15. Which assets should be retained, normalized, migrated, suspended, or retired.

## 39. Initial implementation sequence

1. Audit and reconcile existing vertical, tier, template, and foundation artifacts.
2. Define the canonical schemas for Kit, Tier Specification, Kit Tier Variant, foundation, Adaptation Contract, and inventory record.
3. Select a small number of high-opportunity initial Vertical Kits using lead evidence.
4. Create provisional but versioned Tier Specifications without embedding unapproved prices or exact limits.
5. Map Kits and tiers to the active Component Registry and Design Intelligence subset.
6. Create representative fixtures and the first small foundation portfolio.
7. Implement manifest, eligibility, matching, reservation, cost, and lineage services.
8. Prove deterministic adaptation into Supabase working records, Payload drafts, and frontend previews.
9. Prove cleansing and recycling of an unsold preview.
10. Prove conversion of a preview into an isolated customer site.
11. Measure cost, speed, quality, and Sales outcomes during pilots.
12. Expand Kits and foundation inventory based on evidence.

## 40. Decisions intentionally still open

This section does not decide:

- The first launch Vertical Kits
- Final tier names
- Exact page, media, change, language, or integration limits
- Setup and recurring prices
- Preview budgets by lead level
- Required number of foundations per vertical
- Exact similarity thresholds
- Contract terms
- Customer ownership, export, and transfer policy
- Final legal, privacy, scraping, outreach, or intellectual-property constraints
- Service-level and backup targets
- Enterprise qualification threshold

These require later business, economic, legal, and operational decisions. The system must make them configurable and versioned.

## 41. Acceptance criteria

This part of LiNKsites is adequately defined and implemented when:

1. A Vertical Kit is a versioned, machine-readable production asset rather than an informal prompt or template folder.
2. Vertical, subvertical, market, locale, and hosting region are represented separately.
3. Each active Kit defines scope, business ontology, visitor jobs, content patterns, conversion paths, page patterns, media, integrations, design constraints, and test fixtures.
4. Prospect-specific facts cannot be promoted into a generic Kit without evidence and review.
5. Every sold site references an exact Tier Specification version.
6. Tier rules are machine-enforceable across design, content, media, integrations, hosting, changes, and quality.
7. Kit Tier Variants map product entitlement to vertical-specific production without enlarging entitlement.
8. Every available foundation is prospect-neutral, versioned, costed, tested, and represented by manifests and an Adaptation Contract.
9. Foundation, preview, and customer identities and data remain separate.
10. Foundation matching uses hard eligibility filters and attributable ranking.
11. Proof level remains separate from recommended, quoted, purchased, and active tier.
12. Unsold previews can be cleansed, refactored, measured, and returned to governed inventory.
13. Shared improvements enter capability lifecycles rather than remaining hidden in one adaptation.
14. Reuse rights, source provenance, quality freshness, and reservation state constrain selection.
15. Cost and lineage are traceable from Kit and foundation creation through adaptation, conversion, recycling, and maintenance.
16. Visual variety can be produced through approved compositions, profiles, content, and media without per-site code forks.
17. Kit, tier, and foundation changes do not silently alter existing customer sites.
18. OpenClaw may oversee exceptions without becoming a runtime dependency.
19. The Sales Program and LiNKsites exchange versioned contracts without sharing authority improperly.
20. Pilot evidence can promote, improve, suspend, split, consolidate, or retire reusable assets.

## 42. Governing conclusion

Vertical Kits, Tier Specifications, and Reusable Site Foundations are the bridge between LiNKsites as an idea and LiNKsites as an autonomous factory.

The Vertical Kit captures what tends to matter for a category of SMB. The Tier Specification defines what LiNKtrend has sold and must continue to provide. The reusable foundation compiles these rules with approved design and frontend capabilities into a tested starting point. Prospect research then supplies business-specific truth, while controlled executors adapt the foundation into persuasive sales proof and, after purchase, a managed customer site.

This model preserves upfront website construction as a rational reusable investment. If a preview does not sell, LiNKsites retains the foundation, general improvements, evidence, and much of the production value. It can cleanse and refactor that value for another suitable prospect at lower marginal cost. Over time, the factory becomes faster and more capable because its governed inventory grows—without sacrificing factual accuracy, customer isolation, maintainability, or visual quality.

---

**End of Section 08**

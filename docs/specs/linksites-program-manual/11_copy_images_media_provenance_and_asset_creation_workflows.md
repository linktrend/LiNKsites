# LiNKsites Program Manual

## Section 11 — Copy, Images, Media, Provenance, and Asset-Creation Workflows

**Document set:** LiNKsites Program Manual  
**Section:** 11 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, LiNKsites product and engineering agents, copy and media agents, design-system agents, data and storage implementers, Payload implementers, repository auditors, QA agents, Sales Program integrators, operators, and future human collaborators  

---

## 1. Purpose of this section

This section defines how LiNKsites creates, selects, transforms, validates, stores, reuses, and retires website copy, images, video, and other presentation assets.

The asset-production system must support two apparently competing goals:

- Produce persuasive, business-specific websites before purchase at low marginal cost.
- Preserve factual accuracy, visual quality, rights information, customer isolation, and maintainability.

LiNKsites achieves this by using structured content slots, reusable Vertical Kit patterns, governed media libraries, deterministic transformations, model routing, explicit provenance, and quality Gates. AI generation is one executor option inside the workflow. It is not the workflow itself.

## 2. Governing doctrine

1. **Research is not finished copy.** Evidence from the Lead Research Package must be transformed into content through a governed workflow.
2. **Fluency does not prove truth.** A well-written statement remains invalid if its underlying claim is unsupported.
3. **Every material item has provenance.** The Program must know where text, images, video, logos, and other assets originated and what transformations occurred.
4. **Reuse is explicit.** An item is not reusable merely because LiNKsites has a file copy.
5. **Customer and prospect assets remain isolated.** They must not enter neutral foundations or another prospect's site without a valid reuse classification.
6. **Deterministic work is preferred where judgment adds no value.** Resizing, format conversion, schema mapping, factual substitutions, and many derivatives should use code or automation.
7. **Models are routed by difficulty and risk.** Low-cost models or structured templates should handle suitable work; stronger models are used only when their quality benefit justifies the cost.
8. **Preview approval is not production approval.** Some assets may demonstrate a site before purchase but require customer confirmation or replacement before launch.
9. **Binaries and metadata have different authorities.** Media bytes belong in governed object storage; authoritative content state and asset metadata belong in their defined data layers.
10. **The system must be replaceable.** A provider, model, image generator, stock service, or transformation library can change without redefining the LiNKsites asset contracts.

## 3. Asset classes

LiNKsites distinguishes several classes of production material.

### 3.1 Structured copy

- Headlines
- Body copy
- Service descriptions
- Calls to action
- Frequently asked questions
- Team descriptions
- Location content
- Metadata
- Image alternative text
- Captions
- Structured-data text fields

### 3.2 Brand assets

- Logo
- Wordmark
- Symbol
- Brand colors
- Brand fonts or font guidance
- Favicon
- Existing graphic system

### 3.3 Photographic and illustrative media

- Customer or prospect photographs
- Licensed stock photography
- Internally produced photography
- AI-generated imagery
- Illustrations
- Icons
- Background textures
- Diagrams where appropriate

### 3.4 Motion and video

- Hero video
- Short background loops
- Customer-supplied video
- Product or service demonstration
- Motion graphics
- Generated clips
- Poster frames and captions

### 3.5 Derived delivery assets

- Responsive image sizes
- Crops
- Thumbnails
- Optimized formats
- Video transcodes
- Poster images
- Social-sharing images
- Favicons
- Blur placeholders

### 3.6 Reference-only assets

Materials used to understand a business, style, or content need but not authorized for site delivery. Reference-only items must be technically prevented from accidental promotion.

## 4. Content and Media Production Module

M09 Content and Media Production receives:

- Lead Research Package
- Site Specification
- Prospect Adaptation Contract
- Content Requirements Matrix
- Media Requirements Matrix
- Vertical Kit content and media patterns
- Tier and proof-level entitlements
- Customer inputs where available
- Design profile
- Approved provider and executor policies
- Rights and provenance policy

It produces:

- Copy Bundle
- Media Plan
- Candidate and approved media package
- Provenance Manifest
- Factual Status Report
- Rights and License Report
- Technical Derivative Manifest
- Cost record
- Working-package eligibility receipt

## 5. Content Item record

Every material text item should be represented by a record equivalent to:

```yaml
content_item_id: stable-id
version: version
site_or_foundation_id: owner-id
content_slot: schema-path
content_type: heading-body-cta-metadata-alt-text-other
locale: locale-id
value: text-or-structured-value
status: candidate-validated-preview-approved-production-approved-other
factual_classification: verified-transformed-inferred-placeholder-conflicted
claim_refs: []
evidence_refs: []
vertical_pattern_ref: optional-pattern
generation:
  method: direct-template-rule-model-human
  executor_id: executor-id
  run_id: run-id
  model_id: optional-model
  prompt_or_skill_version: optional-version
  input_checksum: checksum
quality_receipts: []
publication_requirements: []
supersedes: optional-prior-item
```

The system may store rich text as structured nodes rather than a plain string. The same provenance and status requirements apply.

## 6. Claim graph

Copy is safer when each material statement can be decomposed into claims.

For example, a sentence may contain:

- Business offers service X
- Business serves location Y
- Business has credential Z
- Visitor may book through link Q

Each claim references evidence and a factual status. A copy item references the claims it expresses.

This allows a changed address, expired credential, or corrected service list to identify all affected copy rather than relying on full-text search alone.

Not every connective phrase needs a formal claim object. Material facts, promises, credentials, prices, results, availability, and other risk-bearing assertions do.

## 7. Copy source hierarchy

Copy may be produced from:

1. Customer-supplied and customer-confirmed information
2. Verified current public facts
3. Corroborated public information
4. Single-source public assertions permitted by field policy
5. Approved Vertical Kit patterns
6. Approved generic connective language
7. Preview-only provisional content

The hierarchy does not mean that customer text must be reproduced verbatim or that every public source may be copied. It determines the factual basis from which original LiNKsites copy may be created.

## 8. Copy-production workflow

The normal workflow is:

1. Read the Site Specification and Content Requirements Matrix.
2. Resolve the exact content slots and locale.
3. Retrieve normalized facts and evidence from the Lead Research Package.
4. Identify conflicts, gaps, stale fields, and blocked claims.
5. Select the applicable Vertical Kit content pattern.
6. Create a content outline and message hierarchy.
7. Produce candidate copy using the lowest-cost suitable executor.
8. Validate claims against evidence.
9. Validate tone, clarity, originality, and vertical suitability.
10. Fit the content to component schemas and length ranges.
11. Validate conversion-path language.
12. Validate locale, typography, and accessibility implications.
13. Classify each item for preview or production use.
14. Produce the Copy Bundle and Factual Status Report.

Each stage may create separate Issues and Runs. A failed factual check should return the affected slots for correction rather than regenerate the entire site blindly.

## 9. Copy executor routing

### 9.1 Direct deterministic mapping

Use code or schema mapping for exact values such as:

- Business name
- Telephone number
- Address
- Opening hours
- Verified service labels
- Existing booking URL
- Social links

Models should not rewrite identifiers that must remain exact.

### 9.2 Rules and templates

Use governed rules or phrase structures for:

- Standard contact instructions
- Neutral section introductions
- Structured metadata composition
- Common form labels
- Consistent preview notices
- Safe fallbacks

Templates contain slots and grammatical logic, not fake business facts.

### 9.3 Low-cost or open-source model

Use a lower-cost suitable model for bounded tasks such as:

- Rephrasing supported facts
- Creating several headline options
- Compressing a long description
- Converting notes into a structured service card
- Tone normalization
- Drafting safe connective language

The output remains subject to deterministic claim and schema checks.

### 9.4 Stronger reasoning model or agent

Use a stronger model only when the task requires material judgment, such as:

- Synthesizing conflicting or fragmented evidence
- Creating a coherent positioning hierarchy
- Handling complex multilingual adaptation
- Evaluating nuanced claims
- Producing a high-value Level 3 or Level 4 content experience
- Correcting a repeated quality failure

The routing policy should compare expected quality gain with proof level, tier, risk, and token cost.

## 10. Copy patterns and reusable text assets

Vertical Kits may contain reusable:

- Page-purpose outlines
- Section sequences
- Question patterns
- Information hierarchies
- Calls-to-action patterns
- Tone guidance
- Metadata structures
- Content-length profiles
- Safe generic phrases

They should not contain falsely specific text such as invented awards, years, prices, reviews, or guarantees.

Reusable patterns are versioned and measured. If a pattern produces poor engagement, confusing copy, or repeated factual errors, it can be refreshed or suspended without changing every component.

## 11. Originality and duplication control

LiNKsites should avoid publishing large amounts of identical copy across customer sites.

The Program may use:

- Pattern-level variation
- Business-specific evidence
- Different content emphasis
- Sentence and paragraph restructuring
- Duplicate-text detection
- Campaign-level similarity checks
- Human or model-based qualitative review

Variation must not change facts or create unsupported distinctions. Originality is a quality constraint, not permission to invent.

## 12. Tone and voice

The Site Specification and Vertical Kit should define an allowed tone range, for example:

- Direct and practical
- Warm and local
- Calm and professional
- Premium and restrained
- Energetic and approachable

Tone should be inferred cautiously from the business's public identity and target audience. It must not caricature a culture, industry, language, or customer group.

If a customer has an established voice, production finalization should prioritize its confirmed guidance over preview inference.

## 13. Calls to action

Calls to action must correspond to a real or safely demonstrated path.

The content system must know:

- Action label
- Intended visitor outcome
- Target type
- Target reference
- Preview behavior
- Production behavior
- Verification state
- Tracking event
- Fallback

The system must not generate “Book now,” “Order now,” or similar language when no safe action path exists. A preview may demonstrate the intended interface through a controlled destination if the limitation is explicit in the Site Specification.

## 14. Metadata and structured copy

Metadata is governed content, not an afterthought. The workflow should produce:

- Page titles
- Page descriptions
- Social-sharing titles and descriptions
- Canonical or locale-related text references where required
- Structured-data fields
- Image alternative text
- Captions

Metadata must not contain claims that would be blocked in visible copy. Structured data requires the same factual basis as the page.

## 15. Localization and translation

Translation is not simple word replacement. The workflow must preserve:

- Meaning
- Factual claim references
- Tone
- Calls to action
- Locale formatting
- Script compatibility
- Component length constraints
- Structured-data consistency

Each locale version is a separate Content Item version linked to its source meaning. Machine translation may create a candidate, but production approval follows the locale and tier policy.

For English, Spanish, Traditional Chinese, and Simplified Chinese, the system must support appropriate script, punctuation, line breaking, font coverage, and content review where those locales are offered.

## 16. Content lifecycle

```text
required
→ candidate
→ factual_review
→ quality_review
→ validated_working
→ preview_approved
→ production_confirmation_required or production_approved
→ superseded or withdrawn
```

- **Required:** Site Specification declares the slot.
- **Candidate:** Copy exists but is not trusted.
- **Factual review:** Claims and evidence are evaluated.
- **Quality review:** Clarity, tone, fit, structure, and originality are evaluated.
- **Validated working:** Eligible to enter the working package.
- **Preview approved:** Eligible for the defined controlled preview.
- **Production confirmation required:** May remain in preview but cannot become live truth without confirmation or replacement.
- **Production approved:** Eligible for publication after the remaining site Gates.
- **Superseded or withdrawn:** Replaced or removed while history remains traceable.

## 17. Media Plan

The Media Plan translates the Site Specification into required visual roles.

For each role it should define:

- Page and component location
- Communication purpose
- Desired subject
- Business-specific versus generic requirement
- Preferred source class
- Approved fallbacks
- Orientation and aspect ratio
- Resolution and delivery sizes
- Art direction and focal point
- Color or treatment compatibility
- Accessibility requirement
- Proof-level quality
- Production replacement requirement
- Estimated creation or licensing cost

The system should not begin generating images before it knows which roles, crops, and components they must serve.

## 18. Media source classes

### 18.1 Customer-supplied

Assets supplied by an authorized customer. Record ownership or permission assertion, restrictions, and whether transformations are allowed.

### 18.2 Prospect-public

Assets found on a prospect's public website, map listing, directory, or social profile. Record exact source and capture. Their permitted preview, transformation, production, and reuse status must remain policy-controlled and must not be guessed by an executor.

### 18.3 Licensed stock or open asset

Assets obtained from a provider or repository under recorded license terms. The Program records source item, license version or evidence, attribution, scope, and acquisition date.

### 18.4 Internally created

Assets created directly by LiNKtrend through photography, illustration, design, or code. Record creator, production Run, inputs, and internal reuse classification.

### 18.5 AI-generated

Assets produced by a model. Record model/provider, prompt and negative prompt where applicable, generation parameters available from the provider, seed if available, reference inputs, generation time, Run, edits, and policy status.

### 18.6 Reusable Vertical Kit asset

A governed generic asset or media pattern admitted for reuse across compatible foundations. It must not imply that a generic person, location, product, or result belongs to a specific business unless presentation policy safely supports that use.

### 18.7 Reference only

Used for research or creative direction but never copied into a deliverable.

## 19. Media Asset record

```yaml
asset_id: stable-id
version: version
owner_scope: platform-kit-foundation-prospect-customer
owner_id: owner-reference
asset_class: image-video-logo-icon-document-other
source_class: customer-public-stock-internal-generated-kit-reference
status: candidate-processing-preview-approved-production-approved-other
storage_ref: object-reference
checksum: content-checksum
mime_type: media-type
dimensions_or_duration: properties
source:
  provider: provider-id
  source_url_or_item_ref: source-reference
  acquired_at: timestamp
  evidence_ref: optional-evidence
rights:
  status: governed-status
  license_ref: optional-license
  attribution: optional-text
  allowed_scopes: []
  transformation_allowed: true-or-false-or-unknown
generation:
  executor_id: optional-executor
  run_id: optional-run
  model_id: optional-model
  prompt_version: optional-version
  reference_asset_ids: []
transformations: []
derivative_ids: []
content_description: structured-description
alt_text_refs: []
quality_receipts: []
replacement_required_for_production: true-or-false
supersedes: optional-asset-version
```

## 20. Provenance Manifest

Each foundation, preview, and customer-site release should reference a Provenance Manifest containing all content and media used in that release.

The manifest should answer:

- What items were included?
- Which versions were used?
- Where did each item originate?
- Which facts and evidence support the copy?
- Which tools, models, prompts, and transformations produced derivatives?
- Which rights or license status applied at the time?
- Which items are preview-only?
- Which items require production replacement or customer confirmation?
- Which items are reusable and at what scope?

The manifest is a release artifact. Later changes produce a new version rather than erasing the historical basis of a prior preview.

## 21. Rights and reuse status

The technical system must support at least these distinctions:

- Reusable across all LiNKsites sites
- Reusable only within a Vertical Kit
- Reusable only within a foundation family
- Reusable only for one prospect or customer
- Preview use only
- Production use allowed
- Transformation restricted
- Attribution required
- Expiration or subscription dependency
- Rights unresolved
- Reference only
- Withdrawn

Final legal rules and interpretations are intentionally deferred to the later legal reconciliation. The architecture must nevertheless preserve enough evidence and enforceable status to apply those decisions.

## 22. Image selection and creation workflow

1. Read the Media Plan and component requirements.
2. Search eligible existing customer, prospect, foundation, Kit, licensed, and internal assets.
3. Apply hard rights, scope, quality, and suitability filters.
4. Rank eligible candidates by subject fit, authenticity, design fit, reuse cost, and technical quality.
5. Decide whether selection, transformation, stock acquisition, or new generation is required.
6. Produce or obtain the candidate.
7. Run subject, brand, visual, and factual-safety evaluation.
8. Create approved crops and responsive derivatives.
9. Generate or draft alternative text based on purpose and visible content.
10. Run technical, accessibility, performance, and provenance Gates.
11. Classify for preview and production.
12. Register the asset and derivatives in the working package.

## 23. Image-generation policy

AI image generation is appropriate when it produces useful, rights-trackable, non-misleading media more economically than other options.

Potential uses include:

- Abstract or atmospheric backgrounds
- Illustrative service concepts
- Decorative vertical media
- Textures
- Neutral scenes where no false business-specific claim is created
- Social-sharing compositions

Higher caution is required where an image could imply:

- The depicted people are actual staff or customers
- A depicted location belongs to the business
- A depicted result was achieved by the business
- A product or service appearance is exact
- A regulated credential, safety practice, or professional activity is verified

The asset record must identify generated status internally even if the final customer-facing disclosure policy is decided later.

## 24. Model and provider routing for imagery

The workflow should choose among:

- Existing eligible asset
- Deterministic graphic composition
- Template-based social or hero image
- Low-cost image model
- Higher-quality image model
- Human or specialist creation

Routing factors include:

- Proof level
- Paid tier
- Media role prominence
- Required realism
- Business-specificity
- Rights status
- Brand sensitivity
- Resolution and derivative needs
- Cost and deadline
- Prior failure history

A hero image for a Level 4 prospect may justify more generation and review cost than a small decorative image in a Level 1 preview.

## 25. Deterministic image processing

Code and automation should normally perform:

- File validation
- Malware and malformed-file checks
- Metadata inspection
- Orientation correction
- Color-space normalization
- Crop generation from approved focal points
- Responsive resizing
- Format conversion
- Compression
- Thumbnail generation
- Blur-placeholder generation
- Checksum calculation
- Duplicate and near-duplicate detection
- Technical metadata extraction

The source asset remains preserved when policy requires it. Derivatives reference the exact source and transformation recipe.

## 26. Art direction and responsive derivatives

One automatic center crop is not sufficient for every component.

The asset system should support:

- Subject and focal-point coordinates
- Safe crop zones
- Separate landscape, portrait, and square art direction
- Mobile and desktop variants
- Text-overlay safe areas
- Face and key-object preservation
- Component-specific aspect ratios

An agent or vision model may recommend focal points. Deterministic tooling creates the approved derivatives.

## 27. Alternative text and decorative status

Alternative text must reflect the image's function in context.

- Informative images receive concise descriptions conveying relevant visible information.
- Functional images receive text describing the action or destination.
- Decorative images are marked decorative so assistive technology can ignore them.
- Text embedded in images should normally be avoided or otherwise represented accessibly.

Alt text must not invent identities, locations, outcomes, or business relationships not established by evidence.

## 28. Logo and brand treatment

The system should prefer an authentic customer or prospect logo when policy and asset quality permit it.

If no adequate logo exists, preview-safe options may include:

- A typographic treatment of the verified business name
- A neutral monogram or placeholder clearly classified internally
- A foundation-level brand slot awaiting customer input

LiNKsites must not silently invent a new permanent official logo and present it as customer-approved brand identity. A separately sold brand-creation service could authorize a different workflow in the future.

Logo processing may create technical variants such as transparent, light-background, dark-background, favicon, and social formats while preserving the source relationship.

## 29. Video and motion workflow

Video can strengthen suitable sites but can also create high cost, performance, accessibility, and authenticity risk.

The Video Plan should define:

- Purpose
- Source or generation method
- Duration range
- Aspect ratio
- Sound policy
- Caption or transcript requirement
- Poster image
- Autoplay and motion behavior
- Mobile fallback
- Compression targets
- Production replacement requirement

Short, muted, optional visual loops may be suitable for some hero treatments. They must respect reduced-motion preferences and must not block core content.

Original professional video production is not assumed in the base product. It requires a tier or add-on entitlement.

## 30. Video derivatives and delivery

Deterministic processing may create:

- Delivery formats
- Resolution variants
- Bitrate variants
- Poster frames
- Thumbnails
- Muted versions
- Caption files
- Preview clips

The system records the transformation recipe and preserves the relationship to the source. A failed or slow video must have a defined image or content fallback.

## 31. Icons, illustrations, and decorative systems

Icons should come from an approved internalized set or registered source with known license, visual language, and technical behavior.

Executors should not mix unrelated icon styles arbitrarily or fetch remote icons at render time without an approved dependency.

Illustrations and decorative assets should align with the Site Design Profile and Vertical Kit. Their reuse scope and similarity should be tracked so a campaign does not appear mechanically duplicated.

## 32. Asset library and reuse

The governed asset library may include:

- Vertical media patterns
- Licensed generic imagery
- Generated reusable backgrounds
- Icon sets
- Decorative illustrations
- Video loops
- Component-specific placeholder structures
- Approved copy patterns

Library admission requires:

- Stable identity and version
- Source and rights status
- Reuse scope
- Technical quality
- Design compatibility
- Content description and search metadata
- Quality receipts
- Freshness or review policy
- Cost and provider dependency

The library should support semantic search and deterministic filtering, but search relevance cannot override rights or scope.

## 33. Deduplication and similarity

The Program should detect:

- Exact duplicate files by checksum
- Transcoded or resized duplicates
- Near-duplicate imagery
- Repeated generated scenes
- Reused copy passages
- Overused hero assets within a campaign

Deduplication reduces storage and accidental duplication. Similarity signals help preserve distinctiveness. The system must not delete or merge source evidence automatically merely because two files look similar; provenance may differ.

## 34. Preview versus production classification

Each item must state whether it is:

- Internal only
- Preview eligible
- Preview eligible with limitation
- Production confirmation required
- Production replacement required
- Production approved
- Withdrawn

Examples of items that may require production action include:

- Publicly sourced prospect image with unresolved reuse status
- Generated image that the customer wants replaced with authentic photography
- Unconfirmed service wording
- Approximate hours omitted or marked internally
- Demonstration booking button
- Temporary social-sharing image

The Paid Website Activation Package and finalization workflow must inherit these requirements.

## 35. Media asset lifecycle

```text
requested
→ candidate
→ processing
→ technical_review
→ provenance_and_rights_review
→ visual_and_context_review
→ preview_approved
→ production_confirmation_required or production_approved
→ active
→ superseded, withdrawn, quarantined, or retired
```

Quarantine blocks use when a source, rights, security, authenticity, or severe quality concern appears. Active customer sites referencing a quarantined asset trigger an impact and replacement workflow.

## 36. Storage architecture

Media binaries should reside in governed object storage or an equivalent blob system, not inside database rows or agent work directories as the only copy.

The data layer stores:

- Asset identity
- Storage reference
- Checksum
- Metadata
- Provenance
- Rights and reuse status
- Transformations
- Content relationships
- Lifecycle state
- Quality receipts

Supabase is the working control layer for candidate and validated working records. Payload receives approved draft and production-facing asset references through the Promotion Service. The exact storage provider may be part of Supabase or separate; authority is defined by the records and promotion path, not by assuming every byte belongs in one database.

## 37. Working-layer isolation

Candidate assets and copy may be incomplete, invalid, or unapproved. They belong in the working layer until validated.

Working records must be scoped by:

- Foundation, prospect, or customer
- Site Specification
- Adaptation
- Content slot or media role
- Run
- Version

An executor must not write directly into production Payload content or a public asset path merely because a generation Run succeeded.

## 38. Promotion eligibility

An asset or content package may enter Payload draft only when:

- Required schemas pass
- Source and provenance are present
- Factual classification is resolved sufficiently for the target use
- Rights and reuse status satisfy the target policy
- Technical derivatives exist
- Quality Gates pass
- Preview or production classification is explicit
- Site identity and content mapping are valid
- No cross-prospect leakage is detected
- Promotion authority exists

Payload publication requires additional authority and Gates defined in Section 12.

## 39. Quality Gates for copy

- Schema and required-field Gate
- Claim-to-evidence Gate
- High-risk claim Gate
- Conflict and freshness Gate
- Clarity and readability Gate
- Tone and vertical suitability Gate
- Originality and duplication Gate
- Component-fit and length Gate
- Conversion-language Gate
- Localization Gate
- Preview/production classification Gate
- Cost-policy Gate

Model-based quality review should use versioned rubrics and preserve the evaluation result. It should not be the only check for exact facts.

## 40. Quality Gates for media

- File integrity and security Gate
- Source and provenance Gate
- Rights and reuse-scope Gate
- Subject and contextual accuracy Gate
- Visual quality Gate
- Brand and Vertical Kit suitability Gate
- Design-profile compatibility Gate
- Crop and focal-point Gate
- Responsive derivative Gate
- Accessibility Gate
- Performance and file-weight Gate
- Duplicate and campaign-similarity Gate
- Preview/production classification Gate
- Cost-policy Gate

## 41. Security and privacy controls

The media pipeline should account for:

- Malicious or malformed uploads
- Unexpected file types
- Embedded metadata
- Location metadata
- Personal information
- Faces and identity
- Secrets in documents or screenshots
- Cross-tenant storage references
- Guessable private URLs
- Unsafe external embeds

Metadata stripping or preservation should be policy-driven. The original may need to remain in restricted provenance storage while the public derivative removes unnecessary metadata.

## 42. Cost controls

The asset system should measure:

- Copy tokens and model cost
- Image-generation attempts and selected result cost
- Licensed asset cost
- Transformation compute
- Video processing
- Storage
- Manual review
- Rework
- Derivative count
- Cost by proof level and tier
- Reuse count

Cost reduction methods include:

- Use existing eligible assets first
- Use templates and deterministic composition
- Generate only the required media roles
- Use low-cost models for bounded tasks
- Cache safe reusable outputs
- Avoid repeated high-resolution generation before selection
- Create derivatives after the source candidate is accepted
- Reuse Vertical Kit media where it remains suitable and distinct enough

## 43. Failure and compensation

Common failure cases include:

- Unsupported claim detected
- Source conflict
- Model output does not fit schema
- Image depicts the wrong subject
- Generated text appears inside an image incorrectly
- Logo extraction is poor
- Rights status unresolved
- Required derivative fails
- File exceeds performance budget
- Video cannot be delivered accessibly
- Cross-prospect asset leakage
- Provider unavailable
- Cost limit reached

The workflow should retry only when the failure is plausibly transient or a bounded adjustment exists. Otherwise it should choose a fallback, request targeted input, reduce the media role, or raise an exception.

Compensation may remove unapproved working records, revoke preview eligibility, restore the prior approved asset version, or invalidate a promotion receipt.

## 44. Customer finalization

After purchase, the asset workflow should:

- Obtain or confirm authoritative business information
- Collect customer assets and permission assertions
- Resolve preview-only items
- Replace temporary media where required
- Confirm calls to action
- Confirm prices, credentials, testimonials, and other material claims
- Complete tier-included copy and media
- Obtain customer approval where policy requires it
- Create production-approved versions
- Preserve the exact relationship between preview and final assets

Customer correction should supersede the preview candidate without erasing the historical preview record.

## 45. Maintenance and future changes

Live content and media may become stale or invalid because of:

- Changed hours, location, services, team, or prices
- Rebranding
- Expired credentials
- Customer request
- Rights or provider changes
- Performance improvement
- Accessibility correction
- Broken external media
- Updated Vertical Kit pattern

Changes re-enter the working, validation, draft, approval, and publication path. Executors must not replace a live asset directly in public storage without versioning and rollback.

## 46. Metrics and learning

Useful measures include:

- Cost per copy bundle
- Cost per accepted image
- Generation attempts per selected asset
- Percentage of deterministic versus model-generated work
- Copy factual-rejection rate
- Media quality-rejection rate
- Preview-to-production replacement rate
- Customer correction rate
- Asset reuse rate
- Duplicate-content rate
- Media weight and performance impact
- Engagement by media role and content pattern
- Rights/provenance exception rate
- Time from requirement to validated working package

These measures can improve executor routing and libraries. They must not encourage misleading claims or excessive reuse merely to reduce cost.

## 47. Executor responsibilities

### 47.1 Deterministic executors

- Exact fact mapping
- Schema validation
- Claim-reference completeness checks
- File inspection
- Checksums and deduplication
- Image and video derivatives
- Format conversion and compression
- Storage registration
- Content-length and field validation
- Provenance-manifest assembly
- Cost collection

### 47.2 Agent executors

- Content synthesis
- Tone and hierarchy proposals
- Image selection and qualitative assessment
- Prompt creation for media generation
- Focal-point recommendations
- Complex localization
- Visual-context review
- Copy and media improvement proposals

### 47.3 OpenClaw and human involvement

OpenClaw may oversee blocked rights status, repeated quality failures, costly media decisions, or customer-input exceptions within delegated authority. OpenClaw is not a required step for every copy or image.

High-value brand, regulated, or ambiguous content may require direct authorized human or customer confirmation according to later policy.

## 48. Provider abstraction

LiNKsites should define narrow interfaces for:

- Text generation
- Translation
- Image generation
- Vision evaluation
- Stock or open-asset search
- Image processing
- Video processing
- Object storage
- Malware scanning

Each adapter reports provider, version, cost, result identifiers, and failure state. A provider change should not require rewriting Site Specifications, asset records, or Payload schemas.

## 49. Repository audit questions

The later audit must determine:

1. Where existing copy, images, logos, videos, prompts, and design assets reside.
2. Which items are reusable, prospect-specific, customer-specific, reference-only, or unknown.
3. Whether source and license records exist.
4. Whether generated assets record model, prompt, Run, and inputs.
5. Whether customer and prospect assets are mixed with neutral templates.
6. Whether copy claims reference evidence or are embedded as untraceable text.
7. Whether assets are stored in repositories, Payload, Supabase Storage, other object storage, or local folders.
8. Whether duplicated binaries and inconsistent derivatives exist.
9. Whether image and video processing is deterministic and reproducible.
10. Whether preview-only assets can be distinguished from production-approved assets.
11. Whether Payload media records can be traced back to working and provenance records.
12. Whether model routing and cost are measured.
13. Whether multilingual copy and fonts are genuinely supported.
14. Whether public files contain metadata, personal information, or cross-prospect leakage.
15. Which existing asset libraries, scripts, models, and workflows should be retained, normalized, replaced, or retired.

## 50. Initial implementation sequence

1. Inventory and classify all existing copy and media assets without deleting source material.
2. Define canonical Content Item, Claim, Media Asset, Rights Status, Transformation, and Provenance Manifest schemas.
3. Define working, preview, and production asset states.
4. Define provider interfaces and model-routing policy.
5. Implement exact fact mapping and claim-to-evidence validation.
6. Build the first Vertical Kit content and media patterns.
7. Implement object storage, checksums, scoped references, and deterministic derivative generation.
8. Implement copy, image, video, provenance, and cost Gates.
9. Connect validated outputs to the Supabase working package.
10. Prove controlled promotion into Payload draft.
11. Prove preview-only replacement during customer finalization.
12. Prove cleansing and reuse after an unsold preview.
13. Measure model cost, quality, reuse, correction, and replacement rates.
14. Expand libraries only as real Vertical Kit and campaign needs justify them.

## 51. Decisions intentionally still open

This section does not finalize:

- Specific text, image, translation, vision, or video model providers
- Exact permitted source platforms
- Final rights interpretation for public prospect assets
- Customer-facing disclosure of AI-generated media
- Final attribution presentation
- Final ownership and transfer terms
- Storage provider
- Retention periods for sources and generated candidates
- Exact file formats, weights, and dimensions by component
- Exact manual-review requirements by tier or vertical
- Initial stock or open-asset providers
- Whether separate brand-creation services will be offered
- Final legal rules for likeness, intellectual property, privacy, and regulated claims

These are configurable technical, commercial, and legal decisions. The system must preserve the evidence needed to enforce them.

## 52. Acceptance criteria

This part of LiNKsites is adequately defined and implemented when:

1. Every required copy and media item originates from a Site Specification slot or role.
2. Every material copy claim can be traced to evidence, an approved pattern, or an explicit provisional classification.
3. Exact facts are handled deterministically where practical.
4. Templates, low-cost models, and stronger agents are routed according to difficulty, risk, proof level, and cost.
5. Copy cannot become accepted merely because it is fluent.
6. Duplicate or near-duplicate copy and media can be detected.
7. Every media asset has stable identity, source, checksum, status, reuse scope, and transformations.
8. AI-generated media records model, Run, prompt lineage, reference assets, and review state.
9. Prospect-public, customer-supplied, licensed, internal, generated, reusable, and reference-only assets remain distinct.
10. Media bytes live in governed storage and are not represented only by fragile local paths.
11. Responsive derivatives are reproducible from an approved source and transformation recipe.
12. Alternative text and decorative status are context-aware and factual.
13. Preview-approved material cannot silently become production-approved.
14. Production-replacement and confirmation requirements survive into paid finalization.
15. Customer and prospect assets cannot contaminate foundations or other sites.
16. Payload receives only validated draft assets through the Promotion Service.
17. Copy and media have factual, provenance, quality, accessibility, performance, and cost evidence.
18. Provider changes do not redefine the core data contracts.
19. Live asset changes are versioned, reversible, and routed through working and publication states.
20. The factory can measure whether asset reuse and AI routing actually reduce cost without weakening quality.

## 53. Governing conclusion

LiNKsites should not create every sentence and image from scratch, and it should not treat a generic asset library as a finished website. It should operate a governed asset factory.

Research supplies attributable truth. Vertical Kits supply reusable communication patterns. Deterministic executors preserve exact values and create technical derivatives. Lower-cost models handle bounded transformations. Stronger agents solve the comparatively small number of tasks where deeper judgment materially improves the result. Media libraries and generated assets provide visual breadth, while provenance, rights status, isolation, and quality Gates control their use.

The outcome is a repeatable production system capable of creating persuasive, varied previews at low marginal cost and converting them into reliable customer websites after purchase. Every published result remains understandable: what it says, what it shows, where it came from, how it was transformed, what it cost, who or what approved it, and whether it may be reused.

---

**End of Section 11**

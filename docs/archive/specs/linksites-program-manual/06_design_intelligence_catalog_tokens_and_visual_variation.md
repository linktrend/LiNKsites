# LiNKsites Program Manual

## Section 06 — Design Intelligence Catalog, Design Tokens, and Governed Visual Variation

**Document set:** LiNKsites Program Manual  
**Section:** 06 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, product and engineering agents, design-system implementers, repository auditors, frontend agents, QA agents, operators, and future human collaborators  

---

## 1. Purpose of this section

This section defines how LiNKsites makes repeatable, high-quality visual decisions without producing identical websites and without allowing an AI agent to improvise an uncontrolled design for every prospect.

LiNKsites requires two properties that can appear to conflict:

1. **Determinism and consistency** — designs must be buildable, testable, maintainable, accessible, compatible with the shared frontend platform, and economical to reproduce.
2. **Appropriate variation** — sites must not all look like a single generic template with a different logo. Designs must suit the business vertical, audience, brand, content, tier, and sales objective.

The solution is a governed **Design Intelligence Catalog** combined with hierarchical design tokens, compatibility rules, approved component variants, deterministic selection, and evidence-based evaluation.

## 2. Definition of Design Intelligence

Design Intelligence is structured, versioned knowledge used to select and apply suitable visual systems to LiNKsites websites.

It includes more than color palettes. It may contain:

- Style families
- Visual characteristics
- Suitable and unsuitable industries
- Suitable product and audience contexts
- Color palettes and semantic color roles
- Font pairings
- Typography scales
- Spacing and density profiles
- Radius and border profiles
- Shadow and elevation profiles
- Image and media treatments
- Motion profiles
- Layout tendencies
- Component compatibility
- Accessibility constraints
- Localization and script support
- Performance implications
- Source and license information
- Observed production and commercial performance

The Catalog is an internal LiNKsites production asset. An external repository or AI skill may contribute source material, but it does not become the live production authority merely because it is available.

## 3. UI UX Pro Max role

The `ui-ux-pro-max-skill` repository is an important upstream seed for the Design Intelligence Catalog because it provides broad structured material concerning UI styles, product categories, palettes, font pairings, and design guidance.

LiNKsites should not require every production executor to install the repository, invoke its skill directly, or trust its latest branch at runtime. Instead, the intended process is:

```text
Pin upstream source version
→ inspect content and license
→ extract candidate design data
→ normalize into LiNKsites schemas
→ review and test
→ approve selected entries
→ publish an internal Catalog version
```

This provides several benefits:

- Reproducible design decisions
- Protection against silent upstream changes
- Ability to remove unsuitable entries
- Internal compatibility metadata
- Consistent terminology
- Versioned production behavior
- Freedom to add LiNKsites-specific knowledge

The Catalog may also ingest approved material from other open-source sources, internal research, customer work, designers, accessibility guidance, and measured factory outcomes.

## 4. Catalog boundaries

The Catalog answers questions such as:

- Which visual families suit a dental clinic, restaurant, accountant, local service operator, or another supported vertical?
- Which palettes preserve readable contrast in light and dark contexts?
- Which font pairings support the required writing systems?
- Which component variants are compatible with a selected style?
- How much density and motion are appropriate for the intended audience?
- Which combinations are prohibited because they are inaccessible, visually inconsistent, slow, difficult to maintain, or poorly suited to the business?

The Catalog does not:

- Establish customer business facts
- Replace a Vertical Kit
- Define the paid tier by itself
- Provide React implementation code by itself
- Override customer-approved brand requirements without reason
- Grant rights to an asset merely because it lists that asset
- Guarantee conversion results

## 5. Catalog architecture

The Catalog should be represented through machine-readable, version-controlled definitions plus appropriate registry metadata in the working/control layer.

### 5.1 Catalog release

Every release should include:

```text
catalog_id
catalog_version
status
source_versions[]
schema_version
released_at
approved_by_or_policy
change_summary
compatibility_range
```

### 5.2 Style family

A style-family record should include:

```text
style_id
name
version
description
visual_attributes[]
suitable_verticals[]
unsuitable_verticals[]
suitable_audiences[]
tier_compatibility[]
layout_profile_refs[]
palette_refs[]
font_pairing_refs[]
component_variant_refs[]
media_treatment_refs[]
motion_profile_ref
accessibility_constraints[]
performance_class
source_refs[]
license_refs[]
status
```

### 5.3 Palette

A palette should not be stored only as an arbitrary list of hex values. It should identify semantic roles and expected contrast behavior.

```text
palette_id
name
version
base_colors
semantic_role_mapping
light_mode_mapping
dark_mode_mapping_if_supported
contrast_test_results
suitable_styles[]
suitable_verticals[]
restricted_combinations[]
source_and_license
status
```

### 5.4 Font pairing

A font-pairing record should include:

```text
font_pairing_id
heading_font
body_font
fallback_stack
supported_scripts[]
supported_weights[]
variable_font_support
loading_strategy
license
readability_evidence
performance_class
suitable_styles[]
restricted_uses[]
status
```

### 5.5 Layout profile

A layout profile should describe governed tendencies rather than a fixed page:

- Maximum content width
- Grid behavior
- Section spacing
- Hero composition
- Content density
- Alignment tendencies
- Navigation behavior
- Card usage
- Image-to-text ratio
- Responsive transformations
- Supported component arrangements

### 5.6 Motion profile

Motion must be intentional and bounded. A profile should define:

- Permitted animation categories
- Duration ranges
- Easing tokens
- Stagger constraints
- Scroll behavior
- Reduced-motion behavior
- Performance budget
- Prohibited animation patterns

## 6. Token hierarchy

Design tokens provide the controlled variables through which the shared frontend platform produces visual variation.

The recommended hierarchy is:

```text
Global foundation tokens
→ semantic tokens
→ style-family tokens
→ Vertical Kit constraints
→ Tier constraints
→ Site Design Profile
→ component-level resolved tokens
```

### 6.1 Global foundation tokens

Global tokens define platform-wide primitives, such as:

- Color scales
- Spacing scale
- Typography scale
- Breakpoints
- Radius scale
- Border widths
- Shadow scale
- Motion durations
- Z-index layers
- Container widths

These should remain stable enough that components can rely on them.

### 6.2 Semantic tokens

Semantic tokens describe purpose rather than literal values:

- `color.background.primary`
- `color.background.elevated`
- `color.text.primary`
- `color.text.muted`
- `color.action.primary`
- `color.action.primary_hover`
- `color.border.default`
- `color.feedback.error`
- `space.section.default`
- `radius.card`
- `shadow.navigation`

Components should consume semantic roles whenever practical. This allows a palette or style change without rewriting component code.

### 6.3 Style-family tokens

Style-family tokens resolve the general visual character. For example, a restrained professional style may use lower radius, modest shadow, conservative motion, and high information clarity. A warmer local-service style may use different color temperature, imagery, radius, and section rhythm.

### 6.4 Vertical Kit constraints

The Vertical Kit may restrict the style space. For example:

- A regulated professional service may prohibit playful novelty treatments.
- A restaurant may support media-forward layouts and menu-oriented content.
- A local repair service may prioritize contact clarity, service area, trust signals, and rapid scanning.

### 6.5 Tier constraints

The tier defines how much visual variation is permitted.

- Standard uses a narrower set of approved token profiles and component variants.
- Premium allows broader controlled selection and adaptation.
- Enterprise may permit separately approved variation or new reusable capability.

### 6.6 Site Design Profile

Every preview and customer site should resolve to a versioned Site Design Profile containing the exact choices used for that site.

```text
site_design_profile_id
catalog_version
style_id
palette_id
font_pairing_id
layout_profile_id
motion_profile_id
token_overrides
brand_input_refs
vertical_kit_version
tier_spec_version
component_registry_version
selection_reason_codes[]
selection_executor_and_version
approval_or_gate_refs[]
```

This makes design reproducible and auditable.

## 7. Site design-selection process

Design selection should use a constrained process rather than a free-form prompt.

### 7.1 Inputs

Inputs may include:

- Vertical and subvertical
- Tier
- Proof level
- Customer audience
- Business positioning
- Location and cultural context
- Existing brand colors and logo
- Available media
- Content density
- Conversion objective
- Language and script
- Required components
- Previous foundation performance
- Preview budget

### 7.2 Candidate filtering

Deterministic rules first remove incompatible options:

- Unsupported script
- Contrast failure
- Prohibited vertical/style pairing
- Component incompatibility
- Tier restriction
- Excessive performance cost
- License restriction
- Missing required token roles
- Conflict with approved customer brand inputs

### 7.3 Candidate ranking

Remaining candidates may be scored using:

- Vertical fit
- Audience fit
- Brand fit
- Content fit
- Conversion-path fit
- Media fit
- Reusable foundation availability
- Adaptation cost
- Quality history
- Engagement/conversion evidence
- Distinctiveness within the current campaign

### 7.4 Agent judgment

An AI agent may evaluate ambiguity, compare candidate compositions, or recommend a controlled override. The agent must choose from approved options unless the Issue specifically authorizes capability development.

Its output should be a structured Design Decision Record, not only prose.

### 7.5 Resolution

The selected candidate becomes the Site Design Profile and is pinned to exact Catalog, Kit, Tier, and component versions.

### 7.6 Validation

The rendered result must pass the required visual, accessibility, responsive, content-fit, and performance Gates. A valid schema alone does not prove a good design.

## 8. Design Decision Record

A Design Decision Record should capture:

```text
decision_id
site_or_foundation_id
candidate_profiles[]
selected_profile
input_summary
rule_filter_results
ranking_results
agent_assessment_if_used
customer_brand_constraints
accessibility_results
expected_adaptation_cost
reason_codes[]
gate_results[]
created_at
```

Reason codes may include:

- `VERTICAL_FIT`
- `BRAND_ALIGNMENT`
- `CONTENT_DENSITY_FIT`
- `CONVERSION_PATH_FIT`
- `LOW_ADAPTATION_COST`
- `REUSE_HIGH_PERFORMER`
- `SCRIPT_SUPPORT`
- `CUSTOMER_APPROVED_BRAND`
- `CAMPAIGN_DISTINCTIVENESS`

## 9. Controlled variation

Visual variation should occur at several governed levels.

### 9.1 Foundation variation

Different foundations may use different page structures, content emphasis, layouts, and component compositions.

### 9.2 Token variation

The same foundation may support approved token profiles affecting color, typography, spacing, radii, shadow, and motion.

### 9.3 Component-variant selection

Components may expose approved variants such as:

- Hero composition
- Navigation type
- Card treatment
- Testimonial layout
- Gallery treatment
- CTA arrangement
- Footer structure

Variants must preserve the component contract and responsive behavior.

### 9.4 Content-driven variation

Page composition may vary based on the number of services, locations, media assets, or required calls to action, within governed layout rules.

### 9.5 Media variation

Appropriate media, cropping, aspect ratios, overlays, and art direction can materially change the presentation without changing the frontend code.

### 9.6 Tier-based variation

Higher tiers may permit more combinations, deeper content, additional sections, expanded media, or separately approved components.

## 10. Avoiding repetitive output

LiNKsites should detect excessive similarity across prospect previews and customer sites, particularly within the same vertical and geography.

Similarity analysis may consider:

- Foundation ID and version
- Section sequence
- Component-variant sequence
- Palette family
- Typography profile
- Hero composition
- Image reuse
- Copy-pattern overlap
- CTA structure
- Overall visual embedding or screenshot similarity

The Program may impose campaign diversity constraints such as:

- Do not assign the same exact Site Design Profile to adjacent prospects where visible duplication harms credibility.
- Prefer a compatible alternate foundation when adaptation cost remains acceptable.
- Rotate approved media and composition profiles.
- Do not sacrifice suitability or quality merely to force novelty.

Similarity thresholds must be calibrated using evidence, not guessed as permanent constants.

## 11. Customer brand inputs

Customer or prospect brand inputs may include:

- Logo
- Existing colors
- Typeface requirements
- Brand guide
- Photography
- Signage or packaging references
- Existing website
- Social-media presentation

These inputs should be classified as:

- Mandatory approved constraint
- Preferred constraint
- Reference only
- Unverified extracted signal
- Technically or accessibly unsuitable

### 11.1 Conflict resolution

If an existing brand color causes poor contrast, LiNKsites should not silently publish inaccessible text. The Site Design Profile may:

- Use the brand color in non-text roles
- Generate an accessible tonal scale
- Pair it with compliant text/background roles
- Propose a controlled adjustment
- Request approval where the visual change is material

### 11.2 Missing brand system

When the business lacks a formal brand system, LiNKsites may produce a bounded website brand treatment using approved Catalog choices. This does not necessarily constitute a complete brand-strategy or trademark-design service.

## 12. Color system requirements

Every production palette must define semantic roles and pass automated contrast tests for required combinations.

At minimum, validate:

- Body text on primary backgrounds
- Muted text on relevant backgrounds
- Links and interactive states
- Buttons in default, hover, focus, active, and disabled states
- Form labels, inputs, errors, and placeholders
- Navigation states
- Status messages
- Overlays on images

Color must not be the only means of conveying essential status or meaning.

Palette generation or customer-brand adaptation must preserve a tested record of the resolved values, not only a prompt describing the intended mood.

## 13. Typography requirements

Typography selection must consider:

- Readability
- Writing-system coverage
- Available weights and styles
- Font loading cost
- Fallback behavior
- Heading/body compatibility
- Numerals and business data
- Long words and localization
- Mobile rendering
- Licensing and permitted hosting

### 13.1 Multilingual support

English, Spanish, Traditional Chinese, Simplified Chinese, and other future languages may require different font behavior. A font pairing approved for Latin text cannot be assumed to support Chinese acceptably.

The Site Design Profile should define script-aware stacks and test mixed-language cases where required.

### 13.2 Loading strategy

The platform should prefer efficient formats, required subsets where lawful and practical, appropriate preloading, stable fallbacks, and avoidance of unnecessary weights.

Typography quality must not create unacceptable layout shift or performance cost.

## 14. Spacing, density, and layout rhythm

Spacing tokens should be derived from a controlled scale. Arbitrary per-site pixel values should be treated as exceptions.

Density profiles may include, for example:

- Compact/information-dense
- Balanced/default
- Spacious/editorial

The profile must suit content and audience. Excessive spacing that weakens mobile usability or hides essential business information below decorative content should fail evaluation.

## 15. Image and media treatment

Design Intelligence should define how media is presented, not which unverified image depicts a particular business.

Treatment rules may cover:

- Aspect ratios
- Cropping focus
- Border radius
- Overlay strength
- Duotone or color treatment
- Background position
- Responsive art direction
- Gallery layout
- Lazy loading
- Placeholder behavior
- Alt-text requirements

Media treatment must remain compatible with rights, provenance, performance, and accessibility policies described later in the manual.

## 16. Motion and interaction

Motion may support hierarchy, feedback, and polish, but it must not become uncontrolled decoration.

Required rules include:

- Respect `prefers-reduced-motion`
- Keep critical actions usable without animation
- Prohibit motion that obstructs reading or input
- Limit simultaneous animated elements
- Avoid performance-heavy effects on low-capacity devices
- Preserve focus visibility and keyboard operation
- Test motion on mobile

Components from sources such as Magic UI may be selectively internalized only after these requirements are satisfied. Magic MCP is not required for normal design selection or site production.

## 17. Accessibility as a design constraint

Accessibility is not a final cosmetic check. It constrains Catalog admission and design resolution.

The Catalog and Site Design Profile must support:

- Contrast
- Text sizing and zoom behavior
- Keyboard navigation
- Focus states
- Semantic hierarchy
- Touch-target sizing
- Form identification and errors
- Reduced motion
- Screen-reader-compatible component behavior
- Alternative text workflow
- Language declaration

An attractive candidate that cannot satisfy required accessibility behavior is not an eligible production design.

## 18. Responsive design doctrine

The Site Design Profile must define responsive transformation, not merely desktop and mobile screenshots.

It should account for:

- Navigation collapse
- Grid-to-stack behavior
- Typography scaling
- Media cropping
- CTA placement
- Table or structured-content adaptation
- Long localized text
- Touch interaction
- Landscape and narrow widths

Components must be tested across the supported viewport matrix. Visual review should include representative content extremes, not only ideal short text.

## 19. Design validation

Design validation uses several complementary evaluators.

### 19.1 Deterministic checks

- Token schema
- Required semantic roles
- Contrast
- Font availability
- Unsupported combinations
- Responsive overflow detection
- Missing assets
- Component compatibility
- Performance budgets

### 19.2 Visual regression

Playwright-based screenshots compare approved component, foundation, and site states across viewports. A difference may be intentional, but it must be reviewed according to the change policy.

### 19.3 Rubric-based visual evaluation

A capable vision model or human reviewer may assess:

- Hierarchy
- Coherence
- Vertical suitability
- Brand alignment
- Balance
- Content readability
- Conversion clarity
- Obvious visual defects

The evaluator must use a versioned rubric and return structured evidence. Model, version, prompt/rubric, and confidence must be recorded.

### 19.4 Customer approval

Customer approval may be required for material brand or production decisions according to the product tier and lifecycle. Customer approval does not replace technical accessibility or safety requirements.

## 20. Provenance and licensing

Every Catalog entry should identify:

- Original source
- Source version or commit where available
- Retrieval date
- License
- Modifications
- Reviewer
- Permitted use
- Attribution requirement
- Redistribution restriction
- Expiration or review date if applicable

An upstream repository's license may cover code but not bundled fonts, imagery, brand examples, or external data. Each asset class must be assessed separately.

## 21. Catalog lifecycle

Catalog entries move through:

```text
candidate
→ normalized
→ under_review
→ testing
→ approved
→ active
→ refresh_required / suspended
→ deprecated
→ retired
```

Only active entries may be selected automatically. Existing sites pin exact versions so that retirement does not silently alter their appearance.

## 22. Change and migration behavior

Changing a Catalog or token version does not automatically redesign every active customer site.

For each change, define:

- Whether it is backward compatible
- Whether it fixes a security or accessibility defect
- Whether active sites require migration
- Whether the change is visual or implementation-only
- Required customer approval
- Rollback strategy
- Visual-regression baselines

Emergency accessibility or security fixes may follow a stronger mandatory migration policy than elective style improvements.

## 23. Feedback and performance learning

The Catalog should improve using evidence such as:

- Preview engagement
- Sales conversion associated with foundations and design profiles
- Customer acceptance and revision frequency
- Visual Gate failures
- Accessibility and performance regressions
- Change-request burden
- Support incidents
- Foundation reuse rate
- Production/adaptation cost

Correlation does not prove that a design caused a sale. The Program should use controlled comparisons and sufficient samples before promoting design folklore into production rules.

## 24. Design executor responsibilities

Design-selection executors must:

- Use the active Catalog version
- Respect Vertical Kit and Tier constraints
- Produce structured candidate and decision records
- Avoid unapproved arbitrary values
- Record model/tool/version and cost
- Return confidence and unresolved ambiguity
- Preserve customer brand input references
- Support deterministic replay where possible

They must not:

- Install arbitrary runtime UI packages for one prospect
- Copy unreviewed source code directly into production
- Invent a new design system for every site
- Ignore accessibility because a screenshot looks attractive
- Rewrite components when token or variant configuration is sufficient
- Claim customer approval that was not recorded

## 25. Catalog service interface

The implementation should expose narrow operations such as:

```text
list_eligible_styles(vertical, tier, requirements)
list_eligible_palettes(style, brand_constraints)
list_eligible_font_pairings(style, scripts, performance_class)
resolve_site_design_profile(inputs, catalog_version)
validate_design_profile(profile)
get_profile_tokens(profile_id)
record_design_outcome(profile_id, outcome_refs)
```

Executors should not directly edit Catalog tables or git definitions during a production Run.

## 26. Relationship with the component registry

The Design Intelligence Catalog defines what is visually suitable and permitted. The component registry defines what is implemented, versioned, and renderable.

A design entry must reference compatible implemented component variants. A component variant must declare which design tokens and profiles it supports.

Neither may assume compatibility without tests.

## 27. Relationship with Vertical Kits

The Vertical Kit narrows the Catalog according to business context. It may:

- Prefer specific styles
- Prohibit unsuitable styles
- Require certain content hierarchy
- Require media-forward or information-forward layouts
- Define trust and CTA placement
- Constrain motion or density

The Vertical Kit should reference Catalog IDs and versions rather than copying the full design definitions.

## 28. Relationship with reusable foundations

A foundation pins a Site Design Profile or an allowed family of profiles.

Two models may be supported:

1. **Fixed-profile foundation:** The foundation has one approved design profile and allows only bounded customer-brand adaptation.
2. **Profile-compatible foundation:** The foundation supports several tested profiles and component variants.

The second model provides greater reuse but requires more combination testing.

## 29. Initial implementation posture

For the initial product:

- Internalize and review a practical subset of upstream design data.
- Do not attempt to activate every available style, palette, font, and combination.
- Select a small set that supports the first Vertical Kits.
- Build strong tests and schemas.
- Add combinations based on product need and measured evidence.
- Keep visual-editor functionality deferred.
- Preserve architecture that does not unnecessarily block a future editor such as Puck.

This reduces initial complexity without abandoning the scalable Catalog model.

## 30. Acceptance criteria

The Design Intelligence system is acceptable when:

1. Production does not depend on a live unpinned upstream skill repository.
2. Every active design entry has source, license, version, and review state.
3. Site design is reproducible from a Site Design Profile.
4. Tier and Vertical Kit rules constrain selection.
5. Customer brand inputs are classified and preserved.
6. Palettes define semantic roles and pass contrast tests.
7. Font pairings support the required scripts and loading strategy.
8. Component compatibility is tested, not assumed.
9. Visual variation is possible without per-site code forks.
10. Excessive similarity can be detected and managed.
11. Accessibility and performance constrain eligibility.
12. Model-based visual judgment uses versioned rubrics and evidence.
13. Active customer sites pin versions and do not change silently.
14. Catalog improvement is evidence-based and controlled.

## 31. Governing conclusion

LiNKsites achieves scalable visual quality by converting design knowledge into a governed production system. External open-source design resources provide valuable raw intelligence, but LiNKsites selects, normalizes, tests, versions, and internalizes the parts it can safely use.

The result is neither one inflexible template nor unconstrained AI design. It is a controlled design space in which the Program can choose suitable, distinct, accessible, maintainable, and cost-effective website presentations while preserving exact evidence of how each result was produced.

---

**End of Section 06**

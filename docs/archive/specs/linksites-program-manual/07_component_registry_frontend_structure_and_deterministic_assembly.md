# LiNKsites Program Manual

## Section 07 — Component Registry, Frontend Structure, and Deterministic Site Assembly

**Document set:** LiNKsites Program Manual  
**Section:** 07 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, product and engineering agents, frontend implementers, design-system maintainers, Payload implementers, repository auditors, QA agents, operators, and future human collaborators  

---

## 1. Purpose of this section

This section defines the reusable frontend production system that turns approved content, design decisions, tier rules, and Vertical Kit specifications into working LiNKsites websites.

The governing objective is to make website production:

- Fast enough for the build-first sales model
- Consistent enough to operate autonomously at scale
- Flexible enough to create visibly different and appropriate sites
- Deterministic enough to test, reproduce, maintain, and repair
- Economical enough that unsold previews can be recycled rather than written off
- Safe enough that an executor cannot silently introduce insecure or incompatible code

The core mechanism is a versioned **Component Registry** and a deterministic **Site Assembly Engine**. AI agents may make bounded choices inside this system, but normal site production does not ask a frontier agent to invent an entire React application from a prompt.

## 2. Governing doctrine

LiNKsites follows these frontend principles:

1. **Shared platform, isolated site configuration.** Sites use a common governed code platform while retaining separate content, identity, domains, design profiles, and operational records.
2. **Composition instead of per-customer code generation.** Most websites are assembled from approved components, variants, layouts, tokens, and content schemas.
3. **Data drives presentation.** Content and permitted configuration are stored in governed data layers; they are not hidden in prospect-specific source-code forks.
4. **Every selectable capability is registered.** A component cannot be selected automatically merely because its file exists in a repository.
5. **Versions are immutable in effect.** A production-relevant behavior change creates a new version or release and a migration decision.
6. **Compatibility is declared and tested.** Tier, Vertical Kit, design profile, runtime, language, integration, and component combinations are not assumed to work.
7. **Agents choose within contracts.** Agents may recommend or select eligible options, but deterministic validation resolves whether a choice is accepted.
8. **Custom code is an exception pathway.** A missing capability becomes a governed capability-development Issue, not an invitation to improvise inside one customer site.
9. **Customer-specific changes do not mutate shared foundations.** Reusable assets and customer instances have separate identities and lineage.
10. **The frontend is replaceable in parts, reconstructable as a whole.** A site must be rebuildable from pinned manifests, governed content, assets, and platform releases.

## 3. What the Component Registry is

The Component Registry is the authoritative catalog of frontend building blocks that LiNKsites permits executors to use in governed site assembly.

It is both:

- A **machine-readable registry** used by assembly, validation, migration, and audit executors
- A **human-readable capability catalog** explaining what each component does, where it is suitable, and what constraints apply

The Registry is not merely a directory of React files. A source file becomes a registered capability only when it has:

- A stable identifier
- An owner and source location
- A declared purpose
- A version and lifecycle state
- A validated input contract
- Declared output and behavior
- Accessibility requirements
- Responsive behavior
- Design-token dependencies
- Supported variants
- Compatibility declarations
- Performance characteristics
- Test evidence
- Security classification where relevant
- Migration and deprecation information
- Provenance and license information for incorporated third-party work

Only active Registry entries may be selected automatically for new production.

## 4. Registry boundaries

### 4.1 The Registry owns

The Registry owns the definition and eligibility of reusable frontend capabilities, including:

- Component code identity
- Component schemas and variants
- Component-to-CMS mapping
- Design-token interfaces
- Compatibility rules
- Test fixtures and approved reference states
- Component lifecycle and versions
- Dependency and provenance records
- Migration instructions

### 4.2 The Registry does not own

The Registry does not own:

- Prospect or customer facts
- Final website copy
- Customer media files
- Lead research
- Prices, orders, payments, or CRM state
- The current published state of Payload content
- Hosting placement
- Domain and DNS state
- The Design Intelligence Catalog itself
- Vertical Kit commercial policy

It references these systems through identifiers and contracts rather than duplicating their authority.

### 4.3 Code is not content

A section such as a service grid has two different kinds of information:

- The **component capability** defines layout, behavior, variants, constraints, and how data is rendered.
- The **content instance** defines the heading, service items, descriptions, links, and media for one site.

This separation is essential. Copying customer text into a component source file destroys reuse, complicates publication, and makes autonomous updating unsafe.

## 5. Component classification

The Registry should classify components by operational responsibility rather than by visual appearance alone.

### 5.1 Foundation primitives

Foundation primitives provide basic, widely reused interface behavior, for example:

- Button
- Link
- Heading
- Text block
- Icon
- Badge
- Image
- Video
- Container
- Stack
- Grid
- Divider
- Dialog
- Accordion
- Tabs

Primitives usually wrap or internalize dependable open-source foundations. They should expose LiNKsites tokens and accessibility contracts rather than leaking an upstream library's entire API into site data.

### 5.2 Composed sections

Composed sections combine primitives into meaningful website units, for example:

- Hero
- Service grid
- About section
- Testimonial group
- Gallery
- Pricing display
- Team section
- Frequently asked questions
- Location section
- Contact call to action
- Footer

These are the primary blocks used by the assembly system.

### 5.3 Page-shell components

Page-shell components establish whole-page or cross-page structure:

- Site header
- Navigation
- Announcement area
- Main content shell
- Breadcrumbs
- Local navigation
- Footer
- Consent surface
- Error and not-found pages

They carry special responsibilities for navigation, accessibility, structured data, and responsive behavior.

### 5.4 Vertical components

Vertical components serve validated needs of particular SMB categories, for example:

- Restaurant menu
- Appointment-oriented service listing
- Property or room presentation
- Course or class schedule
- Professional credentials panel
- Service-area coverage

A vertical component may later be generalized, but it should not be falsely presented as universal before evidence supports that conclusion.

### 5.5 Integration components

Integration components connect the website to an external or shared service:

- Contact form
- Booking link or embed
- Map
- Payment link
- Newsletter subscription
- Messaging action
- Analytics or consent adapter

They require stricter security, privacy, failure, and observability contracts than a purely presentational component.

### 5.6 System components

System components support runtime integrity rather than customer-facing composition:

- Metadata renderer
- Structured-data renderer
- Locale router
- Asset resolver
- Feature-flag resolver
- Error boundary
- Health indicator
- Preview notice
- Safe fallback renderer

System components are usually not directly selectable by a content agent.

## 6. Component granularity doctrine

LiNKsites should avoid both extremes:

- One enormous template component that is difficult to vary, test, or reuse
- Hundreds of tiny CMS-selectable fragments that allow invalid combinations and make assembly expensive

The normal CMS-selectable unit is a coherent section with a clear business purpose. Internal implementation may use smaller primitives, but those primitives do not all need to be exposed as customer content choices.

A component should be split when its responsibilities, schema, release cadence, or compatibility rules are materially independent. It should remain composed when splitting it would expose implementation detail without creating useful production control.

## 7. Recommended Registry record

Each registered component version should have a record equivalent to the following logical schema:

```yaml
component_id: section.services-grid
version: 2.3.0
state: active
name: Services Grid
class: composed_section
owner: linksites-frontend
source_ref: repository-and-path-reference
source_release: platform-release-id
schema_ref: services-grid-schema-v2
payload_block_type: servicesGrid
allowed_variants:
  - cards
  - editorial
  - compact
token_contract: services-grid-token-contract-v2
supported_locales:
  - '*'
script_support:
  - latin
  - traditional_chinese
  - simplified_chinese
compatible_tiers:
  - configured-by-product-catalog
compatible_vertical_kits:
  - declared-by-kit-compatibility-records
runtime_modes:
  - server_rendered
  - statically_generated
accessibility_profile: section-standard-v3
performance_profile: medium
security_profile: presentational
test_evidence:
  - unit-suite-id
  - accessibility-suite-id
  - visual-suite-id
provenance:
  origin: internal
  upstream_refs: []
deprecated_by: null
migration_ref: null
```

The physical implementation may use a database, versioned files, or both. The logical information must remain queryable and auditable.

## 8. Stable identity and semantic versioning

### 8.1 Stable component identifier

The `component_id` represents the capability across compatible revisions. It must not depend on a customer, prospect, campaign, or file path.

### 8.2 Version

The version identifies the behavior and contract selected by a site manifest. A practical semantic interpretation is:

- **Patch:** defect correction with no intended contract or visual meaning change
- **Minor:** backward-compatible capability or variant addition
- **Major:** breaking schema, behavior, rendering, accessibility, or migration change

Automated tooling must still inspect declared compatibility; it must not infer safety from version numbers alone.

### 8.3 Platform release

A platform release pins a tested collection of component, runtime, token, integration-adapter, and dependency versions. Sites should normally reference a platform release rather than independently combining arbitrary package versions.

This reduces the combination space and makes rollback practical.

## 9. Component lifecycle

The minimum lifecycle is:

```text
proposed
→ implementing
→ validating
→ pilot
→ active
→ refresh_required or deprecated
→ retired
```

- **Proposed:** Need, intended use, and ownership are documented.
- **Implementing:** Code, schema, fixtures, and contracts are being created.
- **Validating:** Required automated and visual tests are running.
- **Pilot:** Eligible only for limited controlled use.
- **Active:** Eligible for automatic selection under its compatibility rules.
- **Refresh required:** Temporarily ineligible for new automatic use pending correction or review.
- **Deprecated:** Existing sites may temporarily retain it, but new selection is blocked.
- **Retired:** Runtime use is removed after migration or approved end-of-life handling.

Suspension may occur from any production-eligible state when a security, accessibility, data-isolation, or severe functional defect is discovered.

## 10. Frontend platform structure

The existing repositories must be audited before engineering treats any physical folder layout as final. The target logical structure, however, should separate these responsibilities:

```text
frontend platform
├── application runtime and routing
├── site and tenant resolution
├── content retrieval and validation
├── design-token resolution
├── component implementations
├── component registry
├── page and site assembly
├── integrations and adapters
├── analytics and observability
├── test fixtures and reference sites
└── build, release, and deployment tooling
```

The recommended technology posture is to retain a shared Next.js, React, Tailwind CSS, shadcn-derived, and Payload-compatible foundation if the repository audit confirms that the existing implementation is sound. These technologies are the present engineering direction, not permission to preserve flawed code merely because it already exists.

Open-source components may accelerate the platform, but LiNKsites must internalize and govern what it uses. Production must not rely on an MCP server, an AI skill, or a third-party demonstration site being available at runtime.

## 11. Strict frontend structure

Strict structure means that all sites obey shared rules for:

- Routing
- Layout shells
- Metadata
- Content retrieval
- Error handling
- Locale handling
- Asset resolution
- Token application
- Form submission
- Analytics events
- Accessibility landmarks
- Structured data
- Security headers
- Preview versus production behavior

It does not mean every site has identical pages or visual appearance.

Strict structure provides the stable rails within which Vertical Kits, foundations, component variants, content, media, and design profiles create differentiation.

## 12. CMS-to-component mapping

Payload content must refer to registered presentation capabilities through governed block or field types. A CMS record must not contain executable React, arbitrary JavaScript, unrestricted class names, or agent-generated HTML that bypasses the Registry.

The normal mapping is:

```text
Payload block type
→ validated content schema
→ registered component ID
→ approved variant
→ resolved token contract
→ rendered component
```

The mapping layer should be explicit. If a Payload block is renamed, split, or migrated, the system must know which component versions consume each schema version.

### 12.1 Safe content fields

CMS-controlled fields may include:

- Text and rich-text content constrained by schema
- Asset references
- Link targets
- Structured lists
- Variant identifiers from an allowlist
- Approved alignment or emphasis options
- Integration references

### 12.2 Unsafe content fields

Normal site content must not include:

- Raw executable code
- Arbitrary package references
- Unfiltered scripts
- Unrestricted CSS
- Secret values
- Cross-tenant database identifiers
- Unvalidated external embed markup

Any exceptional embed or integration follows a separately registered adapter with a security contract.

## 13. Site Assembly Manifest

Every assembled foundation, preview, and customer site must have a versioned **Site Assembly Manifest**. The manifest is the reconstructable description of what the frontend is expected to render.

It should identify at minimum:

```yaml
manifest_id: unique-id
manifest_version: 1
site_identity:
  site_id: stable-site-id
  site_class: foundation-or-preview-or-customer
  vertical_kit_id: kit-id
  tier_id: tier-id
platform_release: release-id
design_profile: site-design-profile-id
content_release: payload-content-version-or-release
locale_configuration: locale-profile-id
pages:
  - route: /
    page_type: home
    sections:
      - instance_id: hero-1
        component_id: section.hero
        component_version: 3.1.0
        variant: split-media
        content_ref: payload-record-reference
        configuration_ref: bounded-config-reference
integrations:
  - registered-integration-instance-references
asset_manifest: asset-manifest-id
gate_receipts:
  - required-validation-receipts
lineage:
  foundation_id: optional-foundation-id
  preview_id: optional-preview-id
  prior_manifest_id: optional-prior-version
```

The manifest references authoritative data; it does not need to duplicate all copy or media metadata.

## 14. Deterministic assembly definition

Deterministic assembly means that the same accepted inputs, pinned versions, and declared environment produce the same intended site structure and behavior.

It does not require byte-for-byte identical build artifacts where toolchains legitimately include variable metadata. It requires reproducibility of the production meaning:

- Same route map
- Same component selections and order
- Same variants
- Same resolved design profile
- Same governed content release
- Same integration configuration references
- Same validation expectations

Randomness, model output, current time, or uncontrolled external state must not silently change assembly.

If a stochastic executor contributes a decision, its accepted output is converted into a versioned record before assembly continues.

## 15. Assembly process

The normal assembly sequence is:

1. Accept a validated Site Specification.
2. Resolve site class, Vertical Kit, tier, language, and conversion objective.
3. Select or confirm an eligible reusable foundation.
4. Resolve the approved Site Design Profile.
5. Resolve required page types and routes.
6. Resolve eligible component candidates for each required section.
7. Apply deterministic compatibility filters.
8. Apply approved selection policy or accept a bounded agent recommendation.
9. Bind validated content and asset references.
10. Construct the Site Assembly Manifest.
11. Validate schemas and cross-record references.
12. Render in an isolated preview environment.
13. Run required functional, visual, accessibility, SEO, and performance Gates.
14. Record accepted release artifacts and Gate receipts.
15. Promote according to preview or production authority.

No step should be inferred complete merely because a page looks correct in one browser view.

## 16. Candidate resolution rules

For each required capability, the resolver should first eliminate ineligible candidates. Filters may include:

- Component lifecycle state
- Platform release membership
- Vertical Kit compatibility
- Tier eligibility
- Required content availability
- Design-profile compatibility
- Locale and script support
- Runtime-mode support
- Integration availability
- Accessibility status
- Performance budget
- Security policy
- Known incident or suspension state

Eligible candidates may then be ranked by:

- Foundation reuse
- Vertical suitability
- Content fit
- Conversion objective
- Distinctiveness requirements
- Historical quality
- Measured engagement or conversion evidence
- Adaptation effort
- Rendering cost
- Operational simplicity

Ranking can inform a decision but cannot override a hard incompatibility.

## 17. Role of AI in assembly

AI is useful where judgment is required, such as:

- Choosing among several compatible hero compositions
- Mapping researched business information into the correct content schema
- Recommending section order within a Vertical Kit's allowed patterns
- Selecting appropriate emphasis for a conversion objective
- Identifying visual or semantic repetition
- Explaining why one eligible option better fits a prospect

AI should not normally:

- Create a new application structure for each lead
- Write arbitrary production JSX into site-specific folders
- Invent unregistered CMS fields
- Add packages without capability review
- Bypass accessibility or performance Gates
- Publish content directly
- Alter a shared component to satisfy one customer without impact analysis

Every accepted AI decision records its inputs, output, model/executor identity, governing policy version, and deterministic validation result.

## 18. Deterministic executors

Code, scripts, and automations should perform tasks that do not require open-ended judgment, including:

- Schema validation
- Component eligibility filtering
- Manifest construction
- Route generation
- Token resolution
- Content-reference checking
- Asset-dimension and format checks
- Duplicate identifier detection
- Dependency graph construction
- Static analysis
- Test execution
- Screenshot capture
- Build and artifact generation
- Release signing or checksum creation

Agents should be reserved for tasks where their additional reasoning produces material value.

## 19. Reusable foundations

A reusable foundation is a tested site composition designed for adaptation. It pins:

- Vertical Kit and tier compatibility
- Route and page patterns
- Component versions and variants
- A compatible design-profile range
- Content-slot requirements
- Media requirements
- Integration capabilities
- Known adaptation boundaries
- Test evidence

The foundation is not a finished generic theme. It is a production-ready structure with enough approved variation to support appropriate prospect adaptation.

Each prospect adaptation and customer instance receives its own manifest and content references. Updating one must not alter another unexpectedly.

## 20. Variant policy

A variant is a governed behavior or presentation option inside a component. It should exist when the option is common, meaningful, testable, and compatible with the component's purpose.

Variants must use stable identifiers such as `split-media` or `compact`, not presentation labels that can change casually.

A variant must not become an escape hatch for arbitrary values. If a component exposes dozens of loosely constrained switches whose combinations are untested, it has recreated uncontrolled generation inside a nominal Registry.

The Registry should declare:

- Allowed variants
- Required content per variant
- Compatible design families
- Responsive behavior
- Accessibility differences
- Performance implications
- Invalid option combinations

## 21. Design-token contract

Components consume semantic tokens from the hierarchy defined in Section 06. They should request meaning, not hard-code customer-specific values.

For example, a component should consume concepts such as:

- Surface background
- Primary text
- Muted text
- Brand action
- Critical action
- Focus ring
- Section spacing
- Content measure
- Card radius
- Elevation level

It should not depend on a specific palette name or raw color value unless it is a documented technical primitive resolved below the semantic layer.

Missing required tokens must fail validation or resolve through an explicit safe fallback. Silent arbitrary defaults undermine reproducibility.

## 22. Responsive contract

Every production component must declare and test its behavior across the platform's supported viewport classes. The contract must address:

- Content reflow
- Navigation behavior
- Image cropping and art direction
- Touch target size
- Text wrapping
- Grid collapse
- Overflow behavior
- Embedded integrations
- Sticky or fixed elements
- Reduced viewport height

Breakpoints are platform tokens, not site-specific guesses. A component must support content stress cases rather than only ideal fixture text.

## 23. Localization contract

Components must not assume that English text length, Latin script, left-to-right presentation, date formatting, telephone formats, or address structures are universal.

The Registry should declare:

- Supported scripts and directions
- Locale-aware formatting behavior
- Whether line breaking has been tested for each required script
- Content-length limits or flexible behavior
- Font fallback requirements
- Structured-data localization behavior
- Whether an integration is locale-compatible

For the initial language posture, English, Spanish, Traditional Chinese, and Simplified Chinese requirements should be represented explicitly where the selected markets, sites, or operations require them. Support must be proven by tests and suitable fonts, not asserted globally.

## 24. Accessibility contract

Accessibility is part of component eligibility. Each component must define and test:

- Semantic structure
- Heading behavior
- Keyboard operation
- Focus management
- Accessible names and descriptions
- Color and non-color state communication
- Screen-reader behavior where interactive
- Motion reduction
- Error messaging
- Form labels and instructions
- Media alternatives

Automated checks are necessary but insufficient. Complex interactive components require manual or rubric-based review before active status.

A component that fails a critical accessibility requirement must be blocked or suspended even if it is visually attractive.

## 25. Performance contract

The Registry should record the likely performance cost of each component and integration, including:

- Client-side JavaScript
- Hydration requirement
- Image and media weight
- Font impact
- Third-party network calls
- Layout-shift risk
- Render-blocking behavior
- Cacheability

Server-rendered or static output should be preferred for ordinary marketing content when it provides the required behavior. Client-side execution should be introduced only where interaction justifies it.

The assembly system must calculate a whole-page budget. Several individually acceptable components may become unacceptable when combined.

## 26. SEO and structured-data contract

Components that affect discoverability must expose governed metadata and structured-data behavior. Examples include:

- Page title and description inputs
- Heading hierarchy
- Canonical link behavior
- Image alternative text
- Local business information
- Frequently asked questions
- Breadcrumbs
- Service or product information
- Social preview metadata

Structured data must be derived from validated facts and schemas. It must not contain unsupported claims produced merely to improve search visibility.

## 27. Integration and form contract

An integration component must declare:

- Service or adapter identity
- Authentication and secret-reference method
- Data sent and received
- Validation behavior
- Timeout and retry behavior
- Idempotency behavior
- Failure display
- Spam or abuse controls where applicable
- Observability events
- Consent or privacy configuration hooks
- Safe degraded mode

A form that renders correctly but loses submissions is not a successful component. End-to-end test evidence is required for the active integration path.

## 28. Failure and fallback behavior

Components must fail deliberately.

Examples:

- A missing optional image may select an approved text-only variant.
- A failed map integration may show a validated address and directions link.
- A missing required primary action must block publication.
- Invalid content must not render as raw diagnostic output.
- An unavailable optional third-party widget must not take down the page.

Fallbacks are registered behavior. Executors must not invent them during an incident.

## 29. Dependency policy

LiNKsites should reuse reliable open-source work instead of rebuilding commodity interface foundations. Reuse remains governed.

Before a dependency or external component source is admitted, the Program should review:

- License and attribution requirements
- Maintenance state
- Security history
- Bundle and runtime cost
- Accessibility quality
- Compatibility with the platform
- Ability to internalize, pin, or replace it
- Transitive dependency risk
- Testability

shadcn-derived components, selected Magic UI-style components, or similar repositories may provide useful implementation starting points. Their useful code should be reviewed, adapted to LiNKsites contracts, pinned, tested, and registered.

Magic MCP is not required for production assembly. An MCP-assisted development tool may help an engineer or agent discover or scaffold a component, but the accepted result enters the same internal capability pipeline. The runtime cannot depend on an MCP call to render a customer website.

## 30. Component compatibility matrix

Compatibility should be represented as records rather than buried in prose. The matrix may connect:

| Dimension | Example question |
|---|---|
| Platform release | Is this component included and tested in the selected release? |
| Vertical Kit | Is the capability appropriate and configured for this business type? |
| Tier | Is it included in the purchased or preview-authorized scope? |
| Design profile | Do the selected tokens and layout profile support it? |
| Content schema | Does the content release satisfy the required schema version? |
| Locale/script | Can it render the required language correctly? |
| Runtime | Can the target frontend mode render it safely? |
| Integration | Are the necessary adapters and credentials available? |
| Performance | Does the whole page remain within budget? |
| Lifecycle | Is automatic selection currently allowed? |

Tests should cover active combinations that LiNKsites actually sells or uses. It is unnecessary and expensive to test every theoretical combination if product policy prevents most of them.

## 31. Testing requirements

Each component should have proportionate evidence from:

- Schema tests
- Unit tests
- Rendering tests
- Interaction tests
- Accessibility tests
- Responsive screenshots
- Visual regression tests
- Content stress tests
- Locale and script tests
- Performance measurements
- Security tests for interactive or integration components
- End-to-end tests for critical customer journeys

Reference fixtures should include ideal and adverse content, such as:

- Long names
- Missing optional media
- Maximum approved item counts
- Minimum content
- Multiline actions
- Multiple scripts
- Slow or failed external services

Passing a single polished demonstration is not sufficient production evidence.

## 32. Visual regression and intentional change

Approved component states should have reference screenshots at defined viewports and design profiles. A visual difference may be:

- Intended and accepted
- A harmless rendering variation within policy
- A defect
- An unreviewed breaking change

The validation executor should produce evidence; it should not automatically accept every changed screenshot. Intentional changes update reference evidence only after approval.

## 33. Security and tenant isolation

The frontend assembly system must prevent one site's data, configuration, or secrets from appearing in another site.

Controls include:

- Site identity resolved from governed routing configuration
- Server-side content queries scoped to the resolved site
- No client-provided tenant identifier trusted without validation
- No secrets placed in Payload content or browser-visible manifests
- Integration credentials referenced through a secret manager or equivalent secure mechanism
- Cache keys that include the correct site and content version boundaries
- Preview authorization that cannot expose unrelated drafts
- Logs that avoid unnecessary sensitive content

Shared code does not justify shared unscoped data access.

## 34. Observability events

Components and the assembly layer should emit normalized events sufficient to understand:

- Which component and version rendered
- Assembly or schema failures
- Fallback activation
- Integration failures
- Form-submission outcomes
- Client-side errors
- Core journey interactions
- Performance measurements
- Platform release and site identity

Analytics intended for commercial learning should remain distinguishable from technical telemetry. Both require consistent event names and versioned schemas.

## 35. Change, migration, and rollback

When a component changes, LiNKsites must decide whether existing foundations, previews, and customer sites:

- Remain pinned
- Receive a compatible update
- Require a manifest migration
- Require content transformation
- Require customer review
- Must be urgently patched

A migration record should include:

- Source and target versions
- Eligibility criteria
- Content transformation
- Expected visual impact
- Test requirements
- Rollback procedure
- Sites affected
- Execution and Gate receipts

Rollback restores a known-good platform and manifest relationship. It must not depend on reconstructing an undocumented previous state from memory.

## 36. Custom capability exception

If no registered component can satisfy an approved requirement, the Program may create a capability-development Issue.

The Issue must specify:

- Business need
- Whether the need is customer-specific or broadly reusable
- Expected vertical and tier applicability
- Content schema
- Design and interaction behavior
- Security and integration implications
- Test and acceptance criteria
- Ownership and maintenance plan

The resulting component moves through the Registry lifecycle. It does not become production-eligible merely because it was built successfully once.

If a requirement is truly unique and commercially justified, LiNKsites may support a separately governed custom extension. Its cost, upgrade burden, and operational boundary must be explicit. The standard product must not quietly absorb unlimited bespoke development.

## 37. Puck and future visual editing

LiNKsites may later evaluate a governed visual editor such as Puck for internal composition or constrained customer editing. This is deferred and not required for initial production.

The current architecture should avoid unnecessary barriers to a future editor by preserving:

- Stable component schemas
- Registered component metadata
- Explicit composition manifests
- Bounded props
- Clear preview and publication Gates

A visual editor, if adopted, must operate over registered components and allowed configurations. It must not become a route around tier limits, schema validation, security, or publication authority.

## 38. Repository audit questions

The later repository audit must determine:

1. Which frontend repositories and branches are intended as current.
2. Whether there is one platform or multiple divergent implementations.
3. Which components already exist and which are demonstrations only.
4. Whether component identifiers, schemas, and versions exist.
5. How Payload blocks currently map to frontend components.
6. Whether customer or demo content is embedded in source code.
7. Whether Tailwind, shadcn-derived components, and other libraries are governed consistently.
8. Whether sites share code safely or are copied into forks.
9. Whether design tokens are centralized or scattered.
10. Whether routing and tenant resolution prevent cross-site leakage.
11. Which components pass accessibility, responsive, visual, and performance tests.
12. Whether preview and production modes are isolated.
13. How builds, releases, migrations, and rollback currently work.
14. Which dependencies are stale, unlicensed, unnecessary, or insecure.
15. What can be retained, refactored, migrated, or retired.

The audit must compare implementation against this doctrine, not rewrite the doctrine to excuse every historical implementation choice.

## 39. Initial implementation sequence

A practical sequence is:

1. Inventory existing frontend code, Payload schemas, components, and sample sites.
2. Identify the smallest current platform foundation worth retaining.
3. Define Registry and Site Assembly Manifest schemas.
4. Normalize global primitives and semantic token contracts.
5. Register the minimum page-shell and system components.
6. Register a small set of high-value composed sections.
7. Map them explicitly to Payload schemas.
8. Build the deterministic resolver and manifest validator.
9. Create reference foundations for the first Vertical Kits and tiers.
10. Establish automated accessibility, visual, functional, and performance Gates.
11. Prove preview assembly, recycling, conversion, and migration paths.
12. Expand the Registry only when product demand and evidence justify it.

This sequence creates an operational production core before attempting a very large component catalog.

## 40. Acceptance criteria

This part of LiNKsites is adequately defined and implemented when:

1. Every automatically selectable component has a versioned Registry record.
2. Registered components have explicit CMS, token, responsive, accessibility, and compatibility contracts.
3. A site can be reconstructed from a pinned platform release, Site Assembly Manifest, governed content release, assets, and configuration references.
4. Site production normally composes approved capabilities rather than generating customer-specific application code.
5. AI recommendations are bounded, attributable, and deterministically validated.
6. Component, variant, tier, Vertical Kit, locale, and design-profile compatibility is machine-checkable.
7. Customer content does not reside in shared component source code.
8. Prospect and customer changes do not mutate reusable foundations or other sites.
9. Invalid CMS data, arbitrary scripts, arbitrary CSS, and unregistered components cannot pass publication Gates.
10. Open-source inputs are pinned, reviewed, internalized, licensed, and replaceable.
11. Visual, functional, responsive, accessibility, SEO, performance, and security evidence exists at the required level.
12. Component failures have defined fallback or publication-blocking behavior.
13. Releases, migrations, deprecations, suspension, and rollback are governed.
14. Shared frontend code preserves tenant isolation and correct cache boundaries.
15. The first supported Vertical Kits can produce varied sites without per-site code forks.
16. Unsold previews can be adapted or recycled through manifest and content changes at a fraction of a new build's cost.

## 41. Governing conclusion

LiNKsites should industrialize website construction without reducing it to a visually repetitive template service. The Component Registry makes reusable code legible, testable, and governable. The Design Intelligence Catalog supplies controlled visual language. Vertical Kits and tiers constrain product meaning. Payload supplies governed site content. The Site Assembly Manifest binds these inputs into a reconstructable result.

Deterministic assembly does not eliminate AI. It gives AI a productive boundary: reason over researched needs, recommend eligible compositions, transform content into schemas, and evaluate results while code and automation enforce contracts. This balance is the basis for autonomous, low-cost, scalable website production that can be maintained by a solo nontechnical owner with OpenClaw serving as an external oversight and intervention interface rather than a hidden runtime dependency.

---

**End of Section 07**

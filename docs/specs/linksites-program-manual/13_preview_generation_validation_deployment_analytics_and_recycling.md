# LiNKsites Program Manual

## Section 13 — Preview Generation, Validation, Deployment, Analytics, and Recycling

**Document set:** LiNKsites Program Manual  
**Section:** 13 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, LiNKsites product and engineering agents, frontend and deployment agents, QA agents, analytics implementers, Sales Program integrators, hosting operators, repository auditors, OpenClaw oversight designers, and future human collaborators  

---

## 1. Purpose of this section

This section defines the technical lifecycle that turns an approved Payload draft and Site Assembly Manifest into a controlled, sales-ready website preview.

It covers:

- Preview generation
- Preview release identity
- Route and access provisioning
- Deployment
- Functional, visual, responsive, accessibility, performance, and factual validation
- Evidence capture
- Preview-specific analytics
- Handoff to the LiNKtrend Sales Program
- Proof upgrades
- Holding and expiration
- Conversion locking
- Cleansing and recycling

Section 10 defines the commercial inventory model. This section defines how the corresponding preview objects are generated, certified, operated, and safely removed or reused.

## 2. Governing doctrine

1. **A preview is a versioned release, not a mutable URL.** The URL may remain stable, but each accepted content and frontend combination has a distinct release identity.
2. **The preview renders the real system.** It uses registered components, the actual frontend platform, the selected Payload draft, and the declared Site Assembly Manifest.
3. **Draft does not equal ready.** A Payload draft must pass rendering and quality Gates before Sales receives it.
4. **Proof level changes breadth, not essential safety.** Lower-cost previews may contain fewer pages or less media, but must not leak data, break on mobile, misroute forms, or present unsupported claims.
5. **Validation produces durable evidence.** An agent saying “looks good” is not a readiness receipt.
6. **Sales presentation is a commercial event.** A technical page view does not prove that the prospect saw the preview.
7. **Analytics is isolated by preview.** Preview events cannot contaminate production analytics or another prospect's opportunity.
8. **Expiration is an operating state.** Previews do not remain indefinitely accessible by accident.
9. **Conversion freezes the demonstrated release.** Customer finalization begins from the exact preview that was sold.
10. **Recycling requires cleansing proof.** Renaming a site or swapping the logo is insufficient.

## 3. Preview input package

Preview generation begins only when these inputs are available and valid:

- Preview ID
- Prospect and opportunity references
- Proof level and Proof Specification version
- Site Specification version
- Prospect Adaptation Contract version
- Foundation and reservation references
- Prospect Site Assembly Manifest
- Payload Draft Promotion Receipt
- Exact Payload draft release
- Site Design Profile
- Media and Provenance Manifest
- Preview Safety Profile
- Analytics Profile
- Quality Gate Profile
- Route and access policy
- Authorized budget and deadline

The generator must reject an input set whose versions, site identities, or checksums disagree.

## 4. Preview Release definition

A **Preview Release** is an immutable-in-effect record describing one deployable preview state.

```yaml
preview_release_id: stable-id
preview_id: stable-preview-id
release_number: monotonically-increasing-or-version
state: building-validating-ready-superseded-other
site_id: prospect-site-id
prospect_id: canonical-prospect-id
proof_level: 1-to-4
site_specification_id: specification-version
adaptation_contract_id: contract-version
foundation_id: foundation-version
site_assembly_manifest_id: manifest-version
payload_draft_release_id: draft-release-id
platform_release_id: frontend-release-id
design_profile_id: design-profile-version
asset_manifest_id: asset-manifest-version
preview_policy:
  access_profile: profile-version
  expiration_at: timestamp
  indexing_profile: profile-version
  form_profile: profile-version
analytics_profile_id: profile-version
quality_gate_profile_id: profile-version
deployment_target: target-reference
release_checksum: checksum
supersedes: optional-preview-release-id
```

Any meaningful content, component, design, configuration, platform, or access change produces a new release or an attributable policy update according to the change contract.

## 5. Stable preview identity versus release identity

The system distinguishes:

- **Preview ID:** the continuing technical preview object associated with one prospect and opportunity.
- **Preview Release ID:** one exact version of that preview.
- **Preview alias URL:** an optional stable URL that resolves to the current approved release.
- **Immutable release URL or release reference:** identifies the exact version for audit and conversion lock.

Sales may use the stable alias for convenience, but every presentation event records the release actually served.

An upgrade must not change the historical meaning of a prior presentation.

## 6. Preview generation definition

Preview generation constructs a deployable frontend result from:

- The pinned frontend platform release
- The prospect Site Assembly Manifest
- The exact Payload draft release
- The Site Design Profile
- The required assets
- Preview-only routing, forms, analytics, access, and indexing controls

It does not create a new application architecture for each prospect.

Generation may use static output, server rendering, incremental or on-demand rendering, or a controlled combination. The repository audit determines the exact mechanism. Regardless of mechanism, the release must be reproducible from pinned inputs.

## 7. Generation stages

1. Validate the complete input package.
2. Acquire a preview build or deployment lease.
3. Resolve site, release, and route identity.
4. Verify platform and component compatibility.
5. Retrieve the exact Payload draft content through an authorized preview interface.
6. Verify content and asset checksums.
7. Resolve design tokens and component variants.
8. Apply preview-only integration and analytics configuration.
9. Build or render the preview.
10. Provision the preview route.
11. Run smoke checks.
12. Execute the required validation matrix.
13. Capture artifacts and results.
14. Produce a readiness decision.
15. Release or compensate the build lease.

Stages may be retried idempotently. The generator must not silently switch to a newer Payload draft or platform release during a retry.

## 8. Preview environment isolation

The preview environment must isolate:

- Prospect content
- Assets
- Routing
- Analytics
- Form and action destinations
- Build cache
- Rendering cache
- Environment configuration
- Logs
- Access credentials

Isolation may be logical within a shared preview platform or physical for higher-risk work. The proof level alone does not permit unsafe sharing.

The environment must not have unrestricted access to Supabase working data or all Payload drafts.

## 9. Deployment topology

Initial previews may run on:

- A dedicated shared preview service
- A controlled preview allocation on the frontend platform
- A preview namespace on one or more VPS deployments
- Another tested deployment target compatible with the shared platform

Preview topology should optimize speed, cost, isolation, and operational simplicity. It does not need to match the final customer VPS region before a sale.

The Preview Release record must identify the actual target. Migration to customer production is a separate operation.

## 10. Route provisioning

A preview route should include:

- Stable preview identity
- Release resolution
- Site resolution
- TLS
- Access policy
- Expiration
- Indexing behavior
- Rate or abuse controls where needed
- Cache boundary
- Analytics identity

The route must fail closed when it cannot resolve a valid active release. It must not fall back to another prospect or a generic site silently.

## 11. Access modes

Supported policy-driven modes may include:

- Authenticated private preview
- Signed or time-limited access
- Unlisted controlled link
- Controlled public demonstration

The initial default should favor a controlled preview that Sales can use easily without making the site an accidental permanent public property. Final access and legal policy remains configurable.

Access mode must not be confused with search indexing. A technically reachable link can still carry indexing controls.

## 12. Expiration

Every preview has:

- Created time
- Ready time
- Presentation status
- Default expiration
- Optional hold expiration
- Last validated time
- Serving state
- Revalidation or refresh due time

Expiration behavior may:

- Disable access
- Show a neutral expired state
- Redirect to a controlled LiNKtrend route
- Preserve a private snapshot for evidence
- Trigger Sales disposition and recycling Issues

The chosen behavior must not expose obsolete prospect content indefinitely.

## 13. Preview-only integration behavior

A preview should demonstrate conversion value without pretending unconfigured systems are live.

Examples:

- A verified public telephone action may call the prospect's published number.
- A verified existing booking link may open the existing destination.
- A demonstration form may submit only to a controlled LiNKtrend test sink or not transmit personal data.
- An unconfigured newsletter form may demonstrate visual behavior but remain disabled or clearly controlled.
- A map may use verified location evidence or a safe fallback.

Every action has a preview behavior, production behavior, and replacement requirement.

## 14. Indexing and crawler behavior

Preview policy should normally prevent an unapproved prospect site from competing with or being mistaken for the business's official website. Controls may include:

- Response metadata
- Robots directives
- Authentication
- Signed access
- Sitemap exclusion
- Canonical behavior
- Route expiration

The exact policy is finalized later with legal and Sales considerations. Validation must confirm that the configured behavior is actually present.

## 15. Quality Gate Profile

Each Proof Specification references a Quality Gate Profile. The profile defines:

- Required Gate suites
- Required routes
- Viewport and browser matrix
- Locale matrix
- Test fixtures
- Thresholds
- Severity classes
- Allowed waivers
- Evidence retention
- Recheck policy

Levels 1 through 4 may differ in the number of pages, scenarios, media, and devices tested. Critical isolation, route, factual, access, and action-safety checks remain mandatory.

## 16. Preflight validation

Before browser testing, deterministic checks should verify:

- Release manifest completeness
- Matching site and prospect identity
- Payload draft release availability
- Component and platform compatibility
- Asset availability and checksums
- Environment variables and secret references
- Route uniqueness
- Analytics uniqueness
- Form destination policy
- Placeholder classification
- Required production-replacement list
- Expiration configuration

Preflight failure prevents deployment or routes it to an isolated diagnostic target.

## 17. Schema and content validation

Validate:

- Required pages and sections
- Payload-to-component mapping
- Required content slots
- Field types and lengths
- Locale completeness
- Links and relationship references
- Media roles
- Structured data
- Metadata
- Draft status
- Site Specification conformance

The renderer must not quietly omit a required section because a content query failed.

## 18. Factual and provenance validation

The release should verify that:

- Material claims retain evidence references
- High-risk claims have the required status
- Conflicted or stale values follow the approved treatment
- Preview-only provisional content is classified
- Media source and status are present
- Production replacement requirements are listed
- No withdrawn or quarantined asset is included

This Gate evaluates the assembled release, not only the source package, because mapping or rendering can introduce errors.

## 19. Prospect-leakage validation

Leakage testing must search visible and hidden outputs for prior or unrelated prospect data.

Inspect:

- Page text
- HTML and rendered accessibility tree
- Metadata
- Structured data
- Alt text and captions
- Asset names and metadata
- Links and telephone URIs
- Forms and destinations
- Analytics and tracking identifiers
- Network requests
- Payload document relationships
- Route and cache keys
- Screenshots and generated artifacts
- Source maps or error messages where publicly accessible

Known prior identities associated with the foundation's lineage should form part of the test fixture.

Any confirmed cross-prospect data is a critical failure.

## 20. Functional validation

Functional tests should cover applicable behavior such as:

- Route resolution
- Navigation
- Internal and external links
- Telephone, email, map, booking, and messaging actions
- Forms and validation
- Locale switch
- Accordions, tabs, dialogs, galleries, and menus
- Video and media fallback
- Error and not-found behavior
- Cookie or consent surface where configured
- Preview access and expiry
- Analytics event emission

Critical journeys should be exercised end to end. A button's presence is not proof that its destination is safe and functional.

## 21. Responsive validation

The viewport matrix should represent supported mobile, tablet, desktop, and relevant extreme content conditions.

Checks include:

- Overflow
- Navigation collapse
- Text wrapping
- Touch targets
- Media crops
- Sticky or fixed elements
- Form usability
- Horizontal scrolling
- Grid reflow
- Readable line length
- Locale-specific expansion
- Reduced viewport height

Exact viewport values are versioned test configuration, not permanent doctrine.

## 22. Browser validation

The supported browser matrix is defined by product and quality policy. Automated browser testing should use pinned browser and test-runner versions so evidence remains interpretable.

The matrix may be broader for paid production than for lower proof levels, but the preview must be tested in the primary environment through which Sales and prospects will see it.

Browser differences that affect layout, forms, navigation, or media are defects even if the build succeeds.

## 23. Visual validation

Visual validation has three layers.

### 23.1 Deterministic rendering evidence

Capture full-page and component screenshots at defined routes, viewports, locales, and states.

### 23.2 Visual regression

Compare against expected foundation or component states where a valid baseline exists. Differences are classified, not automatically accepted.

### 23.3 Rubric-based quality evaluation

A vision model, design agent, or authorized human evaluates:

- Hierarchy
- Alignment
- Spacing
- Typography
- Image fit
- Brand and vertical suitability
- Consistency
- Readability
- Conversion clarity
- Obvious generation artifacts
- Excessive similarity to another campaign preview

The evaluator uses a versioned rubric and produces reasoned findings tied to screenshots.

## 24. Visual baseline policy

Baselines may exist at:

- Component version
- Foundation version
- Design profile
- Preview release

A changed prospect photo or business name naturally changes pixels. The test system should distinguish expected content variation from structural regression through masks, regions, semantic checks, or appropriate review.

Baselines update only after an intentional-change receipt.

## 25. Accessibility validation

Validation includes:

- Automated accessibility checks
- Heading and landmark structure
- Keyboard traversal
- Visible focus
- Accessible names
- Form labels and errors
- Image alternative behavior
- Color contrast
- Reduced-motion behavior
- Dialog and menu focus management
- Link and action clarity

Automated tools do not prove full accessibility. Complex interactions require rubric-based or manual verification during capability admission and when a preview materially changes their use.

## 26. Performance validation

Performance evidence may include:

- Server response behavior
- Rendering milestones
- Layout stability
- Interaction responsiveness
- JavaScript weight
- Image and video weight
- Font loading
- Third-party requests
- Cache behavior
- Error and timeout rates

Thresholds vary by route, component mix, proof level, and hosting target. A lower proof level may test fewer routes but may not ignore a severely unusable homepage.

Test conditions, location, device profile, and tool version must be recorded.

## 27. SEO and metadata validation

Even when indexing is disabled, the preview should validate production-shaped metadata:

- Title and description
- Heading hierarchy
- Canonical and locale behavior according to preview policy
- Social preview metadata
- Structured data validity
- Sitemap exclusion or inclusion policy
- Robots behavior
- Image alternative text
- Internal link structure

The Gate must distinguish “metadata is technically valid” from “the preview is authorized to be indexed.”

## 28. Security and privacy validation

Check for:

- Exposed secrets or environment values
- Unintended source maps or diagnostics
- Unsafe external scripts
- Mixed content
- Unauthorized draft access
- Route enumeration risk according to policy
- Cross-site API access
- Unscoped caches
- Uncontrolled form submission
- Personal data in logs
- Incorrect security headers according to the deployment profile

Full security architecture is defined in Section 18. Preview readiness includes the controls necessary for safe Sales use.

## 29. Validation severity

Findings should be classified, for example:

- **Critical:** leakage, secret exposure, wrong prospect, unsafe form destination, unauthorized draft access, severe factual misrepresentation
- **High:** broken primary action, inaccessible core navigation, missing required page, severe mobile failure
- **Medium:** significant visual defect, performance regression, incomplete optional content, secondary action failure
- **Low:** cosmetic or non-blocking improvement
- **Advisory:** opportunity for later refinement

The Gate Profile defines which severities block readiness. Critical findings always block.

## 30. Waivers

A waiver is a versioned authority record, not a comment saying “acceptable for now.”

It identifies:

- Finding
- Reason
- Proof level and Sales need
- Risk
- Compensating control
- Approver
- Expiration
- Production replacement requirement

Waivers cannot authorize cross-prospect leakage, secret exposure, or an invalid site identity.

## 31. Test evidence package

The release evidence package should contain:

- Test plan and Gate Profile
- Tool and browser versions
- Routes, viewports, and locales
- Results and timings
- Screenshots
- Network or console findings where relevant
- Accessibility results
- Performance results
- Visual evaluation
- Factual/provenance receipt
- Leakage scan receipt
- Waivers
- Final readiness decision

Artifacts receive stable storage references, checksums, and retention classes.

## 32. Flaky test control

Unreliable tests can either block valid previews repeatedly or allow teams to ignore failures.

The system should:

- Record retry count
- Distinguish infrastructure failure from product failure
- Quarantine persistently flaky tests without silently removing required coverage
- Preserve first and retry results
- Investigate nondeterministic data, timing, animation, network, or cache behavior
- Require an alternate check when a critical test is temporarily quarantined

Retries must not continue indefinitely or hide a real failure.

## 33. Readiness decision

A preview may become `ready_for_sales` only when:

- The deployed route resolves correctly
- The exact release identity is verified
- Mandatory Gates pass
- Allowed waivers are current
- Access and expiration are configured
- Safe action behavior is verified
- Analytics identity is verified
- Known limitations and production-replacement items are complete
- Preview Ready Package is created

Readiness applies to one Preview Release. A new release requires revalidation proportionate to the change.

## 34. Preview Ready Package

The package delivered to Sales includes:

- Preview and release IDs
- Prospect and Odoo opportunity references
- URL and access instructions
- Proof level
- Recommended product/tier
- What has been built
- What is not yet built
- Preview-only behavior
- Provisional content and assets
- Production replacement or confirmation requirements
- Approved Sales talking points
- Expiration
- Screenshot or presentation assets
- Analytics reference
- Cost summary
- Readiness receipt
- Exception contact path

Sales must acknowledge the package through a durable handoff event.

## 35. Presentation evidence

Sales records presentation through a contract containing:

- Opportunity ID
- Preview Release ID
- Presentation time
- Channel
- Sales executor or human actor
- Recipient identity reference where appropriate
- Follow-up action

LiNKsites does not infer presentation from a link request, browser visit, automated scan, or Sales agent opening the preview.

## 36. Analytics objectives

Preview analytics exists to answer bounded questions:

- Was the preview accessed after presentation?
- Did the prospect return?
- Which pages or sections received attention?
- Were primary calls to action used?
- Did the preview produce a meaningful signal for follow-up or upgrade?
- Did technical errors interfere?

Analytics does not by itself prove purchase intent, attribution, or the cause of a sale.

## 37. Analytics event envelope

```yaml
event_id: unique-id
schema_version: version
event_name: governed-name
occurred_at: timestamp
preview_id: preview-id
preview_release_id: release-id
site_id: prospect-site-id
opportunity_ref: sales-reference
session_or_visitor_ref: policy-controlled-reference
page_or_component_ref: reference
action_ref: optional-action
source_class: prospect-sales-qa-monitor-bot-unknown
technical_context:
  viewport_class: optional-value
  locale: optional-value
  deployment_target: target
consent_or_policy_state: policy-reference
correlation_id: optional-id
```

The exact personal-data and consent policy is finalized later. The schema must support minimization and deletion or retention controls.

## 38. Event taxonomy

Useful normalized events may include:

- Preview opened
- Page viewed
- Section viewed
- Primary action selected
- Telephone action selected
- Booking or map link selected
- Video played
- Gallery interacted
- Demonstration form started
- Demonstration form completed safely
- Locale changed
- Client error
- Performance threshold exceeded
- Access denied or expired

Names and properties are versioned. Components emit standard events rather than inventing a different taxonomy per site.

## 39. Technical traffic filtering

Analytics must distinguish, where reasonably possible:

- QA automation
- Health checks
- Screenshot services
- Sales staff
- OpenClaw or agent access
- Crawlers and bots
- Prospect or unknown external activity

Internal traffic should use explicit markers or controlled identities rather than only IP-address guesses.

Unknown traffic remains classified as unknown. It must not automatically become a prospect engagement signal.

## 40. Engagement signal processing

Raw events may be transformed into bounded signals such as:

- First external access after presentation
- Return session
- Primary action interaction
- Multiple-page exploration
- Repeated access across a time window
- Prospect-reported request

The signal record preserves the supporting events and confidence.

Sales decides whether to follow up or request a proof upgrade. LiNKsites may recommend an upgrade based on evidence but cannot authorize commercial spending itself.

## 41. Proof upgrades

An upgrade creates:

- New Sales authorization
- New Proof Specification reference
- Updated Site Specification
- Updated Prospect Adaptation Contract
- New working and Payload draft versions
- New Preview Release
- Incremental validation
- Updated Ready Package

The prior Preview Release remains attributable to any earlier Sales presentation.

The stable alias may move to the new release only after readiness and Sales handoff.

## 42. Holding and refresh

A held preview may require refresh before reuse in Sales if:

- Research facts may have changed
- Access or certificates changed
- Platform release changed
- Draft or assets became stale
- An integration changed
- The hold exceeded the Gate Profile's validation window

The system may perform a targeted refresh rather than rebuild everything. The refresh produces a new release or a revalidation receipt according to change policy.

## 43. Conversion lock

On a valid Sales conversion event tied to Stripe-confirmed payment and Odoo commercial state, LiNKsites must:

1. Identify the exact presented or accepted Preview Release.
2. Prevent recycling or incompatible updates.
3. Preserve the Payload draft, manifests, assets, evidence, and limitations.
4. Create a Customer Site Instance lineage reference.
5. Route all production-replacement and confirmation requirements to customer finalization.

The preview may remain available according to policy while finalization occurs, but it does not become production merely because it is locked.

## 44. Expiration and retirement

When a preview expires without conversion:

- Serving changes according to policy.
- Analytics closes or changes state.
- Sales receives an expiration event.
- The opportunity's authorized disposition is requested or applied.
- Preview-specific resources are identified for release.
- Recycling, hold, or retirement work is scheduled.

Historical evidence and cost records remain under retention policy even if the active route is removed.

## 45. Recycling authorization

Recycling requires:

- Sales outcome or policy authority
- Confirmation that no paid finalization or active presentation depends on the release
- Current preview and foundation state
- Retention and rights policy
- Defined technical target: return foundation, create new foundation version, repair, refresh, deprecate, or retire

No executor may recycle a preview solely because it has not observed traffic.

## 46. Technical cleansing workflow

1. Freeze the preview release and outcome evidence.
2. Disable or isolate the active route.
3. Inventory all prospect-scoped content, assets, configuration, analytics, forms, logs, and artifacts.
4. Classify reusable general improvements.
5. Remove or isolate prospect identity and restricted material.
6. Restore neutral fixture content and configuration.
7. Reset routes, analytics, forms, and integration references.
8. Purge or invalidate prospect-specific caches.
9. Rebuild the neutral foundation release.
10. Run the Cleansing Gate.
11. Recalculate cost, residual value, and adaptation profile.
12. Produce a Recycle Receipt.
13. Return the foundation to inventory or route it to another lifecycle state.

Removal behavior must follow final retention policy, but reusable output must be clean.

## 47. Cleansing test matrix

Search for the prospect's:

- Business and legal names
- Aliases
- Telephone and email
- Address and coordinates
- Domain and social links
- Logo and brand marks
- Staff names
- Customer-specific services, prices, and claims
- Asset checksums and filenames
- Analytics identifiers
- Form destinations
- Metadata and structured-data identifiers
- Preview route
- Cache tags and build variables

Also search for earlier prospects in the foundation's lineage. A clean current prospect does not prove the foundation was cleansed from all older adaptations.

## 48. General improvement promotion

An adaptation may reveal a useful improvement such as:

- Better component variant
- Corrected accessibility behavior
- More flexible content schema
- Improved test
- New neutral media derivative
- Better foundation composition

The improvement must enter the appropriate Component Registry, Design Catalog, Vertical Kit, schema, or foundation lifecycle. It is not extracted by copying the entire prospect branch into the reusable base.

## 49. Recycle Receipt

```yaml
recycle_receipt_id: stable-id
preview_id: preview-id
final_preview_release_id: release-id
sales_outcome_ref: outcome-reference
route_disposition: disabled-archived-other
prospect_items_dispositioned: []
general_improvements_promoted: []
cleansed_foundation_id: foundation-version
cleansing_gate_receipts: []
cache_and_analytics_disposition: records
cost_summary: record
residual_value_estimate: record
inventory_target_state: available-repair-refresh-deprecated-retired
completed_at: timestamp
executor_run_ids: []
```

## 50. Failure and recovery

### 50.1 Build failure

Retry only after classifying dependency, source, or code failure. Preserve logs and do not change pinned inputs silently.

### 50.2 Route conflict

Fail closed and resolve ownership. Never overwrite another preview route.

### 50.3 Draft changed during validation

Invalidate or pause the validation run and create a release from the new exact draft.

### 50.4 Analytics misconfiguration

Block readiness if events would be attributed to another prospect or customer. A missing optional engagement event may follow the Gate Profile.

### 50.5 Validation infrastructure failure

Distinguish unavailable tooling from a passing product. Required tests remain pending or use an approved alternate path.

### 50.6 Cleansing failure

Quarantine the foundation and prevent inventory admission until corrected.

## 51. Idempotency and concurrency

Preview generation and recycling require:

- Unique request and release keys
- Build/deployment leases
- Expected current release checks
- Stable route ownership
- Immutable input references
- Idempotent route and analytics provisioning
- Foundation reservation checks
- Conversion/recycle mutual exclusion

A conversion lock must win over a later stale recycle command. Conflicting commands create an exception rather than applying last-write-wins.

## 52. Cost accounting

Track:

- Build compute
- Deployment provisioning
- Browser test time
- Screenshot and visual-evaluation cost
- Accessibility and performance test cost
- Analytics infrastructure
- Preview hosting duration
- Upgrade cost
- Revalidation cost
- Cleansing and recycling cost
- Failed Run and intervention cost

Costs reference preview, release, proof level, foundation, Issues, Runs, and executor types.

## 53. Autonomous operation and OpenClaw

Routine operations should be autonomous:

- Generate release
- Provision route
- Deploy
- Validate
- Capture evidence
- Produce Ready Package
- Emit analytics
- Expire
- Apply authorized hold
- Lock conversion
- Cleanse and recycle
- Quarantine failures

OpenClaw may act as the solo owner's operational interface for repeated failures, unclear waivers, suspicious analytics, high-cost rework, conversion/recycle conflicts, or other exceptions. The preview continues to render and expire according to system policy without OpenClaw.

## 54. Observability

Measure:

- Generation queue and duration
- Build success
- Deployment success
- Route and TLS status
- Gate pass and failure by category
- Test flakiness
- Release readiness time
- Preview availability
- Access denial and expiration
- Analytics delivery
- Release-to-event mismatch
- Upgrade and hold state
- Recycling duration
- Cleansing failure
- Cost by proof level and release

Every signal should include preview, release, site, platform, deployment target, and correlation identifiers.

## 55. Repository audit questions

The later audit must determine:

1. How previews are currently built and hosted.
2. Whether previews render Payload drafts or copied static content.
3. Whether exact Payload and frontend versions are pinned.
4. Whether preview ID and release ID are separate.
5. Whether stable URLs can identify the exact release presented.
6. Whether routes, caches, forms, analytics, and access are isolated.
7. Whether preview deployment shares unsafe credentials with production.
8. Which browser, visual, accessibility, performance, and leakage tests exist.
9. Whether test evidence is durable and associated with a release.
10. Whether internal QA traffic contaminates engagement.
11. Whether Sales presentation is a real event or inferred from visits.
12. Whether preview expiration is implemented.
13. Whether upgrades create versioned contracts and releases.
14. Whether conversion locks the exact release.
15. Whether recycling removes prospect data from content, media, metadata, analytics, forms, routes, and caches.
16. Whether a Recycle Receipt exists.
17. Whether general improvements are promoted safely.
18. Whether costs are tracked by release and Gate.
19. Whether OpenClaw is incorrectly required by the serving path.
20. Which existing preview tooling should be retained, normalized, or replaced.

## 56. Initial implementation sequence

1. Define Preview, Preview Release, Deployment, Gate Profile, Evidence Package, Analytics Profile, Presentation Event, and Recycle Receipt schemas.
2. Implement exact draft and Site Assembly Manifest resolution.
3. Implement isolated build/deployment leases and route ownership.
4. Implement preview access, expiration, indexing, form, and analytics policies.
5. Build deterministic preflight, schema, leakage, link, and action checks.
6. Build browser, responsive, screenshot, accessibility, performance, and metadata suites.
7. Add rubric-based visual review and evidence storage.
8. Implement readiness decision and Sales handoff acknowledgement.
9. Implement preview-specific analytics and internal-traffic classification.
10. Implement upgrade, hold, expiration, and revalidation workflows.
11. Implement conversion/recycle mutual exclusion and conversion lock.
12. Implement full cleansing and cache invalidation.
13. Prove a Level 1 preview, higher-level upgrade, conversion lock, and unsold recycling path.
14. Load test the preview service independently from customer production.

## 57. Decisions intentionally still open

This section does not finalize:

- Preview hosting provider or exact VPS placement
- Static versus server-rendered preview mix
- Final public, unlisted, signed, or authenticated access defaults
- Expiration and hold periods
- Final indexing policy
- Analytics provider
- Personal-data, cookie, and consent rules
- Exact browser and viewport matrix
- Exact performance thresholds
- Exact test-retention periods
- Exact waiver authorities
- Maximum retry counts
- Screenshot storage provider
- Exact Sales engagement scoring

These are configurable technical, commercial, operational, and legal decisions to resolve during implementation and later policy work.

## 58. Acceptance criteria

This part of LiNKsites is adequately defined and implemented when:

1. Every preview release pins the exact Site Specification, foundation, assembly manifest, Payload draft, platform release, design profile, assets, and policies.
2. A stable preview URL cannot erase the identity of the release actually presented.
3. Generation retries do not switch inputs silently.
4. Preview routes, content, assets, analytics, forms, caches, and credentials are isolated.
5. Payload draft promotion does not make a preview Sales-ready without release validation.
6. Levels 1 through 4 all receive critical safety, identity, leakage, access, and action checks.
7. Schema, factual, provenance, functional, responsive, visual, accessibility, performance, SEO, and security evidence is attributable to a release.
8. Visual review uses screenshots and a versioned rubric.
9. Test retries and flaky tests cannot silently turn failure into success.
10. Waivers have authority, scope, compensating controls, expiration, and production implications.
11. The Ready Package makes preview limitations and production replacements clear to Sales.
12. Sales presentation is an explicit event tied to a release.
13. Technical and internal traffic is distinguishable from prospect engagement where possible.
14. Analytics events are preview-specific and cannot contaminate production or other prospects.
15. Proof upgrades create new authority, specifications, drafts, releases, and evidence.
16. Expired previews stop serving or change state according to explicit policy.
17. Conversion locks the exact preview without bypassing finalization.
18. Recycling requires Sales or policy authority and cannot conflict with conversion.
19. Cleansing covers visible content, hidden metadata, assets, analytics, forms, routes, caches, and prior lineage identities.
20. A foundation cannot re-enter inventory without a Recycle Receipt and Cleansing Gate.
21. Routine generation, validation, expiry, and recycling can operate autonomously.
22. OpenClaw supports exceptions without becoming a serving dependency.

## 59. Governing conclusion

A LiNKsites preview is not merely a development build. It is a controlled sales product with an exact identity, purpose, cost, access policy, evidence package, and end-of-life path.

The factory takes an approved Payload draft and deterministic assembly manifest, creates an isolated release, deploys it through a controlled route, and proves that the result works across the required visitor journeys and environments. Sales receives the website only after the release is factual enough for its intended proof, visually credible, mobile-usable, accessible to the required degree, technically safe, and free from another prospect's data.

After presentation, analytics provides bounded evidence without becoming the commercial authority. Engagement can justify a newly authorized proof upgrade. Verified purchase locks the exact release for customer finalization. Non-purchase eventually triggers expiration and a rigorous cleansing workflow that preserves general value while removing prospect-specific content, configuration, and traces.

This lifecycle is what makes build-first selling scalable: LiNKsites can produce real proof quickly, understand exactly what was shown, recover from defects, measure engagement and cost, and reuse unsold work without sacrificing isolation or trust.

---

**End of Section 13**

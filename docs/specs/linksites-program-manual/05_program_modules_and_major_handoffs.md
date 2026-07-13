# LiNKsites Program Manual

## Section 05 — Program Decomposition into Modules and Major Handoffs

**Document set:** LiNKsites Program Manual  
**Section:** 05 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, product and engineering agents, repository auditors, implementation agents, Program architects, operators, OpenClaw overseers, and future human collaborators  

---

## 1. Purpose of this section

This section decomposes LiNKsites into its major Modules. It is the authoritative high-level operational map of the Program.

LiNKsites is one Program. It is not divided into separate “asset,” “sales,” “website,” and “hosting” Programs. Its internal Modules collectively perform the website factory's responsibility: preparing reusable production capability, creating prospect previews, converting paid orders into launched sites, and operating those sites as managed services.

The shared LiNKtrend Sales Program remains a separate Program. It requests previews, sells the product, processes commercial lifecycle events, and sends paid activation instructions. LiNKsites does not absorb those responsibilities merely because it must respond to their outcomes.

This section defines:

- Module purposes
- Principal inputs and outputs
- Definitions of done
- Dependencies
- Major Gates
- Continuous versus request-driven behavior
- Cross-Module and cross-Program handoffs

Later sections break Modules into Stages, Issues, Runs, executor contracts, data schemas, and technical implementation.

## 2. Program hierarchy

The structural hierarchy is:

```text
LiNKsites Program
└── Module
    └── Stage
        └── Issue
            └── Run
```

Modules describe stable capability boundaries. Their implementation may evolve, but a Module should exist because it owns a coherent result and Definition of Done—not merely because a current repository happens to contain a folder with the same name.

## 3. Module classes

LiNKsites Modules fall into five operational classes.

### 3.1 Product and capability Modules

These create and govern what LiNKsites is capable of producing:

- M01 Product and Tier Governance
- M02 Design Intelligence Operations
- M03 Component and Frontend Platform Operations
- M04 Vertical Kit Operations
- M05 Reusable Site Foundation Production

### 3.2 Preview-production Modules

These turn Sales requests into website proof:

- M06 Preview Inventory Management
- M07 Preview Request Intake and Planning
- M08 Prospect Site Adaptation
- M09 Content and Media Production
- M10 Working-to-Payload Promotion
- M11 Preview Deployment and Validation
- M12 Preview Outcome, Upgrade, and Recycling

### 3.3 Paid-fulfilment Modules

These turn a verified order into a live customer site:

- M13 Paid-Order Intake and Customer Finalization
- M14 Production Publication and Launch Certification
- M15 Domain, DNS, TLS, and Hosting Provisioning

### 3.4 Managed-service Modules

These operate the customer service after launch:

- M16 Site Operations, Monitoring, and Recovery
- M17 Customer Changes and Service Evolution
- M18 Capacity, Regional Placement, and Infrastructure Scaling
- M19 Suspension, Export, Termination, and Decommissioning

### 3.5 Control and improvement Modules

These govern execution and improve the Program:

- M20 Quality, Cost, Performance, and Program Improvement

These twenty Modules form one integrated Program. They are not twenty independent products and not twenty user-facing departments.

## 4. High-level flow

The primary flows are:

### 4.1 Reusable capability flow

```text
M01 Product/Tier Governance
→ M02 Design Intelligence
→ M03 Components/Platform
→ M04 Vertical Kits
→ M05 Reusable Foundations
→ M06 Preview Inventory
```

These Modules may operate iteratively and in parallel where contracts allow. For example, an existing active Vertical Kit may continue using the current component registry while a future component version is being validated.

### 4.2 Prospect-preview flow

```text
Sales Preview Request
→ M07 Intake and Planning
→ M06 Inventory Match
→ M08 Prospect Adaptation
↔ M09 Content and Media
→ M10 Payload Draft Promotion
→ M11 Preview Deployment and Validation
→ Preview Ready Package to Sales
→ M12 Outcome, Upgrade, Hold, Recycle, or Conversion
```

### 4.3 Paid-customer flow

```text
Sales Paid Activation Package
→ M13 Customer Finalization
→ M10 Final Draft Promotion
→ M14 Publication and Launch Certification
↔ M15 Domain/Hosting Provisioning
→ Active Managed Site
```

### 4.4 Managed-service flow

```text
Active Site
→ M16 Continuous Operations
↔ M17 Authorized Changes
↔ M18 Capacity and Regional Placement
→ M19 Suspension/Termination when instructed
```

### 4.5 Improvement flow

```text
All Modules emit quality, cost, usage, failure, and outcome evidence
→ M20 evaluates
→ approved improvements enter M01–M05, executor, Gate, or infrastructure revisions
```

## 5. M01 — Product and Tier Governance

### 5.1 Purpose

Define the products LiNKsites can reliably sell and operate. This Module prevents Sales or an executor from inventing unsupported capabilities, tiers, entitlements, or delivery promises.

### 5.2 Primary inputs

- Approved business strategy
- Current technical capability
- Vertical and customer evidence
- Cost and capacity data
- Quality and incident history
- Existing Odoo product references
- Approved commercial decisions
- Regulatory or policy configuration when finalized

### 5.3 Core responsibilities

- Define Product Specifications
- Define Tier Specifications
- Define supported options and add-ons
- Define qualification signals and disqualifiers
- Define required customer inputs
- Define preview-level eligibility
- Define fulfilment and hosting classes
- Define change, support, backup, and recovery entitlements
- Define product lifecycle states
- Publish approved product capability to the shared Product Catalog

### 5.4 Outputs

- Versioned Website Product Definition Package
- Tier Specifications
- Entitlement rules
- Product compatibility matrix
- Active/retired product registry
- Sales knowledge and approved capability statements

### 5.5 Definition of Done

A product or tier is done when its specification, constraints, required inputs, quality requirements, fulfilment behavior, hosting characteristics, and Product Catalog representation are versioned, validated, approved, and technically implementable.

### 5.6 Major Gates

- Product completeness Gate
- Technical feasibility Gate
- Cost/capacity policy Gate
- Catalog publication approval Gate

## 6. M02 — Design Intelligence Operations

### 6.1 Purpose

Maintain the governed visual intelligence from which deterministic and AI-assisted design decisions are made.

### 6.2 Primary inputs

- Reviewed open-source design resources
- UI UX Pro Max data and future approved expansions
- Existing LiNKsites design assets
- Brand and vertical design research
- Accessibility and usability requirements
- Performance and conversion evidence
- Component compatibility information

### 6.3 Core responsibilities

- Maintain approved style taxonomy
- Maintain color palette catalog
- Maintain font-pairing catalog
- Define design tokens and allowed ranges
- Define compatibility and exclusion rules
- Map styles to verticals, audiences, and tiers
- Record source, license, review status, and version
- Retire unsafe, poor-performing, stale, or incompatible combinations
- Provide machine-readable design-selection inputs

### 6.4 Outputs

- Versioned Design Intelligence Catalog
- Token sets and constraints
- Style/vertical/tier compatibility matrix
- Design-selection rules
- Design evaluation rubrics

### 6.5 Definition of Done

A design-intelligence version is done when its sources and rights are recorded, tokens validate, combinations are compatible with approved components, accessibility constraints are satisfied, and automatic selection is safe within its declared scope.

### 6.6 Major Gates

- Provenance/license Gate
- Token/schema Gate
- Accessibility compatibility Gate
- Component compatibility Gate
- Production approval Gate

## 7. M03 — Component and Frontend Platform Operations

### 7.1 Purpose

Maintain the shared frontend platform, component registry, PageRenderer behavior, and reusable blocks from which sites are assembled.

### 7.2 Primary inputs

- Existing Next.js/Tailwind/shadcn code
- Existing Payload blocks and PageRenderer
- Approved open-source components
- Design token contracts
- Tier requirements
- Defect, performance, and accessibility evidence
- Framework and dependency updates

### 7.3 Core responsibilities

- Audit and govern components
- Maintain component registry and versions
- Define block schemas and variants
- Maintain frontend rendering contracts
- Internalize approved external components where justified
- Test component combinations
- Maintain responsive behavior
- Maintain accessibility and performance baselines
- Control deprecation and migration
- Preserve compatibility with possible future visual editing where practical

### 7.4 Outputs

- Approved component registry
- Frontend platform release
- Payload block mappings
- Component documentation and tests
- Compatibility matrix
- Migration plans for deprecated versions

### 7.5 Definition of Done

A platform release is done when approved blocks render correctly from validated Payload content, required tests pass, version and migration behavior are known, and deployment/rollback evidence exists.

### 7.6 Major Gates

- Type/schema Gate
- Unit/integration test Gate
- Visual-regression Gate
- Accessibility Gate
- Performance Gate
- Security/dependency Gate
- Release readiness Gate

## 8. M04 — Vertical Kit Operations

### 8.1 Purpose

Convert knowledge about an SMB vertical into a reusable production kit that guides page structure, content patterns, calls to action, imagery, integrations, and design selection.

### 8.2 Primary inputs

- Approved target vertical
- Market and customer research
- Sales pain and conversion evidence
- Product and Tier Specifications
- Design Intelligence Catalog
- Component registry
- Content and media capabilities

### 8.3 Core responsibilities

- Define vertical and subvertical scope
- Define typical visitor needs and conversion paths
- Define page and section patterns
- Define service and content schemas
- Define suitable design families
- Define required and optional integrations
- Define media patterns
- Define tier variations
- Produce evaluation fixtures and test businesses
- Measure kit performance and freshness

### 8.4 Outputs

- Versioned Vertical Kit
- Tier-specific kit variants
- Content schemas and patterns
- Component and design constraints
- Test fixtures
- Foundation-production requirements

### 8.5 Definition of Done

A Vertical Kit is done when it can drive repeatable production for representative SMBs without fabricating business-specific facts, and when its structure, design compatibility, content patterns, and tests pass the pilot-readiness Gate.

### 8.6 Major Gates

- Research sufficiency Gate
- Product compatibility Gate
- Content/factual-safety Gate
- Design and component compatibility Gate
- Pilot readiness Gate
- Active production Gate

## 9. M05 — Reusable Site Foundation Production

### 9.1 Purpose

Produce high-quality, versioned reusable foundations that can be adapted rapidly for multiple prospects and customers.

### 9.2 Primary inputs

- Active Vertical Kit
- Tier Specification
- Approved design token set
- Approved components and blocks
- Generic/licensed media patterns
- Conversion and content structures
- Foundation production authorization or inventory target

### 9.3 Core responsibilities

- Assemble page and component structure
- Apply approved design system
- Configure CMS mapping
- Create generic content patterns without prospect identity
- Register reusable media
- Produce technical and presentation previews
- Test performance, accessibility, visual quality, and reuse safety
- Measure production cost
- Version and publish to Preview Inventory

### 9.4 Outputs

- Reusable Site Foundation Package
- Foundation manifest
- Supported vertical/tier/style metadata
- Adaptation contract
- Quality proof
- Cost baseline
- Inventory record

### 9.5 Definition of Done

A foundation is done when it is prospect-neutral, safely reusable, technically valid, visually approved, mapped to Payload/frontends, costed, versioned, and eligible for matching.

### 9.6 Major Gates

- Reuse-neutrality Gate
- Design-quality Gate
- Technical-quality Gate
- CMS mapping Gate
- Cost/provenance Gate
- Inventory admission Gate

## 10. M06 — Preview Inventory Management

### 10.1 Purpose

Operate reusable foundations and prospect-preview assets as measurable sales inventory.

### 10.2 Primary inputs

- New foundation packages
- Preview requests
- Current reservations and assignments
- Adaptation and upgrade costs
- Engagement and Sales outcome events
- Quality/freshness status
- Rejection and conversion evidence

### 10.3 Core responsibilities

- Register and classify foundations
- Rank foundations for preview requests
- Reserve and release inventory
- Track assignments and derived adaptations
- Track initial, adaptation, and upgrade cost
- Track engagement and conversion history
- Detect refresh, repair, or retirement need
- Prevent incompatible or restricted reuse
- Return cleansed foundations to availability

### 10.4 Outputs

- Foundation Match Proposal
- Reservation receipt
- Inventory state updates
- Reuse and cost records
- Refresh/repair/retire requests

### 10.5 Definition of Done

Inventory action is done when the selected or returned foundation has a valid state, no conflicting reservation, known version, known reuse restrictions, current quality status, and complete cost/lineage record.

### 10.6 Major Gates

- Match eligibility Gate
- Reservation concurrency Gate
- Reuse-rights Gate
- Cleansing Gate
- Return-to-inventory Gate

## 11. M07 — Preview Request Intake and Planning

### 11.1 Purpose

Validate a Sales Preview Production Request and convert it into a bounded Site Production Plan.

### 11.2 Primary inputs

- Preview Production Request
- Lead Research Package
- Requested proof level
- Recommended product/tier
- Budget and deadline
- Product and inventory availability

### 11.3 Core responsibilities

- Validate contract and identifiers
- Reject duplicates or expired requests
- Verify requested proof authority and budget
- Validate research sufficiency
- Assess vertical/tier feasibility
- Request clarification where inputs are insufficient
- Ask M06 for foundation match
- Produce Site Specification and execution plan

### 11.4 Outputs

- Accepted or rejected request receipt
- Site Specification
- Preview Production Plan
- Foundation reservation
- Missing-input or exception package

### 11.5 Definition of Done

Intake is done when the request has an explicit disposition and every accepted request has a pinned product, tier recommendation, proof level, Vertical Kit, foundation strategy, budget, deadline, required inputs, and correlation identifiers.

### 11.6 Major Gates

- Request contract Gate
- Identity/duplicate Gate
- Research sufficiency Gate
- Proof authorization Gate
- Feasibility/capacity Gate
- Plan acceptance Gate

## 12. M08 — Prospect Site Adaptation

### 12.1 Purpose

Create the prospect-specific website structure and configuration from the selected foundation and Site Specification.

### 12.2 Primary inputs

- Site Specification
- Reserved foundation
- Lead Research Package
- Proof-level contract
- Content/media outputs from M09
- Design and component constraints

### 12.3 Core responsibilities

- Apply prospect identity
- Select allowed component and token variants
- Populate business-specific structure
- Integrate approved copy and media
- Configure calls to action and safe preview behavior
- Keep prospect layer isolated
- Prevent unsupported claims and prior-prospect leakage
- Produce validated working package

### 12.4 Outputs

- Prospect Adaptation Package
- Configuration and content manifest
- Foundation/adaptation lineage
- Remaining limitations
- Cost and executor evidence

### 12.5 Definition of Done

Adaptation is done when the requested proof-level structure is complete, prospect-specific content is attributable, previous prospect data is absent, schemas validate, and the package is eligible for Payload draft promotion.

### 12.6 Major Gates

- Site Specification conformance Gate
- Identity and leakage Gate
- Tier/proof constraint Gate
- Working-package schema Gate
- Factual/provenance Gate

## 13. M09 — Content and Media Production

### 13.1 Purpose

Produce or select copy, images, and other media required by the Site Specification, proof level, and tier.

### 13.2 Primary inputs

- Lead Research Package
- Customer inputs where applicable
- Vertical Kit content patterns
- Content requirements
- Media plan
- Approved source/provider options
- Rights and provenance policy

### 13.3 Core responsibilities

- Extract and normalize verified facts
- Generate or adapt structured copy
- Select, process, or generate approved imagery
- Create derivatives and responsive variants
- Record provenance, rights, confidence, and transformation
- Validate claims, placeholders, and quality
- Return content/media candidates and approved assets

### 13.4 Outputs

- Copy Bundle
- Media Plan and approved media package
- Provenance manifest
- Factual-status report
- Rights/license report
- Cost record

### 13.5 Definition of Done

Content/media production is done when required fields are complete for the applicable proof/tier, provenance and rights are recorded, unsupported claims are blocked, media meets technical requirements, and outputs are compatible with the Site Specification and Payload mapping.

### 13.6 Major Gates

- Factuality Gate
- Provenance/rights Gate
- Copy quality Gate
- Media technical-quality Gate
- Brand/vertical suitability Gate
- Cost policy Gate

## 14. M10 — Working-to-Payload Promotion

### 14.1 Purpose

Provide the only trusted path by which approved working-layer website packages become Payload draft or published content candidates.

### 14.2 Primary inputs

- Validated working package
- Copy and media packages
- Site/tier/Payload mapping
- Promotion authorization
- Target Payload site and content version

### 14.3 Core responsibilities

- Validate input contracts
- Resolve media references
- Transform working schemas into Payload collections/blocks
- Create or update Payload draft through narrow service authority
- Record returned Payload IDs, version, status, and checksums
- Preserve idempotency
- Prevent direct working-to-published bypass
- Support later approved publication

### 14.4 Outputs

- Payload Draft Promotion Receipt
- Draft content version
- Working/Payload mapping record
- Media registration receipt
- Failure/reconciliation report where required

### 14.5 Definition of Done

Draft promotion is done when Payload contains the intended validated draft version, all references resolve, the working layer holds a complete receipt, and no competing canonical live copy was created.

### 14.6 Major Gates

- Promotion input Gate
- Schema and reference Gate
- Media registration Gate
- Idempotency/concurrency Gate
- Draft verification Gate

## 15. M11 — Preview Deployment and Validation

### 15.1 Purpose

Render, deploy, test, and certify a private or controlled preview for Sales use.

### 15.2 Primary inputs

- Payload draft version
- Preview configuration
- Proof-level quality requirements
- Preview route and access policy
- Analytics configuration

### 15.3 Core responsibilities

- Provision or update preview route
- Render from Payload draft
- Configure access and expiry
- Run browser, responsive, functional, visual, accessibility, and performance checks
- Capture screenshots and proof
- Verify safe contact behavior
- Create Preview Ready Package

### 15.4 Outputs

- Preview URL
- Preview manifest
- Quality and readiness report
- Screenshot/presentation package
- Analytics reference
- Preview Ready Package to Sales

### 15.5 Definition of Done

Preview deployment is done when the URL resolves under its access policy, required pages and assets render, proof-level Gates pass, evidence is durable, expiry is configured, and Sales has acknowledged the Ready Package.

### 15.6 Major Gates

- Route/access Gate
- Functional Gate
- Visual/responsive Gate
- Accessibility/performance Gate
- Leakage/placeholder Gate
- Sales handoff Gate

## 16. M12 — Preview Outcome, Upgrade, and Recycling

### 16.1 Purpose

Process the commercial outcome of a preview without losing reusable value or confusing prospect state with inventory state.

### 16.2 Primary inputs

- Preview Outcome and Recycle Instruction from Sales
- Engagement analytics
- Current preview/foundation state
- Retention and opportunity status
- Upgrade authorization and budget where applicable

### 16.3 Core responsibilities

- Hold active opportunities
- Upgrade proof level
- Preserve converted previews for M13
- Expire inactive previews
- Remove prospect identity during recycling
- Validate cleansing
- Recalculate foundation cost and residual value
- Return eligible foundations to inventory
- Trigger refresh, repair, or retirement

### 16.4 Outputs

- Upgrade production request
- Conversion reservation
- Recycle receipt
- Cleansed foundation package
- Updated inventory economics
- Retirement or repair request

### 16.5 Definition of Done

Outcome processing is done when both commercial preview status and technical foundation status have explicit, valid dispositions and no expired prospect data remains exposed.

### 16.6 Major Gates

- Outcome authority Gate
- Upgrade budget Gate
- Conversion-lock Gate
- Prospect-data cleansing Gate
- Inventory return Gate

## 17. M13 — Paid-Order Intake and Customer Finalization

### 17.1 Purpose

Convert a verified purchased product into a complete, customer-approved production candidate.

### 17.2 Primary inputs

- Paid Website Activation Package
- Odoo and Stripe references supplied by Sales
- Purchased Tier Specification and options
- Preview/foundation reference
- Customer-provided inputs and approvals
- Domain and integration information

### 17.3 Core responsibilities

- Validate activation and prevent duplicates
- Confirm capacity and product version
- Reconcile preview with purchased tier
- Gather or request missing inputs
- Replace preview-only content and media
- Complete all purchased pages/functions
- Configure production integrations
- Present customer review where required
- Produce final production working package

### 17.4 Outputs

- Customer Site Instance
- Final Site Specification
- Production content/media package
- Customer approval record where required
- Launch candidate manifest
- Fulfilment status updates to Sales/Odoo

### 17.5 Definition of Done

Finalization is done when the site meets purchased entitlement, material facts and assets have required approval, integrations are configured for production, remaining blockers are zero or explicitly accepted, and the launch candidate is ready for final promotion and certification.

### 17.6 Major Gates

- Paid activation contract Gate
- Product/entitlement Gate
- Customer-input and approval Gate
- Production-content Gate
- Integration configuration Gate
- Launch-candidate Gate

## 18. M14 — Production Publication and Launch Certification

### 18.1 Purpose

Publish the approved production content version and prove that the site is ready to enter active service.

### 18.2 Primary inputs

- Launch candidate
- Approved Payload draft
- Hosting readiness from M15
- Domain/TLS readiness where applicable
- Tier-specific launch Gate suite
- Authorized launch timing

### 18.3 Core responsibilities

- Execute publication authorization
- Publish exact approved Payload version
- Trigger targeted frontend revalidation
- Validate production rendering
- Run end-to-end launch tests
- Establish baseline backup
- Record launch manifest and rollback point
- Send Launch Completion Package

### 18.4 Outputs

- Published Payload version
- Production URL
- Launch manifest
- Quality and health evidence
- Baseline backup/restore reference
- Launch Completion Package to Sales/Odoo

### 18.5 Definition of Done

Launch is done only when the production URL, content, routing, TLS, forms, critical links, monitoring, backup baseline, and rollback state satisfy the applicable launch contract.

### 18.6 Major Gates

- Publication authority Gate
- Production render Gate
- Domain/TLS Gate
- Functional end-to-end Gate
- Monitoring/backup Gate
- Launch certification Gate

## 19. M15 — Domain, DNS, TLS, and Hosting Provisioning

### 19.1 Purpose

Prepare and maintain the infrastructure assignment required to serve each preview and customer site.

### 19.2 Primary inputs

- Preview or customer site record
- Hosting class and tier
- Domain state and authorization
- Runtime capacity and regional metrics
- Routing and security policy

### 19.3 Core responsibilities

- Assign frontend runtime and region
- Provision routes
- Configure authorized DNS
- Issue and renew TLS
- Configure Cloudflare/Traefik behavior
- Validate Payload and frontend connectivity
- Support migrations and failover
- Deprovision safely when authorized

### 19.4 Outputs

- Hosting Assignment
- Route/DNS/TLS receipts
- Readiness and health status
- Capacity allocation record
- Migration/deprovision record

### 19.5 Definition of Done

Provisioning is done when the assigned runtime, route, edge, TLS, security, capacity, and health checks pass and the assignment can support the intended preview or production state.

### 19.6 Major Gates

- Capacity placement Gate
- Domain authority Gate
- Route configuration Gate
- TLS/security Gate
- Runtime readiness Gate

## 20. M16 — Site Operations, Monitoring, and Recovery

### 20.1 Purpose

Operate active sites autonomously and restore expected service when safe remediation is possible.

### 20.2 Primary inputs

- Site and hosting assignments
- Monitoring and synthetic-test events
- Logs and metrics
- Backup state
- Dependency advisories
- Service entitlement

### 20.3 Core responsibilities

- Observe availability and correctness
- Detect and classify incidents
- Execute safe remediation and rollback
- Verify recovery
- Escalate exceptions
- Maintain backups and test restores
- Apply approved maintenance and security updates
- Report technical health

### 20.4 Outputs

- Health state
- Incident and remediation records
- Recovery proof
- Backup and restore evidence
- Maintenance release records
- Service Status Package

### 20.5 Definition of Done

Operations is continuous. Individual events are done when expected service is verified, evidence is recorded, customer/commercial impact is reported where required, and any follow-up improvement has an owner and state.

### 20.6 Major Gates

- Detection/classification Gate
- Auto-remediation authority Gate
- Recovery verification Gate
- Maintenance release Gate
- Incident closure Gate

## 21. M17 — Customer Changes and Service Evolution

### 21.1 Purpose

Process authorized post-launch changes without bypassing entitlement, draft, approval, publication, or rollback controls.

### 21.2 Primary inputs

- Customer Change Request
- Current Tier Specification and entitlement
- Customer identity/authority
- Required commercial approval
- Current content/site version

### 21.3 Core responsibilities

- Validate authority and entitlement
- Request Sales quotation when needed
- Plan and execute content/technical change
- Promote to Payload draft
- Obtain approval where required
- Publish and verify
- Preserve prior version and rollback
- Process tier upgrades/downgrades

### 21.4 Outputs

- Change disposition
- Updated draft/published version
- Quality and approval evidence
- Customer/Sales status update
- Updated entitlement/hosting requirement where applicable

### 21.5 Definition of Done

A change is done when the authorized request is either rejected with a reason, returned for commercial action, cancelled, or implemented and verified against its entitlement and quality contract.

### 21.6 Major Gates

- Identity/authority Gate
- Entitlement Gate
- Change feasibility Gate
- Draft quality Gate
- Approval Gate
- Publication verification Gate

## 22. M18 — Capacity, Regional Placement, and Infrastructure Scaling

### 22.1 Purpose

Ensure that frontend capacity, regional placement, CMS/database performance, and shared infrastructure scale according to measured demand.

### 22.2 Primary inputs

- Site count
- Traffic, latency, CPU, memory, bandwidth, and cache metrics
- Customer geographic concentration
- Incident and saturation data
- Database/CMS performance
- Cost and provider options
- Enterprise isolation requirements

### 22.3 Core responsibilities

- Forecast capacity
- Define placement thresholds
- Recommend and provision new frontend VPSs
- Assign customers to regions
- Migrate sites safely
- Evaluate Payload replicas, read replicas, database scaling, or dedicated stacks when justified
- Retire or resize underused capacity
- Preserve cost and reliability evidence

### 22.4 Outputs

- Capacity plan
- Scaling or migration authorization request
- New/changed hosting assignments
- Load-test and post-migration evidence
- Updated cost allocation

### 22.5 Definition of Done

A scaling action is done when the approved capacity change is provisioned, migrated, tested, observed through a stabilization window, costed, and reversible or documented as intentionally irreversible.

### 22.6 Major Gates

- Metrics sufficiency Gate
- Cost/authority Gate
- Provisioning Gate
- Migration readiness Gate
- Post-migration verification Gate

## 23. M19 — Suspension, Export, Termination, and Decommissioning

### 23.1 Purpose

Execute authorized service-end actions while preserving security, evidence, customer entitlement, and retention requirements.

### 23.2 Primary inputs

- Payment-Related Service Instruction or termination instruction
- Customer/order/site identifiers
- Contract and retention policy
- Export entitlement
- Current site, content, hosting, and integration state

### 23.3 Core responsibilities

- Validate instruction authority
- Apply warning, restriction, or suspension state
- Preserve recoverability
- Produce authorized export/handoff
- Disconnect integrations safely
- Remove routes and resources at the correct time
- Retain required backups/evidence
- Execute final deletion only after authority and retention conditions

### 23.4 Outputs

- Suspension/resumption receipt
- Export package
- Termination manifest
- Deprovision receipt
- Retention schedule
- Final deletion proof where applicable

### 23.5 Definition of Done

Service-end work is done when the authorized lifecycle state is technically enforced, all required exports and retention actions are complete, active access is consistent with policy, and evidence is returned to Sales/Odoo.

### 23.6 Major Gates

- Instruction authority Gate
- Customer/export entitlement Gate
- Integration disconnection Gate
- Retention Gate
- Deprovision Gate
- Final deletion protected Gate

## 24. M20 — Quality, Cost, Performance, and Program Improvement

### 24.1 Purpose

Turn operational evidence into approved improvements without allowing autonomous self-modification to bypass review, testing, or version control.

### 24.2 Primary inputs

- Run and Gate results
- Cost and token telemetry
- Preview engagement and Sales outcomes
- Foundation reuse and recovery data
- Customer incidents and change patterns
- Hosting and capacity metrics
- Executor performance
- Component and Vertical Kit performance
- OpenClaw and human exception outcomes

### 24.3 Core responsibilities

- Calculate Program KPIs
- Identify recurring failures and cost leakage
- Identify poor-performing assets and executors
- Propose component, kit, contract, model-routing, or infrastructure improvements
- Run controlled experiments
- Validate changes in shadow/pilot environments
- Promote approved versions
- Track whether changes produced improvement

### 24.4 Outputs

- Improvement proposal
- Experiment definition and results
- Approved new capability/version
- Deprecation or retirement instruction
- Updated routing, Gate, or policy configuration
- Management reporting

### 24.5 Definition of Done

An improvement is done when its hypothesis, evidence, implementation, test result, approval, rollout, and measured post-change effect are recorded. A suggestion alone is not an improvement.

### 24.6 Major Gates

- Evidence sufficiency Gate
- Experiment safety Gate
- Technical/quality Gate
- Cost-benefit Gate
- Promotion approval Gate
- Post-rollout verification Gate

## 25. Cross-Module handoff envelope

Every major handoff should contain a common envelope:

```text
handoff_id
handoff_type
schema_version
producer_module
consumer_module_or_program
program_id
program_version
entity_type
entity_id
tenant_or_customer_scope
correlation_id
causation_id
idempotency_key
input_or_output_manifest_ref
contract_refs
proof_refs
created_at
expires_at
acceptance_status
failure_or_return_reason
```

The envelope allows the Program Controller to route and audit the handoff while domain-specific schemas define the actual payload.

## 26. Module dependency rules

### 26.1 Explicit dependencies

Dependencies must be declared by contract and state. They must not be inferred from filenames, folder order, or an agent's memory.

### 26.2 Version pinning

A preview or customer site must pin the relevant Product, Tier, Vertical Kit, foundation, design, component, Site Specification, content, and Gate versions.

### 26.3 Parallel work

Modules may run in parallel when their outputs are isolated. For example:

- M09 may produce copy and media while M08 configures safe structural elements.
- M15 may prepare hosting while M13 finalizes customer content.
- M16 continues operating active sites while M05 produces new foundations.

### 26.4 Rework loops

Gate failures return work to the responsible Module or create a repair Issue. They do not silently modify downstream output.

### 26.5 No commercial bypass

M13 cannot begin from an informal “customer paid” message. It begins from the valid paid activation contract.

## 27. Program completion

LiNKsites as a whole does not become permanently “complete” while it is an operating business. Individual cycles complete:

- A capability release completes
- A foundation completes and enters inventory
- A preview completes and reaches a disposition
- A paid site completes launch
- A change completes publication
- An incident completes recovery and closure
- A service completes termination

The Program continues to accept new valid work while its Controller is `running`.

## 28. Module-map acceptance criteria

The Module design is correct when:

1. LiNKsites is represented as one Program.
2. General discovery, outreach, selling, payment, and CRM are absent from its Modules.
3. Reusable capability production is represented separately from prospect adaptation.
4. Preview Inventory has an explicit owner.
5. Supabase working state and Payload content promotion have an explicit boundary.
6. Paid finalization cannot begin without a valid activation package.
7. Launch is separate from publication and hosting provisioning.
8. Managed operations continue after launch.
9. Customer changes follow entitlement and publication controls.
10. Regional frontend scaling is metric-driven rather than tied to a fixed site count.
11. Suspension is separate from deletion.
12. Every Module has a Definition of Done and major Gate classes.
13. Cross-Module and cross-Program handoffs are versioned and idempotent.
14. Quality and cost evidence feed controlled improvement.

## 29. Governing conclusion

The twenty Modules in this section define the complete high-level operating capability of the LiNKsites Program. They separate product governance, reusable asset production, prospect adaptation, content promotion, preview delivery, paid fulfilment, launch, managed hosting, customer change, scaling, service termination, and continuous improvement without fragmenting LiNKsites into competing Programs.

This Module map is the foundation for repository auditing and future PRDs. Existing code should be mapped to these capabilities during the audit. Code that does not map cleanly may be obsolete, shared infrastructure, an unrecognized requirement, or misplaced responsibility; it should not be forced into a Module merely to preserve historical structure.

---

**End of Section 05**

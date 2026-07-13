# LiNKsites Program Manual

## Section 01 — Executive Definition, Purpose, Objectives, and Governing Doctrine

**Document set:** LiNKsites Program Manual  
**Section:** 01 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, product and engineering agents, repository auditors, implementation agents, operators, OpenClaw overseers, and future human collaborators  

---

## 1. Purpose of this section

This section establishes the authoritative high-level definition of LiNKsites. It explains what LiNKsites is, why it exists, what it produces, how its business and technology fit together, which responsibilities belong inside it, which responsibilities belong elsewhere, and the doctrines that all later product, architectural, operational, and engineering decisions must follow.

The reader is assumed to have no access to the conversations, historical documents, repositories, or earlier LiNKtrend designs from which this definition was reconciled. Consequently, this section deliberately states the business context, product thesis, system boundaries, operating model, and important terminology explicitly.

This manual is not merely a description of a website-building application. It describes a complete autonomous production and managed-service Program. Later sections will translate this high-level doctrine into modules, stages, issues, runs, contracts, data structures, executors, gates, infrastructure, security controls, observability, and implementation requirements.

## 2. Manual structure

The complete LiNKsites Program Manual consists of the following 24 sections:

1. Executive Definition, Purpose, Objectives, and Governing Doctrine
2. Scope, Boundaries, Actors, and Relationships with Other LiNKtrend Programs
3. Product Definition, Customer Outcomes, Service Tiers, and Commercial Assumptions
4. End-to-End Operating Lifecycle and Program State Model
5. Program Decomposition into Modules and Major Handoffs
6. Design Intelligence Catalog, Design Tokens, and Governed Visual Variation
7. Component Registry, Frontend Structure, and Deterministic Site Assembly
8. Vertical Kits, Tier Specifications, and Reusable Site Foundations
9. Lead Research Inputs, Site Specifications, and Prospect Adaptation Contracts
10. Preview Inventory and the Build-First, Sell-Later Production Model
11. Copy, Images, Media, Provenance, and Asset-Creation Workflows
12. Supabase Working Layer, Payload Draft/Published Layers, and Content Promotion
13. Preview Generation, Validation, Deployment, Analytics, and Recycling
14. Paid-Order Intake, Customer Finalization, Approval, and Launch Certification
15. Hosting Topology, Frontend Runtime, Cloudflare, Traefik, and Regional Scaling
16. Autonomous Hosting Operations, Monitoring, Recovery, Backup, and Restoration
17. Domains, DNS, TLS, Forms, Messaging, and External Service Integrations
18. Security, Tenant Isolation, Secrets, Access Control, and Data Protection
19. Quality Gates, Testing, Accessibility, Performance, SEO, and Visual Verification
20. Issues, Runs, Executors, Model Routing, Idempotency, Retry, and Compensation
21. Cross-Program Contracts with LiNKtrend Sales, Odoo, Stripe, and Shared Services
22. OpenClaw Oversight, Exceptions, Authority Levels, and Human Intervention
23. Observability, Cost Accounting, Capacity, Metrics, and Continuous Improvement
24. Repository Audit Requirements, Implementation Roadmap, Acceptance Criteria, and Glossary

Each section is intended to stand on its own while remaining consistent with the entire set. Later engineering PRDs may refer to these sections as product context, but they must not silently alter the governing doctrine stated here.

## 3. Authoritative definition of LiNKsites

LiNKsites is LiNKtrend's autonomous website factory and managed website service for small and medium-sized businesses.

It is both a business and a technology system because the commercial product cannot be separated from the production and operating workflow that creates and maintains it. LiNKsites does not merely provide software that a customer uses to build a website. It repeatedly performs the work of selecting or producing an appropriate reusable website foundation, adapting it to a specific business, validating it, publishing it, converting it into a customer site after purchase, hosting it, monitoring it, maintaining it, and processing future changes.

Within LiNKtrend terminology, LiNKsites is a **Program**. A Program is the complete governed workflow through which a factory produces its intended outcome. The Program is decomposed as follows:

```text
Program
└── Modules
    └── Stages
        └── Issues
            └── Runs
```

- A **Module** is a major operational capability or division of the Program.
- A **Stage** is an ordered or conditionally entered segment within a Module.
- An **Issue** is the smallest atomic, schedulable piece of work.
- A **Run** is one execution attempt of an Issue.
- An **Executor** performs a Run. An executor may be an automation, deterministic program or script, service, AI agent, multi-agent crew, browser executor, or another approved runtime.
- A **Gate** evaluates whether a Run, Stage, Module, handoff, or Program result may progress.

LiNKsites must consistently and autonomously produce the same class of outcome: a reliable, professionally presented, customer-appropriate, managed SMB website assembled from governed reusable capabilities and operated as a continuing service.

## 4. The business problem LiNKsites addresses

Many SMBs have no independent website, have an outdated or ineffective website, rely only on social-media pages, or cannot justify the cost and management burden of a traditional custom web agency. Even when modern AI can produce website code quickly, the SMB still faces unresolved problems:

- Determining what the website should say and contain
- Selecting a suitable design and conversion structure
- Gathering or creating appropriate visual assets
- Ensuring mobile, performance, accessibility, SEO, and technical quality
- Connecting forms, domains, analytics, and external services
- Publishing and hosting the site reliably
- Keeping software and content maintained
- Recovering from failures
- Managing future updates
- Avoiding dependence on an individual developer

The advance of generative AI does not eliminate these needs. It changes the means of production. LiNKsites uses AI where it materially improves research, content, design selection, adaptation, evaluation, or exception handling, but it does not rely on a frontier coding agent to invent and code every customer website independently from a prompt.

The LiNKsites thesis is that a controlled production system can provide better consistency, lower marginal cost, faster delivery, greater scalability, and more reliable maintenance than either traditional custom development or unconstrained one-prompt website generation.

## 5. The product sold to the customer

The customer purchases a managed website outcome, not a code-generation session and not access to an experimental AI agent.

The managed outcome may include, according to the eventual selected tier and commercial package:

- A customer-appropriate site structure
- Professionally assembled responsive pages
- Business-specific identity, contact information, services, positioning, and calls to action
- Approved copy, images, video, and other media where included
- Mobile, accessibility, SEO, performance, and functional validation
- Domain connection and TLS
- Hosting on LiNKtrend-managed infrastructure
- Content management through the governed Payload CMS layer
- Forms and approved integrations
- Monitoring, maintenance, backup, recovery, and controlled updates
- Ongoing service according to the customer's package

Exact tier names, prices, page counts, included changes, ownership terms, support boundaries, and optional add-ons remain commercial configuration to be finalized separately. The engineering architecture must support tiered constraints without hard-coding an unapproved pricing model.

## 6. The build-first, sell-later thesis

LiNKsites is founded on a strong sales proposition: a qualified prospect should be shown an actual website representing what LiNKsites can provide, rather than being asked to trust a promise that a website will be produced after purchase.

This is the **build-first, sell-later** model. It changes speculative website production from a one-time expense into a managed inventory investment.

LiNKsites does not normally build every prospect site independently from zero. It separates:

### 6.1 Reusable Site Foundation

The reusable foundation may contain:

- Vertical and subvertical structure
- Tier-compatible page model
- Component arrangement
- Design tokens
- General layout and interaction patterns
- Conversion structure
- Generic or appropriately licensed media family
- Content patterns
- CMS mapping
- Integration patterns

### 6.2 Prospect Adaptation

The prospect-specific layer may contain:

- Business name and logo treatment
- Telephone, email, address, and service area
- Business services and offers
- Business-specific positioning and copy
- Selected visual assets
- Social links
- Calls to action
- Preview analytics identifiers
- Prospect-specific preview routing

If the prospect does not purchase, the prospect-specific identity is removed and validated as removed. The reusable foundation returns to Preview Inventory and may be adapted for another suitable prospect at a fraction of the original creation cost.

For example, if an initial reusable site and first adaptation cost USD 30 and reassignment to another prospect costs USD 5, an unsuccessful first offer has not necessarily destroyed USD 30 of value. The remaining foundation may still produce a later sale after one or more low-cost adaptations. The Program must therefore track initial production cost, adaptation cost, upgrade cost, reuse count, engagement, revenue recovery, residual value, and true write-off separately.

This economic thesis must be measured in production and refined using actual conversion and cost data. The figures above illustrate the intended model; they are not fixed engineering assumptions or guaranteed costs.

## 7. Progressive Sales Proof Levels

LiNKsites supports several levels of speculative production so that LiNKtrend can invest as little as possible while still presenting an actual website to a qualified prospect.

| Level | Intended use | Website proof |
|---|---|---|
| Level 0 | Weak, incomplete, or unqualified opportunity | Research only; no prospect website produced yet |
| Level 1 | Plausible prospect | Minimum viable personalized preview based on a highly reusable vertical foundation |
| Level 2 | Good prospect | Personalized homepage and essential site experience using a well-matched reusable design |
| Level 3 | Strong prospect | Near-complete, substantially personalized website based on governed reusable assets |
| Level 4 | Highest-probability or highest-value prospect | Complete sale-ready preview, potentially upgraded from a previously unsold Level 2 or Level 3 foundation |

Levels 1 through 4 must show the prospect a real website. A written audit may support outreach internally or supplement the presentation, but it is not the primary proof of delivery.

These levels are investment controls, not a mandatory sequence. A prospect may begin directly at Level 2, 3, or 4 when its score, value, engagement, or reusable inventory match justifies the cost. Engagement may also cause a preview to be promoted to a higher level.

Customer production after payment is not another proof level. It is a separate **Finalization and Launch** lifecycle in which the prospect preview is converted into an approved customer site.

## 8. Relationship with the LiNKtrend Sales Program

LiNKsites does not own general lead discovery, sales outreach, AI calling, quotation, payment processing, commission management, or cross-selling. Those responsibilities belong to the shared, product-agnostic LiNKtrend Sales Program.

The Sales Program:

- Discovers SMBs
- Resolves and researches their identities
- Maintains shared SMB intelligence
- Matches business needs against the LiNKtrend Product Catalog
- Determines whether a LiNKsites proof investment is justified
- Requests an appropriate preview level
- Conducts outreach through approved channels
- Uses AI voice and human sales processes as designed
- Maintains leads and opportunities in Odoo
- Creates offers and coordinates commercial acceptance
- Processes payment through Stripe
- Sends a paid activation package to LiNKsites
- Manages commercial renewal, expansion, attribution, and cross-selling

LiNKsites:

- Publishes its products, tiers, qualification signals, production capabilities, and proof options to the shared Product Catalog
- Accepts validated preview-production requests from the Sales Program
- Produces and validates the requested preview
- Returns the preview package, evidence, status, cost, and analytics references
- Accepts a verified paid website activation package
- Finalizes, launches, hosts, monitors, and maintains the purchased site
- Returns fulfilment and service status to the Sales Program and Odoo integration layer

This boundary prevents every LiNKtrend factory from recreating its own CRM, outreach, payments, and sales infrastructure.

## 9. Relationship with LiNKautowork and other Programs

LiNKautowork is a separate automation factory. It discovers validated SMB process pain, sources or produces reusable n8n-centered automations, tests and governs them, publishes them as products, deploys them for customers, and operates them as managed services.

LiNKsites may consume an approved LiNKautowork product internally when the website business has a suitable business-process need. A LiNKsites customer may also purchase an automation product through the Sales Program as an add-on or bundle. However:

- LiNKautowork is not the universal executor of every LiNKsites workflow.
- LiNKsites may use scripts, services, n8n workflows, agents, and other executors directly within its Program architecture.
- LiNKautowork becomes involved when a reusable managed automation product or internally deployed automation from its governed library is appropriate.
- Substantial application production is outside LiNKsites and outside the definition of LiNKautowork established for this manual set.

LiNKaios has been postponed. LiNKsites must operate independently and must not require LiNKaios to run. Historical references describing LiNKsites as a Suite plugged into LiNKaios are not current authority.

## 10. Core asset-creation doctrine

LiNKsites uses **AI-assisted deterministic assembly**.

It does not choose between traditional templates and AI as if they were mutually exclusive. Instead, it combines:

- Governed reusable components
- Approved frontend structure
- Design tokens and design intelligence
- Tier specifications
- Vertical Kits
- Reusable Site Foundations
- Structured lead research
- Deterministic CMS mapping
- Scripts and automations for repeatable transformations
- Low-cost or local models for routine classification and generation
- Frontier models for ambiguity, high-value judgment, exceptional visual work, reusable capability creation, and difficult exceptions

Agents normally select, populate, adapt, evaluate, and improve governed assets. They do not normally create a new React codebase for every customer.

Frontier coding agents are most valuable when:

- Creating or improving reusable factory components
- Expanding the Design Intelligence Catalog
- Building new tier or Vertical Kit capabilities
- Resolving defects or exceptional requirements
- Producing separately priced and approved enterprise variations

Deterministic executors should handle activities such as schema validation, package assembly, content transformation, Payload seeding, preview deployment, revalidation, testing, checksums, and repeatable quality verification wherever practical.

## 11. Frontend and CMS doctrine

The provisional core platform is a shared Next.js-based frontend system using Tailwind and governed shadcn-compatible primitives, connected to Payload CMS. Existing repositories must be audited before any rewrite or version upgrade is authorized.

The product should use a shared component and block architecture rather than a separately coded application for every customer site. Customer variation is primarily expressed through:

- Structured content
- Selected blocks and component arrangements
- Design tokens
- Approved variants
- Vertical Kit rules
- Media selections
- Tier constraints
- Customer-specific configuration

Payload is the website-content system of record. Its PostgreSQL database may be hosted through Supabase infrastructure, but Payload owns and manages its CMS tables and content model.

The website frontend must consume **published Payload content**. It must not query the factory's raw working tables or accept unvalidated executor output as live content.

## 12. Three-layer content architecture

LiNKsites separates working production from draft preview and public publication.

### 12.1 Supabase Working Layer

The working layer contains production evidence and mutable candidate material, including:

- Site specifications
- Lead research references received from Sales
- Run and executor records
- Copy candidates
- Media candidates and provenance
- Validation state
- Preview assignments
- Reusable inventory records
- Promotion status
- Cost and telemetry

Executors do not receive unrestricted database authority. They should write through narrow internal ingestion or service interfaces appropriate to the Issue being executed.

### 12.2 Payload Draft Layer

A trusted Promotion Service transforms and validates an approved working package, then writes it into Payload as draft content. The private preview is rendered from this governed draft layer and undergoes quality assurance.

### 12.3 Payload Published Layer

Only content that passes the required launch or publication gates becomes published. Public customer frontends read published content only.

The intended direction is:

```text
Supabase working package
→ validated promotion
→ Payload draft
→ preview and QA
→ Payload published
→ customer frontend
```

Payload returns identifiers, version, status, timestamps, and checksums to the working layer so that the factory can reconstruct what was promoted without maintaining two competing canonical copies of the same live content.

## 13. Hosting doctrine

LiNKsites provides managed hosting as part of the product. The initial topology is deliberately compact:

- One central Payload control plane/application
- One PostgreSQL database arrangement capable of supporting Payload and the logically separate working layer
- One object-storage system for media and production artifacts
- One shared Next.js frontend VPS
- Cloudflare at the edge
- Traefik for routing

Public requests should normally be served from Cloudflare and cached or pre-rendered Next.js output. They should not cause direct database queries for every page view. Next.js incremental or equivalent controlled revalidation is triggered when relevant published content changes.

The term **region** in LiNKsites refers primarily to frontend VPS placement, not to the countries or markets in which the commercial service may be sold.

At the beginning, customers may share the initial frontend VPS regardless of their location. When customer volume, latency, traffic, or measured resource consumption justifies expansion—provisionally after a meaningful concentration such as 60–80 customers rather than according to a rigid rule—additional frontend VPSs may be opened in appropriate regions and customers assigned accordingly.

The earlier figure of approximately 20 sites per VPS was an AI estimate, not established doctrine. Actual capacity must be determined through load testing and production metrics.

Multiple regional frontend VPSs can continue using one central Payload and database control plane. A separate database or Payload instance per VPS is not the default. Database or CMS regionalization occurs only when performance, resilience, data residency, enterprise isolation, or other measured requirements justify it.

## 14. Autonomous operation

LiNKsites is intended to operate as autonomously as practical throughout production and hosting.

Normal operation should implement a continuous loop:

```text
Observe
→ detect
→ classify
→ act or remediate
→ verify
→ record
→ escalate only when necessary
```

Examples of autonomous behavior include:

- Selecting suitable reusable foundations
- Producing prospect adaptations
- Running schema and quality validation
- Deploying private previews
- Recycling unsold preview foundations
- Promoting approved content
- Provisioning frontends and routes
- Issuing targeted cache revalidation
- Monitoring availability and resource use
- Restarting safe failed services
- Rolling back failed deployments
- Restoring known-good configurations
- Managing backup schedules
- Detecting expiring certificates, broken forms, failed jobs, or capacity pressure
- Creating exception records and supplying diagnostic evidence

Autonomy must not mean uncontrolled authority. Actions are classified according to reversibility, risk, customer effect, spending, security, and required approval.

## 15. OpenClaw's role

OpenClaw is an external AI infrastructure and operations overseer. It is not an internal dependency of the LiNKsites Program and does not have to approve or dispatch every normal Issue.

When the autonomous Program cannot safely resolve an operational condition, OpenClaw should substitute for a human technical operator as far as its delegated authority permits. It may:

- Read alerts, dashboards, logs, manifests, and run history
- Investigate failures
- Correlate evidence
- Execute pre-authorized, reversible runbooks
- Verify whether recovery succeeded
- Explain the incident and action in plain language
- Escalate material decisions to Carlos

The Program must continue performing normal work if OpenClaw is unavailable. Carlos retains authority for decisions involving material spending, destructive actions, significant architecture changes, unresolved security incidents, contractual or legal matters, and exceptions beyond delegated policy.

## 16. Governing sources of truth

LiNKsites uses different authoritative systems for different concerns:

| Concern | Governing system |
|---|---|
| Program, Issue, Run, Gate, cost, and production-working state | LiNKsites working/control layer in PostgreSQL/Supabase architecture |
| Website draft and published content | Payload CMS |
| Public presentation | Assigned Next.js frontend runtime consuming published content |
| Commercial customer, opportunity, quotation, invoice, and accounting relationship | Odoo through the shared Sales Program |
| Payment-processing status | Stripe through verified event handling |
| Large media and production artifacts | Governed object storage with indexed metadata and provenance |
| Source code, schemas, contracts, component definitions, and versioned configuration | Appropriate Git repositories |
| Operational oversight | Monitoring/observability systems; OpenClaw consumes but does not replace them |

No chat conversation, agent assertion, Plane card, or informal message is canonical merely because it exists. Canonical state must be written through a governed system and be reconstructable from versioned definitions, events, manifests, and evidence.

## 17. Foundational doctrines

All LiNKsites engineering and operations must comply with the following doctrines.

### 17.1 Factory doctrine

LiNKsites is the complete website-production and managed-hosting Program, not merely a collection of templates, a CMS, a hosting cluster, or an AI coding agent.

### 17.2 Independent operation doctrine

LiNKsites must operate independently from LiNKautowork, LiNKtrend Sales, LiNKdeveloper, LiNKtrend Media, postponed LiNKaios, and OpenClaw. It integrates with other Programs through versioned contracts but remains capable of executing its own responsibilities.

### 17.3 Reuse-first doctrine

Reusable components, Vertical Kits, design intelligence, site foundations, content patterns, scripts, contracts, and test suites are factory assets. Reuse is the default; reinvention requires justification.

### 17.4 Thin-custom-layer doctrine

LiNKtrend should adopt and integrate reliable existing open-source solutions wherever appropriate. Custom development should concentrate on the LiNKsites-specific advantage: site specifications, governed design selection, Vertical Kits, tier rules, component registry, Payload mapping, preview inventory, promotion, cross-Program contracts, deterministic validation, and autonomous lifecycle management.

### 17.5 Controlled-AI doctrine

AI is routed according to task complexity, risk, cost, and required judgment. Frontier models are not the default for every Issue. Low-cost models, deterministic programs, and automations should perform suitable work.

### 17.6 Build-first proof doctrine

Qualified prospects receive an actual website preview. Sales proof investment is progressive and reusable.

### 17.7 Working-versus-live doctrine

Raw executor output is not live content. Content becomes live only through validated promotion into Payload draft, quality verification, and publication.

### 17.8 Published-content doctrine

Public frontends consume published website content, not raw research, mutable candidate assets, or unrestricted database tables.

### 17.9 Managed-service doctrine

LiNKsites remains responsible for the hosted service according to the purchased package, including monitoring, maintenance, recovery, and controlled updates.

### 17.10 Evidence doctrine

Completion requires evidence. Runs and gates must preserve enough proof to determine what was done, by which executor and version, with which input, at what cost, and with what verified result.

### 17.11 Safe-autonomy doctrine

Normal reversible work should be autonomous. Material, destructive, exceptional, high-spend, security-sensitive, contractual, and legally significant decisions follow an explicit authority model.

### 17.12 Replaceability doctrine

External providers, model vendors, storage providers, and executors should be accessed through controlled adapters wherever practical. The business must not become inseparable from one model or service without a deliberate decision.

## 18. Current open-source and technical direction

The following direction is accepted provisionally and must be validated against the repositories during the engineering audit:

- Next.js shared frontend platform
- Tailwind-based styling
- shadcn-compatible core primitives
- Selective internalization of suitable open-source components such as appropriate Magic UI components
- UI UX Pro Max as a seed for a reviewed and versioned internal Design Intelligence Catalog
- Existing Payload block schema and PageRenderer approach where reusable
- Payload CMS as draft/published content authority
- Supabase-hosted PostgreSQL as a possible initial database infrastructure arrangement
- Sharp or equivalent deterministic image processing
- Playwright for functional and rendered-browser testing
- axe-core for accessibility testing
- Lighthouse for performance and quality measurement
- Playwright-based visual regression
- Cloudflare and Traefik in the hosting path
- Governed object storage for approved media and production artifacts

Magic MCP is not a required core dependency. GrapesJS, Craft.js, Plasmic, Bolt.diy, Onlook, and one-prompt-per-site codebases are not the initial core architecture. Puck remains a possible future visual-editor option, and the content/block architecture should avoid unnecessarily preventing later compatibility.

Image APIs, customer-provided assets, and licensed assets are the initial media sources. A self-hosted generative-media system such as ComfyUI may be evaluated later if measured economics and quality justify it. Video is not required for the initial core product unless a tier or Vertical Kit explicitly includes it.

## 19. What LiNKsites is not

LiNKsites is not:

- A generic website builder offered for customers to operate themselves
- A traditional agency that starts every engagement from a blank page
- A single prompt sent to a frontier coding agent
- A collection of unrelated customer repositories with no shared platform
- A sales CRM or outreach system
- A payment processor
- A universal automation factory
- An application-development factory
- A dependency of LiNKaios
- An OpenClaw workflow
- A requirement that every customer receives fully unique code
- A requirement that every VPS has its own Payload instance or database
- A system in which scrapers, agents, or scripts write directly into live CMS content
- A system where an AI agent's statement that work is finished constitutes proof

## 20. Success definition

LiNKsites succeeds when it can repeatedly and autonomously:

1. Maintain a governed inventory of reusable, high-quality website foundations.
2. Accept a valid prospect-preview request from the Sales Program.
3. Select the best reusable foundation and required proof level.
4. Produce a convincing business-specific preview at a controlled marginal cost.
5. Validate and deploy the preview with measurable evidence.
6. Recycle and improve unsold foundations without leaking previous prospect information.
7. Accept a verified paid activation package.
8. Convert the preview into an approved customer website.
9. Publish and launch the site safely.
10. Host, monitor, maintain, back up, recover, and update the site with minimal human intervention.
11. Scale frontend capacity and regional placement according to measured demand.
12. Preserve complete technical, quality, cost, and lifecycle evidence.
13. Continue normal operation without OpenClaw or Carlos performing routine technical supervision.
14. Produce margins and customer outcomes that validate the business thesis once commercial assumptions are measured.

## 21. Decisions intentionally deferred or configurable

The following matters do not prevent repository auditing or core engineering preparation, but they must remain configurable or decision-gated until finalized:

- Final tier names, prices, and exact inclusions
- Setup fee and recurring fee structure
- Customer ownership and export terms
- Revision and support allowances
- Initial launch verticals and geographic sales campaigns
- Exact preview-level scoring thresholds and budgets
- Final capacity thresholds for adding VPSs
- Final email, voice, model, image, and infrastructure providers
- Whether and when Payload or database replicas are introduced
- Whether enterprise customers receive dedicated infrastructure
- Exact unit economics and acceptable acquisition investment
- Final legal, regulatory, licensing, outreach, and policy rules

The system must expose these matters as configuration, policy, catalog, contract, or deployment decisions rather than burying them as assumptions in code.

## 22. Authority of this section

This section supersedes historical descriptions that conflict with the reconciled doctrine stated here, including descriptions in which:

- LiNKsites is merely a Suite inside LiNKaios
- LiNKsites owns its own general lead-generation and sales organization
- Every prospect receives a completely newly coded site
- Supabase is a second canonical copy of published Payload content
- Executors write directly to live Payload content
- Every region or frontend VPS requires its own Payload/database stack
- OpenClaw is required for the system to function

Historical repositories and documents remain important evidence during the audit. They may contain valuable code, schemas, components, infrastructure, tests, or reasoning. They do not establish current product authority when they contradict this manual.

---

**End of Section 01**

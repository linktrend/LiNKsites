# LiNKsites Program Manual

## Section 02 — Scope, Boundaries, Actors, and Relationships with Other LiNKtrend Programs

**Document set:** LiNKsites Program Manual  
**Section:** 02 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, product and engineering agents, repository auditors, implementation agents, operators, OpenClaw overseers, and future human collaborators  

---

## 1. Purpose of this section

This section defines the exact operational boundary of the LiNKsites Program. It identifies what LiNKsites owns, what it may do through shared services, what it must obtain from other Programs, what it must return to them, and what is explicitly outside its authority.

Clear boundaries are necessary because earlier LiNKtrend concepts placed website production, lead discovery, outreach, sales, automation, hosting, customer growth, and internal orchestration inside overlapping systems. Those overlaps created contradictory descriptions of LiNKsites and made it difficult to determine which repository or service should own a capability.

The reconciled model separates responsibilities by outcome:

- **LiNKsites** produces, launches, hosts, and maintains managed websites.
- **LiNKtrend Sales** discovers businesses, develops commercial relationships, sells LiNKtrend products, processes payments, and manages commercial lifecycle information.
- **LiNKautowork** discovers validated business-process pain and produces and operates reusable managed automations for SMBs and internal LiNKtrend use.

These Programs cooperate through explicit, versioned contracts. Cooperation does not erase their independence.

## 2. Scope statement

LiNKsites owns the complete technical and production lifecycle required to turn an approved product definition, prospect-preview request, or paid website order into a validated website and continuing managed hosting service.

Its scope begins with the definition and preparation of reusable website-production capabilities. It continues through preview adaptation, paid customer finalization, publication, launch, hosting, monitoring, maintenance, controlled updates, recovery, scaling, and eventual suspension, export, or termination.

LiNKsites is accountable for whether the website artifact and managed service meet their applicable product, tier, quality, hosting, and lifecycle contracts. It is not accountable for discovering every potential customer, persuading that customer to buy, charging the customer, keeping the accounting books, or constructing unrelated business automations.

## 3. LiNKsites responsibilities

LiNKsites owns the following responsibility domains.

### 3.1 Product-capability definition

LiNKsites defines the website capabilities that can be sold through the shared Product Catalog, including:

- Supported website tiers
- Tier constraints and included capabilities
- Page and block structures
- Available integrations
- Hosting and maintenance characteristics
- Supported languages and localization capabilities
- Available proof levels
- Required customer inputs
- Production and fulfilment expectations
- Qualification signals and disqualifiers
- Add-ons that are genuinely supplied by LiNKsites
- Factory capacity and availability

Commercial pricing and contractual presentation are coordinated with the Sales Program and Odoo product configuration, but LiNKsites must state what it can reliably produce and operate.

### 3.2 Design-production system

LiNKsites owns:

- Design Intelligence Catalog
- Governed style, palette, and font-pairing data
- Design tokens
- Component and block registry
- Component variants
- Tier-compatible layout rules
- Page and navigation patterns
- Vertical-specific conversion patterns
- Design-quality evaluation rules
- Frontend structure and rendering contracts

Open-source design sources may seed or expand these assets, but reviewed internal representations become the governed production inputs.

### 3.3 Vertical Kits

LiNKsites creates and maintains reusable Vertical Kits for selected SMB categories. A Vertical Kit may define:

- Typical services and offers
- Recommended pages
- Required and optional sections
- Conversion objectives
- Common customer questions
- Contact and booking patterns
- Structured-data needs
- Suitable imagery and media patterns
- Copy structures and content constraints
- Appropriate design families
- Tier variations
- Relevant integrations
- Quality and compliance considerations

Vertical Kits are production assets. They do not independently establish facts about a particular prospect or customer.

### 3.4 Reusable Site Foundations

LiNKsites produces, versions, evaluates, stores, and improves reusable website foundations. It is responsible for separating reusable architecture and design from prospect-specific identity and information.

The Program must know:

- Which foundations exist
- Which verticals and tiers they support
- Their quality and freshness
- Their production and adaptation costs
- Which prospects have received adaptations
- Their engagement and conversion history
- Which elements are reusable or restricted
- Their current assignment and availability
- Whether they should be upgraded, repaired, retired, or returned to inventory

### 3.5 Prospect-preview production

LiNKsites accepts validated preview requests from the Sales Program and is responsible for:

- Validating the request contract
- Selecting the best existing foundation or authorizing a new foundation when justified
- Creating the required prospect adaptation
- Producing the requested Progressive Sales Proof Level
- Preventing contamination with previous prospect information
- Promoting validated working material into Payload draft
- Deploying a controlled preview
- Running required quality checks
- Returning a Preview Ready Package with evidence, status, cost, and analytics references

LiNKsites does not decide independently that a random business should receive sales outreach. It produces proof in response to an authorized request or an approved inventory-production campaign.

### 3.6 Preview inventory and recycling

LiNKsites owns the technical lifecycle of unsold website previews and their reusable foundations. It must:

- Detect expiration, rejection, inactivity, or Sales-directed recycling
- Preserve relevant commercial outcome references without retaining inappropriate prospect-specific content in reusable assets
- Remove previous identity and restricted material
- Validate that cleansing succeeded
- Recalculate adaptation cost and suitability
- Return the foundation to inventory
- Match it to future requests
- Retire assets whose quality, licensing, performance, or conversion history no longer justifies reuse

The Sales Program owns the commercial lead outcome; LiNKsites owns the technical reusable asset outcome.

### 3.7 Paid-order intake and customer finalization

After a verified commercial activation event, LiNKsites owns:

- Validating the Paid Website Activation Package
- Reserving or cloning the correct foundation and preview
- Collecting or requesting missing production inputs through the agreed interface
- Applying customer-approved information and corrections
- Replacing temporary or unapproved media
- Completing tier-required pages and functions
- Processing customer approval where required
- Running final launch gates
- Producing an immutable launch manifest

LiNKsites must not accept a browser redirect, customer statement, or unverified message as proof of payment. Activation must arrive through the Sales Program based on verified Stripe status and the corresponding Odoo commercial record.

### 3.8 Content promotion and publication

LiNKsites owns the trusted path from working candidate material to Payload draft and from approved draft to published content.

It is responsible for:

- Mapping the Site Specification to Payload collections and blocks
- Validating schemas and references
- Registering approved media
- Creating draft content through a controlled Promotion Service
- Preserving version and provenance links
- Supporting private preview
- Publishing only after the required gates pass
- Triggering targeted frontend revalidation
- Recording publication receipts and checksums

Raw executors, scrapers, and agents must not bypass this path by writing directly to live content.

### 3.9 Launch and hosting

LiNKsites owns:

- Site and environment provisioning
- Preview and production routing
- Customer-domain onboarding
- DNS instructions or authorized DNS execution
- TLS issuance and renewal
- Frontend deployment and assignment
- Cloudflare and Traefik configuration within approved boundaries
- Payload-to-frontend publication behavior
- Cache invalidation and revalidation
- Launch certification
- Operational availability after launch

### 3.10 Managed operations

LiNKsites remains responsible for the continuing managed service according to the purchased package. This includes:

- Availability monitoring
- Synthetic tests
- Resource monitoring
- Error detection
- Safe restart and recovery
- Deployment rollback
- Backup execution
- Restore testing
- Dependency and security maintenance
- Form and integration verification
- Capacity planning
- Regional frontend placement
- Controlled customer changes
- Incident records and service status

### 3.11 Technical customer lifecycle

LiNKsites owns the technical consequences of:

- Customer activation
- Upgrade or downgrade
- Add-on activation
- Site transfer where commercially supported
- Temporary suspension
- Payment-related restriction instructions received from Sales/Odoo
- Contract termination instructions
- Export or handoff where included
- Data and artifact retention
- Secure decommissioning

The Sales Program and Odoo own the commercial decision and status. LiNKsites performs the corresponding authorized technical action.

### 3.12 Quality, cost, and continuous improvement

LiNKsites owns measurement and improvement of:

- Production cost
- Preview adaptation cost
- Reuse and recovery rate
- Executor performance
- Token and model cost
- Quality-gate results
- Conversion-related preview signals supplied back to Sales
- Hosting cost per site
- Resource utilization
- Incident rate
- Recovery time
- Maintenance burden
- Component and Vertical Kit performance
- Technical customer-health signals

## 4. Responsibilities outside LiNKsites

The following responsibilities are explicitly outside the LiNKsites Program unless a separate contract delegates a narrow technical Issue to it.

### 4.1 General SMB discovery

LiNKsites does not operate the company-wide business-discovery system. Google Places, general search, social platforms, directories, registries, deduplication, and shared SMB identity belong to the Sales Program.

LiNKsites may define website-specific signals that Sales should collect, and it may analyze website evidence supplied in a Lead Research Package. That does not make it the owner of lead discovery.

### 4.2 Commercial qualification and product matching

Sales determines the overall commercial opportunity and matches the SMB against all LiNKtrend products. LiNKsites may return a website-fit assessment, technical feasibility, recommended tier, preview cost, or production constraint.

### 4.3 Outreach and selling

LiNKsites does not send cold email, place sales calls, manage outreach sequences, negotiate, assign human salespeople, or decide commission. It supplies product facts, approved claims, preview links, tier capabilities, fulfilment estimates, and technical answers to the Sales Program.

### 4.4 CRM and opportunity management

Odoo is canonical for organizations, commercial contacts, leads, opportunities, activities, quotations, orders, invoices, payments recorded for accounting, and customer-commercial status. LiNKsites stores only the identifiers and technical state necessary to fulfil its responsibilities.

### 4.5 Payment processing

Stripe processes payments. LiNKsites does not store payment credentials, determine payment success, create arbitrary charges, or activate work from an unverified payment assertion.

### 4.6 General accounting and finance

Accounting, tax, financial reporting, revenue recognition, refunds, and commission accounting are outside LiNKsites. LiNKsites provides technical cost and fulfilment records to the appropriate shared systems.

### 4.7 Managed business automation

LiNKautowork owns reusable managed SMB automations. A workflow that, for example, qualifies a customer's leads across several business systems may be a LiNKautowork product even when it is initiated from a LiNKsites form.

LiNKsites owns the website form and its reliable handoff. LiNKautowork owns the separately catalogued managed automation after that boundary.

### 4.8 General application development

LiNKsites may maintain small website-specific components and approved integrations. It is not responsible for developing unrelated custom business applications.

### 4.9 LiNKtrend Media production

LiNKtrend Media is a separate content-production business. LiNKsites may consume approved content or provide website publication destinations, but it does not absorb the Media factory's full production workflow.

### 4.10 Company-wide executive orchestration

LiNKsites does not depend on LiNKaios or a universal executive operating system. Its Program control, state, dispatch, and gates must function within its own approved Program infrastructure and shared technical services.

## 5. Independence and dependency doctrine

Program independence does not mean isolation. It means that each Program owns its outcome and can continue its normal internal operation without another Program performing its core work.

LiNKsites may depend on stable shared services such as database infrastructure, object storage, Odoo integration, Stripe events, DNS providers, and monitoring. Those are service dependencies with explicit interfaces. LiNKsites must not depend on the internal reasoning process or undocumented state of another Program.

Every cross-Program dependency must specify:

- Producer
- Consumer
- Contract name and version
- Required identifiers
- Required inputs
- Expected outputs
- Valid states
- Idempotency behavior
- Timeout and expiration
- Acceptance gate
- Retry or compensation behavior
- Evidence and correlation references

If another Program is unavailable, LiNKsites must enter a defined waiting, degraded, or exception state rather than improvise the missing commercial or product decision.

## 6. Actors

An actor is any human, service, Program, executor, or external system that initiates, performs, authorizes, receives, or observes work.

### 6.1 Carlos

Carlos is LiNKtrend's founder and ultimate business authority. Because LiNKsites is intended to operate autonomously and Carlos is a solo, non-technical founder, the system must not require him to supervise routine technical work.

Carlos is responsible for decisions such as:

- Product strategy
- Material pricing or packaging changes
- Major architecture changes
- Material unplanned expenditure
- Destructive or irreversible actions beyond delegated policy
- Significant security incidents
- Contractual and legal decisions
- Exceptions that exceed OpenClaw's delegated authority
- Approval of final Program doctrine and implementation plans

The system must communicate such decisions in clear business language with evidence, alternatives, consequences, and a recommended action.

### 6.2 Prospect

A prospect is an SMB or authorized representative being considered for a LiNKsites offer. A prospect may receive a private or controlled preview. A prospect is not yet necessarily a paying customer.

Prospect-specific material must be separated from reusable inventory and handled according to its provenance, sensitivity, expiration, and recycling rules.

### 6.3 Customer

A customer is an SMB with a valid commercial relationship recorded through the Sales Program and Odoo. A customer may provide:

- Business facts
- Logos and brand materials
- Images and media
- Domain authorization
- Approval or correction
- Integration credentials through an approved process
- Change requests

Customer input does not bypass validation. LiNKsites must preserve attribution, rights, approval, and version state.

### 6.4 LiNKtrend Sales Program

The Sales Program is the commercial producer and consumer at LiNKsites boundaries. It supplies research, authorizations, commercial status, and paid activation. It consumes product definitions, preview packages, technical answers, fulfilment status, and service-health summaries.

### 6.5 LiNKautowork Program

LiNKautowork supplies governed automation products where applicable. It may also use LiNKsites internally as a customer of website capabilities, or LiNKsites may use an internal LiNKautowork automation through an approved product/deployment contract.

Neither Program may access the other's internal tables or credentials without an explicit service interface.

### 6.6 Deterministic Program Controller

The Program Controller is the non-OpenClaw control service responsible for normal operational progression. Its responsibilities include:

- Validating events and feeder inputs
- Determining which Issues are ready
- Enforcing dependencies
- Dispatching Runs through executor adapters
- Applying leases, idempotency, concurrency, timeout, and retry rules
- Initiating gates
- Blocking invalid progression
- Recording state transitions and evidence
- Entering degraded or exception states when necessary

The Program Controller must not invent product policy. It executes approved Program definitions and configuration.

### 6.7 Executors

Executors perform atomic work. Approved executor categories include:

- Deterministic scripts or programs
- Application services
- n8n workflows
- AI agents
- Stateful or stateless agent runtimes
- CrewAI crews
- Agent Zero workers
- Cursor or other coding agents for approved engineering Issues
- Browser automation
- Human execution where specifically authorized

Executors receive narrow inputs and authority for the current Issue. They must return structured outputs, evidence, cost, and failure information. They do not receive blanket control over Payload, Supabase, infrastructure, or customer systems.

### 6.8 Validators and gate evaluators

Validators determine whether contract, quality, policy, and approval conditions are satisfied. They may be deterministic tests, model-based reviewers, security checks, policy engines, OpenClaw decisions, Carlos approvals, or combinations appropriate to the gate type.

The executor that produced an artifact should not be the sole authority declaring it accepted when independent validation is practical.

### 6.9 OpenClaw Operations Overseer

OpenClaw is an external operational overseer. It observes and assists but is not required for every dispatch or state transition.

It may:

- Receive alerts and exception packages
- Inspect logs, metrics, manifests, deployment state, and history
- Diagnose likely causes
- Execute pre-authorized reversible runbooks
- Verify recovery
- Approve actions within delegated authority
- Escalate protected decisions to Carlos
- Explain technical matters in plain language

If OpenClaw is unavailable, normal autonomous production and hosting continue.

### 6.10 Human technical or sales collaborators

Future human operators, engineers, designers, or sales agents may participate through defined roles and authority. Their actions must enter the same contract, audit, and state systems used by automated actors. Human participation must not create invisible side channels that become the real operational system.

## 7. External systems and their roles

### 7.1 Supabase/PostgreSQL infrastructure

The Supabase/PostgreSQL environment may host the LiNKsites working and Program-control data and may also provide PostgreSQL infrastructure for Payload under logical separation. It stores structured production state, not unrestricted public content access.

Its role includes:

- Program and Run state
- Site Specifications
- Preview Inventory
- Candidate content and media metadata
- Provenance
- Validation state
- Cross-Program inbox/outbox events
- Integration mappings
- Cost and telemetry

### 7.2 Payload CMS

Payload is authoritative for website draft and published content. It provides:

- Collections and blocks
- Draft/publish lifecycle
- Content versions
- Media registration
- Preview-facing draft content
- Published content consumed by customer frontends

Payload is not the raw lead-research store, general Program ledger, CRM, or payment system.

### 7.3 Next.js frontend platform

The frontend platform renders previews and customer websites from governed content and configuration. It provides:

- Shared site runtime
- Page and block rendering
- Responsive presentation
- Tier and component behavior
- Cached or pre-rendered delivery
- Targeted revalidation
- Technical integration points

It must not contain uncontrolled customer-specific forks when a governed configuration or component variation is sufficient.

### 7.4 Object storage

Object storage holds appropriate media, derivatives, proof artifacts, production packages, and backups according to lifecycle policy. Database records index these objects with identifiers, hashes, provenance, access classification, and retention.

The provider should be accessed through an adapter and must not be assumed permanently from the initial deployment.

### 7.5 Cloudflare

Cloudflare provides edge capabilities that may include DNS, proxying, caching, TLS support, security controls, and traffic management according to the final implementation.

### 7.6 Traefik

Traefik provides approved internal or VPS routing to shared frontend and control services. Its configuration changes must be versioned, validated, and recoverable.

### 7.7 Odoo

Odoo is the commercial system of record for:

- Organizations and contacts
- Leads and opportunities
- Activities and communications summaries
- Products and quotations
- Sales orders
- Invoices and accounting records
- Customer-commercial status
- Renewals and reporting

LiNKsites receives and returns mapped identifiers through a controlled integration service. It never writes directly to Odoo's database.

### 7.8 Stripe

Stripe is authoritative for payment-processing events. It may handle:

- Customer payment identity
- Checkout Sessions
- PaymentIntents
- Subscriptions
- Successful and failed payments
- Refunds and disputes
- Recurring billing events

Only verified, idempotently processed Stripe events may cause the Sales Program to issue paid activation or payment-related technical instructions.

### 7.9 Plane

Plane may provide a human-readable mirror of selected Issues, exceptions, milestones, or implementation work. It is not the canonical production controller unless a future explicit decision changes this.

Moving a Plane card must not silently alter a website's production, publication, or hosting state. Protected commands require an authenticated control interface and an audited state transition.

### 7.10 Git repositories

Git repositories are authoritative for versioned engineering material such as:

- Source code
- Component definitions
- Contracts and schemas
- Infrastructure configuration
- Tests and evaluation definitions
- Vertical Kit definitions where appropriate
- Prompt and executor definitions
- Migrations

Repository location and ownership must be confirmed during the read-only audit. Historical documents naming a path do not prove that the path remains current.

## 8. Cross-Program contracts

The following contracts are required at minimum. Exact schemas will be specified later.

### 8.1 Website Product Definition Package

**Producer:** LiNKsites  
**Consumer:** Sales Product Catalog  

Contains:

- Product and version
- Available tiers and options
- Suitable SMB profiles
- Qualification signals
- Disqualifiers
- Required inputs
- Proof levels
- Fulfilment capabilities
- Technical constraints
- Approved claims and FAQs
- Capacity/availability
- Support and hosting characteristics

### 8.2 Lead Research Package

**Producer:** Sales  
**Consumer:** LiNKsites  

Contains:

- Canonical business ID
- Source and evidence references
- Verified or confidence-rated business facts
- Current website and social presence
- Website-quality findings
- Services and positioning evidence
- Contacts required for site presentation
- Geographic and language context
- Product-match recommendation
- Data-use/provenance metadata

LiNKsites must not treat uncertain extracted information as verified customer truth without preserving its confidence and source.

### 8.3 Preview Production Request

**Producer:** Sales  
**Consumer:** LiNKsites  

Contains:

- Request and correlation IDs
- Business ID
- Research Package reference
- Requested proof level
- Recommended tier and Vertical Kit
- Maximum cost or budget class
- Required personalization
- Deadline and expiration
- Preview access and analytics requirements
- Approved outreach context

### 8.4 Preview Ready Package

**Producer:** LiNKsites  
**Consumer:** Sales  

Contains:

- Request and business IDs
- Preview ID and URL
- Proof level delivered
- Foundation and adaptation references
- Quality-gate results
- Screenshots or presentation artifacts
- Known limitations
- Cost and production time
- Expiration
- Analytics reference
- Approved product facts relevant to selling

### 8.5 Preview Outcome and Recycle Instruction

**Producer:** Sales  
**Consumer:** LiNKsites  

Contains:

- Preview and opportunity IDs
- Outcome
- Engagement summary
- Rejection or loss reason where known
- Hold, upgrade, continue, recycle, or retire instruction
- Timing and retention requirements

### 8.6 Paid Website Activation Package

**Producer:** Sales after verified Stripe and Odoo state  
**Consumer:** LiNKsites  

Contains:

- Customer, order, and payment references
- Purchased product, tier, options, and version
- Approved price configuration reference
- Preview or foundation reference
- Customer-provided inputs
- Missing-input list
- Domain state and authorization
- Approval requirements
- Target launch expectations
- Support and maintenance entitlement

### 8.7 Fulfilment Status Package

**Producer:** LiNKsites  
**Consumer:** Sales/Odoo integration  

Contains:

- Customer and order IDs
- Technical lifecycle state
- Current Stage
- Missing or blocked inputs
- Expected next milestone
- Launch status
- Service-health status
- Customer action required
- Exception or delay evidence

### 8.8 Launch Completion Package

**Producer:** LiNKsites  
**Consumer:** Sales/Odoo integration  

Contains:

- Production URL
- Domain/TLS status
- Launch manifest
- Published content version
- Hosting assignment
- Quality and readiness evidence
- Backup baseline
- Service start timestamp
- Customer reporting reference

### 8.9 Customer Change Request

**Producer:** Sales/customer-service interface  
**Consumer:** LiNKsites  

Contains:

- Customer and site IDs
- Requested change
- Source and authorization
- Entitlement or commercial approval
- Priority and deadline
- Customer assets and provenance
- Whether payment or quotation is required

### 8.10 Service Status and Technical Health Package

**Producer:** LiNKsites  
**Consumer:** Sales/Odoo/customer reporting/OpenClaw  

Contains scoped summaries of uptime, incidents, maintenance, capacity, outstanding customer action, and technical health without exposing unrestricted internal infrastructure data.

### 8.11 Payment-Related Service Instruction

**Producer:** Sales/Odoo policy layer  
**Consumer:** LiNKsites  

Contains an authorized instruction to warn, restrict, suspend, resume, or terminate service. LiNKsites does not independently interpret a failed Stripe event into destructive customer action without the approved policy and commercial instruction.

## 9. Ownership across the customer journey

| Customer-journey activity | Primary owner | LiNKsites role |
|---|---|---|
| Market campaign definition | Sales | Publish product and qualification capabilities |
| SMB discovery | Sales | None unless supplying website-specific assessment logic |
| Identity resolution | Sales | Consume canonical business ID |
| Shared research | Sales | Consume research package; return website-specific findings if requested |
| Product matching | Sales | Publish suitability rules and technical feasibility |
| Proof authorization | Sales | Validate and execute preview request |
| Preview creation | LiNKsites | Full owner |
| Outreach | Sales | Supply preview and approved technical/product facts |
| AI or human sales call | Sales | Answer via approved knowledge interface when necessary |
| Quotation and order | Sales/Odoo | Confirm technical availability and package validity |
| Payment | Stripe/Sales | No payment processing; await activation package |
| Customer site finalization | LiNKsites | Full technical owner |
| Launch | LiNKsites | Full technical owner |
| Invoice/accounting status | Odoo | Return fulfilment/service facts |
| Hosting and maintenance | LiNKsites | Full owner |
| Renewal and cross-sell | Sales/Odoo | Supply health, usage, capacity, and technical opportunity signals |
| Suspension/termination decision | Sales/Odoo policy | Execute authorized technical action |
| Technical decommissioning | LiNKsites | Full owner after valid instruction |

## 10. Data ownership and duplication boundaries

LiNKsites may retain identifiers and technical summaries needed to perform its work, but it must not create uncontrolled competing copies of other systems' canonical data.

### 10.1 Odoo data

LiNKsites stores Odoo foreign identifiers and technical snapshots required for a Run. It does not become a second CRM.

### 10.2 Stripe data

LiNKsites stores activation and instruction references, not payment credentials or an independently interpreted payment ledger.

### 10.3 Sales research

LiNKsites receives a versioned research package or references to it. It may derive website-specific production content while preserving source, confidence, and transformation lineage.

### 10.4 Payload content

Payload draft and published content are canonical for the website. The working layer stores candidate packages, manifests, mapping state, and returned Payload identifiers—not a bidirectional canonical duplicate.

### 10.5 Reusable assets

LiNKsites is canonical for its governed components, Vertical Kits, foundations, preview adaptations, and their production metadata.

## 11. Authority boundaries

### 11.1 Autonomous authority

The Program may autonomously perform approved, bounded, reversible normal work such as:

- Assembly and adaptation
- Validation
- Preview deployment
- Cache revalidation
- Safe restart
- Retry
- Rollback to known-good deployment
- Backup
- Capacity measurement
- Recycle preparation

### 11.2 OpenClaw delegated authority

OpenClaw may execute approved reversible runbooks, investigate exceptions, and make delegated operational decisions within configured limits.

### 11.3 Carlos-protected authority

Carlos retains decisions involving:

- Material unplanned expenditure
- Destructive deletion outside approved retention
- Irreversible customer impact
- Major architecture change
- Significant unresolved security incident
- Contractual or legal interpretation
- Pricing and policy exceptions
- Unapproved custom commitments

### 11.4 Customer authority

Customers may authorize business content, domains, integrations, publication, and changes according to their commercial entitlement. Customer authority is verified through approved identity and communication mechanisms.

## 12. Failure-boundary doctrine

LiNKsites must fail within defined boundaries.

- A Sales integration failure must not corrupt a preview or publish unapproved content.
- An Odoo sync failure must not erase the completed technical artifact; it creates a reconciliation exception.
- A Stripe webhook-processing delay must not cause unpaid production activation.
- A Payload failure must not expose raw working content.
- A regional frontend failure must not corrupt central content.
- An OpenClaw outage must not stop normal autonomous hosting.
- A failed customer integration must be isolated from other customers.
- A failed preview adaptation must not damage its reusable foundation.

Every boundary requires explicit timeout, retry, idempotency, rollback, and escalation rules in later technical sections.

## 13. Boundary acceptance criteria

The LiNKsites boundary design is correctly implemented only when all of the following are true:

1. LiNKsites can be described without including general lead generation or selling as internal Modules.
2. Sales can request and receive website proof through versioned contracts.
3. Payment activation cannot be forged by a client-side redirect or informal message.
4. Odoo remains commercial authority while LiNKsites retains sufficient technical state.
5. Payload remains draft/published content authority.
6. Executors cannot write directly to live content or unrestricted infrastructure.
7. LiNKautowork is used only through explicit automation-product or internal-deployment contracts.
8. Normal LiNKsites operation continues without LiNKaios or OpenClaw.
9. Customer and prospect data are scoped, attributable, and separable from reusable inventory.
10. Every cross-Program handoff is idempotent, versioned, auditable, and testable.
11. Technical suspension, resumption, export, and termination require authorized instructions.
12. Repository ownership and service boundaries can be verified during the engineering audit.

## 14. Governing conclusion

LiNKsites owns the website outcome from reusable production capability through managed technical lifecycle. It receives commercial intent from LiNKtrend Sales and returns website proof, fulfilment, launch, and service evidence. It may consume approved LiNKautowork products and shared infrastructure, but it does not surrender control of its outcome or absorb the responsibilities of those systems.

This separation is the basis for the later Program decomposition. If a proposed Module primarily discovers customers, negotiates, charges, accounts, or produces general business automation, it does not belong inside LiNKsites. If it is necessary to produce, validate, publish, host, maintain, recover, change, or technically retire the managed website, it presumptively belongs within LiNKsites.

---

**End of Section 02**

# LiNKsites Program Manual

## Section 21 — Cross-Program Contracts with LiNKtrend Sales, Odoo, Stripe, and Shared Services

**Document set:** LiNKsites Program Manual  
**Section:** 21 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, LiNKsites and LiNKtrend Sales product designers, integration engineers and agents, Odoo Community and OCA implementers, Stripe integration implementers, Supabase and n8n operators, security and finance reviewers, repository auditors, OpenClaw oversight designers, and future human collaborators  

---

## 1. Purpose of this section

This section defines how LiNKsites cooperates with the product-agnostic LiNKtrend Sales Program, Stripe, Odoo, and shared LiNKtrend services without becoming dependent on their internal implementation.

It defines:

- Which system owns each business fact
- Stable identities and foreign-reference rules
- Versioned request, event, acknowledgement, and reconciliation contracts
- Prospect-preview requests and preview-result handoffs
- Stripe-first checkout and verified payment handling
- Odoo commercial and accounting synchronization
- Paid activation, entitlement changes, service-state changes, and launch completion
- Customer updates, leads captured by websites, incidents, and support handoffs
- Shared infrastructure boundaries
- Duplicate, delayed, missing, conflicting, and out-of-order event behavior
- Security, observability, testing, deployment, and repository requirements

The objective is to let each Program operate independently while still producing one coherent customer journey and one reconcilable business record.

## 2. Plain-English answer

LiNKsites does not discover prospects, manage the sales pipeline, send outreach, charge customers, keep the company accounts, or decide commercial entitlement. Those responsibilities belong to the LiNKtrend Sales Program, Stripe, and Odoo.

LiNKsites receives bounded instructions, principally:

1. Research-backed requests to produce or adapt a sales preview.
2. Verified instructions to convert a sale into a customer website.
3. Valid commercial changes such as tier changes, suspension, reactivation, or termination.
4. Customer-approved factual and content inputs needed to fulfil the purchased service.

LiNKsites returns bounded results, principally:

1. Preview status, URL, evidence, cost, and reusable-inventory lineage.
2. Activation and onboarding status.
3. Launch completion and the exact live service identity.
4. Operational service health, incidents, and commercially relevant usage summaries.
5. Leads or requests submitted through customer websites when the purchased integration requires them.

No integration may instruct another Program by editing its private database tables.

## 3. Governing doctrine

1. **One fact has one authority.** Other systems may cache or reference it, but they do not silently become co-authorities.
2. **LiNKtrend Sales is product-agnostic.** It can sell LiNKsites, LiNKautowork, LiNKdeveloper, and future offerings through common commercial workflows.
3. **LiNKsites is not a CRM, payment processor, or accounting application.**
4. **Stripe is payment-first.** Stripe handles payment processing and emits the authoritative processor events used to establish payment facts.
5. **Odoo is the commercial and accounting system of record.** It records organizations, contacts, opportunities, quotations, orders, subscriptions or service agreements, invoices, payment accounting, customer standing, and analytic dimensions.
6. **Payment fact and accounting record are distinct.** A Stripe event may establish that the processor succeeded before Odoo has posted or reconciled the corresponding commercial record.
7. **Fulfilment requires a governed activation decision.** A browser redirect, salesperson message, raw webhook, or Odoo draft is not sufficient.
8. **Contracts cross boundaries; private tables do not.**
9. **Every contract is versioned, authenticated, idempotent, observable, and reconcilable.**
10. **Delivery is at least once.** Consumers must tolerate duplicates and out-of-order arrival.
11. **Acknowledgement is not completion.** Accepted, processing, completed, rejected, and failed are separate outcomes.
12. **Commercial changes never use blind last-write-wins.**
13. **Programs remain independently operable.** Shared infrastructure may reduce duplication but cannot erase ownership or create a universal failure domain.
14. **OpenClaw is not an integration bus.** It may investigate and coordinate exceptions but normal integrations continue without it.
15. **Financially material actions obey LiNKtrend approval policy.** Refunds, credits, write-offs, pricing overrides, and material accounting entries cannot be delegated merely because they are technically automatable.

## 4. Programs and systems in scope

| Participant | Primary responsibility in this section |
|---|---|
| LiNKsites | Preview production, customer-site fulfilment, content promotion, deployment, hosting, maintenance, and technical service state |
| LiNKtrend Sales Program | Product-agnostic discovery, research, qualification, outreach, opportunity management, offer coordination, checkout initiation, commercial handoffs, and post-sale commercial communication |
| Stripe | Payment method collection, payment processing, subscription billing where configured, refunds and disputes at processor level, and payment events |
| Odoo Community plus approved OCA/custom modules | CRM, customer master, products, quotations, sales orders, subscriptions/service agreements, invoices, accounting, payment reconciliation, customer commercial status, and analytic accounting |
| Integration Ledger | Durable receipt, validation, deduplication, mapping, processing, acknowledgement, and reconciliation of cross-system messages |
| n8n | Integration-heavy execution where appropriate; not the source of truth for contracts or state |
| Supabase/PostgreSQL | Program and integration records, evidence, outbox/inbox state, mappings, and operational summaries within explicit schemas |
| Object storage | Contract attachments, evidence, manifests, approved customer files, and immutable receipts referenced by digest |
| Secrets manager | Service credentials, signing keys, webhook secrets, and scoped access material |
| Observability stack | Logs, traces, metrics, alerts, dashboards, and correlation across Programs |
| Messaging providers | Email, messaging, and notification delivery under Sales or service policy |
| OpenClaw | External oversight and exception coordination on behalf of Carlos |

## 5. Explicit exclusions

This section does not make:

- LiNKsites the owner of leads or opportunities
- Odoo the store for raw execution traces, prompts, screenshots, or page-level QA evidence
- Stripe the CRM or general customer master
- Supabase the accounting ledger
- n8n the authoritative workflow ledger
- Payload the customer, order, or payment system of record
- OpenClaw a required runtime dependency
- LiNKautowork the executor of every LiNKsites or Sales workflow
- Direct database replication the normal integration method
- One large shared service account acceptable across all Programs

Legal and jurisdiction-specific rules are intentionally resolved later. The contracts must nevertheless support consent, suppression, retention, deletion, audit, and authority policies once approved.

## 6. Bounded-context ownership

### 6.1 LiNKtrend Sales bounded context

Sales owns:

- Prospect identity and deduplication
- Organization research dossier
- Contact evidence and outreach eligibility
- Opportunity and pipeline state
- Product-interest records
- Preview investment level and authorization
- Outreach sequences and replies
- Qualification and sales disposition
- Offer, quotation, checkout-link, and commercial follow-up state
- Commercial customer communication
- Cross-sell and renewal opportunity management

### 6.2 Stripe bounded context

Stripe owns processor facts such as:

- Stripe Customer, Checkout Session, PaymentIntent, Charge, Invoice, and Subscription identifiers
- Payment-processing state
- Payment-method state
- Processor-side recurring billing state
- Refund and dispute processor state
- Stripe event identity, creation time, mode, and API version

### 6.3 Odoo bounded context

Odoo owns:

- Canonical commercial organization and contacts
- Leads and opportunities at the CRM level
- Product and price-list representation
- Quotation and sales-order state
- Customer contract, subscription, or service-agreement record
- Invoice, credit note, journal, and accounting treatment
- Payment reconciliation and receivable state
- Customer commercial standing
- Analytic-accounting dimensions and summarized cost/revenue allocations

### 6.4 LiNKsites bounded context

LiNKsites owns:

- Site Specification and customer-site technical identity
- Vertical Kit, tier specification, foundation, component, and design lineage
- Preview request execution, preview inventory, and Preview Release
- Working content and asset packages
- Payload draft and published content releases
- Customer Site Instance
- Domain and hosting assignment
- Deployment, Launch Manifest, and Launch Certificate
- Site health, backup, restore, change, incident, and decommission state
- Technical usage and cost attributable to the site

## 7. Authority matrix

| Business fact | Authority | Permitted mirrors or references |
|---|---|---|
| Prospect research evidence | Sales operational store | Odoo summary; LiNKsites input snapshot |
| Lead or opportunity stage | Odoo through Sales policy | Sales integration cache |
| Preview production authorization | Sales Program | LiNKsites received contract |
| Preview build and availability | LiNKsites | Odoo opportunity activity or Sales cache |
| Product/tier technical definition | Versioned LiNKsites product catalog contract | Odoo saleable-product mapping; Sales catalog cache |
| Price, discount, tax treatment, quotation | Odoo/Sales commercial policy | Stripe checkout metadata; LiNKsites entitlement snapshot |
| Processor payment state | Stripe | Integration Ledger and Odoo payment/accounting record |
| Invoice and accounting state | Odoo | Sales status cache; LiNKsites service instruction reference |
| Purchased entitlement | Odoo commercial record plus signed activation snapshot | LiNKsites Customer Site Instance |
| Working website content | LiNKsites Supabase working layer | None as authority |
| Draft/published live content | Payload/PostgreSQL | Frontend cache and release manifests |
| Live-site technical state | LiNKsites | Sales/Odoo summarized service status |
| Customer commercial standing | Odoo | LiNKsites service instruction snapshot |
| Raw Issue and Run evidence | LiNKsites Program Ledger | Observability platform |
| Revenue, receivables, credits, write-offs | Odoo | Summarized management reporting |

If two authorities appear to conflict, the system does not choose whichever value arrived last. It creates a reconciliation case governed by the fact type.

## 8. One company and analytic-accounting boundary

The initial Odoo structure uses one primary company, Linktrend LLC. LiNKsites and other Programs are divisions, products, analytic dimensions, or cost/revenue centers rather than separate Odoo companies.

Therefore every LiNKsites commercial synchronization should carry, where applicable:

- Legal company ID
- Program or business-line analytic ID
- Product-family analytic ID
- Product and tier
- Customer or contract analytic reference
- Campaign or acquisition-channel reference
- Shared-service allocation reference

The exact analytic hierarchy belongs to the Odoo architecture. LiNKsites supplies attributable operational facts and costs; it does not post arbitrary journal entries.

## 9. Identity doctrine

Every major object receives one stable internal identity from its owning bounded context. Foreign systems store that identity as a reference, not as their own primary key.

Examples:

- `organization_id` — canonical cross-Program organization identity mapped to Odoo partner
- `prospect_id` — Sales prospect identity
- `opportunity_id` — Odoo/Sales opportunity identity
- `preview_request_id` — Sales-issued request identity
- `preview_id` — LiNKsites preview identity
- `customer_id` — canonical commercial customer identity
- `customer_site_id` — LiNKsites service identity
- `commercial_order_id` — Odoo order identity
- `entitlement_id` — commercial entitlement identity
- `stripe_customer_id` — Stripe object identifier
- `payment_verification_id` — internal verified processor-fact receipt
- `activation_package_id` — Sales-issued fulfilment authority

Names, domains, emails, phone numbers, and Stripe metadata are not stable primary identities.

## 10. Identity Mapping Registry

Cross-system references are stored in an **Identity Mapping Registry**.

```yaml
mapping_id: map-id
mapping_type: organization-to-odoo-partner
canonical_entity_type: organization
canonical_entity_id: organization-id
external_system: odoo
external_entity_type: res.partner
external_entity_id: odoo-record-id
external_company_scope: linktrend-llc-id
state: active
valid_from: timestamp
valid_to: null
source_contract_id: contract-id
verified_at: timestamp
version: integer
```

Required controls:

- Unique active mapping for each declared scope
- Explicit merge and split procedures
- No identifier reuse after deletion or archival
- Historical mappings retained for audit
- Mapping changes emit events
- Conflicting mappings stop fulfilment rather than guess

## 11. Customer and organization identity

The same SMB may first exist as researched prospect, then Odoo opportunity, then Stripe Customer, then paying Odoo customer, then one or more LiNKsites Customer Site Instances.

These are related objects, not synonyms.

```text
Organization
├── Prospect record
├── Odoo partner/contact records
├── Opportunity records
├── Stripe Customer reference
├── Commercial orders and entitlements
└── Customer Site Instances
```

A customer merge in Odoo does not automatically merge websites. It produces a governed identity-change contract reviewed against orders, domains, contacts, and access rights.

## 12. Product Catalog Contract

LiNKsites owns the technical product definition; Odoo owns the saleable commercial representation. A versioned Product Catalog Contract maps them.

```yaml
catalog_item_id: linksites-managed-site-tier-id
catalog_version: version
program_id: linksites
product_family: managed-website
tier_id: tier-id
tier_specification_version: version
sale_status: active
technical_entitlements:
  pages_or_page_types: []
  component_capabilities: []
  integrations: []
  hosting_class: class
  support_profile: profile
  change_profile: profile
  backup_recovery_profile: profile
commercial_mappings:
  odoo_product_template_id: id
  odoo_product_variant_id: optional-id
  stripe_product_id: optional-id
  stripe_price_ids: []
compatibility:
  minimum_platform_release: version
  vertical_kit_constraints: []
effective_from: timestamp
retired_at: null
```

LiNKsites must reject an activation referencing an unknown, retired, or incompatible tier version unless a governed migration or legacy-support rule applies.

## 13. Catalog publication flow

1. LiNKsites proposes or revises a technical tier specification.
2. Product governance approves the version.
3. Sales and finance define price, billing cadence, tax handling, discounts, and commercial availability.
4. Odoo and, where appropriate, Stripe product/price objects are created or mapped.
5. The mapping is verified in test mode.
6. A Catalog Published event makes the item saleable.
7. Retirement stops new sales but preserves existing entitlement interpretation.

Price is never hard-coded into the LiNKsites site-building repository.

## 14. Contract categories

Cross-Program communication uses five categories:

| Category | Meaning | Example |
|---|---|---|
| Command | Authorized request for another Program to act | Produce Preview, Activate Paid Site |
| Event | Statement that an owned fact changed | Preview Ready, Payment Verified, Site Launched |
| Query | Read request without authority to change state | Get Preview Status |
| Acknowledgement | Receipt and disposition of a command or event | Accepted, Duplicate, Rejected |
| Reconciliation report | Comparison intended to find omissions or conflicts | Paid orders without site activation |

A command is imperative and must identify its authority. An event is historical and must not be reinterpreted as unlimited authority.

## 15. Common Contract Envelope

Every cross-Program message uses a common envelope.

```yaml
contract_id: globally-unique-id
contract_type: linksites.preview.requested
contract_version: 1.0.0
message_kind: command
producer: linktrend-sales
consumer: linksites
environment: production
occurred_at: timestamp
emitted_at: timestamp
subject:
  entity_type: preview_request
  entity_id: preview-request-id
tenant:
  legal_company_id: linktrend-llc-id
  organization_id: organization-id
correlation_id: end-to-end-correlation-id
causation_id: prior-contract-or-run-id
idempotency_key: stable-business-key
sequence:
  stream_id: opportunity-or-site-stream-id
  number: integer
authority:
  policy_id: policy-version
  actor_type: service-or-human
  actor_id: actor-id
  approval_ref: optional-ref
data_classification: internal
payload_schema_ref: schema-uri
payload_digest: sha256
attachments: []
trace_context: standard-trace-context
expires_at: optional-timestamp
signature:
  key_id: signing-key-id
  algorithm: algorithm
  value: signature
```

The envelope is stable; the payload varies by contract type.

## 16. Contract-version policy

Contract versions use semantic meaning:

- Patch: documentation or backward-compatible validation clarification
- Minor: optional fields or compatible enum additions
- Major: required-field, meaning, authority, or behavior change

Rules:

1. Producers declare the exact version emitted.
2. Consumers declare supported ranges.
3. Unsupported major versions are rejected explicitly.
4. Unknown optional fields are preserved or ignored safely.
5. Unknown enum values do not default to a privileged action.
6. Schemas and examples live in a versioned contract repository.
7. Deprecation includes notice, telemetry, migration plan, and removal date.
8. Recorded messages remain interpretable with their original schema.

## 17. Transport-independent design

Contracts must remain meaningful whether transported by:

- Transactional outbox and queue
- Signed HTTPS webhook
- n8n integration workflow
- Scheduled reconciliation pull
- Controlled Odoo connector job
- Administrative replay tool

Business semantics cannot depend on an n8n node name, transient webhook URL, or provider-specific retry policy.

## 18. Recommended integration topology

The recommended initial topology is:

```text
Owning system transaction
→ local outbox
→ Integration Dispatcher
→ signed contract endpoint or durable queue
→ consumer inbox
→ contract validation and deduplication
→ consumer command handler
→ consumer state change and local outbox
→ acknowledgement/result event
```

The **Integration Ledger** records every crossing. n8n may dispatch, transform, or call APIs, but the Ledger—not n8n execution history—is the authoritative delivery record.

## 19. Integration Ledger

The Integration Ledger stores:

- Raw received envelope or immutable object reference
- Payload digest
- Producer and consumer
- Contract type and version
- Receipt time
- Signature and schema validation
- Idempotency disposition
- Processing status
- Attempts and next retry
- Consumer result
- Acknowledgement
- Mapping changes
- Reconciliation status
- Error classification
- Correlation and causation

Recommended logical tables include:

- `integration_messages`
- `integration_inbox`
- `integration_outbox`
- `integration_attempts`
- `integration_acknowledgements`
- `identity_mappings`
- `contract_schemas`
- `dead_letter_cases`
- `reconciliation_runs`
- `reconciliation_differences`

## 20. Transactional outbox rule

When a Program changes an owned business fact and needs to announce it, the state change and outbox record are committed in the same database transaction whenever technically possible.

This prevents:

- State changing without an event
- Event being emitted before state exists
- Process crash between database commit and network send

The dispatcher may send the same outbox item more than once. The consumer inbox handles duplicates.

## 21. Consumer inbox rule

Before acting on a message, the consumer:

1. Verifies source and signature.
2. Parses only a supported schema.
3. Records the immutable receipt.
4. Checks contract ID and business idempotency key.
5. Checks subject identity and sequence.
6. Determines duplicate, stale, conflict, or processable status.
7. Commits the inbox decision with any local state change.
8. Emits an acknowledgement or result.

An HTTP `200` only confirms transport receipt. It does not prove business completion.

## 22. Acknowledgement Contract

```yaml
acknowledgement_id: id
original_contract_id: id
consumer: linksites
received_at: timestamp
disposition: accepted|duplicate|rejected|deferred|conflict
consumer_entity_ref: optional-ref
reason_code: optional-code
supported_contract_versions: optional-range
processing_status: pending|completed|failed
status_query_ref: optional-ref
correlation_id: id
```

Long-running work acknowledges acceptance quickly and later emits progress or completion events.

## 23. Ordering and stream sequence

Network arrival order cannot be trusted. Important entity streams carry a monotonically increasing business sequence or comparable version.

Examples:

- Opportunity stream
- Preview Request stream
- Commercial Order stream
- Entitlement stream
- Customer Site stream
- Service Instruction stream

If sequence 12 arrives before 11, the consumer may:

- Apply 12 if it is self-contained and marks 11 obsolete
- Hold 12 temporarily while retrieving current state
- Fetch the authoritative object
- Create a reconciliation case

It must not assume arrival order equals business order.

## 24. Idempotency across systems

Two identifiers serve different purposes:

- `contract_id` deduplicates the same delivered message.
- `idempotency_key` deduplicates the same intended business effect across different messages or retries.

Examples:

```text
preview-request:{preview_request_id}:revision:{revision}
activate-site:{odoo_order_id}:{entitlement_version}
launch-complete:{customer_site_id}:{launch_release_id}
stripe-event:{stripe_event_id}
odoo-payment-sync:{stripe_payment_object_id}:{state_version}
```

Reusing an idempotency key with different payload digest is a conflict, not an update.

## 25. Sales-to-LiNKsites lifecycle

The standard cross-Program lifecycle is:

```text
Prospect researched by Sales
→ preview investment authorized
→ Preview Production Request
→ LiNKsites accepts and builds
→ Preview Ready Package
→ Sales presents and conducts outreach
→ offer and checkout created
→ Stripe confirms payment
→ Odoo commercial record synchronized
→ Paid Website Activation Package
→ LiNKsites finalizes and launches
→ Launch Completion Package
→ Sales/Odoo transition customer to active service
```

Each arrow is a contract or a controlled internal transition, not an informal agent conversation.

## 26. Prospect Preview Production Request

Sales sends this command only after its research and preview-investment policy authorizes production.

```yaml
preview_request_id: stable-id
revision: integer
organization:
  organization_id: id
  observed_name: string
  primary_domain: optional-domain
opportunity:
  odoo_opportunity_id: optional-id
  sales_opportunity_id: id
  product_interest: linksites
authorization:
  preview_level: 1-to-4
  policy_version: version
  budget_ceiling:
    currency: USD
    amount: decimal
  expires_at: timestamp
research_package:
  dossier_ref: object-ref
  dossier_digest: sha256
  evidence_items: []
  confidence_summary: object
  contradictions: []
adaptation:
  vertical_hypothesis: value
  tier_hypothesis: value
  locale_and_language: []
  desired_call_to_action: value
  presentation_deadline: optional-timestamp
restrictions:
  prohibited_claims: []
  asset_constraints: []
  contact_data_not_for_site: []
```

The research package is untrusted input. It does not become published truth merely because Sales supplied it.

## 27. Preview authorization levels

The four preview-investment levels control spend and personalization, not customer worth or legal status.

| Level | Typical output | Cost posture |
|---|---|---|
| 1 | Highly reusable vertical foundation with light identity adaptation | Lowest incremental investment |
| 2 | More business-specific copy, structure, and selected media | Moderate investment |
| 3 | Strong personalized build using deeper research and conversion design | Higher justified investment |
| 4 | Reuse or refactor of an unsold strong preview for a high-probability opportunity, with deeper final adaptation | Highest governed likelihood-adjusted investment |

The precise thresholds and budgets remain configurable. Sales authorizes the ceiling; LiNKsites records actual cost and may complete below it.

## 28. Preview Request acceptance

LiNKsites validates:

- Supported contract version
- Organization and opportunity identity
- Valid preview level and budget authority
- Research package presence and digest
- Evidence sufficiency for requested personalization
- Prohibited content and factual uncertainty
- Vertical Kit and tier compatibility
- Existing previews for the same organization
- Reusable inventory candidates
- Capacity and deadline
- Duplicate or superseded request

LiNKsites returns Accepted, Duplicate, Needs Research Correction, Deferred, Budget Conflict, Unsupported, or Rejected.

## 29. Preview progress events

LiNKsites may emit:

- `linksites.preview.accepted`
- `linksites.preview.reuse_candidate_selected`
- `linksites.preview.in_production`
- `linksites.preview.blocked`
- `linksites.preview.ready`
- `linksites.preview.expired`
- `linksites.preview.withdrawn`
- `linksites.preview.recycled`

Sales should use these events to update activity and timing, not to control the internal Issue graph.

## 30. Preview Ready Package

```yaml
preview_result_id: id
preview_request_id: id
preview_id: id
preview_release_id: id
state: ready
url:
  value: private-or-unguessable-url
  access_profile: profile
  expires_at: timestamp
presentation:
  recommended_message_points: []
  known_limitations: []
  provisional_facts: []
  production_replacement_items: []
lineage:
  vertical_kit_id: id-version
  tier_specification_id: id-version
  foundation_id: id-version
  source_preview_id: optional-id
quality:
  gate_profile: version
  gate_result_ref: ref
  evidence_ref: ref
economics:
  actual_build_cost: money
  reusable_value_class: class
analytics:
  tracking_ref: ref
conversion_lock_ref: ref
```

The package does not claim that the preview is production-ready or customer-approved.

## 31. Preview presentation and analytics boundary

Sales owns:

- Who receives the preview
- Outreach channel and timing
- Message and sales conversation
- Opportunity state
- Follow-up sequence

LiNKsites owns:

- Preview availability
- Access controls
- Page and technical analytics collection
- Preview release immutability
- Expiry and recycling state

LiNKsites may return summarized engagement events such as opened, meaningful session, CTA used, or expired. Raw visitor telemetry does not belong in Odoo.

## 32. Preview revision and cancellation

Sales requests a new preview revision when business evidence, desired tier, or presentation strategy materially changes.

It sends a cancellation when:

- Opportunity is invalid
- Organization identity was wrong
- Outreach must stop
- Preview is no longer appropriate
- Duplicate opportunity was merged

Cancellation is prospective. It does not erase build cost, evidence, or reusable inventory. LiNKsites may recycle suitable work under its inventory policy.

## 33. LiNKsites-to-Sales recycling signal

When a preview is unsold, expired, or withdrawn, LiNKsites may emit a Reusable Preview Inventory event containing:

- Source Preview ID
- Vertical and tier compatibility
- Adaptation effort estimate
- Design and component lineage
- Media and copy replacement requirements
- Restriction or exclusivity flags
- Suitable future preview levels
- Remaining technical validity

It must not expose one prospect's private information to another prospect.

## 34. Offer and quotation boundary

LiNKsites supplies technical catalog facts and optional fulfilment feasibility. Sales/Odoo decides:

- Quoted product and tier
- Price list
- Discounts
- Taxes
- Billing cadence
- Contract dates
- Optional services
- Sales terms
- Expiry

LiNKsites must not infer entitlement from a price amount because prices may vary by currency, campaign, discount, or negotiated agreement.

## 35. Stripe-first checkout flow

The intended initial flow is:

1. Sales/Odoo establishes the customer, offer, quotation, and commercial reference.
2. The payment integration creates or retrieves the Stripe Customer using an idempotent key.
3. It creates the approved Stripe Checkout Session, PaymentIntent, Invoice, or Subscription object.
4. Stripe metadata contains opaque internal correlation references, not sensitive dossiers.
5. The customer completes the Stripe-hosted or approved payment experience.
6. Browser success or cancel redirects improve user experience only.
7. Stripe sends signed webhook events to the Payment Event Ingress.
8. The ingress verifies, stores, deduplicates, and acknowledges the event promptly.
9. A processor interprets current Stripe object state and produces a Payment Verification Record.
10. The Odoo adapter updates the corresponding commercial and accounting records.
11. Reconciliation confirms Stripe fact, Odoo record, order, amount, currency, customer, and entitlement.
12. Sales issues the Paid Website Activation Package.

## 36. Why the browser redirect is not payment proof

A customer may close the browser, revisit a success URL, experience network failure, or complete an asynchronous payment method later. The redirect therefore cannot safely authorize fulfilment.

The authoritative processor signal enters through verified Stripe events and, where needed, a current API retrieval of the affected Stripe object.

## 37. Stripe Event Ingress

The Stripe endpoint must:

- Receive the raw request body
- Verify the Stripe signature against the endpoint secret
- Enforce reasonable timestamp tolerance
- Separate test and live modes
- Record Stripe event ID, type, account, API version, creation time, and payload digest
- Deduplicate repeated deliveries
- Return a successful transport response promptly after durable receipt
- Process business effects asynchronously
- Avoid logging secrets or full payment data
- Support secret rotation
- Permit controlled replay and reconciliation

The endpoint subscribes only to required event types.

## 38. Stripe events are not ordered and may repeat

Stripe webhook delivery can be delayed, repeated, or out of order. Therefore the integration:

- Deduplicates Stripe event IDs
- Recognizes that separate Event objects can describe the same underlying object transition
- Does not rely on event arrival order
- Retrieves current Stripe object state where an event alone is insufficient
- Applies monotonic state rules
- Makes downstream effects idempotent
- Keeps unprocessed events visible until resolved

## 39. Payment Verification Record

```yaml
payment_verification_id: id
stripe_event_ids: []
stripe_object:
  type: checkout_session|payment_intent|invoice|subscription
  id: stripe-id
  livemode: true
verified_state: paid|active|failed|refunded|disputed|requires_action
amount:
  currency: ISO-code
  expected: decimal
  verified: decimal
customer_refs:
  stripe_customer_id: id
  organization_id: id
commercial_refs:
  odoo_quotation_id: optional-id
  odoo_order_id: id
  entitlement_id: id
verification:
  signature_verified: true
  object_retrieved_at: timestamp
  metadata_match: true
  amount_match: true
  currency_match: true
  customer_match: true
  order_match: true
outcome: verified|exception
reason_codes: []
created_at: timestamp
```

This record contains references and payment facts, not card details.

## 40. Payment activation conditions

Initial fulfilment may be authorized only when all required conditions are true:

- Stripe payment or subscription state satisfies the product's activation policy
- Live/test mode matches the target environment
- Expected customer, order, amount, and currency match
- Commercial order is confirmed or confirmable under policy
- Odoo customer and saleable product mappings exist
- No superseding cancellation, refund, fraud, or dispute instruction blocks activation
- Entitlement snapshot is complete
- Required financial approval conditions are satisfied

A payment can be successful while activation remains blocked by a mapping or commercial conflict. That is a reconciliation exception, not permission to guess.

## 41. Odoo synchronization role

Odoo receives normalized commercial facts, not raw provider payloads or LiNKsites execution telemetry.

The adapter should support:

- Customer and contact upsert with controlled matching
- Opportunity update
- Quotation and order confirmation under policy
- Stripe object-reference mapping
- Invoice and payment status synchronization
- Subscription or service-agreement synchronization
- Product and analytic-account mapping
- Launch and service-state summaries
- Refund, credit, dispute, and termination workflow initiation
- Reconciliation reports

## 42. Odoo Community integration approach

LiNKtrend intends to use self-hosted Odoo Community enhanced with reviewed OCA or custom modules. The exact Odoo version and installed module set must be discovered during repository and deployment audit.

The integration should use one supported adapter selected for that deployment, such as:

- A narrow custom Odoo addon exposing authenticated business endpoints
- A supported version-specific external API
- OCA Connector patterns for import/export mapping
- OCA Queue Job for asynchronous Odoo-side work where compatible

The business contract remains independent of the chosen mechanism.

No implementation should assume that an Odoo Online pricing-plan limitation defines what is available in self-hosted Community, nor should it assume an API remains stable across Odoo upgrades. Compatibility must be proven against the installed version.

## 43. Odoo Adapter Service

The recommended adapter is a narrow service boundary with:

- Explicit methods named for business effects
- Version-specific Odoo mappings behind the boundary
- Service identity with minimum permissions
- Idempotency and external-reference constraints
- Asynchronous queue and retry handling
- Structured error codes
- Full correlation
- No arbitrary model/method execution from untrusted contracts

Example operations:

```text
upsert_commercial_organization
record_preview_activity
confirm_paid_order
record_payment_processor_reference
apply_launch_completion
apply_service_status_summary
open_commercial_exception
```

An unrestricted generic endpoint that accepts any Odoo model, method, and arguments is prohibited.

## 44. Odoo commercial mapping record

```yaml
commercial_mapping_id: id
organization_id: id
odoo_company_id: id
odoo_partner_id: id
odoo_opportunity_id: optional-id
odoo_quotation_id: optional-id
odoo_order_id: id
odoo_subscription_or_contract_id: optional-id
odoo_invoice_ids: []
odoo_product_id: id
analytic_account_refs: []
stripe_customer_id: id
stripe_object_refs: []
entitlement_id: id
state: pending|aligned|exception
last_reconciled_at: timestamp
```

## 45. Odoo write authority

Only the Odoo Adapter may perform routine automated cross-Program writes to Odoo for this integration.

It must enforce:

- Company scope
- Allowed model and field set
- State-transition rules
- Amount and currency checks
- External-ID uniqueness
- Analytic-account mapping
- Approval requirements
- Accounting period and lock-date rules
- Audit attribution

LiNKsites itself receives no broad Odoo credentials.

## 46. Financial approval boundary

Strict approvals remain required for at least:

- Refunds
- Credits and write-offs
- Pricing overrides
- Journal entries affecting tax, equity, or liabilities
- Expense allocations and accruals where policy requires
- Month-end close actions
- Outgoing payments

Automation may prepare evidence and draft the action. It may execute only within an explicitly delegated approval policy.

## 47. Paid Website Activation Package

The Paid Website Activation Package defined in Section 14 is the only normal command authorizing initial paid fulfilment.

Its minimum meaning is:

> Sales, payment verification, and Odoo commercial state agree that this identified customer purchased this exact LiNKsites entitlement, and LiNKsites is authorized to create or activate one Customer Site Instance according to the included scope.

The package carries:

- Customer and authorized-contact references
- Odoo quotation/order/subscription or contract references
- Stripe customer and verified payment references
- Product, tier, version, options, and service entitlements
- Preview and foundation lineage
- Desired domain and target dates
- Authority, digest, correlation, and idempotency

## 48. Activation acknowledgement

LiNKsites immediately returns one of:

- Accepted with Customer Site ID
- Duplicate with existing Customer Site ID
- Accepted but waiting for named onboarding dependencies
- Deferred for capacity or approved timing reason
- Rejected for schema or authority failure
- Conflict requiring Sales/Odoo correction
- Unsupported catalog or tier version

It does not return `completed` until launch or the agreed fulfilment endpoint is reached.

## 49. Entitlement snapshot

LiNKsites stores a fulfilment snapshot so that later changes in the current catalog do not silently alter an existing customer's purchased service.

The snapshot includes:

- Product and tier version
- Included page types and components
- Integrations
- Hosting class
- Support and change entitlement
- Backup/recovery profile
- Billing relationship reference
- Start and renewal dates where relevant
- Options and explicit exclusions
- Commercial source IDs

The snapshot is technical evidence, not a substitute for the Odoo commercial record.

## 50. Customer onboarding input contract

Sales may collect onboarding data, but LiNKsites defines the technical schema and validation.

```yaml
customer_input_package_id: id
customer_site_id: id
submitted_by_contact_id: id
authority_scope: content-and-business-facts
facts:
  legal_or_display_name: value
  contact_details: object
  addresses: []
  opening_hours: []
  services_or_products: []
  claims_and_credentials: []
media:
  object_refs: []
  rights_assertions: []
integrations:
  requested: []
domain:
  requested_domain: value
  authority_evidence_ref: ref
approvals:
  terms_or_scope_ref: ref
submitted_at: timestamp
version: integer
```

LiNKsites validates and may request corrections. Sales manages the customer conversation unless a future service channel contract delegates it.

## 51. Authorized contact contract

Commercial and technical actions must distinguish contact identity from authority.

An Authorized Contact record includes:

- Canonical Contact ID
- Odoo contact reference
- Customer or organization
- Verified communication channels
- Authority scopes
- Effective and expiry times
- Source of authority
- Revocation status

Authority scopes may include:

- Supply factual business content
- Approve website content
- Approve domain change
- Request routine service change
- Receive billing notices
- Approve commercial change

One scope does not imply all others.

## 52. Customer approval contract

Where customer approval is required, LiNKsites records an attributable Approval Record and returns a summary to Sales.

The approval identifies:

- Exact site or content release
- Reviewer identity
- Authority scope
- Approval, rejection, or requested change
- Timestamp
- Terms or acknowledgement version
- Evidence channel
- Superseded prior approval

A general email saying “looks good” is insufficient unless the integration captures the exact release and authorized sender.

## 53. Scope-change request

When customer finalization reveals an out-of-entitlement request, LiNKsites sends a Scope Change Assessment.

```yaml
scope_change_assessment_id: id
customer_site_id: id
requested_change: structured-description
current_entitlement_ref: id-version
classification: included|configuration|paid-option|tier-change|custom-exception
technical_impact:
  effort_estimate: range
  dependencies: []
  risks: []
commercial_action_required: true
work_paused_scope: affected-scope-only
```

Sales/Odoo quotes and approves the commercial change. LiNKsites does not enlarge entitlement from customer pressure or an agent's interpretation.

## 54. Entitlement Change Instruction

```yaml
entitlement_change_id: id
customer_site_id: id
prior_entitlement_version: integer
new_entitlement_version: integer
effective_at: timestamp
change_type: upgrade|downgrade|option-add|option-remove|renewal|correction
commercial_refs:
  odoo_order_or_amendment_id: id
  stripe_payment_verification_id: optional-id
new_snapshot: object
proration_or_credit_ref: optional-id
authority_ref: ref
idempotency_key: key
```

LiNKsites validates compatibility, plans migration, and emits completion or exception. Downgrades never destructively remove customer data without a separate retention and authority decision.

## 55. Launch Completion Package

After certified launch, LiNKsites returns:

```yaml
launch_completion_id: id
customer_site_id: id
activation_package_id: id
launch_certificate_id: id
production_release_id: id
published_content_release_id: id
live_domains: []
hosting_assignment:
  frontend_pool_id: id
  region: region
  service_class: class
service:
  state: active
  service_started_at: timestamp
  monitoring_profile: profile
  backup_recovery_profile: profile
quality:
  launch_gate_ref: ref
  residual_nonblocking_items: []
customer_communication:
  handoff_material_ref: optional-ref
correlation_id: id
```

Sales/Odoo uses this package to mark fulfilment and service commencement according to commercial policy.

## 56. Launch does not create accounting policy

LiNKsites reports technical facts such as launch time and active service. Odoo and finance policy determine:

- Invoice timing
- Revenue-recognition treatment
- Contract start treatment
- Deferred revenue
- Analytic allocation
- Tax entries

LiNKsites must never post accounting conclusions merely because a deployment succeeded.

## 57. Commercial status summary to LiNKsites

LiNKsites needs a bounded service instruction, not full accounting access.

Possible commercial service states include:

- Active and entitled
- Payment action required
- Grace period
- Commercial review
- Suspended by authorized instruction
- Reactivated
- Terminating
- Terminated

The message includes effective time, authority, customer site, reason code, and permitted technical action. It excludes unnecessary financial detail.

## 58. Suspension boundary

A failed payment event does not automatically mean “delete or immediately disable the website.”

The sequence is:

1. Stripe establishes the processor event.
2. Sales/Odoo applies dunning, grace, customer standing, and contract policy.
3. An authorized Service State Instruction is issued if technical action is required.
4. LiNKsites applies the least destructive allowed state.
5. Data, domain, backups, and evidence remain preserved according to policy.
6. Reactivation is idempotent.

Emergency security suspension is separate and may originate from LiNKsites security authority.

## 59. Service State Instruction

```yaml
service_instruction_id: id
customer_site_id: id
instruction: suspend|reactivate|terminate|commercial-hold
effective_at: timestamp
reason_code: controlled-code
commercial_record_ref: odoo-ref
authority_policy_id: version
technical_policy:
  public_response_mode: mode
  retain_content: true
  retain_backups: true
  keep_monitoring: true
  allow_forms: false
expires_at: optional-timestamp
sequence_number: integer
idempotency_key: key
```

The consumer rejects stale instructions and conflicts.

## 60. Refund, dispute, and chargeback handling

Stripe events for refunds or disputes create commercial exceptions. They do not directly command LiNKsites to destroy or transfer a site.

Required flow:

1. Verify and record the Stripe event.
2. Synchronize processor and Odoo references.
3. Open a finance/commercial case.
4. Apply strict approval policy where required.
5. Decide entitlement or service-state effect.
6. Issue a versioned Service State Instruction if needed.
7. Reconcile completion.

## 61. Cancellation and termination

Termination must distinguish:

- Cancel at period end
- Immediate commercial termination
- Customer-requested domain transfer
- Export or handoff obligation
- Temporary suspension
- Fraud or abuse emergency
- Platform decommission

LiNKsites returns a Termination Completion Package containing final service state, domain action, export reference if applicable, final backup, retention schedule reference, and unresolved dependencies.

## 62. Website-generated lead handoff

Customer websites may contain contact, booking, quote, or lead forms. The destination depends on the sold integration.

Possible targets include:

- Customer email or customer CRM
- Customer-approved webhook
- An external booking or messaging service
- LiNKtrend Sales only when the submission is for LiNKtrend's own site or an explicitly contracted lead-management service

LiNKsites must not silently place every customer's leads into LiNKtrend's Odoo CRM.

## 63. Form Submission Contract

```yaml
submission_id: id
customer_site_id: id
form_id: id-version
submitted_at: timestamp
route_profile_id: id-version
consent_and_notice_refs: []
payload:
  permitted_fields: object
attachments: []
anti_abuse:
  risk_state: value
  evidence_ref: optional-ref
delivery:
  destinations: []
  idempotency_key: key
retention_profile: profile
```

Sensitive fields, attachments, and destinations follow the site's integration and security policy.

## 64. Post-sale customer communication boundary

Sales owns commercial communication such as:

- Purchase confirmation
- Onboarding requests
- Scope and price changes
- Renewal and payment communication
- Cancellation and commercial standing
- Cross-sell

LiNKsites owns technical communication content such as:

- Input needed for site completion
- Review-ready status
- Launch status
- Incident and maintenance facts
- Technical change completion

The delivery channel may still be operated by Sales or a shared messaging service. Message ownership is separate from transport.

## 65. Support Request Contract

Customer requests entering Sales, email, or a future portal are normalized before LiNKsites receives them.

```yaml
support_request_id: id
customer_site_id: id
requester_contact_id: id
requester_authority_verified: boolean
category: content-change|domain|form|incident|billing|commercial|other
priority: value
description_ref: object-ref
attachments: []
commercial_entitlement_ref: id-version
routing_disposition: linksites|sales|finance|security|mixed
```

Billing requests remain with Sales/Odoo. Technical Issues enter LiNKsites only after identity, scope, and routing validation.

## 66. Incident-to-Sales contract

LiNKsites reports externally meaningful incidents without flooding Odoo with raw alerts.

An Incident Summary includes:

- Incident ID
- Affected Customer Site IDs or service cohort
- Severity
- Customer-visible impact
- Start and current state
- Workaround
- Estimated next update when available
- Communication recommendation
- Resolution and prevention summary when closed

Sales may coordinate customer communication. LiNKsites remains authority for technical incident state.

## 67. Shared-service doctrine

A shared service may be used by multiple Programs when it provides a general capability. Shared deployment does not mean shared ownership of data or unlimited cross-access.

Each shared service must define:

- Service owner
- Consumer Programs
- API or contract
- Tenant and Program partitioning
- Credentials and scopes
- Availability target
- Capacity and quotas
- Cost attribution
- Backup and recovery
- Change and deprecation process
- Exit or replacement path

## 68. Shared Supabase/PostgreSQL boundary

The early platform may use a shared Supabase project or PostgreSQL cluster for operational schemas. Logical separation remains mandatory.

Recommended separation:

- Sales discovery and evidence schema
- Integration Ledger schema
- LiNKsites Program Ledger schema
- LiNKsites working-content schema
- Shared identity and mapping schema
- Observability summaries schema

Controls include:

- Separate database roles
- Row-level security where applicable
- Schema privileges
- Service-specific API keys
- Connection and resource quotas
- Migration ownership
- Per-Program backup and restoration tests
- Capacity monitoring by schema and workload

Raw cross-Program table access is not a contract.

## 69. AdminDB and production capacity rule

No existing Supabase project should be assumed suitable for production merely because data already exists in it. Before reuse, audit:

- Security advisories
- Row-level security
- Exposed tables and functions
- Disk IO and storage headroom
- Pause and billing policy
- Backup and point-in-time recovery
- Connection limits
- Workload isolation
- Staging and production separation
- Ownership and migration history

Capacity alerts or unresolved security findings block production designation until remediated.

## 70. Shared n8n boundary

n8n may execute:

- Stripe event-processing subflows after durable ingress
- Odoo adapter calls
- Sales-to-LiNKsites dispatch
- Notifications
- Scheduled reconciliation
- Low-risk administrative integrations

n8n must not be the sole store for:

- Contract receipt
- Payment verification
- Entitlement
- Approval
- Customer Site state
- Retry history required for audit

Workflow IDs and versions are recorded in Runs. Credentials are scoped by integration.

## 71. LiNKautowork boundary

LiNKautowork is a separate managed-automation factory and product. It may develop or operate reusable automations that LiNKtrend also uses internally, but LiNKsites and Sales do not depend on LiNKautowork as their universal execution layer.

If an automation is supplied by LiNKautowork:

- It is consumed through a versioned service or package contract.
- LiNKsites or Sales remains owner of the business state.
- Failure of LiNKautowork does not erase queued instructions or contract evidence.
- Replacement by another executor remains possible.

## 72. Shared object storage boundary

Large payloads do not travel inline. Contracts reference immutable objects containing:

- Research dossiers
- Screenshots and QA evidence
- Customer media
- Site manifests
- Launch certificates
- Reconciliation reports
- Export packages

Each reference includes object ID, digest, media type, size, encryption/access class, retention profile, and expiry where applicable.

## 73. Shared secrets boundary

Separate secrets are required for:

- Stripe test webhook endpoint
- Stripe live webhook endpoint
- Stripe API operations
- Odoo Adapter
- Sales producer
- LiNKsites consumer
- Object storage
- Messaging providers
- Observability export

One Program does not receive another Program's master credential. Secret rotation must not change business identity or invalidate historical signatures.

## 74. Shared observability boundary

Cross-Program traces use common correlation while preserving data minimization.

Minimum fields:

- Correlation ID
- Contract ID
- Contract type/version
- Producer and consumer
- Organization, opportunity, preview, order, or site ID as appropriate
- Integration attempt and disposition
- Latency
- Error class
- Run and workflow version

Logs do not contain full Stripe payloads, payment credentials, arbitrary customer content, or secrets.

## 75. OpenClaw role

OpenClaw may:

- Review reconciliation cases
- Explain exceptions to Carlos in plain language
- Gather evidence from bounded read-only tools
- Propose a corrective action
- Execute an approved low-risk administrative action through the same contracts
- Track unresolved cases and deadlines

OpenClaw may not:

- Replace the Integration Ledger
- Treat chat memory as commercial authority
- Forge activation or approval messages
- Hold unrestricted Stripe, Odoo, Supabase, and production credentials
- Bypass financial approval
- Create unrecorded customer or entitlement changes

## 76. Failure classification

Cross-Program failures use controlled classes:

| Class | Example | Normal response |
|---|---|---|
| Authentication | Invalid signature | Reject, alert, no processing |
| Schema | Missing required field | Reject with supported-version detail |
| Identity | Odoo customer maps to two organizations | Reconciliation case |
| Authority | Preview budget lacks approval | Reject or hold |
| Duplicate | Same contract and effect already processed | Return prior result |
| Conflict | Same idempotency key, different payload | Stop and investigate |
| Transient transport | Timeout or provider unavailable | Backoff and retry |
| Rate limit | Provider throttling | Respect limits and retry |
| Business precondition | Paid order lacks catalog mapping | Repair workflow |
| Stale sequence | Old suspension after reactivation | Ignore as stale and acknowledge |
| Unknown outcome | Odoo call timed out after possible commit | Query/reconcile before repeat |
| Permanent provider | Deleted or invalid external object | Exception and repair |

## 77. Retry policy

Retries apply only to conditions likely to change without modifying the intended business effect.

Required controls:

- Exponential backoff with jitter
- Maximum attempts and elapsed time
- Provider rate-limit awareness
- Stable idempotency keys
- Per-destination circuit breaker
- Dead-letter or exception transition
- Alert thresholds
- Manual or OpenClaw-assisted replay with evidence

Payments, refunds, Odoo writes, activations, suspensions, and messaging require reconciliation before retry after an unknown outcome.

## 78. Reconciliation doctrine

Webhooks reduce latency; reconciliation establishes completeness.

Scheduled reconciliation compares:

- Stripe events and current objects
- Payment Verification Records
- Odoo customer, order, invoice, payment, and subscription records
- Paid activation packages
- LiNKsites Customer Site Instances
- Launch completion packages
- Service-state instructions and actual live state

Reconciliation is not optional merely because all webhooks appear healthy.

## 79. Core reconciliation reports

At minimum produce:

1. Stripe payments without Payment Verification Records.
2. Verified payments without aligned Odoo records.
3. Paid Odoo orders without activation packages.
4. Activation packages without Customer Site Instances.
5. Customer Site Instances without valid entitlement.
6. Launched sites without Launch Completion acknowledgement.
7. Odoo active contracts mapped to suspended or absent sites.
8. Terminated contracts with active public sites.
9. Duplicate Stripe Customers for one canonical organization.
10. Duplicate or conflicting Odoo mappings.
11. Catalog mappings referencing retired or unknown tier versions.
12. Failed messages beyond retry policy.

## 80. Reconciliation Difference record

```yaml
difference_id: id
reconciliation_run_id: id
difference_type: paid-order-without-activation
severity: value
entities:
  organization_id: id
  odoo_order_id: id
  stripe_object_id: id
  customer_site_id: optional-id
observed_states: object
expected_invariant: text-or-policy-ref
first_detected_at: timestamp
last_confirmed_at: timestamp
status: open|investigating|repairing|resolved|accepted-exception
owner: program-or-role
resolution_ref: optional-ref
```

## 81. Repair workflow

Repair creates explicit Issues rather than editing records invisibly.

Examples:

- Resolve organization mapping
- Retrieve current Stripe object
- Reapply missed Odoo sync
- Regenerate activation package
- Re-emit launch completion
- Correct entitlement snapshot
- Apply missed suspension
- Reverse an incorrect nonfinancial technical state

Every repair preserves the original contract, failure, decision, and outcome.

## 82. Conflict precedence

Precedence depends on the fact:

- Processor payment state: retrieve Stripe object.
- Accounting and invoice state: review Odoo.
- Purchased technical entitlement: reconcile approved Odoo order and versioned catalog mapping.
- Live-site state: inspect LiNKsites.
- Preview availability: inspect LiNKsites.
- Opportunity state: inspect Sales/Odoo.
- Customer identity: use governed organization mapping and Odoo customer master.

There is no universal “Odoo always wins” or “newest event wins” rule.

## 83. Security controls

Cross-Program integrations require:

- TLS
- Verified Stripe signatures
- Signed internal contracts or mutually authenticated service identity
- Least-privilege authorization
- Environment separation
- Replay protection
- Payload size and content limits
- Schema validation
- Secret rotation
- Rate limiting
- IP or network controls where useful but not as sole authentication
- Immutable audit evidence
- Sensitive-data redaction
- Dependency and image scanning
- Security incident playbooks

## 84. Data minimization

Each consumer receives only the fields necessary for its responsibility.

Examples:

- LiNKsites needs payment verification reference and entitlement, not card details.
- Odoo needs summarized service and cost facts, not AI prompts.
- Sales needs preview readiness and presentation limitations, not internal executor logs.
- Stripe metadata needs correlation IDs, not research dossiers.
- OpenClaw receives bounded case evidence, not unrestricted database dumps.

## 85. Environment isolation

Development, test, staging, and production use separate:

- Stripe modes and webhook secrets
- Odoo databases or safe test environments
- Supabase projects or isolated schemas and roles
- Queue namespaces
- contract endpoints
- object-storage buckets or prefixes
- credentials
- domains
- observability labels

Test events can never activate production sites.

## 86. Contract test suite

Every contract type needs:

- Valid examples
- Minimum valid payload
- Maximum expected payload
- Missing-field tests
- Invalid enum tests
- Unsupported major version tests
- Signature failure tests
- Duplicate delivery tests
- Same idempotency key/different digest tests
- Out-of-order sequence tests
- Expired command tests
- Unauthorized actor tests
- Attachment digest mismatch tests
- Consumer backward-compatibility tests

Schemas alone are insufficient; semantic invariants require tests.

## 87. Stripe integration tests

Before live use, prove:

- Test webhook signature verification
- Raw-body preservation
- Duplicate event handling
- Delayed and out-of-order handling
- Checkout completion without browser return
- Asynchronous payment success and failure
- Subscription status changes where used
- Refund and dispute exception creation
- Test/live isolation
- Secret rotation
- Undelivered event recovery
- Current-object retrieval and reconciliation

## 88. Odoo integration tests

Prove against the exact self-hosted version and module set:

- Customer upsert without duplicate creation
- Company scoping
- Product and analytic mapping
- Quotation/order state rules
- External-ID uniqueness
- Payment and Stripe-reference recording
- Unknown-outcome reconciliation
- Permission denial
- Locked-period behavior
- Upgrade compatibility
- Queue failure and replay
- Launch and service summary updates
- Approval enforcement for restricted actions

## 89. End-to-end scenario tests

Minimum scenarios:

1. New prospect to reusable preview to paid site to launch.
2. Existing organization with a second opportunity and second site.
3. Unsold preview recycled for another qualified lead.
4. Duplicate preview request.
5. Payment succeeds but Odoo is temporarily unavailable.
6. Odoo records order but activation delivery repeats.
7. Browser reports success but Stripe payment fails.
8. Stripe events arrive out of order.
9. Customer upgrades tier during finalization.
10. Customer requests an out-of-scope feature.
11. Subscription payment fails and grace policy applies.
12. Authorized suspension followed by reactivation.
13. Refund or dispute produces a commercial case without destructive automatic action.
14. Launch succeeds but acknowledgement is lost and later reconciled.
15. Customer identity mapping conflict blocks fulfilment safely.

## 90. Availability and degradation

Each Program must degrade safely:

- If Sales is unavailable, LiNKsites continues active-site operations and retains outbound results.
- If Odoo is unavailable, Stripe events and contracts remain durably queued; no accounting fact is fabricated.
- If Stripe is unavailable, active websites continue; new checkout and payment verification pause.
- If n8n is unavailable, contracts remain in the Ledger and can be processed by recovery workers.
- If shared Supabase is impaired, public serving should use its designed published-content and cache resilience; mutating workflows pause safely.
- If OpenClaw is unavailable, normal automation continues and exceptions remain queued.

## 91. Service-level objectives

Measure separately:

- Stripe webhook durable-receipt latency
- Payment verification latency
- Odoo synchronization latency
- Preview Request acceptance latency
- Preview production duration by level
- Paid activation acceptance latency
- Launch completion propagation latency
- Integration success rate
- Oldest pending message
- Reconciliation difference age
- Duplicate rate
- Conflict rate
- Manual intervention rate

Targets are configured after baseline measurement; they must not be invented from generic industry averages.

## 92. Cost attribution

Cross-Program integration costs include:

- Preview build and refactor cost
- AI and deterministic executor cost
- Stripe fees
- Odoo hosting and integration cost
- Shared database, queue, object storage, and observability
- Customer-site hosting allocation
- Messaging cost
- Failure, retry, repair, and support cost

LiNKsites supplies attributable technical cost summaries. Odoo records approved accounting allocations. Shared costs use an explicit allocation rule, not arbitrary equal division.

## 93. Audit record

For every commercially material lifecycle, an auditor must be able to trace:

```text
prospect and opportunity
→ preview authorization
→ exact preview release and cost
→ offer and commercial order
→ Stripe processor fact
→ Odoo accounting/commercial record
→ activation authority
→ Customer Site Instance
→ exact launch release
→ active service and later changes
```

The trace uses correlation, causation, stable IDs, digests, and immutable timestamps.

## 94. Repository ownership

The engineering repository structure should distinguish:

- Contract schemas and generated types
- LiNKsites producers and consumers
- Sales producers and consumers
- Stripe ingress and payment-verification processor
- Odoo Adapter and version-specific addon/mapping
- Integration Ledger migrations
- n8n workflow definitions
- Reconciliation jobs
- Test fixtures and contract tests
- Deployment manifests
- Runbooks and dashboards

Contract packages may be shared. Program business logic must not be collapsed into one unowned integration repository.

## 95. Repository audit questions

The audit must determine:

1. Which repository currently implements Sales-to-LiNKsites handoffs.
2. Whether multiple incompatible contract definitions exist.
3. Where prospect, opportunity, order, Stripe, and site identifiers are mapped.
4. Whether systems write directly into each other's tables.
5. How Stripe raw-body signature verification is implemented.
6. Whether webhook events are durably stored before processing.
7. Whether duplicate and out-of-order Stripe events are safe.
8. Whether test and live modes can cross.
9. How Odoo Community is deployed and which version/modules are active.
10. Whether OCA Connector or Queue Job is installed and compatible.
11. Whether an unrestricted Odoo API credential exists.
12. How Odoo external IDs and idempotency are enforced.
13. Whether Stripe-first payment facts reconcile to Odoo.
14. Whether a browser redirect can incorrectly activate fulfilment.
15. Whether paid orders without Customer Site Instances are reported.
16. Whether Launch Completion reliably reaches Sales/Odoo.
17. How catalog and tier versions map into Odoo and Stripe.
18. Whether LiNKsites stores unnecessary CRM or payment data.
19. Whether n8n history is being treated as authoritative state.
20. Whether shared Supabase schemas, roles, RLS, capacity, and security are production-ready.
21. Whether OpenClaw holds credentials or authority beyond oversight needs.
22. Whether service suspension can be triggered by a raw failed-payment event.
23. Whether refunds, credits, and write-offs enforce approvals.
24. Whether reconciliation and repair workflows exist.
25. Whether contract, integration, and end-to-end tests cover failure cases.

## 96. Initial implementation sequence

1. Inventory repositories, Odoo deployment, Stripe objects, n8n workflows, databases, and current integrations.
2. Freeze current direct cross-system writes except necessary operations; document them.
3. Establish canonical IDs and the Identity Mapping Registry.
4. Publish the Product Catalog Contract and mapping rules.
5. Create the common Contract Envelope and schema registry.
6. Implement Integration Ledger, transactional outbox, and consumer inbox.
7. Implement Preview Production Request and Preview Ready Package.
8. Implement signed internal endpoints and acknowledgements.
9. Implement Stripe Event Ingress with durable receipt and verification.
10. Implement Payment Verification Record and reconciliation.
11. Implement the narrow Odoo Adapter for the discovered Community version.
12. Synchronize customer, order, product, Stripe reference, and payment state.
13. Implement Paid Website Activation Package end to end.
14. Implement onboarding input, scope change, entitlement change, and launch completion.
15. Implement service-state, refund/dispute case, and termination contracts.
16. Add scheduled reconciliation reports and repair Issues.
17. Add shared observability, alerts, security controls, and cost attribution.
18. Run failure-injection and end-to-end tests in staging.
19. Shadow existing production behavior before cutover where applicable.
20. Enable one controlled product/tier and expand only after reconciliation remains clean.

## 97. Decisions intentionally still open

The following require later evidence or business decisions:

- Exact Odoo Community version and approved OCA module set
- Whether initial recurring billing uses Stripe Subscriptions, Odoo subscription/service objects, or a governed hybrid representation
- Exact invoice and revenue-recognition policies
- Exact prices, currencies, tax configuration, discounts, and grace periods
- Exact financial approval implementation
- Exact preview-level thresholds and budget ceilings
- Exact transport choice for each contract
- Whether the Integration Ledger uses a dedicated Supabase project or isolated production schemas
- Exact customer portal and approval interface
- Exact form-submission destinations per product tier
- Exact retention, deletion, consent, and legal rules
- Exact service-level objectives after measurement
- Exact shared-service cost-allocation formulas

These are configuration or governed policy decisions. They do not invalidate the ownership and contract architecture defined here.

## 98. Acceptance criteria

This section is implemented only when:

1. Every cross-Program business fact has one named authority.
2. LiNKsites contains no hidden CRM, payment, or accounting authority.
3. Sales remains product-agnostic and can use the same commercial spine for other LiNKtrend products.
4. Stable organization, opportunity, preview, order, entitlement, and customer-site identities are mapped.
5. Contract envelopes are versioned, signed, correlated, idempotent, and schema-validated.
6. Producers use a transactional outbox or equivalent durable publication pattern.
7. Consumers use a durable inbox and safely handle duplicate delivery.
8. Out-of-order events cannot revert a newer business state.
9. Preview Requests carry research, authority, budget, and restrictions.
10. Preview results carry release, quality, cost, limitations, and lineage.
11. Unsold preview work can be recycled without leaking prospect information.
12. Product/tier technical versions map explicitly to Odoo and Stripe commercial objects.
13. Stripe webhook signatures are verified from raw request bodies.
14. Stripe events are durably received before asynchronous processing.
15. Browser redirects cannot authorize fulfilment.
16. Duplicate, delayed, and out-of-order Stripe events are safe.
17. Payment Verification Records reconcile customer, order, amount, currency, mode, and entitlement.
18. Odoo is updated through a narrow, least-privileged, version-aware adapter.
19. Odoo Community and OCA compatibility is proven against the deployed version.
20. Odoo remains the commercial/accounting record while Stripe remains processor-fact authority.
21. Paid fulfilment begins only from a valid Paid Website Activation Package.
22. Repeated activation returns the existing Customer Site Instance.
23. LiNKsites stores an immutable entitlement snapshot with commercial references.
24. Customer inputs and approvals identify authority and exact versions.
25. Out-of-scope requests return to Sales for commercial resolution.
26. Launch Completion propagates reliably and is reconcilable.
27. Failed payments do not directly delete or arbitrarily suspend a website.
28. Refunds and disputes create governed cases and preserve financial approvals.
29. Form submissions route according to the customer's purchased integration.
30. Shared services enforce Program, tenant, credential, and capacity separation.
31. n8n and OpenClaw are not sources of truth.
32. Integration failure cannot erase messages or evidence.
33. Scheduled reconciliation detects missing payment, order, activation, launch, and service-state transitions.
34. Repair work is explicit and auditable.
35. Security, contract, provider, Odoo, and end-to-end tests pass in isolated environments.
36. An auditor can trace prospect through payment, activation, launch, and continuing service.

## 99. Governing conclusion

LiNKsites and LiNKtrend Sales are independent Programs joined by explicit business contracts. Sales owns the product-agnostic commercial journey; LiNKsites owns website production and operation. Stripe processes payments and supplies verified processor facts. Odoo Community, enhanced only through reviewed and version-compatible OCA or custom modules, remains the commercial and accounting system of record. Supabase/PostgreSQL holds operational ledgers and evidence within bounded schemas, not a competing accounting truth.

The integration architecture uses stable identities, a versioned envelope, transactional outboxes, durable inboxes, an Integration Ledger, narrow adapters, acknowledgements, and scheduled reconciliation. Stripe webhook delivery is treated as at least once and potentially out of order. A customer-facing redirect never proves payment. Odoo downtime does not lose Stripe events, and a raw failed-payment event never directly destroys or suspends a site.

The essential paid handoff is the Paid Website Activation Package. It proves that verified Stripe state and the Odoo commercial record align around one exact entitlement. LiNKsites acknowledges the instruction, creates or returns one Customer Site Instance, finalizes the purchased website, and returns an evidence-backed Launch Completion Package. Later upgrades, suspensions, reactivations, and terminations use the same governed approach.

Shared services reduce duplication but do not collapse ownership. n8n may execute integrations, LiNKautowork may supply reusable automation, and OpenClaw may help Carlos resolve exceptions; none replaces the Ledger, the authority matrix, or the Programs themselves. This contract architecture lets a solo, nontechnical owner supervise an autonomous business while retaining traceability and control over commercial, financial, customer, and production consequences.

## 100. Primary technical references

- [Stripe webhook documentation and best practices](https://docs.stripe.com/webhooks)
- [Stripe subscription webhook guidance](https://docs.stripe.com/billing/subscriptions/webhooks)
- [Stripe undelivered-event recovery](https://docs.stripe.com/webhooks/process-undelivered-events)
- [Stripe go-live checklist](https://docs.stripe.com/get-started/checklist/go-live)
- [Stripe Checkout lifecycle](https://docs.stripe.com/payments/checkout/how-checkout-works)
- [Odoo 19 External JSON-2 API](https://www.odoo.com/documentation/19.0/developer/reference/external_api.html)
- [Odoo 19 external RPC API deprecation notice](https://www.odoo.com/documentation/19.0/developer/reference/external_rpc_api.html)
- [Odoo online payment providers](https://www.odoo.com/documentation/19.0/applications/finance/payment_providers.html)
- [Odoo Stripe payment provider](https://www.odoo.com/documentation/19.0/applications/finance/payment_providers/stripe.html)
- [OCA Connector framework](https://github.com/OCA/connector)
- [OCA asynchronous job queue](https://github.com/OCA/queue)

---

**End of Section 21**

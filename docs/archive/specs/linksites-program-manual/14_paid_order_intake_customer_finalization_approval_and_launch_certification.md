# LiNKsites Program Manual

## Section 14 — Paid-Order Intake, Customer Finalization, Approval, and Launch Certification

**Document set:** LiNKsites Program Manual  
**Section:** 14 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, LiNKsites product and engineering agents, LiNKtrend Sales Program designers, Odoo and Stripe integration agents, customer-finalization agents, Payload and frontend agents, hosting operators, QA agents, repository auditors, OpenClaw oversight designers, and future human collaborators  

---

## 1. Purpose of this section

This section defines how LiNKsites converts a verified paid order into a complete, approved, launched, and certified customer website.

It begins when the LiNKtrend Sales Program sends a valid Paid Website Activation Package based on:

- Stripe-confirmed payment state; and
- the corresponding Odoo commercial record.

It ends when the production site is publicly serving the exact certified release, all critical paths are verified, monitoring and recovery baselines exist, and Sales/Odoo has received a Launch Completion Package.

The purpose is to prevent a persuasive pre-sale preview from being treated as production without customer, commercial, content, integration, domain, hosting, and quality finalization.

## 2. Governing doctrine

1. **Payment confirmation precedes paid fulfilment.** LiNKsites does not activate customer work from a browser redirect, email assertion, screenshot, or unverified message.
2. **Stripe and Odoo have different roles.** Stripe processes payment first; Odoo remains the canonical commercial and accounting system; LiNKsites receives a verified, bounded technical instruction.
3. **The sold product is exact.** Every activation references one Product and Tier Specification version plus options and entitlements.
4. **Preview and customer site are separate objects.** The preview supplies lineage and reusable work, but the Customer Site Instance receives its own identity, content, configuration, analytics, domain, and operational state.
5. **Purchase does not publish the preview automatically.** Customer finalization and launch certification remain required.
6. **Provisional material is resolved.** Preview-only copy, media, forms, analytics, and integrations must be confirmed, replaced, completed, or explicitly excluded.
7. **Customer corrections do not erase provenance.** Final content supersedes preview candidates while retaining lineage.
8. **Scope is enforced.** Customer requests outside the purchased entitlement return to Sales for quotation, option activation, or tier change.
9. **Approval is attributable.** Where approval is required, the system records who approved what exact version and when.
10. **Launch is an evidence-backed state.** DNS resolution or a green build alone does not certify a website.

## 3. Authority boundaries

### 3.1 Stripe

Stripe is the intended first processor for LiNKtrend product payments. LiNKsites does not store payment credentials or independently create charges.

### 3.2 Sales Program and Odoo

The Sales Program verifies payment-related events through its commercial workflow and ensures Odoo contains the corresponding customer, quotation, order, subscription, invoice, and entitlement state as applicable.

Sales/Odoo produces:

- Paid Website Activation Package
- Commercial correction or cancellation instruction
- Product/tier change instruction
- Payment-related service instruction
- Customer and authorized-contact references

### 3.3 LiNKsites

LiNKsites validates the activation contract, creates and finalizes the Customer Site Instance, publishes the approved content, provisions or confirms hosting, and certifies launch.

LiNKsites stores commercial foreign identifiers and the technical snapshot necessary for fulfilment. It does not become a second CRM, payment ledger, or accounting system.

## 4. Paid Website Activation Package

The **Paid Website Activation Package** is the only normal cross-Program contract that authorizes initial customer fulfilment.

```yaml
activation_package_id: stable-id
schema_version: version
idempotency_key: unique-key
issued_at: timestamp
issued_by: sales-policy-or-authorized-actor
customer:
  odoo_customer_id: odoo-id
  canonical_organization_id: organization-id
  authorized_contact_refs: []
commercial:
  odoo_quotation_id: optional-id
  odoo_order_id: order-id
  odoo_subscription_id: optional-id
  stripe_customer_ref: stripe-reference
  stripe_payment_ref: verified-payment-reference
  payment_verification_receipt: receipt-id
product:
  product_id: linksites-product-id
  tier_id: tier-id
  tier_specification_version: version
  purchased_options: []
  hosting_class: class
  support_profile: profile
  change_entitlement_profile: profile
  backup_recovery_profile: profile
lineage:
  opportunity_id: odoo-opportunity-id
  preview_id: optional-preview-id
  preview_release_id: optional-release-id
  foundation_id: optional-foundation-version
domain:
  intended_domain: optional-domain
  ownership_or_authority_ref: optional-reference
customer_inputs_status: status
target_dates:
  desired_launch: optional-timestamp
  contract_start: date
authority_signature_or_checksum: value
correlation_id: end-to-end-id
```

The exact envelope may be divided among signed events and referenced records. The logical contents remain required.

## 5. Activation validation

LiNKsites validates:

- Contract schema and supported version
- Package signature, trusted sender, or equivalent authority
- Unique idempotency key
- Customer and organization identity
- Odoo references
- Stripe verification receipt reference
- Product and Tier Specification availability
- Purchased options
- Commercial effective date
- Preview and foundation lineage
- Current preview conversion lock
- Hosting and support class
- Capacity
- Requested domain and timing
- Duplicate or conflicting activation
- Cancellation, refund, or supersession state known at intake

Validation produces one disposition:

- Accepted
- Accepted with explicit onboarding dependencies
- Needs Sales/Odoo correction
- Deferred for approved capacity or timing reason
- Rejected as duplicate, stale, unsupported, or unauthorized

## 6. What is not valid activation evidence

LiNKsites must not activate paid fulfilment from:

- Customer browser success page
- Client-side application state
- Email saying payment was made
- Screenshot of a payment screen
- Agent or salesperson free-text message
- Raw Stripe identifier without verified context
- Odoo quotation without the required order/payment state
- An existing preview with high engagement
- Customer request unconnected to an active commercial record

These may trigger a Sales reconciliation request but not production activation.

## 7. Idempotency and commercial corrections

Re-delivery of the same valid activation package must return the existing Customer Site Instance and status rather than create a duplicate.

If the same idempotency key arrives with different commercial content, reject it as a conflict.

A correction uses a new version or superseding package and states:

- What changed
- Why
- Effective time
- Prior package
- Whether active work may continue
- Whether scope, price, tier, domain, or customer identity changed

LiNKsites never applies last-write-wins blindly to paid entitlement.

## 8. Customer Site Instance

The **Customer Site Instance** is the technical website and managed-service identity for one paying customer entitlement.

It is separate from:

- The Odoo customer
- The Sales opportunity
- The order or subscription
- The prospect preview
- The reusable foundation
- The frontend VPS
- The domain

These objects are connected by references and lifecycles.

## 9. Customer Site Instance record

```yaml
customer_site_id: stable-id
state: activation_received-to-decommissioned
customer_refs:
  canonical_organization_id: organization-id
  odoo_customer_id: odoo-id
commercial_refs:
  activation_package_id: package-id
  odoo_order_id: order-id
  odoo_subscription_id: optional-id
product:
  product_id: product-id
  tier_id: tier-id
  tier_specification_version: version
  options: []
lineage:
  preview_release_id: optional-release
  foundation_id: foundation-version
technical:
  site_specification_id: final-spec-version
  payload_site_id: cms-site-id
  hosting_assignment_id: assignment-id
  domain_assignment_id: optional-assignment
  active_launch_release_id: optional-release
service:
  hosting_class: class
  support_profile: profile
  change_entitlement_profile: profile
  backup_recovery_profile: profile
dates:
  activation_received_at: timestamp
  launched_at: optional-timestamp
  service_started_at: optional-timestamp
```

## 10. Customer Site lifecycle

```text
activation_received
→ activation_validating
→ onboarding_inputs_pending
→ finalizing
→ customer_review_pending when required
→ launch_readiness
→ scheduled_for_launch
→ publishing
→ launching
→ active
```

Later operating states include changing, maintenance, degraded, incident, suspended, terminating, former, and decommissioned.

Every transition identifies trigger, authority, preconditions, outputs, and failure behavior.

## 11. Preview conversion lock

If the order references a preview, activation validation must confirm the conversion lock established in Section 13.

The lock preserves:

- Exact Preview Release
- Payload draft release
- Site Assembly Manifest
- Design profile
- Copy and media versions
- Preview limitations
- Production-replacement list
- Sales presentation evidence where relevant
- Foundation lineage

This ensures that fulfilment begins from what the customer saw rather than whichever preview version happens to be current later.

## 12. Creating the customer instance from a preview

The Program should:

1. Create a new Customer Site ID.
2. Link the preview and foundation lineage.
3. Create customer-scoped working records.
4. Create or assign the customer Payload site identity.
5. Separate preview analytics and form configuration.
6. Copy or reference eligible content and assets through controlled versioning.
7. Create a Final Site Specification based on purchased entitlement.
8. Carry forward every preview limitation and replacement requirement.
9. Release preview-only resources only after finalization policy permits it.

The neutral foundation remains reusable. The customer receives a derived managed site, not ownership of the shared platform by implication.

## 13. Activation without a preview

LiNKsites must also support a valid paid order with no prebuilt preview.

The Program then:

- Matches or creates a foundation according to the purchased tier
- Creates the Customer Site Instance directly
- Collects onboarding inputs
- Produces the Final Site Specification
- Performs normal content, media, CMS, quality, hosting, and launch workflows

The absence of a preview changes lineage and planning, not the product quality obligation.

## 14. Purchased entitlement reconciliation

The order may not match the recommended or demonstrated tier. The system compares:

- Preview proof level
- Recommended tier
- Quoted tier
- Purchased tier
- Purchased options
- Active Tier Specification version

It determines:

- Which preview elements are included
- Which preview elements demonstrate but exceed entitlement
- Which purchased elements are missing from the preview
- Which integrations require customer accounts or credentials
- Which hosting and support class applies
- Which content, media, and page work remains
- Whether technical feasibility has changed

The result is an **Entitlement Reconciliation Record**.

## 15. Entitlement Reconciliation Record

The record should include:

- Purchased product and exact Tier Specification
- Options and add-ons
- Preview scope summary
- Included carry-forward items
- Missing purchased requirements
- Demonstrated but not purchased items
- Production-only requirements
- Unsupported or conflicting commercial promise
- Required Sales correction or quotation
- Estimated remaining work and capacity
- Finalization Gate Profile

LiNKsites must not quietly remove a prominent preview feature after purchase without making the entitlement difference visible to Sales and the customer workflow.

## 16. Final Site Specification

The Final Site Specification supersedes the prospect Site Specification for customer production.

It defines:

- Customer and site identity
- Product, tier, and options
- Final information architecture
- Required pages and sections
- Approved design profile and brand treatment
- Final content and media requirements
- Languages and locations
- Production calls to action
- Forms and integration behavior
- CMS access model
- Domain
- Hosting class
- Analytics
- SEO and indexing behavior
- Quality and launch Gate Profile
- Backup and recovery profile
- Customer approval requirements
- Remaining open inputs and owners

It pins the exact contract under which finalization is executed.

## 17. Customer onboarding inputs

Possible required inputs include:

- Correct business and trading names
- Address and service area
- Telephone, email, and hours
- Services and price information to display
- Credentials and regulated statements
- Team and testimonial approvals
- Logo and brand assets
- Customer-owned photography or media
- Rights assertions for supplied material
- Domain access or DNS authorization
- Booking, analytics, messaging, or other account authorization
- Required policies
- Authorized approvers
- Preferred launch timing

The system should use existing verified research to reduce customer effort. It should ask targeted questions rather than make the customer repeat information already known.

## 18. Input Request Package

Each missing input request should state:

- Customer Site ID
- Exact field, asset, credential reference, or decision required
- Why it is required
- Current candidate value if one exists
- Source and confidence
- Acceptable response formats
- Deadline or launch effect
- Security method for sensitive input
- Whether the site can proceed with an approved fallback
- Owner and follow-up path

Secrets must not be requested through ordinary free-text fields or email when a secure credential workflow is required.

## 19. Onboarding dependency states

Each dependency is:

- Not requested
- Requested
- Received
- Validating
- Accepted
- Rejected with reason
- Waived by authority
- Replaced by fallback
- Expired

The Customer Site Instance may remain `onboarding_inputs_pending` while independent work proceeds. Critical missing inputs block launch readiness, not necessarily all finalization.

## 20. Factual reconciliation

Customer confirmation may:

- Confirm public research
- Correct public research
- Add unpublished facts
- Withdraw information
- Resolve conflicts
- Authorize a marketing transformation

Every correction produces new content or claim versions. The system preserves the preview value and source but marks it superseded for production.

High-risk claims require the approval defined by the applicable content policy. Legal rules will be reconciled later; the data model must preserve evidence and authority.

## 21. Preview-only copy resolution

Each preview-only content item must be:

- Confirmed and promoted to production-approved
- Corrected and superseded
- Rewritten from new authoritative facts
- Omitted
- Replaced with an approved neutral formulation

The final Factual Status Report must contain no unresolved publication-blocking items.

## 22. Media finalization

The Program must resolve each preview media item:

- Customer authentic asset retained
- Prospect-public asset confirmed or replaced according to policy
- Licensed asset confirmed for production scope
- AI-generated asset accepted or replaced
- Placeholder replaced
- Logo confirmed or corrected
- Responsive derivatives regenerated
- Alt text reviewed
- Rights and provenance finalized

The Production Provenance Manifest records the exact approved assets and replaces the preview manifest for launch.

## 23. Design finalization

Customer brand inputs may require controlled changes to:

- Palette
- Typography
- Logo treatment
- Image treatment
- Component variants
- Content emphasis
- Page composition

Changes remain within the purchased tier and compatibility rules. A request for a new component, unrestricted redesign, or unsupported visual system enters the exception and quotation path.

The accepted production Site Design Profile is versioned and validated.

## 24. Integration finalization

Production integrations may include:

- Contact forms
- Booking or scheduling
- Map and directions
- Email or messaging
- Analytics
- Payment or ordering links
- Newsletter
- Other registered adapters

Each integration requires:

- Purchased entitlement
- Customer authorization
- Secure credential reference
- Production destination
- Test account or safe test method
- Failure and fallback behavior
- Observability
- Data-flow description
- Support owner

A demonstration integration cannot be enabled for real visitors until end-to-end production behavior passes.

## 25. Domain and DNS onboarding

The Program records:

- Intended production domain
- Registrant or customer authority
- Existing DNS provider
- Current records
- Email-related record dependencies
- Required changes
- Change authority
- Cutover or migration plan
- Rollback plan
- TLS status

LiNKsites must not overwrite unrelated DNS records or disrupt email. Detailed domain, DNS, and TLS architecture is defined in Section 17.

## 26. Hosting assignment

Before launch, M15 supplies a Hosting Assignment defining:

- Frontend VPS or cluster
- Region
- Shared or dedicated class
- Resource allocation
- Route identity
- Payload published-content connectivity
- Cloudflare and Traefik configuration references
- Monitoring profile
- Backup and recovery class
- Capacity receipt

The initial placement may be based on available shared capacity rather than customer region. Later migrations can group customers regionally without changing the central content authority.

## 27. Scope-change handling during finalization

A customer request is classified as:

- Included correction
- Included option selection
- Included revision
- Tier-entitled change
- Add-on required
- Tier upgrade required
- Separately quoted custom work
- Unsupported

LiNKsites returns a structured Scope Decision. It must not execute unpriced work merely to avoid delaying launch.

Where practical, included work continues while the Sales Program resolves the additional request separately.

## 28. Customer review package

Where review is required, the customer receives a controlled package containing:

- Review URL and access instructions
- Exact candidate release
- Pages and functions included
- Material facts to confirm
- Media and brand treatment
- Calls to action
- Known exclusions
- Production-only behavior not active in review
- Structured method to approve or request changes
- Review deadline and launch effect

The customer should review the website, not an internal engineering artifact.

## 29. Approval models

Product policy may support:

### 29.1 Explicit full-site approval

The authorized customer contact approves one exact candidate release.

### 29.2 Field or issue approval

The customer approves high-risk facts, assets, or decisions while standard production changes follow delegated policy.

### 29.3 Managed-service delegated approval

LiNKsites may publish routine, low-risk changes within a managed entitlement while preserving rollback and notification.

### 29.4 Emergency technical correction

LiNKsites may correct a security, outage, or severe technical defect under an emergency authority profile.

The initial launch approval profile is set by tier, risk, and contract. It must not be guessed per customer.

## 30. Approval Record

```yaml
approval_id: stable-id
customer_site_id: site-id
candidate_release_id: release-id
approval_scope: full-site-fields-assets-other
approved_items: []
excluded_items: []
approver:
  authorized_contact_ref: contact-id
  verification_method: method
decision: approved-changes_requested-rejected-expired
decision_at: timestamp
comments_or_change_request_refs: []
terms_or_acknowledgements_ref: optional-reference
supersedes: optional-approval
```

Approval is invalid if the candidate release changes afterward. A material change requires reapproval according to the approval profile.

## 31. Customer change-request workflow

```text
submitted
→ identity_and_authority_validation
→ entitlement_classification
→ accepted, quotation_required, or rejected
→ working
→ draft
→ review where required
→ publication
→ verified
```

Each request identifies the current active or candidate release, expected outcome, entitlement, and acceptance criteria.

## 32. Final production working package

Finalization produces:

- Final Site Specification
- Entitlement Reconciliation Record
- Customer-approved facts
- Production Copy Bundle
- Production Media and Provenance Manifest
- Production Site Design Profile
- Production integration configuration references
- Domain and hosting readiness references
- Customer approval records
- Final Site Assembly Manifest
- Validation plan
- Cost and Run evidence

The package is validated in Supabase working before controlled Payload draft promotion.

## 33. Launch candidate

A **Launch Candidate** binds:

- Customer Site Instance
- Final Site Specification
- Exact Payload draft release
- Final Site Assembly Manifest
- Frontend platform release
- Design and asset manifests
- Integration configuration
- Hosting Assignment
- Domain/DNS/TLS plan
- Analytics profile
- Monitoring profile
- Backup/recovery profile
- Approval Record
- Launch Gate Profile
- Rollback target and plan

No material input may change during certification without invalidating or narrowing the completed evidence.

## 34. Launch readiness Gate

Before scheduling launch, confirm:

- Paid activation remains valid
- Product and tier remain active
- Customer identity and authorization
- Purchased scope complete
- No unresolved production-blocking facts
- No preview-only media remaining without approved treatment
- Production integrations configured
- Domain authority and DNS plan
- Hosting capacity
- Payload draft promotion receipt
- Customer approval where required
- Monitoring and backup plan
- Rollback target
- Launch timing authority

Failure returns the candidate to the responsible Stage rather than accepting partial readiness.

## 35. Publishing and launching are separate

### 35.1 Publishing

The approved Payload draft becomes the Payload published content release through the process defined in Section 12.

### 35.2 Launching

The production frontend, route, domain, DNS, TLS, caches, integrations, monitoring, and visitor-facing behavior become active and are verified.

A publication may succeed while DNS has not changed. A domain may resolve while the wrong content release is served. Both states must be recorded separately.

## 36. Launch schedule and change window

The launch plan identifies:

- Authorized date and time
- Time zone
- Expected DNS and cache behavior
- Customer or Sales communication checkpoints
- Technical executor roles
- Go/no-go authority
- Rollback conditions
- Observation window
- Dependencies on existing site or provider

Routine automated launches may use standard windows. Complex migrations or enterprise launches may require a coordinated window.

## 37. Launch sequence

1. Revalidate activation, approval, and candidate identity.
2. Verify backup or restore baseline and rollback readiness.
3. Verify hosting capacity and health.
4. Publish the exact approved Payload release.
5. Verify published-content readback.
6. Deploy or activate the exact frontend platform and assembly release.
7. Configure or confirm route, domain, DNS, TLS, and Cloudflare/Traefik state.
8. Revalidate affected routes and caches.
9. Run production smoke tests.
10. Run critical end-to-end tests.
11. Verify monitoring, alerting, and backups.
12. Observe for the defined period.
13. Certify launch or invoke rollback/incident response.
14. Send the Launch Completion Package.

## 38. Production validation

Validate the actual public production route, not only staging.

Checks include:

- Correct domain and redirects
- TLS
- Correct customer and content release
- Required routes
- Navigation and links
- Mobile and desktop rendering
- Forms and destinations
- Telephone, booking, maps, messaging, and other actions
- Analytics identity
- Search/indexing configuration
- Structured data
- Media delivery
- Error and not-found behavior
- Monitoring visibility
- No preview banners, test credentials, or demonstration destinations

## 39. Launch Gate severity

Critical blockers include:

- Wrong customer content
- Secret exposure
- Invalid or unsafe domain control
- Broken primary conversion path
- Unapproved high-risk claim
- Missing required approval
- Cross-tenant access
- Production form routed to a test or unrelated destination
- No rollback for a destructive migration

High and medium findings follow the Launch Gate Profile. A waiver must identify risk, authority, correction deadline, and customer effect.

## 40. Launch Manifest

```yaml
launch_manifest_id: stable-id
customer_site_id: site-id
launch_candidate_id: candidate-id
activation_package_id: package-id
product_and_tier: exact-version
payload_published_release_id: release-id
site_assembly_manifest_id: manifest-version
frontend_platform_release_id: release-id
asset_and_provenance_manifest_id: manifest-id
hosting_assignment_id: assignment-id
domain_and_tls_receipts: []
integration_release_refs: []
analytics_profile_id: profile-id
monitoring_profile_id: profile-id
backup_baseline_ref: reference
rollback_release_id: release-id
launch_gate_receipts: []
customer_approval_id: optional-id
launched_at: timestamp
certified_at: timestamp
```

The Launch Manifest is immutable in effect and reconstructs what entered service.

## 41. Launch Certificate

The **Launch Certificate** states that one Launch Manifest passed the required certification profile.

It includes:

- Certificate ID
- Customer Site ID
- Launch Manifest ID
- Certification profile and version
- Critical test results
- Authorized waivers
- Observation result
- Certifying executor or authority
- Certification time
- Next review or maintenance triggers

Certification is not a general guarantee of future uptime or business results. It proves the launch contract was satisfied at that time.

## 42. Rollback

Rollback may restore:

- Prior Payload published release
- Prior frontend release
- Prior route or configuration
- Prior DNS state where feasible
- Prior integration configuration

The rollback plan defines:

- Trigger conditions
- Authority
- Point of no return, if any
- Data created after launch
- DNS propagation limitations
- Verification steps
- Customer and Sales communication

Rollback must be tested proportionately before launch and verified after execution.

## 43. Baseline backup and restore evidence

Before or immediately around launch according to the backup profile, create or verify a recoverable baseline covering:

- Payload database and published release
- Required object storage
- Site and deployment manifests
- Configuration and routing
- Domain and DNS records snapshot
- Integration configuration references

The Launch Manifest records the baseline. A backup that has never been restorable under the defined procedure is weak evidence; restore testing is defined further in Section 16.

## 44. Post-launch observation

The observation window should watch:

- Availability
- Error rate
- Content-release identity
- Form and action success
- TLS and routing
- Performance
- Database and API errors
- Analytics delivery
- Unexpected crawler or traffic behavior
- Resource saturation

The window and thresholds depend on tier and launch type. Critical failure triggers rollback or incident handling.

## 45. Launch Completion Package

LiNKsites sends Sales/Odoo:

- Customer Site ID
- Production URL
- Launch date and time
- Product/tier and options fulfilled
- Launch Manifest and Certificate references
- Customer approval reference
- Hosting and support state
- Outstanding non-blocking items
- Customer action still required, if any
- Service start confirmation
- Monitoring and health reference
- Operational contact path

Sales/Odoo acknowledges the package and updates customer-facing commercial workflow as appropriate.

## 46. Transition to active service

A Customer Site Instance becomes `active` only after:

- Launch certification
- Production URL verification
- Monitoring active
- Backup baseline recorded
- Support and change entitlement available
- Odoo/Sales fulfilment handoff sent

Active service then enters hosting, monitoring, maintenance, and change workflows defined in later sections.

## 47. Failure and exception handling

### 47.1 Activation package invalid

Do not create duplicate or unauthorized fulfilment. Return a structured Sales/Odoo correction request.

### 47.2 Customer inputs missing

Continue independent work, present targeted requests, apply authorized fallbacks, or hold launch readiness.

### 47.3 Preview and purchase conflict

Create Entitlement Reconciliation and obtain Sales correction before removing demonstrated value or adding unpurchased work.

### 47.4 Customer requests changes after approval

Classify entitlement and create a new candidate release. Prior approval does not cover a materially changed release.

### 47.5 Publication succeeds but launch fails

Record separate states, restore prior serving state if needed, and follow rollback or incident policy.

### 47.6 Odoo sync unavailable after technical launch

Preserve the successful technical artifact, queue an idempotent completion event, and open a commercial reconciliation exception. Do not relaunch the site merely to resend status.

## 48. Payment reversal, suspension, and termination boundary

LiNKsites does not interpret every payment event into immediate destructive action.

Sales/Odoo policy produces an authorized Payment-Related Service Instruction for:

- Warning
- Grace period
- Restriction
- Suspension
- Resumption
- Termination

LiNKsites executes the technical action while preserving recoverability and retention requirements. Detailed suspension and termination behavior appears in hosting and lifecycle sections.

## 49. Autonomous operation

Routine finalization and launch should be as autonomous as possible:

- Validate activation
- Create customer instance
- Reconcile entitlement
- Generate targeted input requests
- Finalize approved content and media
- Configure registered integrations
- Promote drafts
- Run Gates
- Schedule standard launches
- Publish and activate
- Verify production
- Produce manifests, certificates, and handoffs

The system escalates ambiguous commercial promises, unsupported requests, customer identity conflicts, high-risk approvals, domain authority problems, and repeated failures.

## 50. OpenClaw role

OpenClaw may:

- Present onboarding exceptions to Carlos
- Help obtain or clarify customer inputs
- Summarize entitlement conflicts
- Exercise delegated go/no-go or waiver authority
- Coordinate a launch window
- Investigate a failed launch
- Initiate approved rollback

OpenClaw is not part of Stripe verification, Payload serving, frontend routing, or ordinary launch execution. An OpenClaw outage does not invalidate a ready customer site or take an active website offline.

## 51. Cost and performance measurement

Track:

- Activation-to-finalization time
- Customer-input waiting time
- Finalization work time
- Preview replacement rate
- Customer correction rate
- Scope-exception rate
- Integration setup cost
- Domain and DNS setup cost
- Launch test and observation cost
- Failed launch and rollback cost
- Intervention cost
- Time from payment to active service

These measures reveal whether prebuilding actually reduces paid fulfilment cost and which proof levels or foundations create excessive correction work.

## 52. Repository audit questions

The later audit must determine:

1. How Stripe payment events currently reach Odoo and the Sales workflow.
2. Whether a canonical Paid Website Activation Package exists.
3. Whether a browser redirect or manual message can trigger fulfilment.
4. Whether Odoo customer, opportunity, quotation, order, subscription, and payment references are linked consistently.
5. Whether activation handling is idempotent.
6. Whether preview and Customer Site Instance identities are separate.
7. Whether conversion locks the exact preview release.
8. Whether purchased entitlement is machine-readable and reconciled against preview scope.
9. Whether onboarding inputs and secure credential collection exist.
10. Whether preview-only facts, media, analytics, forms, and integrations are identified for replacement.
11. Whether customer approval identifies an exact release and authorized approver.
12. Whether out-of-scope requests return to Sales.
13. Whether production and preview Payload identities are separated correctly.
14. Whether domain, hosting, monitoring, and backup readiness are explicit.
15. Whether publishing and launching are separate states.
16. Whether Launch Manifests, Certificates, and rollback plans exist.
17. Whether production is tested at the public URL.
18. Whether Launch Completion reliably reaches Odoo.
19. Whether OpenClaw is incorrectly embedded in the payment or runtime path.
20. Which existing onboarding, launch, and handoff workflows can be retained or normalized.

## 53. Initial implementation sequence

1. Define Paid Website Activation Package, verification receipt, and trusted sender policy with the Sales Program.
2. Define idempotent activation intake and commercial correction contracts.
3. Define Customer Site Instance and conversion lineage.
4. Define Entitlement Reconciliation and Final Site Specification.
5. Implement customer onboarding dependencies and secure input paths.
6. Implement factual, media, design, integration, domain, and hosting finalization.
7. Define review and Approval Record models.
8. Implement scope classification and Sales quotation return path.
9. Build Final Production Working Package and Launch Candidate.
10. Implement launch readiness, schedule, publication, activation, and public verification.
11. Implement Launch Manifest, Certificate, backup baseline, and rollback.
12. Implement Launch Completion Package and Odoo acknowledgement.
13. Prove preview conversion and paid order without preview.
14. Prove failed activation, customer correction, launch rollback, and Odoo reconciliation paths.

## 54. Decisions intentionally still open

This section does not finalize:

- Exact Stripe products, payment methods, or billing configuration
- Exact Odoo modules and field mapping
- Whether full-site customer approval is required for every tier
- Customer response deadlines
- Secure credential-collection provider
- Launch windows and observation periods
- Exact waiver authorities
- Exact backup timing and restore objectives
- Domain-transfer and ownership policy
- Refund and cancellation policy
- Customer rights to code, content, media, export, or transfer
- Customer CMS access
- Final legal, privacy, and regulated-content rules
- Service suspension and termination timing

These are configurable commercial, legal, financial, and operational decisions. Engineering must not invent them.

## 55. Acceptance criteria

This part of LiNKsites is adequately defined and implemented when:

1. Paid fulfilment begins only from a trusted Paid Website Activation Package tied to Stripe-confirmed and Odoo-recorded commercial state.
2. Client redirects, emails, screenshots, and unverified identifiers cannot activate production work.
3. Activation is idempotent and commercial corrections are versioned.
4. Every customer website has a Customer Site Instance separate from the preview, foundation, Odoo customer, domain, and VPS.
5. Preview conversion preserves the exact demonstrated release and all limitations.
6. A valid paid order without a preview follows a supported direct-production path.
7. Purchased tier and options are reconciled against preview scope.
8. Every production site references an exact Product and Tier Specification version.
9. Missing customer inputs are explicit, attributable, secure where needed, and connected to launch effect.
10. Customer corrections supersede public research without erasing provenance.
11. All preview-only copy, media, forms, analytics, and integrations are confirmed, replaced, omitted, or approved for production.
12. Out-of-scope work cannot enter fulfilment without Sales quotation or authorized entitlement change.
13. Customer approval, where required, identifies the exact candidate release and authorized approver.
14. A material post-approval change triggers reapproval according to policy.
15. A Launch Candidate binds content, frontend, hosting, domain, integrations, monitoring, backup, approval, and rollback.
16. Publishing Payload content and activating the public site are separate verified states.
17. The public production URL passes critical end-to-end validation.
18. Every active site has a Launch Manifest, Launch Certificate, monitoring profile, backup baseline, and rollback target.
19. Launch success is sent idempotently to Sales/Odoo.
20. Payment-related suspension or termination occurs only from an authorized service instruction.
21. Routine finalization and launch can operate autonomously.
22. OpenClaw supports exceptions without becoming part of payment verification or serving.

## 56. Governing conclusion

The moment a prospect pays is not the moment a preview should be switched onto a customer domain. Payment creates authority to begin or complete fulfilment. LiNKsites must still prove that the exact purchased service has been delivered safely.

The Paid Website Activation Package connects Stripe-confirmed payment and Odoo commercial truth to a bounded technical instruction. LiNKsites locks the preview that was sold, creates an isolated Customer Site Instance, reconciles the purchased tier, collects only the missing inputs, resolves every provisional asset and claim, configures real integrations, obtains required approval, and produces one immutable Launch Candidate.

Publication then moves the exact approved Payload draft into live content, while launch activates the actual frontend, domain, TLS, routing, caches, monitoring, and recovery baseline. The site becomes active only after production behavior is verified and certified. This separation protects the customer, preserves the reusable factory, and gives a solo nontechnical owner a system that can complete normal fulfilment autonomously while routing the genuinely consequential exceptions to OpenClaw or Carlos.

---

**End of Section 14**

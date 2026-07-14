# LiNKsites Program Manual

## Section 04 — End-to-End Operating Lifecycle and Program State Model

**Document set:** LiNKsites Program Manual  
**Section:** 04 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, product and engineering agents, repository auditors, implementation agents, operators, OpenClaw overseers, and future human collaborators  

---

## 1. Purpose of this section

This section defines how LiNKsites operates over time. It describes the lifecycles of the Program, its reusable production capabilities, prospect previews, paid customer sites, hosting assignments, work Issues, Runs, and Gates.

An autonomous factory cannot rely on an agent or operator informally deciding what “in progress,” “finished,” “live,” “failed,” or “cancelled” means. Every important object must move through an explicit state model. Each transition must have a known trigger, authority, validation requirement, resulting action, and audit record.

This section establishes those state models at a product and operational level. Later sections define the exact database schemas, event envelopes, executor contracts, quality checks, retry policies, and implementation details.

## 2. Lifecycle principles

All LiNKsites lifecycles follow the principles below.

### 2.1 State is explicit

A website, preview, foundation, Issue, or Run must never be considered complete merely because an executor stopped working or produced a message. Its accepted state must be recorded through the Program's governed control interface.

### 2.2 Transitions are event-driven and validated

A state changes because a recognized event or command satisfies the transition's preconditions. Examples include:

- A valid Preview Production Request is accepted
- A Gate passes
- A verified paid activation package arrives
- A customer approves final content
- A deployment health check succeeds
- Sales sends a recycle instruction
- An authorized suspension command is issued

### 2.3 Every transition is attributable

The system must record:

- Previous state
- New state
- Timestamp
- Triggering event or command
- Actor or service
- Program specification version
- Relevant contract version
- Correlation and causation identifiers
- Evidence or Gate reference
- Reason for exceptional or manual transitions

### 2.4 Idempotency is required

Receiving the same valid event more than once must not create duplicate previews, publish the same content repeatedly, create multiple sites, or apply the same destructive action twice.

### 2.5 Invalid transitions fail closed

Examples of transitions that must be rejected include:

- Publishing content that has not passed the publication Gate
- Launching a site without a valid customer activation package
- Recycling a foundation while an active customer site depends on mutable shared prospect data
- Marking a Run successful without an output contract
- Moving a suspended site directly to decommissioned without required retention actions

### 2.6 Recovery is a lifecycle, not an improvisation

Failures enter defined retry, repair, rollback, degraded, exception, or terminal states. They do not disappear from the record because a later attempt succeeded.

### 2.7 Commercial and technical states remain separate

An Odoo opportunity may be won while technical finalization is still underway. A Stripe payment may be successful while the website is blocked waiting for domain authorization. A technically healthy site may be commercially scheduled for termination.

The Program stores references to commercial state but maintains its own technical state model.

## 3. LiNKsites operating cycles

LiNKsites does not run as one simple linear project. It contains several continuous, interacting operating cycles.

### 3.1 Capability cycle

This cycle creates and improves reusable production capability:

```text
Need or opportunity identified
→ capability specified
→ component, design asset, Vertical Kit, or foundation produced
→ validated
→ approved for production
→ used and measured
→ improved, deprecated, or retired
```

### 3.2 Prospect-proof cycle

This cycle produces and manages build-first sales proof:

```text
Preview request accepted
→ foundation matched or created
→ prospect adaptation produced
→ Payload draft promoted
→ preview deployed and validated
→ Sales receives preview
→ engagement/outcome received
→ upgrade, hold, recycle, convert, or retire
```

### 3.3 Customer-fulfilment cycle

This cycle converts a paid order into a production website:

```text
Paid activation accepted
→ customer inputs reconciled
→ site finalized
→ customer/authority approval where required
→ launch readiness passed
→ content published
→ domain and runtime activated
→ launch certified
```

### 3.4 Managed-service cycle

This cycle operates continuously after launch:

```text
Observe
→ detect
→ classify
→ maintain or remediate
→ verify
→ record
→ repeat
```

### 3.5 Change cycle

This cycle processes future content or technical changes:

```text
Authorized request
→ entitlement and feasibility check
→ working change package
→ Payload draft
→ preview and approval as required
→ publish
→ revalidate
→ close request
```

### 3.6 Service-end cycle

This cycle handles suspension, export, termination, retention, and decommissioning:

```text
Authorized service instruction
→ customer/site state protected
→ warning or suspension
→ export/retention actions
→ decommission
→ final deletion only after authority and retention conditions
```

## 4. Program Controller state model

The Program Controller manages whether LiNKsites may accept and dispatch work. OpenClaw observes and assists but does not constitute the Controller.

| State | Meaning | New dispatches | In-flight work |
|---|---|---|---|
| `initializing` | Program definition, contracts, executors, and dependencies are being validated | No | None or initialization only |
| `running` | Normal production | Yes | Continues |
| `pausing` | Transitioning toward a safe pause | No new ordinary dispatches | Reaches defined safe checkpoints |
| `paused` | Normal work is held intentionally | No | None except permitted monitoring/safety work |
| `draining` | Completing selected work before maintenance, migration, or deployment | Only explicitly permitted work | Continues until drain conditions pass |
| `degraded` | One or more dependencies are impaired; only safe subsets continue | Restricted by policy | Safe work continues |
| `emergency_stopped` | Immediate protected stop because continued execution may cause harm | No | Cancelled or isolated according to emergency policy |
| `disabled` | Program intentionally unavailable pending manual enablement | No | None except safety monitoring |
| `retired` | This Program specification or deployment is permanently withdrawn | No | None |

### 4.1 Initialization

The Controller may enter `running` only after validating, at minimum:

- Active Program specification version
- Required Module and Stage definitions
- Contract registry availability
- Required Gate suites
- Database connectivity
- Artifact storage connectivity
- Minimum executor availability
- Payload and frontend dependency state appropriate to the enabled work classes
- Secret references and access policy
- Emergency and rollback configuration

Initialization must fail closed if a missing dependency would permit invalid publication, cross-customer access, or unreconstructable Runs.

### 4.2 Pausing

A pause is orderly. The Program stops ordinary new dispatches and allows Runs to:

- Complete safely
- Save a checkpoint
- Release a lease
- Roll back an incomplete side effect
- Enter a defined waiting state

The pause command must specify whether monitoring, backups, emergency recovery, certificate renewal, and other safety work remain enabled.

### 4.3 Draining

Drain mode is used before:

- Program deployment
- Database migration
- Runtime replacement
- Regional frontend maintenance
- Major contract-version change

The drain policy identifies which Runs may finish and which new high-priority safety Issues may still be created.

### 4.4 Degraded operation

Degraded state must identify the impaired dependency and permitted capabilities. Examples:

- Sales integration unavailable: existing hosting continues; new preview intake waits.
- Payload unavailable: public cached sites continue where possible; content publication pauses.
- One regional VPS unavailable: affected sites fail over or receive remediation; other regions continue.
- Object storage impaired: operations requiring new media block; existing public sites continue if safe.
- OpenClaw unavailable: normal Program operation continues without change.

### 4.5 Emergency stop

Emergency stop is reserved for threats such as:

- Suspected cross-customer data exposure
- Compromised production credentials
- Runaway destructive automation
- Uncontrolled cost escalation
- Invalid mass publication
- Severe database corruption risk

Emergency stop authority and recovery requirements are defined by the authority model. Restart requires explicit incident resolution and initialization checks.

## 5. Program definition lifecycle

The LiNKsites Program itself is versioned.

| State | Meaning |
|---|---|
| `draft` | Definition is being written and cannot control production |
| `review` | Definition is undergoing product, technical, and operational review |
| `approved` | Approved for implementation or controlled deployment |
| `shadow` | Executes against real or representative events without controlling production side effects |
| `pilot` | Controls a limited approved scope |
| `production` | Approved for normal operation |
| `deprecated` | Still supported temporarily but no new adoption |
| `retired` | No longer executable |

Every Run must pin the Program definition version under which it was created. Updating the Program definition must not silently change active Runs.

## 6. Reusable capability lifecycle

Components, blocks, design rules, Tier Specifications, Vertical Kits, prompts, schemas, and test suites share a governed capability lifecycle.

```text
proposed
→ designing
→ implemented
→ validating
→ approved
→ active
→ deprecated
→ retired
```

An active capability may also enter:

- `suspended` when a defect or license concern requires temporary removal
- `repairing` while a corrective version is produced

### 6.1 Production eligibility

Only `active` capability versions may be selected automatically for new production. `deprecated` versions may remain attached to existing sites temporarily but should not be selected for new foundations unless a controlled exception exists.

### 6.2 Immutability of versions

An approved version must not be modified in place in a way that prevents reconstruction. Corrections produce a new version and a migration decision.

## 7. Vertical Kit lifecycle

Vertical Kits require a more specific lifecycle because they combine product assumptions, content patterns, design rules, and conversion structures.

| State | Meaning |
|---|---|
| `candidate` | Vertical opportunity identified |
| `researching` | Business, audience, content, and conversion patterns being studied |
| `designing` | Kit structure and tier variations being defined |
| `building` | Assets, components, schemas, and foundations being produced |
| `validating` | Quality, factual, functional, and usability checks underway |
| `pilot_ready` | Approved for limited preview production |
| `active` | Approved for normal use |
| `refresh_required` | Still present but too stale for automatic new use |
| `suspended` | Temporarily unavailable |
| `deprecated` | Existing use supported; no new automatic adoption |
| `retired` | Removed from active production |

Usage and sales data may cause an active kit to be improved, split into subverticals, consolidated, or retired.

## 8. Reusable Site Foundation lifecycle

A Reusable Site Foundation is one of the Program's most economically important objects.

| State | Meaning |
|---|---|
| `planned` | Foundation need approved but production not begun |
| `building` | Foundation is being assembled |
| `validating` | Technical and visual validation underway |
| `available` | Eligible for matching to preview requests |
| `reserved` | Temporarily reserved for a preview request |
| `adapted` | One or more prospect adaptations exist |
| `customer_derived` | A customer site was produced from the foundation; reusable base remains governed separately |
| `refresh_required` | Quality, dependency, content, or design refresh required before new use |
| `repairing` | Defect correction underway |
| `suspended` | Automatic use blocked temporarily |
| `deprecated` | Existing derived sites may remain; no new selection |
| `retired` | Foundation cannot be selected again |

### 8.1 Foundation assignment

The system must distinguish:

- The versioned reusable foundation
- Each prospect-specific adaptation
- Each customer production instance

Customer-specific changes must not mutate the reusable foundation in a way that changes another prospect or customer site unexpectedly.

### 8.2 Reservation

Reservation may be:

- Exclusive for a limited time
- Non-exclusive when the foundation supports parallel isolated adaptations
- Capacity-limited according to campaign or product policy

Expired reservations release automatically after validation that no active Run still depends on them.

### 8.3 Refresh and retirement

A foundation may require refresh because of:

- Framework or component changes
- Visual staleness
- Poor conversion performance
- Accessibility failure
- Performance regression
- License change
- Repeated rejection reason
- Vertical Kit change
- Security issue

Retirement must preserve historical manifests and derived-site lineage.

## 9. Preview lifecycle

Each prospect preview is a separate object even when several previews share one foundation.

```text
requested
→ request_validating
→ authorized
→ foundation_matching
→ reserved
→ adapting
→ working_package_ready
→ payload_draft_ready
→ preview_deploying
→ quality_review
→ ready_for_sales
→ presented
→ engaged / inactive / rejected / expired
→ upgrading / holding / recycling / converted / retired
```

### 9.1 Requested

A Preview Production Request has arrived but has not yet passed contract, budget, research, or duplication checks.

### 9.2 Authorized

The request is valid and within the Sales Program's delegated proof-investment authority. Authorization pins:

- Proof level
- Maximum cost or budget class
- Recommended tier
- Vertical Kit
- Deadline
- Expiration
- Required personalization

### 9.3 Foundation matching

The Program ranks available foundations using fit, quality, cost, previous performance, and required change. It may authorize a new foundation only under the applicable inventory policy.

### 9.4 Adapting

The prospect-specific layer is being produced. At this state, no output is public or sales-ready.

### 9.5 Working package ready

Candidate content, media, configuration, and provenance have passed working-layer validation and may be promoted to Payload draft.

### 9.6 Payload draft ready

The trusted Promotion Service has created or updated draft content. The preview may be rendered privately for validation.

### 9.7 Quality review

Required checks may include:

- Schema and reference validation
- Previous-prospect leakage scan
- Functional tests
- Responsive rendering
- Visual evaluation
- Accessibility
- Performance appropriate to preview class
- Broken links
- Contact-route safety
- Placeholder and unsupported-claim checks

### 9.8 Ready for Sales

The Preview Ready Package is complete, including preview URL, proof, limitations, expiration, analytics reference, and cost.

### 9.9 Presented

Sales has used or delivered the preview through an approved commercial interaction. LiNKsites records presentation only from a Sales event, not from assumptions based solely on link access.

### 9.10 Engaged

The prospect has produced a meaningful signal that may justify continued investment, such as a reply, return visits, a request, a call, or an agreed follow-up.

### 9.11 Upgrading

Sales authorizes movement to a higher proof level. The upgrade creates new Runs and versioned outputs; it does not overwrite evidence of the earlier proof.

### 9.12 Holding

The preview remains preserved for a defined period because the opportunity is still active or delayed.

### 9.13 Recycling

The prospect adaptation is removed or archived according to policy. The reusable foundation is cleansed, validated, cost-adjusted, and returned to inventory.

### 9.14 Converted

A valid Paid Website Activation Package references the preview. The preview becomes the basis for a Customer Site Instance. Conversion does not itself make the preview production-live.

### 9.15 Retired

The preview is no longer eligible for commercial use. Historical evidence remains according to retention policy.

## 10. Customer Site Instance lifecycle

The Customer Site Instance represents the technical website supplied to a paying customer.

```text
activation_received
→ activation_validating
→ onboarding_inputs_pending
→ finalizing
→ customer_review_pending (when required)
→ launch_readiness
→ scheduled_for_launch
→ publishing
→ launching
→ active
→ changing / maintenance / degraded / incident
→ suspended / terminating
→ former / decommissioned
```

### 10.1 Activation received and validating

The Program validates:

- Customer and order identifiers
- Purchased tier and options
- Verified activation authority
- Preview/foundation reference
- Product version availability
- Capacity
- Required customer inputs
- Domain state
- Support and hosting entitlement
- Duplicate activation/idempotency

### 10.2 Onboarding inputs pending

The site cannot complete finalization until specific inputs or approvals are available. Missing inputs are explicit, assigned, time-bound where appropriate, and reported to Sales/Odoo.

### 10.3 Finalizing

The Program completes the purchased tier, replaces preview-only material, reconciles facts, applies customer assets, configures integrations, and prepares production content.

### 10.4 Customer review pending

Where the product or risk policy requires customer approval, the system provides a controlled review version and records approval, requested changes, or expiration.

### 10.5 Launch readiness

All required production Gates are evaluated. Failure returns the site to the appropriate repair Stage rather than allowing partial launch.

### 10.6 Scheduled for launch

The site is ready but awaits an approved launch window, domain event, commercial date, migration coordination, or other valid condition.

### 10.7 Publishing and launching

These are separate states:

- `publishing` promotes the approved content version.
- `launching` activates routing, domain, TLS, cache, runtime assignment, and final end-to-end verification.

### 10.8 Active

The customer site is publicly operating under its managed-service entitlement.

### 10.9 Changing

An approved content, design, integration, or tier change is underway. The currently active version should normally remain available until the change passes and is published.

### 10.10 Maintenance

Planned technical maintenance is underway. Customer impact and maintenance window rules follow the service class.

### 10.11 Degraded

The site remains partly available but one or more required capabilities are impaired. The state must include affected capability, customer effect, remediation state, and verification plan.

### 10.12 Incident

The site has a material unplanned failure or security/availability event requiring incident handling.

### 10.13 Suspended

Public or administrative access is restricted according to an authorized instruction. Suspension should preserve recoverability and must not be treated as deletion.

### 10.14 Terminating

Export, notice, retention, integration disconnection, and decommissioning actions are underway.

### 10.15 Former

The active service relationship has ended, but retained backups, export windows, or records remain.

### 10.16 Decommissioned

Active resources and routes are removed, required retention evidence exists, and no continuing service is supplied. Final deletion is a separate retention-policy action.

## 11. Content lifecycle

Website content moves through a one-way governed lifecycle.

```text
candidate
→ validated_working
→ promotion_approved
→ payload_draft
→ previewed
→ publication_approved
→ published
→ superseded / withdrawn / archived
```

### 11.1 Candidate

Content may be produced by research transformation, customer input, templates, deterministic rules, or AI. It is not yet trusted.

### 11.2 Validated working

Schema, provenance, required fields, factual status, and policy checks pass sufficiently for draft promotion.

### 11.3 Payload draft

Payload owns the draft record. Working-layer records retain mapping and promotion receipt.

### 11.4 Publication approved

The content version has passed the required quality and authority Gates.

### 11.5 Published

Public frontend consumption is permitted. The exact published version, checksum, and revalidation receipt are recorded.

### 11.6 Superseded or withdrawn

A newer version replaces the content, or the content is removed from public use. History and restoration behavior follow retention policy.

## 12. Media asset lifecycle

Media must preserve origin, rights, processing, approval, and usage.

```text
discovered / supplied / generated
→ quarantined_candidate
→ provenance_recorded
→ rights_checked
→ processed
→ quality_validated
→ approved
→ registered_in_payload
→ in_use
→ replaced / expired / restricted / archived / deleted
```

Raw candidates do not become production assets automatically. Derivatives must reference their source, transformation, checksum, and approved usage.

## 13. Hosting assignment lifecycle

Each site has a hosting assignment separate from the content state.

| State | Meaning |
|---|---|
| `unassigned` | No production runtime selected |
| `planned` | Runtime/region selected but not provisioned |
| `provisioning` | Routes, configuration, runtime, and checks being prepared |
| `ready` | Hosting target is prepared for launch |
| `active` | Site is served from this assignment |
| `migrating` | Controlled move to another runtime or region |
| `degraded` | Assignment impaired but not fully unavailable |
| `failed_over` | Service temporarily or permanently served elsewhere |
| `suspended` | Serving intentionally restricted |
| `deprovisioning` | Resources and routes being safely removed |
| `released` | Assignment no longer active |

Migration must not require content duplication into a separate database merely because the frontend runtime changes.

## 14. Customer Change Request lifecycle

```text
received
→ identity_and_authority_check
→ entitlement_check
→ clarification_required / quotation_required / accepted
→ scheduled
→ implementing
→ draft_ready
→ approval_pending (if required)
→ publishing
→ verifying
→ completed / failed / cancelled
```

If a request exceeds entitlement, LiNKsites returns a structured commercial-action request to Sales rather than making an unauthorized commitment.

## 15. Issue lifecycle

An Issue is one atomic schedulable piece of work.

| State | Meaning |
|---|---|
| `draft` | Defined but not eligible for execution |
| `blocked` | A dependency, input, Gate, capacity, or authority condition is unsatisfied |
| `ready` | All entry conditions pass and dispatch is permitted |
| `dispatched` | Assigned to an executor and awaiting claim |
| `running` | At least one active Run is executing |
| `awaiting_gate` | Run output exists and requires acceptance evaluation |
| `retry_scheduled` | Another Run is authorized after a retryable failure |
| `repair_required` | A different corrective Issue is needed |
| `exception` | Normal policy cannot resolve the Issue |
| `cancelled` | Authorized cancellation completed |
| `failed` | Terminal failure under current policy |
| `completed` | Required output accepted by the applicable Gate |

An Issue may have several Runs. The Issue completes only when an acceptable Run output passes its required Gate or when an approved alternative completion condition exists.

## 16. Run lifecycle

| State | Meaning |
|---|---|
| `created` | Run record created with pinned inputs and versions |
| `queued` | Waiting for executor capacity |
| `claimed` | Executor has obtained a lease |
| `executing` | Work is underway |
| `checkpointed` | Safe resumable state recorded |
| `succeeded` | Executor returned a contract-valid candidate output; Gate not necessarily passed |
| `failed_retryable` | Failure may be retried under policy |
| `failed_terminal` | Run cannot be retried under the same conditions |
| `timed_out` | Deadline or lease expired |
| `cancel_requested` | Cancellation initiated |
| `cancelled` | Execution ended safely |
| `compensating` | Side effects are being reversed or neutralized |
| `compensated` | Defined compensation completed |

`succeeded` does not mean `accepted`. It means the executor completed and produced an output eligible for Gate evaluation.

## 17. Gate lifecycle

| State | Meaning |
|---|---|
| `pending` | Gate exists but prerequisites are incomplete |
| `ready` | Required artifacts and evidence are available |
| `evaluating` | Automated, policy, or approval checks are executing |
| `passed` | All required conditions satisfied |
| `failed` | One or more required checks failed |
| `blocked` | Evaluation cannot complete because of missing dependency or authority |
| `approval_pending` | A delegated or protected approval is required |
| `overridden` | Authorized exception recorded with scope, reason, and expiry |
| `expired` | Gate result is no longer valid because time or inputs changed |

A Gate may apply to a Run, Issue, Stage, Module, handoff, publication, launch, or other defined subject. It must not be restricted technically to `run_id` alone.

## 18. Exception lifecycle

An exception is created when approved automated policy cannot safely determine or execute the next action.

```text
detected
→ evidence_collecting
→ classified
→ auto_runbook_eligible / openclaw_required / carlos_required
→ action_authorized
→ remediation
→ verification
→ resolved / unresolved / accepted_risk
```

An Exception Package should include:

- Affected object and customer scope
- Current state
- Expected state
- Evidence
- Failure history
- Actions already attempted
- Cost and customer impact
- Safe options
- Recommended action
- Required authority
- Deadline

## 19. Event requirements

Every lifecycle transition should emit or record a structured event containing at least:

```text
event_id
event_type
event_schema_version
occurred_at
producer
program_id
program_version
tenant_or_customer_scope
entity_type
entity_id
previous_state
new_state
correlation_id
causation_id
idempotency_key
actor_or_executor_id
contract_refs
artifact_or_proof_refs
reason_code
```

Events are append-only facts. Current state may be materialized for efficient operation, but it must be reconcilable against the event and Run history.

## 20. Timeout and expiration doctrine

Every waiting state must define whether and when it expires.

Examples include:

- Preview request authorization expiration
- Foundation reservation expiration
- Preview presentation expiration
- Customer review deadline
- Domain authorization wait
- Executor lease timeout
- Gate validity period
- Suspension grace period
- Export availability window

Expiration must produce a defined next state such as hold, recycle, exception, cancellation, or termination. It must not leave work permanently ambiguous.

## 21. Concurrency doctrine

The Program must support parallel work without cross-contamination.

Concurrency rules must protect:

- Foundation version integrity
- Prospect adaptation isolation
- Customer site isolation
- Payload draft versions
- Publication order
- Hosting migrations
- Change-request ordering
- Shared component releases
- Capacity budgets

Conflicting writes require optimistic version checks, leases, queues, or another explicit concurrency mechanism. “Last writer wins” is not acceptable for customer content or production configuration unless deliberately defined for a safe field.

## 22. Lifecycle observability

At any time, an authorized observer should be able to determine:

- Program Controller state
- Active Program version
- Work volume by Module and Stage
- Blocked and exceptional Issues
- Active Runs and executor leases
- Gate failures
- Preview inventory states
- Preview ageing and recycling queue
- Customer sites awaiting inputs or approval
- Launch queue
- Active, degraded, incident, suspended, and terminating sites
- Hosting placement and migration state
- Cost and capacity pressure

Plane may mirror selected information for humans, but canonical state belongs to the governed Program systems.

## 23. Lifecycle acceptance criteria

The lifecycle design is correctly implemented only when:

1. Every important object has a documented state machine.
2. State transitions are validated, attributable, and idempotent.
3. Program control continues without OpenClaw.
4. Technical state does not collapse into Odoo or Stripe commercial state.
5. A preview can be upgraded, held, recycled, converted, or retired without ambiguity.
6. Reusable foundations remain separate from prospect and customer instances.
7. Successful executor completion does not bypass Gate acceptance.
8. Draft content cannot become published through an invalid transition.
9. Paid activation does not equal automatic launch.
10. Hosting placement can migrate independently from content authority.
11. Suspended does not mean deleted.
12. Timeouts and waiting states have defined outcomes.
13. Concurrent work cannot leak or overwrite another prospect or customer.
14. Historical Runs and states remain reconstructable after retries and repairs.

## 24. Governing conclusion

LiNKsites is a continuous operating Program with several coordinated lifecycles rather than a one-time website project. Reusable capability, prospect proof, customer fulfilment, content publication, hosting, maintenance, change, and service termination each have their own state while remaining linked through stable identifiers and events.

This stateful design is what makes safe autonomy possible. The Program can decide what work is eligible, what is blocked, what may be retried, what must be reviewed, what can be recycled, and what is genuinely complete without depending on human memory or an AI agent's informal interpretation.

---

**End of Section 04**

# LiNKsites Program Manual

## Section 22 — OpenClaw Oversight, Exceptions, Authority Levels, and Human Intervention

**Document set:** LiNKsites Program Manual  
**Section:** 22 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, LiNKsites product and engineering agents, OpenClaw administrators, security and infrastructure operators, policy-engine implementers, incident and support designers, repository auditors, and future human collaborators  

---

## 1. Purpose of this section

This section defines how LiNKsites remains autonomous while allowing Carlos to supervise it through OpenClaw and intervene when judgment, authority, or exceptional risk requires a human decision.

It defines:

- OpenClaw's exact role and exclusions
- Carlos's retained authority
- Program autonomy modes
- Action-risk classes
- OpenClaw authority levels
- Deterministic policy and capability enforcement
- Exception detection, packaging, triage, decision, and closure
- Human and customer approvals
- Emergency containment and safe resumption
- Credential, tool, channel, memory, and prompt-injection controls
- Approval and override records
- Alerting and briefing behavior for a solo nontechnical owner
- Failure, outage, testing, audit, and implementation requirements

The objective is high autonomy with selective, meaningful intervention—not constant supervision and not uncontrolled AI authority.

## 2. Plain-English answer

OpenClaw acts like Carlos's AI operations chief of staff.

It watches the Program through approved read interfaces, explains what is happening in plain language, groups related alerts, investigates within bounded permissions, prepares a decision packet, executes safe runbooks when explicitly allowed, and asks Carlos only for decisions that actually require him.

OpenClaw is not:

- The LiNKsites Program Controller
- The queue or Program Ledger
- The monitoring platform
- The policy engine
- The executor for every Issue
- The holder of all credentials
- The source of business truth
- Carlos's legal or cryptographic identity
- A mandatory dependency for serving, monitoring, backing up, or repairing routine site operations

If OpenClaw is unavailable, normal autonomous LiNKsites work continues. Exceptions wait safely or use an alternate notification route.

## 3. Governing doctrine

1. **LiNKsites is autonomous by default for routine, known, reversible work.**
2. **The Program Controller owns normal progression.** OpenClaw does not dispatch or approve every Issue.
3. **Policy is deterministic.** Model output cannot grant authority, enlarge budgets, or override a Gate.
4. **OpenClaw is a replaceable oversight adapter.** The contracts do not depend on its internal memory or prompt format.
5. **Carlos is the sole human final authority at the present stage.**
6. **Human attention is reserved for exceptions and protected decisions.**
7. **Permission follows the action, not the agent's confidence.**
8. **A safer stop is easier than a risky start.** The system may pause or contain more readily than it may resume.
9. **No actor approves its own unsupported output.**
10. **Approvals are specific, attributable, expiring, and auditable.**
11. **OpenClaw never impersonates Carlos.**
12. **Human instructions are inputs to policy, not invisible bypasses.**
13. **An unsupported human instruction may be challenged.** The system explains the conflict and requests an explicit override where permitted.
14. **OpenClaw receives narrow capabilities, not standing universal secrets.**
15. **Every exceptional action produces evidence and post-action verification.**

## 4. Why OpenClaw is external to the Program

LiNKsites must consistently create, launch, host, maintain, and update sites even if the preferred human-assistant interface changes.

Keeping OpenClaw external ensures:

- A chat outage does not stop sites.
- An OpenClaw upgrade does not change Program state semantics.
- A prompt cannot rewrite the state machine.
- Another assistant or human console can later use the same oversight contracts.
- Security permissions remain enforceable outside the model.
- Carlos can replace OpenClaw without rebuilding LiNKsites.
- Exceptions remain visible when no assistant is connected.

## 5. Control-plane separation

LiNKsites uses four distinct planes:

| Plane | Purpose | Primary components |
|---|---|---|
| Execution plane | Performs Issues | Scripts, services, n8n, browser workers, AI runtimes |
| Control plane | Owns states, scheduling, Gates, retries, budgets, and policy | Program Controller, Program Ledger, policy and capability brokers |
| Observability plane | Measures and alerts | Metrics, logs, traces, alerting, incident records |
| Oversight plane | Helps a human understand and govern exceptions | OpenClaw, approval interface, Carlos |

OpenClaw belongs to the oversight plane. It consumes controlled views from the other planes but does not replace them.

## 6. OpenClaw as an oversight adapter

LiNKsites exposes an **Oversight API** and structured case contracts. OpenClaw translates between:

- Human language and structured queries
- Exception evidence and plain-English explanation
- Carlos's explicit decision and an Approval Record
- An approved runbook and a bounded execution request

The adapter model means a future LiNK Executive Agent, another open-source assistant, or a human operations console can implement the same interface.

## 7. Carlos's role

Carlos is LiNKtrend's founder, current sole human operator, and final business authority.

The system must account for two realities:

- Carlos should not have to perform routine technical administration.
- Some decisions cannot safely or appropriately be delegated to automation or OpenClaw.

Carlos receives concise decisions with recommended options, evidence, impact, urgency, reversibility, and cost. He should not need to read raw logs or understand infrastructure jargon to make an informed decision.

## 8. Carlos-protected decisions

Unless Carlos later delegates them through an explicit policy, he retains decisions involving:

- Material unbudgeted spending
- Pricing, discount, credit, or refund exceptions
- Outgoing payments and protected accounting actions
- Destructive or irreversible data actions
- Material customer-contract or entitlement exceptions
- Legal or regulatory commitments
- Security incidents with unresolved material exposure
- Changes to ownership, domains, or administrative authority
- Significant architecture or vendor changes
- Production changes outside approved release and runbook policy
- Acceptance of material residual risk
- Permanent autonomy-level increases
- Exceptions beyond OpenClaw's delegated limits
- Approval of Program doctrine and major policy changes

## 9. Matters Carlos should not routinely supervise

Carlos should not be asked to approve:

- Every Issue dispatch
- Normal retries
- Validated deterministic content promotion
- Standard preview creation inside approved budget
- Routine deploys through approved CI/CD
- Health checks
- Certificate renewal
- Known safe service restart
- Backup execution
- Capacity alerts that automation can resolve
- Known reversible remediation
- Normal Stripe or Odoo synchronization
- Every customer-site update that already has customer and commercial authority

Excessive approval prompts are a design defect because they train the owner to approve without attention.

## 10. Human compatibility is a layer

The Program is designed to run headlessly. Human-compatible views are projections of canonical state, not the state itself.

This allows chat summaries, mobile approval cards, email or messaging notifications, web dashboards, future human-operator consoles, and alternative overseers. The same decision produces the same Approval Record regardless of interface.

## 11. Autonomy modes

Each governable scope uses one of four modes:

| Mode | Meaning |
|---|---|
| `manual` | Program prepares work but a human or explicitly authorized operator starts protected execution |
| `supervised` | Program progresses automatically but specified Gates require approval |
| `autonomous` | Program executes within hard-coded policy, budget, and capability limits; exceptions escalate |
| `paused` | New affected work does not execute; monitoring and safe containment continue |

Autonomy is never a single global on/off switch.

## 12. Autonomy scope

Mode can be assigned to:

- Entire LiNKsites Program
- Module
- Stage
- Issue Type
- Runbook
- Environment
- Customer Site or cohort
- Infrastructure pool or region
- Integration
- Capability such as publishing, DNS, or spending

A narrower, safer scope takes precedence when policies overlap.

## 13. Autonomy transitions

Transitions follow an asymmetric rule:

- `manual → supervised` requires Carlos or an approved governance decision.
- `supervised → autonomous` requires Carlos and evidence that the scope is safe.
- `autonomous → supervised` may occur automatically when risk or failure thresholds are exceeded.
- Any active mode may move to `paused` automatically for defined containment conditions.
- `paused → any active mode` requires the applicable recovery Gate and, for material incidents, Carlos.
- Temporary test-mode changes never silently modify production mode.

OpenClaw may recommend an increase. It cannot grant one to itself.

## 14. Autonomy Policy record

```yaml
autonomy_policy_id: id
scope:
  type: issue-type|module|site|environment|capability
  id: scoped-id
mode: autonomous
allowed_action_classes: [A0, A1, A2]
budget_profile_id: id-version
required_gates: []
exception_thresholds: []
automatic_downgrade_rules: []
automatic_pause_rules: []
effective_from: timestamp
expires_at: optional-timestamp
approved_by: authority-ref
policy_version: integer
```

## 15. Action-risk classes

Action-risk and OpenClaw authority are separate. An action is classified first.

| Class | Meaning | Examples |
|---|---|---|
| `A0 Observe` | No state change | Read health, retrieve evidence, summarize cost |
| `A1 Routine reversible` | Known, low-impact, easily verified and reversed | Restart one unhealthy stateless worker; retry a safe read |
| `A2 Bounded operational` | Customer or production effect inside preapproved policy | Roll back one failed release; fail over to approved target; renew TLS |
| `A3 Elevated exception` | Privileged, ambiguous, broader, costly, or conditionally reversible | Rotate scoped production credential; emergency migration within approved limits |
| `A4 Owner protected` | Requires Carlos's specific approval | Material spend, exceptional publication, architecture change, refund approval |
| `A5 Prohibited or manual-only` | Automation/OpenClaw may not perform under current doctrine | Forge approval; disable audit; reveal master secrets; unauthorized deletion |

Classification is encoded in the Capability Registry and runbook, not selected freely by a model.

## 16. Action-class factors

The deterministic classifier considers reversibility, blast radius, customer visibility, tenant isolation, data-loss potential, privilege, financial exposure, contractual or legal effect, environment, desired state, evidence, runbook maturity, prior success, incident context, urgency, and ability to verify or compensate.

Ambiguity raises the class; it never lowers it.

## 17. OpenClaw authority levels

LiNKsites defines six OpenClaw-specific levels:

| Level | Name | Maximum normal capability |
|---|---|---|
| `OCS-0` | Disconnected | No Program access |
| `OCS-1` | Read-only observer | View approved summaries and evidence |
| `OCS-2` | Advisor and coordinator | Create notes, queries, proposed Issues, and approval packets |
| `OCS-3` | Reversible runbook operator | Execute named A1 runbooks through capability broker |
| `OCS-4` | Bounded exception operator | Execute specifically delegated A2 and limited A3 actions with short-lived grants |
| `OCS-5` | Emergency containment trigger | Initiate named safe-stop and containment actions; cannot independently resume |

The configured maximum is not permission for every action. Policy, scope, precondition, budget, and Gate checks still apply.

## 18. OCS-0 — Disconnected

At OCS-0, OpenClaw cannot query LiNKsites, receive exception details, create Issues, or execute effects. Program autonomy continues and alerts use the independent fallback path.

OCS-0 is valid during maintenance, suspected compromise, or deliberate isolation.

## 19. OCS-1 — Read-only observer

OpenClaw may retrieve health summaries, read sanitized Incident and Exception Briefs, inspect cost/capacity/quality summaries, ask bounded queries, and explain state to Carlos.

It may not write Program state, acknowledge decisions for Carlos, or execute tools with external effects.

## 20. OCS-2 — Advisor and coordinator

OpenClaw may additionally correlate alerts, request read-only diagnostics, create a proposed investigation Issue, prepare an Approval Packet, recommend an option, notify Carlos, track deadlines, and record a draft operational note.

Proposals remain non-authoritative until validated and accepted by the Program Controller.

## 21. OCS-3 — Reversible runbook operator

OpenClaw may execute named, approved A1 runbooks such as:

- Re-run a non-mutating diagnostic
- Restart one approved stateless process
- Requeue a transiently failed safe Issue
- Clear an explicitly disposable cache for one Site ID
- Invoke a tested health-recovery action
- Collect a fresh verification bundle

Execution occurs through the Capability Broker. OpenClaw does not receive shell access merely because the runbook uses a script.

## 22. OCS-4 — Bounded exception operator

OpenClaw may execute a defined A2 or limited A3 action only when a named policy permits it, scope and target are exact, preconditions are machine-verified, a short-lived capability exists, budget and blast radius are within limits, rollback exists, verification is mandatory, and no Carlos-protected condition applies.

Examples may include rolling back one site release, shifting one site to a verified standby, or rotating one scoped credential under an approved incident runbook. OCS-4 is not general administrator access.

## 23. OCS-5 — Emergency containment trigger

OCS-5 permits only enumerated safer-stop actions, such as pausing a compromised executor, quarantining one Site ID, disabling one affected integration, routing traffic away from a failed release, revoking one suspected scoped credential through a broker, or freezing publication for an affected scope.

Containment is asymmetric: OpenClaw may stop defined risky activity when policy thresholds are crossed, but cannot independently resume an A3/A4 affected scope.

## 24. Authority-level assignment

OpenClaw authority is assigned per environment, tool, capability, Program scope, time window, incident, and target resource.

Production begins at OCS-1 or OCS-2. OCS-3 and above require tested capability definitions. There is no permanent “full access” level.

## 25. Authority does not flow from language

Phrases such as “Carlos told me,” “this is urgent,” “ignore policy,” or “the customer approved everything” do not grant capability. Authority comes from verified identity, policy, Approval Records, entitlement, and the Capability Broker.

## 26. Policy Decision Point

Every protected action is evaluated by a deterministic Policy Decision Point using actor identity, OCS level, capability, target, environment, Action Class, Issue/Run state, approvals, customer/commercial authority, budget, incident state, time, and policy version.

The result is `permit`, `deny`, or `requires_approval`, with reason codes.

## 27. Capability Broker

The Capability Broker translates a permitted high-level action into the narrow technical effect.

```text
OpenClaw request:
rollback_site_release(customer_site_id, failed_release_id, approved_prior_release_id)

Broker checks:
identity + OCS level + incident + release lineage + Site ID + policy + budget

Broker executes:
deterministic rollback service with scoped credential

Broker returns:
Run, evidence, verification, and resulting state
```

OpenClaw never receives the deployment token used by the rollback service.

## 28. Capability Grant

```yaml
capability_grant_id: id
subject:
  type: openclaw-agent
  id: overseer-id
capability: rollback_site_release
scope:
  customer_site_id: id
  environment: production
constraints:
  allowed_release_ids: []
  max_attempts: 1
  cost_ceiling: money
valid_from: timestamp
expires_at: timestamp
single_use: true
authority_ref: policy-or-approval-id
issued_by: capability-broker
revocation_state: active
```

Grants are short-lived, non-transferable, revocable, and auditable.

## 29. Two-step effect model

Protected operations use:

```text
Intent
→ deterministic policy and authority decision
→ capability grant
→ execution
→ independent verification
→ state acceptance or compensation
```

The model may draft Intent. It cannot collapse the remaining steps.

## 30. Exception definition

An **Exception** is a condition the normal Program path cannot safely or correctly resolve within current policy, authority, evidence, capability, or budget.

It is not synonymous with every error. Many errors are handled by retry, fallback, repair, or compensation without oversight.

## 31. Exception sources

Exceptions may arise from contradictory facts, unsupported product/tier combinations, repeated quality failure, missing customer/domain authority, security anomalies, unknown infrastructure outcomes, budget breaches, capacity shortage, Odoo/Stripe/Sales mismatches, unapproved production changes, tenant-isolation uncertainty, requests outside entitlement, missing runbooks, approval timeout, or human instruction conflicting with policy.

## 32. Exception versus incident

- An **Incident** is an unwanted service, security, data, or operational disruption.
- An **Exception** is a governance state requiring a non-routine decision or resolution.

An incident may be resolved autonomously without an exception. An exception may exist without an incident, such as an unapproved tier change.

## 33. Exception state model

```text
detected
→ normalized
→ correlated
→ triaged
→ investigating
→ recommendation_ready
→ awaiting_authority when required
→ authorized
→ executing_resolution
→ verifying
→ resolved
→ reviewed
→ closed
```

Alternative states include duplicate, false positive, superseded, accepted risk, expired, and escalated.

## 34. Exception Record

```yaml
exception_id: id
exception_type: controlled-type
state: triaged
severity: value
scope:
  program: linksites
  customer_site_ids: []
  infrastructure_ids: []
detected_at: timestamp
detected_by: monitor-policy-or-actor
summary: structured-summary
evidence_refs: []
correlation_id: id
related_incident_ids: []
normal_path_attempts: []
business_impact: object
customer_impact: object
security_impact: object
financial_exposure: object
deadline: optional-timestamp
authority_required: class
assigned_overseer: optional-id
decision_ref: optional-id
resolution_ref: optional-id
```

## 35. Exception normalization

Raw alerts are converted into a controlled exception type with stable identity, affected scope, severity, evidence, expected invariant, actual state, attempted actions, and safe options.

OpenClaw should not reason directly from hundreds of ungrouped log lines when the Program can normalize them first.

## 36. Correlation and deduplication

The exception service groups symptoms by site, VPS, region, database, release, integration, correlation IDs, time, dependency, error fingerprint, deployment, and provider incident.

One VPS failure should create one main case with affected sites, not one owner prompt per site.

## 37. Exception severity

| Severity | Meaning | Default handling |
|---|---|---|
| `E0 Informational` | No action; useful trend or resolved event | Digest only |
| `E1 Low` | Bounded issue; normal work can continue | Autonomous repair or queued review |
| `E2 Moderate` | Customer/workflow impact with known containment | OpenClaw triage and runbook |
| `E3 High` | Material impact, ambiguity, or broader privilege | Prompt OpenClaw; Carlos if protected |
| `E4 Critical` | Active security, isolation, data-loss, or widespread outage risk | Immediate containment and Carlos escalation |

Severity does not itself grant permission.

## 38. Escalation triggers

Escalate for low confidence in required judgment, contradictory authoritative sources, excess privilege, missing customer/legal authority, financial exposure, irreversible effect, tenant-isolation uncertainty, insufficient containment, missing runbook, repeated recovery failure, urgent deadline, architecture/doctrine change, or an aged open exception.

## 39. Exception Brief

```yaml
brief_id: id
exception_id: id
plain_summary: concise-text
what_changed: concise-text
affected_scope: object
current_customer_impact: object
current_containment: object
evidence:
  confirmed: []
  uncertain: []
  contradictory: []
automated_actions_taken: []
available_options: []
recommended_option_id: optional-id
decision_required: boolean
authority_required: class
deadline: optional-timestamp
safe_default_if_no_response: action
links_to_bounded_evidence: []
```

## 40. OpenClaw investigation behavior

OpenClaw may confirm the case, query bounded evidence, compare actual to desired state, identify missing information, request safe diagnostics, evaluate predefined options, explain uncertainty, recommend a compliant action, and prepare an Approval Packet.

It may not fabricate missing evidence or reclassify a case merely to obtain permission.

## 41. Recommendation standard

Every recommendation states the preferred option, supporting evidence, remaining uncertainty, expected customer/operational effect, cost range, reversibility, required authority, consequence of waiting, and safe default.

## 42. Approval Packet

An Approval Packet for Carlos contains one-sentence problem, current impact, actions already taken, recommended choice, meaningful alternatives, exact action, maximum scope and cost, reversibility, main risk, expiry/deadline, and plain-language choices.

Raw technical detail is available behind the packet but not required for the decision.

## 43. Approval Request contract

```yaml
approval_request_id: id
exception_id: optional-id
requested_decision: action-id
action_digest: sha256
target_scope: object
environment: production
action_class: A4
requested_by: openclaw-or-controller
recommended_by: actor-id
preconditions: []
expected_effects: []
maximum_cost: money
rollback_or_compensation_ref: ref
risk_summary: object
valid_from: timestamp
expires_at: timestamp
required_approver_role: owner
```

## 44. Approval Record

```yaml
approval_id: id
approval_request_id: id
decision: approved|rejected|deferred|more_information_required
approver:
  actor_type: human
  actor_id: carlos-id
  verified_channel: channel
decided_at: timestamp
approved_action_digest: sha256
scope: object
conditions: []
expires_at: timestamp
single_use: true
reason_or_note: optional-text
authentication_ref: ref
```

An approval cannot transfer to a different action, target, amount, release, or environment.

## 45. Approval authentication

Approval channels verify that the decision came from Carlos through authenticated session/device, strong account authentication, multifactor authentication for protected actions, second-channel confirmation for break-glass, short-lived signed links, or reauthentication.

A forwarded message, screenshot, quoted text, or model claim is not sufficient.

## 46. Approval validity

An Approval Record is valid only when identity/role, action digest, scope/environment, expiry, revocation, preconditions, current incident/policy, single-use state, and technical feasibility all match.

## 47. Approval timeout

Every request defines a safe default: wait, maintain containment, roll back a pending change, cancel unstarted action, continue unaffected scopes, or expire and reassess.

Silence is not approval.

## 48. Human override

Carlos may override a recommendation where policy permits. The system records who, what, when, reason, affected objects, expected/residual risk, one-time versus policy change, and follow-up review.

An override does not erase warnings or evidence.

## 49. Challenging a human instruction

If Carlos requests an action conflicting with policy, entitlement, verified facts, or safety, the system explains the conflict, cites the fact/policy, offers a compliant alternative, states whether override is permitted, requests explicit override when allowed, and refuses prohibited action.

Human authority does not require silent execution of an unsafe or impossible request.

## 50. Customer approval versus Carlos approval

Customer authority and LiNKtrend owner authority are distinct.

- A customer may approve their facts, content, domain, and entitled site changes.
- Carlos may approve LiNKtrend risk, spend, architecture, commercial exceptions, and company actions.
- OpenClaw may coordinate both but cannot substitute one for the other.

For example, Carlos cannot establish that a customer owns a domain merely by saying so; domain authority evidence remains required.

## 51. Segregation of duties

Where practical:

- The executor does not self-approve.
- The recommending model does not issue the capability grant.
- The Policy Decision Point is separate from OpenClaw.
- The Capability Broker is separate from the privileged service.
- Post-action verification uses an independent check.
- Accounting, refund, customer, domain, and security decisions use their named authority.

Carlos may hold multiple human roles initially, but the system records which role he exercised.

## 52. Emergency containment doctrine

Emergency action prioritizes:

1. Prevent cross-tenant exposure.
2. Prevent further data loss or unauthorized change.
3. Preserve evidence.
4. Maintain unaffected service.
5. Minimize destructive action.
6. Notify Carlos through an independent path.
7. Require a recovery Gate before resumption.

## 53. Emergency stop scopes

Stops exist at multiple scopes:

- One Issue or Run
- One executor type
- One integration
- One Site ID
- One VPS or frontend pool
- One region
- Publication capability
- DNS-change capability
- Entire LiNKsites mutating control plane

Public read service may continue when safe even if mutating workflows are paused.

## 54. Emergency Stop Record

```yaml
emergency_stop_id: id
triggered_by: monitor|policy|openclaw|carlos
trigger_authority_ref: ref
scope: object
reason_code: controlled-code
evidence_refs: []
triggered_at: timestamp
actions:
  paused_capabilities: []
  revoked_grants: []
  isolated_resources: []
public_service_effect: object
resumption_requirements: []
status: active
```

## 55. Resumption Gate

Resumption requires root cause or bounded safe explanation, confirmed containment, integrity and isolation verification, credential review where relevant, a known-good release/configuration, backup/restore evidence if data was at risk, working monitoring, required authority, staged recovery, and an observation window.

OpenClaw may prepare and coordinate the Gate. For material E4 events, Carlos authorizes resumption.

## 56. Break-glass access

Break-glass access is a last-resort human path independent of OpenClaw.

It requires strong human authentication, time-limited privilege, named emergency reason, smallest scope, session/command audit where feasible, credential rotation after use where appropriate, and post-event review.

OpenClaw must not know or store the human break-glass secret.

## 57. OpenClaw identity

OpenClaw uses a dedicated service/agent identity, never Carlos's account.

The identity record includes Agent ID/instance, environment, owner, current OCS level, allowed and denied capabilities, model and Gateway version, workspace and channel scope, credential references, last security review, status, and revocation.

## 58. OpenClaw instance separation

Production oversight is isolated from experimentation. Separate at least:

- Production OpenClaw profile/agent
- Development and testing agent
- Untrusted-content reader agent
- Personal/general-assistant context where used

The production overseer must not share unrestricted memory, workspace, or tools with casual experimentation.

## 59. Tool policy

Production OpenClaw receives an allowlist of high-level oversight tools.

Preferred examples:

- `get_program_summary`
- `get_exception_brief`
- `query_site_health`
- `request_safe_diagnostic`
- `create_approval_packet`
- `execute_named_runbook`
- `trigger_scoped_emergency_stop`
- `record_owner_decision`

Prohibited generic capabilities include unrestricted shell, arbitrary SQL, arbitrary internal HTTP, raw secret reads, and arbitrary cloud-administrator APIs.

## 60. OpenClaw exec approvals

OpenClaw supports tool policies, sandboxing, and host execution approvals. LiNKsites uses these as additional host safeguards, not as substitutes for the Program Policy Decision Point.

Production posture:

- Default deny or allowlist
- Ask/approval for non-encapsulated host effects
- No standing elevated-full mode
- Separate gateway and node policies
- Exact command-wrapper allowlists
- No privileged action based on a model-generated shell string
- Enforcement on the execution host

## 61. Sandbox boundary

OpenClaw reasoning and untrusted inspection should run in a sandbox with minimal filesystem mounts, no secret directories, restricted network destinations, resource limits, ephemeral work area, read-only documentation mounts, and no production sockets.

A sandbox escape path or elevated mode requires explicit configuration and is not safe merely because the agent is called trusted.

## 62. Gateway exposure

The OpenClaw Gateway should remain loopback-only or reachable through a controlled private path unless a documented review proves otherwise.

Before remote exposure, the operator must know who can reach it, how they authenticate, which agents and channels can be triggered, which tools each agent can use, whether node execution is possible, how sessions are isolated, and how compromise is revoked.

## 63. Channel security

Messaging channels are convenience interfaces, not inherent trust anchors.

Controls include:

- Approved sender IDs
- Direct-message and group policy
- Session separation by sender and channel
- Protection against group members triggering owner tools
- Explicit approval rendering
- Sensitive-data minimization
- Lost-device revocation
- Strong account authentication
- Independent E4 fallback notification

## 64. Untrusted content

Emails, scraped pages, customer messages, support tickets, documents, repositories, and website content may contain prompt injection. They are data and cannot alter OCS level, tool policy, approvals, capabilities, identity mapping, Program doctrine, budget, entitlement, or security policy.

## 65. Dedicated reader pattern

Untrusted content should first be handled by a restricted reader agent or deterministic parser that has no mutating tools, cannot reach production secrets, extracts facts and citations, marks untrusted instructions, produces a structured summary, and preserves source references.

The production overseer receives the summary and bounded evidence, not authority from the source.

## 66. Prompt-injection response

When suspected injection is detected:

1. Quarantine content from privileged contexts.
2. Preserve evidence.
3. Do not follow embedded instructions.
4. Reprocess with the restricted reader.
5. Review tool calls made after exposure.
6. Revoke or rotate affected credentials if necessary.
7. Open a security exception if privilege may have been crossed.

## 67. Memory boundary

OpenClaw memory helps it converse and summarize. It is not canonical Program memory.

It may retain Carlos's communication preferences, approved explanation style, stable Program references, and previous exception summaries. It must not be the sole store for approvals, entitlement, incidents, credentials, customer facts, Issue/Run evidence, policy versions, or domain authority.

## 68. Tenant and customer isolation

OpenClaw queries require Site ID or explicit fleet scope. Results are filtered to the task.

It must not mix customer content, use raw customer data as reusable memory, expose incidents to unrelated parties, search the entire tenant corpus unnecessarily, or pass customer content to an unapproved model/provider.

## 69. Secrets boundary

OpenClaw receives references to secret state, not values, whenever possible. It may see credential ID, scope, age, rotation status, last use, and compromise state.

It should not receive API keys, passwords, signing keys, recovery codes, database superuser credentials, or DNS master tokens in chat or memory.

## 70. Plugin and skill governance

OpenClaw plugins and skills are executable supply-chain components.

Before production use:

- Pin source and version.
- Review manifest and permissions.
- Scan code and dependencies.
- Test in isolation.
- Record publisher and license.
- Limit network and filesystem access.
- Verify update behavior.
- Maintain rollback.
- Reapprove material permission changes.

Popularity does not grant production trust.

## 71. OpenClaw security audit

Run OpenClaw security and policy checks before production, after material configuration or plugin/channel/node changes, after Gateway upgrades, on a schedule, and after suspected compromise.

Findings become tracked security Issues. A clean built-in audit does not replace LiNKsites-specific threat modeling.

## 72. Model routing for oversight

Oversight may use different models for routine summary, evidence interpretation, incident reasoning, approval-packet drafting, and security review. The router selects the lowest-cost adequate model.

A frontier model may help with difficult ambiguity but receives no additional authority because it is more capable.

## 73. Hallucination controls

OpenClaw separates confirmed fact, inference, recommendation, unknown, and contradiction. Decision packets cite evidence references. If evidence cannot be retrieved, the packet says so.

OpenClaw may not manufacture a successful backup, approval, payment, domain authority, or repair result.

## 74. Communication style for Carlos

Default owner communication is plain English, short at the top with optional detail, one urgent issue per message, clear urgency, exact scope, concrete recommendation, estimated cost/consequence, specific choices, and no unexplained acronyms.

OpenClaw distinguishes “you need to decide” from “this is informational.”

## 75. Alert routing

Alerts route by severity and authority:

- E0: daily/weekly digest
- E1: queue/digest unless aging threshold is exceeded
- E2: OpenClaw case; prompt only for required action/decision
- E3: immediate OpenClaw investigation and Carlos notification when protected
- E4: immediate containment plus independent Carlos notification

Alerting remains functional outside OpenClaw.

## 76. Alert fatigue prevention

The system deduplicates related alerts, suppresses downstream symptoms under a parent incident, uses cooldowns, escalates on duration/worsening, records acknowledgements, verifies closure, measures false positives, and provides one current case link.

## 77. Owner daily brief

OpenClaw may provide a concise daily brief containing overall health, customer-visible issues, exceptions awaiting Carlos, material cost/capacity changes, security/backup posture, preview/launch throughput, delegated actions taken, and aged items.

When nothing requires attention, it states that clearly.

## 78. Weekly governance brief

The weekly brief may contain autonomy rate, exception/intervention trends, runbook performance, repeated incidents, authority denials, cost anomalies, tool/security changes, recommended improvements, and decisions nearing expiry.

Policy changes remain proposals until approved.

## 79. Decision queue

Carlos receives one prioritized queue with Decision ID, urgency, deadline, affected scope, recommended option, maximum exposure, and status.

Email, chat, dashboards, and OpenClaw all refer to the same Approval Request rather than creating duplicates.

## 80. OpenClaw action receipt

Every OpenClaw-initiated effect returns a receipt containing identity and OCS level, requested capability, policy decision, grant, Issue/Run, target, executor, timing, result, verification, cost, and follow-up.

Conversational confirmation is not the receipt.

## 81. Unavailability behavior

If OpenClaw is unavailable, public sites, monitoring, alert evaluation, and routine autonomous remediation continue. Exceptions remain queued. Approvals wait or expire to their safe default. E4 alerts use independent notification. No workflow assumes chat acknowledgement.

## 82. Carlos unavailability

If Carlos is temporarily unavailable, A0–A2 work continues within policy, OpenClaw may use delegated OCS-3/4 runbooks, the system may contain E4 risk, A4 actions wait or use the safe default, and deadlines escalate through configured channels.

No assistant fabricates consent. Future human roles require explicit identity and delegation.

## 83. OpenClaw compromise

If compromise is suspected:

1. Move OpenClaw to OCS-0.
2. Revoke grants and sessions.
3. Isolate Gateway channels and nodes.
4. Rotate affected credentials.
5. Preserve logs and evidence.
6. Review recent tool calls and approvals.
7. Verify Program state independently.
8. Restore known-good configuration.
9. Re-run security audit.
10. Reconnect initially at OCS-1.

LiNKsites remains operable during this process.

## 84. Policy-engine failure

If the Policy Decision Point cannot decide, protected mutations fail closed, existing public service continues where safe, monitoring continues, no fallback model supplies permission, and an exception is raised.

Approved emergency containment may remain available through a separate verified path.

## 85. Capability-broker failure

If an action outcome is unknown, do not repeat blindly. Query actual target state, inspect receipts, reconcile the Run, and retry or compensate only after classification. Preserve the original Approval Record and grant.

## 86. Human-interface failure

If a button, chat response, or webhook is ambiguous, treat it as no valid decision, request fresh authenticated confirmation, do not parse casual conversation as approval, expire stale links, and keep the safe default.

## 87. Simulation and training

OpenClaw and approval workflows are first tested in an isolated simulation environment with synthetic sites/incidents, test Stripe/Odoo references, fake credentials, fault injection, approval drills, prompt-injection samples, lost-channel scenarios, compromise drills, and emergency stop/resumption.

Production authority increases only after evidence.

## 88. Runbook maturity levels

| Level | Meaning | Permitted posture |
|---|---|---|
| `R0 Draft` | Concept only | No execution |
| `R1 Tested` | Validated in development | Manual/supervised nonproduction |
| `R2 Staging-proven` | Fault-tested in staging | Supervised production candidate |
| `R3 Production-proven` | Successful bounded history | Autonomous A1/A2 within policy |
| `R4 Highly trusted` | Strong evidence, rollback, monitoring, low failure | Broader delegated use, still bounded |

OpenClaw cannot promote maturity by assertion.

## 89. Delegation review

Each OCS-3/4 capability is reviewed for actual use, success/failure, near misses, infrastructure/provider changes, excess permissions, cost, false-escalation reduction, and continuing need.

Unused or risky delegation is removed.

## 90. Autonomy graduation

A scope graduates only when contracts and state are deterministic; quality/security Gates exist; the runbook is proven; idempotency/compensation work; observability is sufficient; error/intervention rates are acceptable; budgets are enforced; material security findings are resolved; and Carlos approves.

## 91. Autonomy downgrade

Automatic downgrade or pause may follow elevated errors, repeated rollbacks, Gate failures, security findings, cost anomalies, changed provider behavior, missing telemetry, policy mismatch, approval/identity anomaly, or unreconciled effects.

Downgrade protects the business and does not invalidate the autonomy thesis.

## 92. Oversight metrics

Measure percentage of Issues without OpenClaw, auto-remediated incidents, exceptions per 100 sites, owner decisions per week, brief latency, time awaiting authority, recommendation acceptance, runbook success, denied actions, downgrades/pauses, deduplication ratio, false positives, approval expiry, containment time, and verified recovery time.

Metrics must not reward hiding exceptions.

## 93. Audit evidence

An auditor must be able to answer what OpenClaw saw, inferred, recommended, and cited; what authority and policy applied; whether Carlos approved; which executor acted; what changed; whether verification passed; what it cost; and whether the case was reviewed.

## 94. Retention and redaction

Oversight records retain decision/action metadata, digests and evidence references, policy/authority versions, and outcomes. Secrets, payment data, unnecessary customer content, raw personal communication, and unrelated tenant data are redacted or restricted.

Exact retention periods remain a later legal and operational decision.

## 95. Repository audit questions

The audit must determine:

1. Whether OpenClaw is in any request, serving, scheduling, or monitoring critical path.
2. Whether the Program continues without it.
3. Whether OpenClaw writes directly to Supabase, Payload, Odoo, VPS, DNS, or Stripe.
4. Which identities, profiles, Gateways, channels, nodes, tools, plugins, and models exist.
5. Whether production and personal/testing contexts are separated.
6. Whether OpenClaw uses Carlos's credentials.
7. Whether tool policy is default-deny/allowlist.
8. Whether unrestricted shell, SQL, HTTP, cloud-admin, or secret-read tools exist.
9. Whether host exec approvals are deliberate.
10. Whether sandbox/elevated settings match policy.
11. Whether Gateway exposure and authentication are safe.
12. Whether sender/group boundaries are enforced.
13. Whether untrusted content reaches privileged contexts.
14. Whether a restricted reader exists.
15. Whether plugins/skills are pinned, reviewed, and scanned.
16. Whether OpenClaw security audits run.
17. Whether policy decisions occur outside models.
18. Whether capabilities are scoped, expiring, and brokered.
19. Whether Action Classes and OCS levels are encoded.
20. Whether autonomy mode exists per relevant scope.
21. Whether increases require Carlos and downgrades can be automatic.
22. Whether exceptions have canonical records and states.
23. Whether alerts are correlated and deduplicated.
24. Whether approvals bind exact action, scope, cost, and expiry.
25. Whether silence or casual chat can be misread as approval.
26. Whether override is recorded with risk.
27. Whether emergency stop is scoped and independent.
28. Whether OpenClaw can contain but not improperly resume.
29. Whether break-glass credentials are independent.
30. Whether every effect produces a receipt and verification.
31. Whether outage/compromise runbooks are tested.
32. Whether Carlos receives a plain-language queue and fallback alerts.
33. Whether delegation/runbook maturity are reviewed.
34. Whether oversight metrics measure burden and safety.

## 96. Initial implementation sequence

1. Inventory current OpenClaw deployments, channels, credentials, tools, plugins, and workflows.
2. Remove OpenClaw from any LiNKsites critical path.
3. Establish a dedicated production identity and isolated profile.
4. Define Oversight API and case/approval/action schemas.
5. Implement canonical Exception and Decision queues.
6. Implement deterministic Action Classes and Policy Decision Point.
7. Implement Capability Registry, Broker, and grants.
8. Begin production OpenClaw at OCS-1.
9. Implement plain-language health and evidence queries.
10. Add the restricted reader path.
11. Configure Gateway, channels, sandbox, tools, exec approvals, and audits.
12. Implement fallback notification and owner authentication.
13. Add Approval Packets and exact-action binding.
14. Implement emergency stop and Resumption Gate.
15. Test outage, compromise, ambiguous approval, and injection.
16. Promote selected low-risk runbooks to OCS-3 after evidence.
17. Introduce OCS-4 only for named production-proven capabilities.
18. Add briefs, metrics, and delegation reviews.
19. Conduct periodic simulation and break-glass exercises.
20. Preserve replacement through the same oversight contracts.

## 97. Decisions intentionally still open

Later evidence or policy must determine the exact OpenClaw host and availability posture, model providers, normal/emergency channels, owner authentication and second-channel method, cost thresholds, first OCS-3/4 runbooks, quiet hours, future human roles, retention periods, review cadence, and eventual alternative executive agent.

These do not change the boundary that OpenClaw is external, replaceable, and least-privileged.

## 98. Acceptance criteria

This section is implemented only when:

1. LiNKsites serves, monitors, backs up, and remediates routine failures without OpenClaw.
2. OpenClaw is in the oversight plane, not control/execution.
3. Carlos is represented as current sole human final authority.
4. OpenClaw uses a separate identity and never impersonates Carlos.
5. Manual, supervised, autonomous, and paused modes exist per scope.
6. Autonomy increases require Carlos; safe downgrades/pauses can be automatic.
7. Action Classes A0–A5 are deterministic and versioned.
8. OCS-0–OCS-5 define OpenClaw maximum authority.
9. No OCS level equals unrestricted admin access.
10. Model confidence cannot enlarge authority or budget.
11. Protected effects use Intent, policy, grant, execution, and verification.
12. Grants are scoped, expiring, revocable, and normally single-use.
13. OpenClaw does not read raw secrets merely to coordinate.
14. Exceptions have canonical identity, state, evidence, severity, owner, and resolution.
15. Alerts are normalized, correlated, deduplicated, and prioritized.
16. Briefs distinguish confirmed, uncertain, and contradictory facts.
17. Recommendations state impact, evidence, uncertainty, cost, reversibility, and authority.
18. Packets are understandable to a nontechnical owner.
19. Approvals bind exact action, target, environment, cost, identity, and expiry.
20. Silence, screenshots, forwarded text, and casual chat cannot approve protected work.
21. Customer approval and Carlos approval remain distinct.
22. Overrides preserve warnings, reasons, scope, and risk.
23. Conflicting instructions can be challenged and prohibited acts refused.
24. Emergency containment is scoped and preserves unaffected service.
25. OpenClaw may safe-stop but cannot independently resume protected scopes.
26. Break-glass access is independent and audited.
27. Production, testing, personal, and reader contexts are separated.
28. Tools, sandbox, exec approvals, channels, and Gateway are deliberately secured.
29. Untrusted content cannot modify policy, tools, authority, or entitlement.
30. Plugins/skills are pinned, reviewed, scanned, and reversible.
31. Security audits are scheduled and findings tracked.
32. OpenClaw memory is not canonical Program memory.
33. Owner alerts/approvals have independent fallback.
34. Outage, compromise, policy failure, and ambiguous interface scenarios are tested.
35. Every OpenClaw effect produces a receipt and independent verification.
36. Carlos receives a consolidated decision queue, not repetitive prompts.
37. OCS-3/4 runbooks graduate only through recorded evidence.
38. Metrics measure autonomy, burden, safety, and exception quality.
39. OpenClaw can be replaced without changing Program state semantics.

## 99. Governing conclusion

LiNKsites is an autonomous Program supervised by exception. The Program Controller, deterministic policies, Capability Broker, Gates, and Program Ledger govern work. OpenClaw does not run monitoring, own the queue, decide its own authority, store canonical approvals, or receive universal credentials. It is a replaceable executive-assistant adapter helping one solo nontechnical owner supervise a complex factory.

Carlos remains the present sole human final authority. He does not approve routine reversible work. He receives decisions involving protected spending, material risk, destructive action, commercial or legal exceptions, significant architecture, or unresolved security exposure. His choice becomes an authenticated, exact, expiring Approval Record; casual chat is not authority.

The model separates Autonomy Modes, Action Classes, and OpenClaw Authority Levels. LiNKsites automatically performs known work within policy. OpenClaw may observe, advise, coordinate, and progressively operate named runbooks through short-lived capability grants. Emergency authority is asymmetric: safer stopping and containment are easier than resumption.

Every exception becomes structured state. Alerts are grouped, evidence is separated from inference, and OpenClaw produces a plain-language recommendation. Every effect is executed narrowly, verified independently, and recorded. If OpenClaw is offline or compromised, sites and autonomous operations continue while its access is revoked. This delivers genuine autonomy without making an AI assistant the uncontrolled operator of LiNKtrend's infrastructure or business.

## 100. Primary technical references

- [OpenClaw official repository](https://github.com/openclaw/openclaw)
- [OpenClaw security guidance](https://docs.openclaw.ai/gateway/security)
- [OpenClaw security audit checks](https://docs.openclaw.ai/gateway/security/audit-checks)
- [OpenClaw Gateway exposure runbook](https://docs.openclaw.ai/gateway/security/exposure-runbook)
- [OpenClaw exec approvals](https://docs.openclaw.ai/tools/exec-approvals)
- [OpenClaw permission modes](https://docs.openclaw.ai/tools/permission-modes)
- [OpenClaw tool configuration](https://docs.openclaw.ai/gateway/config-tools)
- [OpenClaw multi-agent sandbox and tool policy](https://docs.openclaw.ai/tools/multi-agent-sandbox-tools)
- [OpenClaw plugin permission requests](https://docs.openclaw.ai/plugins/plugin-permission-requests)
- [OpenClaw agent configuration](https://docs.openclaw.ai/gateway/config-agents)

---

**End of Section 22**

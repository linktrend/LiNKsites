# LiNKsites Program Manual

## Section 20 — Issues, Runs, Executors, Model Routing, Idempotency, Retry, and Compensation

**Document set:** LiNKsites Program Manual  
**Section:** 20 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, LiNKsites product and engineering agents, workflow and automation implementers, n8n and agent-framework operators, reliability and QA agents, repository auditors, OpenClaw oversight designers, and future human collaborators  

---

## 1. Purpose of this section

This section defines the execution grammar used by every LiNKsites Module and Stage. It explains how work becomes an atomic Issue, how an executor attempts that work in a Run, how outputs are accepted, how duplicate delivery is made safe, how failures are classified, and how partial effects are retried, repaired, reversed, or neutralized.

It covers:

- Issue definitions, instances, dependencies, states, priorities, and contracts
- Run creation, queueing, leases, heartbeats, checkpoints, cancellation, and evidence
- Executor registry and adapters
- Deterministic scripts, services, n8n workflows, browser runners, CrewAI, Agent Zero, Cursor agents, and other agent runtimes
- Rule-based executor and model routing
- Budgets, context, model versions, tools, memory, and structured outputs
- Gate acceptance
- Idempotency, deduplication, outbox/inbox delivery, and concurrency
- Failure classification, retry, fallback, repair, and escalation
- Compensation and Saga-style recovery for distributed side effects
- Autonomous dispatch and OpenClaw oversight boundaries
- Repository audit and implementation requirements

This section does not redefine the business lifecycle in Section 4 or the Modules in Section 5. It supplies the common machinery that executes them.

## 2. Direct execution decisions

### 2.1 What is an Issue?

An Issue is the smallest atomic, schedulable piece of work that LiNKsites can independently authorize, execute, verify, retry, cancel, cost, and audit.

An Issue is not merely a chat instruction, checklist bullet, or external issue-tracker card. It is a governed Program object with a typed input, output contract, execution policy, acceptance Gate, and failure behavior.

### 2.2 What is a Run?

A Run is one execution attempt of one Issue under pinned inputs, versions, authority, executor, and budget. A retry creates a new Run. It never overwrites the failed attempt.

### 2.3 Does `Run succeeded` mean `Issue completed`?

No. `Run succeeded` means the executor produced a contract-valid candidate output. The Issue completes only after the required Gate accepts the output or an explicitly approved alternative completion condition is met.

### 2.4 Must LiNKsites use one workflow engine for every executor?

No. LiNKsites needs one Program Ledger and one execution contract, not one universal runtime.

The controller may dispatch different Issues to:

- Deterministic code or scripts
- Postgres-backed job workers
- n8n workflows
- Container jobs
- Browser automation
- CrewAI crews or flows
- Agent Zero
- Cursor or other coding agents
- External APIs and managed services
- Human-authorized work where automation is not yet safe

### 2.5 Should LiNKsites build a workflow engine from scratch?

No. The Program Ledger and adapters are LiNKsites-specific, but durable queueing, retry scheduling, workflow execution, browser automation, and agent orchestration should use established open-source components.

### 2.6 Is Graphile Worker the final required queue?

Not yet. Graphile Worker is the recommended initial candidate because it uses PostgreSQL, provides at-least-once job execution and retry, and avoids an additional queue service for the early solo-operated system. Repository audit may reveal an existing adequate queue.

### 2.7 When would Temporal be justified?

Temporal or an equivalent durable workflow engine becomes worth evaluating when LiNKsites has numerous long-lived workflows, signals, timers, complex compensation, high concurrency, or recovery requirements that make the simpler controller difficult to reason about. It is not an initial dependency merely because it is powerful.

### 2.8 Can the router silently change models during a Run?

No. Executor and model identity are pinned to the Run. Fallback to another model, agent, or provider creates a new Run with its own cost, evidence, and policy reason.

## 3. Governing execution doctrine

1. **One authoritative Program Ledger.** External runtimes report to it; they do not independently define business completion.
2. **Issue contracts are immutable once dispatched.** A changed input or contract creates a new Issue revision or replacement Issue.
3. **Every attempt is a Run.** History is never collapsed into the final success.
4. **Inputs and versions are pinned.** A retry must not silently consume newer content, components, prompts, or models.
5. **Executor success and Gate acceptance are separate.**
6. **Assume at-least-once delivery.** Side effects must tolerate duplicate attempts.
7. **Use deterministic executors whenever suitable.** AI is reserved for tasks requiring interpretation, generation, or judgment.
8. **Route by policy, not model preference.** Risk, complexity, modality, cost, and evidence determine the executor.
9. **Retry only failures likely to change without new work.** Invalid inputs and design defects need repair, not repetition.
10. **Never hide fallback.** A new executor is a new Run.
11. **Compensation is explicit.** Distributed side effects cannot be wished away as a database rollback.
12. **Cancellation is cooperative and state-aware.**
13. **All waiting states expire or escalate.**
14. **Memory is governed state.** Important execution context must not exist only inside an agent process.
15. **Authority and budget are checked before side effects.**
16. **OpenClaw oversees exceptions but does not dispatch every routine Run.**

## 4. Execution architecture

LiNKsites uses five layers:

| Layer | Purpose |
|---|---|
| Program definition | Defines Modules, Stages, Issue types, contracts, Gates, and policies |
| Program Ledger | Stores Issues, Runs, events, leases, artifacts, costs, and current materialized state |
| Program Controller | Evaluates readiness, routes work, dispatches, reconciles, and schedules retries |
| Executor adapters | Translate a common Run contract into a runtime-specific invocation |
| Executors | Perform deterministic, automated, agentic, service, or human work |

The Ledger is authoritative for Program state. An n8n execution, CrewAI flow, or Cursor session is evidence linked to a Run, not a replacement for the Run record.

## 5. Initial open-source composition

The provisional implementation is:

- PostgreSQL/Supabase for the Program Ledger
- Transactional outbox for dispatch events
- Graphile Worker or an already-existing equivalent for initial durable background jobs
- n8n for integration-heavy, event-driven, and low-code automation Issues
- Containerized workers for deterministic scripts and resource-isolated jobs
- Playwright for browser Issues
- CrewAI adapters for approved multi-agent Issues
- Runtime adapters for Agent Zero, Cursor agents, and other approved agent systems
- Existing observability, secret, and artifact systems from Sections 16–19

This composition is deliberately modular. Queue or agent runtimes can change without changing Issue identity or accepted outputs.

## 6. Why not use n8n as the only Program Controller?

n8n is valuable for workflows, integrations, schedules, webhooks, error workflows, and later queue-mode scaling. It should execute suitable Issues.

LiNKsites should not make n8n's internal execution model the sole source of company-wide Program truth because:

- Some Issues are repository coding jobs, browser work, media processing, database operations, or external agents.
- Business acceptance requires Gates outside one workflow execution.
- Issue history must remain stable if an n8n workflow is replaced.
- Cross-Program contracts need common identities.
- Retry, repair, compensation, cost, and authority must be comparable across executors.

n8n execution IDs remain attached as executor evidence.

## 7. Why not use Temporal initially?

Temporal provides durable workflow execution, replay, event histories, activities, timeouts, retries, and recovery. It is a strong future candidate for complex long-running orchestration.

However, it adds a workflow programming model, service infrastructure, persistence, worker operations, versioning constraints, and expertise requirements. The initial LiNKsites system should first prove that its Issue contracts and control model require that complexity.

Migration remains possible because the Program Ledger and executor adapter isolate business state from the queue implementation.

## 8. Issue Type versus Issue Instance

- **Issue Type** is a reusable definition such as `SITE-RESEARCH-BUSINESS-FACTS`.
- **Issue Instance** is one scheduled use of that type for a specific Site ID, prospect, release, or infrastructure object.

The type defines policy. The instance pins actual inputs and target.

## 9. Issue Type contract

```yaml
issue_type_id: SITE-ASSEMBLE-PREVIEW
definition_version: 4
module_id: M09-preview-adaptation
stage_id: S03-assembly
purpose: assemble a preview from an approved foundation and adaptation specification
input_schema_ref: schema://preview-assembly-input/v4
output_schema_ref: schema://preview-build-manifest/v3
preconditions:
  - foundation-reservation-active
  - adaptation-specification-passed
side_effect_class: reversible
executor_policy_id: route-preview-assembly-v2
gate_profile_id: preview-build-gate-v3
retry_policy_id: deterministic-build-v2
compensation_policy_id: release-preview-build-resources-v1
timeout_policy_id: build-standard-v1
security_profile_id: site-scoped-build-v2
cost_profile_id: preview-level-budget-v2
```

## 10. Issue Instance contract

```yaml
issue_id: iss_...
issue_type_id: SITE-ASSEMBLE-PREVIEW
issue_definition_version: 4
program_id: linksites
program_version: version
module_id: M09-preview-adaptation
stage_id: S03-assembly
site_id: site-id
prospect_id: prospect-id
target_entity:
  type: preview
  id: preview-id
correlation_id: correlation-id
causation_id: parent-event-or-issue
priority: normal
deadline: timestamp
input_manifest_ref: immutable-manifest
input_digest: digest
output_contract_ref: schema-and-version
authority_ref: preview-production-authorization
budget_authorization_ref: budget-id
idempotency_key: stable-key
state: ready
dependencies:
  - issue-id
created_at: timestamp
```

## 11. Atomic Issue test

An Issue is atomic enough when:

- It has one clearly named intended outcome.
- Its input can be pinned.
- Its output can be validated independently.
- It has one primary side-effect class.
- It can be retried without repeating unrelated work.
- It can be assigned to one executor capability.
- It has a bounded timeout and budget.
- Its failure can be classified.
- Its compensation or repair boundary is understandable.

If one task can partially succeed in several unrelated ways, it should normally be decomposed.

## 12. Examples of atomic Issues

- Research one business's approved public facts.
- Select one foundation for one preview request.
- Generate one page's structured copy package.
- Adapt one image to one declared slot.
- Assemble one pinned preview manifest.
- Validate one form definition.
- Promote one approved content release.
- Provision one VPS from one infrastructure version.
- Create one custom-hostname record.
- Deliver one outbox event to one destination.
- Run one quality profile against one artifact.

“Build and launch the entire customer site” is a Stage or workflow, not one atomic Issue.

## 13. Issue dependencies

Dependencies are typed:

- `requires_completion`: predecessor Issue must complete.
- `requires_gate`: named Gate must pass.
- `requires_artifact`: specific immutable artifact must exist.
- `requires_authority`: approval or entitlement is needed.
- `requires_capacity`: resource or executor slot is needed.
- `requires_time`: not before a timestamp.
- `requires_external_state`: provider state must be observed.
- `conditional`: dependency applies only if declared condition is true.

Dependencies are explicit records, not inferred from filenames or an agent's memory.

## 14. Dependency graph

The controller validates that ordinary Issue dependencies form a directed acyclic graph for one execution scope. Approved loops are represented as new Issue generations or state transitions, not an unbounded cycle in the dependency graph.

Examples:

- Gate failure creates a Repair Issue.
- Repair completion creates a new validation Run.
- Customer correction creates a revised content Issue.

The history remains finite and attributable.

## 15. Issue lifecycle

The authoritative states from Section 4 are:

| State | Meaning |
|---|---|
| `draft` | Definition or inputs are incomplete |
| `blocked` | Dependency, input, Gate, capacity, or authority is unsatisfied |
| `ready` | Entry conditions pass and dispatch is permitted |
| `dispatched` | Executor adapter has received dispatch intent |
| `running` | At least one active Run exists |
| `awaiting_gate` | Candidate output awaits acceptance |
| `retry_scheduled` | Another Run is authorized after retryable failure |
| `repair_required` | Different corrective work is needed |
| `exception` | Normal policy cannot determine or execute safe progress |
| `cancelled` | Authorized cancellation completed |
| `failed` | Terminal failure under current policy |
| `completed` | Required output accepted |

State changes occur through validated commands and append-only events.

## 16. Readiness evaluation

An Issue becomes ready only when:

- Definition and schemas exist.
- Inputs are complete and immutable.
- Dependencies and entry Gates pass.
- Authority is valid.
- Budget is available.
- Tenant and environment scope are valid.
- Required secrets and capabilities can be brokered.
- Target resource is not under conflicting lock or change.
- Deadline and scheduling constraints permit execution.
- An eligible executor exists.

The controller records which condition blocked readiness.

## 17. Scheduling attributes

Issues may carry:

- Priority class
- Deadline
- Earliest start
- Customer-impact severity
- Cost budget
- Runtime estimate
- Required executor capability
- Region or data-location constraint
- concurrency key
- Fairness weight
- Campaign or preview cohort
- Maintenance window

Priority does not bypass authority or quality Gates.

## 18. Fairness and starvation

The scheduler prevents one customer, campaign, retry storm, or media job from consuming every executor slot.

Controls include:

- Per-site concurrency
- Per-Issue-type concurrency
- Per-executor capacity
- Priority aging
- Reserved incident capacity
- Cost and provider quotas
- Retry backoff
- Queue depth alerts

Emergency work may preempt new low-priority dispatches but does not corrupt active Runs.

## 19. Run contract

```yaml
run_id: run_...
issue_id: iss_...
attempt_number: 2
run_state: created
created_at: timestamp
program_version: version
issue_definition_version: 4
input_manifest_ref: immutable-manifest
input_digest: digest
executor_id: exec-preview-builder
executor_version: image-digest-or-workflow-version
executor_adapter_version: version
model_route: null
prompt_template_ref: null
tool_policy_ref: build-tools-v2
secret_grants:
  - capability-reference
budget:
  max_money: amount
  max_tokens: null
  max_runtime_seconds: integer
idempotency_key: stable-effect-key
lease:
  lease_id: null
  fencing_token: null
deadline: timestamp
output_contract_ref: schema-reference
gate_profile_id: preview-build-gate-v3
```

## 20. Run lifecycle

| State | Meaning |
|---|---|
| `created` | Pinned Run exists |
| `queued` | Awaiting executor capacity |
| `claimed` | Executor holds a lease |
| `executing` | Work is underway |
| `checkpointed` | Resumable state was recorded |
| `succeeded` | Contract-valid candidate output returned |
| `failed_retryable` | Policy may create another Run |
| `failed_terminal` | Same conditions should not be retried |
| `timed_out` | Deadline or lease expired |
| `cancel_requested` | Cooperative cancellation requested |
| `cancelled` | Execution ended safely |
| `compensating` | Side effects are being reversed or neutralized |
| `compensated` | Defined compensation completed |

A Run has one terminal execution outcome, but later Gate and compensation records remain linked.

## 21. Immutable Run snapshot

At creation, the Run pins:

- Issue and Program versions
- Input manifest and digest
- Site ID and target entity
- Component, kit, foundation, content, and release versions as applicable
- Executor and adapter version
- Workflow or container digest
- Model and prompt version
- Tools and skill versions
- Output schema
- Gate profile
- Retry, timeout, and compensation policies
- Security capability envelope
- Budget

This permits reproduction and explains differences between attempts.

## 22. Queue delivery

Dispatch uses a transactional outbox:

1. Controller commits Run creation and Dispatch Event in one database transaction.
2. Dispatcher reads undelivered outbox records.
3. Executor adapter creates or enqueues runtime work using the Run ID and idempotency key.
4. Adapter records the external execution reference.
5. Outbox delivery is marked complete.

If the dispatcher crashes, the event can be delivered again safely.

## 23. At-least-once execution

Graphile Worker and most distributed queues may execute a job more than once after worker or network failure. External APIs can accept an action while the caller loses the response. Therefore LiNKsites assumes:

- A dispatch may be repeated.
- A worker may start the same effect again.
- A completion message may be repeated.
- An acknowledgement may be lost.
- A timed-out Run may have partially acted.

Exactly-once side effects are not assumed. Idempotency and reconciliation provide safety.

## 24. Claim and lease

Before execution, an adapter claims a Run with:

- Lease ID
- Executor instance ID
- Acquired time
- Expiry
- Fencing token or generation
- Heartbeat interval

Only the current lease may report authoritative progress. An expired worker cannot overwrite a later Run or lease result.

## 25. Fencing tokens

A fencing token increases for each valid claim generation. Stateful resources check the current token before accepting a write where supported.

This prevents an old stalled executor from resuming after lease expiry and overwriting newer work.

Lease ownership alone is insufficient if the side-effecting service cannot distinguish old and current workers.

## 26. Heartbeats

Long-running Runs heartbeat:

- Run ID
- Lease ID
- Fencing token
- Current phase
- Progress measure
- Last safe checkpoint
- Resource use
- Estimated remaining time where meaningful
- Cancellation observation

Missing heartbeat does not instantly prove failure. The timeout policy accounts for workload and network behavior.

## 27. Checkpoints

A checkpoint is a durable, validated, resumable boundary.

It includes:

- Checkpoint version
- Run and Issue ID
- Completed phase
- Input digest
- State reference
- Artifact references
- Side effects already committed
- Next safe action
- Executor compatibility
- Created time

Checkpoints must not contain raw secrets. A new Run may resume only if policy, inputs, and executor compatibility permit it.

## 28. Stateless versus stateful executors

- **Stateless executor:** receives all required input and returns an output without relying on hidden prior memory.
- **Stateful executor:** uses persisted flow, agent, or workspace state across steps or interruption.

LiNKsites prefers stateless Issues where practical. Stateful execution is allowed when:

- State is externally persisted or checkpointed.
- State identity is tied to the Run.
- Important facts are promoted into structured artifacts.
- Resumption and abandonment are defined.
- Cross-tenant reuse is prohibited.

CrewAI persistence, Agent Zero memory, or a Cursor workspace does not become the Program Ledger.

## 29. Cancellation

Cancellation is a command, not an assumption that work stopped.

The sequence is:

1. Authorize cancellation.
2. Move Run to `cancel_requested`.
3. Stop new side effects.
4. Executor reaches a safe point.
5. Record partial outputs and effects.
6. Release or retain leases as policy requires.
7. Compensate if necessary.
8. Verify resulting state.
9. Mark Run and Issue outcome.

Forced termination may be required for unsafe behavior, but the system then treats all effects as uncertain until reconciled.

## 30. Run output

The executor returns an Output Manifest, not merely prose:

```yaml
run_id: run-id
output_schema_version: version
status: candidate
primary_artifact_ref: artifact-reference
artifacts:
  - artifact-id
claims:
  - claim-code
metrics:
  duration_ms: integer
  tokens_in: integer-or-null
  tokens_out: integer-or-null
  money_cost: amount
side_effects:
  - effect-id
evidence_refs:
  - log-or-report
warnings:
  - warning-code
executor_completion_at: timestamp
```

The controller validates schema, artifacts, tenant scope, digest, and policy before marking `succeeded`.

## 31. Artifacts

An Artifact Record contains:

- Artifact ID and type
- Site or Program scope
- Producer Run
- Schema and version
- Content digest
- Storage reference
- Classification
- Provenance
- Creation time
- Expiry or retention profile
- Parent artifacts
- Acceptance status

Large files and prompts are stored by reference. The Ledger does not become an unbounded blob store.

## 32. Gate acceptance

After candidate output:

1. Run moves to `succeeded`.
2. Issue moves to `awaiting_gate`.
3. Required Gate receives exact output and evidence.
4. Gate evaluates deterministic checks and required approvals.
5. If passed, Issue completes and output becomes accepted.
6. If failed, controller selects retry, repair, exception, cancellation, or failure.

The executor cannot self-declare acceptance unless the Gate policy explicitly delegates that narrow authority.

## 33. Executor Registry

Every executor has a Registry entry:

```yaml
executor_id: exec-business-research-agent
executor_type: ai-agent
adapter_id: adapter-crewai
runtime_version: version
capabilities:
  - web-research
  - structured-fact-extraction
supported_input_schemas:
  - schema-reference
supported_output_schemas:
  - schema-reference
modalities:
  - text
  - image
security_profile_id: untrusted-web-research
data_classes_allowed:
  - public
  - internal
cost_profile_id: model-route-policy
concurrency_limit: integer
health_state: available
```

## 34. Executor types

LiNKsites supports:

1. Deterministic library or function
2. Command-line script
3. Container job
4. Persistent application service
5. Graphile Worker task or equivalent
6. n8n workflow
7. Browser automation
8. External provider API
9. Single AI agent
10. Multi-agent crew
11. Stateful agent runtime
12. Coding agent
13. Human-assisted executor

Every type uses the same Run envelope and reports comparable evidence.

## 35. Deterministic executor preference

Use code, schema validation, templating, transformation, query, or automation when:

- Rules are known.
- Input and output are structured.
- Correctness is objectively testable.
- Variation is unnecessary.
- The task repeats frequently.
- A model would add cost or nondeterminism without value.

Examples include Site ID resolution, component selection constraints, content mapping, cache keys, DNS comparison, screenshot capture, form validation, and release promotion.

## 36. n8n executor

n8n is suited to:

- Webhook and schedule triggers
- Provider integrations
- Data movement
- Notification workflows
- Repeated SMB automation patterns
- Approval or exception routing
- Low-code composition around stable APIs

Each n8n workflow is versioned and registered. The adapter passes Run ID, idempotency key, scope, and input reference; it receives n8n execution ID, status, output, and error.

At higher execution volume, n8n queue mode and concurrency controls may be evaluated. Early deployment should not add Redis and multiple workers before measured need.

## 37. Browser executor

Browser Issues use a controlled Playwright or approved browser runner with:

- Domain and network policy
- Isolated browser context
- No shared customer session
- Download quarantine
- Timeout and navigation limits
- Screenshot and trace evidence
- Prompt-injection boundary
- Captcha or restricted-action escalation
- Credential broker where authorized

Browser completion does not accept unverifiable visual inference as structured truth.

## 38. CrewAI executor

CrewAI may be used where specialized agents improve research, critique, or synthesis.

The adapter pins:

- Crew and Flow definition version
- Agent roles
- Model routes
- Tools
- knowledge inputs
- memory and persistence configuration
- structured output schemas
- context and budget
- checkpoint identity

Crew memory is scoped to the Run or explicit reusable knowledge object. It must not mix customer state.

## 39. Agent Zero executor

Agent Zero or another stateful general agent is suitable only for Issues whose environment and exploratory nature justify it.

It receives:

- Sandboxed workspace
- Narrow tools
- Run-specific state
- Network and secret policy
- Maximum steps and cost
- Checkpoint and export requirements
- Structured final artifact contract

Its persistent memory is not authoritative until promoted through a governed output.

## 40. Cursor or coding-agent executor

A coding agent may execute repository Issues such as implementing components, tests, adapters, migrations, or infrastructure definitions.

Controls include:

- Exact repository and branch/worktree scope
- Issue-specific instructions
- Required context documents
- No production credentials
- Test and formatting commands
- Prohibited destructive operations
- Diff and commit artifact
- Review and CI Gate
- No autonomous production deployment unless separately authorized

The code diff is candidate output; merge and release are later Gates.

## 41. Human-assisted executor

Some Issues may initially require a human, such as customer approval or ambiguous domain authority.

The human receives the same:

- Issue contract
- Scope
- input manifest
- deadline
- allowed actions
- output form
- evidence requirement
- Gate

Manual work is not exempt from state, cost, or audit.

## 42. Executor adapter

Every adapter implements:

- `validate_dispatch(run)`
- `dispatch(run)`
- `get_status(external_execution_ref)`
- `request_cancel(run)`
- `collect_output(run)`
- `collect_evidence(run)`
- `reconcile(run)`
- `health()`

Runtime-specific details remain inside the adapter.

## 43. Executor health

The Registry tracks:

- Available
- Degraded
- Rate limited
- At capacity
- Maintenance
- Unhealthy
- Disabled

The router does not dispatch to an unhealthy executor. Active Runs follow their timeout and reconciliation policy rather than being assumed failed immediately.

## 44. Executor qualification

Before production use, an executor must prove:

- Contract-valid outputs
- Tenant-scope preservation
- Idempotency behavior
- Timeout and cancellation
- Retry classification
- Secret handling
- Evidence generation
- Cost reporting
- Failure behavior
- Version identification
- Test-fixture performance

Qualification may be limited to named Issue Types.

## 45. Routing inputs

The router evaluates:

- Issue Type
- Input and output schemas
- Need for creativity or judgment
- Determinism requirement
- Risk and side-effect class
- Data classification
- Required modality
- Context size
- Expected latency
- Cost budget
- Deadline
- model and provider availability
- Executor historical performance
- Tenant or region constraints
- tool requirements
- quality threshold

Routing is a policy decision recorded before dispatch.

## 46. Routing ladder

The preferred ladder is:

1. Deterministic code, database, or template
2. Existing n8n automation or registered service
3. Low-cost specialist model with structured output
4. Mid-tier model for broader reasoning
5. Frontier model for difficult or high-value generation
6. Multimodal model where images or rendered pages must be interpreted
7. Multi-agent crew where role separation provides measured benefit
8. Human or OpenClaw-coordinated exception

The router starts at the lowest level that can meet the contract and Gate reliably.

## 47. Model Route record

```yaml
model_route_id: mr_...
run_id: run-id
provider: provider-name
model_identifier: exact-available-id
model_class: low-cost-structured
model_snapshot_or_version: version-if-available
reason_codes:
  - structured-generation-required
  - deterministic-template-insufficient
prompt_template_ref: prompt-v7
context_manifest_ref: context-id
tool_policy_ref: tools-research-readonly
temperature_or_sampling_profile: governed-profile
structured_output_schema_ref: schema-reference
max_input_tokens: integer
max_output_tokens: integer
cost_limit: amount
fallback_policy_id: model-fallback-v2
```

## 48. Model versioning

Where providers offer immutable snapshots, the Run pins one. Where only moving aliases exist, LiNKsites records:

- Alias
- Observed provider version where available
- invocation time
- prompt and tool versions
- evaluation results

A model change triggers qualification on representative Issue fixtures before broad routing.

## 49. Prompt contract

A production prompt is a versioned artifact with:

- Purpose
- Applicable Issue Types
- Governing instructions
- Input schema
- Context assembly rules
- Untrusted-content boundary
- Tool rules
- Output schema
- Examples and counterexamples
- Refusal or insufficiency behavior
- Evaluation set
- Cost profile
- Change history

Prompts are not edited live inside one active Run.

## 50. Context assembly

The controller provides only context required by the Issue:

- Current Program and Issue contract
- Site Specification or Customer Facts within scope
- Relevant component or kit documentation
- Pinned source evidence
- prior accepted artifacts
- tool and security policy
- output schema
- budget

It does not dump the entire knowledge vault, all customers, or unrelated chat history into every model call.

## 51. Untrusted context

Research pages, customer documents, scraped text, issue comments, emails, and generated content are labelled as data, not governing instructions. They cannot alter:

- Tool permissions
- budget
- Site ID
- output destination
- secret access
- model route
- Gate
- authority

This rule is enforced outside the model.

## 52. Structured model output

AI executors return a schema-valid object plus evidence references. Free-form explanation may accompany it but cannot replace required fields.

Validation checks:

- JSON/schema validity
- Required fields
- enum values
- length and numeric bounds
- Site ID
- source references
- unsupported claims
- prohibited content
- cost and token report

Invalid output is a classified Run failure, not silently repaired inside the same record without evidence.

## 53. Agent tools

Tools are allowlisted by Issue. A tool definition includes:

- Capability
- Input schema
- Output schema
- Side-effect class
- Site and environment scope
- Authentication identity
- rate and cost limit
- idempotency behavior
- audit requirements
- timeout
- compensation

Agents do not receive a general shell, browser, database, secret, and deployment toolset unless the Issue genuinely requires each capability.

## 54. Model and executor budget

Every Run has limits for applicable resources:

- Money
- Input and output tokens
- Tool calls
- Agent steps
- Runtime
- browser pages
- external requests
- storage
- generated media
- retries

Approaching the limit may trigger a checkpoint or safe stop. Exceeding it requires new authority, not hidden continuation.

## 55. Model evaluation

Each model route is evaluated on representative fixtures for:

- Contract validity
- factual accuracy
- source use
- visual or content quality
- consistency
- tool safety
- latency
- token use
- monetary cost
- retry rate
- Gate pass rate

A cheaper route may replace a frontier route only after it meets the required acceptance rate.

## 56. Routing feedback

Accepted and failed Run outcomes update routing evidence:

- First-pass Gate rate
- repair frequency
- token and money cost
- latency
- provider failure
- quality dimension
- Issue Type
- vertical and content class

The router does not self-modify production policy without a governed evaluation and release.

## 57. Idempotency definition

An operation is idempotent when repeating the same intended command under the same idempotency key produces the same accepted effect rather than an additional unintended effect.

Examples:

- Repeating preview creation returns the existing matching preview build.
- Repeating a form delivery does not create a second CRM lead.
- Repeating a content promotion does not publish a duplicate release.
- Repeating custom-hostname creation reconciles the existing provider object.

## 58. Idempotency key

The key is derived from stable business intent, not a random retry identifier.

Conceptually:

```text
hash(
  issue_type
  + target_entity
  + tenant_scope
  + input_digest
  + intended_effect
  + contract_version
)
```

Every Run attempt of the same intended effect shares the effect idempotency key while retaining a unique Run ID.

## 59. Idempotency Record

```yaml
idempotency_key: key
operation_type: payload-promote-release
site_id: site-id
target_entity_id: release-id
input_digest: digest
state: completed
owner_run_id: run-id
result_ref: publication-result
side_effect_refs:
  - effect-id
created_at: timestamp
completed_at: timestamp
expires_at: null-or-policy-time
```

A database unique constraint protects the key within its operation scope.

## 60. Idempotency state machine

```text
reserved
→ executing
→ completed
```

Alternative states:

- `failed_safe_to_retry`
- `outcome_unknown`
- `compensation_required`
- `compensated`
- `expired`

An `outcome_unknown` state requires reconciliation before another potentially duplicating effect.

## 61. Transactional outbox

When a database state change must emit work or an event:

- Business state and outbox event commit together.
- A dispatcher delivers the event at least once.
- Consumer deduplicates it.
- Delivery acknowledgement is recorded.

This prevents a committed state change with no corresponding dispatch and prevents unrecorded dispatch before state commitment.

## 62. Consumer inbox

Cross-Program and external consumers maintain an Inbox or equivalent deduplication record containing:

- Event ID
- Producer
- schema version
- received time
- processing state
- result reference

Repeated delivery returns the existing result. Consumer idempotency is required even if the producer believes it sends once.

## 63. External provider idempotency

If a provider accepts idempotency keys, the adapter sends the stable effect key. If it does not:

- Search or reconcile existing provider state before create.
- Store provider object ID immediately.
- Use deterministic external names or metadata where safe.
- Lock the effect locally.
- Classify lost acknowledgement as `outcome_unknown`.

Blind repeat is prohibited for payments, domains, publication, destructive changes, and customer messaging.

## 64. Concurrency control

LiNKsites combines:

- Unique constraints
- optimistic version checks
- row locks for short transactions
- advisory or named locks where justified
- executor leases
- fencing tokens
- per-site serial queues for publication and domain change
- immutable artifacts
- compare-and-swap state transitions

Locks have owners, timeouts, and recovery. A forgotten permanent lock must not halt a site indefinitely.

## 65. Optimistic concurrency

A state-changing command includes the expected current version. The update succeeds only if the record still matches that version.

If another change won:

- The stale Run does not overwrite it.
- The controller reloads state.
- Policy decides rebase, new Issue, cancel, or exception.

## 66. Work that must be serialized

Examples include:

- Publishing a site's content release
- Changing canonical domain
- Migrating one site between VPSs
- Recycling one preview reservation
- Applying one database migration line
- Rotating one secret version
- Processing ordered customer changes

Parallel research or media generation may still occur before the serialized commit.

## 67. Failure taxonomy

Every failure has a machine-readable class:

| Class | Meaning | Default response |
|---|---|---|
| `transient_infrastructure` | Network, temporary host, queue, or service interruption | Retry with backoff |
| `rate_limited` | Provider requests slower traffic | Retry after provider or policy delay |
| `capacity_unavailable` | No executor or resource slot | Reschedule or scale within authority |
| `timeout_uncertain` | Deadline expired and effects may exist | Reconcile before retry |
| `invalid_input` | Input violates contract | Repair input; no identical retry |
| `invalid_output` | Executor returned contract-invalid output | Retry only if nondeterministic policy allows; otherwise repair/route |
| `quality_gate_failed` | Candidate valid but unacceptable | Repair or new route |
| `authorization_denied` | Authority or scope missing | Block or escalate; do not retry blindly |
| `budget_exhausted` | Approved cost or resource limit reached | Stop and request authority or redesign |
| `security_policy` | Security control rejected action | Contain and investigate |
| `provider_permanent` | Provider rejects request permanently | Repair configuration or choose approved alternative |
| `code_defect` | Executor implementation is wrong | Fix and release executor |
| `cancelled` | Authorized cancellation | Compensate if required |
| `unknown` | Evidence insufficient | Collect evidence and escalate |

## 68. Retry policy

```yaml
retry_policy_id: provider-transient-v2
retryable_classes:
  - transient_infrastructure
  - rate_limited
max_attempts: 5
initial_delay_seconds: 5
backoff_multiplier: 2
max_delay_seconds: 900
jitter: full
respect_retry_after: true
same_input_required: true
same_executor_required: false
reconciliation_before_retry:
  - timeout_uncertain
on_exhaustion: exception
```

## 69. Retry doctrine

- A retry is a new Run.
- Attempt count is bounded.
- Backoff prevents synchronized storms.
- Provider `Retry-After` is respected when safe.
- Same intended effect uses the same idempotency key.
- Inputs remain pinned.
- A changed prompt, model, executor, or input is visible.
- Retry does not reset total Issue budget unless new authority exists.
- The Gate evaluates each candidate independently.
- Failure evidence is preserved.

## 70. When not to retry

Do not repeat unchanged work when:

- Required input is missing.
- Authorization is denied.
- Site ID or tenant scope conflicts.
- Budget is exhausted.
- Schema is invalid.
- Provider says the request is permanently unsupported.
- The same deterministic code has a defect.
- The Gate identifies a design or factual flaw.
- A potentially destructive effect has unknown outcome.
- Security policy stopped the action.

Create repair, reconcile, redesign, or exception work instead.

## 71. AI-output retry

An AI Run may receive a bounded same-route retry for transient provider errors or a known parse failure if policy allows.

Quality failure normally follows:

1. Diagnose reason.
2. Determine whether context, prompt, model, or input needs change.
3. Create a new Run with the changed route explicitly recorded.
4. Charge cumulative cost to the Issue.

Repeatedly asking the same model to “try again” without a changed hypothesis is not a strategy.

## 72. Fallback

Fallback is a new Run using an alternative eligible executor.

The policy defines:

- Failure classes that allow fallback
- Alternative executor order
- Additional budget
- Data and provider constraints
- quality Gate
- Maximum transitions
- Whether human authority is required

Fallback does not permit a lower-security executor or an unapproved model.

## 73. Repair Issue

A Repair Issue changes the conditions that caused failure.

Examples:

- Correct invalid Customer Facts.
- Fix a component.
- Change an image crop.
- update provider credentials.
- Modify a mapping.
- Resolve domain validation.
- Increase an approved field limit.
- Patch an executor.

The original Issue and Run remain failed or awaiting repair. Repair completion then authorizes a new Run or replacement Issue.

## 74. Compensation definition

Compensation is an explicit action that reverses, neutralizes, releases, or otherwise makes safe a previously completed side effect when the overall workflow cannot proceed.

It is not always a perfect undo. For example, an email cannot be unsent. Compensation may record a correction, suppress later delivery, or notify an operator.

## 75. Side-effect classes

| Class | Example | Required design |
|---|---|---|
| None | Pure analysis or validation | No compensation |
| Reproducible artifact | Generated screenshot or build | Delete/expire or leave unreferenced |
| Reversible state | Site Assignment change before traffic | Restore prior version |
| Conditionally reversible | DNS or publication change | Roll back if prior state remains valid |
| Irreversible external | Sent message | Prevent duplicate; corrective action only |
| Destructive | Delete or overwrite | Strong authority, backup, tombstone, delayed execution |
| Financial | Charge, refund, subscription | Provider idempotency and explicit business compensation |

Every Issue Type declares its class.

## 76. Compensation policy

```yaml
compensation_policy_id: preview-build-release-v1
trigger_conditions:
  - issue-cancelled-after-build
  - gate-terminal-failure
steps:
  - action: detach-preview-route
    idempotency_scope: preview-id
  - action: release-foundation-reservation
    idempotency_scope: reservation-id
  - action: expire-build-artifacts
    idempotency_scope: build-id
verification:
  - no-active-preview-route
  - reservation-available-or-retired
on_failure: operations-exception
```

## 77. Compensation order

Distributed workflow compensation usually runs in reverse dependency order:

1. Stop new downstream effects.
2. Neutralize public exposure.
3. Restore routing or active pointers.
4. Release reservations and leases.
5. Mark or expire artifacts.
6. Reconcile external providers.
7. Verify final state.

The exact order is encoded per workflow, not improvised during failure.

## 78. Compensation Run

Compensation is executed as its own Run or child Issues with:

- Authority
- pinned prior state
- effect references
- idempotency keys
- executor
- evidence
- verification Gate
- retry policy

Compensation failure creates an Operations Exception and never falsely marks the original workflow safe.

## 79. Saga record

For a multi-step distributed change, a Saga records:

- Steps
- order
- Run per step
- committed effects
- compensation per effect
- current forward or reverse state
- authority
- final verification

Examples include customer launch, site migration, domain cutover, and cross-Program paid activation.

## 80. Timeout policy

Each Run defines:

- Queue wait timeout
- Claim timeout
- Start-to-close timeout
- Heartbeat timeout
- Overall Issue deadline
- External provider timeout
- Cancellation grace
- Checkpoint expiry

Timeout behavior differs by executor. A timed-out browser job, model API call, n8n execution, and DNS validation wait cannot use one arbitrary limit.

## 81. Expiration

All waiting objects have expiry behavior:

- Reservation expires and releases.
- Preview authority expires and stops dispatch.
- Customer approval request escalates or closes.
- Domain validation enters customer-action state.
- Lease expires and requires reconciliation.
- Gate result becomes stale after relevant change.
- Secret capability grant expires.

Expired state creates a recorded transition, not silent disappearance.

## 82. Reconciliation

Reconciliation compares:

- Program Ledger state
- Queue state
- External runtime state
- provider state
- actual side effects
- artifacts and evidence

It resolves cases such as:

- Run is `executing` but no runtime exists.
- n8n reports success but output is missing.
- Provider object exists after local timeout.
- Lease expired but heartbeat arrived late.
- Gate passed for an older artifact.
- Compensation reported success but route remains active.

Reconciliation is scheduled and also triggered by incidents.

## 83. Event model

Execution events include:

- Issue created, blocked, ready, dispatched, completed, failed
- Run created, queued, claimed, heartbeat, checkpoint, succeeded, failed, timed out, cancelled
- Gate ready, passed, failed, overridden, expired
- Artifact created and accepted
- Idempotency reserved and completed
- Side effect committed
- Retry scheduled
- Fallback selected
- Compensation started and completed
- Exception created and resolved

Events carry schema version, actor, Site ID, correlation, causation, idempotency, and evidence.

## 84. Materialized state

The Ledger may maintain current Issue and Run tables for efficient dispatch, but append-only events preserve history. State can be rebuilt or reconciled from events and authoritative artifacts.

Direct table mutations that bypass transition validation are prohibited outside controlled repair tooling.

## 85. Cost accounting

Every Run records:

- Executor compute
- model tokens and provider charge
- browser time
- external API cost
- generated media cost
- storage and transfer attributable to the Run
- human time where known
- retry and repair cost
- compensation cost

Issue cost is cumulative across all Runs, not only the accepted attempt.

## 86. Performance accounting

Metrics include:

- Queue wait
- Execution time
- Gate time
- End-to-end Issue cycle time
- attempts
- checkpoint count
- lease expiries
- timeout
- fallback
- compensation
- executor utilization
- first-pass Gate rate
- failure class

The Program can then identify expensive or unreliable Issue Types.

## 87. Provenance

Accepted output retains:

- Issue and Run
- executor and version
- model, prompt, tools, and skill versions
- input artifacts and sources
- transformation lineage
- cost
- Gate result
- repair ancestry

A later content or code audit can trace the result without reading chat history.

## 88. Security boundary

Section 18 applies to every Run:

- Site-scoped capability envelope
- no secret in prompt
- brokered privileged actions
- environment separation
- network policy
- untrusted-content boundary
- output validation
- audit
- lease and identity
- revocation

The controller denies dispatch if the executor cannot satisfy the security profile.

## 89. Autonomous controller

The Program Controller autonomously:

- Evaluates readiness
- Creates Runs
- Routes executors
- Dispatches
- monitors leases and heartbeats
- validates output contracts
- triggers Gates
- schedules safe retries
- invokes compensation
- reconciles uncertain outcomes
- opens Exceptions
- records cost and evidence

It operates through deterministic policy. AI may advise on ambiguity, but it does not replace state-transition enforcement.

## 90. OpenClaw role

OpenClaw may:

- Explain blocked, failed, or expensive Issues
- Review an Exception Package
- Coordinate an approved Repair or Compensation Issue
- Ask Carlos for new authority or budget
- Recommend a model or executor policy change
- Monitor repeated failure patterns
- Confirm that reconciliation completed

OpenClaw does not need to approve normal ready Issues, hold every executor credential, or remain online for the queue and controller to progress.

## 91. Exception Package

```yaml
exception_id: exc_...
issue_id: issue-id
runs:
  - run-id
current_state: exception
failure_classes:
  - timeout_uncertain
affected_site_ids:
  - site-id
expected_effect: effect-description
observed_effect: evidence-description
actions_attempted:
  - action-reference
remaining_options:
  - reconcile-provider
  - compensate-route
recommended_option: reconcile-provider
required_authority: operations-high
cost_to_date: amount
deadline: timestamp
evidence_refs:
  - evidence-id
```

This gives OpenClaw or Carlos a bounded decision instead of raw logs.

## 92. Program pause and drain

The controller supports:

- Pause new dispatches
- Allow safe Runs to finish
- Cancel or checkpoint selected Runs
- Continue security and incident Issues
- Drain one executor type
- Drain one VPS or provider
- Resume by Program version

Active Runs keep their pinned definition. Program updates apply to new Runs according to migration policy.

## 93. Version migration

When Issue Types or executors change:

- Draft and blocked Issues may migrate if inputs remain compatible.
- Dispatched and active Runs remain on pinned versions.
- Retry policy states whether a new Run can use the newer executor.
- Incompatible output creates a replacement Issue.
- Migration is recorded.
- Old versions remain available long enough for recovery and audit.

## 94. Testing the execution system

Tests cover:

- State transition validity
- Dependency readiness
- Duplicate dispatch
- Worker crash before and after side effect
- Lost acknowledgement
- Lease expiry and stale worker
- heartbeat and checkpoint
- cancellation
- retry classification
- backoff and jitter
- fallback attribution
- invalid model output
- budget exhaustion
- cross-tenant Run attempt
- idempotency race
- outbox and inbox deduplication
- provider `outcome_unknown`
- compensation success and failure
- Program pause and version migration

Fault injection is required; happy-path tests are insufficient.

## 95. Repository audit requirements

The engineering audit must determine:

1. Where current Program, Module, Stage, Issue, Run, Gate, and event state is stored.
2. Whether Plane, GitHub Issues, Odoo, Supabase, n8n, or repository files currently act as competing sources of truth.
3. Which existing Issue Type definitions exist.
4. Whether inputs, outputs, preconditions, side effects, Gates, retry, and compensation are declared.
5. Whether Issue revisions are immutable after dispatch.
6. Whether all attempts have unique Run IDs.
7. Whether `succeeded` is wrongly treated as accepted.
8. Whether active Runs pin Program, input, executor, prompt, model, and tool versions.
9. Whether a transactional outbox exists.
10. Which queue or scheduler exists and its delivery guarantees.
11. Whether Graphile Worker, pg-boss, BullMQ, Redis, Celery, Temporal, or another runtime is already used.
12. Which n8n workflows execute LiNKsites work.
13. Whether n8n workflow and execution IDs are linked to Runs.
14. Whether n8n is self-hosted, its execution-retention settings, concurrency, and queue mode.
15. Which deterministic scripts, containers, and services exist.
16. Which browser runners exist.
17. Which CrewAI, Agent Zero, Cursor, or other agent executors exist.
18. Whether stateful agent memory is tenant- and Run-scoped.
19. Whether executor adapters implement status, cancellation, output, evidence, and reconciliation.
20. Whether executor health and capacity are tracked.
21. Whether model routing is policy-based or hard-coded.
22. Whether exact model, prompt, context, tools, tokens, and cost are recorded.
23. Whether frontier models are used for deterministic tasks.
24. Whether AI output schemas and factual evidence are validated.
25. Whether executor fallback creates a new Run.
26. Whether every side effect has an idempotency key.
27. Whether database uniqueness protects idempotency races.
28. Whether consumers deduplicate cross-Program events.
29. Whether provider idempotency and reconciliation are implemented.
30. Whether concurrency, leases, fencing, and stale-worker behavior are safe.
31. Whether publication, domain changes, migration, and secret rotation are serialized.
32. Whether failures have machine-readable classes.
33. Whether retry policies distinguish transient from terminal failures.
34. Whether identical invalid work is repeatedly retried.
35. Whether retries preserve input versions and total budget.
36. Whether repair is represented separately from retry.
37. Whether side-effect classes and compensation policies exist.
38. Whether compensation uses its own Runs and verification.
39. Whether timeouts, cancellation, and expiry are explicit.
40. Whether reconciliation detects external/local state differences.
41. Whether events are append-only and state is reconstructable.
42. Whether Run cost includes failed attempts and compensation.
43. Whether security capability envelopes constrain executors.
44. Whether OpenClaw is incorrectly required for normal dispatch or holds universal credentials.

Each item is reported as `implemented`, `partial`, `conflicting`, `obsolete`, `missing`, or `unknown`, with evidence and priority.

## 96. Initial implementation sequence

### Phase 1 — Execution inventory

- Inventory existing tasks, queues, workflows, scripts, agents, states, and trackers.
- Map current work to Program, Module, Stage, Issue, Run, and Gate.
- Identify competing sources of truth and hidden executor state.

### Phase 2 — Program Ledger

- Implement Issue Type, Issue, Run, Gate, Event, Artifact, Idempotency, Lease, Cost, and Exception records.
- Implement validated state transitions.
- Add immutable input and output manifests.

### Phase 3 — Dispatch and queue

- Implement transactional outbox.
- Evaluate existing queue; adopt Graphile Worker or an adequate existing equivalent.
- Add claim, lease, heartbeat, timeout, cancellation, and reconciliation.

### Phase 4 — Deterministic executors

- Register scripts, services, container jobs, and browser runners.
- Implement common adapters and evidence.
- Make all effects idempotent.

### Phase 5 — n8n and provider adapters

- Register versioned n8n workflows.
- Link Run ID to n8n execution ID.
- Add error classification, idempotency, cancellation, and output collection.

### Phase 6 — AI executor adapters

- Register model, CrewAI, Agent Zero, and coding-agent capabilities.
- Implement prompt, context, tool, memory, output, and budget controls.
- Create representative qualification fixtures.

### Phase 7 — Retry and compensation

- Define failure taxonomy and policies by Issue Type.
- Implement backoff, jitter, fallback, Repair Issues, and Sagas.
- Fault-test lost acknowledgements and partial effects.

### Phase 8 — Autonomy and optimization

- Enable autonomous routing and safe retry.
- Add routing performance feedback.
- Integrate OpenClaw Exception Packages.
- Evaluate Temporal only if measured workflow complexity justifies it.

## 97. Decisions intentionally still open

- Final initial job queue after repository audit
- Graphile Worker versus existing equivalent
- Whether and when Temporal is introduced
- Program Ledger service implementation language
- Event-store physical design and retention
- Exact external issue-tracker synchronization
- n8n concurrency and later queue-mode thresholds
- Agent Zero deployment and state persistence
- CrewAI versions, Flow persistence, and checkpoint strategy
- Coding-agent provider adapters
- Model provider and route catalog
- Model-evaluation thresholds
- Default retry counts and backoff by Issue Type
- Fencing implementation for each side-effecting service
- Artifact-store selection
- Human executor user interface
- OpenClaw exception integration protocol

These decisions do not prevent implementation of the stable Issue, Run, Gate, idempotency, retry, compensation, and adapter contracts.

## 98. Acceptance criteria

This part of LiNKsites is adequately implemented when:

1. Every executable unit is a typed atomic Issue with pinned inputs, output contract, Gate, retry, and compensation policy.
2. Every attempt creates a unique immutable Run.
3. `Run succeeded` produces only a candidate output; `Issue completed` requires Gate acceptance.
4. Program state remains authoritative outside n8n, CrewAI, Agent Zero, Cursor, or any other runtime.
5. Issue dependencies, readiness, authority, budget, and capacity are explicit.
6. Dispatch uses a transactional outbox and at-least-once semantics.
7. Duplicate dispatch and duplicate completion are safe.
8. Claims use leases and stale workers cannot overwrite newer state.
9. Long Runs heartbeat and checkpoint where appropriate.
10. Cancellation records partial effects and invokes compensation when required.
11. Run output is schema-valid, tenant-scoped, and stored by artifact reference.
12. Every executor has a registered identity, version, capability, security profile, cost profile, and adapter.
13. Deterministic executors are preferred for deterministic work.
14. n8n workflows, browser runs, agent sessions, and coding sessions link to Program Run IDs.
15. Stateful executor memory is Run- and tenant-scoped and cannot become hidden authority.
16. Model routing considers complexity, risk, modality, quality, cost, and provider health.
17. Exact model, prompt, context, tools, tokens, and cost are recorded.
18. Fallback to another executor creates a new Run.
19. AI output is validated against a structured schema and evidence requirement.
20. Every side effect has a stable business idempotency key.
21. Database constraints and consumer inboxes prevent race and delivery duplicates.
22. Unknown external outcomes reconcile before repeat.
23. Publication, domain, migration, secret, and other ordered changes are serialized.
24. Failures use machine-readable classes.
25. Retry is limited to conditions likely to change without repair.
26. Backoff, jitter, maximum attempts, deadlines, and cumulative budget are enforced.
27. Repair Issues remain distinct from retries.
28. Side-effect classes and compensation policies exist for every mutating Issue Type.
29. Compensation uses attributable Runs, idempotency, and verification.
30. Timeouts and waiting-state expiry have defined transitions.
31. Reconciliation compares Ledger, queue, executor, provider, and actual effects.
32. Events preserve actor, versions, tenant, correlation, causation, idempotency, and evidence.
33. Cost includes failed Runs, fallbacks, repairs, and compensation.
34. Security capability envelopes constrain every executor.
35. Fault-injection tests prove worker crash, duplicate delivery, timeout uncertainty, cancellation, and compensation behavior.
36. OpenClaw can coordinate exceptions without approving every normal Run or holding universal credentials.

## 99. Governing conclusion

LiNKsites operates as a factory only when work is expressed as explicit atomic Issues rather than a chain of conversational requests. Each Issue states its purpose, pinned input, accepted output, side-effect class, executor policy, Gate, authority, budget, retry, and compensation. Every attempt becomes an immutable Run with its own executor, version, evidence, cost, and outcome. A completed executor is not a completed business task until the Gate accepts its result.

The architecture uses one PostgreSQL Program Ledger and many replaceable executors. A simple Postgres-backed queue is the provisional starting point, n8n executes integration-oriented workflows, deterministic scripts and services perform repeatable work, and browser or AI runtimes handle tasks that require them. CrewAI, Agent Zero, Cursor agents, or future systems remain adapters rather than competing sources of truth. Temporal is a future option if measured long-running orchestration complexity warrants its operational cost.

Delivery is treated as at least once. Stable idempotency keys, unique constraints, transactional outboxes, consumer inboxes, leases, fencing, and provider reconciliation make repetition safe. Retry is used only for transient conditions. Invalid input, quality failure, code defects, missing authority, and uncertain destructive effects create repair, reconciliation, or exception work instead of blind repetition. Fallback is visible as a new Run.

Distributed changes use explicit compensation and Saga records. Cancellation, timeout, and partial failure never erase evidence. The deterministic controller can dispatch, retry, compensate, and escalate routine work autonomously. OpenClaw helps Carlos decide bounded exceptions, but it is not the queue, the Ledger, the credential holder, or the approver of every normal Issue.

## 100. Primary technical references

- [Graphile Worker documentation](https://worker.graphile.org/docs)
- [Graphile Worker error handling](https://worker.graphile.org/docs/error-handling)
- [n8n queue mode](https://docs.n8n.io/deploy/host-n8n/configure-n8n/scaling/enable-queue-mode/)
- [n8n concurrency control](https://docs.n8n.io/deploy/host-n8n/configure-n8n/scaling/control-concurrency/)
- [n8n error workflows](https://docs.n8n.io/build/flow-logic/handle-errors-gracefully/)
- [CrewAI documentation](https://docs.crewai.com/)
- [CrewAI Flows](https://docs.crewai.com/en/concepts/flows)
- [Temporal Workflow Execution](https://docs.temporal.io/workflow-execution)
- [Temporal Activity Execution](https://docs.temporal.io/activity-execution)
- [Temporal application failures](https://docs.temporal.io/encyclopedia/application-failures)

---

**End of Section 20**

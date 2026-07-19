# LiNKsites Program Manual

## Section 23 — Observability, Cost Accounting, Capacity, Metrics, and Continuous Improvement

**Document set:** LiNKsites Program Manual  
**Section:** 23 of 24  
**Status:** Reconciled current doctrine for engineering preparation  
**Date:** 2026-07-13  
**Owner:** LiNKtrend  
**Intended readers:** Carlos, LiNKsites product and engineering agents, reliability and platform operators, finance and Odoo implementers, AI/model-routing designers, Supabase and Payload administrators, repository auditors, OpenClaw oversight designers, and future human collaborators  

---

## 1. Purpose of this section

This section defines how LiNKsites measures whether the website factory is reliable, efficient, scalable, autonomous, economically viable, and improving.

It covers:

- Metrics, logs, traces, events, profiles, and evidence
- Correlation from customer opportunity to Issue, Run, release, site, and financial summary
- OpenTelemetry, Prometheus, Grafana, Loki, Tempo, and Langfuse roles
- Site, frontend, Payload, PostgreSQL/Supabase, queue, executor, integration, and AI observability
- Service-level indicators, objectives, error budgets, alerts, and dashboards
- Direct and allocated cost measurement
- Preview, build, refactor, launch, hosting, support, failure, and AI costs
- Odoo financial-summary boundaries
- VPS, database, storage, queue, and regional capacity
- Business, quality, reliability, autonomy, and unit-economics metrics
- Continuous-improvement and experiment loops

The objective is to make LiNKsites governable by evidence rather than estimates, anecdotes, or agent confidence.

## 2. Plain-English answer

LiNKsites must answer five questions at all times:

1. Is the service working for customers and prospects?
2. Is the factory producing sites correctly and predictably?
3. What did each output and active site actually cost?
4. How much more work can the present infrastructure safely handle?
5. What should be improved next, and did the improvement work?

No single dashboard or tool answers all five. The Program Ledger owns work and outcomes; observability tools explain technical behavior; Langfuse explains model usage; accounting summaries go to Odoo; customer and commercial facts come through the Sales/Odoo contracts.

## 3. Governing doctrine

1. **Measure customer outcomes, not only server uptime.**
2. **Every important output is attributable.** Cost, quality, time, executor, model, and release connect to stable IDs.
3. **The Program Ledger remains authoritative for Issues and Runs.** Telemetry is evidence, not workflow state.
4. **OpenTelemetry is the vendor-neutral instrumentation layer.**
5. **Langfuse is the preferred AI-observability layer.** It is not the Program Ledger.
6. **Odoo receives summarized approved financial facts only.** It does not store prompts, traces, token logs, or raw alerts.
7. **Capacity is measured, not inferred from customer count alone.**
8. **The “20 sites per VPS” figure is a hypothesis, not doctrine.**
9. **The ~40-client and 60–80-client figures are review checkpoints, not unsafe hard limits.**
10. **Cost includes failures, retries, refactoring, support, and idle capacity.**
11. **Observability must itself be secure, reliable, and cost-controlled.**
12. **High-cardinality identifiers belong in traces/logs or exemplars, not indiscriminately in metric labels.**
13. **Alerts require action.** Dashboards provide context; raw noise does neither.
14. **Improvement changes a versioned asset, policy, executor, or runbook and is verified by later evidence.**
15. **Metrics never override tenant isolation, quality, or safety to create an attractive number.**

## 4. Monitoring versus observability

Monitoring answers known questions such as “is the frontend up?” or “is disk IO near its limit?”

Observability provides enough structured evidence to investigate questions not predicted in advance, such as why one vertical's previews cost more or why only one regional cohort has poor Interaction to Next Paint.

LiNKsites needs both.

## 5. Observability architecture

Recommended initial architecture:

```text
Applications, workers, VPS hosts, Payload, PostgreSQL, n8n, and integrations
→ OpenTelemetry SDKs/exporters and Prometheus exporters
→ OpenTelemetry Collector or Grafana Alloy
→ Prometheus-compatible metrics + Loki logs + Tempo traces
→ Grafana dashboards and alerting

AI/model calls
→ Langfuse traces, generations, usage, cost, and evaluations

Issues, Runs, Gates, releases, incidents, costs, and capacity decisions
→ LiNKsites Program Ledger

Approved aggregated financial summaries
→ Odoo
```

Equivalent open-source backends may replace individual components later without changing the telemetry contract.

## 6. System-of-record matrix

| Information | Authority |
|---|---|
| Issue, Run, Gate, retry, compensation, release, and exception state | Program Ledger |
| Metrics time series | Prometheus-compatible metric store |
| Structured application and infrastructure logs | Loki or approved log store |
| Distributed technical traces | Tempo or approved trace store |
| Model generations, tokens, model costs, AI evaluations | Langfuse |
| Customer site content | Payload/PostgreSQL |
| Working content and operational records | Supabase/PostgreSQL bounded schemas |
| Commercial revenue, invoice, payment accounting, approved allocation | Odoo |
| Stripe processor fee and event facts | Stripe, reconciled through the integration layer |
| Source code and observability configuration | Version-controlled repositories |

## 7. Telemetry signals

LiNKsites uses:

- **Metrics:** numeric measurements over time
- **Logs:** structured event records
- **Traces:** causal path across services and executors
- **Events:** important business or lifecycle transitions
- **Profiles:** code-level resource-use evidence where justified
- **Artifacts:** screenshots, reports, manifests, and test evidence
- **Evaluations:** quality scores and pass/fail judgments

The same fact is not duplicated blindly across every signal.

## 8. OpenTelemetry role

OpenTelemetry supplies common instrumentation, context propagation, semantic naming, and export. It avoids coupling application code directly to one storage vendor.

It should instrument:

- HTTP and internal service calls
- Database queries at a safe level
- Queue publish/consume
- Issue and Run execution
- Payload promotion and publication
- Frontend rendering and APIs
- External-provider calls
- Build and deploy operations
- Form delivery paths

## 9. Correlation identity

Every relevant signal carries or references available IDs:

- `trace_id`
- `correlation_id`
- `causation_id`
- `issue_id`
- `run_id`
- `program_id`
- `module_id`
- `stage_id`
- `customer_site_id`
- `preview_id`
- `release_id`
- `exception_id` or `incident_id`
- `contract_id`

Sensitive or high-cardinality IDs are not automatically metric labels.

## 10. Resource attributes

Common resource attributes include:

- Service name and version
- Deployment environment
- Region and availability location
- VPS or pool identity
- Container/image version
- Repository and commit reference
- Runtime and executor type
- Program and component

These describe where telemetry originated and make comparisons across releases possible.

## 11. Telemetry Event contract

```yaml
event_id: id
event_type: linksites.run.completed
schema_version: version
occurred_at: timestamp
service: service-name
environment: production
resource: object
correlation:
  trace_id: optional-id
  correlation_id: id
  issue_id: optional-id
  run_id: optional-id
  customer_site_id: optional-id
attributes: structured-object
severity: value
data_classification: operational
evidence_refs: []
```

Events use controlled schemas and bounded payloads.

## 12. Data classification and redaction

Telemetry must not contain:

- Passwords, API keys, tokens, or cookies
- Payment credentials
- Full webhook secrets or signatures
- Raw customer submissions unless explicitly secured and necessary
- Unnecessary scraped content
- Full prompts or outputs when metadata is sufficient
- Cross-tenant content in a shared query result

Redaction occurs before export where possible.

## 13. Sampling

Sampling balances investigation value and cost.

Recommended posture:

- Keep all errors, security-relevant events, protected actions, payment/activation handoffs, and rare failures.
- Keep all Issue/Run outcome records in the Ledger.
- Sample routine high-volume success traces according to service and risk.
- Increase sampling during incident windows.
- Preserve exemplars connecting aggregated metrics to representative traces.
- Never sample away required audit evidence.

Sampling policy is versioned and observable.

## 14. Telemetry collection layer

Use an OpenTelemetry Collector or Grafana Alloy to receive, process, redact, sample, enrich, and route telemetry.

Collectors should:

- Buffer bounded outages
- Apply environment and service attributes
- Remove prohibited fields
- Limit resource use
- Expose their own health metrics
- Use encrypted transport
- Authenticate destinations
- Avoid becoming a single unmonitored failure point

## 15. Metric design

Metrics use stable names, explicit units, descriptions, and low-cardinality labels.

Use:

- Counters for cumulative events
- Gauges for current state
- Histograms for latency, size, and cost distributions
- Recording rules for repeated expensive aggregations

Avoid putting email, URL, Site ID, trace ID, error message, or arbitrary model output in labels.

## 16. Prometheus role

Prometheus or a compatible backend records operational time series and evaluates alert and recording rules.

It should cover:

- Service request rate, error rate, and duration
- Queue depth and age
- Worker saturation
- Host CPU, memory, disk, IO, and network
- Database connections, latency, locks, cache, and storage
- Build/deploy state
- TLS and domain state
- Backup and restore state
- Integration health
- Observability-system health

## 17. Label-cardinality control

Cardinality is a capacity and cost concern.

Rules:

- Use bounded labels such as environment, service, region, tier, executor class, and outcome.
- Do not label every metric with customer, URL, prompt, error text, or trace ID.
- Put fine-grained identity in traces/log fields.
- Use exemplars to connect a metric point to a trace.
- Alert on active-series growth and ingestion spikes.
- Review every new label in code review.

## 18. Structured logs

Logs are JSON or equivalent structured records containing timestamp, severity, service, event name, correlation, target scope, outcome, and safe diagnostic fields.

Logs must not be the only record of:

- Approval
- Payment verification
- Publication
- Launch
- Entitlement
- Backup success
- Issue completion

Those remain canonical objects in their owning systems.

## 19. Loki role

Loki is the preferred initial open-source log store because it integrates with Grafana and indexes a small label set while retaining log content in object storage.

Use low-cardinality stream labels such as service, environment, region, and severity. Store Site ID, Run ID, and trace ID as structured fields for query rather than creating a stream for every identifier.

## 20. Distributed traces

Traces show one operation across components, for example:

```text
Paid Activation accepted
→ Customer Site created
→ Payload draft promoted
→ frontend build
→ deployment
→ DNS validation
→ launch verification
→ Launch Completion emitted
```

Each span records operation, timing, status, version, and safe attributes. Traces do not replace business-state transitions.

## 21. Tempo role

Tempo is the preferred initial open-source distributed-trace store. It should receive OpenTelemetry traces and support links from metrics and logs.

Trace retention may vary by environment, error status, risk, and sampling policy.

## 22. Exemplars

Exemplars connect a high-latency or error metric observation to a representative trace without adding trace IDs as metric labels.

Use exemplars for:

- Slow frontend requests
- Slow Payload queries
- Long Issue execution
- Queue-delay spikes
- High-cost model calls
- Deployment failures

## 23. Langfuse role

Langfuse records AI-specific observations:

- Trace and generation hierarchy
- Model and provider
- Prompt/template version reference
- Input and output token units
- Provider-reported or configured cost
- Latency and time to first token where available
- Tool calls
- Structured output validity
- Evaluation scores
- Cache use
- Fallback and retry relationship

Use the same Run and correlation IDs as the Program Ledger.

## 24. AI-data minimization

Langfuse must not become an uncontrolled copy of all customer content.

Controls include:

- Environment-separated projects
- Metadata-only capture where full text is unnecessary
- Redaction before export
- Attachment policy
- Tenant/site scoping
- Restricted access
- Retention policy
- Explicit opt-in for sensitive debugging

The Program Ledger stores the output artifact reference and verdict, not necessarily the raw prompt.

## 25. AI evaluations

AI output is measured through:

- Schema validity
- Factual grounding
- Prohibited-claim checks
- Style and tier conformity
- Design-quality evaluation
- Human/customer correction rate
- Gate acceptance
- Rework and fallback rate
- Cost per accepted output

Model quality is evaluated on accepted business output, not eloquence alone.

## 26. Synthetic monitoring

Automated probes continuously test:

- Public homepage and key page availability
- Correct Site ID/hostname routing
- TLS validity
- Critical assets
- Forms and delivery path using safe synthetic destinations
- Payload read path
- Preview access controls
- DNS resolution from relevant locations
- Backup and restore readiness signals

Synthetic tests identify controlled expected behavior and avoid creating real customer leads.

## 27. Real-user Web Vitals

Where privacy and customer policy permit, Next.js reports Web Vitals such as LCP, CLS, INP, TTFB, and FCP.

Measure distributions by bounded dimensions such as site tier, frontend release, region, device class, and page type. Avoid high-cardinality per-user labeling.

Lab tests and real-user measurements are complementary.

## 28. Lab performance and quality measurement

Lighthouse or PageSpeed-style automated tests measure performance, accessibility, SEO, and best-practice signals for representative pages.

The system records:

- Test tool/version
- Device/network profile
- URL/release
- Scores and raw evidence
- Budget violations
- Comparison to prior release

One perfect laboratory score does not prove production user experience.

## 29. Frontend service metrics

Measure:

- Request rate, errors, and latency
- Status-code distribution
- Cache hit/miss/stale behavior
- Server-render duration
- Static/dynamic response mix
- Build and deploy time
- Bundle and asset size
- Image transformation time and volume
- Memory and CPU per runtime
- Cold starts/restarts where relevant
- Site-routing and unknown-host failures
- Customer-visible uptime

## 30. Payload CMS metrics

Measure:

- API request rate/error/latency
- Query and hook duration
- Draft and publish operations
- Promotion failures
- Collection-level hotspots where safe
- Job queue depth/age if used
- Media processing
- Cache behavior
- Authentication and permission denials
- Active connections
- Release propagation delay

## 31. PostgreSQL and Supabase metrics

Measure:

- CPU and memory where exposed
- Disk IO utilization/budget
- Database and table size growth
- Connection use and pool saturation
- Query latency and slow queries
- Lock waits and deadlocks
- Cache hit behavior
- WAL and replication state where applicable
- Autovacuum health and table bloat
- API and storage usage
- Backup/PITR status
- RLS/security findings

Disk IO alerts are capacity evidence and cannot be dismissed merely because CPU is low.

## 32. Object-storage metrics

Measure object count, stored bytes, growth, requests, egress, errors, latency, lifecycle transitions, orphaned objects, private/public policy violations, and restore accessibility.

Attribute costs to working assets, published customer media, previews, evidence, logs, and backups.

## 33. n8n metrics

Measure workflow executions, success/failure, queue delay, duration, concurrency, retry, error-workflow activation, webhook latency, worker saturation, workflow version, and credential/integration errors.

n8n execution success does not equal Issue completion until the Program Gate accepts the result.

## 34. Queue and scheduler metrics

Measure:

- Enqueue and completion rate
- Current depth
- Oldest item age
- Lease wait and expiration
- Retry and dead-letter rate
- Priority fairness
- Per-executor saturation
- Duplicate delivery
- Cancellation delay
- Scheduled-versus-actual start

Queue age is usually more actionable than queue count alone.

## 35. Executor metrics

For each executor/version measure:

- Attempt count
- Success and accepted-output rate
- Latency distribution
- Cost distribution
- Retry, fallback, and repair rate
- Timeout and cancellation
- Invalid-output rate
- Security/policy denial
- Resource use
- Gate-specific failure reasons

Executor comparison uses comparable Issue Types and input classes.

## 36. Issue and Run metrics

Program Ledger metrics include:

- Issues created, ready, running, blocked, completed, failed, canceled
- Time in each state
- Runs per completed Issue
- First-pass acceptance
- Rework and repair
- Cost per Issue and Stage
- Executor/model route
- Budget variance
- Human/OpenClaw intervention
- Evidence completeness

## 37. Cross-Program integration metrics

Measure contract receipt and processing latency, duplicates, conflicts, unsupported versions, failed deliveries, reconciliation differences, Stripe-to-Odoo delay, paid-order-to-activation delay, and launch-completion propagation.

## 38. VPS and container metrics

For each VPS/pool measure CPU utilization and throttling, memory working set and pressure, swap, disk used/inodes/latency/IOPS, network traffic/errors, container restarts, file-descriptor and connection use, load average, kernel pressure, backup traffic, and monitoring-agent health.

## 39. Cloudflare and Traefik metrics

Measure request volume, cache ratio, origin traffic, status codes, WAF/rate-limit outcomes, bot traffic, bandwidth, DNS health, certificate state, router/service errors, upstream latency, and unknown-host rejection.

Metrics must allow attribution to site cohort without causing unsafe cardinality.

## 40. DNS, TLS, forms, and messaging metrics

Measure DNS propagation/validation, certificate issuance/renewal/expiry, domain-authority exceptions, form submission/delivery/failure/abuse, provider latency, bounce or webhook failure, and reconciliation of accepted versus delivered events.

Do not log message bodies or form contents unnecessarily.

## 41. Backup and restore metrics

Measure backup start/completion, duration, size, age, failure, encryption, offsite replication, retention, restore-test success, recovery-point achieved, recovery time, and unprotected-resource count.

A backup job returning success without restore evidence is not sufficient assurance.

## 42. Security observability

Measure authentication failures, authorization denials, unusual privilege use, secret age/rotation, vulnerability findings, exposed-service changes, RLS policy failures, WAF events, dependency/image findings, emergency stops, and audit-log integrity.

Security telemetry uses restricted access and longer evidence retention where policy requires.

## 43. Service-level indicators

An SLI is a measured property of service behavior. LiNKsites SLIs include:

- Public-site successful availability
- Valid response latency
- Correct-tenant routing
- Content freshness after publication
- Form delivery success
- Preview availability
- Paid-activation acceptance latency
- Launch throughput
- Backup freshness and tested restorability
- Issue first-pass acceptance
- Autonomous remediation success

## 44. Service-level objectives

SLOs define the desired range over a time window. Initial targets should be provisional and revised after baseline measurement.

Each SLO states:

- Scope
- Indicator formula
- Good/valid events
- Window
- Target
- Exclusions
- Data source
- Owner
- Error-budget policy

Do not copy a generic “industry standard” target without connecting it to product tier and cost.

## 45. Error budgets

An error budget is the permitted gap between perfect service and the SLO.

When burn is high:

- Slow risky releases
- Prioritize reliability repair
- Increase review or sampling
- Pause autonomy graduation
- Investigate recurring causes

Error budgets guide tradeoffs; they do not excuse tenant breaches, data loss, or security failures.

## 46. Alert doctrine

Alert on customer symptoms, imminent capacity exhaustion, failed safety controls, and actionable internal conditions.

Every alert defines:

- Owner
- Severity
- Runbook
- Evidence/dashboard link
- Deduplication and inhibition
- Duration threshold
- Safe automated response
- Escalation and closure

Avoid pages where no action is possible.

## 47. Dashboard hierarchy

Dashboards are layered:

1. Owner/business health
2. Program factory performance
3. Customer-site service health
4. Infrastructure and capacity
5. Cost and unit economics
6. AI/model performance
7. Security and backup posture
8. Detailed service/executor diagnostics

Each dashboard states data freshness and authority.

## 48. Operations dashboard

The primary operations view shows current incidents/exceptions, affected sites, public availability, pending launches, queue age, failed Runs, backup posture, VPS/database saturation, active deployments, and recent changes.

It links aggregate symptoms to evidence without exposing secrets.

## 49. Carlos and OpenClaw views

Carlos receives plain-language outcomes, risks, cost, capacity, and decisions. OpenClaw receives structured summaries and bounded drill-down tools.

Neither requires raw database access. The views distinguish informational state from a required approval.

## 50. Evidence navigation

Every alert, metric anomaly, cost summary, and capacity decision should link through stable references to the relevant Site, Issue, Run, release, trace, logs, dashboard window, Incident/Exception, and source invoice or provider record where applicable.

The goal is one evidence chain, not one database.

## 51. Cost-accounting doctrine

LiNKsites measures operational cost at the smallest practical attributable unit, then aggregates it for decisions and accounting.

Rules:

- Provider invoices remain source evidence.
- Program cost records explain usage and attribution.
- Odoo remains financial authority.
- Estimated, accrued, invoiced, paid, refunded, and allocated costs are distinct states.
- Currency and exchange rate are explicit.
- Cost includes failed and unsold work.
- Shared cost uses a declared allocation method.
- Historical cost is not silently recalculated when a provider changes price.

## 52. Cost hierarchy

Costs aggregate through:

```text
Resource use or provider charge
→ Run
→ Issue
→ Stage
→ Module
→ Preview or Customer Site
→ Product/tier/vertical/campaign
→ LiNKsites Program
→ Linktrend LLC analytic accounting
```

Not every cost can be attributed perfectly. Unallocated remainder remains visible.

## 53. Direct, shared, and overhead costs

| Class | Meaning | Examples |
|---|---|---|
| Direct variable | Clearly caused by one output/site | Model call, image API, domain-specific delivery fee |
| Direct fixed | Dedicated to one customer/site | Dedicated VPS or paid integration |
| Shared variable | Changes with fleet usage | Bandwidth, object-storage operations, shared database IO |
| Shared fixed | Shared platform capacity | Base VPS, monitoring stack, Payload service |
| Program overhead | Supports the factory broadly | Component-foundry work, runbook development |
| Company overhead | Supports multiple Programs | Odoo, office systems, company administration |

## 54. Cost Event record

```yaml
cost_event_id: id
occurred_at: timestamp
cost_type: model|compute|storage|bandwidth|provider|labor|allocation
source:
  provider: value
  source_record_ref: invoice-usage-or-meter-ref
quantity:
  amount: decimal
  unit: tokens|seconds|gb-month|request|hour
money:
  original_currency: code
  original_amount: decimal
  reporting_currency: code
  reporting_amount: decimal
  exchange_rate_ref: optional-ref
attribution:
  run_id: optional-id
  issue_id: optional-id
  preview_id: optional-id
  customer_site_id: optional-id
  product_tier: optional-id
allocation:
  method: direct|measured-share|capacity-share|equal-share|unallocated
  rule_version: version
status: estimated|accrued|reconciled|posted
```

## 55. Provider price catalog

Store versioned prices for models, image/media services, compute, database, storage, bandwidth, messaging, domains, monitoring, and other providers.

Each price entry records effective dates, currency, unit, tiers, free allowances, taxes/fees treatment, and source. Usage is priced using the rate effective when it occurred.

## 56. AI cost measurement

For hosted models record provider-reported input/output/cache units where available, model/version, pricing version, retries, fallbacks, tools, and accepted outcome.

Langfuse provides detailed usage/cost. The Program Ledger receives the Run-level summarized cost and evidence reference.

The useful metric is not cheapest call; it is lowest cost per accepted, saleable, maintainable output.

## 57. Self-hosted model cost

Open-source models are not free. Attribute:

- GPU/CPU time
- Memory reservation
- Host amortization or rental
- Energy where material
- Storage and bandwidth
- Idle capacity
- Operations and maintenance
- Failed jobs

Compare self-hosted and hosted models on quality-adjusted total cost.

## 58. Compute and infrastructure cost

Record VPS, database, CDN, storage, backup, monitoring, and network cost by billing period. Where provider billing is fixed, allocate based on measured resource share or a documented proxy.

Do not pretend an equal per-site split is accurate when a few sites dominate traffic or compute.

## 59. Shared-service allocation

Preferred allocation order:

1. Direct metering
2. Measured resource share
3. Weighted site or workload class
4. Capacity share
5. Equal share only as a temporary last resort

Allocation rules are versioned and reconcile to the provider total plus visible rounding/unallocated difference.

## 60. Customer Site cost

Per-site cost includes attributable hosting, database/storage, bandwidth, backups, monitoring, forms/integrations, routine content changes, incidents/support, and allocated shared platform cost.

Track monthly recurring service cost separately from original build and exceptional work.

## 61. Preview-production cost

Each preview records:

- Foundation selection and reuse
- Deterministic executor cost
- AI/model cost
- Media/API cost
- Build/deploy and preview hosting
- QA and repair
- OpenClaw/human intervention where applicable
- Total direct and allocated cost
- Preview authorization level and ceiling

## 62. Unsold preview inventory economics

An unsold preview is not automatically a total loss. Its record separates:

- Initial investment
- Prospect-specific portions that cannot be reused
- Reusable foundation and asset value
- Carrying/hosting cost
- Each refactor cost
- New prospect assignments
- Final sale or retirement outcome

Do not transfer the original full cost to each later prospect. Record incremental refactor cost and maintain lineage.

## 63. Preview reuse metrics

Measure:

- Percentage built from existing foundations
- Unsold previews recycled
- Average refactor cost versus new build
- Reuse cycles before sale or retirement
- Conversion by original/refactored status
- Time held in inventory
- Quality degradation or improvement
- Restricted/private material removed

## 64. Acquisition and fulfilment cost boundary

Sales owns lead discovery, outreach, and commercial acquisition costs. LiNKsites owns preview-production and website-fulfilment costs. Shared reporting combines them through cross-Program IDs to calculate customer-acquisition and payback metrics.

Neither Program silently duplicates the other's expenses.

## 65. Cost of poor quality

Track the cost of:

- Gate failure
- Rework and repair
- Customer correction
- Defect escape
- Rollback
- Incident and support
- Refund/commercial consequence references
- Unusable media or copy
- Model fallback
- Duplicate work
- Failed automation and reconciliation

This reveals where “cheap” executors create expensive outcomes.

## 66. Unit economics

Key unit-economic views include:

- Preview cost by level
- Cost per qualified preview presented
- Cost per sold website
- Build cost per tier and vertical
- Monthly service cost per active site
- Gross contribution by site/tier/cohort
- Refactor cost savings
- Support cost per site
- Infrastructure cost per site-weight unit
- Payback period on preview investment

Commercial definitions and revenue come from Odoo/Sales.

## 67. Odoo financial-summary boundary

Odoo receives approved summaries such as:

- LiNKsites monthly provider cost
- Allocated infrastructure and shared-service cost
- Customer/tier cost-of-service summary
- Preview-production investment summary
- Analytic-account distributions
- Approved accrual or allocation support

Odoo does not receive raw traces, prompts, log lines, token events, page metrics, or every Run.

## 68. Financial Summary contract

```yaml
financial_summary_id: id
period: YYYY-MM
legal_company_id: linktrend-llc-id
program_id: linksites
reporting_currency: USD
source_cost_events_digest: sha256
totals:
  direct_variable: money
  direct_fixed: money
  shared_allocated: money
  overhead_allocated: money
  unallocated: money
analytic_distributions: []
reconciliation:
  provider_invoice_total: money
  variance: money
  status: aligned|exception
approval_ref: ref
generated_at: timestamp
```

## 69. Stripe and payment-fee cost

Stripe is processor-fact authority for fees and payment events. The integration reconciles fee/refund/dispute facts to Odoo. LiNKsites may reference allocated commercial cost for unit economics but does not post or reinterpret payment accounting.

## 70. Cost reconciliation

Reconcile:

- Metered usage to provider invoice
- Provider invoice to payment/accounting record
- Run summaries to detailed telemetry
- Allocated totals to shared provider cost
- Odoo summary to approved Financial Summary
- Currency conversions to rate source

Variance above tolerance creates a finance/integration exception.

## 71. Budget control

Budgets exist per Run, Issue Type, preview level, site, campaign, provider, model, environment, and billing period where appropriate.

Budget policy can warn, route to a cheaper executor, stop optional work, downgrade autonomy, or require approval. It cannot silently reduce required quality or security.

## 72. Cost anomalies

Detect:

- Sudden cost per accepted output increase
- Token/latency growth after prompt or model change
- Repeated fallbacks
- Unexpected egress
- Observability cost growth
- Idle capacity increase
- One site consuming disproportionate shared resources
- Provider invoice mismatch
- Preview budget exhaustion

An anomaly creates evidence and classification before remediation.

## 73. Capacity doctrine

Capacity is the safe workload a resource can support while meeting SLOs, recovery requirements, and failure headroom.

It is not the maximum workload that avoids an immediate crash.

## 74. Multidimensional VPS capacity

VPS capacity depends on:

- CPU level, peaks, and throttling
- Memory pressure and working set
- Disk space, inodes, latency, and IO
- Network throughput and connection counts
- Traffic shape and bot load
- Cache efficiency
- Static versus dynamic rendering
- Build/deploy concurrency
- Image transformation
- Forms and integrations
- Backup load
- Container density/restarts
- Failure-domain and recovery headroom

## 75. The 20-sites-per-VPS estimate

The earlier 20-site figure was an AI estimate based on generic assumptions. It is neither an industry standard nor a fixed LiNKsites rule.

The first VPS may safely host fewer or more than 20 sites depending on real workload. LiNKsites records site-weight and saturation rather than optimizing for a symbolic count.

## 76. Site-weight model

A site-weight score may combine:

- Monthly requests and bandwidth
- Dynamic request percentage
- Peak concurrency
- Server-render CPU time
- Memory footprint
- Media transformation
- Form/integration volume
- Build frequency
- Storage and backup size
- Incident/support burden

Weights help placement and allocation but are calibrated against observed resource use.

## 77. Headroom policy

Capacity planning reserves headroom for traffic spikes, deploys, backups, failover, monitoring, and one-resource degradation.

Exact headroom targets are measured and configured. A fleet that is economical only when every host runs near exhaustion is not autonomous or resilient.

## 78. Saturation and scaling signals

Scale or rebalance when sustained or forecast evidence shows:

- Resource saturation threatens SLOs
- Queue age grows despite healthy workers
- Database connections or IO approach safe limits
- Deploy/backups interfere with serving
- Recovery headroom is insufficient
- One tenant dominates a pool
- Latency/error budgets burn
- Regional latency and customer density justify placement
- Growth forecast exceeds provisioning lead time

## 79. Initial single-VPS phase

LiNKsites starts with one shared frontend VPS when safe and economical. Early clients may share it regardless of customer region.

The phase must still instrument every capacity dimension, test backup/restore, and prove that another VPS can be provisioned and sites migrated. “Only one server” is not permission to operate blindly.

## 80. The ~40-client architecture checkpoint

Before or around 40 active clients, review whether a second VPS and any CMS/database topology change are justified. This is an architectural and economic checkpoint, not a promise that one VPS must carry 40 sites regardless of measurements.

Capacity or safety may require additional frontend infrastructure earlier. Conversely, efficient low-traffic sites may not require a specific change at exactly 40.

## 81. The 60–80-client regional checkpoint

At approximately 60–80 clients, evaluate clearer VPS presence in justified customer regions and group sites by region for speed and organization.

The decision uses customer/visitor distribution, latency, density, provider availability, cost, operations, data architecture, and migration evidence. Regions are hosting locations, not markets where LiNKsites is permitted to sell.

## 82. Regional placement metrics

Measure:

- Visitor geography and latency
- Customer concentration
- Origin-to-database latency
- Cache hit ratio
- Cross-region egress
- Incident/failover impact
- Deployment and support complexity
- Regional provider cost and capacity
- Data-residency policy when later defined

A language or business address alone does not determine placement.

## 83. Payload/PostgreSQL topology checkpoint

The decision between one central Payload/PostgreSQL content plane, per-region planes, or another topology is deferred until evidence justifies it.

Measure central database load, connections, IO, storage growth, read/write latency, regional round trips, publication propagation, backup/restore, failure blast radius, operations cost, and migration difficulty.

Do not create one database per VPS merely because frontend VPSs exist.

## 84. Supabase project capacity

One appropriately configured project may support many sites, potentially 100 or more, but this is a hypothesis to validate rather than a guarantee.

Track disk IO budget, compute, connections, database/storage size, API load, security posture, backups, and cost. An existing project with unresolved IO or security alerts is not production-ready by assumption.

## 85. Load and stress testing

Test representative mixtures:

- Cached and uncached traffic
- Small and media-heavy sites
- Bot and abusive traffic
- Build/deploy concurrency
- Payload publication bursts
- Form submissions
- Backup overlap
- Database fail/slow behavior
- VPS loss and migration

Record tool/version, scenario, dataset, environment, result, bottleneck, and safe operating conclusion.

## 86. Capacity Forecast record

```yaml
capacity_forecast_id: id
resource_scope: frontend-pool-id
measurement_window: range
current_load: object
safe_capacity_model: version
growth_scenarios: []
headroom_policy: version
forecast_exhaustion_dates: object
recommended_action: add-vps|rebalance|optimize|observe
provisioning_lead_time: duration
evidence_refs: []
confidence: value
approved_decision_ref: optional-ref
```

## 87. Capacity actions

Available actions include optimize code/query/cache, reschedule builds/backups, rebalance sites, resize a resource, add a frontend VPS, isolate a heavy site, change pool class, expand storage/database capacity, or alter topology after review.

Optimization is not an excuse to delay necessary capacity until failure.

## 88. Factory throughput metrics

Measure:

- Preview Requests accepted
- Previews completed and presented
- Paid activations received
- Sites finalized and launched
- Lead time by Stage
- Work in progress
- Bottleneck queue age
- Throughput by tier/vertical/preview level
- On-time completion
- Foundation and component reuse

## 89. Quality metrics

Measure Gate pass rate, first-pass acceptance, accessibility/performance/SEO results, factual correction, visual defects, broken links/forms, launch rollback, customer change rate, post-launch defects, and defect escape by release.

Aggregate scores must retain severity; ten cosmetic passes cannot hide one tenant-isolation failure.

## 90. Reliability metrics

Measure availability, latency, errors, incidents, recovery time, recurrence, backup freshness, restore success, certificate/domain failures, change failure rate, deployment rollback, and error-budget burn.

## 91. Autonomy metrics

Measure percentage of work completed without Carlos, without OpenClaw, and without any AI; auto-remediation rate; exception rate; approval burden; manual touch time; policy denial; fallback; repair; and autonomy downgrades.

High autonomy is valuable only when quality and safety remain acceptable.

## 92. Business and commercial metrics

Through Sales/Odoo contracts, combine:

- Qualified leads
- Preview presentation and engagement
- Conversion by preview level, tier, vertical, and reuse status
- Time to sale and launch
- Active, churned, suspended, and renewed sites
- Revenue and contribution
- Cross-sell references

LiNKsites does not become CRM authority to calculate these views.

## 93. Metric Definition Registry

Every important metric has:

- Name and plain-language question
- Formula
- Numerator/denominator
- Unit
- Dimensions
- Source systems
- Owner
- Freshness
- Inclusion/exclusion rules
- Version and effective date
- Known limitations

Changing a formula creates a new version and prevents misleading historical comparison.

## 94. Continuous-improvement loop

LiNKsites uses:

```text
Observe
→ identify constraint or opportunity
→ form evidence-backed hypothesis
→ prioritize expected value and risk
→ create bounded improvement Issue
→ test in sandbox/staging
→ canary or controlled release
→ measure against baseline
→ adopt, revise, or roll back
→ promote learning into reusable assets and doctrine
```

## 95. Improvement targets

Improvements may update Vertical Kits, components, design rules, prompts, model routes, scripts, validators, runbooks, cache/query strategy, hosting placement, SLOs, pricing inputs, preview allocation, and observability configuration.

Customer-specific private content is not promoted into reusable assets.

## 96. Experiment governance

Every experiment states hypothesis, target metric, guardrails, cohort, baseline, duration/sample rule, expected cost, stopping rule, data classification, owner, and promotion criteria.

Experiments never bypass security, customer authority, contractual entitlement, accessibility, or tenant isolation. A statistically attractive result with unacceptable harm is rejected.

## 97. Repository audit requirements

The audit must determine:

1. Which telemetry tools and agents are actually deployed.
2. Whether OpenTelemetry context propagates across services and Runs.
3. Whether Program state is incorrectly inferred from logs or n8n history.
4. Whether metrics have unsafe high-cardinality labels.
5. Whether logs/traces contain secrets or customer content.
6. Whether environments and tenants are isolated.
7. Whether Prometheus, Loki, Tempo, Grafana, and Langfuse are configured, backed up, and monitored.
8. Whether AI traces use Run/correlation IDs and record actual usage/cost.
9. Whether alerts have owners, runbooks, and tests.
10. Whether rules and dashboards are version-controlled.
11. Whether web vitals, lab tests, and synthetic monitoring exist.
12. Whether Payload, PostgreSQL/Supabase, queue, n8n, frontend, CDN, DNS, TLS, forms, backups, and security are measured.
13. Whether AdminDB or another existing project has unresolved IO/security/capacity issues.
14. Whether provider invoices reconcile to Cost Events and Odoo summaries.
15. Whether preview, refactor, Run, site, and shared costs are attributable.
16. Whether failed work and observability overhead are included.
17. Whether “20 sites per VPS” is hard-coded anywhere.
18. Whether scaling uses measured saturation/headroom.
19. Whether the ~40 and 60–80 checkpoints are represented correctly.
20. Whether central versus regional Payload/PostgreSQL remains evidence-driven.
21. Whether load/failure tests establish safe capacity.
22. Whether metric definitions are consistent across code and dashboards.
23. Whether experiments and improvements preserve baselines and outcomes.

## 98. Initial implementation sequence and open decisions

Implementation sequence:

1. Inventory current instrumentation, dashboards, invoices, and capacity assumptions.
2. Define correlation IDs, resource attributes, and telemetry schemas.
3. Instrument Program Controller, Issues/Runs, frontend, Payload, database, queues, n8n, integrations, and hosts.
4. Deploy or validate collector/Alloy, Prometheus, Grafana, Loki, Tempo, and Langfuse.
5. Add redaction, sampling, retention, and access policy.
6. Create initial SLIs, provisional SLOs, alerts, and runbooks.
7. Implement Cost Event and provider-price catalogs.
8. Reconcile provider usage/invoices and generate Odoo summaries.
9. Implement site, preview, refactor, and shared-service attribution.
10. Baseline the first VPS and central database with load tests.
11. Add capacity forecasts and provisioning lead times.
12. Build owner, operations, factory, cost, AI, capacity, and security dashboards.
13. Define Metric Registry and continuous-improvement workflow.
14. Run one controlled improvement loop end to end.

Open decisions include exact hosting of the observability stack, retention periods, sampling rates, SLO targets, cost allocation weights, reporting currency/exchange-rate source, headroom targets, load profiles, alert thresholds, and later CMS/database regional topology.

## 99. Acceptance criteria and governing conclusion

This section is implemented only when:

1. Technical signals correlate to Program, Issue, Run, site, preview, release, and exception where appropriate.
2. Program Ledger remains work/outcome authority.
3. OpenTelemetry provides vendor-neutral instrumentation.
4. Metrics, logs, traces, AI traces, artifacts, and financial summaries have separate roles.
5. Telemetry excludes secrets and minimizes customer data.
6. High-cardinality labels are controlled.
7. Langfuse captures model usage, cost, latency, and evaluation with Run correlation.
8. Odoo receives summarized approved financial data only.
9. Provider invoices reconcile to operational Cost Events and Odoo.
10. Direct, shared, overhead, failed, and unallocated costs remain visible.
11. Preview and refactor economics preserve lineage and incremental cost.
12. Cost per accepted output is measurable.
13. Public sites, Payload, database, queues, n8n, VPS, CDN, domains, forms, backups, and integrations are observable.
14. SLOs and error budgets are defined from measured baselines.
15. Alerts are actionable, deduplicated, owned, and tested.
16. Carlos/OpenClaw receive plain-language business and exception views.
17. “20 sites per VPS” is not a fixed capacity rule.
18. Capacity includes CPU, memory, disk IO, network, database, traffic, builds, backups, and headroom.
19. The ~40-client point triggers architecture review without forcing unsafe density.
20. The 60–80-client point triggers evidence-based regional evaluation.
21. Regions are infrastructure locations, not sales markets.
22. Frontend VPS count does not dictate database count.
23. Central versus regional Payload/PostgreSQL remains a measured decision.
24. Load and failure tests establish safe operating envelopes.
25. Metric definitions are versioned and reproducible.
26. Business, quality, reliability, autonomy, capacity, and unit economics can be evaluated together.
27. Improvements use hypothesis, guardrails, baseline, controlled release, and verified result.

The governing conclusion is that LiNKsites cannot be an autonomous factory merely because workflows run without a person. It becomes autonomous when it can observe its own behavior, connect output to cost and quality, detect approaching limits, repair known faults, present genuine exceptions, and learn through controlled evidence.

The observability stack explains behavior; the Program Ledger proves work and outcomes; Langfuse explains AI use; Odoo holds approved financial truth. Capacity follows measured saturation and recovery headroom, not a generic site-count estimate. Preview investment, reuse, refactoring, hosting, failure, and support are all measured so the build-first business model can be validated rather than assumed.

## 100. Primary technical references

- [OpenTelemetry signals](https://opentelemetry.io/docs/concepts/signals/)
- [OpenTelemetry context propagation](https://opentelemetry.io/docs/concepts/context-propagation/)
- [OpenTelemetry semantic conventions](https://opentelemetry.io/docs/concepts/semantic-conventions/)
- [Prometheus instrumentation practices](https://prometheus.io/docs/practices/instrumentation/)
- [Prometheus metric and label naming](https://prometheus.io/docs/practices/naming/)
- [Prometheus alerting practices](https://prometheus.io/docs/practices/alerting/)
- [Prometheus recording rules](https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/)
- [Grafana Loki documentation](https://grafana.com/docs/loki/latest/)
- [Grafana Loki cardinality guidance](https://grafana.com/docs/loki/latest/get-started/labels/cardinality/)
- [Grafana Tempo documentation](https://grafana.com/docs/tempo/latest/)
- [Grafana exemplars](https://grafana.com/docs/grafana/latest/fundamentals/exemplars/)
- [Langfuse observability overview](https://langfuse.com/docs/observability/overview)
- [Langfuse token and cost tracking](https://langfuse.com/docs/observability/features/token-and-cost-tracking)
- [Langfuse Metrics API](https://langfuse.com/docs/metrics/features/metrics-api)
- [Next.js Web Vitals reporting](https://nextjs.org/docs/app/api-reference/functions/use-report-web-vitals)
- [Google PageSpeed Insights API](https://developers.google.com/speed/docs/insights/v5/get-started)

---

**End of Section 23**
